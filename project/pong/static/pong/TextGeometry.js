import {
    ExtrudeGeometry
} from './threejs/Three.js';

class TextGeometry extends ExtrudeGeometry {
    constructor(text, parameters = {}) {
        const font = parameters.font;
        if (font === undefined) {
            super();
        } else {
            const shapes = font.generateShapes(text, parameters.size);
            if (parameters.depth === undefined && parameters.height !== undefined) {
                console.warn('THREE.TextGeometry: .height is now depreciated. Please use .depth instead'); // @deprecated, r163
            }
            parameters.depth = parameters.depth !== undefined ?
                parameters.depth : parameters.height !== undefined ?
                    parameters.height : 50;
            if (parameters.bevelThickness === undefined) parameters.bevelThickness = 10;
            if (parameters.bevelSize === undefined) parameters.bevelSize = 8;
            if (parameters.bevelEnabled === undefined) parameters.bevelEnabled = false;
            super(shapes, parameters);
        }
        this.type = 'TextGeometry';
    }
}
export { TextGeometry };
