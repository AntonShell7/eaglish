import { trackLessons } from "@/data/track";
import { doneLessons } from "./trackProgress";
export function learnedSlang() {
 const done=new Set(doneLessons());
 return trackLessons().filter(({lesson})=>done.has(lesson.id)).flatMap(({lesson})=>{
  const rule=lesson.steps.find(s=>s.kind==='rule');
  return rule?.kind==='rule'?(rule.forms??[]).map(f=>({...f,lessonId:lesson.id})):[];
 }).filter((f,i,all)=>all.findIndex(x=>x.short===f.short)===i);
}
