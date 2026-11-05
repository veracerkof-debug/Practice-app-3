// ---------- экраны ----------
let route={v:'toc'};
let skipHash=false;
const viewHash=()=>({cards:'cards',gloss:'glossary',dict:'dict'}[S.view]||'toc');
function hashFor(r){return r.v==='word'?'w-'+encodeURIComponent(r.id):r.v==='ch'?(CLR&&S.tab==='classic'?'ex-'+r.id+'-'+clFmt(CLR,true):'ch-'+r.id):r.v==='deck'?'deck-'+r.id:r.v==='study'?'study-'+r.id:viewHash()}
let NAVN=0;function go(r,keep){NAVN++;if(r.v!=='ch'||r.id!==route.id)CLR=null;route=r;const nh=hashFor(r);if(location.hash.slice(1)!==nh){skipHash=true;location.hash=nh}render();if(!keep)window.scrollTo(0,0)}
function fromHash(){const h=location.hash.slice(1);
 CLR=null;
 const ex=h.match(/^ex-([a-z0-9_]+)-([\d,-]+)$/);
 if(ex&&CHAPTERS[ex[1]]){route={v:'ch',id:ex[1]};S.tab='classic';const l=clParse(CHAPTERS[ex[1]],ex[2].replace(/,/g,', '));CLR=l.length?l:null;return}
 if(h.startsWith('w-')) route={v:'word',id:decodeURIComponent(h.slice(2))};
 else if(h.startsWith('ch-')) route={v:'ch',id:h.slice(3)};
 else if(h.startsWith('deck-')&&DECKS[h.slice(5)]) route={v:'deck',id:h.slice(5)};
 else if(h.startsWith('study-')&&DECKS[h.slice(6)]){route={v:'study',id:h.slice(6)};startStudy(route.id)}
 else {route={v:'toc'};if(h==='cards')S.view='cards';else if(h==='glossary'||h.startsWith('glossary-'))S.view='gloss';else if(h==='dict')S.view='dict';else if(h==='toc')S.view='book'}}

function tocHTML(){
 const V=S.view||'book';
 let h=`<div class="wrap">
 <section class="bhero"><div class="row"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--tint)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 5.5C4.5 4 8.5 4 12 6c3.5-2 7.5-2 10-.5V19c-2.5-1.5-6.5-1.5-10 .5-3.5-2-7.5-2-10-.5z"/><path d="M12 6v13.5"/></svg>
 <div><h1>Русский язык</h1><div class="sub">Правила, схемы и упражнения школьного курса в одном месте. Сверено с академическими правилами 2006 года.</div></div></div>
 <input class="bsearch" id="q" type="search" placeholder="Поиск: тема, урок, термин или слово" autocomplete="off" aria-label="Поиск по учебнику">
 <div class="sres" id="sres"></div>
 <div class="seg m4" role="radiogroup" aria-label="Раздел">${[['book','Учебник'],['gloss','Глоссарий'],['dict','Словарь'],['cards','Карточки']].map(([k,t])=>`<button role="radio" class="si" data-view="${k}" aria-pressed="${V===k}">${ico(k,16)}${t}</button>`).join('')}</div>
 </section>`;
 if(V==='cards'){
  h+=`<div class="kick" style="margin-top:6px">Колоды</div><div class="decks">`+Object.entries(DECKS).map(([k,d])=>{const s=deckStats(k);
   return `<button class="deck" style="--pc:${d.c}" data-deck="${k}"><div class="t">${d.t}</div><div class="facts"><span><b>${s.n}</b>карточек</span><span><b>${s.due+Math.min(s.nw,10)}</b>на сегодня</span><span><b>${s.learned}</b>выучено</span></div><div class="bar"><i style="width:${Math.round(s.learned/s.n*100)}%"></i></div></button>`}).join('')+`</div>
  <p class="note">Карточки, которые помнятся, возвращаются реже: через 1, 3, 7 и 16 дней. Забытые — сразу. Пока две колоды; остальные появятся вместе с главами.</p>`;
 } else if(V==='gloss') h+=glossView();
 else if(V==='dict') h+=dictView();
 else h+=bookTOC();
 return h+'</div>';
}

// вкладки главы: только то, что в главе уже есть (глава может быть пока только теорией)
const chTabs=ch=>[['theory','Теория'],...(ch.bank&&ch.bank.length||ch.wk?[['train','Тренажёр']]:[]),...(ch.classic&&ch.classic.length?[['classic','Упражнения']]:[]),...(ch.tests?[['tests','Тесты']]:[])];
const chTab=ch=>{const t=S.tab||'theory';return chTabs(ch).some(x=>x[0]===t)?t:'theory'};
function chapterHTML(id){
 const meta=chById(id); const ch=CHAPTERS[id];
 const idx=ALLCH.indexOf(meta);
 const prev=ALLCH[idx-1],next=ALLCH[idx+1];
 let h=`<div class="bkhbar"><div class="in"><button class="back" data-home>‹ Оглавление</button><span class="tools"><span class="where">${meta.part.t} · ${meta.part.ch.indexOf(meta)+1} из ${meta.part.ch.length}</span>${ch?`<button class="ibtn" data-outline="${id}" aria-label="Содержание главы"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>Содержание</button>`:''}</span></div></div><div class="wrap${ch?' chwide':''}">`;
 if(ch)h+=`<div class="chgrid">${chSide(id)}<div class="chmain">`;
 h+=`<header class="chhead"><div style="display:flex;flex-direction:column;gap:2px;min-width:0"><div class="kick">Глава ${meta.part.n}.${meta.part.ch.indexOf(meta)+1}${ch&&chTestsDone(ch)?' · <span class="chok">✓ глава завершена</span>':''}</div><h2>${meta.t}</h2><div class="sub">${ch?ch.s:meta.s}</div></div>${ch?`<button class="easy" data-easy aria-pressed="${!!S.easy}"><span class="sw"><i></i></span>Проще</button>`:''}</header>`;
 if(!ch){
  h+=`<div class="bins btip"><div class="h">Глава готовится</div><p>В образце готова одна глава — «Н и НН». На ней показано, как будут устроены все остальные: уроки, схема, упражнения, тонкости и карточки.</p><div><button class="linkbtn" data-ch="nn">Открыть «Н и НН» ›</button></div></div>`;
  if(meta.deck) h+=`<div class="bins bkey"><div class="h">Карточки уже есть</div><p>Для этой темы готова колода «${DECKS[meta.deck].t}».</p><div><button class="linkbtn" data-deck="${meta.deck}">Открыть колоду ›</button></div></div>`;
 } else {
  const tab=chTab(ch);
  h+=`<div class="seg" role="tablist" aria-label="Раздел главы">${chTabs(ch).map(t=>`<button role="tab" data-tab="${t[0]}" aria-pressed="${tab===t[0]}">${t[1]}</button>`).join('')}</div>`;
  if(tab==='train'){h+=trainerHTML();}
  else if(tab==='classic'){h+=classicHTML();}
  else if(tab==='tests'&&ch.tests){h+=testsHTML();}
  else {
  h+=`<nav class="bklnav" aria-label="Уроки">`+ch.lessons.map((l,i)=>`<button class="pill ${S.done[l.id]?'done':''}" data-jump="${l.id}">${S.done[l.id]?'✓ ':''}${i+1}. ${l.t}</button>`).join('')+`</nav><article class="bktext">`;
  ch.lessons.forEach((l,i)=>{
   h+=`<section class="bkles" id="${l.id}"><div class="bklh"><span class="kick">Урок ${i+1}</span><span class="t">${S.done[l.id]?'✓ ':''}${l.t}</span></div>`;
   h+=h4ids(termify(S.easy&&l.lite?l.lite:l.h),l.id).replace('{{table}}',ch.table||'').replace(/\{\{lab:(\w+)\}\}/g,(m,id)=>labHTML(id));
   const nb=(ch.bank||[]).filter(b=>b.l===i+1).length, cl=(ch.classic||[]).filter(e=>e.l===i+1);
   h+=`<div class="bklex"><div class="top"><b>Практика по уроку</b></div>
   <div class="prac">${nb?`<button class="pbtn" data-trles="${i+1}"><b>Тренажёр</b><span>${nb} заданий: по одному, столбики, найти ошибку</span></button>`:''}
   ${cl.length?`<button class="pbtn" data-clto="${i+1}"><b>В тетрадь</b><span>Упражнения ${cl[0].n}–${cl[cl.length-1].n}${TEACHER?" с ответами":""}</span></button>`:''}${!nb&&!cl.length&&!ch.tests?'<span class="note">Тренажёр, упражнения и тесты к этой главе готовятся.</span>':''}
   ${ch.tests?(()=>{const r=tRes(ch,i+1),ok=tPassed(ch,i+1);return `<button class="pbtn ${ok?'tsp':''}" data-tsgo="${i+1}"><b>${ok?'✓ Тест сдан':'Тест'}</b><span>${r?`Лучшая оценка ${r.best} · пройти ещё раз`:`${Math.min(TEST_LEN,ch.tests.filter(s=>s.l===i+1).length)} вопросов без подсказок`}</span></button>`})():''}</div>
   <details class="bkhelp"><summary>Проще</summary><div class="body"><p>${l.easy}</p></div></details>
   <details class="bkhelp fix"><summary>Если не получается</summary><div class="body"><p>${l.fix}</p></div></details>
   ${l.deep&&!S.easy?`<details class="bkhelp deep"><summary>Тонкости</summary><div class="body">${l.deep}</div></details>`:''}${S.easy?'<div class="bkhint">Полное объяснение со всеми исключениями — если выключить «Проще» вверху главы.</div>':''}
   <button class="bkldone ${S.done[l.id]?'is':''}" data-done="${l.id}">${S.done[l.id]?'✓ Урок пройден':'Урок пройден'}</button></div></section>`;
  });
  h+=`</article>`;}
  if(meta.deck&&DECKS[meta.deck])h+=`<div class="bins bkey" style="max-width:72ch"><div class="h">Повторить</div><p>По этой главе есть колода карточек с интервальным повторением.</p><div><button class="linkbtn" data-deck="${meta.deck}">Учить карточки ›</button></div></div>`;
  h+=`<div class="bsrc">По книгам: ${ch.src}</div></div></div>`;
 }
 h+=`<nav class="bpn"><button data-ch="${prev?prev.id:''}" ${prev?'':'disabled'}>‹ ${prev?prev.t:''}</button><button data-ch="${next?next.id:''}" ${next?'':'disabled'}>${next?next.t:''} ›</button></nav></div>`;
 return h;
}

// боковое содержание главы (видно на широких экранах, ≥1100px)
function chSide(id){
 const ch=CHAPTERS[id],tab=chTab(ch),d=ch.lessons.filter(l=>S.done[l.id]).length;
 const tabs=`<div class="stabs">${chTabs(ch).map(([k,t])=>`<button class="ghost" data-otab="${k}" aria-pressed="${tab===k}">${t}</button>`).join('')}</div>`;
 if(tab==='classic'){const dn=ch.classic.filter(e=>S.done['cl-'+id+'-'+e.n]).length;
  return `<aside class="chside" aria-label="Упражнения главы"><div class="kick">Упражнения · выполнено ${dn} из ${ch.classic.length}</div>${clFindHTML(1)}${clMapHTML(ch)}${tabs}</aside>`}
 return `<aside class="chside" aria-label="Содержание главы"><div class="kick">Содержание · ${d} из ${ch.lessons.length}</div>
 <ol class="otl sotl">${ch.lessons.map((l,i)=>`<li><button data-ojump="${l.id}" data-sl="${l.id}" class="${S.done[l.id]?'dn':''}"><span class="on">${i+1}</span><span>${l.t}</span>${S.done[l.id]?'<span class="ok">✓</span>':''}</button>
  ${S.easy||tab!=='theory'?'':`<ol>${secs(l).map(x=>`<li><button data-ojump="${x.id}">${x.t}</button></li>`).join('')}</ol>`}</li>`).join('')}</ol>
 ${tabs}</aside>`;
}
// подсветка текущего урока в боковом содержании
let SIDEF=0;
addEventListener('scroll',()=>{if(SIDEF)return;SIDEF=requestAnimationFrame(()=>{SIDEF=0;
 const side=document.querySelector('.chside');if(!side||!side.offsetParent)return;
 let cur=null;document.querySelectorAll('.bkles').forEach(s=>{if(s.getBoundingClientRect().top<140)cur=s.id});
 side.querySelectorAll('[data-sl]').forEach(b=>b.classList.toggle('cur',b.dataset.sl===cur))})},{passive:true});

function deckHTML(k){
 const d=DECKS[k],s=deckStats(k);
 return `<div class="bkhbar"><div class="in"><button class="back" data-home>‹ Колоды</button><span class="where">Карточки</span></div></div><div class="wrap"><div class="study">
 <header><div class="kick">Колода</div><h2>${d.t}</h2><div class="sub">${s.n} карточек · на сегодня ${s.due+Math.min(s.nw,10)}</div></header>
 <div class="boxes">${s.bx.map((n,i)=>`<div><b>${n}</b>${['новые','1 день','3 дня','7 дней','16 дней'][i]}</div>`).join('')}</div>
 <div class="note">Не открывали: ${s.nw}. Кружки показывают, через сколько дней карточка вернётся.</div>
 <button class="big2 main" style="min-height:48px;border-radius:14px;border:0;font-weight:700;font-size:16px" data-study="${k}">${s.due+s.nw?'Начать':'Повторить ещё раз'}</button>
 ${chById(d.ch)&&CHAPTERS[d.ch]?`<button class="linkbtn" data-ch="${d.ch}">Глава «${chById(d.ch).t}» ›</button>`:''}
 </div></div>`;
}

function cardFace(c){
 if(c.k==='q'){
  return `<div class="ty">Вспомнить</div><div class="qq">${c.q}</div>`+(study.shown?`<div class="aa"><div>${c.a}</div>${c.l?`<button class="linkbtn" data-ch="nn" data-jumpto="${c.l}">Урок в учебнике ›</button>`:''}</div>`:'');
 }
 if(c.k==='c'){
  const opts=c.opts||['н','нн'];const p=study.pick;
  const w=esc(c.w).replace('_',`<span class="slot ${p?(p===c.a?'ok':'bad'):''}">${p?c.a:'…'}</span>`);
  return `<div class="ty">Вставить букву</div><div class="word">${w}</div><div class="ans" style="justify-content:center">`+
   opts.map(v=>{let cl='';if(p){if(v===c.a)cl='ok';else if(v===p)cl='bad'}return `<button data-pick="${v}" class="${cl}" ${p?'disabled':''} style="min-width:72px;min-height:48px">${v}</button>`}).join('')+'</div>'+
   (p?`<div class="aa"><div>${p===c.a?'<b style="color:var(--T)">Верно.</b>':'<b style="color:var(--red)">Неверно.</b>'} ${c.why}</div><button class="linkbtn" data-ch="nn" data-jumpto="${c.l}">Урок в учебнике ›</button></div>`:'');
 }
 // ударение
 const p=study.pick;
 const letters=[...c.w].map((ch,i)=>{
  if(!VOW.includes(ch)) return `<span class="cons">${ch}</span>`;
  let cl='';if(p!=null){if(i===c.v)cl='ok';else if(i===p)cl='bad'}
  const mark=(p!=null&&i===c.v&&ch!=='ё')?ch+A:ch;
  return `<button class="vow ${cl}" data-vow="${i}" ${p!=null?'disabled':''} aria-label="ударение на ${ch}">${mark}</button>`;
 }).join('');
 return `<div class="ty">Поставить ударение</div><div class="sword">${letters}</div>`+
  (p!=null?`<div class="aa"><div>${p===c.v?'<b style="color:var(--T)">Верно.</b>':'<b style="color:var(--red)">Неверно.</b>'} Правильно: <b>${[...c.w].map((ch,i)=>i===c.v&&ch!=='ё'?ch+A:ch).join('')}</b></div></div>`:'');
}
function studyHTML(){
 const d=DECKS[study.d];
 let h=`<div class="bkhbar"><div class="in"><button class="back" data-deck="${study.d}">‹ ${d.t}</button><span class="where">${Math.min(study.i+1,study.q.length)} из ${study.q.length}</span></div></div><div class="wrap"><div class="study">`;
 if(study.i>=study.q.length){
  h+=`<div class="card" style="text-align:center;align-items:center"><div class="ty">Готово на сегодня</div><div class="qq">Верно с первого раза: ${study.right} из ${study.total}</div><div class="note">Ошибки вернутся в следующий раз первыми.</div></div>
  <div class="big2"><button class="ghost" data-deck="${study.d}">К колоде</button><button class="main" data-study="${study.d}">Ещё 10</button></div>`;
  return h+'</div></div>';
 }
 h+=`<div class="bar"><i style="width:${study.i/study.q.length*100}%"></i></div>`;
 const c=study.q[study.i];
 h+=`<div class="card">${cardFace(c)}</div>`;
 if(c.k==='q'){
  h+=study.shown?`<div class="big2"><button class="again" data-grade="0">Не помню</button><button class="good" data-grade="1">Помню</button></div>`:`<div class="big2"><button class="main" data-show>Показать ответ</button></div>`;
 } else {
  const ok=c.k==='c'?study.pick===c.a:study.pick===c.v;
  h+=(study.pick!=null)?`<div class="big2"><button class="main" data-grade="${ok?1:0}">Дальше</button></div>`:`<div class="note" style="text-align:center">${c.k==='s'?'Нажать на ударную гласную':'Выбрать вариант'}</div>`;
 }
 return h+'</div></div>';
}

function render(){
 const app=$('#app');
 if(route.v==='ch') app.innerHTML=chapterHTML(route.id);
 else if(route.v==='deck') app.innerHTML=deckHTML(route.id);
 else if(route.v==='study') app.innerHTML=studyHTML();
 else if(route.v==='word') app.innerHTML=wordHTML(route.id);
 else app.innerHTML=tocHTML();
 const q=$('#q'); if(q){q.addEventListener('input',search);}
 if(route.v==='ch'&&(S.tab||'theory')==='theory'){enhance(app.querySelector('.bktext'),route.id);linkWords(app.querySelector('.bktext'))}
 else if(route.v==='ch')termsIn(app.querySelector('.chmain')||app);
 const gq=$('#gq');if(gq)gq.addEventListener('input',e=>{GQ=e.target.value;$('#glist').innerHTML=glossList()});
 const dq=$('#dq');if(dq)dq.addEventListener('input',e=>{DQ=e.target.value;$('#dlist').innerHTML=dictList()});
}
function search(e){
 const v=e.target.value.trim().toLowerCase().replace(/\u0301/g,''),box=$('#sres');
 if(v.length<2&&!/^\d$/.test(v)){box.innerHTML='';return}
 const res=[],R=(ty,t,sub,attr)=>res.push(`<button ${attr}><span class="ty">${ty}</span><b>${t}</b>${sub?`<small>${sub}</small>`:''}</button>`);
 // упражнение по номеру: «12», «упр. 12», «4.6.12»
 const xm=v.match(/^(?:упр[а-яё]*\.?\s*|№\s*)?(?:(\d)\.(\d+)[.\s]+)?(\d+)$/);
 if(xm)ALLCH.forEach(c=>{const ch=CHAPTERS[c.id];if(!ch)return;const i=c.part.ch.indexOf(c);
  if(xm[1]&&(+xm[1]!==c.part.n||+xm[2]!==i+1))return;const e=ch.classic.find(x=>x.n===+xm[3]);
  if(e)R('Упражнение',`Упражнение ${e.n}`,`Глава ${c.part.n}.${i+1} · ${c.t}`,`data-exgo="${c.id}:${e.n}"`)});
 ALLCH.forEach(c=>{if((c.t+' '+c.s).toLowerCase().includes(v))R('Глава',c.t,c.part.t+(CHAPTERS[c.id]?'':' · готовится'),`data-ch="${c.id}"`)});
 Object.values(CHAPTERS).forEach(ch=>ch.lessons.forEach(l=>{
  if(l.t.toLowerCase().includes(v))R('Урок',l.t,lesName(l.id),`data-ojump2="${l.id}"`);
  secs(l).forEach(x=>{if(x.t.toLowerCase().includes(v))R('Раздел',x.t,lesName(l.id),`data-ojump2="${x.id}"`)})}));
 GLA.forEach(g=>{if(g.t.toLowerCase().includes(v))R('Термин',g.t,g.d.slice(0,80)+(g.d.length>80?'…':''),`data-term="${g.id}"`)});
 DICT.forEach(e=>{if(e.w.includes(v))R('Статья словаря',stressHTML(e.s||e.w),esc(e.mean[0].d),`data-word="${esc(e.w)}"`)});
 ALLW.forEach(x=>{if(x.w.replace(/\u0301/g,'').toLowerCase().includes(v))R('Словарик',esc(x.w),esc(x.n),`data-dword="${esc(x.w.replace(/\u0301/g,''))}"`)});
 box.innerHTML=res.slice(0,12).join('')||'<div class="note">Ничего не найдено.</div>';
}
function jump(id){let el=document.getElementById(id);if(!el&&/-s\d+$/.test(id))el=document.getElementById(id.replace(/-s\d+$/,''));if(el){el.scrollIntoView({behavior:RM()?'auto':'smooth'});if(el.tagName==='H4'){el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1800)}}}

document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 const d=b.dataset;
 if('close' in d){closeSheet();return}
 if('shback' in d){SH.pop();const id=SH.pop();sheet(id,true);return}
 if(d.tsee){sheet(d.tsee,true);return}
 if(d.word){closeSheet();go({v:'word',id:d.word});return}
 if('wback' in d){if(NAVN>1)history.back();else go({v:'toc'});return}
 if(d.fcol){const box=b.closest('.fdet');box.querySelector('.ftbl').dataset.c=d.fcol;box.querySelectorAll('[data-fcol]').forEach(x=>x.setAttribute('aria-pressed',x===b));return}
 if(d.wstep){WST[d.wstep]=+d.to;go({v:'word',id:d.wstep},true);return}
 if(d.term){sheet(d.term);return}
 if(d.tgo){const id=d.tgo,l=d.l;closeSheet();openLesson(l,()=>flashIn(`#${l} .bterm[data-term="${id}"]`));return}
 if(d.gl){const id=d.gl;closeSheet();S.view='gloss';GQ='';GCAT='';save();go({v:'toc'});setTimeout(()=>flashIn('#g-'+id),60);return}
 if(d.gjump){if(!flashIn('#g-'+d.gjump)){GQ='';GCAT='';const el=$('#gq');if(el)el.value='';$('#glist').innerHTML=glossList();flashIn('#g-'+d.gjump)}return}
 if(d.abc){const el=document.getElementById(d.abc);if(el)el.scrollIntoView({behavior:RM()?'auto':'smooth'});return}
 if(d.gcat!==undefined){GCAT=d.gcat;const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(d.dtag!==undefined){DTAG=d.dtag;const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(d.dword){S.view='dict';DQ=d.dword;DTAG='';save();go({v:'toc'});return}
 if(d.outline){outline(d.outline);return}
 if(d.ojump){const id=d.ojump;closeSheet();if((S.tab||'theory')!=='theory'){S.tab='theory';save();render()}setTimeout(()=>jump(id),30);return}
 if(d.otab){closeSheet();S.tab=d.otab;CLR=null;save();go({v:'ch',id:route.id},true);setTimeout(()=>{const t=document.querySelector('.seg[role=tablist]');if(t)t.scrollIntoView({behavior:RM()?'auto':'smooth'})},30);return}
 if(d.ojump2){const id=d.ojump2,lid=id.replace(/-s\d+$/,'');openLesson(lid,()=>{if(id===lid)return false;jump(id);return true});return}
 if(d.tabto&&d.ch){S.tab=d.tabto;save();go({v:'ch',id:d.ch});return}
 if(d.view){S.view=d.view;save();go({v:'toc'});return}
 if('home' in d){go({v:'toc'});return}
 if(d.ch!==undefined&&d.ch!==''){const j=d.jumpto;go({v:'ch',id:d.ch});if(j)setTimeout(()=>jump(j),50);return}
 if(d.deck){go({v:'deck',id:d.deck});return}
 if(d.study){startStudy(d.study);go({v:'study',id:d.study});return}
 if(d.jump){jump(d.jump);return}
 if(d.tw!==undefined){treeWord(+d.tw);relab('tree');return}
 if(d.to){treeGo(+d.k,d.to);relab('tree');return}
 if('treereset' in d){tst.nodes=['start'];tst.word=null;relab('tree');return}
 if('easy' in d){S.easy=!S.easy;save();const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(d.parse!==undefined){pSel=+d.parse;relab('parse');return}
 if(d.matrix){xSel=d.matrix;relab('matrix');return}
 if(d.build){bSel=d.build;relab('build');return}
 if(d.bf!==undefined){bF=+d.bf;relab('build');return}
 if(d.spr!==undefined){sSel=+d.spr;relab('spr');return}
 if(d.pair!==undefined){qSel=+d.pair;relab('pairs');return}
 if(d.decl){dSel=d.decl;relab('decl');return}
 if(d.dg!==undefined){dG=+d.dg;relab('decl');return}
 if(d.new!==undefined){neWord(+d.new);relab('ne');return}
 if(d.neto){nst.nodes=nst.nodes.slice(0,+d.nek+1);nst.nodes.push(d.neto);nst.w=null;relab('ne');return}
 if('nereset' in d){nst.nodes=['start'];nst.w=null;relab('ne');return}
 if(d.cm!==undefined){kSel=+d.cm;relab('commas');return}
 if(d.kpos){kPos=d.kpos;relab('commas');return}
 if(d.morph!==undefined){mSel=+d.morph;relab('morph');return}
 if(d.chain){cSel=d.chain;relab('chain');return}
 if(d.noun!==undefined){nSel=nSel===+d.noun?null:+d.noun;relab('nouns');return}
 if(d.tab){S.tab=d.tab;CLR=null;save();go({v:'ch',id:route.id});return}
 if(d.trles){S.tab='train';trSync();TR.les=[+d.trles];TR.run=null;save();render();window.scrollTo(0,0);return}
 if(d.clto){CLR=null;CLF=+d.clto;S.cls=0;CLU=false;S.tab='classic';save();go({v:'ch',id:CC().id});return}
 if(d.clgo){closeSheet();clJump(+d.clgo);return}
 if(d.cllink){clCopy(clLink(CC(),[+d.cllink]));return}
 if('clcopy' in d){clCopy(clLink(CC(),CLR||[]));return}
 if('clall' in d){CLR=null;go({v:'ch',id:CC().id});return}
 if('clu' in d){CLU=!CLU;const y=window.scrollY;render();window.scrollTo(0,y);return}
 if('clo' in d){CLO=!CLO;const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(d.exgo){const [id,n]=d.exgo.split(':');route={v:'ch',id};CLR=[+n];S.tab='classic';save();go({v:'ch',id});return}
 if(d.trl){const l=+d.trl;TR.les=TR.les.includes(l)?TR.les.filter(x=>x!==l):[...TR.les,l].sort();if(!TR.les.length)TR.les=[l];trRe();return}
 if(d.trm){TR.mode=d.trm;trRe();return}
 if(d.trc){TR.cnt=d.trc==='all'?'all':+d.trc;trRe();return}
 if('trgo' in d){trStart();trRe(true);return}
 if('trerr' in d){const w=TR.run.wrong;trStart(shuffle(w));trRe(true);return}
 if('trsetup' in d){TR.run=null;trRe(true);return}
 if(d.trp){const t=TR.run.tasks[TR.run.i];if(S.easy&&!t.hinted&&d.trp!==t.it.a){t.hinted=true;t.first=d.trp;trScore([[t.it,false]]);trRe();return}t.ans=d.trp;if(!t.hinted)trScore([[t.it,d.trp===t.it.a]]);trRe();return}
 if(d.tre!==undefined){const t=TR.run.tasks[TR.run.i];t.pick=+d.tre;trScore([[t.items[t.bad],t.pick===t.bad]]);trRe();return}
 if(d.trset!==undefined){const t=TR.run.tasks[TR.run.i];t.set[+d.trset]=d.v;trRe();return}
 if(d.trcol!==undefined){const t=TR.run.tasks[TR.run.i];delete t.set[+d.trcol];trRe();return}
 if('trcheck' in d){const t=TR.run.tasks[TR.run.i];t.checked=true;trScore(t.items.map((it,i)=>[it,t.set[i]===it.a]));trRe();return}
 if('trnext' in d){TR.run.i++;trRe(true);return}
 if(d.clf!==undefined){CLF=+d.clf;const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(d.cls!==undefined){S.cls=+d.cls;save();render();return}
 if(d.cldone){const k='cl-'+CC().id+'-'+d.cldone;S.done[k]=!S.done[k];save();const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(d.ex){const les=NN.lessons.find(l=>l.id===d.ex);(exState[d.ex]||(exState[d.ex]={}))[d.i]=d.v;rerenderEx(les);return}
 if(d.exreset){exState[d.exreset]={};rerenderEx(NN.lessons.find(l=>l.id===d.exreset));return}
 if(d.done){S.done[d.done]=!S.done[d.done];save();const y=window.scrollY;render();window.scrollTo(0,y);return}
 if('show' in d){study.shown=true;render();return}
 if(d.grade!==undefined){grade(d.grade==='1');return}
 if(d.pick){study.pick=d.pick;render();return}
 if(d.vow!==undefined){study.pick=+d.vow;render();return}
});
function trRe(top){const el=document.getElementById('trainer');if(!el){render();return}el.outerHTML=trainerHTML();termsIn(document.getElementById('trainer'));if(top){const t=document.getElementById('trainer');const y=t.getBoundingClientRect().top+window.scrollY-70;if(window.scrollY>y)window.scrollTo(0,y)}}
function rerenderEx(les){const old=document.getElementById('ex-'+les.id);const open=[...old.querySelectorAll('details')].map(x=>x.open);
 old.outerHTML=exHTML(les);const nw=document.getElementById('ex-'+les.id);nw.querySelectorAll('details').forEach((x,i)=>x.open=open[i]);}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
document.addEventListener('toggle',e=>{const t=e.target;if(t.dataset&&t.dataset.tdet){S.tocOpen=S.tocOpen||{};S.tocOpen[t.dataset.tdet]=t.open;save()}},true);
window.addEventListener('hashchange',()=>{if(skipHash){skipHash=false;return}fromHash();render()});
fromHash();render();
