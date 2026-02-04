import { createAudioProcessor } from "./audio-processor-node"
export default class AudioAnalyser {
  audioCtx: AudioContext
  buffer: AudioBuffer | null = null
  analyser: AnalyserNode
  processor!: AudioWorkletNode
  processorOutput: AnalyserNode

  fftSize: number;
  bufferLength: number
  dataArray: Uint8Array<ArrayBuffer>
  isBeat: Float32Array<ArrayBuffer>
  constructor(fftSize = 2048) {
    this.audioCtx = new AudioContext()
    this.analyser = this.audioCtx.createAnalyser()
    this.processorOutput = this.audioCtx.createAnalyser();
    this.fftSize = fftSize
    this.analyser.fftSize = this.fftSize;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength)
    this.isBeat = new Float32Array(this.bufferLength)
  }

  get frequencyData() {
    this.analyser.getByteFrequencyData(this.dataArray)
    return this.dataArray;
  }

    get onsetDetection() {
      this.processorOutput.getFloatTimeDomainData(this.isBeat)
      console.log(this.isBeat)
      return this.isBeat[0] > .03
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
            this.processor.connect(this.processorOutput)
            source.connect(this.analyser);
            source.connect(this.audioCtx.destination);
            source.start(); 
        })}
        
    }, (error) => console.log("Could not decode audio: ", error));
  }
}