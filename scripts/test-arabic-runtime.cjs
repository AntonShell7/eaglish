const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve('src');
function runtime(language, nativeLanguage) {
  const modules = new Map();
  const storage = new Map([['interfaceLanguage', language]]);
  if (nativeLanguage) storage.set('firstLanguage', nativeLanguage);
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
 function preserveEnglish(before, after, location='course') {
  if (typeof before==='string' && !/[А-Яа-яЁё]/.test(before)) assert.equal(after,before,`Changed English content: ${location}`);
  else if (before && typeof before==='object') for (const [key,value] of Object.entries(before)) preserveEnglish(value,after[key],`${location}.${key}`);
 }
 preserveEnglish(original,translated);
 function checkLibraries(dir) {
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
   const file=path.join(dir,entry.name);
   if(entry.isDirectory()) checkLibraries(file);
   else if(file.endsWith('.json') && !file.includes('offlineDictionary')) {
    const data=JSON.parse(fs.readFileSync(file,'utf8'));
    const localized=ar.load('@/i18n/content').localizeData(data);
    preserveEnglish(data,localized,file);
    if(process.argv.includes('--release')) {
     const check=value=>{
      if(typeof value==='string') assert(!/[А-Яа-яЁё]/.test(value),`Russian library text remains in ${file}: ${value}`);
      else if(value&&typeof value==='object') Object.values(value).forEach(check);
     };
     check(localized);
    }
   }
  }
 }
 checkLibraries(path.join(root,'data'));
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
 scan(translated);
 if(missing.size){console.log('Untranslated course content:',JSON.stringify([...missing],null,2));process.exitCode=1;}else console.log('Full course: no Russian; all course IDs, answer indices and English accepted answers unchanged.');
 const c=ar.load('@/i18n/content');assert.equal(c.localizeTemplate('Что значит «{{p0}}»?', ['lmk']),'ما معنى «lmk»؟');
 const englishUi=runtime('en', 'ar');
 await englishUi.load('@/i18n/content').prepareContent();
 assert.equal(englishUi.load('@/i18n/content').selectedLanguage(), 'en');
 assert.equal(englishUi.load('@/i18n/content').localize('Что значит «{{p0}}»?'), c.localize('Что значит «{{p0}}»?'));
 const cacheRu=ru.load('@/lib/lookupCache'),cacheAr=ar.load('@/lib/lookupCache');
 assert.notEqual(cacheRu.cacheKey('book'),cacheAr.cacheKey('book'));
 const input={messages:[{role:'system',content:'Give feedback in Russian, in Cyrillic.'},{role:'user',content:'Russian is the word I am practising.'}]};
 const localized=ar.load('@/lib/aiLanguage').withLearnerLanguage(input);
 assert(localized.messages[0].content.includes('Give feedback in Arabic'));
 assert.equal(localized.messages[1].content,input.messages[1].content);
 assert.equal(ru.load('@/lib/aiLanguage').withLearnerLanguage(input),input);
 console.log('Templates, language-separated cache and AI instruction adaptation verified; learner input remains unchanged.');
})().catch(error=>{console.error(error);process.exitCode=1});
