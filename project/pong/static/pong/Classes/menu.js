import { THREE } from '../three.module.js';
import { FontLoader } from '../FontLoader.js';
import { Text3d } from './text3d.js';
import { BouncingBallInCube } from './background.js';
import { TournamentMenu } from './Tournament.js';
import { Shop } from './Shop.js'
import { ModalManager } from './ModalManager.js'
import { TWEEN } from '../three.module.js';

export class Menu {
    constructor(threeRoot, socketManager) {
        this.threeRoot = threeRoot;
        this.scene = threeRoot.scene;
        this.camera = threeRoot.camera;
        this.renderer = threeRoot.renderer;
        this.socketManager = socketManager;
        this.menuGroup = new THREE.Group();

        this.modalManager = new ModalManager();
        this.formSubmittedSuccessfully = false;

        this.mouseControlEnabled = true;
        this.canvasBounds = this.threeRoot.renderer.domElement.getBoundingClientRect();
        this.showMenuEnabled = true;

        this.tweenCameraToItem();

        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.fontLoader = new FontLoader();
        this.menuItems = [];
        this.currentSelectedIndex = 0;
        this.shop = null;
        this.options = null;

        this.onMouseMoveBound = this.onMouseMove.bind(this);
        this.onMouseClickBound = this.onMouseClick.bind(this);
        this.onKeyDownBound = this.onKeyDown.bind(this);

        this.colorPalette = [
            new THREE.Color(0xff00c1),
            new THREE.Color(0x9600ff),
            new THREE.Color(0x4900ff),
            new THREE.Color(0x00b8ff),
            new THREE.Color(0x00fff9),
            new THREE.Color(0x00ff83)
        ];

        this.fontLoader.load(
            './static/assets/LEMON_MILK_Regular.json',
            (font) => {
                this.font = font;
                this.createMenuItems();
                this.background = new BouncingBallInCube(2500, 19, threeRoot, this.menuGroup);
                threeRoot.addAnimatedObject(this.background);
            },
            undefined,
            (error) => {
                console.error('An error occurred loading the font:', error);
            }
        );

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(500, -500, 1000);
        this.directionalLight.castShadow = true;
        this.menuGroup.add(this.directionalLight);
        this.menuGroup.add(this.directionalLight.target);
        this.matchmakingAnimation = new MatchmakingAnimation(this.threeRoot, this.socketManager, this);

        this.scene.add(this.menuGroup);
        threeRoot.addAnimatedObject(this);

        this.show();
        if (this.isMobile()) {
            this.mouseControlEnabled = false;
        }
    }

    tweenCameraToItem() {
        this.threeRoot.tweenCamera({
            fov: 60,
            near: 0.5,
            far: 3000,
            position: { x: 0, y: -1000, z: 0 },
            lookAt: { x: 0, y: 0, z: 0 }
        }, 2000);
    }
    isMobile() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    async handleTournamentSubmit(event) {
        let form = document.getElementById('newTournamentForm');
        let formData = new FormData(form);

        let jsonObject = {};
        for (const [key, value] of formData.entries()) {
            jsonObject[key] = value;
        }

        const response = await sendJSON('/database/newTournament', jsonObject);

        const obj = JSON.parse(response);
        if (obj.status.localeCompare('success') == 0) {
            this.modalManager.closeModal();
            this.formSubmittedSuccessfully = true;
            this.newLocalTournament(obj.t_id);
        }
        else if (obj.status.localeCompare('failure') == 0) {
            const newDiv = document.getElementById('form_error');
            newDiv.innerHTML = obj.reason;
            newDiv.style.color = "red";
        }
    }
    async handleNewGameSubmit(event) {
        let form = document.getElementById('newGameForm');
        let formData = new FormData(form);
        console.log('formData: ', formData);

        let jsonObject = {};
        for (const [key, value] of formData.entries()) {
            jsonObject[key] = value;
        }

        const response = await sendJSON('/database/newGame', jsonObject);
        console.log("Response: ", response);

        const obj = JSON.parse(response);
        if (obj.status.localeCompare('success') == 0) {
            this.modalManager.closeModal();
            this.formSubmittedSuccessfully = true;
            this.newLocalGame(obj.game_ws_id);
        }
    }
    async handleOptionsSubmit(event) {
        let form = document.getElementById('newOptionsForm');
        let farmData = new FormData(form);
    }
    createMenuItems() {
        this.localMenuMain = new MenuItem(this.menuGroup, this.scene, this.camera, this.font, 'Local', this.colorPalette[0], new THREE.Vector3(0, 0, 380), () => {
            this.formSubmittedSuccessfully = false;
            this.disableEventListener();
            this.modalManager.openModal('modalNewGame', this.handleNewGameSubmit.bind(this), this);
            //this.newLocalGame();
        });
        this.matchmakingMenuMain = new MenuItem(this.menuGroup, this.scene, this.camera, this.font, 'Matchmaking', this.colorPalette[1], new THREE.Vector3(0, 0, 180), () => {
            console.log("Clicked On: Matchmaking");
            this.hideText();
            this.matchmakingAnimation.show();
            this.socketManager.setType('matchmaking');
        });
        this.localTournamentMenuMain = new MenuItem(this.menuGroup, this.scene, this.camera, this.font, 'Local Tournament', this.colorPalette[2], new THREE.Vector3(0, 0, -20), () => {
            this.formSubmittedSuccessfully = false;
            console.log("Clicked On: Local Tournament");
            this.disableEventListener();
            this.modalManager.openModal('modalNewTournament', this.handleTournamentSubmit.bind(this), this);
        });
        this.tournamentMenuMain = new MenuItem(this.menuGroup, this.scene, this.camera, this.font, 'Tournament', this.colorPalette[3], new THREE.Vector3(0, 0, -220), () => {
        });
        this.shopMenuMain = new MenuItem(this.menuGroup, this.scene, this.camera, this.font, 'Shop', this.colorPalette[4], new THREE.Vector3(0, 0, -440), () => {
            this.newShop();
        });
        this.optionsMenuMain = new MenuItem(this.menuGroup, this.scene, this.camera, this.font, 'Options', this.colorPalette[5], new THREE.Vector3(0, 0, -640), () => {

        });

        this.menuItems = [
            this.localMenuMain,
            this.matchmakingMenuMain,
            this.localTournamentMenuMain,
            this.tournamentMenuMain,
            this.shopMenuMain,
            this.optionsMenuMain
        ];
    }

    show() {
        this.menuItems.forEach(item => {
            item.textMesh.visible = true;
            item.textGlowTextMesh.visible = true;
        });
        if (this.background) {
            this.background.show();
        }
        if (this.directionalLight) {
            this.directionalLight.visible = true;
        }
        setTimeout(() => {
            this.enableEventListener();
        }, 1500);
    }

    hide() {
        this.disableEventListener();

        this.menuItems.forEach(item => {
            item.textMesh.visible = false;
            item.textGlowTextMesh.visible = false;
            item.removePaddles();
        });
        if (this.background) {
            this.background.hide();
        }
        if (this.directionalLight) {
            this.directionalLight.visible = false;
        }
    }
    hideText() {
        this.disableEventListener();

        this.menuItems.forEach(item => {
            item.textMesh.visible = false;
            item.textGlowTextMesh.visible = false;
            item.removePaddles();
        });
        if (this.directionalLight) {
            this.directionalLight.visible = false;
        }
    }
    disableEventListener() {
        window.removeEventListener('mousemove', this.onMouseMoveBound, false);
        window.removeEventListener('click', this.onMouseClickBound, false);
        window.removeEventListener('keydown', this.onKeyDownBound, false);
    }
    enableEventListener() {
        window.addEventListener('mousemove', this.onMouseMoveBound, false);
        window.addEventListener('click', this.onMouseClickBound, false);
        window.addEventListener('keydown', this.onKeyDownBound, false);
    }

    onMouseMove(event) {

        this.mouse.x = ((event.clientX - this.canvasBounds.left) / this.canvasBounds.width) * 2 - 1;
        this.mouse.y = -((event.clientY - this.canvasBounds.top) / this.canvasBounds.height) * 2 + 1;

        const maxRotationX = Math.PI / 4;
        const maxRotationY = Math.PI / 4;
        const targetRotationX = this.mouse.x * maxRotationX;
        const targetRotationY = this.mouse.y * maxRotationY;

        if (this.mouseControlEnabled) {
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
            this.camera.rotateY(-targetRotationX);
            this.camera.rotateX(targetRotationY);
        }

        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = [];
        this.menuItems.forEach(item => {
            item.updateBoundingBox();
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
            selectedItem.onClick();
        }
    }
    
    onKeyDown(event) {
        // event.preventDefault(); // Empêche le comportement par défaut (scrolling)
        // if (event.key === 'c') {
            //     this.mouseControlEnabled = !this.mouseControlEnabled;  // Basculer l'état du mouvement de la caméra
            // }
            // if (event.key === 'h') {
                //     if (this.showMenuEnabled) {
                    //         this.hide();
                    //     } else {
                        //         this.show();
                        //     }
                        //     this.showMenuEnabled = !this.showMenuEnabled;  // Basculer l'état de l'affichage du menu
                        // }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.navigateMenu(1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.navigateMenu(-1);
        } else if (event.key === 'Enter') {
            this.selectCurrentItem();
        }
    }
    navigateMenu(direction) {
        // this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.menuItems.forEach(item => item.removePaddles());
        
        this.currentSelectedIndex = (this.currentSelectedIndex + direction + this.menuItems.length) % this.menuItems.length;
        
        this.menuItems[this.currentSelectedIndex].addPaddles();
    }
    selectCurrentItem() {
        const currentItem = this.menuItems[this.currentSelectedIndex];
        currentItem.onClick();
    }
    render() {
        // this.renderer.render(this.scene, this.camera);
    }

    newLocalGame(customGameId) {
        this.socketManager.connectCustomGame(customGameId);
        this.hide();
    }

    newLocalTournament(t_id) {
        if (this.tournamentLocal !== undefined) {
            this.tournamentLocal.destroy();
        }
        this.hideText();
        this.threeRoot.updateCameraSettings({
            fov: 60,
            near: 0.5,
            far: 3000,
            position: { x: 0, y: -1000, z: 0 },
            lookAt: { x: 0, y: 0, z: 0 }
        }, 2000);
        this.tournamentLocal = new TournamentMenu(this.threeRoot, this.background, this.socketManager, t_id, this);
    }
    newShop() {
        this.hideText();
        this.threeRoot.updateCameraSettings({
            fov: 60,
            near: 0.5,
            far: 3000,
            position: { x: 0, y: -1000, z: 0 },
            lookAt: { x: 0, y: 0, z: 0 }
        }, 2000);
        if (!this.shop) {
            this.shop = new Shop(this.threeRoot, this.socketManager);
        } else {
            this.shop.show();
        }
        this.shop.tweenCameraToItem();
    }
    returnToMenu() {
        this.show();
    }
}

class MenuItem {
    constructor(group, scene, camera, font, text, color, position, onClick) {
        this.groupRef = group;
        this.scene = scene;
        this.camera = camera;
        this.font = font;
        this.position = position;
        this.onClick = onClick; // Fonction de callback pour le clic
        this.paddles = [];

        this.createText(text, color);
        this.createBoundingBox();
    }

    createText(text, color) {
        this.text3d = new Text3d(this.camera, this.scene, this.font, 100, 25, color, text, 1.02, this.position, new THREE.Vector3(Math.PI / 2, 0, 0));
        this.text3d.addToGroup(this.groupRef);
        this.textMesh = this.text3d.mesh;
        this.textGlowTextMesh = this.text3d.glowTextMesh;
        this.text3d.setPosition(this.position);
    }

    createBoundingBox() {
        this.boundingBox = new THREE.Box3().setFromObject(this.textMesh);
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.textMesh); // Recalculer la bounding box si nécessaire
    }

    addPaddles() {
        const paddleSize = new THREE.Vector3();
        paddleSize.x = 15;
        paddleSize.y = this.boundingBox.max.y - this.boundingBox.min.y;
        paddleSize.z = this.boundingBox.max.z - this.boundingBox.min.z - 15;
        const paddleGeometry = new THREE.BoxGeometry(paddleSize.x, paddleSize.y, paddleSize.z);
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                "c": { type: "f", value: 1.0 },
                "p": { type: "f", value: 1.4 },
                glowColor: { type: "c", value: new THREE.Color({ color: 0xffffff }) },
                viewVector: { type: "v3", value: this.camera.position }
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
                    gl_FragColor = vec4( glow, 0.9 );
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        const leftPaddle = new THREE.Mesh(paddleGeometry, shaderMaterial);
        leftPaddle.position.set(this.boundingBox.min.x - 50, this.position.y - 80, this.position.z + paddleSize.z / 2);
        this.groupRef.add(leftPaddle);

        const rightPaddle = new THREE.Mesh(paddleGeometry, shaderMaterial);
        rightPaddle.position.set(this.boundingBox.max.x + 50, this.position.y - 80, this.position.z + paddleSize.z / 2);
        this.groupRef.add(rightPaddle);
        this.paddles.push(leftPaddle, rightPaddle);
    }

    removePaddles() {
        this.paddles.forEach(paddle => this.groupRef.remove(paddle));
        this.paddles = [];
    }
}

export class BackToMainMenu {
    constructor(threeRoot, socketManager, toDestroy, type, menu) {
        this.threeRoot = threeRoot;
        this.socketManager = socketManager;
        this.group = new THREE.Group();
        this.isVisible = false;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.onMouseClickBound = this.onMouseClick.bind(this);
        this.handleEscapeBound = this.handleEscape.bind(this);
        this.toDestroy = toDestroy;
        this.type = type;
        this.menuToGoBack = menu;

        this.createBackToMenuText();

        this.setVisibility(false);
    }
    initListener() {
        document.addEventListener('keydown', this.handleEscapeBound, false);
    }
    handleEscape(event) {
        if (event.code === 'Escape') {
            this.toggleVisibility();
        }
    }
    destroyListener() {
        document.removeEventListener('keydown', this.handleEscapeBound, false);
    }
    createBackToMenuText() {
        const fontLoader = new FontLoader();
        fontLoader.load(
            './static/assets/LEMON_MILK_Regular.json',
            (font) => {
                let position;
                if (this.type == 'game') {
                    position = new THREE.Vector3(-160, -450, 0);
                } else {
                    position = new THREE.Vector3(-220, -450, 200);
                }
                this.backText = new Text3d(
                    this.threeRoot.camera,
                    this.threeRoot.scene,
                    font,
                    35,
                    15,
                    0xff00c1,
                    'Back to Menu ?',
                    1.01,
                    position
                );
                this.createBoundingBox();
                this.backText.addToGroup(this.group);
                this.group.position.x += 200;
            },
            undefined,
            (error) => {
                console.error('Error loading font:', error);
            }
        );
    }
    createBoundingBox() {
        this.boundingBox = new THREE.Box3().setFromObject(this.backText.mesh);
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.backText.mesh);
    }
    addToScene(scene) {
        scene.add(this.group);
    }

    setVisibility(visible) {
        this.group.visible = visible;
        this.isVisible = visible;
    }

    toggleVisibility() {
        this.setVisibility(!this.isVisible);
        if (this.isVisible && this.backText) {
            this.backText.alignTextWithCamera();
            this.enableClicks();
        } else {
            this.disableClicks();
        }
    }
    disableClicks() {
        document.removeEventListener('click', this.onMouseClickBound, false);
    }

    enableClicks() {
        document.addEventListener('click', this.onMouseClickBound, false);
    }
    onMouseClick(event) {
        const canvasBounds = this.threeRoot.renderer.domElement.getBoundingClientRect();

        this.mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
        this.mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.threeRoot.camera);
        const intersects = this.raycaster.intersectObjects(this.group.children, true);

        if (intersects.length > 0) {
            this.handleBackToMenuClick();
        }
    }
    handleBackToMenuClick() {
        this.destroyListener();
        this.setVisibility(false);
        if (this.type == 'game') {
            this.socketManager.clearGame();
        }
        if (this.type == 'tournament') {
            this.toDestroy.destroy();
            this.menuToGoBack.show();
        }
    }
}

class MatchmakingAnimation {
    constructor(threeRoot, socketManager, menu) {
        this.threeRoot = threeRoot;
        this.group = new THREE.Group();
        this.rotationTween = null;
        this.escListenerBound = this.handleEscape.bind(this);
        this.menu = menu;
        this.socketManager = socketManager;
        
        this.createMatchmakingText();        
    }
    createMatchmakingText() {
        const fontLoader = new FontLoader();
        fontLoader.load(
            './static/assets/LEMON_MILK_Regular.json',
            (font) => {
                this.backText = new Text3d(
                    this.threeRoot.camera,
                    this.threeRoot.scene,
                    font,
                    100,   // Font size
                    25,   // Depth
                    0x9600ff,   // Color
                    'Matchmaking',  // Text content
                    1.02,  // Glow size
                    new THREE.Vector3(0, 0, 0)
                );
                this.backText.addToGroup(this.group);
                this.group.position.set(0 , 0, 180);
                this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
                this.directionalLight.position.set(500, -500, 1000);
                this.directionalLight.castShadow = true;
                // this.scene.add(this.directionalLight);
                // this.scene.add(this.directionalLight.target);
                this.group.add(this.directionalLight);
                this.group.add(this.directionalLight.target);
                this.group.visible = false;
                this.threeRoot.scene.add(this.group);
            },
            undefined,
            (error) => {
                console.error('Error loading font:', error);
            }
        );
    }
    show() {
        this.group.visible = true;
        document.addEventListener('keydown', this.escListenerBound, false);
        this.startRotation();
    }
    hide() {
        this.group.visible = false;
        document.removeEventListener('keydown', this.escListenerBound, false);
        this.socketManager.close();
        this.socketManager.type = null;
        this.stopRotation();
    }
    handleEscape(event) {
        if (event.key === 'Escape') {
            this.menu.show();
            this.hide();
        }
    }
    startRotation() {
        const targetRotation = { x: this.group.rotation.x + Math.PI * 2 };

        this.rotationTween = new TWEEN.Tween(this.group.rotation)
            .to(targetRotation, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                this.group.rotation.x = this.group.rotation.x % (Math.PI * 2);
            })
            .repeat(Infinity)
            .start();
    }
    stopRotation() {
        if (this.rotationTween) {
            this.rotationTween.stop();
        }
    }
}