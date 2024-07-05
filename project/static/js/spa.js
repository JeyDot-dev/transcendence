let loadedCSS = [];
let loadedJS = [];
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
async function spa(url, data = null) {
    unloadCSS();
    unloadJS();
    unloadTitle();

    url = makeURL(url);
    const content = await fetchHTML(url, data);
    const mainElement = document.querySelector("main");
    mainElement.innerHTML = content;

    loadCSS(mainElement);
    loadJS(mainElement);
    loadTitle(mainElement);
}

// Function to create a new URL object
// It deletes the last slash if there is one
// It also sets the pathname to "/home" if it is empty
// It adds the "/api" prefix to the pathname
function makeURL(url) {
    try {
        // Delete the last slash if there is one
        if (url.endsWith("/")) {
            url = url.slice(0, -1);
        }
        // Create a new URL object
        let newURL = new URL(url, window.location.origin);

        // If the pathname is empty, set it to "/home"
        if (newURL.pathname === "/") {
            newURL.pathname = "/home";
        }
        // Add the "/api" prefix to the pathname
        newURL.pathname = "api" + newURL.pathname;

        return newURL;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Function to fetch the HTML content of the page
// It sends an XMLHttpRequest to the server
async function fetchHTML(url, data = null) {
    try {
        const destination = url.pathname + url.search;
        const options = {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        if (data) {
            options.method = 'POST';
            options.headers['X-CSRFToken'] = getCookie('csrftoken'); // Add CSRF token to the request header
            options.body = data;
        }

        const response = await fetch(destination, options);
        return await response.text();
    } catch (err) {
        console.error(err);
        throw err;
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
function loadJS(mainElement) {
    // Get all the scripts in the content
    const scripts = mainElement.querySelectorAll('script');

    scripts.forEach(script => {
        // Check if the script is already loaded
        if (!document.head.querySelector(`script[src="${script.src}"]`)) {
            // Create a new script element
            const newScript = document.createElement('script');
            // If the script has a src attribute, set the src attribute of the new script element
            if (script.src) {
                newScript.src = script.src;
                loadedJS.push(script.src);
            }
            else { // If the script doesn't have a src attribute, set the text content of the new script element
                newScript.textContent = `(function() { ${script.textContent} })();`;
            }
            // Append the new script element to the head
            document.head.appendChild(newScript);
        }
        // Remove the original script element in any case
        script.remove();
    });
}

// Function to unload the JS files
function unloadJS() {
    // Remove all the loaded JS files
    loadedJS.forEach(src => {
        // Get the script element with the src
        const script = document.head.querySelector(`script[src="${src}"]`);
        // If the script exists, remove it
        if (script) {
            script.parentNode.removeChild(script);
        }
    });
    // Clear the list of loaded CSS
    loadedJS = [];
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
    history.pushState(data, null, url);
    spa(url, data);
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
