import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { addPlaylist } from '../api';
import '../App.css';

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


const SongCard = ({ song, playlistId }) => {
  const [isAdded, setIsAdded] = useState(false); 

  const handleAddClick = () => {
    if (!isAdded) { 
      addPlaylist(playlistId, song.id);
      setIsAdded(true); 
    }
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
        {song.preview_url ? (
            <audio controls>
              <source src={song.preview_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Preview not available
            </Typography>
          )}
          <IconButton aria-label="add" onClick={handleAddClick}>
            <AddIcon />
          </IconButton>
        </Controls>
      </Details>
      <Cover
        image={song.album_cover_url} 
      />
    </Root>
  );
};

export default SongCard;
