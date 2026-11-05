// Глава «Слог и перенос»: подключение. Порядок файлов в сборке: lessons → bank → classic → labs → tests → index.
Object.assign(SL,{bank:SL_BANK,classic:SL_CLASSIC,lnames:SL_LNAMES,bookref:SL_BOOKREF});
CHAPTERS.slog=SL;

// ---------- механики тренажёра главы: ученик сам расставляет чёрточки переноса и границы слогов ----------
// Слова — только без приставок и частей сложного слова; деление на слоги — только бесспорное (урок 2).
const SL_MW={
 3:['малина','колесо','улица','юбилей','огурец','герой','майка','сарайчик','вьюнок','объём','семена','олень','отец','обед','одеяло','аромат','ураган','пирожок','черепаха','ягуар','утюг','кабина','бойкий','шейка','платье','статья','ружьё','купол'],
 4:['сестрица','кукла','тыква','барсук','варежка','морковка','кирпич','кассета','ванночка','кристалл','металл','бассейн','тоннель','деньги','больница','восьмой','огоньки','тюльпан','сельдерей','галька','весьма','грамматика','аппетит','шахматы','кустарник','ласточка'],
 5:['маяк','район','майор','яма','акула','пеликан','заяц','боец','ухаб','июнь','кольцо','пальто','листочек','ястребок','гнёздышко','магазин','фойе','поэт']
};
const slSW=()=>[...SL_CUT,'ка-ли-на','са-мо-вар','бу-ра-ти-но','тан-го','кор-тик','буй-вол','пи-а-ла','бар-хан','лай-нер','фан-та-зи-я','гон-до-ла','ли-мо-над','ко-ро-на','ла-донь','са-ра-фан','га-зе-та','кол-ба-са','фон-тан','тюль-пан','мор-ковь'];
// (slSW — функция: SL_CUT объявлен в labs.js, который в сборке идёт после index.js)
// буквы с промежутками-кнопками; on(k) — выбран ли промежуток, need — верные промежутки, sym — значок
function slGaps(t,w,sym){let h='<div class="mlet">';[...w].forEach((ch,i)=>{h+=`<span>${esc(ch)}</span>`;if(i<w.length-1){const k=i+1,on=t.sel.includes(k),y=t.need.includes(k);
 const cl=t.res?(on&&y?'ok':on?'bad':y?'miss':''):on?'on':'';h+=`<button class="gapb ${cl}" data-ma="gap" data-i="${k}" ${t.res?'disabled':''} aria-label="Место после ${i+1}-й буквы">${on||(t.res&&y)?sym:'·'}</button>`}});return h+'</div>'}
const slSameSet=(a,b)=>a.length===b.length&&a.every(x=>b.includes(x));
queueMicrotask(()=>{ // l:[] — у других глав этих механик нет; уроки задаёт SL.wk.mech. MECH объявлен в src/js/core/mech.js, который подключается после глав
 Object.assign(MECH,{
  slp:{t:'Отметить все места переноса',l:[],d:'Нажимать между буквами там, где можно поставить чёрточку переноса. Если слово не переносится — сразу нажать «Проверить».',
   gen(c,les){const ls=[3,4,5].filter(l=>les.includes(l)),l=pick1(ls),w=pick1(SL_MW[l]);
    return mFinal({k:'m',m:'slp',l,q:`Отметить все места, где слово «${w}» можно перенести. Если слово не переносится — сразу нажать «Проверить».`,w,need:slPer(w),sel:[]})},
   body:t=>slGaps(t,t.w,'-'),
   ready:()=>true,
   act(t,d){if(d.ma==='gap')mTog(t.sel,+d.i)},
   grade(t){const ok=slSameSet(t.sel,t.need);const bad=t.sel.find(k=>!t.need.includes(k)),miss=t.need.find(k=>!t.sel.includes(k));
    const why=ok?'Все места найдены.':bad!=null?`${t.w.slice(0,bad)}-${t.w.slice(bad)}: ${slWhy(t.w,bad)[1]}`:`Пропущено место: ${t.w.slice(0,miss)}-${t.w.slice(miss)}.`;
    return {ok,right:slShowPer(t.w),why}}},
  slc:{t:'Разделить на слоги',l:[],d:'Нажимать между буквами там, где проходит граница слогов.',
   gen(c,les){const l=les.includes(2)?2:5,d=pick1(slSW()),w=d.replace(/-/g,''),need=[];let p=0;d.split('-').slice(0,-1).forEach(x=>{p+=x.length;need.push(p)});
    return mFinal({k:'m',m:'slc',l,q:`Разделить слово «${w}» на слоги.`,w,d,need,sel:[]})},
   body:t=>slGaps(t,t.w,'|'),
   ready:t=>t.sel.length>0||t.need.length===0,
   act(t,d){if(d.ma==='gap')mTog(t.sel,+d.i)},
   grade(t){const ok=slSameSet(t.sel,t.need);return {ok,right:t.d,why:t.d.split('-').map(x=>`${x} — ${slSylOpen(x)?'открытый':'закрытый'}`).join('; ')+'. Один согласный уходит к следующему гласному; [й\'] и сонорный перед шумным остаются в предыдущем слоге.'}}}
 });
});
SL.wk={mech:{slp:[3,4,5],slc:[2,5]}};
