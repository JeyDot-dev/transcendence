import { THREE } from '../three.module.js';
import { FontLoader } from '../FontLoader.js';
import { Text3d } from './text3d.js';
import { Arena } from './arena.js';

export class TournamentMenu {
    constructor(threeRoot) {
        this.tournamentGroup = new THREE.Group();
        this.gamesMap = new Map();

        this.fontLoader = new FontLoader();
        this.fontLoader.load(
            './static/assets/LEMON_MILK_Regular.json',
            (font) => {
                const playerPairs = [
                    ['Toto', 'Titi'],
                    ['Dodo', 'Didi'],
                    ['Bobo', 'Bibi'],
                    ['Foo', 'Bar'],
                    ['Foo', 'Bar'],
                    ['Foo', 'Bar'],
                    ['Foo', 'Bar']
                ];

                const numberOfGames = playerPairs.length; // Nombre total de jeux

                // Largeur totale disponible sur l'axe X (ajustez cette valeur selon votre scène)
                const totalWidth = 1500;
                const totalHeight = 1000;
                const spacing = totalWidth / (numberOfGames - 1);
                const startX = -(totalWidth / 2);

                // Boucle pour créer et positionner chaque jeu
                playerPairs.forEach((players, index) => {
                    const [playerNameOne, playerNameTwo] = players;

                    const game = new TournamentGame(threeRoot, playerNameOne, playerNameTwo, font);

                    // Positionner le jeu en fonction de son index et de l'espacement dynamique
                    game.tournamentGameGroup.position.x = startX + index * spacing;
                    game.tournamentGameGroup.position.z = -totalHeight / 4;

                    // Ajouter le jeu au groupe du tournoi
                    this.tournamentGroup.add(game.tournamentGameGroup);

                    // Utiliser les noms des joueurs comme clé pour la Map
                    const key = `${playerNameOne}-${playerNameTwo}`;
                    this.gamesMap.set(key, game); // Associer le jeu à la paire de joueurs
                    const someGame = this.getGameByPlayerNames('Toto', 'Titi');
                    someGame.setGroupOpacity(0.2);
                });

                threeRoot.scene.add(this.tournamentGroup);
            },
            undefined,
            (error) => {
                console.error('An error occurred loading the font:', error);
            }
        );
    }

    getGameByPlayerNames(playerNameOne, playerNameTwo) {
        const key = `${playerNameOne}-${playerNameTwo}`;
        if (!this.gamesMap.get(key)) {
            console.log('game not Found in tournament game map');
        }
        return this.gamesMap.get(key);
    }
}

class TournamentGame {
    constructor(threeRoot, playerNameOne, playerNameTwo, font) {
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
        this.gameId = this.generateUniqueId();
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

// class TournamentData {
//     constructor() {

//     }
// }