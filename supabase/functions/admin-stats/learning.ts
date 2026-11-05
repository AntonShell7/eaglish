import { course } from "./course.ts";
type Row={category:string;item_id:string;data:Record<string,unknown>;updated_at?:string};
export function learningSummary(rows:Row[]) {
 const lessons=rows.filter(r=>r.category==='slang'); const done=new Set(lessons.filter(r=>r.data.completed===true).map(r=>r.item_id));
 const current=course.find(l=>!done.has(l.id));const draft=lessons.find(r=>r.item_id===current?.id)?.data;
 const listening=rows.filter(r=>r.category==='listening');
 const minutes=(section:string)=>Math.round(rows.filter(r=>r.category==='practice'&&r.data.section===section).reduce((n,r)=>n+Math.max(0,Number(r.data.seconds)||0),0)/6)/10;
 return {slangDone:course.filter(l=>done.has(l.id)).length,slangTotal:course.length,slangCurrent:current?.title??null,slangModule:current?.module??null,slangStep:Number(draft?.step)||null,slangSteps:Number(draft?.total)||null,
 readingCompleted:rows.filter(r=>r.category==='reading'&&r.data.completed===true).length,
 listeningCompleted:listening.filter(r=>r.data.completed===true).length,listeningFragments:listening.reduce((n,r)=>n+(Number(r.data.furthest)||0),0),
 listeningMinutes:minutes('listening-audio'),vocabularyReviewMinutes:minutes('vocabulary-review'),smartRepetitionMinutes:minutes('smart-repetition'),
 awardedAt:rows.find(r=>r.category==='achievement'&&r.item_id==='slang-2026-11')?.data.completedAt??null,
 updatedAt:rows.map(r=>r.updated_at??'').sort().at(-1)??null};
}
