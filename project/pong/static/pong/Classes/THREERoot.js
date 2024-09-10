import { THREE } from '../three.module.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/RenderPass.js';
import { TWEEN } from '../three.module.js';
import Stats from 'https://cdnjs.cloudflare.com/ajax/libs/stats.js/17/Stats.js';

export class THREERoot {
    constructor(fov = 75, width = window.innerWidth, height = window.innerHeight, near = 0.1, far = 10000) {
        // this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);
        this.width = width;
        this.height = height;
        this.animatedObjects = []; // Liste des objets animés
        this.stats = null;
        this.renderer = null;
        // this.queue = Promise.resolve(); // File d'attente initialisée à une Promise résolue

        this.initCameraControls();
    }
    
    initCanvas() {
        this.container = document.querySelector("#container_game");
        if (!this.container) return ;
        console.log("Container: ", this.container);
        
        // Enable MSAA in the WebGLRenderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.shadowMap.enabled = true;
        this.composer = new EffectComposer(this.renderer);
        this.container.appendChild(this.renderer.domElement);


        // Initialize FPS counter
        // this.stats = new Stats();
        // this.stats.showPanel(0); // 0 = FPS, 1 = ms/frame, 2 = memory usage
        // this.container.appendChild(this.stats.dom);

        // Create a render target with MSAA for post-processing
        this.renderTarget = new THREE.WebGLMultisampleRenderTarget(this.width, this.height, { format: THREE.RGBAFormat });
        
        // Create the EffectComposer with the MSAA render target
        this.composer = new EffectComposer(this.renderer, this.renderTarget);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const spinner = document.getElementById("fidget-spinner");
        spinner.removeChild(spinner.firstChild);
        spinner.remove();
        this.onWindowResize(this);
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    addAnimatedObject(object) {
        this.animatedObjects.push(object);
    }

    onWindowResize() {
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    render() {
        this.composer.render();
    }

    animate() {
        TWEEN.update();
        requestAnimationFrame(this.animate.bind(this));
        if (!this.renderer) return ;

        // Start FPS counter
        if (this.stats) {
            this.stats.begin();
        }
        
        // Call the update method of each animated object
        this.animatedObjects.forEach(obj => {
            if (typeof obj.update === 'function') {
                obj.update();
            }
            if (typeof obj.render === 'function') {
                obj.render();
            }
        });

        // End FPS counter
        if (this.stats) {
            this.stats.end();
        }
        this.render();
    }

    updateCameraSettings({ fov, aspect, near, far, position, lookAt }) {
        if (fov !== undefined) {
            this.camera.fov = fov;
        }
        if (aspect !== undefined) {
            this.camera.aspect = aspect;
        }
        if (near !== undefined) {
            this.camera.near = near;
        }
        if (far !== undefined) {
            this.camera.far = far;
        }
        if (position !== undefined) {
            this.camera.position.set(position.x, position.y, position.z);
        }
        if (lookAt !== undefined) {
            this.camera.lookAt(new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z));
        }
        this.camera.updateProjectionMatrix();
    }
    tweenCamera(targetSettings, duration = 2000) {
        const camera = this.camera;
    
        // Obtenir la position actuelle de la caméra et le vecteur de direction actuel au moment du démarrage du tween
        const initialPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
        console.log('initialPosition: ', initialPosition);
        const targetPosition = targetSettings.position;
        console.log('targetPosition: ', targetPosition);
    
        // Obtenir la direction actuelle vers laquelle la caméra est orientée
        const initialLookAt = new THREE.Vector3();
        camera.getWorldDirection(initialLookAt);
        console.log('initialLookAt: ', initialLookAt);
    
        const targetLookAt = new THREE.Vector3(targetSettings.lookAt.x, targetSettings.lookAt.y, targetSettings.lookAt.z);
        console.log('targetLookAt: ', targetLookAt);
    
        // Créer une promesse qui encapsule l'exécution simultanée des trois tweens
        return new Promise((resolve) => {
            // Définir les tweens
            const positionTween = new TWEEN.Tween(initialPosition)
                .to(targetPosition, duration)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(() => {
                    camera.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
                });
    
            const lookAtTween = new TWEEN.Tween(initialLookAt)
                .to(targetLookAt, duration)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(() => {
                    camera.lookAt(initialLookAt);
                });
    
            const fovTween = new TWEEN.Tween({
                fov: camera.fov,
                near: camera.near,
                far: camera.far
            })
                .to({
                    fov: targetSettings.fov,
                    near: targetSettings.near,
                    far: targetSettings.far
                }, duration)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(function (settings) {
                    camera.fov = settings.fov;
                    camera.near = settings.near;
                    camera.far = settings.far;
                    camera.updateProjectionMatrix();
                });
    
            // Démarrer les tweens simultanément
            positionTween.start();
            lookAtTween.start();
            fovTween.start();
    
            // Résoudre la promesse lorsque le dernier tween est terminé
            fovTween.onComplete(() => {
                resolve(); // Tout est fini
            });
        });
    }
    
    initCameraControls() {
        document.getElementById('update-camera').addEventListener('click', () => {
            const posX = parseFloat(document.getElementById('camera-pos-x').value);
            const posY = parseFloat(document.getElementById('camera-pos-y').value);
            const posZ = parseFloat(document.getElementById('camera-pos-z').value);
            const lookAtX = parseFloat(document.getElementById('camera-lookat-x').value);
            const lookAtY = parseFloat(document.getElementById('camera-lookat-y').value);
            const lookAtZ = parseFloat(document.getElementById('camera-lookat-z').value);

            this.updateCameraSettings({
                position: { x: posX, y: posY, z: posZ },
                lookAt: { x: lookAtX, y: lookAtY, z: lookAtZ }
            });
        });
    }
}
