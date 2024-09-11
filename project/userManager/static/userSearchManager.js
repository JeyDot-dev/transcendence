function searchUser(searchTerm) {
	const endpoint = `/api/get_user_list?searchTerm=${encodeURIComponent(searchTerm)}`;
	const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

	fetch(endpoint, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken
		}
	})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			if (data.error) {
				alert(data.error);
			} else {
				console.log(data.users);
			}
		})
}

let searchTimeout;

function searchUserInput() {
	clearTimeout(searchTimeout);
	searchTimeout = setTimeout(() => {
		const searchText = document.getElementById('searchInput').value;
		searchUser(searchText);
	}, 500);
}