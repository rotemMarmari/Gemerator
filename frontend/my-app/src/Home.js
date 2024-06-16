import React, { useEffect } from 'react';
import { useNavigate  } from 'react-router-dom';
import SearchBar from './SearchBar';
import './home.css';
import spotifyLogo from './assets/spotify-logo-fill-svgrepo-com.svg';
import { home } from './api'

const Home = ({ onLogin, onSongSelect}) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    home();
  }, [])

  const handleLoginClick = () => {
    onLogin().then(() => {
      navigate('/profile');
    });
  };

  return (
    <div className="app-container">
      <div className='upper-container'> 
        <div className='home-greeting'>
          <h1>GEMERATOR</h1>
          <h2>Unearth Your Sound Jewel</h2>
          <p>
          At Gemerator, We offer personalized playlist creation by analyzing your favorite songs. Connect your Spotify account to unlock playlists that resonate with your unique musical taste.  Every track will be a gem, polished just for you.
          <br/>
          <br/>
          <strong>Prefer to create playlists yourself?</strong> No problem!  Gemerator also allows you to manually build playlists for any occasion.
          <br/>
          <br/>
          <strong>Join us and elevate your music experience today!</strong></p>
          <div className="login-button-container">
            <button onClick={handleLoginClick} className="login-button">
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