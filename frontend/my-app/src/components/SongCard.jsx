import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { addPlaylist } from '../api';

const Root = styled(Card)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
}));

const Details = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

const Content = styled(CardContent)({
  flex: '1 0 auto',
});

const Cover = styled(CardMedia)({
  width: 100,
  height: 100,
});

const Controls = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  paddingLeft: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));


const SongCard = ({ song, playlistId }) => {
  const [isAdded, setIsAdded] = useState(false); // State to track if the song is added

  const handleAddClick = () => {
    if (!isAdded) { // Only allow adding if the song hasn't been added yet
      addPlaylist(playlistId, song.id);
      console.log(`Added song: ${song.id}`);
      setIsAdded(true); // Mark the song as added
    }
  };

  
  return (
    <Root sx={{ width: 450, height: 200 }} >
      <Details>
        <Content>
          <Typography component="h5" variant="h5">
            {song.name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {song.artists} ({song.year})
          </Typography>
        </Content>
        <Controls>
          {song.preview_url && (
            <audio controls>
              <source src={song.preview_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
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
