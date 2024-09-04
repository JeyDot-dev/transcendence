// import * as THREE from "../threejs/Three.js";
// import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { THREE } from '../three.module.js';

export class Paddle {
    constructor(width, color, x, y, id) {
        // Création de la géométrie et du matériau du paddle
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshStandardMaterial({ color: color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        const height = width / 5;
        const depth = width / 10;
        this.mesh.scale.set(depth, width, height);
        this.user_id = id;
        this.mesh.position.set(x, y, height / 2);
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
        this.mesh.position.set(x, y, 7.5);
    }
    addToScene(scene) {
        scene.add(this.mesh);
    }
    // move(direction) {
    //     // Calculer le mouvement dans le système de coordonnées local
    //     const localDirection = new THREE.Vector3(direction.x, direction.y, direction.z);
    //     localDirection.applyQuaternion(this.mesh.quaternion);
    //     this.velocity.copy(localDirection).multiplyScalar(this.speed); // Mettre à jour la vitesse
    //     this.mesh.position.add(this.velocity);
    //     this.updateBoundingBox(); // Mettre à jour la boîte englobante après le mouvement
    // }

    // moveAlongXAxis(distance) {
    //     this.velocity.set(distance, 0, 0); // Mise à jour de la vitesse horizontale
    //     this.mesh.translateX(distance);
    //     this.updateBoundingBox(); // Mettre à jour la boîte englobante après le mouvement
    // }

    // checkCollision(ball) {
    //     if (this.boundingBox.intersectsBox(ball.boundingBox)) {
    //         this.getIntersectionPoints(this.boundingBox, ball.boundingBox);
    //         return this.boundingBox.intersectsBox(ball.boundingBox);
    //     }
    //     return false;
    // }
    // getIntersectionPoints(box1, box2) {
    //     if (box1.intersectsBox(box2)) {
    //         const intersectionBox = new THREE.Box3().copy(box1).intersect(box2);
    //         const min = intersectionBox.min;
    //         const max = intersectionBox.max;

    //         // Calculate the center of the intersection box
    //         const intersectionPoint = new THREE.Vector3(
    //             (min.x + max.x) / 2,
    //             (min.y + max.y) / 2,
    //             (min.z + max.z) / 2
    //         );

    //         console.log('Intersection Box:', intersectionBox);
    //         console.log('Intersection Point:', intersectionPoint);
    //         return intersectionPoint;
    //     }
    //     return null;
    // }
    // getNormal() {
    //     const normalMatrix = new THREE.Matrix3().getNormalMatrix(this.mesh.matrixWorld);
    //     const normal = new THREE.Vector3(0, 1, 0).applyMatrix3(normalMatrix).normalize();
    //     return normal;
    // }
}

// export { Paddle };
