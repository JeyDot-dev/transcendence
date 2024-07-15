import { Game } from './GameObjects/game.js';
import * as THREE from './threejs/Three.js';
// import { RectAreaLightHelper } from './jsm/helpers/RectAreaLightHelper.js';
// import { RectAreaLightUniformsLib } from './jsm/lights/RectAreaLightUniformsLib.js';
// import { TrackballControls } from './TrackballControls.js';
// import { FontLoader } from './FontLoader.js';
// import { Paddle } from './GameObjects/paddle.js';
// import { Arena } from './GameObjects/arena.js';
// import { Puck } from './GameObjects/puck.js';
// import { Text3d } from './GameObjects/text3d.js';
// import { Explosion } from './GameObjects/explosion.js';

console.log('Chargement du script pong3d.js');


// WS: Fonctions pour les WebSockets
let ws = new WebSocket(`ws://${window.location.host}/ws/pong/${game_id}/`);

function updateWebsocketId() {
	ws.close();
	ws = new WebSocket(`ws://${window.location.host}/ws/pong/${game_id}/`);
}

ws.onopen = function() {
	console.log("Pong socket open");
}

ws.onmessage = function(e) {
	let data = JSON.parse(e.data);
	let game = data.game ? data.game : data;

	switch (data.type) {
		case "game_state":
			render(game); // pas de render avec threejs adapter pour animate
			break;
		case "init":
			if (!local_user) return;
			my_id = data.message.id;
			addPlayerList(local_user.username, (my_id % 2 == 0) ? 'l' : 'r');
			updatePlayerCount(data.message.nb_players, data.message.nb_players);
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


// Initialisation de la scène, de la caméra et du renderer avec antialiasing activé
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const mainElement = document.querySelector('main');
mainElement.appendChild(renderer.domElement);
console.log('Renderer ajouté au DOM');


// ORBIT: Ajouter des contrôles Trackball
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 5.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
controls.noZoom = false;
controls.noPan = false;
controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;


// Ajouter des lumières à la scène

// Ambient Light
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
scene.add(ambientLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);
scene.add(directionalLight.target);

// Point Light
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 5, 10);
pointLight.castShadow = true;
scene.add(pointLight);

// Spot Light
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(10, 10, 10);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.2;
spotLight.decay = 2;
spotLight.distance = 200;
spotLight.castShadow = true;
scene.add(spotLight);
scene.add(spotLight.target);

// Position initiale de la caméra
camera.position.set(0, 0, 5);
controls.target.set(0, 0, 0);
controls.update();



// Sauvegarder l'état initial de la caméra
// controls.saveState();

// Variables de jeu
var score1 = 0, score2 = 0;

// PADDLE: Création des paddles
var paddle1 = new Paddle(scene, 1, 0.1, 0.2, 0x33ccff, 0.1, new THREE.Vector3(0, -2.5, 0), new THREE.Vector3(0, 0, 0));
var paddle2 = new Paddle(scene, 1, 0.1, 0.2, 0xff2975, 0.1, new THREE.Vector3(0, 2.5, 0), new THREE.Vector3(0, 0, 0));


// Ajouter les paddles à la scène
scene.add(paddle1.getMesh());
scene.add(paddle2.getMesh());
paddle1.logMeshData();
paddle2.logMeshData();
// scene.add(paddle1.getBoxHelper());
// scene.add(paddle2.getBoxHelper());

function checkPaddle(paddle, puck) {
    console.log(`Paddle position: ${paddle.getMesh().position.x}, ${paddle.getMesh().position.y}, ${paddle.getMesh().position.z}`);
    console.log(`Paddle dimensions: ${paddle.width}, ${paddle.height}, ${paddle.depth}`);
    console.log(`Puck position: ${puck.getMesh().position.x}, ${puck.getMesh().position.y}, ${puck.getMesh().position.z}`)
}

// Positionnement des paddles
// scene.add(paddle1);
// scene.add(paddle2);
console.log('Paddles ajoutés à la scène');


const axesHelper = new THREE.AxesHelper(1); // La longueur des axes
scene.add(axesHelper);

// Ajouter une grille
// const gridHelper = new THREE.GridHelper(10, 10); // Taille de la grille et nombre de divisions
// gridHelper.rotation.x = Math.PI / 2;
// scene.add(gridHelper);

// PUCK: Creation du puck
var puck = new Puck(scene, 0.1, 0.05, 0xff0000, 0.2, new THREE.Vector3(0, 0, 0));
scene.add(puck.getMesh());
// scene.add(puck.getBoxHelper());

// ARENA: Création des bords
var borderThickness = 0.1;
var borderMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

var borderTop = new THREE.Mesh(new THREE.BoxGeometry(window.innerWidth / window.innerHeight, borderThickness, 0.2), borderMaterial);
var borderBottom = new THREE.Mesh(new THREE.BoxGeometry(window.innerWidth / window.innerHeight, borderThickness, 0.2), borderMaterial);
var borderLeft = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, 6, 0.2), borderMaterial);
var borderRight = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, 6, 0.2), borderMaterial);

borderTop.position.set(0, 3.1, 0);
borderBottom.position.set(0, -3.1, 0);
borderLeft.position.set(-window.innerWidth / window.innerHeight / 2, 0, 0);
borderRight.position.set(window.innerWidth / window.innerHeight / 2, 0, 0);

// scene.add(borderTop);
// scene.add(borderBottom);
// scene.add(borderLeft);
// scene.add(borderRight);

const group = new THREE.Group();
group.add(borderBottom);
group.add(borderTop);
group.add(borderLeft);
group.add(borderRight);
scene.add(group);
// group.rotation.x = Math.PI / 2;
console.log('Bords ajoutés à la scène');

const arena = new Arena(5, 0.3, 8, 0x20b2aa, 0xfaa501, 0.3, 0.5, 0xff1493); // Dimensions, couleur de l'arène et couleur des bords
arena.addToScene(scene);
// Position de la caméra
camera.position.z = 5;

// Drapeaux pour les touches de déplacement
var moveLeft1 = false, moveRight1 = false;
var moveLeft2 = false, moveRight2 = false;
var pause = true;

// Gestion des mouvements des paddles
document.addEventListener('keydown', function (event) {
    if (event.code === 'ArrowLeft') {
        moveLeft1 = true;
    } else if (event.code === 'ArrowRight') {
        moveRight1 = true;
    }
    if (event.code === 'KeyA') {
        moveLeft2 = true;
    } else if (event.code === 'KeyD') {
        moveRight2 = true;
    }
});

document.addEventListener('keyup', function (event) {
    if (event.code === 'ArrowLeft') {
        moveLeft1 = false;
    } else if (event.code === 'ArrowRight') {
        moveRight1 = false;
    }
    if (event.code === 'KeyA') {
        moveLeft2 = false;
    } else if (event.code === 'KeyD') {
        moveRight2 = false;
    }
    if (event.code === 'Space') {
        pause = !pause;
        console.log('Pause toggled:', pause);
    }
});

// Fonction de détection des collisions
function checkCollision() {
    // COLLISION: Collision avec les paddles
    if (paddle1.checkCollision(puck)) {
        checkPaddle(paddle1, puck);
        puck.reflect(paddle1.getNormal(), paddle1.velocity);
    }
    if (paddle2.checkCollision(puck)) {
        checkPaddle(paddle2, puck);
        puck.reflect(paddle2.getNormal(), paddle2.velocity);
    }
    // Collision avec les bords
    if (puck.position.x - puck.size <= -window.innerWidth / window.innerHeight / 2) {
        puck.inverseDirectionX();
        // puckDirection.x = puckSpeed;
    }

    if (puck.position.x + puck.size >= window.innerWidth / window.innerHeight / 2) {
        puck.inverseDirectionX();
        // puckDirection.x = -puckSpeed;
    }

    // Collision avec les bords supérieur et inférieur
    if (puck.position.y - puck.size <= -3) {
        score2++;
        p2Text.updateText(score2);
        // triggerExplosion(puck.position.clone());
        var explo = new Explosion(scene, 100, 0.1, 2);
        explo.trigger(puck.position);
        // updateScores();
        puck.reset();
    }

    if (puck.position.y + puck.size >= 3) {
        score1++;
        p1Text.updateText(score1);
        // triggerExplosion(puck.position.clone());
        var explo = new Explosion(scene, 100, 0.1, 2);
        explo.trigger(puck.position);
        // updateScores();
        puck.reset();
    }
}

const fontLoader = new FontLoader();

// FONT: Charger la police pour afficher le texte
fontLoader.load(
    'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    function (font) {
        // Now the font is loaded, we can create text objects
        // TEXT: Créer les objets de Text3d pour les scores et le temps 
        const timeText = new Text3d(scene, font, 0.5, 0.1, 0xffffff, '0s',
            new THREE.Vector3(-0.2, 0, 3),
            new THREE.Vector3(0, 0, 0)
        );
        const p1Text = new Text3d(scene, font, 0.5, 0.1, 0x33ccff, '0',
            new THREE.Vector3(-2.2, 0, 3),
            new THREE.Vector3(0, 0, 0)
        );
        const p2Text = new Text3d(scene, font, 0.5, 0.1, 0xff2975, '0',
            new THREE.Vector3(2.2, 0, 3),
            new THREE.Vector3(0, 0, 0)
        );
    },
    undefined, // onProgress callback (optional)
    function (error) { // onError callback
        console.error('An error occurred loading the font:', error);
    }
);


const timeLimit = 120;
var startTime = Date.now();
var elapsedTime = 0;
var endGame = false;
// Fonction pour vérifier le temps écoulé
function checkTime() {
    elapsedTime = (Date.now() - startTime) / 1000; // Temps écoulé en secondes
    timeText.updateText(`${Math.floor(elapsedTime)}s`, scene);
    if (elapsedTime >= timeLimit) {
        endGame = true;
    }
}

// Fonction d'animation
var animate = function () {
    requestAnimationFrame(animate);

    if (!pause && !endGame) {
        // Mise à jour des positions des paddles
        // if (moveLeft1) paddle1.move(new THREE.Vector3(-1, 0, 0));
        // if (moveRight1) paddle1.move(new THREE.Vector3(1, 0, 0));
        // if (moveLeft2) paddle2.move(new THREE.Vector3(-1, 0, 0));
        // if (moveRight2) paddle2.move(new THREE.Vector3(1, 0, 0));

        // puck.move();
        // checkCollision();
        // checkTime();
        Game.update(game);
    }
    if (endGame) {

    }
    controls.update(); // Met à jour les contrôles


    renderer.render(scene, camera);
    // TODO: ajouter une fonction qui va envoyer le score a la db
    // if (endGame) {
    //
    //}
};

puck.reset();

animate();
console.log('Animation démarrée');
