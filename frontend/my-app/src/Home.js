import React from 'react';
import SearchBar from './SearchBar';

const Home = ({ onLogin, onSongSelect }) => {
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



// import React, { useState } from 'react';
// import SearchBar from './SearchBar';
// import SelectedSongs from './SelectedSongs';
// import './Home.css';

// const Home = ({ onLogin }) => {
//   const [selectedSongs, setSelectedSongs] = useState([]);

//   const handleSongSelect = (song) => {
//     setSelectedSongs((prevSongs) => [...prevSongs, song]);
//   };

//   const handleSongRemove = (songId) => {
//     setSelectedSongs((prevSongs) => prevSongs.filter(song => song.id !== songId));
//   };

//   return (
//     <div className="app-container">
//       <h1>Welcome to Generator!</h1>
//       <p>Click the button below to login with Spotify and get your own customized playlist.</p>
//       <div className="login-button">
//         <button onClick={onLogin} className="login-button">
//           Login with Spotify
//         </button>
//       </div>
//       <div className="main-content">
//         <div className="search-bar">
//           <SearchBar onSongSelect={handleSongSelect} />
//         </div>
//         <div className="selected-songs">
//           <SelectedSongs songs={selectedSongs} onSongRemove={handleSongRemove} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;
