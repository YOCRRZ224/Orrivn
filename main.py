from flask import Flask, render_template, send_from_directory, request, abort
from werkzeug.utils import safe_join, secure_filename
import os
from flask import jsonify
import yt_dlp
import json
import subprocess
from flask_cors import CORS
app = Flask(__name__)

from flask import url_for

# -------- FIXED MEDIA FOLDER --------
# Remove the leading slash. Join properly.
MEDIA_FOLDER = "<YOUR MEDIA PATH>"
app.config['MEDIA_FOLDER'] = MEDIA_FOLDER
STATIC_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

CHUNK_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chunks")
os.makedirs(CHUNK_FOLDER, exist_ok=True)

CORS(app)

@app.route("/upload_chunk", methods=["POST"])
def upload_chunk():
    file = request.files["file"]
    filename = secure_filename(request.form["filename"])
    chunk_index = request.form["chunkIndex"]

    chunk_path = os.path.join(CHUNK_FOLDER, f"{filename}.part{chunk_index}")
    file.save(chunk_path)
    return jsonify({"status": "chunk_received"})

@app.route("/merge_chunks", methods=["POST"])
def merge_chunks():
    filename = secure_filename(request.form["filename"])
    total_chunks = int(request.form["totalChunks"])

    final_path = os.path.join(MEDIA_FOLDER, filename)
    with open(final_path, "wb") as outfile:
        for i in range(total_chunks):
            chunk_path = os.path.join(CHUNK_FOLDER, f"{filename}.part{i}")
            try:
                with open(chunk_path, "rb") as infile:
                    outfile.write(infile.read())
                os.remove(chunk_path)
            except FileNotFoundError:
                # Handle missing chunk
                abort(400, "Chunk not found")

    return jsonify({"status": "completed", "file": filename})

@app.route("/download_youtube", methods=["POST"])
def download_youtube():
    url = request.form.get("url")
    if not url:
        return jsonify({"status": "error", "error": "URL is required"})

    try:
        # 1️⃣ Define temporary file template
        temp_template = os.path.join(MEDIA_FOLDER, "%(title)s.%(ext)s")

        # 2️⃣ Download best video and best audio separately
        ydl_opts = {
            'format': 'bestvideo[height<=720]+bestaudio/best[height<=720]',
            'outtmpl': temp_template,
            'merge_output_format': 'mp4',   # let ffmpeg handle merge if available
            'postprocessors': [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4'
            }]
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            title = info.get('title', 'output')
        
        # 3️⃣ Build final file path
        output_file = os.path.join(MEDIA_FOLDER, f"{title}.mp4")

        # 4️⃣ Verify if output exists (yt-dlp might already merge it)
        if not os.path.exists(output_file):
            # If still separate, combine manually
            video_file = None
            audio_file = None
            for f in os.listdir(MEDIA_FOLDER):
                if title in f:
                    if f.endswith(".mp4") or f.endswith(".mkv") or f.endswith(".webm"):
                        video_file = os.path.join(MEDIA_FOLDER, f)
                    elif f.endswith(".m4a") or f.endswith(".opus"):
                        audio_file = os.path.join(MEDIA_FOLDER, f)

            if video_file and audio_file:
                output_file = os.path.join(MEDIA_FOLDER, f"{title}_merged.mp4")

                # 5️⃣ Use ffmpeg to merge
                subprocess.run([
                    "ffmpeg", "-y",
                    "-i", video_file,
                    "-i", audio_file,
                    "-c:v", "copy",
                    "-c:a", "aac",
                    "-strict", "experimental",
                    output_file
                ], check=True)

        return jsonify({
            "status": "completed",
            "output": os.path.basename(output_file)
        })

    except subprocess.CalledProcessError as fferr:
        return jsonify({"status": "error", "error": f"FFmpeg failed: {fferr}"})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)})

@app.route("/download_youtube_audio", methods=["POST"])
def download_youtube_audio():
    url = request.form["url"]
    if not url:
        return jsonify({"status": "error", "error": "URL is required"})

    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'extractaudio': True,
            'audioformat': 'mp3',
            'outtmpl': '/storage/A8AB-1801/media/%(title)s.%(ext)s',
            'remuxvideo': 'mp3',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        return jsonify({"status": "completed"})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)})

@app.route('/')
def index():
    # List all files in the media folder
    files = os.listdir(MEDIA_FOLDER)
    return render_template("index.html", files=files)

@app.route('/media/<path:filename>')
def serve_media(filename):
    try:
        return send_from_directory(MEDIA_FOLDER, filename, as_attachment=False)
    except FileNotFoundError:
        abort(404)

@app.route('/static/<path:filename>')
def serve_static(filename):
    try:
        return send_from_directory(STATIC_FOLDER, filename, as_attachment=False)
    except FileNotFoundError:
        abort(404)

@app.route("/delete_media/<filename>", methods=["POST"])
def delete_media(filename):
    try:
        file_path = os.path.join(MEDIA_FOLDER, filename)
        
        # Security check to prevent path traversal
        if not os.path.abspath(file_path).startswith(os.path.abspath(MEDIA_FOLDER)):
            abort(403)

        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({"status": "success"})
        else:
            return jsonify({"status": "error", "message": "File not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
from urllib.parse import quote
from flask import jsonify, url_for
import os

@app.route('/api/videos')
def api_videos():
    folder = app.config['MEDIA_FOLDER']

    if not os.path.isdir(folder):
        return jsonify({"error": "MEDIA_FOLDER not found"}), 500

    # list files
    all_files = [
        f for f in os.listdir(folder)
        if not f.startswith('.') and os.path.isfile(os.path.join(folder, f))
    ]

    # filter only video formats
    video_exts = ('.mp4', '.webm', '.mkv', '.mov', '.avi')
    videos = [f for f in all_files if f.lower().endswith(video_exts)]

    result = []
    for name in videos:
        encoded = quote(name)
        file_url = url_for('serve_media', filename=encoded, _external=True)
        result.append({
            "name": name,
            "url": file_url
        })

    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
