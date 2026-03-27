import { createAudioProcessor } from "./audio-processor-node.js"

export default class AudioAnalyser {
  audioCtx
  buffer = null
  freqAnalyser
  processor
  beatAnalyser

  fftSize
  dataArray
  isBeat
  constructor(fftSize = 2048) {
    this.audioCtx = new AudioContext()
    this.freqAnalyser = this.audioCtx.createAnalyser()
    this.beatAnalyser = this.audioCtx.createAnalyser();

    this.fftSize = fftSize;

    this.freqAnalyser.fftSize = fftSize;
    this.dataArray = new Uint8Array(this.freqAnalyser.frequencyBinCount)

    this.beatAnalyser.fftSize = 2048;
    this.isBeat = new Float32Array(this.beatAnalyser.frequencyBinCount)
  }

  get frequencyData() {
    this.freqAnalyser.getByteFrequencyData(this.dataArray)
    return this.dataArray;
  }

  get onsetDetection() {
    this.beatAnalyser.getFloatTimeDomainData(this.isBeat)
    return this.isBeat[0] >= .5
  }

  /**
   * Play the audio source through destination
   *  and analyser
   */
  play(myAudio) {
    const source = this.audioCtx.createMediaElementSource(myAudio)
    createAudioProcessor(this.audioCtx).then((processor) => {
      this.processor = processor
      source.connect(this.processor);
      this.processor.connect(this.beatAnalyser)
      source.connect(this.freqAnalyser);
      source.connect(this.audioCtx.destination);
    })
  }
}