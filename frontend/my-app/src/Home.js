import React, { useEffect } from 'react';
import SearchBar from './SearchBar';
import './home.css';
import spotifyLogo from './assets/spotify-logo-fill-svgrepo-com.svg';
import { home } from './api'

const Home = ({ onLogin, onSongSelect}) => {
  
  useEffect(() => {
    home();
  }, [])

  return (
    <div className="app-container">
      <div className='upper-container'> 
        <div className='home-greeting'>
          <h1>GEMERATOR</h1>
          <h2>Unearth Your Sound Jewel</h2>
          <p>At Gemerator, we harness the power of machine learning to craft personalized
             playlists that resonate with your unique musical taste,
            ensuring every track is a gem polished just for you.</p>
          <div className="login-button-container">
            <button onClick={onLogin} className="login-button">
              <div className="button-content">
              <span>Login with Spotify</span>
                <img className='spotify-logo' src={spotifyLogo} alt="Logo"/>
          </div>
        </button>
      </div>
        </div>
        <div className="search-song-container">
          <h3>Start here by searching for your favorite songs!</h3>
          <div className="search-bar">
            <SearchBar onSongSelect={onSongSelect} />
          </div>
        </div>
      </div>
      
      
    </div>
  );
};

export default Home;