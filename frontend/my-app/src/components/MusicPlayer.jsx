import React, { useState , useEffect, useRef} from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRounded from '@mui/icons-material/VolumeDownRounded';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Popup from './Popup';
import { addPlaylist } from '../api';
import '../App.css';

const Widget = styled('div')(({ theme }) => ({
  padding: 12,
  borderRadius: 16,
  width: 383,
  height: 273,
  maxWidth: '100%',
  margin: 'auto',
  position: 'relative',
  zIndex: 0,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)',
  backdropFilter: 'blur(40px)',
}));

const CoverImage = styled('div')({
  width: 100,
  height: 100,
  objectFit: 'cover',
  overflow: 'hidden',
  flexShrink: 0,
  borderRadius: 8,
  backgroundColor: 'rgba(0,0,0,0.08)',
  '& > img': {
    width: '100%',
  },
});

const TinyText = styled(Typography)({
  fontSize: '0.75rem',
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2,
});

const MusicPlayer = ({ song, playlistId, iconType }) => {
  const theme = useTheme();
  const audioRef = useRef(null);
  const duration = 29; // seconds
  const [position, setPosition] = useState(0);
  const [paused, setPaused] = useState(true);
  const [volume, setVolume] = useState(100);
  const [isHeartPressed, setIsHeartPressed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const addButtonRef = useRef(null);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    if (audioRef.current) {
      if (paused) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  }, [paused]);

  useEffect(() => {
    const handleTimeUpdate = () => {
      setPosition(audioRef.current.currentTime);
    };

    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, []);

  const handleAddClick = async () => {
    try {
      const response = await addPlaylist(playlistId, song.id);
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
  };

  const handleHeartClick = () => {
    setIsHeartPressed((prevState) => !prevState);
  };

  const handleSliderChange = (_, value) => {
    setPosition(value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  const handleVolumeChange = (_, value) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
    }
  };

  function formatDuration(value) {
    const minute = Math.floor(value / 60);
    const secondLeft = Math.floor(value - minute * 60);
    return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
  }

  const mainIconColor = theme.palette.mode === 'dark' ? '#fff' : '#000';
  const lightIconColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Widget>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CoverImage>
            <img alt={song.name} src={song.album_cover_url} />
          </CoverImage>
          <Box sx={{ ml: 1.5, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} font-size = {'0.9rem'} color = {'rgba(0,0,0,1)'}>
              {song.artists.replace(/[\[\]']/g, '')}
            </Typography>
            <Typography noWrap>
              <b>{song.name}</b>
            </Typography>
            <Typography noWrap letterSpacing={-0.25}>
              {song.year}
            </Typography>
          </Box>
        </Box>
        <Slider
          aria-label="time-indicator"
          size="small"
          value={position}
          min={0}
          step={1}
          max={duration}
          onChange={handleSliderChange}
          sx={{
            color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
            height: 4,
            '& .MuiSlider-thumb': {
              width: 8,
              height: 8,
              transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
              '&::before': {
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
              },
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `0px 0px 0px 8px ${theme.palette.mode === 'dark' ? 'rgb(255 255 255 / 16%)' : 'rgb(0 0 0 / 16%)'}`,
              },
              '&.Mui-active': {
                width: 20,
                height: 20,
              },
            },
            '& .MuiSlider-rail': {
              opacity: 0.28,
            },
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: -2 }}>
          <TinyText>{formatDuration(position)}</TinyText>
          <TinyText>-{formatDuration(duration - position)}</TinyText>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: -1 }}>
          {song.preview_url !== "pna" ? (
            <>
              <IconButton aria-label={paused ? 'play' : 'pause'} onClick={() => setPaused(!paused)}>
                {paused ? (
                  <PlayArrowRounded sx={{ fontSize: '2.7rem' }} htmlColor={mainIconColor} />
                ) : (
                  <PauseRounded sx={{ fontSize: '2.7rem' }} htmlColor={mainIconColor} />
                )}
              </IconButton>
              <audio ref={audioRef} src={song.preview_url} />
            </>
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
          {showPopup && <Popup anchorEl={addButtonRef.current} message={popupMessage} />}
        </Box>
        <Stack spacing={2} direction="row" sx={{ mb: 1, px: 1 }} alignItems="center">
          <VolumeDownRounded htmlColor={lightIconColor} />
          <Slider
            aria-label="Volume"
            value={volume}
            onChange={handleVolumeChange}
            sx={{
              color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
              '& .MuiSlider-track': {
                border: 'none',
              },
              '& .MuiSlider-thumb': {
                width: 24,
                height: 24,
                backgroundColor: '#fff',
                '&::before': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                },
                '&:hover, &.Mui-focusVisible, &.Mui-active': {
                  boxShadow: 'none',
                },
              },
            }}
          />
          <VolumeUpRounded htmlColor={lightIconColor} />
        </Stack>
       
      </Widget>
    </Box>
  );
};

export default MusicPlayer;
