import React from 'react';
import './App.css';  
import './SelectedSongs.css'; 
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const SelectedSongs = ({ selectedSongs, onSongRemove, onRecommend }) => {
  return (
    <div className="selected-songs-container">
      <h3>Selected Songs</h3>
      <ul>
        {selectedSongs.map((song) => (
          <li key={song.id} className="selected-song-item">
            {song.name} - {song.artists} 
            <RemoveCircleOutlineIcon 
              onClick={() => onSongRemove(song.id)} 
              className="remove-icon" 
            />
          </li>
        ))}
      </ul>
      <button onClick={onRecommend} className="btn">Generate playlists</button>
    </div>
  );
};

export default SelectedSongs;
