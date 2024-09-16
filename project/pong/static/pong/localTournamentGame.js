import { SocketManager } from './Classes/SocketManager.js';
import { THREERoot } from './Classes/THREERoot.js';

let isRunning = false;

const threeRoot = new THREERoot();
window.addEventListener('loadView', function () {
});
threeRoot.initCanvas();
if (!isRunning) {
    const socketManager = new SocketManager(threeRoot);
    socketManager.setGameId('6666');
    socketManager.setType('local');
    isRunning = true;
}

threeRoot.animate();




