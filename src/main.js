import * as THREE from 'three';
import AudioAnalyser from './audio-analyser';
import { SpectrumVis } from './visualizers';
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
  request.open("GET", browser.runtime.getURL("public/test6.mp3"));
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

function listener(message) {
  console.log(message)
  if (message.message = "play") {
    play();
  }
}

browser.runtime.onMessage.addListener(listener);