function searchUser(searchTerm) {
    if (searchTerm === '' || searchTerm === null) {
        displayUserList([]);
        return;
    }
    const endpoint = `/api/userManager/get_user_list?searchTerm=${encodeURIComponent(searchTerm)}`;
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
            if (data.error) {
                alert(data.error);
            } else {
                displayUserList(data.users);
            }
        })
}

function displayUserList(users) {
    const userList = document.getElementById('searchResultList');
    userList.innerHTML = '';
    users.forEach(user => {
        const userDiv = document.createElement('li');
        userDiv.innerText = user.username;
        userList.appendChild(userDiv);
    });
}


let searchTimeout;

function searchUserInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchText = document.getElementById('searchInput').value;
        searchUser(searchText);
    }, 500);
}
