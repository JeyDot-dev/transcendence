let loadedCSS = [];
let loadedJS = [];

// Listener for browser navigation management
window.addEventListener("popstate", spa);

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
    spa();
});

// Main function for SPA
// It fetches the content of the page and replaces the current content
// It also loads the CSS and JS files and unloads the previous ones
async function spa() {
    unloadCSS();
    unloadJS();

    const url = makeURL(location.pathname);
    const content = await fetchHTML(url);
    const mainElement = document.querySelector("main");
    mainElement.innerHTML = content;

    loadCSS(mainElement);
    loadJS(mainElement);
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
async function fetchHTML(url) {
    try {
        const response = await fetch(url.pathname, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
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

// Function to navigate to a new URL
function navigateTo(url) {
    history.pushState(null, null, url);
    spa();
};
