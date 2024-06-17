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

from dotenv import load_dotenv


app = Flask(__name__, static_folder='../frontend/my-app/build', static_url_path='/')
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

app.config['SESSION_COOKIE_ NAME'] = 'spotify cookie'
app.secret_key = 'dbs*eit4^3785h!g8i9@0puew?r5'

load_dotenv()

TOKEN_INFO    = 'token_info'
CLIENT_ID     = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
REDIRECT_URI  = 'http://localhost:5000'
SCOPE         = 'user-read-recently-played user-library-read playlist-modify-public playlist-modify-private playlist-read-private'

use_history = False
history_list = []
selected_songs = []
gems = []
gems_ids = []
###############################################################################################

data_path = "data/final_song_dataset.csv"

data = pd.read_csv(data_path)
# data = pd.read_feather(data_path)

scaler = joblib.load('scaler.joblib')

feature_cols = ['valence', 'year', 'acousticness', 'danceability', 'duration_ms', 'energy',
'instrumentalness', 'liveness', 'loudness', 'mode', 'speechiness', 'tempo', 'popularity']

scaled_data = scaler.transform(data[feature_cols])

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET))

def add_row_to_data(song_df):
    global data
    # data.to_feather(data_path)
    song_df.to_csv(data_path, mode='a', header=False, index=False) 
    # print(song_df['id'], "added to data")
    pass

def update_data():
    global data
    # data.to_feather(data_path)
    data.to_csv(data_path, index=False)
    print("updated data")
    pass

# def add_song_to_dataset(song_df):
#     global data
#     global scaled_data
#     # Convert song_data to a DataFrame and reset the index
#     data = pd.concat([data, song_df], ignore_index=True)
#     # Update the scaled data
#     scaled_data = scaler.transform(data[feature_cols]) 

#    # Append the new song data to the dataset file
#     print("adding new song to data...", song_df['id'])
#     song_df = song_df[data.columns] # rearrange the columns to fit the feather
#     # feather.write_feather(data, 'data/final_dataset_with_urls - Copy.feather')
#     # data.to_feather('data/final_dataset_with_urls.feather')

#     print(type(song_df['artists']))
#     print(data['artists'].dtypes)
#     # data_save_thread = threading.Thread(target=add_row_to_data, args=(song_df,))
#     # data_save_thread.start()

def add_song_to_dataset(song_df):
    global data
    global scaled_data
    # Append the new song data to the in-memory dataset
    data = pd.concat([data, song_df], ignore_index=True)
    # Update the scaled data
    scaled_data = scaler.transform(data[feature_cols]) 

    # Append the new song data to the dataset csv file
    song_df = song_df[data.columns] # rearrange the columns to fit the csv
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
    song_list = []

    for song in playlist:
        if song['album_cover_url'] == "acna":
            song_list.append(song)
            uri_list.append(song['id'])

    if uri_list:
        track_infos = sp.tracks(uri_list)['tracks']
        track_info_map = {track['id']: track for track in track_infos}

        for song_info in song_list:
            song_id = song_info['id']
            track_info = track_info_map.get(song_id)

            if track_info:
                album_cover_url = track_info['album']['images'][0]['url'] if track_info['album']['images'] else "acna"
                preview_url = track_info['preview_url'] if track_info['preview_url'] else "pna"
                
                # Update the playlist
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
            # song_data = song_data.iloc[0]
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

def recommend_songs(song_list, spotify_data, scaled_data, scaler, n_songs=10):
    song_dict = flatten_dict_list(song_list)
    song_center = get_mean_vector(song_list, spotify_data)
    
    # scaler = song_cluster_pipeline.steps[0][1]
    # scaled_data = scaler.transform(spotify_data[feature_cols])
    scaled_song_center = scaler.transform(song_center.reshape(1,-1))
    
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

'''
FAISS, which stands for Facebook AI Similarity Search, is a library developed by Facebook AI that enables efficient similarity search.
It's designed to handle large scale datasets and is particularly useful for tasks like recommendation systems.
'''
import faiss

def recommend_songs_faiss(song_list, spotify_data, scaled_data, scaler, n_songs=10):
    song_dict = flatten_dict_list(song_list)  
    song_center = get_mean_vector(song_list, spotify_data) 
    scaled_song_center = scaler.transform(song_center.reshape(1,-1))
    
    # Initialize FAISS index
    d = scaled_data.shape[1]  # dimension
    index = faiss.IndexFlatIP(d)  # using Inner Product (cosine similarity)
    
    # Add the scaled data to the FAISS index
    index.add(scaled_data.astype(np.float32))
    
    # Search the nearest neighbors
    k = n_songs * 10  # number of nearest neighbors to retrieve
    D, I = index.search(scaled_song_center.astype(np.float32), k)
    
    # Retrieve the recommended songs
    recommended_indices = I[0]
    rec_songs = spotify_data.iloc[recommended_indices]
    
    # Filter out the input songs from the recommendations
    rec_songs = rec_songs[~rec_songs['id'].isin(song_dict['id'])]        
    rec_songs = rec_songs.drop_duplicates(subset='id')
    
    # Initialize an empty list to store unique recommended songs
    unique_rec_songs = []
    
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
    
    rec_songs_df = pd.DataFrame(unique_rec_songs)   
    rec_songs_df = rec_songs_df.head(n_songs)
    
    # Return recommended songs metadata
    metadata_cols = ['name', 'year', 'artists', 'id', 'preview_url', 'album_cover_url']
    return rec_songs_df[metadata_cols].to_dict(orient='records')

def create_recommended_playlists(song_list, data, scaled_data, scaler, n_songs, n_playlists):
    playlist = recommend_songs(song_list, data, scaled_data, scaler, n_songs=n_songs)    
    # playlist = recommend_songs_faiss(song_list, data, scaled_data, scaler, n_songs=n_songs)   
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

@app.route('/', methods=['POST'])
def home_page():
    global selected_songs
    selected_songs = []
    return jsonify({"message": "Welcome to the Spotify recommendation system!"})

@app.route('/login')
def login():
    auth_url = create_spotify_oauth().get_authorize_url()
    # print(auth_url)
    return jsonify({"auth_url": auth_url})

@app.route('/profile')
def redirect_page():
    session.clear()
    code = request.args.get('code')
    token_info = create_spotify_oauth().get_access_token(code)
    session[TOKEN_INFO] = token_info
    
    sp = spotipy.Spotify(auth=token_info['access_token'])
    current_user = sp.current_user()
    # Determine the user's profile image
    if current_user['images']:
        image_url = current_user['images'][1]['url']
    else:
        image_url = None

    user_info = {
        'id' : current_user['id'],
        'name': current_user['display_name'],
        'image': image_url
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
        # Initialize variables for pagination
        offset = 0
        limit = 100  # Maximum limit per request

        # Keep fetching tracks until all tracks are retrieved
        while True:
            # Get the tracks of the selected playlist with pagination
            playlist_tracks = sp.playlist_tracks(playlist_id, offset=offset, limit=limit)

            for item in playlist_tracks['items']:
                track = item['track']
                song = {'id': track['id']}
                playlist_tracks_data.append(song)
            
            # Move to the next page
            offset += limit

            # Check if there are more tracks to fetch
            if len(playlist_tracks['items']) < limit:
                break

    if use_history:
            playlist_tracks_data.extend(history_list)

    print(len(playlist_tracks_data))

    playlists = create_recommended_playlists(playlist_tracks_data, data, scaled_data, scaler, n_songs=210, n_playlists=10)

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
        return jsonify({"error": str(e)})

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

@app.route('/history/<useHistory>', methods=['POST'])
def toggle_history(useHistory):
    use_history = useHistory
    print(use_history)
    if use_history:
        results = sp.current_user_recently_played()
        for item in results['items']:
            song = {'id': item['track']['id']}  
            history_list.append(song)
    return jsonify({"message": "history toggled"})

@app.route('/add_to_gems', methods=['POST'])
def add_to_gems():
    global gems
    global gems_ids
    song = request.get_json()
    song_id = song.get('id')
    if song_id not in gems_ids:
        gems.append(song)   
        gems_ids.append(song_id)
    return jsonify({"message": "Song added to gems"})

@app.route('/delete_from_gems/<song_id>', methods=['DELETE'])
def delete_from_gems(song_id):
    global gems
    global gems_ids
    for i, song in enumerate(gems):
        if song['id'] == song_id:
            gems.pop(i)
            gems_ids.remove(song_id)
            # print("Deleted", song_id)
            break
    return jsonify({"message": "Song deleted from gems"})

@app.route('/gems')
def get_gems():
    global gems
    return jsonify(gems)

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
                         scope=SCOPE)
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
    global selected_songs
    return jsonify(selected_songs)

@app.route('/songs/<song_id>', methods=['DELETE'])
def remove_song(song_id):
    global selected_songs
    for i, song in enumerate(selected_songs):
        if song['id'] == song_id:
            selected_songs.pop(i)
            # print("Deleted", song_id)
            break
    return jsonify({"message": "Song deleted from selected_songs"})

@app.route('/recommend', methods=['POST'])
def recommend():
    global selected_songs
    if not selected_songs:
        return jsonify({"error": "No songs selected"}, 400)

    playlists = create_recommended_playlists(selected_songs, data, scaled_data, scaler, n_songs=210, n_playlists=10)
    
    return jsonify(playlists)

import csv
from datetime import datetime

csv_file_path = "data/recommendation_stats.csv"
headers = ['user_id', 'total_recommended', 'songs_liked', 'songs_saved', 'total_rating', 'num_ratings', 'last_updated', ]

@app.route('/update_stats/<user_id>/<action>', methods=['POST'])
def update_csv(user_id, action, rating=None):
    updated = False
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    rows = []

    rating = request.args.get('rating', default=None, type=int)

    with open(csv_file_path, 'r', newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row['user_id'] == user_id:
                if action == 'recommend':
                    row['total_recommended'] = int(row['total_recommended']) + 21
                elif action == 'like':
                    row['songs_liked'] = int(row['songs_liked']) + 1
                elif action == 'dislike':
                    row['songs_liked'] = int(row['songs_liked']) - 1
                elif action == 'save':
                    row['songs_saved'] = int(row['songs_saved']) + 1
                elif action == 'rate' and rating is not None:
                    row['total_rating'] = int(row['total_rating']) + rating
                    row['num_ratings'] = int(row['num_ratings']) + 1
                elif action == 'cancel_rate':
                    row['total_rating'] = int(row['total_rating']) - rating
                    row['num_ratings'] = int(row['num_ratings']) - 1
                row['last_updated'] = now
                updated = True
            rows.append(row)

    if not updated:
        new_row = {
            'user_id': user_id,
            'total_recommended': 21,
            'songs_liked': 1 if action == 'like' else 0,
            'songs_saved': 1 if action == 'save' else 0,
            'total_rating': rating if action == 'rate' and rating is not None else 0,
            'num_ratings': 1 if action == 'rate' and rating is not None else 0,
            'last_updated': now
        }
        rows.append(new_row)

    with open(csv_file_path, 'w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)

    return jsonify({'status': 'success'})

app.run(debug=True, port=5000)