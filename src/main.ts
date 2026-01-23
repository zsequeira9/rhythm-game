import * as THREE from 'three';
import AudioAnalyser from './AudioAnalyser';

const width = 30
const height = 30 

// create ThreeJS scene
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight - 50 );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// create cube geometry
const cubes = [] as THREE.Mesh[]
const geometry = new THREE.BoxGeometry( .1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

// create audio analyser node
const audioAnalyser = new AudioAnalyser();

// set up vis
const numCubes = 128;
const sizeBin = audioAnalyser.fftSize / numCubes
for (let i = 0; i < numCubes; i++) {
  const cube = new THREE.Mesh( geometry, material );
  cube.position.x = i * .2 - 14
  cubes.push(cube)
  scene.add(cube);
}

/**
 * Animate the cubes based on waveform data
 */
function animate() {
    const freqData = audioAnalyser.frequencyData;
    for (let i = 0; i < cubes.length; i++) {
      const avg = freqData.slice(i*sizeBin, i*sizeBin+sizeBin).reduce(
        (acc, curr) => acc + curr, 0) / sizeBin
      cubes[i].scale.y = avg / 10;
      cubes[i].position.y = -13 + avg / 20;
    }
    
    renderer.render( scene, camera );
}


/**
 * Load and play audio from filesystem
 */
function play() {
    const request = new XMLHttpRequest();
    request.open("GET", "/test4.flac");
    request.responseType = "arraybuffer";
    request.onload = function() {
      const undecodedAudio = request.response;
      audioAnalyser.play(undecodedAudio);      
    };
  request.send();
  
}

let playButton = document.getElementById("play")!;
playButton.onclick = play;