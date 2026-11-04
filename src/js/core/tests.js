// ---------- тесты (контроль знаний) ----------
// Тренажёр — практика с подсказками; тест — проверка без подсказок, с оценкой 2–5.
// Тест по уроку — TEST_LEN вопросов урока, итоговый — FINAL_LEN вопросов по всей главе.
// Глава завершена, когда сданы (на TEST_PASS и выше) все тесты по урокам и итоговый.
const TEST_PASS=3,TEST_LEN=6,FINAL_LEN=12;
let TS=null; // идущий тест: {ch,key,title,qs,i,ans,t0,res}
const tKey=(c,k)=>c.id+':'+k;
const tRes=(c,k)=>(S.tests||{})[tKey(c,k)];
const tPassed=(c,k)=>{const r=tRes(c,k);return !!(r&&r.best>=TEST_PASS)};
const tAll=c=>c.tests?[...c.lessons.map((_,i)=>i+1),'final']:[];
const chTestsDone=c=>!!c.tests&&tAll(c).every(k=>tPassed(c,k));
const tGrade=p=>p>=.9?5:p>=.75?4:p>=.5?3:2;
const pick1=a=>a[Math.floor(Math.random()*a.length)];
const tNorm=s=>String(s).toLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ').trim();
const T_KIND={one:'Выбрать один ответ',many:'Выбрать все верные ответы',type:'Вписать ответ',sort:'Разложить по группам'};
const tTitle=(c,k)=>k==='final'?'Итоговый тест по главе':`Тест по уроку ${k}`;

// собрать один вопрос из «слота»: случайная формулировка, пример, порядок ответов
function tBuild(s){
 let it=s.items?pick1(s.items):{a:s.a,why:s.why};
 if(Array.isArray(it))it={w:it[0],a:it[1],why:it[2]};
 const q=pick1(s.q),inl=q.includes('{w}');
 const B={k:s.k,l:s.l,text:q.replace('{w}',it.w||'').replace('{x}',it.x||''),w:inl?null:(it.w||null),a:it.a,why:it.why||s.why||''};
 if(s.k==='one'){const all=it.o||s.o,n=s.n||all.length;B.opts=shuffle([B.a,...shuffle(all.filter(x=>x!==B.a)).slice(0,n-1)])}
 if(s.k==='many')B.opts=shuffle(s.o);
 if(s.k==='sort'){B.cats=s.cats;B.items=shuffle(s.items).slice(0,s.n||6)}
 return B;
}
function tStart(c,k){
 let slots;
 if(k==='final'){ // по одному вопросу из каждого урока, остальное — случайно
  const by=c.lessons.map((_,i)=>shuffle(c.tests.filter(s=>s.l===i+1)));
  slots=by.map(a=>a[0]).filter(Boolean);const rest=shuffle(by.flatMap(a=>a.slice(1)));
  slots=shuffle([...slots,...rest.slice(0,Math.max(0,FINAL_LEN-slots.length))]);
 } else slots=shuffle(c.tests.filter(s=>s.l===k)).slice(0,TEST_LEN);
 TS={ch:c.id,key:k,title:tTitle(c,k),qs:slots.map(tBuild),i:0,ans:[],t0:Date.now(),res:null};
}
function tAnswered(B,a){
 if(B.k==='one')return a!=null;
 if(B.k==='many')return !!(a&&a.length);
 if(B.k==='type')return !!(a&&a.trim());
 if(B.k==='sort')return !!a&&B.items.every((_,i)=>a[i]!=null);
}
function tScore(B,a){ // 0…1
 if(B.k==='one')return a===B.a?1:0;
 if(B.k==='many'){const x=[...(a||[])].sort().join('|'),y=[...B.a].sort().join('|');return x===y?1:0}
 if(B.k==='type'){const ok=Array.isArray(B.a)?B.a:[B.a];return ok.some(v=>tNorm(v)===tNorm(a||''))?1:0}
 if(B.k==='sort')return B.items.filter((it,i)=>a&&a[i]===it[1]).length/B.items.length;
}
const tFill=(w,v)=>esc(w).replace('_',`<span class="slot">${v==null?'…':esc(v)}</span>`);
function tShowAns(B,a){ // ответ ученика / верный ответ — текстом для разбора
 if(B.k==='sort')return B.items.map((it,i)=>`${esc(it[0])} — ${esc(a&&a[i]!=null?a[i]:'?')}`).join('; ');
 if(B.k==='many')return (a&&a.length?a:['—']).map(esc).join('; ');
 return esc(a==null||a===''?'—':a);
}
function tRight(B){
 if(B.k==='sort')return B.items.map(it=>`${esc(it[0])} — ${esc(it[1])}`).join('; ');
 if(B.k==='many')return B.a.map(esc).join('; ');
 return esc(Array.isArray(B.a)?B.a[0]:B.a);
}
function tFinish(){
 const c=CHAPTERS[TS.ch],sc=TS.qs.map((B,i)=>tScore(B,TS.ans[i])),sum=sc.reduce((x,y)=>x+y,0),p=sum/TS.qs.length,g=tGrade(p);
 const was=chTestsDone(c);
 S.tests=S.tests||{};const k=tKey(c,TS.key),r=S.tests[k]||{best:0,tries:0};
 r.tries++;r.last=g;r.best=Math.max(r.best,g);r.at=today();S.tests[k]=r;
 // журнал попыток — для будущей статистики и синхронизации с сервером учителя
 S.tlog=(S.tlog||[]).concat({t:k,g,p:Math.round(p*100),n:TS.qs.length,at:Date.now(),sec:Math.round((Date.now()-TS.t0)/1000)}).slice(-300);
 save();TS.res={sc,sum,p,g};
 if(!was&&chTestsDone(c))setTimeout(()=>toast('Глава завершена — все тесты сданы!'),300);
}

function testsHTML(){
 const c=CC();
 if(TS&&TS.ch===c.id)return `<div id="tests" class="bktext">${TS.res?tResHTML(c):tRunHTML(c)}</div>`;
 const all=tAll(c),pass=all.filter(k=>tPassed(c,k)).length,done=chTestsDone(c);
 const row=k=>{const r=tRes(c,k),ok=tPassed(c,k),n=k==='final'?FINAL_LEN:Math.min(TEST_LEN,c.tests.filter(s=>s.l===k).length);
  return `<div class="tsrow ${ok?'ok':''} ${k==='final'?'fin':''}"><div class="tsinfo"><b>${k==='final'?'Итоговый тест по главе':`Урок ${k}. ${c.lnames[k]}`}</b>
  <span>${n} вопросов${r?` · лучшая оценка ${r.best} · попыток ${r.tries}`:' · ещё не пройден'}</span></div>
  ${ok?'<span class="tsok">✓ сдан</span>':''}<button class="${ok?'ghost':'bkldone'}" data-tsgo="${k}">${r?'Ещё раз':'Начать'}</button></div>`};
 return `<div id="tests" class="bktext">${done?`<div class="tsdone"><b>✓ Глава завершена</b><span>Все тесты сданы. Оценки можно улучшить — тест всегда можно пройти ещё раз.</span></div>`:''}
 <div class="bins btip"><div class="h">Как устроены тесты</div><p>Тест проверяет знания без подсказок. Вопросы и порядок ответов каждый раз новые. Тест сдан, если оценка ${TEST_PASS} или выше: 5 — от 90% верных ответов, 4 — от 75%, 3 — от 50%.</p><p><b>Глава считается завершённой, когда сданы тесты по всем урокам и итоговый.</b></p></div>
 <div class="prog"><span>Сдано ${pass} из ${all.length}</span></div><div class="bar"><i style="width:${pass/all.length*100}%"></i></div>
 <div class="tslist">${c.lessons.map((_,i)=>row(i+1)).join('')}${row('final')}</div></div>`;
}
function tRunHTML(c){
 const B=TS.qs[TS.i],a=TS.ans[TS.i],N=TS.qs.length,last=TS.i===N-1;
 let body='';
 if(B.k==='one'||B.k==='many')body=`<div class="tsopts">${B.opts.map((v,j)=>{const on=B.k==='one'?a===v:!!(a&&a.includes(v));
  return `<button class="opt tsopt ${on?'on':''}" data-tsa="${j}" aria-pressed="${on}">${B.k==='many'?`<i class="tsbox">${on?'✓':''}</i>`:''}${esc(v)}</button>`}).join('')}</div>`;
 if(B.k==='type')body=`<form class="tsform" data-tsform><input name="a" value="${esc(a||'')}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="next" aria-label="Ответ" placeholder="Ответ"></form>`;
 if(B.k==='sort')body=`<div class="tssort">${B.items.map((it,i)=>`<div class="tssr"><span class="tsw">${esc(it[0])}</span><span class="seg">${B.cats.map(ct=>`<button data-tss="${i}" data-v="${esc(ct)}" aria-pressed="${!!a&&a[i]===ct}">${esc(ct)}</button>`).join('')}</span></div>`).join('')}</div>`;
 return `<div class="tshead"><div class="kick">${TS.title}</div><span>Вопрос ${TS.i+1} из ${N}</span></div><div class="bar"><i style="width:${TS.i/N*100}%"></i></div>
 <div class="card tscard"><div class="ty">${T_KIND[B.k]}</div><div class="tq">${esc(B.text)}</div>${B.w?`<div class="word tsword">${B.k==='type'&&B.w.includes('_')?tFill(B.w,null):esc(B.w)}</div>`:''}${body}</div>
 <div class="tsnav">${TS.i?'<button class="ghost" data-tsprev>‹ Назад</button>':'<span></span>'}<button class="bkldone" data-tsnext>${last?'Завершить тест':'Дальше'}</button></div>
 <button class="linkbtn tsquit" data-tsquit>Прервать тест</button>`;
}
function tResHTML(c){
 const R=TS.res,N=TS.qs.length,ok=R.g>=TEST_PASS,wrong=TS.qs.map((B,i)=>[B,i]).filter(([B,i])=>R.sc[i]<1);
 const fmt=x=>Math.round(x*10)/10;
 return `<div class="tsres ${ok?'ok':'bad'}"><div class="kick">${TS.title}</div><div class="tsgrade">${R.g}</div>
 <div class="tsrs"><b>${ok?'Тест сдан':'Тест не сдан'}</b><span>Верно ${fmt(R.sum)} из ${N} (${Math.round(R.p*100)}%)${ok?'':` · нужна оценка ${TEST_PASS} или выше`}</span></div></div>
 ${wrong.length?`<h3>Разбор ошибок</h3>${wrong.map(([B,i])=>`<div class="tsm"><div class="q">${esc(B.text)}${B.w?` <b>${esc(B.w)}</b>`:''}</div>
  <div class="tsa"><span class="tsn">Ответ: ${tShowAns(B,TS.ans[i])}</span><span class="tsy">Верно: ${tRight(B)}</span></div>${B.why?`<div class="why">${esc(B.why)}</div>`:''}
  <button class="linkbtn" data-ojump="${c.lessons[B.l-1].id}">Повторить урок ${B.l} ›</button></div>`).join('')}`:'<p class="note">Ошибок нет.</p>'}
 <div class="tsnav"><button class="ghost" data-tslist>К списку тестов</button><button class="bkldone" data-tsgo="${TS.key}">Пройти ещё раз</button></div>`;
}
function tsRe(){const el=document.getElementById('tests');if(!el){render();return}el.outerHTML=testsHTML();termsIn(document.getElementById('tests'));
 const t=document.getElementById('tests');if(t&&t.getBoundingClientRect().top<0)t.scrollIntoView({block:'start'});const inp=document.querySelector('[data-tsform] input');if(inp&&matchMedia('(hover:hover)').matches)inp.focus()}
function tsNext(){
 const B=TS.qs[TS.i],inp=document.querySelector('[data-tsform] input');if(inp)TS.ans[TS.i]=inp.value;
 if(!tAnswered(B,TS.ans[TS.i])){toast(B.k==='type'?'Сначала вписать ответ':B.k==='sort'?'Сначала разложить все слова':'Сначала выбрать ответ');return}
 if(TS.i<TS.qs.length-1)TS.i++;else tFinish();
 tsRe();
}
document.addEventListener('submit',e=>{if(!e.target.matches('[data-tsform]'))return;e.preventDefault();tsNext()});
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.tsgo!==undefined){const c=CC();tStart(c,d.tsgo==='final'?'final':+d.tsgo);S.tab='tests';CLR=null;save();go({v:'ch',id:c.id});return}
 if(!TS)return;
 if(d.tsa!==undefined){const B=TS.qs[TS.i],v=B.opts[+d.tsa];if(B.k==='one')TS.ans[TS.i]=v;else{const s=new Set(TS.ans[TS.i]||[]);s.has(v)?s.delete(v):s.add(v);TS.ans[TS.i]=[...s]}tsRe();return}
 if(d.tss!==undefined){const a=TS.ans[TS.i]||(TS.ans[TS.i]={});a[+d.tss]=d.v;tsRe();return}
 if('tsnext' in d){tsNext();return}
 if('tsprev' in d){const inp=document.querySelector('[data-tsform] input');if(inp)TS.ans[TS.i]=inp.value;TS.i--;tsRe();return}
 if('tsquit' in d){if(confirm('Прервать тест? Ответы не сохранятся.')){TS=null;tsRe()}return}
 if('tslist' in d){TS=null;tsRe();return}
});
