let socket;
let socketReady = new Promise((resolve, reject) => {
    socket = new WebSocket("ws://" + window.location.host + "/ws/spa/");
    socket.onopen = () => resolve();
    socket.onerror = error => reject(error);
})

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
async function spa(url, data = null) {
    unloadCSS();
    unloadTitle();

    const mainElement = document.querySelector("main");
    let content;
    try {
        let request = makeView(url);
        console.log('Request:', request);
        content = await getContent(request);
    } catch (error) {
        console.error('Error getting view:', error);
    }

    mainElement.innerHTML = content;

    handleJS(mainElement);

    loadCSS(mainElement);
    loadTitle(mainElement);
}

function makeView(url) {
    try {
        let newURL = new URL(url, window.location.origin);
        let viewName = newURL.pathname;
        let request;

        if (viewName === "/") {
            return JSON.stringify({
                view: "home",
            });
        }

        return request = JSON.stringify({
            view: viewName.slice(1),
        });
    } catch (err) {
        console.error(err);
        return "home";
    }
}

async function getContent(request) {
    await socketReady;

    return new Promise((resolve, reject) => {

        socket.send(request);
        socket.onmessage = function (event) {
            const response = event.data;
            resolve(response);
        };
        socket.onerror = function (error) {
            reject(error);
        };
    });
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

async function handleJS(mainElement) {
    // Get all the scripts in the content
    const scripts = mainElement.querySelectorAll('script');

    for (let script of scripts) {
        // If the script has a src attribute, dynamically import the script
        if (script.src) {
            // Add a unique query parameter to the script src
            let scriptSrc = new URL(script.src);
            scriptSrc.searchParams.set('timestamp', Date.now());
            await import(scriptSrc.href);
        }
        else { // If the script doesn't have a src attribute, evaluate the script content
            new Function(script.textContent)();
        }
        // Remove the original script element in any case
        script.remove();
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
