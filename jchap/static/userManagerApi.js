function login(formData) {
	const url = 'api/login/';

	fetch(url, {
		method: 'POST',
		body: JSON.stringify({
			username: formData.get('username'),
			password: formData.get('password')
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(response => response.json())
	.then(data => {
		if (!data.token) {
			alert('Invalid login');
		} else {
			document.cookie = `logintoken=${data.token}; SameSite=Strict; Secure`;
			localStorage.setItem('user', JSON.stringify(data.user));
			location.reload();
		}
	})
}

function createAccount(formData) {
	const url = 'api/signup/';

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
			alert('Account created successfully');
			location.reload();
		}
	})
}

function testToken(token) {
	const url = 'api/test_token/';

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

	if (document.cookie.split(';').find(cookie => cookie.includes('logintoken')) === undefined)
		return console.log('No token found');

	const url = 'api/logout/';
	const token = document.cookie.split(';').find(cookie => cookie.includes('logintoken')).split('=')[1];

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
	const url = 'api/change_password/';
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
