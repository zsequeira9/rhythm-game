 export async function createAudioProcessor(audioCtx) {
    await audioCtx.audioWorklet.addModule(new URL("./audio-processor.js", import.meta.url))
    console.log("Creating Audio Worklet Node")
    return new AudioWorkletNode(audioCtx, "audio-processor", {outputChannelCount: [1]});
 }