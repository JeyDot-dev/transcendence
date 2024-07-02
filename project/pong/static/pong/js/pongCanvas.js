const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

const paddleWidth = 10, paddleHeight = 100, ballRadius = 10;
let playerY = (canvas.height - paddleHeight) / 2;
let playerScore = 0;
let aiScore = 0;
// const paddleSpeed = {{ paddle_speed }};
// const ballSpeed = {{ ball_speed }};
// const framerate = {{ framerate }};

// const socket = new WebSocket('ws://' + window.location.host + '/ws/pong/' + generateUUID() + '/');

const socket = new WebSocket('ws://' + window.location.host + '/ws/pong/' + generateUUID() + '/');

socket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    playerY = data.playerY;
    playerScore = data.playerScore;
    aiScore = data.aiScore;
    gameId = data.gameId;
    draw(data.ballX, data.playerX, data.aiX, data.ballY, data.aiY, playerScore, aiScore);
};

function draw(ballX, playerX, aiX, ballY, aiY, playerScore, aiScore) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawRect(playerX, playerY, paddleWidth, paddleHeight, '#fff');
    drawRect(aiX, aiY, paddleWidth, paddleHeight, '#fff');
    drawCircle(ballX, ballY, ballRadius, '#fff');
    drawScores(playerScore, aiScore);
    drawGameID(gameId);
}

function drawRect(x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

function drawScores(playerScore, aiScore) {
    context.fillStyle = '#fff';
    context.font = '30px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(playerScore, canvas.width / 4, 30);
    context.fillText(aiScore, (canvas.width / 4) * 3, 30);
}

function drawGameID(gameId) {
    context.fillStyle = '#fff';
    context.font = '20px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'bottom';
    context.fillText('Game ID: ' + gameId, canvas.width / 2, canvas.height - 10);
}

document.addEventListener('keydown', movePlayer);
document.addEventListener('mousemove', movePlayerMouse);

function movePlayer(event) {
    const key = event.keyCode;
    if (key === 38) {
        playerY -= paddleSpeed;
    } else if (key === 40) {
        playerY += paddleSpeed;
    }
    if (playerY < 0) {
        playerY = 0;
    } else if (playerY + paddleHeight > canvas.height) {
        playerY = canvas.height - paddleHeight;
    }
    socket.send(JSON.stringify({ 'playerY': playerY }));
}

function movePlayerMouse(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = event.clientY - rect.top - paddleHeight / 2;
    if (mouseY < 0) {
        playerY = 0;
    } else if (mouseY + paddleHeight > canvas.height) {
        playerY = canvas.height - paddleHeight;
    } else {
        playerY = mouseY;
    }
    socket.send(JSON.stringify({ 'playerY': playerY }));
}
//TODO: 
function generateUUID() {
    var d = new Date().getTime();
    var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}