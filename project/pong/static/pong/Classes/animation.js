import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.11.5/dist/gsap.min.js';

// Initialisation de la scène, caméra, et rendu
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 500;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Charger la police et créer le texte 3D
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new TextGeometry('Hello', {
        font: font,
        size: 80,
        height: 5,
        curveSegments: 12,
        bevelEnabled: false
    });

    const vertices = textGeometry.attributes.position.array;
    const totalVertices = textGeometry.attributes.position.count;

    // Diviser les particules en groupes
    const groupSize = Math.floor(totalVertices / 3); // Par exemple, 3 objets distincts
    const particleGroups = [[], [], []];

    for (let i = 0; i < totalVertices; i++) {
        const vertex = new THREE.Vector3(
            vertices[i * 3],
            vertices[i * 3 + 1],
            vertices[i * 3 + 2]
        );

        // Répartition des particules entre les groupes
        const groupIndex = Math.floor(i / groupSize);
        particleGroups[groupIndex].push(vertex);
    }

    createParticleObjects(particleGroups);
});

function createParticleObjects(particleGroups) {
    const particleMaterials = [];

    for (let i = 0; i < particleGroups.length; i++) {
        const group = particleGroups[i];

        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(group.length * 3);

        for (let j = 0; j < group.length; j++) {
            positions[j * 3] = group[j].x;
            positions[j * 3 + 1] = group[j].y;
            positions[j * 3 + 2] = group[j].z;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({ size: 1, color: Math.random() * 0xffffff });
        particleMaterials.push(material);

        const particles = new THREE.Points(particleGeometry, material);
        scene.add(particles);
    }

    // Créer et animer vers de nouvelles formes
    const targetShapes = [
        generateSphereVertices(50, 32, 32),
        generateCubeVertices(100),
        generateTorusVertices(30, 10, 16, 100)
    ];

    animateParticlesToForm(particleGroups, targetShapes);
}

function animateParticlesToForm(particleGroups, targetShapes) {
    for (let i = 0; i < particleGroups.length; i++) {
        const positions = particleGroups[i].geometry.attributes.position.array;
        const targetVertices = targetShapes[i];

        for (let j = 0; j < positions.length / 3; j++) {
            gsap.to(positions, {
                [j * 3]: targetVertices[j * 3],
                [j * 3 + 1]: targetVertices[j * 3 + 1],
                [j * 3 + 2]: targetVertices[j * 3 + 2],
                duration: 2,
                ease: "power4.inOut",
                onUpdate: () => particleGroups[i].geometry.attributes.position.needsUpdate = true
            });
        }
    }
}

function generateSphereVertices(radius, widthSegments, heightSegments) {
    const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    return sphereGeometry.attributes.position.array;
}

function generateCubeVertices(size) {
    const cubeGeometry = new THREE.BoxGeometry(size, size, size);
    return cubeGeometry.attributes.position.array;
}

function generateTorusVertices(radius, tube, radialSegments, tubularSegments) {
    const torusGeometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
    return torusGeometry.attributes.position.array;
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
