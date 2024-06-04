import React, { useState, useEffect } from "react";
import { getProfile, savePlaylist, logout, login, updateStats } from "./api";
import "./App.css";
import Home from "./Home";
import Profile from "./Profile";
import Footer from "./components/Footer";
import Recommendation from "./components/Recommendations";

const PLAYLIST_AMOUNT = 10;
let refreshIndex = 0;
let recPlaylists;

const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [recommendedPlaylist, setRecommendedPlaylist] = useState([]);
  const [playlistId, setPlaylistId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      getProfile()
        .then((response) => {
          setUserInfo(response.data.user_info);
          setPlaylists(response.data.user_playlists);
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
        });
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    login().then(() => setIsAuthenticated(true));
  };

  const handleLogout = () => {
    logout().then(() => {
      setIsAuthenticated(false);
      setUserInfo(null);
      setPlaylists([]);
      setRecommendedPlaylist([]);
    });
  };

  const handleRecommend = (recommendedPlaylists) => {
    recPlaylists = recommendedPlaylists;
    setRecommendedPlaylist(recPlaylists[refreshIndex]);
    updateStats("Guest", "recommend");
  };

  return (
    <div className="app-container">
      {/* <Header userInfo={userInfo} /> */}
      {!isAuthenticated ? (
        <div>
          <Home onLogin={handleLogin} onSongSelect={handleRecommend} />
          <div>
            {recommendedPlaylist.length > 0 && (
              <Recommendation
                recommendedPlaylists={recPlaylists}
                user_Id={"Guest"}
                playlistId={playlistId}
                iconType="favorite"
              />
            )}
          </div>
        </div>
      ) : (
        <Profile
          userInfo={userInfo}
          userPlaylists={playlists}
          onLogout={handleLogout}
        />
      )}
      <Footer />
    </div>
  );
};

export default App;
