import React, { useEffect, useState } from 'react';
import { getGems } from './api'; 
import MusicPlayer from './components/MusicPlayer';
import './Gems.css';

const Gems = () => {
  const [likedSongs, setLikedSongs] = useState([]);

  useEffect(() => {
    getGems()
      .then((response) => {
        setLikedSongs(response.data);
      })
      .catch((error) => {
        console.error('Error fetching liked songs:', error);
      });
  }, []);
  
  const handleDelete = (songId) => {
    setLikedSongs(likedSongs.filter(song => song.id !== songId));
  };

  return (
    <div className="gems-container">
      <h1>Your Gems</h1>
      <div className="song-cards-container">
        {likedSongs.map((song) => (
          <MusicPlayer key={song.id} user_id={"User"} song={song} iconType="delete" onSongDelete={handleDelete}/>
        ))}
      </div>
    </div>
  );
};

export default Gems;
