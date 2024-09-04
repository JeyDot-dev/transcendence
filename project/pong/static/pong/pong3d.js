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

// document.addEventListener('DOMContentLoaded', function() {
    // console.log("DOMContentLoaded");
    const mainElement = document.querySelector("#container_game");
    const threeRoot = new THREERoot(mainElement);
    const socketManager = new SocketManager(threeRoot);
    let menu = new Menu(threeRoot, socketManager);

    menu.show();


    // // const socketManager = new SocketManager();
    // // socketManager.setType('remote');
    // // socketManager.setGameId('some_game_id');


    // // Masque le menu après une certaine condition (par exemple, lorsque le jeu commence)
    // setTimeout(() => {
    //     menu.hide();
    //     console.log('Menu hidden');
    // }, 20000);  // Masquer après 5 secondes

    // // Montre le menu à nouveau après un autre événement (par exemple, à la fin du jeu)
    // setTimeout(() => {
    //     menu.show();
    //     console.log('Menu shown again');
    // }, 40000);  // Réafficher après 10 secondes

    // threeRoot.setRenderFunction(() => {
    //     menu.render();
    // });
    // threeRoot.setRenderFunction(function() {
    //     menu.render();
    // });



    threeRoot.animate();
    // function animate() {
    //     requestAnimationFrame(animate);
    //     if (menu_object) {
    //         menu_object.render(camera);
    //     }
    //     if (game_object) {
    //         game_object.updateAnimation();
    //     }
    // }

    // animate();
// });

    // // Événements pour rejoindre une équipe
    // const joinLeftTeamButton = document.getElementById('joinLeftTeam');
    // const joinRightTeamButton = document.getElementById('joinRightTeam');

    // function joinLeftTeam() {
    //     let message_form = {
    //         type: 'join_team',
    //         team: 'left',
    //         player_id: local_user.id
    //     };
    //     socketManager.sendMessage(message_form);
    // }

    // function joinRightTeam() {
    //     let message_form = {
    //         type: 'join_team',
    //         team: 'right',
    //         player_id: local_user.id
    //     };
    //     socketManager.sendMessage(message_form);
    // }
