import { THREE } from '../three.module.js';
import { FontLoader } from '../FontLoader.js';
import { Text3d } from './text3d.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/shaders/FXAAShader.js';

export class Menu {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        // this.controls = controls;
        this.fontLoader = new FontLoader();
        this.composer = null;
        this.outlinePass = null;

        this.fontLoader.load(
            'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
            (font) => {
                this.font = font;
                this.createMenuItems();
                this.setupOutlinePass();
            },
            undefined,
            (error) => {
                console.error('An error occurred loading the font:', error);
            }
        );

        // GridHelper
        const size = 2000; // Taille de la grille
        const divisions = 200; // Nombre de divisions
        const gridHelper = new THREE.GridHelper(size, divisions);
        gridHelper.position.set(0, 0, 0);
        gridHelper.rotation.x = Math.PI / 2;
        scene.add(gridHelper);

        // LIGHT
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(500, -500, 1000);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        scene.add(directionalLight.target);

        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
        scene.add(directionalLightHelper);

        window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        window.addEventListener('click', this.onMouseClick.bind(this), false); // Ajout du gestionnaire de clics
    }

    createMenuItems() {
        this.matchmaking = new MenuItem(this.scene, this.camera, this.font, 'Matchmaking', new THREE.Vector3(0, 0, 200), () => {
            console.log("Clicked On: Matchmaking");
        });
        this.tournament = new MenuItem(this.scene, this.camera, this.font, 'Tournament', new THREE.Vector3(0, 0, 0), () => {
            console.log("Clicked On: Tournament");
        });
        this.options = new MenuItem(this.scene, this.camera, this.font, 'Options', new THREE.Vector3(0, 0, -200), () => {
            console.log("Clicked On: Options");
        });

        this.menuItems = [
            this.matchmaking,
            this.tournament,
            this.options
        ];
    }

    setupOutlinePass() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        const fxaaPass = new ShaderPass(FXAAShader);
        const pixelRatio = this.renderer.getPixelRatio();
        fxaaPass.uniforms['resolution'].value.set(1 / (window.innerWidth * pixelRatio), 1 / (window.innerHeight * pixelRatio));
        this.composer.addPass(fxaaPass);

        this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
        this.outlinePass.edgeStrength = 3.0;
        this.outlinePass.edgeGlow = 3.0;
        this.outlinePass.edgeThickness = 3.0;
        this.outlinePass.pulsePeriod = 2;
        this.outlinePass.visibleEdgeColor.set('#f161bf');
        this.outlinePass.hiddenEdgeColor.set('#190a05');

        this.composer.addPass(this.outlinePass);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        // console.log(this.mouse);

        // CAMERA
        const maxRotationX = Math.PI / 12;
        const maxRotationY = Math.PI / 12;
        const targetRotationX = this.mouse.x * maxRotationX;
        const targetRotationY = this.mouse.y * maxRotationY;
        
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera.rotateY(-targetRotationX); // Appliquer la rotation autour de l'axe Y
        this.camera.rotateX(targetRotationY); 
    
        // RAYCASTER
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = [];
        this.menuItems.forEach(item => {
            item.updateBoundingBox(); // Assurez-vous que la bounding box est mise à jour
            const intersection = this.raycaster.ray.intersectBox(item.boundingBox, new THREE.Vector3());
            if (intersection) {
                intersects.push(item);
            }
        });

        if (intersects.length > 0) {
            const selectedItem = intersects[0];
            this.outlinePass.selectedObjects = [selectedItem.textMesh];
        } else {
            this.outlinePass.selectedObjects = [];
        }
    }

    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        let intersects = [];
        this.menuItems.forEach(item => {
            item.updateBoundingBox();
            const intersection = this.raycaster.ray.intersectBox(item.boundingBox, new THREE.Vector3());
            if (intersection) {
                intersects.push(item);
            }
        });

        if (intersects.length > 0) {
            const selectedItem = intersects[0];
            selectedItem.onClick(); // Appel de la fonction onClick associée à l'item cliqué
        }
    }

    render(camera) {
        if (this.composer) {
            this.camera = camera;
            this.composer.render();
        }
    }
}

class MenuItem {
    constructor(scene, camera, font, text, position, onClick) {
        this.scene = scene;
        this.camera = camera;
        this.font = font;
        this.position = position;
        this.onClick = onClick; // Fonction de callback pour le clic

        this.createText(text);
        this.createBoundingBox();
    }

    createText(text) {
        this.text3d = new Text3d(this.camera, this.scene, this.font, 100, 25, 0x33ccff, text, 1.02, this.position, new THREE.Vector3(Math.PI / 2, 0, 0));
        this.textMesh = this.text3d.mesh;

        // Centrer le texte après création
        this.text3d.setPosition(this.position);
    }

    createBoundingBox() {
        this.boundingBox = new THREE.Box3().setFromObject(this.textMesh);
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.textMesh); // Recalculer la bounding box si nécessaire
    }
}
