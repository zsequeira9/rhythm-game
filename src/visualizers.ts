import * as THREE from 'three';
import AudioAnalyser from './audio-analyser';

export class SpectrumVis {
    renderer: THREE.WebGLRenderer
    audioAnalyser: AudioAnalyser
    height: number
    scene: THREE.Scene
    camera: THREE.OrthographicCamera
    bars: THREE.Mesh[] = []
    sizeBin: number
    animate: () => void
    constructor(
        renderer: THREE.WebGLRenderer,
        audioAnalyser: AudioAnalyser,
        width: number,
        height: number,
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
        var material = new THREE.ShaderMaterial({
        uniforms: {
            color1: {
            value: new THREE.Color("green")
            },
            color2: {
            value: new THREE.Color("red")
            }
        },
        vertexShader: `
            varying vec2 vUv;

            void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
        
            varying vec2 vUv;
            
            void main() {
            
            gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
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
         * Animate the cubes based on waveform data
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
