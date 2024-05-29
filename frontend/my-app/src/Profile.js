import React, { useState, useEffect } from 'react';
import { getProfile, savePlaylist, logout, login } from './api';
import './profile.css';
import SongCard from './components/SongCard';
import VirtualizedPlaylists from './VirtualizedPlaylists'; 
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { ClipLoader } from 'react-spinners'; // Import the spinner
import Button from '@mui/material/Button';
import Box from '@mui/material/Box'; // Import Box from MUI
import Rating from '@mui/material/Rating'; // Import Rating from MUI
import Typography from '@mui/material/Typography'; // Import Typography from MUI

const PLAYLIST_AMOUNT = 10;
let refreshIndex = 0;
let recPlaylists;

const Profile = ({ userInfo, userPlaylists, onLogout }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [playlists, setPlaylists] = useState(userPlaylists);
  const [recommendedPlaylist, setRecommendedPlaylist] = useState([]);
  const [playlistId, setPlaylistId] = useState(null);
  const [loading, setLoading] = useState(false); // State to manage loading spinner
  const [savedSong, setSavedSong] = useState(null); // State to manage the saved song
  const UseHistory = { inputProps: { 'aria-label': 'Checkbox demo' } };
  const [ratingValue, setRatingValue] = useState(0); // State to manage the rating

  useEffect(() => {
    if (isAuthenticated) {
      getProfile().then(response => {
        setPlaylists(response.data.user_playlists);
      }).catch(error => {
        console.error('Error fetching profile:', error);
      });
    }
  }, [isAuthenticated]);

  const handleSavePlaylist = (playlistId) => {
    setPlaylistId(playlistId);
    setLoading(true); // Show the spinner
    savePlaylist(playlistId).then(response => {
      // refreshIndex = 0;
      recPlaylists = response.data;
      setRecommendedPlaylist(recPlaylists[refreshIndex]);
      setLoading(false); // Hide the spinner
    }).catch(error => {
      console.error('Error saving playlist:', error);
      setLoading(false); // Hide the spinner in case of error
    });
  };

  
  const handleRefresh = () => {
    refreshIndex = (refreshIndex + 1) % PLAYLIST_AMOUNT;
    setRecommendedPlaylist(recPlaylists[refreshIndex]);
  }

  const handleLogin = () => {
    login().then(() => setIsAuthenticated(true));
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleSongSelect = (song) => {
    setSavedSong(song);
    // You can also save the song to a playlist or perform other actions here
    console.log('Selected song:', song);
  };

  return (
    <div className='profile-app'>
      <div className='upper-section'>
        <div className='greeting'>
          <h1>Hello, </h1>
          <h2>{userInfo?.name}</h2>
          <img src={userInfo?.image} />
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
        <div className="list-container">
          <h3>Your Playlists</h3>
          <FormGroup>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Use listening history" />
          </FormGroup>
          <VirtualizedPlaylists handleSavePlaylist={handleSavePlaylist} />
        </div>
        
      </div>
      {loading ? (
        <div className="spinner-container">
          <ClipLoader size={50} color={"#123abc"} loading={loading} />
        </div>
      ) : (
        recommendedPlaylist.length > 0 && (
          <div className='recommendations'>
            <h2>Recommended Songs</h2>
            <Button variant="contained" color="primary" onClick={handleRefresh}>
              Refresh songs
            </Button>
            <Box sx={{ '& > legend': { mt: 2 } }}>
                <Typography component="legend">Rate the playlists</Typography>
                <Rating
                  name="playlist-rating"
                  value={ratingValue}
                  onChange={(event, newValue) => {
                    setRatingValue(newValue);
                    
                  }}
                  sx={{
                    '& .MuiRating-iconEmpty': {
                      color: 'rgba(255, 255, 255, 0.8)', // White color for empty star borders
                    }
                  }}
                />
              </Box>
            <div className="song-cards-container">
              {recommendedPlaylist.map(song => (
                <SongCard key={song.id} song={song} playlistId={playlistId} />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Profile;
