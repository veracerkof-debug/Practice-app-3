// ---------- общий корпус: уровни доступа ----------
// Корпус (слова, предложения, позже тексты) — один на весь учебник и пополняется с каждой темой.
// Чтобы в задания не попадало то, чего ученик ещё не изучал (сложные предложения раньше темы
// «Сложное предложение» и т. п.), у каждой пометки разметки есть тема, где это изучают.
// Материал можно дать в теме X, только если все нужные ему темы стоят в порядке изучения не позже X.
//
// ПОРЯДОК ИЗУЧЕНИЯ совпадает с оглавлением (с 12.11.2026): линейный маршрут.
// Составлен по школьной программе 5–9 классов и решениям владельца (docs/plans/struktura.md).
const COURSE_ORDER=['zvuki','slog','udar','proizn','leks','omon','fraz','sostav','slovoobr','koren','soglas','pristavki','sush','pril','chisl','mest','glag','prichastie','deeprich','narech','sluzh','mezhdom','shipyashie','znaki','nn','ne','slitno','propisn','slovosoch','prostoe','glavn','vtor','odnosost','odnor','obos','obos2','vvod','slozhnoe','ssp','spp','spp2','bsp','raznye','rech','znakisvod','tekst','tipy','stili','vyraz','normy','leknorm'];  // = оглавление (PARTS): линейный маршрут, решение владельца 12.11.2026
// ОПОРЫ ГЛАВ (PRINCIPLES §3а; «Карта курса», docs/plans/struktura.md, раздел 9). У каждой главы:
// need — главы, которые должны быть пройдены раньше (по маршруту они стоят выше);
// prop — темы из более поздних глав, без которых глава непонятна: о них в главе короткая справка («Что нужно знать») и ссылка.
// Из этого списка: подсказка автору главы и проверка графа понятий (node tools/check-chapter.js <id>, node tools/graph.js).
const OPORY={
 zvuki:{need:[]},slog:{need:['zvuki']},udar:{need:['zvuki','slog']},proizn:{need:['zvuki','udar']},
 leks:{need:['zvuki'],prop:['sostav']},omon:{need:['leks'],prop:['sostav']},fraz:{need:['leks','omon'],prop:['stili']},
 sostav:{need:['zvuki','leks']},slovoobr:{need:['sostav']},
 koren:{need:['sostav','udar']},soglas:{need:['sostav','zvuki']},pristavki:{need:['sostav','soglas']},
 sush:{need:['sostav']},pril:{need:['sush'],prop:['narech']},chisl:{need:['sush','pril']},mest:{need:['sush','pril','chisl']},
 glag:{need:['sush','sostav']},prichastie:{need:['pril','glag'],prop:['vtor']},deeprich:{need:['glag','prichastie'],prop:['narech','vtor']},
 narech:{need:['pril','glag']},sluzh:{need:['sush','glag','narech'],prop:['prostoe']},mezhdom:{need:['sluzh']},
 shipyashie:{need:['sostav','sush','pril','glag']},znaki:{need:['pristavki','sush','glag']},nn:{need:['pril','prichastie','narech']},
 ne:{need:['glag','prichastie','deeprich','mest','chisl','narech','sluzh']},slitno:{need:['narech','sluzh','mest','pril']},propisn:{need:['sush']},
 slovosoch:{need:['sush','pril','glag','narech']},prostoe:{need:['slovosoch']},glavn:{need:['prostoe','glag','sush']},vtor:{need:['glavn','slovosoch']},odnosost:{need:['glavn']},
 odnor:{need:['prostoe']},obos:{need:['vtor','prichastie','odnor']},obos2:{need:['obos','deeprich']},vvod:{need:['vtor']},
 slozhnoe:{need:['glavn','odnor','sluzh']},ssp:{need:['slozhnoe']},spp:{need:['slozhnoe','mest']},spp2:{need:['spp']},bsp:{need:['ssp','spp']},raznye:{need:['ssp','spp2','bsp']},
 rech:{need:['slozhnoe','vvod']},znakisvod:{need:['raznye','rech','obos2','vvod']},
 tekst:{need:['prostoe']},tipy:{need:['tekst']},stili:{need:['leks','vvod','tekst','tipy']},vyraz:{need:['leks','fraz','stili']},
 normy:{need:['glag','chisl','mest','slovosoch','glavn']},leknorm:{need:['omon','fraz','stili']}
};
// Пропедевтика (PRINCIPLES §3а): глава даёт на месте справку о теме, которую по маршруту изучают позже, —
// материал этой темы ей доступен (задания не требуют больше справки).
const PROP_TOPIC={prichastie:['prostoe'],deeprich:['prostoe']};
const tIdx=id=>{const i=COURSE_ORDER.indexOf(id);return i<0?999:i};
const tKnown=(ch,topic)=>COURSE_ORDER.includes(ch)&&COURSE_ORDER.includes(topic)&&(tIdx(topic)<=tIdx(ch)||(PROP_TOPIC[ch]||[]).includes(topic)); // неизвестная тема — ничего не открывает
// часть речи → тема
const POS_TOPIC={сущ:'sush',прил:'pril',числ:'chisl',мест:'mest',гл:'glag',прич:'prichastie',дееп:'deeprich',нар:'narech',предл:'sluzh',союз:'sluzh',част:'sluzh'};
const POS_NAME={сущ:'существительное',прил:'прилагательное',числ:'числительное',мест:'местоимение',гл:'глагол',прич:'причастие',дееп:'деепричастие',нар:'наречие',предл:'предлог',союз:'союз',част:'частица'};
// пометка предложения или запятой → тема. Всё предложение: одн — однородные члены, обос — обособленные
// (кроме причастного оборота), ввод — вводные слова, обр — обращение, сл — сложное, пр — прямая речь.
// Знак внутри предложения (, — : ;) — всегда с причиной: ,{об} — причастный оборот, ,{дееп} — деепричастный, ,{одн}, ,{обр}, ,{ввод}, ,{сл}, ,{пр}, ,{сравн}.
// Причины знаков действуют как пометки всего предложения: знак по неизученному правилу закрывает предложение для темы.
const FLAG_TOPIC={об:'prichastie',дееп:'deeprich',одн:'odnor',обос:'obos',сравн:'obos',ввод:'vvod',обр:'vvod',сл:'slozhnoe',пр:'rech'};
// Разборы: название и школьная цифра (цифру показываем там, где она уместна).
// Морфемный (состав слова) и словообразовательный (от чего и как образовано) — разные разборы;
// у словообразовательного единой школьной цифры нет.
const RAZBOR={fon:['фонетический',1],morf:['морфемный (по составу)',2],slovo:['словообразовательный',0],morfol:['морфологический',3],sint:['синтаксический',4]};
const razborName=k=>{const [n,d]=RAZBOR[k];return d?`${n} разбор (${d})`:`${n} разбор`};

// предложение корпуса → единицы и пометки. Формат: см. src/data/corpus/sentences.js
function corpusUnits(s){
 const body=s.replace(/^#\S*\s+/,'');
 return body.split(' ').map(tok=>{const m=tok.match(/^(.+?)(?:\{(.+)\})?$/),tg=m[2]?m[2].split(';'):[],cp=tg.find(x=>x.startsWith('ч:'));
  const om=tg.find(x=>x.startsWith('ор:')),op=om?om.split(':'):null;
  return {t:m[1].replace(/_/g,' '),or:op?{g:op[1],a:op[2],r:op[3].split('|')}:null,mem:tg.find(x=>MEMB[x])||'',ob:tg.includes('о'),ov:tg.includes('ов'),pr:(tg.find(x=>x.startsWith('п:'))||'').slice(2),kr:tg.includes('к'),
   pos:cp?cp.slice(2).split(','):[],why:/^[,:;—]$/.test(m[1])?tg[0]||'':'',mark:/^[,:;—]$/.test(m[1]),pu:/^[,.!?:;—]$/.test(m[1])}})}
const corpusFlags=s=>{const m=s.match(/^#(\S+)\s/);return m?m[1].split(','):[]};
// Материал для задания в теме ch. need: {mem — задание про члены предложения, pos — список частей речи, о которых
// спрашивает задание (['прич','прил']), commas — задание про знаки, has(u) — в предложении есть то, что проверяет задание}
function corpusSents(ch,need={}){return corpusFilter(ch,CORPUS_S,need)}
// связные тексты (CORPUS_T) для темы ch: отрывок доступен, только если доступно КАЖДОЕ его предложение
function corpusTexts(ch,need={}){return (typeof CORPUS_T==='undefined'?[]:CORPUS_T).map(t=>({a:t.a,w:t.w,g:t.g,ss:corpusFilter(ch,t.s,{orthOnly:need.orthOnly})})).filter((t,i)=>t.ss.length===CORPUS_T[i].s.length&&(!need.has||need.has(t.ss)))}
function corpusFilter(ch,list,need={}){
 return list.map(s=>({s,u:corpusUnits(s),f:corpusFlags(s)})).filter(({u,f})=>{
  if(u.some(x=>x.mark&&!x.why))return false;                                          // знак без причины — не даём никогда
  if(!u.every(x=>!x.or||orthKnown(ch,x.or.r)))return false;                            // орфограмма неизученной темы — предложение рано давать
  const ff=[...f,...u.filter(x=>x.why).map(x=>x.why)];                                 // причины знаков — как пометки предложения
  if(!need.orthOnly&&!ff.every(x=>FLAG_TOPIC[x]&&tKnown(ch,FLAG_TOPIC[x])))return false; // в заданиях только на орфографию знаки уже стоят и о них не спрашивают (решение владельца 05.11.2026)             // сложные, однородные, обращения, знаки — только после своей темы
  if(!need.orthOnly&&u.some(x=>x.ob)&&!tKnown(ch,'prichastie'))return false;                           // причастный оборот — после «Причастия»
  if(need.mem&&!tKnown(ch,'prostoe'))return false;                                    // члены предложения — после «Простого предложения»
  if(need.pos&&!need.pos.every(p=>tKnown(ch,POS_TOPIC[p])))return false;            // спрашиваем только об изученных частях речи
  return !need.has||need.has(u);
 }).map(x=>x.u);
}
// слова корпуса для темы ch: только части речи, которые уже изучены
const corpusWords=(ch,f=()=>true)=>CORPUS_W.filter(x=>tKnown(ch,POS_TOPIC[x.pos])&&f(x));
