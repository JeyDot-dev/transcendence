import { THREE } from '../three.module.js';
import { FontLoader } from '../FontLoader.js';
import { Text3d } from './text3d.js';


export class Shop {
    constructor(threeRoot, socketManager) {
        this.threeRoot = threeRoot;
        this.socketManager = socketManager;
        this.canvasBounds = this.threeRoot.renderer.domElement.getBoundingClientRect();
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.fontLoader = new FontLoader();
    }

    onMouseMove(event) {
        // if (!this.mouseControlEnabled) return;  // Désactiver le mouvement de la caméra si la souris est désactivée

        this.mouse.x = ((event.clientX - this.canvasBounds.left) / this.canvasBounds.width) * 2 - 1;
        this.mouse.y = -((event.clientY - this.canvasBounds.top) / this.canvasBounds.height) * 2 + 1;

        // CAMERA
        const maxRotationX = Math.PI / 4;
        const maxRotationY = Math.PI / 4;
        const targetRotationX = this.mouse.x * maxRotationX;
        const targetRotationY = this.mouse.y * maxRotationY;

        if (this.mouseControlEnabled) {
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
            this.camera.rotateY(-targetRotationX); // Appliquer la rotation autour de l'axe Y
            this.camera.rotateX(targetRotationY);
        }

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

        // Ajouter les paddles aux éléments survolés
        this.menuItems.forEach(item => item.removePaddles());
        if (intersects.length > 0) {
            const selectedItem = intersects[0];
            selectedItem.addPaddles();
        }
    }

    onMouseClick(event) {
        // this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        // this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

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
}