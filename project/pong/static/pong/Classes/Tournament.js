import { THREE } from '../three.module.js';
import { TWEEN } from '../three.module.js';
import { FontLoader } from '../FontLoader.js';
import { Text3d } from './text3d.js';
import { Arena } from './arena.js';
// import { SkeletonHelper } from '../threejs/Three.js';

export class TournamentMenu {
    constructor(threeRoot) {
        this.threeRoot = threeRoot;
        this.tournamentId = null;
        this.tournamentPools = [];
        this.totalWidth = 1500;

        this.initialize();
    }

    // Méthode asynchrone pour initialiser les étapes
    async initialize() {
        // Attendre la fin de createTournament
        await this.createTournament();
        // Ensuite appeler getNextPool
        await this.getNextPool();

        // await this.getNextPool();
    }

    initializeTournamentPool(tournamentGames) {
        console.log('Lower Previous Group Called');
        this.lowerPreviousPools();
        
        console.log('Lower Previous New Tournament Pool');
        const newPool = new TournamentPool(this.threeRoot, tournamentGames, this.tournamentId, this.totalWidth);
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
    async createTournament() {
        try {
            const response = await fetchJSON('/database/testTournament');
            this.tournamentId = response.tournament_id;
            console.log('Tournament ID: ', this.tournamentId);
            this.initializeTournamentPool(response.games);
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
                const response = await sendJSON(`/database/testNextPool`, data);
                const parsedResponse = JSON.parse(response);
                console.log('getNextPool Response: ', typeof(parsedResponse),parsedResponse);
                console.log('getNextPool Response: tournament_id: ', parsedResponse.tournament_id);
                console.log('getNextPool Response: games: ', parsedResponse.games);
                this.initializeTournamentPool(parsedResponse.games);
        } catch (error) {
            console.error('Error sending JSON: ', error);
        }
    }
}


class TournamentGame {
    constructor(threeRoot, playerNameOne, playerNameTwo, gameId, font) {
        this.isPlayed = false;
        this.gameId = gameId;
        this.colorPalette = [
            new THREE.Color(0xff00c1),
            new THREE.Color(0x9600ff),
            new THREE.Color(0x4900ff),
            new THREE.Color(0x00b8ff),
            new THREE.Color(0x00fff9)
        ];
        this.players = new Map();
        this.tournamentGameGroup = new THREE.Group();
        this.arena = new Arena(150, 5, 85, this.colorPalette[3], this.colorPalette[0], 5, 5, 0x4900ff);
        this.arena.group.translateY(0);
        this.arena.group.rotation.x = Math.PI / 2; // Rotation de 90° autour de l'axe Y
        const zoneGeometry = new THREE.PlaneGeometry(150, 85);
        const zoneMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xdddddd, 
            side: THREE.DoubleSide, 
            transparent: true, 
            opacity: 0 // Opacité a regler
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
        this.players.set(playerNameOne, p1Text);


        p1Text.addToGroup(this.tournamentGameGroup);
        p2Text.addToGroup(this.tournamentGameGroup);
        this.arena.addToGroup(this.tournamentGameGroup);
        // Ajout des sources de lumière
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
        this.directionalLight.position.set(0, -50, 50);
        // this.scene.add(this.directionalLight);
        // this.scene.add(this.directionalLight.target);
        this.tournamentGameGroup.add(this.directionalLight);
        this.tournamentGameGroup.add(this.directionalLight.target);
        // this.tournamentGameGroup.add(this.p1Text);
        // this.tournamentGameGroup.add(this.p2Text);
        this.tournamentGameGroup.add(this.clickableZone);
        // this.gameId = this.generateUniqueId();
    }
    updateBoundingBox() {
        this.boundingBox.setFromObject(this.clickableZone); // Recalculer la bounding box si nécessaire
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
}

class TournamentPool {
    constructor(threeRoot, tournamentGames, tournamentId, totalWidth) {
        this.threeRoot = threeRoot;
        this.tournamentPoolGroup = new THREE.Group();
        this.gamesMap = new Map();
        this.tournamentId = tournamentId;
        this.poolWidth = totalWidth;

        tournamentGames.forEach((game, index) => {
            const { players, game_id } = game;
            this.initializeGame(players, game_id, index, tournamentGames.length);
        });

        this.threeRoot.scene.add(this.tournamentPoolGroup);
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
                this.tournamentPoolGroup.add(game.tournamentGameGroup);

                const key = `${playerNameOne}-${playerNameTwo}`;
                this.gamesMap.set(key, game);
            }
        );
    }

    getGameByPlayerNames(playerNameOne, playerNameTwo) {
        const key = `${playerNameOne}-${playerNameTwo}`;
        return this.gamesMap.get(key);
    }
    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.threeRoot.camera);
        const intersects = this.raycaster.intersectObjects(this.tournamentPoolGroup.children, true);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            this.handleGameClick(clickedObject);
        }
    }

    handleGameClick(clickedObject) {
        const game = this.getGameByClickableZone(clickedObject);
        if (game && !game.isPlayed) {
            this.playGame(game);
        }
    }

    playGame(game) {
        console.log(`Playing game: ${game.gameId}`);

        game.setWinner('Player1', 'Player2');
        game.isPlayed = true;

        game.clickableZone.visible = false;
    }

    getGameByClickableZone(clickedObject) {
        for (let [key, game] of this.gamesMap) {
            if (game.clickableZone === clickedObject) {
                return game;
            }
        }
        return null;
    }
}