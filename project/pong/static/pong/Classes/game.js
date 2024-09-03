// import * as THREE from '../threejs/Three.js';
// import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { THREE } from '../three.module.js';
import { Paddle } from './paddle.js';
import { Arena } from './arena.js';
import { Puck } from './puck.js';
import { FontLoader } from '../FontLoader.js';
import { Text3d } from './text3d.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/shaders/FXAAShader.js';

export class Game {
    constructor(threeRoot, gameData, socketManager) {
    // constructor(threeRoot, arena_width, arnena_height, playersParam, ball_param, socketManager) {
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
        this.initText(gameData.score);
        console.log("Init Ball");
        this.initBall(gameData.ball);
        console.log("Init Paddles");
        this.initPaddles(gameData.players);


        // const size = 720; // Taille de la grille
        // const divisions = 4; // Nombre de divisions
        // const gridHelper = new THREE.GridHelper(size, divisions);
        // gridHelper.position.set(0, 0, 0);
        // gridHelper.rotation.x = Math.PI / 2;
        // this.scene.add(gridHelper);
        
        // const gridHelperTop = new THREE.GridHelper(1400, 8);
        // gridHelperTop.position.set(0, 720 / 2, 0);
        // gridHelperTop.scale.set(1, 1, 0.2);
        // this.scene.add(gridHelperTop);
        // const gridHelperBot = new THREE.GridHelper(1400, 8);
        // gridHelperBot.position.set(0, -720 / 2, 0);
        // gridHelperBot.scale.set(1, 1, 0.2);
        // this.scene.add(gridHelperBot);
        // const gridHelperLeft = new THREE.GridHelper(1280, 8);
        // gridHelperLeft.position.set(-1280 / 2, 0, 0);
        // gridHelperLeft.scale.set(1, 1, 0.2);
        // gridHelperLeft.rotation.z = Math.PI / 2;
        // this.scene.add(gridHelperLeft);
        // const gridHelperRight = new THREE.GridHelper(1280, 8);
        // gridHelperRight.position.set(1280 / 2, 0, 0);
        // gridHelperRight.scale.set(1, 1, 0.2);
        // gridHelperRight.rotation.z = Math.PI / 2;
        // this.scene.add(gridHelperRight);
        
        console.log("Init Input Handling");
        this.initInputHandling(); // Initialisation des événements clavier
        console.log("End of Game constructor")
        this.scene.add(this.gameGroup);
    }

    initArena(width, height) {

        // console.log(width, height);
        this.arena = new Arena(width, 25, height, 0x1c9e97, 0x5a407b, 25, 25, 0xde95d0);
        this.arena.addToGroup(this.gameGroup);
        // this.arena.addToScene(this.scene);
        // this.arena.group.translateX(ball_param.x);
        // this.arena.group.translateY(ball_param.y);

        // this.composer = new EffectComposer(this.renderer);
        // this.composer.addPass(new RenderPass(this.scene, this.camera));

        // const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
        // this.composer.addPass(outlinePass);

        // const fxaaPass = new ShaderPass(FXAAShader);
        // fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
        // this.composer.addPass(fxaaPass);

        // outlinePass.selectedObjects = this.arena.getWalls();

        // outlinePass.edgeStrength = 2.0;
        // outlinePass.edgeGlow = 3.0;
        // outlinePass.edgeThickness = 2.0;
        // outlinePass.pulsePeriod = 2;
        // outlinePass.visibleEdgeColor.set('#f161bf');
        // outlinePass.hiddenEdgeColor.set('#190a05');
    }

    initLighting() {
        const ambientLight = new THREE.AmbientLight(this.colorPalette, 0.3); // Couleur blanche avec une intensité de 1

        // Light 1
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight1.position.set(-400, 0, 800);
        directionalLight1.castShadow = true;
        const targetObject1 = new THREE.Object3D();
        targetObject1.position.set(400, 0, 0);
        // this.scene.add(directionalLight1);
        directionalLight1.target = targetObject1;
        directionalLight1.target.updateMatrixWorld();     
        // this.scene.add(targetObject1);
        this.gameGroup.add(directionalLight1);
        this.gameGroup.add(targetObject1);

        // Light 2
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight2.position.set(400, 0, 800);
        directionalLight2.castShadow = true;
        const targetObject2 = new THREE.Object3D();
        targetObject2.position.set(-400, 0, 0); // Positionner la cible à l'origine (0, 0, 0)
        // this.scene.add(directionalLight2);
        directionalLight2.target = targetObject2;
        directionalLight2.target.updateMatrixWorld();     
        // this.scene.add(targetObject2);
        this.gameGroup.add(directionalLight2);
        this.gameGroup.add(targetObject2);

        const directionalLightHelper1 = new THREE.DirectionalLightHelper(directionalLight1, 1);
        const directionalLightHelper2 = new THREE.DirectionalLightHelper(directionalLight2, 1);
        // this.scene.add(directionalLightHelper1);
        // this.scene.add(directionalLightHelper2);
        // this.scene.add(ambientLight);
        this.gameGroup.add(directionalLightHelper1);
        this.gameGroup.add(directionalLightHelper2);
        this.gameGroup.add(ambientLight);
    }

    initText(score) {
        const fontLoader = new FontLoader();
        fontLoader.load(
            'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
            (font) => {
                this.timeText = new Text3d(
                    this.camera,
                    this.scene,
                    font,
                    105,
                    10,
                    0xffffff,
                    '0s',
                    1.05,
                    new THREE.Vector3(0, 125 / 2, 300)
                );
                this.p1Text = new Text3d(this.camera, this.scene, font, 100, 10, 0x33ccff, score[0].toString(), 1.05,
                    new THREE.Vector3(-200, 100 / 2, 300)
                );
                this.p2Text = new Text3d(this.camera, this.scene, font, 100, 10, 0xff2975, score[1].toString(), 1.05,
                    new THREE.Vector3(200, 100 / 2, 300)
                );
                // TODO: Text3d au group ?
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
        // this.ball.addToScene(this.scene);
        this.ball.addToGroup(this.gameGroup);

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
            // newPlayer.addToScene(this.scene);
            newPaddle.addToGroup(this.gameGroup);
            this.paddles.push(newPaddle);
        });

    }

    initInputHandling() {
        // if (this.socketManager.type == 'local') {
        if (!this.socketManager) {
            console.log("Socket manager UNDIFINED");
            return ;
        }
            document.addEventListener('keydown', event => {
                const key = event.key.toLowerCase();
                if (['w', 's'].includes(key)) {
                    // console.log('keydown: w s');
                    this.socketManager.sendMessage({ type: 'keydown', key: key, who: 0 });
                }
                if (['arrowup', 'arrowdown'].includes(key)) {
                    // console.log('keydown: arrow');
                    this.socketManager.sendMessage({ type: 'keydown', key: key, who: 1 });
                }
                if (['k'].includes(key)) {
                    console.log('Close WebSocket with key K');
                    this.socketManager.reconnect();
                }
            });
            
            document.addEventListener('keyup', event => {
                const key = event.key.toLowerCase();
                if (['w', 's'].includes(key)) {
                    // console.log('keyup: w s');
                    this.socketManager.sendMessage({ type: 'keyup', key: key, who: 0 });
                }
                if (['arrowup', 'arrowdown'].includes(key)) {
                    // console.log('keyup: arrow');
                    this.socketManager.sendMessage({ type: 'keyup', key: key, who: 1 });
                }
            });           
        // } else {
        //     document.addEventListener('keydown', this.handleKeyDown.bind(this));
        //     document.addEventListener('keyup', this.handleKeyUp.bind(this));
        // }
    }

    handleKeyDown(e) {
        if (this.pressedKeys.includes(e.key)) return;
        this.pressedKeys.push(e.key);

        let message_form = {
            type: 'keydown',
            key: "unknown",
            player_id: this.playerId
        };

        switch (e.key) {
            case 'w':
                message_form.key = "up";
                break;
            case 's':
                message_form.key = "down";
                break;
            case 'ArrowUp':
                message_form.key = "arrowup";
                break;
            case 'ArrowDown':
                message_form.key = "arrowdown";
                break;
            default:
                break;
        }
        if (this.socketManager) {
            this.socketManager.sendMessage(message_form);
        }
    }

    handleKeyUp(e) {
        if (!this.pressedKeys.includes(e.key)) return;
        this.pressedKeys = this.pressedKeys.filter(key => key !== e.key);

        let message_form = {
            type: 'keyup',
            key: "unknown",
            player_id: this.playerId
        };

        switch (e.key) {
            case 'w':
                message_form.key = "up";
                break;
            case 's':
                message_form.key = "down";
                break;
            case 'ArrowUp':
                message_form.key = "arrowup";
                break;
            case 'ArrowDown':
                message_form.key = "arrowdown";
                break;
        }
        if (this.socketManager) {
            this.socketManager.sendMessage(message_form);
        }
    }

    updateGame(game) {
        console.log('Update Game(Reconnection)', game);
        this.ball.move(game.ball.x - this.offSet.x, -game.ball.y + this.offSet.y);
        // console.log(game.score);
        game.paddles.forEach(element => {
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
            case 'ballMove':
                // -y Car dans three js y est orienter differement
                this.ball.move(data.ball.x - this.offSet.x, -data.ball.y + this.offSet.y);
                break;
                case 'paddleMove':
                // -y Car dans three js y est orienter differement
                this.paddles[data.paddle.side].move(data.paddle.x - this.offSet.x, -data.paddle.y + this.offSet.y)
                break;
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
        
    }

    destroy() {
        // Remove event listeners when the game instance is destroyed
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }
}
