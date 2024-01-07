export const logOut = () => {
	// TODO: add actual logic somehow to sign out of spotify account.
	localStorage.removeItem('access_token');
	localStorage.removeItem('refresh_token');
	localStorage.removeItem('album_colors');
	localStorage.removeItem('allSongs');
	window.location.href = 'http://localhost:3000/Login';
}