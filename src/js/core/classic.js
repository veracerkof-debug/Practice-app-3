// ---------- упражнения в тетрадь ----------
// Ответы показываются только в версии для учителя (TEACHER, см. tools/build.py); в версии ученика их нет в файле.
// Навигация: карта номеров (по урокам), поле «Найти по номеру», ссылка на упражнения.
// Номер упражнения (e.n) постоянный: задан в данных главы и никогда не меняется.
// Задание от учителя («упр. 12–15») открывается отдельным видом: видны только эти упражнения,
// фильтры не действуют — так ученик не перепутает, что задано.
let CLF=0;      // фильтр по уроку (0 — все)
let CLR=null;   // показаны только эти номера (массив) — по полю номера или по ссылке
let CLU=false;  // только невыполненные
let CLO=false;  // только особые (диктант, сочинение, изложение, работа с текстом — длинные жанры, поле e.os)
const clKey=e=>'cl-'+CC().id+'-'+e.n;
const STARS=n=>`<span class="stars" title="Сложность: ${n} из 5">${'★'.repeat(n)}<span>${'★'.repeat(5-n)}</span></span>`;
const clLabel=(c,l)=>l<c.lnames.length-1?'Урок '+l:c.lnames[l];
// «12», «12-15», «12–15, 18», «упр. 12 и 14» → [12,13,14,15,18] (только существующие номера)
function clParse(c,v){
 const have=new Set(c.classic.map(e=>e.n)),out=new Set();
 String(v).toLowerCase().replace(/упр[а-яё]*\.?|№/g,' ').replace(/(^|\s)и(?=\s)/g,',').replace(/\s*[-–—]\s*/g,'-').split(/[,;\s]+/).forEach(part=>{
  const m=part.trim().match(/^(\d+)(?:-(\d+))?$/);if(!m)return;
  let a=+m[1],b=m[2]?+m[2]:a;if(b<a)[a,b]=[b,a];if(b-a>300)return;
  for(let k=a;k<=b;k++)if(have.has(k))out.add(k)});
 return [...out].sort((x,y)=>x-y);
}
// [12,13,14,15,18] → «12–15, 18» (для текста) или «12-15,18» (для ссылки)
function clFmt(list,link){
 const r=[];list.forEach(n=>{const g=r[r.length-1];if(g&&n===g[1]+1)g[1]=n;else r.push([n,n])});
 return r.map(([a,b])=>a===b?a:a+(link?'-':'–')+b).join(link?',':', ');
}
const clLink=(c,list)=>location.href.split('#')[0]+'#ex-'+c.id+'-'+clFmt(list,true);

// поле «Найти по номеру» и карта номеров — в главе, в боковой колонке и в шторке «Содержание»
function clFindHTML(side){
 return `<form class="clfind" data-clform><input name="q" type="text" enterkeyhint="go" autocomplete="off" placeholder="${side?'12 или 12–15':'Номер: 12 или 12–15'}" aria-label="Номера упражнений, например 12 или 12–15"><button type="submit">Показать</button></form>`;
}
function clMapHTML(c){
 const by={};c.classic.forEach(e=>(by[e.l]||(by[e.l]=[])).push(e));
 return `<div class="clmap" aria-label="Номера упражнений">${Object.keys(by).map(l=>`<div class="cmr"><span class="cml">${clLabel(c,+l)}</span><div class="cmn">${by[l].map(e=>{
  const dn=S.done['cl-'+c.id+'-'+e.n],on=CLR&&CLR.includes(e.n);
  return `<button class="cmb${dn?' dn':''}${on?' on':''}" data-clgo="${e.n}" title="Упражнение ${e.n} · сложность ${e.st} из 5${e.os?' · особое: '+e.os:''}${dn?' · выполнено':''}" aria-label="Упражнение ${e.n}${dn?', выполнено':''}">${e.n}</button>`}).join('')}</div></div>`).join('')}</div>
 <div class="cmleg"><span><i class="cmb dn"></i>выполнено</span><span><i class="cmb"></i>не выполнено</span></div>`;
}

// материал упражнения: каждое пронумерованное предложение — с новой строки, подпись автора — отдельно и мельче,
// «Пояснения: …» в конце (значения редких и старых слов в цитатах) — отдельной строкой
// материал упражнения: экранируется; <br> из данных — разрыв строки; «Ошибки:», «Предложения:» и т. п. в начале строки — подпись блока;
// перечни «А) … Б) …» — каждый пункт с новой строки
const clBody=b=>esc(b).replace(/&lt;br\s*\/?&gt;/g,'<br>')
 .replace(/(^|<br>)\s*([А-ЯЁ][а-яё]+(?: [а-яё]+){0,3}):\s/g,'$1<b class="cllab">$2:</b> ')
 .replace(/ ([Б-Е])\) (?=\S)/g,(m,l)=>/(^|\s|>)А\) /.test(b)?'<br>'+l+') ':m)
 .replace(/ ([2-9]|1\d)\) (?=[А-ЯЁ(«])/g,(m,d)=>/(^|\s|>)1\) /.test(b)?'<br>'+d+') ':m)
 .replace(/ (\d{1,2})\. (?=[А-ЯЁ(])/g,'<br>$1. ')
 .replace(/ (\d{1,2})\. (?=[а-яё«])/g,(m,d)=>/^\s*1\. /.test(b)&&/ 2\. /.test(b)?'<br>'+d+'. ':m).replace(/\(([А-ЯЁ]\. [А-ЯЁ]\. [А-ЯЁа-яё-]+, «[^»]+»)\)/g,'<span class="clsrc">$1</span>').replace(/ Пояснения: (.*)$/,'<span class="clgl"><b>Пояснения:</b> $1</span>');
function clExHTML(c,e){
 const dn=S.done[clKey(e)];
 return `<section class="clex ${dn?'is':''}" id="cl${e.n}"><div class="clh"><span class="cln">Упражнение ${e.n}</span>${STARS(e.st)}${e.os?`<span class="clos" title="Особое упражнение: длинный жанр">особое · ${e.os}</span>`:''}${dn?'<span class="okm">✓ выполнено</span>':''}<button class="cllink" data-cllink="${e.n}" title="Скопировать ссылку на это упражнение">ссылка</button></div>
  <p class="task">${e.task}</p>${e.obr?(S.easy?`<div class="obr"><b>Образец.</b> ${e.obr}</div>`:`<details class="bkhelp"><summary>Образец</summary><div class="body"><p>${e.obr}</p></div></details>`):''}<p class="cbody">${clBody(e.body)}</p>
  ${TEACHER&&e.key?`<details class="bkhelp tkey"><summary>Ответы (для учителя)</summary><div class="body"><p>${e.key}</p></div></details>`:''}
  <button class="pill ${dn?'done':''}" data-cldone="${e.n}">${dn?'✓ Выполнено':'Отметить: выполнено'}</button></section>`;
}
function clList(c,list,books){
 let h='',cur=0;
 list.forEach(e=>{
  if(e.l!==cur){cur=e.l;h+=`<h3>${clLabel(c,cur)}${cur<c.lnames.length-1?'. '+c.lnames[cur]:''}</h3>`;
   if(books&&c.bookref&&c.bookref[cur])h+=`<div class="clbook"><b>Ещё — в бумажной книге:</b> ${c.bookref[cur]}. <span>Номера там — по той книге, а не по этому учебнику.</span></div>`}
  h+=clExHTML(c,e)});
 return h;
}

function classicHTML(){
 const c=CC(),CL=c.classic,LN=c.lnames;
 const doneN=CL.filter(e=>S.done[clKey(e)]).length;
 // вид «задание»: только выбранные номера
 if(CLR&&CLR.length){
  const L=CL.filter(e=>CLR.includes(e.n)),dn=L.filter(e=>S.done[clKey(e)]).length,meta=chById(c.id);
  return `<div class="bktext"><div class="clset" id="clset"><div class="kick">Глава ${meta.part.n}.${meta.part.ch.indexOf(meta)+1} · ${meta.t}</div>
  <div class="t">${L.length>1?'Упражнения':'Упражнение'} ${clFmt(CLR)}</div>
  <div class="sub">Показаны только ${L.length>1?'эти упражнения':'это упражнение'}${L.length>1?`: ${L.length} шт., выполнено ${dn}`:dn?' · выполнено':''}.</div>
  <div class="row"><button class="pill" data-clcopy>Скопировать ссылку</button><button class="pill" data-clall>Все упражнения главы</button></div></div>
  ${clList(c,L,false)}
  <div class="row"><button class="pill" data-clall>‹ Все упражнения главы</button></div></div>`;
 }
 let h=`<div class="bktext">${TEACHER?'<div class="bins bkey tnote"><div class="h">Версия для учителя</div><p>Ответы к упражнениям открыты. В версии для учеников ответов нет.</p></div>':''}<details class="bins btip clhow"${S.clhow?' open':''} data-clhow><summary class="h">Как работать с упражнениями</summary><p>Упражнения выполняются письменно, в тетради. Проверяет учитель; после выполнения — отметка «Выполнено».</p><p>У каждого упражнения <b>свой постоянный номер</b>. Задали, например, «упражнения 12–15» — ввести номера в поле ниже или открыть ссылку от учителя: на экране останутся только заданные упражнения.</p><p>Сложность — от одной до пяти звёзд: ${STARS(1)} по образцу, ${STARS(2)} простое применение правила, ${STARS(3)} с объяснением, ${STARS(4)} поиск ошибок и разбор, ${STARS(5)} самое сложное — с тонкостями и неочевидными случаями. Пометка <span class="clos">особое</span> — длинные жанры: диктант, сочинение, изложение, работа с текстом; на них уходит больше времени.</p></details>
 <div class="clnav">${clFindHTML()}${clMapHTML(c)}</div>
 <div class="tl">Урок</div><div class="chips">${LN.map((n,l)=>`<button class="chipc" data-clf="${l}" aria-pressed="${CLF===l}">${l?clLabel(c,l):'Все уроки'}</button>`).join('')}</div>
 <div class="tl">Сложность</div><div class="chips">${[0,1,2,3,4,5].map(s=>`<button class="chipc" data-cls="${s}" aria-pressed="${(S.cls||0)===s}">${s?'★'.repeat(s):'Любая'}</button>`).join('')}${CL.some(e=>e.os)?`<button class="chipc" data-clo aria-pressed="${CLO}">Особые</button>`:''}<button class="chipc" data-clu aria-pressed="${CLU}">Только невыполненные</button></div>
 <div class="prog"><span>Выполнено ${doneN} из ${CL.length}</span></div><div class="bar"><i style="width:${doneN/CL.length*100}%"></i></div>`;
 const L=CL.filter(e=>(!CLF||e.l===CLF)&&(!S.cls||e.st===S.cls)&&(!CLU||!S.done[clKey(e)])&&(!CLO||e.os));
 h+=L.length?clList(c,L,true):'<p class="note">Под этот отбор упражнений нет.</p>';
 return h+'</div>';
}

// переходы
function clShow(list){CLR=list.length?list:null;S.tab='classic';save();go({v:'ch',id:CC().id});setTimeout(()=>{const t=document.getElementById('clset');if(t)t.scrollIntoView({block:'start'})},30)}
function clJump(n){ // к одному упражнению в общем списке: снять мешающие фильтры
 const c=CC(),e=c.classic.find(x=>x.n===n);if(!e)return;
 const hidden=(CLF&&e.l!==CLF)||(S.cls&&e.st!==S.cls)||(CLU&&S.done[clKey(e)])||(CLO&&!e.os);
 if(CLR||hidden||(S.tab||'theory')!=='classic'){CLR=null;CLF=0;S.cls=0;CLU=false;CLO=false;S.tab='classic';save();go({v:'ch',id:c.id},true)}
 setTimeout(()=>{const el=document.getElementById('cl'+n);if(!el)return;el.scrollIntoView({behavior:RM()?'auto':'smooth',block:'start'});el.classList.add('clhl');setTimeout(()=>el.classList.remove('clhl'),1600)},40);
}
function clCopy(text){
 const done=()=>toast('Ссылка скопирована');
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(done,()=>prompt('Скопировать ссылку:',text));
 else prompt('Скопировать ссылку:',text);
}
function toast(t){const o=document.querySelector('.toast');if(o)o.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=t;document.body.append(el);setTimeout(()=>el.remove(),1800)}
document.addEventListener('submit',e=>{const f=e.target;if(!f.matches('[data-clform]'))return;e.preventDefault();
 const v=f.q.value,list=clParse(CC(),v);
 if(!list.length){toast(v.trim()?'Таких номеров в этой главе нет':'Введите номер упражнения');return}
 closeSheet();clShow(list)});
document.addEventListener('toggle',e=>{if(e.target.dataset&&'clhow' in e.target.dataset){S.clhow=e.target.open;save()}},true);
