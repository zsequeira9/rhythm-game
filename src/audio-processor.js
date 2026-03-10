import { EssentiaWASM } from "essentia.js";
import Essentia from "essentia.js";

const median = (arr) => arr.toSorted()[arr.length/2]
const mean = (arr) => arr.reduce((acc, curr) => acc + curr, 0) / arr.length

class OnsetDetector {
  essentia;
  phase;
  detectedOnsets = [0, 0, 0, 0, 0, 0];
  method
  alpha

  constructor(essentia, method, alpha) {
    this.essentia = essentia;
    this.phase = this.essentia.arrayToVector([])
    this.method = method
    this.alpha = alpha
  }

  isOnset(spectrum) {
    let detection = this.essentia.OnsetDetection(spectrum, this.phase, this.method).onsetDetection;
    this.detectedOnsets.pop();
    this.detectedOnsets.splice(0, 0, detection);

    let threshold = median(this.detectedOnsets) + this.alpha * mean(this.detectedOnsets);
    return detection > threshold;
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
    this.hcfOnsets = new OnsetDetector(this.essentia, "hfc", 0.1)
    this.fluxOnsets = new OnsetDetector(this.essentia, "flux", 0.2)
    console.log('Backend - essentia:' + this.essentia.version + '- http://essentia.upf.edu');
  }

  //System-invoked process callback function.
  process(inputs, outputs, parameters) {
    // take the first input from list of inputs
    const input = inputs[0]

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
      const signal = this. essentia.arrayToVector(this.buffer);

      let spectrum = this.essentia.Spectrum(signal).spectrum;
      
      // flag as onset if either hcf or flux detects onsets
      let tmpHCFOnset = this.hcfOnsets.isOnset(spectrum);
      let tmpFluxOnset = this.fluxOnsets.isOnset(spectrum);
      let onset = !this.lastOnset && (tmpHCFOnset || tmpFluxOnset);

      this.lastOnset = tmpHCFOnset || tmpFluxOnset;

      outputs[0][0][0] = Number(onset);
    }

    return true; // keep the process running
  }
}

registerProcessor('audio-processor', AudioProcessor);
