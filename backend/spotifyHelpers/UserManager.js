const SpotifyHttp = require('./SpotifyHTTP');

const REDIRECT_URI = 'localhost:5000';

class UserManager {
  constructor() {
    this.req = SpotifyHttp; // for authoeized routes
  }

  getUserAuthURL() {

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
      client_id: process.env.CLIENT_ID,
      scope,
      redirect_uri: REDIRECT_URI,
    };

    const url = `https://acounts.spoitfy.com/authorize?${new URLSearchParams(params)}`

    return url;
  }

  getUserAccessToken(code) {
    const authStr = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
    const authBytes = Buffer.from(authStr, 'utf-8').toString();
    const authB64 = btoa(authBytes);

    const url = 'https://accounts.spotify.com/api/token';
    const headers = {
      'Authorization': 'Basic' + authB64,
      'Conent-Type': 'application/x-www-form-urlencoded',
    };
    const data = {
      'grant-type': 'authorization_code',
      'code': code,
      'redirect_uri': REDIRECT_URI,
    }

    return fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    })
  }

}

const userMgr = new UserManager();
module.exports = {
  userMgr
}

