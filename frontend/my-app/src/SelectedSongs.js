import React from 'react';
import './App.css';  
import './SelectedSongs.css'; 

const SelectedSongs = ({ selectedSongs, onSongRemove, onRecommend }) => {
  return (
    <div className="selected-songs-container">
      <h3>Selected Songs</h3>
      <ul>
        {selectedSongs.map((song) => (
          <li key={song.id} className="selected-song-item">
            {song.name} - {song.artists} 
            <button onClick={() => onSongRemove(song.id)} className="remove-button">-</button>
          </li>
        ))}
      </ul>
      <button onClick={onRecommend} className="recommend-button">Recommend Songs</button>
    </div>
  );
};

export default SelectedSongs;
