import * as THREE from 'three';
import AudioAnalyser from './audio-analyser';
import { SpectrumVis } from './visualizers';

// create renderer
const rendererContainer = document.getElementById("renderer-container") as HTMLElement;

const width = rendererContainer.offsetWidth;
const height = rendererContainer.offsetHeight;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( width, height);
rendererContainer.appendChild( renderer.domElement );

// create audio analyser node
const audioAnalyser: AudioAnalyser = new AudioAnalyser();

// create visualizer
const spectrumVis = new SpectrumVis(renderer, audioAnalyser, width, height)

/**
 * Load and play audio from filesystem
 */
function play() {
    const request = new XMLHttpRequest();
    request.open("GET", "/test6.mp3");
    request.responseType = "arraybuffer";
    request.onload = function() {
      const undecodedAudio = request.response;
      audioAnalyser.play(undecodedAudio);      
    };
  request.send();
  renderer.setAnimationLoop( spectrumVis.animate );
  
}

let playButton = document.getElementById("play")!;
playButton.onclick = play;