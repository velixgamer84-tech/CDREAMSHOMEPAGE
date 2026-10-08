const presets = [
  {
    tag: "01 / JOJI",
    artist: "Joji",
    song: "SLOW DANCING IN THE DARK",
    url: "https://open.spotify.com/track/0L9A7P4gLAn09v1O4bA33O",
    img: "./PNG/Joji.jpeg",
    bgImg: "./PNG/JojiBackground.png",
    bgColor: "#050505",
    accentColor: "#fef08a",
    audioUrl: "./MUSIC/Joji.mp3"
  },
  {
    tag: "02 / DANIEL CAESAR",
    artist: "Daniel Caesar",
    song: "Transform (feat. Charlotte Day Wilson)",
    url: "https://open.spotify.com/track/0U21C3T9aI7xR4Q3s5uH8X",
    img: "./PNG/Daniel.png",
    bgImg: "./PNG/DanielBackground.png",
    bgColor: "#0c1821",
    accentColor: "#38bdf8",
    audioUrl: "./MUSIC/DanielCaesar.mp3"
  },
  {
    tag: "03 / THE MARÍAS",
    artist: "The Marías",
    song: "Heavy",
    url: "https://open.spotify.com/track/2M1O9P0O2L3P1O1O3P2L1O",
    img: "./PNG/TheMARIAS.png",
    bgImg: "./PNG/TheMariasBackground.png",
    bgColor: "#1a080a",
    accentColor: "#f43f5e",
    audioUrl: "./MUSIC/Heavy.mp3"
  }
];

let currentIndex = 0;
let currentAudio = new Audio();
let isPlaying = false;
let activeBgLayer = 1;

function updateTheme(theme) {
  const appBody = document.getElementById('app-body');
  if (appBody) {
    appBody.style.backgroundColor = theme.bgColor;
  }

  // Cross-fade Background Layers
  const layer1 = document.getElementById('bg-layer-1');
  const layer2 = document.getElementById('bg-layer-2');

  if (layer1 && layer2) {
    const nextLayer = activeBgLayer === 1 ? layer2 : layer1;
    const currentLayer = activeBgLayer === 1 ? layer1 : layer2;

    nextLayer.style.backgroundImage = `url('${theme.bgImg}')`;
    nextLayer.classList.add('active');
    currentLayer.classList.remove('active');

    activeBgLayer = activeBgLayer === 1 ? 2 : 1;
  }

  // Update Dynamic Text/Bg Theme Colors across all components (including SDG & About sections)
  document.querySelectorAll('.theme-text').forEach(el => el.style.color = theme.accentColor);
  document.querySelectorAll('.theme-bg').forEach(el => el.style.backgroundColor = theme.accentColor);
  document.querySelectorAll('.theme-border').forEach(el => el.style.borderColor = theme.accentColor + '50');
}

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  isPlaying = false;
  
  const status = document.getElementById('audio-status');
  if (status) status.textContent = "Audio Stopped";

  const toggleBtn = document.getElementById('stop-btn');
  if (toggleBtn) toggleBtn.textContent = "Play";
}

function playAudio(streamUrl) {
  stopAudio();

  currentAudio.src = streamUrl;
  currentAudio.volume = 0.6;

  const status = document.getElementById('audio-status');
  const toggleBtn = document.getElementById('stop-btn');

  const playPromise = currentAudio.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isPlaying = true;
        if (status) status.textContent = "Streaming Audio...";
        if (toggleBtn) toggleBtn.textContent = "Stop";
      })
      .catch((err) => {
        console.warn("Autoplay blocked by browser policy:", err);
        if (status) status.textContent = "Click Play to Hear Audio";
        isPlaying = false;
        if (toggleBtn) toggleBtn.textContent = "Play";
      });
  }

  currentAudio.onended = () => {
    stopAudio();
  };
}

function loadPreset(index, direction = 'left', autoPlay = false) {
  currentIndex = index;
  const data = presets[currentIndex];

  // Trigger Image Slide Animation
  const imgEl = document.getElementById('product-img');
  if (imgEl) {
    imgEl.classList.remove('slide-left', 'slide-right');
    void imgEl.offsetWidth; // Force CSS Reflow
    imgEl.classList.add(direction === 'left' ? 'slide-left' : 'slide-right');
    imgEl.src = data.img;
  }

  const presetTag = document.getElementById('preset-tag');
  const presetArtist = document.getElementById('preset-artist');
  const presetSong = document.getElementById('preset-song');
  const nfcUrl = document.getElementById('nfc-url');

  if (presetTag) presetTag.textContent = data.tag;
  if (presetArtist) presetArtist.textContent = data.artist;
  if (presetSong) presetSong.textContent = data.song;
  if (nfcUrl) nfcUrl.value = data.url;

  updateTheme(data);

  if (autoPlay) {
    playAudio(data.audioUrl);
  }
}

// Fallback defaults for reviews if fetch fails
const defaultReviews = [
  {
    name: "Alex M.",
    rating: "★★★★★",
    comment: "The NFC tap is so fast! I linked it to my personal Spotify playlist and everyone who sees my keychain wants one.",
    badge: "Verified Buyer"
  },
  {
    name: "Rellosa Mark",
    rating: "★★★★★",
    comment: "Coooool1 LABUBU WARRIORS",
    badge: "Verified Buyer"
  },
  {
    name: "Rellosa2",
    rating: "★★★★★",
    comment: "LABUBU WARRIORS",
    badge: "Verified Buyer"
  }
];

function renderReviews(reviews) {
  const reviewsContainer = document.getElementById("reviews-container");
  if (!reviewsContainer) return;
  reviewsContainer.innerHTML = "";

  reviews.forEach(review => {
    const card = document.createElement("div");
    card.className = "glass-card p-6 rounded-2xl space-y-3 flex flex-col justify-between";
    card.innerHTML = `
      <div class="space-y-2">
        <div class="text-yellow-400 text-sm">${review.rating}</div>
        <p class="text-xs text-neutral-300 italic">"${escapeHTML(review.comment)}"</p>
      </div>
      <div class="border-t border-white/10 pt-3 flex items-center justify-between text-[11px]">
        <span class="font-bold text-white">— ${escapeHTML(review.name)}</span>
        <span class="text-neutral-400">${review.badge || 'Verified Buyer'}</span>
      </div>
    `;
    reviewsContainer.appendChild(card);
  });
}

async function loadReviews() {
  const stored = localStorage.getItem("cdreams_reviews");

  if (stored) {
    renderReviews(JSON.parse(stored));
  } else {
    try {
      const response = await fetch("review.json");
      if (!response.ok) throw new Error("JSON load failed");
      const data = await response.json();
      localStorage.setItem("cdreams_reviews", JSON.stringify(data));
      renderReviews(data);
    } catch (err) {
      localStorage.setItem("cdreams_reviews", JSON.stringify(defaultReviews));
      renderReviews(defaultReviews);
    }
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const tapBtn = document.getElementById('tap-btn');
  const copyBtn = document.getElementById('copy-btn');
  const stopBtn = document.getElementById('stop-btn');
  const reviewForm = document.getElementById("review-form");

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const newIdx = (currentIndex - 1 + presets.length) % presets.length;
      loadPreset(newIdx, 'right', true);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const newIdx = (currentIndex + 1) % presets.length;
      loadPreset(newIdx, 'left', true);
    });
  }

  if (tapBtn) {
    tapBtn.addEventListener('click', () => {
      playAudio(presets[currentIndex].audioUrl);
      window.open(presets[currentIndex].url, '_blank');
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      if (isPlaying) {
        stopAudio();
      } else {
        playAudio(presets[currentIndex].audioUrl);
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(presets[currentIndex].url);
      copyBtn.textContent = "Copied!";
      setTimeout(() => copyBtn.textContent = "Copy", 1500);
    });
  }

  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("reviewer-name").value.trim();
      const rating = document.getElementById("reviewer-rating").value;
      const comment = document.getElementById("reviewer-comment").value.trim();

      if (!name || !comment) return;

      const newReview = {
        name: name,
        rating: rating,
        comment: comment,
        badge: "Verified Buyer"
      };

      const currentReviews = JSON.parse(localStorage.getItem("cdreams_reviews")) || defaultReviews;
      currentReviews.unshift(newReview);

      localStorage.setItem("cdreams_reviews", JSON.stringify(currentReviews));

      renderReviews(currentReviews);
      reviewForm.reset();
    });
  }

  // Load initial preset & reviews
  loadPreset(0, 'left', false);
  loadReviews();
});