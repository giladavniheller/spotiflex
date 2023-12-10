const REDIRECT_URI = 'http://127.0.0.1:3000/callback'; //callback to frontend

export const getSpotifyLoginUrl = () => {

  const scope = [
    'user-read-currently-playing',
    'user-top-read',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-read-recently-played'
  ].join(' ');

  const params = {
    response_type: 'code',
    // TODO: better way to handle config or env variables
    client_id: process.env.REACT_APP_CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
  };

  const url = `https://accounts.spotify.com/authorize?${new URLSearchParams(params)}`

  return url;
}

export const spotifyLogin = async () => {
  const url = getSpotifyLoginUrl();
  window.location.href = url;
};
