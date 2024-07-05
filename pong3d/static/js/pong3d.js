// import * as THREE from 'three';
// import { Paddle } from './Paddle.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Script pong3d.js chargé');

    // Initialisation de la scène, de la caméra et du renderer avec antialiasing activé
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    console.log('Renderer ajouté au DOM');

    // // Ajout d'OrbitControls
    // var controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true; // Permet un mouvement fluide
    // controls.dampingFactor = 0.25;
    // controls.screenSpacePanning = false;
    // controls.enableKeys = false;

    // ORBIT: Ajouter des contrôles Trackball
    const controls = new THREE.TrackballControls(camera, renderer.domElement);
	controls.rotateSpeed = 5.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

    // LIGHT: Ajouter une lumière directionnelle
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    // directionalLight.position.set(5, 5, 5).normalize();
    // scene.add(directionalLight);

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
    document.getElementById('resetButton').addEventListener('click', function() {
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
	const gridHelper = new THREE.GridHelper(10, 10); // Taille de la grille et nombre de divisions
	gridHelper.rotation.x = Math.PI / 2;
	scene.add(gridHelper);	
    // Création de la balle
    // var ballSize = 0.1;
    // var ballSpeed = 0.02;
    // var ballGeometry = new THREE.SphereGeometry(ballSize, 32, 32);
    // var ballMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    // var ball = new THREE.Mesh(ballGeometry, ballMaterial);
    // ball.position.set(0, 0, 0);
    // scene.add(ball);
    // console.log('Balle ajoutée à la scène');

    // // Creation du palet
    // var radiusTop = 0.1; // Rayon du dessus
    // var radiusBottom = 0.1; // Rayon du dessous (identique au dessus pour un disque)
    // var puckSize = 0.1;
    // var height = 0.05; // Hauteur du cylindre, faible pour simuler un palet
    // var radialSegments = 32; // Segments radiaux pour une surface lisse
    // var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    // // Créer le matériau du palet
    // var material = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Bleu
    // // Créer le maillage du palet

	// PUCK: Creation du puck
    var puck = new Puck(scene, 0.1, 0.05, 0xff0000, 0.1, new THREE.Vector3(0, 0, -0.05));
    scene.add(puck.getMesh());
	// scene.add(puck.getBoxHelper());

    // Création des bords
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

    scene.add(borderTop);
    scene.add(borderBottom);
    scene.add(borderLeft);
    scene.add(borderRight);
    console.log('Bords ajoutés à la scène');

    // Position de la caméra
    camera.position.z = 5;

    // Variables de mouvement
    // var ballDirection = new THREE.Vector3(ballSpeed, ballSpeed, 0);
    // var puckDirection = new THREE.Vector3(puckSpeed, puckSpeed, 0);

    // Drapeaux pour les touches de déplacement
    var moveLeft1 = false, moveRight1 = false;
    var moveLeft2 = false, moveRight2 = false;
    var pause = true;

    // Gestion des mouvements des paddles
    document.addEventListener('keydown', function(event) {
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
        // var rotationSpeed = 0.1;
        // switch(event.code) {
        //     case 'ArrowLeft': // Rotation sur l'axe X -
        //         camera.rotation.x -= rotationSpeed;
        //         break;
        //     case 'ArrowRight': // Rotation sur l'axe X +
        //         camera.rotation.x += rotationSpeed;
        //         break;
        //     case 'Numpad4': // Rotation sur l'axe Y -
        //         camera.rotation.y -= rotationSpeed;
        //         break;
        //     case 'Numpad6': // Rotation sur l'axe Y +
        //         camera.rotation.y += rotationSpeed;
        //         break;
        //     case 'Numpad1': // Rotation sur l'axe Z -
        //         camera.rotation.z -= rotationSpeed;
        //         break;
        //     case 'Numpad3': // Rotation sur l'axe Z +
        //         camera.rotation.z += rotationSpeed;
        //         break;
        //     }
        // controls.update();
        // Mise à jour des contrôles pour prendre en compte la nouvelle rotation
    });

    document.addEventListener('keyup', function(event) {
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

    // Fonction de mise à jour des scores
    // function updateScores() {
    //     // document.getElementById('score1').innerText = score1;
    //     // document.getElementById('score2').innerText = score2;
    // }

    // Création de l'explosion
    // var particleCount = 100;
    // var particles = new THREE.BufferGeometry();
    // var positions = new Float32Array(particleCount * 3);
    // var velocities = new Float32Array(particleCount * 3);
    // var colors = new Float32Array(particleCount * 3);

    // for (var i = 0; i < particleCount; i++) {
    //     positions[i * 3] = 0;
    //     positions[i * 3 + 1] = 0;
    //     positions[i * 3 + 2] = 0;

    //     velocities[i * 3] = (Math.random() - 0.5) * 2;
    //     velocities[i * 3 + 1] = (Math.random() - 0.5) * 2;
    //     velocities[i * 3 + 2] = (Math.random() - 0.5) * 2;

    //     colors[i * 3] = Math.random();
    //     colors[i * 3 + 1] = Math.random();
    //     colors[i * 3 + 2] = Math.random();
    // }

    // particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    // particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    // particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // var particleMaterial = new THREE.PointsMaterial({
    //     size: 0.1,
    //     vertexColors: true
    // });

    // var particleSystem = new THREE.Points(particles, particleMaterial);
    // scene.add(particleSystem);

    // function triggerExplosion(position) {
    //     for (var i = 0; i < particleCount; i++) {
    //         particles.attributes.position.array[i * 3] = position.x;
    //         particles.attributes.position.array[i * 3 + 1] = position.y;
    //         particles.attributes.position.array[i * 3 + 2] = position.z;

    //         particles.attributes.velocity.array[i * 3] = (Math.random() - 0.5) * 2;
    //         particles.attributes.velocity.array[i * 3 + 1] = (Math.random() - 0.5) * 2;
    //         particles.attributes.velocity.array[i * 3 + 2] = (Math.random() - 0.5) * 2;
    //     }
    //     particles.attributes.position.needsUpdate = true;
    //     particles.attributes.velocity.needsUpdate = true;
    // }

    // Fonction de réinitialisation de la balle
    // function resetBall() {
    //     ballSpeed = 0.02;
    //     ball.position.set(0, 0, 0);
    //     ballDirection.set(ballSpeed * (Math.random() > 0.5 ? 1 : -1), ballSpeed * (Math.random() > 0.5 ? 1 : -1), 0);
    // }

    // Reset du puck
    // function resetPuck() {
    //     puckSpeed = 0.02;
    //     puck.position.set(0, 0, -0.05);
    //     puckDirection.set(puckSpeed * (Math.random() > 0.5 ? 1 : -1), puckSpeed * (Math.random() > 0.5 ? 1 : -1), 0);
    // }

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
            updateScoreP2Text(score2);
            // triggerExplosion(puck.position.clone());
			var explo = new Explosion(scene, 100, 0.1, 2);
			explo.trigger(puck.position);
            // updateScores();
            puck.reset();
        }
		
        if (puck.position.y + puck.size >= 3) {
			score1++;
            updateScoreP1Text(score1);
            // triggerExplosion(puck.position.clone());
			var explo = new Explosion(scene, 100, 0.1, 2);
			explo.trigger(puck.position);
            // updateScores();
            puck.reset();
        }
    }

    // Charger la police pour afficher le texte
    const fontLoader = new THREE.FontLoader();
    var p1ScoreText, p2ScoreText, timeText, loadedFont;
    
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        loadedFont = font;
        const textGeometry = new THREE.TextGeometry('0s', {
            font: loadedFont,
            size: 0.5,
            height: 0.1,
            curveSegments: 12,
        });
        const textP1Geometry = new THREE.TextGeometry('0', {
            font: loadedFont,
            size: 0.5,
            height: 0.1,
            curveSegments: 12,
        });
        const textP2Geometry = new THREE.TextGeometry('0', {
            font: loadedFont,
            size: 0.5,
            height: 0.1,
            curveSegments: 12,
        });
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const textP1Material = new THREE.MeshStandardMaterial({ color: 0x33ccff });
        const textP2Material = new THREE.MeshStandardMaterial({ color: 0xff2975 });
        timeText = new THREE.Mesh(textGeometry, textMaterial);
        p1ScoreText = new THREE.Mesh(textP1Geometry, textP1Material);
        p2ScoreText = new THREE.Mesh(textP2Geometry, textP2Material);
        timeText.position.set(-0.2, 0, 3);
        timeText.rotation.x = Math.PI / 2;
        p1ScoreText.position.set(-2.2, 0, 3);
        p1ScoreText.rotation.x = Math.PI / 2;
        p2ScoreText.position.set(2, 0, 3);
        p2ScoreText.rotation.x = Math.PI / 2;
        scene.add(timeText);
        scene.add(p1ScoreText);
        scene.add(p2ScoreText);
    });
    // Fonction pour mettre à jour le texte du temps écoulé
    
    function updateTimeText(elapsedTime) {
        if (timeText && loadedFont) {
            scene.remove(timeText);
            const textGeometry = new THREE.TextGeometry(`${Math.floor(elapsedTime)}s`, {
                font: loadedFont,
                size: 0.5,
                height: 0.1,
                curveSegments: 12,
            });
            const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
            timeText = new THREE.Mesh(textGeometry, textMaterial);
            timeText.position.set(-0.2, 0, 3);
            timeText.rotation.x = Math.PI / 2;
            scene.add(timeText);
        }
    }
    function updateScoreP1Text(p1Score) {
        if (p1ScoreText && loadedFont) {
            scene.remove(p1ScoreText);
            const textP1Geometry = new THREE.TextGeometry(p1Score.toString(), {
                font: loadedFont,
                size: 0.5,
                height: 0.1,
                curveSegments: 12,
            });
            const textP1Material = new THREE.MeshStandardMaterial({ color: 0x33ccff });
            p1ScoreText = new THREE.Mesh(textP1Geometry, textP1Material);
            p1ScoreText.position.set(-2.2, 0, 3);
            p1ScoreText.rotation.x = Math.PI / 2;
            scene.add(p1ScoreText);
        }
    }
    function updateScoreP2Text(p2Score) {
        if (p2ScoreText && loadedFont) {
            scene.remove(p2ScoreText);
            const textP2Geometry = new THREE.TextGeometry(p2Score.toString(), {
                font: loadedFont,
                size: 0.5,
                height: 0.1,
                curveSegments: 12,
            });
            const textP2Material = new THREE.MeshStandardMaterial({ color: 0xff2975 });
            p2ScoreText = new THREE.Mesh(textP2Geometry, textP2Material);
            p2ScoreText.position.set(2, 0, 3);
            p2ScoreText.rotation.x = Math.PI / 2;
            scene.add(p2ScoreText);
        }
    }

    const timeLimit = 120;
    var startTime = Date.now();
    var elapsedTime = 0;
    var endGame = false;
    // Fonction pour vérifier le temps écoulé
    function checkTime() {
        elapsedTime = (Date.now() - startTime) / 1000; // Temps écoulé en secondes
        updateTimeText(elapsedTime)
        if (elapsedTime >= timeLimit) {
            endGame = true;
        }
    }

    // Fonction d'animation
    var animate = function() {
        requestAnimationFrame(animate);

		// paddle1.updateBoxHelper();
		// paddle2.updateBoxHelper();
		// puck.updateBoxHelper();

        if (!pause && !endGame) {
            // Mise à jour des positions des paddles
            if (moveLeft1) paddle1.move(new THREE.Vector3 (-1, 0, 0));
            if (moveRight1) paddle1.move(new THREE.Vector3 (1, 0, 0));
            if (moveLeft2) paddle2.move(new THREE.Vector3 (-1, 0, 0));
            if (moveRight2) paddle2.move(new THREE.Vector3 (1, 0, 0));

            puck.move();
            checkCollision();
            checkTime();

            // // Mise à jour des particules pour l'explosion
            // var positions = particles.attributes.position.array;
            // var velocities = particles.attributes.velocity.array;
            // for (var i = 0; i < particleCount; i++) {
            //     positions[i * 3] += velocities[i * 3] * 0.1;
            //     positions[i * 3 + 1] += velocities[i * 3 + 1] * 0.1;
            //     positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.1;
            // }
            // particles.attributes.position.needsUpdate = true;
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

    // Initialiser les scores
    // updateScores();
    // Initialiser la position de puck
    puck.reset();

    animate();
    console.log('Animation démarrée');
});
