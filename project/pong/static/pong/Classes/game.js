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
    constructor(threeRoot, arena_width, arnena_height, playersParam, ball_param, socketManager) {
        this.scene = threeRoot.scene;
        this.camera = threeRoot.camera;
        this.renderer = threeRoot.renderer;
        this.composer = threeRoot.composer;
        this.socketManager = socketManager;
        this.playerId = 0;
        this.pressedKeys = [];
        this.players = [];

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

        console.log("Init Arena:", arena_width, arnena_height, ball_param);
        this.initArena(1280, 720, ball_param);
        console.log("Init Lightning");
        this.initLighting();
        console.log("Init Text");
        this.initText(ball_param);
        console.log("Init Ball");
        this.initBall(ball_param);
        console.log("Init Paddles");
        this.initPaddles(playersParam);

        // const size = 2000; // Taille de la grille
        // const divisions = 200; // Nombre de divisions
        // const gridHelper = new THREE.GridHelper(size, divisions);
        // gridHelper.position.set(1280 / 2, 720 / 2);
        // gridHelper.rotation.x = Math.PI / 2;
        // this.scene.add(gridHelper);
        
        console.log("Init Input Handling");
        this.initInputHandling(); // Initialisation des événements clavier
        console.log("End of Game constructor")
    }

    initArena(width, height, ball_param) {

        this.arena = new Arena(width, 25, height, 0x1c9e97, 0x5a407b, 25, 25, 0xde95d0);
        this.arena.addToScene(this.scene);
        this.arena.group.translateX(ball_param.x);
        this.arena.group.translateY(ball_param.y);

        // this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
        this.composer.addPass(outlinePass);

        const fxaaPass = new ShaderPass(FXAAShader);
        fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
        this.composer.addPass(fxaaPass);

        outlinePass.selectedObjects = this.arena.getWalls();

        outlinePass.edgeStrength = 2.0;
        outlinePass.edgeGlow = 3.0;
        outlinePass.edgeThickness = 2.0;
        outlinePass.pulsePeriod = 2;
        outlinePass.visibleEdgeColor.set('#f161bf');
        outlinePass.hiddenEdgeColor.set('#190a05');
    }

    initLighting() {
        const ambientLight = new THREE.AmbientLight(this.colorPalette, 0.3); // Couleur blanche avec une intensité de 1

        // Light 1
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight1.position.set(200, 780 / 2, 400);
        directionalLight1.castShadow = true;
        const targetObject1 = new THREE.Object3D();
        targetObject1.position.set(1280 - 400, 780 / 2, 0); // Positionner la cible à l'origine (0, 0, 0)
        this.scene.add(directionalLight1);
        directionalLight1.target = targetObject1;
        directionalLight1.target.updateMatrixWorld();     
        this.scene.add(targetObject1);
        // Light 2
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight2.position.set(1280 - 200, 780 / 2, 400);
        directionalLight2.castShadow = true;
        const targetObject2 = new THREE.Object3D();
        targetObject2.position.set(400, 780 / 2, 0); // Positionner la cible à l'origine (0, 0, 0)
        this.scene.add(directionalLight2);
        directionalLight2.target = targetObject2;
        directionalLight2.target.updateMatrixWorld();     
        this.scene.add(targetObject2);

        const directionalLightHelper1 = new THREE.DirectionalLightHelper(directionalLight1, 1);
        const directionalLightHelper2 = new THREE.DirectionalLightHelper(directionalLight2, 1);
        this.scene.add(directionalLightHelper1);
        this.scene.add(directionalLightHelper2);
        this.scene.add(ambientLight);
    }

    initText(ball_param) {
        const fontLoader = new FontLoader();
        fontLoader.load(
            'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
            (font) => {
                this.timeText = new Text3d(this.camera, this.scene, font, 125, 10, 0xffffff, '0s',
                    new THREE.Vector3(-75 + ball_param.x, ball_param.y, 300)
                );
                this.p1Text = new Text3d(this.camera, this.scene, font, 100, 10, 0x33ccff, '0',
                    new THREE.Vector3(300 + ball_param.x, ball_param.y, 300)
                );
                this.p2Text = new Text3d(this.camera, this.scene, font, 100, 10, 0xff2975, '0',
                    new THREE.Vector3(-300 + ball_param.x, ball_param.y, 300)
                );
            },
            undefined, // onProgress callback (optional)
            (error) => {
                console.error('An error occurred loading the font:', error);
            }
        );
    }

    initBall(ball_param) {
        console.log("Ball Param: ", ball_param);
        this.ball = new Puck(ball_param.size, ball_param.size, ball_param.color, ball_param.x, ball_param.y, this.camera);
        this.ball.addToScene(this.scene);
    }

    initPaddles(playersParam) {
        console.log("----Paddles Params of type: ", typeof playersParam);
        playersParam.forEach(element => {
            console.log("Player:", element);
            const newPlayer = new Paddle(element.width, 0xffffff, element.position[0], element.position[1], element.id);
            newPlayer.addToScene(this.scene);
            this.players.push(newPlayer);
        });

    }

    initInputHandling() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
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
                message_form.key = "up";
                break;
            case 'ArrowDown':
                message_form.key = "down";
                break;
        }

        this.socketManager.sendMessage(message_form);
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
                message_form.key = "up";
                break;
            case 'ArrowDown':
                message_form.key = "down";
                break;
        }

        this.socketManager.sendMessage(message_form);
    }

    updateGame(game) {
        this.ball.move(game.ball.x, game.ball.y);
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

    destroy() {
        // Remove event listeners when the game instance is destroyed
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }
}
