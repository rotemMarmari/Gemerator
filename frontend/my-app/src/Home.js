import React from 'react';
import SearchBar from './SearchBar';
import './home.css';
import spotifyLogo from './assets/spotify-logo-fill-svgrepo-com.svg';

const Home = ({ onLogin, onSongSelect}) => {
  return (
    <div className="app-container">
      <h1>Welcome to Gemerator!</h1>
      <p>Click the button below to login with Spotify and get your own customized playlist.</p>
      <div className="login-button-container">
        <button onClick={onLogin} className="login-button">
          <div className="button-content">
            <span>Login with Spotify</span>
            <img className='spotify-logo' src={spotifyLogo} alt="Logo"/>
          </div>
        </button>
      </div>
      <h2>Or Start Here by Searching For Your Favorite Songs!</h2>
      <div className="search-bar">
        <SearchBar onSongSelect={onSongSelect} />
      </div>
    </div>
  );
};

export default Home;