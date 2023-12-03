const UserManager = require("./UserManager");

class SpotifyManager {

  constructor() {
    this.userMgr = UserManager;
    this.playlistMgr = null;
    this.dbMgr = null;
  }

  getUserID(session) {

  }

  getUserAuthURL() {
    return UserManager.getUserAuthURL();
  }

  getUserAccessToken(code) {
    return UserManager.getUserAccessToken(code);
  }

  getUserTopArtists() {

  }

  getUserTopSongs() {

  }

  createPlaylistFromTopSongs() {

  }

}

module.exports = {
  SpotifyManager: new SpotifyManager()
}
