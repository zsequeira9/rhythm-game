// @ts-ignore 2307 - We must load from a url in a audio worklet
import testProcessorUrl from "./audio-processor";

 export async function createAudioProcessor(audioCtx) {
    await audioCtx.audioWorklet.addModule(testProcessorUrl)
    console.log("Creating Audio Worklet Node")
    return new AudioWorkletNode(audioCtx, "audio-processor", {outputChannelCount: [1]});
 }