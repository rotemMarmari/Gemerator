import React from 'react';
import './App.css';
import PlaylistContainer from './components/PlaylistContainer';

// const Profile = ({ userInfo, userPlaylists, onLogout, handleSavePlaylist }) => {
//   return (
//     <div className="container">
//       {userInfo && userInfo.name ? (
//         <>
//           <h1>Welcome, {userInfo.name}!</h1>
//           <img src={userInfo.image} alt={`${userInfo.name}'s profile picture`} className="profile-image" />
//           <PlaylistContainer userPlaylists={userPlaylists} handleSavePlaylist={handleSavePlaylist} />
//           <button className="logout-button" onClick={onLogout}>
//             Logout
//           </button>
//         </>
//       ) : (
//         <p>Loading...</p>
//       )}
//     </div>
//   );
// };

const Profile = ({ userInfo, userPlaylists, onLogout }) => {
  return (
    <div className="container">
      <h1>Welcome, {userInfo.name}!</h1>
      <h2>Your Playlists:</h2>
      <ul>
        {userPlaylists.map((playlist) => (
          <li key={playlist.id}>
            {playlist.name}
            <button>Save Playlist</button>
          </li>
        ))}
      </ul>
      <button onClick={onLogout} className="logout-button">Logout</button>
    </div>
  );
};

export default Profile;