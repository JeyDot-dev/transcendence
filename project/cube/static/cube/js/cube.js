import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { TrackballControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/TrackballControls.js';
import { RectAreaLightUniformsLib } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/helpers/RectAreaLightHelper.js';


let cube, rotateX = 0, rotateY = 0, rotateZ = 0;
let lastSentRotation = { x: 0, y: 0, z: 0 };
let lastSentTime = Date.now();
const updateInterval = 100; 
// Initialisation de la scène
const scene = new THREE.Scene();

// Initialisation de la caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Initialisation du renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
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
const directionalLight = new THREE.DirectionalLight(0xffa500, 1);
directionalLight.position.set(-5, 5, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);
scene.add(directionalLight.target);
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(directionalLightHelper);

// Ajout d'une lumière directionnelle pour projeter les ombres
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;  // La lumière projette des ombres
const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 5);
scene.add(dirLightHelper);
scene.add(dirLight);

// Configurer les propriétés de l'ombre de la lumière directionnelle
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;
// // RectAreaLight (requires RectAreaLightUniformsLib)
// RectAreaLightUniformsLib.init();
// const rectLight = new THREE.RectAreaLight(0xffa500, 1, 10, 10);
// rectLight.position.set(5, 5, 5);
// rectLight.lookAt(0, 0, 0);
// scene.add(rectLight);
// const rectAreaLightHelper = new RectAreaLightHelper(rectLight);
// scene.add(rectAreaLightHelper);

// MAINCUBE: Cube de reference
const geometryMain = new THREE.BoxGeometry(3, 3, 3);
const materialMain = new THREE.MeshStandardMaterial({ color: 0xcbc3f5 });
const mainCube = new THREE.Mesh(geometryMain, materialMain);
mainCube.receiveShadow = true;
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
    cube.castShadow = true;
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
        

        // Variables pour l'animation de la lumière
        let blink = true;
        const colors = [0xff0000, 0x00ff00, 0x0000ff]; // rouge, vert, bleu
        let colorIndex = 0;
        let lastTime = Date.now();
        const blinkInterval = 500; // Temps en ms entre chaque clignotement
        // Fonction d'animation
        function animate() {
            requestAnimationFrame(animate);
            
            // Rotation du cube pour l'animation
            if (rotateX) cube.rotation.x += 0.01 * rotateX;
            if (rotateY) cube.rotation.y += 0.01 * rotateY;
            if (rotateZ) cube.rotation.z += 0.01 * rotateZ;
            
            // Faire clignoter la lumière et changer sa couleur
            const currentTime = Date.now();
            if (currentTime - lastTime >= blinkInterval) {
                blink = !blink;
                dirLight.intensity = blink ? 1 : 0; // Clignotement
                if (blink) {
                    colorIndex = (colorIndex + 1) % colors.length; // Changement de couleur
                    dirLight.color.setHex(colors[colorIndex]);
                }
                lastTime = currentTime;
            }
            // mainCube.rotation.x += 0.01;
            mainCube.rotation.y += 0.01;
            // mainCube.rotation.z += 0.01;
            
            controls.update();
            // Rendu de la scène
            renderer.render(scene, camera);
            
            // Envoyer les mises à jour de rotation périodiquement
            const now = Date.now();
            if (now - lastSentTime >= updateInterval) {
                const newRotation = {
                    x: cube.rotation.x,
                    y: cube.rotation.y,
                    z: cube.rotation.z
                };
                if (hasRotationChanged(newRotation)) {
                    socket.send(JSON.stringify({
                        'type': 'current_rotation',
                        'rotation': newRotation
                    }));
                    lastSentRotation = newRotation;
                    lastSentTime = now;
                }
            }
        }

function hasRotationChanged(newRotation) {
    return newRotation.x !== lastSentRotation.x ||
    newRotation.y !== lastSentRotation.y ||
    newRotation.z !== lastSentRotation.z;
}

const socket = new WebSocket('ws://' + window.location.host + '/ws/cube/');

socket.onmessage = function (e) {
    // console.log("Message WebSocket reçu :", e.data);
    const data = JSON.parse(e.data);
    if (data.type == 'init') {
        console.log("Init Cube : " + data.rotation.x + ' ' + data.rotation.y + ' ' + data.rotation.z);
        initCube(data.cubeSize, data.cubeX, data.cubeY, data.cubeZ);
        cube.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
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