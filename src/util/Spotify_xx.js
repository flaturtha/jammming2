const url = 'https://accounts.spotify.com/authorize';
let userAccessToken = '';
let redirectURI = 'http://localhost:3000/';
let clientID = 'b7f8c18441b8453f97b66ef6ce97f5ce';
const responseType = 'token';
const scope = 'playlist-modify-public';
const authUrl = `${url}?client_id=${clientID}&response_type=${responseType}&scope=${scope}&redirect_uri=${redirectURI}`;

const Spotify = {
  getAccessToken() {
    if(userAccessToken)
      return userAccessToken;
    else if(window.location.href.match(/access_token=([^&]*)/) && window.location.href.match(/expires_in=([^&]*)/)) {
      let accessToken = window.location.href.match(/access_token=([^&]*)/)[1];
      let expiresIn = window.location.href.match(/expires_in=([^&]*)/)[1];
  
      window.setTimeout(() => accessToken = '', expiresIn*1000);
      window.history.pushState('Access Token', null, '/');
  
      return accessToken;
    } else {
      window.location = authUrl;
    }
  },
  search(term) {
    let accessToken = this.getAccessToken();
    if (!accessToken) {
      console.log('No access token')
      return [];
    }
    const mainTerm = encodeURI(term);
    return fetch(`https://api.spotify.com/v1/search?q=${mainTerm}&type=track`, {headers: {Authorization: `Bearer ${accessToken}`}
  }).then((response) => {
      return response.json()
  }).then((jsonResponse) => {
    if (jsonResponse.tracks) {
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }))
    } else {
      return []
    }
  })
  },
  /* New Code Below. 
  The logging (catching errors) is stripped away for clarity but you get the basic idea. 
  Get it to work with promises and then go back and refactor with async-await. */
  savePlaylist(name, trackUris) {

    if (!name || !trackUris.length) {
      return;
    }
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userId;

    return fetch('https://api.spotify.com/v1/me', {
      headers: headers}
    ).then(response => {
      if (response.ok) {
        return response.json()
      }
      throw new Error('Request Failed!');
    }, networkError => console.log(networkError.message)
    ).then(jsonResponse => {
      userId = jsonResponse.id;
      return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({name: name})
      }).then(response => {
        if (response.ok) {
          return response.json()
        }
        throw new Error('Request Failed!');
      }, networkError => console.log(networkError.message)
      ).then(jsonResponse => {
        const playlistId = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({uris: trackUris})
        });
      })
    })
  }
}

export default Spotify;