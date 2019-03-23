const clientId = '42ea8106440d435283fc925d36182702';
const redirectUri = 'http://localhost:3000/';
const scope = 'playlist-modify-public';
const spotifyUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=${scope}&redirect_uri=${redirectUri}`;

let userAccessToken = '';
// let expiresIn;

const Spotify = {
  getAccessToken() {
    if (userAccessToken) {
      return userAccessToken;
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
    let accessToken = this.getAccessToken();
    if (!accessToken) {
      console.log('No access token');
      return [];
    }

    // const headers = { Authorization: `Bearer ${accessToken}` };
    const encodedTerm = encodeURI(term);
    return fetch(`https://api.spotify.com/v1/search?q=${encodedTerm}&type=track`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then((response) => {
      console.log(response.json);
      // return response.json();
    }).then((jsonResponse) => {
      if (jsonResponse.tracks) {
        return jsonResponse.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artist[0].name,
          album: track.album.name,
          uri: track.uri
        }))
      } else {
        return []
      }
    })
  },


  savePlaylist(name, trackURIs) {
    if (!name || !trackURIs.length) {
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userId;

    return fetch('https://api.spotify.com/v1/me', { headers: headers }
    ).then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error('Request Failed!');
    }, networkError => console.log('networkError.message')
    ).then((jsonResponse) => {
      userId = jsonResponse.id;
      return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        header: headers,
        method: 'POST',
        body: JSON.stringify({ name: name })
      }).then((response) => {
        if (response.ok) {
          return response.json()
        }
        throw new Error('Request Failed!');
      }, networkError => console.log('networkError.message')
      ).then((jsonResponse) => {
        const playlistID = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistID}/tracks`, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({ uris: trackURIs })
        });
      })
    })      
  }
}

export default Spotify;





















