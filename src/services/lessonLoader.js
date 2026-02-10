const fs = require('fs');
const path = require('path');

const EXPECTED_SEGMENT_TYPES = ['orientation','reading','context','analysis','themes','question','close'];

async function findLessonFiles(rootDir = path.join(__dirname, '..', '..', 'curriculum')){
  const results = [];
  async function walk(dir){
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for(const e of entries){
      const full = path.join(dir, e.name);
      if(e.isDirectory()) await walk(full);
      else if(e.isFile() && e.name.endsWith('.json') && full.includes(path.sep + 'lessons' + path.sep)) results.push(full);
    }
  }
  await walk(rootDir);
  return results;
}

function basicValidateLesson(obj){
  const errors = [];
  if(!obj || typeof obj !== 'object') { errors.push('Not a JSON object'); return errors; }
  const requiredTop = ['lesson_id','course_id','sequence','title','objective','segments','metadata'];
  for(const k of requiredTop) if(!(k in obj)) errors.push(`Missing top-level property: ${k}`);
  if(obj.sequence !== undefined && typeof obj.sequence !== 'number') errors.push('`sequence` must be a number');
  if(!Array.isArray(obj.segments)) { errors.push('`segments` must be an array'); return errors; }
  // Check segments contain expected types in order
  const types = obj.segments.map(s => s.type);
  for(let i=0;i<EXPECTED_SEGMENT_TYPES.length;i++){
    const expected = EXPECTED_SEGMENT_TYPES[i];
    if(types[i] !== expected) errors.push(`Segment ${i+1} should be '${expected}', found '${types[i] || 'missing'}'`);
  }
  // Check each segment sequence number
  obj.segments.forEach((s, idx)=>{
    if(typeof s.sequence !== 'number') errors.push(`Segment at index ${idx} missing numeric 'sequence'`);
    if(typeof s.audio_script !== 'string') errors.push(`Segment ${idx+1} missing 'audio_script' string`);
    if(s.type === 'question'){
      if(!('correct_answer' in s)) errors.push('Question segment missing `correct_answer`');
      if(!Array.isArray(s.acceptable_variants)) errors.push('Question segment missing `acceptable_variants` array');
    }
  });
  if(!obj.metadata || typeof obj.metadata !== 'object') errors.push('`metadata` must be an object');
  return errors;
}

async function loadAndValidateAll(rootDir){
  const files = await findLessonFiles(rootDir);
  const results = [];
  for(const f of files){
    try{
      const raw = await fs.promises.readFile(f, 'utf8');
      const obj = JSON.parse(raw);
      const errs = basicValidateLesson(obj);
      results.push({file: f, valid: errs.length===0, errors: errs, lesson: obj});
    }catch(err){
      results.push({file: f, valid:false, errors:[String(err)], lesson: null});
    }
  }
  return results;
}

async function loadAllLessons(rootDir){
  const res = await loadAndValidateAll(rootDir);
  const lessons = [];
  const errors = [];
  for(const r of res){
    if(r.valid && r.lesson) lessons.push(r.lesson);
    else errors.push({file: r.file, errors: r.errors});
  }
  return { lessons, errors };
}

function buildIndex(lessons){
  const byId = new Map();
  const byCourse = new Map();
  const duplicates = [];
  // sort by course then sequence
  lessons.sort((a,b)=>{
    if(a.course_id === b.course_id) return a.sequence - b.sequence;
    return a.course_id.localeCompare(b.course_id);
  });
  for(const l of lessons){
    if(byId.has(l.lesson_id)) duplicates.push(l.lesson_id);
    else byId.set(l.lesson_id, l);
    if(!byCourse.has(l.course_id)) byCourse.set(l.course_id, []);
    byCourse.get(l.course_id).push(l);
  }
  return { byId, byCourse, duplicates };
}

function getLessonById(index, lessonId){
  return index.byId.get(lessonId) || null;
}

function getLessonsByCourse(index, courseId){
  return index.byCourse.get(courseId) || [];
}

function getNextLesson(index, currentLessonId){
  const current = index.byId.get(currentLessonId);
  if(!current) return null;
  const arr = index.byCourse.get(current.course_id) || [];
  for(let i=0;i<arr.length-1;i++){
    if(arr[i].lesson_id === currentLessonId) return arr[i+1];
  }
  return null;
}

module.exports = { findLessonFiles, basicValidateLesson, loadAndValidateAll, loadAllLessons, buildIndex, getLessonById, getLessonsByCourse, getNextLesson };
