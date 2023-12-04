const { userMgr } = require("./UserManager");

class SpotifyManager {

  constructor() {
    this.userMgr = userMgr;
    this.playlistMgr = null;
    this.dbMgr = null;
  }

  getUserID(session) {

  }

  getUserAuthURL() {
    return userMgr.getUserAuthURL();
  }

  getUserAccessToken(code) {
    return userMgr.getUserAccessToken(code);
  }

  getUserTopArtists() {

  }

  getUserTopSongs() {

  }

  createPlaylistFromTopSongs() {

  }

}

const spotifyMgr = new SpotifyManager();
module.exports = {
  spotifyMgr
}
