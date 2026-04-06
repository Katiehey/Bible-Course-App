#!/usr/bin/env node
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const url = require('url');
const { loadAllLessons } = require('./services/lessonLoader');
const SessionController = require('./controllers/sessionController');

const silentLogger = {
  log: () => {},
  error: console.error,
  warn: () => {},
  info: () => {},
  debug: () => {}
};

const PORT = process.env.PORT || 3000;
let lessons = [];
const sessions = new Map();
let isReady = false;

// ─── Course metadata (course.json for each course) ─────────────────────────
const courseMeta = new Map(); // course_id -> course.json data

function loadCourseMeta() {
  const coursesDir = path.join(process.cwd(), 'curriculum', 'courses');
  try {
    const dirs = fs.readdirSync(coursesDir);
    for (const dir of dirs) {
      const p = path.join(coursesDir, dir, 'course.json');
      if (fs.existsSync(p)) {
        try {
          const data = JSON.parse(fs.readFileSync(p, 'utf8'));
          if (data.course_id) courseMeta.set(data.course_id, data);
        } catch (e) {
          console.error(`Could not parse ${p}:`, e.message);
        }
      }
    }
    console.log(`✓ Loaded metadata for ${courseMeta.size} courses`);
  } catch (e) {
    console.error('Could not load course metadata:', e.message);
  }
}

// ─── Study path ─────────────────────────────────────────────────────────────
let studyPathOrder = []; // Array of course_id strings in sequence

function loadStudyPath() {
  try {
    const p = path.join(process.cwd(), 'curriculum', 'study-path.json');
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      studyPathOrder = (data.primary_path || [])
        .sort((a, b) => a.order - b.order)
        .map(entry => entry.course_id);
      console.log(`✓ Study path loaded (${studyPathOrder.length} courses)`);
    }
  } catch (e) {
    console.error('Could not load study path:', e.message);
  }
}

// Load at startup
loadCourseMeta();
loadStudyPath();

// ─── Lesson loading ─────────────────────────────────────────────────────────
(async () => {
  try {
    const root = path.join(process.cwd(), 'curriculum');
    console.log(`Loading lessons from: ${root}`);
    const result = await loadAllLessons(root);
    lessons = result.lessons;
    console.log(`✓ Successfully loaded ${lessons.length} lessons`);
    isReady = true;
  } catch (err) {
    console.error('⚠ Failed to load lessons:', err.message);
    isReady = true;
  }
})();

setTimeout(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Bible Course App server running on http://localhost:${PORT}`);
  });
}, 100);

// ─── Helper: sort courses by study path ─────────────────────────────────────
function sortedCourseOrder(courseIds) {
  return courseIds.sort((a, b) => {
    const ai = studyPathOrder.indexOf(a);
    const bi = studyPathOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

// ─── Server ─────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', ready: isReady }));
    return;
  }

  // ─── Static files ──────────────────────────────────────────────────────────

  if (pathname === '/' || pathname === '/index.html') {
    const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
    fs.readFile(htmlPath, 'utf8', (err, data) => {
      if (err) { res.writeHead(404); res.end('Not Found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  if (pathname === '/style.css') {
    const cssPath = path.join(__dirname, '..', 'public', 'style.css');
    fs.readFile(cssPath, 'utf8', (err, data) => {
      if (err) { res.writeHead(404); res.end('Not Found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(data);
    });
    return;
  }

  if (pathname === '/app.js') {
    const jsPath = path.join(__dirname, '..', 'public', 'app.js');
    fs.readFile(jsPath, 'utf8', (err, data) => {
      if (err) { res.writeHead(404); res.end('Not Found'); return; }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
    return;
  }

  // ─── API ───────────────────────────────────────────────────────────────────

  if (pathname === '/api/lessons') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ lessons: lessons.slice(0, 5) }));
    return;
  }

  // #2 + #3: Proper course titles from course.json, sorted by study path
  if (pathname === '/api/index') {
    const grouped = lessons.reduce((acc, lesson) => {
      const key = lesson.course_id || 'unknown_course';
      if (!acc.has(key)) {
        // Use title from course.json if available
        const meta = courseMeta.get(key);
        const title = meta ? meta.title : key.replace(/_/g, ' ').replace(/-/g, ' ');
        acc.set(key, { id: key, title, lessons: [] });
      }
      acc.get(key).lessons.push({
        id: lesson.lesson_id,
        title: lesson.title,
        sequence: lesson.sequence || 0,
        objective: lesson.objective || '',
        studyNotes: lesson.study_notes || ''
      });
      return acc;
    }, new Map());

    const courseIds = sortedCourseOrder([...grouped.keys()]);
    const courses = courseIds
      .map(id => grouped.get(id))
      .filter(Boolean)
      .map(course => ({
        ...course,
        lessons: course.lessons.sort((a, b) => a.sequence - b.sequence)
      }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ courses }));
    return;
  }

  // #10: Include objective in session/new response
  if (pathname === '/api/session/new') {
    const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
    const { lessonId } = query;
    let lesson = null;
    if (lessonId) lesson = lessons.find(l => l.lesson_id === lessonId);
    if (!lesson) lesson = lessons[0] || null;

    if (!lesson) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No lessons found' }));
      return;
    }

    const session = new SessionController(lesson, userId, silentLogger);
    sessions.set(userId, session);

    const meta = courseMeta.get(lesson.course_id);
    const courseTitle = meta ? meta.title : null;
    const totalInCourse = meta ? meta.total_lessons : null;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      userId,
      lesson: {
        id: lesson.lesson_id,
        title: lesson.title,
        objective: lesson.objective || null,
        segments: lesson.segments.length,
        course_id: lesson.course_id,
        sequence: lesson.sequence,
        courseTitle,
        totalInCourse
      }
    }));
    return;
  }

  // #4: Cross-course Next Lesson — returns nextCourse when at end of course
  if (pathname === '/api/lesson/next') {
    const { lessonId } = query;
    if (!lessonId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'lessonId required' }));
      return;
    }
    const current = lessons.find(l => l.lesson_id === lessonId);
    if (!current) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Lesson not found' }));
      return;
    }
    const inCourse = lessons
      .filter(l => l.course_id === current.course_id)
      .sort((a, b) => a.sequence - b.sequence);
    const idx = inCourse.findIndex(l => l.lesson_id === lessonId);
    const next = idx >= 0 && idx < inCourse.length - 1 ? inCourse[idx + 1] : null;

    if (next) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ next: { id: next.lesson_id, title: next.title, sequence: next.sequence } }));
      return;
    }

    // At end of course — check course.json for next_course
    let nextCourse = null;
    const meta = courseMeta.get(current.course_id);
    if (meta && meta.next_course && meta.next_course.course_id) {
      const nextCourseId = meta.next_course.course_id;
      const nextCourseLessons = lessons
        .filter(l => l.course_id === nextCourseId)
        .sort((a, b) => a.sequence - b.sequence);
      const firstLesson = nextCourseLessons[0] || null;
      const nextCourseMeta = courseMeta.get(nextCourseId);
      nextCourse = {
        id: nextCourseId,
        title: nextCourseMeta ? nextCourseMeta.title : meta.next_course.title,
        description: meta.next_course.description || null,
        firstLessonId: firstLesson ? firstLesson.lesson_id : null,
        firstLessonTitle: firstLesson ? firstLesson.title : null
      };
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ next: null, nextCourse }));
    return;
  }

  if (pathname === '/api/lesson/prev') {
    const { lessonId } = query;
    if (!lessonId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'lessonId required' }));
      return;
    }
    const current = lessons.find(l => l.lesson_id === lessonId);
    if (!current) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Lesson not found' }));
      return;
    }
    const inCourse = lessons
      .filter(l => l.course_id === current.course_id)
      .sort((a, b) => a.sequence - b.sequence);
    const idx = inCourse.findIndex(l => l.lesson_id === lessonId);
    const prev = idx > 0 ? inCourse[idx - 1] : null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      prev: prev ? { id: prev.lesson_id, title: prev.title, sequence: prev.sequence } : null
    }));
    return;
  }

  if (pathname === '/api/session/command') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { userId, command } = data;
        const session = sessions.get(userId);

        if (!session) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Session not found' }));
          return;
        }

        const result = session.handleCommand(command);
        const state = session.getSessionState();

        // For answer evaluation, use result.script; otherwise use state.audioScript
        const script = result.script !== undefined ? result.script : state.audioScript;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: result.status,
          command: result.command,
          state: state.fsmState,
          segment: state.segmentType,
          segmentIdx: state.segmentIdx,
          lessonId: state.lesson ? state.lesson.lesson_id : 'unknown',
          script,
          message: result.message || result.state,
          // #1: Answer evaluation result
          answerResult: result.answerResult || null,
          // #8: Passage reference badge
          passageRef: state.passageRef || null,
          // #5: Vocabulary (present on close segment)
          vocabulary: state.vocabulary || null,
          // #10: Lesson objective
          objective: state.objective || null
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/session/goto') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { userId, segmentType } = data;
        const session = sessions.get(userId);
        if (!session) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Session not found' }));
          return;
        }
        session.fsm.gotoSegment(segmentType);
        const state = session.getSessionState();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          state: state.fsmState,
          segment: state.segmentType,
          segmentIdx: state.segmentIdx,
          lessonId: state.lesson ? state.lesson.lesson_id : 'unknown',
          script: state.audioScript,
          passageRef: state.passageRef || null,
          vocabulary: state.vocabulary || null,
          objective: state.objective || null
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/session/audio') {
    const { userId } = query;
    const session = sessions.get(userId);
    if (!session) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session not found' }));
      return;
    }
    const result = session.playCurrentSegment();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: result.status }));
    return;
  }

  // ─── NET Bible lookup (proxies to labs.bible.org free API) ───────────────
  if (pathname === '/api/bible') {
    const { passage } = query;
    if (!passage) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'passage parameter required. Example: ?passage=Matthew+3:1-17' }));
      return;
    }

    const apiUrl = `https://labs.bible.org/api/?passage=${encodeURIComponent(passage)}&type=json`;

    https.get(apiUrl, (apiRes) => {
      let raw = '';
      apiRes.on('data', chunk => raw += chunk);
      apiRes.on('end', () => {
        try {
          const verses = JSON.parse(raw);
          if (!Array.isArray(verses) || verses.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Passage not found. Check the reference format (e.g. Matthew 3:1-17).' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            translation: 'NET',
            translationFull: 'New English Translation',
            passage,
            verses
          }));
        } catch (e) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Could not read Bible API response.' }));
        }
      });
    }).on('error', () => {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Bible lookup requires an internet connection. Please check your connection and try again.' }));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});
