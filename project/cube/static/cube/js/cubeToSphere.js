import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { TrackballControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/TrackballControls.js';
import { RectAreaLightUniformsLib } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/helpers/RectAreaLightHelper.js';

let scene, camera, renderer, particles, geometry, material, controls;
let influenceDisk, mouseIntersect = null; // Déclarez la variable et initialisez-la à null
const particleCount = 100000;
let targetPositions = [];
let isMorphing = false;

const initialPositions = [];

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const influenceRadius = 1; // Définir le rayon d'influence

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    const mainElement = document.querySelector('main');
    mainElement.appendChild(renderer.domElement);

    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        // Positions aléatoires
        positions[i * 3] = Math.random() * 2 - 1;
        positions[i * 3 + 1] = Math.random() * 2 - 1;
        positions[i * 3 + 2] = Math.random() * 2 - 1;

        // Couleurs en nuances de bleu et de vert
        colors[i * 3] = Math.random() * 0.3;  // Rouge faible pour une nuance de bleu/vert
        colors[i * 3 + 1] = Math.random() * 1.0;    // Vert plein
        colors[i * 3 + 2] = Math.random() * 1.0;    // Bleu plein
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    material = new THREE.PointsMaterial({ size: 0.005, vertexColors: true });
    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.01 });
    // particles = new THREE.Points(geometry, material);
    // scene.add(particles);

    // Création du disque transparent
    const diskGeometry = new THREE.CircleGeometry(influenceRadius, 32); // Utiliser influenceRadius pour la taille
    const diskMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
    influenceDisk = new THREE.Mesh(diskGeometry, diskMaterial);
    // influenceDisk.rotation.x = -Math.PI / 2; // Faire face vers le haut
    // scene.add(influenceDisk);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(10, 10); // Taille de la grille et nombre de divisions
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);
    // Axes Helper
    const axesHelper = new THREE.AxesHelper(1); // La longueur des axes
    scene.add(axesHelper);

    // Ambient Light
    // const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
    // scene.add(ambientLight);

    // Directional Light
    const directionalLight = new THREE.DirectionalLight(0xffa500, 1);
    directionalLight.position.set(-5, 5, 7.5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    scene.add(directionalLight.target);
    // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
    // scene.add(directionalLightHelper);

    // Ajout d'une lumière directionnelle pour projeter les ombres
    const dirLight = new THREE.DirectionalLight(0xb0c7ef, 100);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;  // La lumière projette des ombres
    // const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 5);
    // scene.add(dirLightHelper);
    scene.add(dirLight);

    // TRACK: Ajouter des contrôles Trackball
    controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 5.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    camera.position.set(0, 0, 5);
    controls.target.set(0, 0, 0);
    controls.update();
    // Initial morph to cube
    createCubePositions();
    morphToShape(targetPositions);
    window.addEventListener('mousemove', onMouseMove, false);
}

function createCubePositions() {
    targetPositions = [];
    const cubeSize = 2;
    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * cubeSize;
        const y = (Math.random() - 0.5) * cubeSize;
        const z = (Math.random() - 0.5) * cubeSize;
        targetPositions.push(new THREE.Vector3(x, y, z));
    }
}

function createSpherePositions() {
    targetPositions = [];
    const radius = 1.5;
    for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        targetPositions.push(new THREE.Vector3(x, y, z));
    }
}

function morphToShape(targetPositions) {
    isMorphing = true;
    const positions = particles.geometry.attributes.position.array;
    const startPositions = positions.slice();
    const duration = 2; // duration of the morphing in seconds
    const startTime = performance.now();

    function animateMorph(time) {
        const elapsed = (time - startTime) / 1000;
        const t = Math.min(elapsed / duration, 1);
        for (let i = 0; i < particleCount; i++) {
            const ix = i * 3;
            positions[ix] = startPositions[ix] + (targetPositions[i].x - startPositions[ix]) * t;
            positions[ix + 1] = startPositions[ix + 1] + (targetPositions[i].y - startPositions[ix + 1]) * t;
            positions[ix + 2] = startPositions[ix + 2] + (targetPositions[i].z - startPositions[ix + 2]) * t;
        }
        particles.geometry.attributes.position.needsUpdate = true;

        if (t < 1) {
            requestAnimationFrame(animateMorph);
        } else {
            isMorphing = false;
        }
    }

    requestAnimationFrame(animateMorph);
}

function onMouseMove(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(particles);

    if (intersects.length > 0) {
        mouseIntersect = intersects[0].point;
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'c') {
        createCubePositions();
        morphToShape(targetPositions);
    } else if (event.key === 's') {
        createSpherePositions();
        morphToShape(targetPositions);
    }
});

function animate() {
    requestAnimationFrame(animate);
    // if (!isMorphing) {
    //     const positions = particles.geometry.attributes.position.array;
    //     for (let i = 0; i < particleCount; i++) {
    //         const ix = i * 3;
    //         positions[ix] += (Math.random() - 0.5) * 0.001;
    //         positions[ix + 1] += (Math.random() - 0.5) * 0.001;
    //         positions[ix + 2] += (Math.random() - 0.5) * 0.001;
    //     }
    //     particles.geometry.attributes.position.needsUpdate = true;
    // }
    // if (mouseIntersect) {
    //     influenceDisk.position.set(mouseIntersect.x, mouseIntersect.y + 0.01, mouseIntersect.z); // Positionner le disque

    //     const positions = particles.geometry.attributes.position.array;
    //     const { x, y, z } = mouseIntersect;

    //     for (let i = 0; i < particleCount; i++) {
    //         const ix = i * 3;
    //         const distance = Math.sqrt(
    //             (positions[ix] - x) ** 2 +
    //             (positions[ix + 1] - y) ** 2 +
    //             (positions[ix + 2] - z) ** 2
    //         );

    //         if (distance < influenceRadius) {  // Utiliser influenceRadius pour la zone d'influence
    //             const strength = (1 - distance / influenceRadius) * 0.3;  // Utiliser influenceRadius pour la force de déformation
    //             positions[ix] += (Math.random() - 0.5) * strength;
    //             positions[ix + 1] += (Math.random() - 0.5) * strength;
    //             positions[ix + 2] += (Math.random() - 0.5) * strength;
    //         }
    //     }

    //     particles.geometry.attributes.position.needsUpdate = true;
    // }
    controls.update();
    renderer.render(scene, camera);
}