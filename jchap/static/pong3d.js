// import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { THREE } from './three.module.js';
import { TrackballControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/TrackballControls.js';
import { Game } from './GameObjects/game.js'

console.log("Pong3d.js loading");
document.addEventListener('DOMContentLoaded', function() {
    console.log("Pong3d.js loaded");
    // Initialisation de la scène
    const scene = new THREE.Scene();

    // Initialisation de la caméra
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

    // Initialisation du renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    const mainElement = document.querySelector('body');
    mainElement.appendChild(renderer.domElement);

    // TRACK: Ajouter des contrôles Trackball
    const controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 5.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    // GridHelper
    // const size = 10; // Taille de la grille
    // const divisions = 100; // Nombre de divisions
    // const gridHelper = new THREE.GridHelper(size, divisions);
    // scene.add(gridHelper);

    // Position initiale de la caméra
    camera.position.set(0, 0, 1000);
    controls.target.set(0, 0, 0);
    controls.update();

    let ws = new WebSocket(`ws://${window.location.host}/ws/pong/${game_id}/`);

    function updateWebsocketId() {
        ws.close();
        ws = new WebSocket(`ws://${window.location.host}/ws/pong/${game_id}/`);
    }

    ws.onopen = function() {
        console.log("Pong socket open");
    }

    let game_object;

    let my_id = -1;

    /* 

    typical game_init:
    Object { id: "pong_1234", paddles: [], ball: {…}, score: (2) […] }
    ​
    ball: Object { x: 640, y: 360, speed: 10, … }
    ​
    id: "pong_1234"
    ​
    paddles: Array []
    ​
    score: Array [ 0, 0 ]

    exemple, to get ball pos: game.ball.x
    */

    /* 

    typical game_state:

    Object { id: "pong_1234", paddles: [], ball: {…}, score: (2) […], timer: 0 }
    ​
    ball: Object { x: 640, y: 360, speed: 10, … }
    ​
    id: "pong_1234"
    ​
    paddles: Array []
    ​
    score: Array [ 0, 0 ]
    ​
    timer: 0

    */

    ws.onmessage = function(e) {
        let data = JSON.parse(e.data);
        let game = data.game ? data.game : data;

        console.log(game);

        switch (data.type) {
            case "game_state":
                // render(game);
                game_object.updateGame(game);
                break;
            case "init":
                console.log("init");
                if (!local_user) return;
                my_id = game.id;
                addPlayerList(local_user.username, (my_id % 2 == 0) ? 'l' : 'r');
                game_object = new Game(scene, game.width, game.height, game.paddles, game.ball);
                //updatePlayerCount(data.message.nb_players, data.message.nb_players);
                break;
            case "new_player":
                addPlayerList(data.name, (data.side >= 640) ? 'r' : 'l');
                updatePlayerCount(data.nb_players, data.nb_players);
                break;
            case "player_left":
                updatePlayerCount(data.nb_players, data.nb_players);
                console.log("Player left: " + data.who);
                break;
        }
    }

    // Handle the player input:
    {
        let pressedKeys = [];
        document.addEventListener('keydown', function(e) {
            if (my_id == -1) return;
            if (pressedKeys.includes(e.key)) return;
            pressedKeys.push(e.key);
            let message_form = {
                type: 'keydown',
                key: "unknown",
                player_id: my_id
            }
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
            if (ws.readyState === ws.OPEN)
                ws.send(JSON.stringify(message_form));
        });

        document.addEventListener('keyup', function(e) {
            if (my_id == -1) return;
            if (!pressedKeys.includes(e.key)) return;
            pressedKeys = pressedKeys.filter(key => key !== e.key);
            let message_form = {
                type: 'keyup',
                key: "unknown",
                player_id: my_id
            }
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
            if (ws.readyState === ws.OPEN)
                ws.send(JSON.stringify(message_form));
        });
    }

    function animate() {
        requestAnimationFrame(animate);
        
        controls.update();
        // Rendu de la scène
        renderer.render(scene, camera);
    }
    //LIST OF PLAYERS

    function addPlayerList(new_user, side) {

        let list
        if (side == 'l')
            list = document.getElementById('leftTeam');
        else
            list = document.getElementById('rightTeam');
        if (!list) {
            console.error(`Element with ID ${side === 'l' ? 'leftTeam' : 'rightTeam'} not found`);
            return;
        }
        let player = document.createElement('li');
        player.textContent = new_user;
        list.appendChild(player);
    }

    function updatePlayerCount(nb_players, nb_max) {
        const playerString = nb_players > 1 ? "Players" : "Player";
        document.getElementById('playerCount').textContent = playerString + " " + nb_players + "/" + nb_max;
    }

    // TEAM MANIPULATION

    const joinLeftTeamButton = document.getElementById('joinLeftTeam');
    const joinRightTeamButton = document.getElementById('joinRightTeam');

    function joinLeftTeam() {
        let message_form = {
            type: 'join_team',
            team: 'left',
            player_id: local_user.id
        }
        if (ws.readyState === ws.OPEN)
            ws.send(JSON.stringify(message_form));
    }

    function joinRightTeam() {
        let message_form = {
            type: 'join_team',
            team: 'right',
            player_id: local_user.id
        }
        if (ws.readyState === ws.OPEN)
            ws.send(JSON.stringify(message_form));
    }

    animate();
});