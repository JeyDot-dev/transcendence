const btn = document.querySelector("#continueBtn");
console.log(btn);
btn.addEventListener("click", function () {
    var formCount = document.querySelectorAll('#player-formset .form-group').length;
    var numForms = parseInt(document.getElementById('num-players').value);
    var playerFormset = document.getElementById('player-formset');

    // Clear existing forms
    playerFormset.innerHTML = '';

    // Append the management form
    var managementForm = document.createElement('div');
    managementForm.innerHTML = '{{ formset.management_form|safe }}';
    playerFormset.appendChild(managementForm.firstChild);

    // Add the specified number of forms
    for (var i = 0; i < numForms; i++) {
        var newForm = document.createElement('div');
        newForm.className = 'form-group';
        var emptyFormHtml = `{{ formset.empty_form.as_p|escapejs }}`;
        newForm.innerHTML = emptyFormHtml.replace(/__prefix__/g, i);
        playerFormset.appendChild(newForm);
    }

    // Update the TOTAL_FORMS count
    document.querySelector('#id_form-TOTAL_FORMS').value = numForms;

    // Show the form container
    document.getElementById('player-form-container').style.display = 'block';
});
