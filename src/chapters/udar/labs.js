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
const udShuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
// буквы слова; гласные — кнопки. pick — выбранная гласная (или null), attr — имя data-атрибута
function udLetters(w,pick,attr,size){
 const {p,i}=udParse(w),done=pick!=null;
 return [...p].map((ch,j)=>{
  if(!UD_VOW.includes(ch))return `<span style="font-size:${size}px;padding:0 1px">${ch}</span>`;
  let st='border:1px solid var(--sep);background:var(--cell)';
  if(done&&j===i)st='border:2px solid var(--T);color:var(--T);background:color-mix(in srgb,var(--T) 12%,var(--cell))';
  else if(done&&j===pick)st='border:2px solid var(--red);color:var(--red)';
  const shown=done&&j===i&&ch!=='ё'&&[...p].filter(c=>UD_VOW.includes(c)).length>1?ch+UD_AC:ch;
  return `<button ${attr}="${j}" ${done?'disabled':''} style="${st};min-width:${size+6}px;min-height:${size+20}px;font-size:${size}px;border-radius:9px;padding:0 3px;margin:0 1px;color:inherit" aria-label="гласная ${ch}">${shown}</button>`;
 }).join('');
}

// ---------- «Поставь ударение»: урок 1 — обычные слова (udpick), урок 4 — трудные (udpickh) ----------
const UD_PICK={
 udpick:['доро́га','молоко́','ко́мната','капу́ста','со́лнышко','черепа́ха','колоко́льчик','ла́сточка','учи́тельница','я́года','огоро́дник','сковорода́','рома́шка','бума́га','карандаши́','воробе́й','земляни́ка','ёжик','весёлый','перепёлка'],
 udpickh:['катало́г','кварта́л','звони́т','фарфо́р','ку́хонный','докуме́нт','киломе́тр','щаве́ль','дефи́с','двою́родный','жалюзи́','ве́рба','сантиме́тр','опто́вый','тамо́жня','цеме́нт','балова́ть','включи́т','портфе́ль','столя́р','опе́ка','ту́фля','сре́дства','термо́метр','алфави́т','крапи́ва','до́верху','сли́вовый']
};
const udP={udpick:{i:0,pick:null,ok:0,tot:0,order:null},udpickh:{i:0,pick:null,ok:0,tot:0,order:null}};
function udPickW(id){const s=udP[id];if(!s.order)s.order=udShuf(UD_PICK[id].map((_,i)=>i));return UD_PICK[id][s.order[s.i%s.order.length]]}
function udPickLab(id){
 const s=udP[id],w=udPickW(id),{p,i}=udParse(w),done=s.pick!=null,ok=done&&s.pick===i;
 return `<div class="blab" data-lab="${id}"><div class="cap"><b>Поставь ударение${id==='udpickh'?': трудные слова':''}</b><span class="bkhint">нажать на ударную гласную</span></div>
 <div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:2px;padding:14px 0">${udLetters(w,s.pick,'data-udp="'+id+'" data-udv',24)}</div>
 ${done?`<div class="result"><div class="big" style="color:var(${ok?'--T':'--red'})">${ok?'✓':'✗'}</div><div><div style="font-size:20px">${udHi(w)}</div><div class="bkhint">${ok?'Верно.':'Ударение на другом слоге.'} Ударный слог — ${udSyl(w)}-й${p.includes('ё')?'; в слове есть ё — она всегда ударная':''}.</div></div></div>`:`<div class="bkhint" style="text-align:center">${id==='udpickh'?'Сначала сказать слово вслух. Если сомневаешься — вспомнить его «семью».':'Произнести слово вслух, протянуть гласные по очереди.'}</div>`}
 <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><span class="bkhint">Верно: ${s.ok} из ${s.tot}</span>${done?`<button class="linkbtn" data-udpn="${id}">Следующее слово</button>`:''}</div></div>`;
}
const udpickHTML=()=>udPickLab('udpick'),udpickhHTML=()=>udPickLab('udpickh');

// ---------- урок 2: подвижное ударение — сначала поставить ударение в каждой форме, потом вывод ----------
const UD_MOVE=[
 ['вода',1,[['холодная','вода́'],['пить','во́ду'],['стакан','воды́'],['весенние','во́ды']]],
 ['книга',0,[['новая','кни́га'],['читать','кни́гу'],['нет','кни́ги'],['о','кни́гах']]],
 ['сестра',1,[['старшая','сестра́'],['у','сестры́'],['мои','сёстры'],['нет','сестёр']]],
 ['торт',0,[['вкусный','торт'],['кусок','то́рта'],['большие','то́рты'],['много','то́ртов']]],
 ['город',1,[['большой','го́род'],['в','го́роде'],['новые','города́'],['много','городо́в']]],
 ['звонить',0,[['я','звоню́'],['ты','звони́шь'],['он','звони́т'],['они','звоня́т']]],
 ['рука',1,[['левая','рука́'],['поднять','ру́ку'],['у','руки́'],['чистые','ру́ки']]],
 ['квартал',0,[['новый','кварта́л'],['в','кварта́ле'],['соседние','кварта́лы'],['много','кварта́лов']]],
 ['зима',1,[['снежная','зима́'],['люблю','зи́му'],['до','зимы́'],['тёплые','зи́мы']]],
 ['писать',1,[['я','пишу́'],['ты','пи́шешь'],['он','пи́шет'],['они','пи́шут']]],
 ['голова',1,[['светлая','голова́'],['поднять','го́лову'],['с','головы́'],['много','голо́в']]],
 ['звезда',1,[['яркая','звезда́'],['увидеть','звезду́'],['ночные','звёзды'],['много','звёзд']]]
];
let udMv=0;const udMp={},udMvv={};
function udmoveHTML(){
 const [k,mv,f]=UD_MOVE[udMv],pk=udMp[udMv]||{},all=f.every((_,j)=>pk[j]!=null),vd=udMvv[udMv];
 const rows=f.map(([c,w],j)=>`<tr><td style="color:var(--l2);font-size:14px">${c}</td><td><div style="display:flex;flex-wrap:wrap;align-items:center">${udLetters(w,pk[j]==null?null:pk[j],'data-udmf="'+j+'" data-udv',19)}</div></td><td class="bkhint">${pk[j]!=null?udSyl(w)+'-й слог':''}</td></tr>`).join('');
 const right=mv?'подвижное':'неподвижное';
 return `<div class="blab" data-lab="udmove"><div class="cap"><b>Бегает ли ударение?</b><span class="bkhint">выбрать слово; поставить ударение в каждой форме; сделать вывод</span></div>
 <div class="chips">${UD_MOVE.map((x,i)=>`<button class="chipc" data-udmv="${i}" aria-pressed="${i===udMv}">${x[0]}</button>`).join('')}</div>
 <div class="tblw"><table class="bktbl"><tbody>${rows}</tbody></table></div>
 ${all?`<div class="st2"><span class="n2">?</span><div style="flex:1">Ударение у этого слова…<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">${['подвижное','неподвижное'].map(o=>`<button class="opt ${vd?(o===right?'eok':o===vd?'ebad':''):''}" data-udmvv="${o}" ${vd?'disabled':''}>${o}</button>`).join('')}</div></div></div>`:`<div class="bkhint">Нажать на ударную гласную в каждой форме.</div>`}
 ${vd?`<div class="result" style="background:color-mix(in srgb,var(${mv?'--tint':'--S'}) 12%,var(--cell))"><div><div style="font-size:18px;font-weight:700;color:var(${mv?'--tint-text':'--S'})">Ударение ${right}</div>
 <div class="bkhint">${mv?'В разных формах ударение переходит с одного слога на другой. Проверять нужно ту форму, которая стоит в тексте.':'Во всех формах ударение на одном и том же слоге. Переносить его нельзя'+(k==='торт'?': то́рты, а не «торты́».':k==='квартал'?': кварта́лы, а не «ква́рталы».':k==='звонить'?': звони́т, а не «зво́нит».':'.')}</div></div></div>`:''}</div>`;
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
let udOm=0;const udOa={},udOo={};
function udOmOrd(){if(!udOo[udOm])udOo[udOm]={rows:udShuf([0,1]),btn:[udShuf([0,1]),udShuf([0,1])]};return udOo[udOm]}
function udomoHTML(){
 const x=UD_OMO[udOm],sides=[x[1],x[2]],o=udOmOrd();
 const row=(j,n)=>{const s=sides[j],key=udOm+':'+j,a=udOa[key],right=s[0];const opts=o.btn[n].map(b=>sides[b][0]);
  const plain=s[1].split(UD_AC).join('');
  return `<div class="st2"><span class="n2">${n+1}</span><div style="flex:1"><div style="font-size:17px">${plain}</div>
  <div class="opts" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">${opts.map(v=>{const cl=a?(v===right?'eok':v===a?'ebad':''):'';return `<button class="opt ${cl}" data-udoa="${key}" data-v="${v}" ${a?'disabled':''} style="font-size:18px">${udHi(v)}</button>`}).join('')}</div>
  ${a?`<div class="bkhint">${a===right?'Верно':'Неверно'}: здесь <b>${udHi(right)}</b> — ${s[2]}.</div>`:''}</div></div>`};
 return `<div class="blab" data-lab="udomo"><div class="cap"><b>Смысл меняется</b><span class="bkhint">выбрать, как прочитать слово</span></div>
 <div class="chips">${UD_OMO.map((y,i)=>`<button class="chipc" data-udom="${i}" aria-pressed="${i===udOm}">${y[0]}</button>`).join('')}</div>
 ${o.rows.map((j,n)=>row(j,n)).join('')}
 <div class="bkhint">Решают смысл и соседние слова. Одинаковое написание — разные слова.</div></div>`;
}

// ---------- урок 4: семьи трудных слов ----------
const UD_FAM=[
 {t:'-лог',w:['катало́г','диало́г','моноло́г','проло́г','эпило́г'],r:'Ударение на «лог»: последний слог.'},
 {t:'-провод',w:['газопрово́д','водопрово́д','нефтепрово́д','про́вод'],r:'В сложных словах ударение на последнем слоге: -прово́д. А само слово про́вод — на первом.'},
 {t:'километр или термометр',w:['киломе́тр','сантиме́тр','миллиме́тр','дециме́тр','термо́метр','спидо́метр','баро́метр'],r:'Единицы длины — ударение на «метр»: киломе́тр, сантиме́тр. Приборы — на слог перед «метр»: термо́метр, спидо́метр.'},
 {t:'на конце',w:['кварта́л','докуме́нт','портфе́ль','щаве́ль','цеме́нт','дефи́с','жалюзи́','фарфо́р','столя́р','арбу́з','алфави́т','реме́нь'],r:'Частые слова с ударением на последнем слоге. Их нужно помнить.'},
 {t:'на первом слоге',w:['свёкла','ку́хонный','сли́вовый','сре́дства','ста́туя','ту́фля','до́ллар','и́скра','ве́рба','тре́нер'],r:'Ударение на первом слоге. Свёкла — с ё, поэтому ударение видно на письме.'},
 {t:'в середине',w:['крапи́ва','двою́родный','опто́вый','тамо́жня','добы́ча','дремо́та','кладова́я','библиоте́ка'],r:'Ударение в середине слова.'},
 {t:'звонить, включить',w:['звони́т','звони́шь','звоня́т','позвони́т','включи́т','включи́шь','вручи́т','сверли́т'],r:'В формах «ты, он, они» ударение на конце: звони́т — как звоня́т. (И в «звони́л, звони́ла» — на «и».)'},
 {t:'ё или е',w:['шофёр','молодёжь','щёлкать','опе́ка','афе́ра'],r:'В первых трёх словах — ударная ё. В остальных под ударением е: не «опёка», не «афёра».'}
];
let udFm=0,udFmix=null;const udFs=new Set(),udFsc={ok:0,bad:0},udFmk={};
function udFamWords(){if(udFm>=0)return UD_FAM[udFm].w.map((w,j)=>[w,udFm+':'+j]);
 if(!udFmix)udFmix=udShuf(UD_FAM.flatMap((f,i)=>f.w.map((w,j)=>[w,i+':'+j]))).slice(0,10);return udFmix}
function udfamHTML(){
 const ws=udFamWords();
 return `<div class="blab" data-lab="udfam"><div class="cap"><b>Семьи трудных слов</b><span class="bkhint">сказать вслух, нажать, проверить и отметить себя</span></div>
 <div class="chips">${UD_FAM.map((x,i)=>`<button class="chipc" data-udfm="${i}" aria-pressed="${i===udFm}">${x.t}</button>`).join('')}<button class="chipc" data-udfm="-1" aria-pressed="${udFm<0}">вперемешку</button></div>
 <div style="display:flex;flex-direction:column;gap:6px;padding:10px 0">${ws.map(([w,k])=>{const on=udFs.has(k),m=udFmk[k];
  return `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px"><button class="wchip ${on?'on':''}" data-udfw="${k}" style="font-size:18px">${on?udHi(w):udParse(w).p}</button>${on&&!m?`<button class="linkbtn" data-udfk="${k}" data-v="ok">сказал так</button><button class="linkbtn" data-udfk="${k}" data-v="bad">ошибся</button>`:m?`<span class="bkhint">${m==='ok'?'✓':'✗ повторить'}</span>`:''}</div>`}).join('')}</div>
 <div class="bkhint">${udFm>=0?UD_FAM[udFm].r:'Слова из разных семей: семья не подсказывает ответ.'}</div>
 <div class="bkhint">Сказал верно: ${udFsc.ok}, ошибся: ${udFsc.bad}${udFm<0?' · <button class="linkbtn" data-udfnew>другие слова</button>':''}</div></div>`;
}

// ---------- урок 5: ударение в формах «он — она — они» ----------
const UD_FORMS=[
 ['брать',['брал','брала́','бра́ли'],1],['читать',['чита́л','чита́ла','чита́ли'],0],['начать',['на́чал','начала́','на́чали'],2],['мыть',['мыл','мы́ла','мы́ли'],0],
 ['ждать',['ждал','ждала́','жда́ли'],1],['беречь',['берёг','берегла́','берегли́'],3],['понять',['по́нял','поняла́','по́няли'],2],['петь',['пел','пе́ла','пе́ли'],0],
 ['пить',['пил','пила́','пи́ли'],1],['класть',['клал','кла́ла','кла́ли'],0],['принять',['при́нял','приняла́','при́няли'],2],['вести',['вёл','вела́','вели́'],3],
 ['звать',['звал','звала́','зва́ли'],1],['бить',['бил','би́ла','би́ли'],0],['занять',['за́нял','заняла́','за́няли'],2],['жить',['жил','жила́','жи́ли'],1],['взять',['взял','взяла́','взя́ли'],1]
];
const UD_FNOTE=['Ударение во всех формах на одном месте — в форме «она» не переходит.','Ряд «брал — брала́»: в форме «она» ударение на конце, в остальных — в начале.','В формах «он» и «они» ударение на самом начале, в форме «она» — на конце.','Ударение во всех формах на последнем слоге.'];
let udFo=0;const udFq={},udFq2={},udFord={};
// неверный вариант: перенести ударение на другую гласную (типичная ошибка)
function udWrong(w,toFirst){const {p,i}=udParse(w);const vs=[...p].map((c,j)=>UD_VOW.includes(c)?j:-1).filter(j=>j>=0&&j!==i);const k=toFirst?vs[0]:vs[vs.length-1];return p.slice(0,k+1)+UD_AC+p.slice(k+1)}
function udformsHTML(){
 const [inf,f,t]=UD_FORMS[udFo],a=udFq[udFo],right=f[1];
 const wrong=t===0||t===3?udWrong(right,false):udWrong(right,true); // бере́гла — типичная ошибка для третьего типа
 if(!udFord[udFo])udFord[udFo]=[Math.random()<.5,Math.random()<.5];
 const opts=udFord[udFo][0]?[right,wrong]:[wrong,right];
 const q2=t===2&&a,right2=f[0],wrong2=udWrong(right2,false),a2=udFq2[udFo],opts2=udFord[udFo][1]?[right2,wrong2]:[wrong2,right2];
 const btns=(os,ans,r,attr)=>os.map(o=>{const cl=ans?(o===r?'eok':o===ans?'ebad':''):'';return `<button class="opt ${cl}" ${attr}="${o}" ${ans?'disabled':''} style="font-size:19px">${udHi(o)}</button>`}).join('');
 const showTbl=a&&(t!==2||a2);
 return `<div class="blab" data-lab="udforms"><div class="cap"><b>Он — она — они</b><span class="bkhint">выбрать слово, ответить, как сказать</span></div>
 <div class="chips">${UD_FORMS.map((x,i)=>`<button class="chipc" data-udfo="${i}" aria-pressed="${i===udFo}">${x[0]}</button>`).join('')}</div>
 <div class="st2"><span class="n2">1</span><div style="flex:1">Вчера она (${inf}) — как сказать?<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">${btns(opts,a,right,'data-udfq')}</div></div></div>
 ${q2?`<div class="st2"><span class="n2">2</span><div style="flex:1">А он (${inf}) — как сказать?<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">${btns(opts2,a2,right2,'data-udfq2')}</div></div></div>`:''}
 ${showTbl?`<div class="tblw"><table class="bktbl"><thead><tr><th>он</th><th>она</th><th>они</th></tr></thead><tbody><tr>${f.map(w=>`<td style="font-size:19px">${udHi(w)}</td>`).join('')}</tr></tbody></table></div><div class="bkhint">${a===right&&(t!==2||a2===right2)?'Верно.':'Есть ошибка — посмотреть таблицу.'} ${UD_FNOTE[t]}</div>`:''}</div>`;
}

document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.udp!==undefined&&d.udv!==undefined){const s=udP[d.udp];if(s.pick!=null)return;s.pick=+d.udv;s.tot++;if(s.pick===udParse(udPickW(d.udp)).i)s.ok++;relab(d.udp);return}
 if(d.udpn!==undefined){const s=udP[d.udpn];s.i++;s.pick=null;relab(d.udpn);return}
 if(d.udmf!==undefined&&d.udv!==undefined){(udMp[udMv]=udMp[udMv]||{})[+d.udmf]=+d.udv;relab('udmove');return}
 if(d.udmvv!==undefined){udMvv[udMv]=d.udmvv;relab('udmove');return}
 if(d.udmv!==undefined){udMv=+d.udmv;relab('udmove');return}
 if(d.udom!==undefined){udOm=+d.udom;relab('udomo');return}
 if(d.udoa!==undefined){udOa[d.udoa]=d.v;relab('udomo');return}
 if(d.udfm!==undefined){udFm=+d.udfm;if(udFm<0)udFmix=null;relab('udfam');return}
 if(d.udfnew!==undefined){udFmix=null;relab('udfam');return}
 if(d.udfw!==undefined){udFs.add(d.udfw);relab('udfam');return}
 if(d.udfk!==undefined){if(!udFmk[d.udfk]){udFmk[d.udfk]=d.v;udFsc[d.v]++}relab('udfam');return}
 if(d.udfo!==undefined){udFo=+d.udfo;relab('udforms');return}
 if(d.udfq!==undefined){udFq[udFo]=d.udfq;relab('udforms');return}
 if(d.udfq2!==undefined){udFq2[udFo]=d.udfq2;relab('udforms');return}
});
Object.assign(LABS,{udpick:udpickHTML,udpickh:udpickhHTML,udmove:udmoveHTML,udomo:udomoHTML,udfam:udfamHTML,udforms:udformsHTML});
