class SessionFSM {
  constructor(logger = console){
    this.logger = logger;
    this.states = ['idle','orientation','reading','context','analysis','themes','question','close','paused','finished'];
    this.current = 'idle';
    this.lesson = null;
  }

  start(lesson){
    if(!lesson) throw new Error('lesson required');
    this.lesson = lesson;
    this.current = 'orientation';
    this.segmentIdx = 0;
    this.logger.log('Session started for', lesson.lesson_id);
    return this.current;
  }

  next(){
    if(this.current === 'idle' || this.current === 'finished') return null;
    if(this.current === 'paused') { this.current = 'orientation'; return this.current; }
    if(!this.lesson || !Array.isArray(this.lesson.segments)) { this.current = 'finished'; return 'finished'; }
    const len = this.lesson.segments.length;
    const nextIdx = (this.segmentIdx || 0) + 1;
    if(nextIdx >= len){
      this.current = 'finished';
      this.logger.log('Reached end of lesson, finishing session.');
      return 'finished';
    }
    this.segmentIdx = nextIdx;
    const seg = this.lesson.segments[this.segmentIdx];
    this.current = seg.type || this.current;
    this.logger.log('Transition ->', this.current, 'segmentIdx=', this.segmentIdx);
    return { state: this.current, segment: seg };
  }

  prev(){
    if(!this.lesson) return null;
    this.segmentIdx = Math.max((this.segmentIdx||0) - 1, 0);
    const seg = this.lesson.segments[this.segmentIdx];
    this.current = seg.type;
    this.logger.log('Transition <-', this.current, 'segmentIdx=', this.segmentIdx);
    return { state: this.current, segment: seg };
  }

  goto(state){
    if(!this.states.includes(state)) throw new Error('Invalid state: '+state);
    this.current = state;
    this.logger.log('Goto', state);
    return this.current;
  }

  handleCommand(cmd){
    // basic command mapping
    const c = (cmd||'').toLowerCase().trim();
    if(c === 'start' || c === 'begin') return this.start(this.lesson);
    if(c === 'next' || c === 'continue') return this.next();
    if(c === 'previous' || c === 'back') return this.prev();
    if(c === 'pause') { this.current = 'paused'; return this.current; }
    if(c === 'stop' || c === 'end') { this.current = 'finished'; return this.current; }
    return null;
  }
}

module.exports = SessionFSM;
