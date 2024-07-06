const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

window.addEventListener('resize', resizeCanvas, false);

let ballSize = canvas.height / 50

let my_id = -1;

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

let ws = new WebSocket(`ws://${window.location.host}/ws/pong/${game_id}/`);

function updateWebsocketId() {
	ws.close();
	ws = new WebSocket(`ws://${window.location.host}/ws/pong/${game_id}/`);
}

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

// Create the net "Object" (same here)
const net = {
	x: canvas.width / 2 - 1, // -1 to make it centered cause itself
	y: 0,
	height: canvas.height,
	width: 2,
	color: 'WHITE'
};

ws.onopen = function() {
	console.log("Pong socket open");
}

let global_game

ws.onmessage = function(e) {
	let data = JSON.parse(e.data);
	let game = data.game ? data.game : data;

	switch (data.type) {
		case "game_state":
			render(game);
			break;
		case "init":
			if (!local_user) return;
			my_id = data.message.id;
			addPlayerList(local_user.username, (my_id % 2 == 0) ? 'l' : 'r');
			updatePlayerCount(data.message.nb_players, data.message.nb_players);
			break;
		case "new_player":
			addPlayerList(data.name, (data.side >= 640) ? 'r' : 'l');
			updatePlayerCount(data.nb_players, data.nb_players);
			break;
		case "player_left":
			updatePlayerCount(data.nb_players, data.nb_players);
			console.log("Player left: " + data.who);
			break;
	}
}

// Handle the player input:
{
	let pressedKeys = [];
	document.addEventListener('keydown', function(e) {
		if (my_id == -1) return;
		if (pressedKeys.includes(e.key)) return;
		pressedKeys.push(e.key);
		let message_form = {
			type: 'keydown',
			key: "unknown",
			player_id: my_id
		}
		switch (e.key) {
			case 'w':
				message_form.key = "up";
				break;
			case 's':
				message_form.key = "down";
				break;
			case 'ArrowUp':
				message_form.key = "up";
				break;
			case 'ArrowDown':
				message_form.key = "down";
				break;
		}
		if (ws.readyState === ws.OPEN)
			ws.send(JSON.stringify(message_form));
	});

	document.addEventListener('keyup', function(e) {
		if (my_id == -1) return;
		if (!pressedKeys.includes(e.key)) return;
		pressedKeys = pressedKeys.filter(key => key !== e.key);
		let message_form = {
			type: 'keyup',
			key: "unknown",
			player_id: my_id
		}
		switch (e.key) {
			case 'w':
				message_form.key = "up";
				break;
			case 's':
				message_form.key = "down";
				break;
			case 'ArrowUp':
				message_form.key = "up";
				break;
			case 'ArrowDown':
				message_form.key = "down";
				break;
		}
		if (ws.readyState === ws.OPEN)
			ws.send(JSON.stringify(message_form));
	});
}

// setInterval(function() {
// 	render(global_game)
// }, 1000 / 60); // 60 FPS

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
function drawPaddles(paddles) {
	for (let i = 0; i < paddles.length; i++) {
		let paddle = paddles[i];
		ctx.fillStyle = `rgba(${paddle.color[0]}, ${paddle.color[1]}, ${paddle.color[2]}, 1)`;
		ctx.fillRect(paddle.x, paddle.y, paddle.width, ballSize * 20);
	}
}

// Draw the ball
function drawBall(ball) {
	ctx.shadowColor = 'rgba(255, 255, 255, 1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Dessiner la balle
    ctx.fillStyle = ball.color;
    ctx.fillRect(ball.x, ball.y, ball.size, ball.size);

    // Réinitialiser les propriétés de l'ombre
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// // Render the game:
function render(game) {
	clearCanvas();

	// Draw the net & the scores
	drawNet();
	drawScore(canvas.width / 4, canvas.height / 6, game.score[0]);
	drawScore(3 * canvas.width / 4, canvas.height / 6, game.score[1]);

	// Draw the paddles 
	drawPaddles(game.players);

	// Finally, draw the ball
	drawBall(game.ball);
}

//LIST OF PLAYERS

function addPlayerList(new_user, side) {

	let list
	if (side == 'l')
		list = document.getElementById('leftTeam');
	else
		list = document.getElementById('rightTeam');

	let player = document.createElement('li');
	player.textContent = new_user;
	list.appendChild(player);
}

function updatePlayerCount(nb_players, nb_max) {
	const playerString = nb_players > 1 ? "Players" : "Player";
	document.getElementById('playerCount').textContent = playerString + " " + nb_players + "/" + nb_max;
}

// TEAM MANIPULATION

const joinLeftTeamButton = document.getElementById('joinLeftTeam');
const joinRightTeamButton = document.getElementById('joinRightTeam');

function joinLeftTeam() {
	let message_form = {
		type: 'join_team',
		team: 'left',
		player_id: my_id
	}
	if (ws.readyState === ws.OPEN)
		ws.send(JSON.stringify(message_form));
}

function joinRightTeam() {
	let message_form = {
		type: 'join_team',
		team: 'right',
		player_id: my_id
	}
	if (ws.readyState === ws.OPEN)
		ws.send(JSON.stringify(message_form));
}