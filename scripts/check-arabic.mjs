import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const ru = read('src/i18n/locales/ru.json');
const ar = read('src/i18n/locales/ar.json');
const content = {...read('src/i18n/locales/ar-content.json'), ...read('src/i18n/locales/ar-legal.json'), ...read('src/i18n/locales/ar-reviewed.json')};
const enDictionary = read('src/data/offlineDictionary.json');
const arDictionary = read('src/data/offlineDictionary.ar.json');
const flat = (obj, prefix = '') => Object.assign({}, ...Object.entries(obj).map(([key, value]) => typeof value === 'object' ? flat(value, `${prefix}${key}.`) : { [`${prefix}${key}`]: value }));
const source = flat(ru), target = flat(ar);
const placeholders = (text) => [...text.matchAll(/\{\{\s*([^}]+)\s*\}\}/g)].map(x => x[1].trim()).sort();
for (const [key, value] of Object.entries(source)) {
  if (/^(admin|visitStats)\./.test(key)) continue;
  assert.equal(typeof target[key], 'string', `Missing UI key: ${key}`);
  // Singular forms may spell out "one" in the source; other forms still need the count.
  const sourceParams = placeholders(value).filter(x => x !== 'count');
  const targetParams = placeholders(target[key]).filter(x => x !== 'count');
  assert.deepEqual(targetParams, sourceParams, `Changed placeholders: ${key}`);
}
for (const [key, value] of Object.entries(target)) {
  assert(!/[А-Яа-яЁё]/.test(value), `Russian in Arabic UI: ${key}`);
  if (key.endsWith('_one')) for (const form of ['zero','one','two','few','many','other']) assert.equal(typeof target[key.replace(/_one$/, `_${form}`)], 'string', `Missing Arabic plural: ${key}/${form}`);
}
assert(!ar.admin && !ar.visitStats, 'Admin must remain untranslated');
assert.deepEqual(Object.keys(arDictionary).sort(), Object.keys(enDictionary).sort(), 'Dictionary coverage');
for (const [key, value] of Object.entries(arDictionary)) assert(/[\u0600-\u06ff]/.test(value), `Missing Arabic word: ${key}`);
for (const [key, value] of Object.entries(content)) assert.deepEqual(placeholders(value), placeholders(key), `Course placeholders: ${key}`);
// A separate full-release gate: unfinished material cannot be mistaken for full localization.
const required = new Set();
function scanJson(value) {
  if (typeof value === 'string' && /[А-Яа-яЁё]/.test(value)) required.add(value);
  else if (value && typeof value === 'object') Object.values(value).forEach(scanJson);
}
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (!file.includes('i18n')) walk(file); continue; }
    if (file.endsWith('.json') && !file.includes('offlineDictionary')) scanJson(read(file));
    if (!/\.tsx?$/.test(file)) continue;
    const tree = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    const visit = (node) => {
      if (ts.isCallExpression(node) && ['localize','localizeTemplate'].includes(node.expression.getText(tree)) && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) required.add(node.arguments[0].text);
      ts.forEachChild(node, visit);
    };
    visit(tree);
  }
}
walk('src');
const missing = [...required].filter(text => !Object.hasOwn(content, text));
console.log(`Arabic UI: ${Object.keys(target).length} values; dictionary: ${Object.keys(arDictionary).length}; authored translations: ${Object.keys(content).length}.`);
console.log(`Course coverage: ${required.size - missing.length}/${required.size}; ${missing.length} untranslated fragments. Arabic remains preview-only.`);
if (process.argv.includes('--release')) assert.equal(missing.length, 0, 'Full Arabic release blocked by untranslated course material');
