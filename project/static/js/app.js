const navigateTo = url => {
	history.pushState(null, null, url);
	router();
};

const router = async () => {
    const url = location.pathname;
    let finalUrl = "api/home";
    if (url !== "/") {
        finalUrl = "api" + url + "/";
    }
	const html = await fetch(finalUrl, {
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		}
	}).then(response => response.text());
	const mainElement = document.querySelector("main");
	mainElement.innerHTML = html;

	//Ajoute les fichier css dans le header de la page
	const stylesheets = mainElement.querySelectorAll('link[rel="stylesheet"]');
	stylesheets.forEach(link => {
		const newLink = document.createElement('link');
		newLink.rel = link.rel;
		newLink.href = link.href;
		document.head.appendChild(newLink);
		link.remove(); // Supprime l'élément original
	});

	// Exécuter les scripts manuellement après l'insertion du HTML
	const scripts = mainElement.querySelectorAll('script');
	scripts.forEach(script => {
		const newScript = document.createElement('script');
		if (script.src) {
			newScript.src = script.src;
		} else {
			// Wrap the script content in an IIFE
			newScript.textContent = `(function() { ${script.textContent} })();`;
		}
		document.head.appendChild(newScript);
		script.remove(); // Supprime l'élément original
	});
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", e => {
		if (e.target.matches("[data-link]")) {
			e.preventDefault();
			if (e.target.href !== window.location.href) {
				navigateTo(e.target.href);
			}
		}
	});

	router();
});
