import React, { useState, useEffect } from 'react';
import { getProfile, savePlaylist, logout, login, toggleHistory } from './api';
import './profile.css';
import SongCard from './components/SongCard';
import VirtualizedPlaylists from './VirtualizedPlaylists'; 
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box'; 
import Rating from '@mui/material/Rating'; 
import Typography from '@mui/material/Typography'; 
import Loader from './components/Loader';

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
  const [useHistory, setUseHistory] = useState(false); // State for useHistory checkbox
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

  const handleCheckboxChange = (event) => {
    setUseHistory(event.target.checked);
  };

  useEffect(() => {
    console.log(useHistory);
    toggleHistory(useHistory);
  }, [useHistory])

  return (
    !userInfo ? (
      <div className="spinner-container">
        <Loader />
      </div>
    ) : (
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
            <FormControlLabel 
              control={<Checkbox checked={useHistory} onChange={handleCheckboxChange} />} 
              label="Use listening history" 
            />
          </FormGroup>
          <VirtualizedPlaylists handleSavePlaylist={handleSavePlaylist} />
        </div>
        
      </div>
      {loading ? (
        <div className="spinner-container">
          <Loader />
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
                      color: '#F3CA52', // White color for empty star borders
                    }
                  }}
                />
              </Box>
            <div className="song-cards-container">
              {recommendedPlaylist.map(song => (
                <SongCard key={song.id} song={song} playlistId={playlistId} iconType="add"/>
              ))}
            </div>
            <Button variant="contained" color="primary" onClick={handleRefresh}>
              Refresh songs
            </Button>
          </div>
        )
      )}
    </div>)
  );
};

export default Profile;