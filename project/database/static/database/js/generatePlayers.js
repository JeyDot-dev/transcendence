document.getElementById('add_players').addEventListener('click', function() {
    console.log('added players');
    let formCount = document.querySelectorAll('#formsetContainer .form-group').length;

    const formsetContainer = document.getElementById('formsetContainer');
    const numPlayersToAdd = parseInt(document.getElementById('num-players').value);  // Get the number of forms from input

    for (let i = 0; i < numPlayersToAdd; i++) {
        const newFormHtml = `
            <div class="form-group">
                <label for="id_form-${formCount}-name">Player Name:</label>
                <input type="text" name="form-${formCount}-name" class="form-control" id="id_form-${formCount}-name">
                <div class="error-message" id="error-${formCount}-name" style="color: red;"></div>
            </div>`;
        formsetContainer.insertAdjacentHTML('beforeend', newFormHtml);
        formCount++;
    }

    document.querySelector('input[name="form-TOTAL_FORMS"]').value = formCount;
});