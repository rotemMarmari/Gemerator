import React, { useState, useEffect } from 'react';
import { getProfile, savePlaylist, logout, login } from './api';
import './App.css';
import Home from './Home';
import Header from './components/Header';
import SongCard from './components/SongCard';
import Box from '@mui/material/Box'; // Import Box from MUI
import Rating from '@mui/material/Rating'; // Import Rating from MUI
import Typography from '@mui/material/Typography'; // Import Typography from MUI
import Button from '@mui/material/Button';
import Profile from './Profile';
import Footer from './components/Footer';
import Loader from './components/Loader';
import MusicPlayer from './components/MusicPlayer';

const PLAYLIST_AMOUNT = 10;
let refreshIndex = 0;
let recPlaylists;

const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [recommendedPlaylist, setRecommendedPlaylist] = useState([]);
  const [playlistId, setPlaylistId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false); // State to manage loading spinner
  const [savedSong, setSavedSong] = useState(null); // State to manage the saved song
  const [ratingValue, setRatingValue] = useState(0); // State to manage the rating

  useEffect(() => {
    if (isAuthenticated) {
      getProfile().then(response => {
        setUserInfo(response.data.user_info);
        setPlaylists(response.data.user_playlists);
      }).catch(error => {
        console.error('Error fetching profile:', error);
      });
    }
  }, [isAuthenticated]);

  
  const handleRefresh = () => {
    refreshIndex = (refreshIndex + 1) % PLAYLIST_AMOUNT;
    setRecommendedPlaylist(recPlaylists[refreshIndex]);
  }

  const handleLogin = () => {
    login().then(() => setIsAuthenticated(true));
  };

  const handleLogout = () => {
    logout().then(() => {
      setIsAuthenticated(false);
      setUserInfo(null);
      setPlaylists([]);
      setRecommendedPlaylist([]);
    });
  };

  const handleSongSelect = (song) => {
    setSavedSong(song);
    // You can also save the song to a playlist or perform other actions here
    console.log('Selected song:', song);
  };

  const handleRecommend = (recommendedPlaylists) => {
    setLoading(true); // Show the spinner
    recPlaylists = recommendedPlaylists;
    setRecommendedPlaylist(recPlaylists[refreshIndex]);
    setLoading(false); 
  };

  const UseHistory = { inputProps: { 'aria-label': 'Checkbox demo' } };

  return (
    <div className="app-container">
      <Header userInfo={userInfo} />
      {!isAuthenticated ? (
        <div>
          <Home onLogin={handleLogin} onSongSelect={handleRecommend}/>
          {loading ? (
            <div className="spinner-container">
              <Loader />
            </div>
          ) : (
            recommendedPlaylist.length > 0 && (
            <div className='recommendations'>
              <div className='recommendations-controller'> 
              <h2>Recommended Songs</h2>
                <Button variant="contained" color="primary" onClick={handleRefresh}>
                    Refresh songs
                  </Button>
                  <Box sx={{ '& > legend': { mt: 2 } }}>
                      <Typography component="legend" 
                      sx={{
                        textShadow: `
                          -1px -1px 0 #290A50,  
                          1px -1px 0 #290A50,
                          -1px  1px 0 #290A50,
                          1px  1px 0 #290A50
                        `
                      }}
                      >
                        Rate the playlists
                        </Typography>
                      <Rating
                        name="playlist-rating"
                        value={ratingValue}
                        onChange={(event, newValue) => {
                          setRatingValue(newValue);
                          
                        }}
                        sx={{
                          '& .MuiRating-iconEmpty': {
                            color: '#F3CA52', 
                          }
                        }}
                      />
                    </Box>
                    </div>
              <div className="song-cards-container">
                {recommendedPlaylist.map(song => (
                  // <SongCard key={song.id} song={song} playlistId={playlistId} iconType="favorite" />
                  <MusicPlayer key={song.id} song={song} playlistId={playlistId} iconType="favorite"/>
                ))}
              </div>
              <div className='recommendations-controller'> 
                <Button variant="contained" color="primary" onClick={handleRefresh}>
                  Refresh songs
                </Button>
                </div>
            </div>
          )
          ) }
      </div>
      ) : (
        <Profile 
          userInfo={userInfo}
          userPlaylists={playlists}
          onLogout={handleLogout}
        />
      )}
      <Footer />
    </div>
  );
};

export default App;
