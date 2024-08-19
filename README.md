# Gemerator

## _Unearth Your Sound Jewel_

Gemerator is a music recommendation website built using Flask and React, designed to enhance your listening experience. If you have a Spotify account, you can choose any of your playlists to get personalized song recommendations. For non-Spotify users, you can create custom playlists and receive tailored song suggestions based on those. Whether you're a Spotify user or not, Gemerator is here to help you discover new music you'll love.

## UI Previews

### Home Page
![Home Page](https://github.com/rotemMarmari/Gemerator/assets/127433228/5bef55dd-58b4-4972-97d0-2cd5a37c196b)
- **Description**: The homepage allows users to navigate, check their login status (Guest or Spotify User), and create playlists by searching for songs using the Spotify API.

### Profile
![image](https://github.com/user-attachments/assets/04fbf42c-61c9-4e85-8d15-ace1abdc3d17)
- **Description**: The profile page displays the user's Spotify playlists and allows them to toggle whether to include their listening history in recommendations.

### Recommendation Section
![image](https://github.com/user-attachments/assets/84933c6b-99dd-4ec3-9290-f69a9eeead81)
- **Description**: This section shows the recommended playlists based on user interaction, with options to rate the suggestions and manage song previews.

### "My Gems"
![My Gems](https://github.com/user-attachments/assets/c9706b29-6464-45b9-8a5f-973e22b0bd4c)
- **Description**: The "My Gems" page displays the songs that the user has favorited or added to playlists, with an option to manage and remove them.

## Features

- **User authentication with Spotify**
- **Fetch user's playlists and saved tracks**
- **Fetch user's recent listening history**
- **Generate personalized song recommendations**
- **Add songs to Spotify playlists**
- **Track user interactions and song ratings**

## Key Features Overview

### 1. Home Page
- **Navigation**: Quick access to the homepage via the header.
- **User Status**: Displays the current user (Guest or Spotify User).
- **My Gems**: Link to the "My Gems" page, where user-curated songs are displayed.
- **Spotify Integration**: A button to log in to Spotify, leading to the Profile page after successful validation.
- **Playlist Creation**: Users can manually create playlists by searching for songs or artists using the Spotify API.
  - **Interactive Search**: Autocomplete suggestions powered by Spotify API.
  - **Custom Playlist**: Users can curate their playlists, with options to add or remove songs.
  - **Playlist Generation**: The "Generate Playlists" button recommends playlists based on the songs added by the user.
- **Duplicate Prevention**: Prevents adding the same song twice, with an alert message.

### 2. Profile Page
- **Logout**: A button to log out from the system.
- **User Playlists**: Displays the existing playlists in the user's account.
  - **Checkbox**: Users can choose whether to include their listening history.
  - **Playlist Recommendations**: Based on a selected playlist, recommended playlists are generated.
- **My Gems**: A link to "My Gems" for easy navigation.

### 3. Recommendation Section
- **Playlist Navigation**: A button to switch between recommended playlists.
- **Rating System**: Users can rate their satisfaction with the recommendations.
  - **Locking Ratings**: Users can lock or update their ratings, with the option to reset.
- **Song Details**: Displays song details (artist, title, release year, album cover).
  - **Audio Preview**: Users can listen to short previews with controls for volume and progress.
  - **Add to Playlist**: A button to add songs to the playlist, with appropriate user notifications.

### 4. My Gems
- Displays the user's favorited or added songs.
- Allows users to remove songs from the list by clicking a button.

## Tech Stack

- **Backend**: Flask, Spotipy (Spotify API wrapper), Pandas, Scikit-learn, Joblib.
- **Frontend**: React
- **Database**: Currently using a simple CSV file for storing basic recommendation statistics. This can be scaled to a relational database (e.g., MySQL, PostgreSQL) for more complex data needs. The dataset that the system is powered by is a CSV file which contains detailed song information and is dynamically updated. We are also working on changing its format to Feather to save space and improve processing time.

## Data Expansion

Gemerator's recommendation system is powered by a comprehensive CSV file containing detailed information on all the songs. The backend code is designed to dynamically update and expand this dataset. When a new song is found that isn't in the existing data, it is added automatically. Additionally, missing URLs are updated in real-time. This continuous enhancement of the dataset ensures that the recommendation engine improves over time, providing more accurate and personalized song suggestions the more you use the service.
