import { Game } from './Classes/game.js';
import { Menu } from './Classes/menu.js';
import { SocketManager } from './Classes/SocketManager.js';
import { THREERoot } from './Classes/THREERoot.js';
import { BouncingBallInCube } from './Classes/background.js';

console.log("localGame.js LOADING");

let isRunning = false;


const threeRoot = new THREERoot();
window.addEventListener('loadView', function() {
    console.log("localGame.js LOADED");
});
threeRoot.initCanvas();
if (!isRunning) {
    const socketManager = new SocketManager(threeRoot);
    
    socketManager.setGameId('6666');
    socketManager.setType('local');

    isRunning = true;
}

threeRoot.animate();




