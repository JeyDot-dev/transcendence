const canvas = document.getElementById('gameCanvas');

const ctx = canvas.getContext('2d');

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
	canvas.height = canvas.parentElement.offsetHeight;
}

resizeCanvas();

var keys = {
	p1: {
		up: false,
		down: false
	},
	p2: {
		up: false,
		down: false
	}
}

//KeyListener
{
	document.addEventListener('keydown', function(e) {
		switch (e.key) {
			case 'w':
				keys.p1.up = true;
				break;
			case 's':
				keys.p1.down = true;
				break;
			case 'ArrowUp':
				keys.p2.up = true;
				break;
			case 'ArrowDown':
				keys.p2.down = true;
				break;
			case 'Enter':
				startGame();
				break;
			case 'Backspace':
				stopGame();
				break;
		}
	});

	document.addEventListener('keyup', function(e) {
		switch (e.key) {
			case 'w':
				keys.p1.up = false;
				break;
			case 's':
				keys.p1.down = false;
				break;
			case 'ArrowUp':
				keys.p2.up = false;
				break;
			case 'ArrowDown':
				keys.p2.down = false;
				break;
		}
	});
}

const ballSize = canvas.height / 100

// Create the ball "Object" (not actually an object in JS, but a dictionary)
const ball = {
	x: (canvas.width / 2) - (ballSize / 2), // -(ballSize / 2) to make it centered cause itself
	y: canvas.height / 2 - (ballSize / 2),
	size: ballSize,
	speed: 1,
	velocityX: 0,
	velocityY: 0,
	color: 'WHITE'
};

// Create the player "Object" (same here)
const player = {
	x: 0,
	y: canvas.height / 2 - (ballSize * 10),
	width: ballSize * 2,
	height: ballSize * 20,
	speed: ballSize * 2,
	color: 'WHITE',
	score: 0
};

// Create the opponent "Object" (same here)
const opponent = {
	x: canvas.width - 10,
	y: canvas.height / 2 - (ballSize * 10),
	width: ballSize * 2,
	height: ballSize * 20,
	speed: ballSize * 2,
	color: 'WHITE',
	score: 0
};

// Create the net "Object" (same here)
const net = {
	x: canvas.width / 2 - 1, // -1 to make it centered cause itself
	y: 0,
	height: canvas.height,
	width: 2,
	color: 'WHITE'
};

// Draw the net
function drawNet() {
	ctx.fillStyle = net.color;
	ctx.fillRect(net.x, net.y, net.width, net.height);
}

// Draw the score
function drawScore(x, y, score) {
	ctx.fillStyle = 'WHITE';
	ctx.font = '35px Arial';
	ctx.fillText(score, x, y);
}

// Draw the player
function drawPlayer() {
	ctx.fillStyle = player.color;
	ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Draw the opponent
function drawOpponent() {
	ctx.fillStyle = opponent.color;
	ctx.fillRect(opponent.x, opponent.y, opponent.width, opponent.height);
}

// Draw the ball
function drawBall() {
	ctx.shadowColor = 'rgba(255, 255, 255, 1)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Dessiner la balle
    ctx.fillStyle = ball.color;
    ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
    ctx.fill();

    // Réinitialiser les propriétés de l'ombre
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function clearCanvas() {
	ctx.fillStyle = 'BLACK';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Render the game:
function render() {
	clearCanvas();

	// Draw the net & the scores
	drawNet();
	drawScore(canvas.width / 4, canvas.height / 6, player.score);
	drawScore(3 * canvas.width / 4, canvas.height / 6, opponent.score);

	// Draw the paddles 
	drawPlayer();
	drawOpponent();

	// Finally, draw the ball
	drawBall();
}


function handlePlayersMovement() {
	if (keys.p1.up && player.y > 0) {
		player.y -= player.speed;
	} else if (keys.p1.down && player.y < canvas.height - player.height) {
		player.y += player.speed;
	}

	if (keys.p2.up && opponent.y > 0) {
		opponent.y -= opponent.speed;
	} else if (keys.p2.down && opponent.y < canvas.height - opponent.height) {
		opponent.y += opponent.speed;
	}
}

function moveBall(){
	ball.x += ball.velocityX * ball.speed;
	ball.y += ball.velocityY * ball.speed;
}

function wallCollisionDetection(){
	//Top and bottom walls:
	if (ball.y + ball.size >= canvas.height || ball.y <= 0) {
		ball.velocityY = -ball.velocityY;
	}
	if (ball.x + ball.size >= canvas.width || ball.x <= 0) {
		ball.velocityX = -ball.velocityX;
	}

	//Loose walls:
	if (ball.x + ball.size >= canvas.width) {
		player.score++;
		resetBall();
	}

	if (ball.x <= 0) {
		opponent.score++;
		resetBall();
	}
}

function playersCollisionDetection(){
	let playerPaddle = (ball.x <= player.x + player.width && ball.y >= player.y && ball.y <= player.y + player.height);
	let opponentPaddle = (ball.x + ball.size >= opponent.x && ball.y >= opponent.y && ball.y <= opponent.y + opponent.height);

	if (playerPaddle || opponentPaddle) {
		ball.velocityX = -ball.velocityX;
		ball.speed += 0.1;
	}
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function trueAiPlayer(level){ //level 1 to 100 (100 is smart, 1 is dumb)
	if (ball.velocityX == 0) return
	let brain = getRandomInt(0, 100);
	let trueOpenentPos = opponent.y + (opponent.height / 2)

	// resetP2
	if (trueOpenentPos == ball.y)
	{
		keys.p2.up = false;
		keys.p2.down = false;
		return; // it appen I promess
	}

	if (trueOpenentPos > ball.y && level > brain)
		keys.p2.up = true
	else
		keys.p2.up = false

	if (trueOpenentPos < ball.y)
		keys.p2.down = true
	else
		keys.p2.down = false
}

function physics() {
	trueAiPlayer(100) //level 1 to 100 (100 is smart, 1 is dumb)
	handlePlayersMovement();
	moveBall();
	wallCollisionDetection();
	playersCollisionDetection();

	//	Shitty "AI" oppeonent:
	// let opponentLevel = 0.1;
	// opponent.y += (ball.y - (opponent.y + opponent.height / 2)) * opponentLevel;
}

function resetBall(){
	ball.x = (canvas.width / 2) - 5;
	ball.y = canvas.height / 2;
	ball.velocityX = 0;
	ball.velocityY = 0;
	ball.speed = 1;
}

function startGame(){
	resetBall();
	ball.velocityX = 5;
	ball.velocityY = 5;
}

function stopGame(){
	resetBall();
	ball.velocityX = 0;
	ball.velocityY = 0;
	player.score = 0;
	opponent.score = 0;

	player.y = (canvas.height - 100) / 2;
	opponent.y = (canvas.height - 100) / 2;
}

// Game loop (no physics yet)
function game() {
	physics();
	render();
}

// Start the game
const framePerSecond = 60;
setInterval(game, 1000 / framePerSecond); // 1000ms / 60fps = 16.6666666667ms per frame

document.addEventListener('DOMContentLoaded', function() {
    resizeCanvas();
});