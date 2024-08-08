import { THREE } from '../three.module.js';
import { FontLoader } from '../FontLoader.js';
import { Text3d } from './text3d.js';

export class Menu {
    constructor(scene) {
        const fontLoader = new FontLoader();
        fontLoader.load(
            'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
            (font) => {
                // fonction flechée pour garder le contexte: this.(...)
                const geometry = new THREE.BoxGeometry(50, 50, 50);
                const material = new THREE.MeshBasicMaterial({ color: 0xff1493 });
                const cube = new THREE.Mesh(geometry, material);
                this.scene.add(cube);
                this.timeText = new Text3d(camera, this.scene, font, 125, 10, 0xffffff, '0s',
                    new THREE.Vector3(-75 + ball_param.x, ball_param.y, 300)
                );
                this.p1Text = new Text3d(camera, this.scene, font, 100, 10, 0x33ccff, '0',
                    new THREE.Vector3(300 + ball_param.x, ball_param.y, 300)
                );
                this.p2Text = new Text3d(camera, this.scene, font, 100, 10, 0xff2975, '0',
                    new THREE.Vector3(-300 + ball_param.x, ball_param.y, 300)
                );

            },
            undefined, // onProgress callback (optional)
            function (error) { // onError callback
                console.error('An error occurred loading the font:', error);
            }
        );

    }
}