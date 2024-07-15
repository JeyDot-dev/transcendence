import * as THREE from "../threejs/Three.js";

export class Puck {
    // constructor(puckSize = 1, height = 1, color = 0x0000ff, puckSpeed = 1, initialPosition = new THREE.Vector3(0, 0, 0)) {
    constructor(size = 10, height = 2.5, color = 0x0000ff, position) {
        const radialSegments = 32; // Segments radiaux pour une surface lisse
        // this.puckSpeed = puckSpeed;
        // this.puckSize = puckSize;
        // this.initialPosition = initialPosition;
        // this.initialSpeed = puckSpeed;
        // this.puckDirection = new THREE.Vector3(0, puckSpeed, 0);
        // this.velocity = new THREE.Vector3(0, -puckSpeed, 0);
        this.geometry = new THREE.CylinderGeometry(size, size, height, radialSegments);
        this.material = new THREE.MeshStandardMaterial({ color: color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.mesh.rotation.x = Math.PI / 2;
        this.mesh.position.set(position.x, position.y, 0);
    }
    addToScene(scene) {
        scene.add(this.mesh);
    }
    move(position) {
        this.mesh.position.set(position.x, position.y, 0);
    }
    // move() {
    //     // Déplacer la balle en fonction de sa vitesse
    //     this.mesh.position.add(this.velocity.clone().multiplyScalar(this.puckSpeed));
    //     this.updateBoundingBox();
    // }
    // reflect(normal, paddleVelocity) {
    //     // Calculer le vecteur réfléchi en utilisant la normale de la surface
    //     const dot = this.velocity.dot(normal);
    //     const reflectedVelocity = this.velocity.clone().sub(normal.multiplyScalar(2 * dot));
    //     console.log('Reflect Data:');
    //     console.log('Normal: ', normal);
    //     console.log('Dot: ', dot);
    //     console.log('Reflected Velocity: ', reflectedVelocity);
    //     // Ajouter la vitesse du paddle à la vitesse réfléchie de la balle
    //     this.velocity.copy(reflectedVelocity.add(paddleVelocity));
    // }
    // reset() {
    //     this.mesh.position.copy(this.initialPosition);
    //     this.velocity.x = 0;
    //     this.velocity.y = -this.puckSpeed;
    //     this.velocity.Z = 0;
    // }
}
