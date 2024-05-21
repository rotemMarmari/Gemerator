import React, { useState, useEffect } from 'react';
import { getProfile, savePlaylist, logout, login } from './api';
import './App.css';
import Home from './Home';
import Header from './components/Header';
import SongCard from './components/SongCard';
import VirtualizedPlaylists from './VirtualizedPlaylists'; 
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { ClipLoader } from 'react-spinners'; // Import the spinner
import Button from '@mui/material/Button';
import SearchBar from './SearchBar'; // Import SearchBar

const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [recommendedPlaylist, setRecommendedPlaylist] = useState([]);
  const [playlistId, setPlaylistId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false); // State to manage loading spinner
  const [savedSong, setSavedSong] = useState(null); // State to manage the saved song

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

  const handleSavePlaylist = (playlistId) => {
    setPlaylistId(playlistId);
    setLoading(true); // Show the spinner
    savePlaylist(playlistId).then(response => {
      setRecommendedPlaylist(response.data);
      setLoading(false); // Hide the spinner
    }).catch(error => {
      console.error('Error saving playlist:', error);
      setLoading(false); // Hide the spinner in case of error
    });
  };

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

  const UseHistory = { inputProps: { 'aria-label': 'Checkbox demo' } };

  return (
    <div className="app-container">
      <Header userInfo={userInfo} />
      {!isAuthenticated ? (
        <Home onLogin={handleLogin} onSongSelect={handleSongSelect}/>
      ) : (
        <div className='container'>
          <h1>Welcome, {userInfo?.name}</h1>
          <button onClick={handleLogout} className="logout-button">Logout</button>
          <h2>Your Playlists</h2>
          <FormGroup>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Use listening history" />
          </FormGroup>
          <VirtualizedPlaylists handleSavePlaylist={handleSavePlaylist} />
          {loading ? (
            <div className="spinner-container">
              <ClipLoader size={50} color={"#123abc"} loading={loading} />
            </div>
          ) : (
            recommendedPlaylist.length > 0 && (
              <div>
                <h2>Recommended Songs</h2>
                <Button variant="contained" color="primary" onClick={handleSavePlaylist}>
                  Refresh songs
                </Button>
                <div className="song-cards-container">
                  {recommendedPlaylist.map(song => (
                    <SongCard key={song.id} song={song} playlistId={playlistId} />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default App;