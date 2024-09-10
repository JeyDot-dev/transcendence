import { THREE } from '../three.module.js';
import { FontLoader } from '../FontLoader.js';
import { Text3d } from './text3d.js';
import { BouncingBallInCube } from './background.js';
import { SocketManager } from './SocketManager.js';
import { TournamentMenu } from './Tournament.js';

export class Menu {
    constructor(threeRoot, socketManager) {
        this.threeRoot = threeRoot;
        this.scene = threeRoot.scene;
        this.camera = threeRoot.camera;
        this.renderer = threeRoot.renderer;
        this.socketManager = socketManager;
        this.menuGroup = new THREE.Group();

        this.mouseControlEnabled = true;
        this.canvasBounds = this.threeRoot.renderer.domElement.getBoundingClientRect();
        this.showMenuEnabled = true;

        // Configuration de la caméra pour le menu
        // threeRoot.updateCameraSettings({
        //     fov: 60,
        //     near: 0.5,
        //     far: 10000,
        //     position: { x: 0, y: -1000, z: 0 },
        //     lookAt: { x: 0, y: 0, z: 0 }
        // });
        // threeRoot.tweenCamera({
        //         fov: 60,
        //         near: 0.5,
        //         far: 10000,
        //         position: { x: 0, y: -1000, z: 0 },
        //         lookAt: { x: 0, y: 0, z: 0 }
        // }, 2000);
        this.tweenCameraToItem();
        // // Charger une image en tant que fond
        // const loader = new THREE.TextureLoader();
        // loader.load('/static/assets/saturne.jpg', function(texture) {
        //     threeRoot.scene.background = texture;
        // });
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.fontLoader = new FontLoader();
        this.menuItems = [];

        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseClick = this.onMouseClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);

        this.colorPalette = [
            new THREE.Color(0xff00c1),
            new THREE.Color(0x9600ff),
            new THREE.Color(0x4900ff),
            new THREE.Color(0x00b8ff),
            new THREE.Color(0x00fff9)
        ];

        // Charger les polices et initialiser les objets du menu
        this.fontLoader.load(
            './static/assets/LEMON_MILK_Regular.json',
            (font) => {
                this.font = font;
                console.log('Init MenuItem');
                this.createMenuItems();
                console.log('Init Background');
                this.background = new BouncingBallInCube(2500, 19, threeRoot, this.menuGroup);
                threeRoot.addAnimatedObject(this.background);
            },
            undefined,
            (error) => {
                console.error('An error occurred loading the font:', error);
            }
        );

        // Ajout des sources de lumière
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(500, -500, 1000);
        this.directionalLight.castShadow = true;
        // this.scene.add(this.directionalLight);
        // this.scene.add(this.directionalLight.target);
        this.menuGroup.add(this.directionalLight);
        this.menuGroup.add(this.directionalLight.target);

        // Ajouter le menu à `threeRoot`
        this.scene.add(this.menuGroup);
        threeRoot.addAnimatedObject(this);

        // Activer l'écoute des événements de clavier
        window.addEventListener('keydown', this.onKeyDown);
        if (this.isMobile()) {
            this.mouseControlEnabled = false;
        }
    }

    tweenCameraToItem() {
        this.threeRoot.tweenCamera({
            fov: 60,
            near: 0.5,
            far: 3000,
            position: { x: 0, y: -1000, z: 0 },
            lookAt: { x: 0, y: 0, z: 0 }
        }, 2000);
    }
    // MOBILE
    isMobile() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    ModalListener = async (myModal) => {
        document.getElementById('submitTournamentForm').addEventListener('click', async (event) => {
            event.preventDefault();
            try {
                const response = await fetchJSON('/pong');
                console.log('response is ' + response);
    
                this.newLocalTournament();
            } catch (error) {
                console.error('Error fetching JSON: ', error);
            }
        });
    }

    // TODO: hauteur du canvas 
    createMenuItems() {
        this.localMenuMain = new MenuItem(this.menuGroup, this.scene, this.camera, this.font, 'Local', this.colorPalette[0], new THREE.Vector3(0, 0, 380), () => {
            this.newLocalGame();
        });
        this.matchmakingMenuMain = new MenuItem(this.menuGroup, this.scene, this.camera, this.font, 'Matchmaking', this.colorPalette[1], new THREE.Vector3(0, 0, 180), () => {
            console.log("Clicked On: Matchmaking");
        });
        this.localTournamentMenuMain = new MenuItem(this.menuGroup, this.scene, this.camera, this.font, 'Local Tournament', this.colorPalette[2], new THREE.Vector3(0, 0, -20), () => {
            console.log("Clicked On: Local Tournament");
            const myModal = new bootstrap.Modal(document.getElementById('myModal'));
            myModal.show();
            this.hideText()
            this.ModalListener(myModal);
        });
        this.tournamentMenuMain = new MenuItem(this.menuGroup, this.scene, this.camera, this.font, 'Tournament', this.colorPalette[3], new THREE.Vector3(0, 0, -220), () => {
            console.log("Clicked On: Tournament");
        });
        this.optionsMenuMain = new MenuItem(this.menuGroup, this.scene, this.camera, this.font, 'Options', this.colorPalette[4], new THREE.Vector3(0, 0, -440), () => {
            console.log("Clicked On: Options");
        });

        this.menuItems = [
            this.localMenuMain,
            this.matchmakingMenuMain,
            this.localTournamentMenuMain,
            this.tournamentMenuMain,
            this.optionsMenuMain
        ];
    }

    show() {
        // Activer les écouteurs d'événements
        window.addEventListener('mousemove', this.onMouseMove, false);
        window.addEventListener('click', this.onMouseClick, false);

        // Rendre les éléments du menu visibles
        this.menuItems.forEach(item => {
            item.textMesh.visible = true;
            item.textGlowTextMesh.visible = true;
        });
        if (this.background) {
            this.background.show();
        }
        if (this.directionalLight) {
            this.directionalLight.visible = true;
        }
    }

    hide() {
        // Désactiver les écouteurs d'événements
        window.removeEventListener('mousemove', this.onMouseMove, false);
        window.removeEventListener('click', this.onMouseClick, false);

        // Masquer les éléments du menu
        this.menuItems.forEach(item => {
            item.textMesh.visible = false;
            item.textGlowTextMesh.visible = false;
            item.removePaddles();
        });
        // Masquer le background
        if (this.background) {
            this.background.hide();
        }
        if (this.directionalLight) {
            this.directionalLight.visible = false;
        }
    }
    hideText() {
        // Désactiver les écouteurs d'événements
        window.removeEventListener('mousemove', this.onMouseMove, false);
        window.removeEventListener('click', this.onMouseClick, false);
        
        // Masquer les éléments du menu
        this.menuItems.forEach(item => {
            item.textMesh.visible = false;
            item.textGlowTextMesh.visible = false;
            item.removePaddles();
        });
        if (this.directionalLight) {
            this.directionalLight.visible = false;
        }
    }

    onMouseMove(event) {
        // if (!this.mouseControlEnabled) return;  // Désactiver le mouvement de la caméra si la souris est désactivée

        this.mouse.x = ((event.clientX - this.canvasBounds.left) / this.canvasBounds.width) * 2 - 1;
        this.mouse.y = -((event.clientY - this.canvasBounds.top) / this.canvasBounds.height) * 2 + 1;

        // CAMERA
        const maxRotationX = Math.PI / 4;
        const maxRotationY = Math.PI / 4;
        const targetRotationX = this.mouse.x * maxRotationX;
        const targetRotationY = this.mouse.y * maxRotationY;

        if (this.mouseControlEnabled) {
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
            this.camera.rotateY(-targetRotationX); // Appliquer la rotation autour de l'axe Y
            this.camera.rotateX(targetRotationY);
        }

        // RAYCASTER
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = [];
        this.menuItems.forEach(item => {
            item.updateBoundingBox(); // Assurez-vous que la bounding box est mise à jour
            const intersection = this.raycaster.ray.intersectBox(item.boundingBox, new THREE.Vector3());
            if (intersection) {
                intersects.push(item);
            }
        });

        // Ajouter les paddles aux éléments survolés
        this.menuItems.forEach(item => item.removePaddles());
        if (intersects.length > 0) {
            const selectedItem = intersects[0];
            selectedItem.addPaddles();
        }
    }

    onMouseClick(event) {
        // this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        // this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        let intersects = [];
        this.menuItems.forEach(item => {
            item.updateBoundingBox();
            const intersection = this.raycaster.ray.intersectBox(item.boundingBox, new THREE.Vector3());
            if (intersection) {
                intersects.push(item);
            }
        });

        if (intersects.length > 0) {
            const selectedItem = intersects[0];
            selectedItem.onClick(); // Appel de la fonction onClick associée à l'item cliqué
        }
    }

    onKeyDown(event) {
        if (event.key === 'c') {
            this.mouseControlEnabled = !this.mouseControlEnabled;  // Basculer l'état du mouvement de la caméra
        }
        if (event.key === 'h') {
            if (this.showMenuEnabled) {
                this.hide();
            } else {
                this.show();
            }
            this.showMenuEnabled = !this.showMenuEnabled;  // Basculer l'état de l'affichage du menu
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    newLocalGame() {
        console.log("Clicked On: Local");
        this.socketManager.connectLocalGame();
        // this.socketManager.setGameId(666);
        // this.socketManager.setType('local');
        this.hide();
    }
    
    newLocalTournament() {
        console.log("Clicked On: Tournament");
        this.hideText();
        this.threeRoot.updateCameraSettings({
            fov: 60,
            near: 0.5,
            far: 3000,
            position: { x: 0, y: -1000, z: 0 },
            lookAt: { x: 0, y: 0, z: 0 }
        }, 2000);
        this.tournamentLocal = new TournamentMenu(this.threeRoot, this.background, this.socketManager);
    }
    returnToMenu() {
        // this.socketManager
        this.show();
    }
}

class MenuItem {
    constructor(group, scene, camera, font, text, color, position, onClick) {
        this.groupRef = group;
        this.scene = scene;
        this.camera = camera;
        this.font = font;
        this.position = position;
        this.onClick = onClick; // Fonction de callback pour le clic
        this.paddles = [];

        this.createText(text, color);
        this.createBoundingBox();
    }

    createText(text, color) {
        // TDODO:
        this.text3d = new Text3d(this.camera, this.scene, this.font, 100, 25, color, text, 1.02, this.position, new THREE.Vector3(Math.PI / 2, 0, 0));
        this.text3d.addToGroup(this.groupRef);
        this.textMesh = this.text3d.mesh;
        this.textGlowTextMesh = this.text3d.glowTextMesh;

        // Centrer le texte après création
        this.text3d.setPosition(this.position);
    }

    createBoundingBox() {
        this.boundingBox = new THREE.Box3().setFromObject(this.textMesh);
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.textMesh); // Recalculer la bounding box si nécessaire
    }

    addPaddles() {
        const paddleSize = new THREE.Vector3();
        paddleSize.x = 15;
        paddleSize.y = this.boundingBox.max.y - this.boundingBox.min.y;
        paddleSize.z = this.boundingBox.max.z - this.boundingBox.min.z - 15;
        const paddleGeometry = new THREE.BoxGeometry(paddleSize.x, paddleSize.y, paddleSize.z);
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                "c": { type: "f", value: 1.0 },
                "p": { type: "f", value: 1.4 },
                glowColor: { type: "c", value: new THREE.Color( { color: 0xffffff } ) },
                viewVector: { type: "v3", value: this.camera.position }
            },
            vertexShader: `
                uniform vec3 viewVector;
                uniform float c;
                uniform float p;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize( normalMatrix * normal );
                    vec3 vNormel = normalize( normalMatrix * viewVector );
                    intensity = pow( c - dot(vNormal, vNormel), p );
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4( glow, 0.9 );
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        
        // Créer le paddle gauche
        const leftPaddle = new THREE.Mesh(paddleGeometry, shaderMaterial);
        leftPaddle.position.set(this.boundingBox.min.x - 50, this.position.y - 80, this.position.z + paddleSize.z / 2);
        // this.scene.add(leftPaddle);
        this.groupRef.add(leftPaddle);


        // Créer le paddle droit
        const rightPaddle = new THREE.Mesh(paddleGeometry, shaderMaterial);
        rightPaddle.position.set(this.boundingBox.max.x + 50, this.position.y - 80, this.position.z + paddleSize.z / 2);
        // this.scene.add(rightPaddle);
        this.groupRef.add(rightPaddle);

        this.paddles.push(leftPaddle, rightPaddle);
    }

    removePaddles() {
        this.paddles.forEach(paddle => this.groupRef.remove(paddle));
        this.paddles = [];
    }
}
