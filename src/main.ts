import * as THREE from 'three';

const width = 30
const height = 30 

// create ThreeJS scene
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );
const cubes = [] as THREE.Mesh[]

// create cube
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );


camera.position.z = 10;


// create audio analyser node
const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();
let source;
let buffer: AudioBuffer;

analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);

const numCubes = 32;

for (let i = 0; i < numCubes; i++) {
  const cube = new THREE.Mesh( geometry, material );
  cube.position.x = i * 1.5 - 12
  cubes.push(cube)
  scene.add(cube);
}

/**
 * Animate the cube based on waveform data
 */
function animate() {
    analyser.getByteTimeDomainData(dataArray);
    for (let i = 0; i < cubes.length; i++) {
      const avg = dataArray.slice(i*8, i*8+8).reduce((acc, curr) => acc + curr, 0) / 8
      cubes[i].scale.y = avg / 128;
    }
    
    renderer.render( scene, camera );
}


/**
 * Load the audio from filesystem
 */
function load() {
  const request = new XMLHttpRequest();
  request.open("GET", "/test1.mp3");
  request.responseType = "arraybuffer";
  request.onload = function() {
    let undecodedAudio = request.response;
    audioCtx.decodeAudioData(undecodedAudio, (data) => buffer = data); 
  };
  request.send();
}


/**
 * Play the audio source through destination
 *  and analyser
 */
function play() {
    source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);
    source.connect(audioCtx.destination);
    source.start();   
}

// UI
let button1 = document.getElementById("load")!;
button1.onclick = load;

let button2 = document.getElementById("play")!;
button2.onclick = play;