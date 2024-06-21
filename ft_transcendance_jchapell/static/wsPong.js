const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


const ballSize = canvas.height / 50

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

// Create the opponent "Object" (Use as a template)
const opponent = {
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

const ws = new WebSocket(`ws://${window.location.host}/ws/pong/1234/`);

ws.onmessage = function(e) {
	console.log(e);
	// drawBall(e.message);
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
		ws.send(JSON.stringify(message_form));
	});
}

// setInterval(function() {
// 	console.log('pouet')
// }, 1000 / 60); // 60 FPS