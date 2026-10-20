'use strict';
const C=window.QuizCore,$=s=>document.querySelector(s),main=$('#main');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(v,n=2)=>Number(v).toLocaleString('es-AR',{minimumFractionDigits:n,maximumFractionDigits:n});
const TYPE={single:'Opción única',multiple:'Selección múltiple',truefalse:'Verdadero / falso',matching:'Emparejamiento',numeric:'Respuesta numérica',essay:'Desarrollo con rúbrica'};
const ORIGIN={historica:'Histórica',nueva:'Nueva · estilo Moodle',ampliacion:'Práctica adicional'};
let storageWarning=false;
function notice(message){$('#notice').innerHTML=message?`<div class="status-message">${esc(message)}</div>`:'';}
function read(key,fallback){try{const raw=localStorage.getItem('cdquiz.v1.'+key);return raw?JSON.parse(raw):fallback;}catch{return fallback;}}
function write(key,value){try{localStorage.setItem('cdquiz.v1.'+key,JSON.stringify(value));return true;}catch{if(!storageWarning){storageWarning=true;notice('El navegador no pudo guardar los cambios. Podés seguir en esta pestaña; exportá tu banco y progreso antes de cerrarla.');}return false;}}
let bank=read('bank',window.INITIAL_BANK);if(C.validateBank(bank).length){bank=window.INITIAL_BANK;notice('El banco guardado no es válido. Se cargó el banco original.');}
let progress=read('progress',{}),history=read('history',[]),attempt=read('attempt',null),page='home',bankPage=0,bankQuery='',bankTopic='all';
if(!progress||typeof progress!=='object'||Array.isArray(progress))progress={};if(!Array.isArray(history))history=[];
if(attempt&&!validAttempt(attempt))attempt=null;
function sourceLink(r,sources=bank.sources){const s=sources.find(x=>x.id===r.source);return s?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a> · ${esc(r.locator)}`:esc(r.locator);}
function topicName(id){return (bank.topics.find(t=>t.id===id)||attempt?.topics?.find(t=>t.id===id))?.title||id;}
function tag(q){return `<span class="tag ${q.origin==='historica'?'historical':q.origin==='ampliacion'?'extra':''}">${ORIGIN[q.origin]}</span>`;}
function saveAttempt(){if(attempt)write('attempt',attempt);}
function showPage(next,focus=true){
 page=next;document.querySelectorAll('nav button').forEach(b=>{if(b.dataset.page===next)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 if(next==='home')renderHome();if(next==='coverage')renderCoverage();if(next==='bank')renderBank();if(next==='sources')renderSources();if(next==='history')renderHistory();
 if(focus){main.focus();window.scrollTo({top:0,behavior:'instant'});}
}
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
function remainingErrors(){return bank.questions.filter(q=>progress[q.id]?.lastScore<1);}
function renderHome(){
 const errors=remainingErrors().length,seen=bank.questions.filter(q=>progress[q.id]).length;
 main.innerHTML=`<h1>Cuestionario de Ciencia de Datos</h1><p class="lead">Practicá con la estructura de los parciales de Moodle y revisá por qué una respuesta es correcta. Elegí un intento breve o recorré todo el temario.</p>
 ${attempt&&!attempt.finished?`<section class="resume"><strong>Tenés un intento en curso</strong><p>${esc(attempt.title)} · ${attempt.questions.filter(q=>C.answered(q,attempt.answers[q.id])).length} de ${attempt.questions.length} preguntas respondidas.</p><button class="primary" id="resume">Reanudar intento</button></section>`:''}
 <div class="home-layout"><section class="panel"><h2>Configurar un intento</h2><form id="setup">
 <div class="field"><label for="mode">Forma de estudiar</label><select id="mode"><option value="practice">Práctica · corrección pregunta por pregunta</option><option value="exam">Simulacro · devolución al terminar</option><option value="historical">Parcial 2024 · las 10 preguntas históricas</option><option value="formative">Evaluación formativa · 8 preguntas con clave verificable</option><option value="errors">Repasar errores · ${errors} disponibles</option></select><small id="mode-help">Podés comprobar una respuesta y leer su explicación antes de continuar.</small></div>
 <div class="field"><label for="topic">Contenido</label><select id="topic"><option value="all">Todos los temas · selección equilibrada</option>${bank.topics.map(t=>`<option value="${esc(t.id)}">${esc(t.title)}</option>`).join('')}</select></div>
 <div class="field"><label for="scope">Tipos de pregunta</label><select id="scope"><option value="moodle">Modalidades observadas en Moodle</option><option value="all">Todas · incluye cálculos y desarrollo</option><option value="numeric">Solo cálculos numéricos</option><option value="essay">Solo desarrollo con rúbrica</option></select><small>Opción única, múltiple, verdadero/falso y emparejamiento son las modalidades observadas. Cálculos y desarrollo son entrenamiento adicional.</small></div>
 <div class="form-row"><div class="field"><label for="count">Cantidad de preguntas</label><input id="count" type="number" min="1" max="5000" value="20" required></div><div class="field"><label for="minutes">Tiempo límite (minutos)</label><input id="minutes" type="number" min="0" max="300" value="0" required><small>0 = sin límite. El plazo es de práctica.</small></div></div>
 <div class="field"><label for="policy">Corrección de selección múltiple</label><select id="policy"><option value="strict">Exigente · las opciones incorrectas restan</option><option value="historical">Crédito por aciertos · sin restar distractores</option></select><small id="policy-help">Puntaje = aciertos / correctas − errores / distractores, con mínimo 0. No es una configuración oficial del campus.</small></div>
 <p id="pool-info" class="muted"></p><button class="primary" type="submit">Comenzar intento</button><div id="start-warning"></div></form></section>
 <aside><h2>Qué vas a practicar</h2><ul class="fact-list"><li><strong>${bank.questions.length} preguntas con explicación</strong><span>${bank.questions.filter(q=>q.origin==='historica').length} históricas y ${bank.questions.filter(q=>q.origin!=='historica').length} nuevas. Cada solución enlaza al material.</span></li><li><strong>${bank.topics.length} áreas de estudio</strong><span>Proyectos, ETL, preprocesamiento, regresión, métricas, árboles, KNN, PCA y clustering.</span></li><li><strong>Un repaso que sigue tus resultados</strong><span>${seen} preguntas evaluadas · ${errors} para reforzar. Los aciertos parciales vuelven al repaso.</span></li><li><strong>Ampliá el banco con JSON</strong><span>Importá preguntas y referencias nuevas. Exportá una copia para conservar tus cambios.</span></li></ul>
 <div class="notice-inline">La selección cubre el material desarrollado disponible. Visualización tiene solo un índice breve; minería de texto aparece sin desarrollo. Consultá el detalle en Cobertura.</div><button id="coverage-link">Ver cobertura del temario</button></aside></div>`;
 $('#resume')?.addEventListener('click',()=>openAttempt());$('#coverage-link').onclick=()=>showPage('coverage');
 for(const id of ['mode','topic','scope','count','policy'])$('#'+id).addEventListener('change',updateSetup);
 $('#setup').onsubmit=e=>{e.preventDefault();if(attempt&&!attempt.finished){$('#start-warning').innerHTML='<div class="notice-inline">Si comenzás uno nuevo, el intento en curso se reemplaza. Podés reanudarlo arriba o exportar primero tu progreso.</div><button type="button" class="danger" id="replace-attempt">Reemplazar el intento en curso</button>';$('#replace-attempt').onclick=()=>startAttempt();}else startAttempt();};updateSetup();
}
function candidatePool(){
 const mode=$('#mode').value,topic=$('#topic').value,scope=$('#scope').value;
 let pool=bank.questions.filter(q=>{
 if(mode==='historical')return q.origin==='historica'&&q.references.some(r=>r.source==='parcial');
 if(mode==='formative')return q.origin==='historica'&&q.references.some(r=>r.source==='experto');
 if(mode==='errors'&&!(progress[q.id]?.lastScore<1))return false;
 if(mode==='exam'&&q.note)return false;
 if(topic!=='all'&&q.topic!==topic)return false;
 if(scope==='moodle'&&!['single','multiple','truefalse','matching'].includes(q.type))return false;
 if(['numeric','essay'].includes(scope)&&q.type!==scope)return false;
 return true;
 });return pool;
}
function updateSetup(){
 const mode=$('#mode').value,fixed=['historical','formative'].includes(mode);for(const id of ['topic','scope','count'])$('#'+id).disabled=fixed;
 $('#mode-help').textContent=mode==='exam'?'No se muestran soluciones hasta enviar. Se excluyen las claves históricas señaladas como ambiguas.':mode==='historical'?'Reproduce las 10 preguntas y su clave visible. Las ambigüedades se explican en la devolución.':mode==='formative'?'Se incluyen 8 preguntas verificables. Se omiten los 2 emparejamientos cuya clave correcta no se ve en la revisión.':mode==='errors'?'Selecciona preguntas cuyo último resultado fue incorrecto o parcial, con tus filtros actuales.':'Podés comprobar una respuesta y leer su explicación antes de continuar.';
 $('#policy-help').textContent=$('#policy').value==='strict'?'Puntaje = aciertos / correctas − errores / distractores, con mínimo 0. No es una configuración oficial del campus.':'Cada opción correcta suma 1 / cantidad de correctas. Los distractores no restan. Coincide con el crédito positivo visible en el parcial; sus pesos ocultos no se conocen. Marcar todo puede dar el máximo.';
 const pool=candidatePool(),n=fixed?pool.length:Math.min(pool.length,Math.max(1,Number($('#count').value)||1));$('#pool-info').textContent=`${pool.length} preguntas disponibles con esta selección. El intento tendrá ${n}.`;
}
function startAttempt(){
 const mode=$('#mode').value,pool=candidatePool();if(!pool.length){notice('No hay preguntas para esta selección. Cambiá los filtros o practicá primero para generar un repaso de errores.');return;}
 const fixed=['historical','formative'].includes(mode);const n=fixed?pool.length:Math.min(Number($('#count').value),pool.length);if(!Number.isInteger(n)||n<1)return;
 const minutes=Number($('#minutes').value);if(!Number.isInteger(minutes)||minutes<0||minutes>300)return;
 let selected=fixed?pool:C.balanced(pool,n);selected=structuredClone(selected);
 const order={};for(const q of selected)order[q.id]=C.shuffle(q.options?.map(o=>o.id)||q.pairs?.map(p=>p.id)||[]);
 const title={practice:'Práctica',exam:'Simulacro',historical:'Parcial 2024',formative:'Evaluación formativa',errors:'Repaso de errores'}[mode];
 attempt={id:Date.now()+'-'+Math.random().toString(36).slice(2,8),title,mode,policy:$('#policy').value,questions:selected,topics:structuredClone(bank.topics),sources:structuredClone(bank.sources),order,answers:{},checked:{},flags:{},manual:{},index:0,started:Date.now(),deadline:minutes?Date.now()+minutes*60000:null,finished:false};
 notice('');saveAttempt();openAttempt();
}
function openAttempt(){page='attempt';document.querySelectorAll('nav button').forEach(b=>b.removeAttribute('aria-current'));if(attempt.finished)renderResults();else renderQuestion();main.focus();window.scrollTo({top:0,behavior:'instant'});checkTimer();}
function answerValue(q){return attempt.answers[q.id];}
function score(q){return C.grade(q,answerValue(q),attempt.policy,attempt.manual[q.id]);}
function questionStatus(q){const checked=attempt.finished||attempt.checked[q.id];if(!checked)return C.answered(q,answerValue(q))?'Respuesta guardada':'Sin responder';const s=score(q);return s===null?'Pendiente de autoevaluación':s>=1?'Correcta':s>0?'Parcialmente correcta':'Incorrecta';}
function questionForm(q,locked){
 const a=answerValue(q),disabled=locked?' disabled':'';
 if(q.options){const ordered=attempt.order[q.id].map(id=>q.options.find(o=>o.id===id));return `<fieldset><legend>${esc(q.prompt)}</legend><p class="hint">${q.type==='multiple'?'Seleccione una o más opciones.':q.type==='truefalse'?'Seleccione Verdadero o Falso.':'Seleccione una opción.'}</p>${ordered.map((o,i)=>`<label class="option"><input type="${q.type==='multiple'?'checkbox':'radio'}" name="answer" value="${esc(o.id)}" ${a?.includes(o.id)?'checked':''}${disabled}><span class="letter">${String.fromCharCode(97+i)}.</span><span>${esc(o.text)}</span></label>`).join('')}</fieldset>`;}
 if(q.type==='matching')return `<p class="prompt" id="question-prompt">${esc(q.prompt)}</p><p class="hint">Elegí una definición para cada concepto. Cada par correcto suma la misma fracción del punto.</p>${q.pairs.map((p,i)=>`<div class="matching-row"><label for="pair-${i}">${esc(p.left)}</label><select id="pair-${i}" data-pair="${esc(p.id)}"${disabled}><option value="">Elegir…</option>${attempt.order[q.id].map(id=>{const opt=q.pairs.find(x=>x.id===id);return `<option value="${esc(id)}" ${a?.[p.id]===id?'selected':''}>${esc(opt.right)}</option>`;}).join('')}</select></div>`).join('')}`;
 if(q.type==='numeric')return `<label class="prompt" for="numeric-answer">${esc(q.prompt)}</label><p class="hint">Acepta coma o punto decimal. Ingresá solo el número, sin unidades ni símbolo %. Tolerancia: ±${esc(q.tolerance)}.</p><input id="numeric-answer" type="text" inputmode="decimal" autocomplete="off" value="${esc(a||'')}"${disabled}>`;
 return `<label class="prompt" for="essay-answer">${esc(q.prompt)}</label><p class="hint">Desarrollo adicional. Se evalúa con una rúbrica que vas a ver al corregir; el texto no se califica automáticamente.</p><textarea id="essay-answer" maxlength="20000"${disabled}>${esc(a||'')}</textarea>`;
}
function solution(q){
 if(q.options)return q.options.filter(o=>q.answer.includes(o.id)).map(o=>o.text).join('\n');
 if(q.type==='matching')return q.pairs.map(p=>p.left+' → '+p.right).join('\n');
 if(q.type==='numeric')return fmt(q.answer,Math.min(6,Math.max(2,String(q.tolerance).split('.')[1]?.length||0)));
 return '';
}
function feedbackHTML(q){
 const s=score(q),state=questionStatus(q);return `<section class="feedback" aria-label="Devolución"><h3 id="feedback-title" tabindex="-1">${esc(state)}${s!==null?' · '+fmt(s*q.points)+' / '+fmt(q.points):''}</h3>${q.note?`<p><strong>Nota sobre la fuente:</strong> ${esc(q.note)}</p>`:''}${q.type!=='essay'?`<p><strong>Respuesta correcta${q.type==='multiple'?'s':''}:</strong></p><p class="solution">${esc(solution(q))}</p>`:''}<p>${esc(q.explanation)}</p>${q.type==='essay'?`<div class="rubric-heading">Rúbrica de autoevaluación</div><ul>${q.rubric.map(r=>`<li>${esc(r)}</li>`).join('')}</ul><p>Asigná cuántos criterios cumpliste por completo. Esta nota es tu autoevaluación, no una corrección docente.</p><div class="manual-score" role="group" aria-label="Criterios cumplidos">${Array.from({length:q.rubric.length+1},(_,i)=>`<button data-manual="${i}" aria-pressed="${attempt.manual[q.id]===i/q.rubric.length}">${i} de ${q.rubric.length}</button>`).join('')}</div>`:''}<div class="source">${q.references.map(r=>sourceLink(r,attempt.sources)).join('<br>')}</div></section>`;
}
function renderQuestion(){
 if(!attempt)return showPage('home');const i=attempt.index,q=attempt.questions[i],locked=attempt.finished||!!attempt.checked[q.id];
 const saved=C.answered(q,answerValue(q));
 main.innerHTML=`<div class="intro-line"><div><h1>${esc(attempt.title)}</h1><p class="muted">${esc(topicName(q.topic))} · ${esc(TYPE[q.type])}</p></div><span class="saved" id="save-status">${storageWarning?'Guardado local no disponible':'Los cambios se guardan automáticamente'}</span></div>
 <div class="attempt-layout"><section><div class="question-toolbar"><span>${tag(q)} ID ${esc(q.id)}</span><button id="flag" class="flag" aria-pressed="${!!attempt.flags[q.id]}">${attempt.flags[q.id]?'Quitar marca':'Marcar para revisar'}</button></div>
 <div class="question-row"><aside class="question-meta"><strong>Pregunta ${i+1}</strong><p id="qstate">${esc(questionStatus(q))}</p><p>${locked&&score(q)!==null?'Se puntúa '+fmt(score(q)*q.points)+' sobre '+fmt(q.points):'Puntúa sobre '+fmt(q.points)}</p></aside><div><div class="question-box">${questionForm(q,locked)}</div><div id="feedback-area">${locked?feedbackHTML(q):''}</div>
 ${attempt.mode==='practice'||attempt.mode==='errors'?`<div class="actions">${!locked?'<button class="primary" id="check">Comprobar respuesta</button>':''}</div>`:''}
 <div class="actions"><button id="previous" ${i===0?'disabled':''}>Anterior</button><button id="next" ${i===attempt.questions.length-1?'disabled':''}>Siguiente</button><button id="summary">${attempt.finished?'Volver a resultados':'Resumen del intento'}</button></div></div></div></section><aside class="side-panel"><h2>Navegación del cuestionario</h2><div id="timer" class="timer"></div><div id="question-grid"></div><div class="legend"><div><span></span>Sin responder</div><div><span class="done"></span>Respuesta guardada</div><div>Esquina ocre: marcada para revisar</div></div><div class="actions"><button class="primary full" id="finish">${attempt.finished?'Ver resultados':'Terminar intento…'}</button><button id="leave">Guardar y volver al inicio</button></div></aside></div>`;
 renderGrid();updateTimerText();
 $('#flag').onclick=()=>{attempt.flags[q.id]=!attempt.flags[q.id];saveAttempt();renderQuestion();$('#flag').focus({preventScroll:true});};
 $('#previous').onclick=()=>goQuestion(i-1);$('#next').onclick=()=>goQuestion(i+1);$('#summary').onclick=()=>attempt.finished?renderResults():renderSummary();$('#finish').onclick=()=>attempt.finished?renderResults():renderSummary();$('#leave').onclick=()=>showPage('home');
 const capture=()=>{
  if(locked)return;
  if(q.options)attempt.answers[q.id]=[...main.querySelectorAll('input[name=answer]:checked')].map(e=>e.value);
  else if(q.type==='matching')attempt.answers[q.id]=Object.fromEntries([...main.querySelectorAll('[data-pair]')].map(e=>[e.dataset.pair,e.value]));
  else attempt.answers[q.id]=$('#'+(q.type==='numeric'?'numeric-answer':'essay-answer')).value;
  saveAttempt();$('#qstate').textContent=questionStatus(q);renderGrid();
 };
 main.querySelectorAll('.question-box input,.question-box select,.question-box textarea').forEach(e=>e.addEventListener(e.tagName==='SELECT'||e.type==='checkbox'||e.type==='radio'?'change':'input',capture));
 $('#check')?.addEventListener('click',()=>{
  capture();if(!C.answered(q,answerValue(q))){notice('Completá la respuesta antes de comprobarla. En emparejamiento, elegí una definición para cada concepto.');return;}
  if(q.type==='numeric'&&C.parseNumber(answerValue(q))===null){notice('Ingresá un número válido: por ejemplo 0,75 o 0.75, sin unidades.');return;}
  notice('');attempt.checked[q.id]=true;saveAttempt();renderQuestion();$('#feedback-title').focus({preventScroll:true});$('#feedback-area').scrollIntoView({block:'nearest'});
 });bindManual(q);
}
function bindManual(q){main.querySelectorAll('[data-manual]').forEach(b=>b.onclick=()=>{attempt.manual[q.id]=Number(b.dataset.manual)/q.rubric.length;if(attempt.finished)updateFinishedRecords(q.id);saveAttempt();renderQuestion();$('#feedback-title').focus({preventScroll:true});});}
function renderGrid(){
 const grid=$('#question-grid');if(!grid)return;
 grid.innerHTML=`<div class="question-grid">${attempt.questions.map((q,i)=>{let state=C.answered(q,answerValue(q))?'answered':'';if(attempt.finished||attempt.checked[q.id]){const s=score(q);if(s!==null)state=s>=1?'correct':s>0?'partial':'incorrect';}return `<button data-go="${i}" class="${state} ${attempt.flags[q.id]?'marked':''} ${i===attempt.index?'current':''}" aria-label="Pregunta ${i+1}: ${esc(questionStatus(q))}${attempt.flags[q.id]?', marcada':''}" ${i===attempt.index?'aria-current="step"':''}>${i+1}</button>`;}).join('')}</div>`;
 grid.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>goQuestion(Number(b.dataset.go)));
}
function goQuestion(i){attempt.index=i;saveAttempt();renderQuestion();main.focus();window.scrollTo({top:0,behavior:'instant'});}
function renderSummary(){
 const pending=attempt.questions.filter(q=>!C.answered(q,answerValue(q))).length,marked=attempt.questions.filter(q=>attempt.flags[q.id]).length;
 main.innerHTML=`<h1>Resumen del intento</h1><p class="lead">Revisá tus respuestas antes de enviar. Después del envío podrás consultar soluciones y explicaciones.</p><div class="summary-list"><div><strong>${attempt.questions.length-pending} de ${attempt.questions.length}</strong>Preguntas respondidas</div><div><strong>${pending}</strong>Sin completar</div><div><strong>${marked}</strong>Marcadas para revisar</div></div><div id="timer" class="timer"></div><div class="table-wrap"><table><thead><tr><th>Pregunta</th><th>Estado</th><th>Revisión</th></tr></thead><tbody>${attempt.questions.map((q,i)=>`<tr><td><button data-go="${i}">Pregunta ${i+1}</button></td><td>${esc(questionStatus(q))}</td><td>${attempt.flags[q.id]?'Marcada':'—'}</td></tr>`).join('')}</tbody></table></div>${pending?'<p class="notice-inline">Las respuestas vacías o incompletas no se excluyen de la nota: reciben el crédito que corresponda, hasta 0. En emparejamiento se conservan los pares correctos.</p>':''}<div class="actions"><button class="primary" id="submit-final">Enviar todo y terminar</button><button id="back-question">Volver al cuestionario</button></div>`;
 main.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>goQuestion(Number(b.dataset.go)));$('#submit-final').onclick=()=>finishAttempt(false);$('#back-question').onclick=()=>renderQuestion();updateTimerText();window.scrollTo({top:0,behavior:'instant'});
}
function updateFinishedRecords(onlyQuestionId=null){
 progress=C.recordProgress(progress,attempt,onlyQuestionId);
 write('progress',progress);const existing=history.findIndex(h=>h.id===attempt.id);if(existing>=0)history[existing]=structuredClone(attempt);else history.unshift(structuredClone(attempt));history=history.slice(0,12);write('history',history);
}
function finishAttempt(expired){
 if(attempt.finished)return;attempt.finished=true;attempt.ended=Date.now();attempt.expired=expired;updateFinishedRecords();saveAttempt();renderResults();if(expired)notice('Se cumplió el tiempo límite. El intento se envió automáticamente con las respuestas guardadas.');
}
function resultStats(a){let earned=0,autoEarned=0,autoMax=0,max=0,pending=0;for(const q of a.questions){const s=C.grade(q,a.answers[q.id],a.policy,a.manual[q.id]);max+=q.points;if(q.type!=='essay'){autoMax+=q.points;autoEarned+=(s||0)*q.points;}if(s===null)pending++;else earned+=s*q.points;}return {earned,max,pending,autoEarned,autoMax};}
function renderResults(){
 const st=resultStats(attempt),byTopic=new Map;for(const q of attempt.questions){if(!byTopic.has(q.topic))byTopic.set(q.topic,{points:0,max:0,pending:0});const t=byTopic.get(q.topic),s=score(q);t.max+=q.points;if(s===null)t.pending++;else t.points+=s*q.points;}
 const duration=Math.max(0,Math.floor((attempt.ended-attempt.started)/1000));
 main.innerHTML=`<h1>Revisión del intento</h1><section class="results-summary"><p><strong>${esc(attempt.title)}</strong> · ${new Date(attempt.ended).toLocaleString('es-AR')}</p>${st.pending?`<p class="score">${st.autoMax?fmt(st.autoEarned/st.autoMax*10)+' / 10':'Sin preguntas automáticas'} <small>Nota de la parte automática</small></p><p>${st.pending} desarrollo(s) pendiente(s) de autoevaluación. La nota global se muestra cuando completes las rúbricas.</p>`:`<p class="score">${fmt(st.earned/st.max*10)} / 10 <small>(${fmt(st.earned/st.max*100,1)}%)</small></p>`}<p>${fmt(st.earned)} de ${fmt(st.max)} puntos registrados · ${Math.floor(duration/60)} min ${duration%60} s ${attempt.expired?'· tiempo agotado':''}</p><p class="muted">Corrección múltiple: ${attempt.policy==='strict'?'exigente, con descuento por distractores':'crédito positivo sin descuento'}. Los desarrollos se califican por autoevaluación.</p><div class="actions"><button class="primary" id="review-first">Revisar respuestas</button><button id="export-result">Descargar resultado</button><button id="new-attempt">Nuevo intento</button></div></section>
 <h2>Resultado por tema</h2><div class="table-wrap"><table><thead><tr><th>Tema</th><th>Puntos</th><th>Para el repaso</th></tr></thead><tbody>${[...byTopic].map(([topic,t])=>`<tr><td>${esc(topicName(topic))}</td><td>${fmt(t.points)} / ${fmt(t.max)}</td><td>${t.pending?'Rúbrica pendiente':t.points/t.max>=.9?'Buen resultado en este intento':'Reforzar y volver a practicar'}</td></tr>`).join('')}</tbody></table></div>
 <h2>Respuestas y devoluciones</h2><p class="muted">Abrí una pregunta para ver tu respuesta, la solución y la fuente. Verde: correcta; ocre: parcial; rojo: incorrecta.</p><div class="review-list">${attempt.questions.map((q,i)=>{const s=score(q);return `<button data-review="${i}"><div>Pregunta ${i+1} · ${esc(q.prompt)}</div><span class="${s===1?'good':s===0?'bad':''}">${esc(questionStatus(q))}${s===null?'':' · '+fmt(s*q.points)+'/'+fmt(q.points)}</span></button>`;}).join('')}</div>`;
 $('#review-first').onclick=()=>goQuestion(0);$('#export-result').onclick=()=>download('resultado-'+attempt.id+'.json',{schemaVersion:1,attempt,summary:st});$('#new-attempt').onclick=()=>showPage('home');main.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>goQuestion(Number(b.dataset.review)));window.scrollTo({top:0,behavior:'instant'});
}
function updateTimerText(){const el=$('#timer');if(!el||!attempt)return;if(attempt.finished){el.textContent='Intento finalizado';return;}if(!attempt.deadline){el.textContent='Sin límite de tiempo';return;}const remaining=Math.max(0,Math.ceil((attempt.deadline-Date.now())/1000));el.textContent=`Tiempo restante: ${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;el.classList.toggle('urgent',remaining<=60);}
function checkTimer(){if(attempt&&!attempt.finished&&attempt.deadline&&Date.now()>=attempt.deadline){page='attempt';finishAttempt(true);}else updateTimerText();}setInterval(checkTimer,1000);document.addEventListener('visibilitychange',checkTimer);
function renderCoverage(){
 const rows=bank.topics.map(t=>{const qs=bank.questions.filter(q=>q.topic===t.id);return {t,qs,seen:qs.filter(q=>progress[q.id]),errors:qs.filter(q=>progress[q.id]?.lastScore<1)};});
 main.innerHTML=`<h1>Cobertura del temario</h1><p class="lead">El banco organiza los contenidos desarrollados en ${bank.topics.length} áreas. Haber respondido una pregunta no demuestra dominar todo un tema: usá el resultado para orientar el próximo repaso.</p><div class="table-wrap"><table><thead><tr><th>Tema</th><th>Banco</th><th>Evaluadas</th><th>Para reforzar</th></tr></thead><tbody>${rows.map(({t,qs,seen,errors})=>`<tr><td>${esc(t.title)}</td><td>${qs.length}</td><td>${seen.length}</td><td>${errors.length}</td></tr>`).join('')}</tbody></table></div><h2>Modalidades incluidas</h2><p>${Object.entries(TYPE).map(([k,v])=>`${esc(v)}: <strong>${bank.questions.filter(q=>q.type===k).length}</strong>`).join(' · ')}</p><h2>Alcance que conviene tener presente</h2><ul class="plain-list">${(bank.notes||[]).map(n=>`<li>${esc(n)}</li>`).join('')}</ul><h2>Documentación descargable</h2><p><a href="COBERTURA.md" download>Mapa de cobertura e índice completo</a> · <a href="CRITERIOS.md" download>Correcciones y criterios de evaluación</a></p>`;
}
function renderBank(){
 const filtered=bank.questions.filter(q=>(bankTopic==='all'||q.topic===bankTopic)&&(q.prompt+' '+q.id+' '+topicName(q.topic)).toLocaleLowerCase('es').includes(bankQuery.toLocaleLowerCase('es'))),size=20,pages=Math.max(1,Math.ceil(filtered.length/size));bankPage=Math.min(bankPage,pages-1);
 main.innerHTML=`<h1>Banco de preguntas y JSON</h1><p class="lead">Buscá consignas, consultá soluciones o incorporá preguntas nuevas. Los cambios importados se guardan en este navegador; exportá el banco para llevarlos a otra instalación.</p><div class="actions"><button id="export-bank">Exportar banco completo</button><a href="FORMATO-JSON.md" target="_blank">Documentación del formato</a><a href="ejemplo-importacion.json" download>Ejemplo para agregar preguntas</a><a href="banco.schema.json" download>Esquema JSON</a></div>
 <details><summary>Agregar preguntas desde un archivo JSON</summary><p>La importación suma preguntas con identificadores nuevos. Conserva el banco actual y rechaza cambios que entren en conflicto. Cada pregunta debe incluir solución, explicación y referencia. No convierte PDFs automáticamente.</p><label for="import-bank">Archivo del banco o paquete de preguntas</label><input type="file" id="import-bank" accept=".json,application/json"><div id="import-status" role="status"></div></details>
 <div class="searchbar"><div><label for="bank-search">Buscar por consigna o ID</label><input type="search" id="bank-search" value="${esc(bankQuery)}" placeholder="Ejemplo: F1, PCA, CD-010"></div><div><label for="bank-topic">Filtrar tema</label><select id="bank-topic"><option value="all">Todos los temas</option>${bank.topics.map(t=>`<option value="${esc(t.id)}" ${bankTopic===t.id?'selected':''}>${esc(t.title)}</option>`).join('')}</select></div></div><p class="page-count">${filtered.length} preguntas · página ${bankPage+1} de ${pages}</p><div id="bank-items">${filtered.length?filtered.slice(bankPage*size,(bankPage+1)*size).map(q=>`<article class="bank-item"><small>${esc(q.id)} · ${esc(topicName(q.topic))} · ${esc(TYPE[q.type])}</small><p>${tag(q)} ${esc(q.prompt)}</p><details><summary>Ver solución y fundamento</summary>${q.note?`<p><strong>${esc(q.note)}</strong></p>`:''}<p class="solution">${esc(q.type==='essay'?q.rubric.join(' · '):solution(q))}</p><p>${esc(q.explanation)}</p><small>${q.references.map(r=>sourceLink(r)).join('<br>')}</small></details></article>`).join(''):'<div class="empty"><p>No se encontraron preguntas. Probá otro término o quitá el filtro de tema.</p></div>'}</div><div class="actions"><button id="bank-prev" ${bankPage===0?'disabled':''}>Página anterior</button><button id="bank-next" ${bankPage===pages-1?'disabled':''}>Página siguiente</button></div>`;
 $('#export-bank').onclick=()=>download('banco-ciencia-de-datos.json',bank);$('#bank-search').oninput=e=>{const pos=e.target.selectionStart;bankQuery=e.target.value;bankPage=0;renderBank();$('#bank-search').focus();$('#bank-search').setSelectionRange(pos,pos);};$('#bank-topic').onchange=e=>{bankTopic=e.target.value;bankPage=0;renderBank();};$('#bank-prev').onclick=()=>{bankPage--;renderBank();};$('#bank-next').onclick=()=>{bankPage++;renderBank();};$('#import-bank').onchange=importBank;
}
async function importBank(e){
 const file=e.target.files[0];if(!file)return;const status=$('#import-status');if(file.size>8*1024*1024){status.textContent='El archivo supera 8 MB. Dividilo en paquetes más chicos.';return;}
 try{
 const incoming=JSON.parse(await file.text()),errors=C.validateBank(incoming);if(errors.length)throw new Error(errors.join('\n'));
 const ids=new Set(bank.questions.map(q=>q.id));const duplicates=incoming.questions.filter(q=>ids.has(q.id));if(duplicates.length)throw new Error('IDs de preguntas ya existentes: '+duplicates.slice(0,8).map(q=>q.id).join(', ')+'. Asigná IDs nuevos antes de importar.');
 const merge=(old,news,fields)=>{const out=structuredClone(old);for(const obj of news){const existing=out.find(o=>o.id===obj.id);if(existing){if(fields.some(f=>existing[f]!==obj[f]))throw new Error('Conflicto con el identificador '+obj.id+'. Usá otro ID para contenido diferente.');}else out.push(obj);}return out;};
 const merged={...bank,topics:merge(bank.topics,incoming.topics,['title']),sources:merge(bank.sources,incoming.sources,['title','url']),questions:[...bank.questions,...incoming.questions],notes:[...new Set([...(bank.notes||[]),...(incoming.notes||[])])]};const problems=C.validateBank(merged);if(problems.length)throw new Error(problems.join('\n'));bank=merged;const saved=write('bank',bank);renderBank();notice(`Se agregaron ${incoming.questions.length} preguntas. ${saved?'El banco quedó guardado en este navegador.':'Exportá el banco para conservarlo.'}`);
 }catch(err){status.innerHTML=`<p class="notice-inline">No se importó nada. ${esc(err.message)}</p>`;}
}
function renderSources(){
 main.innerHTML=`<h1>Fuentes y criterios de estudio</h1><p class="lead">La estructura reproduce lo observado en las revisiones Moodle: pregunta, estado, puntos, respuesta y devolución. Las soluciones nuevas se fundamentan en el material; no son preguntas oficiales de la cátedra.</p><h2>Cómo se corrige</h2><ul class="plain-list"><li>Opción única y verdadero/falso: 1 o 0 del puntaje de la pregunta.</li><li>Selección múltiple exigente: fracción de opciones correctas elegidas menos fracción de distractores elegidos, con mínimo 0. La modalidad de crédito positivo no resta distractores.</li><li>Emparejamiento: proporción de pares correctos. Una selección vacía no suma.</li><li>Numérica: coincidencia dentro de la tolerancia absoluta indicada; acepta coma o punto decimal.</li><li>Desarrollo: autoevaluación con rúbrica, sin corrección automática del texto. La nota global queda pendiente hasta evaluarlo.</li><li>El temporizador usa una fecha de vencimiento y envía al llegar al plazo, incluso si saliste de la pantalla del intento.</li></ul><h2>Errores y ambigüedades del material</h2><p>Se corrigieron la fórmula F1, la cota de entropía, la normalización de loadings PCA y el significado del ajuste decimal. También se precisan las afirmaciones sobre costo cero, sesgo al borrar nulos, normalidad en logística y selección con test.</p><p><a href="CRITERIOS.md" target="_blank">Leer las correcciones y límites completos</a></p><h2>Documentos utilizados</h2><div class="source-list">${bank.sources.map(s=>`<article><h3><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a></h3><p>ID de referencia: ${esc(s.id)} · ${bank.questions.filter(q=>q.references.some(r=>r.source===s.id)).length} preguntas enlazan este documento.</p></article>`).join('')}</div><h2>Ampliaciones verificadas</h2><p><a href="https://scikit-learn.org/stable/modules/generated/sklearn.metrics.f1_score.html" target="_blank" rel="noopener noreferrer">Definición de F1 en scikit-learn</a> · <a href="https://scikit-learn.org/stable/modules/clustering.html" target="_blank" rel="noopener noreferrer">Guía de clustering</a></p><p class="muted">El artículo DDS se consultó para contrastar iteraciones y revisiones. El libro de Bonaccorso se identificó como bibliografía adicional; no se auditó íntegramente ni se usó como temario obligatorio.</p>`;
}
function renderHistory(){
 main.innerHTML=`<h1>Mis intentos</h1><p class="lead">Se conservan hasta 12 intentos completos en este navegador. Exportá el progreso para hacer una copia o continuarlo en otra instalación.</p><div class="actions"><button id="export-progress">Exportar progreso</button></div><details><summary>Restaurar una copia de progreso</summary><p>La restauración reemplaza el historial y el intento local por los de tu copia. El banco actual se conserva; importá por separado cualquier pregunta nueva.</p><label for="import-progress">Copia JSON de progreso</label><input type="file" id="import-progress" accept=".json,application/json"><div id="progress-status" role="status"></div></details>${history.length?`<div class="table-wrap"><table><thead><tr><th>Intento</th><th>Fecha</th><th>Nota</th><th>Revisión</th></tr></thead><tbody>${history.map((h,i)=>{const s=resultStats(h);return `<tr><td>${esc(h.title)}<br><small>${h.questions.length} preguntas</small></td><td>${new Date(h.ended).toLocaleString('es-AR')}</td><td>${s.pending?'Rúbrica pendiente':fmt(s.earned/s.max*10)+' / 10'}</td><td><button data-history="${i}">Ver intento</button></td></tr>`;}).join('')}</tbody></table></div>`:'<div class="empty"><p>Todavía no finalizaste ningún intento. Comenzá una práctica para ver tus resultados acá.</p><button id="empty-start">Configurar una práctica</button></div>'}`;
 $('#export-progress').onclick=()=>download('progreso-ciencia-de-datos.json',{schemaVersion:1,kind:'cdquiz-progress',progress,history,attempt,exportedAt:new Date().toISOString()});$('#empty-start')?.addEventListener('click',()=>showPage('home'));
 main.querySelectorAll('[data-history]').forEach(b=>b.onclick=()=>{
 if(attempt&&!attempt.finished){notice('Hay un intento en curso. Finalizalo o exportá una copia antes de abrir otro intento del historial.');return;}
 attempt=structuredClone(history[Number(b.dataset.history)]);saveAttempt();page='attempt';renderResults();
 });$('#import-progress').onchange=importProgress;
}
function validAttempt(a){
 if(!a||typeof a!=='object'||!Array.isArray(a.questions)||!a.questions.length)return false;
 if(C.validateBank({schemaVersion:1,title:'Intento',topics:a.topics,sources:a.sources,questions:a.questions}).length)return false;
 if(!['strict','historical'].includes(a.policy)||!['practice','exam','historical','formative','errors'].includes(a.mode)||typeof a.title!=='string'||typeof a.id!=='string'||!Number.isFinite(a.started)||!Number.isInteger(a.index)||a.index<0||a.index>=a.questions.length||typeof a.finished!=='boolean')return false;
 if(a.deadline!==null&&(!Number.isFinite(a.deadline)||a.deadline<a.started))return false;
 if(a.finished&&(!Number.isFinite(a.ended)||a.ended<a.started))return false;
 for(const name of ['order','answers','checked','flags','manual'])if(!a[name]||typeof a[name]!=='object'||Array.isArray(a[name]))return false;
 for(const q of a.questions){
 if(!Array.isArray(a.order[q.id]))return false;const ids=q.options?.map(o=>o.id)||q.pairs?.map(p=>p.id)||[];
 if(a.order[q.id].length!==ids.length||new Set(a.order[q.id]).size!==ids.length||a.order[q.id].some(id=>!ids.includes(id)))return false;
 const val=a.answers[q.id];if(val!==undefined){if(q.options&&(!Array.isArray(val)||val.some(id=>!ids.includes(id))))return false;if(['numeric','essay'].includes(q.type)&&typeof val!=='string')return false;if(q.type==='matching'&&(!val||typeof val!=='object'||Array.isArray(val)||Object.entries(val).some(([k,v])=>!ids.includes(k)||(v!==''&&!ids.includes(v)))))return false;}
 if(a.manual[q.id]!==undefined&&(!Number.isFinite(a.manual[q.id])||a.manual[q.id]<0||a.manual[q.id]>1||q.type!=='essay'))return false;
 }return true;
}
async function importProgress(e){
 const file=e.target.files[0];if(!file)return;const status=$('#progress-status');if(file.size>12*1024*1024){status.textContent='La copia supera 12 MB.';return;}
 try{const copy=JSON.parse(await file.text());if(copy.schemaVersion!==1||copy.kind!=='cdquiz-progress'||!Array.isArray(copy.history)||copy.history.length>12||copy.history.some(a=>!validAttempt(a)||!a.finished)||(copy.attempt!==null&&!validAttempt(copy.attempt))||!copy.progress||typeof copy.progress!=='object'||Array.isArray(copy.progress)||Object.values(copy.progress).some(p=>!p||!Number.isFinite(p.lastScore)||p.lastScore<0||p.lastScore>1||!Number.isInteger(p.attempts)||p.attempts<0))throw new Error('La copia de progreso tiene un formato inválido.');
 status.innerHTML='<p class="notice-inline">La copia es válida. Confirmá para reemplazar el historial y el intento locales.</p><button id="restore-progress" class="danger">Reemplazar progreso por esta copia</button>';
 $('#restore-progress').onclick=()=>{progress=copy.progress;history=copy.history;attempt=copy.attempt;write('progress',progress);write('history',history);write('attempt',attempt);notice('Se restauró la copia de progreso.');renderHistory();checkTimer();};
 }catch(err){status.innerHTML=`<p class="notice-inline">No se cambió el progreso. ${esc(err.message)}</p>`;}
}
function download(name,value){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
if(C.validateBank(window.INITIAL_BANK).length){main.textContent='No se pudo cargar el banco original. Revisá que bank.js se encuentre junto a index.html.';}else{showPage('home',false);checkTimer();}
