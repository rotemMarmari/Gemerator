import React, { useState, useEffect } from 'react';
import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MusicPlayer from "./MusicPlayer";
import { updateStats } from '../api';

const PLAYLIST_AMOUNT = 10;
let refreshIndex = 0;
let refresh_start_over = false;

const Recommendation = ({ recommendedPlaylists, user_Id, playlistId, iconType }) => {
  const [playlists, setPlaylists] = useState(recommendedPlaylists);
  const [currentPlaylist, setCurrentPlaylist] = useState(recommendedPlaylists[0]);
  const [ratingValue, setRatingValue] = useState(0); 
  const [ratingLocked, setRatingLocked] = useState(false); 

  useEffect(() => {
    if (recommendedPlaylists.length > 0) {
      refresh_start_over = false;
      setPlaylists(recommendedPlaylists);
      setCurrentPlaylist(playlists[0]);
    }
  }, [recommendedPlaylists, playlists]);

  const handleRefresh = () => {
    refreshIndex = (refreshIndex + 1) % PLAYLIST_AMOUNT;
    if(refreshIndex === 0)
      refresh_start_over = true;
    setCurrentPlaylist(playlists[refreshIndex]);
    if(!refresh_start_over)
      updateStats(user_Id, "recommend");
  };

  const handleRatingChange = (newValue) => {
    if (!ratingLocked) {
      setRatingValue(newValue);
    }
  };

  const handleLockRating = (rating) => {
    setRatingLocked(true);
    updateStats(user_Id , "rate", rating);
  };

  const handleResetRating = (rating) => {
    updateStats(user_Id, "cancel_rate", rating);
    setRatingValue(0);
    setRatingLocked(false);
  };

  return (
    <div className="recommendations">
      <div className="recommendations-controller">
        <h2>More Gems For Your Playlist</h2>
        <Button variant="contained" color="primary" onClick={handleRefresh}>
          Refresh songs
          <RefreshIcon />
        </Button>
        <Box sx={{ "& > legend": { mt: 2 } }}>
          <Typography component="legend">
            Rate the playlists
          </Typography>
          <Rating
            name="playlist-rating"
            value={ratingValue}
            onChange={(event, newValue) => handleRatingChange(newValue)}
            sx={{
              "& .MuiRating-icon": {
                fontSize: "2rem", // Default size
              },
              "& .MuiRating-iconHover": {
                fontSize: "2.1rem", // Size when hovering
              },
              "& .MuiRating-iconEmpty": {
                color: "#F3CA52",
              },
            }}
            disabled={ratingLocked}
          />
          {!ratingLocked && ratingValue !== 0 && (
            <Button variant="contained" color="primary" onClick={() => handleLockRating(ratingValue)}>
              Lock Rating
            </Button>
          )}
          {ratingLocked && (
            <Button variant="contained" color="secondary" onClick={() => handleResetRating(ratingValue)}>
              Reset Rating
            </Button>
          )}
        </Box>
      </div>
      <div className="song-cards-container">
        {currentPlaylist.map((song) => (
          <MusicPlayer key={song.id} user_id={user_Id} song={song} playlistId={playlistId} iconType={iconType} />
        ))}
      </div>
      <div className="recommendations-controller">
        <Button variant="contained" color="primary" onClick={handleRefresh}>
          Refresh songs
          <RefreshIcon />
        </Button>
      </div>
    </div>
  );
};

export default Recommendation;
