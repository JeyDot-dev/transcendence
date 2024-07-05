// import * as THREE from 'three';
class Paddle {
    constructor(width = 0.5, height = 0.1, depth = 0.2, color = 0xffffff, speed = 0.1, position = new THREE.Vector3(0, 0, 0), orientation = new THREE.Vector3(0, 0, 0)) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.color = color;
        this.speed = speed;
        this.position = position;
        this.orientation = orientation;
        this.velocity = new THREE.Vector3(); // Vitesse du paddle

        // Création de la géométrie et du matériau du paddle
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const material = new THREE.MeshStandardMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(geometry, material);

        // Positionner et orienter le paddle
        this.mesh.position.copy(this.position);
        this.setOrientation(this.orientation);
        // Ajouter un AxesHelper propre au paddle
        const axesHelper = new THREE.AxesHelper(0.5); // Taille des axes
        this.mesh.add(axesHelper);
    }

    // Orienter le paddle en convertissant le vecteur  par un quaternion
    setOrientation(vector) {
        const quaternion = new THREE.Quaternion();
        const up = new THREE.Vector3(0, 0, 1);
        quaternion.setFromUnitVectors(up, vector.normalize());
        this.mesh.quaternion.copy(quaternion);
    }
	setPosition(x, y, z) {
		this.mesh.position.x = x;
		this.mesh.position.y = y;
		this.mesh.position.z = z;
	}

    getMesh() {
        return this.mesh;
    }

    move(direction) {
        // Calculer le mouvement dans le système de coordonnées local
        const localDirection = new THREE.Vector3(direction.x, direction.y, direction.z);
        localDirection.applyQuaternion(this.mesh.quaternion);
        this.velocity.copy(localDirection).multiplyScalar(this.speed); // Mettre à jour la vitesse
        this.mesh.position.add(this.velocity);
    }

    moveAlongXAxis(distance) {
        this.velocity.set(distance, 0, 0); // Mise à jour de la vitesse horizontale
        this.mesh.translateX(distance);
    }

    checkCollision(ball) {
        const thisBox = new THREE.Box3().setFromObject(this.mesh);
        const ballBox = new THREE.Box3().setFromObject(ball.getMesh());

        return thisBox.intersectsBox(ballBox);
    }
	
    getNormal() {
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(this.mesh.matrixWorld);
        const normal = new THREE.Vector3(0, 1, 0).applyMatrix3(normalMatrix).normalize();
        return normal;
    }
}
// export { Paddle };
