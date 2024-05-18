import React from 'react';

const Home = ({ onLogin }) => {
  return (

    <div className="app-container">
      <h1>Welcome to Gemerator!</h1>
      <p>Click the button below to login with Spotify and get your own customized playlist.</p>
      <div className="login-button">
        <button onClick={onLogin} className="boton-elegante">
          Login with Spotify
        </button>
      </div>
    </div>
  );
};

export default Home;
