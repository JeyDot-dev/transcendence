let loadedCSS = [];
let defaultTitle = document.title;

window.addEventListener("popstate", event => {
    const url = document.location.toString();
    const data = event.state;
    spa(url, data);
});

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            if (e.target.href !== window.location.href) {
                navigateTo(e.target.href);
            }
        }
    });
    spa(document.location.toString());
});

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("submit", e => {
        if (e.target.matches("form")) {
            e.preventDefault();
            const url = e.target.action;
            const data = new FormData(e.target);
            //navigateTo(url, data);
            sendJSON(url, data);
        }
    });
});


async function spa(urlRaw, data = null) {
    unloadCSS();
    unloadTitle();

    const url = makeURL(urlRaw);
    const viewName = getViewName(urlRaw);
    const content = await fetchHTML(url, data);
    const mainElement = document.querySelector("main");
    mainElement.innerHTML = content;

    await handleJS(mainElement);

    const loadViewEvent = new CustomEvent('loadView', { detail: viewName });
    document.dispatchEvent(loadViewEvent);

    loadCSS(mainElement);
    loadTitle(mainElement);
}

function makeURL(url) {
    try {
        if (!url.endsWith("/")) {
            url += "/";
        }
        let newURL = new URL(url, window.location.origin);

        if (newURL.pathname === "/") {
            newURL.pathname = "/home/";
        }
        newURL.pathname = "api" + newURL.pathname;

        return newURL;
    } catch (err) {
        console.error("Error while creating URL object: ", err);
    }
}

function getViewName(url) {
    try {
        let newURL = new URL(url, window.location.origin);
        let viewName = newURL.pathname;

        if (viewName === "/") {
            viewName = "home";
        }

        if (viewName.startsWith("/")) {
            viewName = viewName.slice(1);
        }
        if (viewName.endsWith("/")) {
            viewName = viewName.slice(0, -1);
        }

        return viewName;
    } catch (err) {
        console.error("Error while getting view name: ", err);
    }
}


async function fetchHTML(url, data = null) {
    try {
        const destination = url.pathname + url.search;

        if (url.origin !== window.location.origin) {
            throw new Error("XSS");
        }
        const options = {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        if (data) {
            options.method = 'POST';
            options.headers['X-CSRFToken'] = getCookie('csrftoken');
            options.body = data;
        }
        const response = await fetch(destination, options);

        return await response.text();
    } catch (err) {
        console.error("Error while loading HTML: ", err);
    }
}

function loadCSS(mainElement) {
    const stylesheets = mainElement.querySelectorAll('link[rel="stylesheet"]');

    stylesheets.forEach(link => {
        if (!document.head.querySelector(`link[href="${link.href}"]`)) {
            const newLink = document.createElement('link');

            newLink.rel = link.rel;
            newLink.href = link.href;

            document.head.appendChild(newLink);

            loadedCSS.push(link.href);
        }
        link.remove();
    });
}

function unloadCSS() {
    loadedCSS.forEach(href => {
        const link = document.head.querySelector(`link[href="${href}"]`);
        if (link) {
            link.parentNode.removeChild(link);
        }
    });
    loadedCSS = [];
}

async function handleJS(mainElement) {
    try {
        const scripts = mainElement.querySelectorAll('script');

        for (let script of scripts) {
            if (!document.head.querySelector(`script[src="${script.src}"]`)) {
                if (script.src) {
                    await import(script.src);
                }
                else {
                    new Function(script.textContent)();
                }
            }
        }
    } catch (err) {
        console.error("Error while handling JS ", err);
    }
}

function loadTitle(mainElement) {
    const titleElement = mainElement.querySelector('title');

    if (titleElement) {
        defaultTitle = document.title;
        document.title = titleElement.textContent;
        titleElement.remove();
    }
}

function unloadTitle() {
    document.title = defaultTitle;
}

function navigateTo(url, data = null) {
    try {
        let jsonData = null;
        if (data) {
            jsonData = {};
            for (let pair of data.entries()) {
                jsonData[pair[0]] = pair[1];
            }
        }
        history.pushState(jsonData, "", url);
        spa(url, data);
        updateNav();
    } catch (err) {
        console.error("Unable to load external resources from SPA:", err);
    }
};

function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


async function updateNav() {
    try {
        let data = await fetchJSON("navbar");
        document.getElementById('theNavBar').innerHTML = data.content;
    }
    catch (err) {
        console.error("Error while updating the navbar: ", err);
    }
}

async function fetchJSON(url) {
    let view = makeURL(url);
    try {
        const options = {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        }
        const response = await fetch(view, options);
        return await response.json();
    } catch (err) {
        console.error("Error while loading JSON: ", err);
    }
}

async function sendJSON(view, data) {
    try {
        let formData = new FormData();
        for (let key in data) {
            formData.append(key, data[key]);
        }
        let url = makeURL(view);
        let result = await fetchHTML(url, formData);
        return result
    } catch (err) {
        console.error("Error while sending JSON:  ", err);
    }
}

async function checkView(urlRaw) {
    try {
        const url = makeURL(urlRaw);
        const response = await fetch(url, { method: 'HEAD' });
        const isDefaultView = response.headers.get('X-Default-View');
        if (isDefaultView === 'True') {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.error("Error while checking view: ", err);
    }
}
