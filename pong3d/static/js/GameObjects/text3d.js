class Text3d {
    constructor(scene, font = loadedFont, size = 0.5, height = 0.1,
            position = new THREE.Vector3(0, 0, 0),
            rotation = new THREE.Vector3(0, 0, 0)) {
        this.font = loadedFont;
        this.size = size;
        this.height = height;
    }
}