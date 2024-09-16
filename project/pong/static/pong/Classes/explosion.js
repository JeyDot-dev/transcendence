import { THREE } from '../three.module.js';

export class Explosion {
    constructor(scene, particleCount = 100, particleSize = 0.1, duration = 2) {
        this.scene = scene;
        this.particleCount = particleCount;
        this.particleSize = particleSize;
        this.duration = duration;
        this.clock = new THREE.Clock();
        this.initParticles();
        this.active = false;
    }

    initParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const velocities = new Float32Array(this.particleCount * 3);

        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;

            velocities[i * 3] = (Math.random() - 0.5) * 2;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 2;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        const material = new THREE.PointsMaterial({
            size: this.particleSize,
            color: 0xff0000,
        });

        this.particleSystem = new THREE.Points(geometry, material);
    }

    async update() {
        if (!this.active) return;

        const deltaTime = this.clock.getDelta();
        const positions = this.particleSystem.geometry.attributes.position.array;
        const velocities = this.particleSystem.geometry.attributes.velocity.array;

        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] += velocities[i * 3] * deltaTime;
            positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
            positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;

        await this.sleep(16); // Approx. 60fps
    }

    async trigger(position) {
        this.clock.start();
        this.active = true;

        const positions = this.particleSystem.geometry.attributes.position.array;
        const velocities = this.particleSystem.geometry.attributes.velocity.array;

        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;

            velocities[i * 3] = (Math.random() - 0.5) * 5;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 5;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 5;
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.geometry.attributes.velocity.needsUpdate = true;

        this.scene.add(this.particleSystem);

        const startTime = this.clock.getElapsedTime();
        while (this.clock.getElapsedTime() - startTime < this.duration) {
            await this.update();
        }

        this.dispose();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    dispose() {
        if (this.particleSystem) {
            this.scene.remove(this.particleSystem);
            this.particleSystem.geometry.dispose();
            this.particleSystem.material.dispose();
            this.particleSystem = null;
        }
        this.active = false;
    }
}
