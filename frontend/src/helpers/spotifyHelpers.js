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

export const getAllLikedSongs = async (access_token) => {
	console.log('requesting all liked songs from spotify');
	try {
		const response = await fetch(`http://localhost:5000/allLikedSongs?access_token=${access_token}`);
		return response.json();
	} catch (err) {
		throw new Error('failed retrieving all liked songs');
	}
}

export const createNewPlaylist = async (access_token, playlistName, songURIs) => {
	const userProfileResponse = await getUserProfile(access_token);
	console.log(`requesting a new playlist called ${playlistName} with songURIs`);
	try {
		const data = {
			playlistName: playlistName,
			songURIs: songURIs,
			userId: userProfileResponse.data.id,
			access_token: access_token,
		}
		const response = await fetch(`http://localhost:5000/newPlaylist`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data)
		});
		return await response.json();
	} catch (err) {
		throw new Error('failed creating new playlist');
	}
}