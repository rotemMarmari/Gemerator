import React from 'react';
import SearchBar from './SearchBar';
import './home.css';

const Home = ({ onLogin ,onSongSelect}) => {
  return (
    <div className="app-container">
      <h1>Welcome to Gemerator!</h1>
      <p>Click the button below to login with Spotify and get your own customized playlist.</p>
      <div className="login-button">
        <button onClick={onLogin} className="login-button"> 
          Login with Spotify
        </button>
      </div>
      <div className="search-bar">
        <SearchBar onSongSelect={onSongSelect} />
      </div>
    </div>
  );
};

export default Home;