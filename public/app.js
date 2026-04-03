// Web Speech API setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

let recognition;
let currentUserId = null;
let isListening = false;
let continuousMode = false;
let voicesReady = false;
let cachedVoices = [];
let selectedVoice = null;
let currentLessonId = null;
let currentSegmentType = null;

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const debugLog = typeof window !== 'undefined' && window.__debugLog
    ? window.__debugLog
    : () => {};
if (typeof window !== 'undefined') {
    window.__appLoaded = true;
}
debugLog('app.js loaded');

// ─── localStorage helpers ──────────────────────────────────────────────────

// #1: Lesson completion tracking
function getCompletedLessons() {
    try {
        return new Set(JSON.parse(localStorage.getItem('completedLessons') || '[]'));
    } catch { return new Set(); }
}

function markLessonComplete(lessonId) {
    const completed = getCompletedLessons();
    completed.add(lessonId);
    localStorage.setItem('completedLessons', JSON.stringify([...completed]));
    debugLog('progress: marked ' + lessonId + ' complete');
}

function isLessonComplete(lessonId) {
    return getCompletedLessons().has(lessonId);
}

// #2: Segment-level resume
function getSavedSegment(lessonId) {
    try {
        const map = JSON.parse(localStorage.getItem('segmentProgress') || '{}');
        return typeof map[lessonId] === 'string' ? map[lessonId] : null;
    } catch { return null; }
}

function saveSegmentProgress(lessonId, segmentType) {
    try {
        const map = JSON.parse(localStorage.getItem('segmentProgress') || '{}');
        map[lessonId] = segmentType;
        localStorage.setItem('segmentProgress', JSON.stringify(map));
    } catch {}
}

function clearSegmentProgress(lessonId) {
    try {
        const map = JSON.parse(localStorage.getItem('segmentProgress') || '{}');
        delete map[lessonId];
        localStorage.setItem('segmentProgress', JSON.stringify(map));
    } catch {}
}

// ─── UI Elements ───────────────────────────────────────────────────────────

const splashScreen = document.getElementById('splash');
const lessonScreen = document.getElementById('lesson');
const errorScreen = document.getElementById('error');
const startBtn = document.getElementById('startBtn');
const openIndexBtn = document.getElementById('openIndexBtn');
const micBtn = document.getElementById('micBtn');
const playBtn = document.getElementById('playBtn');
const exitBtn = document.getElementById('exitBtn');
const openIndexFromLessonBtn = document.getElementById('openIndexFromLessonBtn');
const sendBtn = document.getElementById('sendBtn');
const nextLessonBtn = document.getElementById('nextLessonBtn');
const prevLessonBtn = document.getElementById('prevLessonBtn');
const commandInput = document.getElementById('commandInput');
const commandButtons = document.querySelectorAll('[data-command]');
const voiceSelect = document.getElementById('voiceSelect');
const rateRange = document.getElementById('rateRange');
const rateValue = document.getElementById('rateValue');
const indexWindow = document.getElementById('indexWindow');
const closeIndexBtn = document.getElementById('closeIndexBtn');
const indexSearch = document.getElementById('indexSearch');
const indexContent = document.getElementById('indexContent');

let lessonIndexCache = [];

// ─── Segment order ─────────────────────────────────────────────────────────

const SEGMENT_ORDER = ['orientation', 'reading', 'context', 'analysis', 'themes', 'question', 'close'];

// #7: Update the 7-dot step indicator
function updateSegmentSteps(segmentType) {
    const steps = document.querySelectorAll('#segmentSteps .step-item');
    const currentIdx = SEGMENT_ORDER.indexOf(segmentType);

    steps.forEach((step) => {
        const seg = step.getAttribute('data-segment');
        const segIdx = SEGMENT_ORDER.indexOf(seg);
        step.classList.remove('step-done', 'step-current');

        if (segIdx < currentIdx) {
            step.classList.add('step-done');
        } else if (segIdx === currentIdx) {
            step.classList.add('step-current');
        }
    });
}

// #5: Contextual command buttons — highlight next, dim done, neutral future
function updateContextualCommands(segmentType) {
    const currentIdx = SEGMENT_ORDER.indexOf(segmentType);
    const nextIdx = currentIdx + 1;

    commandButtons.forEach((btn) => {
        const btnSeg = btn.getAttribute('data-segment');
        const btnIdx = SEGMENT_ORDER.indexOf(btnSeg);

        btn.classList.remove('btn-chip-next', 'btn-chip-done', 'btn-chip-current');
        btn.disabled = false;

        if (segmentType === null) {
            // Initial state: only "begin the lesson" is next
            if (btnSeg === 'orientation') {
                btn.classList.add('btn-chip-next');
            }
        } else if (btnIdx < currentIdx) {
            btn.classList.add('btn-chip-done');
        } else if (btnIdx === currentIdx) {
            btn.classList.add('btn-chip-current');
        } else if (btnIdx === nextIdx) {
            btn.classList.add('btn-chip-next');
        }
        // else: future segments stay at default (dimmed via base .btn-chip opacity)
    });
}

// ─── Speech recognition ────────────────────────────────────────────────────

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isListening = true;
        if (continuousMode) {
            updateMicStatus('Listening continuously... (click mic to stop)', '#4CAF50');
        } else {
            updateMicStatus('Listening...', '#4CAF50');
        }
        document.getElementById('micBtn').style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
        debugLog('speech: listening');
    };

    recognition.onend = () => {
        isListening = false;
        if (continuousMode) {
            setTimeout(() => {
                if (continuousMode && !isListening) {
                    try {
                        recognition.start();
                        debugLog('speech: auto-restarting in continuous mode');
                    } catch (e) {
                        debugLog('speech: restart failed - ' + e.message);
                    }
                }
            }, 100);
        } else {
            updateMicStatus('Ready', '#999');
            document.getElementById('micBtn').style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            debugLog('speech: ended');
        }
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
        await sendCommand(transcript.toLowerCase());
    };
}

// ─── Voice / TTS ───────────────────────────────────────────────────────────

function loadVoices() {
    cachedVoices = synth.getVoices();
    if (cachedVoices && cachedVoices.length) {
        voicesReady = true;
        populateVoiceSelect();
    }
}

if (synth) {
    loadVoices();
    synth.onvoiceschanged = () => { loadVoices(); };
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

// ─── Event listeners ───────────────────────────────────────────────────────

function safeAddListener(el, event, handler) {
    if (el && el.addEventListener) {
        el.addEventListener(event, handler);
    }
}

safeAddListener(startBtn, 'click', initializeSession);
safeAddListener(openIndexBtn, 'click', openIndexWindow);
safeAddListener(micBtn, 'click', toggleListening);
safeAddListener(playBtn, 'click', playAudio);
safeAddListener(exitBtn, 'click', endLesson);
safeAddListener(openIndexFromLessonBtn, 'click', openIndexWindow);
safeAddListener(closeIndexBtn, 'click', closeIndexWindow);
safeAddListener(nextLessonBtn, 'click', loadNextLesson);
safeAddListener(prevLessonBtn, 'click', loadPreviousLesson);
safeAddListener(sendBtn, 'click', sendManualCommand);

// #1/#2: Reset clears all progress tracking
safeAddListener(document.getElementById('resetBtn'), 'click', () => {
    localStorage.removeItem('currentLessonId');
    localStorage.removeItem('completedLessons');
    localStorage.removeItem('segmentProgress');
    debugLog('reset: cleared all localStorage progress');
    updateStatus('Progress reset. Tap "Begin Learning" to start from lesson 1.');
});

commandButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-command');
        if (cmd) {
            debugLog('tap: command ' + cmd);
            sendCommand(cmd);
        }
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

safeAddListener(indexSearch, 'input', () => {
    renderIndexWindow(indexSearch.value || '');
});

safeAddListener(indexSearch, 'keydown', (e) => {
    if (e.key === 'Escape') closeIndexWindow();
});

// ─── Index window ──────────────────────────────────────────────────────────

async function openIndexWindow() {
    try {
        if (!lessonIndexCache.length) {
            const response = await fetch('/api/index');
            const data = await response.json();
            lessonIndexCache = data.courses || [];
        }
        splashScreen.classList.add('hidden');
        lessonScreen.classList.add('hidden');
        errorScreen.classList.add('hidden');
        indexWindow.classList.remove('hidden');
        if (indexSearch) indexSearch.value = '';
        renderIndexWindow('');
    } catch (err) {
        showError(err.message);
    }
}

function closeIndexWindow() {
    indexWindow.classList.add('hidden');
    if (currentUserId) {
        lessonScreen.classList.remove('hidden');
        return;
    }
    splashScreen.classList.remove('hidden');
}

// #3: Index shows course-level progress and per-lesson completion badges
function renderIndexWindow(searchTerm) {
    if (!indexContent) return;

    const completedSet = getCompletedLessons();
    const query = (searchTerm || '').trim().toLowerCase();
    const courses = lessonIndexCache
        .map(course => {
            const lessons = (course.lessons || []).filter(lesson => {
                if (!query) return true;
                return (
                    (course.title || '').toLowerCase().includes(query) ||
                    (lesson.title || '').toLowerCase().includes(query) ||
                    (lesson.id || '').toLowerCase().includes(query)
                );
            });
            return { ...course, lessons };
        })
        .filter(course => course.lessons.length > 0);

    if (!courses.length) {
        indexContent.innerHTML = '<p class="index-subtitle">No lessons match your search.</p>';
        return;
    }

    indexContent.innerHTML = courses.map(course => {
        const allLessons = course.lessons;
        const doneCount = allLessons.filter(l => completedSet.has(l.id)).length;
        const totalCount = allLessons.length;
        const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
        const progressText = doneCount > 0 ? `${doneCount} of ${totalCount} completed` : `${totalCount} lessons`;

        const lessonRows = allLessons.map(lesson => {
            const done = completedSet.has(lesson.id);
            return `
                <div class="index-lesson-item ${done ? 'index-lesson-done' : ''}">
                    <div class="index-lesson-meta">
                        ${done ? '<span class="lesson-done-badge">&#10003;</span>' : ''}${lesson.sequence}. ${lesson.title}<br>
                        <small>${lesson.id}</small>
                    </div>
                    <button class="index-open-btn" data-lesson-id="${lesson.id}">${done ? 'Replay' : 'Open'}</button>
                </div>
            `;
        }).join('');

        return `
            <div class="index-course">
                <div class="index-course-title">${course.title}</div>
                <div class="index-course-progress">${progressText}</div>
                <div class="index-course-progress-bar">
                    <div class="index-course-progress-fill" style="width: ${pct}%"></div>
                </div>
                <div class="index-lesson-list">${lessonRows}</div>
            </div>
        `;
    }).join('');

    const buttons = indexContent.querySelectorAll('[data-lesson-id]');
    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const lessonId = btn.getAttribute('data-lesson-id');
            if (!lessonId) return;
            await initializeSession(lessonId);
        });
    });
}

// ─── Session management ────────────────────────────────────────────────────

// #2: Resume session at a previously saved segment (no auto-play)
async function resumeAtSegment(segmentType) {
    try {
        const response = await fetch('/api/session/goto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId, segmentType })
        });
        const data = await response.json();
        if (data.error) {
            debugLog('resume: goto failed - ' + data.error + ', starting from beginning');
            await sendCommand('begin the lesson');
            return;
        }
        currentSegmentType = data.segment;
        document.getElementById('segmentType') && (document.getElementById('segmentType').textContent = data.segment || segmentType);
        if (data.script) {
            document.getElementById('audioScript').textContent = data.script;
        }
        updateSegmentSteps(data.segment);
        updateContextualCommands(data.segment);
        if (data.segment === 'close' && nextLessonBtn) {
            nextLessonBtn.classList.remove('hidden');
        }
        updateStatus(`Resumed from "${data.segment}". Tap Play Audio to replay, or continue to next segment.`);
        debugLog('resume: positioned at ' + data.segment + ' idx=' + data.segmentIdx);
    } catch (err) {
        debugLog('resume error: ' + err.message + ', starting from beginning');
        await sendCommand('begin the lesson');
    }
}

async function initializeSession(overrideLessonId = null) {
    try {
        debugLog('init: start session');
        const savedLessonId = overrideLessonId || localStorage.getItem('currentLessonId');
        const url = savedLessonId ? `/api/session/new?lessonId=${encodeURIComponent(savedLessonId)}` : '/api/session/new';
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            showError(data.error);
            return;
        }

        currentUserId = data.userId;
        currentLessonId = data.lesson.id;
        currentSegmentType = null;
        localStorage.setItem('currentLessonId', currentLessonId);
        document.getElementById('lessonTitle').textContent = data.lesson.title;
        document.getElementById('lessonId').textContent = `ID: ${data.lesson.id} (${data.lesson.sequence})`;

        splashScreen.classList.add('hidden');
        indexWindow.classList.add('hidden');
        errorScreen.classList.add('hidden');
        lessonScreen.classList.remove('hidden');

        if (nextLessonBtn) nextLessonBtn.classList.add('hidden');
        updateStatus('Session started. Ready for commands!');
        updateMicStatus('Ready', '#999');
        updateSegmentSteps(null);
        updateContextualCommands(null);
        debugLog('init: session ready');

        if (isMobile) {
            if (rateRange) rateRange.value = '1.1';
            if (rateValue) rateValue.textContent = '1.10x';
        }

        // #2: Check for saved segment position
        const savedSegment = getSavedSegment(currentLessonId);
        if (savedSegment && savedSegment !== 'orientation') {
            debugLog('init: resuming at saved segment ' + savedSegment);
            await resumeAtSegment(savedSegment);
        } else {
            await sendCommand('begin the lesson');
        }
    } catch (err) {
        debugLog('init error: ' + err.message);
        showError(err.message);
    }
}

if (typeof window !== 'undefined') {
    window.initializeSession = initializeSession;
}

// ─── Command handling ──────────────────────────────────────────────────────

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

        // Update segment tracking
        if (data.segment) {
            currentSegmentType = data.segment;

            // #2: Save segment progress
            if (currentLessonId) {
                saveSegmentProgress(currentLessonId, data.segment);
            }

            // #1: Mark lesson complete when close segment is reached
            if (data.segment === 'close' && currentLessonId) {
                markLessonComplete(currentLessonId);
            }
        }

        // #7: Update step dots
        updateSegmentSteps(data.segment);

        // #5: Update contextual command buttons
        updateContextualCommands(data.segment);

        updateStatus(`${data.message || data.command}`);
        debugLog('command: lesson ' + (data.lessonId || 'unknown') + ' segment ' + (data.segment || 'unknown') + ' idx=' + (data.segmentIdx || 0));

        // #4: Show Next Lesson only at close segment
        if (data.segment === 'close' && nextLessonBtn) {
            nextLessonBtn.classList.remove('hidden');
        } else if (nextLessonBtn) {
            nextLessonBtn.classList.add('hidden');
        }

        if (data.script) {
            document.getElementById('audioScript').textContent = data.script;
            debugLog('command: auto-playing audio for segment ' + data.segment);
            setTimeout(() => { speakText(data.script); }, 100);
        }

    } catch (err) {
        debugLog('command error: ' + err.message);
        updateStatus(`Error: ${err.message}`);
    }
}

// ─── Speech synthesis ──────────────────────────────────────────────────────

function speakText(text) {
    if (!synth) {
        updateStatus('Speech not supported on this browser.');
        debugLog('speech: not supported');
        return;
    }
    if (synth.speaking) {
        synth.cancel();
        debugLog('speech: cancelled previous speech');
    }
    if (!voicesReady) loadVoices();

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.lang = 'en-US';
    const rate = rateRange && rateRange.value ? rateRange.value : '1.0';
    utterance.rate = parseFloat(rate);
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => { debugLog('speech: started'); };
    utterance.onend = () => { debugLog('speech: ended'); };
    utterance.onerror = (e) => { debugLog('speech error: ' + e.error); };

    debugLog('speech: speaking (' + text.substring(0, 50) + '...)');
    synth.speak(utterance);
}

function toggleListening() {
    if (!recognition) {
        updateMicStatus('Voice recognition not supported on this device. Use tap commands to navigate.', '#ff9800');
        debugLog('speech: recognition not supported');
        return;
    }
    if (isListening) {
        continuousMode = false;
        recognition.stop();
        updateMicStatus('Stopped listening', '#999');
        document.getElementById('micBtn').style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        debugLog('speech: stopped continuous mode');
    } else {
        continuousMode = true;
        recognition.start();
        updateMicStatus('Listening continuously...', '#4CAF50');
        debugLog('speech: started continuous mode');
    }
}

async function playAudio() {
    if (!currentUserId) return;
    const text = document.getElementById('audioScript').textContent.trim();
    if (text) {
        updateStatus('Playing audio...');
        speakText(text);
    } else {
        updateStatus('No segment loaded yet. Tap "Begin the lesson".');
    }
}

// ─── Lesson navigation ─────────────────────────────────────────────────────

function endLesson() {
    updateStatus('Exiting lesson...');
    if (synth.speaking) synth.cancel();
    debugLog('exit lesson: returning to splash');
    if (continuousMode && recognition) {
        continuousMode = false;
        recognition.stop();
    }
    lessonScreen.classList.add('hidden');
    indexWindow.classList.add('hidden');
    splashScreen.classList.remove('hidden');
    currentUserId = null;
    updateStatus('Lesson exited. Ready to start a new lesson.');
    debugLog('exit lesson: complete');
}

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
            reloadSessionWithNewLesson(data.next.id);
        } else {
            updateStatus('No more lessons in this course!');
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
            reloadSessionWithNewLesson(data.prev.id);
        } else {
            updateStatus('You are on the first lesson!');
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
        currentSegmentType = null;
        document.getElementById('lessonTitle').textContent = data.lesson.title;
        document.getElementById('lessonId').textContent = `ID: ${data.lesson.id} (${data.lesson.sequence})`;
        document.getElementById('audioScript').textContent = '';

        if (nextLessonBtn) nextLessonBtn.classList.add('hidden');

        updateSegmentSteps(null);
        updateContextualCommands(null);
        updateStatus('Lesson loaded. Tap "Begin the lesson" to start.');
        updateMicStatus('Ready', '#999');
        debugLog('reload: session ready for lesson ' + newLessonId);
        nextLessonBtn.disabled = false;
        prevLessonBtn.disabled = false;

        // #2: Check for saved segment
        const savedSegment = getSavedSegment(currentLessonId);
        if (savedSegment && savedSegment !== 'orientation') {
            await resumeAtSegment(savedSegment);
        } else {
            await sendCommand('begin the lesson');
        }
    } catch (err) {
        debugLog('reload error: ' + err.message);
        updateStatus('Error reloading lesson');
        nextLessonBtn.disabled = false;
        prevLessonBtn.disabled = false;
    }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

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

window.addEventListener('load', () => {
    if (!SpeechRecognition) {
        updateMicStatus('Speech recognition not supported in this browser. Use tap commands below.', '#ff9800');
        micBtn.disabled = true;
    }
});
