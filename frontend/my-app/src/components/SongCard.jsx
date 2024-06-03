import React, { useState, useEffect, useRef } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { addToPlaylist, updateStats } from '../api';
import '../App.css';
import Popup from './Popup';

const Root = styled(Card)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(1),
  backgroundColor: '#E5B8F4',
  padding: theme.spacing(0.2),
}));

const Details = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

const Content = styled(CardContent)({
  flex: '0.5 0 auto',
});

const Cover = styled(CardMedia)({
  width: 100,
  height: 100,
  borderRadius: '5px',
});

const Controls = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  paddingLeft: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));


const SongCard = ({ user_id, song, playlistId, iconType }) => {
  //const [isAdded, setIsAdded] = useState(false); 
  
  const [isHeartPressed, setIsHeartPressed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const addButtonRef = useRef(null);
  const [popupMessage, setPopupMessage] = useState('');

  const handleAddClick = async () => {
    try {
      const response = await addToPlaylist(playlistId, song.id);
      if (response.data.error) {
        setPopupMessage(response.data.error);
      } else {
        setPopupMessage(response.data.message || 'Song added to playlist');
      }
    } catch (error) {
      setPopupMessage('An error occurred');
    }
    setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
      }, 2000); 
    updateStats(user_id, 'save');
  };

  const handleHeartClick = () => {
    setIsHeartPressed(prevState => !prevState);
    updateStats(user_id, isHeartPressed ? 'dislike' : 'like'); 
  };

  
  return (
    <Root sx={{ width: 300, height: 200 }} >
      <Details>
        <Content>
          <Typography component="h5" variant="h5" sx={{ fontSize: '1.2rem'}}>
            {song.name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
            {song.artists} ({song.year})
          </Typography>
        </Content>
        <Controls>
        {(song.preview_url != "pna") ? (
            <audio controls>
              <source src={song.preview_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Preview not available
            </Typography>
          )}
          <IconButton
            aria-label={iconType === 'add' ? 'add' : 'favorite'}
            onClick={iconType === 'add' ? handleAddClick : handleHeartClick}
            ref={addButtonRef}
          >
            {iconType === 'add' ? <AddIcon /> : (
              <FavoriteIcon sx={{ color: isHeartPressed ? 'red' : 'default' }} />
            )}
          </IconButton>
        </Controls>
      </Details>
      <Cover
        image={song.album_cover_url} 
      />
      {showPopup && <Popup anchorEl={addButtonRef.current} message={popupMessage}/>} {/* Adjust anchorEl as needed */}
    </Root>
  );
};

export default SongCard;
