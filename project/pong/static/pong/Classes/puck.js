// import * as THREE from "../threejs/Three.js";
// import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { THREE } from '../three.module.js';

export class Puck {
    // constructor(puckSize = 1, height = 1, color = 0x0000ff, puckSpeed = 1, initialPosition = new THREE.Vector3(0, 0, 0)) {
    constructor(size = 10, height = 2.5, color = 0xff00c1, x, y, velocity = new THREE.Vector2(0, 0), camera) {
        const radialSegments = 32; // Segments radiaux pour une surface lisse
        this.velocity = velocity;
        // this.puckSize = puckSize;
        // this.initialPosition = initialPosition;
        // this.initialSpeed = puckSpeed;
        // this.puckDirection = new THREE.Vector3(0, puckSpeed, 0);
        // this.velocity = new THREE.Vector3(0, -puckSpeed, 0);
        this.geometry = new THREE.CylinderGeometry(size, size, height, radialSegments);
        this.material = new THREE.MeshStandardMaterial({ color: color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.mesh.rotation.x = Math.PI / 2;
        this.mesh.position.set(x, y, height / 2);
        this.createGlowMesh(camera, 0xff00c1, 1.1);
    }

    createGlowMesh(camera, color, glow) {
        return ;
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
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        this.glowMesh = new THREE.Mesh(this.geometry.clone(), shaderMaterial);
        this.glowMesh.scale.multiplyScalar(glow);
        this.glowMesh.rotation.copy(this.mesh.rotation);
        this.glowMesh.position.copy(this.mesh.position);
    }

    addToScene(scene) {
        scene.add(this.mesh);
        // scene.add(this.glowMesh);
    }
    move(x, y) {
        // console.log("Move Ball");
        this.mesh.position.set(x, y);
        // this.glowMesh.position.set(x, y);
    }
    update() {
        // this.mesh.position.add(this.puckSpeed);
    }
    // move() {
    //     // Déplacer la balle en fonction de sa vitesse
    //     this.mesh.position.add(this.velocity.clone().multiplyScalar(this.puckSpeed));
    //     this.updateBoundingBox();
    // }
    // reflect(normal, paddleVelocity) {
    //     // Calculer le vecteur réfléchi en utilisant la normale de la surface
    //     const dot = this.velocity.dot(normal);
    //     const reflectedVelocity = this.velocity.clone().sub(normal.multiplyScalar(2 * dot));
    //     console.log('Reflect Data:');
    //     console.log('Normal: ', normal);
    //     console.log('Dot: ', dot);
    //     console.log('Reflected Velocity: ', reflectedVelocity);
    //     // Ajouter la vitesse du paddle à la vitesse réfléchie de la balle
    //     this.velocity.copy(reflectedVelocity.add(paddleVelocity));
    // }
    // reset() {
    //     this.mesh.position.copy(this.initialPosition);
    //     this.velocity.x = 0;
    //     this.velocity.y = -this.puckSpeed;
    //     this.velocity.Z = 0;
    // }
}
