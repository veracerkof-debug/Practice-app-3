// Общие данные курса для инструментов: оглавление, маршрут, опоры глав, глоссарий, уроки всех глав.
// Используют tools/check-chapter.js и tools/graph.js.
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'../..');
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
function load(){
 const box={console,localStorage:{getItem(){return null},setItem(){}},document:{querySelector(){return null},addEventListener(){}},window:{},location:{search:'',hash:''}};
 vm.createContext(box);
 vm.runInContext(rd('src/js/core/store.js')+'\n;'+rd('src/data/corpus/levels.js')+'\n;'+rd('src/data/glossary.js')+
  '\n;globalThis.__o={PARTS,COURSE_ORDER,OPORY:typeof OPORY==="undefined"?{}:OPORY,PROP_TOPIC,GLOSS};',box,{filename:'course'});
 const {PARTS,COURSE_ORDER,OPORY,PROP_TOPIC,GLOSS}=box.__o;
 const CH={};PARTS.forEach(p=>p.ch.forEach((c,i)=>{CH[c.id]={id:c.id,t:c.t,ready:!!c.ready,part:p.n,num:p.n+'.'+(i+1)}}));
 // уроки готовых глав: lessons.js каждой главы — «const X={id:'…',…,lessons:[…]}»
 const LES={},LESSONS={};
 for(const id of fs.readdirSync(path.join(ROOT,'src/chapters'))){
  const f=path.join(ROOT,'src/chapters',id,'lessons.js');if(!fs.existsSync(f))continue;
  const src=fs.readFileSync(f,'utf8'),m=src.match(/^const\s+([A-Za-z_$][\w$]*)\s*=\s*\{/m);if(!m)continue;
  const b={console};vm.createContext(b);
  try{vm.runInContext(src+`\n;globalThis.__c=${m[1]};`,b,{filename:f})}catch(e){continue}
  const c=b.__c;if(!c||!c.lessons)continue;LESSONS[c.id]=c.lessons;
  c.lessons.forEach((l,i)=>{LES[l.id]={ch:c.id,n:i+1,t:l.t}});
 }
 const pos=id=>COURSE_ORDER.indexOf(id);
 const CYR='а-яёА-ЯЁ';
 const termRe=g=>g.f?new RegExp('(^|[^'+CYR+'])('+g.f+')(?!['+CYR+'])','i'):null;
 return {ROOT,PARTS,COURSE_ORDER,OPORY,PROP_TOPIC,GLOSS,CH,LES,LESSONS,pos,termRe};
}
const strip=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\{\{lab:\w+\}\}/g,' ').replace(/\[\[\w+\|([^\]]+)\]\]/g,'$1').replace(/\s+/g,' ').trim();
module.exports={load,strip};
