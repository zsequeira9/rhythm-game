import { EssentiaWASM } from "../node_modules/essentia.js/dist/essentia-wasm.es.js";
import Essentia from "../node_modules/essentia.js/dist/essentia.js-core.es.js";

// import { EssentiaWASM } from "essentia.js";
// import Essentia from "essentia.js";

const median = (arr) => arr.toSorted()[Math.floor(arr.length / 2)]
const mean = (arr) => arr.reduce((acc, curr) => acc + curr, 0) / arr.length

const normalize = (arr) => {
  const norm = Math.sqrt(arr.reduce((acc, curr) => acc + Math.pow(curr, 2), 0))
  return arr.map((val) => val / norm)
}

class OnsetDetector {
  essentia;
  phase;
  // detectedHCFOnsets = [0, 0, 0, 0, 0];
  // detectedFluxOnsets = [0, 0, 0, 0, 0];
  onsets = [0, 0, 0, 0, 0]
  maOnsets = [0, 0, 0, 0, 0]
  alpha = .1;

  constructor(essentia) {
    this.essentia = essentia;
    this.phase = this.essentia.arrayToVector([]);
  }

  isOnset(spectrum) {
    let hcf = this.essentia.OnsetDetection(spectrum, this.phase, "hfc").onsetDetection;
    // this.detectedHCFOnsets.pop();
    // this.detectedHCFOnsets.splice(0, 0, hcf);

    let flux = this.essentia.OnsetDetection(spectrum, this.phase, "flux").onsetDetection;
    // this.detectedFluxOnsets.pop();
    // this.detectedFluxOnsets.splice(0, 0, flux);

    // let normalizedFlux = normalize(this.detectedFluxOnsets)

    // let globalOnsets = normalize(this.detectedHCFOnsets).map((val, idx) => val * .5 + normalizedFlux[idx] * .5);
    let onset = hcf * .5 + flux * .5

    let lastOnset = this.onsets.pop()
    let newMAOnset = this.maOnsets[0] + (onset - lastOnset) / this.maOnsets.length

    this.maOnsets.pop()
    this.maOnsets.splice(0, 0, newMAOnset)
    this.onsets.splice(0, 0, onset);

    let threshold = median(this.maOnsets) + this.alpha * mean(this.maOnsets);

    let detectedOnsets = this.maOnsets.map((onset) => onset > threshold)

    let isonset = detectedOnsets.reduce((acc, curr, idx, arr) => 
      acc || (idx > 0 && curr && arr[idx - 1]), false);

    return isonset
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
          this.port.postMessage({
            message: onset,
          });
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
