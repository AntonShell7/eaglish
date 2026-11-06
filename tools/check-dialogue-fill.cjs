const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), ts = require('typescript');
const state = new Map();
global.localStorage = { getItem: key => state.get(key) ?? null, setItem: (key, value) => state.set(key, value), removeItem: key => state.delete(key) };
require.extensions['.ts'] = (module, filename) => {
  if (filename.endsWith('/learningRecords.ts')) { module.exports = { recordLearning() {} }; return; }
  const source = fs.readFileSync(filename, 'utf8').replaceAll('import.meta.env', '({DEV:true})')
    .replace(/from "@\/(.*?)"/g, (_, name) => `from "${path.resolve(__dirname, '../src', name)}"`);
  module._compile(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,filename);
};
const {trackLessons} = require('../src/data/track.ts');
const {dialogueReplyOrder,dialogueReady,dialogueCorrect} = require('../src/lib/dialogueFill.ts');
const session = require('../src/lib/trackSession.ts');
const all = trackLessons().map(entry=>entry.lesson);
const ownTerms = lesson => [...new Set(lesson.steps.filter(s=>s.kind !== 'dialogueFill').flatMap(s=>s.forms?.map(f=>f.short)??s.teaches??[]))];
assert.equal(all.length,136);
assert.deepEqual(all[0].steps.find(s=>s.kind==='dialogueFill').replies,['LMK','NVM'],'Chat practice keeps the abbreviations being studied');
for (const [index, lesson] of all.entries()) {
  const tasks=lesson.steps.filter(s=>s.kind==='dialogueFill');
  assert.equal(tasks.length,1,lesson.id);
  const step=tasks[0], count=index===0?2:3;
  assert.equal(lesson.steps.at(-2).id,step.id,'Practice belongs near the end');
  assert.equal(step.replies.length,count,lesson.id);
  assert.equal(new Set(step.replies).size,count,lesson.id);
  assert.equal(step.lines.length,count*2+1,lesson.id);
  assert.deepEqual(step.teaches.slice(0,2),ownTerms(lesson).slice(0,2));
  if(index) assert(ownTerms(all[index-1]).includes(step.teaches[2]),`Not from previous lesson: ${lesson.id}`);
  const intro=lesson.steps.find(s=>s.kind==='chat');
  const original=new Set(intro?.lines.map(l=>l.text.toLowerCase())??[]);
  for(const [i,line] of step.lines.entries()) {
    assert(line.text && line.glossRu,lesson.id);
    assert(!/[А-Яа-я\u0600-\u06ff]/.test(line.text),`Non-English learning text: ${lesson.id}`);
    if(line.gap!==undefined) {
      assert.equal(i%2,1);const expression = step.replies[line.gap];
      assert(line.text.includes(expression), `Missing expression: ${lesson.id}`);
      assert.notEqual(expression, line.text, `Whole reply hidden: ${lesson.id}`);
      assert.equal(line.text.split(expression).length, 2, `Ambiguous expression: ${lesson.id}`);
      assert(!original.has(line.text.toLowerCase()),`Repeated introductory reply: ${lesson.id}`);
    } else assert.equal(i%2,0);
  }
  const order=dialogueReplyOrder(step);
  assert.deepEqual([...order].sort(),step.replies.map((_,i)=>i));
  assert.notDeepEqual(order,step.replies.map((_,i)=>i));
  assert.deepEqual(order,dialogueReplyOrder(step),'Stable bank after reload');
  assert(!dialogueReady(step,[])); assert(!dialogueReady(step,Array(count).fill(-1)));
  assert(!dialogueReady(step,Array(count).fill(0)));
  assert(dialogueReady(step,order));assert(!dialogueCorrect(step,order));
  assert(dialogueCorrect(step,step.replies.map((_,i)=>i)));
  const selected=step.replies.map((_,i)=>i===1?-1:i);
  const draft={seed:21,stepIds:lesson.steps.map(s=>s.id),index:lesson.steps.length-2,picked:null,typed:'',assembled:selected,joined:[],rooms:{},judged:null,mistakes:0,retryCount:0,pairMistake:false,feedback:null};
  session.saveLessonDraft(lesson,draft);
  assert.deepEqual(session.loadLessonDraft(lesson).assembled,selected,'Partial placements must survive reload');
  assert.equal(session.draftSteps(session.loadLessonDraft(lesson))[draft.index].kind,'dialogueFill');
}
console.log('136 dialogue exercises: 407 gaps, current/previous vocabulary, novel replies, stable shuffled banks, incomplete/duplicate/wrong/correct answers, and partial draft restoration passed.');
