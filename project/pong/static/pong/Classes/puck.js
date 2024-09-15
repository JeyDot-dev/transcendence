import { THREE } from '../three.module.js';

export class Puck {
    constructor(size = 10, height = 2.5, color = 0xff00c1, x, y, velocity = new THREE.Vector2(0, 0), camera) {
        const radialSegments = 32; // Segments radiaux pour une surface lisse
        this.velocity = velocity;
        this.geometry = new THREE.CylinderGeometry(size, size, height, radialSegments);
        this.material = new THREE.MeshStandardMaterial({ color: color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.mesh.rotation.x = Math.PI / 2;
        this.mesh.position.set(x, y, height / 2);
    }

    createGlowMesh(camera, color, glow) {
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
    }
    addToGroup(group) {
        group.add(this.mesh);
    }
    move(x, y) {
        this.mesh.position.set(x, y);
    }
    update() {
    }
    getPosition() {
        return this.mesh.position;
    }
}
