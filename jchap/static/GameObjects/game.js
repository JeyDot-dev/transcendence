// import * as THREE from '../threejs/Three.js';
// import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { THREE } from '../three.module.js';
// import { TrackballControls } from '../TrackballControls.js';
// import { FontLoader } from '../FontLoader.js';
import { Paddle } from './paddle.js';
import { Arena } from './arena.js';
import { Puck } from './puck.js';
// import { Text3d } from './text3d.js';

export class Game {
    constructor(scene, arena_width, arnena_height, paddles_param, ball_param) {
        this.scene = scene;
        const geometry = new THREE.BoxGeometry(5, 5, 5);
        const material = new THREE.MeshBasicMaterial({ color: 0xff1493 });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
        // LIGHT: 
        this.ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
        this.scene.add(this.ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.3);
        directionalLight.position.set(-500, 500, 300);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        scene.add(directionalLight.target);
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
        scene.add(directionalLightHelper);

        // ARENA:
        this.arena = new Arena(720, 25, 1280, 0x20b2aa, 0xfaa501, 25, 25, 0xff1493); // Dimensions, couleur de l'arène et couleur des bords
        this.arena.addToScene(this.scene);
        // this.arena = new Arena(1280, 5, 720, 0x20b2aa, 0xfaa501, 0.5, 5, 0xff1493); // Dimensions, couleur de l'arène et couleur des bords
        // this.arena.addToScene(this.scene);

        // PUCK: / BALL:
        this.ball = new Puck(ball_param.size, ball_param.size / 4, ball_param.color, 1, ball_param.position);
        this.ball.addToScene(this.scene);

        // PADDLE: this.paddles et paddles sont different
        this.paddles = [];
        for (let i = 0; i < paddles_param.length; i++) {
            let new_paddle = new Paddle(paddles_param[i].width, paddles_param[i].depth, paddles_param[i].color, paddles_param[i].x, paddles_param[i].y, paddles_param[i].user_id);
            console.log(paddles_param);
            new_paddle.addToScene(this.scene);
            this.paddles.push(new_paddle);
        }
        // this.paddleL = new Paddle(paddle1.width, paddle1.depth, paddle1.color, paddle1.x, paddle1.y);
        // this.paddleR = new Paddle(paddle2.width, paddle2.depth, paddle2.color, paddle2.x, paddle2.y);
    }
    
    updateGame(game) {
        let paddles = game.paddles;
        for (let i = 0; i < paddles.length; i++) {
            this.paddles[i].move(paddles[i].x, paddles[i].y);
        }
        this.ball.move(game.ball.x, game.ball.y);
        }
}