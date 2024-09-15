import { Game } from './game.js';

export class SocketManager {
    constructor(threeRoot, onMessageCallback = null, onOpenCallback = null) {
        this.ws = null;
        this.gameId = null;
        this.localGameId = null;
        this.matchMakingGameId = null;
        this.customGameId = null;
        this.type = null;  // 'local' ou 'remote' ou 'customGame' ou 'matchmaking'
        this.game = null;
        this.gameInitilized = false;
        this.tryToReconnect = false;
        this.reconnectTimeout = null; // Garde une référence du timeout de reconnexion
        this.threeRoot = threeRoot;
        this.gameEndPromiseResolve = null;
        this.lastMenu = null;
        // this.menu_object = null;
        this.my_id = -1;

        this.onMessageCallback = onMessageCallback || this.defaultOnMessageCallback.bind(this);
        this.onOpenCallback = onOpenCallback || this.defaultOnOpenCallback.bind(this);
    }

    getWebSocketUrl() {
        if (this.type === 'local') {
            return `ws://${window.location.host}/ws/pong/local/${this.gameId}/`;
        } else if (this.type === 'customGame') {
            return `ws://${window.location.host}/ws/pong/local/${this.gameId}/`;
        } else if (this.type === 'remote') {
            return `ws://${window.location.host}/ws/pong/${this.gameId}/`;
        } else if (this.type === 'matchmaking') {
            return `ws://${window.location.host}/ws/pong/matchmaking/`;
        } else {
            throw new Error('Type de connexion inconnu');
        }
    }

    connect() {
        if (this.type !== 'matchmaking' && !this.gameId) {
            console.warn("Le type de connexion ou l'ID du jeu doivent être définis avant la connexion.");
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
            this.reconnectTimeout = setTimeout(() => {
                console.log("Connexion WebSocket fermée, reconnexion...", this.gameId, this.customGameId);
                console.log(this.reconnectTimeout);
                // Si le WebSocket a changé avant la reconnexion, on ne fait rien
                if (this.ws === null || this.ws.readyState === WebSocket.CLOSED) {
                    this.connect();
                }
            }, 3000);
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
        if (this.reconnectTimeout) {
            console.log('Clear Timout');
            clearTimeout(this.reconnectTimeout);
        }
        if (this.ws) {
            this.ws.close();
        }
        this.ws = null;
    }

    setType(type) {
        if (this.type !== type) {
            if (type == 'matchmaking') {
                this.setOnMessageCallback(this.matchmakingOnMessageCallBack);
            } else {
                this.setOnMessageCallback(this.gameOnMessageCallback);
            }
            this.type = type;
            this.reconnect();
        }
    }
    setTypeAndGameID(type, gameId) {
        if (this.type !== type) {
            if (type == 'matchmaking') {
                this.setOnMessageCallback(this.matchmakingOnMessageCallBack);
            } else {
                this.setOnMessageCallback(this.gameOnMessageCallback);
            }
            if (this.gameId !== gameId) {
                this.gameId = gameId;
            }
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
    setLastMenu(menu) {
        this.lastMenu = menu;
    }
    reconnect() {
        if (this.ws) {
            this.close();
        }
        this.connect();
    }
    setGameObject(game_object) {
        this.game = game_object;
    }

    waitForGameEnd() {
        return new Promise(resolve => {
            this.gameEndPromiseResolve = resolve;
        });
    }
    onGameEnd() {
        if (this.gameEndPromiseResolve) {
            this.gameEndPromiseResolve();
            this.gameEndPromiseResolve = null;
        }
    }

    connectLocalGame() {
        this.localGameId = getCookie('localGameId');
        console.log('Get LocalGameId cookie: ', this.localGameId);
        if (!this.localGameId) {
            this.localGameId = this.generateWebSocketId();
            setCookie('localGameId', this.localGameId, 30);
            console.log('No cookie for localGameId, new cookie: ', getCookie('localGameId'));
        }
        // this.gameId = this.localGameId;
        this.setType('local');
        this.setGameId(this.localGameId);
        // this.connect();
    }
    connectCustomGame(customGameId) {
        console.log('Connnecting to custom game id: ', customGameId);
        this.customGameId = customGameId;
        // this.setType('customGame');
        // // this.type = 'customGame';
        // this.setGameId(this.customGameId);
        this.setTypeAndGameID('customGame', customGameId);
        // this.connect();
    }

    generateWebSocketId() {
    const timestamp = Date.now().toString(36);
    const randomNum = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${randomNum}`;
    }

    defaultOnMessageCallback(data) {
        console.log('WS DATA: ', data);
    }
    // Implémentation par défaut pour le onMessageCallback
    gameOnMessageCallback(data) {
        console.log(data);
        let gameData = data.game ? data.game : data;
        if (gameData.type == "initGame" && !this.gameInitilized) {
            console.log("Initialisation du jeu", gameData);
            this.game = new Game(this.threeRoot, gameData, this);
            this.my_id = gameData.id;
            this.gameInitilized = true;
        } else if (gameData.type == "initGame" && this.gameInitilized) {
            console.log("Update in Front End");
            this.game.updateGame(gameData);
        } else if (gameData.type == "clearGameId" && this.gameInitilized) {
            this.close();
            this.gameId = null;
            if (gameData.gameType == 'localGame') {
                deleteCookie('localGameId');
                this.localGameId = null;
            }
            if (gameData.gameType == 'matchmakingGame') {
                deleteCookie('matchMakingGameId');
                this.matchMakingGameId = null;
            }
            this.gameInitilized = false;
            this.onGameEnd();
            this.game.destroy();
            this.goToLastMenu();
        } else {
            if (this.game) {
                this.game.wsMessageManager(data);
            }
        }
    }
    matchmakingOnMessageCallBack(data) {
        console.log(data);
        switch (data.type) {
            case 'match_created':
                console.log('FrontEnd connect custom game');
                this.lastMenu.hide();
                this.close();
                console.log('FrontEnd connect custom game id: ', data.game_ws_id);
                this.connectCustomGame(data.game_ws_id);
                break;
            default:
                break;
        }
    }
    clearGame() {
        this.gameId = null;
        deleteCookie('localGameId');
        this.localGameId = null;
        deleteCookie('matchMakingGameId');
        this.matchMakingGameId = null;
        this.gameInitilized = false;
        this.onGameEnd();
        this.game.destroy();
        if (this.lastMenu) {
            this.lastMenu.show();
            this.lastMenu.tweenCameraToItem();
        }
    }
    goToLastMenu() {
        console.log('Go to Last Menu', this.lastMenu);
        if (this.lastMenu) {
            this.lastMenu.show();
            this.lastMenu.tweenCameraToItem();
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

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length); // Supprimer les espaces au début
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
