function createTournament(formData){
	const url = 'game/create_tournament';

	fetch(url, {
		method: 'POST',
		body: JSON.stringify({
			name: formData.get('tournamentName'),
			nb_player_per_team: formData.get('nb_player_per_team'),
			nb_players: formData.get('nb_team') * formData.get('nb_player_per_team'),
		}),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Token ${getToken()}`
		}
	})
}