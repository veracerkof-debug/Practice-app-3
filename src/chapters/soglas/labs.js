// ---------- схемы главы «Согласные в корне» ----------
// Все имена — с префиксом sg/SG_, обработчики — по своим data-* атрибутам (data-sgk…, data-sgw…, data-sga…, data-sgd…, data-sgu…, data-sgn…, data-sgb…, data-sgp…, data-sgt…).
const sgShuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sgGap=(w,v)=>w.replace('_',v==null?'<span class="slot">…</span>':`<b class="m" style="color:var(--tint-text)">${v}</b>`);
const sgChips=(arr,cur,attr,lab)=>`<div class="chips" role="group" aria-label="${lab}">${arr.map((x,i)=>`<button class="chipc" ${attr}="${i}" aria-pressed="${i===cur}">${x}</button>`).join('')}</div>`;
const sgOk=(ok,t)=>`<div class="result"${ok?'':' style="background:color-mix(in srgb,var(--red) 10%,var(--cell))"'}><div class="big" style="color:var(${ok?'--T':'--red'})">${ok?'✓':'✗'}</div><div>${t}</div></div>`;
const sgBtn=(label,attr,val,state)=>`<button class="opt${state==='on'?' on':''}" ${attr}="${val}" ${state==='off'?'disabled':''}>${label}</button>`;

// ---------- урок 1: «Найди проверочное слово» — сначала выбрать проверку, потом букву ----------
const SG_CHECK=[
 ['ло_ка',['д','т'],'д',[['лодочка',1,'После д гласный — д слышен ясно.'],['лодки',0,'После д снова согласный к — проверки нет.'],['лодок',1,'После д гласный о — д слышен.']]],
 ['ду_',['б','п'],'б',[['дубки',0,'После б согласный к — проверки нет.'],['дубы',1,'После б гласный — б слышен.'],['дубрава',1,'После б согласный р — перед р парный звучит ясно.']]],
 ['ска_ка',['з','с'],'з',[['сказки',0,'После з снова к.'],['сказочный',1,'После з гласный о.'],['сказать',1,'После з гласный а.']]],
 ['моро_',['з','с'],'з',[['морозы',1,'После з гласный ы.'],['морозный',1,'После з согласный н — перед н парный звучит ясно.'],['морозко',0,'После з согласный к — проверки нет.']]],
 ['гла_кий',['д','т'],'д',[['гладко',0,'После д согласный к.'],['гладок',1,'После д гласный о.'],['гладить',1,'После д гласный и.']]],
 ['шу_ка',['б','п'],'б',[['шубы',1,'После б гласный ы.'],['шубки',0,'После б согласный к.'],['шубёнка',1,'После б гласный ё.']]],
 ['сапо_',['г','к'],'г',[['сапоги',1,'После г гласный и.'],['сапожки',0,'Здесь другой звук — ж, а после него к.'],['сапогом',1,'После г гласный о.']]],
 ['ни_кий',['з','с'],'з',[['низко',0,'После з согласный к.'],['низок',1,'После з гласный о.'],['низина',1,'После з гласный и.']]],
 ['про_ьба',['с','з'],'с',[['просить',1,'После с гласный и — слышно [с\'].'],['просьбы',0,'После с опять ь и б.'],['просит',1,'После с гласный и.']]],
 ['тетра_ь',['д','т'],'д',[['тетради',1,'После д гласный и.'],['тетрадь',0,'Это то же слово — на конце звук не слышен.'],['тетрадный',1,'После д согласный н.']]],
 ['ла_ка',['в','ф'],'в',[['лавочка',1,'После в гласный о.'],['лавки',0,'После в согласный к.'],['лавочник',1,'После в гласный о.']]],
 ['пло_ яблони',['д','т'],'д',[['плоды',1,'После д гласный ы: «плоды яблони».'],['плоты',0,'Это другое слово — плот из брёвен.'],['бесплодный',1,'После д согласный н.']]]
];
let sgK={i:0,c:null,l:null};
function sgcheckHTML(){
 const [w,opts,ans,cands]=SG_CHECK[sgK.i],c=sgK.c!=null?cands[sgK.c]:null;
 let h=`<div class="blab" data-lab="sgcheck"><div class="cap"><b>Найди проверочное слово</b><span class="bkhint">выбрать слово, потом букву</span></div>
 ${sgChips(SG_CHECK.map(x=>x[0].replace('_','…')),sgK.i,'data-sgki','Слова')}
 <div style="text-align:center;font-size:26px;padding:6px 0">${sgGap(w,sgK.l!=null&&c&&c[1]?ans:null)}</div>
 <div class="st2${c&&c[1]?' ok':''}"><span class="n2">1</span><div style="flex:1">Какое слово проверяет этот согласный?<div class="opts" style="display:flex;flex-direction:column;gap:6px;margin-top:6px">${cands.map((x,j)=>sgBtn(x[0],'data-sgkc',j,sgK.c===j?'on':(c&&c[1]?'off':''))).join('')}</div>${c?`<div class="bkhint" style="margin-top:6px;color:var(${c[1]?'--T':'--red'})">${c[1]?'Годится.':'Не годится.'} ${c[2]}</div>`:''}</div></div>`;
 if(c&&c[1])h+=`<div class="st2${sgK.l!=null?' ok':''}"><span class="n2">2</span><div style="flex:1">Какую букву писать?<div style="display:flex;gap:8px;margin-top:6px">${opts.map(v=>sgBtn(v,'data-sgkl',v,sgK.l===v?'on':(sgK.l!=null?'off':''))).join('')}</div></div></div>`;
 if(sgK.l!=null)h+=sgOk(sgK.l===ans,`<div style="font-size:20px">${w.replace('_',ans)}</div><div class="bkhint">${sgK.l===ans?'Верно':'Неверно'}: в слове «${c[0]}» слышится [${ans}], значит, пишется ${ans}.</div>`);
 return h+`<div><button class="linkbtn" data-sgkn>Следующее слово</button></div></div>`;
}

// ---------- урок 1: «Где нужно думать?» — отметить согласные в слабой позиции ----------
const SG_WEAK=[
 ['сугроб',[5],'Б на конце — проверить: сугробы. Г перед р — сильная позиция.'],
 ['лодка',[2],'Д перед глухим к: лодочка.'],
 ['зубной',[],'Здесь думать не нужно: б перед н — сильная позиция, слышно ясно.'],
 ['берёзка',[4],'З перед к: берёзонька.'],
 ['морковь',[5],'В на конце: моркови. Р и к стоят ясно: р не имеет пары, к перед гласным.'],
 ['свет',[3],'Т на конце тоже проверяют: света. С перед в — сильная позиция.'],
 ['просьба',[3],'С перед звонким б озвончается: просить.'],
 ['мокрый',[],'Думать не нужно: к перед р — сильная позиция.'],
 ['тетрадь',[5],'Д на конце (ь не мешает): тетради. Т перед р — ясно.'],
 ['травка',[3],'В перед к: трава. Т перед р — ясно.'],
 ['кружка',[3],'Ж перед к: кружек.'],
 ['обед',[3],'Д на конце: обеды. Б перед гласным — ясно.']
];
const SG_CONS='бвгджзклмнпрстфхцчшщй';
let sgW={i:0,sel:[],chk:false};
function sgweakHTML(){
 const [w,ok,why]=SG_WEAK[sgW.i];
 const lets=[...w].map((ch,j)=>{if(!SG_CONS.includes(ch))return `<span style="font-size:26px;padding:0 2px">${ch}</span>`;
  const on=sgW.sel.includes(j),right=ok.includes(j);let st='border:1px solid var(--sep);background:var(--cell)';
  if(sgW.chk&&right)st='border:2px solid var(--T);color:var(--T);background:color-mix(in srgb,var(--T) 12%,var(--cell))';
  else if(sgW.chk&&on)st='border:2px solid var(--red);color:var(--red)';
  else if(on)st='border:2px solid var(--tint);background:color-mix(in srgb,var(--tint) 12%,var(--cell))';
  return `<button data-sgwl="${j}" ${sgW.chk?'disabled':''} style="${st};min-width:34px;min-height:48px;font-size:24px;border-radius:9px;margin:0 1px;color:inherit" aria-pressed="${on}" aria-label="буква ${ch}">${ch}</button>`}).join('');
 const good=sgW.chk&&ok.length===sgW.sel.length&&ok.every(j=>sgW.sel.includes(j));
 return `<div class="blab" data-lab="sgweak"><div class="cap"><b>Где нужно думать?</b><span class="bkhint">отметить согласные, которые надо проверять</span></div>
 ${sgChips(SG_WEAK.map(x=>x[0]),sgW.i,'data-sgwi','Слова')}
 <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:2px;padding:10px 0">${lets}</div>
 ${sgW.chk?sgOk(good,`${good?'Верно.':'Есть ошибка.'} ${why}`):`<div class="bkhint" style="text-align:center">Слабая позиция — на конце слова и перед другим парным согласным. Если проверять нечего — сразу нажать «Проверить».</div>`}
 <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap">${sgW.chk?'':'<button class="linkbtn" data-sgwc>Проверить</button>'}<button class="linkbtn" data-sgwn>Следующее слово</button></div></div>`;
}

// ---------- урок 2: «Ж или ш?» — чередование подсказывает букву ----------
const SG_ALT=[
 ['но_ка','ж','нога','г','ножек'],['доро_ка','ж','дорога','г','дорожек'],['пиро_ки','ж','пирог','г','пирожок'],['фла_ки','ж','флаг','г','флажок'],
 ['подру_ка','ж','подруга','г','подружек'],['лу_ки','ж','луг','г','лужок'],['сторо_ка','ж','сторож','ж','сторожа'],
 ['у_ки','ш','ухо','х','ушастый'],['му_ка','ш','муха','х','мушек'],['оре_ки','ш','орех','х','орешек'],['пету_ки','ш','петух','х','петушок'],['руба_ка','ш','рубаха','х','рубашечка']
];
let sgA={i:0,a:null};
function sgaltHTML(){
 const [w,ans,rel,rl,chk]=SG_ALT[sgA.i],done=sgA.a!=null;
 return `<div class="blab" data-lab="sgalt"><div class="cap"><b>Ж или ш?</b><span class="bkhint">выбрать букву — увидеть цепочку</span></div>
 ${sgChips(SG_ALT.map(x=>x[0].replace('_','…')),sgA.i,'data-sgai','Слова')}
 <div style="text-align:center;font-size:26px;padding:6px 0">${sgGap(w,done?ans:null)}</div>
 <div style="display:flex;gap:8px;justify-content:center">${['ж','ш'].map(v=>sgBtn(v,'data-sgaa',v,sgA.a===v?'on':(done?'off':''))).join('')}</div>
 ${done?sgOk(sgA.a===ans,`<div class="flow"><span class="fb"><small>родственное</small><b>${rel}</b></span><i class="ar">→</i><span class="fb sf"><small>в слове</small><b>${w.replace('_',ans)}</b></span><i class="ar">→</i><span class="fb res"><small>проверка</small><b>${chk}</b></span></div>
 <div class="bkhint" style="margin-top:6px">${rl===ans?`Звук не меняется: ${rel} — ${chk}.`:`${rl} чередуется с ${ans}: ${rl==='х'?'х, с → ш':'г, д, з → ж'}. Проверка — тем же звуком: ${chk}.`}</div>`):''}
 <div><button class="linkbtn" data-sgan>Следующее слово</button></div></div>`;
}

// ---------- урок 2: «Проверишь или запомнишь?» ----------
const SG_DICT=[
 ['во_зал','к',null,'Проверочного слова нет: вокзал — словарное слово (слышится [г]).'],
 ['ве_ка','т','веточка','Проверка: веточка — после т гласный.'],
 ['фу_бол','т',null,'Словарное слово: футбол (слышится [д]).'],
 ['ры_ка','б','рыба, рыбонька','Проверка: рыба.'],
 ['рю_зак','к',null,'Словарное слово: рюкзак.'],
 ['ю_ка','б','юбочка','Проверка: юбочка.'],
 ['а_зац','б',null,'Словарное слово: абзац — проверить нечем.'],
 ['ко_ти','г','коготь','Проверка: коготь — после г гласный.'],
 ['э_замен','к',null,'Словарное слово: экзамен (слышится [гз]).'],
 ['сва_ьба','д','свадебный','Проверка: свадебный (а не «сват» — это другое слово).'],
 ['вдру_','г',null,'Словарное слово: вдруг (слышится [к]).'],
 ['мя_кий','г','мягок, мягонький','Проверка: мягок — слышен [г]; в «мягкий» слышится [х].'],
 ['ане_дот','к',null,'Словарное слово: анекдот.'],
 ['гря_ка','д','грядочка','Проверка: грядочка.']
];
let sgD={i:0,a:null};
function sgdictHTML(){
 const [w,ans,chk,why]=SG_DICT[sgD.i],done=sgD.a!=null,right=done&&(sgD.a==='c')===!!chk;
 return `<div class="blab" data-lab="sgdict"><div class="cap"><b>Проверишь или запомнишь?</b><span class="bkhint">решить, есть ли проверочное слово</span></div>
 ${sgChips(SG_DICT.map(x=>x[0].replace('_','…')),sgD.i,'data-sgdi','Слова')}
 <div style="text-align:center;font-size:26px;padding:6px 0">${sgGap(w,done?ans:null)}</div>
 <div class="opts" style="display:flex;flex-direction:column;gap:6px">${sgBtn('Есть проверочное слово','data-sgda','c',sgD.a==='c'?'on':(done?'off':''))}${sgBtn('Проверить нечем — словарное слово','data-sgda','d',sgD.a==='d'?'on':(done?'off':''))}</div>
 ${done?sgOk(right,`<div style="font-size:20px">${w.replace('_',ans)}</div><div class="bkhint">${why}</div>`):''}
 <div><button class="linkbtn" data-sgdn>Следующее слово</button></div></div>`;
}

// ---------- урок 3: кластер сочетаний с непроизносимыми ----------
const SG_CLUST=[
 ['стн','т','честный — честь, честен; местный — место; грустный — грусть; радостный — радость; известный — известие; хрустнуть — хруст; хлестнуть — хлестать','Без т: опасный (опасен), ужасный (ужас), прекрасный, вкусный, интересный, чудесный. Исключения: блеснуть, плеснуть — без т.'],
 ['здн','д','звёздный — звезда; поздний — опоздать; уездный — уезд','Запомнить: праздник (д во всех родственных словах стоит перед н).'],
 ['лнц','л','солнце — солнышко, солнечный','Одно слово с гнездом: солнце, солнечный, подсолнух, солнышко.'],
 ['рдц','д','сердце — сердечко, сердечный','Одно слово с гнездом: сердце, сердечный, сердцевина.'],
 ['вств','в','здравствуй — здравый, здравие','Запомнить: чувство, чувствовать (проверки нет). Не путать: участвовать (участие) — лишнего в нет.'],
 ['лвств','в','безмолвствовать — безмолвие','Проверка — слово, где после в гласный.'],
 ['нтск','т','гигантский — гигант; президентский — президент','Без т: великанский (великан).'],
 ['ндск','д','голландский — Голландия; шотландский — Шотландия','Запомнить: ландшафт — д не слышен, проверки нет.'],
 ['стл','т','счастливый — счастье; завистливый — зависть; хвастливый — хвастать','Без т: масленица (масло), ремесленник (ремесло), гусли.'],
 ['исключения','т','лестница — пишется т, хотя «лесенка» без него','Блеснуть — без т, хотя «блестеть». Плеснуть — без т (плеск), не путать с «хлестнуть» (хлестать).']
];
let sgU=0;
function sgclustHTML(){
 const [k,l,ex,no]=SG_CLUST[sgU];
 return `<div class="blab" data-lab="sgclust"><div class="cap"><b>Сочетания с непроизносимыми</b><span class="bkhint">нажать на сочетание</span></div>
 ${sgChips(SG_CLUST.map(x=>x[0]),sgU,'data-sgu','Сочетания')}
 <div class="st2"><span class="n2">${l}</span><div style="flex:1">${k==='исключения'?'Пишется не по проверочному слову':`В сочетании <b class="m">${k}</b> не произносится <b class="m">${l}</b>`}</div></div>
 <div class="st2 ok"><span class="n2">✓</span><div style="flex:1"><b>Проверка:</b> ${ex}</div></div>
 <div class="st2"><span class="n2">!</span><div style="flex:1">${no}</div></div></div>`;
}

// ---------- урок 3: «Есть ли непроизносимый?» ----------
const SG_NEP=[
 ['чес…ный','честный','чесный','честь, честен','Т слышен перед гласным — пишется.'],
 ['опас…ный','опасный','опастный','опасен, опасаться','Т нет ни в одном родственном слове — не пишется.'],
 ['сол…це','солнце','сонце','солнышко','Л слышен в «солнышко».'],
 ['ужас…ный','ужасный','ужастный','ужас','В «ужас» т нет — лишняя буква была бы ошибкой.'],
 ['сер…це','сердце','серце','сердечко, сердечный','Д слышен перед гласным.'],
 ['звёз…ный','звёздный','звёзный','звезда','Д слышен перед а.'],
 ['лес…ница','лестница','лесница','лесенка — но!','Исключение: пишется т, хотя в «лесенка» его нет.'],
 ['интерес…ный','интересный','интерестный','интерес','Т нет — не пишется.'],
 ['здра…ствуй','здравствуй','здраствуй','здравый, здравие','В слышен перед гласным.'],
 ['гиган…ский','гигантский','гиганский','гигант','Т на конце слова «гигант» слышен.'],
 ['блес…нуть','блеснуть','блестнуть','блестеть — но!','Исключение: без т, хотя «блестеть».'],
 ['вкус…ный','вкусный','вкустный','вкус','Т нет — не пишется.'],
 ['поз…ний','поздний','позний','опоздать','Д слышен перед а.'],
 ['чу…ство','чувство','чуство','—','Проверки нет: чувство — запомнить.']
];
let sgN={i:0,a:null,ord:null};
function sgnepHTML(){
 const [w,ok,bad,chk,why]=SG_NEP[sgN.i];if(!sgN.ord)sgN.ord=sgShuf([ok,bad]);const done=sgN.a!=null;
 return `<div class="blab" data-lab="sgnep"><div class="cap"><b>Есть ли непроизносимый?</b><span class="bkhint">выбрать написание</span></div>
 ${sgChips(SG_NEP.map(x=>x[0]),sgN.i,'data-sgni','Слова')}
 <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:6px 0">${sgN.ord.map(v=>sgBtn(v,'data-sgna',v,sgN.a===v?'on':(done?'off':''))).join('')}</div>
 ${done?sgOk(sgN.a===ok,`<div style="font-size:20px">${ok}</div><div class="bkhint">Проверка: ${chk}. ${why}</div>`):''}
 <div><button class="linkbtn" data-sgnn>Следующее слово</button></div></div>`;
}

// ---------- урок 4: «Одна или две?» ----------
const SG_DBL=[ // слово с пропуском, одна, две, верно, родственные
 ['ко_ектив','л','лл','лл','коллективный, коллективно — лл'],['кори_ор','р','рр','р','коридорный — одна р'],['гру_а','п','пп','пп','группка, групповой — пп'],
 ['га_ерея','л','лл','л','галерейный — одна л'],['а_ея','л','лл','лл','аллейка — лл'],['те_аса','р','рр','рр','террасный — рр'],
 ['а_юминий','л','лл','л','алюминиевый — одна л'],['ва_а','н','нн','нн','ванная, ванночка — нн'],['де_ерт','с','сс','с','десертный — одна с'],
 ['су_ота','б','бб','бб','субботний — бб'],['апе_ьсин','л','лл','л','апельсиновый — одна л'],['програ_а','м','мм','мм','программный — мм'],
 ['ра_ета','к','кк','к','ракетный — одна к'],['хо_ей','к','кк','кк','хоккеист — кк'],['програ_ка','м','мм','мм','программа — программка: двойная сохраняется'],
 ['криста_ьный','л','лл','л','исключение: кристальный (но кристалл, кристаллик)']
];
let sgB={i:0,a:null};
function sgdblHTML(){
 const [w,one,two,ans,fam]=SG_DBL[sgB.i],done=sgB.a!=null;
 return `<div class="blab" data-lab="sgdbl"><div class="cap"><b>Одна или две?</b><span class="bkhint">выбрать — увидеть родственное слово</span></div>
 ${sgChips(SG_DBL.map(x=>x[0].replace('_','…')),sgB.i,'data-sgbi','Слова')}
 <div style="text-align:center;font-size:26px;padding:6px 0">${sgGap(w,done?ans:null)}</div>
 <div style="display:flex;gap:8px;justify-content:center">${[one,two].map(v=>sgBtn(v,'data-sgba',v,sgB.a===v?'on':(done?'off':''))).join('')}</div>
 ${done?sgOk(sgB.a===ans,`<div style="font-size:20px">${w.replace('_',ans)}</div><div class="bkhint">${fam}.</div>`):''}
 <div><button class="linkbtn" data-sgbn>Следующее слово</button></div></div>`;
}

// ---------- урок 5: «Почти-пары»: омофоны в контексте ----------
const SG_PAIR=[
 ['Старый … из брёвен покачивался у берега.',['плот','плод'],'плот','Плот из брёвен — плоты.'],
 ['На ветке созрел круглый румяный …',['плод','плот'],'плод','Плод яблони — плоды.'],
 ['Тихого … не видно за густыми ивами.',['пруда','прута'],'пруда','Пруд — водоём: пруды, прудовый.'],
 ['Пастух подгонял коров гибким …',['прутом','прудом'],'прутом','Прут — тонкая ветка: прутья.'],
 ['На тёплом … среди ромашек мы пролежали до вечера.',['лугу','луку'],'лугу','Луг — поле с травой: луга.'],
 ['Бабушка нарезала зелёный … к супу.',['лук','луг'],'лук','Лук — овощ: луковица.'],
 ['Охотник натянул тетиву и поднял …',['лук','луг'],'лук','Лук и стрелы: луки.'],
 ['Секретный … от сейфа знал только директор.',['код','кот'],'код','Код — шифр: коды.'],
 ['Рыжий … грелся на подоконнике.',['кот','код'],'кот','Кот — коты.'],
 ['В лесу после дождя мы нашли белый …',['гриб','грипп'],'гриб','Гриб — грибы.'],
 ['Зимой Петя целую неделю пролежал дома с …',['гриппом','грибом'],'гриппом','Грипп — болезнь, словарное слово с пп.'],
 ['За диктант Таня получила высший …',['балл','бал'],'балл','Балл — оценка: баллы, пятибалльный.'],
 ['Золушка спешила во дворец на …',['бал','балл'],'бал','Бал — праздник с танцами: балы.'],
 ['Старинный … князей жил в этих местах.',['род','рот'],'род','Род — родной, родня.']
];
let sgP={i:0,a:null,ord:null};
function sgpairHTML(){
 const [s,o,ans,why]=SG_PAIR[sgP.i];if(!sgP.ord)sgP.ord=sgShuf(o);const done=sgP.a!=null;
 return `<div class="blab" data-lab="sgpair"><div class="cap"><b>Звучат одинаково</b><span class="bkhint">выбрать слово по смыслу</span></div>
 <div style="font-size:18px;padding:6px 2px">${s.replace('…',done?`<b class="m" style="color:var(--tint-text)">${ans}</b>`:'<span class="slot">…</span>')}</div>
 <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${sgP.ord.map(v=>sgBtn(v,'data-sgpa',v,sgP.a===v?'on':(done?'off':''))).join('')}</div>
 ${done?sgOk(sgP.a===ans,`<div class="bkhint">${why}</div>`):''}
 <div style="display:flex;justify-content:space-between"><span class="bkhint">${sgP.i+1} из ${SG_PAIR.length}</span><button class="linkbtn" data-sgpn>Следующее предложение</button></div></div>`;
}

// ---------- урок 5: схема-алгоритм ----------
const SG_TREE={
 start:{q:'Где стоит трудный согласный?',o:[['В корне: ло?ка, чес?ный, ко?ектив','k1'],['В приставке: ?делать, по?ход, о?бить','r_pref']]},
 r_pref:{r:'приставка',t:'Приставка пишется всегда одинаково: сделать, подход, отбить (глава «Приставки»). Правило этой главы — только для корня.'},
 k1:{q:'Что за трудность?',o:[['Парный согласный на конце слова или перед согласным: ду?, ло?ка','p1'],['Сочетание стн, здн, лнц, рдц, вств, нтск, ндск — или место, где оно может быть: чес?ный, опас?ный','n1'],['Одна или две одинаковые буквы: ко?ектив, кори?ор','d1']]},
 p1:{q:'Есть ли форма или родственное слово, где после согласного гласный (или л, м, н, р)?',o:[['Да: дубы, лодочка, зубной','p2'],['Нет: вокзал, футбол, вдруг','r_dict']]},
 p2:{q:'В проверочном слове тот же звук? (ножка — ножек; нога — другой звук)',o:[['Да, тот же','r_check'],['Нет, звук другой: пирожки — пирог','r_alt']]},
 r_check:{r:'по проверке',t:'Писать букву, которая слышна в проверочном слове: дубы → дуб, лодочка → лодка, зубной → зубки.'},
 r_alt:{r:'тот же звук',t:'Найти слово с тем же звуком перед гласным: пирожок, ножек, флажок. Подсказка: г, д, з → ж; х, с → ш.'},
 r_dict:{r:'словарь',t:'Проверить нечем — писать по словарю и запомнить: вокзал, футбол, рюкзак, абзац, экзамен, вдруг.'},
 n1:{q:'Это слово из списка запоминания: лестница, блеснуть, плеснуть, чувство, праздник, сверстник, ровесник?',o:[['Да','r_nex'],['Нет','n2']]},
 n2:{q:'Подбери однокоренное слово, где этот согласный стоит перед гласным. Он там есть?',o:[['Да, согласный слышен: честь, звезда, солнышко','r_nyes'],['Нет, согласного нет: опасен, ужас, интерес','r_none']]},
 r_nyes:{r:'пишется',t:'Непроизносимый согласный пишется: честный, звёздный, солнце, сердце.'},
 r_none:{r:'не пишется',t:'Лишнюю букву не писать: опасный, ужасный, интересный, вкусный.'},
 r_nex:{r:'запомнить',t:'Лестница — с т (хотя лесенка); блеснуть, плеснуть — без т; чувство, праздник, сверстник — с непроизносимым, ровесник — без него. Проверки нет — запомнить.'},
 d1:{q:'Слово русское или пришло из другого языка?',o:[['Русское: ссора, вожжи, жужжать','r_drus'],['Из другого языка: класс, коридор, аллея','d2']]},
 r_drus:{r:'запомнить',t:'Двойные в русских корнях: ссора, Россия, вожжи, дрожжи, жужжать, можжевельник, жжёт. Если в родственном слове зг, зд — пишется зж: визжать (визг), приезжать (приезд).'},
 d2:{q:'Есть ли родственное слово, в написании которого ты уверен?',o:[['Да: класс → классный, группа → группка','d3'],['Нет','r_dslov']]},
 d3:{q:'Это исключение: кристальный, колонка, финский, манка?',o:[['Нет','r_dkeep'],['Да','r_dex']]},
 r_dkeep:{r:'как в родственном',t:'Двойная сохраняется: класс — классный, группа — группка, программа — программный.'},
 r_dex:{r:'одна',t:'Исключения с одной согласной: кристальный, колонка, финский, манка, трёхтонка.'},
 r_dslov:{r:'словарь',t:'Посмотреть в орфографическом словаре. Помнить ловушки с одной согласной: коридор, галерея, алюминий, десерт.'}
};
let sgT=['start'];
function sgalgHTML(){
 let h='<div class="blab" data-lab="sgalg"><div class="cap"><b>Схема: согласный в корне</b><span class="bkhint">выбрать ответ на каждом шаге</span></div><div class="tree">';
 sgT.forEach((id,k)=>{const n=SG_TREE[id];
  if(n.r){h+=`<div class="result"><div class="big" style="font-size:18px;min-width:72px">${n.r}</div><div>${n.t}</div></div>`;return}
  const next=sgT[k+1];
  h+=`<div class="step"><div class="q">${k+1}. ${n.q}</div><div class="opts">`+n.o.map(o=>{const on=next===o[1];return `<button class="opt${on?' on':''}" data-sgto="${o[1]}" data-sgtk="${k}" ${next&&!on?'disabled':''}>${o[0]}</button>`}).join('')+'</div></div>';
 });
 return h+'</div><div><button class="linkbtn" data-sgtr>Начать сначала</button></div></div>';
}

document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.sgki!==undefined){sgK={i:+d.sgki,c:null,l:null};relab('sgcheck');return}
 if(d.sgkc!==undefined){if(sgK.c!=null&&SG_CHECK[sgK.i][3][sgK.c][1])return;sgK.c=+d.sgkc;relab('sgcheck');return}
 if(d.sgkl!==undefined){if(sgK.l==null){sgK.l=d.sgkl;relab('sgcheck')}return}
 if(d.sgkn!==undefined){sgK={i:(sgK.i+1)%SG_CHECK.length,c:null,l:null};relab('sgcheck');return}
 if(d.sgwi!==undefined){sgW={i:+d.sgwi,sel:[],chk:false};relab('sgweak');return}
 if(d.sgwl!==undefined){const j=+d.sgwl;sgW.sel=sgW.sel.includes(j)?sgW.sel.filter(x=>x!==j):[...sgW.sel,j];relab('sgweak');return}
 if(d.sgwc!==undefined){sgW.chk=true;relab('sgweak');return}
 if(d.sgwn!==undefined){sgW={i:(sgW.i+1)%SG_WEAK.length,sel:[],chk:false};relab('sgweak');return}
 if(d.sgai!==undefined){sgA={i:+d.sgai,a:null};relab('sgalt');return}
 if(d.sgaa!==undefined){if(sgA.a==null){sgA.a=d.sgaa;relab('sgalt')}return}
 if(d.sgan!==undefined){sgA={i:(sgA.i+1)%SG_ALT.length,a:null};relab('sgalt');return}
 if(d.sgdi!==undefined){sgD={i:+d.sgdi,a:null};relab('sgdict');return}
 if(d.sgda!==undefined){if(sgD.a==null){sgD.a=d.sgda;relab('sgdict')}return}
 if(d.sgdn!==undefined){sgD={i:(sgD.i+1)%SG_DICT.length,a:null};relab('sgdict');return}
 if(d.sgu!==undefined){sgU=+d.sgu;relab('sgclust');return}
 if(d.sgni!==undefined){sgN={i:+d.sgni,a:null,ord:null};relab('sgnep');return}
 if(d.sgna!==undefined){if(sgN.a==null){sgN.a=d.sgna;relab('sgnep')}return}
 if(d.sgnn!==undefined){sgN={i:(sgN.i+1)%SG_NEP.length,a:null,ord:null};relab('sgnep');return}
 if(d.sgbi!==undefined){sgB={i:+d.sgbi,a:null};relab('sgdbl');return}
 if(d.sgba!==undefined){if(sgB.a==null){sgB.a=d.sgba;relab('sgdbl')}return}
 if(d.sgbn!==undefined){sgB={i:(sgB.i+1)%SG_DBL.length,a:null};relab('sgdbl');return}
 if(d.sgpa!==undefined){if(sgP.a==null){sgP.a=d.sgpa;relab('sgpair')}return}
 if(d.sgpn!==undefined){sgP={i:(sgP.i+1)%SG_PAIR.length,a:null,ord:null};relab('sgpair');return}
 if(d.sgto!==undefined){sgT=sgT.slice(0,+d.sgtk+1);sgT.push(d.sgto);relab('sgalg');return}
 if(d.sgtr!==undefined){sgT=['start'];relab('sgalg');return}
});
Object.assign(LABS,{sgcheck:sgcheckHTML,sgweak:sgweakHTML,sgalt:sgaltHTML,sgdict:sgdictHTML,sgclust:sgclustHTML,sgnep:sgnepHTML,sgdbl:sgdblHTML,sgpair:sgpairHTML,sgalg:sgalgHTML});
