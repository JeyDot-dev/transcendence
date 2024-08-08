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
    constructor(scene, arena_width, arnena_height, paddles_param, ball_param, camera, renderer) {
        this.scene = scene;
        this.timeText = null;
        this.p1Text = null;
        this.p2Text = null;

        // GridHelper
        const size = 2000; // Taille de la grille
        const divisions = 200; // Nombre de divisions
        const gridHelper = new THREE.GridHelper(size, divisions);
        gridHelper.position.set(1280 / 2, 720 / 2);
        gridHelper.rotation.x = Math.PI / 2;
        scene.add(gridHelper);
        // SCORE / TIME:
        const fontLoader = new FontLoader();
        fontLoader.load(
            // '../assets/LEMONMILK.json',
            'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
            (font) => {
                // fonction flechée pour garder le contexte: this.(...)
                const geometry = new THREE.BoxGeometry(50, 50, 50);
                const material = new THREE.MeshBasicMaterial({ color: 0xff1493 });
                const cube = new THREE.Mesh(geometry, material);
                this.scene.add(cube);
                this.timeText = new Text3d(camera, this.scene, font, 125, 10, 0xffffff, '0s',
                    new THREE.Vector3(-75 + ball_param.x, ball_param.y, 300)
                );
                this.p1Text = new Text3d(camera, this.scene, font, 100, 10, 0x33ccff, '0',
                    new THREE.Vector3(300 + ball_param.x, ball_param.y, 300)
                );
                this.p2Text = new Text3d(camera, this.scene, font, 100, 10, 0xff2975, '0',
                    new THREE.Vector3(-300 + ball_param.x, ball_param.y, 300)
                );

            },
            undefined, // onProgress callback (optional)
            function (error) { // onError callback
                console.error('An error occurred loading the font:', error);
            }
        );


        // // LIGHT: 
        // this.ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft white light
        // this.scene.add(this.ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(500, -500, 1000);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        scene.add(directionalLight.target);
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
        scene.add(directionalLightHelper);

        // ARENA:
        this.arena = new Arena(1280, 25, 720, 0x1c9e97, 0x5a407b, 25, 25, 0xde95d0); // Dimensions, couleur de l'arène et couleur des bords
        this.arena.addToScene(this.scene);
        this.arena.group.translateX(ball_param.x);
        this.arena.group.translateY(ball_param.y);
        this.composer = new EffectComposer(renderer);
        this.composer.addPass(new RenderPass(scene, camera));
        
        const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
        this.composer.addPass(outlinePass);
        
        const fxaaPass = new ShaderPass(FXAAShader);
        fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
        this.composer.addPass(fxaaPass);
        
        // Ajouter les murs de l'arène à l'outlinePass
        outlinePass.selectedObjects = this.arena.getWalls();
        console.log("Selected objects for outline:", outlinePass.selectedObjects);
        
        // Personnaliser l'apparence de l'outline
        outlinePass.edgeStrength = 3.0;
        outlinePass.edgeGlow = 3.0;
        outlinePass.edgeThickness = 3.0;
        outlinePass.pulsePeriod = 2;
        outlinePass.visibleEdgeColor.set('#f161bf');
        outlinePass.hiddenEdgeColor.set('#190a05');


        // this.arena = new Arena(1280, 5, 720, 0x20b2aa, 0xfaa501, 0.5, 5, 0xff1493); // Dimensions, couleur de l'arène et couleur des bords
        // this.arena.addToScene(this.scene);

        // PUCK: / BALL:
        console.log("New Ball / Puck" + ball_param.x);
        this.ball = new Puck(ball_param.size, ball_param.size / 2, ball_param.color, ball_param.x, ball_param.y);
        this.ball.addToScene(this.scene);

        // PADDLE: this.paddles et paddles sont different
        // this.paddles = [];
        // for (let i = 0; i < paddles_param.length; i++) {
        //     let new_paddle = new Paddle(paddles_param[i].width, paddles_param[i].color, paddles_param[i].x, paddles_param[i].y, paddles_param[i].user_id);
        //     console.log(paddles_param);
        //     new_paddle.addToScene(this.scene);
        //     this.paddles.push(new_paddle);
        // }
        // this.paddleL = new Paddle(paddle1.width, paddle1.depth, paddle1.color, paddle1.x, paddle1.y);
        // this.paddleR = new Paddle(paddle2.width, paddle2.depth, paddle2.color, paddle2.x, paddle2.y);
    }
    
    updateGame(game, camera) {
        // let paddles = game.paddles;
        // for (let i = 0; i < paddles.length; i++) {
        //     this.paddles[i].move(paddles[i].x, paddles[i].y);
        // }
        this.ball.move(game.ball.x, game.ball.y);
    }
    updateAnimation(camera) {
        if (this.timeText) {
            this.timeText.glowTextMesh.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(
                camera.position,
                this.timeText.glowTextMesh.position);
            this.p1Text.glowTextMesh.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(
                camera.position,
                this.p1Text.glowTextMesh.position);
            this.p2Text.glowTextMesh.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(
                camera.position,
                this.p2Text.glowTextMesh.position);
        }
        this.composer.render();
    }
}