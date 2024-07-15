fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
	loadedFont = font;
	const textGeometry = new THREE.TextGeometry('0s', {
		font: loadedFont,
		size: 0.5,
		height: 0.1,
		curveSegments: 12,
	});
	const textP1Geometry = new THREE.TextGeometry('0', {
		font: loadedFont,
		size: 0.5,
		height: 0.1,
		curveSegments: 12,
	});
	const textP2Geometry = new THREE.TextGeometry('0', {
		font: loadedFont,
		size: 0.5,
		height: 0.1,
		curveSegments: 12,
	});
	const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
	const textP1Material = new THREE.MeshStandardMaterial({ color: 0x33ccff });
	const textP2Material = new THREE.MeshStandardMaterial({ color: 0xff2975 });
	timeText = new THREE.Mesh(textGeometry, textMaterial);
	p1ScoreText = new THREE.Mesh(textP1Geometry, textP1Material);
	p2ScoreText = new THREE.Mesh(textP2Geometry, textP2Material);
	timeText.position.set(-0.2, 0, 3);
	timeText.rotation.x = Math.PI / 2;
	p1ScoreText.position.set(-2.2, 0, 3);
	p1ScoreText.rotation.x = Math.PI / 2;
	p2ScoreText.position.set(2, 0, 3);
	p2ScoreText.rotation.x = Math.PI / 2;
	scene.add(timeText);
	scene.add(p1ScoreText);
	scene.add(p2ScoreText);
});
// Fonction pour mettre à jour le texte du temps écoulé

function updateTimeText(elapsedTime) {
	if (timeText && loadedFont) {
		scene.remove(timeText);
		const textGeometry = new THREE.TextGeometry(`${Math.floor(elapsedTime)}s`, {
			font: loadedFont,
			size: 0.5,
			height: 0.1,
			curveSegments: 12,
		});
		const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
		timeText = new THREE.Mesh(textGeometry, textMaterial);
		timeText.position.set(-0.2, 0, 3);
		timeText.rotation.x = Math.PI / 2;
		scene.add(timeText);
	}
}
function updateScoreP1Text(p1Score) {
	if (p1ScoreText && loadedFont) {
		scene.remove(p1ScoreText);
		const textP1Geometry = new THREE.TextGeometry(p1Score.toString(), {
			font: loadedFont,
			size: 0.5,
			height: 0.1,
			curveSegments: 12,
		});
		const textP1Material = new THREE.MeshStandardMaterial({ color: 0x33ccff });
		p1ScoreText = new THREE.Mesh(textP1Geometry, textP1Material);
		p1ScoreText.position.set(-2.2, 0, 3);
		p1ScoreText.rotation.x = Math.PI / 2;
		scene.add(p1ScoreText);
	}
}
function updateScoreP2Text(p2Score) {
	if (p2ScoreText && loadedFont) {
		scene.remove(p2ScoreText);
		const textP2Geometry = new THREE.TextGeometry(p2Score.toString(), {
			font: loadedFont,
			size: 0.5,
			height: 0.1,
			curveSegments: 12,
		});
		const textP2Material = new THREE.MeshStandardMaterial({ color: 0xff2975 });
		p2ScoreText = new THREE.Mesh(textP2Geometry, textP2Material);
		p2ScoreText.position.set(2, 0, 3);
		p2ScoreText.rotation.x = Math.PI / 2;
		scene.add(p2ScoreText);
	}
}