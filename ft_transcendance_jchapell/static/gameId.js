
let game_id = "1234"

document.getElementById('game_id').addEventListener('change', function() {
	game_id = document.getElementById('game_id').value;
	updateWebsocketId();
});