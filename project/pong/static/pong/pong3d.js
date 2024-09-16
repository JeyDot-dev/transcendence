import { Menu } from './Classes/menu.js';
import { SocketManager } from './Classes/SocketManager.js';
import { THREERoot } from './Classes/THREERoot.js';

let isRunning = false;

const threeRoot = new THREERoot();
document.addEventListener('loadView', function (event) {
    threeRoot.initCanvas();
    if (!isRunning) {
        const socketManager = new SocketManager(threeRoot);
        let menu = new Menu(threeRoot, socketManager);
        socketManager.setLastMenu(menu);
        menu.show();
    }
    isRunning = true;
});

threeRoot.animate();
