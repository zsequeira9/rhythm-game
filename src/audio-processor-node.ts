import testProcessorUrl from "./audio-processor.ts?url";

 export async function createAudioProcessor(audioCtx: AudioContext) {
    await audioCtx.audioWorklet.addModule(testProcessorUrl)
    console.log("I am creating this thingy")
    return new AudioWorkletNode(audioCtx, "audio-processor");
 }