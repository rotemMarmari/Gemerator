import React, { useState } from 'react';
import { searchSongs, saveSong, removeSong, recommendSongs } from './api';
// import axios from 'axios';
import SelectedSongs from './SelectedSongs'; 
import './SearchBar.css';  

const SearchBar = ({ onSongSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [loading, setLoading] = useState(false); 

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 2) {
      try {
        // const response = await axios.get(`http://localhost:5000/search?q=${value}`);
        const response = await searchSongs(value);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSongSelect = async (song) => {
    setSelectedSongs([...selectedSongs, song]);
    setQuery('');
    setSuggestions([]);
    
    try {
      // await axios.post('http://localhost:5000/songs', song);
      await saveSong(song);
    } catch (error) {
      console.error('Error saving song:', error);
    }
  };
  
  const handleSongRemove = async (songId) => {
    setSelectedSongs(selectedSongs.filter(song => song.id !== songId));
    
    try {
      // await axios.delete(`http://localhost:5000/songs/${songId}`);
      await removeSong(songId);
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  const handleRecommend = async () => {
    setLoading(true); // Show the spinner
    try {
      // const response = await axios.post('http://localhost:5000/recommend');
      const response = await recommendSongs();
      onSongSelect(response.data);
    } catch (error) {
      console.error('Error recommending songs:', error);
    } finally {
      setLoading(false); // Hide the spinner
    }
  };

  return (
    <div className="main-container">
      <div className="search-bar-container">
        <input 
          type="text" 
          value={query} 
          onChange={handleSearch} 
          placeholder="Search for a song or artist" 
          className="search-input"
        />
        {suggestions.length > 0 && (
          <div className="suggestions-container">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="suggestion-item" 
                onClick={() => handleSongSelect(suggestion)}
              >
                {suggestion.name} - {suggestion.artists}
              </div>
            ))}
          </div>
        )}
      </div>
      <SelectedSongs 
        selectedSongs={selectedSongs}
        onSongRemove={handleSongRemove}
        onRecommend={handleRecommend}
        loading={loading}
      />
    </div>
  );
};

export default SearchBar;
