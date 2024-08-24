// import * as THREE from "./threejs/Three.js";
// import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { THREE } from '../three.module.js';

export class Cube {
    constructor(color, document) {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.position.z = 5;
		
		// Initialisation du renderer
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);
		
		// Création d'un cube
		this.geometry = new THREE.BoxGeometry();
		this.material = new THREE.MeshBasicMaterial({ color: color });
		this.cube = new THREE.Mesh(this.geometry, this.material);
		this.scene.add(this.cube);
		
	}
	// Fonction d'animation
	animate() {
		requestAnimationFrame(animate);
		// Rotation du cube pour l'animation
		this.cube.rotation.x += 0.01;
		this.cube.rotation.y += 0.01;
		// Rendu de la scène
		this.renderer.render(scene, camera);
	}
}