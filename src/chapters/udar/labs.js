// ---------- схемы главы «Ударение» ----------
// Слова хранятся со знаком ударения U+0301 после ударной гласной; в словах с ё знак не ставится.
const UD_AC='́',UD_VOW='аеёиоуыэюяАЕЁИОУЫЭЮЯ';
// слово со знаком → {p: без знака, i: индекс ударной буквы в p}
function udParse(w){const k=w.indexOf(UD_AC);const p=w.split(UD_AC).join('');let i=k>0?k-1:p.indexOf('ё');if(i<0)i=[...p].findIndex(c=>UD_VOW.includes(c));return {p,i}} // без знака и без ё — односложное слово
// номер ударного слога (с 1)
function udSyl(w){const {p,i}=udParse(w);let n=0;for(let j=0;j<=i;j++)if(UD_VOW.includes(p[j]))n++;return n}
// выделить ударную гласную
function udHi(w){const {p,i}=udParse(w);if(i<0)return p;const one=[...p].filter(c=>UD_VOW.includes(c)).length<2;const ch=p[i]==='ё'||one?p[i]:p[i]+UD_AC; // в односложных словах знак не ставится
 return p.slice(0,i)+`<b class="m" style="color:var(--tint-text)">${ch}</b>`+p.slice(i+1)}

// ---------- урок 1 (и 4): «Поставь ударение» — нажать на ударную гласную ----------
const UD_PICK={
 base:['доро́га','молоко́','ко́мната','капу́ста','со́лнышко','черепа́ха','колоко́льчик','ла́сточка','учи́тельница','я́года','огоро́дник','сковорода́','рома́шка','бума́га','карандаши́','воробе́й','земляни́ка','ёжик','весёлый','перепёлка'],
 hard:['катало́г','кварта́л','звони́т','свёкла','ку́хонный','докуме́нт','киломе́тр','щаве́ль','то́рты','краси́вее','жалюзи́','поняла́','на́чал','опто́вый','хода́тайство','тамо́жня','цеме́нт','балова́ть','включи́т','портфе́ль','шофёр','опе́ка','ту́фля','сре́дства']
};
const udP={set:'base',i:0,pick:null,ok:0,tot:0,order:null};
function udPickOrder(){const a=UD_PICK[udP.set].map((_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function udpickHTML(){
 if(!udP.order)udP.order=udPickOrder();
 const w=UD_PICK[udP.set][udP.order[udP.i%udP.order.length]],{p,i}=udParse(w),done=udP.pick!=null;
 const letters=[...p].map((ch,j)=>{
  if(!UD_VOW.includes(ch))return `<span style="font-size:24px;padding:0 1px">${ch}</span>`;
  let st='border:1px solid var(--sep);background:var(--cell)';
  if(done&&j===i)st='border:2px solid var(--T);color:var(--T);background:color-mix(in srgb,var(--T) 12%,var(--cell))';
  else if(done&&j===udP.pick)st='border:2px solid var(--red);color:var(--red)';
  const shown=done&&j===i&&ch!=='ё'?ch+UD_AC:ch;
  return `<button data-udp="${j}" ${done?'disabled':''} style="${st};min-width:30px;min-height:46px;font-size:24px;border-radius:9px;padding:0 3px;margin:0 1px;color:inherit" aria-label="гласная ${ch}">${shown}</button>`;
 }).join('');
 const ok=done&&udP.pick===i;
 return `<div class="blab" data-lab="udpick"><div class="cap"><b>Поставь ударение</b><span class="bkhint">нажать на ударную гласную</span></div>
 <div class="chips"><button class="chipc" data-udps="base" aria-pressed="${udP.set==='base'}">Обычные слова</button><button class="chipc" data-udps="hard" aria-pressed="${udP.set==='hard'}">Трудные слова (урок 4)</button></div>
 <div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:2px;padding:14px 0">${letters}</div>
 ${done?`<div class="result"><div class="big" style="color:var(${ok?'--T':'--red'})">${ok?'✓':'✗'}</div><div><div style="font-size:20px">${udHi(w)}</div><div class="bkhint">${ok?'Верно.':'Ударение на другом слоге.'} Ударный слог — ${udSyl(w)}-й${p.includes('ё')?'; в слове есть ё — она всегда ударная':''}.</div></div></div>`:`<div class="bkhint" style="text-align:center">Произнести слово вслух, протянуть гласные по очереди.</div>`}
 <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><span class="bkhint">Верно: ${udP.ok} из ${udP.tot}</span>${done?'<button class="linkbtn" data-udpn>Следующее слово</button>':''}</div></div>`;
}

// ---------- урок 2: подвижное ударение — слово в разных формах ----------
const UD_MOVE=[
 ['вода',1,[['холодная','вода́'],['пить','во́ду'],['стакан','воды́'],['весенние','во́ды']]],
 ['рука',1,[['левая','рука́'],['поднять','ру́ку'],['у','руки́'],['чистые','ру́ки']]],
 ['зима',1,[['снежная','зима́'],['люблю','зи́му'],['до','зимы́'],['тёплые','зи́мы']]],
 ['голова',1,[['светлая','голова́'],['поднять','го́лову'],['с','головы́'],['много','голо́в']]],
 ['сестра',1,[['старшая','сестра́'],['у','сестры́'],['мои','сёстры'],['нет','сестёр']]],
 ['звезда',1,[['яркая','звезда́'],['увидеть','звезду́'],['ночные','звёзды'],['много','звёзд']]],
 ['город',1,[['большой','го́род'],['в','го́роде'],['новые','города́'],['много','городо́в']]],
 ['писать',1,[['я','пишу́'],['ты','пи́шешь'],['он','пи́шет'],['они','пи́шут']]],
 ['книга',0,[['новая','кни́га'],['читать','кни́гу'],['нет','кни́ги'],['о','кни́гах']]],
 ['торт',0,[['вкусный','торт'],['кусок','то́рта'],['большие','то́рты'],['много','то́ртов']]],
 ['квартал',0,[['новый','кварта́л'],['в','кварта́ле'],['соседние','кварта́лы'],['много','кварта́лов']]],
 ['звонить',0,[['я','звоню́'],['ты','звони́шь'],['он','звони́т'],['они','звоня́т']]]
];
let udMv=0;
function udmoveHTML(){
 const [k,mv,f]=UD_MOVE[udMv];
 const rows=f.map(([c,w])=>`<tr><td style="color:var(--l2);font-size:14px">${c}</td><td style="font-size:20px">${udHi(w)}</td><td class="bkhint">${udSyl(w)}-й слог</td></tr>`).join('');
 return `<div class="blab" data-lab="udmove"><div class="cap"><b>Бегает ли ударение?</b><span class="bkhint">выбрать слово</span></div>
 <div class="chips">${UD_MOVE.map((x,i)=>`<button class="chipc" data-udmv="${i}" aria-pressed="${i===udMv}">${x[0]}</button>`).join('')}</div>
 <div class="tblw"><table class="bktbl"><tbody>${rows}</tbody></table></div>
 <div class="result" style="background:color-mix(in srgb,var(${mv?'--tint':'--S'}) 12%,var(--cell))"><div class="big" style="color:var(${mv?'--tint-text':'--S'});font-size:22px">${mv?'подвижное':'неподвижное'}</div>
 <div class="bkhint">${mv?'В разных формах ударение переходит с одного слога на другой. Проверять нужно ту форму, которая стоит в тексте.':'Во всех формах ударение на одном и том же слоге. Переносить его нельзя'+(k==='торт'?': то́рты, а не «торты́».':k==='квартал'?': кварта́лы, а не «ква́ртал».':k==='звонить'?': звони́т, а не «зво́нит».':'.')}</div></div></div>`;
}

// ---------- урок 3: смысл меняется — омографы в предложениях ----------
const UD_OMO=[
 ['замок',['за́мок','Над рекой стоял старинный замок.','дворец, крепость'],['замо́к','Папа повесил на калитку новый замок.','то, чем запирают']],
 ['мука',['му́ка','Ждать ответа целую неделю было настоящей мукой.','страдание'],['мука́','Бабушка испекла блины из гречневой муки.','молотое зерно']],
 ['атлас',['а́тлас','На уроке географии мы открыли атлас.','сборник карт'],['атла́с','Платье сшили из голубого атласа.','блестящая ткань']],
 ['хлопок',['хло́пок','В Узбекистане выращивают хлопок.','растение'],['хлопо́к','Раздался громкий хлопок, и шарик лопнул.','короткий резкий звук']],
 ['орган',['о́рган','Сердце — главный орган кровообращения.','часть тела'],['орга́н','В концертном зале звучал орган.','музыкальный инструмент']],
 ['уже',['у́же','Эта тропинка у́же, чем дорога к реке.','более узкий'],['уже́','Когда мы пришли, все уже собрались.','к этому времени']],
 ['дорогой',['доро́гой','Дорогой мы любовались полями и рощами.','по пути'],['дорого́й','Это мой самый дорогой подарок.','ценный, милый']],
 ['плачу',['пла́чу','Я не плачу, просто ветер в глаза.','от «плакать»'],['плачу́','В кафе за всех плачу я.','от «платить»']],
 ['полки',['по́лки','Книжные полки заняли всю стену.','от «полка»'],['полки́','На параде по площади шли полки.','от «полк»']],
 ['парить',['па́рить','Перед сном дедушка любит парить ноги в горячей воде.','обдавать паром'],['пари́ть','Над полем медленно парит орёл.','плавно летать']]
];
let udOm=0;const udOa={};
function udomoHTML(){
 const x=UD_OMO[udOm],sides=[x[1],x[2]];
 const row=(s,j)=>{const key=udOm+':'+j,a=udOa[key];const right=s[0];const opts=[x[1][0],x[2][0]];
  const plain=s[1].replace(/́/g,'');
  return `<div class="st2"><span class="n2">${j+1}</span><div style="flex:1"><div style="font-size:17px">${plain}</div>
  <div class="opts" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">${opts.map(o=>{const cl=a?(o===right?'eok':o===a?'ebad':''):'';return `<button class="opt ${cl}" data-udoa="${key}" data-v="${o}" ${a?'disabled':''} style="font-size:18px">${udHi(o)}</button>`}).join('')}</div>
  ${a?`<div class="bkhint">${a===right?'Верно':'Неверно'}: здесь <b>${udHi(right)}</b> — ${s[2]}.</div>`:''}</div></div>`};
 return `<div class="blab" data-lab="udomo"><div class="cap"><b>Смысл меняется</b><span class="bkhint">выбрать, как прочитать слово</span></div>
 <div class="chips">${UD_OMO.map((y,i)=>`<button class="chipc" data-udom="${i}" aria-pressed="${i===udOm}">${y[0]}</button>`).join('')}</div>
 ${sides.map(row).join('')}
 <div class="bkhint">Решают смысл и соседние слова. Одинаковое написание — разные слова.</div></div>`;
}

// ---------- урок 4: семьи трудных слов ----------
const UD_FAM=[
 {t:'-лог',w:['катало́г','диало́г','моноло́г','эпило́г','некроло́г'],r:'Ударение на «лог»: последний слог.'},
 {t:'-провод',w:['газопрово́д','водопрово́д','нефтепрово́д','мусоропрово́д'],r:'Ударение на последнем слоге: -прово́д.'},
 {t:'километр или термометр',w:['киломе́тр','сантиме́тр','миллиме́тр','термо́метр','спидо́метр','баро́метр'],r:'Единицы длины — ударение на «метр»: киломе́тр, сантиме́тр. Приборы — на слог перед «метр»: термо́метр, спидо́метр.'},
 {t:'на конце',w:['кварта́л','догово́р','докуме́нт','портфе́ль','щаве́ль','цеме́нт','экспе́рт','дефи́с','жалюзи́','фарфо́р','столя́р','арбу́з'],r:'Частые слова с ударением на последнем слоге. Их нужно помнить.'},
 {t:'на первом слоге',w:['свёкла','ку́хонный','сре́дства','ста́туя','ту́фля','це́нтнер','до́ллар','ве́рба','при́нцип','не́нависть'],r:'Ударение на первом слоге. Свёкла — с ё, поэтому ударение видно на письме.'},
 {t:'в середине',w:['хода́тайство','тамо́жня','крапи́ва','прида́ное','двою́родный','опто́вый','гражда́нство','обеспе́чение','наме́рение','танцо́вщица'],r:'Ударение в середине слова.'},
 {t:'звонить, включить',w:['звони́т','звони́шь','позвони́т','включи́т','включи́шь','вручи́т','облегчи́т','сверли́т'],r:'Во всех формах ударение на конце: звони́т — как звони́шь.'},
 {t:'ё или е',w:['шофёр','молодёжь','новорождённый','опе́ка','афе́ра','осе́длый'],r:'В первых трёх словах — ударная ё. В остальных под ударением е: не «опёка», не «афёра», не «осёдлый».'}
];
let udFm=0;const udFs=new Set();
function udfamHTML(){
 const f=UD_FAM[udFm];
 return `<div class="blab" data-lab="udfam"><div class="cap"><b>Семьи трудных слов</b><span class="bkhint">сначала сказать вслух, потом нажать и проверить</span></div>
 <div class="chips">${UD_FAM.map((x,i)=>`<button class="chipc" data-udfm="${i}" aria-pressed="${i===udFm}">${x.t}</button>`).join('')}</div>
 <div style="display:flex;flex-wrap:wrap;gap:8px;padding:10px 0">${f.w.map((w,j)=>{const on=udFs.has(udFm+':'+j);return `<button class="wchip ${on?'on':''}" data-udfw="${j}" style="font-size:18px">${on?udHi(w):udParse(w).p}</button>`}).join('')}</div>
 <div class="bkhint">${f.r}</div>
 <div><button class="linkbtn" data-udfa>${f.w.every((_,j)=>udFs.has(udFm+':'+j))?'Спрятать ударения':'Показать все ударения'}</button></div></div>`;
}

// ---------- урок 5: ударение в формах «он — она — они» ----------
const UD_FORMS=[
 ['брать',['брал','брала́','бра́ли'],1],['взять',['взял','взяла́','взя́ли'],1],['ждать',['ждал','ждала́','жда́ли'],1],
 ['звать',['звал','звала́','зва́ли'],1],['жить',['жил','жила́','жи́ли'],1],['пить',['пил','пила́','пи́ли'],1],
 ['начать',['на́чал','начала́','на́чали'],2],['понять',['по́нял','поняла́','по́няли'],2],['принять',['при́нял','приняла́','при́няли'],2],['занять',['за́нял','заняла́','за́няли'],2],
 ['читать',['чита́л','чита́ла','чита́ли'],0],['класть',['клал','кла́ла','кла́ли'],0],['мыть',['мыл','мы́ла','мы́ли'],0],['положить',['положи́л','положи́ла','положи́ли'],0],
 ['беречь',['берёг','берегла́','берегли́'],3]
];
const UD_FNOTE=['Ударение во всех формах на одном месте — в форме «она» не переходит.','Ряд «брал — брала́»: в форме «она» ударение на конце, в остальных — в начале.','В формах «он» и «они» ударение на самом начале, в форме «она» — на конце.','Ударение во всех формах на последнем слоге.'];
let udFo=0;const udFq={};
function udformsHTML(){
 const [inf,f,t]=UD_FORMS[udFo],a=udFq[udFo],right=f[1];
 const wrong=t===0?(()=>{const {p,i}=udParse(right);const vs=[...p].map((c,j)=>UD_VOW.includes(c)?j:-1).filter(j=>j>=0&&j!==i);const k=vs[vs.length-1];return p.slice(0,k+1)+UD_AC+p.slice(k+1)})()
  :(()=>{const {p}=udParse(right);const vs=[...p].map((c,j)=>UD_VOW.includes(c)?j:-1).filter(j=>j>=0);const k=vs[0];return p.slice(0,k+1)+UD_AC+p.slice(k+1)})();
 const opts=[right,wrong].sort();
 return `<div class="blab" data-lab="udforms"><div class="cap"><b>Он — она — они</b><span class="bkhint">выбрать слово, ответить, как сказать «она…»</span></div>
 <div class="chips">${UD_FORMS.map((x,i)=>`<button class="chipc" data-udfo="${i}" aria-pressed="${i===udFo}">${x[0]}</button>`).join('')}</div>
 <div class="st2"><span class="n2">?</span><div style="flex:1">Вчера она (${inf}) — как сказать?<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">${opts.map(o=>{const cl=a?(o===right?'eok':o===a?'ebad':''):'';return `<button class="opt ${cl}" data-udfq="${o}" ${a?'disabled':''} style="font-size:19px">${udHi(o)}</button>`}).join('')}</div></div></div>
 ${a?`<div class="tblw"><table class="bktbl"><thead><tr><th>он</th><th>она</th><th>они</th></tr></thead><tbody><tr>${f.map(w=>`<td style="font-size:19px">${udHi(w)}</td>`).join('')}</tr></tbody></table></div><div class="bkhint">${a===right?'Верно.':'Неверно.'} ${UD_FNOTE[t]}</div>`:''}</div>`;
}

document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.udp!==undefined){if(udP.pick!=null)return;const w=UD_PICK[udP.set][udP.order[udP.i%udP.order.length]];udP.pick=+d.udp;udP.tot++;if(udP.pick===udParse(w).i)udP.ok++;relab('udpick');return}
 if(d.udpn!==undefined){udP.i++;udP.pick=null;relab('udpick');return}
 if(d.udps!==undefined){udP.set=d.udps;udP.i=0;udP.pick=null;udP.order=udPickOrder();relab('udpick');return}
 if(d.udmv!==undefined){udMv=+d.udmv;relab('udmove');return}
 if(d.udom!==undefined){udOm=+d.udom;relab('udomo');return}
 if(d.udoa!==undefined){udOa[d.udoa]=d.v;relab('udomo');return}
 if(d.udfm!==undefined){udFm=+d.udfm;relab('udfam');return}
 if(d.udfw!==undefined){const k=udFm+':'+d.udfw;udFs.has(k)?udFs.delete(k):udFs.add(k);relab('udfam');return}
 if(d.udfa!==undefined){const n=UD_FAM[udFm].w.length,all=[...Array(n).keys()].every(j=>udFs.has(udFm+':'+j));for(let j=0;j<n;j++)all?udFs.delete(udFm+':'+j):udFs.add(udFm+':'+j);relab('udfam');return}
 if(d.udfo!==undefined){udFo=+d.udfo;relab('udforms');return}
 if(d.udfq!==undefined){udFq[udFo]=d.udfq;relab('udforms');return}
});
Object.assign(LABS,{udpick:udpickHTML,udmove:udmoveHTML,udomo:udomoHTML,udfam:udfamHTML,udforms:udformsHTML});
