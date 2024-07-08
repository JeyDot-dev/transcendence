class Arena {
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
    }

    createArena() {
        const geometry = new THREE.PlaneGeometry(this.width, this.depth);
        const material = new THREE.MeshStandardMaterial({ color: this.color, side: THREE.DoubleSide });
        const arenaMesh = new THREE.Mesh(geometry, material);
        return arenaMesh;
    }

    createWalls() {
        const shape = new THREE.Shape();
        const halfWidth = (this.width + this.wallThickness) / 2;
        const halfDepth = (this.depth  + this.wallThickness) / 2;
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
            bevelEnabled: false
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // Appliquer différentes couleurs aux faces
        const materials = [
            new THREE.MeshStandardMaterial({ color: this.wallColor }), // Couleur pour les faces extérieures
            new THREE.MeshStandardMaterial({ color: this.innerWallColor }) // Couleur pour les faces intérieures
        ];

        // Créer un matériau spécial pour gérer les différentes faces
        const faceMaterial = new THREE.MeshFaceMaterial(materials);

        // Créer le mesh avec la géométrie extrudée et le matériau multi-face
        const wallMesh = new THREE.Mesh(geometry, faceMaterial);

        const walls = new THREE.Group();
        walls.add(wallMesh);

        return walls;
    }

    addToScene(scene) {
        scene.add(this.group);
    }
}