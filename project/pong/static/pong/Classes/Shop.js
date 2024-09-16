import { THREE } from '../three.module.js';
import { FontLoader } from '../FontLoader.js';
import { TWEEN } from '../three.module.js';

export class Shop {
    constructor(threeRoot, socketManager) {
        this.threeRoot = threeRoot;
        this.socketManager = socketManager;
        this.canvasBounds = this.threeRoot.renderer.domElement.getBoundingClientRect();
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.paddles = [];
        this.textureLoader = new THREE.TextureLoader();
        this.fontLoader = new FontLoader();
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseClick = this.onMouseClick.bind(this);

        this.shopSize = 1500;
        this.paddleWidth = 50;
        this.paddleHeight = 250;
        this.initializeShop();

    }
    tweenCameraToItem() {
        this.threeRoot.tweenCamera({
            fov: 60,
            near: 0.5,
            far: 3000,
            position: { x: 0, y: 0, z: 1000 },
            lookAt: { x: 0, y: 0, z: 0 }
        }, 2000);
    }
    initializeShop() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.threeRoot.scene.add(this.ambientLight);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(0, 500, 1000);
        this.threeRoot.scene.add(this.directionalLight);
        const paddlePositions = this.calculatePaddlePositions(3);
        const textures = [
            './static/assets/textures/texture1.jpg',
            './static/assets/textures/texture2.jpg',
            './static/assets/textures/texture3.png'
        ];
        this.fontLoader.load(
            './static/assets/LEMON_MILK_Regular.json',
            (font) => {
                this.font = font;
                paddlePositions.forEach((position, index) => {
                    const paddle = new ShopPaddle(this.threeRoot, textures[index], position, `paddle_${index}`, this.paddleWidth, this.paddleHeight);
                    this.paddles.push(paddle);
                });
                this.enableInteraction();
            },
            undefined,
            (error) => {
                console.error('An error occurred loading the font:', error);
            }
        );
    }
    enableInteraction() {
        window.addEventListener('mousemove', this.onMouseMove, false);
        window.addEventListener('click', this.onMouseClick, false);
    }
    calculatePaddlePositions(numPaddles) {
        const positions = [];
        const spacing = this.shopSize / (numPaddles + 1);
        for (let i = 0; i < numPaddles; i++) {
            const x = (i + 1) * spacing - this.shopSize / 2;
            const y = 0;
            const z = 0;
            positions.push({ x, y, z });
        }
        return positions;
    }

    onMouseMove(event) {
        this.mouse.x = ((event.clientX - this.canvasBounds.left) / this.canvasBounds.width) * 2 - 1;
        this.mouse.y = -((event.clientY - this.canvasBounds.top) / this.canvasBounds.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.threeRoot.camera);
        const intersects = this.raycaster.intersectObjects(this.paddles.map(p => p.clickablePlane));
        this.paddles.forEach(paddle => paddle.onHoverOut());
        if (intersects.length > 0) {
            const hoveredPaddle = this.paddles.find(p => p.clickablePlane === intersects[0].object);
            if (hoveredPaddle) {
                hoveredPaddle.onHover();
            }
        }
    }

    onMouseClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.threeRoot.camera);
        const intersects = this.raycaster.intersectObjects(this.paddles.map(p => p.clickablePlane));

        if (intersects.length > 0) {
            const clickedPaddle = this.paddles.find(p => p.clickablePlane === intersects[0].object);
            if (clickedPaddle) {
                clickedPaddle.onClick();
            }
        }
    }

    show() {
        window.addEventListener('mousemove', this.onMouseMove, false);
        window.addEventListener('click', this.onMouseClick, false);
        this.paddles.forEach(paddle => {
            paddle.setVisibility(true);
        });
    }
    hide() {
        window.removeEventListener('mousemove', this.onMouseMove, false);
        window.removeEventListener('click', this.onMouseClick, false);
        this.paddles.forEach(paddle => {
            paddle.setVisibility(false);
        });
    }
}

class ShopPaddle {
    constructor(threeRoot, textureUrl, position, id, paddleWidth, paddleHeight) {
        this.id = id;
        this.isClickable = true;
        this.isHovering = false;
        const texture = new THREE.TextureLoader().load(textureUrl);
        const material = new THREE.MeshStandardMaterial({ map: texture });
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleWidth / 2), material);
        this.mesh.position.copy(position);
        const planeGeometry = new THREE.PlaneGeometry(paddleWidth + 50, paddleHeight + 50);
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 });
        this.clickablePlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.clickablePlane.position.copy(position);
        const buyPlaneGeometry = new THREE.PlaneGeometry(paddleWidth + 50, paddleHeight + 50);
        const buyPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 });
        this.buyClickablePlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.buyClickablePlane.position.copy(position);
        this.group = new THREE.Group();
        this.group.add(this.mesh);
        this.group.add(this.clickablePlane);
        this.addToScene(threeRoot.scene);
    }

    setVisibility(visible) {
        this.group.visible = visible;
    }

    setOpacity(opacity) {
        this.clickablePlane.material.opacity = opacity;
    }

    onClick() {
        console.log(`Paddle ${this.id} clicked!`);
    }
    onHover() {
        if (!this.isHovering) {
            this.isHovering = true;
            new TWEEN.Tween(this.mesh.rotation)
                .to({ y: this.mesh.rotation.y + Math.PI * 2 }, 5000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onComplete(() => {
                    this.isHovering = false;
                })
                .start();
        }
    }
    onHoverOut() {
    }
    addToScene(scene) {
        scene.add(this.group);
    }
    removeFromScene(scene) {
        scene.remove(this.group);
    }
}
