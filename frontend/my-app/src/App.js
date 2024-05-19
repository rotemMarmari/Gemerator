import React, { useState, useEffect } from 'react';
import { getProfile, savePlaylist, logout, login } from './api';
import './App.css';
import Home from './Home';
import Header from './components/Header';
import SongCard from './components/SongCard';
import VirtualizedPlaylists from './VirtualizedPlaylists'; // Adjust the import based on your file structure

const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [recommendedPlaylist, setRecommendedPlaylist] = useState([]);
  const [playlistId, setPlaylistId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    savePlaylist(playlistId).then(response => {
      setRecommendedPlaylist(response.data);
    }).catch(error => {
      console.error('Error saving playlist:', error);
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

  return (
    <div className="app-container">
      <Header userInfo={userInfo} />
      {!isAuthenticated ? (
        <Home onLogin={handleLogin} />
      ) : (
        <div className='container'>
          <h1>Welcome, {userInfo?.name}</h1>
          <button onClick={handleLogout} className="logout-button">Logout</button>
          <h2>Your Playlists</h2>
          <VirtualizedPlaylists handleSavePlaylist={handleSavePlaylist} />
          {recommendedPlaylist.length > 0 && (
            <div>
              <h2>Recommended Songs</h2>
              <div>
                {recommendedPlaylist.map(song => (
                  <SongCard key={song.id} song={song} playlistId={playlistId} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
