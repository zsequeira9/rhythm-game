import { EssentiaWASM } from "../node_modules/essentia.js/dist/essentia-wasm.es.js";
import Essentia from "../node_modules/essentia.js/dist/essentia.js-core.es.js";

// import { EssentiaWASM } from "essentia.js";
// import Essentia from "essentia.js";

const median = (arr) => arr.toSorted()[Math.floor(arr.length / 2)]
const mean = (arr) => arr.reduce((acc, curr) => acc + curr, 0) / arr.length

class OnsetDetector {
  essentia;
  phase;
  detectedOnsets = [0, 0, 0, 0, 0];
  threshold = [];
  // moving average filter?
  alpha = .1;

  constructor(essentia) {
    this.essentia = essentia;
    this.phase = this.essentia.arrayToVector([]);
    this.phase2 = this.essentia.arrayToVector([]);
  }

  isOnset(spectrum) {
    let hcf = this.essentia.OnsetDetection(spectrum, this.phase, "hfc").onsetDetection;
    let flux = this.essentia.OnsetDetection(spectrum, this.phase2, "flux").onsetDetection;

    // todo: smoothing, threshold for silence
    let detection = hcf * .1 + flux * .2;
    this.detectedOnsets.pop();
    this.detectedOnsets.splice(0, 0, detection);

    let threshold = median(this.detectedOnsets) + this.alpha * mean(this.detectedOnsets);

    console.log(detection)
    console.log(this.detectedOnsets)
    console.log(threshold)

    let onsets = this.detectedOnsets.reduce((count, onset) => onset > threshold ? count+1 : count, 0 )
    console.log(onsets)
    if (onsets > 1) {
      return true
    }
  }
}

class AudioProcessor extends AudioWorkletProcessor {
  essentia;
  lastOnset = false;
  buffer = new Float32Array(512);
  bufferCount = 0;
  hcfOnsets;
  fluxOnsets;

  constructor() {
    super();
    this.essentia = new Essentia(EssentiaWASM);
    this.onsetDetector = new OnsetDetector(this.essentia)
  }

  //System-invoked process callback function.
  process(inputs, outputs, parameters) {
    // take the first input from list of inputs
    const input = inputs[0]
    if (input.length != 0) {
      try {
        // mix left and right channels
        const audioLeftChannelData = this.essentia.arrayToVector(input[0]);
        const audioRightChannelData = this.essentia.arrayToVector(input[1]);
        const audioDownMixed = this.essentia.MonoMixer(audioLeftChannelData, audioRightChannelData).audio;
        const audioData = this.essentia.vectorToArray(audioDownMixed);


        let intensity = this.essentia.Loudness(audioDownMixed).loudness;

        // set buffer to input, offset by number of times buffer has been set since buffer has been completely filled
        this.buffer.set(audioData, this.bufferCount * audioData.length);
        this.bufferCount += 1;
        this.bufferCount %= 4;

        if (this.bufferCount == 3) {
          const signal = this.essentia.arrayToVector(this.buffer);

          let spectrum = this.essentia.Spectrum(signal).spectrum;

          // flag as onset if either hcf or flux detects onsets
          let onset = this.onsetDetector.isOnset(spectrum);

          outputs[0][0][0] = Number(onset);
        }
      } catch (error) {
        console.log("Audio processor error: ", error)
      }
    }
    return true; // keep the process running
  }
}

registerProcessor('audio-processor', AudioProcessor);
