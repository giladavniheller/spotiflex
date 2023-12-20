export const getUserProfile = async (access_token) => {
	console.log('requesting user profile from spotify');
	const response = await fetch(`http://localhost:5000/userProfile?access_token=${access_token}`, {
		// mode: 'no-cors'
	});
	return response.json();
}

export const getTopArtists = async (access_token, time_range = 'short_term') => {
	console.log('requesting top artists from spotify');
	const response = await fetch(`http://localhost:5000/topArtists?access_token=${access_token}&time_range=${time_range}`);
	return response.json();
}

export const getTopSongs = async (access_token, time_range = 'short_term') => {
	console.log('requesting top songs from spotify');
	const response = await fetch(`http://localhost:5000/topSongs?access_token=${access_token}&time_range=${time_range}`);
	return response.json();
}