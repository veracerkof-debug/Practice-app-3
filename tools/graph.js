// Сводка последовательного изучения по всем готовым главам (PRINCIPLES §3а):
//   node tools/graph.js            — таблица: сколько ошибок последовательности в каждой главе
//   node tools/graph.js <id>       — ошибки одной главы полностью
//   node tools/graph.js --opory    — опоры всех глав и самопроверка OPORY (need — раньше по маршруту, prop — позже)
//   node tools/graph.js --gloss    — самопроверка глоссария: поля at и ch у каждого термина
const cp=require('child_process'),path=require('path');
const K=require('./lib/course.js').load(),{strip}=require('./lib/course.js');
const {COURSE_ORDER,OPORY,CH,LES,LESSONS,GLOSS,pos,termRe}=K,arg=process.argv[2];
const nm=c=>CH[c]?`${CH[c].num} ${CH[c].t}`:c;
function opory(){const bad=[];
 for(const c of COURSE_ORDER){const o=OPORY[c];if(!o){bad.push(`${c}: нет в OPORY`);continue}
  for(const n of o.need)if(pos(n)<0||pos(n)>=pos(c))bad.push(`${c}: опора ${n} стоит не раньше по маршруту`);
  for(const n of o.prop||[])if(pos(n)<=pos(c))bad.push(`${c}: справка ${n} — не более поздняя тема (перенести в need)`)}
 for(const c in OPORY)if(pos(c)<0)bad.push(`${c}: есть в OPORY, нет в COURSE_ORDER`);
 return bad}
function gloss(){const bad=[];
 for(const [id,g] of Object.entries(GLOSS)){
  if(!g.ch)bad.push(`${id} «${g.t}»: нет ch (глава, где понятие изучается)`);else if(pos(g.ch)<0)bad.push(`${id}: ch=${g.ch} — нет такой главы`);
  if(g.at&&!LES[g.at])bad.push(`${id} «${g.t}»: at=${g.at} — нет такого урока`);
  if(g.at&&LES[g.at]){const l=LESSONS[LES[g.at].ch][LES[g.at].n-1],raw=l.h+' '+(l.lite||'')+' '+(l.deep||''),re=termRe(g);
   if(!(new RegExp('\\[\\['+id+'\\|').test(raw)||(re&&re.test(strip(raw)))))bad.push(`${id} «${g.t}»: в уроке at=${g.at} термин не встречается`);
   if(g.ch&&CH[g.ch]&&CH[g.ch].ready&&pos(LES[g.at].ch)>pos(g.ch))bad.push(`${id} «${g.t}»: at=${g.at} стоит по маршруту позже главы-дома ${g.ch}`)}
  if(!g.at&&!g.base&&g.ch&&CH[g.ch]&&CH[g.ch].ready)bad.push(`${id} «${g.t}»: глава ${g.ch} готова, а at пуст`)}
 return bad}
if(arg==='--opory'){for(const c of COURSE_ORDER){const o=OPORY[c]||{need:[]};console.log(`${nm(c)}${CH[c].ready?'':' (не написана)'}\n   опирается на: ${o.need.map(nm).join('; ')||'—'}${(o.prop||[]).length?'\n   справка о более позднем: '+o.prop.map(nm).join('; '):''}`)}
 const b=opory();console.log(b.length?'\nОШИБКИ:\n  '+b.join('\n  '):'\nOPORY: ошибок нет.');process.exit(b.length?1:0)}
if(arg==='--gloss'){const b=gloss();console.log(b.length?`Глоссарий: ${b.length} замечаний\n  `+b.join('\n  '):'Глоссарий: at и ch в порядке.');process.exit(b.length?1:0)}
const run=id=>{let out='';try{out=cp.execFileSync('node',[path.join(__dirname,'check-chapter.js'),id],{encoding:'utf8',maxBuffer:1<<26})}catch(e){out=String(e.stdout||'')}
 return out.split('\n').filter(l=>/последовательность:/.test(l)).map(l=>l.replace(/^\s*[✗!]\s*последовательность:\s*/,(m)=>m.includes('✗')?'✗ ':'! '))};
if(arg){run(arg).forEach(l=>console.log(l));process.exit(0)}
let tot=0;for(const c of COURSE_ORDER.filter(c=>CH[c].ready)){const r=run(c),e=r.filter(l=>l[0]==='✗');tot+=e.length;
 console.log(`${(nm(c)+' ').padEnd(36,'.')} ${String(e.length).padStart(3)} ${e.some(l=>/Что нужно знать/.test(l))?'нет блока «Что нужно знать»; ':''}${e.filter(l=>/понятие/.test(l)).map(l=>(l.match(/«([^»]+)»/)||[])[1]).slice(0,8).join(', ')}`)}
console.log(`Всего ошибок последовательности: ${tot}`);const b=[...opory(),...gloss()];if(b.length)console.log(`Данные: ${b.length} замечаний (node tools/graph.js --opory, --gloss)`);
