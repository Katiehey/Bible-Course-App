const SessionFSM = require('../state-machine/sessionStateMachine');
const VoiceCommandParser = require('../services/voiceCommandParser');
const AudioService = require('../services/audioService');
const ProgressTracker = require('../services/progressTracker');

class SessionController {
  constructor(lesson, userId, logger = console){
    this.logger = logger;
    this.lesson = lesson;
    this.userId = userId;
    this.fsm = new SessionFSM(logger);
    this.fsm.lesson = lesson;
    this.parser = new VoiceCommandParser(logger);
    this.audio = new AudioService(logger);
    this.progress = new ProgressTracker(logger);
    this.progress.setCurrentLesson(userId, lesson.course_id, lesson.lesson_id);
    this.progress.updateSessionState(userId, 'idle');
    
    // wire audio to progress
    this.audio.on('ended', () => {
      if(this.audio.currentSegment){
        this.progress.recordSegmentCompletion(userId, lesson.course_id, lesson.lesson_id, this.fsm.segmentIdx);
      }
    });
  }

  handleCommand(input){
    const parsed = this.parser.parse(input);
    if(!parsed || !parsed.recognized){
      return { status: 'error', message: 'Command not recognized: ' + input };
    }
    
    // route FSM command
    const routed = this.parser.route(parsed, this.fsm);
    if(routed.status === 'error') return routed;
    
    // update progress
    this.progress.updateSessionState(this.userId, this.fsm.current);
    
    return {
      status: 'ok',
      command: routed.command,
      state: this.fsm.current,
      segment: routed.result && routed.result.segment ? routed.result.segment : null,
      segmentIdx: this.fsm.segmentIdx
    };
  }

  playCurrentSegment(){
    const seg = this.lesson.segments[this.fsm.segmentIdx];
    if(!seg) return { status: 'error', message: 'No segment to play' };
    return this.audio.play(seg) ? { status: 'ok' } : { status: 'error' };
  }

  pauseAudio(){
    return this.audio.pause() ? { status: 'ok' } : { status: 'error', message: 'Not playing' };
  }

  resumeAudio(){
    return this.audio.resume() ? { status: 'ok' } : { status: 'error', message: 'Not paused' };
  }

  stopAudio(){
    return this.audio.stop() ? { status: 'ok' } : { status: 'error', message: 'Already stopped' };
  }

  setPlaybackRate(rate){
    return this.audio.setPlaybackRate(rate) ? { status: 'ok' } : { status: 'error', message: 'Invalid rate' };
  }

  getSessionState(){
    const seg = this.lesson.segments[this.fsm.segmentIdx] || {};
    return {
      fsmState: this.fsm.current,
      audioState: this.audio.state,
      segmentIdx: this.fsm.segmentIdx,
      segmentType: seg.type,
      audioScript: seg.audio_script ? seg.audio_script : '',
      lesson: this.lesson,
      session: this.progress.getSession(this.userId)
    };
  }

  getProgress(){
    return this.progress.getCourseStats(this.userId, this.lesson.course_id, this.lesson.segments.length);
  }

  exportData(){
    return this.progress.exportSessionData(this.userId);
  }
}

module.exports = SessionController;
