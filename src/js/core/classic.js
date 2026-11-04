// ---------- упражнения в тетрадь ----------
let CLF=0;
const clKey=e=>'cl-'+CC().id+'-'+e.n;
const STARS=n=>`<span class="stars" title="Сложность: ${n} из 5">${'★'.repeat(n)}<span>${'★'.repeat(5-n)}</span></span>`;
function classicHTML(){
 const c=CC(),CL=c.classic,LN=c.lnames,last=LN.length-1;
 const doneN=CL.filter(e=>S.done[clKey(e)]).length;
 let h=`<div class="bktext"><div class="bins btip"><div class="h">Как работать</div><p>Упражнения выполняются письменно, в тетради. После выполнения — сверка с ответами и отметка «Выполнено». Номера сквозные по главе: учитель может задать «упражнения 4–6».</p><p>Сложность — от одной до пяти звёзд: ${STARS(1)} по образцу, ${STARS(2)} простое применение правила, ${STARS(3)} с объяснением, ${STARS(4)} поиск ошибок и разбор, ${STARS(5)} текст, диктант, сочинение.</p></div>
 <div class="chips">${LN.map((n,l)=>`<button class="chipc" data-clf="${l}" aria-pressed="${CLF===l}">${l?l+'. '+n:'Все ('+CL.length+')'}</button>`).join('')}</div>
 <div class="tl">Сложность</div><div class="chips">${[0,1,2,3,4,5].map(s=>`<button class="chipc" data-cls="${s}" aria-pressed="${(S.cls||0)===s}">${s?'★'.repeat(s):'Любая'}</button>`).join('')}</div>
 <div class="prog"><span>Выполнено ${doneN} из ${CL.length}</span></div><div class="bar"><i style="width:${doneN/CL.length*100}%"></i></div>`;
 let cur=0,shown=0;
 CL.filter(e=>(!CLF||e.l===CLF)&&(!S.cls||e.st===S.cls)).forEach(e=>{
  shown++;
  if(e.l!==cur){cur=e.l;h+=`<h3>${cur<last?'Урок '+cur+'. ':''}${LN[cur]}</h3>${c.bookref&&c.bookref[cur]?`<div class="bkhint">Ещё упражнения на эту тему в книге: ${c.bookref[cur]}.</div>`:''}`}
  const dn=S.done[clKey(e)];
  h+=`<section class="clex ${dn?'is':''}" id="cl${e.n}"><div class="clh"><span class="kick">Упражнение ${e.n}</span>${STARS(e.st)}${dn?'<span class="okm">✓ выполнено</span>':''}</div>
  <p class="task">${e.task}</p>${e.obr?(S.easy?`<div class="obr"><b>Образец.</b> ${e.obr}</div>`:`<details class="bkhelp"><summary>Образец</summary><div class="body"><p>${e.obr}</p></div></details>`):''}<p class="cbody">${esc(e.body)}</p>
  <details class="bkhelp"><summary>Ответы</summary><div class="body"><p>${e.key}</p></div></details>
  <button class="pill ${dn?'done':''}" data-cldone="${e.n}">${dn?'✓ Выполнено':'Отметить: выполнено'}</button></section>`;
 });
 if(!shown) h+='<p class="note">Под этот отбор упражнений нет.</p>';
 return h+'</div>';
}


