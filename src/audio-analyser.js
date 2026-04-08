import { createAudioProcessor } from "./audio-processor-node.js"

export default class AudioAnalyser {
  audioCtx
  freqAnalyser
  processor
  beatAnalyser
  source = ""
  fftSize
  dataArray
  isBeat

  constructor(fftSize = 2048) {
    this.audioCtx = new AudioContext();
    this.freqAnalyser = this.audioCtx.createAnalyser();
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

  setSource(myAudio) {
    // connect audio nodes
    const connectSource = (source) => {
      this.source = source.id
      source.connect(this.processor);
      this.processor.connect(this.beatAnalyser)
      source.connect(this.freqAnalyser);
      source.connect(this.audioCtx.destination);
    }

    // add source if not the existing source
    const source = this.audioCtx.createMediaElementSource(myAudio)
    if (source.id != this.source) {
      if (!this.processor) {
        createAudioProcessor(this.audioCtx).then((processor) => {
          this.processor = processor
          connectSource(source)
        })
      } else {
        connectSource(source)
      }
    }
  }

  /**
   * Start audio context
   */
  play() {
    this.audioCtx.resume().then(() => console.log("Audio context resumed"));
  }

  /**
   * Suspend audio context
   */
  suspend() {
    this.audioCtx.suspend().then(() => console.log("audio context suspended"));
  }
}