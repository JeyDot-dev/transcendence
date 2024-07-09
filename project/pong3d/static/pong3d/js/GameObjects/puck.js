import * as THREE from "../threejs/Three.js";

export class Puck {
    constructor(scene, puckSize = 1, height = 1, color = 0x0000ff, puckSpeed = 1, initialPosition = new THREE.Vector3(0, 0, 0)) {
        const radialSegments = 32; // Segments radiaux pour une surface lisse
        this.puckSpeed = puckSpeed;
        this.puckSize = puckSize;
        this.initialPosition = initialPosition;
        this.initialSpeed = puckSpeed;
        // this.puckDirection = new THREE.Vector3(0, puckSpeed, 0);
		this.velocity = new THREE.Vector3(0, -puckSpeed, 0);
        this.geometry = new THREE.CylinderGeometry(puckSize, puckSize, height, radialSegments);
        this.material = new THREE.MeshStandardMaterial({ color: color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        // Orienter le cylindre le long de l'axe Z
        this.mesh.rotation.x = Math.PI / 2; // 90 degrés autour de l'axe X
        // Créer la boîte englobante pour la détection de collision
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);

        // Ajouter un BoxHelper pour visualiser la boîte englobante
        this.boxHelper = new THREE.BoxHelper(this.mesh, 0xffff00);
        scene.add(this.boxHelper); // Ajouter le BoxHelper à la scène
    }

    getMesh() {
        return this.mesh;
    }
    // getBoxHelper() {
    //     return this.boxHelper;
    // }
    // updateBoxHelper() {
    //     this.boxHelper.update();
    // }
    get position() {
        return this.mesh.position;
    }
    get rotation() {
        return this.mesh.rotation;
    }
    get size() {
        return this.puckSize;
    }
    get speed() {
        return this.puckSpeed;
    }

    set speed(value) {
        this.puckSpeed = value;
    }

    inverseDirectionY() {
        this.velocity.y *= -1;
    }
    inverseDirectionX() {
        this.velocity.x *= -1;
    }
    // updatePosition() {
    //     this.mesh.position.x += this.puckDirection.x * this.puckSpeed;
    //     this.mesh.position.y += this.puckDirection.y * this.puckSpeed;
    // }
	updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
        this.boxHelper.update(); // Mettre à jour le BoxHelper
    }
    move() {
        // Déplacer la balle en fonction de sa vitesse
        this.mesh.position.add(this.velocity.clone().multiplyScalar(this.puckSpeed));
		this.updateBoundingBox();
	}
    reflect(normal, paddleVelocity) {
        // Calculer le vecteur réfléchi en utilisant la normale de la surface
        const dot = this.velocity.dot(normal);
        const reflectedVelocity = this.velocity.clone().sub(normal.multiplyScalar(2 * dot));
		console.log('Reflect Data:');
		console.log('Normal: ', normal);
		console.log('Dot: ', dot);
		console.log('Reflected Velocity: ', reflectedVelocity);
        // Ajouter la vitesse du paddle à la vitesse réfléchie de la balle
        this.velocity.copy(reflectedVelocity.add(paddleVelocity));
    }
    reset() {
        this.mesh.position.copy(this.initialPosition);
        this.velocity.x = 0;
		this.velocity.y = -this.puckSpeed;
		this.velocity.Z = 0;
    }
}