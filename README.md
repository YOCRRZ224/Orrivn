<p align="center">
  <img src="assets/splash.png" width="400">
</p>
<div align="center">
  
## ORRIVN  
  
### **Next-Gen Media Hub • Chunk Uploader • YouTube Downloader • Media Server**

<img src="https://img.shields.io/badge/Status-Stable-brightgreen?style=for-the-badge">
<img src="https://img.shields.io/badge/Maintained-Yes-blue?style=for-the-badge">
<img src="https://img.shields.io/badge/Platform-Android%20|%20Linux%20|%20Termux-orange?style=for-the-badge">
<img src="https://img.shields.io/badge/Python-3.10+-yellow?style=for-the-badge&logo=python">
<img src="https://img.shields.io/badge/Flask-Backend-black?style=for-the-badge&logo=flask">

### 🚀 Live Landing Page  
Click the badge below to open the ORRIVN Landing Page:

[![Open ORRIVN Landing Page](https://img.shields.io/badge/VIEW%20LANDING%20PAGE-00FFA8?style=for-the-badge&logo=google-chrome&logoColor=061015)](https://yocrrz224.github.io/Orrivn/)
---

**ORRIVN** is a powerful, lightweight, and modern self-hosted media hub that supports:

🚀 Chunk-based file uploads  
📥 YouTube video & audio downloader  
🎬 Auto video+audio merging using FFmpeg  
📂 Local media manager (video/audio/images/other)  
🖥 In-browser video player with resume  
🎵 Audio player  
🖼 Image preview  
🗑 File deletion  
📡 REST API  
✨ Beautiful boot animation UI  

Designed for **Termux, Android TV, Linux servers, or local machines.**

</div>

---

# ✨ Features

### 🚀 Core
- Chunk-based uploader (supports huge files)
- YouTube downloader (720p max)
- YouTube MP3 downloader
- Automatic FFmpeg merge when yt-dlp splits streams
- Secure file deletion
- Media grid (Video / Audio / Images / Others)
- Video player with resume popup
- Image preview
- API access for external apps

### 🎨 UI/UX
- Fast boot animation
- Clean grid layout
- Responsive design
- Search filtering
- Icons via Phosphor-Icons
- Smooth experience across devices

---

# 🧪 Tech Stack

<p>
<img src="https://img.shields.io/badge/Python-3.10+-yellow?style=for-the-badge&logo=python">
<img src="https://img.shields.io/badge/Flask-Backend-blue?style=for-the-badge&logo=flask">
<img src="https://img.shields.io/badge/yt--dlp-Downloader-green?style=for-the-badge">
<img src="https://img.shields.io/badge/FFmpeg-Merge-red?style=for-the-badge&logo=ffmpeg">
<img src="https://img.shields.io/badge/HTML-Frontend-orange?style=for-the-badge&logo=html5">
<img src="https://img.shields.io/badge/CSS-UI-blue?style=for-the-badge&logo=css3">
<img src="https://img.shields.io/badge/JS-Logic-yellow?style=for-the-badge&logo=javascript">
</p>

---

# ⚡ Installation

### 1. Clone the project
```bash
git clone https://github.com/yourusername/orrivn
cd orrivn
```
### 2. Install dependencies
```bash
pip install flask yt-dlp flask-cors werkzeug
```
### 3. Install FFmpeg

Platform	Command

Termux (Android)	pkg install ffmpeg
Ubuntu / Debian	sudo apt install ffmpeg
Windows	Download from ffmpeg.org


### 4. Configure media folder

Open main.py:
```bash
MEDIA_FOLDER = "/path/to/your/media/folder"
```
### 5. Start server
```bash
python3 main.py
```
Your app runs on:

http://0.0.0.0:5000


---

🧠 Chunk Upload Architecture
```bash
[ Browser ]
     │
     ├── POST chunk → /upload_chunk
     │      saves → chunks/file.part0
     │      saves → chunks/file.part1
     │      ...
     ▼
[ /merge_chunks ]
     │ reads all parts
     │ merges → final file → MEDIA_FOLDER
     ▼
[ Media Available ]
```

---

🎬 YouTube Download Flow
```bash
URL → /download_youtube
     │
     ├─ yt-dlp downloads bestvideo
     ├─ yt-dlp downloads bestaudio
     │
     ├─ If not merged:
     │      FFmpeg → merges streams
     │
     ▼
 Output: MP4 saved in MEDIA_FOLDER
```

---

### 🌐 API Documentation

📌 List videos

GET /api/videos

Response:

[
  {
    "name": "movie.mp4",
    "url": "http://server/media/movie.mp4"
  }
]


---

📌 Serve media

GET /media/<filename>


---

📌 Upload chunk

POST /upload_chunk

Form fields:

file: <chunk>
filename: "movie.mp4"
chunkIndex: 0


---

📌 Merge chunks

POST /merge_chunks

Form fields:

filename: "movie.mp4"
totalChunks: 20


---

📌 YouTube video (MP4)

POST /download_youtube

Form:

url=YOUTUBE_LINK


---

📌 YouTube audio (MP3)

POST /download_youtube_audio


---

📌 Delete file

POST /delete_media/<filename>


---



---

🚀 Roadmap / Future Ideas

User accounts

Password protected access

Gallery mode

Folder system inside media directory

Dark/Light mode toggle

Better mobile UI

Chromecast / DLNA stream

PWA installable version

Server logs + analytics

Thumbnail previews



---

🤝 Contributing

1. Fork repo


2. Create feature branch


3. Commit changes


4. Open pull request




---

📝 License

MIT License — use freely for personal & commercial projects.


---

<div align="center">✨ FLUID • FLUENT • SMOOTH

The signature of ORRIVN.

</div>
```
---
