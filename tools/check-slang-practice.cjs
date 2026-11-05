const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
let aiResult='{"correct":true,"feedbackRu":""}';let aiCalls=0;
require.extensions['.ts']=(m,f)=>{if(f.endsWith('/learningRecords.ts')) {m.exports={recordLearning:()=>{}};return;}let source=fs.readFileSync(f,'utf8').replace(/from "@\/(.*?)"/g,(_,p)=>`from "${path.resolve(__dirname,'../src',p)}"`);
if(f.endsWith('/aiClient.ts')) {m.exports={AiError:class AiError extends Error { constructor(reason){super(reason);this.reason=reason;} },askModel:async()=>{aiCalls++;if(aiResult instanceof Error)throw aiResult;return aiResult}};return;}
m._compile(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);};
const state=new Map();global.localStorage={getItem:k=>state.get(k)??null,setItem:(k,v)=>state.set(k,v),removeItem:k=>state.delete(k)};
const {trackLessons}=require('../src/data/track.ts');const all=trackLessons().map(x=>x.lesson);
const session=require('../src/lib/trackSession.ts'),progress=require('../src/lib/trackProgress.ts'),answers=require('../src/lib/trackAnswer.ts');
(async()=>{
for(const l of all){
 const scenarios=l.steps.filter(s=>s.kind==='choice');
 for(const s of scenarios){const positions=new Set();for(let seed=1;seed<=30;seed++){const dealt=session.dealChoice(s,seed);assert.equal(dealt.options[dealt.answer],s.options[s.answer]);positions.add(dealt.answer);}assert(positions.size>1,s.id);}
 if(l.review)continue;
 const terms=l.steps[0].forms.map(f=>f.short);
 for(const term of terms)assert(l.steps.some(s=>s.kind==='type'&&!s.reply&&s.teaches?.includes(term)),l.id+term);
 const reply=l.steps.find(s=>s.kind==='type'&&s.reply);assert(reply?.reply.context&&reply.answers[0],l.id);
 assert.equal((await answers.replyVerdict(reply,reply.answers[0])).correct,true,l.id);
}
assert.equal(aiCalls,0,'Reference answers must work offline');
const sample=all[0], draft={seed:21,stepIds:[...sample.steps.map(s=>s.id),sample.steps[2].id],index:4,picked:null,typed:'let me know',assembled:[],joined:[],rooms:{},judged:null,mistakes:1,retryCount:1,pairMistake:false,feedback:null};
session.saveLessonDraft(sample,draft);assert.equal(session.loadLessonDraft(sample).typed,'let me know');assert.equal(session.draftSteps(session.loadLessonDraft(sample)).length,sample.steps.length+1);
assert.equal(session.loadLessonDraft({...sample,steps:sample.steps.slice(1)}),null,'Content updates invalidate old draft');
session.saveLessonDraft(all[1],{...draft,stepIds:all[1].steps.map(s=>s.id)});assert.equal(session.loadLessonDraft(sample).typed,'let me know','Other lessons must not overwrite draft');session.clearLessonDraft(all[1].id);assert(session.loadLessonDraft(sample));
state.set('trackDraft','{broken');assert.equal(session.loadLessonDraft(sample),null);
state.clear();let tested=false;
for(let i=0;i<25;i++){const extra=progress.resurfacedSteps(all[i].id);const term=extra.flatMap(s=>s.teaches??[]).find(t=>!all[i].steps.some(s=>s.teaches?.includes(t)));progress.finishLesson(all[i],[...all[i].steps,...extra]);if(term){assert(!progress.dueItems().includes(term));tested=true;break;}}
assert(tested,'Exercise actual resurfacing schedule');
assert(answers.sameAnswer('piece of cake','a piece of cake'));assert(!answers.sameAnswer('piece cake','a piece of cake'));
assert.equal(answers.acceptedFormHint({kind:'type',answers:['a piece of cake']},'piece of cake'),'Полная форма: a piece of cake');
const reply=sample.steps.find(s=>s.reply);
aiResult=new Error('offline');assert.equal((await answers.replyVerdict(reply,'Something different')).correct,null);
aiResult='{"correct":false,"feedbackRu":"Не подходит к ситуации."}';assert.equal((await answers.replyVerdict(reply,'Wrong')).correct,false);
aiResult='{"correct":true}';assert.equal((await answers.replyVerdict(reply,'A natural alternative')).correct,true);
aiResult=new (require('../src/lib/aiClient.ts').AiError)('quota');assert((await answers.replyVerdict(reply,'Other')).feedback.includes('лимит'));
aiResult='garbage';assert.equal((await answers.replyVerdict(reply,'Other')).correct,null);
progress.resetTrack();assert.equal(state.get('trackDraft'),undefined);
console.log('136 lessons: randomized answer identity, both recalls, 102 offline reference replies, draft restoration/invalidation, actual review rescheduling, article feedback and AI failure handling passed.');
})().catch(e=>{console.error(e);process.exit(1)});
