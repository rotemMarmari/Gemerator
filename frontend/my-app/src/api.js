import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,  // This is important for session management
});

export const login = () => api.get('/login');
export const getProfile = () => api.get('/redirect');
export const savePlaylist = (playlistId) => api.get(`/savePlaylist/${playlistId}`);
export const logout = () => api.post('/logout');
