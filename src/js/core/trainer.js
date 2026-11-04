// ---------- тренажёр (общий для всех глав) ----------
function CC(){return CHAPTERS[route&&route.id]||NN}
const TR={ch:null,les:[],mode:'pick',cnt:10,run:null};
function trSync(){const c=CC();if(TR.ch!==c.id){TR.ch=c.id;TR.les=c.lessons.map((_,i)=>i+1);TR.run=null;TR.mode=c.wk?'all':'pick'}}
const TR_OLD={pick:'По одному',cols:'Столбики',err:'Найти ошибку',mix:'Вперемешку'};
const TR_DESC={pick:'Одно задание за раз: выбрать верный вариант.',cols:'Несколько слов сразу — разложить по столбикам, потом проверить.',err:'Слова написаны полностью, в одном ошибка — найти её.',mix:'Все виды заданий вперемешку.',all:'Задания всех видов вперемешку: выделить, подчеркнуть, собрать, разобрать, расставить запятые, выбрать букву и правило. Где была ошибка — задание вернётся в конце серии.'};
const trIsMech=m=>m==='all'||!!MECH[m];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const fill=(w,v)=>w.replace('_',v);
const OPTS=it=>it.opts||['н','нн'];
const gap=it=>it.w.includes('_');
function trPool(){return CC().bank.filter(b=>TR.les.includes(b.l))}
function groupCols(pool){
 // столбики: только задания с пропуском и двумя вариантами, сгруппированные по одинаковым вариантам
 const by={};pool.filter(it=>gap(it)&&OPTS(it).length===2).forEach(it=>{const k=OPTS(it).join('|');(by[k]=by[k]||[]).push(it)});
 const out=[];Object.values(by).forEach(arr=>{for(let i=0;i<arr.length;i+=6){const g=arr.slice(i,i+6);if(g.length>=3)out.push({k:'cols',items:g,set:{},opts:OPTS(g[0])});else g.forEach(it=>out.push({k:'pick',it}))}});
 return out;
}
function groupErr(pool){
 const g=pool.filter(gap),rest=pool.filter(it=>!gap(it)),out=[];
 for(let i=0;i<g.length;i+=4){const x=g.slice(i,i+4);if(x.length<3){x.forEach(it=>out.push({k:'pick',it}));continue}out.push({k:'err',items:x,bad:Math.floor(Math.random()*x.length),pick:null})}
 rest.forEach(it=>out.push({k:'pick',it}));return out;
}
function trStart(items){
 if(items&&items.some(it=>it.mt)){TR.run={tasks:items.map(it=>it.mt?mClone(it.mt):{k:'pick',it}),i:0,ok:0,tot:0,wrong:[],pool:items};return}
 if(!items&&trIsMech(TR.mode)){ // механики: каждое задание создаётся заново из размеченного материала
  const c=CC(),av=mAvail(c,TR.les),bank=shuffle(trPool()),N=TR.cnt==='all'?20:TR.cnt,tasks=[];let prev='';
  for(let k=0;k<N;k++){
   if(TR.mode!=='all'){tasks.push(mGen(c,TR.mode,TR.les));continue}
   if(bank.length&&(Math.random()<.3||!av.length)){tasks.push({k:'pick',it:bank.pop()});prev='pick';continue}
   const ch=av.filter(m=>m!==prev),m=pick1(ch.length?ch:av);tasks.push(mGen(c,m,TR.les));prev=m;
  }
  TR.run={tasks,i:0,ok:0,tot:0,wrong:[],pool:[]};return;
 }
 const pool=items||shuffle(trPool()).slice(0,TR.cnt==='all'?9999:TR.cnt);
 let tasks;
 if(TR.mode==='cols') tasks=groupCols(pool);
 else if(TR.mode==='err') tasks=groupErr(pool);
 else if(TR.mode==='mix'){const a=shuffle(pool),n=Math.ceil(a.length/3);tasks=shuffle([...a.slice(0,n).map(it=>({k:'pick',it})),...groupErr(a.slice(n,2*n)),...groupCols(a.slice(2*n))])}
 else tasks=pool.map(it=>({k:'pick',it}));
 TR.run={tasks,i:0,ok:0,tot:0,wrong:[],pool};
}
function trSetupHTML(){
 trSync();const c=CC(),n=trPool().length,av=mAvail(c,TR.les);
 if(c.wk&&MECH[TR.mode]&&!av.includes(TR.mode))TR.mode='all';
 const chip=(k,t)=>`<button class="chipc" data-trm="${k}" aria-pressed="${TR.mode===k}">${t}</button>`;
 const modes=c.wk?`<div class="tl">Вид задания</div><div class="chips">${chip('all','Все виды вперемешку')}</div>
  <div class="tl">Действия — как в тетради</div><div class="chips">${av.map(m=>chip(m,MECH[m].t)).join('')||'<span class="note">Для выбранных уроков нет.</span>'}</div>
  <div class="tl">Выбор варианта</div><div class="chips">${['pick','cols','err'].map(k=>chip(k,TR_OLD[k])).join('')}</div>`
  :`<div class="tl">Вид задания</div><div class="seg" role="radiogroup">${Object.entries(TR_OLD).map(m=>`<button role="radio" data-trm="${m[0]}" aria-pressed="${TR.mode===m[0]}">${m[1]}</button>`).join('')}</div>`;
 const mech=trIsMech(TR.mode),can=mech?av.length>0:n>0;
 return `<div class="blab"><div class="cap"><b>Тренажёр</b><span class="bkhint">${c.wk?`${mAvail(c,c.lessons.map((_,i)=>i+1)).length} видов действий · `:''}в банке ${c.bank.length} заданий</span></div>
 <div class="tl">Уроки</div><div class="chips">${c.lessons.map((l,i)=>`<button class="chipc" data-trl="${i+1}" aria-pressed="${TR.les.includes(i+1)}">${i+1}. ${c.lnames[i+1]}</button>`).join('')}</div>
 ${modes}
 <div class="tl">Сколько заданий</div><div class="seg" role="radiogroup">${(mech?[10,15,20]:[10,20,40,'all']).map(x=>`<button role="radio" data-trc="${x}" aria-pressed="${String(TR.cnt)===String(x)}">${x==='all'?'Все ('+n+')':x}</button>`).join('')}</div>
 <button class="bkldone" data-trgo ${can?'':'disabled'}>Начать</button>
 <div class="bkhint">${MECH[TR.mode]?MECH[TR.mode].d:TR_DESC[TR.mode]}</div></div>`;
}
const ok_=t=>`<b style="color:var(--T)">${t}</b>`,bad_='<b style="color:var(--red)">Неверно.</b>';
function trTaskHTML(t){
 const c=CC();
 if(t.k==='m')return mechHTML(t);
 if(t.k==='pick'){
  const it=t.it,a=t.ans,op=OPTS(it),g=gap(it);
  const w=g?esc(it.w).replace('_',`<span class="slot ${a?(a===it.a?'ok':'bad'):''}">${a?it.a:'…'}</span>`):esc(it.w);
  const long=op.some(v=>v.length>4);
  return `<div class="card"><div class="ty">${it.q||(g?'Выбрать вариант':'Ответить')} · урок ${it.l}</div><div class="word" style="font-size:${g?26:22}px">${w}</div>
  <div class="${long?'errl':'ans'}" style="justify-content:center">${op.map(v=>{let cl='';if(a){if(v===it.a)cl='ok';else if(v===a)cl='bad'}if(!a&&t.first===v)cl='bad';
   return long?`<button class="opt ${cl?'e'+cl:''}" data-trp="${esc(v)}" ${a||t.first===v?'disabled':''}>${esc(v)}</button>`:`<button data-trp="${esc(v)}" class="${cl}" ${a||t.first===v?'disabled':''} style="min-width:80px;min-height:52px;font-size:19px">${esc(v)}</button>`}).join('')}</div>
  ${t.hinted&&!a?`<div class="obr"><b>Подсказка.</b> ${c.lessons[it.l-1].hint} Попробовать ещё раз.</div>`:''}
  ${a?`<div class="aa"><div>${a===it.a?ok_(t.hinted?'Теперь верно.':'Верно.'):bad_} ${it.why}</div></div>`:''}</div>`;
 }
 if(t.k==='cols'){
  const chk=t.checked,[v1,v2]=t.opts;
  const col=v=>t.items.map((it,i)=>{if(t.set[i]!==v)return'';const cls=chk?(it.a===v?'ok':'bad'):'';return `<button class="wchip ${cls}" data-trcol="${i}" ${chk?'disabled':''}>${esc(fill(it.w,v))}</button>`}).join('');
  const free=t.items.map((it,i)=>t.set[i]?'':`<div class="wfree"><span>${esc(it.w).replace('_','<span class="slot">…</span>')}</span><span class="ans">${t.opts.map(v=>`<button data-trset="${i}" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</span></div>`).join('');
  return `<div class="card" style="justify-content:flex-start"><div class="ty">Разложить по столбикам</div>${free?`<div class="wfreel">${free}</div>`:''}
  <div class="cols"><div><div class="colh"><span class="tagN">${esc(v1)}</span></div>${col(v1)}</div><div><div class="colh"><span class="tagNN">${esc(v2)}</span></div>${col(v2)}</div></div>
  ${chk?`<div class="aa">${t.items.map((it,i)=>t.set[i]===it.a?'':`<div><b style="color:var(--red)">${esc(fill(it.w,it.a))}</b> — ${it.why}</div>`).join('')||'<div><b style="color:var(--T)">Всё верно.</b></div>'}</div>`:`<div class="bkhint">Нажатие на слово в столбике возвращает его назад.</div>`}</div>`;
 }
 const p=t.pick;
 return `<div class="card" style="justify-content:flex-start"><div class="ty">Найти слово с ошибкой</div><div class="errl">${t.items.map((it,i)=>{
   const wrongV=OPTS(it).find(v=>v!==it.a);const shown=fill(it.w,i===t.bad?wrongV:it.a);let cl='';if(p!=null){if(i===t.bad)cl='ok';else if(i===p)cl='bad'}
   return `<button class="opt ${cl?'e'+cl:''}" data-tre="${i}" ${p!=null?'disabled':''}>${esc(shown)}</button>`}).join('')}</div>
  ${p!=null?`<div class="aa"><div>${p===t.bad?ok_('Верно.'):bad_} Правильно: <b>${esc(fill(t.items[t.bad].w,t.items[t.bad].a))}</b>. ${t.items[t.bad].why}</div></div>`:''}</div>`;
}
const shownAns=it=>gap(it)?fill(it.w,it.a):it.w+' — '+it.a;
function trRunHTML(){
 const r=TR.run;
 if(r.i>=r.tasks.length){
  return `<div class="card" style="text-align:center;align-items:center"><div class="ty">Серия закончена</div><div class="qq">Верно ${r.ok} из ${r.tot}</div>
  ${r.wrong.length?`<div class="aa" style="text-align:left;width:100%">${r.wrong.map(it=>`<div><b>${esc(shownAns(it))}</b> — ${it.why}</div>`).join('')}</div>`:'<div class="note">Ошибок нет.</div>'}</div>
  <div class="big2">${r.wrong.length?`<button class="again" data-trerr>Повторить ошибки</button>`:''}<button class="main" data-trgo>Новая серия</button></div><button class="linkbtn" data-trsetup>Настройки тренажёра</button>`;
 }
 const t=r.tasks[r.i];
 const done=t.k==='m'?!!t.res:t.k==='pick'?!!t.ans:t.k==='err'?t.pick!=null:!!t.checked;
 const allset=t.k==='cols'&&t.items.every((_,i)=>t.set[i]);
 return `<div class="prog"><span>Задание ${r.i+1} из ${r.tasks.length}</span><span>Верно: ${r.ok} из ${r.tot}</span></div><div class="bar"><i style="width:${r.i/r.tasks.length*100}%"></i></div>
 ${trTaskHTML(t)}
 <div class="big2">${done?`<button class="main" data-trnext>Дальше</button>`:t.k==='m'?`<button class="main" data-mcheck ${MECH[t.m].ready(t)?'':'disabled'}>Проверить</button>`:t.k==='cols'?`<button class="main" data-trcheck ${allset?'':'disabled'}>Проверить</button>`:''}</div>
 <button class="linkbtn" data-trsetup>Закончить и вернуться к настройкам</button>`;
}
function trScore(list){const r=TR.run;list.forEach(([it,ok])=>{r.tot++;if(ok)r.ok++;else r.wrong.push(it)})}
function trainerHTML(){trSync();return `<div class="study" id="trainer">${TR.run?trRunHTML():trSetupHTML()}</div>`}

