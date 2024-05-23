import spotipy
from spotipy.oauth2 import SpotifyOAuth
from spotipy.oauth2 import SpotifyClientCredentials
from spotipy.cache_handler import CacheFileHandler

import os
import time

from flask import Flask, request, url_for, session, redirect, render_template, send_from_directory, jsonify
from flask_cors import CORS

import numpy as np
import pandas as pd

from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import euclidean_distances
from sklearn.metrics.pairwise import cosine_similarity

from collections import defaultdict


app = Flask(__name__, static_folder='../frontend/my-app/build', static_url_path='/')
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

app.config['SESSION_COOKIE_ NAME'] = 'spotify cookie'
app.secret_key = 'dbs*eit4^3785h!g8i9@0puew?r5'

TOKEN_INFO = 'token_info'
CLIENT_ID ='11b6d46776d545af9be0a471e6ba9e56'
CLIENT_SECRET = '128ce551f20e4d6e88e6f83f8766655a'
REDIRECT_URI = 'http://localhost:5000'

#####################################################
data = pd.read_csv("Data/modified_tracks_features.csv")
col_to_drop = ['key', 'explicit']
data.drop(col_to_drop, axis=1, inplace=True)
 
data = data[data['popularity'] != 0]

number_cols = ['valence', 'year', 'acousticness', 'danceability', 'duration_ms', 'energy',
'instrumentalness', 'liveness', 'loudness', 'mode', 'speechiness', 'tempo', 'popularity']

clustered_data = data.copy()
song_cluster_pipeline = Pipeline([('scaler', StandardScaler()), 
                                  ('kmeans', KMeans(n_clusters=20, 
                                   verbose=False))
                                 ], verbose=False)
 
X = clustered_data[number_cols]
song_cluster_pipeline.fit(X)
song_cluster_labels = song_cluster_pipeline.predict(X)
clustered_data['cluster_label'] = song_cluster_labels


sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET))
pd.set_option('display.max_colwidth', None)

def find_song(name, artist, year):
    # print(name, "in find song")
    song_data = defaultdict()
    results = sp.search(q= 'track: {} year: {} artist: {}'.format(name, year, artist), limit=1)
    if results['tracks']['items'] == []:
        return None

    results = results['tracks']['items'][0]
    track_id = results['id']
    audio_features = sp.audio_features(track_id)[0]
    preview_url = results.get('preview_url')  # Check for preview_url existence
    
    song_data['name'] = [name]
    song_data['year'] = [year]
    song_data['explicit'] = [int(results['explicit'])]
    song_data['duration_ms'] = [results['duration_ms']]
    song_data['popularity'] = [results['popularity']]
    song_data['preview_url'] = preview_url
       
    for key, value in audio_features.items():
        song_data[key] = value
        
    return pd.DataFrame(song_data)
from collections import defaultdict
from sklearn.metrics import euclidean_distances
from scipy.spatial.distance import cdist
import difflib

def get_song_data(song, spotify_data):
    # try to find the song in the dataset
    try:
        song_data = spotify_data[(spotify_data['name'] == song['name']) 
                                & (spotify_data['year'] == song['year'])].iloc[0]
        return song_data
    # if the song is not in the dataset search Spotify for it
    except IndexError:
        song_data = find_song(song['name'], song['artists'], song['year'])
        return song_data
        

def get_mean_vector(song_list, spotify_data):   
    song_vectors = []
    
    for song in song_list:
        song_data = get_song_data(song, spotify_data)
        if song_data is None:
            print('Warning: {} does not exist in Spotify or in database'.format(song['name']))
            continue
        
        song_vector = song_data[number_cols].values
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

from sklearn.metrics.pairwise import cosine_similarity

def recommend_songs(song_list, spotify_data, song_cluster_pipeline, n_songs=10):
    # Flatten the input song list
    song_dict = flatten_dict_list(song_list)
    # Get mean vector of input songs
    song_center = get_mean_vector(song_list, spotify_data)
    # Scale the Spotify data
    scaler = song_cluster_pipeline.steps[0][1]
    scaled_data = scaler.transform(spotify_data[number_cols])
    scaled_song_center = scaler.transform(song_center.reshape(1, -1))
    # Compute cosine similarity between the input songs and Spotify data
    similarities = cosine_similarity(scaled_song_center, scaled_data)
    # Get indices of top N similar songs
    index = np.argsort(similarities[0])[-n_songs:][::-1]
    # Filter out songs already in input list
    rec_songs = spotify_data.iloc[index]
    rec_songs = rec_songs[~rec_songs['name'].isin(song_dict['name'])]
    # Return recommended songs
    metadata_cols = ['name', 'year', 'artists', 'id']
    return rec_songs[metadata_cols].to_dict(orient='records')
#####################################################

@app.route('/')
def home_page():
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
    saved_tracks = sp.current_user_saved_tracks()['items']
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
        saved_tracks = []
        results = sp.current_user_saved_tracks()
        saved_tracks.extend(results['items'])
        while results['next']:
            results = sp.next(results)
            saved_tracks.extend(results['items'])

        for item in saved_tracks:
            track = item['track']
            song = {
                'name': track['name'],
                'artists': ', '.join([artist['name'] for artist in track['artists']]),
                'year': int(track['album']['release_date'][:4])
            }
            playlist_tracks_data.append(song)
    else:
        # Handle the case for other playlists
        playlist_tracks = sp.playlist_tracks(playlist_id)['items']

        for item in playlist_tracks:
            track = item['track']
            song = {
                'name': track['name'],
                'artists': ', '.join([artist['name'] for artist in track['artists']]),
                'year': int(track['album']['release_date'][:4])
            }
            playlist_tracks_data.append(song)

    playlist = recommend_songs(playlist_tracks_data, data,song_cluster_pipeline, n_songs=21)
    get_preview_urls(playlist)
    get_album_cover_urls(playlist)
    for index, song in enumerate(playlist, start=1):
        print(index, song['name'])
    #return playlist
    return jsonify(playlist)

def get_preview_urls(playlist):
    uri_list = [song_info['id'] for song_info in playlist]
    track_infos = sp.tracks(uri_list)['tracks']
    for i, song_info in enumerate(playlist):
        track_info = track_infos[i]
        if track_info['preview_url']:
            song_info['preview_url'] = track_info['preview_url']
        else:
            artists = eval(song_info['artists'])
            artist_string = ", ".join(artists)
            result_df = find_song(song_info['name'], artist_string, song_info['year'])
            song_info['preview_url'] = result_df['preview_url'].to_string(index=False)

def get_album_cover_urls(playlist):
    uri_list = [song_info['id'] for song_info in playlist]
    track_infos = sp.tracks(uri_list)['tracks']
    for i, song_info in enumerate(playlist):
        track_info = track_infos[i]
        if track_info['album']['images'][0]['url']:
            song_info['album_cover_url'] = track_info['album']['images'][0]['url']

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
                         scope='user-library-read playlist-modify-public playlist-modify-private')
                           #cache_handler=CacheFileHandler(cache_path=".cache"))

##############################################################

selected_songs = []

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

    playlist = recommend_songs(selected_songs, data, song_cluster_pipeline, n_songs=21)
    get_preview_urls(playlist)
    get_album_cover_urls(playlist)
    
    for index, song in enumerate(playlist, start=1):
        print(index, song['name'], "by", song["artists"])
        
    return jsonify(playlist)

app.run(debug=True, port=5000)