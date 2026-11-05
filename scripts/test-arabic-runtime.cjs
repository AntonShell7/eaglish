const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve('src');
function runtime(language) {
  const modules = new Map();
  const storage = new Map([['interfaceLanguage', language]]);
  const context = vm.createContext({ console, localStorage: {getItem:key=>storage.get(key)??null, setItem:(key,value)=>storage.set(key,value)}, window: {}, setTimeout, clearTimeout });
  function load(request, parent = path.join(root, 'main.tsx')) {
    let file = request.startsWith('@/') ? path.join(root,request.slice(2)) : path.resolve(path.dirname(parent),request);
    if (!fs.existsSync(file)) file += '.ts';
    if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file,'utf8'));
    if (modules.has(file)) return modules.get(file).exports;
    const module = {exports:{}}; modules.set(file,module);
    const source = fs.readFileSync(file,'utf8').replaceAll('import.meta.env', '({DEV:true})');
    const {outputText} = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}});
    const fn = vm.runInContext(`(function(require,module,exports){${outputText}\n})`,context,{filename:file});
    fn(request=>load(request,file),module,module.exports);return module.exports;
  }
  return {load,storage};
}
(async()=>{
 const ru=runtime('ru'), ar=runtime('ar');
 await ar.load('@/i18n/content').prepareContent();
 const original=ru.load('@/data/track').trackModules;
 const translated=ar.load('@/data/track').trackModules;
 assert.equal(original.length, translated.length);
 for(let i=0;i<original.length;i++) {
  assert.equal(original[i].id,translated[i].id);
  assert.equal(original[i].lessons.length,translated[i].lessons.length);
  original[i].lessons.forEach((lesson,j)=>{
   const other=translated[i].lessons[j];assert.equal(lesson.id,other.id);assert.equal(lesson.steps.length,other.steps.length);
   lesson.steps.forEach((step,k)=>{
    const next=other.steps[k];assert.equal(step.kind,next.kind);assert.equal(step.answer,next.answer);
    if(step.answers) assert.equal(JSON.stringify(step.answers),JSON.stringify(next.answers),`Changed English answers in ${lesson.id}`);
   });
  });
 }
 const missing=new Set();
 function scan(x){if(typeof x==='string'&&/[А-Яа-яЁё]/.test(x))missing.add(x);else if(x&&typeof x==='object')Object.values(x).forEach(scan)}
 scan(translated[0]);
 if(missing.size){console.log('First-block untranslated content:',JSON.stringify([...missing],null,2));process.exitCode=1;}else console.log('First block: no Russian; all course IDs, answer indices and English accepted answers unchanged.');
 const c=ar.load('@/i18n/content');assert.equal(c.localizeTemplate('Что значит «{{p0}}»?', ['lmk']),'ما معنى «lmk»؟');
 const cacheRu=ru.load('@/lib/lookupCache'),cacheAr=ar.load('@/lib/lookupCache');
 assert.notEqual(cacheRu.cacheKey('book'),cacheAr.cacheKey('book'));
 const input={messages:[{role:'system',content:'Give feedback in Russian, in Cyrillic.'},{role:'user',content:'Russian is the word I am practising.'}]};
 const localized=ar.load('@/lib/aiLanguage').withLearnerLanguage(input);
 assert(localized.messages[0].content.includes('Give feedback in Arabic'));
 assert.equal(localized.messages[1].content,input.messages[1].content);
 assert.equal(ru.load('@/lib/aiLanguage').withLearnerLanguage(input),input);
 console.log('Templates, language-separated cache and AI instruction adaptation verified; learner input remains unchanged.');
})().catch(error=>{console.error(error);process.exitCode=1});
