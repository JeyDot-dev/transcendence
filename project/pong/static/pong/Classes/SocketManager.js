import { Game } from './game.js';

export class SocketManager {
    constructor(threeRoot, onMessageCallback = null, onOpenCallback = null) {
        this.ws = null;
        this.gameId = null;
        this.type = null;  // 'local' ou 'remote'
        this.game_object = null;
        this.threeRoot = threeRoot;
        // this.menu_object = null;
        this.my_id = -1;

        // Utilisation des callbacks fournis ou des valeurs par défaut
        this.onMessageCallback = onMessageCallback || this.defaultOnMessageCallback.bind(this);
        this.onOpenCallback = onOpenCallback || this.defaultOnOpenCallback.bind(this);
    }

    getWebSocketUrl() {
        if (this.type === 'local') {
            return `ws://${window.location.host}/ws/pong/local/${this.gameId}/`;
        } else if (this.type === 'remote') {
            return `ws://${window.location.host}/ws/pong/${this.gameId}/`;
        } else {
            throw new Error('Type de connexion inconnu');
        }
    }

    connect() {
        if (!this.gameId || !this.type) {
            console.warn("Le type de connexion et l'ID du jeu doivent être définis avant la connexion.");
            return;
        }

        this.ws = new WebSocket(this.getWebSocketUrl());

        this.ws.onopen = () => {
            console.log("Connexion WebSocket ouverte");
            this.onOpenCallback();
        };

        this.ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            this.onMessageCallback(data);
        };

        this.ws.onclose = () => {
            console.log("Connexion WebSocket fermée, reconnexion...");
            setTimeout(() => this.connect(), 1000);  // Reconnect after 1 second
        };
    }

    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn("WebSocket n'est pas ouvert. État actuel : " + (this.ws ? this.ws.readyState : 'non défini'));
        }
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }

    setType(type) {
        if (this.type !== type) {
            this.type = type;
            this.reconnect();
        }
    }

    setGameId(gameId) {
        if (this.gameId !== gameId) {
            this.gameId = gameId;
            this.reconnect();
        }
    }

    reconnect() {
        if (this.ws) {
            this.close();
        }
        this.connect();
    }

    setGameObject(game_object) {
        this.game_object = game_object;
    }

    // setMenuObject(menu_object) {
    //     this.menu_object = menu_object;
    // }

    // Implémentation par défaut pour le onMessageCallback
    defaultOnMessageCallback(data) {
        let game = data.game ? data.game : data;

        console.log(game);

        switch (data.type) {
            case "game_state":
                if (this.game_object) {
                    // this.game_object.updateGame(game);
                }
                break;
            case "init":
                console.log("Initialisation du jeu");
                // this.menu_object = new Menu(scene, camera, renderer);
                this.threeRoot.updateCameraSettings({
                    fov: 60,
                    near: 0.5,
                    far: 10000,
                    position: { x: 1280 / 2, y: 780 / 2 - 500, z: 1000 },
                    lookAt: { x: 1280 / 2, y: 780 / 2, z: 0 }
                });
                this.game_object = new Game(this.threeRoot, game.width, game.height, game.players, game.ball);
                if (!local_user) return;
                this.my_id = game.id;
                // addPlayerList(local_user.username, (this.my_id % 2 == 0) ? 'l' : 'r');
                break;
            // case "new_player":
            //     addPlayerList(data.name, (data.side >= 640) ? 'r' : 'l');
            //     updatePlayerCount(data.nb_players, data.nb_players);
            //     break;
            // case "player_left":
            //     updatePlayerCount(data.nb_players, data.nb_players);
            //     console.log("Player left: " + data.who);
            //     break;
        }
    }

    // Implémentation par défaut pour le onOpenCallback
    defaultOnOpenCallback() {
        console.log("WebSocket connection opened (default handler)");
    }

    setOnMessageCallback(callbackRoutine) {
        this.onMessageCallback = callbackRoutine.bind(this);
    }
}