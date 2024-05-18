import React, { useState, useEffect } from 'react';
import { login, getProfile, savePlaylist, logout } from './api';
import './App.css';
import Home from './Home';
import Profile from './Profile';
import Header from './components/Header';

const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [recommendedPlaylist, setRecommendedPlaylist] = useState([]);

  useEffect(() => {
    getProfile().then(response => {
      setUserInfo(response.data.user_info);
      setPlaylists(response.data.user_playlists);
    }).catch(error => {
      console.error('Error fetching profile:', error);
    });
  }, []);

  const handleSavePlaylist = (playlistId) => {
    savePlaylist(playlistId).then(response => {
      setRecommendedPlaylist(response.data);
    }).catch(error => {
      console.error('Error saving playlist:', error);
    });
  };

  return (
    <div className="app-container">
      <Header userInfo={userInfo} />
      {!userInfo ? 
      < Home/> :
      // (
      //   <button onClick={() => login().then(response => {
      //     window.location.href = response.data.auth_url;
      //   })}>
      //     Login with Spotify
      //   </button>
      // ) : 
      (
       // <Profile/>
        <div className='container'>
          <h1>Welcome, {userInfo.name}</h1>
          <button onClick={logout} className="logout-button">Logout</button>
          <h2>Your Playlists</h2>
          <ul>
            {playlists.map(playlist => (
              <li key={playlist.id}>
                {playlist.name}
                <button onClick={() => handleSavePlaylist(playlist.id)}>Get Recommendations</button>
              </li>
            ))}
          </ul>
          {recommendedPlaylist.length > 0 && (
            <div>
              <h2>Recommended Songs</h2>
              <ul>
                {recommendedPlaylist.map(song => (
                  <li key={song.id}>
                    {song.name} by {song.artists} ({song.year})
                    {song.preview_url ? (
                      <audio controls>
                        <source src={song.preview_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <p>No preview available</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
