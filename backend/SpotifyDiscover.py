import spotipy
from spotipy.oauth2 import SpotifyOAuth
from spotipy.oauth2 import SpotifyClientCredentials

import os
import time
import random
import joblib
import threading


from flask import Flask, request, url_for, session, redirect, render_template, send_from_directory, jsonify
from flask_cors import CORS

import numpy as np
import pandas as pd
import pyarrow.feather as feather

from sklearn.metrics.pairwise import cosine_similarity

from collections import defaultdict
from scipy.spatial.distance import cdist

app = Flask(__name__, static_folder='../frontend/my-app/build', static_url_path='/')
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

app.config['SESSION_COOKIE_ NAME'] = 'spotify cookie'
app.secret_key = 'dbs*eit4^3785h!g8i9@0puew?r5'

TOKEN_INFO    = 'token_info'
CLIENT_ID     = '11b6d46776d545af9be0a471e6ba9e56'
CLIENT_SECRET = '128ce551f20e4d6e88e6f83f8766655a'
REDIRECT_URI  = 'http://localhost:5000'

use_history = False
history_list = []
selected_songs = []

###############################################################################################

data_path = "data/final_dataset_with_urls.csv"

data = pd.read_csv(data_path)
# data = pd.read_feather(data_path)

feature_cols = ['valence', 'year', 'acousticness', 'danceability', 'duration_ms', 'energy',
'instrumentalness', 'liveness', 'loudness', 'mode', 'speechiness', 'tempo', 'popularity']

song_cluster_pipeline = joblib.load('song_cluster_pipeline.pkl')

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET))

# def add_song_to_dataset(song_df):
#     global data
#     # Convert song_data to a DataFrame and reset the index
#     data = pd.concat([data, song_df], ignore_index=True)
#    # Append the new song data to the dataset file
#     print("adding new song to data...", song_df['id'])
#     song_df = song_df[data.columns]
#     # feather.write_feather(data, 'data/final_dataset_with_urls - Copy.feather')
#     data.to_feather('data/final_dataset_with_urls.feather')

def add_row_to_data(song_df):
    global data
    # data.to_feather("data/final_dataset_with_urls.feather")
    song_df.to_csv(data_path, mode='a', header=False, index=False)
    print(song_df['id'], "added to data")
    pass

def update_data():
    global data
    # data.to_feather("data/final_dataset_with_urls - Copy.feather")
    data.to_csv(data_path, index=False)
    print("updated data")
    pass

def add_song_to_dataset(song_df):
    global data
    # Append the new song data to the in-memory dataset
    data = pd.concat([data, song_df], ignore_index=True)
    # Append the new song data to the dataset file
    song_df = song_df[data.columns]

    data_save_thread = threading.Thread(target=add_row_to_data, args=(song_df,))
    data_save_thread.start()


def find_song(track_id):
    song_data = defaultdict()
    results = sp.track(track_id)
    
    # Check if the track exists
    if not results:
        return None
    
    audio_features = sp.audio_features(track_id)[0]
    preview_url = results.get('preview_url') if results.get('preview_url') else "pna" # Check for preview_url existence
    
    song_data['name'] = [results['name']]
    song_data['artists'] = [artist['name'] for artist in results['artists']],
    song_data['year'] = int(results['album']['release_date'][:4]), 
    song_data['duration_ms'] = [results['duration_ms']]
    song_data['popularity'] = [results['popularity']]
    song_data['preview_url'] = preview_url
    song_data['album_cover_url'] = [results['album']['images'][0]['url']]

    for key, value in audio_features.items():
        song_data[key] = value

    song_df = pd.DataFrame(song_data)
    
    # Drop the specified columns
    columns_to_drop = ['uri', 'track_href', 'analysis_url', 'time_signature', 'type', 'key']
    song_df.drop(columns=columns_to_drop, inplace=True, errors='ignore')
      
    return song_df

def get_preview_and_album_cover(playlist, data):
    uri_list = []
    for song in playlist:
        # song_data = data[(data['id'] == song['id'])].iloc[0]        
        if song['album_cover_url'] == "acna":
            uri_list.append(song['id'])
     
    if uri_list:
        track_infos = sp.tracks(uri_list)['tracks']
        for i, song_info in enumerate(playlist):
            track_info = track_infos[i]
            album_cover_url = track_info['album']['images'][0]['url'] if track_info['album']['images'] else None
            preview_url = track_info['preview_url'] if track_info['preview_url'] else "pna"

            # Update the playlist
            if album_cover_url:
                song_info['album_cover_url'] = album_cover_url
            song_info['preview_url'] = preview_url

            # Update the dataset
            data.loc[data['id'] == song_info['id'], 'album_cover_url'] = album_cover_url
            data.loc[data['id'] == song_info['id'], 'preview_url'] = preview_url

def get_song_data(song, spotify_data):
    # try to find the song in the dataset
    try:
        song_data = spotify_data[(spotify_data['id'] == song['id'])].iloc[0]
        return song_data
    # if the song is not in the dataset search Spotify for it
    except IndexError:
        song_data = find_song(song['id'])
        if song_data is not None:
            # print(song_data['artists'])
            add_song_to_dataset(song_data)
            return song_data
        else:
            return None
        
def get_mean_vector(song_list, spotify_data):   
    song_vectors = []
    
    for song in song_list:
        song_data = get_song_data(song, spotify_data)
        if song_data is None:
            print('Warning: {} does not exist in Spotify or in database'.format(song['name']))
            continue
        
        song_vector = song_data[feature_cols].values
        song_vectors.append(song_vector)  
    
    song_matrix = np.array(list(song_vectors), dtype="object")
    return np.mean(song_matrix, axis=0)

def flatten_dict_list(dict_list):
    
    flattened_dict = defaultdict()
    for key in dict_list[0].keys():
        flattened_dict[key] = []
    
    for dictionary in dict_list:
        for key, value in dictionary.items():
            flattened_dict[key].append(value)
            
    return flattened_dict

def recommend_songs(song_list, spotify_data, song_cluster_pipeline, n_songs=10):
    song_dict = flatten_dict_list(song_list)
    song_center = get_mean_vector(song_list, spotify_data)
    
    scaler = song_cluster_pipeline.steps[0][1]
    scaled_data = scaler.transform(spotify_data[feature_cols])
    scaled_song_center = scaler.transform(song_center.reshape(1, -1))
    
    # Compute cosine similarity between the input songs and Spotify data
    similarities = cosine_similarity(scaled_song_center, scaled_data)
    
    # Initialize an empty list to store unique recommended songs
    unique_rec_songs = []

    # Variable to control how many songs to fetch each iteration
    fetch_factor = 2

    while len(unique_rec_songs) < n_songs:
        # Calculate how many songs to fetch
        num_to_fetch = n_songs * fetch_factor 
        index = np.argsort(similarities[0])[-num_to_fetch:][::-1]
        
        rec_songs = spotify_data.iloc[index]
        
        rec_songs = rec_songs[~rec_songs['id'].isin(song_dict['id'])]        
        rec_songs = rec_songs.drop_duplicates(subset='id')
        
        # Append new unique recommendations to the list
        for _, song in rec_songs.iterrows():
            is_duplicate = song['id'] in [s['id'] for s in unique_rec_songs]
            # If not a duplicate by ID, check by name and artists
            if not is_duplicate:
                is_duplicate = any(
                    (song['name'] == s['name'] and song['artists'] == s['artists']) 
                    for s in unique_rec_songs
                )
            if not is_duplicate:
                unique_rec_songs.append(song)
            if len(unique_rec_songs) >= n_songs:
                break

        fetch_factor *= 2
        
    rec_songs_df = pd.DataFrame(unique_rec_songs)   
    rec_songs_df = rec_songs_df.head(n_songs)
    
    # Return recommended songs metadata
    metadata_cols = ['name', 'year', 'artists', 'id', 'preview_url', 'album_cover_url']
    return rec_songs_df[metadata_cols].to_dict(orient='records')

def create_recommended_playlists(song_list, data, song_cluster_pipeline, n_songs, n_playlists):
    playlist = recommend_songs(song_list, data, song_cluster_pipeline, n_songs=n_songs)    
    random.shuffle(playlist)
    
    songs_per_playlist = n_songs // n_playlists    
    playlists = [playlist[i:i+songs_per_playlist] for i in range(0, len(playlist), songs_per_playlist)]
    
    if len(playlists) > n_playlists:
        playlists = playlists[:n_playlists]
    
    for pl in playlists:
        get_preview_and_album_cover(pl, data)

    data_save_thread = threading.Thread(target=update_data)
    data_save_thread.start()

    return playlists

def fetch_saved_tracks():
    saved_tracks = []
    results = sp.current_user_saved_tracks()
    saved_tracks.extend(results['items'])
    while results['next']:
        results = sp.next(results)
        saved_tracks.extend(results['items'])
    return saved_tracks

###############################################################################################

@app.route('/')
def home_page():
    global selected_songs
    selected_songs = []
    return jsonify({"message": "Welcome to the Spotify recommendation system!"})
    #return send_from_directory(app.static_folder,'home.html')

@app.route('/login')
def login():
    auth_url = create_spotify_oauth().get_authorize_url()
    print(auth_url)
    return jsonify({"auth_url": auth_url})
    #return redirect(auth_url)

@app.route('/profile')
def redirect_page():
    session.clear()
    code = request.args.get('code')
    token_info = create_spotify_oauth().get_access_token(code)
    session[TOKEN_INFO] = token_info
    
    sp = spotipy.Spotify(auth=token_info['access_token'])
    user_info = {
        'name': sp.current_user()['display_name'],
        'image': sp.current_user()['images'][1]['url']
    }
    user_playlists = sp.current_user_playlists()['items']
    # Fetch user's saved tracks
    # saved_tracks = sp.current_user_saved_tracks()['items']
    saved_tracks_playlist = {
        'name': 'Liked Songs',
        'id': 'saved_tracks'
    }
    user_playlists.append(saved_tracks_playlist)
    return jsonify({'user_info': user_info, 'user_playlists': user_playlists})
    #return render_template('profile.html', user_info=user_info, user_playlists=user_playlists)
    #return jsonify(userInfo=user_info, userPlaylists=user_playlists)

@app.route('/savePlaylist/<playlist_id>')
def save_playlist(playlist_id):
    try:
        token_info = get_token()
    except:
        print('user not logged in')
        return redirect('/')
    
    sp = spotipy.Spotify(auth=token_info['access_token'])
    playlist_tracks_data = []
    if playlist_id == 'saved_tracks':
        # Handle the case for 'Liked Songs' playlist
        saved_tracks = fetch_saved_tracks()

        for item in saved_tracks:
            song = {'id': item['track']['id']}  
            playlist_tracks_data.append(song)     
    else:
        # Handle the case for other playlists
        playlist_tracks = sp.playlist_tracks(playlist_id)['items']

        for item in playlist_tracks:
            song = {'id': item['track']['id']}  
            playlist_tracks_data.append(song)

    if use_history:
            playlist_tracks_data.extend(history_list)

    playlists = create_recommended_playlists(playlist_tracks_data, data, song_cluster_pipeline, n_songs=210, n_playlists=10)

    return jsonify(playlists)

@app.route('/add_song_to_playlist/<playlist_id>/<track_id>', methods=['POST'])
def add_song_to_playlist(playlist_id, track_id):
    try:
        # Check if the playlist_id is a special value indicating "Liked Songs"
        if playlist_id == "saved_tracks":
            sp.current_user_saved_tracks_add([track_id])
            message = "Song added to Liked Songs"
        else:
            # Check if the playlist is a special Spotify-generated playlist
            playlist = sp.playlist(playlist_id)
            if playlist['owner']['id'] == 'spotify':
                return jsonify({"error": "Cannot add tracks to Spotify-generated playlists"})
            
            # Regular playlist
            sp.playlist_add_items(playlist_id, [track_id])
            message = "Song added to playlist"

        return jsonify({"message": message})
    except spotipy.exceptions.SpotifyException as e:
        return jsonify({"error": str(e)}), 400

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    spotify_oauth = create_spotify_oauth()
    cache_handler = spotify_oauth.cache_handler
    if cache_handler:
        cache_path = cache_handler.cache_path
        if os.path.exists(cache_path):
            os.remove(cache_path)
            return jsonify({"message": "Logged out successfully and cache cleared"})
    return jsonify({"message": "Logged out successfully but no cache file found"})

######## create route ########
def toggle_history():
    use_history = not use_history
    if use_history:
        results = sp.current_user_recently_played()
        for item in results['items']:
            song = {'id': item['track']['id']}  
            history_list.append(song)

def get_token():
    token_info = session.get(TOKEN_INFO, None)
    if not token_info:
        return redirect(url_for('login'), external = False)
    
    now = int(time.time())
    
    is_expired = token_info['expires_at'] - now < 60
    if is_expired:
        spotify_oauth = create_spotify_oauth()
        token_info = spotify_oauth.refresh_access_token(token_info['refresh_token'])

    return token_info

def create_spotify_oauth():
    return SpotifyOAuth(client_id = CLIENT_ID, client_secret = CLIENT_SECRET,
                         redirect_uri= url_for('redirect_page', _external = True) ,
                         scope='user-library-read playlist-modify-public playlist-modify-private playlist-read-private')
                           #cache_handler=CacheFileHandler(cache_path=".cache"))

@app.route('/search', methods=['GET'])
def search_songs():
    query = request.args.get('q')
    if not query:
        return jsonify([])

    results = sp.search(q=query, limit=10, type='track')
    songs = []
    for item in results['tracks']['items']:
        song = {
            'name': item['name'],
            'artists': ', '.join([artist['name'] for artist in item['artists']]),
            'id': item['id'],
            'year': int(item['album']['release_date'][:4])
        }
        songs.append(song)
    return jsonify(songs)

@app.route('/songs', methods=['POST'])
def add_song():
    song = request.json
    selected_songs.append(song)
    print(selected_songs)
    return jsonify({'status': 'success'})

@app.route('/songs', methods=['GET'])
def get_songs():
    return jsonify(selected_songs)

@app.route('/songs/<song_id>', methods=['DELETE'])
def remove_song(song_id):
    global selected_songs
    selected_songs = [song for song in selected_songs if song['id'] != song_id]
    print(selected_songs)
    return jsonify({'status': 'success'})

@app.route('/recommend', methods=['POST'])
def recommend():
    global selected_songs
    if not selected_songs:
        return jsonify({"error": "No songs selected"})

    playlists = create_recommended_playlists(selected_songs, data, song_cluster_pipeline, n_songs=210, n_playlists=10)
    
    return jsonify(playlists)

app.run(debug=True, port=5000)