// console.log('***************************** generatePlayer.js LOADING!!!!!!!!!!!')
console.log('***************************** generatePlayer.js LOADED')
const playerCountSelect = document.getElementById('player-count');
const playerFieldsContainer = document.getElementById('player-fields');

function updatePlayerFields(playerCount) {
    // Clear existing fields
    playerFieldsContainer.innerHTML = '';

    // Insert management form (if dynamically generating fields via JS)
    const managementForm = `
        <input type="hidden" name="form-TOTAL_FORMS" value="${playerCount}">
        <input type="hidden" name="form-INITIAL_FORMS" value="0">
        <input type="hidden" name="form-MIN_NUM_FORMS" value="0">
        <input type="hidden" name="form-MAX_NUM_FORMS" value="1000">
    `;
    playerFieldsContainer.insertAdjacentHTML('beforeend', managementForm);

    // Generate player name input fields
    for (let i = 0; i < playerCount; i++) {
        const playerField = `
            <div class="form-group">
                <label for="form-${i}-name">Player ${i + 1}</label>
                <input type="text" name="form-${i}-name" id="form-${i}-name" class="form-control" required>
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
// });