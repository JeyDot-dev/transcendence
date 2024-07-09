let btn = document.getElementById('btn');
let conteur = document.getElementById('conteur');

btn.addEventListener('click', function () {
    let value = Number(conteur.textContent);
    value++;
    conteur.textContent = value;
});

