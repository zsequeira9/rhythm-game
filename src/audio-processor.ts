import { EssentiaWASM } from "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.es.js?url";
import Essentia from "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-core.es.js?url";

class AudioProcessor extends AudioWorkletProcessor {
  essentia: Essentia;
  lastOnset = false;
  frames: { array: Float32Array<ArrayBuffer>; offset: number}[] = [];
  detectedOnsets: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  constructor() {
    super();
    this.essentia = new Essentia(EssentiaWASM);
    this.initFrames();
    console.log('Backend - essentia:' + this.essentia.version + '- http://essentia.upf.edu');

  }

  initFrames() {
    for (let i = 0; i < 16; i++) {
      this.frames[i] = {
        array: new Float32Array(2048),
        offset: -i - 1,
      }
    }
  }

  //System-invoked process callback function.
  process(inputs, outputs, parameters) {

    // <inputs> and <outputs> will have as many as were specified in the options passed to the AudioWorkletNode constructor, each subsequently spanning potentially multiple channels
    let input = inputs[0][0];
    let output = outputs[0];

    this.frames.forEach(frame => {
      frame.offset += 1

      if (frame.offset >= 0) {
        frame.offset %= 16
        frame.array.set(input, frame.offset * 128)
    
        if (frame.offset == 15) {
          // start processing chain

          const signal = this.essentia.arrayToVector(frame.array)
          // const eqloud = this.essentia.EqualLoudness(signal).signal
          const window = this.essentia.Windowing(
            signal, true, 2048, 'hann', 4, true
          ).frame

          let spectrum = this.essentia.Spectrum(window).spectrum

          let phase = this.essentia.arrayToVector([])

          let onsetDetection = this.essentia.OnsetDetection(spectrum, phase).onsetDetection

          this.detectedOnsets.pop()

          this.detectedOnsets.splice(0, 0, onsetDetection)

          let alpha = .2

          let threshold = this.detectedOnsets.toSorted()[2] + alpha * this.detectedOnsets.reduce((acc, curr) => acc + curr, 0) / this.detectedOnsets.length

          let tmpOnset = onsetDetection > threshold
          let onset = !this.lastOnset && tmpOnset
          this.lastOnset = tmpOnset

          output[0][0] = onset;
    }}})

    return true; // keep the process running
  }
}

registerProcessor('audio-processor', AudioProcessor);
