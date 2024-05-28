import React from 'react';
import SearchBar from './SearchBar';
import './home.css';
import spotifyLogo from './assets/spotify-logo-fill-svgrepo-com.svg';

const Home = ({ onLogin, onSongSelect}) => {
  return (
    <div className="app-container">
      <div className='home-greeting'>
        <h1>GEMERATOR</h1>
        <h2>Tailored Tunes Just for You</h2>
        <p>At Gemerator, we harness the power of machine learning to craft personalized playlists that resonate with your unique musical taste,
           ensuring every track is a gem tailored just for you</p>
        </div>
      <div className="login-button-container">
        <p>Get your own customized playlist with Spotify</p>
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