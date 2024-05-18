import React from 'react';
import '../App.css';

const PlaylistContainer = ({ userPlaylists, handleSavePlaylist }) => {
  return (
    <div className="playlist-container">
      <h2>Your Playlists</h2>
      <div className="playlist-list">
        {userPlaylists.map((playlist) => (
          <div key={playlist.id} className="playlist-item">
            <span>{playlist.name}</span>
            <button onClick={() => handleSavePlaylist(playlist.id)}>Get Recommendations</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistContainer;