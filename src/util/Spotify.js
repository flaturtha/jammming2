const clientId = 'b7f8c18441b8453f97b66ef6ce97f5ce';
const redirectUri = 'http://localhost:3000/';
const scope = 'playlist-modify-public';
const spotifyUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=${scope}&redirect_uri=${redirectUri}`;
const url = 'https://api.spotify.com/v1';
let accessToken = '';

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    } else if (window.location.href.match(/access_token=([^&]*)/) && window.location.href.match(/expires_in=([^&]*)/)) {
      let accessToken = window.location.href.match(/access_token=([^&]*)/[1]);
      let expiresIn = window.location.href.match(/expires_in=([^&]*)/[1]);

      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');

      return accessToken;
    } else {
      window.location = spotifyUrl;
    }
  },

  search(term) {
    const accessToken = Spotify.getAccessToken();
    return fetch(`${url}/search?q=${term}&type=track`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(response => {
      return response.json();
    }).then(jsonResponse => {
      if (!jsonResponse.tracks) {
        return [];
      }
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    });
  },

  savePlaylist(playlistName, playlist) {
    if (!playlistName || !playlist.length) {
      return;
    }
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userID;

    return fetch(`${url}/me`, { headers: headers })
      .then(response => response.json())
      .then(jsonResponse => {
        userID = jsonResponse.id;
        return fetch(`${url}/users/${userID}/playlists`, {
          header: headers,
          method: 'POST',
          body: JSON.stringify({ name: playlistName })
        }).then(response => response.json())
          .then(jsonResponse => {
            const playlistID = jsonResponse.id;
            return fetch(`${url}/users/${userID}/playlists/${playlistID}/tracks`, {
              headers: headers,
              method: 'POST',
              body: JSON.stringify({ uris: playlist })
            });
          });
      });
  }
};
export default Spotify;





















