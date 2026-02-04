from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from pathlib import Path
import time
import settings
import models
import base64
import os
import numpy as np
import io
import soundfile as sf
import uuid
import librosa
import subprocess
from collections import defaultdict

MUSIC_PATH = "wav/"
app = Flask(__name__)
# Update CORS to explicitly allow all origins for debugging
CORS(app, resources={r"/*": {"origins": "*"}})
INSERT_SQL = """
INSERT INTO songs (file_path, title, artist, album, duration_s, image)
VALUES (?, ?, ?, ?, ?, ?);
"""
# --- THE FIX: Wrap the string in Path() ---
DB_PATH = Path("database.db") 
def add_song_to_db(title, artist, album, duration, file_path, image_path):
        if not file_path:
            return

        try:
            duration = float(duration) if duration else None
        except ValueError:
            return

        try:
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute(
                    INSERT_SQL,
                    (
                        file_path,
                        title or None,
                        artist or None,
                        album or None,
                        duration,
                        image_path or None,
                    ),
                )
                return conn.execute("SELECT last_insert_rowid();").fetchone()[0]
        except sqlite3.IntegrityError as e:
            return
def get_db_connection():
    # Now .exists() will work because DB_PATH is a Path object
    if not DB_PATH.exists():
        print(f"Error: Database not found at {DB_PATH.resolve()}")
        return None
        
    conn = sqlite3.connect(DB_PATH,check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn
global conn
conn = get_db_connection()

similarityModel = models.Similarity()
shazamModel = models.Shazam()
radar = models.Radar()
@app.get("/getAllTracks")
def get_all_tracks():
    conn = get_db_connection()

    # Handle the error gracefully so the server doesn't crash hard
    if conn is None:
        return jsonify({"error": "Database file not found"}), 404

    try:
        rows = conn.execute("SELECT id,title,artist,album,duration_s,image FROM songs").fetchall()
        conn.close()
        return jsonify([dict(r) for r in rows]), 200
    except Exception as e:
        print(f"Server Error: {e}") # Print error to terminal
        return jsonify({"error": str(e)}), 500
@app.get("/getRadar")
def get_radar():
    try:
        rows = radar.get_radar()
        return jsonify([{"song_id": r[0], "x": r[1], "y": r[2]} for r in rows]), 200
    except Exception as e:
        print(f"Server Error: {e}") # Print error to terminal
        return jsonify({"error": str(e)}), 500
@app.post("/findSimilarSongs")
def find_similar_songs():

    # Expect JSON: { "trackId": "..." } or { "trackId": 123 }
    data = request.get_json(silent=True) or {}

    track_id = data.get("song_id")

    if track_id is None or str(track_id).strip() == "":
        return jsonify({"error": "Missing required field 'song_id' in JSON body."}), 400

    try:
        # Call your similarity function
        simResult = similarityModel.find_similar_songs_segments(int(track_id))
        print(simResult)
        query=""
        for sim in simResult:
            query+=str(sim[0])+","
        query=query[:-1]
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, title, artist, album, duration_s, image FROM songs WHERE id IN ({query})"
        )
        result = cur.fetchall()
        songs = []
        for res in result:
            song = dict(res)          # convert to mutable dict

            song["match"] = f"{100*(next((s[1] for s in simResult if s[0] == res['id']), None)):.1f}"
            songs.append(song)
        songs.sort(key=lambda x: float(x["match"]), reverse=True)
        # Ensure result is JSON-serializable
        # If result is e.g. list[dict] you're good.
        return jsonify(songs), 200

    except Exception as e:
        print(e)
        return jsonify({"error": f"Failed to find similar songs: {e}"}), 500
@app.post("/recommend")
def recommend():
    data = request.get_json(silent=True) or {}
    # Expect JSON: { "trackId": "..." } or { "trackId": 123 }

    track_ids = data.get("song_ids")

   

    try:
        scores = defaultdict(int)

        for id in track_ids:
        # Call your similarity function
            simResult = similarityModel.find_similar_songs_segments(int(id))
            print(simResult)
            for s in simResult:
                scores[s[0]] += s[1]
        query=""
        for sim in scores.items():
            scores[sim[0]] /= len(track_ids)
            query+=str(sim[0])+","
        query=query[:-1]
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, title, artist, album, duration_s, image FROM songs WHERE id IN ({query})"
        )
        result = cur.fetchall()

        songs = []
        for res in result:
            song = dict(res)          # convert to mutable dict

            song["match"] = f"{100*(next((s[1] for s in scores.items() if s[0] == res['id']), None)):.1f}"
            songs.append(song)
        songs.sort(key=lambda x: float(x["match"]), reverse=True)
        # Ensure result is JSON-serializable
        # If result is e.g. list[dict] you're good.
        return jsonify(songs), 200

    except Exception as e:
        print(e)
        return jsonify({"error": f"Failed to find similar songs: {e}"}), 500    
@app.post("/getShazamSong")
def get_shazam_song():
    try:
        # Expect JSON: { "trackId": "..." } or { "trackId": 123 }
        data = request.get_json(silent=True) or {}
        audio = data.get("audio_base64")
    # print(query['data'])
        audio = audio.split(",", 1)[-1]  # strips data:...;base64, if present

        audio_binary = base64.b64decode(audio)
        filename = f"{uuid.uuid4().hex}.wav"

        with open(filename, "wb") as f:
            f.write(audio_binary)
        out = shazamModel.recognize(filename)
        track = get_track(out['song_id'])
        #os.remove(filename)
        return jsonify(track)
    except Exception as e:
        print(e)
        return jsonify({"error": f"Failed to recognize song: {e}"}), 500


@app.post("/addSong")
def add_song():
    try:
        # Expect JSON: { "trackId": "..." } or { "trackId": 123 }
        data = request.get_json(silent=True) or {}
        title = data.get("title")
        album = data.get("album")
        artist = data.get("artist")
        image = data.get("image")
        audio = data.get("track")
        print(title,album,image)

    # print(query['data'])
        audio = audio.split(",", 1)[-1]  # strips data:...;base64, if present

        audio_binary = base64.b64decode(audio)
        filename = f"{uuid.uuid4().hex}.wav"

        with open(filename, "wb") as f:
             f.write(audio_binary)
        
        subprocess.run(
        [
            "ffmpeg",
            "-y",              # overwrite if exists
            "-i", filename,    # input file
            MUSIC_PATH+filename           # output file
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True
        )
        os.remove(filename)
        duration = librosa.get_duration(path=MUSIC_PATH+filename)
        last_id = add_song_to_db(title, artist, album, duration, filename, image)
        #last_id = 57
        shazamModel.add_song_to_db(last_id, MUSIC_PATH+filename)
        similarityModel.add_song_to_semantic_db(last_id, MUSIC_PATH+filename)
        radar.add_song_to_radar(last_id, MUSIC_PATH+filename)
        # print("aaa")
        # out = shazamModel.recognize(filename)
        # print(out)
        # track = get_track(out['song_id'])
        # return jsonify(track)
        return jsonify({}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": f"Failed to recognize song: {e}"}), 500
def get_track(track_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, title, artist, album, duration_s, image FROM songs WHERE id = ?",
        (track_id,),
    )
    row = cur.fetchone()
    if row:
        return dict(row)
    return None
if __name__ == "__main__":
    # Ensure the server listens on all interfaces, matching your 192.168... setup
    app.run(host="0.0.0.0", port=5000, debug=True)