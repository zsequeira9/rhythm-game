import * as THREE from 'three';

// create ThreeJS scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// create cube
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;


// create audio analyser node
const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();
let source;
let buffer;

analyser.fftSize = 32;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);

/**
 * Animate the cube based on waveform data
 */
function animate() {
    analyser.getByteTimeDomainData(dataArray);
    for (let i = 0; i < bufferLength; i++) {
    }
    cube.scale.y = dataArray[0]/128;
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
let button1 = document.getElementById("load");
button1.onclick = load;

let button2 = document.getElementById("play");
button2.onclick = play;