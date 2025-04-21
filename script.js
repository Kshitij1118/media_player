let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");
let wave = document.getElementById("wave");
let randomIcon = document.querySelector(".fa-random");
let curr_track = document.createElement("audio");
let queue_panel = document.querySelector(".queue-panel");
let queue_list = document.querySelector(".queue-list");
let add_songs_menu = document.querySelector(".add-songs-menu");
let available_songs_list = document.querySelector(".available-songs-list");

let track_index = 0;
let isPlaying = false;
let isRandom = false;
let updateTimer;
let isQueueActive = false;
let isAddSongsMenuActive = false;
let queue = [];

let themeIcon = document.querySelector(".theme-icon");
let isLightTheme = false;

// DOM Elements for drag-and-drop
let dropArea = document.getElementById('drop-area');
let dragUploadZone = document.getElementById('drag-upload-zone');
let fileInput = document.getElementById('file-upload');

const music_list = [
  {
    img: "images/stay.png",
    name: "Stay",
    artist: "The Kid LAROI, Justin Bieber",
    music: "music/stay.mp3",
  },
  {
    img: "images/fallingdown.jpg",
    name: "Falling Down",
    artist: "Wid Cards",
    music: "music/fallingdown.mp3",
  },
  {
    img: "images/faded.png",
    name: "Faded",
    artist: "Alan Walker",
    music: "music/Faded.mp3",
  },
  {
    img: "images/ratherbe.jpg",
    name: "Rather Be",
    artist: "Clean Bandit",
    music: "music/Rather Be.mp3",
  },
];

// Initialize queue with all tracks
function initializeQueue() {
  queue = [...Array(music_list.length).keys()]; // Creates array [0, 1, 2, 3]
  renderQueue();
}

// Toggle queue panel
function toggleQueue() {
  isQueueActive = !isQueueActive;
  const queueBtn = document.querySelector(".queue-button");

  if (isQueueActive) {
    queue_panel.classList.add("active");
    queueBtn.classList.add("active");
    renderQueue();
    // Refresh available songs when opening queue panel
    renderAvailableSongs();
  } else {
    queue_panel.classList.remove("active");
    queueBtn.classList.remove("active");
    // Close the add songs menu when closing queue panel
    closeAddSongsMenu();
  }
}

// Toggle add songs menu
function toggleAddSongsMenu() {
  isAddSongsMenuActive = !isAddSongsMenuActive;

  if (isAddSongsMenuActive) {
    add_songs_menu.classList.add("active");
    renderAvailableSongs();
  } else {
    add_songs_menu.classList.remove("active");
  }
}

// Close add songs menu
function closeAddSongsMenu() {
  isAddSongsMenuActive = false;
  add_songs_menu.classList.remove("active");
}

// Check if a track is already in the queue
function isTrackInQueue(trackIndex) {
  return queue.includes(trackIndex);
}

// Render available songs that aren't in the queue
function renderAvailableSongs() {
  available_songs_list.innerHTML = "";

  music_list.forEach((track, index) => {
    const isInQueue = isTrackInQueue(index);

    const songItem = document.createElement("div");
    songItem.className = "available-song-item";

    songItem.innerHTML = `
      <img src="${track.img}" alt="${track.name}">
      <div class="available-song-info">
        <div class="available-song-title">${track.name}</div>
        <div class="available-song-artist">${track.artist}</div>
      </div>
      <button class="add-song-btn ${isInQueue ? "disabled" : ""}" ${
      isInQueue ? "disabled" : `onclick="addToQueue(${index})"`
    }>
        <i class="fa-solid ${isInQueue ? "fa-check" : "fa-plus"}"></i>
      </button>
    `;

    available_songs_list.appendChild(songItem);
  });

  // Show message if all songs are already in queue
  if (queue.length === music_list.length) {
    const allSongsMessage = document.createElement("div");
    allSongsMessage.className = "all-songs-message";
    allSongsMessage.textContent = "All songs are already in your queue";
    available_songs_list.appendChild(allSongsMessage);
  }
}

// Add a track to the queue
function addToQueue(trackIndex) {
  // Don't add if already in queue
  if (isTrackInQueue(trackIndex)) {
    return;
  }

  // Add to the end of the queue
  queue.push(trackIndex);

  // Re-render queue and available songs
  renderQueue();
  renderAvailableSongs();

  // Show brief confirmation message
  showAddConfirmation(trackIndex);
}

// Show brief confirmation when a song is added
function showAddConfirmation(trackIndex) {
  const trackName = music_list[trackIndex].name;

  // Create confirmation element
  const confirmation = document.createElement("div");
  confirmation.className = "add-confirmation";
  confirmation.textContent = `"${trackName}" added to queue`;

  // Add to body
  document.body.appendChild(confirmation);

  // Remove after animation
  setTimeout(() => {
    confirmation.classList.add("show");

    setTimeout(() => {
      confirmation.classList.remove("show");

      setTimeout(() => {
        document.body.removeChild(confirmation);
      }, 300);
    }, 2000);
  }, 10);
}

// Render queue items in the queue panel
function renderQueue() {
  queue_list.innerHTML = "";

  queue.forEach((index, queuePosition) => {
    const track = music_list[index];
    const isCurrent = index === track_index;

    const queueItem = document.createElement("div");
    queueItem.className = `queue-item${isCurrent ? " current" : ""}`;
    queueItem.setAttribute("data-index", index);
    queueItem.setAttribute("data-position", queuePosition);
    queueItem.draggable = true;

    queueItem.innerHTML = `
      <img src="${track.img}" alt="${track.name}">
      <div class="queue-item-details">
        <div class="queue-item-title">${track.name}</div>
        <div class="queue-item-artist">${track.artist}</div>
      </div>
      <div class="queue-item-actions">
        <button onclick="playQueueItem(${queuePosition})">
          <i class="fa-solid fa-play"></i>
        </button>
        <button onclick="removeFromQueue(${queuePosition})">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    `;

    // Add event listeners for drag and drop functionality
    queueItem.addEventListener("dragstart", handleDragStart);
    queueItem.addEventListener("dragover", handleDragOver);
    queueItem.addEventListener("drop", handleDrop);
    queueItem.addEventListener("dragend", handleDragEnd);

    queue_list.appendChild(queueItem);
  });

  // Update now playing text
  updateNowPlayingText();
}

// Update the now playing text to reflect the queue length
function updateNowPlayingText() {
  now_playing.innerHTML =
    "PLAYING <span>" + (track_index + 1) + " OF " + queue.length + "</span>";
}

// Play track from queue
function playQueueItem(queuePosition) {
  track_index = queue[queuePosition];
  loadTrack(track_index);
  playTrack();
}

// Remove item from queue
function removeFromQueue(queuePosition) {
  // Only allow removal if there's more than one track
  if (queue.length > 1) {
    const removedIndex = queue[queuePosition];

    // Remove the track from queue
    queue.splice(queuePosition, 1);

    // If the current track was removed, play the next one
    if (removedIndex === track_index) {
      if (queuePosition < queue.length) {
        // Play the track that took its position
        track_index = queue[queuePosition];
      } else {
        // Play the last track in the queue
        track_index = queue[queue.length - 1];
      }
      loadTrack(track_index);
      playTrack();
    } else if (removedIndex < track_index) {
      // If removed track was before current, adjust the index
      let currentQueuePosition = queue.indexOf(track_index);
      if (currentQueuePosition !== -1) {
        // Current track still exists in queue
        track_index = queue[currentQueuePosition];
      }
    }

    // Render the updated queue and update the now playing text
    renderQueue();
    updateNowPlayingText();

    // Also update available songs list if it's open
    if (isAddSongsMenuActive) {
      renderAvailableSongs();
    }
  }
}

// Variables for drag and drop
let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.innerHTML);
  this.classList.add("dragging");
}

function handleDragOver(e) {
  e.preventDefault();
  return false;
}

function handleDrop(e) {
  e.preventDefault();

  if (draggedItem !== this) {
    // Get positions in the queue
    const fromPosition = parseInt(draggedItem.getAttribute("data-position"));
    const toPosition = parseInt(this.getAttribute("data-position"));

    // Reorder queue array
    const movedItem = queue[fromPosition];
    queue.splice(fromPosition, 1);
    queue.splice(toPosition, 0, movedItem);

    renderQueue();
  }

  return false;
}

function handleDragEnd() {
  this.classList.remove("dragging");
}

// Load track and initialize app
document.addEventListener("DOMContentLoaded", function () {
  // Initial track loading
  loadTrack(track_index);
  initializeQueue();

  // Load saved theme
  const savedTheme = localStorage.getItem("musicPlayerTheme");
  if (savedTheme === "light") {
    enableLightTheme();
  } else {
    enableDarkTheme();
  }

  // Setup drag and drop
  setupDragAndDrop();
});

// Setup drag and drop event listeners
function setupDragAndDrop() {
  // Prevent default drag behaviors
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults, false);
    dropArea.addEventListener(eventName, preventDefaults, false);
    dragUploadZone.addEventListener(eventName, preventDefaults, false);
  });

  // Handle drag enter and leave for the main drop area
  ["dragenter", "dragover"].forEach((eventName) => {
    document.body.addEventListener(eventName, showDropArea, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, hideDropArea, false);
  });

  // Handle drop on the drop area and album art zone
  dropArea.addEventListener("drop", handleDrop, false);
  dragUploadZone.addEventListener("drop", handleDrop, false);

  // Highlight album art when files are dragged over it
  ["dragenter", "dragover"].forEach((eventName) => {
    dragUploadZone.addEventListener(eventName, highlightUploadZone, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dragUploadZone.addEventListener(eventName, unhighlightUploadZone, false);
  });

  // Upload button functionality
  fileInput.addEventListener("change", handleFileSelect, false);
}

// Prevent default drag behaviors
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Show the drop area when a file is dragged over the document
function showDropArea(e) {
  if (!isEventOnDroppableArea(e)) {
    dropArea.classList.add("active");
  }
}

// Hide the drop area when the file is dragged away
function hideDropArea() {
  dropArea.classList.remove("active");
}

// Highlight the album art when a file is dragged over it
function highlightUploadZone() {
  dragUploadZone.classList.add("drag-over");
}

// Remove highlight from album art
function unhighlightUploadZone() {
  dragUploadZone.classList.remove("drag-over");
}

// Check if an event is happening on a droppable area (album art or upload zone)
function isEventOnDroppableArea(e) {
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  return elements.includes(dragUploadZone);
}

// Handle dropped files
function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;

  processFiles(files);
}

// Trigger file input when upload button is clicked
function triggerFileUpload() {
  fileInput.click();
}

// Handle files selected via file input
function handleFileSelect(e) {
  const files = e.target.files;
  processFiles(files);
}

// Process audio files
function processFiles(files) {
  const audioFiles = [...files].filter((file) =>
    file.type.startsWith("audio/")
  );

  if (audioFiles.length === 0) {
    showAddConfirmation("No valid audio files found");
    return;
  }

  // Process each audio file
  audioFiles.forEach((file) => {
    // Create object URL for the file
    const audioUrl = URL.createObjectURL(file);

    // Extract filename without extension as track name
    const fileName = file.name.replace(/\.[^/.]+$/, "");

    // Generate a placeholder image based on the file name
    const placeholderImageUrl = generatePlaceholderImage(fileName);

    // Create a new track object
    const newTrack = {
      name: fileName,
      artist: "Local File",
      music: audioUrl,
      img: placeholderImageUrl,
    };

    // Add to music list
    music_list.push(newTrack);

    // Add to the queue
    const newIndex = music_list.length - 1;
    queue.push(newIndex);

    // Show confirmation
    showAddConfirmation(`"${fileName}" added to queue`);
  });

  // If this is the first track, load it
  if (music_list.length === audioFiles.length) {
    track_index = 0;
    loadTrack(track_index);
  }

  // Update the queue
  renderQueue();
  renderAvailableSongs();

  // Reset the file input for future uploads
  fileInput.value = "";
}

function loadTrack(track_index) {
  clearInterval(updateTimer);
  reset();

  curr_track.src = music_list[track_index].music;
  curr_track.load();

  track_art.style.backgroundImage = "url(" + music_list[track_index].img + ")";
  track_name.textContent = music_list[track_index].name;
  track_artist.textContent = music_list[track_index].artist;

  updateNowPlayingText();

  updateTimer = setInterval(setUpdate, 1000);

  curr_track.addEventListener("ended", nextTrack);
  random_bg_color();

  if (isQueueActive) {
    renderQueue();
  }
}

function toggleTheme() {
  if (isLightTheme) {
    enableDarkTheme();
  } else {
    enableLightTheme();
  }
}

function enableLightTheme() {
  document.body.classList.add("light-theme");
  themeIcon.classList.remove("fa-moon");
  themeIcon.classList.add("fa-sun");
  isLightTheme = true;
  localStorage.setItem("musicPlayerTheme", "light");

  // Set correct background for light theme
  document.body.style.background = "#ffffff";

  // Update player styles
  applyThemeToBackground();
}

function enableDarkTheme() {
  document.body.classList.remove("light-theme");
  themeIcon.classList.remove("fa-sun");
  themeIcon.classList.add("fa-moon");
  isLightTheme = false;
  localStorage.setItem("musicPlayerTheme", "dark");

  // Set correct background for dark theme
  document.body.style.background = "#000000";

  // Update player styles
  applyThemeToBackground();
}

function applyThemeToBackground() {
  random_bg_color();
}

function random_bg_color() {
  let colors;
  const wrapper = document.querySelector(".wrapper");

  if (isLightTheme) {
    colors = [
      "#6a48e0", // Primary purple
      "#7e61e3", // Lighter purple
      "#9d7ae6", // Lavender
      "#4a6bff", // Blue
      "#5e8aed", // Light blue
    ];
  } else {
    colors = [
      "#8367eb", // Purple
      "#5e17eb", // Deep purple
      "#7b5cbf", // Lavender
      "#644fc1", // Medium purple
      "#6c4bbf", // Rich purple
    ];
  }

  // Select a random accent color
  const accentColor = colors[Math.floor(Math.random() * colors.length)];

  // Create wrapper background
  if (isLightTheme) {
    wrapper.style.background = "rgba(255, 255, 255, 0.9)";
  } else {
    wrapper.style.background = "rgba(40, 40, 55, 0.85)";
  }

  // Update accent color
  document.documentElement.style.setProperty("--accent-color", accentColor);
}

function reset() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

function randomTrack() {
  isRandom ? pauseRandom() : playRandom();
}

function playRandom() {
  isRandom = true;
  randomIcon.classList.add("randomActive");
  // Shuffle the queue
  shuffleQueue();
}

function pauseRandom() {
  isRandom = false;
  randomIcon.classList.remove("randomActive");
  // Reset queue to default order
  initializeQueue();
}

// Shuffle the queue using Fisher-Yates algorithm
function shuffleQueue() {
  // Remember current playing track
  const currentTrackIndex = track_index;

  // Get the position of current track in queue
  const currentPosition = queue.indexOf(currentTrackIndex);

  // Remove current track from queue temporarily
  if (currentPosition !== -1) {
    queue.splice(currentPosition, 1);
  }

  // Shuffle the rest of the queue
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }

  // Put current track at the beginning
  queue.unshift(currentTrackIndex);

  // Update the queue display
  renderQueue();

  // Also update available songs list if it's open
  if (isAddSongsMenuActive) {
    renderAvailableSongs();
  }
}

function repeatTrack() {
  let current_index = track_index;
  loadTrack(current_index);
  playTrack();
}

function playpauseTrack() {
  isPlaying ? pauseTrack() : playTrack();
}

function playTrack() {
  curr_track.play();
  isPlaying = true;
  track_art.classList.add("rotate");
  wave.classList.add("loader");
  playpause_btn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  track_art.classList.remove("rotate");
  wave.classList.remove("loader");
  playpause_btn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
}

function nextTrack() {
  // Get the position of current track in queue
  const currentPosition = queue.indexOf(track_index);

  if (currentPosition < queue.length - 1) {
    // Go to next track in queue
    track_index = queue[currentPosition + 1];
  } else {
    // Loop back to first track in queue
    track_index = queue[0];
  }

  loadTrack(track_index);
  playTrack();
}

function prevTrack() {
  // Get the position of current track in queue
  const currentPosition = queue.indexOf(track_index);

  if (currentPosition > 0) {
    // Go to previous track in queue
    track_index = queue[currentPosition - 1];
  } else {
    // Loop to last track in queue
    track_index = queue[queue.length - 1];
  }

  loadTrack(track_index);
  playTrack();
}

function seekTo() {
  let seekto = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekto;
}

function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

function setUpdate() {
  let seekPosition = 0;
  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);
    seek_slider.value = seekPosition;

    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(
      curr_track.currentTime - currentMinutes * 60
    );
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(
      curr_track.duration - durationMinutes * 60
    );

    if (currentSeconds < 10) {
      currentSeconds = "0" + currentSeconds;
    }
    if (durationSeconds < 10) {
      durationSeconds = "0" + durationSeconds;
    }
    if (currentMinutes < 10) {
      currentMinutes = "0" + currentMinutes;
    }
    if (durationMinutes < 10) {
      durationMinutes = "0" + durationMinutes;
    }

    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
}

// Generate a placeholder image with first letter of song name
function generatePlaceholderImage(songName) {
  // Create a canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Set dimensions
  canvas.width = 300;
  canvas.height = 300;

  // Get first letter or first two letters
  const firstLetter = songName.charAt(0).toUpperCase();
  const secondLetter =
    songName.length > 1 ? songName.charAt(1).toLowerCase() : "";
  const initials = secondLetter ? firstLetter + secondLetter : firstLetter;

  // Get accent color
  const accentColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent-color")
    .trim();

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, accentColor);
  gradient.addColorStop(1, "#000000");

  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add some texture/pattern
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  for (let i = 0; i < 5; i++) {
    const size = Math.random() * 80 + 40;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add music icon
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.font = 'normal 120px "Font Awesome 5 Free"';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("\uf001", canvas.width / 2, canvas.height / 2 - 20); // Music note icon

  // Add text (song initials)
  ctx.fillStyle = "white";
  ctx.font = "bold 60px Poppins, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, canvas.width / 2, canvas.height / 2 + 60);

  // Return data URL
  return canvas.toDataURL("image/jpeg");
}
