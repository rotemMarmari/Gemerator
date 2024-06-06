import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,  // This is important for session management
});

export const home = () => api.post(`/`);
export const login = () => api.get('/login');
export const getProfile = () => api.get('/profile');
export const savePlaylist = (playlistId) => api.get(`/savePlaylist/${playlistId}`);
export const logout = () => api.post('/logout');
export const addToPlaylist = (playlistId, trackId) => api.post(`/add_song_to_playlist/${playlistId}/${trackId}`);
export const toggleHistory = (useHistory) => api.post(`/history/${useHistory}`);
// export const updateStats = (user_id, action) => api.post(`/update_stats/${user_id}/${action}`);
export const updateStats = (user_id, action, rating = null) => {
  const params = new URLSearchParams();
  if (rating !== null) {
      params.append('rating', rating);
  }
  return api.post(`/update_stats/${user_id}/${action}?${params.toString()}`);
};

export const searchSongs = (query) => api.get(`/search?q=${query}`);
export const saveSong = (song) => api.post('/songs', song);
export const removeSong = (songId) => api.delete(`/songs/${songId}`);
export const recommendSongs = () => api.post('/recommend');