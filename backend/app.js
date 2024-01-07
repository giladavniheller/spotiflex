let express = require('express');
let request = require('request');
let cors = require('cors');
let querystring = require('querystring');
const axios = require('axios');
const {json} = require("express");

let REDIRECT_URI = 'http://localhost:5000/callback';
const CLIENT_ID = "6d35ce8cf1b84d749e456311ee8c7360";
const CLIENT_SECRET = "12e3307c4877465f95cc024b1b3295d2";

const app = express();
const PORT = 5000;

app.use(express.static('public'));
app.use(express.json());
app.use(cors())
app.use(cors({
	origin: 'http://localhost:3000',
	methods: 'GET,POST,PUT,DELETE',
	credentials: true
}))

/** - - - - - - - - - - - - - - - - LOGIN AND AUTHENTICATION - - - - - - - - - - - - - - - - **/
app.get('/login', (req, res) => {
	res.redirect('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
			response_type: 'code',
			client_id: CLIENT_ID,
			scope: 'user-read-private user-read-email user-top-read user-library-read playlist-modify-public playlist-modify-private',
			redirect_uri: REDIRECT_URI,
			show_dialog: true,
		}))
});

app.get('/callback', async (req, res) => {
	console.log('in backend callback');
	let code = req.query.code || null
	let authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		form: {
			code: code,
			redirect_uri: REDIRECT_URI,
			grant_type: 'authorization_code'
		},
		headers: {
			'Authorization': 'Basic ' + (new Buffer(
				CLIENT_ID + ':' + CLIENT_SECRET
			).toString('base64'))
		},
		json: true
	}
	request.post(authOptions, function (error, response, body) {
		let access_token = body.access_token;
		let refresh_token = body.refresh_token;
		let uri = 'http://localhost:3000/Home';
		res.redirect(uri + '?access_token=' + access_token + `&refresh_token=` + refresh_token);
	})
});

/** - - - - - - - - - - - - - - - - SPOTIFY DATA RETRIEVAL - - - - - - - - - - - - - - - - **/

app.post('/newPlaylist', async (req, res) => {

	console.log(`received post request for a new playlist`);
	const access_token = req.body.access_token;
	const playlistName = req.body.playlistName;
	const songURIs = req.body.songURIs;
	const userId = req.body.userId;

	// Create the playlist
	let playlistId;
	try {
		const response = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
			name: playlistName,
			public: true,
			description: 'A colorful playlist made with SpotiFlex!',
		}, {
			headers: {
				'Authorization': 'Bearer ' + access_token,
				'Content-Type': 'application/json',
			},
		});
		playlistId = response.data.id;
	} catch (err) {
		console.log(`error occurred when making new playlist: ${err}`);
	}

	if (playlistId) {
		let startIndex = 0;
		console.log(`Playlist id found, attempting to add songs...`)
		while (startIndex < songURIs.length) {
			try {
				const response = await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
					uris: songURIs.slice(startIndex, Math.min(startIndex + 100, songURIs.length)),
				}, {
					headers: {
						'Authorization': 'Bearer ' + access_token,
						'Content-Type': 'application/json',
					},
				});
				startIndex += 100;
			} catch (err) {
				console.log(`error occurred when adding songs to the new playlist ${err}`);
				startIndex += 1000;
			}
		}
	}

	res.status(200).json({message: 'Playlist created successfully!'});
})

app.get('/userProfile', async (req, res) => {
	const access_token = req.query.access_token;
	try {
		getData(access_token, '/me').then(userInfo => {
			console.log(`Successfully retrieved user info from spotify`);
			const responseData = {
				message: 'Success!',
				data: userInfo
			};
			res.status(200).json(responseData);
		});
	} catch (err) {
		console.error(`Error retrieving user profile: ${error}`);
		res.status(500).send('Internal Server Error during user profile retrieval');
	}
});

app.get('/topArtists', async (req, res) => {
	const access_token = req.query.access_token;
	const time_range = req.query.time_range;
	const limit = req.query?.limit ?? 10;
	const offset = req.query?.offset ?? 0;
	console.log(`Received request for the ${limit} top artist(s) of the past ${time_range} range with an offset of ${offset}`);

	try {
		getData(access_token, `/me/top/artists?limit=${limit}&offset=${offset}&time_range=${time_range}`).then(topArtists => {
			console.log(`Successfully retrieved top artists from spotify`);
			const responseData = {
				message: 'Success!',
				data: topArtists
			};
			res.status(200).json(responseData);
		});
	} catch (err) {
		console.error(`Error retrieving top artists: ${error}`);
		res.status(500).send('Internal Server Error during top artist retrieval');
	}
});

app.get('/topSongs', async (req, res) => {
	const access_token = req.query.access_token;
	const time_range = req.query.time_range;
	const limit = req.query?.limit ?? 10;
	const offset = req.query?.offset ?? 0;
	console.log(`Received request for the ${limit} top song(s) of the past ${time_range} range with an offset of ${offset}`);

	try {
		getData(access_token, `/me/top/tracks?limit=${limit}&offset=${offset}&time_range=${time_range}`).then(topSongs => {
			console.log(`Successfully retrieved top songs from spotify`);
			const responseData = {
				message: 'Success!',
				data: topSongs
			};
			res.status(200).json(responseData);
		});
	} catch (err) {
		console.error(`Error retrieving top songs: ${err}`);
		res.status(500).send('Internal Server Error during top song retrieval');
	}
});

app.get('/allLikedSongs', async (req, res) => {
	const access_token = req.query.access_token;
	console.log('Received request for all liked songs');

	let allTracks = [];
	let total = 0;
	let limit = 50;
	let offset = 0;

	try {
		const firstBatch = await getData(access_token, `/me/tracks?limit=${limit}&offset=${offset}`);
		total = firstBatch.total;
		console.log(`got the first batch with a total of ${total}`);
	} catch (err) {
		console.log(`ran into an error: ${err.message}`);
		res.status(401).json({error: 'The access token expired'});
		return;
	}


	const requestsPerBatch = 30;
	while (offset <= total) {
		const songBatchPromises = [];
		const initialOffset = offset;
		for (let i = 0; i < requestsPerBatch; i++) {
			songBatchPromises.push(getData(access_token, `/me/tracks?limit=${limit}&offset=${offset}`));
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

	// Sometimes Spotify may accidentally like the same song multiple times, this should remedy that
	const uniqueSongs = {};
	const uniqueListOfSongs = [];

	for (const song of projectedData) {
		const id = song.id;
		if (!uniqueSongs[id]) {
			uniqueSongs[id] = true;
			uniqueListOfSongs.push(song);
		}
	}

	const responseData = {
		message: 'Success!',
		data: uniqueListOfSongs
	};
	res.status(200).json(responseData);
});


app.listen(PORT, (error) => {
	if (!error) {
		console.log("Server is Successfully Running, and App is listening on port " + PORT)
	} else {
		console.log("Error occurred, server can't start", error);
	}
});


/* - - - - - - - - - - - - - - HELPERS - - - - - - - - - - - - - - - */
async function getData(accessToken, endpoint) {
	const response = await axios.get('https://api.spotify.com/v1' + endpoint, {
		method: 'get',
		headers: {
			Authorization: 'Bearer ' + accessToken,
		},
	});

	return response.data;
}
