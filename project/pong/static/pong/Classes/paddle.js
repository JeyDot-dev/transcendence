import { THREE } from '../three.module.js';

export class Paddle {
    constructor(width, height, color, x, y, velocity = new THREE.Vector2(0, 0), id, threeRoot) {
        this.velocity = velocity;
        this.threeRoot = threeRoot;
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshStandardMaterial({ color: color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.scale.set(width, height, width);
        this.user_id = id;
        this.mesh.position.set(x, y, width / 2);

        // Create glow meshes
        this.glowBlack = this.createGlowMesh(new THREE.Color(0x00ffff)); // Blue glow
        this.glowRed = this.createGlowMesh(new THREE.Color(0xff0000));  // Red glow

        this.glowBlack.visible = false; // Initially hide both
        this.glowRed.visible = false;
    }

    logMeshData() {
        // console.log('Mesh Data:');
        // console.log('Dimensions (Width, Height, Depth):', this.geometry.parameters.width, this.geometry.parameters.height, this.geometry.parameters.depth);
        // console.log('Position:', this.mesh.position);
        // console.log('Rotation:', this.mesh.rotation);
        // console.log('Scale:', this.mesh.scale);
    }

    createGlowMesh(color) {
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                "c": { type: "f", value: 1.0 },
                "p": { type: "f", value: 1.4 },
                glowColor: { type: "c", value: color },
                viewVector: { type: "v3", value: new THREE.Vector3() }
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
        
        const glowMesh = new THREE.Mesh(this.geometry.clone(), shaderMaterial);
        const glowScaleFactor = 1.05;  // Increase this value to make the glow larger
        glowMesh.scale.set(
            glowScaleFactor,
            glowScaleFactor,
            glowScaleFactor
        );
        this.mesh.add(glowMesh);  // Attach the glow to the paddle mesh
        return glowMesh;
    }

    showBlackGlow() {
        this.glowBlack.visible = true;
        this.glowRed.visible = false;
    }

    showRedGlow() {
        this.glowRed.visible = true;
        this.glowBlack.visible = false;
    }
    hideBothGlow() {
        this.glowRed.visible = false;
        this.glowBlack.visible = false;
    }

    move(x, y) {
        this.mesh.position.set(x, y);
        // this.glowBlack.material.uniforms.viewVector.value = this.threeRoot.camera.position.clone().sub(this.mesh.position).normalize();
        // this.glowRed.material.uniforms.viewVector.value = this.threeRoot.camera.position.clone().sub(this.mesh.position).normalize();
    }

    addToScene(scene) {
        scene.add(this.mesh);
    }

    addToGroup(group) {
        group.add(this.mesh);
    }

    update() {
        this.mesh.position.add(this.velocity);
    }
}
