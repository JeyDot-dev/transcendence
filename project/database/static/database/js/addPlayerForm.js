const btn = document.querySelector("#addPlayerBtn");

btn.addEventListener("click", function () {
    var formCount = document.querySelectorAll('#player-formset .form-group').length;
    var newForm = document.querySelector('#player-formset .form-group').cloneNode(true);
    var formRegex = RegExp('form-(\\d+)-', 'g');
    newForm.innerHTML = newForm.innerHTML.replace(formRegex, 'form-' + formCount + '-');
    document.querySelector('#player-formset').appendChild(newForm);
});
