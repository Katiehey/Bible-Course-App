const path = require('path');

// Lightweight in-memory progress tracking (no database dependency for initial version)
// Can be replaced with SQLite later using better-sqlite3 or sqlite3 package

class ProgressTracker {
  constructor(logger = console){
    this.logger = logger;
    this.sessions = new Map(); // userId -> session data
    this.progress = new Map(); // userId -> { courseId -> { lessonId -> progress } }
  }

  // Initialize or load user session
  getOrCreateSession(userId){
    if(!this.sessions.has(userId)){
      this.sessions.set(userId, {
        userId,
        createdAt: new Date(),
        currentLesson: null,
        currentState: 'idle',
        currentSegmentIdx: 0,
        lastActivity: new Date()
      });
    }
    return this.sessions.get(userId);
  }

  // Update session state
  updateSessionState(userId, state){
    const session = this.getOrCreateSession(userId);
    session.currentState = state;
    session.lastActivity = new Date();
    this.logger.log(`[Progress] User ${userId} → state: ${state}`);
    return session;
  }

  // Set current lesson
  setCurrentLesson(userId, courseId, lessonId, segmentIdx = 0){
    const session = this.getOrCreateSession(userId);
    session.currentLesson = { courseId, lessonId, segmentIdx };
    session.lastActivity = new Date();
    this.logger.log(`[Progress] User ${userId} → lesson: ${lessonId}`);
    return session;
  }

  // Record segment completion
  recordSegmentCompletion(userId, courseId, lessonId, segmentIdx){
    if(!this.progress.has(userId)){
      this.progress.set(userId, {});
    }
    const userProgress = this.progress.get(userId);
    if(!userProgress[courseId]){
      userProgress[courseId] = {};
    }
    if(!userProgress[courseId][lessonId]){
      userProgress[courseId][lessonId] = { completedSegments: [], completed: false };
    }
    const lessonProg = userProgress[courseId][lessonId];
    if(!lessonProg.completedSegments.includes(segmentIdx)){
      lessonProg.completedSegments.push(segmentIdx);
      lessonProg.completedSegments.sort((a, b) => a - b);
    }
    this.logger.log(`[Progress] User ${userId} completed ${lessonId} segment ${segmentIdx}`);
    return lessonProg;
  }

  // Mark lesson complete
  completeLesson(userId, courseId, lessonId){
    const lessonProg = this.recordSegmentCompletion(userId, courseId, lessonId, 0);
    lessonProg.completed = true;
    lessonProg.completedAt = new Date();
    this.logger.log(`[Progress] User ${userId} completed ${lessonId}`);
    return lessonProg;
  }

  // Get session
  getSession(userId){
    return this.sessions.get(userId) || null;
  }

  // Get progress
  getProgress(userId, courseId = null){
    const userProg = this.progress.get(userId);
    if(!userProg) return {};
    if(courseId) return userProg[courseId] || {};
    return userProg;
  }

  // Get course progress stats
  getCourseStats(userId, courseId, totalLessons){
    const courseProg = this.getProgress(userId, courseId);
    const completed = Object.values(courseProg).filter(l => l.completed).length;
    const inProgress = Object.keys(courseProg).length - completed;
    return {
      courseId,
      totalLessons,
      completed,
      inProgress,
      percentComplete: Math.round((completed / totalLessons) * 100)
    };
  }

  // Get all sessions (for debugging)
  getAllSessions(){
    return Array.from(this.sessions.values());
  }

  // Export session data as JSON
  exportSessionData(userId){
    const session = this.getSession(userId);
    const progress = this.getProgress(userId);
    return {
      session,
      progress,
      exportedAt: new Date()
    };
  }
}

module.exports = ProgressTracker;
