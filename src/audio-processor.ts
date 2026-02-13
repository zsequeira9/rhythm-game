import { EssentiaWASM } from "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.es.js?url";
import Essentia from "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-core.es.js?url";

let essentia = new Essentia(EssentiaWASM);

class AudioProcessor extends AudioWorkletProcessor {
  essentia: Essentia;
  lastOnset = false;
  constructor() {
    super();
    this.essentia = essentia;
    console.log('Backend - essentia:' + this.essentia.version + '- http://essentia.upf.edu');
  }

  //System-invoked process callback function.
  process(inputs, outputs, parameters) {

    // <inputs> and <outputs> will have as many as were specified in the options passed to the AudioWorkletNode constructor, each subsequently spanning potentially multiple channels
    let input = inputs[0];
    let output = outputs[0];

    // convert the input audio frame array from channel 0 to a std::vector<float> type for using it in essentia
    let vectorInput = this.essentia.arrayToVector(input[0]);
    let spectrum = this.essentia.Spectrum(vectorInput).spectrum

    let phase = this.essentia.arrayToVector([])

    let threshold = 0;

    let onsetDetection = this.essentia.OnsetDetection(spectrum, phase).onsetDetection // input audio frame
    let tmpOnset = onsetDetection > threshold
    let onset = !this.lastOnset && tmpOnset
    this.lastOnset = tmpOnset

    output[0][0] = onset;

    return true; // keep the process running
  }
}

registerProcessor('audio-processor', AudioProcessor);
