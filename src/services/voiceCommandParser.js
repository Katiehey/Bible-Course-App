class VoiceCommandParser {
  constructor(logger = console){
    this.logger = logger;
    // Lesson-specific commands that map to the 7 segments
    this.validCommands = [
      'begin the lesson',      // orientation
      'read the passage',      // reading
      'explain the context',   // context
      'analyze the structure', // analysis
      'summarize the key themes', // themes
      'ask the review question', // question
      'end the lesson'         // close
    ];
    // Map lesson commands to FSM navigation
    this.commandMap = {
      'begin the lesson': 'start',
      'read the passage': 'next',
      'explain the context': 'next',
      'analyze the structure': 'next',
      'summarize the key themes': 'next',
      'ask the review question': 'next',
      'end the lesson': 'stop'
    };
  }

  parse(input){
    if(!input || typeof input !== 'string') return null;
    const normalized = input.toLowerCase().trim();
    if(!normalized) return null;
    
    // Check exact match
    for(const cmd of this.validCommands){
      if(normalized === cmd) return { command: cmd, recognized: true };
    }
    
    // Check if contains a lesson command
    for(const cmd of this.validCommands){
      if(normalized.includes(cmd)) return { command: cmd, recognized: true };
    }
    
    return { input: normalized, recognized: false };
  }

  route(parsedCommand, fsm){
    if(!parsedCommand || !parsedCommand.recognized) return { status: 'error', message: 'Command not recognized' };
    
    const lessonCmd = parsedCommand.command;
    const fsmCmd = this.commandMap[lessonCmd];
    
    try{
      let result;
      if(fsmCmd === 'start') result = fsm.start(fsm.lesson);
      else if(fsmCmd === 'next') result = fsm.next();
      else if(fsmCmd === 'stop') result = fsm.goto('finished');
      
      return { status: 'ok', command: lessonCmd, result };
    }catch(err){
      return { status: 'error', message: String(err) };
    }
  }
}

module.exports = VoiceCommandParser;
