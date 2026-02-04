class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputList: Float32Array[][], outputList: Float32Array[][]) {
    const source = inputList[0];
    const firstChannel = source[0];
    const secondChannel = source[1];
    // console.log("channel1", firstChannel)
    // console.log("channel2", secondChannel)
    // Using the inputs (or not, as needed),
    // write the output into each of the outputs
    // …
    outputList[0][0][0]= 1
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
