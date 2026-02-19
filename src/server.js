#!/usr/bin/env node
const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const { loadAllLessons } = require('./services/lessonLoader');
const SessionController = require('./controllers/sessionController');

// Silent logger
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

// Initialize lessons on startup
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
    isReady = true; // Still mark as ready to allow server to start
  }
})();

// Start server immediately (don't wait for lessons)
setTimeout(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Bible Course App server running on http://localhost:${PORT}`);
  });
}, 100);

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint (must respond fast)
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', ready: isReady }));
    return;
  }

  // Serve static files
  if (pathname === '/' || pathname === '/index.html') {
    const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
    fs.readFile(htmlPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  if (pathname === '/style.css') {
    const cssPath = path.join(__dirname, '..', 'public', 'style.css');
    fs.readFile(cssPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(data);
    });
    return;
  }

  if (pathname === '/app.js') {
    const jsPath = path.join(__dirname, '..', 'public', 'app.js');
    fs.readFile(jsPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
    return;
  }

  // API endpoints
  if (pathname === '/api/lessons') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ lessons: lessons.slice(0, 5) })); // First 5 lessons
    return;
  }

  if (pathname === '/api/session/new') {
    const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const { lessonId } = query;
    let lesson = null;
    if (lessonId) {
      lesson = lessons.find(l => l.lesson_id === lessonId);
    }
    if (!lesson) {
      lesson = lessons[0] || null;
    }
    
    if (!lesson) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No lessons found' }));
      return;
    }

    const session = new SessionController(lesson, userId, silentLogger);
    sessions.set(userId, session);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      userId,
      lesson: {
        id: lesson.lesson_id,
        title: lesson.title,
        segments: lesson.segments.length,
        course_id: lesson.course_id,
        sequence: lesson.sequence
      }
    }));
    return;
  }

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
    const inCourse = lessons.filter(l => l.course_id === current.course_id).sort((a, b) => a.sequence - b.sequence);
    const idx = inCourse.findIndex(l => l.lesson_id === lessonId);
    const next = idx >= 0 && idx < inCourse.length - 1 ? inCourse[idx + 1] : null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ next: next ? { id: next.lesson_id, title: next.title, sequence: next.sequence } : null }));
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

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: result.status,
          command: result.command,
          state: state.fsmState,
          segment: state.segmentType,
          segmentIdx: state.segmentIdx,
          script: state.audioScript,
          message: result.message || result.state
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

  // Not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});
