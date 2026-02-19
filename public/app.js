// Web Speech API setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

let recognition;
let currentUserId = null;
let isListening = false;
let voicesReady = false;
let cachedVoices = [];
let selectedVoice = null;

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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

// Load available voices for mobile TTS
function loadVoices() {
    cachedVoices = synth.getVoices();
    if (cachedVoices && cachedVoices.length) {
        voicesReady = true;
        populateVoiceSelect();
    }
}

if (synth) {
    loadVoices();
    synth.onvoiceschanged = () => {
        loadVoices();
    };
}

function populateVoiceSelect() {
    if (!voiceSelect) return;
    voiceSelect.innerHTML = '';

    cachedVoices.forEach((v, i) => {
        const option = document.createElement('option');
        option.value = String(i);
        option.textContent = `${v.name} (${v.lang})`;
        voiceSelect.appendChild(option);
    });

    const preferred = pickPreferredVoice(cachedVoices);
    if (preferred) {
        const idx = cachedVoices.indexOf(preferred);
        if (idx >= 0) {
            voiceSelect.value = String(idx);
            selectedVoice = preferred;
        }
    }
}

function pickPreferredVoice(voices) {
    if (!voices || !voices.length) return null;
    const lower = (s) => (s || '').toLowerCase();
    const preferNames = isMobile
        ? ['samantha', 'ava', 'victoria', 'karen', 'moira', 'tessa', 'alex']
        : ['google us english', 'microsoft', 'samantha', 'alex'];

    for (const name of preferNames) {
        const v = voices.find(vv => lower(vv.name).includes(name));
        if (v) return v;
    }
    return voices.find(v => lower(v.lang).startsWith('en')) || voices[0];
}

// UI Elements
const splashScreen = document.getElementById('splash');
const lessonScreen = document.getElementById('lesson');
const errorScreen = document.getElementById('error');
const startBtn = document.getElementById('startBtn');
const micBtn = document.getElementById('micBtn');
const playBtn = document.getElementById('playBtn');
const exitBtn = document.getElementById('exitBtn');
const sendBtn = document.getElementById('sendBtn');
const commandInput = document.getElementById('commandInput');
const commandButtons = document.querySelectorAll('[data-command]');
const voiceSelect = document.getElementById('voiceSelect');
const rateRange = document.getElementById('rateRange');
const rateValue = document.getElementById('rateValue');

function safeAddListener(el, event, handler) {
    if (el && el.addEventListener) {
        el.addEventListener(event, handler);
    }
}

// Event listeners
safeAddListener(startBtn, 'click', initializeSession);
safeAddListener(micBtn, 'click', toggleListening);
safeAddListener(playBtn, 'click', playAudio);
safeAddListener(exitBtn, 'click', endLesson);
safeAddListener(sendBtn, 'click', sendManualCommand);
commandButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-command');
        if (cmd) sendCommand(cmd);
    });
});
safeAddListener(commandInput, 'keydown', (e) => {
    if (e.key === 'Enter') sendManualCommand();
});

safeAddListener(rateRange, 'input', () => {
    if (rateValue) {
        rateValue.textContent = `${parseFloat(rateRange.value).toFixed(2)}x`;
    }
});

safeAddListener(voiceSelect, 'change', () => {
    const idx = parseInt(voiceSelect.value, 10);
    selectedVoice = Number.isFinite(idx) ? cachedVoices[idx] : null;
});

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

        if (isMobile) {
            if (rateRange) rateRange.value = '1.1';
            if (rateValue) rateValue.textContent = '1.10x';
        }

        // Start with the first segment on a user gesture
        await sendCommand('begin the lesson');
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
        if (typeof data.segmentIdx === 'number') {
            document.getElementById('segmentNum').textContent = String(data.segmentIdx + 1);
        }
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
    if (!synth) {
        updateStatus('Speech not supported on this browser.');
        return;
    }
    if (synth.speaking) synth.cancel();

    if (!voicesReady) {
        loadVoices();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.lang = 'en-US';
    const rate = rateRange && rateRange.value ? rateRange.value : '1.0';
    utterance.rate = parseFloat(rate);
    utterance.pitch = 1;
    utterance.volume = 1;
    
    synth.speak(utterance);
}

// Toggle listening
function toggleListening() {
    if (!recognition) {
        updateMicStatus('Speech recognition not supported. Use tap commands below.', '#f44336');
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
    const text = document.getElementById('audioScript').textContent.trim();
    if (text) {
        updateStatus('▶ Playing audio...');
        speakText(text);
    } else {
        updateStatus('No segment loaded yet. Tap “Begin the lesson”.');
    }
}

// End lesson
function endLesson() {
    updateStatus('Ending lesson...');
    if (synth.speaking) synth.cancel();
    sendCommand('end the lesson')
        .catch(() => {})
        .finally(() => {
            setTimeout(() => {
                location.reload();
            }, 600);
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

function sendManualCommand() {
    const cmd = commandInput.value.trim();
    if (!cmd) return;
    commandInput.value = '';
    sendCommand(cmd);
}

// Check browser support
window.addEventListener('load', () => {
    if (!SpeechRecognition) {
        updateMicStatus('⚠ Speech recognition not supported in this browser. Use tap commands below.', '#ff9800');
        micBtn.disabled = true;
    }
});
