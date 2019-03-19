import React from 'react';
import './Playlist.css';

class Playlist extends React.Component{
  render(){
    return(
      <div className="Playlist">
        <input value="New Playlist"/>
          <TrackList />
        <a class="Playlist-save">SAVE TO SPOTIFY</a>
      </div>
    )
  }
}