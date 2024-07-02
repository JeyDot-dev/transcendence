const navigateTo = url => {
	history.pushState(null, null, url);
	router();
};

const router = async () => {
	//Définition des routes
	const routes = [
		{ path: "/", view: "/api/home/" },
		{ path: "/pong", view: "/api/pong/" },
		{ path: "/pong/game", view: "/api/pong/game/" },
		{ path: "/about", view: "/api/about/" },
		{ path: "/test", view: "/api/test/" }
	];

	//Gérer le / à la fin de l'URL
	const path = location.pathname.endsWith("/") && location.pathname.length > 1
		? location.pathname.slice(0, -1)
		: location.pathname;

	//Définit les match potentiel
	const potentialMatches = routes.map(route => {
		return {
			route: route,
			isMatch: path === route.path
		};
	});
	//Cherche le match
	let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

	//Si il n'y a pas de match, utiliser la route par défaut
	if (!match) {
		match = {
			route: routes[0],
			isMatch: true
		};
	}

	// Téléchargement et injection du contenu
	const html = await fetch(match.route.view, {
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
