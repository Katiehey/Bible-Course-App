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
    const resolvedAudioScript = this.resolveAudioScript(seg);
    return {
      fsmState: this.fsm.current,
      audioState: this.audio.state,
      segmentIdx: this.fsm.segmentIdx,
      segmentType: seg.type,
      audioScript: resolvedAudioScript,
      lesson: this.lesson,
      session: this.progress.getSession(this.userId)
    };
  }

  resolveAudioScript(seg){
    if(!seg || !seg.audio_script) return '';
    if(this.lesson && this.lesson.course_id === 'hermeneutics_i'){
      return this.buildHermeneuticsSegmentScript(seg, seg.audio_script);
    }
    return seg.audio_script;
  }

  buildHermeneuticsSegmentScript(seg, fallback){
    const passages = this.getRequiredPassages();
    const references = this.getReferenceList(passages);
    const lessonTitle = this.lesson && this.lesson.title ? this.lesson.title : 'this lesson';
    const objective = this.lesson && this.lesson.objective ? this.lesson.objective : '';
    const referenceText = references.length ? references.join(' and ') : 'the assigned passage';
    const firstSnippet = this.getPassageSnippet(passages[0]);

    switch(seg.type){
      case 'orientation':
        return `Welcome to ${lessonTitle}. Today we work in ${referenceText}. ${objective} We will move from observation to context, then analysis and synthesis grounded in the text.`;
      case 'context':
        return this.buildHermeneuticsContextScript(fallback);
      case 'analysis':
        return `Structure analysis for ${referenceText}: start with the main claim, trace supporting lines, and mark transitions that connect each sentence. Text focus: ${firstSnippet} From that structure, explain why the author's flow supports the intended meaning.`;
      case 'themes':
        return `Key themes in ${referenceText}: identify the central theological idea, the practical implication for the original audience, and repeated terms that reinforce the author's purpose. Keep every theme tied to explicit wording in the passage.`;
      case 'question':
        return `Review question for ${referenceText}: What is the author's main intention in this text, and which sentence connections best support your conclusion? Answer from the passage wording, not from assumptions.`;
      case 'close':
        return `You completed ${lessonTitle} in ${referenceText}. Keep this method: read closely, explain author intention in context, analyze structure, then state themes with textual evidence.`;
      default:
        return fallback;
    }
  }

  getRequiredPassages(){
    return Array.isArray(this.lesson && this.lesson.required_passages)
      ? this.lesson.required_passages
      : [];
  }

  getReferenceList(passages){
    return passages
      .map((passage) => passage && typeof passage.reference === 'string' ? passage.reference : '')
      .filter(Boolean);
  }

  getPassageSnippet(passage){
    if(!passage || typeof passage.text !== 'string') return 'read the passage carefully and trace its internal flow.';
    const words = passage.text.split(/\s+/).filter(Boolean).slice(0, 24);
    const snippet = words.join(' ').trim();
    return snippet ? `${snippet}${words.length >= 24 ? '...' : ''}` : 'read the passage carefully and trace its internal flow.';
  }

  buildHermeneuticsContextScript(fallback){
    const passages = this.getRequiredPassages();
    if(!passages.length) return fallback;

    const contextByBook = {
      'mark': 'Mark writes to present Jesus with urgency and authority, strengthening believers facing pressure by showing who Jesus is and what discipleship costs.',
      'philippians': 'Paul writes from imprisonment to encourage a church he loves, calling them to joy, unity, and steady obedience in Christ.',
      'jeremiah': 'Jeremiah addresses God\'s covenant people in crisis, applying covenant faithfulness to the realities of exile and false hope.',
      'psalm': 'The psalmist uses wisdom poetry to shape the reader\'s imagination and allegiance through contrast, imagery, and meditation on God\'s instruction.',
      'psalms': 'The psalmist uses wisdom poetry to shape the reader\'s imagination and allegiance through contrast, imagery, and meditation on God\'s instruction.',
      'hosea': 'Hosea speaks to a covenant-breaking people, exposing unfaithfulness while revealing God\'s persistent covenant love.',
      'matthew': 'Matthew presents Jesus as the fulfillment of Scripture, showing continuity between Israel\'s story and the Messiah\'s mission.',
      '1 corinthians': 'Paul corrects a divided church, applying the gospel to real ethical and communal problems with pastoral clarity.',
      'luke': 'Luke provides an orderly account to give certainty, highlighting God\'s saving purposes in history and the inclusive scope of the gospel.',
      'deuteronomy': 'Moses renews covenant instruction for Israel before entering the land, pressing wholehearted covenant loyalty in daily life.',
      'micah': 'Micah brings covenant lawsuit language to expose injustice and call God\'s people to faithful covenant response.',
      'ephesians': 'Paul explains identity in Christ and then applies it to a unified, holy life shaped by grace.',
      'john': 'John selects signs and discourses so readers may believe Jesus is the Christ and have life in His name.',
      'romans': 'Paul explains the gospel\'s saving righteousness and its implications for faith, community, and transformed living.',
      'hebrews': 'The writer exhorts wavering believers to persevere by showing Christ\'s final and superior priestly work.',
      'acts': 'Luke narrates the Spirit-empowered witness of the early church, showing how the gospel advances through tested proclamation.',
      'proverbs': 'Proverbs trains readers in covenant wisdom by giving concise principles for discernment and faithful judgment.',
      '2 timothy': 'Paul\'s final charge to Timothy emphasizes Scripture\'s authority for endurance, ministry, and faithful teaching under pressure.'
    };

    const parts = passages.map((passage) => {
      const reference = typeof passage.reference === 'string' ? passage.reference : 'this passage';
      const book = this.extractBookFromReference(reference);
      const key = (book || '').toLowerCase();
      const bookContext = contextByBook[key] || 'The author writes to a concrete audience in a specific covenant and historical setting that controls meaning.';
      return `${reference}: ${bookContext}`;
    });

    return `Context for this text: ${parts.join(' ')} For this command, focus on author intention in the specific passage, original audience situation, and how that context governs interpretation.`;
  }

  extractBookFromReference(reference){
    if(typeof reference !== 'string') return '';
    return reference.replace(/\s+\d.*$/, '').trim();
  }

  getProgress(){
    return this.progress.getCourseStats(this.userId, this.lesson.course_id, this.lesson.segments.length);
  }

  exportData(){
    return this.progress.exportSessionData(this.userId);
  }
}

module.exports = SessionController;
