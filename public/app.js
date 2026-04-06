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
let currentPassageRef = null; // clean reference e.g. "Matthew 3:1-17" — used for Bible lookup

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const debugLog = typeof window !== 'undefined' && window.__debugLog
    ? window.__debugLog
    : () => {};
if (typeof window !== 'undefined') {
    window.__appLoaded = true;
}
debugLog('app.js loaded');

// ─── localStorage helpers ──────────────────────────────────────────────────

function getCompletedLessons() {
    try { return new Set(JSON.parse(localStorage.getItem('completedLessons') || '[]')); }
    catch { return new Set(); }
}

function markLessonComplete(lessonId) {
    const completed = getCompletedLessons();
    completed.add(lessonId);
    localStorage.setItem('completedLessons', JSON.stringify([...completed]));
}

function isLessonComplete(lessonId) { return getCompletedLessons().has(lessonId); }

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

// #6: Resume context — store {id, title, segment} so splash can show it
function saveResumeContext(lessonId, title, segment) {
    try {
        localStorage.setItem('resumeContext', JSON.stringify({ lessonId, title, segment }));
    } catch {}
}

function getResumeContext() {
    try { return JSON.parse(localStorage.getItem('resumeContext') || 'null'); }
    catch { return null; }
}

// ─── UI Elements ───────────────────────────────────────────────────────────

const splashScreen       = document.getElementById('splash');
const lessonScreen       = document.getElementById('lesson');
const errorScreen        = document.getElementById('error');
const startBtn           = document.getElementById('startBtn');
const openIndexBtn       = document.getElementById('openIndexBtn');
const micBtn             = document.getElementById('micBtn');
const playBtn            = document.getElementById('playBtn');
const stopBtn            = document.getElementById('stopBtn');
const exitBtn            = document.getElementById('exitBtn');
const openIndexFromLessonBtn = document.getElementById('openIndexFromLessonBtn');
const sendBtn            = document.getElementById('sendBtn');
const nextLessonBtn      = document.getElementById('nextLessonBtn');
const prevLessonBtn      = document.getElementById('prevLessonBtn');
const commandInput       = document.getElementById('commandInput');
const commandButtons     = document.querySelectorAll('[data-command]');
const voiceSelect        = document.getElementById('voiceSelect');
const rateRange          = document.getElementById('rateRange');
const rateValue          = document.getElementById('rateValue');
const indexWindow        = document.getElementById('indexWindow');
const closeIndexBtn      = document.getElementById('closeIndexBtn');
const indexSearch        = document.getElementById('indexSearch');
const indexContent       = document.getElementById('indexContent');
const passageBadge       = document.getElementById('passageBadge');
const answerFeedback     = document.getElementById('answerFeedback');
const vocabularyPanel    = document.getElementById('vocabularyPanel');
const vocabularyList     = document.getElementById('vocabularyList');
const nextCoursePrompt   = document.getElementById('nextCoursePrompt');
const nextCourseDetail   = document.getElementById('nextCourseDetail');
const startNextCourseBtn = document.getElementById('startNextCourseBtn');
const resumeContext      = document.getElementById('resumeContext');
const resumeDetail       = document.getElementById('resumeDetail');
const lessonObjective    = document.getElementById('lessonObjective');
const answerPrompt       = document.getElementById('answerPrompt');
const bibleHistoryEl     = document.getElementById('bibleHistory');
const pauseBtn           = document.getElementById('pauseBtn');
const replayBtn          = document.getElementById('replayBtn');
const notesBtn           = document.getElementById('notesBtn');
const notesPanel         = document.getElementById('notesPanel');
const notesInput         = document.getElementById('notesInput');
const saveNotesBtn       = document.getElementById('saveNotesBtn');
const clearNotesBtn      = document.getElementById('clearNotesBtn');
const completionScreen   = document.getElementById('completionScreen');
const completionNextBtn  = document.getElementById('completionNextBtn');
const completionIndexBtn = document.getElementById('completionIndexBtn');
const completionHomeBtn  = document.getElementById('completionHomeBtn');
const darkModeToggle     = document.getElementById('darkModeToggle');
const streakDisplay      = document.getElementById('streakDisplay');
const streakCountEl      = document.getElementById('streakCount');

// Bible reader
const biblePanel         = document.getElementById('biblePanel');
const closeBibleBtn      = document.getElementById('closeBibleBtn');
const bibleSearchInput   = document.getElementById('bibleSearchInput');
const bibleSearchBtn     = document.getElementById('bibleSearchBtn');
const bibleResult        = document.getElementById('bibleResult');
const openBibleFromSplashBtn  = document.getElementById('openBibleFromSplashBtn');
const openBibleFromLessonBtn  = document.getElementById('openBibleFromLessonBtn');

let lessonIndexCache = [];
let pendingNextCourse = null;
let bibleHistory = [];
let isPaused = false;
let currentBibleBook = null;
let currentBibleChapter = null;
let isLastLessonInCourse = false;

const SEGMENT_ORDER = ['orientation', 'reading', 'context', 'analysis', 'themes', 'question', 'close'];

// ─── Step indicator ────────────────────────────────────────────────────────

function updateSegmentSteps(segmentType) {
    const steps = document.querySelectorAll('#segmentSteps .step-item');
    const currentIdx = SEGMENT_ORDER.indexOf(segmentType);
    steps.forEach((step) => {
        const seg = step.getAttribute('data-segment');
        const segIdx = SEGMENT_ORDER.indexOf(seg);
        step.classList.remove('step-done', 'step-current');
        if (segIdx < currentIdx) step.classList.add('step-done');
        else if (segIdx === currentIdx) step.classList.add('step-current');
    });
}

// ─── Contextual command buttons ────────────────────────────────────────────

function updateContextualCommands(segmentType) {
    const currentIdx = SEGMENT_ORDER.indexOf(segmentType);
    const nextIdx = currentIdx + 1;
    commandButtons.forEach((btn) => {
        const btnSeg = btn.getAttribute('data-segment');
        const btnIdx = SEGMENT_ORDER.indexOf(btnSeg);
        btn.classList.remove('btn-chip-next', 'btn-chip-done', 'btn-chip-current');
        btn.disabled = false;
        if (segmentType === null) {
            if (btnSeg === 'orientation') btn.classList.add('btn-chip-next');
        } else if (btnIdx < currentIdx) {
            btn.classList.add('btn-chip-done');
        } else if (btnIdx === currentIdx) {
            btn.classList.add('btn-chip-current');
        } else if (btnIdx === nextIdx) {
            btn.classList.add('btn-chip-next');
        }
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
        updateMicStatus(continuousMode ? 'Listening continuously... (click mic to stop)' : 'Listening...', '#4CAF50');
        // #9: pulse animation while listening
        if (micBtn) micBtn.classList.add('mic-listening');
        debugLog('speech: listening');
    };

    recognition.onend = () => {
        isListening = false;
        if (continuousMode) {
            setTimeout(() => {
                if (continuousMode && !isListening) {
                    try { recognition.start(); debugLog('speech: auto-restarting'); }
                    catch (e) { debugLog('speech: restart failed - ' + e.message); }
                }
            }, 100);
        } else {
            updateMicStatus('Ready', '#999');
            if (micBtn) micBtn.classList.remove('mic-listening');
            debugLog('speech: ended');
        }
    };

    recognition.onerror = (event) => {
        if (micBtn) micBtn.classList.remove('mic-listening');
        debugLog('speech error: ' + event.error);

        if (event.error === 'not-allowed') {
            continuousMode = false;
            isListening = false;
            updateMicStatus('Microphone access denied. Please allow microphone access in your browser and try again.', '#e53935');
        } else if (event.error === 'no-speech') {
            updateMicStatus('No speech detected — tap Speak and try again.', '#999');
        } else if (event.error === 'aborted') {
            updateMicStatus('Ready', '#999');
        } else {
            updateMicStatus('Microphone error. Try tapping the command buttons below.', '#e53935');
        }
    };

    recognition.onresult = async (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        updateMicStatus(`You said: "${transcript}"`, '#667eea');
        debugLog('speech result: ' + transcript);
        await sendCommand(transcript.toLowerCase());
    };
}

// ─── Voice / TTS ───────────────────────────────────────────────────────────

function loadVoices() {
    cachedVoices = synth.getVoices();
    if (cachedVoices && cachedVoices.length) { voicesReady = true; populateVoiceSelect(); }
}

if (synth) { loadVoices(); synth.onvoiceschanged = () => { loadVoices(); }; }

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
        if (idx >= 0) { voiceSelect.value = String(idx); selectedVoice = preferred; }
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
    if (el && el.addEventListener) el.addEventListener(event, handler);
}

safeAddListener(startBtn, 'click', initializeSession);
safeAddListener(openIndexBtn, 'click', openIndexWindow);
safeAddListener(micBtn, 'click', toggleListening);
safeAddListener(playBtn, 'click', playAudio);
// Stop audio
safeAddListener(stopBtn, 'click', () => {
    if (synth && (synth.speaking || synth.paused)) {
        synth.cancel();
        isPaused = false;
        if (pauseBtn) pauseBtn.classList.add('hidden');
        updateStatus('Audio stopped.');
    }
});

// Pause / resume
safeAddListener(pauseBtn, 'click', () => {
    if (!synth) return;
    if (isPaused) {
        synth.resume();
        isPaused = false;
        if (pauseBtn) pauseBtn.textContent = 'Pause';
        updateStatus('Resumed.');
    } else {
        synth.pause();
        isPaused = true;
        if (pauseBtn) pauseBtn.textContent = 'Resume';
        updateStatus('Paused.');
    }
});

// Replay current segment
safeAddListener(replayBtn, 'click', () => {
    const text = document.getElementById('audioScript').textContent.trim();
    if (text) { speakText(text); updateStatus('Replaying...'); }
});

// Notes toggle
safeAddListener(notesBtn, 'click', () => {
    if (!notesPanel) return;
    notesPanel.classList.toggle('hidden');
    if (!notesPanel.classList.contains('hidden') && currentLessonId && notesInput) {
        notesInput.value = loadNotes(currentLessonId);
    }
});

// Save / clear notes
safeAddListener(saveNotesBtn, 'click', () => {
    if (currentLessonId && notesInput) {
        saveNotes(currentLessonId, notesInput.value);
        updateStatus('Notes saved.');
    }
});
safeAddListener(clearNotesBtn, 'click', () => {
    if (notesInput) notesInput.value = '';
    if (currentLessonId) saveNotes(currentLessonId, '');
    updateStatus('Notes cleared.');
});

// Dark mode toggle
safeAddListener(darkModeToggle, 'click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    if (darkModeToggle) darkModeToggle.title = isDark ? 'Switch to light mode' : 'Toggle dark mode';
});

// Font size buttons
document.querySelectorAll('.btn-font-size').forEach(btn => {
    btn.addEventListener('click', () => {
        const size = btn.getAttribute('data-size');
        applyFontSize(size);
        localStorage.setItem('fontSize', size);
    });
});

// Completion screen buttons
safeAddListener(completionNextBtn, 'click', () => {
    hideCompletionScreen();
    if (pendingNextCourse && pendingNextCourse.firstLessonId) {
        initializeSession(pendingNextCourse.firstLessonId);
    }
});
safeAddListener(completionIndexBtn, 'click', () => {
    hideCompletionScreen();
    openIndexWindow();
});
safeAddListener(completionHomeBtn, 'click', () => {
    hideCompletionScreen();
    splashScreen.classList.remove('hidden');
    showResumeContext();
});
safeAddListener(exitBtn, 'click', endLesson);
safeAddListener(openIndexFromLessonBtn, 'click', openIndexWindow);
safeAddListener(closeIndexBtn, 'click', closeIndexWindow);
safeAddListener(nextLessonBtn, 'click', loadNextLesson);
safeAddListener(prevLessonBtn, 'click', loadPreviousLesson);
safeAddListener(sendBtn, 'click', sendManualCommand);
safeAddListener(startNextCourseBtn, 'click', () => {
    if (pendingNextCourse && pendingNextCourse.firstLessonId) {
        hideNextCoursePrompt();
        initializeSession(pendingNextCourse.firstLessonId);
    }
});

// ─── Bible reader listeners ────────────────────────────────────────────────
safeAddListener(openBibleFromSplashBtn, 'click', () => openBiblePanel(null));
safeAddListener(openBibleFromLessonBtn, 'click', () => openBiblePanel(currentPassageRef));
safeAddListener(closeBibleBtn, 'click', closeBiblePanel);
safeAddListener(bibleSearchBtn, 'click', () => {
    const ref = bibleSearchInput ? bibleSearchInput.value.trim() : '';
    if (ref) lookUpPassage(ref);
});
safeAddListener(bibleSearchInput, 'keydown', (e) => {
    if (e.key === 'Enter') {
        const ref = bibleSearchInput.value.trim();
        if (ref) lookUpPassage(ref);
    }
    if (e.key === 'Escape') closeBiblePanel();
});
// Passage badge is now a button — tap to open Bible at that passage
safeAddListener(passageBadge, 'click', () => {
    if (currentPassageRef) openBiblePanel(currentPassageRef);
});

// Bible chapter navigation (event delegation on result container)
safeAddListener(bibleResult, 'click', (e) => {
    if (e.target.id === 'bibleChapterPrev') navigateBibleChapter(-1);
    if (e.target.id === 'bibleChapterNext') navigateBibleChapter(1);
    if (e.target.classList.contains('bible-copy-btn')) {
        const text = e.target.getAttribute('data-verse');
        if (text) navigator.clipboard.writeText(text).then(() => {
            e.target.textContent = '✓';
            setTimeout(() => { e.target.textContent = 'Copy'; }, 1500);
        }).catch(() => {});
    }
});

safeAddListener(document.getElementById('resetBtn'), 'click', () => {
    localStorage.removeItem('currentLessonId');
    localStorage.removeItem('completedLessons');
    localStorage.removeItem('segmentProgress');
    localStorage.removeItem('resumeContext');
    localStorage.removeItem('streak');
    localStorage.removeItem('lessonNotes');
    hideResumeContext();
    if (streakDisplay) streakDisplay.classList.add('hidden');
    if (startBtn) startBtn.textContent = 'Begin Learning';
    const progressEl = document.getElementById('splashProgress');
    if (progressEl) progressEl.classList.add('hidden');
    updateStatus('Progress reset. Tap "Begin Learning" to start from lesson 1.');
    debugLog('reset: cleared all progress');
});

commandButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-command');
        if (!cmd) return;
        debugLog('tap: ' + cmd);
        btn.classList.add('btn-chip-loading');
        btn.disabled = true;
        sendCommand(cmd).finally(() => {
            btn.classList.remove('btn-chip-loading');
            btn.disabled = false;
        });
    });
});

safeAddListener(commandInput, 'keydown', (e) => { if (e.key === 'Enter') sendManualCommand(); });
safeAddListener(rateRange, 'input', () => {
    const rate = parseFloat(rateRange.value).toFixed(2);
    if (rateValue) rateValue.textContent = `${rate}x`;
    localStorage.setItem('speechRate', rateRange.value);
});
safeAddListener(voiceSelect, 'change', () => {
    const idx = parseInt(voiceSelect.value, 10);
    selectedVoice = Number.isFinite(idx) ? cachedVoices[idx] : null;
});
safeAddListener(indexSearch, 'input', () => { renderIndexWindow(indexSearch.value || ''); });
safeAddListener(indexSearch, 'keydown', (e) => { if (e.key === 'Escape') closeIndexWindow(); });

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
        if (completionScreen) completionScreen.classList.add('hidden');
        indexWindow.classList.remove('hidden');
        if (indexSearch) indexSearch.value = '';
        renderIndexWindow('');
    } catch (err) { showError(err.message); }
}

function closeIndexWindow() {
    indexWindow.classList.add('hidden');
    if (currentUserId) { lessonScreen.classList.remove('hidden'); return; }
    splashScreen.classList.remove('hidden');
}

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
                    (lesson.id || '').toLowerCase().includes(query) ||
                    (lesson.objective || '').toLowerCase().includes(query) ||
                    (lesson.studyNotes || '').toLowerCase().includes(query)
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

    indexContent.querySelectorAll('[data-lesson-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const lessonId = btn.getAttribute('data-lesson-id');
            if (lessonId) await initializeSession(lessonId);
        });
    });
}

// ─── Session management ────────────────────────────────────────────────────

async function resumeAtSegment(segmentType) {
    try {
        const response = await fetch('/api/session/goto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId, segmentType })
        });
        const data = await response.json();
        if (data.error) {
            debugLog('resume: goto failed - ' + data.error);
            await sendCommand('begin the lesson');
            return;
        }
        currentSegmentType = data.segment;
        if (data.script) document.getElementById('audioScript').textContent = data.script;
        updatePassageBadge(data.passageRef, data.segment);
        updateSegmentSteps(data.segment);
        updateContextualCommands(data.segment);
        if (data.segment === 'close') {
            if (nextLessonBtn) nextLessonBtn.classList.remove('hidden');
            showVocabulary(data.vocabulary);
        }
        showAnswerPrompt(data.segment);
        if (data.script) speakText(data.script);
        updateStatus(`Resumed from "${data.segment}".`);
        debugLog('resume: positioned at ' + data.segment);
    } catch (err) {
        debugLog('resume error: ' + err.message);
        await sendCommand('begin the lesson');
    }
}

async function initializeSession(overrideLessonId = null) {
    try {
        debugLog('init: start session');
        hideNextCoursePrompt();
        hideAnswerFeedback();
        hideVocabulary();
        hideCompletionScreen();
        if (notesPanel) notesPanel.classList.add('hidden');

        const savedLessonId = overrideLessonId || localStorage.getItem('currentLessonId');
        const url = savedLessonId
            ? `/api/session/new?lessonId=${encodeURIComponent(savedLessonId)}`
            : '/api/session/new';
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) { showError(data.error); return; }

        currentUserId = data.userId;
        currentLessonId = data.lesson.id;
        currentSegmentType = null;
        currentPassageRef = null;
        localStorage.setItem('currentLessonId', currentLessonId);

        document.getElementById('lessonTitle').textContent = data.lesson.title;
        const lessonPos = data.lesson.totalInCourse
            ? `Lesson ${data.lesson.sequence} of ${data.lesson.totalInCourse}`
            : `Lesson ${data.lesson.sequence}`;
        const courseLabel = data.lesson.courseTitle ? ` · ${data.lesson.courseTitle}` : '';
        document.getElementById('lessonId').textContent = lessonPos + courseLabel;

        // #10: Show objective
        showObjective(data.lesson.objective);

        splashScreen.classList.add('hidden');
        indexWindow.classList.add('hidden');
        biblePanel.classList.add('hidden');
        errorScreen.classList.add('hidden');
        lessonScreen.classList.remove('hidden');

        if (nextLessonBtn) nextLessonBtn.classList.add('hidden');
        updatePassageBadge(null, null);
        updateStatus('Session started. Ready for commands!');
        updateMicStatus('Ready', '#999');
        updateSegmentSteps(null);
        updateContextualCommands(null);
        debugLog('init: session ready');

        // Apply mobile default only if user hasn't set their own speed preference
        if (isMobile && !localStorage.getItem('speechRate')) {
            if (rateRange) rateRange.value = '1.1';
            if (rateValue) rateValue.textContent = '1.10x';
        }

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

if (typeof window !== 'undefined') window.initializeSession = initializeSession;

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
        debugLog('response: ' + JSON.stringify({ status: data.status, segment: data.segment, answerResult: data.answerResult }));

        if (data.error) { updateStatus(`Error: ${data.error}`); return; }

        // #1: Answer evaluation feedback
        if (data.answerResult) {
            showAnswerFeedback(data.answerResult, data.script);
            speakText(data.script);
            return;
        }

        // Clear answer feedback on navigation commands
        hideAnswerFeedback();

        if (data.segment) {
            currentSegmentType = data.segment;
            if (currentLessonId) {
                saveSegmentProgress(currentLessonId, data.segment);
                // #6: Keep resume context current
                const title = document.getElementById('lessonTitle').textContent;
                saveResumeContext(currentLessonId, title, data.segment);
            }
            if (data.segment === 'close' && currentLessonId) {
                markLessonComplete(currentLessonId);
                recordStreak();
            }
        }

        updateSegmentSteps(data.segment);
        updateContextualCommands(data.segment);
        updateStatus(`${data.message || data.command}`);

        // #8: Passage reference badge
        updatePassageBadge(data.passageRef, data.segment);

        // #2: Show/hide answer prompt
        showAnswerPrompt(data.segment);

        // #4: Next lesson button + cross-course prompt
        if (data.segment === 'close') {
            if (nextLessonBtn) nextLessonBtn.classList.remove('hidden');
            // #5: Vocabulary
            showVocabulary(data.vocabulary);
        } else {
            if (nextLessonBtn) nextLessonBtn.classList.add('hidden');
            hideVocabulary();
        }

        if (data.script) {
            document.getElementById('audioScript').textContent = data.script;
            // #1: Auto-play audio when a new segment loads
            setTimeout(() => { speakText(data.script); }, 100);
        }

    } catch (err) {
        debugLog('command error: ' + err.message);
        updateStatus(`Error: ${err.message}`);
    }
}

// ─── UI helpers for new elements ───────────────────────────────────────────

// #10: Objective
function showObjective(objective) {
    if (!lessonObjective) return;
    if (objective) {
        lessonObjective.textContent = objective;
        lessonObjective.classList.remove('hidden');
    } else {
        lessonObjective.classList.add('hidden');
    }
}

// #8: Passage badge — also stores the clean reference for Bible lookup
function updatePassageBadge(passageRef, segment) {
    if (!passageBadge) return;
    if (passageRef && segment === 'reading') {
        // Strip any "— ESV" / "— NET" suffix from both display and lookup
        const cleanRef = passageRef.split('—')[0].trim();
        passageBadge.textContent = cleanRef + ' · NET ↗';
        passageBadge.classList.remove('hidden');
        currentPassageRef = cleanRef;
    } else {
        passageBadge.classList.add('hidden');
        // Keep currentPassageRef set for the rest of the lesson (not cleared on segment change)
    }
}

// Answer prompt — shown only on question segment
function showAnswerPrompt(segment) {
    if (!answerPrompt) return;
    if (segment === 'question') {
        answerPrompt.classList.remove('hidden');
    } else {
        answerPrompt.classList.add('hidden');
    }
}

// #1: Answer feedback
function showAnswerFeedback(result, script) {
    if (!answerFeedback) return;
    answerFeedback.textContent = result === 'correct' ? '✓ Correct!' : '✗ Not quite — try again.';
    answerFeedback.className = 'answer-feedback ' + (result === 'correct' ? 'answer-correct' : 'answer-incorrect');
    if (script) document.getElementById('audioScript').textContent = script;
}

function hideAnswerFeedback() {
    if (answerFeedback) answerFeedback.className = 'answer-feedback hidden';
}

// #5: Vocabulary panel
function showVocabulary(vocabArray) {
    if (!vocabularyPanel || !vocabularyList) return;
    if (!Array.isArray(vocabArray) || vocabArray.length === 0) { hideVocabulary(); return; }
    vocabularyList.innerHTML = vocabArray.map(item => `
        <div class="vocab-item">
            <span class="vocab-term">${item.term}</span>
            <span class="vocab-def">${item.definition}</span>
        </div>
    `).join('');
    vocabularyPanel.classList.remove('hidden');
}

function hideVocabulary() {
    if (vocabularyPanel) vocabularyPanel.classList.add('hidden');
}

// #4: Cross-course next course prompt
function showNextCoursePrompt(nextCourse) {
    if (!nextCoursePrompt || !nextCourse) return;
    pendingNextCourse = nextCourse;
    nextCourseDetail.textContent = nextCourse.title + (nextCourse.description ? ` — ${nextCourse.description}` : '');
    nextCoursePrompt.classList.remove('hidden');
}

function hideNextCoursePrompt() {
    if (nextCoursePrompt) nextCoursePrompt.classList.add('hidden');
    pendingNextCourse = null;
}

// #6/#7: Resume context + button label + splash progress
function showResumeContext() {
    const ctx = getResumeContext();
    if (ctx && resumeContext && resumeDetail) {
        const segLabel = ctx.segment ? ctx.segment.charAt(0).toUpperCase() + ctx.segment.slice(1) : '';
        resumeDetail.textContent = `${ctx.title} — ${segLabel}`;
        resumeContext.classList.remove('hidden');
    }
    // #7: Change button label if there's saved progress
    if (startBtn) {
        startBtn.textContent = ctx ? 'Continue Learning' : 'Begin Learning';
    }
    // #6: Splash overall progress bar
    updateSplashProgress();
}

function hideResumeContext() {
    if (resumeContext) resumeContext.classList.add('hidden');
}

async function updateSplashProgress() {
    const completed = getCompletedLessons();
    if (completed.size === 0) return;
    try {
        if (!lessonIndexCache.length) {
            const r = await fetch('/api/index');
            const d = await r.json();
            lessonIndexCache = d.courses || [];
        }
        const total = lessonIndexCache.reduce((sum, c) => sum + (c.lessons || []).length, 0);
        if (!total) return;
        const done = completed.size;
        const pct = Math.min(100, Math.round((done / total) * 100));
        const progressEl = document.getElementById('splashProgress');
        const textEl = document.getElementById('splashProgressText');
        const fillEl = document.getElementById('splashProgressFill');
        if (progressEl && textEl && fillEl) {
            textEl.textContent = `${done} of ${total} lessons complete`;
            fillEl.style.width = `${pct}%`;
            progressEl.classList.remove('hidden');
        }
    } catch { /* non-critical */ }
}

// ─── NET Bible reader ──────────────────────────────────────────────────────

let _bibleReturnToLesson = false; // tracks where to return on close

function openBiblePanel(passageRef) {
    _bibleReturnToLesson = !!currentUserId;
    splashScreen.classList.add('hidden');
    lessonScreen.classList.add('hidden');
    indexWindow.classList.add('hidden');
    biblePanel.classList.remove('hidden');

    if (passageRef && bibleSearchInput) {
        bibleSearchInput.value = passageRef;
        lookUpPassage(passageRef);
    } else {
        if (bibleSearchInput) bibleSearchInput.value = '';
        if (bibleResult) bibleResult.innerHTML =
            '<p class="bible-hint">Enter a book, chapter, and verse above — for example, <strong>Matthew 5:1-12</strong> — then tap Look up.</p>';
    }

    if (bibleSearchInput) setTimeout(() => bibleSearchInput.focus(), 100);
    debugLog('bible: panel opened' + (passageRef ? ' for ' + passageRef : ''));
}

function closeBiblePanel() {
    biblePanel.classList.add('hidden');
    if (_bibleReturnToLesson && currentUserId) {
        lessonScreen.classList.remove('hidden');
    } else {
        splashScreen.classList.remove('hidden');
        showResumeContext();
    }
    debugLog('bible: panel closed');
}

async function lookUpPassage(ref) {
    if (!bibleResult) return;
    bibleResult.innerHTML = '<p class="bible-loading">Looking up <em>' + ref + '</em>…</p>';
    debugLog('bible: looking up ' + ref);

    try {
        const response = await fetch('/api/bible?passage=' + encodeURIComponent(ref));
        const data = await response.json();

        if (data.error) {
            bibleResult.innerHTML = `<p class="bible-error">${data.error}</p>`;
            return;
        }

        // #10: Track history (last 5 unique refs)
        bibleHistory = [ref, ...bibleHistory.filter(r => r !== ref)].slice(0, 5);
        renderBibleHistory();

        bibleResult.innerHTML = renderBiblePassage(data);
        debugLog('bible: rendered ' + data.verses.length + ' verses');
    } catch (err) {
        bibleResult.innerHTML =
            '<p class="bible-error">Could not connect. Bible lookup requires an internet connection.</p>';
        debugLog('bible: fetch error - ' + err.message);
    }
}

function renderBibleHistory() {
    if (!bibleHistoryEl || bibleHistory.length === 0) return;
    bibleHistoryEl.classList.remove('hidden');
    bibleHistoryEl.innerHTML = bibleHistory.map(ref =>
        `<button class="bible-history-chip" data-ref="${ref}">${ref}</button>`
    ).join('');
    bibleHistoryEl.querySelectorAll('.bible-history-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            const r = btn.getAttribute('data-ref');
            if (bibleSearchInput) bibleSearchInput.value = r;
            lookUpPassage(r);
        });
    });
}

function renderBiblePassage(data) {
    const { verses } = data;
    if (!Array.isArray(verses) || verses.length === 0) {
        return '<p class="bible-error">No verses found. Try a format like <strong>Matthew 3:1-17</strong> or <strong>Psalm 23</strong>.</p>';
    }

    // Build a human-readable passage header
    const first = verses[0];
    const last = verses[verses.length - 1];
    const sameChapter = first.chapter === last.chapter;
    const ref = verses.length === 1
        ? `${first.bookname} ${first.chapter}:${first.verse}`
        : sameChapter
            ? `${first.bookname} ${first.chapter}:${first.verse}–${last.verse}`
            : `${first.bookname} ${first.chapter}:${first.verse} – ${last.bookname} ${last.chapter}:${last.verse}`;

    // Group verses — insert chapter heading when chapter changes
    let lastChapter = null;
    const verseLines = verses.map(v => {
        let chapterHead = '';
        if (v.chapter !== lastChapter) {
            lastChapter = v.chapter;
            if (verses.some(x => x.chapter !== first.chapter)) {
                // Multi-chapter passage: show chapter heading
                chapterHead = `<div class="bible-chapter-head">Chapter ${v.chapter}</div>`;
            }
        }
        const verseText = `${v.bookname} ${v.chapter}:${v.verse} — ${v.text}`;
        return `${chapterHead}<div class="bible-verse-line">
            <span class="bible-verse-num">${v.verse}</span>
            <span class="bible-verse-text">${v.text}</span>
            <button class="bible-copy-btn" data-verse="${verseText.replace(/"/g, '&quot;')}" title="Copy verse">Copy</button>
        </div>`;
    }).join('');

    // Track for chapter navigation
    currentBibleBook = first.bookname;
    currentBibleChapter = parseInt(first.chapter, 10);

    const prevChap = currentBibleChapter > 1
        ? `<button class="btn-bible-chapter" id="bibleChapterPrev">← Ch ${currentBibleChapter - 1}</button>`
        : '<span></span>';
    const nextChap = `<button class="btn-bible-chapter" id="bibleChapterNext">Ch ${currentBibleChapter + 1} →</button>`;

    return `
        <div class="bible-passage-ref">${ref}</div>
        <div class="bible-verses">${verseLines}</div>
        <div class="bible-chapter-nav">
            ${prevChap}
            ${nextChap}
        </div>
        <div class="bible-attribution">
            NET Bible® &copy;1996–2017 Biblical Studies Press, L.L.C.
            All rights reserved. <a href="http://netbible.com" target="_blank" rel="noopener">netbible.com</a>
        </div>
    `;
}

// ─── Speech synthesis ──────────────────────────────────────────────────────

function speakText(text) {
    if (!synth) { updateStatus('Speech not supported on this browser.'); return; }
    if (synth.speaking) { synth.cancel(); }
    if (!voicesReady) loadVoices();
    isPaused = false;
    if (pauseBtn) { pauseBtn.textContent = 'Pause'; pauseBtn.classList.remove('hidden'); }

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.lang = 'en-US';
    utterance.rate = rateRange && rateRange.value ? parseFloat(rateRange.value) : 1.0;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => { debugLog('speech: started'); };
    utterance.onend = () => {
        debugLog('speech: ended');
        isPaused = false;
        if (pauseBtn) pauseBtn.classList.add('hidden');
    };
    utterance.onerror = (e) => {
        debugLog('speech error: ' + e.error);
        if (pauseBtn) pauseBtn.classList.add('hidden');
    };
    debugLog('speech: speaking (' + text.substring(0, 50) + '...)');
    synth.speak(utterance);
}

function toggleListening() {
    if (!recognition) {
        updateMicStatus('Voice recognition not supported. Use tap commands.', '#ff9800');
        return;
    }
    if (isListening) {
        continuousMode = false;
        recognition.stop();
        updateMicStatus('Stopped listening', '#999');
        if (micBtn) micBtn.classList.remove('mic-listening');
        debugLog('speech: stopped');
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
    if (text) { updateStatus('Playing audio...'); speakText(text); }
    else { updateStatus('No segment loaded yet. Tap "Begin the lesson".'); }
}

// ─── Lesson navigation ─────────────────────────────────────────────────────

function endLesson() {
    updateStatus('Exiting lesson...');
    if (synth && (synth.speaking || synth.paused)) { synth.cancel(); }
    isPaused = false;
    if (pauseBtn) pauseBtn.classList.add('hidden');
    if (continuousMode && recognition) { continuousMode = false; recognition.stop(); }
    if (notesPanel) notesPanel.classList.add('hidden');
    hideCompletionScreen();
    lessonScreen.classList.add('hidden');
    indexWindow.classList.add('hidden');
    splashScreen.classList.remove('hidden');
    showResumeContext();
    currentUserId = null;
    updateStatus('Lesson exited. Ready to start a new lesson.');
    debugLog('exit lesson: complete');
}

async function loadNextLesson() {
    if (!currentLessonId) return;
    try {
        nextLessonBtn.disabled = true;
        prevLessonBtn.disabled = true;
        const response = await fetch(`/api/lesson/next?lessonId=${encodeURIComponent(currentLessonId)}`);
        const data = await response.json();

        if (data.next) {
            localStorage.setItem('currentLessonId', data.next.id);
            hideNextCoursePrompt();
            reloadSessionWithNewLesson(data.next.id);
        } else if (data.nextCourse) {
            const courseTitle = document.getElementById('lessonId').textContent.split('·')[1]?.trim() || 'This Course';
            const done = getCompletedLessons().size;
            showCompletionScreen(courseTitle, data.nextCourse, done);
            nextLessonBtn.disabled = false;
            prevLessonBtn.disabled = false;
        } else {
            const courseTitle = document.getElementById('lessonId').textContent.split('·')[1]?.trim() || 'This Course';
            const done = getCompletedLessons().size;
            showCompletionScreen(courseTitle, null, done);
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
        nextLessonBtn.disabled = true;
        prevLessonBtn.disabled = true;
        const response = await fetch(`/api/lesson/prev?lessonId=${encodeURIComponent(currentLessonId)}`);
        const data = await response.json();
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
        hideNextCoursePrompt();
        hideAnswerFeedback();
        hideVocabulary();
        if (notesPanel) notesPanel.classList.add('hidden');
        const response = await fetch(`/api/session/new?lessonId=${encodeURIComponent(newLessonId)}`);
        const data = await response.json();

        if (data.error) {
            updateStatus('Error loading lesson');
            nextLessonBtn.disabled = false;
            prevLessonBtn.disabled = false;
            return;
        }

        currentUserId = data.userId;
        currentLessonId = data.lesson.id;
        currentSegmentType = null;
        document.getElementById('lessonTitle').textContent = data.lesson.title;
        const rPos = data.lesson.totalInCourse
            ? `Lesson ${data.lesson.sequence} of ${data.lesson.totalInCourse}`
            : `Lesson ${data.lesson.sequence}`;
        const rCourse = data.lesson.courseTitle ? ` · ${data.lesson.courseTitle}` : '';
        document.getElementById('lessonId').textContent = rPos + rCourse;
        document.getElementById('audioScript').textContent = '';

        showObjective(data.lesson.objective);
        updatePassageBadge(null, null);

        if (nextLessonBtn) nextLessonBtn.classList.add('hidden');
        updateSegmentSteps(null);
        updateContextualCommands(null);
        updateStatus('Lesson loaded.');
        updateMicStatus('Ready', '#999');
        nextLessonBtn.disabled = false;
        prevLessonBtn.disabled = false;

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

// ─── Notes ─────────────────────────────────────────────────────────────────

function saveNotes(lessonId, text) {
    try {
        const map = JSON.parse(localStorage.getItem('lessonNotes') || '{}');
        map[lessonId] = text;
        localStorage.setItem('lessonNotes', JSON.stringify(map));
    } catch {}
}

function loadNotes(lessonId) {
    try {
        const map = JSON.parse(localStorage.getItem('lessonNotes') || '{}');
        return map[lessonId] || '';
    } catch { return ''; }
}

// ─── Course completion screen ──────────────────────────────────────────────

function showCompletionScreen(courseTitle, nextCourse, completedCount) {
    if (!completionScreen) return;
    document.getElementById('completionTitle').textContent = courseTitle + ' — Complete!';
    document.getElementById('completionSubtitle').textContent =
        'You have finished all lessons in this course. Well done.';
    document.getElementById('completionStats').innerHTML =
        `<div class="completion-stat">${completedCount} lessons completed</div>`;
    if (nextCourse && completionNextBtn) {
        completionNextBtn.textContent = `Start ${nextCourse.title}`;
        completionNextBtn.classList.remove('hidden');
        pendingNextCourse = nextCourse;
    } else if (completionNextBtn) {
        completionNextBtn.classList.add('hidden');
    }
    splashScreen.classList.add('hidden');
    lessonScreen.classList.add('hidden');
    indexWindow.classList.add('hidden');
    biblePanel.classList.add('hidden');
    completionScreen.classList.remove('hidden');
}

function hideCompletionScreen() {
    if (completionScreen) completionScreen.classList.add('hidden');
}

// ─── Streak ────────────────────────────────────────────────────────────────

function recordStreak() {
    try {
        const today = new Date().toDateString();
        const data = JSON.parse(localStorage.getItem('streak') || '{"date":null,"count":0}');
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (data.date === today) return data.count;
        if (data.date === yesterday) {
            data.count += 1;
        } else if (data.date !== today) {
            data.count = 1;
        }
        data.date = today;
        localStorage.setItem('streak', JSON.stringify(data));
        return data.count;
    } catch { return 0; }
}

function getStreak() {
    try {
        const data = JSON.parse(localStorage.getItem('streak') || '{"date":null,"count":0}');
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (data.date === today || data.date === yesterday) return data.count;
        return 0;
    } catch { return 0; }
}

function updateStreakDisplay() {
    const count = getStreak();
    if (count > 0 && streakDisplay && streakCountEl) {
        streakCountEl.textContent = count;
        streakDisplay.classList.remove('hidden');
    }
}

// ─── Font size ─────────────────────────────────────────────────────────────

function applyFontSize(size) {
    document.body.classList.remove('font-sm', 'font-md', 'font-lg');
    document.body.classList.add('font-' + size);
    document.querySelectorAll('.btn-font-size').forEach(b => {
        b.classList.toggle('btn-font-size-active', b.getAttribute('data-size') === size);
    });
}

// ─── Dark mode ─────────────────────────────────────────────────────────────

function applyDarkMode(on) {
    document.body.classList.toggle('dark-mode', on);
    if (darkModeToggle) darkModeToggle.title = on ? 'Switch to light mode' : 'Toggle dark mode';
}

// ─── Bible chapter navigation ──────────────────────────────────────────────

function parseBibleRef(ref) {
    // e.g. "Matthew 3:1-17" → { book: 'Matthew', chapter: 3 }
    const m = ref.match(/^(.+?)\s+(\d+)/);
    if (!m) return null;
    return { book: m[1], chapter: parseInt(m[2], 10) };
}

function navigateBibleChapter(delta) {
    if (!currentBibleBook || !currentBibleChapter) return;
    const nextChapter = currentBibleChapter + delta;
    if (nextChapter < 1) return;
    const ref = `${currentBibleBook} ${nextChapter}`;
    if (bibleSearchInput) bibleSearchInput.value = ref;
    lookUpPassage(ref);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function updateStatus(message) { document.getElementById('status').textContent = message; }

function updateMicStatus(message, color = '#999') {
    const el = document.getElementById('micStatus');
    el.textContent = message;
    el.style.color = color;
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

// ─── Init ──────────────────────────────────────────────────────────────────

window.addEventListener('load', () => {
    if (!SpeechRecognition) {
        updateMicStatus('Speech recognition not supported. Use tap commands below.', '#ff9800');
        if (micBtn) micBtn.disabled = true;
    }

    // Dark mode
    applyDarkMode(localStorage.getItem('darkMode') === 'true');

    // Font size
    const savedSize = localStorage.getItem('fontSize') || 'md';
    applyFontSize(savedSize);

    // Speed persistence
    const savedRate = localStorage.getItem('speechRate');
    if (savedRate && rateRange && rateValue) {
        rateRange.value = savedRate;
        rateValue.textContent = `${parseFloat(savedRate).toFixed(2)}x`;
    }

    // Streak display on splash
    updateStreakDisplay();

    showResumeContext();
});
