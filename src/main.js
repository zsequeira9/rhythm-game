// import * as THREE from '../node_modules/three/build/three.cjs';
import AudioAnalyser from './audio-analyser';
// import { SpectrumVis } from './visualizers';

console.log("Hello from main.js")

// create renderer
// const rendererContainer = document.getElementById("renderer-container");

// const width = rendererContainer.offsetWidth;
// const height = rendererContainer.offsetHeight;

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize( width, height);
// rendererContainer.appendChild( renderer.domElement );

// create audio analyser node
const audioAnalyser= new AudioAnalyser();

// create visualizer
// const spectrumVis = new SpectrumVis(renderer, audioAnalyser, width, height)

/**
 * Load and play audio from filesystem
 */
function play(message) {
  console.log("Hello from main play")
  audioAnalyser.play(message.data);      

  // renderer.setAnimationLoop( spectrumVis.animate );
  
}

browser.runtime.onMessage.addListener(play);