import React from 'react';

const Profile = ({ userInfo, userPlaylists, onLogout }) => {
  return (
    <div>
      <h1>Welcome, {userInfo.name}!</h1>
      <img src={userInfo.image} alt={`${userInfo.name}'s profile picture`} />
      <h2>Your Playlists:</h2>
      <ul>
        {userPlaylists.map((playlist) => (
          <li key={playlist.id}>
            {playlist.name}
            <button>Save Playlist</button>
          </li>
        ))}
      </ul>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

export default Profile;
