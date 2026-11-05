const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const Module = require('node:module');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return resolve.call(this, name.startsWith('@/') ? path.resolve(__dirname, '../src', name.slice(2)) : name, ...args);
};
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: filename,
}).outputText, filename);
const { summarizeTrack, practicedExpressions } = require('../src/lib/learningStats.ts');
const { trackModules } = require('../src/data/track.ts');
const first = trackModules[0].lessons;
assert.deepEqual(summarizeTrack([]), { lessons: 0, expressions: 0 });
assert.deepEqual(summarizeTrack([first[0].id, first[0].id, 'removed-lesson']), { lessons: 1, expressions: 2 });
assert.deepEqual(summarizeTrack(first.map(lesson => lesson.id)), { lessons: 4, expressions: 6 });
assert.deepEqual(summarizeTrack([first[3].id]), { lessons: 1, expressions: 0 });
assert.equal(practicedExpressions(first[3].steps).length, 6);
assert.equal(practicedExpressions([...first[0].steps, ...first[0].steps]).length, 2);
console.log('Learning stats: empty account, duplicates, removed lessons and reviews passed.');
