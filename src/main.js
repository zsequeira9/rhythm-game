import * as THREE from 'three';
import AudioAnalyser from './audio-analyser';
import { SpectrumVis } from './visualizers';
let width;
let height;
let renderer;
let audioAnalyser;
let spectrumVis;

function insertVis() {
  width = document.body.clientWidth
  height = document.body.clientHeight

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);

  // create audio analyser node
  audioAnalyser = new AudioAnalyser();

  // create visualizer
  spectrumVis = new SpectrumVis(renderer, audioAnalyser, width, height)

  document.body.appendChild(renderer.domElement);;

}


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

insertVis();
play();