import * as THREE from '../threejs/Three.js';
import { TrackballControls } from '../TrackballControls.js';
import { FontLoader } from '../FontLoader.js';
import { Paddle } from './paddle.js';
import { Arena } from './arena.js';
import { Puck } from './puck.js';
import { Text3d } from './text3d.js';

export class Game {
    constructor(arena_width, arnena_height, paddles, ball) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.mainElement = document.querySelector('#pong3d');
        this.mainElement.appendChild(renderer.domElement);
        console.log('Renderer ajouté au DOM');

        // TRACKBALL:
        this.controls = new TrackballControls(camera, renderer.domElement);
        this.controls.rotateSpeed = 5.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;

        // LIGHT: 
        this.ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
        this.scene.add(ambientLight);

        // ARENA:
        this.arena = new Arena(arena_width, 5, arnena_height, 0x20b2aa, 0xfaa501, 0.3, 5, 0xff1493); // Dimensions, couleur de l'arène et couleur des bords
        this.arena.addToScene(this.scene);

        // PUCK: / BALL:
        this.ball = new Puck(ball.size, ball.size / 4, ball.color, 1, ball.position);
        this.ball.addToScene(this.scene);

        // PADDLE: this.paddles et paddles sont different
        this.paddles = [];
        for (let i = 0; i < paddles.length; i++) {
            let new_paddle = new Paddle(paddles[i].width, paddles[i].depth, paddles[i].color, paddles[i].x, paddles[i].y, paddles[i].user_id);
            this.scene.add(new_paddle);
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