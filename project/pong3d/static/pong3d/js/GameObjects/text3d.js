import * as THREE from "../threejs/Three.js";
import { TextGeometry } from "../TextGeometry.js";

export class Text3d {
    constructor(scene, font, size = 0.5, depth = 0.1, color, text,
        position = new THREE.Vector3(0, 0, 0),
        rotation = new THREE.Vector3(0, 0, 0)) {
        this.font = font;
        this.text = text;
        this.size = size;
        this.depth = depth;
        this.color = color;
		this.scene = scene;
        this.position = position;
        this.rotation = rotation;
        this.material = new THREE.MeshStandardMaterial({ color: color });
        this.geometry = new TextGeometry(text, {
            font: font,
            size: size,
            depth: depth,
            curveSegments: 12
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.mesh.position.set(position);
        this.mesh.rotation.set(rotation);
        scene.add(this.mesh);
    }


    updateText(text, scene) {
        scene.remove(this.mesh);
        this.mesh = new TextGeometry(text, {
            font: this.font,
            size: this.size,
            depth: this.depth,
            curveSegments: 12,
        });
        const textMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(this.position);
        this.mesh.rotation.set(this.rotation);
        scene.add(this.mesh);
    }
}
