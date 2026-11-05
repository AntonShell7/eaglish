// Run with node tools/check-slang.cjs. Validate the curriculum and legacy progress.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  if(filename.endsWith('/learningRecords.ts')) {module.exports={recordLearning:()=>{}};return;}
  let source = fs.readFileSync(filename, 'utf8');
  source = source.replace(/from "@\/(.*?)"/g, (_, file) => `from "${path.resolve(__dirname, '../src', file)}"`);
  module._compile(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: filename,
  }).outputText, filename);
};
const { trackLessons, trackModules, findLesson } = require('../src/data/track.ts');
const { trackModules: oldModules } = require('../src/data/trackContent.ts');
const { newExpressions } = require('../src/data/trackNewContent.ts');
const { sameWordBank } = require('../src/lib/assembly.ts');
const lessons = trackLessons();
assert.equal(lessons.flatMap(l => l.lesson.steps).filter(s => s.kind === 'register').length, 12);
const introduced = new Set();
const ids = new Set();
const stepIds = new Set();
for (const module of trackModules) {
  assert.deepEqual(module.lessons.map(l => l.kind), ['chat', 'idiom', 'speech', 'review']);
  assert.equal(module.sourceLessons.length, 3);
  for (const spec of module.sourceLessons) {
    assert.equal(spec.expressions.length, 2, spec.id);
    for (const expression of spec.expressions) {
      assert(expression.noteRu && expression.gapRu && expression.translationEn.length, expression.short);
      assert(!expression.gapRu.includes('undefined'), expression.short);
    }
  }
  for (const lesson of module.lessons) {
    assert(!ids.has(lesson.id), `Duplicate lesson: ${lesson.id}`); ids.add(lesson.id);
    const forms = lesson.steps.find(step => step.kind === 'rule')?.forms ?? [];
    if (!lesson.review) {
      assert.equal(forms.length, 2, lesson.id);
      assert(forms.every(form => form.usageRu?.startsWith('Где:')), lesson.id);
      assert.equal(lesson.steps[0].kind, 'rule');
      assert.equal(lesson.steps[1].kind, 'chat');
      assert.deepEqual(new Set(lesson.steps.filter(s => s.kind === 'assemble').flatMap(s => s.teaches)), new Set(forms.map(f => f.short)), lesson.id);
      const chat = lesson.steps[1];
      assert(chat.lines.length >= 3, `Missing conversation: ${lesson.id}`);
      assert(chat.lines.some(line => line.me) && chat.lines.some(line => !line.me), `Not a conversation: ${lesson.id}`);
      assert(chat.lines.every(line => line.text.trim().length > 0), `Empty message: ${lesson.id}`);
      assert.equal(lesson.subtitleRu, forms.map(form => form.short).join(' · '), lesson.id);
      forms.forEach(form => introduced.add(form.short));
    }
    assert.equal(lesson.steps.filter(s => s.kind === 'assemble').length, 2, lesson.id);
    const allowed = new Set(lesson.review ? module.sourceLessons.flatMap(s => s.expressions.map(e => e.short)) : forms.map(f => f.short));
    for (const step of lesson.steps) {
      assert(!stepIds.has(step.id), step.id); stepIds.add(step.id);
      for (const term of step.teaches ?? []) {
        assert(allowed.has(term), `Extra expression ${term} in ${lesson.id}`);
        assert(introduced.has(term), `Unintroduced term ${term} in ${lesson.id}`);
      }
      if (step.kind === 'match') {
        assert(step.pairs.length <= (lesson.review ? 3 : 2), lesson.id);
        for (const [term] of step.pairs) assert(introduced.has(term), `Unintroduced review term ${term} in ${lesson.id}`);
      }
      if (step.kind === 'choice') {
        assert(step.options.length >= 2 && step.options[step.answer], step.id);
        assert.equal(new Set(step.options).size, step.options.length, step.id);
      }
      if (step.kind === 'type' || step.kind === 'assemble') assert(step.answers.length, step.id);
      if (step.kind === 'assemble') for (const answer of step.answers) assert(sameWordBank(step.answers[0], answer), step.id);
    }
  }
}
const oldTerms = new Set(oldModules.flatMap(m => m.sourceLessons.flatMap(s => s.expressions.map(e => e.short))));
for (const term of oldTerms) assert(introduced.has(term), `Lost old expression: ${term}`);
assert.equal(newExpressions.length, 48);
for (const term of newExpressions.map(e => e.short)) { assert(!oldTerms.has(term), `Not new: ${term}`); assert(introduced.has(term), `Missing new expression: ${term}`); }
assert.equal(introduced.size, 193);
assert.equal(trackModules.length, 34);
assert.equal(lessons.length, 136);
assert.equal(lessons.filter(x => !x.lesson.review).length, 102);

const state = new Map();
global.localStorage = { getItem: k => state.get(k) ?? null, setItem: (k,v) => state.set(k,v), removeItem: k => state.delete(k) };
const progress = require('../src/lib/trackProgress.ts');
assert.equal(progress.doneLessons().length, 0);
assert.equal(progress.currentLessonId(), 'chat-honesty-pair');
assert.equal(findLesson('chat-honesty').lesson.id, 'chat-honesty-pair');
for (const m of oldModules) for (const s of m.sourceLessons) assert(findLesson(s.id), `Broken legacy URL: ${s.id}`);
// Finishing two new pairs must NOT credit their old third expressions tq/thx.
progress.finishLesson(findLesson('chat-honesty-pair').lesson);
progress.finishLesson(findLesson('chat-basics-pair').lesson);
assert(!progress.isDone('regroup-1-chat'));
assert(!JSON.parse(state.get('trackDone')).includes('chat-honesty'));
progress.resetTrack();
state.set('trackDone', JSON.stringify(['chat-honesty', 'chat-basics']));
assert(progress.isDone('chat-honesty-pair'));
assert(progress.isDone('chat-basics-pair'));
assert(progress.isDone('regroup-1-chat'));
assert(!progress.isDone('new-1-chat'));
// Finishing a genuinely new lesson retains legacy evidence for moved words.
progress.finishLesson(findLesson('new-1-chat').lesson);
assert(progress.isDone('regroup-1-chat'));
assert(JSON.parse(state.get('trackDone')).includes('chat-honesty'));
progress.resetTrack();
state.set('trackDone', JSON.stringify(oldModules.flatMap(m => m.lessons.map(l => l.id))));
assert.equal(progress.doneLessons().length, 104);
assert.equal(progress.currentLessonId(), 'new-1-chat');
assert.equal(progress.trackStanding().total, 136);
progress.resetTrack();
assert.equal(progress.doneLessons().length, 0);
assert.equal(progress.currentLessonId(), 'chat-honesty-pair');
state.set('trackDone', '{invalid JSON'); assert.deepEqual(progress.doneLessons(), []);
state.set('trackDone', '{}'); assert.deepEqual(progress.doneLessons(), []);
console.log(`Slang: ${trackModules.length} modules, ${lessons.length} lessons, ${introduced.size} expressions. Two-item limit, coverage, exercise answers, legacy URLs and progress migration passed.`);


