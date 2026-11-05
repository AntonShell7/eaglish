import { trackLessons } from "../data/track";
import { supabase } from "./supabase";
export type RecordData = Record<string, unknown>;
type Entry = { category: string; item_id: string; data: RecordData; updated_at?: string; dirty?: boolean };
const KEY = "learningRecords";
let owner: string | null = null;
let generation = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let running: Promise<boolean> | null = null;
const pending = new Map<string, Entry>();
export function learningRecords(): Entry[] {
 try { const rows=JSON.parse(localStorage.getItem(KEY) ?? "[]");return Array.isArray(rows)?rows.filter(r=>r&&typeof r.category==="string"&&typeof r.item_id==="string"&&r.data&&typeof r.data==="object"):[]; } catch { return []; }
}
export function recordLearning(category: string, item: string, data: RecordData) {
 const all = learningRecords(); const i = all.findIndex(r => r.category===category && r.item_id===item);
 const previous = i<0 ? {} : all[i].data;
 const entry:Entry = {dirty:true,category,item_id:item,updated_at:new Date().toISOString(),data:{...previous,...data,...(previous.completed ? {completed:true,completedAt:previous.completedAt}: {})}};
 if(i<0) all.push(entry); else all[i]=entry;
 try {localStorage.setItem(KEY,JSON.stringify(all));} catch { /* Keep exercise usable if storage is full. */ }
 pending.set(category+":"+item,entry);
 window.dispatchEvent(new Event("learning-records"));
 clearTimeout(timer); timer=setTimeout(()=>void flushLearning(),1500);
}
export async function flushLearning(): Promise<boolean> {
 if(running) { await running; if(pending.size) return flushLearning(); return true; }
 if(!owner || !supabase || !pending.size) return !owner || !pending.size;
 const mine=owner; const token=generation;
 running=(async()=>{
  for(const [key,entry] of [...pending]) {
   if(mine!==owner || token!==generation) return false;
   const {error}=await supabase!.rpc("save_learning_record",{p_category:entry.category,p_item:entry.item_id,p_data:entry.data});
   if(error) return false;
   if(pending.get(key)===entry) {
    pending.delete(key);
    const local=learningRecords();const i=local.findIndex(r=>r.category===entry.category&&r.item_id===entry.item_id);
    if(i>=0&&local[i].updated_at===entry.updated_at) {local[i].dirty=false;localStorage.setItem(KEY,JSON.stringify(local));}
   }
   if(entry.category==='slang' && entry.data.completed) {
    const {data:awards}=await supabase!.from('learning_records').select('category,item_id,data,updated_at').eq('user_id',mine).eq('category','achievement');
    if(token===generation && awards?.length) {const all=learningRecords().filter(r=>r.category!=='achievement');localStorage.setItem(KEY,JSON.stringify([...all,...awards]));window.dispatchEvent(new Event('learning-records'));}
   }
  }
  return true;
 })().catch(()=>false);
 const ok=await running; running=null; return ok;
}
export async function connectLearning(userId: string | null) {
 const token=++generation; owner=userId; pending.clear(); clearTimeout(timer);
 if(!userId || !supabase) return;
 const local=learningRecords(); const remote: Entry[]=[];
 for(let from=0;;from+=500) {
  const {data,error}=await supabase.from("learning_records").select("category,item_id,data,updated_at").eq("user_id",userId).order("category").order("item_id").range(from,from+499);
  if(token!==generation) return;
  if(error) throw new Error("Learning sync unavailable");
  remote.push(...(data??[]) as Entry[]); if((data?.length??0)<500) break;
 }
 const merged=new Map(remote.map(r=>[r.category+":"+r.item_id,r]));
 for(const row of local) {
  const key=row.category+":"+row.item_id; const r=merged.get(key);
  // Unsent local edits survive clock skew; acknowledged drafts come from the server.
  if(row.category!=="achievement" && (!r || row.data.completed && !r.data.completed || Number(row.data.seconds??0)>Number(r.data.seconds??0) || (!r.data.completed && row.dirty===true))) { merged.set(key,row); pending.set(key,row); }
 }
 const rows=[...merged.values()];localStorage.setItem(KEY,JSON.stringify(rows));
 const done=new Set<string>(JSON.parse(localStorage.getItem("trackDone")??"[]"));
 for(const {lesson} of trackLessons()) if(lesson.legacyCompletionIds?.length && lesson.legacyCompletionIds.every(id=>done.has(id))) done.add(lesson.id);
 const seen=JSON.parse(localStorage.getItem("trackSeen")??"{}");
 const drafts=JSON.parse(localStorage.getItem("trackDraft")??"{}");
 for(const row of rows) {
  if(row.category==='slang') { if(row.data.completed) {done.add(row.item_id);delete drafts[row.item_id];} else if(row.data.draft) drafts[row.item_id]=row.data.draft; }
  if(row.category==='slang-review') seen[row.item_id]=row.data;
 }
 localStorage.setItem("trackDone",JSON.stringify([...done]));localStorage.setItem("trackSeen",JSON.stringify(seen));localStorage.setItem("trackDraft",JSON.stringify(drafts));
 // Migrate old local progress once, without fabricating old reading completions.
 for(const id of done) if(!merged.has('slang:'+id)) recordLearning('slang',id,{completed:true,completedAt:new Date().toISOString(),migrated:true});
 for(const [id,value] of Object.entries(seen)) if(!merged.has('slang-review:'+id)) recordLearning('slang-review',id,value as RecordData);
 await flushLearning(); window.dispatchEvent(new Event("learning-records"));
}
export function hasSlangAward() { return learningRecords().some(r=>r.category==='achievement' && r.item_id==='slang-2026-11'); }
export function startPracticeClock(section:string, active:()=>boolean=()=>true) {
 const id=crypto.randomUUID();let seconds=0,lastInput=Date.now(),lastTick=Date.now(),lastFlush=Date.now();
 const touch=()=>{lastInput=Date.now();};const events=['pointerdown','keydown','scroll','touchstart'];
 events.forEach(e=>window.addEventListener(e,touch,{passive:true}));
 const interval=setInterval(()=>{const now=Date.now();const elapsed=Math.min(1,(now-lastTick)/1000);lastTick=now;
  if(document.visibilityState==='visible' && now-lastInput<90000 && active()) {seconds+=elapsed;recordLearning('practice',id,{section,seconds,day:new Date().toISOString().slice(0,10)});}
  if(now-lastFlush>=15000){lastFlush=now;void flushLearning();}
 },1000);
 return ()=>{clearInterval(interval);events.forEach(e=>window.removeEventListener(e,touch));void flushLearning();};
}
