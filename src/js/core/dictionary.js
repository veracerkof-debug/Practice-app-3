// ---------- умный словарь: карточка слова ----------
const DICT=[...(typeof DICT1!=='undefined'?DICT1:[]),...(typeof DICT2!=='undefined'?DICT2:[])].sort((a,b)=>a.w.localeCompare(b.w,'ru'));
const DW={};DICT.forEach(e=>{DW[e.w]=e});
const FMAP={};// форма -> заглавное слово
DICT.forEach(e=>{FMAP[e.w]=e.w;const F=FORMS[e.w];if(!F)return;
 const add=x=>String(x||'').split(' / ').forEach(v=>{v=v.trim();if(v&&!FMAP[v])FMAP[v]=e.w});
 if(F.rows)F.rows.flat().forEach(add);if(F.short)F.short.forEach(add);if(F.pres)F.pres.flat().forEach(add);if(F.past)F.past.forEach(add)});
const MT={pref:['приставка','var(--S)'],root:['корень','var(--D)'],suf:['суффикс','var(--T)'],end:['окончание','var(--V)'],post:['постфикс','var(--A)'],link:['соед. гласная','var(--l2)']};
const stressHTML=s=>esc(s).replace(/(.)́/g,'<span class="acc">$1&#769;</span>');
let WST={};// шаги разбора по словам
function morphParts(e){
 // какие морфемы входят в основу
 let acc='',inOsn=[];e.morph.forEach(([t,x])=>{const nx=acc+x;const ok=e.osn&&e.osn.startsWith(nx)&&t!=='end'&&t!=='post';inOsn.push(ok);if(ok)acc=nx});
 return inOsn;
}
function morphHTML2(e,step){
 const inO=morphParts(e);const show=t=>step>=5||(t==='end'&&step>=1)||(t==='root'&&step>=3)||(t==='pref'&&step>=4)||((t==='suf'||t==='post'||t==='link')&&step>=5);
 let h='<div class="mword" aria-label="Состав слова">',open=false;
 e.morph.forEach(([t,x],i)=>{
  if(inO[i]&&!open&&step>=2){h+='<span class="osn">';open=true}
  if(!inO[i]&&open){h+='</span>';open=false}
  const on=show(t);
  h+=`<span class="mp ${on?'m-'+t:''} ${x===''?'zero':''}" style="--mc:${MT[t][1]}" title="${on?MT[t][0]:''}"><span class="mx">${esc(x)||'&nbsp;'}</span></span>`;
 });
 if(open)h+='</span>';
 return h+'</div>';
}
function stepText(e,step){
 const F=FORMS[e.w]||{},ends=e.morph.filter(m=>m[0]==='end'),roots=e.morph.filter(m=>m[0]==='root'),prefs=e.morph.filter(m=>m[0]==='pref'),sufs=e.morph.filter(m=>m[0]==='suf'||m[0]==='post'||m[0]==='link');
 let other='';if(F.rows)other=String(F.rows[1][0]).split(' / ')[0];else if(F.past)other=F.past[1]||F.past[0];
 const nest=(e.nest||[]).flatMap(g=>g[1]).slice(0,4).join(', ');
 return ['Нажмите «Дальше» и разберите слово по шагам — как в тетради.',
  ends.length?(ends[0][1]?`<b>Окончание.</b> Изменим форму: ${e.w} → ${other||'…'}. Изменяемая часть <b class="m">-${esc(ends[0][1])}</b> — окончание.`:`<b>Окончание нулевое:</b> при изменении формы оно появляется (${other||'…'}), а в начальной форме его не слышно и не видно.`):(F.t==='verb'?`<b>Окончания у инфинитива нет.</b> Изменим форму: ${e.w} → ${other||'…'} — меняется конец слова, а <b class="m">-ть</b> (-ти) — суффикс неопределённой формы, он в основу не входит.`:'<b>Окончания нет:</b> слово не изменяется.'),
  `<b>Основа</b> — часть слова без окончания${e.morph.some(m=>m[0]==='post')?' и постфикса':''}${F.t==='verb'?' и суффикса инфинитива':''}: <b class="m">${esc(e.osn)}</b>.`,
  `<b>Корень.</b> Подбираем однокоренные слова${nest?': '+esc(nest):''}. Общая часть <b class="m">${roots.map(r=>esc(r[1])).join(', ')}</b> — корень.`,
  prefs.length?`<b>Приставка</b> стоит перед корнем: <b class="m">${prefs.map(r=>esc(r[1])+'-').join(' ')}</b>.`:'<b>Приставки нет:</b> перед корнем ничего не стоит.',
  (()=>{const sf=sufs.filter(r=>r[0]!=='post'),pf=sufs.filter(r=>r[0]==='post');let t=sf.length?`<b>Суффиксы</b> — после корня: <b class="m">${sf.map(r=>r[0]==='link'?'соединительная гласная '+esc(r[1]):'-'+esc(r[1])+'-').join(', ')}</b>.`:'<b>Суффиксов нет.</b>';if(pf.length)t+=` <b>Постфикс</b> <b class="m">-${esc(pf[0][1])}</b> стоит после окончания.`;return t+' Слово разобрано.'})()][step];
}
function formsHTML(e){
 const F=FORMS[e.w];if(!F||F.t==='none')return '';
 const CN=['Им.','Род.','Дат.','Вин.','Тв.','Пр.'];let rows=F.rows;
 if(F.t==='noun'&&/неодуш/.test(e.gram||'')){rows=rows.map(r=>r.slice());rows[3]=[...rows[0]]}
 let t='';
 const cell=x=>esc(x).split(' / ').join('<br>');
 if(F.t==='adj')t=`<div class="fsw" role="radiogroup" aria-label="Род и число">${['м. р.','ж. р.','ср. р.','мн. ч.'].map((g,i)=>`<button role="radio" data-fcol="${i+1}" aria-pressed="${i===0}">${g}</button>`).join('')}</div><table class="bktbl ftbl adj" data-c="1"><thead><tr><th></th><th>м. р.</th><th>ж. р.</th><th>ср. р.</th><th>мн. ч.</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><th>${CN[i]}</th>${r.map(x=>`<td>${cell(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>${F.short&&F.short.length?`<p class="note">Краткая форма: ${F.short.map(esc).join(', ')}</p>`:''}`;
 else if(F.t==='noun')t=`<table class="bktbl ftbl"><thead><tr><th></th><th>ед. ч.</th><th>мн. ч.</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><th>${CN[i]}</th>${r.map(x=>`<td>${cell(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
 else if(F.t==='verb')t=`<table class="bktbl ftbl"><thead><tr><th></th><th>ед. ч.</th><th>мн. ч.</th></tr></thead><tbody>${F.pres.map((r,i)=>`<tr><th>${i+1}-е л.</th>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>
  <div class="fgrid"><div><span>Прошедшее</span>${F.past.filter(Boolean).map(esc).join(', ')}</div><div><span>Повелительное</span>${F.imp.filter(Boolean).map(esc).join(', ')}</div>
  <div><span>Причастия</span>${F.parts.filter(Boolean).map(x=>DW[x]?`<button class="wl" data-word="${x}">${x}</button>`:esc(x)).join(', ')||'—'}</div><div><span>Деепричастия</span>${F.grnd.map(esc).join(', ')||'—'}</div></div>`;
 return `<details class="wsec fdet"><summary>Формы слова</summary>${t}</details>`;
}
const wlink=w=>DW[w]?`<button class="wl" data-word="${esc(w)}">${esc(w)}</button>`:esc(w);
function wordHTML(w){
 const e=DW[w];
 const back=`<div class="bkhbar"><div class="in"><button class="back" data-wback>‹ Назад</button><span class="where">Словарь · ${DICT.length} статей</span></div></div>`;
 if(!e)return back+'<div class="wrap"><p>Статьи нет.</p></div>';
 const step=WST[w]??0, chain=e.chain||[], ci=chain.indexOf(e.w);
 let h=back+`<div class="wrap wpage">
 <header class="whead"><div class="kick">${esc(e.pos)}</div><h2 class="wtitle">${stressHTML(e.s||e.w)}</h2><div class="sub">${esc(e.gram||'')}</div></header>
 <section class="wsec"><h3>Значение</h3><ol class="wmean">${e.mean.map(m=>`<li><span>${esc(m.d)}</span>${m.ex?`<i>${esc(m.ex)}</i>`:''}</li>`).join('')}</ol></section>
 <section class="wsec"><h3>Состав слова</h3>${morphHTML2(e,step)}
  <div class="mleg">${[...new Set(e.morph.map(m=>m[0]))].filter(t=>step>=5||(t==='end'&&step>=1)||(t==='root'&&step>=3)||(t==='pref'&&step>=4)).map(t=>`<span style="--mc:${MT[t][1]}"><i class="lg m-${t}"></i>${MT[t][0]}</span>`).join('')}${step>=2?'<span><i class="lg lg-osn"></i>основа</span>':''}</div>
  <div class="mstep"><div class="mtx">${stepText(e,step)}</div><div class="mbtn">${step>0?`<button class="ghost" data-wstep="${esc(w)}" data-to="0">Сначала</button>`:''}${step<5?`<button class="bkldone" data-wstep="${esc(w)}" data-to="${step+1}">${step?'Дальше':'Разобрать по шагам'}</button>`:''}${step===0?`<button class="ghost" data-wstep="${esc(w)}" data-to="5">Показать сразу</button>`:''}</div></div></section>`;
 h+=`<section class="wsec"><h3>Как образовано</h3>
  ${chain.length>1?`<div class="wchain">${chain.map((x,i)=>`${i?`<span class="war">→${i===ci&&e.form.aff?`<small>${esc(e.form.aff)}</small>`:''}</span>`:''}<span class="wch ${i===ci?'cur':''}">${i===ci?esc(x):wlink(x)}</span>`).join('')}</div>`:''}
  <p>${e.form.how==='непроизводное'?'Непроизводное слово: оно не образовано от другого слова.':`Образовано от слова ${wlink(e.form.from)} ${esc(e.form.how)} способом${e.form.aff?` (${esc(e.form.aff)})`:''}.`}</p></section>`;
 if(e.nest&&e.nest.length){const root=e.morph.filter(m=>m[0]==='root').map(m=>m[1]).join('-');
  h+=`<section class="wsec"><h3>Однокоренные слова</h3><div class="wnest"><div class="wroot">-${esc(root)}-</div><div class="wgr">${e.nest.map(([p,ws])=>`<div class="wg"><span>${esc(p)}</span><div>${ws.map(x=>`<span class="wn">${wlink(x)}</span>`).join('')}</div></div>`).join('')}</div></div></section>`}
 const rel=[['Синонимы',e.syn],['Антонимы',e.ant]].filter(x=>x[1]&&x[1].length);
 if(rel.length||(e.par&&e.par.length))h+=`<section class="wsec"><h3>Близкие и противоположные</h3><div class="wrel">${rel.map(([t,xs])=>`<div><span>${t}</span>${xs.map(wlink).join(', ')}</div>`).join('')}${e.par&&e.par.length?`<div><span>Паронимы — не путать</span>${e.par.map(p=>`<p>${wlink(p.w)} — ${esc(p.d)}</p>`).join('')}</div>`:''}</div></section>`;
 if(e.phr&&e.phr.length)h+=`<section class="wsec"><h3>Устойчивые выражения</h3><ul class="wphr">${e.phr.map(p=>`<li><b>${esc(p.p)}</b> — ${esc(p.d)}</li>`).join('')}</ul></section>`;
 if(e.orth&&e.orth.length)h+=`<section class="wsec"><h3>Орфограммы</h3><div class="worth">${e.orth.map(o=>`<div><p>${esc(o.t)}</p>${o.at&&LES[o.at]?`<button class="linkbtn" data-ojump2="${o.at}">Правило: ${lesName(o.at)} ›</button>`:''}</div>`).join('')}</div></section>`;
 if(e.note)h+=`<div class="bins btip"><div class="h">Интересно</div><p>${esc(e.note)}</p></div>`;
 h+=formsHTML(e);
 h+=`<div class="bsrc">Значения и ударение — по материалам Русского Викисловаря (CC BY-SA), формы слов — OpenCorpora (CC BY-SA). Морфемный и словообразовательный разбор — по школьной традиции.</div></div>`;
 return h;
}
// слова-ссылки в примерах уроков
function linkWords(root){
 if(!root)return;const re=/[а-яё]+/gi;
 root.querySelectorAll('.ex').forEach(el=>{
  const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const ns=[];let n;while(n=w.nextNode())if(!n.parentElement.closest('button,.m'))ns.push(n);
  ns.forEach(n=>{const s=n.nodeValue;let last=0,m,frag=null;re.lastIndex=0;
   while(m=re.exec(s)){const k=FMAP[m[0].toLowerCase()];if(!k)continue;frag=frag||document.createDocumentFragment();
    frag.append(s.slice(last,m.index));const b=document.createElement('button');b.className='wl';b.dataset.word=k;b.textContent=m[0];frag.append(b);last=m.index+m[0].length}
   if(frag){frag.append(s.slice(last));n.replaceWith(frag)}});
 });
}
