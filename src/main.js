import * as THREE from '../node_modules/three/build/three.module.js';
import AudioAnalyser from './audio-analyser.js';
import { SpectrumVis, BeatVis } from './visualizers.js';
import { getVideo, videoLoaded, observerOptions } from './connector.js'

// import * as THREE from 'three';
// import AudioAnalyser from './audio-analyser';
// import { SpectrumVis } from './visualizers';


(async function () {
  let width;
  let height;
  let renderer;
  let audioAnalyser;
  let vis;

  // set up Threejs container
  const frame = document.createElement("div")
  frame.style.position = "absolute";
  frame.style.top = "20px";
  frame.style.left = "20px";
  frame.style.zIndex = "10000"
  frame.style.pointerEvents = "none"
  width = Math.max(document.body.clientWidth * .25, 256)
  height = Math.max(document.body.clientHeight * .25, 256)
  frame.style.minHeight = `32px`;
  frame.style.minWidth = `256px`;
  frame.style.width = width;
  frame.style.height = height;
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);

  frame.appendChild(renderer.domElement);
  document.body.prepend(frame);

  /**
   * Trigger vis on playback
   */
  function setupVis() {
    audioSource.onplaying = async () => {
      // if first time playing, create audioAnalyser
      if (!audioAnalyser) {
        audioAnalyser = await AudioAnalyser.build();
        // vis = new SpectrumVis(renderer, audioAnalyser, width, height)
        vis = new BeatVis(renderer, audioAnalyser, width, height)
      }
      audioAnalyser.setSource(audioSource)
      audioAnalyser.play();
      renderer.setAnimationLoop(vis.animate);
    }

    audioSource.onpause = () => {
      audioAnalyser.suspend();
    }
  }

  let audioSource = getVideo();
  // if no audio source present, listen for when one a new one is added
  if (!audioSource) {
    addEventListener("newVideo", (event) => {
      if (audioSource == undefined || event.detail.id != audioSource.id) {
        audioSource = event.detail;
        setupVis();
      }
    });
    // Set up observer which throws newVideo event
    const body = document.getElementsByTagName("body")[0];
    const observer = new MutationObserver(videoLoaded);
    observer.observe(body, observerOptions);
  }

  // if audioSource is found on initial page load, start vis
  else {
    setupVis();
  }

})().catch(e => console.error(e));