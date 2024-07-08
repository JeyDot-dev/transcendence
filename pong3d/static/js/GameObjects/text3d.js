class Text3d {
    constructor(scene, font, size = 0.5, height = 0.1, color, text,
            position = new THREE.Vector3(0, 0, 0),
            rotation = new THREE.Vector3(0, 0, 0)) {
        this.font = font;
		this.text = text;
        this.size = size;
        this.height = height;
		this.color = color;
		this.position = position;
		this.rotation = rotation;
		this.material = new THREE.MeshStandardMaterial({ color: color });
		this.geomatry = new THREE.TextGeometry(text, {
			font: font,
			size: size,
			height: height,
			curveSegments: 12
		});
		this.mesh = THREE.Mesh(this.geomatry, this.material);
		
		this.mesh.position.set(position);
		this.mesh.rotation.set(rotation);
		scene.add(this.mesh);
    }


	updateText(text) {
		scene.remove(this.mesh);
		this.mesh = new THREE.TextGeometry('text', {
			font: this.font,
			size: this.size,
			height:this.height,
			curveSegments: 12,
		});
		const textMaterial = new THREE.MeshStandardMaterial({ color: this.color });
		this.mesh = new THREE.Mesh(textGeometry, textMaterial);
		this.mesh.position.set(this.position);
		this.mesh.rotation.set(this.rotation);
		scene.add(this.mesh);
	}
}