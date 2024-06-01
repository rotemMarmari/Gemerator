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
export const addPlaylist = (playlistId, trackId) => api.post(`/add_song_to_playlist/${playlistId}/${trackId}`);
export const toggleHistory = (useHistory) => api.post(`/history/${useHistory}`);
