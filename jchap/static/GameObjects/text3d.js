// import * as THREE from "../threejs/Three.js";
// import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { THREE } from '../three.module.js';
import { TextGeometry } from "../TextGeometry.js";

export class Text3d {
    constructor(camera, scene, font, size = 0.5, depth = 0.1, color, text,
        position = new THREE.Vector3(0, 0, 0),
        rotation = new THREE.Vector3(-Math.PI / 2, 0, 0)) {
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

        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        scene.add(this.mesh);

        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                "c": { type: "f", value: 1.0 },
                "p": { type: "f", value: 1.4 },
                glowColor: { type: "c", value: new THREE.Color(color) },
                viewVector: { type: "v3", value: camera.position }
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
                    gl_FragColor = vec4( glow, 1.0 );
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
    
        this.glowTextMesh = new THREE.Mesh(this.geometry, shaderMaterial);
        this.glowTextMesh.scale.multiplyScalar(1.05);
        this.glowTextMesh.position.copy(this.mesh.position);
        this.glowTextMesh.rotation.copy(this.mesh.rotation);
        scene.add(this.glowTextMesh);
    }

    updateText(text) {
        this.scene.remove(this.mesh);
        this.scene.remove(this.glowTextMesh);
        this.geometry = new TextGeometry(text, {
            font: this.font,
            size: this.size,
            depth: this.depth,
            curveSegments: 12
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        this.scene.add(this.mesh);

        const shaderMaterial = this.glowTextMesh.material;
        this.glowTextMesh = new THREE.Mesh(this.geometry, shaderMaterial);
        this.glowTextMesh.scale.multiplyScalar(1.05);
        this.glowTextMesh.position.copy(this.mesh.position);
        this.glowTextMesh.rotation.copy(this.mesh.rotation);
        this.scene.add(this.glowTextMesh);
    }
}