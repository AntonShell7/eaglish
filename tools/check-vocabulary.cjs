const ts = require('typescript');
const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const data = new Map();
const storage = {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
const pushed=[];
function load(file) {
 const exports={};
 const context={exports, localStorage:storage, window:{localStorage:storage}, console, Date, crypto:require('node:crypto').webcrypto,
 require:n=>n==='./sync'?{pushVocabularyWord:w=>pushed.push({...w}),deleteVocabularyWord:()=>{}}:n==='./memory'?{}:require(n)};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 return exports;
}
const visits=load('src/lib/writingVisits.ts');
assert.deepEqual(Array.from({length:4},()=>visits.recordWritingVisit(storage,'a')),[true,true,false,false]);
assert.equal(visits.recordWritingVisit(storage,'b'),true);
assert.equal(visits.recordWritingVisit({getItem(){throw Error()},setItem(){}},'a'),true);
const folders=load('src/lib/folderNames.ts');
folders.writeFolderNames('a',['Travel']);assert.equal(folders.readFolderNames('a')[0],'Travel');assert.equal(folders.readFolderNames('b').length,0);
const store=load('src/lib/vocabularyStore.ts');
const words=[{id:'a',word:'apple',folder:'Old',dueAt:123,reviewCount:5,stability:12},{id:'b',word:'book',folder:'Travel',dueAt:456,reviewCount:2},{id:'c',word:'cat',folder:'Other',dueAt:789,reviewCount:9},{id:'d',word:'deleted',deletedAt:123,folder:'Travel'}];
storage.setItem('vocabularyWords',JSON.stringify(words));
store.setFolderWords('Travel',['a']);
const after=JSON.parse(storage.getItem('vocabularyWords'));
assert.equal(after[0].folder,'Travel');assert.equal(after[1].folder,undefined);assert.equal(after[2].folder,'Other');assert.equal(after[3].folder,'Travel');
for(let i=0;i<words.length;i++){const {folder,...old}=words[i]; const {folder:_,...next}=after[i];assert.deepEqual(next,old);}
assert.equal(pushed.length,2);
store.renameFolder('Travel','Journey');assert.equal(JSON.parse(storage.getItem('vocabularyWords'))[0].folder,'Journey');
console.log('PASS: first two visits only, per-account metadata, word moves, unassignment, review preservation, sync calls, rename.');
