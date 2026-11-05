const fs=require('fs'),path=require('path'),assert=require('assert/strict'),ts=require('typescript');
const storage=new Map(),remote=new Map();let current='a',fail=false;
global.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
global.window={dispatchEvent:()=>{}};
const db={rpc:async(_,{p_category:c,p_item:i,p_data:d})=>{if(fail)return{error:new Error('offline')};remote.set(current+':'+c+':'+i,{category:c,item_id:i,data:d,updated_at:new Date().toISOString()});return{error:null};},from:()=>{let user=current,category;const q={select:()=>q,eq:(k,v)=>{if(k==='user_id')user=v;if(k==='category')category=v;return q;},order:()=>q,range:()=>q,then:fn=>Promise.resolve({data:[...remote].filter(([k,r])=>k.startsWith(user+':')&&(!category||r.category===category)).map(([,r])=>r),error:null}).then(fn)};return q;}};
require.extensions['.ts']=(m,f)=>{if(f.endsWith('/supabase.ts')){m.exports={supabase:db};return;}let s=fs.readFileSync(f,'utf8').replace(/from "@\/(.*?)"/g,(_,p)=>`from "${path.resolve(__dirname,'../src',p)}"`);m._compile(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);};
(async()=>{
const records=require('../src/lib/learningRecords.ts'),reading=require('../src/lib/readingCompletion.ts');
await records.connectLearning('a');records.recordLearning('slang','lesson-1',{completed:true,completedAt:'today'});records.recordLearning('slang','lesson-2',{draft:{typed:'lmk'},step:4,total:10});await records.flushLearning();
storage.clear();await records.connectLearning('a');assert.deepEqual(JSON.parse(storage.get('trackDone')),['lesson-1']);assert.equal(JSON.parse(storage.get('trackDraft'))['lesson-2'].typed,'lmk');
records.recordLearning('slang','lesson-1',{completed:false});assert(records.learningRecords().find(r=>r.item_id==='lesson-1').data.completed);
reading.readingEvidence('text-1',{seconds:10,reachedEnd:true,confirmed:true,requiredSeconds:30});assert.equal(records.learningRecords().find(r=>r.item_id==='text-1').data.completed,false);
reading.readingEvidence('text-1',{seconds:35});assert.equal(records.learningRecords().find(r=>r.item_id==='text-1').data.completed,true);
reading.readingEvidence('text-2',{seconds:80,reachedEnd:false,confirmed:true,requiredSeconds:30});assert.equal(records.learningRecords().find(r=>r.item_id==='text-2').data.completed,false);
fail=true;assert.equal(await records.flushLearning(),false);fail=false;assert.equal(await records.flushLearning(),true);
await records.connectLearning(null);storage.clear();current='b';await records.connectLearning('b');assert.equal(records.learningRecords().length,0);
const {learningSummary}=require('../supabase/functions/admin-stats/learning.ts');const summary=learningSummary([{category:'practice',item_id:'x',data:{section:'vocabulary-review',seconds:90}},{category:'reading',item_id:'r',data:{completed:true}},{category:'reading',item_id:'open',data:{completed:false}}]);assert.equal(summary.vocabularyReviewMinutes,1.5);assert.equal(summary.readingCompleted,1);assert.equal(summary.slangTotal,136);
await records.connectLearning(null);console.log('PASS: device restore, drafts, isolated accounts, offline retry, reading threshold/end/quiz, admin summaries');
})().catch(e=>{console.error(e);process.exitCode=1});
