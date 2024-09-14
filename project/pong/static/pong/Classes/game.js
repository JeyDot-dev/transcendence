// import * as THREE from '../threejs/Three.js';
// import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { THREE } from '../three.module.js';
import { Paddle } from './paddle.js';
import { Arena } from './arena.js';
import { Puck } from './puck.js';
import { FontLoader } from '../FontLoader.js';
import { Text3d } from './text3d.js';
import { TournamentMenu } from './Tournament.js';
import { BackToMainMenu } from './menu.js';

export class Game {
    constructor(threeRoot, gameData, socketManager) {
        this.threeRoot = threeRoot;
        this.scene = threeRoot.scene;
        this.camera = threeRoot.camera;
        this.renderer = threeRoot.renderer;
        this.composer = threeRoot.composer;
        this.socketManager = socketManager;
        console.log('gameData: ', gameData);
        this.playerId = 0;
        this.pressedKeys = [];
        this.paddles = [];
        this.offSet = new THREE.Vector2(gameData.width / 2, gameData.height / 2);
        this.gameGroup = new THREE.Group();
        this.isPaused = gameData.isPaused;
        this.handleKeyDownBound = this.handleKeyDown.bind(this);
        this.handleKeyUpBound = this.handleKeyUp.bind(this);

        this.colorPalette = [
            new THREE.Color(0xff00c1),
            new THREE.Color(0x9600ff),
            new THREE.Color(0x4900ff),
            new THREE.Color(0x00b8ff),
            new THREE.Color(0x00fff9)
        ];

        this.timeText = null;
        this.p1Text = null;
        this.p2Text = null;

        console.log("Init Arena:", gameData.width, gameData.height);
        this.initArena(gameData.width, gameData.height);
        console.log("Init Lightning");
        this.initLighting();
        console.log("Init Text");
        this.initText(gameData.score, gameData.timer);
        console.log("Init Ball");
        this.initBall(gameData.ball);
        console.log("Init Paddles: ", gameData.players);
        this.initPaddles(gameData.players);
        console.log("Init Player Name: ", gameData.playerNames);
        this.initPlayerName(gameData.playerNames);

        console.log('Init Physics');
        this.initPhysics(gameData);
        this.threeRoot.addAnimatedObject(this);
        console.log('Init Back to main menu');
        this.initBackToMainMenu();
        console.log("Init Input Handling");
        this.initInputHandling();
        console.log("End of Game constructor")
        this.scene.add(this.gameGroup);
        this.tweenCameraToItem();
    }
    tweenCameraToItem() {
        this.threeRoot.tweenCamera({
            fov: 60,
            near: 0.5,
            far: 3000,
            position: { x: 0, y: -500, z: 1000 },
            lookAt: { x: 0, y: 0, z: 0 }
        }, 2000).then(() => {
            this.p1Text.alignTextWithCamera();
            this.p2Text.alignTextWithCamera();
            this.timeText.alignTextWithCamera();
            this.p1NameText.alignTextWithCamera();
            this.p2NameText.alignTextWithCamera();
        });
    }
    initArena(width, height) {
        this.arena = new Arena(width, 25, height, this.colorPalette[3], this.colorPalette[0], 25, 25, 0xde95d0);
        this.arena.addToGroup(this.gameGroup);
    }

    initLighting() {
        const ambientLight = new THREE.AmbientLight(this.colorPalette, 0.1);

        // Light 1
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight1.position.set(-400, 0, 800);
        directionalLight1.castShadow = true;
        const targetObject1 = new THREE.Object3D();
        targetObject1.position.set(400, 0, 0);
        directionalLight1.target = targetObject1;
        directionalLight1.target.updateMatrixWorld();     
        this.gameGroup.add(directionalLight1);
        this.gameGroup.add(targetObject1);

        // Light 2
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight2.position.set(400, 0, 800);
        directionalLight2.castShadow = true;
        const targetObject2 = new THREE.Object3D();
        targetObject2.position.set(-400, 0, 0);
        directionalLight2.target = targetObject2;
        directionalLight2.target.updateMatrixWorld();     

        this.gameGroup.add(directionalLight2);
        this.gameGroup.add(targetObject2);

        this.gameGroup.add(ambientLight);
    }

    initText(score, timer) {
        const fontLoader = new FontLoader();
        fontLoader.load(
            './static/assets/LEMON_MILK_Regular.json',
            (font) => {
                this.timeText = new Text3d(
                    this.camera,
                    this.scene,
                    font,
                    105,
                    10,
                    0xffffff,
                    timer.toString(),
                    1.05,
                    new THREE.Vector3(0, 285, 300)
                );
                this.p1Text = new Text3d(this.camera, this.scene, font, 100, 25, this.colorPalette[4], score[0].toString(), 1.05,
                    new THREE.Vector3(-200, 300, 300)
                );
                this.p2Text = new Text3d(this.camera, this.scene, font, 100, 25, this.colorPalette[1], score[1].toString(), 1.05,
                    new THREE.Vector3(200, 300, 300)
                );
                this.timeText.addToGroup(this.gameGroup);
                this.p1Text.addToGroup(this.gameGroup);
                this.p2Text.addToGroup(this.gameGroup);
            },
            undefined, // onProgress callback (optional)
            (error) => {
                console.error('An error occurred loading the font:', error);
            }
        );
    }

    initBall(ball_param) {
        console.log("Ball Param: ", ball_param);
        this.ball = new Puck(
            ball_param.size,
            ball_param.size,
            ball_param.color,
            0,
            0,
            new THREE.Vector2(ball_param.speed, ball_param.speed),
            this.camera
        );
        this.ball.addToGroup(this.gameGroup);
        console.log('Ball Param init ball: ', ball_param);

    }

    initPaddles(playersParam) {
        console.log("----Paddles Params of type: ", typeof playersParam);
        playersParam.forEach(element => {
            console.log("Player:", element);
            const newPaddle = new Paddle(
                element.width,
                element.height,
                0xffffff,
                element.position[0] - this.offSet.x,
                element.position[1] - this.offSet.y,
                element.id
            );
            newPaddle.addToGroup(this.gameGroup);
            this.paddles.push(newPaddle);
        });

    }

    initPlayerName(playerNames) {
        const fontLoader = new FontLoader();
        fontLoader.load(
            './static/assets/LEMON_MILK_Regular.json',
            (font) => {
                this.p1NameText = new Text3d(this.camera, this.scene, font, 35, 10, this.colorPalette[4], playerNames[0], 1.05,
                    new THREE.Vector3(-600, 300, 300)
                );
                this.p2NameText = new Text3d(this.camera, this.scene, font, 35, 10, this.colorPalette[1], playerNames[1], 1.05,
                    new THREE.Vector3(600, 300, 300)
                );
                this.p1NameText.addToGroup(this.gameGroup);
                this.p2NameText.addToGroup(this.gameGroup);
                // this.p1NameText.alignTextWithCamera();
                // this.p2NameText.alignTextWithCamera();
            },
            undefined, // onProgress callback (optional)
            (error) => {
                console.error('An error occurred loading the font:', error);
            }
        );
    }
    initBackToMainMenu() {
        this.backToMainMenu = new BackToMainMenu(this.threeRoot, this.socketManager, this, 'game');
        this.backToMainMenu.addToScene(this.scene);
        this.backToMainMenu.initListener();
    }
    changePlayerName(playerNameOne, playerNameTwo) {
        this.p1NameText.updateText(playerNameOne);
        this.p2NameText.updateText(playerNameTwo);
    }
    handleKeyDown(event) {
        const key = event.key.toLowerCase();

        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'space'].includes(event.key.toLowerCase())) {
            event.preventDefault(); // Empêche le comportement par défaut (scrolling)
        }
        if (event.code === 'Space') {
            console.log('keydown: space');
            this.socketManager.sendMessage({ type: 'keydown', key: 'space', who: 0 });
            return;
        }
        if (!this.pressedKeys[key]) {
            this.pressedKeys[key] = true; 
            
            if (['w', 's'].includes(key)) {
                console.log('keydown: w s');
                this.socketManager.sendMessage({ type: 'keydown', key: key, who: 0 });
            }
            if (['arrowup', 'arrowdown'].includes(key)) {
                console.log('keydown: arrow');
                this.socketManager.sendMessage({ type: 'keydown', key: key, who: 1 });
            }
        }
        if (['k'].includes(key)) {
            console.log('Close WebSocket with key K');
            this.socketManager.reconnect();
        }
    }
    handleKeyUp(event) {
        const key = event.key.toLowerCase();

        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'space'].includes(event.key.toLowerCase())) {
            event.preventDefault();
        }
        if (event.code === 'Space') {
            console.log('keyup: space');
            this.socketManager.sendMessage({ type: 'keyup', key: 'space', who: 0 });
            return;
        }
        if (this.pressedKeys[key]) {
            delete this.pressedKeys[key];

            if (['w', 's'].includes(key)) {
                console.log('keyup: w s');
                this.socketManager.sendMessage({ type: 'keyup', key: key, who: 0 });
            }
            if (['arrowup', 'arrowdown'].includes(key)) {
                console.log('keyup: arrow');
                event.preventDefault(); // Empêche le comportement par défaut (scrolling)
                this.socketManager.sendMessage({ type: 'keyup', key: key, who: 1 });
            }
        }
    }
    initInputHandling() {
        document.addEventListener('keydown', this.handleKeyDownBound, false);
        document.addEventListener('keyup', this.handleKeyUpBound, false);
        if (this.isMobile()) {
            this.addMobileControls();
        }
    }
    initPhysics(gameData) {
        this.ballPosition = new THREE.Vector3(gameData.ball.x - this.offSet.x, -gameData.ball.y + this.offSet.y, 0);
        this.velocityDelta = new THREE.Vector3(0, 0, 0); 
        this.ballVelocity = new THREE.Vector2(gameData.ball.vel_x, -gameData.ball.vel_y);  // inverse Y car y est inversé dans THREE.js
        this.ballSpeed = gameData.ball.speed;
        const fixedDeltaTime = 1.0 / 60;
        this.accumulator = 0.0;
        this.lastPhysicsTime = performance.now();
    
        // Interval for physics
        this.physics = setInterval(() => {
            const currentTime = performance.now();
            const deltaTime = (currentTime - this.lastPhysicsTime) / 1000;
            this.lastPhysicsTime = currentTime;
    
            // Accumulate the time passed
            this.accumulator += deltaTime;
    
            while (this.accumulator >= fixedDeltaTime) {
                this.updatePhysics(fixedDeltaTime);
                this.accumulator -= fixedDeltaTime;
            }
        }, 1000 / 60);
    }
    updatePhysics(fixedDeltaTime) {
        if (!this.isPaused) {
            if (!this.ballPosition) {
                this.ballPosition = this.cube.position.clone();
            }
        
            this.velocityDelta.set(this.ballVelocity.x, this.ballVelocity.y, 0);
            this.velocityDelta.multiplyScalar(this.ballSpeed * fixedDeltaTime);
        
            this.ballPosition.add(this.velocityDelta);
        }
    }
    stopPhysics() {
        clearInterval(this.physics);
        this.physics = null;
    }
    updateGame(game) {
        console.log('Update Game(Reconnection)', game.players);
        this.ball.move(game.ball.x - this.offSet.x, -game.ball.y + this.offSet.y);
        // console.log(game.score);
        game.players.forEach(element => {
            this.paddles[element.id].move(element.position[0] - this.offSet.x, -element.position[1] + this.offSet.y);
        });
        // this.timeText.updateText('0s');
        this.p1Text.updateText(game.score[0].toString(), this.gameGroup);
        this.p2Text.updateText(game.score[1].toString(), this.gameGroup);
    }

    wsMessageManager(data) {
        // console.log('wsMessageManager: ', data);
        switch (data.type) {
            case 'scoreChange0':
                this.p1Text.updateText(data.score[0].toString(), this.gameGroup);
                break;
            case 'scoreChange1':
                this.p2Text.updateText(data.score[1].toString(), this.gameGroup);
                break;
            case 'timerUpdate':
                this.timeText.setColor(0xffffff);
                this.timeText.updateText(data.timer.toString(), this.gameGroup);
                break;
            case 'ballMove':
                // DEPRECATED
                // -y Car dans three js y est orienter differement
                this.ball.move(data.ball.x - this.offSet.x, -data.ball.y + this.offSet.y);
                break;
            case 'refreshBallData':
                this.ball.move(data.ball.x - this.offSet.x, -data.ball.y + this.offSet.y);
                this.ballPosition = this.ball.mesh.position.clone();
                this.ballVelocity.set(data.ball.vel_x, -data.ball.vel_y);
                this.ballSpeed = data.ball.speed;
                break;
            case 'paddleMove':
                // -y Car dans three js y est orienter differement
                this.paddles[data.paddle.side].move(data.paddle.x - this.offSet.x, -data.paddle.y + this.offSet.y)
                break;
            case 'countdown':
                this.timeText.setColor(0xfd2892);
                this.timeText.updateText(data.value.toString(), this.gameGroup);
                break;
            case 'gamePaused':
                this.isPaused = data.status;
                if (data.ball) {
                    this.ball.move(data.ball.x - this.offSet.x, -data.ball.y + this.offSet.y);
                }
                console.log('Game state Pause: ', this.isPaused);
            default:
                break;
        }
        if (data.type != 'ballMove') {
            // console.log(data);
        }
        if (data.type == 'scoreChange0' || data.type == 'scoreChange') {
            console.log('New score Front end: ', data.score);
        }
    }

    updateAnimation() {
        if (this.timeText) {
            this.timeText.glowTextMesh.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(
                this.camera.position,
                this.timeText.glowTextMesh.position);
            this.p1Text.glowTextMesh.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(
                this.camera.position,
                this.p1Text.glowTextMesh.position);
            this.p2Text.glowTextMesh.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(
                this.camera.position,
                this.p2Text.glowTextMesh.position);
        }
        this.composer.render();
    }

    update() {
        if (this.physics && this.ballPosition) {
            this.ball.mesh.position.lerp(this.ballPosition, 0.5);
        }
    }

    gameIsPlayed() {
        // TODO: Gerer le retour au menu si dans un init ou dans un udpate game.isPlayed = true
    }

    destroy() {
        if (this.gameGroup) {
            this.gameGroup.children.forEach((child) => {
                this.gameGroup.remove(child);
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((material) => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            this.scene.remove(this.gameGroup);
        }
    
        document.removeEventListener('keydown', this.handleKeyDownBound, false);
        document.removeEventListener('keyup', this.handleKeyUpBound, false);
    
        const leftControls = document.getElementById('mobile-controls-left');
        const rightControls = document.getElementById('mobile-controls-right');
        if (leftControls) leftControls.remove();
        if (rightControls) rightControls.remove();
        
        if (this.socketManager) {
            this.socketManager.close(); // Ferme le socket si nécessaire
        }
        if (this.backToMainMenu) {
            this.backToMainMenu.destroyListener();
        }
        this.backToMainMenu.setVisibility(false);
        this.stopPhysics();
    }
    show() {
        console.log('Showing the game');
    
        this.gameGroup.visible = true;
    
        document.addEventListener('keydown', this.handleKeyDownBound, false);
        document.addEventListener('keyup', this.handleKeyUpBound, false);
    
        this.initPhysics();
        this.threeRoot.addAnimatedObject(this);
    }
    hide() {
        console.log('Hiding the game');
    
        this.gameGroup.visible = false;
    
        document.removeEventListener('keydown', this.handleKeyDownBound);
        document.removeEventListener('keyup', this.handleKeyUpBound);
    
        this.stopPhysics();
        this.threeRoot.removeAnimatedObject(this);
    }
    // TODO: Mobile
    isMobile() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    isScreenTooNarrow() {
        return window.innerWidth < 576; // Par exemple, 576px correspond au point de rupture "small" dans Bootstrap
    }
    
    toggleMobileControlsVisibility() {
        const leftControls = document.getElementById('mobile-controls-left');
        const rightControls = document.getElementById('mobile-controls-right');
    
        if (this.isScreenTooNarrow()) {
            if (leftControls) leftControls.style.display = 'none';
            if (rightControls) rightControls.style.display = 'none';
        } else {
            if (leftControls) leftControls.style.display = 'block';
            if (rightControls) rightControls.style.display = 'block';
        }
    }

    addMobileControls() {
        // Crée dynamiquement les boutons pour monter et descendre
        const leftControls = document.createElement('div');
        leftControls.id = 'mobile-controls-left';
        leftControls.innerHTML = `
            <div class="btn-group-vertical">
                <button id="btn-up-left" class="btn btn-primary btn-lg rounded-circle shadow">
                    <i class="bi bi-arrow-up"></i>
                </button>
                <button id="btn-down-left" class="btn btn-primary btn-lg rounded-circle shadow mt-3">
                    <i class="bi bi-arrow-down"></i>
                </button>
            </div>
        `;
        
        const rightControls = document.createElement('div');
        rightControls.id = 'mobile-controls-right';
        rightControls.innerHTML = `
            <div class="btn-group-vertical">
                <button id="btn-up-right" class="btn btn-success btn-lg rounded-circle shadow">
                    <i class="bi bi-arrow-up"></i>
                </button>
                <button id="btn-down-right" class="btn btn-success btn-lg rounded-circle shadow mt-3">
                    <i class="bi bi-arrow-down"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(leftControls);
        document.body.appendChild(rightControls);
        
        // Ajoute les styles pour positionner les boutons
        const style = document.createElement('style');
        style.innerHTML = `
            #mobile-controls-left, #mobile-controls-right {
                position: fixed;
                top: 50%;
                transform: translateY(-50%);
                z-index: 1000;
            }
            #mobile-controls-left {
                left: 20px;
            }
            #mobile-controls-right {
                right: 20px;
            }
            .btn {
                width: 70px;
                height: 70px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 32px;
                transition: transform 0.2s;
            }
            .btn:hover {
                transform: scale(1.1);
            }
            .btn i {
                font-size: 32px;
            }
        `;
        document.head.appendChild(style);
        
        // Vérification initiale de la visibilité des boutons
        this.toggleMobileControlsVisibility();

        // Écoute les changements de taille d'écran et ajuste les boutons
        window.addEventListener('resize', () => {
            this.toggleMobileControlsVisibility();
        });
        
        // Gestion des événements tactiles
        this.handleMobileControls();
    }
    
    
    
    handleMobileControls() {
        const handleTouchStart = (key, who) => {
            this.socketManager.sendMessage({ type: 'keydown', key: key, who: who });
        };
    
        const handleTouchEnd = (key, who) => {
            this.socketManager.sendMessage({ type: 'keyup', key: key, who: who });
        };
    
        // Ajoute les événements aux boutons
        document.getElementById('btn-up-left').addEventListener('touchstart', () => handleTouchStart('w', 0));
        document.getElementById('btn-down-left').addEventListener('touchstart', () => handleTouchStart('s', 0));
        document.getElementById('btn-up-right').addEventListener('touchstart', () => handleTouchStart('arrowup', 1));
        document.getElementById('btn-down-right').addEventListener('touchstart', () => handleTouchStart('arrowdown', 1));
    
        document.getElementById('btn-up-left').addEventListener('touchend', () => handleTouchEnd('w', 0));
        document.getElementById('btn-down-left').addEventListener('touchend', () => handleTouchEnd('s', 0));
        document.getElementById('btn-up-right').addEventListener('touchend', () => handleTouchEnd('arrowup', 1));
        document.getElementById('btn-down-right').addEventListener('touchend', () => handleTouchEnd('arrowdown', 1));
    }    
}
