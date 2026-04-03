import * as THREE from '../node_modules/three/build/three.module.js';
import AudioAnalyser from './audio-analyser.js';
import { SpectrumVis } from './visualizers.js';
import { getVideo, videoLoaded, observerOptions } from './connector.js'

// import * as THREE from 'three';
// import AudioAnalyser from './audio-analyser';
// import { SpectrumVis } from './visualizers';


(async function () {
  let width;
  let height;
  let renderer;
  let audioAnalyser;
  let spectrumVis;

  // set up Threejs container
  width = document.body.clientWidth * .25
  height = document.body.clientHeight * .25
  const frame = document.createElement("div")
  frame.style.position = "sticky";
  frame.style.top = "20px";
  frame.style.zIndex = "100"
  frame.style.pointerEvents = "none"
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);

  // create visualizer
  audioAnalyser = new AudioAnalyser();
  spectrumVis = new SpectrumVis(renderer, audioAnalyser, width, height)
  frame.appendChild(renderer.domElement);
  document.body.appendChild(frame);

  /**
   * Trigger vis on playback
   */
  function setupVis() {
    audioSource.onplay = (event) => {
      audioAnalyser.play(event.target);
      renderer.setAnimationLoop(spectrumVis.animate);
    }
  }

  let audioSource = getVideo();

  // if no audio source present, listen for when one is added
  if (!audioSource) {
    addEventListener("newVideo", () => {
      audioSource = getVideo();
      setupVis();
    });
    const body = document.getElementsByTagName("body")[0];
    const observer = new MutationObserver(videoLoaded);
    observer.observe(body, observerOptions);
  } else {
    setupVis();
  }

})().catch(e => console.error(e));