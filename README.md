# Gemerator

## _Unearth Your Sound Jewel_

Gemerator is a music recommendation website built using Flask and React, designed to enhance your listening experience. If you have a Spotify account, you can choose any of your playlists to get personalized song recommendations. For non-Spotify users, you can create custom playlists and receive tailored song suggestions based on those. Whether you're a Spotify user or not, Gemerator is here to help you discover new music you'll love.

## Features

- **User authentication with Spotify**
- **Fetch user's playlists and saved tracks**
- **Fetch user's recent listening history**
- **Generate personalized song recommendations**
- **Add songs to Spotify playlists**
- **Track user interactions and song ratings**

## Tech Stack

- **Backend**: Flask, Spotipy (Spotify API wrapper), Pandas, Scikit-learn, Joblib
- **Frontend**: React
- **Database**: Currently using a simple CSV file for storing basic recommendation statistics. This can be scaled to a relational database (e.g., MySQL, PostgreSQL) for more complex data needs. The dataset that the system is powered by is a CSV file which contains detailed song information and is dynamically updated. We are also working on changing its format to Feather to save space and improve processing time.

## Data Expansion

Gemerator's recommendation system is powered by a comprehensive CSV file containing detailed information on all the songs. The backend code is designed to dynamically update and expand this dataset. When a new song is found that isn't in the existing data, it is added automatically. Additionally, missing URLs are updated in real-time. This continuous enhancement of the dataset ensures that the recommendation engine improves over time, providing more accurate and personalized song suggestions the more you use the service.
