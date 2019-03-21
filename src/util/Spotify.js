const clientId = 'b7f8c18441b8453f97b66ef6ce97f5ce';
const redirectUri = 'http://localhost:3000/';
const spotifyUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;

let accessToken;
let expiresIn;

let Spotify = {
  getAccessToken(){
    if(accessToken){
      return accessToken;
    }

    if(window.location.href.match(/access_token=([^&]*)/) && window.location.href.match(/expires_in=([^&]*)/)) {
      accessToken = window.location.href.match(/access_token=([^&]*)/[1]);
      expiresIn = window.location.href.match(/expires_in=([^&]*)/[1]);

      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
    } else {
      window.location = spotifyUrl;
    }
  },

  search(term){
    const accessToken = Spotify.getAccessToken();
    const headers = {Authorization: `Bearer ${accessToken}`};
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {headers: headers}).then(response => {
      if(response.ok){
        return response.json();
      }
    }).then(jsonResponse => {
      if (!jsonResponse.tracks){
        return [];
      }
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artist,
        album: track.album,
        uri: track.uri
      }))
    })
  },

  savePlaylist(playlistName, trackURIs){
    if(!playlistName && !trackURIs){
      return;
    }
    
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}`};
    let userId;

    return fetch('https://api.spotify.com/v1/me', {headers: headers}).then(response => response.json().then(jsonResponse =>{
      userId = jsonResponse.id;
      return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        header: headers,
        method: 'POST',
        body: JSON.stringify({name: playlistName})
      }).then(response => response.json().then(jsonResponse =>{
        const playlistID = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistID}/tracks`), {
          header: headers,
          method: 'POST',
          body: JSON.stringify({uris: trackURIs})
        }
      }));
    }));    
  }

};

export default Spotify;





















