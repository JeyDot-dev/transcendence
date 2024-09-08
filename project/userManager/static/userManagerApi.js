function login(formData) {
	const url = 'api/userManager/login/';
	const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
	console.log(csrftoken);

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
		console.log(data);
		if (!data.token) {
			alert('Invalid login');
		} else {
			localStorage.setItem('user', JSON.stringify(data.user));
			location.reload();
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
		if (data.error) {
			alert(data.error);
		} else {
			alert(data.message);
			location.reload();
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
	console.log(csrftoken);

	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken
		}
	})
	.then(response => response.json())
	.then(data => {
		if (data.error) {
			alert(data.error);
		} else {
			localStorage.removeItem('user');
			document.cookie = 'logintoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
			location.reload();
		}
	})
}

function changeUserValue(url_key, value, username) {
	const url = `api/userManager/change_value/${url_key}/`;
	const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
	console.log(csrftoken);

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
		if (data.error) {
			alert(data.error);
		} else {
			alert(data.message);
			// location.reload();
		}
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
            // location.reload();
        } else {
            alert('An error occurred');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during profile picture upload');
    });
}

document.getElementById('profilePictureForm').addEventListener('submit', function(e) {
	e.preventDefault();
	console.log('submitting');
	var form = document.getElementById('profilePictureForm');
	var formData = new FormData(form);

	uploadProfilePicture(formData);
});