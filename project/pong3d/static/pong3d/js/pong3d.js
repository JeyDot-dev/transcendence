import * as THREE from './threejs/Three.js';
import { Paddle } from './GameObjects/paddle.js';
import { Arena } from './GameObjects/arena.js';
import { Puck } from './GameObjects/puck.js';
import { Text3d } from './GameObjects/text3d.js';
import { Explosion } from './GameObjects/explosion.js';


console.log('Chargement du script pong3d.js');
console.log('Script pong3d.js chargé');

// Initialisation de la scène, de la caméra et du renderer avec antialiasing activé
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const mainElement = document.querySelector('main');
mainElement.appendChild(renderer.domElement);
console.log('Renderer ajouté au DOM');


// ORBIT: Ajouter des contrôles Trackball
const controls = new THREE.TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 5.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
controls.noZoom = false;
controls.noPan = false;
controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;


// Ajouter une lumière ponctuelle
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, -1, 3);
scene.add(pointLight);

// Ajouter une lumière ambiante
const ambientLight = new THREE.AmbientLight(0x404040); // Lumière douce
scene.add(ambientLight);

// Position initiale de la caméra
camera.position.set(0, 0, 5);
controls.target.set(0, 0, 0);
controls.update();



// Sauvegarder l'état initial de la caméra
// controls.saveState();

// Ajouter un bouton pour réinitialiser la caméra
document.getElementById('resetButton').addEventListener('click', function () {
    controls.reset();
    console.log('Camera reset');
});

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

const arena = new Arena(5, 0.3, 8, 0x20b2aa, 0xffffff, 0.3, 0.5, 0x04444e); // Dimensions, couleur de l'arène et couleur des bords
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

// FONT: Charger la police pour afficher le texte
fontLoader.load(
    'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    function (font) {
        // Now the font is loaded, we can create text objects
        // var p1ScoreText, p2ScoreText, timeText, loadedFont;
        // TEXT: Créer les objets de Text3d pour les scores et le temps 
        var timeText = new Text3d(scene, fontLoader, 0.5, 0.1, 0xffffff, '0s',
            new THREE.Vector3(-0.2, 0, 3),
            new THREE.Vector3(0, 0, 0)
        );
        var p1Text = new Text3d(scene, fontLoader, 0.5, 0.1, 0x33ccff, '0',
            new THREE.Vector3(-0.2, 0, 3),
            new THREE.Vector3(0, 0, 0)
        );
        var p2Text = new Text3d(scene, fontLoader, 0.5, 0.1, 0xff2975, '0s',
            new THREE.Vector3(-0.2, 0, 3),
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
    timeText.updateText(`${Math.floor(elapsedTime)}s`);
    if (elapsedTime >= timeLimit) {
        endGame = true;
    }
}

// Fonction d'animation
var animate = function () {
    requestAnimationFrame(animate);

    if (!pause && !endGame) {
        // Mise à jour des positions des paddles
        if (moveLeft1) paddle1.move(new THREE.Vector3(-1, 0, 0));
        if (moveRight1) paddle1.move(new THREE.Vector3(1, 0, 0));
        if (moveLeft2) paddle2.move(new THREE.Vector3(-1, 0, 0));
        if (moveRight2) paddle2.move(new THREE.Vector3(1, 0, 0));

        puck.move();
        checkCollision();
        checkTime();
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
