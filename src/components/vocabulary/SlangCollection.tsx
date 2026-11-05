import { localize } from "@/i18n/content";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { learnedSlang } from "@/lib/slangCollection";
export function SlangCollection() {
 const {i18n}=useTranslation();const ru=!i18n.language.startsWith('en');const [query,setQuery]=useState('');const forms=learnedSlang();
 const matches=forms.filter(f=>(f.short+' '+f.long+' '+(f.fullForm??'')).toLowerCase().includes(query.trim().toLowerCase()));
 return <section className="mt-8"><p className="mb-4 text-sm" style={{color:'var(--color-text-muted)'}}>{ru?localize("Выражения из пройденных уроков Slang."):'Expressions from your completed Slang lessons.'}</p>
 <input className="field mb-4" type="search" aria-label={ru?localize("Поиск по сленгу"):'Search slang'} placeholder={ru?localize("Выражение или перевод"):'Expression or translation'} value={query} onChange={e=>setQuery(e.target.value)}/>
 {!forms.length&&<p>{ru?localize("Пройди урок Slang — изученные выражения появятся здесь."):'Complete a Slang lesson to collect expressions here.'}</p>}
 {forms.length>0&&!matches.length&&<p>{ru?localize("Ничего не найдено."):'No matches.'}</p>}
 <div className="vocab-slang-list">{matches.map(f=><article className="card p-5" key={f.short}><strong style={{color:'var(--color-primary)'}}>{f.short}{f.fullForm?' — '+f.fullForm:''}</strong><p className="mt-2">{f.long}</p>{f.usageRu&&<p className="mt-2 text-sm" style={{color:'var(--color-text-muted)'}}>{f.usageRu}</p>}<Link className="mt-3 inline-block text-sm" to={'/slang/track/'+f.lessonId}>{ru?localize("Повторить урок"):'Review lesson'} →</Link></article>)}</div>
 </section>;
}
