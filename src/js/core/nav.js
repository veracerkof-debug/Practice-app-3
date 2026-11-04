// ---------- навигация: термины, перекрёстные ссылки, оглавление, глоссарий, словарик ----------
const CYR='а-яёА-ЯЁ';
const GL=Object.entries(GLOSS).map(([id,g])=>({id,...g,re:g.f?new RegExp('(^|[^'+CYR+'])('+g.f+')(?![' + CYR + '])','i'):null}));
GL.sort((a,b)=>b.t.length-a.t.length);
const GLA=[...GL].sort((a,b)=>a.t.localeCompare(b.t,'ru'));
const LES={};Object.values(CHAPTERS).forEach(ch=>ch.lessons.forEach((l,i)=>{LES[l.id]={ch:ch.id,i,t:l.t,n:i+1}}));
const lesName=id=>{const L=LES[id];if(!L)return '';const m=chById(L.ch);return `${m?m.t:''} · урок ${L.n}`};
const strip=h=>String(h).replace(/<[^>]+>/g,' ').replace(/\[\[\w+\|([^\]]+)\]\]/g,'$1').replace(/\{\{[^}]+\}\}/g,' ');
// где встречается каждый термин
const TUSE={};GL.forEach(g=>{TUSE[g.id]=[];if(!g.re)return;Object.values(CHAPTERS).forEach(ch=>ch.lessons.forEach(l=>{
 const txt=strip(l.h+' '+(l.deep||''));if(g.re.test(txt)||new RegExp('\\[\\['+g.id+'\\|').test(l.h))TUSE[g.id].push(l.id)}))});
// разделы уроков (h4) для оглавления
const secs=l=>[...String(l.h).matchAll(/<h4>([^<]+)<\/h4>/g)].map((m,k)=>({id:l.id+'-s'+k,t:m[1].trim()}));
const h4ids=(h,lid)=>{let k=0;return h.replace(/<h4>/g,()=>`<h4 id="${lid}-s${k++}">`)};

// пост-обработка текста главы: термины и перекрёстные ссылки
const SKIP='.lab,button,h4,.bklh,.ex,.m,summary,.prac,.top,input,label,thead,.bkldone,.bpn,.xref,mark';
function enhance(root,chId){
 const ch=CHAPTERS[chId];if(!ch||!root)return;
 root.querySelectorAll('.bkles').forEach(sec=>{
  const linked=new Set([...sec.querySelectorAll('.bterm')].map(b=>b.dataset.term));
  const nodes=()=>{const out=[];const w=document.createTreeWalker(sec,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest(SKIP)||!n.nodeValue.trim()?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});let n;while(n=w.nextNode())out.push(n);return out};
  // ссылки «в уроке 6», «в главе «Н и НН»»
  nodes().forEach(n=>{
   const re=/(урок[аеуи]?|уроках|уроками)\s(\d)(?:\s?[–-]\s?(\d))?|глав[аеуыой]{1,2}\s«([^»]+)»/g;
   const s=n.nodeValue;if(!re.test(s))return;re.lastIndex=0;
   const frag=document.createDocumentFragment();let last=0,m;
   while(m=re.exec(s)){
    let btn=null;
    if(m[2]){const L=ch.lessons[+m[2]-1];if(L){btn=document.createElement('button');btn.className='xref';btn.dataset.jump=L.id;btn.title=L.t}}
    else{const c=ALLCH.find(c=>c.t===m[4]);if(c&&CHAPTERS[c.id]&&c.id!==chId){btn=document.createElement('button');btn.className='xref';btn.dataset.ch=c.id}}
    if(!btn)continue;
    frag.append(s.slice(last,m.index));btn.textContent=m[0];frag.append(btn);last=m.index+m[0].length;
   }
   if(last){frag.append(s.slice(last));n.replaceWith(frag)}
  });
  // термины — все упоминания
  termsIn(sec);
 });
}
// термины в любом блоке: каждое упоминание становится кнопкой с карточкой термина.
// Не трогаем примеры (.ex), морфемы, кнопки, схемы, материал упражнений (.cbody) и поля ввода.
const TSKIP=SKIP+',.cbody,.bterm,.wl,.opt,.tsw,.word,.slot,.tsinfo,.tshead,.tsres,.tsa,.chhead,.ty,.tl,.mpal,.cap,a';
const GLR=GL.filter(g=>g.re).map(g=>({id:g.id,re:new RegExp(g.re.source,'gi')}));
function termsIn(root){
 if(!root)return;
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>!n.nodeValue.trim()||n.parentElement.closest(TSKIP)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
 const ns=[];let n;while(n=w.nextNode())ns.push(n);
 ns.forEach(n=>{
  const s=n.nodeValue,hits=[];
  GLR.forEach(g=>{g.re.lastIndex=0;let m;while(m=g.re.exec(s)){const st=m.index+m[1].length,en=st+m[2].length;
   if(!hits.some(h=>st<h.en&&en>h.st))hits.push({st,en,id:g.id});if(g.re.lastIndex===m.index)g.re.lastIndex++}});
  if(!hits.length)return;hits.sort((a,b)=>a.st-b.st);
  const f=document.createDocumentFragment();let last=0;
  hits.forEach(h=>{f.append(s.slice(last,h.st));const b=document.createElement('button');b.className='bterm';b.dataset.term=h.id;b.textContent=s.slice(h.st,h.en);f.append(b);last=h.en});
  f.append(s.slice(last));n.replaceWith(f);
 });
}

// шторка термина с историей
let SH=[];
function sheet(id,push){
 const g=GLOSS[id];if(!g)return;
 if(push&&SH[SH.length-1]!==id)SH.push(id);else if(!push)SH=[id];
 let s=document.querySelector('.sheet');
 if(!s){const bg=document.createElement('div');bg.className='sheetbg';bg.onclick=closeSheet;s=document.createElement('div');s.className='sheet';s.setAttribute('role','dialog');document.body.append(bg,s)}
 s.setAttribute('aria-label',g.t);
 const use=(TUSE[id]||[]).filter(l=>l!==g.at);
 s.innerHTML=`<div class="grab"></div>
 <div class="shead">${SH.length>1?`<button class="linkbtn" data-shback>‹ ${GLOSS[SH[SH.length-2]].t}</button>`:'<span></span>'}<span class="gcat">${g.cat}</span></div>
 <div class="t">${g.t}</div><div class="d">${g.d}</div>${g.ex?`<div class="gex">${esc(g.ex)}</div>`:''}
 ${g.at&&LES[g.at]?`<button class="bkldone" data-tgo="${id}" data-l="${g.at}">Где объясняется: ${lesName(g.at)}</button>`:''}
 ${use.length?`<div class="slab">Встречается ещё</div><div class="chips">${use.map(l=>`<button class="chipc sm" data-tgo="${id}" data-l="${l}">${lesName(l)}</button>`).join('')}</div>`:''}
 ${g.see&&g.see.length?`<div class="slab">Связанные термины</div><div class="chips">${g.see.filter(x=>GLOSS[x]).map(x=>`<button class="chipc sm see" data-tsee="${x}">${GLOSS[x].t}</button>`).join('')}</div>`:''}
 <div class="big2"><button class="ghost" data-gl="${id}">В глоссарии</button><button class="ghost" data-close>Закрыть</button></div>`;
 s.scrollTop=0;
}
function closeSheet(){SH=[];document.querySelectorAll('.sheet,.sheetbg').forEach(n=>n.remove())}
function flashIn(sel){const t=document.querySelector(sel);if(!t)return false;t.scrollIntoView({block:'center',behavior:RM()?'auto':'smooth'});t.classList.add('flash');setTimeout(()=>t.classList.remove('flash'),1800);return true}
let NOSM=0;const RM=()=>Date.now()<NOSM||matchMedia('(prefers-reduced-motion: reduce)').matches;
function openLesson(lid,after){const L=LES[lid];if(!L)return;S.tab='theory';save();
 if(!(route.v==='ch'&&route.id===L.ch)){NOSM=Date.now()+400;go({v:'ch',id:L.ch})}else if(!document.getElementById(lid))render();
 setTimeout(()=>{if(!(after&&after()))jump(lid)},60)}

// шторка «Содержание главы»
function outline(chId){
 const ch=CHAPTERS[chId],meta=chById(chId);closeSheet();
 const bg=document.createElement('div');bg.className='sheetbg';bg.onclick=closeSheet;
 const s=document.createElement('div');s.className='sheet tall';s.setAttribute('role','dialog');s.setAttribute('aria-label','Содержание главы');
 const terms=GLA.filter(g=>ch.lessons.some(l=>(TUSE[g.id]||[]).includes(l.id)));
 if((S.tab||'theory')==='classic'){
  s.innerHTML=`<div class="grab"></div><div class="kick">Глава ${meta.part.n}.${meta.part.ch.indexOf(meta)+1} · ${meta.t}</div><div class="t">Упражнения</div>${clFindHTML()}${clMapHTML(ch)}
  <div class="big2"><button class="ghost" data-otab="theory">Теория</button><button class="ghost" data-otab="train">Тренажёр</button>${ch.tests?'<button class="ghost" data-otab="tests">Тесты</button>':''}</div>
  <button class="ghost" style="min-height:44px;border-radius:14px;border:0" data-close>Закрыть</button>`;
  document.body.append(bg,s);return}
 s.innerHTML=`<div class="grab"></div><div class="kick">Глава ${meta.part.n}.${meta.part.ch.indexOf(meta)+1}</div><div class="t">${meta.t}</div>
 <ol class="otl">${ch.lessons.map((l,i)=>`<li><button data-ojump="${l.id}" class="${S.done[l.id]?'dn':''}"><span class="on">${i+1}</span><span>${l.t}</span>${S.done[l.id]?'<span class="ok">✓</span>':''}</button>
  ${S.easy?'':`<ol>${secs(l).map(x=>`<li><button data-ojump="${x.id}">${x.t}</button></li>`).join('')}</ol>`}</li>`).join('')}</ol>
 <div class="big2"><button class="ghost" data-otab="train">Тренажёр</button><button class="ghost" data-otab="classic">Упражнения</button>${ch.tests?'<button class="ghost" data-otab="tests">Тесты</button>':''}</div>
 <div class="slab">Термины главы · ${terms.length}</div><div class="chips">${terms.map(g=>`<button class="chipc sm" data-term="${g.id}">${g.t}</button>`).join('')}</div>
 <button class="ghost" style="min-height:44px;border-radius:14px;border:0" data-close>Закрыть</button>`;
 document.body.append(bg,s);
}

// оглавление
const ICO={
 book:'<path d="M2 5.5C4.5 4 8.5 4 12 6c3.5-2 7.5-2 10-.5V19c-2.5-1.5-6.5-1.5-10 .5-3.5-2-7.5-2-10-.5z"/><path d="M12 6v13.5"/>',
 gloss:'<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M8 9h6M8 13h4"/>',
 dict:'<path d="M4 19V5l6 14V5"/><path d="M14 13l3-8 3 8M15 11h4"/>',
 cards:'<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>'};
const ico=(k,sz=20)=>`<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[k]}</svg>`;
function ringSVG(p,c){const r=15,L=2*Math.PI*r;return `<svg class="pring" width="38" height="38" viewBox="0 0 38 38" aria-hidden="true"><circle cx="19" cy="19" r="${r}" fill="none" stroke="var(--fill2)" stroke-width="4"/><circle cx="19" cy="19" r="${r}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${L*p} ${L}" transform="rotate(-90 19 19)"/></svg>`}
function bookTOC(){
 const ready=ALLCH.filter(c=>CHAPTERS[c.id]);
 const allL=ready.flatMap(c=>CHAPTERS[c.id].lessons),dn=allL.filter(l=>S.done[l.id]).length;
 let h='';
 const last=S.last&&LES[S.last]?S.last:null;
 const nextL=allL.find(l=>!S.done[l.id]);
 const cont=last||(nextL&&nextL.id);
 if(cont){const L=LES[cont],m=chById(L.ch);
  h+=`<button class="bcont" style="--pc:${m.part.c}" data-ojump2="${cont}"><span class="kick">${last?'Продолжить':'Начать'}</span><span class="t">${LES[cont].t}</span><span class="s">${m.t} · урок ${L.n} из ${CHAPTERS[L.ch].lessons.length}</span><span class="go">›</span></button>`}
 h+=`<div class="bstat"><div><b>${ready.length}</b> из ${ALLCH.length}<span>глав готово</span></div><div><b>${dn}</b> из ${allL.length}<span>уроков пройдено</span></div><div><b>${GL.length}</b><span>терминов</span></div><div><b>${ALLW.length}</b><span>слов в словарике</span></div></div>`;
 h+=`<div class="kick" style="margin-top:4px">Содержание</div><div class="tparts">`;
 PARTS.forEach(p=>{
  const rN=p.ch.filter(c=>CHAPTERS[c.id]).length;
  h+=`<section class="tpart" style="--pc:${p.c}"><header><span class="pnum">${p.n}</span><span class="pt">${p.t}</span><span class="pc">${rN?`${rN} из ${p.ch.length} готово`:`${p.ch.length} глав`}</span></header><ol class="tchs">`;
  p.ch.forEach((c,i)=>{
   const ch=CHAPTERS[c.id],num=`${p.n}.${i+1}`;
   if(!ch){h+=`<li class="tch soon"><button data-ch="${c.id}"><span class="cn">${num}</span><span class="cb"><span class="ct">${c.t}</span><span class="cs">${c.s}</span></span><span class="wait">скоро</span></button></li>`;return}
   const d=ch.lessons.filter(l=>S.done[l.id]).length,n=ch.lessons.length;
   h+=`<li class="tch"><details ${S.tocOpen&&S.tocOpen[c.id]===false?'':'open'} data-tdet="${c.id}"><summary><span class="cn">${num}</span><span class="cb"><span class="ct">${c.t}${chTestsDone(ch)?' <span class="chok">✓ глава завершена</span>':''}</span><span class="cs">${c.s}</span></span><span class="rg">${ringSVG(d/n,p.c)}<i>${d}/${n}</i></span></summary>
   <ol class="tles">${ch.lessons.map((l,k)=>`<li><button data-ojump2="${l.id}" class="${S.done[l.id]?'dn':''}"><span class="ln">${num}.${k+1}</span><span class="lb"><span class="lt">${l.t}</span>${secs(l).length?`<span class="ls">${secs(l).map(x=>x.t).join(' · ')}</span>`:''}</span>${S.done[l.id]?'<span class="ok">✓</span>':''}</button></li>`).join('')}</ol>
   <div class="tquick"><button data-ch="${c.id}" data-tabto="theory">Теория</button><button data-ch="${c.id}" data-tabto="train">Тренажёр · ${ch.bank.length}</button><button data-ch="${c.id}" data-tabto="classic">Упражнения · ${ch.classic.length}</button>${c.deck?`<button data-deck="${c.deck}">Карточки</button>`:''}</div></details></li>`;
  });
  h+='</ol></section>';
 });
 h+='</div>';
 h+=`<div class="kick" style="margin-top:6px">Справочник</div><div class="bref">
 <button data-view="gloss">${ico('gloss',24)}<b>Глоссарий</b><span>${GL.length} терминов с определениями и ссылками на уроки</span></button>
 <button data-view="dict">${ico('dict',24)}<b>Словарик</b><span>${ALLW.length} слов: исключения, пары, трудные написания</span></button>
 <button data-view="cards">${ico('cards',24)}<b>Карточки</b><span>Повторение по интервалам</span></button></div>`;
 return h;
}

// глоссарий
let GQ='',GCAT='';
const GCATS=['Морфология','Морфемика и словообразование','Орфография','Синтаксис и пунктуация','Общие понятия'];
const first=s=>s.replace(/^[^а-яёА-ЯЁ]+/,'')[0].toUpperCase().replace('Ё','Е');
function glossList(){
 const q=GQ.trim().toLowerCase();
 const L=GLA.filter(g=>(!GCAT||g.cat===GCAT)&&(!q||(g.t+' '+g.d+' '+g.ex).toLowerCase().includes(q)));
 if(!L.length)return '<div class="note">Ничего не найдено.</div>';
 const groups={};L.forEach(g=>{(groups[first(g.t)]||(groups[first(g.t)]=[])).push(g)});
 return `<nav class="abc" aria-label="Алфавит">${Object.keys(groups).map(k=>`<button data-abc="ga-${k}">${k}</button>`).join('')}</nav>`+
 Object.entries(groups).map(([k,gs])=>`<section class="lgrp" id="ga-${k}"><div class="lch">${k}</div>${gs.map(g=>`<article class="gterm" id="g-${g.id}">
  <header><button class="gt" data-term="${g.id}">${g.t}</button><span class="gcat">${g.cat}</span></header>
  <p>${g.d}</p>${g.ex?`<div class="gex">${esc(g.ex)}</div>`:''}
  <div class="glinks">${g.at&&LES[g.at]?`<button class="linkbtn" data-tgo="${g.id}" data-l="${g.at}">${lesName(g.at)} ›</button>`:''}${(g.see||[]).filter(x=>GLOSS[x]).map(x=>`<button class="seel" data-gjump="${x}">${GLOSS[x].t}</button>`).join('')}</div></article>`).join('')}</section>`).join('');
}
function glossView(){
 return `<div class="kick" style="margin-top:4px">Глоссарий · ${GL.length} терминов</div>
 <p class="note">Каждый термин в тексте уроков подчёркнут пунктиром: нажмите — откроется карточка с определением и ссылками.</p>
 <input class="bsearch" id="gq" type="search" placeholder="Найти термин" value="${esc(GQ)}" autocomplete="off" aria-label="Поиск по глоссарию">
 <div class="chips">${['',...GCATS].map(c=>`<button class="chipc sm" data-gcat="${c}" aria-pressed="${GCAT===c}">${c||'Все'}</button>`).join('')}</div>
 <div id="glist" class="glist">${glossList()}</div>`;
}

// словарик
let DQ='',DTAG='';
const DTAGS=[['','Все'],['исключение','Исключения'],['пара','Пары'],['запомнить','Запомнить'],['сочетание','Сочетания'],['правило','По правилу'],['ударение','Ударения']];
const UDAR=DECKS.udar.cards.map(c=>({w:[...c.w].map((x,i)=>i===c.v&&x!=='ё'?x+A:x).join(''),n:'ударение на «'+c.w[c.v]+'»',tag:'ударение',at:'',hl:'',v:c.v,raw:c.w}));
const ALLW=[...WORDS,...UDAR].sort((a,b)=>a.w.replace(/́/g,'').localeCompare(b.w.replace(/́/g,''),'ru'));
function hlw(x){
 if(x.tag==='ударение')return [...x.raw].map((ch,i)=>i===x.v?`<mark>${ch}${ch!=='ё'?A:''}</mark>`:ch).join('');
 const w=esc(x.w);if(!x.hl)return w;const i=x.w.indexOf(x.hl);if(i<0)return w;
 return esc(x.w.slice(0,i))+`<mark>${esc(x.hl)}</mark>`+esc(x.w.slice(i+x.hl.length));
}
function dictList(){
 const q=DQ.trim().toLowerCase().replace(/́/g,'');
 const L=ALLW.filter(x=>(!DTAG||x.tag===DTAG)&&(!q||(x.w+' '+x.n+' '+(x.pair||'')).toLowerCase().replace(/́/g,'').includes(q)));
 if(!L.length)return '<div class="note">Ничего не найдено.</div>';
 const groups={};L.forEach(x=>{const k=first(x.w);(groups[k]||(groups[k]=[])).push(x)});
 return `<nav class="abc" aria-label="Алфавит">${Object.keys(groups).map(k=>`<button data-abc="da-${k}">${k}</button>`).join('')}</nav>`+
 Object.entries(groups).map(([k,xs])=>`<section class="lgrp" id="da-${k}"><div class="lch">${k}</div><div class="dlist">${xs.map(x=>`<div class="dw"><div class="dmain"><span class="dword">${hlw(x)}</span>${x.pair?`<span class="dpair">ср.: ${esc(x.pair)}</span>`:''}<span class="dnote">${esc(x.n)}</span></div>
  <div class="dside"><span class="dtag t-${x.tag}">${x.tag}</span>${DW[x.w.replace(/\u0301/g,'')]?`<button class="dcard" data-word="${esc(x.w.replace(/\u0301/g,''))}">статья</button>`:''}${x.at&&LES[x.at]?`<button class="linkbtn" data-ojump2="${x.at}" title="${esc(lesName(x.at))}">урок ›</button>`:x.tag==='ударение'?`<button class="linkbtn" data-deck="udar">карточки ›</button>`:''}</div></div>`).join('')}</div></section>`).join('');
}
function dictView(){
 return `${DICT.length?`<div class="kick" style="margin-top:4px">Умный словарь · ${DICT.length} статей</div>
 <p class="note">Значение, состав слова с разбором по шагам, словообразование, однокоренные слова, синонимы, формы и орфограммы. Слова из словаря подчёркнуты точками и в примерах уроков.</p>
 <div class="wcloud">${DICT.map(e=>`<button class="wl" data-word="${esc(e.w)}">${esc(e.w)}</button>`).join('')}</div>`:''}
 <div class="kick" style="margin-top:10px">Правописание · ${ALLW.length} слов</div>
 <p class="note">Выделено место, где ошибаются. Ссылка «урок» ведёт к правилу.</p>
 <input class="bsearch" id="dq" type="search" placeholder="Найти слово" value="${esc(DQ)}" autocomplete="off" aria-label="Поиск по словарику">
 <div class="chips">${DTAGS.map(([k,t])=>`<button class="chipc sm" data-dtag="${k}" aria-pressed="${DTAG===k}">${t}</button>`).join('')}</div>
 <div id="dlist">${dictList()}</div>`;
}

// где читаю: запоминаем урок
let lastT=0;
window.addEventListener('scroll',()=>{if(route.v!=='ch'||(S.tab||'theory')!=='theory')return;const now=Date.now();if(now-lastT<400)return;lastT=now;
 const secsEl=[...document.querySelectorAll('.bkles')];let cur=null;secsEl.forEach(s=>{if(s.getBoundingClientRect().top<140)cur=s.id});
 if(cur&&S.last!==cur){S.last=cur;save()}},{passive:true});
