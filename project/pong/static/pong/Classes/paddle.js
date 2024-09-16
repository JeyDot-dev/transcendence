import { THREE } from '../three.module.js';

export class Paddle {
    constructor(width, height, color, x, y, velocity = new THREE.Vector2(0, 0), id) {
        this.velocity = velocity;
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshStandardMaterial({ color: color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.scale.set(width, height, width);
        this.user_id = id;
        this.mesh.position.set(x, y, width / 2);
    }

    logMeshData() {
        console.log('Mesh Data:');
        console.log('Dimensions (Width, Height, Depth):', this.geometry.parameters.width, this.geometry.parameters.height, this.geometry.parameters.depth);
        console.log('Position:', this.mesh.position);
        console.log('Rotation:', this.mesh.rotation);
        console.log('Scale:', this.mesh.scale);
        console.log('Bounding Box:');
        console.log('Min:', this.boxHelper.min);
        console.log('Max:', this.boxHelper.max);
    }
    move(x, y) {
        this.mesh.position.set(x, y);
    }
    addToScene(scene) {
        scene.add(this.mesh);
    }
    addToGroup(group) {
        group.add(this.mesh);
    }
    update() {
        this.mesh.position.add(this.velocity);
    }
}
