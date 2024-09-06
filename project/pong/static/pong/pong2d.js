const container = document.getElementById('container_game');
const canvas = document.createElement('canvas');
canvas.width = 1280;
canvas.height = 720;
container.appendChild(canvas);

const ctx = canvas.getContext('2d');
const ws = new WebSocket('ws://localhost/ws/pong/local/666/');
let gameState = null;

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    
    // Vérifier le type de message reçu
    if (data.type === 'init') {
        console.log('init');
        gameState = data.game;  // Assurez-vous d'accéder à `data.game` pour l'état du jeu
        drawGame();
    } else if (data.type === 'update') {
        gameState.ball.x = data.ball.x;
        gameState.ball.y = data.ball.y;
        gameState.score = data.score;
        gameState.players = data.players;
        drawGame();
    }
};

document.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if (['w', 's'].includes(key)) {
        console.log('keydown: w s');
        ws.send(JSON.stringify({ type: 'keydown', key: key, who: 0 }));
    }
    if (['arrowup', 'arrowdown'].includes(key)) {
        console.log('keydown: arrow');
        ws.send(JSON.stringify({ type: 'keydown', key: key, who: 1 }));
    }
});

document.addEventListener('keyup', event => {
    const key = event.key.toLowerCase();
    if (['w', 's'].includes(key)) {
        console.log('keyup: w s');
        ws.send(JSON.stringify({ type: 'keyup', key: key, who: 0 }));
    }
   else if (['arrowup', 'arrowdown'].includes(key)) {
        console.log('keyup: arrow');
        ws.send(JSON.stringify({ type: 'keyup', key: key, who: 1 }));
    }
});

function drawGame() {
    if (gameState && gameState.players && gameState.ball) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPaddle(gameState.players[0]);
        drawPaddle(gameState.players[1]);
        drawBall(gameState.ball);
        drawScore(gameState.score);
    }
}

function drawPaddle(player) {
    ctx.fillStyle = 'white';
    ctx.fillRect(
        player.position[0] - (player.width / 2),  // Ajuster pour centrer le paddle horizontalement
        player.position[1] - (player.height / 2), // Ajuster pour centrer le paddle verticalement
        player.width,
        player.height
    );
}

function drawBall(ball) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function drawScore(score) {
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.fillText(score[0], canvas.width / 4, 50);
    ctx.fillText(score[1], (canvas.width / 4) * 3, 50);
}
