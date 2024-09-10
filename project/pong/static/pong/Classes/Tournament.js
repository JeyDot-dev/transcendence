import { THREE } from '../three.module.js';
import { TWEEN } from '../three.module.js';
import { FontLoader } from '../FontLoader.js';
import { Text3d } from './text3d.js';
import { Arena } from './arena.js';
// import { SkeletonHelper } from '../threejs/Three.js';

export class TournamentMenu {
    constructor(threeRoot, background, socketManager, t_id) {
        this.threeRoot = threeRoot;
        this.background = background;
        this.socketManager = socketManager;
        this.tournamentId = t_id;
        this.tournamentPools = [];
        this.totalWidth = 1500;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.clickableGroup = new THREE.Group();
        this.onMouseClickBound = this.onMouseClick.bind(this); // Créer une seule référence liée ici

        this.socketManager.setLastMenu(this);
        this.initialize();
    }

    async initialize() {
        await this.createTournament();
        await this.getNextPool();
    }

    initializeTournamentPool(tournamentGames) {
        console.log('Lower Previous Group Called');
        this.lowerPreviousPools();
        
        console.log('Lower Previous New Tournament Pool');
        const newPool = new TournamentPool(this.threeRoot, tournamentGames, this.tournamentId, this.totalWidth, this);
        this.totalWidth -= this.totalWidth / 3;

        console.log('Lower Previous Push Called');
        this.tournamentPools.push(newPool);
    }
    lowerPreviousPools() {
        this.tournamentPools.forEach(pool => {
            console.log('Lower Previous Group: ', pool);
            pool.tournamentPoolGroup.position.z -= 250;
            // new TWEEN.Tween(pool.tournamentPoolGroup.position)
            //     .to({ z: -250 }, 1000)
            //     .easing(TWEEN.Easing.Quadratic.Out)
            //     .start();
            // pool.tournamentPoolGroup.children.forEach(gameGroup => {
            //     const targetY = gameGroup.position.y - 200;
                
            //     new TWEEN.Tween(gameGroup.position)
            //         .to({ y: targetY }, 1000)
            //         .easing(TWEEN.Easing.Quadratic.Out)
            //         .start();
            // });
        });
    }
    hide() {
        this.tournamentPools.forEach(pool => {
            pool.tournamentPoolGroup.visible = false;
        });
        if (this.background) {
            this.background.hide();
        }
        this.disableClicks();
        console.log('All tournament objects are hidden, and clicks are disabled.');
    }

    show() {
        this.tournamentPools.forEach(pool => {
            pool.tournamentPoolGroup.visible = true;
        });
        if (this.background) {
            this.background.show();
        }
        this.enableClicks();
        console.log('All tournament objects are visible, and clicks are enabled.');
    }

    disableClicks() {
        document.removeEventListener('click', this.onMouseClickBound, false);
        console.log('Clicks are disabled.');
    }

    enableClicks() {
        document.addEventListener('click', this.onMouseClickBound, false);
        console.log('Clicks are enabled.');
    }
    onMouseClick(event) {
        const canvasBounds = this.threeRoot.renderer.domElement.getBoundingClientRect();

        this.mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
        this.mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.threeRoot.camera);
        const intersects = this.raycaster.intersectObjects(this.clickableGroup.children, true);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            this.handleGameClick(clickedObject);
        }
    }

    handleGameClick(clickedObject) {
        const currentPool = this.tournamentPools[this.tournamentPools.length - 1];
        const game = currentPool.getGameByClickableZone(clickedObject);
        if (game && !game.isPlayed) {
            this.playGame(game);
        }
    }
    
    async playGame(game) {
        console.log('Jouer le jeu avec les joueurs: ', game.playerNameOne, game.playerNameTwo, game.gameId);
        this.clickableGroup.remove(game.clickableZone);
        this.clickableGroup.visible = false;
        this.disableClicks();
        await this.threeRoot.tweenCamera({
            fov: 60,
            near: 0.5,
            far: 3000,
            position: { x: game.clickableZone.position.x, y: -300, z: 100 },
            lookAt: { x: game.clickableZone.position.x, y: 0, z: 0 }
        }, 2000);
        
        this.hide();
        game.isPlayed = true;
        
        this.socketManager.connectCustomGame(game.gameId);
        // this.socketManager.game.changePlayerName(game.playerNameOne, game.playerNameTwo);
        await this.socketManager.waitForGameEnd();
        this.clickableGroup.visible = true;
        this.enableClicks();

        console.log(`La partie avec les joueurs ${game.playerNameOne} et ${game.playerNameTwo} est terminée.`);
        // this.show();


        // this.clickableGroup.visible = false;
        // this.socketManager.connectLocalGame();

        this.checkPoolCompletion();
    }

    checkPoolCompletion() {
        const currentPool = this.tournamentPools[this.tournamentPools.length - 1];
        let allGamesPlayed = true;

        // Vérifier si toutes les parties de la pool actuelle sont jouées
        currentPool.gamesMap.forEach((game) => {
            if (!game.isPlayed) {
                allGamesPlayed = false;
            }
        });

        if (allGamesPlayed) {
            console.log('Toutes les parties de la pool actuelle sont jouées. Chargement de la prochaine pool...');
            this.getNextPool();
        }
    }

    async createTournament(t_id) {
        try {
            const url = '/database/NextPool/' + this.tournamentId;
            const response = await fetchJSON(url);
            console.log('Tournament ID: ', this.tournamentId);
            console.log("Tournament: " + response);
            this.initializeTournamentPool(response.games);
            this.enableClicks();
        } catch (error) {
            console.error('Error getting tournament:', error);
        }
    }
    async sendGameResult(winner, loser, gameId) {
        const response = await sendJSON(`/game_result/${gameId}/`, {
            body: JSON.stringify({ winner, loser })
        });
        return response;
    }
    async getNextPool() {
        try {
                console.log('Tournament Id to testNextPool front: ', this.tournamentId);
                const data = {
                    tournamentId: this.tournamentId
                }
                const response = await sendJSON("/database/NextPool/" + this.tournamentId, data);
                const parsedResponse = JSON.parse(response);
                console.log('getNextPool Response: ', typeof(parsedResponse),parsedResponse);
                console.log('getNextPool Response: tournament_id: ', parsedResponse.tournament_id);
                console.log('getNextPool Response: games: ', parsedResponse.games);
                this.initializeTournamentPool(parsedResponse.games);
        } catch (error) {
            console.error('Error sending JSON: ', error);
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
}

class TournamentPool {
    constructor(threeRoot, tournamentGames, tournamentId, totalWidth, tournamentMenu) {
        this.tournamentMenu = tournamentMenu;
        this.threeRoot = threeRoot;
        this.tournamentPoolGroup = new THREE.Group();
        this.gamesMap = new Map();
        this.tournamentId = tournamentId;
        this.poolWidth = totalWidth;
        // this.mouse = new THREE.Vector2();
        // this.raycaster = new THREE.Raycaster();
        // this.clickableGroup = new THREE.Group();

        tournamentGames.forEach((game, index) => {
            const { players, game_id } = game;
            this.initializeGame(players, game_id, index, tournamentGames.length);
        });

        this.threeRoot.scene.add(this.tournamentPoolGroup);
        this.threeRoot.scene.add(this.tournamentMenu.clickableGroup);

        // document.addEventListener('click', this.onMouseClick.bind(this), false);
    }

    initializeGame(playerPair, gameId, index, totalGames) {
        // const totalWidth = 1500;
        const spacing = this.poolWidth / (totalGames - 1);
        const startX = -(this.poolWidth / 2);

        const fontLoader = new FontLoader();
        fontLoader.load(
            './static/assets/LEMON_MILK_Regular.json',
            (font) => {
                const [playerNameOne, playerNameTwo] = playerPair;

                const game = new TournamentGame(this.threeRoot, playerNameOne, playerNameTwo, gameId, font);

                game.tournamentGameGroup.position.x = startX + index * spacing;
                game.clickableZone.position.x = startX + index * spacing;
                // game.directionalLight.position.x = startX + index * spacing;
                this.tournamentPoolGroup.add(game.tournamentGameGroup);
                
                this.tournamentMenu.clickableGroup.add(game.clickableZone);

                const key = `${playerNameOne}-${playerNameTwo}`;
                this.gamesMap.set(key, game);
                console.log('Game position in scene: ', game.clickableZone.position);
                console.log('Light position in scene: ', game.directionalLight.position);
            }
        );
    }

    getGameByPlayerNames(playerNameOne, playerNameTwo) {
        const key = `${playerNameOne}-${playerNameTwo}`;
        return this.gamesMap.get(key);
    }
    // onMouseClick(event) {
    //     const canvasBounds = this.threeRoot.renderer.domElement.getBoundingClientRect();

    //     // Calculer la position de la souris en fonction de la taille du canvas (pas de la fenêtre)
    //     this.mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    //     this.mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;
    //     console.log('Click in tournament Menu. Mouse: ', this.mouse);

    //     // Utiliser uniquement les objets dans clickableGroup
    //     this.raycaster.setFromCamera(this.mouse, this.threeRoot.camera);
    //     const intersects = this.raycaster.intersectObjects(this.clickableGroup.children, true);

    //     if (intersects.length > 0) {
    //         const clickedObject = intersects[0].object;
    //         console.log('ClickedObject: ', clickedObject);
    //         this.handleGameClick(clickedObject);
    //     }
    // }

    // handleGameClick(clickedObject) {
    //     const game = this.getGameByClickableZone(clickedObject);
    //     if (game && !game.isPlayed) {
    //         console.log('Playing game: ', game.playerNameOne, game.playerNameTwo, game.gameId);
    //         this.playGame(game);
    //     }
    // }
    // async playGame(game) {
    //     // console.log(`Playing game: ${game.gameId}`);
    //     console.log('Game Position: ', game.tournamentGameGroup.position);
    //     await this.threeRoot.tweenCamera({
    //         fov: 60,
    //         near: 0.5,
    //         far: 3000,
    //         position: { x: -750, y: -300, z: 100},
    //         lookAt: { x: -750, y: 0, z: 0 }
    //     }, 2000);
    //     this.tournamentMenu.hide();
    //     game.isPlayed = true;

    //     game.clickableZone.visible = false;
    // }
    // launchGame() {
    //     console.log('Placeholder for launching a ws game');
    // }

    getGameByClickableZone(clickedObject) {
        for (let [key, game] of this.gamesMap) {
            if (game.clickableZone === clickedObject) {
                return game;
            }
        }
        return null;
    }
}


class TournamentGame {
    constructor(threeRoot, playerNameOne, playerNameTwo, gameId, font) {
        this.isPlayed = false;
        this.gameId = gameId;
        this.playerNameOne = playerNameOne;
        this.playerNameTwo = playerNameTwo;
        this.colorPalette = [
            new THREE.Color(0xff00c1),
            new THREE.Color(0x9600ff),
            new THREE.Color(0x4900ff),
            new THREE.Color(0x00b8ff),
            new THREE.Color(0x00fff9)
        ];
        this.tournamentGameGroup = new THREE.Group();
        this.arena = new Arena(150, 5, 85, this.colorPalette[3], this.colorPalette[0], 5, 5, 0x4900ff);
        // this.arena.group.translateY(0);
        this.arena.group.rotation.x = Math.PI / 2; // Rotation de 90° autour de l'axe Y
        const zoneGeometry = new THREE.PlaneGeometry(180, 120);
        const zoneMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xdddddd, 
            side: THREE.DoubleSide, 
            transparent: true, 
            opacity: 0.8 // Opacité a regler
        });

        this.clickableZone = new THREE.Mesh(zoneGeometry, zoneMaterial);
        this.clickableZone.position.set(0, 0, 0);
        this.clickableZone.rotation.x = Math.PI / 2;

        const p1TextPosition = new THREE.Vector3(0, 0, 60);
        const p2TextPosition = new THREE.Vector3(0, 0, -100);
        const p1Text = new Text3d(
            threeRoot.camera,
            this.scene,
            font,
            35,
            10,
            this.colorPalette[0],
            playerNameOne,
            1.02,
            p1TextPosition,
            new THREE.Vector3(Math.PI / 2, 0, 0));
        const p2Text = new Text3d(
            threeRoot.camera,
            this.scene,
            font,
            35,
            10,
            this.colorPalette[3],
            playerNameTwo,
            1.02,
            p2TextPosition,
            new THREE.Vector3(Math.PI / 2, 0, 0));
        // this.players.set(playerNameOne, p1Text);
        // this.players.set(playerNameTwo, p2Text);


        p1Text.addToGroup(this.tournamentGameGroup);
        p2Text.addToGroup(this.tournamentGameGroup);
        this.arena.addToGroup(this.tournamentGameGroup);
        // Ajout des sources de lumière
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.15);
        this.directionalLight.target = this.arena.group;
        this.directionalLight.position.set(
            this.arena.group.position.x, 
            this.arena.group.position.y - 100,  // Adjust Y to place light above the game
            this.arena.group.position.z + 200   // Adjust Z to move the light in front of the game
        );
        const DirectionalLightHelper = new THREE.DirectionalLightHelper(this.directionalLight, 100);
        const geometry = new THREE.BoxGeometry(5, 5, 5);  // Dimensions de 5x5x5
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });  // Matériau de base, rouge
        const cube = new THREE.Mesh(geometry, material);  // Création du mesh
        
        cube.position.set(0, 0, 0);
        this.tournamentGameGroup.add(cube);
        // this.scene.add(this.directionalLight);
        // this.scene.add(this.directionalLight.target);
        this.tournamentGameGroup.add(this.directionalLight);
        this.tournamentGameGroup.add(this.directionalLight.target);
        this.tournamentGameGroup.add(DirectionalLightHelper);
        // this.tournamentGameGroup.add(this.p1Text);
        // this.tournamentGameGroup.add(this.p2Text);
        this.tournamentGameGroup.add(this.clickableZone);
        // this.gameId = this.generateUniqueId();
        // this.spotLight = new THREE.SpotLight(0xffffff);
        // this.spotLight.position.set(0, -200, 200);  // Position de la lumière
        // this.spotLight.target = this.arena.group;
        // this.spotLight.angle = Math.PI / 8;       // Angle d'éclairage (cône)
        // this.spotLight.penumbra = 0.5;            // Douceur des bords
        // this.spotLight.decay = 2;                 // L'atténuation de la lumière
        // this.spotLight.distance = 500;             // Distance maximale de l'éclairage
        // this.spotLight.intensity = 2;
        // this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
        // this.tournamentGameGroup.add(this.spotLight);
        // this.tournamentGameGroup.add(this.spotLightHelper);
        
        // Position du cube (optionnelle)
    }
    generateUniqueId() {
        return '_' + Math.random().toString(36).slice(2, 11);
    }
    setGroupOpacity(opacity) {
        this.tournamentGameGroup.traverse((child) => {
            if (child.isMesh) { // Vérifier si l'objet est un Mesh avec un matériau
                if (child.material) {
                    child.material.transparent = true; // Activer la transparence si nécessaire
                    child.material.opacity = opacity;  // Appliquer l'opacité
                }
            }
        });
    }
    setWinner(winner, loser) {

    }
    addclickableToGroup(group) {
        group.add(this.clickableZone);
    }
}
