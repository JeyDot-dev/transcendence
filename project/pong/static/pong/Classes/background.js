import { THREE } from '../three.module.js';

export class BouncingBallInCube {
    constructor(size, division, threeRoot, group) {
        this.size = size;
        this.division = division;
        this.scene = threeRoot.scene;
        this.camera = threeRoot.camera;
        this.groupRef = group;

        this.ballVelocity = new THREE.Vector3(15, 14, 13); // Vitesse initiale
        this.gridSegmentsList = [];
        this.pointsSet = new Set(); // Pour éviter les doublons de points
        this.segmentSet = new Set(); // Pour éviter les doublons de segments
        this.isPaused = false; // État de pause
        this.createCubeWithGrid();
        this.createBall();

        // Ajouter un écouteur d'événements pour la touche espace
        window.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                this.togglePause();
            }
        });
    }

    createCubeWithGrid() {
        const halfSize = this.size / 2;
        const step = this.size / (this.division + 1); // Taille d'une division sur une face

        // Créer les grilles sur chaque face du cube
        this.createGridOnFace(new THREE.Vector3(0, 0, halfSize), new THREE.Euler(0, 0, 0), step); // Face avant
        this.createGridOnFace(new THREE.Vector3(0, 0, -halfSize), new THREE.Euler(0, Math.PI, 0), step); // Face arrière
        this.createGridOnFace(new THREE.Vector3(0, halfSize, 0), new THREE.Euler(-Math.PI / 2, 0, 0), step); // Face haut
        this.createGridOnFace(new THREE.Vector3(0, -halfSize, 0), new THREE.Euler(Math.PI / 2, 0, 0), step); // Face bas
        this.createGridOnFace(new THREE.Vector3(halfSize, 0, 0), new THREE.Euler(0, Math.PI / 2, 0), step); // Face droite
        this.createGridOnFace(new THREE.Vector3(-halfSize, 0, 0), new THREE.Euler(0, -Math.PI / 2, 0), step); // Face gauche
    }

    createGridOnFace(position, rotation, step) {
        const halfSize = this.size / 2;

        for (let i = -halfSize; i <= halfSize; i += step) {
            for (let j = -halfSize; j <= halfSize; j += step) {
                const currentPoint = new THREE.Vector3(i, j, 0);
                this.createIntersectionPoint(currentPoint, position, rotation);

                if (i < halfSize) {
                    const rightPoint = new THREE.Vector3(i + step, j, 0);
                    this.createGridSegment(currentPoint, rightPoint, position, rotation);
                }

                if (j < halfSize) {
                    const topPoint = new THREE.Vector3(i, j + step, 0);
                    this.createGridSegment(currentPoint, topPoint, position, rotation);
                }
            }
        }
    }

    createGridSegment(start, end, position, rotation) {
        const transformedStart = start.clone().applyEuler(rotation).add(position);
        const transformedEnd = end.clone().applyEuler(rotation).add(position);
    
        const segmentKey = `${transformedStart.x},${transformedStart.y},${transformedStart.z}-${transformedEnd.x},${transformedEnd.y},${transformedEnd.z}`;
        const reverseSegmentKey = `${transformedEnd.x},${transformedEnd.y},${transformedEnd.z}-${transformedStart.x},${transformedStart.y},${transformedStart.z}`;
    
        this.segmentSet.add(segmentKey);

        // PALETE
        const colorPalette = [
            new THREE.Color(0xff00c1),
            new THREE.Color(0x9600ff),
            new THREE.Color(0x4900ff),
            new THREE.Color(0x00b8ff),
            new THREE.Color(0x00fff9)
        ];

        const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        const lineMaterial = new THREE.ShaderMaterial({
            uniforms: {
                "c": { type: "f", value: 1.0 },
                "p": { type: "f", value: 1.4 },
                glowColor: { type: "c", value: randomColor },
                viewVector: { type: "v3", value: this.camera.position }
            },
            vertexShader: `
                uniform vec3 viewVector;
                uniform float c;
                uniform float p;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize( normalMatrix * normal );
                    vec3 vNormel = normalize( normalMatrix * viewVector );
                    intensity = pow( c - dot(vNormal, vNormel), p );
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4( glow, 0.7 );
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
    
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([transformedStart, transformedEnd]);
        const lineSegment = new THREE.Line(lineGeometry, lineMaterial);
    
        // this.scene.add(lineSegment);
        this.gridSegmentsList.push(lineSegment);
    }

    createIntersectionPoint(localPosition, facePosition, faceRotation) {
        const transformedPosition = localPosition.clone().applyEuler(faceRotation).add(facePosition);
        const key = `${transformedPosition.x},${transformedPosition.y},${transformedPosition.z}`;
    
        // Si le point existe déjà, ne rien faire
        if (this.pointsSet.has(key)) return;
    
        // Créer le point s'il n'existe pas
        const pointGeometry = new THREE.SphereGeometry(4, 16, 16);
        const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
    
        point.position.copy(transformedPosition);
    
        // this.scene.add(point);
    
        // Remplacer le stockage par l'objet Three.js lui-même
        this.pointsSet.add(point);
    }

    createBall() {
        const ballRadius = this.size / 200;
        const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
        const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.position.set(0, 0, 0);
        // this.scene.add(this.ball);
        this.ballRadius = ballRadius;
    }

    updateGridVisibility() {
        const maxVisibilityDistance = 888;
        const minVisibilityDistance = 0;

        this.gridSegmentsList.forEach(segment => {
            const positions = segment.geometry.attributes.position.array;
            const start = new THREE.Vector3(positions[0], positions[1], positions[2]).applyMatrix4(segment.matrixWorld);
            const end = new THREE.Vector3(positions[3], positions[4], positions[5]).applyMatrix4(segment.matrixWorld);

            const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            const distance = this.ball.position.distanceTo(midpoint);

            if (distance >= minVisibilityDistance && distance <= maxVisibilityDistance) {
                segment.material.opacity = 1;
                segment.visible = true;
            } else {
                segment.material.opacity = 0;
                segment.visible = false;
            }
        });
    }

    checkCollision() {
        const halfSize = this.size / 2;

        if (this.ball.position.x + this.ballRadius > halfSize || this.ball.position.x - this.ballRadius < -halfSize) {
            this.ballVelocity.x = -this.ballVelocity.x;
        }
        if (this.ball.position.y + this.ballRadius > halfSize || this.ball.position.y - this.ballRadius < -halfSize) {
            this.ballVelocity.y = -this.ballVelocity.y;
        }
        if (this.ball.position.z + this.ballRadius > halfSize || this.ball.position.z - this.ballRadius < -halfSize) {
            this.ballVelocity.z = -this.ballVelocity.z;
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }

    update() {
        if (this.isPaused) return;

        this.ball.position.add(this.ballVelocity);

        this.checkCollision();

        this.updateGridVisibility();
    }

    hide() {
        this.gridSegmentsList.forEach(segment => {
            segment.visible = false;
        });
        this.ball.visible = false;
        this.isPaused = true;
        this.pointsSet.forEach(point => {
            point.visible = false;
        });
    }

    show() {
        this.ball.visible = true;
        this.isPaused = false;
        this.pointsSet.forEach(point => {
            point.visible = true;
        });
    }

    addToGroup(group) {
        // this.scene.add(this.ball);
        group.add(this.ball);
        this.pointsSet.forEach(point => {
            group.add(point);
        });
        this.gridSegmentsList.forEach(segment => {
            group.add(segment);
        });
        // this.scene.add(point);
        // this.scene.add(lineSegment);

    }
}