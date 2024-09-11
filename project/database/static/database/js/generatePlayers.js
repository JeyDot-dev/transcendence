document.addEventListener('DOMContentLoaded', function () {
    const playerCountSelect = document.getElementById('player-count');
    const playerFieldsContainer = document.getElementById('player-fields');

    function updatePlayerFields(playerCount) {
        // Clear existing fields
        playerFieldsContainer.innerHTML = '';

        // Generate player name input fields
        for (let i = 0; i < playerCount; i++) {
            const playerField = `
                <div class="form-group">
                    <label for="player-${i + 1}">Player ${i + 1}</label>
                    <input type="text" name="player-${i + 1}-name" id="player-${i + 1}" class="form-control" required>
                </div>
            `;
            playerFieldsContainer.insertAdjacentHTML('beforeend', playerField);
        }
    }

    // Initial player field generation (default to 4 players)
    updatePlayerFields(playerCountSelect.value);

    // Update player fields when the number of players changes
    playerCountSelect.addEventListener('change', function () {
        updatePlayerFields(parseInt(this.value));
    });
});