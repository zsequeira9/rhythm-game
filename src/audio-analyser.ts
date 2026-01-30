import { createEssentiaNode } from "./audio-worklet-node";
export default class AudioAnalyser {
  audioCtx: AudioContext
  buffer: AudioBuffer | null = null
  analyser: AnalyserNode
  fftSize: number;
  bufferLength: number
  dataArray: Uint8Array<ArrayBuffer>
  essentiaNode: AudioWorkletNode | null = null;
  constructor(fftSize = 256) {
    this.audioCtx = new AudioContext()
    this.analyser = this.audioCtx.createAnalyser()
    this.fftSize = fftSize
    this.analyser.fftSize = this.fftSize;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength)
  }

  get frequencyData() {
    this.analyser.getByteFrequencyData(this.dataArray)
    return this.dataArray;
  }

  /**
   * Play the audio source through destination
   *  and analyser
   */
  play(undecodedAudio: ArrayBuffer) {
    this.audioCtx.decodeAudioData(undecodedAudio, (data) => {
        let source = this.audioCtx.createBufferSource();
        source.buffer = data;
        if (!this.essentiaNode) {
          createEssentiaNode(this.audioCtx).then((essentiaNode) => {
            this.essentiaNode = essentiaNode;
            source.connect(this.essentiaNode);
            source.connect(this.analyser);
            source.connect(this.audioCtx.destination);
            source.start(); 
        })
        }


    }, (error) => console.log("Could not decode audio: ", error));
  }
}