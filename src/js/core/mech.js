// ---------- механики тренажёра ----------
// Ученик делает то же действие, что в тетради: выделяет, подчёркивает, собирает, делит слово, ставит запятые.
// Механика = {t:название, l:уроки, gen(c,les)→задание, body(t)→HTML, ready(t), grade(t)→{ok,right,why}, act(t,d)}.
// Задание — простой объект (JSON): его можно скопировать для повтора ошибки в конце серии.
// Без таймеров: учебник требует вдумчивой работы. Значки — стандартные школьные.
const K4F={дн:'действительное настоящего времени',дп:'действительное прошедшего времени',сн:'страдательное настоящего времени',сп:'страдательное прошедшего времени'};
const K4S={дн:'действ. наст.',дп:'действ. прош.',сн:'страд. наст.',сп:'страд. прош.'};
const MEMB={П:'подлежащее',С:'сказуемое',О:'определение',Д:'дополнение',Б:'обстоятельство'};
const MEMC={П:'uP',С:'uS',О:'uO',Д:'uD',Б:'uB'};
const PRON=['я','ты','мы','вы','он','она','оно','они'];
const MP_SKIP=['бреющий','зависящий','ненавидящий']; // разбор по составу у разных авторов разный — в задания не берём
const SUFS=['ущ','ющ','ащ','ящ','ем','ом','им','вш','ш','нн','енн','ённ','т'];
const rnd=n=>Math.floor(Math.random()*n);
const sample=(a,n)=>shuffle(a).slice(0,n);
function mClone(t){const o=JSON.parse(JSON.stringify(t.orig||t));delete o.orig;o.retry=true;o.orig=JSON.parse(JSON.stringify(o));return o}
function mFinal(t){t.orig=JSON.parse(JSON.stringify(t));return t}
// предложение: «Листья{П;ов} , опавшие{О;о;п:дп} …» → единицы
const wkUnits=corpusUnits; // разбор строки корпуса — src/data/corpus/levels.js
const wkWords=u=>u.filter(x=>!x.pu||x.t!==',');               // без запятых (точка остаётся)
const unitsText=(u,withCommas=true)=>u.filter(x=>withCommas||x.t!==',').reduce((s,x)=>x.pu?s+x.t:(s?s+' ':'')+x.t,'');
// слова из общего корпуса: k — разряд причастия или «пр» для прилагательного
const allWords=c=>corpusWords(c.id,x=>x.pos==='прич'||x.pos==='прил').map(x=>({w:x.w,k:x.pos==='прил'?'пр':x.r}));
// уроки механики: глава может задать свой набор механик и уроков (c.wk.mech), иначе — по умолчанию
const mLes=(c,m)=>(c.wk&&c.wk.mech?c.wk.mech[m]:MECH[m].l)||[];
const lesOK=(c,m,les)=>mLes(c,m).some(l=>les.includes(l));

const MECH={
 // ── А. Выделить слова в наборе (уроки 1, 2)
 hlw:{t:'Выделить слова',l:[1,2],d:'Нажать на все нужные слова в наборе.',
  gen(c,les){const W=allWords(c),P=W.filter(x=>x.k!=='пр');
   const vars=[];if(les.includes(1))vars.push(['причастия',x=>x.k!=='пр',1]);
   if(les.includes(2))vars.push(['действительные причастия',x=>x.k[0]==='д',2],['страдательные причастия',x=>x.k[0]==='с',2],['причастия настоящего времени',x=>x.k[1]==='н',2],['причастия прошедшего времени',x=>x.k[1]==='п',2]);
   const [name,f,l]=pick1(vars);let items;
   if(l===1)items=shuffle([...sample(P,4+rnd(2)),...sample(W.filter(x=>x.k==='пр'),3)]);
   else{do items=sample(P,8);while(!items.some(f)||items.every(f))}
   return mFinal({k:'m',m:'hlw',l,q:`Выделить все ${name}.`,items:items.map(x=>({w:x.w,k:x.k,y:f(x)})),sel:[]})},
  body:t=>`<div class="mwl">${t.items.map((x,i)=>`<button class="mw ${mSelCls(t,i,x.y)}" data-ma="tog" data-i="${i}" ${t.res?'disabled':''}>${esc(x.w)}${t.res?`<small>${x.k==='пр'?'прил.':K4S[x.k]}</small>`:''}</button>`).join('')}</div>`,
  ready:t=>t.sel.length>0,
  act(t,d){if(d.ma==='tog')mTog(t.sel,+d.i)},
  grade(t){const ok=t.items.every((x,i)=>x.y===t.sel.includes(i));return {ok,right:t.items.filter(x=>x.y).map(x=>x.w).join(', '),
   why:t.l===1?'Причастие образовано от глагола и обозначает признак по действию; его суффиксы: -ущ-/-ющ-, -ащ-/-ящ-, -ем-/-ом-/-им-, -вш-/-ш-, -нн-/-енн- (-ённ-), -т-. Слова от существительных (деревянный — от «дерево») — прилагательные.':'Действительные: -ущ-/-ющ-, -ащ-/-ящ- (наст.), -вш-/-ш- (прош.). Страдательные: -ем-/-ом-/-им- (наст.), -нн-/-енн- (-ённ-), -т- (прош.).'}}},
 // ── Б. Выделить в предложении (уроки 1, 7)
 hls:{t:'Выделить в предложении',l:[1,7],d:'Нажать на слова в предложении: причастия, оборот целиком или определяемое слово.',
  gen(c,les){const S_=corpusSents(c.id),vars=[];
   if(les.includes(1))vars.push(['Выделить все причастия.','pr',1]);
   if(les.includes(7))vars.push(['Выделить причастный оборот целиком.','ob',7],['Нажать на определяемое слово — к нему относится причастный оборот.','ov',7]);
   const [q,key,l]=pick1(vars),u=pick1(S_.filter(u=>u.some(x=>key==='pr'?x.pr:x.ob)&&(key!=='pr'||les.includes(5)||!u.some(x=>x.kr)))); // краткие причастия — только вместе с уроком 5
   return mFinal({k:'m',m:'hls',l,q,key,u:u.map(x=>({t:x.t,pu:x.pu,y:!!(key==='pr'?x.pr:key==='ob'?x.ob:x.ov),pr:x.pr})),sel:[]})},
  body:t=>`<div class="mst">${t.u.map((x,i)=>x.pu?`<span class="mpu">${x.t}</span>`:`<button class="mw sw ${mSelCls(t,i,x.y)}" data-ma="tog" data-i="${i}" ${t.res?'disabled':''}>${esc(x.t)}</button>`).join('')}</div>`,
  ready:t=>t.sel.length>0,
  act(t,d){if(d.ma!=='tog')return;if(t.key==='ov')t.sel=t.sel.includes(+d.i)?[]:[+d.i];else mTog(t.sel,+d.i)},
  grade(t){const ok=t.u.every((x,i)=>x.pu||x.y===t.sel.includes(i));const r=t.u.filter(x=>x.y).map(x=>x.t);
   return {ok,right:t.key==='pr'?r.map((w,i)=>w).join(', '):r.join(' '),
    why:t.key==='pr'?'Причастия: '+t.u.filter(x=>x.pr).map(x=>`${x.t} — ${K4S[x.pr]}`).join('; ')+'.':t.key==='ob'?'Оборот — причастие вместе со всеми зависимыми словами.':'Определяемое слово — то, от которого задаётся вопрос к обороту («какой?»).'}}},
 // ── В. Расставить запятые (урок 7)
 cm:{t:'Расставить запятые',l:[7],d:'Нажимать на промежутки между словами, чтобы поставить или убрать запятую.',
  gen(c){const u=pick1(corpusSents(c.id,{commas:true,has:u=>u.some(x=>x.ob)}));
   const w=wkWords(u),need=[];let j=-1;u.forEach(x=>{if(x.t===',')need.push(j);else j++});
   const ov=w.findIndex(x=>x.ov),ob=w.findIndex(x=>x.ob),pron=ov>=0&&PRON.includes(w[ov].t.toLowerCase());
   const why=pron?'Оборот относится к личному местоимению — выделяется запятыми всегда.':ob>ov?'Оборот стоит после определяемого слова — выделяется запятыми.':'Оборот стоит перед определяемым словом — запятые не нужны.';
   return mFinal({k:'m',m:'cm',l:7,q:'Расставить запятые. Если запятые не нужны — сразу нажать «Проверить».',w:w.map(x=>({t:x.t,pu:x.pu})),need,sel:[],why})},
  body(t){let h='<div class="mst mcm">';t.w.forEach((x,i)=>{if(x.pu){h+=`<span class="mpu">${x.t}</span>`;return}
   if(i>0&&!t.w[i-1].pu){const g=i-1,on=t.sel.includes(g),y=t.need.includes(g);const cl=t.res?(on&&y?'ok':on?'bad':y?'miss':''):on?'on':'';
    h+=`<button class="gapb ${cl}" data-ma="gap" data-i="${g}" ${t.res?'disabled':''} aria-label="Запятая">${on||(t.res&&y)?',':'·'}</button>`}
   h+=`<span class="mword2">${esc(x.t)}</span>`});return h+'</div>'},
  ready:()=>true,
  act(t,d){if(d.ma==='gap')mTog(t.sel,+d.i)},
  grade(t){const ok=t.sel.length===t.need.length&&t.need.every(g=>t.sel.includes(g));
   const right=t.w.reduce((s,x,i)=>x.pu?s+x.t:(s?s+' ':'')+x.t+(t.need.includes(i)?',':''),'');return {ok,right,why:t.why}}},
 // ── Г. Подчеркнуть члены предложения (уроки 1, 5, 7)
 sx:{t:'Подчеркнуть члены предложения',l:[1,5,7],d:'Выбрать вид подчёркивания и нажимать на слова — как в тетради.',
  gen(c,les){const all=corpusSents(c.id,{mem:true});let pool=all,full=false,l;
   const v=[];if(les.includes(5))v.push(5);if(les.includes(1))v.push(1);if(les.includes(7))v.push(7);l=pick1(v);
   if(l===5)pool=all.filter(u=>u.some(x=>x.kr));                                   // краткое причастие — сказуемое
   else if(l===7){pool=all.filter(u=>u.some(x=>x.ob));full=Math.random()<.5}            // оборот — одно определение
   else{pool=all.filter(u=>u.some(x=>x.pr)&&!u.some(x=>x.ob||x.kr));full=true}       // полное причастие — определение
   const u=pick1(pool);
   return mFinal({k:'m',m:'sx',l,full,q:full?'Подчеркнуть все члены предложения. Причастный оборот — одно определение: подчеркнуть его целиком.':'Подчеркнуть грамматическую основу: подлежащее и сказуемое.',
    u:u.map(x=>({t:x.t,pu:x.pu,mem:x.mem})),mk:{},tool:'П'})},
  body(t){const tools=t.full?['П','С','О','Д','Б']:['П','С'];
   return `<div class="mpal">${tools.map(k=>`<button class="mtool ${t.tool===k?'on':''}" data-ma="tool" data-v="${k}" ${t.res?'disabled':''}><span class="${MEMC[k]}">${MEMB[k]}</span></button>`).join('')}<button class="mtool ${t.tool==='x'?'on':''}" data-ma="tool" data-v="x" ${t.res?'disabled':''}>стереть</button></div>
   <div class="mst msx">${t.u.map((x,i)=>{if(x.pu)return `<span class="mpu">${x.t}</span>`;const m=t.mk[i]||'',y=t.full?x.mem:(x.mem==='П'||x.mem==='С'?x.mem:'');
    const st=t.res?(m===y?'ok':'bad'):'';return `<button class="mw sw ${st}" data-ma="mark" data-i="${i}" ${t.res?'disabled':''}><span class="${m?MEMC[m]:''}">${esc(x.t)}</span>${t.res&&m!==y?`<small>${y?MEMB[y]:'не член основы'}</small>`:''}</button>`}).join('')}</div>`},
  ready:t=>Object.values(t.mk).some(Boolean),
  act(t,d){if(d.ma==='tool')t.tool=d.v;if(d.ma==='mark'){const i=+d.i;t.mk[i]=t.tool==='x'||t.mk[i]===t.tool?'':t.tool}},
  grade(t){const ok=t.u.every((x,i)=>x.pu||(t.mk[i]||'')===(t.full?x.mem:(x.mem==='П'||x.mem==='С'?x.mem:'')));
   const right=t.u.filter(x=>!x.pu&&(t.full?x.mem:(x.mem==='П'||x.mem==='С'))).map(x=>`${x.t} — ${MEMB[x.mem]}`).join('; ');
   return {ok,right,why:t.l===5?'Краткое причастие в предложении — сказуемое.':t.full?'Подлежащее — одна черта, сказуемое — две, определение — волнистая, дополнение — пунктир, обстоятельство — точка-тире.':'Подлежащее отвечает на вопрос «кто? что?», сказуемое — «что делает? каков?».'}}},
 // ── Д. Собрать причастие (урок 3)
 bw:{t:'Собрать причастие',l:[3],d:'Собрать причастие из основы, суффикса и окончания.',
  gen(c){const B=c.wk.build,v=pick1(Object.keys(B)),V=B[v],fi=pick1(V.f.map((f,i)=>f?i:-1).filter(i=>i>=0)),f=V.f[fi];
   const stems=[...new Set([V.pres[1],...V.inf[1].split(' / '),...V.f.filter(Boolean).map(x=>x[1])])];
   const ban=['нн','енн','ённ'].includes(f[2])?['нн','енн','ённ']:[f[2]]; // «виде+нн» = «вид+енн» — второй верный путь не даём
   return mFinal({k:'m',m:'bw',l:3,q:`Собрать ${['действительное причастие настоящего времени','страдательное причастие настоящего времени','действительное причастие прошедшего времени','страдательное причастие прошедшего времени'][fi]} от глагола «${v}».`,
    hint:`${V.pres[0]} · ${V.inf[0]}`,a:[f[1],f[2],f[3]],note:f[4]||'',rows:[shuffle(stems),shuffle([f[2],...sample(SUFS.filter(x=>!ban.includes(x)),3)]),shuffle(['ий','ый'])],sel:[null,null,null],fi})},
  body(t){const nm=['Основа','Суффикс','Окончание'];
   return `<div class="mbw"><div class="mbwp">${t.sel.map((x,i)=>`<span class="mseg ${x==null?'e':''} ${t.res?(x===t.a[i]?'ok':'bad'):''}">${x==null?'…':esc(x)}</span>`).join('<i>+</i>')}<b>= ${esc(t.sel.map(x=>x||'').join(''))||'…'}</b></div>
   ${S.easy&&!t.res?`<div class="bkhint">Опора: ${esc(t.hint)}</div>`:''}
   ${t.rows.map((r,i)=>`<div class="tl">${nm[i]}</div><div class="chips">${r.map(x=>`<button class="chipc" data-ma="pick" data-i="${i}" data-v="${esc(x)}" aria-pressed="${t.sel[i]===x}" ${t.res?'disabled':''}>${i===1?'-'+esc(x)+'-':esc(x)}</button>`).join('')}</div>`).join('')}</div>`},
  ready:t=>t.sel.every(x=>x!=null),
  act(t,d){if(d.ma==='pick')t.sel[+d.i]=d.v},
  grade(t){const yo=(x,a)=>x===a||(a.includes('ё')&&x===a.replace(/ё/g,'е')); // «нес+ш+ий» = «нёсший» без ё
   const ok=t.sel.every((x,i)=>i===0?yo(x,t.a[0]):x===t.a[i]);return {ok,right:`${t.a[0]}-${t.a[1]}-${t.a[2]} → ${t.a.join('')}`,
   why:(t.fi<2?'Настоящее время — от основы «они …».':'Прошедшее время — от основы инфинитива.')+(t.note?' Обратите внимание: '+t.note+'.':'')}}},
 // ── Е. Разобрать по составу (уроки 3, 4)
 mp:{t:'Морфемный разбор (2)',l:[3,4],d:'Нажимать между буквами, чтобы разделить слово на части, затем назвать каждую часть.',
  gen(c,les){const E=DICT.filter(e=>e.morph&&!MP_SKIP.includes(e.w)&&(c.wk.mpWords?c.wk.mpWords.includes(e.w):e.pos==='причастие')),e=pick1(E);
   const lw=((e.orth||[]).map(o=>o.at||'').find(a=>a.startsWith(c.id))||'').replace(/\D/g,'');
   return mFinal({k:'m',m:'mp',l:c.wk.mpWords?(+lw||1):3,q:`Разобрать слово «${e.w}» по составу.`,w:e.w,a:e.morph.filter(m=>m[1]!==''),b:[],ty:{},tool:'root'})},
  body(t){const L=[...t.w],segs=mSegs(t),tools=['pref','root','suf','end','post'];
   let h=`<div class="mpal">${tools.map(k=>`<button class="mtool ${t.tool===k?'on':''}" data-ma="tool" data-v="${k}" ${t.res?'disabled':''}><i class="lg m-${k}" style="--mc:${MT[k][1]}"></i>${MT[k][0]}</button>`).join('')}</div>`;
   h+=`<div class="mlet">${L.map((ch,i)=>`<span class="ml">${esc(ch)}</span>${i<L.length-1?`<button class="mcut ${t.b.includes(i)?'on':''}" data-ma="cut" data-i="${i}" ${t.res?'disabled':''} aria-label="Граница после ${esc(ch)}">${t.b.includes(i)?'|':''}</button>`:''}`).join('')}</div>`;
   h+=`<div class="tl">Части слова — выбрать вид выше и нажать на часть</div><div class="mword msegs">${segs.map(([s,e])=>{const x=t.w.slice(s,e+1),ty=t.ty[s+'-'+e];
    return `<button class="mp ${ty?'m-'+ty:''}" style="--mc:${ty?MT[ty][1]:'var(--l3)'}" data-ma="type" data-v="${s}-${e}" ${t.res?'disabled':''}><span class="mx">${esc(x)}</span></button>`}).join('')}</div>`;
   if(S.easy&&!t.res)h+=`<div class="bkhint">В этом слове ${t.a.length} ${t.a.length<5?'части':'частей'}.</div>`;
   return h},
  ready:t=>{const s=mSegs(t);return s.length>1&&s.every(([a,b])=>t.ty[a+'-'+b])},
  act(t,d){if(d.ma==='tool')t.tool=d.v;if(d.ma==='cut')mTog(t.b,+d.i);if(d.ma==='type')t.ty[d.v]=t.tool},
  grade(t){const s=mSegs(t);let pos=0;const exp=t.a.map(([ty,x])=>{const r=[pos,pos+x.length-1,ty];pos+=x.length;return r});
   const ok=s.length===exp.length&&s.every(([a,b],i)=>a===exp[i][0]&&b===exp[i][1]&&t.ty[a+'-'+b]===exp[i][2]);
   return {ok,right:t.a.map(([ty,x])=>`${x} — ${MT[ty][0]}`).join(', '),rightHTML:`<div class="mword">${t.a.map(([ty,x])=>`<span class="mp m-${ty}" style="--mc:${MT[ty][1]}"><span class="mx">${esc(x)}</span></span>`).join('')}</div>`,
    why:'Суффикс причастия показывает разряд: '+(t.a.find(m=>m[0]==='suf')||['',''])[1]+'.'}}},
 // ── Ж. Разложить по разрядам (урок 2)
 gr:{t:'Разложить по разрядам',l:[2],d:'Выбрать разряд и нажимать на причастия этого разряда.',
  gen(c){const W=allWords(c),items=shuffle(['дн','дп','сн','сп'].flatMap(k=>sample(W.filter(x=>x.k===k),2)));
   return mFinal({k:'m',m:'gr',l:2,q:'Разложить причастия по разрядам.',items,mk:{},tool:'дн'})},
  body:t=>`<div class="mpal">${['дн','дп','сн','сп'].map(k=>`<button class="mtool g-${k} ${t.tool===k?'on':''}" data-ma="tool" data-v="${k}" ${t.res?'disabled':''}>${K4S[k]}</button>`).join('')}</div>
   <div class="mwl">${t.items.map((x,i)=>{const m=t.mk[i];return `<button class="mw ${m?'g-'+m:''} ${t.res?(m===x.k?'ok':'bad'):''}" data-ma="mark" data-i="${i}" ${t.res?'disabled':''}>${esc(x.w)}<small>${t.res&&m!==x.k?K4S[x.k]:m?K4S[m]:''}</small></button>`}).join('')}</div>`,
  ready:t=>t.items.every((_,i)=>t.mk[i]),
  act(t,d){if(d.ma==='tool')t.tool=d.v;if(d.ma==='mark')t.mk[+d.i]=t.tool},
  grade(t){const ok=t.items.every((x,i)=>t.mk[i]===x.k);return {ok,right:t.items.map(x=>`${x.w} — ${K4S[x.k]}`).join('; '),
   why:'Сам делает — действительное, над ним делают — страдательное; -ущ-/-ющ-, -ащ-/-ящ-, -ем-/-ом-/-им- — настоящее, -вш-/-ш-, -нн-/-енн- (-ённ-), -т- — прошедшее.'}}},
 // ── З. Пары: глагол — причастие (урок 3)
 pr:{t:'Соединить пары',l:[3],d:'Нажать на глагол, затем на причастие от него.',
  gen(c){const M=c.wk.matrix,vs=sample(Object.keys(M),4),pairs=vs.map(v=>[v,pick1(M[v][2].filter((x,i)=>x&&x!=='—'&&!(i===3&&M[v][0]==='несов.')))]); // редкие «читанный», «строенный» — не в пары
   return mFinal({k:'m',m:'pr',l:3,q:'Соединить каждый глагол с причастием, которое от него образовано.',L:pairs.map(p=>p[0]),R:shuffle(pairs.map(p=>p[1])),a:Object.fromEntries(pairs),pm:{},cur:null})},
  body(t){const idx=v=>Object.keys(t.pm).indexOf(v);
   return `<div class="mpairs"><div>${t.L.map(v=>{const n=idx(v),st=t.res&&t.pm[v]?(t.pm[v]===t.a[v]?'ok':'bad'):'';
    return `<button class="mw ${t.cur===v?'on':''} ${n>=0?'pn':''} ${st}" data-ma="L" data-v="${esc(v)}" ${t.res?'disabled':''}>${n>=0?`<i>${n+1}</i>`:''}${esc(v)}</button>`}).join('')}</div>
   <div>${t.R.map(w=>{const v=Object.keys(t.pm).find(k=>t.pm[k]===w),n=v?idx(v):-1;return `<button class="mw ${n>=0?'pn':''}" data-ma="R" data-v="${esc(w)}" ${t.res?'disabled':''}>${n>=0?`<i>${n+1}</i>`:''}${esc(w)}</button>`}).join('')}</div></div>`},
  ready:t=>t.L.every(v=>t.pm[v]),
  act(t,d){if(d.ma==='L')t.cur=t.cur===d.v?null:d.v;
   if(d.ma==='R'){const k=Object.keys(t.pm).find(k=>t.pm[k]===d.v);if(k)delete t.pm[k];if(t.cur){t.pm[t.cur]=d.v;t.cur=t.L.find(v=>!t.pm[v])||null}}},
  grade(t){const ok=t.L.every(v=>t.pm[v]===t.a[v]);return {ok,right:t.L.map(v=>`${v} → ${t.a[v]}`).join('; '),why:'Причастие сохраняет вид и возвратность своего глагола: прочитать → прочитавший, проснуться → проснувшийся. У «идти» прошедшее время — от особой основы: шедший.'}}},
 // ── И. Четыре клетки (урок 2)
 mx:{t:'Четыре клетки',l:[2],d:'Выбрать причастие (или «нет такого») и нажать на клетку таблицы.',
  gen(c){const M=c.wk.matrix,PAIR={читать:'прочитать',прочитать:'читать',строить:'построить',построить:'строить',идти:'прийти',прийти:'идти'};
   const v=pick1(Object.keys(M)),[vid,per,f]=M[v],own=f.filter(x=>x&&x!=='—'),ext=PAIR[v]?M[PAIR[v]][2].filter(x=>x&&x!=='—'&&!own.includes(x)):[];
   return mFinal({k:'m',m:'mx',l:2,q:`Заполнить таблицу причастий глагола «${v}» (${vid==='сов.'?'совершенный':'несовершенный'} вид, ${per==='перех.'?'переходный':'непереходный'}). Где причастия нет — поставить «нет».`,
    v,a:f.map(x=>x&&x!=='—'?x:'нет'),note:f.includes('—')?'От этого глагола страдательное причастие настоящего времени в литературном языке не употребляется.':'',vid,per,tiles:shuffle([...own,...sample(ext,2)]),mk:[null,null,null,null],tool:null})},
  body(t){const cell=i=>{const m=t.mk[i],st=t.res?(m===t.a[i]?'ok':'bad'):'';return `<button class="mxc ${st} ${m?'f':''}" data-ma="cell" data-i="${i}" ${t.res?'disabled':''}>${m?esc(m):'…'}${t.res&&m!==t.a[i]?`<small>${esc(t.a[i])}</small>`:''}</button>`};
   return `<div class="mpal">${[...t.tiles,'нет'].map(x=>`<button class="mtool ${t.tool===x?'on':''}" data-ma="tool" data-v="${esc(x)}" ${t.res?'disabled':''}>${esc(x)}</button>`).join('')}</div>
   <div class="mxg"><div></div><div class="mh">Настоящее</div><div class="mh">Прошедшее</div><div class="mh mr">Действит.</div>${cell(0)}${cell(1)}<div class="mh mr">Страдат.</div>${cell(2)}${cell(3)}</div>`},
  ready:t=>t.mk.every(Boolean),
  act(t,d){if(d.ma==='tool')t.tool=d.v;if(d.ma==='cell'&&t.tool)t.mk[+d.i]=t.tool},
  grade(t){const ok=t.mk.every((m,i)=>m===t.a[i]);return {ok,right:['действ. наст.','действ. прош.','страд. наст.','страд. прош.'].map((n,i)=>`${n}: ${t.a[i]}`).join('; '),
   why:'Настоящее время — только у глаголов несовершенного вида, страдательные — только у переходных.'+(t.note?' '+t.note:'')}}},
 // ── К. Буква и почему (урок 4)
 gw:{t:'Буква и «почему?»',l:[4],d:'Вставить букву и выбрать правило, по которому она пишется.',
  gen(c,les){const G=c.wk.gapWhy;
   if(G.keys){ // правила — из ORTHO_R; верными считаются все перечисленные у слова, ни одно не идёт в ловушки
    const it=pick1(G.items.filter(x=>les.includes(x[4])))||pick1(G.items),[w,a,o,valid,l]=it,rs=shuffle([valid[0],...sample(G.keys.filter(k=>!valid.includes(k)),3)]);
    return mFinal({k:'m',m:'gw',l,q:'Вставить пропущенную букву. Почему так?',w,a,o:shuffle(o),r:valid[0],valid,rs:rs.map(k=>[k,ORTHO_R[k].t]),sel:null,rsel:null})}
   const [w,a,o,r]=pick1(G.items),rs=shuffle([r,...sample(G.reasons.map((_,i)=>i).filter(i=>i!==r),3)]);
   return mFinal({k:'m',m:'gw',l:4,q:'Вставить пропущенную букву. Почему так?',w,a,o:shuffle(o),r,valid:[r],rs:rs.map(i=>[i,G.reasons[i]]),sel:null,rsel:null})},
  body:t=>`<div class="word">${tFill(t.w,t.sel)}</div><div class="ans" style="justify-content:center">${t.o.map(v=>`<button class="${t.res?(v===t.a?'ok':v===t.sel?'bad':''):t.sel===v?'on':''}" data-ma="ltr" data-v="${esc(v)}" ${t.res?'disabled':''} style="min-width:64px;min-height:48px;font-size:19px">${esc(v)}</button>`).join('')}</div>
   ${t.sel?mWhyHTML(t):''}`,
  ready:t=>t.sel!=null&&t.rsel!=null,
  act(t,d){if(d.ma==='ltr')t.sel=d.v;if(d.ma==='why')t.rsel=t.rs[+d.i][0]},
  grade(t){const ok=t.sel===t.a&&t.valid.includes(t.rsel);return {ok,right:`${fill(t.w,t.a)} — ${lc1(t.rs.find(x=>x[0]===t.r)[1])}`,why:t.sel===t.a&&!ok?'Буква верна, но правило выбрано не то.':''}}},
 // ── М. Н или НН в предложении + «почему?» (орфограммы общего корпуса)
 gs:{t:'Буква в предложении и «почему?»',l:[],d:'Вставить пропущенное в предложение и выбрать правило.',
  gen(c,les){const [u,i]=pick1(orthPool(c,les)),o=u[i].or,keys=Object.keys(ORTHO_R).filter(k=>ORTHO_R[k].topic===c.id&&!o.r.includes(k)),rs=shuffle([o.r[0],...sample(keys,3)]);
   return mFinal({k:'m',m:'gs',l:ORTHO_R[o.r[0]].l,q:'Вставить пропущенную букву (буквы). Почему так?',u:u.map(x=>({t:x.t,pu:x.pu})),gi:i,g:o.g,a:o.a,o:shuffle(orthOpts(o)),r:o.r[0],valid:o.r,rs:rs.map(k=>[k,ORTHO_R[k].t]),sel:null,rsel:null})},
  body:t=>`<div class="mst mgs">${t.u.map((x,i)=>x.pu?`<span class="mpu">${x.t}</span>`:`<span class="mword2">${i===t.gi?gapWord(x.t,t.g,t.a,t.sel,t.res):esc(x.t)}</span>`).join(' ')}</div>
   <div class="ans" style="justify-content:center">${t.o.map(v=>`<button class="${t.res?(v===t.a?'ok':v===t.sel?'bad':''):t.sel===v?'on':''}" data-ma="ltr" data-v="${esc(v)}" ${t.res?'disabled':''} style="min-width:64px;min-height:48px;font-size:19px">${esc(v)}</button>`).join('')}</div>
   ${t.sel?mWhyHTML(t):''}`,
  ready:t=>t.sel!=null&&t.rsel!=null,
  act(t,d){if(d.ma==='ltr')t.sel=d.v;if(d.ma==='why')t.rsel=t.rs[+d.i][0]},
  grade(t){const ok=t.sel===t.a&&t.valid.includes(t.rsel);return {ok,right:`${t.g.replace('_',t.a)} — ${lc1(ORTHO_R[t.r].t)}`,why:t.sel===t.a&&!ok?'Написание верное, но правило выбрано не то.':''}}},
 // ── Н. Текст с пропусками (орфограммы общего корпуса)
 gt:{t:'Текст с пропусками',l:[],d:'Вставить пропущенное во все слова небольшого текста.',
  gen(c,les){const P=orthPool(c,les),byS=[...new Set(P.map(p=>p[0]))],ss=sample(byS,Math.min(4,byS.length));
   const gaps=[];ss.forEach((u,si)=>u.forEach((x,ui)=>{if(P.some(p=>p[0]===u&&p[1]===ui))gaps.push({si,ui,g:x.or.g,a:x.or.a,o:orthOpts(x.or),r:x.or.r[0]})}));
   return mFinal({k:'m',m:'gt',l:ORTHO_R[gaps[0].r].l,q:'Вставить пропущенные буквы во все слова.',ss:ss.map(u=>u.map(x=>({t:x.t,pu:x.pu}))),gaps,sel:{}})},
  body(t){return `<div class="mgt">${t.ss.map((u,si)=>`<p>${u.map((x,ui)=>{if(x.pu)return `<span class="mpu">${x.t}</span>`;const gi=t.gaps.findIndex(g=>g.si===si&&g.ui===ui);
    if(gi<0)return ' '+esc(x.t);const g=t.gaps[gi],v=t.sel[gi];
    return ' '+gapWord(x.t,g.g,g.a,v,t.res)+`<span class="gtopt">${g.o.map(o=>`<button class="${t.res?(o===g.a?'ok':o===v?'bad':''):v===o?'on':''}" data-ma="gt" data-i="${gi}" data-v="${esc(o)}" ${t.res?'disabled':''}>${esc(o)}</button>`).join('')}</span>`}).join('')}</p>`).join('')}</div>`},
  ready:t=>t.gaps.every((_,i)=>t.sel[i]!=null),
  act(t,d){if(d.ma==='gt')t.sel[+d.i]=d.v},
  grade(t){const bad=t.gaps.filter((g,i)=>t.sel[i]!==g.a);return {ok:!bad.length,right:(bad.length?bad:t.gaps).map(g=>`${g.g.replace('_',g.a)} — ${lc1(ORTHO_R[g.r].t)}`).join('; '),
   why:bad.length?`Ошибок: ${bad.length} из ${t.gaps.length}.`:''}}},
 // ── Л. «Не» и почему (урок 6)
 nw:{t:'«Не» и «почему?»',l:[6],d:'Решить, слитно или раздельно, и выбрать правило.',
  gen(c){const N=c.wk.neWhy,[w,a,r]=pick1(N.items),bad=r===5?[1]:[],rs=shuffle([r,...sample(N.reasons.map((_,i)=>i).filter(i=>i!==r&&!bad.includes(i)),3)]); // «вовсе» иногда считают зависимым словом
   return mFinal({k:'m',m:'nw',l:6,q:'Как пишется «не»? Почему?',w,a,r,rs:rs.map(i=>[i,N.reasons[i]]),sel:null,rsel:null})},
  body:t=>`<div class="word" style="font-size:22px">${esc(t.w)}</div><div class="ans" style="justify-content:center">${['слитно','раздельно'].map(v=>`<button class="${t.res?(v===t.a?'ok':v===t.sel?'bad':''):t.sel===v?'on':''}" data-ma="ltr" data-v="${v}" ${t.res?'disabled':''} style="min-width:110px;min-height:48px">${v}</button>`).join('')}</div>
   ${t.sel?`<div class="tl">Почему?</div><div class="tsopts">${t.rs.map(([i,x])=>`<button class="opt ${t.res?(i===t.r?'eok':i===t.rsel?'ebad':''):t.rsel===i?'on':''}" data-ma="why" data-i="${i}" ${t.res?'disabled':''}>${esc(x)}</button>`).join('')}</div>`:''}`,
  ready:t=>t.sel!=null&&t.rsel!=null,
  act(t,d){if(d.ma==='ltr')t.sel=d.v;if(d.ma==='why')t.rsel=+d.i},
  grade(t){const ok=t.sel===t.a&&t.rsel===t.r;const sp=t.a==='слитно'?t.w.replace('(не)','не'):t.w.replace('(не)','не ');
   return {ok,right:`${sp} — ${lc1(t.rs.find(x=>x[0]===t.r)[1])}`,why:t.sel===t.a&&!ok?'Написание верное, но правило выбрано не то.':''}}}
};
// орфограммы общего корпуса для темы главы: [предложение, номер единицы]
function orthPool(c,les){const out=[];corpusSents(c.id,{has:u=>u.some(x=>x.or)}).forEach(u=>u.forEach((x,i)=>{const R=x.or&&ORTHO_R[x.or.r[0]];if(R&&R.topic===c.id&&les.includes(R.l))out.push([u,i])}));return out}
const orthOpts=o=>o.a==='н'||o.a==='нн'?['н','нн']:[o.a];
// слово единицы с пропуском на месте орфограммы
function gapWord(text,g,a,v,res){const ws=text.split(' '),full=g.replace('_',a).toLowerCase(),wi=ws.findIndex(w=>w.toLowerCase()===full);if(wi<0)return esc(text);
 const w=ws[wi],p=g.indexOf('_'),cl=res?(v===a?'ok':'bad'):'';ws[wi]=`${esc(w.slice(0,p))}<span class="slot ${cl}">${v==null?'…':esc(v)}</span>${esc(w.slice(p+a.length))}`;
 return ws.map((x,i)=>i===wi?x:esc(x)).join(' ')}
const mWhyHTML=t=>`<div class="tl">Почему?</div><div class="tsopts">${t.rs.map(([k,x],i)=>`<button class="opt ${t.res?(t.valid.includes(k)?'eok':k===t.rsel?'ebad':''):t.rsel===k?'on':''}" data-ma="why" data-i="${i}" ${t.res?'disabled':''}>${esc(x)}</button>`).join('')}</div>`;
const lc1=x=>x.charAt(0).toLowerCase()+x.slice(1);
function mTog(a,i){const k=a.indexOf(i);k<0?a.push(i):a.splice(k,1)}
function mSelCls(t,i,y){const on=t.sel.includes(i);if(!t.res)return on?'on':'';return on&&y?'ok':on?'bad':y?'miss':''}
function mSegs(t){const n=t.w.length,b=[...t.b].sort((x,y)=>x-y),out=[];let s=0;b.forEach(i=>{out.push([s,i]);s=i+1});out.push([s,n-1]);return out}
const MNEED={gs:(c,les)=>orthPool(c,les).length,gt:(c,les)=>orthPool(c,les).length,hls:c=>corpusSents(c.id).length,cm:c=>corpusSents(c.id,{commas:true,has:u=>u.some(x=>x.ob)}).length,sx:c=>corpusSents(c.id,{mem:true}).length,hlw:c=>allWords(c).length,gr:c=>allWords(c).length};
const mAvail=(c,les)=>c.wk?Object.keys(MECH).filter(m=>lesOK(c,m,les)&&(!MNEED[m]||MNEED[m](c,les)>0)):[];
function mGen(c,m,les){const t=MECH[m].gen(c,les);return t}

function mechHTML(t){
 const c=CC(),M=MECH[t.m],R=t.res;
 return `<div class="card mcard"><div class="ty">${M.t} · урок ${t.l}${t.retry?' · ещё раз':''}</div><div class="tq">${esc(t.q)}</div>
 ${S.easy&&!R&&c.lessons[t.l-1]?`<div class="obr"><b>Подсказка.</b> ${c.lessons[t.l-1].hint}</div>`:''}
 ${M.body(t)}
 ${R?`<div class="aa"><div>${R.ok?ok_('Верно.'):bad_} ${R.why||''}</div>${R.ok?'':`<div>Правильно: ${R.rightHTML||`<b>${esc(R.right)}</b>`}</div>`}</div>`:''}</div>`;
}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||!TR.run)return;const d=b.dataset,t=TR.run.tasks[TR.run.i];
 if(!t||t.k!=='m')return;
 if(d.ma!==undefined){if(t.res)return;MECH[t.m].act(t,d);trRe();return}
 if('mcheck' in d){if(t.res||!MECH[t.m].ready(t))return;const R=MECH[t.m].grade(t);t.res=R;
  TR.run.tot++;if(R.ok)TR.run.ok++;else{TR.run.wrong.push({w:t.q,a:R.right,why:R.why||'',mt:t.orig});if(!t.retry)TR.run.tasks.push(mClone(t))}
  trRe();return}
});

// самопроверка механик в тестах: доступ к движку только при адресе с ?selftest
if(/[?&]selftest\b/.test(location.search))window.__T={TR,MECH,CHAPTERS,trRe,mGen,mAvail,ORTHO_R,corpusSents,corpusWords,CORPUS_S,orderCheck:()=>[...ALLCH.map(c=>c.id),...Object.values(POS_TOPIC),...Object.values(FLAG_TOPIC)].filter(id=>!COURSE_ORDER.includes(id)).join(', ')};
