import { createAudioProcessor } from "./audio-processor-node"
export default class AudioAnalyser {
  audioCtx: AudioContext
  buffer: AudioBuffer | null = null
  freqAnalyser: AnalyserNode
  processor!: AudioWorkletNode
  beatAnalyser: AnalyserNode

  fftSize: number
  dataArray: Uint8Array<ArrayBuffer>
  isBeat: Float32Array<ArrayBuffer>
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
  play(undecodedAudio: ArrayBuffer) {
    this.audioCtx.decodeAudioData(undecodedAudio, (data) => {
        let source = this.audioCtx.createBufferSource();
        source.buffer = data;
        if (!this.processor) {
          createAudioProcessor(this.audioCtx).then((processor) => {
            this.processor = processor
            source.connect(this.processor);
            this.processor.connect(this.beatAnalyser)
            source.connect(this.freqAnalyser);
            source.connect(this.audioCtx.destination);
            source.start(); 
        })}
        
    }, (error) => console.log("Could not decode audio: ", error));
  }
}