// import { THREE } from './three.module.js';
// import { TrackballControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/TrackballControls.js';
import { Game } from './Classes/game.js';
// import { EffectComposer } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/RenderPass.js';
// import { OutlinePass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/OutlinePass.js';
// import { ShaderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/ShaderPass.js';
// import { FXAAShader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/shaders/FXAAShader.js';
import { Menu } from './Classes/menu.js';
import { SocketManager } from './Classes/SocketManager.js';
import { THREERoot } from './Classes/THREERoot.js';
import { BouncingBallInCube } from './Classes/background.js';

console.log("Pong3d.js LOADING");

// Fonction pour consigner tous les événements
// function logEvent(event) {
//     console.log(`Event: ${event.type}`, event);
// }

// Liste des types d'événements que vous souhaitez surveiller
// const eventsToMonitor = [
//     'click', 'keydown', 'keyup', 'load', 'unload', 
//     'resize', 'scroll', 'submit', 'focus', 'blur', 'change',
//     'input', 'contextmenu', 'dblclick', 'error', 'wheel',
//     'loadView',
//     // Ajoutez ici d'autres événements que vous souhaitez surveiller
// ];

// Ajouter un écouteur pour chaque type d'événement
// eventsToMonitor.forEach(eventType => {
//     document.addEventListener(eventType, logEvent, true);
// });

// TODO:
// First time: Charger les objects et init le canavas FLAG = 1
// Si FLAG == 1: Init le canvas

let isRunning = false;

const threeRoot = new THREERoot();
document.addEventListener('loadView', function(event) {
    console.log("localGame.js LOADED");
    console.log("DEDEDEDETAIL: ", event.detail);
    threeRoot.initCanvas();
    if (!isRunning) {
        const socketManager = new SocketManager(threeRoot);
        let menu = new Menu(threeRoot, socketManager);
        
        menu.show();
    }
    isRunning = true;
});


threeRoot.animate();
// if (flag == 1) {
// }
