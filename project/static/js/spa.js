let loadedCSS = [];
let defaultTitle = document.title;

// Listener for browser navigation management
window.addEventListener("popstate", event => {
    const url = document.location.toString();
    const data = event.state;
    spa(url, data);
});

// Listener for link clicks management
document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) { // Check if the clicked element is a link
            e.preventDefault();
            if (e.target.href !== window.location.href) { // Check if the link is different from the current page
                navigateTo(e.target.href);
            }
        }
    });
    spa(document.location.toString());
});

// Listener for form submissions management
document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("submit", e => {
        if (e.target.matches("form")) { // Check if the submitted element is a form
            e.preventDefault();
            const url = e.target.action;
            const data = new FormData(e.target);
            navigateTo(url, data);
        }
    });
});


// Main function for SPA
// It fetches the content of the page and replaces the current content
// It also loads the CSS and JS files and unloads the previous ones
async function spa(urlRaw, data = null) {
    unloadCSS();
    unloadTitle();

    const url = makeURL(urlRaw);
    const viewName = getViewName(urlRaw);
    const content = await fetchHTML(url, data);
    const mainElement = document.querySelector("main");
    mainElement.innerHTML = content;

    // Attendre que handleJS soit complètement exécuté
    await handleJS(mainElement);

    // Une fois handleJS terminé, dispatcher l'événement loadView
    const loadViewEvent = new CustomEvent('loadView', { detail: viewName });
    document.dispatchEvent(loadViewEvent);

    loadCSS(mainElement);
    loadTitle(mainElement);
}

// Function to create a new URL object
// It deletes the last slash if there is one
// It also sets the pathname to "/home" if it is empty
// It adds the "/api" prefix to the pathname
function makeURL(url) {
    try {
        // Delete the last slash if there is one
        if (!url.endsWith("/")) {
            url += "/";
        }
        // Create a new URL object
        let newURL = new URL(url, window.location.origin);

        // If the pathname is empty, set it to "/home"
        if (newURL.pathname === "/") {
            newURL.pathname = "/home/";
        }
        // Add the "/api" prefix to the pathname
        newURL.pathname = "api" + newURL.pathname;

        return newURL;
    } catch (err) {
        console.error("Error while creating URL object: ", err);
    }
}

// Function to get the view name from the URL
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


// Function to fetch the HTML content of the page
// It sends an XMLHttpRequest to the server
async function fetchHTML(url, data = null) {
    try {
        // Build fetch destination
        const destination = url.pathname + url.search;

        if (url.origin !== window.location.origin) {
            throw new Error("XSS");
        }
        // Add the X-Requested-With header to the request
        const options = {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        // If there is data, add the POST method and the CSRF token to the request
        if (data) {
            options.method = 'POST';
            options.headers['X-CSRFToken'] = getCookie('csrftoken');
            options.body = data;
        }

        // Fetch the destination
        const response = await fetch(destination, options);

        return await response.text();
    } catch (err) {
        console.error("Error while loading HTML: ", err);
    }
}

// Function to load the CSS files
function loadCSS(mainElement) {
    // Get all the stylesheets in the content
    const stylesheets = mainElement.querySelectorAll('link[rel="stylesheet"]');

    stylesheets.forEach(link => {
        // Check if the stylesheet is already loaded
        if (!document.head.querySelector(`link[href="${link.href}"]`)) {
            // Create a new link element
            const newLink = document.createElement('link');

            // Set the attributes of the new link element
            newLink.rel = link.rel;
            newLink.href = link.href;

            // Append the new link element to the head
            document.head.appendChild(newLink);

            // Add the href to the list of loaded CSS
            loadedCSS.push(link.href);
        }
        // Remove the original link element in any case
        link.remove();
    });
}

// Function to unload the CSS files
function unloadCSS() {
    // Remove all the loaded CSS files
    loadedCSS.forEach(href => {
        // Get the link element with the href
        const link = document.head.querySelector(`link[href="${href}"]`);
        // If the link exists, remove it
        if (link) {
            link.parentNode.removeChild(link);
        }
    });
    // Clear the list of loaded CSS
    loadedCSS = [];
}

// Function to load the JS files
async function handleJS(mainElement) {
    try {
        // Get all the scripts in the content
        const scripts = mainElement.querySelectorAll('script');

        for (let script of scripts) {
            // Check if the script is already loaded
            if (!document.head.querySelector(`script[src="${script.src}"]`)) {
                // If the script has a src attribute, dynamically import the script
                if (script.src) {
                    await import(script.src);
                }
                else { // If the script doesn't have a src attribute, evaluate the script content
                    new Function(script.textContent)();
                }
            }
        }
    } catch (err) {
        console.error("Error while handling JS ", err);
    }
}

// Function to load the title
function loadTitle(mainElement) {
    // Get the title in the content
    const titleElement = mainElement.querySelector('title');

    if (titleElement) {
        // Store the current title
        defaultTitle = document.title;
        // Set the new title
        document.title = titleElement.textContent;
        // Remove the original title element
        titleElement.remove();
    }
}

// Function to unload the title
function unloadTitle() {
    // Restore the default title
    document.title = defaultTitle;
}

// Function to navigate to a new URL
function navigateTo(url, data = null) {
    try {
        history.pushState(data, "", url);
        spa(url, data);
    } catch (err) {
        console.error("Unable to load external resources from SPA:", err);
    }
};

// Function to get a cookie by name
function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to fetch JSON from a source
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
