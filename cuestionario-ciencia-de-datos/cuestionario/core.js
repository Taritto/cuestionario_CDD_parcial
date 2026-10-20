(function(root){
'use strict';
const TYPES=['single','multiple','truefalse','matching','numeric','essay'];
const ORIGINS=['historica','nueva','ampliacion'];
function validateBank(bank){
 const errors=[];const fail=m=>{if(errors.length<30)errors.push(m)};
 if(!bank||typeof bank!=='object'||Array.isArray(bank))return ['La raíz debe ser un objeto.'];
 if(bank.schemaVersion!==1)fail('schemaVersion debe ser 1.');
 const text=(v,min=1,max=12000)=>typeof v==='string'&&v.trim().length>=min&&v.length<=max;
 const arr=(v)=>Array.isArray(v);
 if(!text(bank.title,1,300))fail('Falta title o supera 300 caracteres.');
 for(const key of ['sources','topics','questions'])if(!arr(bank[key]))fail(`${key} debe ser una lista.`);
 if(errors.length)return errors;
 if(bank.questions.length>5000)fail('El máximo es 5000 preguntas por banco.');
 const unique=(xs,key,label)=>{const ids=new Set;for(const x of xs){if(!x||!text(x[key],1,100)||! /^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(x[key])||['__proto__','constructor','prototype'].includes(x[key])||ids.has(x[key]))fail(`${label}: identificador inválido o repetido.`);else ids.add(x[key]);}return ids;};
 const topics=unique(bank.topics,'id','Temas'),sources=unique(bank.sources,'id','Fuentes');unique(bank.questions,'id','Preguntas');
 for(const t of bank.topics)if(!t||!text(t.title,1,300))fail('Tema sin título válido.');
 for(const s of bank.sources){if(!s||!text(s.title,1,500))fail('Fuente sin título válido.');try{if(new URL(s.url).protocol!=='https:')fail('Las fuentes deben usar https.');}catch{fail('URL de fuente inválida.');}}
 if(bank.notes!==undefined&&(!arr(bank.notes)||bank.notes.some(x=>!text(x,1,12000))))fail('notes debe ser una lista de textos.');
 for(const q of bank.questions){
  if(!q||typeof q!=='object'){fail('Pregunta inválida.');continue;}
  const at=`${q.id||'Pregunta'}: `;
  if(!topics.has(q.topic))fail(at+'tema desconocido.');
  if(!TYPES.includes(q.type))fail(at+'tipo desconocido.');
  if(!ORIGINS.includes(q.origin))fail(at+'origin inválido.');
  if(!text(q.difficulty,1,60))fail(at+'falta difficulty.');
  if(!Number.isFinite(q.points)||q.points<=0||q.points>100)fail(at+'points debe ser mayor que 0 y no superar 100.');
  for(const key of ['prompt','explanation'])if(!text(q[key]))fail(at+`falta ${key} o es demasiado largo.`);
  if(q.note!==undefined&&!text(q.note))fail(at+'note inválida.');
  if(!arr(q.references)||!q.references.length||q.references.some(r=>!r||!sources.has(r.source)||!text(r.locator,1,1000)))fail(at+'references debe indicar fuentes conocidas y locator.');
  if(['single','multiple','truefalse'].includes(q.type)){
   if(!arr(q.options)||q.options.length<2||q.options.length>30){fail(at+'options requiere de 2 a 30 opciones.');continue;}
   const ids=unique(q.options,'id',at+'opciones');
   if(q.options.some(o=>!o||!text(o.text)))fail(at+'opción sin texto.');
   if(!arr(q.answer)||!q.answer.length||new Set(q.answer).size!==q.answer.length||q.answer.some(a=>!ids.has(a)))fail(at+'answer debe listar IDs de opciones correctas sin repetir.');
   if(['single','truefalse'].includes(q.type)&&q.answer?.length!==1)fail(at+'se requiere exactamente una respuesta correcta.');
   if(q.type==='multiple'&&q.answer?.length>=q.options.length)fail(at+'selección múltiple requiere al menos un distractor.');
   if(q.type==='truefalse'&&(q.options.length!==2||!ids.has('true')||!ids.has('false')))fail(at+'verdadero/falso usa IDs true y false.');
  }
  if(q.type==='numeric'&&(!Number.isFinite(q.answer)||!Number.isFinite(q.tolerance)||q.tolerance<0))fail(at+'respuesta numérica o tolerancia inválidas.');
  if(q.type==='matching'){
   if(!arr(q.pairs)||q.pairs.length<2||q.pairs.length>30){fail(at+'pairs requiere de 2 a 30 pares.');continue;}
   unique(q.pairs,'id',at+'pares');
   if(q.pairs.some(p=>!p||!text(p.left)||!text(p.right)))fail(at+'par incompleto.');
   if(new Set(q.pairs.map(p=>p.right)).size!==q.pairs.length)fail(at+'las definiciones de pares deben ser distintas.');
  }
  if(q.type==='essay'&&(!arr(q.rubric)||!q.rubric.length||q.rubric.length>20||q.rubric.some(r=>!text(r))))fail(at+'rubric requiere de 1 a 20 criterios de texto.');
 }
 return errors;
}
function answered(q,a){
 if(q.type==='matching')return q.pairs.every(p=>typeof a?.[p.id]==='string'&&a[p.id]!=='');
 if(['single','multiple','truefalse'].includes(q.type))return Array.isArray(a)&&a.length>0;
 return typeof a==='string'&&a.trim()!=='';
}
function parseNumber(value){if(typeof value!=='string'||!value.trim())return null;let s=value.trim().replace(',','.');if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s))return null;const n=Number(s);return Number.isFinite(n)?n:null;}
function grade(q,a,policy='strict',manual){
 if(q.type==='essay')return Number.isFinite(manual)?Math.max(0,Math.min(1,manual)):null;
 if(q.type==='numeric'){const n=parseNumber(a);return n!==null&&Math.abs(n-q.answer)<=q.tolerance+Number.EPSILON*10?1:0;}
 if(q.type==='matching')return q.pairs.filter(p=>a?.[p.id]===p.id).length/q.pairs.length;
 if(!Array.isArray(a))return 0;
 const selected=[...new Set(a)].filter(id=>q.options.some(o=>o.id===id));
 if(q.type==='multiple'){
  const correct=selected.filter(id=>q.answer.includes(id)).length/q.answer.length;
  if(policy==='historical')return correct;
  const wrong=selected.filter(id=>!q.answer.includes(id)).length/(q.options.length-q.answer.length);
  return Math.max(0,Math.min(1,correct-wrong));
 }
 return selected.length===1&&q.answer.includes(selected[0])?1:0;
}
function shuffle(xs,random=Math.random){const copy=xs.slice();for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
function balanced(pool,n,random=Math.random){
 const groups=new Map;for(const q of shuffle(pool,random)){if(!groups.has(q.topic))groups.set(q.topic,[]);groups.get(q.topic).push(q);}
 const result=[];let active=shuffle([...groups.keys()],random);while(result.length<n&&active.length){for(const key of active){if(result.length>=n)break;const q=groups.get(key).pop();if(q)result.push(q);}active=active.filter(key=>groups.get(key).length);}
 return shuffle(result,random);
}
function recordProgress(previous,attempt,onlyQuestionId=null,now=Date.now()){
 const updated={...previous};
 for(const q of attempt.questions){
  if(onlyQuestionId&&q.id!==onlyQuestionId)continue;
  const s=grade(q,attempt.answers[q.id],attempt.policy,attempt.manual[q.id]);if(s===null)continue;
  const prev=previous[q.id]||{};
  if(prev.attemptId!==attempt.id&&(prev.lastAttemptEnded??prev.lastAt??0)>attempt.ended)continue;
  updated[q.id]={lastScore:s,attempts:(prev.attempts||0)+(prev.attemptId===attempt.id?0:1),lastAt:now,lastAttemptEnded:attempt.ended,attemptId:attempt.id};
 }return updated;
}
const api={validateBank,answered,parseNumber,grade,shuffle,balanced,recordProgress,TYPES,ORIGINS};
root.QuizCore=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);
