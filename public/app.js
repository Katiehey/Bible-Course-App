// Web Speech API setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

let recognition;
let currentUserId = null;
let isListening = false;
let voicesReady = false;
let cachedVoices = [];
let selectedVoice = null;
let currentLessonId = null;

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const debugLog = typeof window !== 'undefined' && window.__debugLog
    ? window.__debugLog
    : () => {};
if (typeof window !== 'undefined') {
    window.__appLoaded = true;
}
debugLog('app.js loaded');

// UI Elements
const splashScreen = document.getElementById('splash');
const lessonScreen = document.getElementById('lesson');
const errorScreen = document.getElementById('error');
const startBtn = document.getElementById('startBtn');
const micBtn = document.getElementById('micBtn');
const playBtn = document.getElementById('playBtn');
const exitBtn = document.getElementById('exitBtn');
const sendBtn = document.getElementById('sendBtn');
const nextLessonBtn = document.getElementById('nextLessonBtn');
const prevLessonBtn = document.getElementById('prevLessonBtn');
const commandInput = document.getElementById('commandInput');
const commandButtons = document.querySelectorAll('[data-command]');
const voiceSelect = document.getElementById('voiceSelect');
const rateRange = document.getElementById('rateRange');
const rateValue = document.getElementById('rateValue');

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
        debugLog('speech: listening');
    };

    recognition.onend = () => {
        isListening = false;
        updateMicStatus('Ready', '#999');
        document.getElementById('micBtn').style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        debugLog('speech: ended');
    };

    recognition.onerror = (event) => {
        updateMicStatus(`Error: ${event.error}`, '#f44336');
        console.error('Speech recognition error:', event.error);
        debugLog('speech error: ' + event.error);
    };

    recognition.onresult = async (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        
        console.log('You said:', transcript);
        updateMicStatus(`You said: "${transcript}"`, '#667eea');
        debugLog('speech result: ' + transcript);
        
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
safeAddListener(nextLessonBtn, 'click', loadNextLesson);
safeAddListener(prevLessonBtn, 'click', loadPreviousLesson);
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
        debugLog('init: start session');
        const savedLessonId = localStorage.getItem('currentLessonId');
        const url = savedLessonId ? `/api/session/new?lessonId=${encodeURIComponent(savedLessonId)}` : '/api/session/new';
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            showError(data.error);
            return;
        }

        currentUserId = data.userId;
        currentLessonId = data.lesson.id;
        localStorage.setItem('currentLessonId', currentLessonId);
        document.getElementById('lessonTitle').textContent = data.lesson.title;
        document.getElementById('lessonId').textContent = `ID: ${data.lesson.id} (${data.lesson.sequence})`;
        document.getElementById('segmentTotal').textContent = data.lesson.segments;
        
        splashScreen.classList.add('hidden');
        lessonScreen.classList.remove('hidden');
        
        updateStatus('Session started. Ready for commands!');
        updateMicStatus('Ready', '#999');
        debugLog('init: session ready');

        if (isMobile) {
            if (rateRange) rateRange.value = '1.1';
            if (rateValue) rateValue.textContent = '1.10x';
        }

        // Start with the first segment on a user gesture
        await sendCommand('begin the lesson');
    } catch (err) {
        debugLog('init error: ' + err.message);
        showError(err.message);
    }
}

if (typeof window !== 'undefined') {
    window.initializeSession = initializeSession;
}

// Send command to backend
async function sendCommand(command) {
    if (!currentUserId) return;

    try {
        debugLog('command: ' + command);
        const response = await fetch('/api/session/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId, command })
        });

        const data = await response.json();
        debugLog('command response: ' + JSON.stringify({ status: data.status, segment: data.segment, segmentIdx: data.segmentIdx }));

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
        
        // Check if we reached the close segment
        if (data.segment === 'close' && nextLessonBtn) {
            nextLessonBtn.style.display = 'block';
        } else if (nextLessonBtn) {
            nextLessonBtn.style.display = 'none';
        }

        // Auto-play audio
        if (data.script) {
            document.getElementById('audioScript').textContent = data.script;
            // Play using TTS
            speakText(data.script);
        }

    } catch (err) {
        debugLog('command error: ' + err.message);
        updateStatus(`Error: ${err.message}`);
    }
}

// Speech synthesis
function speakText(text) {
    // Cancel any ongoing speech
    if (!synth) {
        updateStatus('Speech not supported on this browser.');
        debugLog('speech: not supported');
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
    debugLog('speech: speak');
}

// Toggle listening
function toggleListening() {
    if (!recognition) {
        updateMicStatus('Speech recognition not supported. Use tap commands below.', '#f44336');
        debugLog('speech: recognition not supported');
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
    debugLog('end lesson');
    sendCommand('end the lesson')
        .catch(() => {})
        .finally(() => {
            setTimeout(() => {
                // Show next lesson button after reaching close segment
                checkAndShowNextLessonBtn();
            }, 600);
        });
}

// Load next lesson
async function loadNextLesson() {
    if (!currentLessonId) return;
    try {
        debugLog('load: next lesson from ' + currentLessonId);
        nextLessonBtn.disabled = true;
        prevLessonBtn.disabled = true;
        const response = await fetch(`/api/lesson/next?lessonId=${encodeURIComponent(currentLessonId)}`);
        const data = await response.json();
        debugLog('load: api returned ' + (data.next ? data.next.id : 'null'));
        if (data.next) {
            localStorage.setItem('currentLessonId', data.next.id);
            debugLog('load: saved ' + data.next.id + ' to localStorage');
            reloadSessionWithNewLesson(data.next.id);
        } else {
            updateStatus('No more lessons in this course!');
            debugLog('load: no more lessons');
            nextLessonBtn.disabled = false;
            prevLessonBtn.disabled = false;
        }
    } catch (err) {
        debugLog('load error: ' + err.message);
        updateStatus('Error loading next lesson');
        nextLessonBtn.disabled = false;
        prevLessonBtn.disabled = false;
    }
}

// Load previous lesson
async function loadPreviousLesson() {
    if (!currentLessonId) return;
    try {
        debugLog('load: previous lesson from ' + currentLessonId);
        nextLessonBtn.disabled = true;
        prevLessonBtn.disabled = true;
        const response = await fetch(`/api/lesson/prev?lessonId=${encodeURIComponent(currentLessonId)}`);
        const data = await response.json();
        debugLog('load: api returned ' + (data.prev ? data.prev.id : 'null'));
        if (data.prev) {
            localStorage.setItem('currentLessonId', data.prev.id);
            debugLog('load: saved ' + data.prev.id + ' to localStorage');
            reloadSessionWithNewLesson(data.prev.id);
        } else {
            updateStatus('You are on the first lesson!');
            debugLog('load: no previous lessons');
            nextLessonBtn.disabled = false;
            prevLessonBtn.disabled = false;
        }
    } catch (err) {
        debugLog('load error: ' + err.message);
        updateStatus('Error loading previous lesson');
        nextLessonBtn.disabled = false;
        prevLessonBtn.disabled = false;
    }
}

// Reload session with a new lesson without full page reload
async function reloadSessionWithNewLesson(newLessonId) {
    try {
        debugLog('reload: session with lesson ' + newLessonId);
        const response = await fetch(`/api/session/new?lessonId=${encodeURIComponent(newLessonId)}`);
        const data = await response.json();
        
        if (data.error) {
            updateStatus('Error loading lesson');
            debugLog('reload error: ' + data.error);
            nextLessonBtn.disabled = false;
            prevLessonBtn.disabled = false;
            return;
        }

        currentUserId = data.userId;
        currentLessonId = data.lesson.id;
        document.getElementById('lessonTitle').textContent = data.lesson.title;
        document.getElementById('lessonId').textContent = `ID: ${data.lesson.id} (${data.lesson.sequence})`;
        document.getElementById('segmentTotal').textContent = data.lesson.segments;
        document.getElementById('audioScript').textContent = '';
        document.getElementById('segmentNum').textContent = '0';
        document.getElementById('segmentType').textContent = 'Ready';
        
        if (nextLessonBtn) nextLessonBtn.style.display = 'none';
        
        updateStatus('Lesson loaded. Tap "Begin the lesson" to start.');
        updateMicStatus('Ready', '#999');
        debugLog('reload: session ready for lesson ' + newLessonId);
        nextLessonBtn.disabled = false;
        prevLessonBtn.disabled = false;
    } catch (err) {
        debugLog('reload error: ' + err.message);
        updateStatus('Error reloading lesson');
        nextLessonBtn.disabled = false;
        prevLessonBtn.disabled = false;
    }
}

// Check if we're at the close segment and show next button
function checkAndShowNextLessonBtn() {
    const segmentType = document.getElementById('segmentType').textContent;
    if (segmentType === 'close' && nextLessonBtn) {
        nextLessonBtn.style.display = 'block';
    }
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
