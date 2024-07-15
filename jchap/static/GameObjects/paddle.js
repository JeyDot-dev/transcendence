import * as THREE from "../threejs/Three.js";

export class Paddle {
    // constructor(scene, width = 0.5, height = 0.1, depth = 0.2, color = 0xffffff, speed = 0.1, position = new THREE.Vector3(0, 0, 0), orientation = new THREE.Vector3(0, 0, 0)) {
    constructor(width, depth, color, x, y, id) {
        // Création de la géométrie et du matériau du paddle
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshStandardMaterial({ color: color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.scale.set(width, height, depth);
        this.user_id = id;
        // Positionner et orienter le paddle
        // this.mesh.position.copy(this.position);
        // this.setOrientation(this.orientation);

        // // Ajouter un AxesHelper propre au paddle
        // const axesHelper = new THREE.AxesHelper(0.5); // Taille des axes
        // this.mesh.add(axesHelper);

        // // Créer la boîte englobante pour la détection de collision
        // this.boundingBox = new THREE.Box3().setFromObject(this.mesh);

        // // Ajouter un BoxHelper pour visualiser la boîte englobante
        // this.boxHelper = new THREE.BoxHelper(this.mesh, 0xffff00);
        // scene.add(this.boxHelper); // Ajouter le BoxHelper à la scène
    }

    // Orienter le paddle en convertissant le vecteur par un quaternion
    // setOrientation(vector) {
    //     const quaternion = new THREE.Quaternion();
    //     const up = new THREE.Vector3(0, 0, 1);
    //     quaternion.setFromUnitVectors(up, vector.normalize());
    //     this.mesh.quaternion.copy(quaternion);
    // }

    // setPosition(x, y, z) {
    //     this.mesh.position.set(x, y, z);
    //     this.updateBoundingBox();
    // }

    // getMesh() {
    //     return this.mesh;
    // }

    // updateBoundingBox() {
    //     this.boundingBox.setFromObject(this.mesh);
    //     this.boxHelper.update(); // Mettre à jour le BoxHelper
    // }

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
        this.mesh.position.set(x, y, 0);
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
