import React, { useState } from "react";
import {
  savePlaylist,
  toggleHistory,
  updateStats,
} from "./api";
import "./profile.css";
import VirtualizedPlaylists from "./VirtualizedPlaylists";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Loader from "./components/Loader";
import Recommendation from "./components/Recommendations";

let recPlaylists;

const Profile = ({ userInfo, userPlaylists, onLogout }) => {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [playlists, setPlaylists] = useState(userPlaylists);
  const [recommendedPlaylist, setRecommendedPlaylist] = useState([]);
  const [playlistId, setPlaylistId] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [useHistory, setUseHistory] = useState(false); 

  const handleSavePlaylist = (playlistId) => {
    setPlaylistId(playlistId);
    setLoading(true); 
    savePlaylist(playlistId)
      .then((response) => {
        recPlaylists = response.data;
        setRecommendedPlaylist(recPlaylists[0]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error saving playlist:", error);
        setLoading(false); // Hide the spinner in case of error
      });
    updateStats(userInfo.id, "recommend");
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleCheckboxChange = (event) => {
    const isChecked = event.target.checked;
    setUseHistory(isChecked);
    toggleHistory(isChecked);
  };
  
  return !userInfo ? (
    <div className="spinner-container initial">
      <Loader />
    </div>
  ) : (
    <div className="profile-app">
      <div className="upper-section">
        <div className="greeting">
          <h1>Hello, </h1>
          <h2>{userInfo?.name}</h2>
          {userInfo?.image && <img src={userInfo.image} alt={userInfo?.name} />}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
        <div className="list-container">
          <h3>Your Playlists</h3>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useHistory}
                  onChange={handleCheckboxChange}
                />
              }
              label="Use listening history"
            />
          </FormGroup>
          <VirtualizedPlaylists handleSavePlaylist={handleSavePlaylist} userPlaylists={userPlaylists} />
        </div>
      </div>
      {loading ? (
        <div className="spinner-container">
          <Loader />
        </div>
      ) : (
        recommendedPlaylist.length > 0 && (
          <Recommendation
            recommendedPlaylists={recPlaylists}
            user_Id={userInfo.id}
            playlistId={playlistId}
            iconType="add"
          />
        )
      )}
    </div>
  );
};

export default Profile;
