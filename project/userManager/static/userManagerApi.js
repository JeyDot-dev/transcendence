function removeBackdrop() {

    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.remove();
    }
}

function resetBody() {
    document.body.classList.remove("modal-open");
    document.body.removeAttribute("style");
    removeBackdrop();
}

function errorInModal(data, modal, custom_error = null) {
    let modalSpan = document.getElementById(modal);
    if (data.error) {
        modalSpan.innerHTML = data.error;
        modalSpan.style.color = "red";
    }
    else if (custom_error) {
        modalSpan.innerHTML = custom_error;
        modalSpan.style.color = "red";
    }
    else {
        modalSpan.innerHTML = data.message;
        modalSpan.style.color = "red";
    }
}

function checkInput(data, to_check, to_alert = null) {
    if (data.error) {
        alert(data.error);
    }
    else if (data.message != to_check) {
        alert(data.message);
    } else {
        if (to_alert) {
            	alert(data.message);
        }
        navigateTo("userManager");
        resetBody();
    }
}

function login(formData) {
    const url = 'api/userManager/login/';
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            username: formData.get('login_username'),
            password: formData.get('login_password')
        }),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        }
    })
        .then(response => response.json())
        .then(data => {
            if (!data.token) {
                errorInModal(data, "loginSpan", "Invalid login credentials");
            } else {
                localStorage.setItem('user', JSON.stringify(data.user));
                navigateTo("userManager");
                resetBody();
            }
        })
}

function createAccount(formData) {
    const url = 'api/userManager/signup/';

    if (formData.get('password') !== formData.get('password2')) {
        alert('Passwords do not match');
        return;
    }

    fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password')
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (!data.token) {
                errorInModal(data, "signupSpan");
            }
            else {
            	checkInput(data, "User created successfully");
            }
        })
}

function testToken(token) {
    const url = 'api/userManager/test_token/';

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert('Token is valid');
            }
        })
}

function logout() {
    const url = 'api/userManager/logout/';
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        }
    })
        .then(response => response.json())
        .then(data => {
            checkInput(data, "Logout successful", false);
            localStorage.removeItem('user');
            document.cookie = 'logintoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            updateNav();
        })
}

window.addEventListener('beforeunload', function () {
	if (local_user && local_user.username) {
		changeUserValue("set_online", false, local_user.username);
	}
});

window.addEventListener('load', function () {
	if (local_user && local_user.username) {
		changeUserValue("set_online", true, local_user.username);
	}
});

function changeUserValue(url_key, value, username) {
    const url = `api/userManager/change_value/${url_key}/`;
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": 'application/json',
            "X-CSRFToken": csrftoken
        },
        body: JSON.stringify({
            "username": username,
            "new_value": value
        })
    })
        .then(response => response.json())
        .then(data => {
			if (url_key === "set_online") {
				return ;
			}
            checkInput(data, url_key + " changed successfully", true);
        })
}

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

function submitProfilePicture() {
    const form = document.getElementById('profilePictureForm');
    const formData = new FormData(form);

    uploadProfilePicture(formData);
}

function uploadProfilePicture(formData) {
    const url = '/api/userManager/change_profile_pic/';
    const csrftoken = getCookie('csrftoken');

    fetch(url, {
        method: 'PATCH',
        body: formData,
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                navigateTo("userManager");
            } else {
                alert('An error occurred');
            }
        })
        .catch(error => {
            alert('An error occurred during profile picture upload');
        });
}
