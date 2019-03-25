const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        } else {
            const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
            const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
            if (accessTokenMatch && expiresInMatch) {
                accessToken = accessTokenMatch[1];
                const expiresIn = Number(expiresInMatch[1]);
                window.setTimeout(() => accessToken = '', expiresIn * 1000);
                window.history.pushState('Access Token', null, '/');
            } else {
                const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUrl}`;
                window.location = accessUrl;
            }           
        }
    },

    search(term) {
        const accessToken = Spotify.getAccessToken();
        return fetch(`${url}${searchText}&q=${term}`, {
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
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        let userID;

        return fetch(`${url}/me`, {headers: headers})
            .then(response => response.json())
            .then(jsonResponse => {
                userID = jsonResponse.id;
                return fetch(`${url}/users/${userID}/playlists`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({name: playlistName})
                }).then(response => response.json()
                ).then(jsonResponse => {
                    const playlistID = jsonResponse.id;
                    return fetch(`${url}/users/${userID}/playlists/${playlistID}/tracks`, {
                        headers: headers,
                        method: 'POST',
                        body: JSON.stringify({uris: playlist})
                    });
                });
            });
            

    }

};

const clientId = '42ea8106440d435283fc925d36182702';
const redirectUrl = 'http://localhost:3000';
let accessToken;
const url = 'https://api.spotify.com/v1';
const searchText = '/search?type=track';

export default Spotify;