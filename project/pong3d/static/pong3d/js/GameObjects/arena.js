import * as THREE from "../threejs/Three.js";

export class Arena {
    constructor(width, height, depth, color, wallColor, wallThickness, borderRadius, innerWallColor) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.color = color;
        this.wallColor = wallColor;
        this.wallThickness = wallThickness;
        this.borderRadius = borderRadius;
        this.innerWallColor = innerWallColor;

        this.group = new THREE.Group(); // Créer un groupe pour l'arène
        this.arena = this.createArena();
        this.walls = this.createWalls();

        this.group.add(this.arena);
        this.group.add(this.walls);
		// this.group.translateX(10);
    }

    createArena() {
        const geometry = new THREE.PlaneGeometry(this.width - this.wallThickness, this.depth - this.wallThickness);
        const material = new THREE.MeshStandardMaterial({ color: this.color, side: THREE.DoubleSide });
        const arenaMesh = new THREE.Mesh(geometry, material);
        return arenaMesh;
    }

    createWalls() {
        const shape = new THREE.Shape();
        const halfWidth = (this.width + this.wallThickness) / 2;
        const halfDepth = (this.depth + this.wallThickness) / 2;
        const wallThickness = this.wallThickness;
        const borderRadius = this.borderRadius;

        // Définir la forme extérieure avec des coins arrondis
        shape.moveTo(-halfWidth + borderRadius, -halfDepth);
        shape.lineTo(halfWidth - borderRadius, -halfDepth);
        shape.quadraticCurveTo(halfWidth, -halfDepth, halfWidth, -halfDepth + borderRadius);
        shape.lineTo(halfWidth, halfDepth - borderRadius);
        shape.quadraticCurveTo(halfWidth, halfDepth, halfWidth - borderRadius, halfDepth);
        shape.lineTo(-halfWidth + borderRadius, halfDepth);
        shape.quadraticCurveTo(-halfWidth, halfDepth, -halfWidth, halfDepth - borderRadius);
        shape.lineTo(-halfWidth, -halfDepth + borderRadius);
        shape.quadraticCurveTo(-halfWidth, -halfDepth, -halfWidth + borderRadius, -halfDepth);

        // Définir la forme intérieure (morceau enlevé)
        const hole = new THREE.Path();
        hole.moveTo(-halfWidth + wallThickness, -halfDepth + wallThickness);
        hole.lineTo(halfWidth - wallThickness, -halfDepth + wallThickness);
        hole.lineTo(halfWidth - wallThickness, halfDepth - wallThickness);
        hole.lineTo(-halfWidth + wallThickness, halfDepth - wallThickness);
        hole.lineTo(-halfWidth + wallThickness, -halfDepth + wallThickness);

        shape.holes.push(hole);

        // Extrude la forme pour créer les murs
        const extrudeSettings = {
            depth: this.height,
            bevelEnabled: false,
            steps: 1,
            // material: 0, // Assign first material (wallColor) to the entire geometry initially
            // extrudeMaterial: 1 // Assign second material (innerWallColor) to the sides
        };

        let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // Appliquer différentes couleurs aux faces
        const wallMaterial = new THREE.MeshStandardMaterial({ color: this.wallColor });
        const innerWallMaterial = new THREE.MeshStandardMaterial({ color: this.innerWallColor });

        const materials = [wallMaterial, innerWallMaterial];

        // Manually assign material indices to the faces
        const positions = geometry.attributes.position;
        const faceCount = positions.count / 3;

        geometry.clearGroups();

        for (let i = 0; i < faceCount; i++) {
            const zValues = [
                positions.getZ(i * 3),
                positions.getZ(i * 3 + 1),
                positions.getZ(i * 3 + 2)
            ];

            // Check if the face is an extruded side face
            const isExtrudedSide = zValues.some(z => z !== 0);

            // Determine if the face belongs to the inner or outer wall by checking the X and Y coordinates
            const xValues = [
                positions.getX(i * 3),
                positions.getX(i * 3 + 1),
                positions.getX(i * 3 + 2)
            ];

            const yValues = [
                positions.getY(i * 3),
                positions.getY(i * 3 + 1),
                positions.getY(i * 3 + 2)
            ];

            // Identify inner wall by checking if all vertices lie within the inner wall boundaries
            const isInnerWall = xValues.every(x => Math.abs(x) < halfWidth - wallThickness) &&
                yValues.every(y => Math.abs(y) < halfDepth - wallThickness);

            if (isExtrudedSide && isInnerWall) {
                geometry.addGroup(i * 3, 3, 1); // Inner wall material index
            } else {
                geometry.addGroup(i * 3, 3, 0); // Outer wall material index
            }
        }
        // Create the mesh with the extruded geometry
        const wallMesh = new THREE.Mesh(geometry, materials);

        // Créer le mesh avec la géométrie extrudée
        // const wallMesh = new THREE.Mesh(geometry, materials);

        const walls = new THREE.Group();
        walls.add(wallMesh);

        return walls;
    }

    addToScene(scene) {
        scene.add(this.group);
    }
}
