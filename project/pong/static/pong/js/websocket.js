// En développement local (localhost)
const websocketURL = "ws://localhost:8000/ws/pong/";

// En production
// const websocketURL = "wss://votredomaine.com/ws/pong/";

const socket = new WebSocket(websocketURL);

socket.onopen = function(event) {
    console.log("Connexion WebSocket établie.");
};

socket.onmessage = function(event) {
    console.log("Message WebSocket reçu :", event.data);
};

socket.onclose = function(event) {
    console.log("Connexion WebSocket fermée.");
};
