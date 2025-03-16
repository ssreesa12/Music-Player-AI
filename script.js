const API_KEY = "e9dedfddb6msh0a3449e867fdd5dp1cc4a1jsn137c768d2de9"; // Deezer API Key
const SONG_SEARCH_URL = 'https://deezerdevs-deezer.p.rapidapi.com/search';
const LYRICS_API_URL = 'https://api.lyrics.ovh/v1'; // Lyrics API

let customPlaylist = [];
let playlistName = "My Playlist"; // Default playlist name
let currentAudio = null; // To track the currently playing audio
let currentPlayButton = null; // To track the currently active play button

// Fetch songs based on mood using Deezer's search API
async function fetchSongs(mood) {
    const query = mood || 'pop'; // You can customize the query based on mood
    const url = `${SONG_SEARCH_URL}?q=${query}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com',
                'X-RapidAPI-Key': API_KEY
            }
        });

        const data = await response.json();
        displaySongs(data.data);
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

// Display fetched songs in the UI
function displaySongs(songsData) {
    const songList = document.getElementById('available-songs');
    songList.innerHTML = songsData.map(song => `
        <li>
            <div class="song-info">
                <img src="${song.album.cover}" alt="${song.title}">
                <span>${song.title} - ${song.artist.name}</span>
            </div>
            <div>
                <button class="play-btn" onclick="playSong('${song.preview}', '${song.title}', '${song.artist.name}', this)">Play</button>
                <button class="add-btn" onclick="addToCustomPlaylist('${song.title}', '${song.preview}', '${song.album.cover}')">Add to Playlist</button>
            </div>
        </li>
    `).join('');
}

// Play the selected song
function playSong(previewUrl, title, artist, button) {
    // Stop the currently playing song
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
        if (currentPlayButton) {
            currentPlayButton.textContent = "Play"; // Reset the previous play button
        }
    }

    // Play the new song
    currentAudio = new Audio(previewUrl);
    currentAudio.play();

    // Update the play button to a stop button
    button.textContent = "Stop";
    button.onclick = () => stopSong(button);
    currentPlayButton = button;

    // Fetch and display lyrics
    fetchLyrics(artist, title);
}

// Stop the currently playing song
function stopSong(button) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    // Reset the stop button to a play button
    button.textContent = "Play";
    button.onclick = (event) => playSong(event.target.getAttribute('data-preview'), event.target.getAttribute('data-title'), event.target.getAttribute('data-artist'), event.target);
}

// Fetch lyrics for the currently playing song
async function fetchLyrics(artist, title) {
    try {
        const response = await fetch(`${LYRICS_API_URL}/${artist}/${title}`);
        const data = await response.json();

        const lyricsBox = document.getElementById('lyrics-box');
        if (data.lyrics) {
            lyricsBox.innerHTML = `<p>${data.lyrics.replace(/\n/g, '<br>')}</p>`;
        } else {
            lyricsBox.innerHTML = `<p>Lyrics not found for ${title} by ${artist}.</p>`;
        }
    } catch (error) {
        console.error('Error fetching lyrics:', error);
        const lyricsBox = document.getElementById('lyrics-box');
        lyricsBox.innerHTML = `<p>Failed to fetch lyrics. Please try again later.</p>`;
    }
}

// Add song to custom playlist
function addToCustomPlaylist(title, previewUrl, coverUrl) {
    const song = { title, previewUrl, coverUrl };
    customPlaylist.push(song);
    alert(`${title} has been added to your custom playlist!`);
    updateCustomPlaylist();
}

// Update the custom playlist UI
function updateCustomPlaylist() {
    const playlistDiv = document.getElementById('playlist');
    playlistDiv.innerHTML = customPlaylist.map(song => `
        <li>
            <img src="${song.coverUrl}" alt="${song.title}" style="width: 30px; height: 30px; margin-right: 10px;">
            ${song.title}
            <button class="play-btn" onclick="playSong('${song.previewUrl}', '${song.title}', '${song.artist}', this)">Play</button>
        </li>
    `).join('');
}

// Save the playlist name
function savePlaylistName() {
    const nameInput = document.getElementById('playlist-name');
    playlistName = nameInput.value || "My Playlist";
    document.querySelector('.custom-playlist h3').innerText = `Custom Playlist: ${playlistName}`;
}

// Generate mood-based playlist
function generatePlaylist() {
    const mood = document.getElementById("mood").value;
    fetchSongs(mood);
}

// Fetch songs when the page loads
window.onload = () => fetchSongs();



function startVoiceRecognition() {
    // Check if the browser supports Speech Recognition
    if (!("webkitSpeechRecognition" in window)) {
        alert("Your browser does not support speech recognition. Try using Chrome!");
        return;
    }

    let recognition = new webkitSpeechRecognition(); // Create SpeechRecognition instance
    recognition.continuous = false; // Stop listening after one result
    recognition.interimResults = false; // Get final result only
    recognition.lang = "en-US"; // Set language

    recognition.start(); // Start recognition

    recognition.onstart = function () {
        console.log("Voice recognition started...");
    };

    recognition.onresult = function (event) {
        let transcript = event.results[0][0].transcript; // Get the recognized text
        console.log("Recognized text:", transcript);
        document.getElementById("voiceOutput").innerText = "You said: " + transcript;

        // Call API with recognized voice text (if needed)
        generatePlaylistFromVoice(transcript);
    };

    recognition.onerror = function (event) {
        console.error("Speech recognition error:", event.error);
        alert("Error occurred: " + event.error);
    };

    recognition.onend = function () {
        console.log("Voice recognition ended.");
    };
}

async function generatePlaylistFromVoice(mood) {
    const validMoods = ["happy", "sad", "workout", "chill"];

    if (validMoods.includes(mood.toLowerCase())) {
        document.getElementById("mood").value = mood.toLowerCase();

        // Fetch songs and wait for them to be displayed
        await fetchSongs(mood);

        // Get the first song in the list and play it automatically
        const firstSongButton = document.querySelector("#available-songs .play-btn");
        if (firstSongButton) {
            firstSongButton.click(); // Simulate a click to play the first song
        }
    } else {
        alert("Mood not recognized! Try saying: 'happy', 'sad', 'workout', or 'chill'.");
    }
}

