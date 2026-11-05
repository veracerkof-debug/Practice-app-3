// ---------- схемы главы «Звуки и буквы» ----------
// Слово записано по буквам: «буква:звуки» через «|», звуки — через пробел, «'» — мягкость, ¤ — ударение (в коде — U+0301).
// Цвета звуков — школьные: гласный — красный, твёрдый согласный — синий, мягкий — зелёный.
const ZV_ACC='́';
const ZV_W={
 'ёж':"ё:й' о¤|ж:ш",'ёлка':"ё:й' о¤|л:л|к:к|а:а",'юла':"ю:й' у|л:л|а:а¤",'яма':"я:й' а¤|м:м|а:а",'юг':"ю:й' у¤|г:к",'язык':"я:й' и|з:з|ы:ы¤|к:к",'ещё':"е:й' и|щ:щ'|ё:о¤",
 'моя':"м:м|о:а|я:й' а¤",'каюта':"к:к|а:а|ю:й' у¤|т:т|а:а",'поёт':"п:п|о:а|ё:й' о¤|т:т",
 'день':"д:д'|е:э¤|н:н'|ь:",'конь':"к:к|о:о¤|н:н'|ь:",'пальто':"п:п|а:а|л:л'|ь:|т:т|о:о¤",'мышь':"м:м|ы:ы¤|ш:ш|ь:",'ночь':"н:н|о:о¤|ч:ч'|ь:",
 'щука':"щ:щ'|у:у¤|к:к|а:а",'чаща':"ч:ч'|а:а¤|щ:щ'|а:а",'жир':"ж:ж|и:ы¤|р:р",'цирк':"ц:ц|и:ы¤|р:р|к:к",'шёл':"ш:ш|ё:о¤|л:л",'мяч':"м:м'|я:а¤|ч:ч'",'лёд':"л:л'|ё:о¤|д:т",
 'вьюга':"в:в'|ь:|ю:й' у¤|г:г|а:а",'объезд':"о:а|б:б|ъ:|е:й' э¤|з:с|д:т",'объём':"о:а|б:б|ъ:|ё:й' о¤|м:м",'семья':"с:с'|е:и|м:м'|ь:|я:й' а¤",'друзья':"д:д|р:р|у:у|з:з'|ь:|я:й' а¤",
 'ружьё':"р:р|у:у|ж:ж|ь:|ё:й' о¤",'пьеса':"п:п'|ь:|е:й' э¤|с:с|а:а",'соловьи':"с:с|о:а|л:л|о:а|в:в'|ь:|и:й' и¤",
 'дуб':"д:д|у:у¤|б:п",'лодка':"л:л|о:о¤|д:т|к:к|а:а",'ложка':"л:л|о:о¤|ж:ш|к:к|а:а",'просьба':"п:п|р:р|о:о¤|с:з'|ь:|б:б|а:а",'кровь':"к:к|р:р|о:о¤|в:ф'|ь:",
 'сбор':"с:з|б:б|о:о¤|р:р",'вокзал':"в:в|о:а|к:г|з:з|а:а¤|л:л",'морковь':"м:м|о:а|р:р|к:к|о:о¤|в:ф'|ь:",'честный':"ч:ч'|е:э¤|с:с|т:|н:н|ы:ы|й:й'",
 'лесной':"л:л'|е:и|с:с|н:н|о:о¤|й:й'",'пятак':"п:п'|я:и|т:т|а:а¤|к:к",'вода':"в:в|о:а|д:д|а:а¤",'моряк':"м:м|о:а|р:р'|я:а¤|к:к",'гриб':"г:г|р:р'|и:и¤|б:п"
};
const zvP=w=>ZV_W[w].replace(/¤/g,ZV_ACC).split('|').map(x=>{const i=x.indexOf(':');return {l:x.slice(0,i),s:x.slice(i+1).split(' ').filter(Boolean)}});
const zvBase=s=>s.replace(/['́]/g,'');
const ZV_VOW='аоуыэи',ZV_VL='аоуыэияёюе',ZV_PAIR={б:'п',в:'ф',г:'к',д:'т',ж:'ш',з:'с',п:'б',ф:'в',к:'г',т:'д',ш:'ж',с:'з'};
const zvKind=s=>ZV_VOW.includes(zvBase(s))?'v':s.includes("'")?'s':'h';
const ZV_COL={v:'--D',h:'--S',s:'--T'};
const zvSnd=s=>`<span style="color:var(${ZV_COL[zvKind(s)]});font-weight:700">${s}</span>`;
const zvTr=w=>'['+zvP(w).map(c=>c.s.join('')).join('')+']';
const zvCnt=w=>{const p=zvP(w);return [p.length,p.reduce((n,c)=>n+c.s.length,0)]};
// характеристика согласного звука (по школьному плану)
function zvCons(s){const b=zvBase(s);
 const zv='лмнрй'.includes(b)?'зв. непарн.':'хцчщ'.includes(b)?'глух. непарн.':'бвгджз'.includes(b)?'зв. парн.':'глух. парн.';
 const tv='жшц'.includes(b)?'тв. непарн.':'чщй'.includes(b)?'мягк. непарн.':s.includes("'")?'мягк. парн.':'тв. парн.';
 return 'согл., '+zv+', '+tv}
const zvChar=s=>zvKind(s)==='v'?'гл., '+(s.includes(ZV_ACC)?'уд.':'безуд.'):zvCons(s);
// почему буква читается так: объяснение для столбика ленты
function zvWhy(p,i){
 const c=p[i],L=c.l,prev=i?p[i-1].l:'',next=i<p.length-1?p[i+1].l:'',isV=x=>ZV_VL.includes(x);
 if(L==='ъ')return 'Ъ звука не обозначает: показывает, что дальше звучит [й\'].';
 if(L==='ь'){if('еёюяи'.includes(next))return 'Разделительный ь: звука не обозначает; после него буква «'+next+'» даёт два звука.';
  if('жшчщ'.includes(prev))return 'После шипящего ь звука не обозначает и мягкости не показывает.';
  return 'Ь звука не обозначает: показывает мягкость ['+p[i-1].s.join('')+'].'}
 if(isV(L)){const st=c.s.join('').includes(ZV_ACC)?'ударный':'безударный';
  if(c.s.length===2)return '«'+L+'» '+(!i?'в начале слова':isV(prev)?'после гласной':'после «'+prev+'»')+' — два звука: [й\'] и '+st+' гласный.';
  let r='Гласный звук, '+st+'.';
  if('жшц'.includes(prev)&&'иеё'.includes(L))r+=' После «'+prev+'» согласный остаётся твёрдым'+(L==='и'?', и звучит как [ы]':'')+'.';
  else if('еёюяи'.includes(L)&&prev&&!isV(prev)&&!'чщй'.includes(prev))r+=' Показывает мягкость согласного перед ней.';
  if(!c.s[0].includes(ZV_ACC)&&zvBase(c.s[0])!==L&&'оея'.includes(L))r+=' Без ударения «'+L+'» звучит как ['+zvBase(c.s[0])+'].';
  return r}
 if(!c.s.length)return 'Непроизносимый согласный: буква есть, звука нет.';
 const s=c.s[0],b=zvBase(s);let r='Звук ['+s+']: '+zvCons(s).replace('согл., ','').replace(/зв\./,'звонкий').replace(/глух\./,'глухой').replace(/тв\./,'твёрдый').replace(/мягк\./,'мягкий').replace(/непарн\./g,'непарный').replace(/парн\./g,'парный')+'.';
 if(b!==L&&ZV_PAIR[L]===b){const voiced='бвгджз'.includes(L);
  r+=voiced?(next===''||(next==='ь'&&i===p.length-2)?' Оглушение на конце слова: «'+L+'» звучит как ['+s+'].':' Оглушение перед глухим: «'+L+'» звучит как ['+s+'].'):' Озвончение перед звонким: «'+L+'» звучит как ['+s+'].'}
 if(s.includes("'")&&!'чщй'.includes(b))r+=next==='ь'?' Мягкость показывает ь.':' Мягкость показывает буква «'+next+'».';
 return r}
// ---------- 1. Звуковая лента ----------
const ZV_TAPE=['ёж','ёлка','день','пальто','юла','моя','мяч','жир','чаща','вьюга','объём','дуб','честный'];
let ztW='ёлка',ztC=null;
function zvTapeHTML(){
 const p=zvP(ztW),[nb,ns]=zvCnt(ztW);
 const cols=p.map((c,i)=>`<button class="wchip ${ztC===i?'on':''}" data-zvcol="${i}" style="display:flex;flex-direction:column;align-items:center;min-width:46px;text-align:center;padding:6px 8px"><span style="font-size:22px">${c.l}</span><span style="font-size:16px;min-height:22px">${c.s.length?c.s.map(zvSnd).join(''):'<span style="color:var(--l3)">—</span>'}</span></button>`).join('');
 return `<div class="blab" data-lab="zvtape"><div class="cap"><b>Звуковая лента</b><span class="bkhint">выбрать слово, нажать на букву</span></div>
 <div class="chips">${ZV_TAPE.map(w=>`<button class="chipc" data-zvtape="${w}" aria-pressed="${w===ztW}">${w}</button>`).join('')}</div>
 <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">${cols}</div>
 <div style="text-align:center;font-size:20px">${zvTr(ztW).replace(/[^\[\]]+/,m=>{let o='';for(const c of p)o+=c.s.map(zvSnd).join('');return o})}</div>
 <div class="bkhint" style="text-align:center">букв: <b>${nb}</b> · звуков: <b>${ns}</b> · <span style="color:var(--D)">гласный</span> · <span style="color:var(--S)">твёрдый согласный</span> · <span style="color:var(--T)">мягкий согласный</span></div>
 ${ztC!=null?`<div class="st2"><span class="n2">${p[ztC].l}</span><div>${zvWhy(p,ztC)}</div></div>`:''}</div>`;
}
// ---------- 2. Алфавит ----------
const ZV_ABC=[['а','а','v','[а]: сад'],['б','бэ','c','[б] — бок, [б\'] — бег'],['в','вэ','c','[в] — вол, [в\'] — вёл'],['г','гэ','c','[г] — гол, [г\'] — гиря'],['д','дэ','c','[д] — дом, [д\'] — день'],
 ['е','е','v','[э] после согласного (мел), [й\'э] в начале слова, после гласной, после ъ и ь (ель)'],['ё','ё','v','[о] после согласного (мёд), [й\'о] в начале слова, после гласной, после ъ и ь (ёж)'],['ж','жэ','c','[ж] — всегда твёрдый: жук, жир'],
 ['з','зэ','c','[з] — зал, [з\'] — зима'],['и','и','v','[и] (ива); после ж, ш, ц — [ы] (жир); после ь — [й\'и] (соловьи)'],['й','и краткое','c','[й\'] — всегда мягкий: край, йод'],['к','ка','c','[к] — кот, [к\'] — кит'],
 ['л','эль','c','[л] — лук, [л\'] — люк'],['м','эм','c','[м] — мал, [м\'] — мял'],['н','эн','c','[н] — нос, [н\'] — нёс'],['о','о','v','[о] под ударением (дом); без ударения — [а] (вода)'],['п','пэ','c','[п] — пыл, [п\'] — пил'],
 ['р','эр','c','[р] — рад, [р\'] — ряд'],['с','эс','c','[с] — сад, [с\'] — сито'],['т','тэ','c','[т] — ток, [т\'] — тёк'],['у','у','v','[у]: рука'],['ф','эф','c','[ф] — фон, [ф\'] — фен'],
 ['х','ха','c','[х] — ход, [х\'] — хитрый'],['ц','цэ','c','[ц] — всегда твёрдый: цирк'],['ч','че','c','[ч\'] — всегда мягкий: час'],['ш','ша','c','[ш] — всегда твёрдый: шило'],['щ','ща','c','[щ\'] — всегда мягкий: щука'],
 ['ъ','твёрдый знак','z','звука не обозначает; разделительный: объём'],['ы','ы','v','[ы]: сыр'],['ь','мягкий знак','z','звука не обозначает; показывает мягкость (конь) или разделительный (семья)'],['э','э','v','[э]: эхо'],
 ['ю','ю','v','[у] после согласного (люк), [й\'у] в начале слова, после гласной, после ъ и ь (юг)'],['я','я','v','[а] после согласного (мял), [й\'а] в начале слова, после гласной, после ъ и ь (яма)']];
let zaSel=0;
function zvAlphaHTML(){
 const x=ZV_ABC[zaSel],col={v:'--D',c:'--S',z:'--l2'},grp={v:'гласная буква',c:'согласная буква',z:'не обозначает звука'};
 return `<div class="blab" data-lab="zvalpha"><div class="cap"><b>Алфавит</b><span class="bkhint">нажать на букву</span></div>
 <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:4px">${ZV_ABC.map((y,i)=>`<button class="wchip ${i===zaSel?'on':''}" data-zvabc="${i}" style="text-align:center;font-size:18px;padding:4px 0;color:var(${col[y[2]]})">${y[0].toUpperCase()}${y[0]}</button>`).join('')}</div>
 <div class="result"><div class="big" style="color:var(${col[x[2]]})">${x[0].toUpperCase()}${x[0]}</div><div><div><b>${zaSel+1}-я</b> буква · название: <b>${x[1]}</b> · ${grp[x[2]]}</div><div class="bkhint">${x[3]}</div></div></div>
 <div class="bkhint"><span style="color:var(--D)">10 гласных</span> · <span style="color:var(--S)">21 согласная</span> · ъ и ь — без звука</div></div>`;
}
// ---------- 3. Гласные буквы ----------
const ZV_VOWL={
 'а':['[а]','мал [ма'+ZV_ACC+'л]','пишется после твёрдого согласного; после ч и щ — тоже а: час [ч\'а'+ZV_ACC+'с]','без ударения после твёрдых — [а]: сады [сады'+ZV_ACC+']; после ч, щ — [и]: часы [ч\'ису'+ZV_ACC+']'],
 'я':['[а] + мягкость или [й\'а]','мял [м\'а'+ZV_ACC+'л]; яма [й\'а'+ZV_ACC+'ма], моя [май\'а'+ZV_ACC+'], семья','после согласного — [а] и мягкость; в начале слова, после гласной, после ъ и ь — два звука','без ударения после мягкого — [и]: пятак [п\'ита'+ZV_ACC+'к]'],
 'о':['[о]','нос [но'+ZV_ACC+'с]','после твёрдого согласного','без ударения — [а]: вода [вада'+ZV_ACC+'], окно [акно'+ZV_ACC+']'],
 'ё':['[о] + мягкость или [й\'о]','нёс [н\'о'+ZV_ACC+'с]; ёж [й\'о'+ZV_ACC+'ш], поёт','в корне простого слова всегда под ударением; после ж и ш — только [о], без мягкости: шёл [шо'+ZV_ACC+'л]','без ударения в русских словах не бывает: мёд — медовый'],
 'у':['[у]','лук [лу'+ZV_ACC+'к]','после твёрдого согласного; после ч и щ — тоже у: щука','без ударения тоже [у]: рука [рука'+ZV_ACC+']'],
 'ю':['[у] + мягкость или [й\'у]','люк [л\'у'+ZV_ACC+'к]; юг [й\'у'+ZV_ACC+'к], каюта, вьюга','после согласного — [у] и мягкость; в начале слова, после гласной, после ъ и ь — два звука','без ударения тоже [у]: юла [й\'ула'+ZV_ACC+']'],
 'э':['[э]','мэр [мэ'+ZV_ACC+'р], эхо','после твёрдого согласного, в начале слова и после гласной: поэт','—'],
 'е':['[э] + мягкость или [й\'э]','мел [м\'э'+ZV_ACC+'л]; ель [й\'э'+ZV_ACC+'л\']','после согласного — [э] и мягкость (кроме ж, ш, ц: жест [жэ'+ZV_ACC+'ст]); в начале слова, после гласной, после ъ и ь — два звука','без ударения после мягкого — [и]: лесной [л\'исно'+ZV_ACC+'й\']'],
 'ы':['[ы]','был [бы'+ZV_ACC+'л]','после твёрдого согласного','без ударения тоже [ы]: дыра [дыра'+ZV_ACC+']'],
 'и':['[и] + мягкость, [ы] или [й\'и]','бил [б\'и'+ZV_ACC+'л]; жир [жы'+ZV_ACC+'р]; соловьи [салав\'й\'и'+ZV_ACC+']','после согласного — [и] и мягкость; после ж, ш, ц — [ы]; после ь — два звука','без ударения тоже [и]: лиса [л\'иса'+ZV_ACC+']']
};
let zvoSel='я';
function zvVowHTML(){
 const x=ZV_VOWL[zvoSel],row=(k,v)=>`<div class="pf"><span>${k}</span><b>${v}</b></div>`;
 const btn=l=>`<button class="chipc" data-zvvow="${l}" aria-pressed="${l===zvoSel}" style="min-width:44px;font-size:18px">${l}</button>`;
 return `<div class="blab" data-lab="zvvow"><div class="cap"><b>Гласные буквы парами</b><span class="bkhint">нажать на букву</span></div>
 <div class="tblw"><table class="bktbl"><tbody><tr><td class="bkhint">после твёрдого</td>${['а','о','у','э','ы'].map(l=>`<td>${btn(l)}</td>`).join('')}</tr>
 <tr><td class="bkhint">после мягкого</td>${['я','ё','ю','е','и'].map(l=>`<td>${btn(l)}</td>`).join('')}</tr></tbody></table></div>
 <div class="st2"><span class="n2">${zvoSel}</span><div>${row('звук',x[0])}${row('пример',x[1])}${row('когда',x[2])}${row('без ударения',x[3])}</div></div></div>`;
}
// ---------- 4. Пары согласных ----------
const ZV_ZG=[['б','п','бочка — почка'],['в','ф','вата — фата'],['г','к','гора — кора'],['д','т','дом — том'],['ж','ш','жар — шар'],['з','с','коза — коса']];
const ZV_ZN={л:'звонкий непарный (сонорный): на конце слова не меняется — стол [сто'+ZV_ACC+'л]',м:'звонкий непарный (сонорный): дом [до'+ZV_ACC+'м]',н:'звонкий непарный (сонорный): сон [со'+ZV_ACC+'н]',р:'звонкий непарный (сонорный): сыр [сы'+ZV_ACC+'р]',й:'звонкий непарный (сонорный), всегда мягкий: край [кра'+ZV_ACC+'й\']',
 х:'глухой непарный: мох [мо'+ZV_ACC+'х]',ц:'глухой непарный, всегда твёрдый: цирк [цы'+ZV_ACC+'рк]',ч:'глухой непарный, всегда мягкий: час [ч\'а'+ZV_ACC+'с]',щ:'глухой непарный, всегда мягкий: щука [щ\'у'+ZV_ACC+'ка]'};
const ZV_TM={б:'был — бил',в:'вол — вёл',г:'гол — гиря',д:'дом — день',з:'зал — зима',к:'кот — кит',л:'лук — люк',м:'мал — мял',н:'нос — нёс',п:'пыл — пил',р:'рад — ряд',с:'сад — сито',т:'ток — тёк',ф:'фон — фен',х:'ход — хитрый'};
let zpMode='zg',zpSel='б';
function zvPairsHTML(){
 const b=(l,on)=>`<button class="wchip ${on?'on':''}" data-zvpr="${l}" style="min-width:42px;text-align:center;font-size:18px">${l}</button>`;
 let body='',info='';
 if(zpMode==='zg'){
  const pr=ZV_ZG.find(x=>x.includes(zpSel));
  body=`<div class="cols"><div><div class="colh">звонкие</div><div style="display:flex;flex-wrap:wrap;gap:4px">${ZV_ZG.map(x=>b(x[0],pr&&pr[0]===x[0])).join('')}</div><div class="bkhint">без пары:</div><div style="display:flex;flex-wrap:wrap;gap:4px">${'лмнрй'.split('').map(l=>b(l,l===zpSel)).join('')}</div></div>
  <div><div class="colh">глухие</div><div style="display:flex;flex-wrap:wrap;gap:4px">${ZV_ZG.map(x=>b(x[1],pr&&pr[1]===x[1])).join('')}</div><div class="bkhint">без пары:</div><div style="display:flex;flex-wrap:wrap;gap:4px">${'хцчщ'.split('').map(l=>b(l,l===zpSel)).join('')}</div></div></div>`;
  info=pr?`Пара [${pr[0]}] — [${pr[1]}]${'жш'.includes(pr[0])?' (оба всегда твёрдые)':` и мягкие [${pr[0]}'] — [${pr[1]}']`}. Различают слова: <b>${pr[2]}</b>. На конце слова и перед глухим [${pr[0]}] звучит как [${pr[1]}].`:'['+zpSel+(('йчщ').includes(zpSel)?"'":'')+'] — '+ZV_ZN[zpSel]+'.';
 }else{
  const tm=Object.keys(ZV_TM);
  body=`<div class="bkhint">твёрдый и мягкий — пары:</div><div style="display:flex;flex-wrap:wrap;gap:4px">${tm.map(l=>b(l,l===zpSel)).join('')}</div>
  <div class="cols"><div><div class="colh">всегда твёрдые</div><div style="display:flex;gap:4px">${'жшц'.split('').map(l=>b(l,l===zpSel)).join('')}</div></div><div><div class="colh">всегда мягкие</div><div style="display:flex;gap:4px">${'чщй'.split('').map(l=>b(l,l===zpSel)).join('')}</div></div></div>`;
  info=ZV_TM[zpSel]?`Пара [${zpSel}] — [${zpSel}']: <b>${ZV_TM[zpSel]}</b>. Мягкость показывают е, ё, ю, я, и или ь.`:'жшц'.includes(zpSel)?`[${zpSel}] всегда твёрдый — даже если после него и, е, ё или ь: ${{ж:'жир [жы'+ZV_ACC+'р], рожь [ро'+ZV_ACC+'ш]',ш:'шило [шы'+ZV_ACC+'ла], шёл [шо'+ZV_ACC+'л]',ц:'цирк [цы'+ZV_ACC+'рк], цифра'}[zpSel]}.`:`[${zpSel}'] всегда мягкий — даже если после него а, у, о: ${{ч:'час [ч\'а'+ZV_ACC+'с], чудо',щ:'щука [щ\'у'+ZV_ACC+'ка], роща',й:'йод [й\'о'+ZV_ACC+'т], край'}[zpSel]}.`;
 }
 return `<div class="blab" data-lab="zvpairs"><div class="cap"><b>Пары согласных</b><span class="bkhint">нажать на букву</span></div>
 <div class="seg" role="radiogroup"><button role="radio" data-zvpm="zg" aria-pressed="${zpMode==='zg'}">Звонкие — глухие</button><button role="radio" data-zvpm="tm" aria-pressed="${zpMode==='tm'}">Твёрдые — мягкие</button></div>
 ${body}<div class="st2"><span class="n2">${zpSel}</span><div>${info}</div></div></div>`;
}
// ---------- 5. Сколько звуков и букв ----------
const ZV_CNT=['ёж','ёлка','юла','яма','юг','язык','ещё','моя','каюта','поёт','день','конь','пальто','мышь','ночь','щука','чаща','жир','шёл','мяч','лёд','вьюга','объезд','объём','семья','друзья','ружьё','соловьи','дуб','просьба','кровь','морковь','честный','лесной','моряк'];
let zcW='ёлка',zcA=null;
let zcB=null;
function zvCountHTML(){
 const p=zvP(zcW),[nb,ns]=zvCnt(zcW);
 if(zcB==null)zcB=Math.max(1,ns-Math.floor(Math.random()*3));
 const opts=[zcB,zcB+1,zcB+2],ok=zcA!=null&&+zcA===ns;
 const notes=p.map((c,i)=>c.s.length===2?`<b>${c.l}</b> — два звука [${c.s.join('')}] (+1)`:!c.s.length?`<b>${c.l}</b> — без звука (−1)`:'').filter(Boolean);
 const zw=n=>n===1?'звук':n<5?'звука':'звуков',bw=n=>n<5?'буквы':'букв';
 return `<div class="blab" data-lab="zvcount"><div class="cap"><b>Сколько букв и звуков</b><span class="bkhint">сосчитать звуки, потом проверить</span></div>
 <div class="word" style="text-align:center;font-size:28px">${zcA!=null?p.map(c=>c.s.length===2?`<span style="background:color-mix(in srgb,var(--T) 22%,var(--cell));border-radius:6px">${c.l}</span>`:!c.s.length?`<span style="background:color-mix(in srgb,var(--l3) 40%,var(--cell));border-radius:6px">${c.l}</span>`:c.l).join(''):zcW}</div>
 <div class="bkhint" style="text-align:center">букв: ${nb} · сколько звуков?</div>
 <div class="seg" role="radiogroup">${opts.map(v=>`<button role="radio" data-zvca="${v}" aria-pressed="${String(zcA)===String(v)}">${v}</button>`).join('')}</div>
 ${zcA!=null?`<div class="result" style="background:color-mix(in srgb,var(${ok?'--T':'--red'}) 12%,var(--cell))"><div class="big" style="color:var(${ok?'--T':'--red'});font-size:20px">${ok?'Верно':'Неверно'}</div><div><div>${nb} ${bw(nb)}, ${ns} ${zw(ns)}: ${zvTr(zcW)} — ${nb>ns?'букв больше':ns>nb?'звуков больше':'поровну'}</div><div class="bkhint">${notes.join('; ')||'каждая буква — один звук'}</div></div></div>`:''}
 <div><button class="linkbtn" data-zvcnext>Другое слово</button></div></div>`;
}
// ---------- 6. Сильная и слабая позиция ----------
const ZV_POS=[
 ['дуб','дубы','[ду'+ZV_ACC+'п]','[дубы'+ZV_ACC+']','б','п','на конце слова'],['глаз','глаза','[гла'+ZV_ACC+'с]','[глаза'+ZV_ACC+']','з','с','на конце слова'],
 ['нож','ножи','[но'+ZV_ACC+'ш]','[нажы'+ZV_ACC+']','ж','ш','на конце слова'],['лёд','льда','[л\'о'+ZV_ACC+'т]','[л\'да'+ZV_ACC+']','д','т','на конце слова'],
 ['кровь','крови','[кро'+ZV_ACC+'ф\']','[кро'+ZV_ACC+'в\'и]','в','ф\'','на конце слова (мягкость сохраняется)'],
 ['лодка','лодочка','[ло'+ZV_ACC+'тка]','[ло'+ZV_ACC+'дач\'ка]','д','т','перед глухим [к]'],['сказка','сказать','[ска'+ZV_ACC+'ска]','[сказа'+ZV_ACC+'т\']','з','с','перед глухим [к]'],
 ['травка','трава','[тра'+ZV_ACC+'фка]','[трава'+ZV_ACC+']','в','ф','перед глухим [к]'],
 ['сбор','—','[збо'+ZV_ACC+'р]','','с','з','перед звонким [б] — озвончение','Буква с здесь — часть, которая во всех словах пишется одинаково: сбор, сбить, сделать (глава «Приставки»).'],['вокзал','—','[вагза'+ZV_ACC+'л]','','к','г','перед звонким [з] — озвончение','Проверить нельзя: такие слова запоминают по словарю.'],
 ['просьба','просить','[про'+ZV_ACC+'з\'ба]','[прас\'и'+ZV_ACC+'т\']','с','з\'','перед звонким [б] — озвончение'],['слон','—','[сло'+ZV_ACC+'н]','','с','с','перед [л] — не меняется: сильная позиция','Перед [л], [м], [н], [р], [й\'], [в] глухой не озвончается.']
];
let zpoSel=0;
function zvPosHTML(){
 const x=ZV_POS[zpoSel],ch=x[4]!==x[5].replace("'",'');
 return `<div class="blab" data-lab="zvpos"><div class="cap"><b>Сильная и слабая позиция</b><span class="bkhint">выбрать слово</span></div>
 <div class="chips">${ZV_POS.map((y,i)=>`<button class="chipc" data-zvpos="${i}" aria-pressed="${i===zpoSel}">${y[0]}</button>`).join('')}</div>
 <div class="cols"><div><div class="colh">${ch?'слабая позиция':'сильная позиция'}</div><div style="font-size:22px;text-align:center">${x[0].replace(x[4],`<b class="m">${x[4]}</b>`)}</div><div style="text-align:center;font-size:18px">${x[2]}</div><div class="bkhint" style="text-align:center">буква «${x[4]}» — звук [${x[5]}]: ${x[6]}</div></div>
 <div><div class="colh">${x[1]==='—'?'проверка':'сильная позиция'}</div>${x[1]==='—'?`<div class="bkhint" style="text-align:center;padding-top:10px">${x[7]}</div>`:`<div style="font-size:22px;text-align:center">${x[1]}</div><div style="text-align:center;font-size:18px">${x[3]}</div><div class="bkhint" style="text-align:center">после согласного — гласный: звук слышен ясно</div>`}</div></div></div>`;
}
// ---------- 7. Фонетический разбор по шагам ----------
const ZV_RZ=[['ёлка','ёл-ка'],['моряк','мо-ряк'],['день','день'],['юла','ю-ла'],['вьюга','вью-га'],['мяч','мяч'],['щука','щу-ка'],['жир','жир'],['юг','юг'],['пятак','пя-так'],['пьеса','пье-са'],['кровь','кровь']];
let zrSel=0,zrStep=1,zrPick={},zrChk=false;
function zvRzRight(s){if(zvKind(s)==='v')return {u:s.includes(ZV_ACC)?'уд.':'безуд.'};const c=zvCons(s);return {z:c.includes('зв.')?'зв.':'глух.',t:c.includes('тв.')?'тв.':'мягк.'}}
function zvRazborHTML(){
 const [w,sl]=ZV_RZ[zrSel],p=zvP(w),[nb,ns]=zvCnt(w),all=p.flatMap(c=>c.s),vs=all.filter(s=>zvKind(s)==='v'),ui=vs.findIndex(s=>s.includes(ZV_ACC))+1;
 const sw=n=>n===1?'слог':n<5?'слога':'слогов';
 const step1=`<b>${w[0].toUpperCase()+w.slice(1)}</b> — ${vs.length>1?sl+', ':''}${vs.length} ${sw(vs.length)}${vs.length>1?', ударный '+ui+'-й':', ударный'}.`;
 const rec=p.map(c=>c.s.length?c.s.map((s,j)=>`${j?'&nbsp;&nbsp;&nbsp;&nbsp;':c.l+' — '}[${zvSnd(s)}] — ${zvChar(s)}`).join(';<br>'):`${c.l} — [—]`).join(';<br>');
 // шаг 3: сначала ученик сам выбирает признаки каждого звука, потом проверка
 let k=-1;const rows=all.map(s=>{k++;const R=zvRzRight(s),grp=Object.keys(R).map(f=>{const vals=f==='u'?['уд.','безуд.']:f==='z'?['зв.','глух.']:['тв.','мягк.'],cur=zrPick[k+':'+f];
   return `<span class="seg" style="display:inline-flex;margin:2px">${vals.map(v=>{const st=zrChk?(v===R[f]?'border:2px solid var(--T)':cur===v?'border:2px solid var(--red)':''):'';return `<button data-zvrzp="${k}:${f}:${v}" aria-pressed="${cur===v}" style="${st}" ${zrChk?'disabled':''}>${v}</button>`}).join('')}</span>`}).join('');
   return `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:4px"><span style="min-width:40px;font-size:18px">[${zvSnd(s)}]</span>${grp}</div>`}).join('');
 const nOk=zrChk?all.reduce((n,s,i)=>{const R=zvRzRight(s);return n+Object.keys(R).every(f=>zrPick[i+':'+f]===R[f])},0):0;
 const step3=zrChk?`<div class="bkhint">Верно: ${nOk} из ${all.length} звуков. Полная запись:</div>${rec}`:`<div class="bkhint">Отметить признаки каждого звука и нажать «Проверить».</div>${rows}<div><button class="linkbtn" data-zvrzchk>Проверить</button></div>`;
 const why=[];p.forEach(c=>{if(c.s.length===2)why.push(`буква ${c.l} обозначает два звука`);if(!c.s.length)why.push(`буква ${c.l} звука не обозначает`)});
 const step4=`${nb} ${nb>4?'букв':'буквы'}, ${ns} ${ns>4?'звуков':'звука'}${why.length?': '+why.join(', '):''}.`;
 const steps=[['Слоги и ударение',step1],['Транскрипция',zvTr(w)],['Звуки по порядку',step3],['Сколько букв и звуков',step4]];
 const canNext=zrStep<4&&!(zrStep===3&&!zrChk);
 return `<div class="blab" data-lab="zvrazbor"><div class="cap"><b>Разбор по шагам</b><span class="bkhint">сначала ответить самому, потом открыть шаг</span></div>
 <div class="chips">${ZV_RZ.map((y,i)=>`<button class="chipc" data-zvrz="${i}" aria-pressed="${i===zrSel}">${y[0]}</button>`).join('')}</div>
 ${steps.slice(0,zrStep).map((s,i)=>`<div class="st2 ok"><span class="n2">${i+1}</span><div><div class="bkhint">${s[0]}</div><div>${s[1]}</div></div></div>`).join('')}
 <div>${canNext?`<button class="linkbtn" data-zvrznext>Открыть шаг ${zrStep+1}: ${steps[zrStep][0].toLowerCase()}</button>`:zrStep===4?`<button class="linkbtn" data-zvrzreset>Скрыть шаги</button>`:''}</div></div>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.zvtape!==undefined){ztW=d.zvtape;ztC=null;relab('zvtape')}
 if(d.zvcol!==undefined){ztC=ztC===+d.zvcol?null:+d.zvcol;relab('zvtape')}
 if(d.zvabc!==undefined){zaSel=+d.zvabc;relab('zvalpha')}
 if(d.zvvow!==undefined){zvoSel=d.zvvow;relab('zvvow')}
 if(d.zvpm!==undefined){zpMode=d.zvpm;zpSel=zpMode==='zg'?'б':'л';relab('zvpairs')}
 if(d.zvpr!==undefined){zpSel=d.zvpr;relab('zvpairs')}
 if(d.zvca!==undefined){zcA=d.zvca;relab('zvcount')}
 if(d.zvcnext!==undefined){const r=ZV_CNT.filter(w=>w!==zcW);zcW=r[Math.floor(Math.random()*r.length)];zcA=null;zcB=null;relab('zvcount')}
 if(d.zvpos!==undefined){zpoSel=+d.zvpos;relab('zvpos')}
 if(d.zvrz!==undefined){zrSel=+d.zvrz;zrStep=1;zrPick={};zrChk=false;relab('zvrazbor')}
 if(d.zvrzp!==undefined){const [k,f,v]=d.zvrzp.split(':');zrPick[k+':'+f]=v;relab('zvrazbor')}
 if(d.zvrzchk!==undefined){zrChk=true;relab('zvrazbor')}
 if(d.zvrznext!==undefined){zrStep=Math.min(4,zrStep+1);relab('zvrazbor')}
 if(d.zvrzreset!==undefined){zrStep=1;zrPick={};zrChk=false;relab('zvrazbor')}
});
Object.assign(LABS,{zvtape:zvTapeHTML,zvalpha:zvAlphaHTML,zvvow:zvVowHTML,zvpairs:zvPairsHTML,zvcount:zvCountHTML,zvpos:zvPosHTML,zvrazbor:zvRazborHTML});
