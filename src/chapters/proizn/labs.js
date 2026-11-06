// ---------- схемы главы «Произношение» ----------
// Три «движка»: pzQ — слово (с выделенным местом) и выбор произношения; pzBin — разложить слова по двум столбикам;
// pzvow — звук на месте каждой безударной гласной; pzsil — нажать на непроизносимую букву. Все обработчики — data-pz*.
const pzShuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pzEsc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
// выделить часть слова: hl=[начало, длина]
const pzHl=(w,hl)=>hl?pzEsc(w.slice(0,hl[0]))+`<b class="m" style="color:var(--tint-text);text-decoration:underline">${pzEsc(w.substr(hl[0],hl[1]))}</b>`+pzEsc(w.slice(hl[0]+hl[1])):pzEsc(w);

// ---------- pzQ: выбрать верное произношение ----------
const PZ_Q={
 pznorm:{t:'Как сказать правильно?',sub:'выбрать литературное произношение',q:'Как произносится слово по норме?',items:[
  {w:'что',o:["[што]","[ч'то]"],a:"[што]",why:'В слове «что» сочетание чт произносится как [шт]. [ч\'то] — произношение по буквам.'},
  {w:'молоко',o:["[малако́]","[молоко́]"],a:"[малако́]",why:'Без ударения о звучит как [а]. Ясный [о] без ударения — оканье, черта северных говоров.'},
  {w:'коридор',o:['коридор','колидор'],a:'коридор',why:'«Колидор» — просторечное искажение слова.'},
  {w:'трамвай',o:['трамвай','транвай'],a:'трамвай',why:'«Транвай» — просторечное искажение: в слове звук [м].'},
  {w:'конечно',o:["[кан'э́шна]","[кан'э́ч'на]"],a:"[кан'э́шна]",why:'«Конечно» — одно из немногих слов, где чн произносится как [шн] (урок 4).'},
  {w:'весна',o:["[в'исна́]","[в'асна́]"],a:"[в'исна́]",why:'Е без ударения после мягкого звучит как [и]. [в\'асна́] — яканье, черта южных говоров.'},
  {w:'честный',o:["[ч'э́сный']","[ч'э́стный']"],a:"[ч'э́сный']",why:'В сочетании стн звук [т] не произносится (урок 3).'},
  {w:'кафе',o:["[кафэ́]","[каф'э́]"],a:"[кафэ́]",why:'В слове «кафе» ф перед е твёрдый (урок 5).'},
  {w:'учиться',o:["[уч'и́ца]","[уч'и́тс'а]"],a:"[уч'и́ца]",why:'Ться на конце звучит как [ца] (урок 3). [тс\'а] — по буквам.'},
  {w:'мягкий',o:["[м'а́хк'ий']","[м'а́гк'ий']"],a:"[м'а́хк'ий']",why:'В сочетании гк на месте г звучит [х] (урок 3).'},
  {w:'пиджак',o:['пиджак','пинжак'],a:'пиджак',why:'«Пинжак» — просторечное искажение.'},
  {w:'музей',o:["[муз'э́й']","[музэ́й']"],a:"[муз'э́й']",why:'В слове «музей» з перед е мягкий, как в русских словах (урок 5).'},
  {w:'жена',o:["[жына́]","[жэна́]"],a:"[жына́]",why:'Е без ударения после ж звучит как [ы] (урок 2).'},
  {w:'табуретка',o:['табуретка','тубаретка'],a:'табуретка',why:'«Тубаретка» — просторечное искажение.'}]},
 pzcomb:{t:'Что звучит на месте букв?',sub:'выделенные буквы — какой звук?',q:'Какой звук (звуки) на месте выделенных букв?',items:[
  {w:'счёт',hl:[0,2],o:["[щ']","[сч']","[ч']"],a:"[щ']",why:'Сч произносится как один долгий мягкий [щ\']: [щ\'о́т].'},
  {w:'мужчина',hl:[2,2],o:["[щ']","[жч']","[ч']"],a:"[щ']",why:'Жч, как и сч, звучит [щ\']: [мущ\'и́на].'},
  {w:'улыбаться',hl:[5,4],o:["[ца]","[тс'а]","[т'с'а]"],a:"[ца]",why:'Ться на конце — [ца]: [улыба́ца].'},
  {w:'детский',hl:[2,2],o:["[ц]","[тс]","[дс]"],a:"[ц]",why:'Тс на стыке частей слова — [ц]: [д\'э́цк\'ий\'].'},
  {w:'мягкий',hl:[2,2],o:["[хк']","[гк']","[к']"],a:"[хк']",why:'Гк — [хк]; перед и к мягкий: [м\'а́хк\'ий\'].'},
  {w:'легче',hl:[2,2],o:["[хч']","[гч']","[ч']"],a:"[хч']",why:'Гч — [хч\'].'},
  {w:'красного',hl:[6,1],o:['[в]','[г]','[х]'],a:'[в]',why:'В -ого на месте г звучит [в]: [кра́снава].'},
  {w:'его',hl:[1,1],o:['[в]','[г]','[х]'],a:'[в]',why:'В слове «его» на месте г — [в]: [й\'иво́].'},
  {w:'много',hl:[3,1],o:['[г]','[в]','[х]'],a:'[г]',why:'«Много» не отвечает на вопрос «какого?», как «красного»: здесь г звучит как [г].'},
  {w:'сшить',hl:[0,2],o:['[шш]','[сш]',"[щ']"],a:'[шш]',why:'Сш — долгий твёрдый [шш]: [шшы́т\'].'},
  {w:'лётчик',hl:[2,2],o:["[ч']","[тч']","[щ']"],a:"[ч']",why:'Тч — долгий [ч\']: [л\'о́ч\'ик].'},
  {w:'сжать',hl:[0,2],o:['[жж]','[сж]','[зж]'],a:'[жж]',why:'Сж — долгий твёрдый [жж]: [жжа́т\'].'},
  {w:'громкий',hl:[4,1],o:["[к']","[к]"],a:"[к']",why:'В -кий согласный мягкий: [гро́мк\'ий\']. Твёрдое [кый] — старая норма.'},
  {w:'вокзал',hl:[2,1],o:['[г]','[к]'],a:'[г]',why:'Глухой [к] перед звонким [з] озвончается: [вагза́л].'},
  {w:'сделать',hl:[0,1],o:['[з]','[с]'],a:'[з]',why:'Глухой [с] перед звонким [д] озвончается: [зд\'э́лат\'].'}]},
 pzcht:{t:'Чт: [шт] или [ч\'т]?',sub:'сначала ответить на вопрос, потом выбрать звук',q:'Как произносится сочетание чт?',pre:{q:'Это слово «что» или образованное от него?',o:['да','нет']},items:[
  {w:'что',hl:[0,2],o:['[шт]',"[ч'т]"],a:'[шт]',p:'да',why:'Слово «что» — [што].'},
  {w:'почта',hl:[2,2],o:['[шт]',"[ч'т]"],a:"[ч'т]",p:'нет',why:'Почта — не от «что»: [по́ч\'та].'},
  {w:'чтобы',hl:[0,2],o:['[шт]',"[ч'т]"],a:'[шт]',p:'да',why:'Чтобы — от «что»: [што́бы].'},
  {w:'мечта',hl:[2,2],o:['[шт]',"[ч'т]"],a:"[ч'т]",p:'нет',why:'Мечта — [м\'ич\'та́].'},
  {w:'что-то',hl:[0,2],o:['[шт]',"[ч'т]"],a:'[шт]',p:'да',why:'Что-то — от «что»: [шт].'},
  {w:'нечто',hl:[2,2],o:['[шт]',"[ч'т]"],a:"[ч'т]",p:'нет',why:'Нечто — книжное слово, произносится с [ч\'т]: [н\'э́ч\'та]. Запомнить!'},
  {w:'мачта',hl:[2,2],o:['[шт]',"[ч'т]"],a:"[ч'т]",p:'нет',why:'Мачта — [ма́ч\'та].'},
  {w:'кое-что',hl:[4,2],o:['[шт]',"[ч'т]"],a:'[шт]',p:'да',why:'Кое-что — от «что»: [шт].'},
  {w:'почтальон',hl:[2,2],o:['[шт]',"[ч'т]"],a:"[ч'т]",p:'нет',why:'Почтальон — от «почта»: [ч\'т].'},
  {w:'что-нибудь',hl:[0,2],o:['[шт]',"[ч'т]"],a:'[шт]',p:'да',why:'Что-нибудь — от «что»: [шт].'},
  {w:'чтение',hl:[0,2],o:['[шт]',"[ч'т]"],a:"[ч'т]",p:'нет',why:'Чтение — от «читать», не от «что»: [ч\'т].'},
  {w:'ни за что',hl:[6,2],o:['[шт]',"[ч'т]"],a:'[шт]',p:'да',why:'«Ни за что» — с тем же словом «что»: [шт].'}]}
};
const pzQs={};
function pzQst(id){if(!pzQs[id])pzQs[id]={i:0,pick:null,pp:null,ok:0,tot:0,order:pzShuf(PZ_Q[id].items.map((_,i)=>i)),oo:null};return pzQs[id]}
function pzQHTML(id){
 const L=PZ_Q[id],s=pzQst(id),it=L.items[s.order[s.i%s.order.length]],done=s.pick!=null,needPre=L.pre&&s.pp==null;
 if(!s.oo)s.oo=pzShuf(it.o);
 const btn=s.oo.map(o=>{const cl=done?(o===it.a?'eok':o===s.pick?'ebad':''):'';return `<button class="opt ${cl}" data-pzq="${id}" data-v="${pzEsc(o)}" ${done?'disabled':''} style="font-size:18px">${pzEsc(o)}</button>`}).join('');
 return `<div class="blab" data-lab="${id}"><div class="cap"><b>${L.t}</b><span class="bkhint">${L.sub}</span></div>
 <div style="text-align:center;font-size:26px;padding:12px 0 4px;overflow-wrap:anywhere">${pzHl(it.w,it.hl)}</div>
 ${L.pre?`<div class="st2"><span class="n2">1</span><div style="flex:1">${L.pre.q}<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">${L.pre.o.map(o=>`<button class="opt ${s.pp!=null?(o===it.p?'eok':o===s.pp?'ebad':''):''}" data-pzqp="${id}" data-v="${o}" ${s.pp!=null?'disabled':''}>${o}</button>`).join('')}</div>${s.pp!=null&&s.pp!==it.p?`<div class="bkhint">Нет: ${it.p==='да'?'это слово «что» или образовано от него.':'это слово не образовано от «что».'}</div>`:''}</div></div>`:''}
 ${needPre?'':`<div class="bkhint" style="text-align:center">${L.pre?'2. ':''}${L.q}</div>
 <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:10px 0">${btn}</div>`}
 ${done?`<div class="result"><div class="big" style="color:var(${s.pick===it.a?'--T':'--red'})">${s.pick===it.a?'✓':'✗'}</div><div class="bkhint">${pzEsc(it.why)}</div></div>`:''}
 <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><span class="bkhint">Верно: ${s.ok} из ${s.tot}</span>${done?`<button class="linkbtn" data-pzqn="${id}">Следующее слово</button>`:''}</div></div>`;
}
const pznormHTML=()=>pzQHTML('pznorm'),pzcombHTML=()=>pzQHTML('pzcomb'),pzchtHTML=()=>pzQHTML('pzcht');

// ---------- pzBin: разложить по двум столбикам ----------
const PZ_BINS={
 pzchn:{t:"Чн: [ч'н] или [шн]?",sub:'сначала решить, что это за слово, потом выбрать столбик',pre:{q:'Что это за слово?',o:['слово из списка [шн]','отчество на -ична','другое слово']},cats:["[ч'н]","[шн]"],items:[
  ['вечный',"[ч'н]",'Обычное слово — как пишется: [в\'э́ч\'ный\'].','другое слово'],['конечно',"[шн]",'Слово из списка: [кан\'э́шна].','слово из списка [шн]'],['ночной',"[ч'н]",'[нач\'но́й\'].','другое слово'],
  ['скучно',"[шн]",'Слово из списка: [ску́шна].','слово из списка [шн]'],['конечный',"[ч'н]",'Не «конечно»! Конечный (конечная остановка) — [ч\'н].','другое слово'],['нарочно',"[шн]",'Слово из списка: [наро́шна].','слово из списка [шн]'],
  ['точный',"[ч'н]",'[то́ч\'ный\'].','другое слово'],['яичница',"[шн]",'Слово из списка: [й\'ии́шн\'ица].','слово из списка [шн]'],['речной',"[ч'н]",'[р\'ич\'но́й\'].','другое слово'],
  ['скворечник',"[шн]",'Слово из списка.','слово из списка [шн]'],['бесконечно',"[ч'н]",'Не из списка: бесконечно — [ч\'н].','другое слово'],['Ильинична',"[шн]",'Отчество на -ична — [шн].','отчество на -ична'],
  ['прочный',"[ч'н]",'[ч\'н] — как пишется.','другое слово'],['удачный',"[ч'н]",'[ч\'н] — как пишется.','другое слово'],['Никитична',"[шн]",'Отчество на -ична — [шн].','отчество на -ична'],
  ['солнечный',"[ч'н]",'[ч\'н] — как пишется.','другое слово'],['восточный',"[ч'н]",'[ч\'н] — как пишется.','другое слово'],['мучной',"[ч'н]",'[ч\'н] — как пишется.','другое слово']]},
 pzte:{t:'Перед е: твёрдо или мягко?',sub:'нажать на столбик для каждого слова',cats:['твёрдо','мягко'],items:[
  ['кафе','твёрдо','[кафэ́].'],['музей','мягко','[муз\'э́й\'].'],['шоссе','твёрдо','[шасэ́].'],['термин','мягко','[т\'э́рм\'ин].'],
  ['пюре','твёрдо','[п\'урэ́].'],['тема','мягко','[т\'э́ма].'],['кашне','твёрдо','[кашнэ́].'],['пионер','мягко','[п\'иан\'э́р].'],
  ['ателье','твёрдо','а[тэ]лье.'],['шинель','мягко','[шын\'э́л\'].'],['купе','твёрдо','[купэ́].'],['фанера','мягко','[фан\'э́ра].'],
  ['тире','твёрдо','[т\'ирэ́]: т перед и мягкий, р перед е твёрдый.'],['газета','мягко','[газ\'э́та].'],['интервью','твёрдо','ин[тэ]рвью.'],['девиз','мягко','[д\'ив\'и́с]: д перед е мягкий.'],
  ['компьютер','твёрдо','компью[тэ]р.'],['берет','мягко','[б\'ир\'э́т].'],['шимпанзе','твёрдо','[шымпанзэ́].'],['винегрет','мягко','[в\'ин\'игр\'э́т].'],
  ['партер','твёрдо','пар[тэ]р.'],['президент','мягко','[пр\'из\'ид\'э́нт].']]}
};
const pzBs={};const PZ_BN=10;
function pzBst(id){if(!pzBs[id])pzBs[id]={order:pzShuf(PZ_BINS[id].items.map((_,i)=>i)).slice(0,PZ_BN),done:[],pp:null};return pzBs[id]}
function pzBinHTML(id){
 const L=PZ_BINS[id],s=pzBst(id),cur=s.done.length<s.order.length?L.items[s.order[s.done.length]]:null,last=s.done[s.done.length-1];
 const ok=s.done.filter(d=>d.pick===L.items[d.k][1]).length;
 const col=c=>`<div style="flex:1;min-width:130px;border:1px solid var(--sep);border-radius:12px;padding:8px"><div style="font-weight:700;text-align:center;margin-bottom:6px">${pzEsc(c)}</div>${s.done.filter(d=>d.pick===c).map(d=>{const r=L.items[d.k][1]===c;return `<div style="color:var(${r?'--T':'--red'})">${r?'✓':'✗'} ${pzEsc(L.items[d.k][0])}</div>`}).join('')}</div>`;
 return `<div class="blab" data-lab="${id}"><div class="cap"><b>${L.t}</b><span class="bkhint">${L.sub}</span></div>
 ${cur?`<div style="text-align:center;font-size:26px;padding:10px 0">${pzEsc(cur[0])}</div>
 ${L.pre?`<div class="st2"><span class="n2">1</span><div style="flex:1">${L.pre.q}<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${L.pre.o.map(o=>`<button class="opt ${s.pp!=null?(o===cur[3]?'eok':o===s.pp?'ebad':''):''}" data-pzbp="${id}" data-v="${pzEsc(o)}" ${s.pp!=null?'disabled':''}>${pzEsc(o)}</button>`).join('')}</div></div></div>`:''}
 ${L.pre&&s.pp==null?'':`<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:8px">${L.pre?'<span class="bkhint" style="width:100%;text-align:center">2. В какой столбик?</span>':''}${L.cats.map(c=>`<button class="opt" data-pzb="${id}" data-v="${pzEsc(c)}" style="font-size:18px">${pzEsc(c)}</button>`).join('')}</div>`}`
 :`<div class="result"><div class="big" style="color:var(--T)">${ok}/${s.order.length}</div><div class="bkhint">Серия закончена. Ошибки отмечены знаком ✗ — их стоит запомнить.</div></div>`}
 ${last?`<div class="bkhint" style="margin-bottom:8px">${pzEsc(L.items[last.k][0])}: ${last.pick===L.items[last.k][1]?'верно':'нет, '+pzEsc(L.items[last.k][1])}. ${pzEsc(L.items[last.k][2])}</div>`:''}
 <div style="display:flex;gap:8px;flex-wrap:wrap">${L.cats.map(col).join('')}</div>
 <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:8px"><span class="bkhint">Верно: ${ok} из ${s.done.length}</span><button class="linkbtn" data-pzbn="${id}">Новая серия</button></div></div>`;
}
const pzchnHTML=()=>pzBinHTML('pzchn'),pzteHTML=()=>pzBinHTML('pzte');

// ---------- pzvow: какой звук на месте безударной гласной ----------
// [слово, индекс ударной буквы, [[индекс буквы, звук, почему]…], транскрипция]
const PZ_VS=["[а]","[о]","[и]","[ы]","[э]","[й'и]"];
const PZ_VOW=[
 ['молоко',5,[[1,'[а]','о после твёрдого'],[3,'[а]','о после твёрдого']],"[малако́]"],
 ['весна',4,[[1,'[и]','е после мягкого']],"[в'исна́]"],
 ['жена',3,[[1,'[ы]','е после ж']],"[жына́]"],
 ['часы',3,[[1,'[и]','а после ч']],"[ч'исы́]"],
 ['шоколад',5,[[1,'[а]','о после ш'],[3,'[а]','о после твёрдого']],"[шакала́т]"],
 ['пятак',3,[[1,'[и]','я после мягкого']],"[п'ита́к]"],
 ['огород',4,[[0,'[а]','о в начале слова'],[2,'[а]','о после твёрдого']],"[агаро́т]"],
 ['цена',3,[[1,'[ы]','е после ц']],"[цына́]"],
 ['язык',2,[[0,"[й'и]",'я в начале слова — два звука']],"[й'изы́к]"],
 ['тяжёлый',3,[[1,'[и]','я после мягкого']],"[т'ижо́лый']"],
 ['жара',3,[[1,'[а]','а после ж']],"[жара́]"],
 ['самовар',5,[[1,'[а]','а после твёрдого'],[3,'[а]','о после твёрдого']],"[самава́р]"],
 ['щавель',3,[[1,'[и]','а после щ']],"[щ'ив'э́л']"],
 ['шестой',4,[[1,'[ы]','е после ш']],"[шысто́й']"],
 ['ещё',2,[[0,"[й'и]",'е в начале слова — два звука']],"[й'ищ'о́]"],
 ['седой',3,[[1,'[и]','е после мягкого']],"[с'идо́й']"]
];
let pzVi=0;const pzVa={};
function pzvowHTML(){
 const [w,st,vs,tr]=PZ_VOW[pzVi],a=pzVa[pzVi]||{},all=vs.every(v=>a[v[0]]!=null);
 const word=[...w].map((c,j)=>j===st?`<b style="color:var(--tint-text)">${c}${c==='ё'?'':'́'}</b>`:vs.some(v=>v[0]===j)?`<u>${c}</u>`:c).join('');
 const rows=vs.map(([j,r,why])=>{const p=a[j];return `<div class="st2"><span class="n2">${w[j]}</span><div style="flex:1"><span class="bkhint">${j+1}-я буква, без ударения${p!=null?' — '+why:''}</span><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">${PZ_VS.map(o=>`<button class="opt ${p!=null?(o===r?'eok':o===p?'ebad':''):''}" data-pzvv="${j}" data-v="${o}" ${p!=null?'disabled':''} style="min-width:46px">${o}</button>`).join('')}</div></div></div>`}).join('');
 const right=all&&vs.every(v=>a[v[0]]===v[1]);
 return `<div class="blab" data-lab="pzvow"><div class="cap"><b>Гласные без ударения</b><span class="bkhint">выбрать слово; для каждой подчёркнутой буквы выбрать звук</span></div>
 <div class="chips">${PZ_VOW.map((x,i)=>`<button class="chipc" data-pzvw="${i}" aria-pressed="${i===pzVi}">${x[0]}</button>`).join('')}</div>
 <div style="text-align:center;font-size:28px;padding:10px 0;letter-spacing:2px">${word}</div>${rows}
 ${all?`<div class="result"><div class="big" style="color:var(${right?'--T':'--red'})">${right?'✓':'✗'}</div><div><div style="font-size:20px">${tr}</div><div class="bkhint">${right?'Верно.':'Есть ошибка — сверить с правилом.'} Ясно звучит только ударная гласная.</div></div></div>`:''}</div>`;
}

// ---------- pzsil: нажать на букву, которая не произносится ----------
const PZ_SIL=[
 ['солнце',2,'В сочетании лнц [л] не произносится: проверка — солнышко.'],
 ['честный',3,'В сочетании стн [т] не произносится: [ч\'э́сный\'] (честь).'],
 ['чувство',2,'В вств первый [в] не произносится: [ч\'у́ства].'],
 ['здравствуй',4,'В вств первый [в] не произносится: [здра́ствуй\'].'],
 ['сердце',3,'В сочетании рдц [д] не произносится (сердечко).'],
 ['праздник',4,'В сочетании здн [д] не произносится.'],
 ['поздно',3,'В сочетании здн [д] не произносится: [по́зна] (опоздать).'],
 ['лестница',3,'В сочетании стн [т] не произносится (лесенка).'],
 ['местный',3,'В сочетании стн [т] не произносится: [м\'э́сный\'] (место).'],
 ['грустный',4,'В сочетании стн [т] не произносится: [гру́сный\'] (грусть).'],
 ['звёздный',4,'В сочетании здн [д] не произносится (звезда).'],
 ['вестник',3,'В сочетании стн [т] не произносится (весть).'],
 ['гигантский',5,'В сочетании нтск [т] не произносится: [г\'ига́нск\'ий\'].'],
 ['ненастный',5,'В сочетании стн [т] не произносится (ненастье).']
];
const pzS={i:0,pick:null,ok:0,tot:0,order:null};
function pzsilHTML(){
 if(!pzS.order)pzS.order=pzShuf(PZ_SIL.map((_,i)=>i));
 const [w,k,why]=PZ_SIL[pzS.order[pzS.i%pzS.order.length]],done=pzS.pick!=null,ok=done&&pzS.pick===k;
 const let_=[...w].map((c,j)=>{let st='border:1px solid var(--sep);background:var(--cell)';
  if(done&&j===k)st='border:2px solid var(--T);color:var(--T);background:color-mix(in srgb,var(--T) 12%,var(--cell));text-decoration:line-through';
  else if(done&&j===pzS.pick)st='border:2px solid var(--red);color:var(--red)';
  return `<button data-pzs="${j}" ${done?'disabled':''} style="${st};min-width:30px;min-height:44px;font-size:22px;border-radius:9px;padding:0 3px;margin:1px;color:inherit" aria-label="буква ${c}">${c}</button>`}).join('');
 return `<div class="blab" data-lab="pzsil"><div class="cap"><b>Какая буква молчит?</b><span class="bkhint">нажать на букву, которая пишется, но не произносится</span></div>
 <div style="display:flex;flex-wrap:wrap;justify-content:center;padding:12px 0">${let_}</div>
 ${done?`<div class="result"><div class="big" style="color:var(${ok?'--T':'--red'})">${ok?'✓':'✗'}</div><div class="bkhint">${ok?'Верно. ':'Не та буква. '}${pzEsc(why)}</div></div>`:`<div class="bkhint" style="text-align:center">Произнести слово вслух, медленно, и послушать каждый согласный.</div>`}
 <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><span class="bkhint">Верно: ${pzS.ok} из ${pzS.tot}</span>${done?`<button class="linkbtn" data-pzsn="1">Следующее слово</button>`:''}</div></div>`;
}

document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.pzq!==undefined){const s=pzQst(d.pzq);if(s.pick!=null)return;const it=PZ_Q[d.pzq].items[s.order[s.i%s.order.length]];s.pick=d.v;s.tot++;if(d.v===it.a)s.ok++;relab(d.pzq);return}
 if(d.pzqn!==undefined){const s=pzQst(d.pzqn);s.i++;s.pick=null;s.pp=null;s.oo=null;relab(d.pzqn);return}
 if(d.pzqp!==undefined){const s=pzQst(d.pzqp);if(s.pp==null){s.pp=d.v;relab(d.pzqp)}return}
 if(d.pzb!==undefined){const s=pzBst(d.pzb);if(s.done.length>=s.order.length)return;s.done.push({k:s.order[s.done.length],pick:d.v});s.pp=null;relab(d.pzb);return}
 if(d.pzbp!==undefined){const s=pzBst(d.pzbp);if(s.pp==null){s.pp=d.v;relab(d.pzbp)}return}
 if(d.pzbn!==undefined){delete pzBs[d.pzbn];relab(d.pzbn);return}
 if(d.pzvw!==undefined){pzVi=+d.pzvw;relab('pzvow');return}
 if(d.pzvv!==undefined){(pzVa[pzVi]=pzVa[pzVi]||{})[+d.pzvv]=d.v;relab('pzvow');return}
 if(d.pzs!==undefined){if(pzS.pick!=null)return;pzS.pick=+d.pzs;pzS.tot++;if(pzS.pick===PZ_SIL[pzS.order[pzS.i%pzS.order.length]][1])pzS.ok++;relab('pzsil');return}
 if(d.pzsn!==undefined){pzS.i++;pzS.pick=null;relab('pzsil');return}
});
Object.assign(LABS,{pznorm:pznormHTML,pzvow:pzvowHTML,pzsil:pzsilHTML,pzcomb:pzcombHTML,pzchn:pzchnHTML,pzcht:pzchtHTML,pzte:pzteHTML});
