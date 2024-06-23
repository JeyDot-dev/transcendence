const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

window.addEventListener('resize', resizeCanvas, false);

let ballSize = canvas.height / 50

function resizeCanvas() {
	// let ratio = 16/9;
    
	// canvas.width = (window.innerWidth / 2) * ratio;
	// canvas.height = (window.innerWidth / 2);
	
	// ballSize = canvas.height / 50;
	// console.log(canvas.width, canvas.height);
	canvas.width = 1280;
	canvas.height = 720;
	ballSize = canvas.height / 50;
}

resizeCanvas();

let game_id = "1234";

let ws = new WebSocket(`ws://${window.location.host}/ws/pong/${game_id}/`);

document.getElementById('game_id').addEventListener('change', function() {
	game_id = document.getElementById('game_id').value;
	ws = new WebSocket(`ws://${window.location.host}/ws/pong/${game_id}/`);
});

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
let player = {
	x: 0,
	y: canvas.height / 2 - (ballSize * 10),
	width: ballSize * 2,
	height: ballSize * 20,
	speed: ballSize * 2,
	color: 'WHITE',
	score: 0
};

// Create the opponent "Object" (Use as a template)
let opponent = {
	x: canvas.width - (ballSize * 2),
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

ws.onmessage = function(e) {
	let data = JSON.parse(e.data);
	let game = data.game;

	switch (data.type) {
		case "game_state":
			player.x = game.players[0].x;
			player.y = game.players[0].y;
			player.score = game.score[0];

			if (game.players.length > 1) {
				opponent.x = game.players[1].x;
				opponent.y = game.players[1].x;
				opponent.score = game.score[1];
			}

			ball.x = game.ball.x;
			ball.y = game.ball.y;
			break;
	}
}

// Handle the player input:
{
	document.addEventListener('keydown', function(e) {
		let message_form = {
			type: 'player_keydown',
			message: "unknown"
		}
		switch (e.key) {
			case 'w':
				message_form.message = "p1_up";
				break;
			case 's':
				message_form.message = "p1_down";
				break;
			case 'ArrowUp':
				message_form.message = "p2_up";
				break;
			case 'ArrowDown':
				message_form.message = "p2_down";
				break;
		}
		if (ws.readyState === ws.OPEN)
			ws.send(JSON.stringify(message_form));
	});

	document.addEventListener('keyup', function(e) {
		let message_form = {
			type: 'player_keyup',
			message: "unknown"
		}
		switch (e.key) {
			case 'w':
				message_form.message = "p1_up";
				break;
			case 's':
				message_form.message = "p1_down";
				break;
			case 'ArrowUp':
				message_form.message = "p2_up";
				break;
			case 'ArrowDown':
				message_form.message = "p2_down";
				break;
		}
		if (ws.readyState === ws.OPEN)
			ws.send(JSON.stringify(message_form));
	});
}

setInterval(function() {
	render()
}, 1000 / 60); // 60 FPS

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
    ctx.shadowBlur = 10;
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

	drawScore(canvas.width / 2, canvas.height, game_id);

	// Draw the paddles 
	drawPlayer();
	drawOpponent();

	// Finally, draw the ball
	drawBall();
}