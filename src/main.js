import * as THREE from '../node_modules/three/build/three.module.js';
import AudioAnalyser from './audio-analyser.js';
import { SpectrumVis } from './visualizers.js';
import { getVideo, logChanges, observerOptions } from './connector.js'

// import * as THREE from 'three';
// import AudioAnalyser from './audio-analyser';
// import { SpectrumVis } from './visualizers';


(async function () {
  let width;
  let height;
  let renderer;
  let audioAnalyser;
  let spectrumVis;

  let audioSource = getVideo();

  /**
   * Load and play audio from filesystem
   */
  function play(element) {
    audioAnalyser.play(element);
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
  frame.appendChild(renderer.domElement);
  document.body.appendChild(frame);

  const setUpAudioSource = () => {
    audioSource = getVideo();
    audioSource.onplay = (event) => play(event.target);
  }

  if (!audioSource) {
    addEventListener("newVideo", setUpAudioSource);

    const body = document.getElementsByTagName("body")[0];

    const observer = new MutationObserver(logChanges);
    observer.observe(body, observerOptions);
  } else {
    audioSource.onplay = (event) => play(event.target);
  }

})().catch(e => console.error(e));