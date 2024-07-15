document.addEventListener('DOMContentLoaded', function() {
    console.log('Script pong3d.js chargé');
    // Créer la scène
    const scene = new THREE.Scene();

    // Créer la caméra
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Créer le rendu
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ajouter un cube pour tester l'éclairage
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Ajouter une lumière directionnelle
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    // Ajouter une lumière ponctuelle
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Ajouter une lumière ambiante
    const ambientLight = new THREE.AmbientLight(0x404040); // Lumière douce
    scene.add(ambientLight);

    // Fonction d'animation
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    // Appeler la fonction d'animation
    animate();
});
