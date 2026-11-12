// Проверка графа понятий (PRINCIPLES §3а, решение владельца 12.11.2026):
// ученик идёт по маршруту (COURSE_ORDER) и не должен встречать понятие раньше, чем оно объяснено.
//   Термин глоссария: at — урок, где понятие впервые объясняется; ch — глава, где оно изучается полностью.
//   В главе X термин допустим, если урок at стоит в X или раньше по маршруту. Иначе нужна справка в самой главе:
//   блок «Что нужно знать» (начало урока 1) или «Вспомним» (любой урок) — от <h4> до следующего <h4>.
// Смотрим теорию (h, lite, deep, hint, easy, fix) и формулировки заданий (task, q, why); материал заданий
// (слова и предложения) не смотрим: там слова встречаются не как термины.
const {strip}=require('./course.js');
const REF=/глав[аеуыой]{1,2}\s«([^»]+)»/g;
const noEx=s=>String(s||'').replace(/<(span|div|p|i|em|td) class="(?:ex|m)[^"]*">[\s\S]*?<\/\1>/g,' ');
const clean=s=>strip(noEx(s).replace(REF,' '));
// справочные блоки урока: «Что нужно знать», «Вспомним…»
const spravka=h=>[...String(h||'').matchAll(/<h4>\s*(Что нужно знать|Вспомним[^<]*)<\/h4>([\s\S]*?)(?=<h4>|$)/g)].map(m=>m[2]).join(' ');

function graphCheck(K,id,C){
 const {GLOSS,LES,CH,OPORY,COURSE_ORDER,pos,termRe}=K,px=pos(id),errs=[],warns=[],info=[];
 if(px<0){errs.push(`главы ${id} нет в маршруте COURSE_ORDER (src/data/corpus/levels.js)`);return {errs,warns,info}}
 const o=OPORY[id]||{need:[]},nm=c=>CH[c]?`${CH[c].num} «${CH[c].t}»`:c;
 if(!OPORY[id])errs.push(`у главы нет опор в OPORY (src/data/corpus/levels.js)`);
 info.push('Опирается на: '+(o.need.length?o.need.map(c=>nm(c)+(CH[c]&&CH[c].ready?'':' — не написана: нужна справка')).join('; '):'ничего (начало курса)'));
 if((o.prop||[]).length)info.push('Справка о более поздних темах: '+o.prop.map(nm).join('; '));
 const L=C.lessons||[];
 // тексты: [место, текст]
 const T=[];L.forEach((l,i)=>{for(const k of ['h','lite','deep','hint','easy','fix'])T.push([`урок ${i+1}`,l[k]])});
 (C.classic||[]).forEach(e=>{if(e&&e.task)T.push([`упр. ${e.n}`,e.task])});
 (C.bank||[]).forEach((b,i)=>{if(b&&!Array.isArray(b))T.push([`тренажёр, урок ${b.l}`,(b.q||'')+' '+(b.why||'')])});
 (C.tests||[]).forEach(s=>T.push([`тест, урок ${s.l}`,[].concat(s.q||[]).join(' ')]));
 const sprRaw=L.map(l=>spravka(l.h)+' '+spravka(l.lite)).join(' '),spr=clean(sprRaw);
 const first=L[0]?String(L[0].h||''):'';
 const hasBlock=/<h4>\s*Что нужно знать\s*<\/h4>/.test(first);
 if(!hasBlock&&(o.need.length||(o.prop||[]).length))errs.push('нет блока «Что нужно знать» в начале урока 1 (<h4>Что нужно знать</h4>, CONTENT-GUIDE): опоры главы — '+[...o.need,...(o.prop||[])].map(nm).join('; '));
 // ссылки на главы
 const titles=new Set(Object.values(CH).map(c=>c.t.toLowerCase()));
 const badRef={};for(const [w,t] of T)for(const m of String(t||'').replace(/<[^>]+>/g,' ').matchAll(REF))if(!titles.has(m[1].trim().toLowerCase()))(badRef[m[1]]=badRef[m[1]]||new Set()).add(w);
 for(const r in badRef)errs.push(`ссылка на главу «${r}», которой нет в оглавлении (${[...badRef[r]].slice(0,4).join(', ')})`);
 // термины: длинные раньше коротких, совпадения не перекрываются (как termsIn в nav.js)
 const G=Object.entries(GLOSS).map(([gid,g])=>({gid,g,re:termRe(g)?new RegExp(termRe(g).source,'gi'):null,ex:new RegExp('\\[\\['+gid+'\\|')})).sort((a,b)=>b.g.t.length-a.g.t.length);
 const hits=s=>{const out=new Set(),sp=[];for(const x of G){if(!x.re)continue;x.re.lastIndex=0;let m;while((m=x.re.exec(s))){const st=m.index+m[1].length,en=st+m[2].length;
   if(!sp.some(h=>st<h[1]&&en>h[0])){sp.push([st,en]);out.add(x.gid)}if(x.re.lastIndex===m.index)x.re.lastIndex++}}return out};
 const used={};for(const [w,t] of T){if(!t)continue;const raw=noEx(t).replace(REF,' ');const hs=hits(strip(raw));for(const x of G)if(x.ex.test(raw))hs.add(x.gid);for(const gid of hs)(used[gid]=used[gid]||[]).push(w)}
 const inSpr=hits(spr);for(const x of G)if(x.ex.test(sprRaw))inSpr.add(x.gid);
 const where=a=>{const u=[...new Set(a)];return u.slice(0,5).join(', ')+(u.length>5?` и ещё ${u.length-5}`:'')};
 for(const gid of Object.keys(used)){const g=GLOSS[gid],ac=g.at&&LES[g.at]?LES[g.at].ch:null,home=g.ch||ac;
  if(g.base)continue;                                               // понятие начальной школы
  if(ac&&pos(ac)<=px)continue;                                   // объяснено раньше или в этой главе
  const hm=home?(pos(home)>px?`изучается позже — в главе ${nm(home)}`:`глава ${nm(home)} ещё не написана`):'в глоссарии не указано, где объясняется (поля at и ch)';
  if(inSpr.has(gid)){warns.push(`понятие «${g.t}» объяснено справкой в этой главе — поле at термина ${gid} в глоссарии должно указывать на этот урок`);continue}
  errs.push(`понятие «${g.t}» (${hm}) без справки: ${where(used[gid])}`)}
 // справки, обещанные в OPORY
 for(const p of o.prop||[])if(hasBlock&&CH[p]&&!new RegExp('глав[аеуыой]{1,2}\\s«'+CH[p].t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'»','i').test(first.replace(/<[^>]+>/g,' ')))
  warns.push(`в «Что нужно знать» нет ссылки «подробно — в главе «${CH[p].t}»» (справка о более поздней теме, OPORY)`);
 return {errs,warns,info};
}
module.exports={graphCheck,spravka};
