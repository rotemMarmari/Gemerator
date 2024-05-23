import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';
import { getProfile } from './api'; 

const VirtualizedPlaylists = ({ handleSavePlaylist }) => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    getProfile().then(response => {
      setPlaylists(response.data.user_playlists);
    }).catch(error => {
      console.error('Error fetching playlists:', error);
    });
  }, []);

  const renderRow = ({ index, style }) => {
    const playlist = playlists[index];

    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton onClick={() => handleSavePlaylist(playlist.id)}>
          <ListItemText primary={playlist.name} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Box sx={{ width: '100%', height: 400, maxWidth: 360, bgcolor: '#810CA8' }}>
      <FixedSizeList
        height={400}
        width={360}
        itemSize={46}
        itemCount={playlists.length}
        overscanCount={5}
      >
        {renderRow}
      </FixedSizeList>
    </Box>
  );
};

export default VirtualizedPlaylists;
