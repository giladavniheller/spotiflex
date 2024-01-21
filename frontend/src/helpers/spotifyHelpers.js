import axios from 'axios';
// TODO: maybe implement a log file so you can keep track of things but not on console


export const signIn = async () => {
	// TODO: need to fix this, currently using backend
	console.log('inside signIn method');

	const corsAnywhereUrl = 'https://my-cors-proxy.herokuapp.com/';
	const REDIRECT_URI = 'http://localhost:3000/callback';
	const CLIENT_ID = "6d35ce8cf1b84d749e456311ee8c7360";
	const CLIENT_SECRET = "12e3307c4877465f95cc024b1b3295d2";

	const queryParams = new URLSearchParams({
		response_type: 'code',
		client_id: CLIENT_ID,
		scope: 'user-read-private user-read-email user-top-read user-library-read playlist-modify-public playlist-modify-private',
		redirect_uri: REDIRECT_URI,
		show_dialog: true,
	});

	await axios.get(`${corsAnywhereUrl}https://accounts.spotify.com/authorize?` + queryParams.toString(), {
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
		},
	}).then((loginResponse) => {
		console.log('woohoo!');
		console.log(loginResponse);
	});
	// window.location.href = `http://localhost:3000/callback`;

	// await axios.get(`${corsAnywhereUrl}https://accounts.spotify.com/authorize?` + queryParams.toString());
}

export const getUserProfile = async (access_token, refresh_token) => {
	console.log('requesting user profile from spotify');

	let userProfile = {};
	try {
		await getData(access_token, refresh_token, '/me').then(userInfo => {
			console.log(`successfully retrieved user profile from spotify`);
			userProfile = userInfo;
		});
	} catch (err) {
		console.log('received error when getting user profile from spotify...');
		handleGetError(err, {}, () => getUserProfile(access_token, refresh_token));
	}
	return userProfile;
}

export const getTopArtists = async (access_token, refresh_token, time_range = 'short_term', limit = 10, offset = 0) => {
	console.log('requesting top 10 artists from spotify');

	let topArtistResponse = [];
	try {
		await getData(access_token, refresh_token, `/me/top/artists?limit=${limit}&offset=${offset}&time_range=${time_range}`).then(topArtists => {
			console.log(`successfully retrieved top 10 artists from spotify`);
			topArtistResponse = [...topArtistResponse, topArtists.items];
		});
	} catch (err) {
		console.log('received error when getting top 10 artists from spotify...');
		handleGetError(err, [], () => getTopArtists(access_token, refresh_token, time_range, limit, offset));
	}
	return topArtistResponse;
}

export const getTopSongs = async (access_token, refresh_token, time_range = 'short_term', limit = 10, offset = 0) => {
	console.log('requesting top 10 songs from spotify');

	let topSongsResponse = [];
	try {
		await getData(access_token, refresh_token, `/me/top/tracks?limit=${limit}&offset=${offset}&time_range=${time_range}`).then(topSongs => {
			console.log(`successfully retrieved top 10 songs from spotify`);
			topSongsResponse = [...topSongsResponse, topSongs.items];
		});
	} catch (err) {
		console.log('received error when getting top 10 songs from spotify...');
		return handleGetError(err, [], () => getTopSongs(access_token, refresh_token, time_range, limit, offset));
	}
	return topSongsResponse;
}

export const getAllLikedSongs = async (access_token, refresh_token) => {
	console.log('Received request for all liked songs');

	let allTracks = [];
	let total = 0;
	let limit = 50;
	let offset = 0;

	try {
		const firstBatch = await getData(access_token, refresh_token, `/me/tracks?limit=${limit}&offset=${offset}`);
		total = firstBatch.total;
		console.log(`first batch reveals a total of ${total} songs`);
	} catch (err) {
		console.log('failed retrieving first batch of songs');
		return handleGetError(err, [], () => getAllLikedSongs(access_token, refresh_token));
	}

	const requestsPerBatch = 30; // TODO: find out why I have this number, experiment with changing it
	while (offset <= total) {
		const songBatchPromises = [];
		const initialOffset = offset;
		for (let i = 0; i < requestsPerBatch; i++) {
			songBatchPromises.push(getData(access_token, refresh_token, `/me/tracks?limit=${limit}&offset=${offset}`));
			offset += limit;
		}

		try {
			const allResults = await Promise.all(songBatchPromises);
			allResults.forEach(tracks => {
				console.log(`successfully got a batch of songs from ${initialOffset}-${offset}`);
				allTracks.push(...tracks.items);
			})
		} catch (err) {
			// TODO: try to determine if it's faster to identify the specific failed requests and re-do them, rather than the entire batch
			console.log(`uh oh, found an error ${err}`);
			offset -= limit * requestsPerBatch;
		}
	}

	console.log('all done, waiting 1 second to make sure...')
	await new Promise(resolve => setTimeout(resolve, 5000));

	const projectedData = allTracks.map((t) => {
		return {
			artists: t.track.artists.map((a) => {
				return a.name;
			}),
			albumName: t.track.album.name,
			albumId: t.track.album.id,
			track: t.track.name,
			url: t.track.album?.images[0]?.url,
			id: t.track.external_ids?.isrc,
			uri: t.track.uri,
		}
	});

	// Sometimes Spotify may accidentally have the same song saved in LikedSongs multiple times, this should remedy that
	const uniqueSongs = {};
	const uniqueListOfSongs = [];

	for (const song of projectedData) {
		const id = song.id;
		if (!uniqueSongs[id]) {
			uniqueSongs[id] = true;
			uniqueListOfSongs.push(song);
		}
	}

	return uniqueListOfSongs;
}

export const createNewPlaylist = async (access_token, refresh_token, playlistName, songURIs) => {
	const userProfileResponse = await getUserProfile(access_token, refresh_token);
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


// - - - - - - - - - - - - - - - - - - - - - - - - ABSTRACTED GET METHOD - - - - - - - - - - - - - - - - - - - - - - \\
async function getData(accessToken, refresh_token, endpoint) {
	try {
		const response = await axios.get('https://api.spotify.com/v1' + endpoint, {
			method: 'get',
			headers: {
				Authorization: 'Bearer ' + accessToken,
			},
		});
		console.log('successfully executed GET request!');
		return response.data;
	} catch (err) {
		if (err.response && err.response.headers && err.response.headers['www-authenticate'] && err.response.headers['www-authenticate'] === 'Bearer realm="spotify", error="invalid_token", error_description="The access token expired"') {
			console.log('must refresh access token before executing GET request 1');
			// await facilitateRefresh(refresh_token);
			// console.log('1: Facilitated refresh, trying getData again');
			return {};
			// return getData(accessToken, refresh_token, endpoint);
		} else if (err.response && err.response.data && err.response.data.error && err.response.data.error.status && err.response.data.error.message) {
			if (err.response.data.error.status === 401 && err.response.data.error.message === 'Invalid access token') {
				console.log('must refresh access token before executing GET request 2');
				//await facilitateRefresh(refresh_token);
				//console.log('2: Facilitated refresh, trying getData again');
				// return getData(accessToken, refresh_token, endpoint);
				return {};
			}
		} else {
			console.log(`unknown error occurred during GET request`);
			throw new Error('unknown getData error');
		}
	}
}

function handleGetError(err, safeReturnValue, retryCall) {
	if (err.response && err.response.data && err.response.data.error && err.response.data.error.status && err.response.data.error.message) {
		if (err.response.data.error.status === 401 && err.response.data.error.message === 'Invalid access token') {
			console.log('access token is expired');
			// await facilitateRefresh(refresh_token); TODO: add the facilitate refresh functionality to frontend
			// TODO: will need to add some sort of way to prevent infinite loops with calling the retries, maybe also include a parameter for number of retries left that can be decremented
			return safeReturnValue; // TODO: will need to change this to a retry call, i.e. return retryCall()
		}
	} else {
		console.log(`unknown error: ${err}`);
		return safeReturnValue;
	}
}