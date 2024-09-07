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
		console.log(data);
		if (!data.token) {
			alert('Invalid login');
		} else {
			document.cookie = `logintoken=${data.token}; SameSite=Strict; Secure`;
			localStorage.setItem('user', JSON.stringify(data.user));
			// location.reload();
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
			// location.reload();
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
	console.log("Logout");
	const url = 'api/userManager/logout/';
	const token = getToken();

	if (!token ) return;

	fetch(url, {
		method: 'POST',
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
			localStorage.removeItem('user');
			document.cookie = 'logintoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
			location.reload();
		}
	})
}

function changePassword(){
	const url = 'api/userManager/change_password/';
	const token = document.cookie.split('=')[1];

	fetch(url, {
		method: 'POST',
		body: JSON.stringify({
			old_password: formData.get('old_password'),
			new_password: formData.get('new_password')
		}),
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
			alert('Password changed successfully');
			location.reload();
		}
	})
}

function changeSkin(newColor) {
	const url = 'api/userManager/change_skin/';
	const token = getToken();

	fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": 'application/json',
			"Authorization": `Token ${token}`,
		},
		body: JSON.stringify({
			"username": local_user.username,
			"color": newColor
		})
	});
}

function getToken() {
	if (!document.cookie.includes('logintoken')) {
		return null;
	}
	return document.cookie.split(';').find(cookie => cookie.includes('logintoken')).split('=')[1];
}