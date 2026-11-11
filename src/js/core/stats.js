// ---------- статистика на устройстве: ступени уроков, слабые места, время, копия данных ----------
// Всё считается из S (localStorage) и никуда не отправляется. Поля S только добавляются:
//   S.prof  {name,sur,cls}                 — имя, фамилия, класс (больше ничего личного — решение владельца 14)
//   S.time  {'ГГГГ-ММ-ДД': секунды}        — активное время по дням (хранится ST.DAYS дней)
//   S.ans   {<id урока>: {r,n,ok,at,m}}    — ответы тренажёра: r — последние 20 («1» — верно с первой попытки),
//                                            n и ok — всего и верных, at — день, m — ступень «знакомо» достигнута
//   S.seen  {<id урока>: 1}                — урок открывали
//   S.at    {ch,tab,l}                     — где ученик остановился (для «Продолжить»)
//   S.recent [{ch,r,at}]                   — последние 3 открытых задания #ex-<глава>-<номера>
// Показатель вовлечённости — не оценка (решение 13). Очков, серий и рейтингов нет (docs/plans/home-research.md).

// Пороги — предложение, решает владелец.
const ST={
 ANS_KEEP:20,   // сколько последних ответов тренажёра помнить по уроку
 FAM_N:10,      // «знакомо»: не меньше стольких ответов в тренажёре по уроку…
 FAM_P:.7,      // …и не меньше такой доли верных среди последних ANS_KEEP
 CONF_G:4,      // «уверенно»: последняя оценка за тест урока не ниже этой
 WEAK_N:8,      // «стоит повторить»: ответов не меньше…
 WEAK_P:.7,     // …а верных среди последних ANS_KEEP меньше этой доли
 WEAK_G:2,      // …либо последняя оценка за тест урока — такая
 IDLE:300,      // секунд без действий: такой промежуток во время не идёт (решение 13 — 5 минут)
 SAVE_EVERY:45, // время пишется в localStorage не чаще, чем раз в столько секунд
 DAYS:120,      // сколько дней хранить время
 DAY_MIN:60     // день считается «днём занятий», если набралось столько секунд
};
const LV_WORD=['не начато','начато','знакомо','уверенно'];

// ----- дни -----
const p2=n=>String(n).padStart(2,'0');
const dayKey=(d=new Date())=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const WD=['пн','вт','ср','чт','пт','сб','вс'];
function fmtDur(sec){sec=Math.round(sec||0);if(sec<=0)return '0 мин';if(sec<60)return 'меньше минуты';
 const m=Math.round(sec/60),h=Math.floor(m/60);return h?h+' ч'+(m%60?' '+m%60+' мин':''):m+' мин'}
// неделя (пн–вс): off=0 — текущая, 1 — прошлая…
function weekDays(off=0){
 const now=new Date(),t=dayKey(now),mon=new Date(now.getFullYear(),now.getMonth(),now.getDate()-((now.getDay()+6)%7)-7*off),T=S.time||{};
 return WD.map((wd,i)=>{const d=new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()+i),k=dayKey(d),sec=+T[k]||0;
  return {wd,k,d,sec,on:sec>=ST.DAY_MIN,today:k===t,fut:k>t}});
}
const weekTime=(off=0)=>weekDays(off).reduce((s,x)=>s+x.sec,0);

// ----- ответы тренажёра -----
const ansOf=id=>{const a=(S.ans||{})[id];return a&&typeof a==='object'?a:null};
const ansLast=a=>String(a&&a.r||'').replace(/[^01]/g,'').slice(-ST.ANS_KEEP);
function ansShare(a){const r=ansLast(a);return r.length?r.split('1').length-1:0}          // верных среди последних
// записать ответ: c — глава, l — номер урока (1…), ok — верно с первой попытки
function statAns(c,l,ok){
 const L=c&&c.lessons&&c.lessons[l-1];if(!L)return;
 S.ans=S.ans||{};const a=ansOf(L.id)||{r:'',n:0,ok:0};
 a.r=(ansLast(a)+(ok?'1':'0')).slice(-ST.ANS_KEEP);a.n=(+a.n||0)+1;a.ok=(+a.ok||0)+(ok?1:0);a.at=today();
 // «знакомо» не отнимается из-за одной ошибки: достигнутая ступень запоминается (понизить может только тест)
 if(!a.m&&a.n>=ST.FAM_N&&ansShare(a)/a.r.length>=ST.FAM_P)a.m=1;
 S.ans[L.id]=a;save();
}
function statSeen(id){if(!LES[id])return;S.seen=S.seen||{};if(S.seen[id])return;S.seen[id]=1;save()}

// ----- ступень урока -----
// → {lv:0…3, word, g: последняя оценка за тест урока (0 — не писал), weak, bad, of}
function lessonLevel(id){
 const L=LES[id];if(!L)return {lv:0,word:LV_WORD[0],g:0,weak:false};
 const c=CHAPTERS[L.ch],a=ansOf(id),t=c.tests?tRes(c,L.n):null,g=t?+t.last||0:0;
 const r=ansLast(a),good=ansShare(a),bad=r.length-good;
 const weak=g===ST.WEAK_G||(!!a&&(+a.n||0)>=ST.WEAK_N&&r.length>0&&good/r.length<ST.WEAK_P&&g<ST.CONF_G);
 let lv=0;
 if(S.done[id]||(S.seen||{})[id]||S.last===id||a||t)lv=1;
 if(a&&(a.m||((+a.n||0)>=ST.FAM_N&&good/r.length>=ST.FAM_P)))lv=2;
 if(g>=ST.CONF_G)lv=3;
 return {lv,word:LV_WORD[lv],g,weak,bad,of:r.length};
}
const stepsHTML=lv=>`<span class="stp" aria-hidden="true">${[1,2,3].map(k=>`<i class="${lv>=k?'on':''}"></i>`).join('')}</span>`;
// до max уроков, которые стоит повторить: сначала те, где ошибок больше
function weakLessons(max=3){
 const out=[];Object.keys(LES).forEach(id=>{const v=lessonLevel(id);if(!v.weak)return;
  const a=ansOf(id);out.push({id,...v,share:v.of?1-v.bad/v.of:.5,at:a&&a.at||0})});
 return out.sort((x,y)=>x.share-y.share||y.at-x.at).slice(0,max);
}
// начатые главы, где сданы не все тесты: что осталось
function chStarted(c){return c.lessons.some(l=>lessonLevel(l.id).lv>0)||(c.tests&&!!tRes(c,'final'))}
function chRecent(c){let at=0;c.lessons.forEach(l=>{const a=ansOf(l.id);if(a&&a.at>at)at=a.at});tAll(c).forEach(k=>{const r=tRes(c,k);if(r&&r.at>at)at=r.at});
 if(S.at&&S.at.ch===c.id)at=Math.max(at,today()+1);return at}
function unfinished(max=3){
 return ALLCH.map(m=>CHAPTERS[m.id]).filter(c=>c&&c.tests&&chStarted(c)&&!chTestsDone(c))
  .map(c=>({c,left:tAll(c).filter(k=>!tPassed(c,k)),at:chRecent(c)})).sort((x,y)=>y.at-x.at).slice(0,max);
}
function leftText(left){
 const ls=left.filter(k=>k!=='final'),fin=left.includes('final');
 const a=ls.length?(ls.length>1?'тесты по урокам ':'тест по уроку ')+clFmt(ls):'';
 return a&&fin?a+' и итоговый':a||'итоговый тест';
}
// раздел курса: сколько уроков всего, сколько «уверенно», сколько «знакомо»
function partProgress(p){
 let n=0,conf=0,fam=0;p.ch.forEach(m=>{const c=CHAPTERS[m.id];if(!c)return;c.lessons.forEach(l=>{n++;const lv=lessonLevel(l.id).lv;if(lv>=3)conf++;else if(lv===2)fam++})});
 return {n,conf,fam};
}
const clDoneN=c=>(c.classic||[]).filter(e=>S.done['cl-'+c.id+'-'+e.n]).length;

// ----- где остановился и недавние задания -----
function statWhere(){
 if(route.v!=='ch')return;const c=CHAPTERS[route.id];if(!c)return;
 const tab=chTab(c);let l=lesIdx(c,route.l);
 if(!l&&tab==='train'&&TR.ch===c.id&&TR.les.length===1)l=TR.les[0];
 if(!l&&tab==='classic'&&!CLR)l=CLF||0;
 const o=S.at||{};if(o.ch===c.id&&o.tab===tab&&o.l===l)return;
 S.at={ch:c.id,tab,l};save();
}
function recentEx(chId,list){
 if(!CHAPTERS[chId]||!list||!list.length)return;const r=clFmt(list,true);
 S.recent=[{ch:chId,r,at:Date.now()},...recentList().filter(x=>!(x.ch===chId&&x.r===r))].slice(0,3);save();
}
const recentList=()=>(Array.isArray(S.recent)?S.recent:[]).filter(x=>x&&CHAPTERS[x.ch]&&/^[\d,-]+$/.test(String(x.r))).slice(0,3);

// ----- активное время -----
// Считаются только промежутки между действиями ученика (нажатие, ввод, прокрутка, касание) короче ST.IDLE,
// и только пока вкладка видима. Дольше без действий — промежуток не засчитывается целиком.
let T_ACT=0,T_ACC=0,T_SAVED=Date.now(),T_DIRTY=false;
function timeAct(){
 const now=Date.now();
 if(T_ACT&&!document.hidden){const gap=(now-T_ACT)/1000;
  if(gap>0&&gap<ST.IDLE){T_ACC+=gap;if(T_ACC>=1){const s=Math.floor(T_ACC),k=dayKey();T_ACC-=s;S.time=S.time||{};S.time[k]=(+S.time[k]||0)+s;T_DIRTY=true}}}
 T_ACT=now;
 if(T_DIRTY&&now-T_SAVED>=ST.SAVE_EVERY*1000)timeFlush();
}
function timeFlush(){if(!T_DIRTY)return;T_DIRTY=false;T_SAVED=Date.now();save()}
function timePrune(){const T=S.time;if(!T||typeof T!=='object'||Array.isArray(T)){S.time={};return}
 const d=new Date(),lim=dayKey(new Date(d.getFullYear(),d.getMonth(),d.getDate()-ST.DAYS));
 Object.keys(T).forEach(k=>{if(!/^\d{4}-\d\d-\d\d$/.test(k)||k<lim||!(+T[k]>0))delete T[k]})}
timePrune();
['pointerdown','click','keydown','input','touchstart','wheel'].forEach(ev=>document.addEventListener(ev,timeAct,{passive:true,capture:true}));
window.addEventListener('scroll',timeAct,{passive:true,capture:true});
document.addEventListener('visibilitychange',()=>{T_ACT=0;if(document.hidden)timeFlush()});
window.addEventListener('pagehide',timeFlush);

// ----- копия данных: в ней записано, чья она и когда сделана (по образцу Melete) -----
const S_NEW=()=>({done:{},cards:{},view:'book',tocOpen:{},tocV:2});
const profName=(p=S.prof)=>[p&&p.name,p&&p.sur].map(x=>String(x||'').trim()).filter(Boolean).join(' ');
const isObj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function bkText(){timeFlush();return JSON.stringify({app:'rus-uchebnik',v:1,by:profName(),at:Date.now(),data:S})}
function bkName(){const n=profName().replace(/[^0-9A-Za-zА-Яа-яЁё]+/g,'-').replace(/^-|-$/g,'');return 'uchebnik-'+(n?n+'-':'')+dayKey()+'.json'}
// что в копии: коротко, для подтверждения перед заменой
function bkSummary(d){
 const ids=new Set();[d.done,d.ans,d.seen].forEach(o=>{if(isObj(o))Object.keys(o).forEach(k=>{if(LES[k]&&o[k])ids.add(k)})});
 const tests=isObj(d.tests)?Object.values(d.tests).filter(r=>r&&r.best>=TEST_PASS).length:0;
 const time=isObj(d.time)?Object.values(d.time).reduce((s,x)=>s+(+x||0),0):0;
 return {lessons:ids.size,tests,time};
}
// разобрать текст копии → {ok:true,by,at,data,sum} или {ok:false,err}
function bkRead(text){
 let o;try{o=JSON.parse(String(text||'').trim())}catch(e){return {ok:false,err:'Это не похоже на копию: текст повреждён или вставлен не целиком.'}}
 if(!isObj(o)||o.app!=='rus-uchebnik'||!isObj(o.data))return {ok:false,err:'Это не копия данных учебника.'};
 if(+o.v>1)return {ok:false,err:'Копия сделана в более новой версии учебника. Сначала обновить учебник.'};
 const d=o.data;
 return {ok:true,by:String(o.by||profName(d.prof)||'').slice(0,80),at:+o.at||0,data:d,sum:bkSummary(d)};
}
// привести загруженные данные в порядок: только известные виды значений, ничего лишнего в разметку не попадёт
function normS(d){
 const n=Object.assign(S_NEW(),d);
 ['done','cards','tests','ans','seen','time','tocOpen'].forEach(k=>{if(!isObj(n[k]))n[k]={}});
 if(!Array.isArray(n.tlog))n.tlog=[];
 if(!Array.isArray(n.recent))n.recent=[];
 const p=isObj(n.prof)?n.prof:{};n.prof={name:String(p.name||'').slice(0,40),sur:String(p.sur||'').slice(0,40),cls:String(p.cls||'').slice(0,8)};
 if(!isObj(n.at)||!CHAPTERS[n.at.ch])delete n.at;
 return n;
}
function stateReset(){TR.run=null;TR.ch=null;TS=null;TSV='list';CLR=null;CLF=0;T_ACT=0;T_ACC=0;T_DIRTY=false}
function bkApply(d){S=normS(d);timePrune();stateReset();save()}
function wipeAll(){S=S_NEW();stateReset();try{localStorage.removeItem(KEY)}catch(e){}save()}

if(window.__T)Object.assign(window.__T,{ST,lessonLevel,weakLessons,unfinished,weekDays,weekTime,statAns,bkText,bkRead,getS:()=>S,timeFlush});
