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
        this.paddles = [];
        this.textureLoader = new THREE.TextureLoader();

        this.initializeShop();
    }

    // Initialize the shop by creating paddle objects
    initializeShop() {
        const paddlePositions = [
            { x: -2, y: 0, z: 0 },
            { x: 0, y: 0, z: 0 },
            { x: 2, y: 0, z: 0 }
        ];

        const textures = [
            this.textureLoader.load('./static/assets/textures/texture1.jpg'),
            this.textureLoader.load('./static/assets/textures/texture2.jpg'),
            this.textureLoader.load('./static/assets/textures/texture3.jpg')
        ];
        this.fontLoader.load(
            './static/assets/LEMON_MILK_Regular.json',
            (font) => {
                this.font = font;
                paddlePositions.forEach((position, index) => {
                    const paddle = new ShopPaddle(this.threeRoot, textures[index], position, `paddle_${index}`);
                    this.paddles.push(paddle);
                });
            },
            undefined,
            (error) => {
                console.error('An error occurred loading the font:', error);
            }
        );
    }

    // Handle mouse movement for hover effects
    onMouseMove(event) {
        this.mouse.x = ((event.clientX - this.canvasBounds.left) / this.canvasBounds.width) * 2 - 1;
        this.mouse.y = -((event.clientY - this.canvasBounds.top) / this.canvasBounds.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.threeRoot.camera);
        const intersects = this.raycaster.intersectObjects(this.paddles.map(p => p.clickableZone));

        // Reset hover effect for all paddles
        this.paddles.forEach(paddle => paddle.onHoverOut());

        if (intersects.length > 0) {
            const hoveredPaddle = this.paddles.find(p => p.clickableZone === intersects[0].object);
            if (hoveredPaddle) {
                hoveredPaddle.onHover();
            }
        }
    }

    // Handle mouse click events
    onMouseClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.threeRoot.camera);
        const intersects = this.raycaster.intersectObjects(this.paddles.map(p => p.clickableZone));

        if (intersects.length > 0) {
            const clickedPaddle = this.paddles.find(p => p.clickableZone === intersects[0].object);
            if (clickedPaddle) {
                clickedPaddle.onClick();
            }
        }
    }
}

class ShopPaddle {
    constructor(id, textureUrl, position, price, font) {
        this.id = id;
        this.price = price;
        this.isClickable = true;

        const texture = new THREE.TextureLoader().load(textureUrl);
        const material = new THREE.MeshStandardMaterial({ map: texture });
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 0.5), material);

        this.mesh.position.copy(position);

        const planeGeometry = new THREE.PlaneGeometry(1.5, 3.5);
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
        this.clickablePlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.clickablePlane.position.copy(position);
        this.clickablePlane.userData = { id: this.id };

        this.group = new THREE.Group();
        this.group.add(this.mesh);
        this.group.add(this.clickablePlane);
    }

    setVisibility(visible) {
        this.group.visible = visible;
    }

    setPrice(newPrice) {
        this.price = newPrice;
    }

    setOpacity(opacity) {
        this.clickablePlane.material.opacity = opacity;
    }

    handleClick() {
        if (this.isClickable) {
            console.log(`Paddle ${this.id} clicked! Price: ${this.price}`);
            // Add logic for purchasing, etc.
        }
    }

    addToScene(scene) {
        scene.add(this.group);
    }

    removeFromScene(scene) {
        scene.remove(this.group);
    }
}