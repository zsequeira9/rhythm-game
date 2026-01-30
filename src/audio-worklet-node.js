function URLFromFiles(files) {
  const promises = files
    .map((file) => fetch(file)
      .then((response) => response.text()));

  return Promise
    .all(promises)
    .then((texts) => {
      const text = texts.join('');
      const blob = new Blob([text], {type: "application/javascript"});

      return URL.createObjectURL(blob);
    });
}

const workletProcessorCode = ["https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.module.js", 
                              "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-core.es.js", 
                              "essentia-worklet-processor.js"];
  
export async function createEssentiaNode (context) {
  try {
    // let concatenatedCode = await URLFromFiles(workletProcessorCode)
    // await context.audioWorklet.addModule(concatenatedCode); // add our custom code to the worklet scope
    await context.audioWorklet.addModule("essentia-worklet-processor.js");
  } catch(e) {
    console.log(e);
  }
  return new AudioWorkletNode(context, 'essentia-worklet-processor');
}

