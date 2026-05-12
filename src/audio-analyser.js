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

  /**
   * Called by build function
   * @param {AudioContext} audioCtx
   * @param {AudioWorkletNode} processor
   * @param {number} fftSize 
   */
  constructor(audioCtx, processor, fftSize) {
    this.audioCtx = audioCtx;
    this.processor = processor;
    this.freqAnalyser = this.audioCtx.createAnalyser();
    this.beatAnalyser = this.audioCtx.createAnalyser();

    this.fftSize = fftSize;

    this.freqAnalyser.fftSize = fftSize;
    this.dataArray = new Uint8Array(this.freqAnalyser.frequencyBinCount)

    this.beatAnalyser.fftSize = 2048;
    this.isBeat = new Float32Array(this.beatAnalyser.frequencyBinCount)
  }

  /**
   * Returns AudioAnalyser instance 
   *  after async creation of audio worklet.
   * @param {number} fftSize 
   * @returns AudioAnalyser class
   */
  static async build(fftSize = 2048) {
    const audioCtx = new AudioContext();
    const processor = await createAudioProcessor(audioCtx);
    return new AudioAnalyser(audioCtx, processor, fftSize);
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
   * Connect all nodes to source
   * @param {HTMLMediaElement} myAudio 
   */
  setSource(myAudio) {
    const source = this.audioCtx.createMediaElementSource(myAudio)
    this.source = source.id
    source.connect(this.processor);
    this.processor.connect(this.beatAnalyser)
    source.connect(this.freqAnalyser);
    source.connect(this.audioCtx.destination);
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