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
  alpha = .1;

  constructor(essentia) {
    this.essentia = essentia;
    this.phase = this.essentia.arrayToVector([]);
  }

  isOnset(spectrum) {
    let hcf = this.essentia.OnsetDetection(spectrum, this.phase, "hfc").onsetDetection;
    let flux = this.essentia.OnsetDetection(spectrum, this.phase, "flux").onsetDetection;

    // todo: smoothing, threshold for silence ?
    let detection = hcf * .4 + flux * .6;
    this.detectedOnsets.pop();
    this.detectedOnsets.splice(0, 0, detection);

    let threshold = median(this.detectedOnsets) + this.alpha * mean(this.detectedOnsets);

    let onsets = this.detectedOnsets.reduce((count, onset) => onset > threshold ? count+1 : count, 0 )
    if (onsets > 1) {
      return true
    }
  }
}

class AudioProcessor extends AudioWorkletProcessor {
  essentia;
  buffer = new Float32Array(1024);
  bufferCount = 0;

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


        // let intensity = this.essentia.Loudness(audioDownMixed).loudness;

        this.bufferCount += 1;
        this.bufferCount %= 12;
        // create frames of size 1024, skip every 512
        if (this.bufferCount < 8) {
          this.buffer.set(audioData, this.bufferCount * audioData.length);
        }
        // when frame is full, do onset analysis
        else if (this.bufferCount == 8) {
          const signal = this.essentia.arrayToVector(this.buffer);
          const windowed_signal = this.essentia.Windowing(signal).frame;

          let spectrum = this.essentia.Spectrum(windowed_signal).spectrum;

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
