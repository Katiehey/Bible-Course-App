// Web Speech API setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

let recognition;
let currentUserId = null;
let isListening = false;

// Initialize speech recognition
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isListening = true;
        updateMicStatus('Listening...', '#4CAF50');
        document.getElementById('micBtn').style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
    };

    recognition.onend = () => {
        isListening = false;
        updateMicStatus('Ready', '#999');
        document.getElementById('micBtn').style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    };

    recognition.onerror = (event) => {
        updateMicStatus(`Error: ${event.error}`, '#f44336');
        console.error('Speech recognition error:', event.error);
    };

    recognition.onresult = async (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        
        console.log('You said:', transcript);
        updateMicStatus(`You said: "${transcript}"`, '#667eea');
        
        // Send command to backend
        await sendCommand(transcript.toLowerCase());
    };
}

// UI Elements
const splashScreen = document.getElementById('splash');
const lessonScreen = document.getElementById('lesson');
const errorScreen = document.getElementById('error');
const startBtn = document.getElementById('startBtn');
const micBtn = document.getElementById('micBtn');
const playBtn = document.getElementById('playBtn');
const exitBtn = document.getElementById('exitBtn');

// Event listeners
startBtn.addEventListener('click', initializeSession);
micBtn.addEventListener('click', toggleListening);
playBtn.addEventListener('click', playAudio);
exitBtn.addEventListener('click', endLesson);

// Initialize session
async function initializeSession() {
    try {
        const response = await fetch('/api/session/new');
        const data = await response.json();
        
        if (data.error) {
            showError(data.error);
            return;
        }

        currentUserId = data.userId;
        document.getElementById('lessonTitle').textContent = data.lesson.title;
        document.getElementById('lessonId').textContent = `ID: ${data.lesson.id}`;
        document.getElementById('segmentTotal').textContent = data.lesson.segments;
        
        splashScreen.classList.add('hidden');
        lessonScreen.classList.remove('hidden');
        
        updateStatus('Session started. Ready for commands!');
        updateMicStatus('Ready', '#999');
    } catch (err) {
        showError(err.message);
    }
}

// Send command to backend
async function sendCommand(command) {
    if (!currentUserId) return;

    try {
        const response = await fetch('/api/session/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId, command })
        });

        const data = await response.json();

        if (data.error) {
            updateStatus(`Error: ${data.error}`);
            return;
        }

        // Update UI
        document.getElementById('segmentType').textContent = data.segment || 'Ready';
        updateStatus(`✓ ${data.message || data.command}`);

        // Auto-play audio
        if (data.script) {
            document.getElementById('audioScript').textContent = data.script;
            // Play using TTS
            speakText(data.script);
        }

    } catch (err) {
        updateStatus(`Error: ${err.message}`);
    }
}

// Speech synthesis
function speakText(text) {
    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    synth.speak(utterance);
}

// Toggle listening
function toggleListening() {
    if (!recognition) {
        updateMicStatus('Speech recognition not supported', '#f44336');
        return;
    }

    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

// Play audio command
async function playAudio() {
    if (!currentUserId) return;

    try {
        const response = await fetch(`/api/session/audio?userId=${currentUserId}`);
        const data = await response.json();
        updateStatus('▶ Playing audio...');
    } catch (err) {
        updateStatus(`Error: ${err.message}`);
    }
}

// End lesson
function endLesson() {
    sendCommand('end the lesson').then(() => {
        setTimeout(() => {
            location.reload();
        }, 1000);
    });
}

// Helper functions
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

function updateMicStatus(message, color = '#999') {
    const element = document.getElementById('micStatus');
    element.textContent = message;
    element.style.color = color;
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    splashScreen.classList.add('hidden');
    lessonScreen.classList.add('hidden');
    errorScreen.classList.remove('hidden');
}

// Check browser support
window.addEventListener('load', () => {
    if (!SpeechRecognition) {
        updateMicStatus('⚠ Speech recognition not supported in this browser', '#ff9800');
        micBtn.disabled = true;
    }
});
