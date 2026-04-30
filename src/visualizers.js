import * as THREE from '../node_modules/three/build/three.module.js';

// import * as THREE from 'three';

export class SpectrumVis {
    renderer
    audioAnalyser
    height
    scene
    camera
    bars = []
    sizeBin
    animate
    constructor(
        renderer,
        audioAnalyser,
        width,
        height,
        numBars = 128
    ){
        this.renderer = renderer
        this.audioAnalyser = audioAnalyser
        this.height = height

        // create ThreeJS scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
        this.camera.position.z = 10;

        
        // create bar geometry
        const barWidth = width/numBars * 2
        const geometry = new THREE.PlaneGeometry( barWidth, 1 );
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color("#07F800") },
                color2: { value: new THREE.Color("red") },
            },
            vertexShader: `    
                varying vec4 vUv;
                void main() {
                    vUv = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                    gl_Position = vUv;
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec4 vUv;
            
                void main() {
                    gl_FragColor = vec4(mix(color1, color2, vUv.y),1.0);
                }
            `,
        });

        // add bars to scene
        for (let i = 0; i < numBars; i++) {
            const bar = new THREE.Mesh( geometry, material );
            bar.position.x = barWidth * 1.2 * i - width / 2 + barWidth
            this.bars.push(bar)
            this.scene.add(bar);
        }
        
        this.sizeBin = audioAnalyser.fftSize / numBars

        /**
         * Animate the bars based on waveform data
         */
        this.animate = () => {
            const freqData = this.audioAnalyser.frequencyData;
            for (let i = 0; i < this.bars.length; i++) {

                const avg = freqData.slice(i*this.sizeBin, i*this.sizeBin+this.sizeBin).reduce(
                (acc, curr) => acc + curr, 0) / this.sizeBin

                // scale bar height to height of container
                const barHeight = avg/255 * this.height
                this.bars[i].scale.y = barHeight;
                this.bars[i].position.y = barHeight / 2 + this.height / -2;
            }
            
            this.renderer.render( this.scene, this.camera );
        }
    }

}


export class BeatVis {
    renderer
    audioAnalyser
    scene
    camera
    animate
    constructor(
        renderer,
        audioAnalyser,
        width,
        height,
    ){
        this.renderer = renderer
        this.audioAnalyser = audioAnalyser

        // create ThreeJS scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
        this.camera.position.z = 10;

        const geometry = new THREE.PlaneGeometry( 100, 100 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00fff0, transparent: true } );

        const cube = new THREE.Mesh( geometry, material );
        this.scene.add(cube);
        
        /**
         * Animate to the beat
         */
        this.animate = () => {
            if (this.audioAnalyser.onsetDetection) {
                cube.material.opacity = 1
            } else {
                cube.material.opacity -= .1
            }
            
            this.renderer.render( this.scene, this.camera );
        }
    }

}
