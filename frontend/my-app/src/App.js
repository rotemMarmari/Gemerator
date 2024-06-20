import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom"; 
import { getProfile, logout, login, updateStats } from "./api";
import "./App.css";
import Home from "./Home";
import Profile from "./Profile";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Recommendation from "./components/Recommendations";
import Gems from "./Gems";

let recPlaylists;

const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [recommendedPlaylist, setRecommendedPlaylist] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [recommendationKey, setRecommendationKey] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      getProfile().then((response) => {
          setUserInfo(response.data.user_info);
          console.log(response.data.user_info);
          setPlaylists(response.data.user_playlists);
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
        });
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    return login().then(() => setIsAuthenticated(true));
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
    recPlaylists = null;
    setRecommendationKey((prevKey) => prevKey + 1);
    recPlaylists = recommendedPlaylists;
    setRecommendedPlaylist(recPlaylists[0]);
    updateStats("Guest", "recommend");
  };

  return (
    <Router>
      <div className="app-container">
        <Header userInfo={userInfo} />
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <Home onLogin={handleLogin} onSongSelect={handleRecommend} />
                {recommendedPlaylist.length > 0 && (
                  <Recommendation
                    key={recommendationKey}
                    recommendedPlaylists={recPlaylists}
                    user_Id={"Guest"}
                    playlistId={null}
                    iconType="favorite"
                  />
                )}
              </div>
            }
          />
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <Profile
                  userInfo={userInfo}
                  userPlaylists={playlists}
                  onLogout={handleLogout}
                />

              ) : (
                <Navigate to="/" />
              ) 
            }
          />
          <Route path="/gems" element={<Gems />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
