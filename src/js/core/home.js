// ---------- главная (#home) и кабинет «Мои результаты» (#me) ----------
// Главная — про действие: «Продолжить», «Учебник», заданное, что повторить; цифры — вторым планом, время — последним.
// Расчёты — в stats.js. Клики — по data-h*, data-me*, data-bk, data-wipe (свой обработчик внизу файла).
const HI={
 chev:'<svg class="hch" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
 user:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4"/></svg>',
 ok:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'};
const chNum=m=>`${m.part.n}.${m.part.ch.indexOf(m)+1}`;
const initials=()=>{const p=S.prof||{};return ((p.name||'').trim().charAt(0)+(p.sur||'').trim().charAt(0)).toUpperCase()};
const avaHTML=cls=>{const i=initials();return `<span class="${cls}${i?'':' no'}" aria-hidden="true">${i?esc(i):HI.user}</span>`};
function greet(){const h=new Date().getHours(),n=((S.prof||{}).name||'').trim();
 const g=h>=5&&h<12?'Доброе утро':h>=12&&h<18?'Добрый день':h>=18&&h<23?'Добрый вечер':'Здравствуй';
 return n?`${g}, ${esc(n)}!`:g+'!'}
const dateLine=()=>{try{return new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})}catch(e){return ''}};

// где остановился: {c,meta,tab,l,L} или null (новый ученик)
function homeCont(){
 let ch=null,tab='theory',l=0;
 if(S.at&&CHAPTERS[S.at.ch]){ch=S.at.ch;tab=S.at.tab;l=+S.at.l||0}
 else if(S.last&&LES[S.last]){ch=LES[S.last].ch}
 if(!ch)return null;
 const c=CHAPTERS[ch];if(!chTabs(c).some(x=>x[0]===tab))tab='theory';
 if(tab==='theory'&&S.last&&LES[S.last]&&LES[S.last].ch===ch)l=LES[S.last].n;
 if(!c.lessons[l-1])l=0;
 return {c,meta:chById(ch),tab,l,L:l?c.lessons[l-1]:null};
}
const firstCh=()=>ALLCH.find(m=>CHAPTERS[m.id]);
const CONT_GO={theory:'Читать дальше',train:'Открыть тренажёр',classic:'К упражнениям',tests:'К тестам'};
const CONT_TAB={theory:'теория',train:'тренажёр',classic:'упражнения в тетрадь',tests:'тесты'};
function contHTML(){
 const k=homeCont();
 if(!k){const m=firstCh();if(!m)return '';const c=CHAPTERS[m.id];
  return `<button class="hmcont" style="--pc:${m.part.c}" data-hcont><span class="hmk">С чего начать</span><span class="hmnum" aria-hidden="true">${chNum(m)}</span>
  <span class="t">${m.t}</span><span class="s">Урок 1 из ${c.lessons.length}. ${c.lessons[0].t}</span>
  <span class="hmcta">Начать с первой главы${HI.chev}</span></button>
  <p class="hmnote">Можно начать и с любой другой темы — она найдётся в учебнике или через поиск.</p>`}
 const {c,meta,tab,l,L}=k,v=L?lessonLevel(L.id):null;
 return `<button class="hmcont" style="--pc:${meta.part.c}" data-hcont><span class="hmk">Продолжить</span><span class="hmnum" aria-hidden="true">${chNum(meta)}</span>
 <span class="t">${meta.t}</span><span class="s">${L?`Урок ${l} из ${c.lessons.length}. ${L.t}`:`Вся глава · ${c.lessons.length} ${plural(c.lessons.length,'урок','урока','уроков')}`}</span>
 <span class="hmwhere">${modeIco(tab,16)}<span>${CONT_TAB[tab]}</span>${v&&v.lv>1?`<span class="hmdot"></span>${stepsHTML(v.lv)}<span>${v.word}</span>`:''}</span>
 <span class="hmcta">${CONT_GO[tab]}${HI.chev}</span></button>`;
}
function homeHTML(){
 const ready=ALLCH.filter(m=>CHAPTERS[m.id]),nles=ready.reduce((s,m)=>s+CHAPTERS[m.id].lessons.length,0);
 const hasName=!!((S.prof||{}).name||'').trim(),dl=dateLine();
 let h=`<div class="wrap hm"><header class="hmtop"><div class="hmhi"><h1>${greet()}</h1><div class="sub">${dl}${hasName?'':`${dl?'<span class="hmdot"></span>':''}<button class="linkbtn" data-hgo="me" data-hname>Указать имя</button>`}</div></div>
 <button class="hmava" data-hgo="me" aria-label="Мои результаты и профиль" title="Мои результаты">${avaHTML('ava')}</button></header>
 <div class="hmgrid"><div class="hmcol">${contHTML()}
 <section class="hmbook" aria-label="Учебник">
  <button class="hmbig" data-hgo="toc">${ico('book',26)}<span class="b"><b>Учебник</b><small>Содержание: ${ready.length} ${plural(ready.length,'глава','главы','глав')}, ${nles} ${plural(nles,'урок','урока','уроков')}</small></span>${HI.chev}</button>
  <input class="bsearch" id="q" type="search" placeholder="Найти тему, урок, термин или слово" autocomplete="off" aria-label="Поиск по учебнику">
  <div class="sres" id="sres"></div>
  <div class="hmref" role="group" aria-label="Словари и термины">
   <button data-view="gloss">${ico('gloss',20)}<b>Термины</b><small>${GL.length} ${plural(GL.length,'термин','термина','терминов')}</small></button>
   <button data-view="dict">${ico('dict',20)}<b>Словарь</b><small>${ALLW.length} ${plural(ALLW.length,'слово','слова','слов')}</small></button>
   <button data-view="cards">${ico('cards',20)}<b>Карточки</b><small>${Object.keys(DECKS).length} ${plural(Object.keys(DECKS).length,'колода','колоды','колод')}</small></button></div>
 </section>`;
 // заданное недавно
 const rec=recentList();
 if(rec.length)h+=`<section class="hmsec"><h2 class="hmh">Заданное недавно</h2><div class="hmlist">${rec.map(x=>{const m=chById(x.ch),list=clParse(CHAPTERS[x.ch],String(x.r).replace(/,/g,', '));if(!list.length)return '';
  const dn=list.filter(n=>S.done['cl-'+x.ch+'-'+n]).length;
  return `<button class="hmrow" data-hex="${x.ch}:${x.r}"><span class="b"><b>${m.t}, ${list.length>1?'упражнения':'упражнение'} ${clFmt(list)}</b><small>${list.length>1?`отмечено сделанными: ${dn} из ${list.length}`:dn?'отмечено сделанным':'в тетрадь'}</small></span><span class="hmact">Открыть</span></button>`}).join('')}</div></section>`;
 h+=`</div><div class="hmcol">`;
 // стоит повторить
 const weak=weakLessons(3);
 if(weak.length)h+=`<section class="hmsec"><h2 class="hmh">Стоит повторить</h2><div class="hmlist">${weak.map(w=>{const L=LES[w.id],m=chById(L.ch);
  const why=w.g===ST.WEAK_G?'тест пока не сдан':`${w.bad} ${plural(w.bad,'ошибка','ошибки','ошибок')} в последних ${w.of} ответах`;
  return `<button class="hmrow" data-hrep="${w.id}"><span class="b"><b>${m.t}, урок ${L.n}</b><small>${L.t} · ${why}</small></span><span class="hmact">Повторить</span></button>`}).join('')}</div></section>`;
 // не доведено до конца
 const unf=unfinished(3);
 if(unf.length)h+=`<section class="hmsec"><h2 class="hmh">Не доведено до конца</h2><div class="hmlist">${unf.map(u=>{const m=chById(u.c.id);
  return `<button class="hmrow" data-hun="${u.c.id}"><span class="b"><b>${m.t}</b><small>осталось: ${leftText(u.left)}</small></span><span class="hmact">К тестам</span></button>`}).join('')}</div></section>`;
 // моя неделя
 const wk=weekDays(0),wt=wk.reduce((s,x)=>s+x.sec,0);
 h+=`<section class="hmsec hmbox hmweek"><h2 class="hmh">Моя неделя</h2>
 <div class="hmdays" role="img" aria-label="Дни занятий на этой неделе: ${wk.filter(x=>x.on).map(x=>x.wd).join(', ')||'пока нет'}">${wk.map(x=>`<span class="hmday${x.on?' on':''}${x.today?' td':''}${x.fut?' fut':''}" title="${x.wd}: ${x.sec?fmtDur(x.sec):'—'}"><i>${x.on?HI.ok:''}</i><small>${x.wd}</small></span>`).join('')}</div>
 <p class="hmtime"><span class="a">${wt?`<b>${fmtDur(wt)}</b> за неделю`:'Дни занятий отметятся здесь сами.'}</span><span>время — не оценка</span></p></section>`;
 // освоено
 const any=PARTS.some(p=>{const g=partProgress(p);return g.conf||g.fam});
 h+=`<section class="hmsec hmbox"><div class="hmhr"><h2 class="hmh">Освоено</h2><button class="linkbtn hmmore" data-hgo="me">Подробнее</button></div>
 ${any?'':'<p class="hmnote">Урок попадёт сюда, когда тест по нему будет написан на 4 или 5.</p>'}
 <div class="hmparts">${PARTS.map(p=>{const g=partProgress(p);
  return `<div class="hmpart${g.n?'':' soon'}" style="--pc:${p.c}"><div class="r"><b>${p.t}</b><span>${g.n?`уроков освоено: ${g.conf} из ${g.n}`:'раздел готовится'}</span></div>
  ${g.n?`<div class="hmbar" aria-hidden="true"><i style="width:${g.conf/g.n*100}%"></i><i class="f" style="width:${g.fam/g.n*100}%"></i></div>`:''}</div>`}).join('')}</div></section>`;
 return h+'</div></div></div>';
}

// ---------- кабинет ----------
let ME={edit:false,bk:'',pv:null,err:'',wipe:0};
const fmtAt=at=>{if(!at)return 'дата не указана';try{return new Date(at).toLocaleString('ru-RU',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}};
const dShort=d=>{try{return d.toLocaleDateString('ru-RU',{day:'numeric',month:'short'}).replace('.','')}catch(e){return ''}};
function meProfHTML(){
 const p=S.prof||{},full=profName();
 if(ME.edit||!full)return `<section class="mec meprof"><form class="mepf" data-meform>
  <h2 class="hmh">${full?'Профиль':'Как тебя зовут?'}</h2>
  ${full?'':'<p class="hmnote">Имя появится на главной и в копии данных. Оно хранится только на этом устройстве.</p>'}
  <div class="mef"><label>Имя<input name="name" value="${esc(p.name||'')}" maxlength="40" autocomplete="off" autocapitalize="words" enterkeyhint="next"></label>
  <label>Фамилия<input name="sur" value="${esc(p.sur||'')}" maxlength="40" autocomplete="off" autocapitalize="words" enterkeyhint="next"></label>
  <label class="cl">Класс<input name="cls" value="${esc(p.cls||'')}" maxlength="8" autocomplete="off" placeholder="7 Б" enterkeyhint="done"></label></div>
  <div class="mebtns"><button type="submit" class="bkldone">Сохранить</button>${full?'<button type="button" class="ghost" data-meedit="0">Отмена</button>':''}</div></form></section>`;
 return `<section class="mec meprof"><div class="mepv">${avaHTML('ava big')}<div class="b"><div class="nm">${esc(full)}</div><div class="sub">${p.cls?esc(p.cls)+' класс':'класс не указан'}</div></div>
  <button class="ghost mesm" data-meedit="1">Изменить</button></div></section>`;
}
function meTopicsHTML(){
 const chs=ALLCH.filter(m=>CHAPTERS[m.id]),st=chs.filter(m=>chStarted(CHAPTERS[m.id])),rest=chs.filter(m=>!st.includes(m));
 let h=`<section class="mesec"><h2 class="hmh">Мои темы</h2>`;
 if(!st.length)h+=`<div class="mec meempty"><p>Здесь появятся темы, которыми ты занимаешься: ступень по каждому уроку и оценки за тесты.</p><button class="bkldone" data-hgo="toc">Открыть учебник</button></div>`;
 else h+=`<p class="hmnote melegend">${stepsHTML(1)} начато <span class="hmdot"></span> ${stepsHTML(2)} знакомо: в тренажёре не меньше ${ST.FAM_N} ответов, большинство верных <span class="hmdot"></span> ${stepsHTML(3)} уверенно: тест по уроку на 4 или 5. Глава освоена, когда сданы все её тесты.</p>`;
 st.forEach(m=>{const c=CHAPTERS[m.id],fin=chTestsDone(c),all=tAll(c),pass=all.filter(k=>tPassed(c,k)).length,fr=c.tests?tRes(c,'final'):null;
  h+=`<article class="mec mech" style="--pc:${m.part.c}"><header><span class="cn">${chNum(m)}</span><b>${m.t}</b><span class="st${fin?' ok':''}">${fin?'освоена':c.tests?`тестов сдано: ${pass} из ${all.length}`:''}</span></header>
  <ol class="mel">${c.lessons.map((l,i)=>{const v=lessonLevel(l.id);
   return `<li><button class="merow${v.weak?' weak':''}" data-ojump2="${l.id}" aria-label="Урок ${i+1}. ${esc(l.t)}: ${v.word}${v.g?', тест: '+v.g:''}${v.weak?', стоит повторить':''}"><span class="ln">${i+1}</span><span class="lb"><span class="lt">${l.t}</span>
   <span class="ls">${stepsHTML(v.lv)}<span>${v.word}</span>${c.tests?`<span class="hmdot"></span><span>${v.g?'тест: <b>'+v.g+'</b>':'тест не написан'}</span>`:''}${v.weak?'<span class="mewk">стоит повторить</span>':''}</span></span></button></li>`}).join('')}</ol>
  ${c.tests?`<button class="mefin" data-hun="${m.id}"><span>Итоговый тест: ${fr?`<b>${fr.last}</b>`:'не написан'}</span><span class="hmact">${fin?'Тесты':'К тестам'}</span></button>`:''}</article>`});
 if(st.length&&rest.length)h+=`<div class="menew"><span class="hmnote">Ещё не начато</span><div class="chips">${rest.map(m=>`<button class="chipc sm" data-ch="${m.id}">${m.t}</button>`).join('')}</div></div>`;
 return h+'</section>';
}
function meTimeHTML(){
 const W=[0,1,2,3].map(o=>weekDays(o)),mx=Math.max(1,...W.flat().map(x=>x.sec)),tot=W.flat().reduce((s,x)=>s+x.sec,0);
 return `<section class="mesec"><h2 class="hmh">Время</h2><div class="mec metime">
 ${tot?W.map((w,o)=>{const s=w.reduce((a,x)=>a+x.sec,0);
  return `<div class="mewk4"><span class="wl">${o===0?'эта неделя':o===1?'прошлая':dShort(w[0].d)+' – '+dShort(w[6].d)}</span>
  <span class="wb" role="img" aria-label="${fmtDur(s)}">${w.map(x=>`<i class="${x.sec?'':'z'}${x.today?' td':''}" title="${x.wd}, ${dShort(x.d)}: ${x.sec?fmtDur(x.sec):'—'}"><u style="height:${x.sec?Math.max(8,Math.round(x.sec/mx*100)):0}%"></u></i>`).join('')}</span>
  <span class="wt">${s?fmtDur(s):'—'}</span></div>`}).join('')+`<div class="mewd" aria-hidden="true"><span></span><span class="wb">${WD.map(d=>`<i>${d}</i>`).join('')}</span><span></span></div>`
  :'<p class="hmnote">Здесь будет видно, сколько времени ушло на занятия за последние четыре недели.</p>'}
 <p class="hmnote">Считается только время, когда ты что-то делаешь: читаешь, отвечаешь, листаешь. Перерыв дольше пяти минут не идёт в счёт. Время — не оценка.</p></div></section>`;
}
function meNoteHTML(){
 const rows=ALLCH.map(m=>[m,CHAPTERS[m.id]]).filter(([m,c])=>c&&c.classic&&clDoneN(c)),tot=rows.reduce((s,[m,c])=>s+clDoneN(c),0);
 return `<section class="mesec"><h2 class="hmh">Упражнения в тетрадь</h2><div class="mec menote">
 <p class="menb"><b>${tot}</b><span>отмечено сделанными<small>по твоим отметкам — проверяет их учитель</small></span></p>
 ${rows.length?`<div class="menl">${rows.map(([m,c])=>`<button data-ch="${m.id}" data-tabto="classic"><span>${m.t}</span><span>${clDoneN(c)} из ${c.classic.length}</span></button>`).join('')}</div>`:''}</div></section>`;
}
function meDataHTML(){
 const pv=ME.pv;
 let h=`<section class="mesec" id="medata"><h2 class="hmh">Мои данные</h2><div class="mec medata">
 <p class="hmnote">Всё, что ты сделал в учебнике, хранится только на этом устройстве. Копия нужна, чтобы перенести результаты на другой телефон или компьютер — и на всякий случай.</p>
 <div class="mebtns"><button class="bkldone" data-bk="save">Сохранить копию</button><button class="ghost" data-bk="load">Загрузить копию</button></div>
 <input type="file" id="bkfile" accept=".json,application/json,text/plain" hidden>
 <div class="melinks"><button class="linkbtn" data-bk="text" aria-expanded="${ME.bk==='text'}">Показать как текст</button><button class="linkbtn" data-bk="paste" aria-expanded="${ME.bk==='paste'}">Вставить текст копии</button></div>`;
 if(ME.bk==='text')h+=`<div class="mebox"><p class="hmnote">Если файл не сохраняется, скопируй этот текст целиком и отправь себе — например, в сообщении.</p>
  <textarea id="bkout" readonly rows="5" aria-label="Текст копии">${esc(bkText())}</textarea><div class="mebtns"><button class="ghost" data-bk="copy">Скопировать</button><button class="ghost" data-bk="close">Скрыть</button></div></div>`;
 if(ME.bk==='paste')h+=`<div class="mebox"><p class="hmnote">Вставь сюда текст копии целиком.</p>
  <textarea id="bkin" rows="5" aria-label="Текст копии" placeholder='{"app":"rus-uchebnik", …}' autocomplete="off" autocapitalize="off" spellcheck="false"></textarea><div class="mebtns"><button class="ghost" data-bk="check">Проверить копию</button><button class="ghost" data-bk="close">Отмена</button></div></div>`;
 if(ME.err)h+=`<p class="meerr" role="alert">${esc(ME.err)}</p>`;
 if(pv)h+=`<div class="mebox mepvw" id="bkpv" role="group" aria-label="Копия данных"><b>${pv.by?esc(pv.by):'Копия без имени'}</b>
  <p>Сохранена: ${fmtAt(pv.at)}.<br>В ней: ${pv.sum.lessons} ${plural(pv.sum.lessons,'начатый урок','начатых урока','начатых уроков')}, ${pv.sum.tests} ${plural(pv.sum.tests,'сданный тест','сданных теста','сданных тестов')}, время занятий — ${fmtDur(pv.sum.time)}.</p>
  <p class="hmnote">Данные на этом устройстве будут заменены данными из копии.</p>
  <div class="mebtns"><button class="bkldone" data-bk="apply">Заменить мои данные</button><button class="ghost" data-bk="cancel">Отмена</button></div></div>`;
 h+=`<div class="mewipe">${ME.wipe===0?'<button class="linkbtn mered" data-wipe="1">Стереть все данные</button>'
  :ME.wipe===1?`<div class="mebox"><b>Стереть все данные на этом устройстве?</b><p class="hmnote">Пропадут пройденные уроки, оценки за тесты, карточки, время и профиль. Если копии нет — лучше сначала её сохранить.</p>
   <div class="mebtns"><button class="ghost" data-wipe="0">Не стирать</button><button class="ghost mered" data-wipe="2">Да, стереть</button></div></div>`
  :`<div class="mebox"><b>Точно стереть? Вернуть данные будет нельзя.</b>
   <div class="mebtns"><button class="ghost" data-wipe="0">Не стирать</button><button class="bkldone mered2" data-wipe="3">Стереть навсегда</button></div></div>`}</div>`;
 return h+'</div></section>';
}
function meHTML(){
 return `<div class="bkhbar"><div class="in"><button class="back" data-hgo="home">‹ Главная</button><span class="tools"><button class="ibtn" data-hgo="toc">${ico('book',18)}Учебник</button></span></div></div>
 <div class="wrap me"><header class="chhead"><div style="display:flex;flex-direction:column;gap:2px;min-width:0"><h2>Мои результаты</h2><div class="sub">Что уже получается и к чему стоит вернуться.</div></div></header>
 <div class="megrid"><div class="mecol">${meProfHTML()}${meTopicsHTML()}</div><div class="mecol">${meTimeHTML()}${meNoteHTML()}${meDataHTML()}</div></div></div>`;
}
function meRe(focus){const y=window.scrollY;render();window.scrollTo(0,y);if(focus){const el=document.querySelector(focus);if(el){el.focus({preventScroll:true});el.scrollIntoView({block:'nearest'})}}}
function meBind(){
 const f=document.getElementById('bkfile');if(!f)return;
 f.addEventListener('change',()=>{const file=f.files&&f.files[0];if(!file)return;
  if(file.size>5e6){ME.pv=null;ME.err='Файл слишком большой — это не копия данных учебника.';meRe();return}
  const rd=new FileReader();rd.onload=()=>bkPreview(String(rd.result||''));rd.onerror=()=>{ME.err='Не удалось прочитать файл.';meRe()};rd.readAsText(file)});
}
function bkPreview(text){const r=bkRead(text);ME.pv=r.ok?r:null;ME.err=r.ok?'':r.err;if(r.ok)ME.bk='';meRe(r.ok?'#bkpv [data-bk="apply"]':null)}
function bkDownload(){
 const text=bkText(),name=bkName();
 try{const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.style.display='none';document.body.append(a);a.click();
  setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},1500);toast('Копия сохранена: '+name)}
 catch(e){ME.bk='text';ME.err='Файл сохранить не получилось. Ниже — та же копия текстом.';meRe('#bkout')}
}
function bkCopy(){
 const ta=document.getElementById('bkout');if(!ta)return;const done=()=>toast('Скопировано');
 const old=()=>{ta.focus();ta.select();try{document.execCommand('copy')?done():toast('Выделено — осталось скопировать')}catch(e){toast('Выделено — осталось скопировать')}};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(ta.value).then(done,old);else old();
}
// переходы с главной
function goTrainLes(chId,n){const c=CHAPTERS[chId];route={v:'ch',id:chId};CLR=null;
 if(!nvHas(c,'train',n)){openLesson(c.lessons[n-1].id);return}
 S.tab='train';trSync();TR.les=[n];TR.run=null;save();go({v:'ch',id:chId,l:c.lessons[n-1].id})}
function goCont(){
 const k=homeCont();
 if(!k){const m=firstCh();if(m)openLesson(CHAPTERS[m.id].lessons[0].id);return}
 const {c,tab,l,L}=k;
 if(tab==='theory'){if(L)openLesson(L.id);else{S.tab='theory';save();go({v:'ch',id:c.id})}return}
 if(tab==='train'&&l){goTrainLes(c.id,l);return}
 route={v:'ch',id:c.id};CLR=null;S.tab=tab;
 if(tab==='train'){trSync();if(!TR.run)TR.les=c.lessons.map((_,i)=>i+1)}
 if(tab==='classic'){CLF=l;CLU=false;CLO=false}
 if(tab==='tests')TSV=TS&&TS.ch===c.id&&!TS.res?'run':'list';
 save();go({v:'ch',id:c.id,l:L?L.id:undefined});
}
document.addEventListener('submit',e=>{const f=e.target;if(!f.matches('[data-meform]'))return;e.preventDefault();
 S.prof={name:f.name.value.trim().slice(0,40),sur:f.sur.value.trim().slice(0,40),cls:f.cls.value.trim().replace(/\s*класс$/i,'').slice(0,8)};
 ME.edit=false;save();meRe();if(profName())toast('Сохранено')});
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.hgo){if(d.hgo==='me'){ME={edit:'hname' in d,bk:'',pv:null,err:'',wipe:0}}
  if(d.hgo==='toc'){S.view='book';save()}
  go({v:d.hgo});if('hname' in d){const i=document.querySelector('[data-meform] input');if(i)i.focus()}return}
 if('hcont' in d){goCont();return}
 if(d.hrep){const L=LES[d.hrep];if(L)goTrainLes(L.ch,L.n);return}
 if(d.hex){const [id,r]=d.hex.split(':'),c=CHAPTERS[id];if(!c)return;const list=clParse(c,r.replace(/,/g,', '));route={v:'ch',id};CLR=list.length?list:null;S.tab='classic';save();go({v:'ch',id});return}
 if(d.hun){const c=CHAPTERS[d.hun];if(!c)return;route={v:'ch',id:c.id};CLR=null;S.tab=c.tests?'tests':'theory';TSV=TS&&TS.ch===c.id&&!TS.res?'run':'list';save();go({v:'ch',id:c.id});return}
 if(d.meedit!==undefined){ME.edit=d.meedit==='1';meRe(ME.edit?'[data-meform] input':null);return}
 if(d.bk){const k=d.bk;ME.err='';
  if(k==='save'){bkDownload();return}
  if(k==='load'){const f=document.getElementById('bkfile');if(f){f.value='';f.click()}return}
  if(k==='text'||k==='paste'){ME.bk=ME.bk===k?'':k;ME.pv=null;meRe(ME.bk==='text'?'#bkout':ME.bk==='paste'?'#bkin':null);return}
  if(k==='close'){ME.bk='';meRe();return}
  if(k==='copy'){bkCopy();return}
  if(k==='check'){const t=document.getElementById('bkin');bkPreview(t?t.value:'');return}
  if(k==='cancel'){ME.pv=null;meRe();return}
  if(k==='apply'){if(!ME.pv)return;bkApply(ME.pv.data);ME={edit:false,bk:'',pv:null,err:'',wipe:0};go({v:'home'});toast('Данные из копии загружены');return}
  return}
 if(d.wipe!==undefined){const k=+d.wipe;
  if(k===3){wipeAll();ME={edit:false,bk:'',pv:null,err:'',wipe:0};go({v:'home'});toast('Все данные стёрты');return}
  ME.wipe=k;meRe(k?'.mewipe .mebox [data-wipe="0"]':null);return}
});
