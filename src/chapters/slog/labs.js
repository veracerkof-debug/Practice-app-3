// ---------- схемы главы «Слог и перенос» ----------
// Все имена — с префиксом sl, обработчики — по своим data-* атрибутам (data-slc…, data-slg…, data-slu…, data-slo…, data-slp…, data-slv…).
const SL_V='аеёиоуыэюя';
const slIsV=c=>SL_V.includes(c),slIsC=c=>/[бвгджзйклмнпрстфхцчшщ]/.test(c);
// Можно ли перенести слово w после k-й буквы. Правила 2006, § 211–217; слова без приставок и без частей сложного слова.
// Возвращает [можно, пояснение].
function slWhy(w,k){
 w=w.toLowerCase();const L=w.slice(0,k),R=w.slice(k),a=w[k-1],b=w[k];
 if(L.length<2)return [false,`На строке осталась одна буква «${L}». Так нельзя (урок 3, правило 1).`];
 if(R.length<2)return [false,`На новую строку уходит одна буква «${R}». Так нельзя (урок 3, правило 1).`];
 if(![...L].some(slIsV))return [false,`В части «${L}» нет гласной — это не слог (урок 3, правило 2).`];
 if(![...R].some(slIsV))return [false,`В части «${R}» нет гласной — это не слог (урок 3, правило 2).`];
 if(b==='ь'||b==='ъ')return [false,`Буква ${b} оторвана от согласной «${a}» перед ней (урок 3, правило 3).`];
 if(b==='й'&&slIsV(a))return [false,`Буква й оторвана от гласной «${a}» перед ней (урок 3, правило 4).`];
 if(slIsC(a)&&a!=='й'&&slIsV(b))return [false,`Согласная «${a}» оторвана от гласной «${b}», которая идёт за ней (урок 3, правило 5).`];
 if(slIsC(a)&&a===b)return [true,`Двойные согласные ${a}${b} разделены — так и нужно (урок 4).`];
 if(k>=2&&w[k-2]===a&&slIsC(a))return [false,`Двойные согласные ${a}${a} остались вместе на строке, а их нужно разделить (урок 4).`];
 if(k+1<w.length&&w[k+1]===b&&slIsC(b))return [false,`Двойные согласные ${b}${b} вместе ушли на новую строку, а их нужно разделить (урок 4).`];
 if(a==='й')return [true,'Можно: й осталась со своей гласной.'];
 // решение владельца 05.11.2026: если ь (ъ) стоит внутри стечения согласных (перед согласной), перенос в этом стечении — только сразу после него: конь-ки, паль-то, пись-мо (не ко-ньки, па-льто)
 if(!slIsV(b)){let i=k-1;while(i>=0&&!slIsV(w[i]))i--;let j=k;while(j<w.length&&!slIsV(w[j]))j++;
  const run=w.slice(i+1,j),m=run.search(/[ьъ](?=[^ьъ])/);
  if(m>=0){const at=i+1+m+1;if(k!==at)return [false,`В стечении согласных стоит ${w[at-1]}: переносить нужно сразу после него — ${w.slice(0,at)}-${w.slice(at)} (урок 4).`]}}
 if(slIsC(a)&&slIsC(b))return [true,'Можно: разные согласные между гласными разбиваются любым образом (урок 4).'];
 if(a==='ь'||a==='ъ')return [true,`Можно: ${a} остался со своей согласной.`];
 return [true,'Можно: обе части — слоги, ни одно правило не нарушено.'];
}
const slPer=w=>{const o=[];for(let k=1;k<w.length;k++)if(slWhy(w,k)[0])o.push(k);return o};
const slShowPer=w=>{const p=slPer(w);return p.length?p.map(k=>w.slice(0,k)+'-'+w.slice(k)).join(', '):'не переносится'};

// 1. Сколько слогов: сначала ответить, потом увидеть гласные
const SL_CNT=[
 ['ёж','Е, ё, ю, я дают слог и в начале слова: [й\'ош] — один гласный.'],['чайка','Й — согласный, слога не образует.'],['пальто','Ь — не звук, слога не образует.'],
 ['строй','Пять букв, одна гласная.'],['яма','Буква я в начале — тоже гласная: я-ма.'],['маяк','Я после гласной: ма-як, два гласных.'],
 ['вздрогнуть','Много согласных, но гласных только две.'],['аэропорт','Гласные рядом — каждая даёт свой слог.'],['воробей','Последний слог закрывает й, но гласная в нём е.'],
 ['какао','Три гласных а, а, о — три слога.'],['объявление','Ъ и й не считаются; гласные о, я, е, и, е.']
];
let slcW=0,slcG=null;
function slcountHTML(){
 const [w,c]=SL_CNT[slcW],n=[...w].filter(slIsV).length;let i=0;
 const lets=[...w].map(ch=>{if(slcG!=null&&slIsV(ch)){i++;return `<span style="display:inline-flex;flex-direction:column;align-items:center"><span class="good" style="border-radius:6px;padding:0 2px">${ch}</span><small style="font-size:13px;color:var(--T)">${i}</small></span>`}
  return `<span style="display:inline-flex;flex-direction:column;align-items:center"><span${slcG!=null&&/[йьъ]/.test(ch)?' style="color:var(--red)"':''}>${ch}</span><small style="font-size:13px">&nbsp;</small></span>`}).join('');
 return `<div class="blab" data-lab="slcount"><div class="cap"><b>Сколько слогов?</b><span class="bkhint">выбрать слово, ответить, потом проверить</span></div>
 <div class="chips">${SL_CNT.map((x,j)=>`<button class="chipc" data-slcw="${j}" aria-pressed="${j===slcW}">${x[0]}</button>`).join('')}</div>
 <div class="mlet" style="gap:2px">${lets}</div>
 ${slcG==null?`<div class="chips" style="justify-content:center">${[1,2,3,4,5].map(k=>`<button class="chipc" data-slcg="${k}">${k}</button>`).join('')}</div><div class="bkhint" style="text-align:center">Сколько слогов в слове?</div>`
 :`<div class="result" style="${slcG===n?'':'background:color-mix(in srgb,var(--red) 12%,var(--cell))'}"><div class="big" style="${slcG===n?'':'color:var(--red)'}">${n}</div><div><div>${slcG===n?'Верно.':`Не ${slcG}, а ${n}.`} Гласных ${n} — слогов ${n}.</div><div class="bkhint">${c}</div></div></div>`}</div>`;
}

// 2. Куда уходит согласный — алгоритм
const SL_GO={
 start:{q:'Сколько согласных звуков между двумя гласными?',o:[['Ни одного — гласные рядом: по-эт','r_vv'],['Один: ры-ба, ма-як [ма-й\'ак]','r_one'],['Два или больше: чайка, марка, кошка','two']]},
 r_vv:{r:'а|о',t:'Граница проходит между гласными: по-эт, а-ист, те-атр.'},
 r_one:{r:'→',t:'Один согласный уходит к следующему гласному: ры-ба, ко-ро-ва, ма-як. Предыдущий слог — открытый.'},
 two:{q:'Первый из этих согласных — [й\']?',o:[['Да: чайка, тайна','r_j'],['Нет','son']]},
 r_j:{r:'й|',t:'[й\'] остаётся в предыдущем слоге и закрывает его: чай-ка, тай-на, строй-ка.'},
 son:{q:'Первый согласный — сонорный [р], [л], [м], [н], а за ним шумный (любой, кроме р, л, м, н, й)?',o:[['Да: марка, полка, лампа','r_son'],['Нет: кошка, капля, волна','r_disp']]},
 r_son:{r:'р|',t:'Сонорный остаётся в предыдущем слоге: мар-ка, пол-ка, лам-па, бан-ка.'},
 r_disp:{r:'?',t:'Спорный случай. По закону открытого слога согласные обычно отходят к следующему слогу (ко-шка), но учёные делят такие слова по-разному. В заданиях на слоги таких слов нет; при переносе их можно разбивать по-разному (урок 4).'}
};
const SL_GOW=[['рыба',[1]],['маяк',[1]],['поэт',[0]],['чайка',[2,0]],['марка',[2,1,0]],['лампа',[2,1,0]],['кошка',[2,1,1]],['волна',[2,1,1]]];
const slg={nodes:['start'],w:null};
function slgoHTML(){
 let h=`<div class="blab" data-lab="slgo"><div class="cap"><b>Куда уходит согласный</b><span class="bkhint">выбрать ответ на каждом шаге или готовое слово</span></div>
 <div class="chips">${SL_GOW.map((x,i)=>`<button class="chipc" data-slgw="${i}" aria-pressed="${slg.w===i}">${x[0]}</button>`).join('')}</div><div class="tree">`;
 slg.nodes.forEach((id,k)=>{const n=SL_GO[id];
  if(n.r){h+=`<div class="result"><div class="big">${n.r}</div><div><div>${n.t}</div>${slg.w!=null?`<div class="bkhint">Слово: <b>${SL_GOW[slg.w][0]}</b></div>`:''}</div></div>`;return}
  const nx=slg.nodes[k+1];
  h+=`<div class="step"><div class="q">${k+1}. ${n.q}</div><div class="opts">${n.o.map(o=>{const on=nx===o[1];return `<button class="opt${on?' on':''}" data-slgto="${o[1]}" data-slgk="${k}" ${nx&&!on?'disabled':''}>${o[0]}</button>`}).join('')}</div></div>`});
 return h+'</div><div><button class="linkbtn" data-slgreset>Начать сначала</button></div></div>';
}

// 3. Режем слово на слоги (только бесспорные случаи)
const SL_CUT=['мо-ло-ко','ба-ра-бан','чай-ник','лам-па','мар-ка','ма-як','по-эт','ёл-ка','бу-ма-га','ка-ран-даш','тай-на','а-ку-ла','со-ло-вей','ра-йон','бан-ка','ко-ло-коль-чик'];
let sluW=0,sluSet=new Set(),sluChk=false;
const slSylOpen=s=>{const x=s.replace(/[ьъ]$/,'');return slIsV(x[x.length-1])};
function slcutHTML(){
 const d=SL_CUT[sluW],w=d.replace(/-/g,''),ans=new Set();let p=0;d.split('-').slice(0,-1).forEach(s=>{p+=s.length;ans.add(p)});
 let h='';[...w].forEach((ch,i)=>{h+=`<span>${ch}</span>`;if(i<w.length-1){const k=i+1,on=sluSet.has(k),r=ans.has(k);
  const cl=sluChk?(on&&r?'ok':on&&!r?'bad':!on&&r?'miss':''):on?'on':'';
  h+=`<button class="gapb ${cl}" data-slucut="${k}" ${sluChk?'disabled':''} aria-label="Граница слога после ${i+1}-й буквы">${on||(sluChk&&r)?'|':'·'}</button>`}});
 const ok=sluChk&&ans.size===sluSet.size&&[...ans].every(k=>sluSet.has(k));
 const syl=d.split('-');
 return `<div class="blab" data-lab="slcut"><div class="cap"><b>Режем слово на слоги</b><span class="bkhint">нажать между буквами, где проходит граница</span></div>
 <div class="chips">${SL_CUT.map((x,i)=>`<button class="chipc" data-sluw="${i}" aria-pressed="${i===sluW}">${x.replace(/-/g,'')}</button>`).join('')}</div>
 <div class="mlet">${h}</div>
 ${sluChk?`<div class="result" style="${ok?'':'background:color-mix(in srgb,var(--red) 12%,var(--cell))'}"><div class="big" style="${ok?'':'color:var(--red)'}">${syl.length}</div><div><div>${ok?'Верно':'Правильно'}: <b>${d}</b>.</div><div class="bkhint">${syl.map(s=>`${s} — ${slSylOpen(s)?'открытый':'закрытый'}`).join('; ')}</div></div></div><div><button class="linkbtn" data-sluagain>Ещё раз</button></div>`
 :`<div class="big2"><button class="main" data-slucheck ${sluSet.size?'':'disabled'}>Проверить</button></div>`}</div>`;
}

// 4. Открытый или закрытый: нажимать на слоги
const SL_OPW=['са-лют','ба-ра-бан','кар-та','о-са','ма-як','чай-ник','ёл-ка','со-ло-вей','ко-ро-ва','пол-ка','бо-рец','конь','у-ро-жай','ли-мон'];
let sloW=0,sloA={},sloChk=false;
function slopenHTML(){
 const syl=SL_OPW[sloW].split('-'),lab={o:'открытый',z:'закрытый'};
 const all=syl.every((_,i)=>sloA[i]);
 const tiles=syl.map((s,i)=>{const r=slSylOpen(s)?'o':'z',a=sloA[i];const cl=sloChk?(a===r?'ok':'bad'):a?'on':'';
  return `<button class="wchip ${cl}" data-slosy="${i}" ${sloChk?'disabled':''} style="text-align:center;min-width:76px;font-size:20px">${s}<br><small style="font-size:13px">${a?lab[a]:'?'}${sloChk&&a!==r?' → '+lab[r]:''}</small></button>`}).join('');
 return `<div class="blab" data-lab="slopen"><div class="cap"><b>Открытый или закрытый?</b><span class="bkhint">нажатие на слог меняет ответ</span></div>
 <div class="chips">${SL_OPW.map((x,i)=>`<button class="chipc" data-slow="${i}" aria-pressed="${i===sloW}">${x.replace(/-/g,'')}</button>`).join('')}</div>
 <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:6px 0">${tiles}</div>
 ${sloChk?`<div class="bkhint">Открытый слог кончается гласным звуком, закрытый — согласным. Буква ь звука не даёт: «конь» кончается звуком [н’].</div><div><button class="linkbtn" data-sloagain>Ещё раз</button></div>`
 :`<div class="big2"><button class="main" data-slocheck ${all?'':'disabled'}>Проверить</button></div>`}</div>`;
}

// 5. Где можно перенести: нажатие на место между буквами объясняет, можно ли
const SL_PW={slper:['чайник','машина','Азия','акула','осень','майка','мебель','семья','район','колесо','улей','лейка','океан','стол','герой'],
 slper2:['сестра','остров','окно','касса','русский','сердце','ведро','тайна','ссора','аллея','антенна','лампа','коллекция','звезда','коньки','больница']};
const slp={slper:{w:0,k:null,all:false},slper2:{w:0,k:null,all:false}};
function slperMake(id){return ()=>{
 const st=slp[id],w=SL_PW[id][st.w],lw=w.toLowerCase(),ok=slPer(lw);
 let h='';[...w].forEach((ch,i)=>{h+=`<span>${ch}</span>`;if(i<w.length-1){const k=i+1,can=ok.includes(k),sel=st.k===k,show=st.all||sel;
  h+=`<button class="gapb ${show?(can?'ok':'bad'):''}" data-slpk="${k}" data-slpid="${id}" aria-label="Перенос после ${i+1}-й буквы">${show?(can?'-':'×'):'·'}</button>`}});
 const why=st.k!=null?slWhy(lw,st.k):null;
 return `<div class="blab" data-lab="${id}"><div class="cap"><b>Где можно перенести</b><span class="bkhint">нажать на место между буквами</span></div>
 <div class="chips">${SL_PW[id].map((x,i)=>`<button class="chipc" data-slpw="${i}" data-slpid="${id}" aria-pressed="${i===st.w}">${x}</button>`).join('')}</div>
 <div class="mlet">${h}</div>
 ${why?`<div class="st2 ${why[0]?'ok':''}"><span class="n2">${why[0]?'да':'нет'}</span><div><b>${w.slice(0,st.k)}-${w.slice(st.k)}</b>. ${why[1]}</div></div>`:''}
 ${st.all?`<div class="result"><div class="big">${ok.length}</div><div>${ok.length?'Все варианты: <b>'+slShowPer(w)+'</b>.':'Слово <b>'+w+'</b> не переносится: каждое место нарушает какое-то правило.'}</div></div>`:''}
 <div><button class="linkbtn" data-slpall="${id}">${st.all?'Скрыть':'Показать все места'}</button></div></div>`}}

// 6. Слоги и перенос рядом
const SL_VS=[
 ['яма','я-ма',2,'Слог из одной буквы «я» есть, но одну букву нельзя ни оставить, ни перенести.'],
 ['юла','ю-ла',2,'То же: первый слог — одна буква.'],
 ['район','ра-йон',2,'Звук [й\'] между гласными уходит в следующий слог, а на письме й не отрывают от гласной перед ней.'],
 ['майор','ма-йор',2,'Как в слове «район»: слоги ма-йор, перенос май-ор.'],
 ['сестра',null,2,'Слогов два, а переносов три: разные согласные можно делить любым образом. Как делить такие слова на слоги, учёные спорят (урок 2).'],
 ['касса',null,2,'Звучит один долгий [с], а букв две — и их при переносе разделяют.'],
 ['молоко','мо-ло-ко',3,'Здесь слоги и перенос совпадают: каждый согласный стоит перед своей гласной.'],
 ['акула','а-ку-ла',3,'Три слога, но переносится только одним способом: первый слог — одна буква.'],
 ['театр','те-атр',2,'Совпадают: граница между гласными; «теа-тр» нельзя — во второй части нет гласной.'],
 ['чайник','чай-ник',2,'Совпадают: й закрывает первый слог и при переносе остаётся с ним.'],
 ['осень','о-сень',2,'Два слога, а перенести нельзя.'],
 ['маяк','ма-як',2,'Совпадают: буква я начинает второй слог.']
];
let slvW=0;
function slvsHTML(){
 const [w,s,n,c]=SL_VS[slvW],p=slPer(w);
 return `<div class="blab" data-lab="slvs"><div class="cap"><b>Слоги и перенос</b><span class="bkhint">выбрать слово</span></div>
 <div class="chips">${SL_VS.map((x,i)=>`<button class="chipc" data-slvw="${i}" aria-pressed="${i===slvW}">${x[0]}</button>`).join('')}</div>
 <div class="cols"><div><div class="colh"><span class="tagN">Слоги</span></div><div style="font-size:20px;text-align:center;padding:6px">${s||w}</div><div class="bkhint" style="text-align:center">${n} ${n<5?(n===1?'слог':'слога'):'слогов'}${s?'':' (граница спорная)'}</div></div>
 <div><div class="colh"><span class="tagNN">Перенос</span></div><div style="font-size:20px;text-align:center;padding:6px">${p.length?p.map(k=>w.slice(0,k)+'-'+w.slice(k)).join('<br>'):'—'}</div><div class="bkhint" style="text-align:center">${p.length?(p.length===1?'один способ':p.length+' способа'):'не переносится'}</div></div></div>
 <div class="bkhint">${c}</div></div>`;
}

document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.slcw!==undefined){slcW=+d.slcw;slcG=null;relab('slcount')}
 if(d.slcg!==undefined){slcG=+d.slcg;relab('slcount')}
 if(d.slgto!==undefined){slg.nodes=slg.nodes.slice(0,+d.slgk+1);slg.nodes.push(d.slgto);slg.w=null;relab('slgo')}
 if(d.slgreset!==undefined){slg.nodes=['start'];slg.w=null;relab('slgo')}
 if(d.slgw!==undefined){const i=+d.slgw;slg.w=i;slg.nodes=['start'];let cur='start';for(const j of SL_GOW[i][1]){cur=SL_GO[cur].o[j][1];slg.nodes.push(cur)}relab('slgo')}
 if(d.sluw!==undefined){sluW=+d.sluw;sluSet=new Set();sluChk=false;relab('slcut')}
 if(d.slucut!==undefined){const k=+d.slucut;sluSet.has(k)?sluSet.delete(k):sluSet.add(k);relab('slcut')}
 if(d.slucheck!==undefined){sluChk=true;relab('slcut')}
 if(d.sluagain!==undefined){sluSet=new Set();sluChk=false;relab('slcut')}
 if(d.slow!==undefined){sloW=+d.slow;sloA={};sloChk=false;relab('slopen')}
 if(d.slosy!==undefined){const i=+d.slosy;sloA[i]=sloA[i]==='o'?'z':'o';relab('slopen')}
 if(d.slocheck!==undefined){sloChk=true;relab('slopen')}
 if(d.sloagain!==undefined){sloA={};sloChk=false;relab('slopen')}
 if(d.slpw!==undefined){const st=slp[d.slpid];st.w=+d.slpw;st.k=null;st.all=false;relab(d.slpid)}
 if(d.slpk!==undefined){slp[d.slpid].k=+d.slpk;relab(d.slpid)}
 if(d.slpall!==undefined){const st=slp[d.slpall];st.all=!st.all;relab(d.slpall)}
 if(d.slvw!==undefined){slvW=+d.slvw;relab('slvs')}
});
Object.assign(LABS,{slcount:slcountHTML,slgo:slgoHTML,slcut:slcutHTML,slopen:slopenHTML,slper:slperMake('slper'),slper2:slperMake('slper2'),slvs:slvsHTML});
