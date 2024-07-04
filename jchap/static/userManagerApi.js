function login(formData){
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
			document.cookie = `logintoken=${data.token}`;
			alert('successfully logged in');
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
	const url = 'api/logout/';
	const token = document.cookie.split(';').find(cookie => cookie.includes('logintoken')).split('=')[1];
	console.log(token);

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
			alert('Logged out successfully');
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
		}
	})
}
