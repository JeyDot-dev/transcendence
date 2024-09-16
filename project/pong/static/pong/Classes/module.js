import { THREE } from '../three.module.js';

export class Cube {
    constructor(color, document) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        this.geometry = new THREE.BoxGeometry();
        this.material = new THREE.MeshBasicMaterial({ color: color });
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.cube);
    }
    animate() {
        requestAnimationFrame(animate);
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
        this.renderer.render(scene, camera);
    }
}
