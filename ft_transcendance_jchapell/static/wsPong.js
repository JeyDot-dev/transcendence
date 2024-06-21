const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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

const ws = new WebSocket(`ws://${window.location.host}/ws/pong/`);

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