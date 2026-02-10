class AudioService {
  constructor(logger = console){
    this.logger = logger;
    this.state = 'stopped'; // stopped, playing, paused
    this.currentSegment = null;
    this.currentTime = 0;
    this.duration = 0;
    this.playbackRate = 1.0;
    this.listeners = {};
  }

  on(event, callback){
    if(!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data){
    if(this.listeners[event]){
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  // estimate duration from audio_script word count (avg 150 words/min = 0.4 s/word)
  estimateDuration(segment){
    const wordCount = segment.word_count || (segment.audio_script || '').split(/\s+/).length;
    return Math.max(2, Math.ceil(wordCount * 0.4)); // minimum 2 seconds
  }

  play(segment){
    if(!segment || !segment.audio_script){
      this.logger.error('Invalid segment for playback');
      this.emit('error', { message: 'Invalid segment' });
      return false;
    }
    
    this.currentSegment = segment;
    this.duration = this.estimateDuration(segment);
    this.currentTime = 0;
    this.state = 'playing';
    this.logger.log(`[Audio] Playing ${segment.type}: "${segment.audio_script.slice(0,40)}..."`);
    this.logger.log(`[Audio] Duration: ~${this.duration}s`);
    this.emit('play', { segment, duration: this.duration });
    
    // simulate playback completion
    this.playbackTimeout = setTimeout(() => {
      if(this.state === 'playing'){
        this.stop();
        this.emit('ended', { segment });
      }
    }, this.duration * 1000 / this.playbackRate);
    
    return true;
  }

  pause(){
    if(this.state !== 'playing'){
      this.logger.warn('[Audio] Not currently playing');
      return false;
    }
    this.state = 'paused';
    clearTimeout(this.playbackTimeout);
    this.logger.log('[Audio] Paused at', this.currentTime + 's');
    this.emit('paused', {});
    return true;
  }

  resume(){
    if(this.state !== 'paused'){
      this.logger.warn('[Audio] Not paused');
      return false;
    }
    this.state = 'playing';
    this.logger.log('[Audio] Resumed from', this.currentTime + 's');
    this.emit('resumed', {});
    
    // resume playback simulation
    const remaining = (this.duration - this.currentTime) * 1000 / this.playbackRate;
    this.playbackTimeout = setTimeout(() => {
      if(this.state === 'playing'){
        this.stop();
        this.emit('ended', { segment: this.currentSegment });
      }
    }, remaining);
    
    return true;
  }

  stop(){
    if(this.state === 'stopped'){
      this.logger.warn('[Audio] Already stopped');
      return false;
    }
    clearTimeout(this.playbackTimeout);
    this.state = 'stopped';
    this.currentTime = 0;
    this.currentSegment = null;
    this.logger.log('[Audio] Stopped');
    this.emit('stopped', {});
    return true;
  }

  setPlaybackRate(rate){
    if(rate < 0.5 || rate > 2.0){
      this.logger.warn('[Audio] Playback rate must be between 0.5 and 2.0');
      return false;
    }
    this.playbackRate = rate;
    this.logger.log('[Audio] Playback rate set to', rate + 'x');
    this.emit('ratechange', { rate });
    return true;
  }

  getStatus(){
    return {
      state: this.state,
      segment: this.currentSegment,
      currentTime: this.currentTime,
      duration: this.duration,
      playbackRate: this.playbackRate
    };
  }
}

module.exports = AudioService;
