import React from 'react';
import SearchBar from './SearchBar';
import './home.css';
import spotifyLogo from './assets/spotify-logo-fill-svgrepo-com.svg';

const Home = ({ onLogin, onSongSelect}) => {
  return (
    <div className="app-container">
      <div className='upper-container'> 
        <div className='home-greeting'>
          <h1>GEMERATOR</h1>
          <h2>Tailored Tunes Just for You</h2>
          <p>At Gemerator, we harness the power of machine learning to craft personalized
             playlists that resonate with your unique musical taste,
            ensuring every track is a gem tailored just for you</p>
        </div>
        <div className="search-song-container">
          <h3>Start here by searching for your favorite songs!</h3>
          <div className="search-bar">
            <SearchBar onSongSelect={onSongSelect} />
          </div>
        </div>
      </div>
      <div className="login-button-container">
        <button onClick={onLogin} className="login-button">
          <div className="button-content">
            <span>Login with Spotify</span>
            <img className='spotify-logo' src={spotifyLogo} alt="Logo"/>
          </div>
        </button>
      </div>
      
    </div>
  );
};

export default Home;