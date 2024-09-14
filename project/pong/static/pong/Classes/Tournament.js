import { THREE } from '../three.module.js';
import { TWEEN } from '../three.module.js';
import { FontLoader } from '../FontLoader.js';
import { Text3d } from './text3d.js';
import { Arena } from './arena.js';
import { BackToMainMenu } from './menu.js';
// import { SkeletonHelper } from '../threejs/Three.js';

export class TournamentMenu {
    constructor(threeRoot, background, socketManager, t_id, mainMenu) {
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

        this.mainMenu = mainMenu;
        this.backToMainMenu = new BackToMainMenu(threeRoot, socketManager, this, 'tournament', mainMenu);
        this.backToMainMenu.initListener();
        this.backToMainMenu.addToScene(this.threeRoot.scene);
        this.socketManager.setLastMenu(this);

        this.initialize();

        this.directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
        this.directionalLight1.position.set(-750, -800, 200);
        this.directionalLight1.target.position.set(300, 0, 0);
        this.directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
        this.directionalLight1.target.position.set(-300, 0, 0);
        this.directionalLight2.position.set(750, -500, 200);

        // const directionalLightHelper1 = new THREE.DirectionalLightHelper(this.directionalLight1);
        // const directionalLightHelper2 = new THREE.DirectionalLightHelper(this.directionalLight2);
        // this.directionalLight.castShadow = true;
        this.threeRoot.scene.add(this.directionalLight1);
        this.threeRoot.scene.add(this.directionalLight2);
        // this.threeRoot.scene.add(directionalLightHelper1);
        // this.threeRoot.scene.add(directionalLightHelper2);

        // this.threeRoot
    }

    async initialize() {
        await this.createTournament();
        // await this.getnextPool();
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
        this.directionalLight1.visible = false;
        this.directionalLight2.visible = false;
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
        this.directionalLight1.visible = true;
        this.directionalLight2.visible = true;
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
            this.backToMainMenu.destroyListener();
            this.playGame(game);
            this.backToMainMenu.initListener();
        }
    }
    async handleGameWinner(game) {
        try {
            const response = await fetchJSON(`/database/game_winner/${game.gameId}/`);
    
            if (response.winner) {
                game.setWinner(response.winner);
                console.log(`Winner of game ${game.gameId}: ${response.winner}`);
            } else {
                console.error(`Erreur de récupération du gagnant pour le jeu ${game.gameId}: ${response.message}`);
            }
        } catch (error) {
            console.error(`Erreur lors de la requête pour le gagnant du jeu ${game.gameId}:`, error);
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
        await this.socketManager.waitForGameEnd();
        await this.handleGameWinner(game);
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

        currentPool.gamesMap.forEach((game) => {
            if (!game.isPlayed) {
                allGamesPlayed = false;
            }
        });

        //if (currentPool.gamesMap.size === 1 && allGamesPlayed) {
        //    console.log('current pool games map: ', currentPool.gamesMap);
        //    console.log('La dernière partie est jouée. Fin du tournoi.');
        //    const lastGame = currentPool.gamesMap.values().next().value;
        //    console.log('Last Game: ', lastGame);
        //    this.endTournament(lastGame);
        //    return;
        //}

        if (currentPool.gamesMap.size === 0 && allGamesPlayed) {
            console.log('La dernière partie est jouée. Fin du tournoi.');
            lastPool = this.tournamentPools[this.tournamentPools.length - 2];
            const lastGame = lastPool.gamesMap.values().next().value;
            console.log('Last Game: ', lastGame);
            this.endTournament(lastGame);
            return;
        }

        if (allGamesPlayed) {
            console.log('Toutes les parties de la pool actuelle sont jouées. Chargement de la prochaine pool...');
            this.getNextPool();
        }
    }
    endTournament(lastGame) {
        this.endTournamentAnimation = new TournamentWinner(this.threeRoot, lastGame.winner);
        setTimeout(() => {
            this.destroy();
            this.threeRoot.scene.remove(this.endTournamentAnimation.textGroup);
            this.socketManager.setLastMenu(this.mainMenu);
            this.socketManager.goToLastMenu();
        }, 3000);
    }
    async createTournament(t_id) {
        try {
            const url = '/database/nextPool/' + this.tournamentId;
            const response = await fetchJSON(url);
            console.log('Tournament ID: ', this.tournamentId);
            console.log("Tournament: ", response);
            this.totalWidth = response.games.length * 200;
            console.log('Tournament sze: ', response.games.length);
            this.initializeTournamentPool(response.games);
            this.enableClicks();
        } catch (error) {
            console.error('Error getting tournament:', error);
        }
    }
    // async sendGameResult(winner, loser, gameId) {
    //     const response = await sendJSON(`/game_result/${gameId}/`, {
    //         body: JSON.stringify({ winner, loser })
    //     });
    //     return response;
    // }
    async getNextPool() {
        try {
                console.log('Tournament Id to testnextPool front: ', this.tournamentId);
                const data = {
                    tournamentId: this.tournamentId
                }
                const response = await fetchJSON("/database/nextPool/" + this.tournamentId);
                // // const parsedResponse = JSON.parse(response);
                console.log('getnextPool: ', response);
                this.initializeTournamentPool(response.games);
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
    destroy() {
        console.log('Destroying TournamentMenu...');
    
        this.tournamentPools.forEach(pool => {
            pool.tournamentPoolGroup.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
                pool.tournamentPoolGroup.remove(child);
            });
            this.threeRoot.scene.remove(pool.tournamentPoolGroup);
        });
        this.tournamentPools = [];
    
        this.clickableGroup.children.forEach(child => {
            this.clickableGroup.remove(child);
        });
        this.threeRoot.scene.remove(this.clickableGroup);
    
        this.threeRoot.scene.remove(this.directionalLight1);
        this.threeRoot.scene.remove(this.directionalLight2);
    
        this.disableClicks();
    
        console.log('TournamentMenu successfully destroyed.');
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
            const { players, game_ws_id } = game;
            this.initializeGame(players, game_ws_id, index, tournamentGames.length);
            console.log('initialize: ', players, game_ws_id);
        });

        this.threeRoot.scene.add(this.tournamentPoolGroup);
        this.threeRoot.scene.add(this.tournamentMenu.clickableGroup);

        // document.addEventListener('click', this.onMouseClick.bind(this), false);
    }

    initializeGame(playerPair, gameId, index, totalGames) {
        let spacing, startX;
        if (totalGames === 1) {
            // Center the game if there's only one game left
            spacing = 0;
            startX = 0; // Centered at 0
        } else {
            // Normal case with multiple games
            spacing = this.poolWidth / (totalGames - 1);
            startX = -(this.poolWidth / 2); // Start at the leftmost position
        }

        const fontLoader = new FontLoader();
        fontLoader.load(
            './static/assets/LEMON_MILK_Regular.json',
            (font) => {
                const [playerNameOne, playerNameTwo] = playerPair;

                const game = new TournamentGame(this.threeRoot, playerNameOne, playerNameTwo, gameId, font);

                game.tournamentGameGroup.position.x = startX + index * spacing;
                game.clickableZone.position.x = startX + index * spacing;

                this.tournamentPoolGroup.add(game.tournamentGameGroup);
                
                this.tournamentMenu.clickableGroup.add(game.clickableZone);

                const key = `${playerNameOne}-${playerNameTwo}`;
                this.gamesMap.set(key, game);
                console.log('Game position in scene: ', game.clickableZone.position);
                // console.log('Light position in scene: ', spotLight.position);
                // console.log('Target Object position: ', targetObject.position);
            }
        );
    }
    getGameByPlayerNames(playerNameOne, playerNameTwo) {
        const key = `${playerNameOne}-${playerNameTwo}`;
        return this.gamesMap.get(key);
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
            opacity: 0.0 // Opacité a regler
        });

        this.clickableZone = new THREE.Mesh(zoneGeometry, zoneMaterial);
        this.clickableZone.position.set(0, 0, 0);
        this.clickableZone.rotation.x = Math.PI / 2;

        this.p1TextPosition = new THREE.Vector3(0, 0, 60);
        this.p2TextPosition = new THREE.Vector3(0, 0, -100);
        this.p1Text = new Text3d(
            threeRoot.camera,
            this.scene,
            font,
            35 * this.calculateScale(playerNameOne),
            10,
            this.colorPalette[4],
            playerNameOne,
            1.01,
            this.p1TextPosition,
            new THREE.Vector3(Math.PI / 2, 0, 0));
        this.p2Text = new Text3d(
            threeRoot.camera,
            this.scene,
            font,
            35 * this.calculateScale(playerNameTwo),
            10,
            this.colorPalette[1],
            playerNameTwo,
            1.01,
            this.p2TextPosition,
            new THREE.Vector3(Math.PI / 2, 0, 0));


        this.p1Text.addToGroup(this.tournamentGameGroup);
        this.p2Text.addToGroup(this.tournamentGameGroup);
        this.arena.addToGroup(this.tournamentGameGroup);

        this.tournamentGameGroup.add(this.clickableZone);
    }
    generateUniqueId() {
        return '_' + Math.random().toString(36).slice(2, 11);
    }
    setGroupOpacity(opacity) {
        this.tournamentGameGroup.traverse((child) => {
            if (child.isMesh) {
                if (child.material) {
                    child.material.transparent = true;
                    child.material.opacity = opacity;
                }
            }
        });
    }
    setWinner(winner) {
        this.winner = winner;
        if (winner === this.playerNameOne) {
            this.p2Text.setVisible(false);
            this.p1TextPosition.set(0, 0, 0);
        } else if (winner === this.playerNameTwo) {
            this.p1Text.setVisible(false);
            this.p2TextPosition.set(0, 0, 0);
        }

        this.p1Text.setPosition(this.p1TextPosition);
        this.p2Text.setPosition(this.p2TextPosition);
    }
    calculateScale(playerName) {
        const maxLength = 5; // Largeur max des pseudo
        if (playerName.length > maxLength) {
            return maxLength / playerName.length;
        }
        return 1;
    }
    addclickableToGroup(group) {
        group.add(this.clickableZone);
    }
}

class TournamentWinner {
    constructor(threeRoot, winnerName) {
        this.threeRoot = threeRoot;
        this.textGroup = new THREE.Group();
        // this.socketManager = socketManager;
        this.fontLoader = new FontLoader();

        this.fontLoader.load(
            './static/assets/LEMON_MILK_Regular.json',
            (font) => {
                this.winnerText = new Text3d(
                    this.threeRoot.camera,
                    this.threeRoot.scene,
                    font,
                    40,
                    10,
                    0x4900ff,
                    winnerName + '  is the tournament Winner !!',
                    1.0,
                    new THREE.Vector3(0, 0, 300)
                );
                this.winnerText.addToGroup(this.textGroup);
                this.threeRoot.scene.add(this.textGroup);
            },
            undefined,
            (error) => {
                console.error('An error occurred loading the font:', error);
            }
        );
    }
}