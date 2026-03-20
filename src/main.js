import * as THREE from '../node_modules/three/build/three.module.js';
import AudioAnalyser from './audio-analyser.js';
import { SpectrumVis } from './visualizers.js';

// import * as THREE from 'three';
// import AudioAnalyser from './audio-analyser';
// import { SpectrumVis } from './visualizers';


(async function () {
  let width;
  let height;
  let renderer;
  let audioAnalyser;
  let spectrumVis;

  /**
   * Load and play audio from filesystem
   */
  function play() {
    const request = new XMLHttpRequest();
    const audioUrl = new URL("../public/test1.mp3", import.meta.url)
    request.open("GET", audioUrl);
    request.responseType = "arraybuffer";
    request.onload = function () {
      const undecodedAudio = request.response;
      audioAnalyser.play(undecodedAudio);
    };
    request.send();
    renderer.setAnimationLoop(spectrumVis.animate);
  }

  width = document.body.clientWidth
  height = document.body.clientHeight

  const frame = document.createElement("div")

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);

  // create audio analyser node
  audioAnalyser = new AudioAnalyser();

  // create visualizer
  spectrumVis = new SpectrumVis(renderer, audioAnalyser, width, height)

  const btn = document.createElement("button")
  btn.onclick = play;
  btn.textContent = 'test value';

  frame.appendChild(btn)
  frame.appendChild(renderer.domElement);
  document.body.appendChild(frame);
})().catch(e => console.error(e));