import React, { useState } from 'react';
import axios from 'axios';
import SelectedSongs from './SelectedSongs'; 
import './SearchBar.css';  

const SearchBar = ({ onSongSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 2) {
      try {
        const response = await axios.get(`http://localhost:5000/search?q=${value}`);
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
      await axios.post('http://localhost:5000/songs', song);
    } catch (error) {
      console.error('Error saving song:', error);
    }
  };
  
  const handleSongRemove = async (songId) => {
    setSelectedSongs(selectedSongs.filter(song => song.id !== songId));
    
    try {
      await axios.delete(`http://localhost:5000/songs/${songId}`);
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  const handleRecommend = async () => {
    try {
      const response = await axios.post('http://localhost:5000/recommend');
      onSongSelect(response.data);
    } catch (error) {
      console.error('Error recommending songs:', error);
    }
  };

  return (
    <div className="main-container">
      <div className="search-bar-container">
        <input 
          type="text" 
          value={query} 
          onChange={handleSearch} 
          placeholder="Search for a song or artist..." 
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
      />
    </div>
  );
};

export default SearchBar;
