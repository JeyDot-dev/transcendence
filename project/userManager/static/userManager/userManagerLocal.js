const local_user = jsonOrNull(localStorage.getItem('user'));

// Check user is ok:
if (!local_user) {
	removeCookie('sessionid');
}

function jsonOrNull(str) {
  try {
	return JSON.parse(str)
  } catch (e) {
	return null
  }
}

function removeCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}