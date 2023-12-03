
// Abstract class to handle API calss to spotify
class SpotifyHttp {


  _authHeader(token) {
    return { 'Authorization:': `Bearer ${token}` }
  }

  spotifyGet(url, token) {
    return fetch(url, {
      method: 'GET',
      headers: this._authHeader(token)
    });
  }

  spotifyPost(url, token, data) {
    const headers = {
      ...this._authHeader,
      'Content-Type': 'application/json',
    }
    return fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });
  }

  spotifyPut(url, token, data) {
    const headers = {
      ...this._authHeader(token),
      'Content-Type': 'application/json',
    }
    return fetch(url, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(data)
    });
  }

  spotifyDelete(url, token, data) {
    const headers = {
      ...this._authHeader(token),
      'Content-Type': 'application/json',
    }
    return fetch(url, {
      method: 'DELETE',
      headers: headers,
      body: JSON.stringify(data)
    });

  }
}

module.exports = {
  SpotifyHttp
}
