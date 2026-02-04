import settings
from sklearn.neighbors import NearestNeighbors
import joblib
import librosa
import numpy as np
import sqlite3
import umap
from collections import Counter, defaultdict
from scipy.ndimage import maximum_filter
class Similarity:
    def __init__(self,db_path="database.db"):
        self.db_path=db_path
        self.conn = sqlite3.connect(db_path)
        self.scaler = joblib.load("feature_scaler.joblib")
        self.semantic_db,self.song_ids=self.get_sematic_db()
    def reconnect(self):
        self.conn = sqlite3.connect(self.db_path)
    def load_audio(self,file_path, mono=True):
        y, sr = librosa.load(file_path, sr=settings.SAMPLE_RATE, mono=mono)
        return y, sr
    def get_sematic_db(self):
        self.reconnect()
        cur = self.conn.cursor()
        cur.execute("SELECT song_id, vec FROM song_segments ORDER BY id")
        rows = cur.fetchall()
        song_ids = [r[0] for r in rows]
        vecs = {r[0]: np.frombuffer(r[1], dtype=np.float32) for r in rows}
        X_norm={}
        for i in song_ids:
            X_norm[i]=vecs[i].reshape(-1,68)
        return X_norm,song_ids
    def vec_to_blob(self, vec: np.ndarray) -> bytes:
        return np.asarray(vec, dtype=np.float32).tobytes()
    
    def add_song_to_semantic_db(self, song_id: int, path):
        y,sr=self.load_audio(path)
        seg_feats = self.extract_segment_features(y)
        vec = self.scaler.transform(seg_feats)
        self.reconnect()
        cur = self.conn.cursor()
        cur.execute("""
            INSERT INTO song_segments (song_id, vec)
            VALUES (?, ?);
        """, (song_id, self.vec_to_blob(vec)))
        self.conn.commit()
    def close(self):
        self.conn.close()
    def __exit__(self, exc_type, exc, tb):
        self.close()
    def extract_features(self, y):
        mfcc = librosa.feature.mfcc(y=y, sr=settings.SAMPLE_RATE, n_mfcc=settings.N_MFCC)
        mfcc_mean = np.mean(mfcc, axis=1)
        mfcc_std  = np.std(mfcc, axis=1)   
        chroma = librosa.feature.chroma_stft(y=y, sr=settings.SAMPLE_RATE)
        chroma_mean = np.mean(chroma, axis=1)
        chroma_std  = np.std(chroma, axis=1)
        
        contrast = librosa.feature.spectral_contrast(y=y, sr=settings.SAMPLE_RATE)
        contrast_mean = np.mean(contrast, axis=1)
        contrast_std  = np.std(contrast, axis=1)
      
        return np.concatenate([
            mfcc_mean, mfcc_std,
            chroma_mean, chroma_std,
            contrast_mean, contrast_std
        ])
    def song_to_song_similarity(self, A, B, topk=5):
        knn = NearestNeighbors(metric="cosine", algorithm="brute", n_neighbors=10)
        knn.fit(B)
    
        distances, _ = knn.kneighbors(A) 
        sims = 1.0 - distances           
        flat = np.sort(sims.ravel())[::-1]
        topk = min(10, flat.size)
        return float(flat[:topk].mean())
    def segment_audio(self,y):
        seg_len = int(settings.SEGMENT_DURATION * settings.SAMPLE_RATE)
        hop_len = int(settings.HOP_DURATION * settings.SAMPLE_RATE)
    
        segments = []
        for start in range(0, max(1, len(y) - seg_len + 1), hop_len):
            seg = y[start:(start + seg_len)]
            if len(seg) < seg_len:
                break
            segments.append(seg)
        return np.vstack(segments)
    def extract_segment_features(self,y):
        segments = self.segment_audio(y)
    
        feats = []
        for seg in segments:
            vec = self.extract_features(seg)
            if vec is not None:
                feats.append(vec)
    
        if not feats:
            return None
    
        return np.vstack(feats)  
    def find_similar_songs_segments(self,query_id, top_n=6):
        A = self.semantic_db[query_id]
        scores = []
        for i in self.song_ids:
            if i == query_id:
                continue
            B = self.semantic_db[i]
            score = self.song_to_song_similarity(A, B, topk=10)
            scores.append((i, score))
    
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_n]
    def normalize(self,y):
        all_scaled = self.scaler.transform(y)
        return self.normalize(all_scaled, axis=1)
class Shazam:
    def __init__(self,db_path="database.db"):
        self.db_path=db_path
        self.conn = sqlite3.connect(db_path)
    def reconnect(self):
        self.conn = sqlite3.connect(self.db_path)
    def recognize(self,path):
        y,sr = self.load_audio(path)
        S_db = self.get_spectogram(y)
        peaks, _ = self.find_2d_peaks(S_db)
        return self.get_best_match(peaks)
    def add_song_to_db(self, song_id: int, path):
        y,sr = self.load_audio(path)
        S_db = self.get_spectogram(y)
        peaks, _ = self.find_2d_peaks(S_db)
        hashes = self.generate_hashes(peaks)
        self.insert_hashes(hashes, song_id)
    def insert_hashes(self,hashes, song_id):
        self.reconnect()
        cur = self.conn.cursor()
        for h, t in hashes:
            cur.execute("""
                INSERT INTO fingerprints (hash, song_id, t_anchor)
                VALUES (?, ?, ?);
            """, (h, song_id, int(t)))
        self.conn.commit()
    def get_best_match(self,peaks_query):
        
        query_hashes = np.array(self.generate_hashes(peaks_query))
    
        votes = Counter()  # key: (song_id, offset) -> count
        new_hash_db =self.lookup_hashes(query_hashes[:,0])
        for h, t_q in query_hashes:
            for (song_id, t_db) in new_hash_db.get(h, []):
                offset = t_db - t_q
                votes[(song_id, offset)] += 1
    
        if not votes:
            return None
    
        (best_song,best_offset), best_count = votes.most_common(1)[0]
        return {
            "song_id": best_song,
            "offset": best_offset,
            "matches": best_count
        }
    def lookup_hashes(self,hashes):
        self.reconnect()
        cur = self.conn.cursor()
        hashes_query=""
        for h in hashes:
            hashes_query+=str(h)+","
        hashes_query=hashes_query[:-1]
        cur.execute(f"""
                SELECT hash, song_id, t_anchor
                FROM fingerprints
                WHERE hash IN ({hashes_query})
            """)
    
        results = cur.fetchall()
    
        new_db = defaultdict(list)
        for r in results:
            new_db[int(r[0])].append((r[1], r[2]))
    
        return new_db


    def generate_hashes(self,peaks):
        peaks = sorted(peaks, key=lambda x: (x[1], x[0]))
    
        hashes = []
    
        # For each anchor peak i, pair with next peaks j (fan-out)
        for i in range(len(peaks)):
            f1, t1, _ = peaks[i]
    
            # Pair with following peaks (targets)
            for j in range(1, settings.FEN_VALUE + 1):
                if i + j >= len(peaks):
                    break
    
                f2, t2, _ = peaks[i + j]
                dt = t2 - t1
    
                if dt < settings.T_MIN:
                    continue
                if dt > settings.T_MAX:
                    break  # because times are sorted, future dt only bigger
    
                # Create a compact hash from (f1, f2, dt)
                # You can store as bytes/ints too; this is simple & robust.
                raw = f"{f1}|{f2}|{dt}".encode("utf-8")
                h=hash((f1, f2, dt))
                #h = hashlib.sha1(raw).hexdigest()[:20]  # take first 20 hex chars
    
                hashes.append((h, t1))
    
        return hashes
    def load_audio(self,file_path, mono=True):
        y, sr = librosa.load(file_path, sr=settings.SAMPLE_RATE, mono=mono)
        return y, sr
    def find_2d_peaks(self,S_db):
        local_max = maximum_filter(S_db, size=settings.PEAK_BOX_SIZE, mode="constant")
        peaks_mask = (S_db == local_max) & (S_db >= settings.AMPLITUDE_THRESHOLD)
    
        # get coordinates
        freq_idx, time_idx = np.nonzero(peaks_mask)
        peak_vals = S_db[freq_idx, time_idx]
    
        # pack as list of tuples
        peaks = list(zip(freq_idx, time_idx, peak_vals))
        return peaks, peaks_mask

    def get_spectogram(self,y):
        S = librosa.stft(y, n_fft=settings.FFT_WINDOW_SIZE, hop_length=settings.HOP_LENGTH, window="hann")
        S_db = librosa.amplitude_to_db(np.abs(S), ref=np.max)   
    
        return S_db  


    def close(self):
        self.conn.close()
    def __exit__(self, exc_type, exc, tb):
        self.close()

class Radar:
    def __init__(self,db_path="database.db"):
        self.db_path=db_path
        self.reducer = joblib.load("umap_reducer.joblib")
        self.conn = sqlite3.connect(db_path)
    def reconnect(self):
        self.conn = sqlite3.connect(self.db_path)
    def extract_features(self,y):
        # A. MFCC (Timbre/Texture)
        # We take the mean to summarize the whole track
        mfcc = librosa.feature.mfcc(y=y, sr=settings.SAMPLE_RATE, n_mfcc=settings.N_MFCC)
        mfcc_mean = np.mean(mfcc, axis=1)
        mfcc_std  = np.std(mfcc, axis=1)   
        # B. Chroma (Chords/Harmonic content)
        chroma = librosa.feature.chroma_stft(y=y, sr=settings.SAMPLE_RATE)
        chroma_mean = np.mean(chroma, axis=1)
        chroma_std  = np.std(chroma, axis=1)
        
        # C. Spectral Contrast (Brightness/Peaks)
        contrast = librosa.feature.spectral_contrast(y=y, sr=settings.SAMPLE_RATE)
        contrast_mean = np.mean(contrast, axis=1)
        contrast_std  = np.std(contrast, axis=1)
        tempo, _ = librosa.beat.beat_track(
                y=y,
                sr=settings.SAMPLE_RATE
            )   
        return np.concatenate([
            mfcc_mean, mfcc_std,
            chroma_mean, chroma_std,
            contrast_mean, contrast_std,tempo
        ])

    def get_radar(self):
        self.reconnect()
        cur = self.conn.cursor()
        cur.execute("SELECT song_id, x,y FROM radar")
        rows = cur.fetchall()
        return rows
    def add_song_to_radar(self, song_id: int, path):
        y, sr = librosa.load(path, sr=settings.SAMPLE_RATE)
        feat = self.extract_features(y)
        trans=self.reducer.transform(feat.reshape(1,-1))
   
        self.reconnect()
        cur = self.conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO radar(song_id, x,y) VALUES (?, ?,?)",
            (int(song_id), float(trans[0][0]),float(trans[0][1]))
        )
        self.conn.commit()