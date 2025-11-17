document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContainer = document.querySelector('.main-container');

    setTimeout(function() {
        loadingScreen.style.display = 'none';
        mainContainer.style.display = 'block';
    }, 10000);
});

async function uploadFile() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("No file selected");

    const chunkSize = 10 * 1024 * 1024; // 10MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    const status = document.getElementById("uploadStatus");

    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("file", chunk);
        formData.append("filename", file.name);
        formData.append("chunkIndex", i);
        formData.append("totalChunks", totalChunks);

        await fetch("/upload_chunk", { method: "POST", body: formData });
        status.innerText = `Uploaded chunk ${i+1}/${totalChunks}`;
    }

    const mergeData = new FormData();
    mergeData.append("filename", file.name);
    mergeData.append("totalChunks", totalChunks);
    await fetch("/merge_chunks", { method: "POST", body: mergeData });

    status.innerText = "Upload completed!";
    location.reload();
}

async function downloadYoutube() {
    const url = document.getElementById("youtubeUrl").value;
    if (!url) return alert("Please enter a YouTube URL");

    const status = document.getElementById("youtubeStatus");
    status.innerText = "Downloading...";

    const formData = new FormData();
    formData.append("url", url);

    const response = await fetch("/download_youtube", { method: "POST", body: formData });
    const result = await response.json();

    if (result.status === "completed") {
        status.innerText = "Download completed!";
        location.reload();
    } else {
        status.innerText = `Error: ${result.error}`;
    }
}

async function downloadYoutubeAudio() {
    const url = document.getElementById("youtubeAudioUrl").value;
    if (!url) return alert("Please enter a YouTube URL");

    const status = document.getElementById("youtubeAudioStatus");
    status.innerText = "Downloading...";

    const formData = new FormData();
    formData.append("url", url);

    const response = await fetch("/download_youtube_audio", { method: "POST", body: formData });
    const result = await response.json();

    if (result.status === "completed") {
        status.innerText = "Download completed!";
        location.reload();
    } else {
        status.innerText = `Error: ${result.error}`;
    }
}

// Tab switching
const tabs = document.querySelectorAll('.tab-btn');
const mediaCards = document.querySelectorAll('.media-card[data-name]');
const searchBox = document.getElementById('searchBox');

function filterMedia() {
    const query = searchBox.value.toLowerCase();
    const activeType = document.querySelector('.tab-btn.active').dataset.type;
    const newMediaSection = document.getElementById('new-media-section');
    const mediaGrid = document.getElementById('mediaGrid');

    if (activeType === 'new') {
        newMediaSection.style.display = 'block';
        mediaGrid.style.display = 'none';
    } else {
        newMediaSection.style.display = 'none';
        mediaGrid.style.display = 'grid';

        mediaCards.forEach(card => {
            const matchesName = card.dataset.name.includes(query);
            const matchesType = (activeType === 'all') || (card.dataset.type === activeType);
            card.style.display = (matchesName && matchesType) ? 'flex' : 'none';
        });
    }
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        filterMedia();
    });
});

searchBox.addEventListener('input', filterMedia);

// Initial filter on page load
filterMedia();

const videoContainers = document.querySelectorAll(".video-container");

videoContainers.forEach(container => {
    const video = container.querySelector("video");
    const resumePrompt = container.querySelector(".resume-prompt");
    const resumeBtn = container.querySelector(".resume-btn");
    const startOverBtn = container.querySelector(".start-over-btn");

    video.addEventListener("timeupdate", () => {
        const currentTime = video.currentTime;
        const duration = video.duration;
        const startThreshold = 11; // 10 seconds from the beginning
        const endThreshold = duration - 10; // 10 seconds from the end

        // Only save if currentTime is more than 10 seconds from start
        // and less than 10 seconds from end
        if (currentTime > startThreshold && currentTime < endThreshold) {
            localStorage.setItem(video.currentSrc, currentTime);
        }
    });

    video.addEventListener("loadedmetadata", () => {
        const savedTime = localStorage.getItem(video.currentSrc);
        if (savedTime) {
            resumePrompt.style.display = "flex";
            resumePrompt.querySelector("p").innerText = `Resume from ${formatTime(savedTime)}?`;
        } else {
            video.controls = true;
        }
    });

    resumeBtn.addEventListener("click", () => {
        const savedTime = localStorage.getItem(video.currentSrc);
        if (savedTime) {
            video.currentTime = savedTime;
        }
        video.controls = true;
        video.play();
        resumePrompt.style.display = "none";
    });

    startOverBtn.addEventListener("click", () => {
        video.currentTime = 0;
        localStorage.removeItem(video.currentSrc);
        video.controls = true;
        video.play();
        resumePrompt.style.display = "none";
    });
});

const deleteButtons = document.querySelectorAll(".delete-btn");

deleteButtons.forEach(button => {
    button.addEventListener("click", async () => {
        const filename = button.dataset.filename;
        if (confirm(`Wanna delete ${filename}?`)) {
            const response = await fetch(`/delete_media/${encodeURIComponent(filename)}`, { method: "POST" });
            const result = await response.json();
            if (result.status === "success") {
                // Remove the media card from the DOM
                button.closest(".media-card").remove();
            } else {
                alert(`Error: ${result.message}`);
            }
        }
    });
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
const targetText = "ORRIVN";
const container = document.getElementById("boot");
const scrambleChars = "!@#$%&*ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~^<>?/[]{}()|+=-_";

// Create letter boxes
[...targetText].forEach(char => {
  const span = document.createElement("span");
  span.classList.add("char-box");
  span.textContent = char === " " ? "\u00A0" : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
  container.appendChild(span);
});

const chars = container.querySelectorAll(".char-box");
const totalDuration = 4000; // 4 seconds
const scrambleDuration = totalDuration * 0.6; 
const revealDuration = totalDuration * 0.4; 
const interval = 30;
let frame = 0;
const totalFrames = totalDuration / interval;

const animate = setInterval(() => {
  frame++;

  chars.forEach((span, i) => {
    if (frame * interval < scrambleDuration) {
      if (targetText[i] !== " ") {
        span.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        span.style.opacity = 1;
        // subtle scramble variants: small Y slide and tiny rotate
        const yOffset = 20 - 20 * (frame * interval / scrambleDuration) + Math.random() * 2 - 1;
        const rotate = Math.random() * 3 - 1.5;
        span.style.transform = `translateY(${yOffset}px) rotateX(${rotate}deg)`;
      }
    } else {
      const revealIndex = Math.floor(((frame * interval - scrambleDuration) / revealDuration) * targetText.length);
      if (i <= revealIndex && targetText[i] !== " ") {
        span.textContent = targetText[i];
        span.classList.add("glow");
        span.style.transform = "translateY(0px) rotateX(0deg)";
        span.style.opacity = 1;
      }
    }
  });

  if (frame >= totalFrames) {
    clearInterval(animate);
    // final cinematic glow
    chars.forEach(span => span.classList.add("glow"));
    // show "Made By Yocrrz"
    document.getElementById("made-by").style.opacity = 1;
  }
}, interval);

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent the mini-info bar from appearing automatically
  e.preventDefault();
  deferredPrompt = e;

  // Show your custom "Install" button
  const installBtn = document.getElementById("installBtn");
  installBtn.style.display = "block";

  installBtn.addEventListener("click", async () => {
    // Show the browser install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      console.log("PWA installation accepted");
    } else {
      console.log("PWA installation dismissed");
    }
    // Hide the button
    installBtn.style.display = "none";
    deferredPrompt = null;
  });
});
