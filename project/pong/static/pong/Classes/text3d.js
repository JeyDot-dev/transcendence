import { THREE } from '../three.module.js';
import { TextGeometry } from "../TextGeometry.js";
import { TWEEN } from '../three.module.js';

export class Text3d {
    constructor(camera, scene, font, size = 0.5, depth = 0.1, color = 0xfffff, text = "NULL", glow = 0,
        position = new THREE.Vector3(0, 0, 0),
        rotation = new THREE.Vector3(Math.PI / 2, 0, 0)) {
        this.camera = camera;
        this.font = font;
        this.text = text;
        this.size = size;
        this.depth = depth;
        this.color = color;
        this.scene = scene;
        this.rotation = rotation;
        this.quaternion = null;
        this.material = new THREE.MeshStandardMaterial({ color: color });
        this.geometry = new TextGeometry(this.text, {
            font: font,
            size: size,
            depth: depth,
            curveSegments: 12
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);

        this.glowTextMesh = null;
        if (glow != 0) {
            this.createGlowMesh(camera, scene, color, glow);
        }

        this.setPosition(position);
    }

    createGlowMesh(camera, scene, color, glow) {
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

        this.glowTextMesh = new THREE.Mesh(this.geometry.clone(), shaderMaterial);
        this.glowTextMesh.scale.multiplyScalar(glow);
        this.glowTextMesh.rotation.copy(this.mesh.rotation);
    }

    setPosition(position) {
        this.position = position;

        this.geometry.computeBoundingBox();
        const bbox = this.geometry.boundingBox;
        const offsetX = (bbox.max.x - bbox.min.x) / 2;
        const offsetY = (bbox.max.y - bbox.min.y) / 2;

        this.mesh.position.set(position.x - offsetX, position.y - offsetY, position.z);
        if (this.glowTextMesh) {
            this.glowTextMesh.position.set(position.x - offsetX, position.y - offsetY, position.z);
        }
    }
    setVisible(isVisible) {
        this.mesh.visible = isVisible;
        if (this.glowTextMesh) {
            this.glowTextMesh.visible = isVisible;
        }
    }
    setColor(newColor) {
        if (this.color == newColor) return;
        this.color = newColor;
        this.material.color.set(newColor);
        if (this.glowTextMesh) {
            this.glowTextMesh.material.uniforms.glowColor.value.set(newColor);
        }
    }
    alignTextWithCamera() {
        let startQuaternion = new THREE.Quaternion().copy(this.mesh.quaternion);
        let endQuaternion = new THREE.Quaternion().copy(this.camera.quaternion);
        this.quaternion = endQuaternion;

        new TWEEN.Tween({ t: 0 })
            .to({ t: 1 }, 1000)
            .onUpdate(function (progress) {
                this.mesh.quaternion.slerpQuaternions(startQuaternion, endQuaternion, progress.t);

                if (this.glowTextMesh) {
                    this.glowTextMesh.quaternion.slerpQuaternions(startQuaternion, endQuaternion, progress.t);
                }
            }.bind(this))
            .start();
    }

    addToGroup(group) {
        group.add(this.mesh);
        if (this.glowTextMesh) {
            group.add(this.glowTextMesh);
        }
    }
    removeFromGroup(group) {
        group.remove(this.mesh);
        if (this.glowTextMesh) {
            group.remove(this.glowTextMesh);
        }
    }

    updateText(text, group) {
        this.removeFromGroup(group);
        this.text = text;
        this.geometry = new TextGeometry(this.text, {
            font: this.font,
            size: this.size,
            depth: this.depth,
            curveSegments: 12
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        if (this.quaternion) {
            this.mesh.quaternion.copy(this.quaternion);
        } else {
            this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        }
        if (this.glowTextMesh) {
            this.createGlowMesh(this.camera, this.scene, this.color, this.glowTextMesh.scale.x);
            if (this.quaternion) {
                this.glowTextMesh.quaternion.copy(this.quaternion);
            }
        }
        this.addToGroup(group);

        this.setPosition(this.position);
    }
}
