import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { TrackballControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/TrackballControls.js';


let cube, rotateX, rotateY, rotateZ;
// Initialisation de la scène
const scene = new THREE.Scene();

// Initialisation de la caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Initialisation du renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const mainElement = document.querySelector('main');
mainElement.appendChild(renderer.domElement);

// Grid Helper
const gridHelper = new THREE.GridHelper(10, 10); // Taille de la grille et nombre de divisions
gridHelper.rotation.x = Math.PI / 2;
scene.add(gridHelper);
// Axes Helper
const axesHelper = new THREE.AxesHelper(1); // La longueur des axes
scene.add(axesHelper);

// Ambient Light
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
scene.add(ambientLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);
scene.add(directionalLight.target);

// MAINCUBE: Cube de reference
const geometryMain = new THREE.BoxGeometry(1, 1, 1);
const materialMain = new THREE.MeshStandardMaterial({ color: 0xcbc3f5 });
const mainCube = new THREE.Mesh(geometryMain, materialMain);
mainCube.position.set(0, 0, 0);
scene.add(mainCube);

// TRACK: Ajouter des contrôles Trackball
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 5.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
controls.noZoom = false;
controls.noPan = false;
controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;

// Position initiale de la caméra
camera.position.set(0, 0, 5);
controls.target.set(0, 0, 0);
controls.update();

// Création d'un cube
function initCube(size, x, y, z) {
    console.log("Init Cube");
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, z);
    scene.add(cube);
}

document.addEventListener('keydown', function (event) {
    // let keypress;
    // if (event.code === 'ArrowLeft') {
    //     keypress = ;
    // } else if (event.code === 'ArrowRight') {
    //     moveRight1 = true;
    // }
    console.log(event.code);
    socket.send(JSON.stringify({ 'keypress': event.code}));
});

// Fonction d'animation
function animate() {
    requestAnimationFrame(animate);
    
    // Rotation du cube pour l'animation
    if (rotateX) cube.rotation.x += 0.01 * rotateX;
    if (rotateY) cube.rotation.y += 0.01 * rotateY;
    if (rotateZ) cube.rotation.z += 0.01 * rotateZ;


    // mainCube.rotation.x += 0.01;
    mainCube.rotation.y += 0.01;
    // mainCube.rotation.z += 0.01;
    
    controls.update();
    // Rendu de la scène
    renderer.render(scene, camera);
}
const socket = new WebSocket('ws://' + window.location.host + '/ws/cube/');

socket.onmessage = function (e) {
    // console.log("Message WebSocket reçu :", e.data);
    const data = JSON.parse(e.data);
    if (data.type == 'init') {
        console.log("Init Cube");
        initCube(data.cubeSize, data.cubeX, data.cubeY, data.cubeZ);
    } else if (data.type == 'rotation') {
        console.log("rotation");
        rotateX = data.rotateX;
        rotateY = data.rotateY;
        rotateZ = data.rotateZ;
    } else {
        console.log("No type detected");
    }
};

socket.onopen = function(event) {
    console.log("Connexion WebSocket établie.");
};

// socket.onmessage = function(event) {
//     console.log("Message WebSocket reçu :", event.data);
// };

socket.onclose = function(event) {
    console.log("Connexion WebSocket fermée.");
};

// Démarrage de l'animation
animate();