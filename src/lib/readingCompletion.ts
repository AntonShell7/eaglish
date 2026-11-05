import { learningRecords, recordLearning } from "./learningRecords";
export function readingEvidence(id:string, patch:Record<string,unknown>) {
 const old=learningRecords().find(r=>r.category==='reading'&&r.item_id===id)?.data??{};
 const data:Record<string,unknown>={...old,...patch,seconds:Math.max(Number(old.seconds??0),Number(patch.seconds??0)),reachedEnd:Boolean(old.reachedEnd)||Boolean(patch.reachedEnd)};
 const complete=Boolean(data.reachedEnd) && Number(data.seconds??0)>=Number(data.requiredSeconds??30) && Boolean(data.confirmed);
 recordLearning('reading',id,{...data,completed:complete, ...(complete?{completedAt:new Date().toISOString()}: {})});
}

export function readingSeconds(id:string) {return Number(learningRecords().find(r=>r.category==="reading"&&r.item_id===id)?.data.seconds??0);}
