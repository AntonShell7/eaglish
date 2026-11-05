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
const { isFreeSlangPath, FREE_LISTENING_FRAGMENTS } = require('../src/lib/freeAccess.ts');
const { trackModules } = require('../src/data/track.ts');
assert.equal(FREE_LISTENING_FRAGMENTS, 10);
assert(isFreeSlangPath('/slang'));
for (const [index, module] of trackModules.entries()) {
  for (const lesson of module.lessons) assert.equal(isFreeSlangPath(`/slang/track/${lesson.id}`), index === 0, lesson.id);
}
assert.equal(isFreeSlangPath('/slang/track/%63hat-notes'), false);
assert.equal(isFreeSlangPath('/slang/%74rack/chat-notes'), false);
assert(isFreeSlangPath('/slang/track/nonexistent')); // Let the page handle invalid links.
for (const locale of ['ru', 'en']) {
  const { pricing } = require(`../src/i18n/locales/${locale}.json`);
  for (const section of ['slang', 'dictation', 'writing']) assert(pricing.paywall[section].upgradeBody);
}
console.log('Free access: all 72 lessons, route boundaries and translated upgrade messages passed.');
