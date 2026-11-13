// ---------- схемы главы «Морфемика» ----------
// Все имена — с префиксом sc/SC_, обработчики — по своим data-* атрибутам (data-scp…, data-scq…, data-sce…, data-sck…, data-sca…, data-scb…, data-scs…, data-scl…, data-scr…, data-scg…).
// Запись разбора (как в уроке 6): приставка «при-», корень «город», суффикс «-н», формообразующий суффикс «-л*», окончание «[ый]» («[ø]» — нулевое), соединительная гласная «~о~», постфикс «+ся».
const SC_COL={п:'--S',к:'--T',с:'--V',ф:'--V',о:'--M',х:'--S',г:'--tint-text'};
const SC_NAME={п:'приставка',к:'корень',с:'суффикс',ф:'формообразующий суффикс',о:'окончание',х:'постфикс',г:'соединительная гласная'};
const scTok=s=>s.split(' ').filter(Boolean).map(t=>t[0]==='['?{k:'о',t:t.slice(1,-1)}:t[0]==='~'?{k:'г',t:t.slice(1,-1)}:t[0]==='+'?{k:'х',t:t.slice(1)}:(t[0]==='-'&&t.endsWith('*'))?{k:'ф',t:t.slice(1,-1)}:t[0]==='-'?{k:'с',t:t.slice(1)}:t.endsWith('-')?{k:'п',t:t.slice(0,-1)}:{k:'к',t:t});
const scWord=T=>T.map(x=>x.t==='ø'?'':x.t).join('');
const scNote=T=>T.map(x=>x.k==='п'?x.t+'-':x.k==='с'?'-'+x.t+'-':x.k==='ф'?'-'+x.t+'*':x.k==='о'?'('+x.t+')':x.k==='г'?'<'+x.t+'>':x.k==='х'?'+'+x.t:x.t).join(' ');
const scSeg=(T,only)=>T.map((x,i)=>{
 if(x.t==='ø')return (only==null||only===i)?`<span class="scseg" style="border:2px solid var(${SC_COL.о});border-radius:5px;padding:0 5px;margin-left:3px;font-size:.8em;color:var(--l2)">ø</span>`:'';
 const on=only==null||only===i,c=SC_COL[x.k];
 const st=x.k==='о'?`border:2px solid var(${c});border-radius:5px;padding:0 2px`:x.k==='к'?`border-bottom:3px solid var(${c})`:`border-bottom:3px ${x.k==='п'||x.k==='х'?'dotted':x.k==='г'?'double':'dashed'} var(${c})`;
 return `<span class="scseg" style="${on?st+';font-weight:700':'color:var(--l2)'};padding:0 1px;margin:0 1px">${x.t}</span>`}).join('');
const scOk=(ok,t)=>`<div class="result"${ok?'':' style="background:color-mix(in srgb,var(--red) 10%,var(--cell))"'}><div class="big" style="color:var(${ok?'--T':'--red'})">${ok?'✓':'✗'}</div><div>${t}</div></div>`;
const scBtn=(label,attrs,state)=>`<button class="opt${state==='on'?' on':''}" ${attrs} ${state==='off'?'disabled':''}>${label}</button>`;
const scChips=(arr,cur,attr,lab)=>`<div class="chips" role="group" aria-label="${lab}">${arr.map((x,i)=>`<button class="chipc" ${attr}="${i}" aria-pressed="${i===cur}">${x}</button>`).join('')}</div>`;
const scLegend=`<div class="bkhint" style="margin-top:6px">Значки: приставка — пунктир сверху вниз, корень — сплошная линия, суффикс — штрих, окончание — рамка, соединительная гласная — двойная линия.</div>`;

// ---------- урок 1: «Какая это часть слова?» ----------
const SC_PARTS=[
 ['под- снеж -ник [ø]',0,'Стоит перед корнем: под-снежник. Если убрать, останется снежник — другое слово.'],
 ['под- снеж -ник [ø]',1,'Общая часть слов снег, снежный, снежок: корень.'],
 ['под- снеж -ник [ø]',2,'Стоит после корня: -ник- образует название: подснежник, лесник.'],
 ['лес -н [ой]',2,'Между корнем лес и окончанием: -н- (лесной ← лес).'],
 ['лес -н [ой]',3,'Меняется: лесной, лесного, лесному. Это окончание.'],
 ['пере- ход [ø]',0,'Перед корнем, как в словах перелёт, перепись.'],
 ['пере- ход [ø]',2,'Нулевое окончание: переход, перехода, переходу.'],
 ['рек [а]',0,'Корень: общая часть слов речка, речной (рек/реч).'],
 ['рек [а]',1,'Меняется: река, реки, реке. Это окончание.'],
 ['книж -к [а]',1,'После корня книж-: слово образовано от книга. Это суффикс -к-.'],
 ['бес- шум -н [ый]',0,'Стоит перед корнем: бес-шумный (бесшумный — без шума).'],
 ['бес- шум -н [ый]',2,'Между корнем шум и окончанием: шум-н-ый. Это суффикс.'],
 ['сад [ø]',1,'Нулевое окончание: сад, сада, саду. Меняется, но на конце ничего не видно.'],
 ['сам ~о~ лёт [ø]',1,'Гласная между двумя корнями — соединительная, не корень.']
];
let scP={i:0,a:null};
function scpartsHTML(){
 const [w,idx,why]=SC_PARTS[scP.i],T=scTok(w),k=T[idx].k,ans={п:0,к:1,с:2,о:3,г:4}[k],done=scP.a!=null;
 const opts=['приставка','корень','суффикс','окончание'].concat(k==='г'?['соединительная гласная']:[]);
 return `<div class="blab" data-lab="scparts"><div class="cap"><b>Какая это часть слова?</b><span class="bkhint">часть выделена, назвать её</span></div>
 ${scChips(SC_PARTS.map((x,i)=>scWord(scTok(x[0]))+' · '+(i+1)),scP.i,'data-scpi','Слова')}
 <div style="text-align:center;font-size:28px;padding:12px 0">${scSeg(T,idx)}</div>
 <div class="opts" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">${opts.map((v,j)=>scBtn(v,`data-scpa="${j}"`,scP.a===j?'on':(done?'off':''))).join('')}</div>
 ${done?scOk(scP.a===ans,`${scP.a===ans?'Верно.':'Неверно.'} ${why}<div class="bkhint">Запись: ${scNote(T)}</div>`):''}
 <div><button class="linkbtn" data-scpn>Следующее задание</button></div>${scLegend}</div>`;
}

// ---------- урок 2: «Форма слова или другое слово?» ----------
const SC_PAIR=[
 ['стол','стола','форма','Те же слова в другой форме: меняется только окончание (стол-[ø], стол-а).'],
 ['стол','столик','слово','Суффикс -ик образует новое слово с новым значением.'],
 ['лес','лесной','слово','Новое слово: другой признак, другое окончание и суффикс -н-.'],
 ['лес','лесом','форма','Окончание -ом: та же форма слова.'],
 ['читать','читал','форма','-ть и -л- — формообразующие суффиксы: одно слово в разных формах.'],
 ['читать','читатель','слово','Другое слово: называет того, кто читает.'],
 ['писать','переписать','слово','Приставка пере- образует новое слово.'],
 ['красный','красного','форма','Окончания -ый, -ого: одна и та же форма изменяемого слова.'],
 ['красный','краснота','слово','Суффикс -от- образует новое слово: «красный цвет».'],
 ['река','реку','форма','Окончания -а, -у: одно слово.'],
 ['река','речка','слово','Суффикс -к- и чередование к // ч: новое слово.'],
 ['дом','дома','форма','Нулевое окончание и -а: одно слово.'],
 ['дом','домой','слово','Другое слово с другим значением (направление).'],
 ['бежал','бежала','форма','Окончания [ø] и -а: разные формы одного слова.'],
 ['бежать','убежать','слово','Приставка у- образует новое слово.'],
 ['сад','садовник','слово','Суффикс -ник: тот, кто работает в саду.']
];
let scQ={i:0,a:null};
function scpairHTML(){
 const [a,b,ans,why]=SC_PAIR[scQ.i],done=scQ.a!=null;
 return `<div class="blab" data-lab="scpair"><div class="cap"><b>Форма слова или другое слово?</b><span class="bkhint">сравнить два слова</span></div>
 ${scChips(SC_PAIR.map(x=>x[0]+' – '+x[1]),scQ.i,'data-scqi','Пары')}
 <div style="text-align:center;font-size:26px;padding:12px 0"><b>${a}</b> — <b>${b}</b></div>
 <div class="opts" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">${scBtn('форма того же слова','data-scqa="форма"',scQ.a==='форма'?'on':(done?'off':''))}${scBtn('другое (однокоренное) слово','data-scqa="слово"',scQ.a==='слово'?'on':(done?'off':''))}</div>
 ${done?scOk(scQ.a===ans,`${scQ.a===ans?'Верно.':'Неверно.'} ${why}`):''}
 <div><button class="linkbtn" data-scqn>Следующая пара</button></div></div>`;
}

// ---------- урок 2: «Найти окончание: изменить слово» ----------
const SC_END=[
 ['лесной',['лесной','лесного','лесному','о лесном'],['-ой','-н','-ной'],0,'Меняется -ой, -ого, -ому, -ом. Окончание -ой.'],
 ['река',['река','реки','реке','реку'],['-а','-ка','-ек'],0,'Меняется последняя буква: рек-а, рек-и, рек-е. Окончание -а.'],
 ['стол',['стол','стола','столу','столом'],['нулевое','-л','-ол'],0,'Слово меняется, а в начальной форме на конце ничего: нулевое окончание.'],
 ['красивый',['красивый','красивого','красивому','красивым'],['-ый','-вый','-ивый'],0,'Меняется -ый, -ого, -ому, -ым. Окончание -ый.'],
 ['окно',['окно','окна','окну','окном'],['-о','-но','-кно'],0,'Меняется последняя буква: окн-о, окн-а, окн-у. Окончание -о.'],
 ['читаю',['читаю','читаешь','читает','читаем'],['-ю','-аю','-у'],0,'Меняется -ю, -ешь, -ет, -ем. Окончание -ю; -а- — суффикс.'],
 ['вчера',null,['нет окончания','-а','-ра'],0,'Слово не изменяется: окончания нет, вся основа — вчера.'],
 ['пальто',null,['нет окончания','-о','-то'],0,'Слово не изменяется: пальто, у пальто, в пальто. Окончания нет.'],
 ['очень',null,['нет окончания','-нь','-ень'],0,'Слово не изменяется: окончания нет.'],
 ['мамин',['мамин','мамина','маминого','мамину'],['нулевое','-н','-ин'],0,'Мамин-[ø]: окончание нулевое (мамина, маминого).'],
 ['читал',['читал','читала','читали'],['нулевое','-л','-ал'],0,'Читал-[ø]: нулевое окончание, -л- — формообразующий суффикс (читала, читали).'],
 ['мяч',['мяч','мяча','мячу','мячом'],['нулевое','-ч','-яч'],0,'Нулевое окончание: мяч-[ø], мяч-а, мяч-у.']
];
let scE={i:0,s:null,a:null};
function scendHTML(){
 const [w,forms,opts,,why]=SC_END[scE.i],inv=!forms;
 const sh0=opts.map((o,j)=>[o,j]),r=scE.i%sh0.length,shown=sh0.slice(r).concat(sh0.slice(0,r));
 let h=`<div class="blab" data-lab="scend"><div class="cap"><b>Найти окончание</b><span class="bkhint">изменить слово и посмотреть, что меняется</span></div>
 ${scChips(SC_END.map(x=>x[0]),scE.i,'data-scei','Слова')}
 <div style="text-align:center;font-size:28px;padding:8px 0"><b>${w}</b></div>
 <div class="st2${scE.s!=null?' ok':''}"><span class="n2">1</span><div style="flex:1">Слово изменяется?<div style="display:flex;gap:8px;margin-top:6px">${scBtn('да','data-sces="1"',scE.s===1?'on':(scE.s!=null&&(scE.s===1)===!inv?'off':''))}${scBtn('нет','data-sces="0"',scE.s===0?'on':(scE.s!=null&&(scE.s===1)===!inv?'off':''))}</div></div></div>`;
 if(scE.s!=null){
  const okS=(scE.s===1)===!inv;
  h+=okS?'':`<div class="bkhint" style="color:var(--red)">Не так. ${inv?'Слово не изменяется: нельзя сказать иначе.':'Слово изменяется: '+forms.join(', ')+'.'}</div>`;
  if(okS&&!inv)h+=`<div class="bkhint" style="margin:6px 0">Формы: ${forms.map(f=>`<b>${f}</b>`).join(', ')}</div>`;
  if(okS)h+=`<div class="st2${scE.a!=null?' ok':''}"><span class="n2">2</span><div style="flex:1">${inv?'Какое окончание у слова?':'Что меняется — какое окончание?'}<div class="opts" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">${shown.map(([o,j])=>scBtn(o,`data-scea="${j}"`,scE.a===j?'on':(scE.a!=null?'off':''))).join('')}</div></div></div>`;
 }
 if(scE.a!=null)h+=scOk(scE.a===0,`${scE.a===0?'Верно.':'Неверно.'} ${why}`);
 return h+`<div><button class="linkbtn" data-scen>Следующее слово</button></div></div>`;
}

// ---------- урок 3: «Однокоренные слова: найти все» ----------
const SC_KOR=[
 ['вода',['водный','водитель','подводный','наводнение','водить','водица'],[0,2,3,5],'вод','Вода — водный — подводный — наводнение — водица: значение «вода». Водитель и водить — другой корень (вести).'],
 ['гора',['горка','горький','горный','горе','пригорок','гористый'],[0,2,4,5],'гор','Гора — горка — горный — пригорок — гористый. Горький и горе — другой корень.'],
 ['нос',['носик','носить','носовой','носильщик','переносица','носатый'],[0,2,4,5],'нос','Нос — носик — носовой — переносица — носатый. Носить, носильщик — другой корень (нести).'],
 ['лес',['лесной','лесник','лесть','перелесок','лесистый','подлесок'],[0,1,3,4,5],'лес','Лес — лесной — лесник — перелесок — лесистый — подлесок. Лесть (похвала) — другой корень.'],
 ['добрый',['доброта','добыча','добряк','добавить','добродушие','добрейший'],[0,2,4,5],'добр','Добрый — доброта — добряк — добродушие — добрейший. Добыча (добыть) и добавить (добавить) — другие корни.'],
 ['рука',['ручка','рукав','ручей','ручной','рукопись','руководить'],[0,1,3,4,5],'рук/руч','Рука — ручка — рукав — ручной — рукопись — руководить: корень рук/руч. Ручей — другой корень (течёт).'],
 ['шум',['шумный','шуметь','шумок','шумиха','шутка','шуршать'],[0,1,2,3],'шум','Шум — шумный — шуметь — шумок — шумиха. Шутка и шуршать — другие корни.']
];
let scK={i:0,sel:[],chk:false};
function sckorHTML(){
 const [w,cands,good,root,why]=SC_KOR[scK.i];
 const ok=scK.chk&&scK.sel.length===good.length&&good.every(g=>scK.sel.includes(g));
 return `<div class="blab" data-lab="sckor"><div class="cap"><b>Найти однокоренные слова</b><span class="bkhint">отметить все слова с тем же корнем</span></div>
 ${scChips(SC_KOR.map(x=>x[0]),scK.i,'data-scki','Слова')}
 <div style="text-align:center;font-size:26px;padding:8px 0">Слово: <b>${w}</b></div>
 <div class="chips" role="group" aria-label="Варианты">${cands.map((x,j)=>{const on=scK.sel.includes(j),good1=scK.chk&&good.includes(j),bad=scK.chk&&on&&!good.includes(j);return `<button class="chipc" data-sckc="${j}" aria-pressed="${on}" ${scK.chk?'disabled':''} style="${scK.chk?(good1?'border-color:var(--T);color:var(--T)':(bad?'border-color:var(--red);color:var(--red)':'')):''}">${x}</button>`}).join('')}</div>
 <div style="display:flex;gap:8px;margin-top:8px"><button class="opt" data-sckok ${scK.chk?'disabled':''}>Проверить</button></div>
 ${scK.chk?scOk(ok,`${ok?'Верно.':'Не совсем.'} Корень: <b>${root}</b>. ${why}`):''}
 <div><button class="linkbtn" data-sckn>Следующее слово</button></div></div>`;
}

// ---------- урок 3: «Чередование и беглые гласные» ----------
const SC_ALT=[
 ['рука','ручка','к // ч','Рук-а — руч-ка: чередуются к и ч.'],
 ['друг','дружба','г // ж','Друг — друж-ба: чередуются г и ж.'],
 ['слух','слушать','х // ш','Слух — слуш-ать: чередуются х и ш.'],
 ['свет','свеча','т // ч','Свет — све-ча: чередуются т и ч.'],
 ['носить','ношу','с // ш','Носить — ношу: чередуются с и ш.'],
 ['возить','вожу','з // ж','Возить — вожу: чередуются з и ж.'],
 ['любить','люблю','б // бл','Любить — люблю: к основе добавляется л.'],
 ['ловить','ловлю','в // вл','Ловить — ловлю: к основе добавляется л.'],
 ['купить','куплю','п // пл','Купить — куплю: к основе добавляется л.'],
 ['сон','сна','беглый гласный','Сон — сна: гласный о «убегает».'],
 ['день','дня','беглый гласный','День — дня: гласный е «убегает».'],
 ['лёд','льда','беглый гласный','Лёд — льда: гласный ё «убегает».'],
 ['беру','сбор','е // о','Беру — сбор: чередуются е и о.'],
 ['ходить','хожу','д // ж','Ходить — хожу: чередуются д и ж.']
];
const SC_ALTS=['к // ч','г // ж','х // ш','т // ч','с // ш','з // ж','б // бл','в // вл','п // пл','д // ж','е // о','беглый гласный'];
let scA={i:0,a:null};
function scaltHTML(){
 const [a,b,ans,why]=SC_ALT[scA.i],done=scA.a!=null;
 const opts=[ans,...SC_ALTS.filter(x=>x!==ans).slice((scA.i*3)%8,(scA.i*3)%8+3)].sort((x,y)=>(x+scA.i).length*3%7-(y+scA.i).length*3%7||x.localeCompare(y));
 return `<div class="blab" data-lab="scalt"><div class="cap"><b>Корень меняется — что произошло?</b><span class="bkhint">назвать чередование</span></div>
 ${scChips(SC_ALT.map(x=>x[0]+' – '+x[1]),scA.i,'data-scai','Пары')}
 <div style="text-align:center;font-size:26px;padding:12px 0"><b>${a}</b> — <b>${b}</b></div>
 <div class="opts" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">${opts.map(v=>scBtn(v,`data-scaa="${v}"`,scA.a===v?'on':(done?'off':''))).join('')}</div>
 ${done?scOk(scA.a===ans,`${scA.a===ans?'Верно.':'Неверно.'} ${why}`):''}
 <div><button class="linkbtn" data-scan>Следующая пара</button></div></div>`;
}

// ---------- урок 4: «Собрать слово из частей» ----------
const SC_BUILD=[
 ['Цветок, который появляется из-под снега','под- снеж -ник [ø]',['ник','под','снеж']],
 ['Тот, кто работает в лесу','лес -ник [ø]',['ник','лес']],
 ['Детёныш лисы','лис -ёнок [ø]',['лис','ёнок']],
 ['Тот, кто играет на гитаре','гитар -ист [ø]',['ист','гитар']],
 ['Свойство того, кто смел','смел -ость [ø]',['ость','смел']],
 ['Относящийся к морю','мор -ск [ой]',['ой','мор','ск']],
 ['Ласково о бабушке','баб -ушк [а]',['ушк','баб','а']],
 ['Ушёл на другую сторону, перебежал','пере- беж -а -л* [ø]',['л','а','беж','пере']],
 ['Такой, в котором нет звука','без- звуч -н [ый]',['ый','звуч','без','н']],
 ['Маленький стол','стол -ик [ø]',['ик','стол']]
];
let scB={i:0,got:[]};
function scbuildHTML(){
 const [m,w,pcs]=SC_BUILD[scB.i],T=scTok(w),want=T.filter(x=>x.t!=='ø').map(x=>x.t),got=scB.got.map(g=>pcs[+g.slice(1)]),full=got.length===want.length,okw=full&&got.join('')===want.join('');
 return `<div class="blab" data-lab="scbuild"><div class="cap"><b>Собрать слово из частей</b><span class="bkhint">нажимать части по порядку</span></div>
 ${scChips(SC_BUILD.map((x,i)=>(i+1)+''),scB.i,'data-scbi','Задания')}
 <div style="text-align:center;padding:8px 0"><i>${m}</i></div>
 <div style="text-align:center;font-size:28px;min-height:44px;padding:6px 0;border-bottom:1px solid var(--sep)">${got.join('')||'<span class="bkhint">…</span>'}</div>
 <div class="opts" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px">${pcs.map((p,j)=>scBtn(p,`data-scbp="${j}"`,scB.got.includes('#'+j)?'off':'')).join('')}</div>
 ${full?scOk(okw,okw?`Слово <b>${scWord(T)}</b>. Разбор: ${scNote(T)}`:`Получилось «${got.join('')}». Нужно: ${scNote(T)} = <b>${scWord(T)}</b>.`):''}
 <div><button class="linkbtn" data-scbr>Сначала</button> <button class="linkbtn" data-scbn>Следующее</button></div></div>`;
}

// ---------- урок 5: «О или е между корнями?» ----------
const SC_SOED=[
 ['пар','воз','о','Пар кончается на твёрдый р: пар-о-воз.'],
 ['земл','коп','е','Земл- кончается на мягкую л: земл-е-коп.'],
 ['лист','пад','о','Лист кончается на твёрдый т: лист-о-пад.'],
 ['птиц','лов','е','Птиц- кончается на ц: птиц-е-лов.'],
 ['сам','лёт','о','Сам кончается на твёрдый м: сам-о-лёт.'],
 ['пеш','ход','е','Пеш- кончается на шипящий ш: пеш-е-ход.'],
 ['вод','пад','о','Вод кончается на твёрдый д: вод-о-пад.'],
 ['стал','вар','е','Стал- (сталь) — мягкая л: стал-е-вар.'],
 ['солнц','пёк','е','Солнц- кончается на ц: солнц-е-пёк.'],
 ['лес','руб','о','Лес кончается на твёрдый с: лес-о-руб.'],
 ['звер','лов','о','Звер- кончается на твёрдый р: звер-о-лов.'],
 ['пыл','сос','е','Пыль — мягкая л: пыл-е-сос.'],
 ['дров','сек','о','Дров кончается на твёрдый в: дров-о-сек.'],
 ['рыб','лов','о','Рыб кончается на твёрдый б: рыб-о-лов.']
];
let scS={i:0,a:null};
function scsoedHTML(){
 const [a,b,ans,why]=SC_SOED[scS.i],done=scS.a!=null;
 return `<div class="blab" data-lab="scsoed"><div class="cap"><b>О или е между корнями?</b><span class="bkhint">выбрать соединительную гласную</span></div>
 ${scChips(SC_SOED.map(x=>x[0]+'…'+x[1]),scS.i,'data-scsi','Слова')}
 <div style="text-align:center;font-size:28px;padding:12px 0">${a}<span class="slot" style="${done?'':'display:inline-block;min-width:22px'}">${done?`<b class="m" style="color:var(--tint-text)">${ans}</b>`:'…'}</span>${b}</div>
 <div class="opts" style="display:flex;gap:8px;justify-content:center">${['о','е'].map(v=>scBtn(v,`data-scsa="${v}"`,scS.a===v?'on':(done?'off':''))).join('')}</div>
 ${done?scOk(scS.a===ans,`${scS.a===ans?'Верно.':'Неверно.'} ${why}`):''}
 <div><button class="linkbtn" data-scsn>Следующее слово</button></div></div>`;
}

// ---------- урок 5: «Сколько корней?» ----------
const SC_SLOZH=[
 ['сад [ø]',1],['сам ~о~ лёт [ø]',2],['лес -ник [ø]',1],['вод ~о~ пад [ø]',2],['пальто',1],['мяс ~о~ руб -к [а]',2],
 ['зим -н [ий]',1],['птиц ~е~ лов [ø]',2],['раз- вед -чик [ø]',1],['быстр ~о~ ход -н [ый]',2],['пар ~о~ воз [ø]',2],['тих [ий]',1]
];
let scL={i:0,a:null};
function scslozhHTML(){
 const [w,n]=SC_SLOZH[scL.i],T=scTok(w),done=scL.a!=null;
 return `<div class="blab" data-lab="scslozh"><div class="cap"><b>Сколько корней в слове?</b><span class="bkhint">простое слово или сложное</span></div>
 ${scChips(SC_SLOZH.map(x=>scWord(scTok(x[0]))),scL.i,'data-scli','Слова')}
 <div style="text-align:center;font-size:28px;padding:12px 0"><b>${scWord(T)}</b></div>
 <div class="opts" style="display:flex;gap:8px;justify-content:center">${[1,2].map(v=>scBtn(v===1?'один корень':'два корня',`data-scla="${v}"`,scL.a===v?'on':(done?'off':''))).join('')}</div>
 ${done?scOk(scL.a===n,`${scL.a===n?'Верно.':'Неверно.'} ${n===1?'Простое слово.':'Сложное слово.'} Разбор: <span class="ex">${scNote(T)}</span><div style="font-size:24px;padding:6px 0">${scSeg(T)}</div>`):''}
 <div><button class="linkbtn" data-scln>Следующее слово</button></div>${scLegend}</div>`;
}

// ---------- урок 6: «Разбор по составу — шаг за шагом» ----------
const SC_RAZ_T=['при- город -н [ый]','под- снеж -ник [ø]','без- облач -н [ый]','рас- сказ -чик [ø]','бел -оват [ый]','за- щит -ник [ø]','мор -ск [ой]','на- езд -ник [ø]','под- вод -н [ый]'].map(scTok);
let scR={i:0,st:0,bad:null};
function scrazSteps(T){
 const w=scWord(T),end=T.find(x=>x.k==='о'),endT=end&&end.t!=='ø'?end.t:null,
  pre=T.filter(x=>x.k==='п').map(x=>x.t+'-'),suf=T.filter(x=>x.k==='с').map(x=>'-'+x.t+'-'),root=T.find(x=>x.k==='к').t,
  base=scWord(T.filter(x=>x.k!=='о')),sx=T.filter(x=>x.k==='с').map(x=>x.t).join('');
 return [
  {q:'Изменить слово. Какое у него окончание?',o:endT?[endT,'нулевое окончание',endT.length>1?endT.slice(1):w.slice(-2)]:['нулевое окончание',w.slice(-1),'окончания нет'],
   ok:endT?`Окончание — ${endT}: слово изменяется (${w}, ${base+(endT==='ый'?'ого':endT==='ой'?'ого':'а')}…).`:'Окончание нулевое: слово изменяется (есть другие формы), а на конце ничего нет.'},
  {q:'Какая основа?',o:[base,base.slice(0,-1),base.slice(1)],ok:`Основа — слово без окончания: ${base}-.`},
  {q:'Есть ли приставка?',o:pre.length?[pre.join(' '),'приставки нет',w.slice(0,1)+'-']:['приставки нет',w.slice(0,2)+'-',w.slice(0,3)+'-'],
   ok:pre.length?`Приставка — ${pre.join(' ')}: слово без неё остаётся словом, значение другое.`:'Приставки нет: в начале слова сразу корень.'},
  {q:'Какой суффикс?',o:sx?['-'+sx+'-','суффикса нет','-'+root.slice(-1)+sx+'-']:['суффикса нет','-'+w.slice(-2)+'-','-'+w.slice(-1)+'-'],
   ok:sx?`Суффикс -${sx}-: он стоит между корнем и окончанием; слово образовано от более простого слова.`:'Суффикса нет: между корнем и окончанием ничего нет.'},
  {q:'Какой корень?',o:[root,root+sx,(pre[0]||'').replace('-','')+root+'я'].map((x,j)=>j===2&&!pre.length?root.slice(0,-1):x),ok:`Корень — ${root}: общая часть однокоренных слов.`}
 ];
}
function scrazbor_rot(a,k){const r=k%a.length;return a.map((x,j)=>[x,j]).slice(r).concat(a.map((x,j)=>[x,j]).slice(0,r))}
function scrazHTML(){
 const T=SC_RAZ_T[scR.i],S=scrazSteps(T),st=scR.st;
 let h=`<div class="blab" data-lab="scrazbor"><div class="cap"><b>Разбор слова по составу</b><span class="bkhint">пять шагов по плану</span></div>
 ${scChips(SC_RAZ_T.map(t=>scWord(t)),scR.i,'data-scri','Слова')}
 <div style="text-align:center;font-size:28px;padding:8px 0"><b>${scWord(T)}</b></div>`;
 S.forEach((s,k)=>{
  if(k>st)return;
  const done=k<st;
  h+=`<div class="st2${done?' ok':''}"><span class="n2">${k+1}</span><div style="flex:1">${s.q}<div class="opts" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">${scrazbor_rot(s.o,k+scR.i).map(([o,j])=>scBtn(o,`data-scrp="${j}"`,done?(j===0?'on':'off'):(scR.bad===j?'off':''))).join('')}</div>${done?`<div class="bkhint" style="margin-top:6px">${s.ok}</div>`:(scR.bad!=null?'<div class="bkhint" style="margin-top:6px;color:var(--red)">Не так. Сравнить слово с другими словами и попробовать ещё раз.</div>':'')}</div></div>`;
 });
 if(st>=S.length)h+=scOk(true,`Разбор готов: <b>${scNote(T)}</b><div style="font-size:26px;padding:6px 0">${scSeg(T)}</div>`);
 return h+`<div><button class="linkbtn" data-scrr>Начать сначала</button></div>${scLegend}</div>`;
}

// ---------- урок 6: схема-алгоритм ----------
const SC_TREE={
 start:{q:'Что стоит в конце слова? (Изменить слово.)',o:[['Слово не изменяется: вчера, пальто, очень','r_none'],['Слово изменяется, окончание видно: лесной, реки','r_end'],['Слово изменяется, но на конце ничего: стол, читал','r_zero'],['На конце -ть, -ти, -л: читать, нести, читал','r_form']]},
 r_none:{t:'Окончания нет. Вся форма — основа: вчера, пальто.',n:'osn'},
 r_end:{t:'Окончание — то, что меняется: лесн-ой, лесн-ого. Основа — слово без него: лесн-.',n:'osn'},
 r_zero:{t:'Нулевое окончание [ø]: стол-[ø], стол-а. Основа — всё слово: стол-.',n:'osn'},
 r_form:{t:'-ть, -ти, -л- (читать, нести, читал) — формообразующие суффиксы: отделить от основы: чита-ть, чита-л. Окончание — нулевое или есть (читала: -а).',n:'osn'},
 osn:{q:'Теперь основа. Можно ли «снять» часть и получить слово?',o:[['Да: снимается начало (выбежать → бежать)','r_pref'],['Да: снимается конец (лесной → лес)','r_suf'],['Да: снимаются части с обеих сторон (пригородный → пригород → город)','r_both'],['Нет: частей нет (сад, вчера, пальто)','r_root']]},
 r_pref:{t:'Приставка — то, что «отпало» спереди: вы-бежать, при-морье. Корень — то, что осталось после снятия остальных частей; проверить однокоренными словами.'},
 r_suf:{t:'Суффикс — часть между корнем и окончанием: лес-н-ой, смел-ость. Корень — лес, смел: подобрать однокоренные слова.'},
 r_both:{t:'Снимать по порядку, начиная с последней части: пригородн-ый → пригород (суффикс -н-) → город (приставка при-). Корень — город.'},
 r_root:{t:'Основа нечленимая: она состоит из одного корня. Записать: сад [ø] или вчера. Проверить, нет ли слова, от которого оно образовано.'}
};
let scG=['start'];
function scalgHTML(){
 let h='<div class="blab" data-lab="scalg"><div class="cap"><b>Схема: как разобрать слово по составу</b><span class="bkhint">выбирать ответ на каждом шаге</span></div><div class="tree">';
 scG.forEach((id,k)=>{const n=SC_TREE[id];
  if(!n.q){h+=`<div class="result"><div class="big" style="font-size:16px;min-width:72px">${n.n?'вывод':'итог'}</div><div>${n.t}</div></div>`;return}
  const next=scG[k+1];
  h+=`<div class="step"><div class="q">${n.q}</div><div class="opts">`+n.o.map(o=>`<button class="opt${next===o[1]?' on':''}" data-scgo="${o[1]}" data-scgk="${k}" ${next&&next!==o[1]?'disabled':''}>${o[0]}</button>`).join('')+'</div></div>';
 });
 return h+'</div><div class="bkhint" style="margin-top:6px">Последний шаг — сложить части: получилось исходное слово? У каждой части есть значение?</div><div><button class="linkbtn" data-scgr>Начать сначала</button></div></div>';
}

document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.scpi!==undefined){scP={i:+d.scpi,a:null};relab('scparts');return}
 if(d.scpa!==undefined){if(scP.a==null){scP.a=+d.scpa;relab('scparts')}return}
 if(d.scpn!==undefined){scP={i:(scP.i+1)%SC_PARTS.length,a:null};relab('scparts');return}
 if(d.scqi!==undefined){scQ={i:+d.scqi,a:null};relab('scpair');return}
 if(d.scqa!==undefined){if(scQ.a==null){scQ.a=d.scqa;relab('scpair')}return}
 if(d.scqn!==undefined){scQ={i:(scQ.i+1)%SC_PAIR.length,a:null};relab('scpair');return}
 if(d.scei!==undefined){scE={i:+d.scei,s:null,a:null};relab('scend');return}
 if(d.sces!==undefined){const f=SC_END[scE.i][1];if(scE.s==null||(scE.s===1)!==!!f){scE.s=+d.sces;relab('scend')}return}
 if(d.scea!==undefined){if(scE.a==null){scE.a=+d.scea;relab('scend')}return}
 if(d.scen!==undefined){scE={i:(scE.i+1)%SC_END.length,s:null,a:null};relab('scend');return}
 if(d.scki!==undefined){scK={i:+d.scki,sel:[],chk:false};relab('sckor');return}
 if(d.sckc!==undefined){if(!scK.chk){const j=+d.sckc,p=scK.sel.indexOf(j);if(p<0)scK.sel.push(j);else scK.sel.splice(p,1);relab('sckor')}return}
 if(d.sckok!==undefined){scK.chk=true;relab('sckor');return}
 if(d.sckn!==undefined){scK={i:(scK.i+1)%SC_KOR.length,sel:[],chk:false};relab('sckor');return}
 if(d.scai!==undefined){scA={i:+d.scai,a:null};relab('scalt');return}
 if(d.scaa!==undefined){if(scA.a==null){scA.a=d.scaa;relab('scalt')}return}
 if(d.scan!==undefined){scA={i:(scA.i+1)%SC_ALT.length,a:null};relab('scalt');return}
 if(d.scbi!==undefined){scB={i:+d.scbi,got:[]};relab('scbuild');return}
 if(d.scbp!==undefined){const w=SC_BUILD[scB.i],n=scTok(w[1]).filter(x=>x.t!=='ø').length;if(scB.got.length<n&&!scB.got.includes('#'+d.scbp)){scB.got.push('#'+d.scbp);relab('scbuild')}return}
 if(d.scbr!==undefined){scB.got=[];relab('scbuild');return}
 if(d.scbn!==undefined){scB={i:(scB.i+1)%SC_BUILD.length,got:[]};relab('scbuild');return}
 if(d.scsi!==undefined){scS={i:+d.scsi,a:null};relab('scsoed');return}
 if(d.scsa!==undefined){if(scS.a==null){scS.a=d.scsa;relab('scsoed')}return}
 if(d.scsn!==undefined){scS={i:(scS.i+1)%SC_SOED.length,a:null};relab('scsoed');return}
 if(d.scli!==undefined){scL={i:+d.scli,a:null};relab('scslozh');return}
 if(d.scla!==undefined){if(scL.a==null){scL.a=+d.scla;relab('scslozh')}return}
 if(d.scln!==undefined){scL={i:(scL.i+1)%SC_SLOZH.length,a:null};relab('scslozh');return}
 if(d.scri!==undefined){scR={i:+d.scri,st:0,bad:null};relab('scrazbor');return}
 if(d.scrp!==undefined){const S=scrazSteps(SC_RAZ_T[scR.i]);if(scR.st<S.length){if(+d.scrp===0){scR.st++;scR.bad=null}else scR.bad=+d.scrp;relab('scrazbor')}return}
 if(d.scrr!==undefined){scR={i:scR.i,st:0,bad:null};relab('scrazbor');return}
 if(d.scgo!==undefined){scG=scG.slice(0,+d.scgk+1);scG.push(d.scgo);while(SC_TREE[scG[scG.length-1]].n)scG.push(SC_TREE[scG[scG.length-1]].n);relab('scalg');return}
 if(d.scgr!==undefined){scG=['start'];relab('scalg');return}
});
Object.assign(LABS,{scparts:scpartsHTML,scpair:scpairHTML,scend:scendHTML,sckor:sckorHTML,scalt:scaltHTML,scbuild:scbuildHTML,scsoed:scsoedHTML,scslozh:scslozhHTML,scrazbor:scrazHTML,scalg:scalgHTML});
