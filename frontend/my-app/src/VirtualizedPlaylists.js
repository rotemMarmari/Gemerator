  import Box from '@mui/material/Box';
  import ListItem from '@mui/material/ListItem';
  import ListItemButton from '@mui/material/ListItemButton';
  import ListItemText from '@mui/material/ListItemText';
  import Typography from '@mui/material/Typography';  // Import Typography
  import { FixedSizeList } from 'react-window';

  const VirtualizedPlaylists = ({ handleSavePlaylist, userPlaylists }) => {
    const renderRow = ({ index, style }) => {
      const playlist = userPlaylists[index];

      return (
        <ListItem style={style} key={index} component="div" disablePadding>
          <ListItemButton onClick={() => handleSavePlaylist(playlist.id)}>
            <ListItemText primary={
              <Typography sx={{ fontWeight: 700 }}>
                {playlist.name}
              </Typography>
            }
            />
          </ListItemButton>
        </ListItem>
      );
    };

    return (
      <Box sx={{ width: '100%', height: 400, bgcolor: '#FFE55E', color:'#290A50'}}>
        <FixedSizeList
          height={400}
          itemSize={46}
          itemCount={userPlaylists.length}
          overscanCount={5}
        >
          {renderRow}
        </FixedSizeList>
      </Box>
    );
  };

  export default VirtualizedPlaylists;
