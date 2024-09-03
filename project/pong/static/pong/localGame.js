import { Game } from './Classes/game.js';
import { Menu } from './Classes/menu.js';
import { SocketManager } from './Classes/SocketManager.js';
import { THREERoot } from './Classes/THREERoot.js';
import { BouncingBallInCube } from './Classes/background.js';

console.log("localGame.js LOADING");


const threeRoot = new THREERoot();
window.addEventListener('loadView', function() {
    console.log("localGame.js LOADED");
    threeRoot.initCanvas();
});
const socketManager = new SocketManager(threeRoot);

socketManager.setGameId('666');
socketManager.setType('local');

threeRoot.animate();




