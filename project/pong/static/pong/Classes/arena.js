// import * as THREE from "../threejs/Three.js";
// import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { THREE } from '../three.module.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/UnrealBloomPass.js';

export class Arena {
    constructor(width, height, depth, color, wallColor, wallThickness, borderRadius, innerWallColor) {
        this.width = width + wallThickness;
        this.height = height;
        this.depth = depth + wallThickness;
        this.color = 0x00b8ff;
        this.wallColor = 0x9600ff;
        this.wallThickness = wallThickness;
        this.borderRadius = borderRadius;
        this.innerWallColor = 0xff00c1;


        this.colorPalette = [
            new THREE.Color(0xff00c1),
            new THREE.Color(0x9600ff),
            new THREE.Color(0x4900ff),
            new THREE.Color(0x00b8ff),
            new THREE.Color(0x00fff9)
        ];

        this.group = new THREE.Group();
        this.arena = this.createArena();
        this.walls = this.createWalls();

        this.group.add(this.arena);
        this.group.add(this.walls);
        this.group.translateZ(0);
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
    
        // Définir la forme intérieure (trou)
        const hole = new THREE.Path();
        hole.moveTo(-halfWidth + wallThickness, -halfDepth + wallThickness);
        hole.lineTo(halfWidth - wallThickness, -halfDepth + wallThickness);
        hole.lineTo(halfWidth - wallThickness, halfDepth - wallThickness);
        hole.lineTo(-halfWidth + wallThickness, halfDepth - wallThickness);
        hole.lineTo(-halfWidth + wallThickness, -halfDepth + wallThickness);
    
        shape.holes.push(hole);
    
        // Extruder la forme pour créer les murs
        const extrudeSettings = {
            depth: this.height,
            bevelEnabled: false,
            steps: 1,
        };
    
        let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
        const wallMaterial = new THREE.MeshStandardMaterial({ color: this.wallColor });
        const innerWallMaterial = new THREE.MeshStandardMaterial({ color: this.innerWallColor });
    
        const materials = [wallMaterial, innerWallMaterial];
    
        const positions = geometry.attributes.position;
        const faceCount = positions.count / 3;
    
        geometry.clearGroups();
    
        for (let i = 0; i < faceCount; i++) {
            const zValues = [
                positions.getZ(i * 3),
                positions.getZ(i * 3 + 1),
                positions.getZ(i * 3 + 2)
            ];
    
            const isExtrudedSide = zValues.some(z => z !== 0);
    
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
    
            const isInnerWall = xValues.every(x => Math.abs(x) < (halfWidth - wallThickness)) &&
                yValues.every(y => Math.abs(y) < (halfDepth - wallThickness));
    
            if (isExtrudedSide && isInnerWall) {
                geometry.addGroup(i * 3, 3, 1); // Matériau des murs intérieurs
            } else {
                geometry.addGroup(i * 3, 3, 0); // Matériau des murs extérieurs
            }
        }
    
        const wallMesh = new THREE.Mesh(geometry, materials);
    
        const walls = new THREE.Group();
        walls.add(wallMesh);
    
        return walls;
    }

    getWalls() {
        return this.walls.children; // Assuming walls is a THREE.Group with wall meshes as children
    }


    addToScene(scene) {
        scene.add(this.group);
    }
}
