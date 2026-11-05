// Автоматическая проверка главы: node tools/check-chapter.js <id>
// Ловит то, что можно поймать машиной, до проверки человеком: синтаксис, повторы имён, формат данных,
// объём (теория, «Проще», тренажёр, упражнения, тесты), ключи, повторы слов, транскрипцию.
// ОШИБКА — сдавать нельзя; ВНИМАНИЕ — проверить и объяснить в отчёте главы.
const fs=require('fs'),path=require('path'),vm=require('vm'),cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');const id=process.argv[2];
if(!id){console.log('Запуск: node tools/check-chapter.js <id главы>');process.exit(2)}
const dir=path.join(ROOT,'src/chapters',id);
if(!fs.existsSync(dir)){console.log('Нет папки '+dir);process.exit(2)}
const ERR=[],WARN=[];let B=[],X=[],T=[],NL=0,box=null;const err=m=>ERR.push(m),warn=m=>WARN.push(m);
const ORDER=['lessons','bank','classic','labs','tests','workshop','index'];
const files=ORDER.map(f=>path.join(dir,f+'.js')).filter(f=>fs.existsSync(f));
for(const f of ['lessons'])if(!fs.existsSync(path.join(dir,f+'.js')))err(`нет файла ${f}.js`);

// 1. синтаксис каждого файла
for(const f of files){try{cp.execFileSync('node',['--check',f],{stdio:'pipe'})}catch(e){err(`синтаксис: ${path.relative(ROOT,f)}\n    ${String(e.stderr).split('\n').slice(0,5).join('\n    ')}`)}}
// 2. имена верхнего уровня не повторяют имена остального проекта
const DECL=/^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/mg;
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith('.js')?[path.join(d,e.name)]:[]);
const other={};for(const f of walk(path.join(ROOT,'src')))if(!f.startsWith(dir+path.sep)){let m;const t=fs.readFileSync(f,'utf8');DECL.lastIndex=0;while((m=DECL.exec(t)))other[m[1]]=path.relative(ROOT,f)}
const mine={};for(const f of files){let m;const t=fs.readFileSync(f,'utf8');DECL.lastIndex=0;while((m=DECL.exec(t))){if(other[m[1]])err(`имя ${m[1]} уже есть в ${other[m[1]]} — нужен свой префикс`);if(mine[m[1]]&&mine[m[1]]!==f)err(`имя ${m[1]} объявлено дважды в главе`);mine[m[1]]=f}}
if(ERR.length){report();process.exit(1)}

// 3. загрузить главу в песочнице
box={MECH:{},relab(){},queueMicrotask:f=>f(),console,
 document:{addEventListener(){},getElementById(){return null},querySelector(){return null},querySelectorAll(){return []}},
 shuffle:a=>a,pick1:a=>a[0],esc:s=>String(s),window:{},localStorage:{getItem(){return null},setItem(){}},S:{}};
vm.createContext(box);
const PRE=['src/js/core/store.js','src/data/corpus/levels.js','src/data/corpus/orthograms.js','src/data/corpus/sentences.js','src/data/corpus/words.js','src/data/corpus/texts.js'].map(f=>path.join(ROOT,f)).filter(f=>fs.existsSync(f));
const SRC=[...PRE,...files].map(f=>fs.readFileSync(f,'utf8')).join('\n;\n');
const pre=(/^const CHAPTERS\b/m.test(SRC)?'':'var CHAPTERS={};')+(/^const LABS\b/m.test(SRC)?'':'var LABS={};');
try{vm.runInContext(pre+SRC+'\n;globalThis.__C=CHAPTERS;globalThis.__L=LABS;',box,{filename:id})}catch(e){err('глава не загружается: '+e.message);report();process.exit(1)}
const C=box.__C[id];if(!C){err(`глава не зарегистрирована: нужно CHAPTERS.${id}=…`);report();process.exit(1)}
const L=C.lessons||[];NL=L.length;
const strip=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\{\{lab:\w+\}\}/g,' ').replace(/\s+/g,' ').trim();

// 4. теория
if(NL<3||NL>8)warn(`уроков ${NL} (обычно 4–6)`);
L.forEach((l,i)=>{const n=`урок ${i+1} (${l.id})`;
 for(const k of ['t','hint','h','lite','deep','easy','fix'])if(!strip(l[k]))err(`${n}: пустое поле ${k}`);
 const h=strip(l.h).length,li=strip(l.lite).length;
 if(h<1500)warn(`${n}: теория h короткая — ${h} знаков (в образцах 3000–8000)`);
 if(li<350)err(`${n}: «Проще» (lite) — ${li} знаков: это должно быть полное объяснение для слабого ученика, а не одна фраза`);
 if(li&&h&&li/h>0.85)warn(`${n}: «Проще» почти не короче полной теории — это пересказ h?`);
 for(const m of String(l.h+l.lite+l.deep).matchAll(/\{\{lab:(\w+)\}\}/g))if(!box.__L[m[1]])err(`${n}: схема {{lab:${m[1]}}} не зарегистрирована в LABS`);
});
const labs=Object.keys(box.__L);if(labs.length<3)warn(`схем ${labs.length} (нужно не меньше 3–4, интерактивных)`);
const labSrc=fs.existsSync(path.join(dir,'labs.js'))?fs.readFileSync(path.join(dir,'labs.js'),'utf8'):'';
if(labs.length&&!/addEventListener\(\s*['"]click/.test(labSrc))warn('в labs.js нет обработчика нажатий: схемы не интерактивны');

// 5. тренажёр
B=C.bank||[];const byL={};
B.forEach((b,i)=>{const n=`тренажёр №${i+1}`;
 if(Array.isArray(b)){err(`${n}: элемент — массив; в конце bank.js нужно .map(x=>({id,w,a,why,l,opts,q})), как в src/chapters/udar/bank.js`);return}
 if(!b||typeof b!=='object'){err(`${n}: элемент ${b} — пропущена запятая между заданиями?`);return}
 const {w,a,why,l,opts:o}=b;if(!w||a==null||!why)err(`${n}: нет задания, ответа или пояснения`);
 if(!(l>=1&&l<=NL+1))err(`${n}: урок ${l} вне 1…${NL+1}`);
 if(o&&!o.includes(a))err(`${n} «${w}»: ответ «${a}» не среди вариантов`);
 if(o&&new Set(o).size!==o.length)err(`${n} «${w}»: повтор в вариантах`);
 byL[l]=(byL[l]||0)+1});
const dupB={};B.forEach(b=>{if(b&&!Array.isArray(b)){const k=b.w+'|'+(b.q||'');dupB[k]=(dupB[k]||0)+1}});for(const k in dupB)if(dupB[k]>1)warn(`тренажёр: задание «${k.split('|')[0]}» повторяется ${dupB[k]} раза`);
for(let l=1;l<=NL;l++)if((byL[l]||0)<10&&!(C.wk))warn(`тренажёр, урок ${l}: ${byL[l]||0} заданий (норма 15–25)`);

// 6. упражнения в тетрадь
X=C.classic||[];const ns=new Set();
X.forEach((e,i)=>{const n=`упражнение №${e.n??'?'}`;
 if(typeof e!=='object'||Array.isArray(e)){err(`упражнение [${i}]: не объект — пропущена запятая?`);return}
 if(!Number.isInteger(e.n))err(`${n}: нет номера n`);else if(ns.has(e.n))err(`${n}: номер повторяется`);ns.add(e.n);
 if(!(e.l>=1&&e.l<=NL+1))err(`${n}: урок ${e.l} вне 1…${NL+1}`);
 if(!(e.st>=1&&e.st<=5))err(`${n}: звёзды st=${e.st} (нужно 1–5)`);
 if(!strip(e.task))err(`${n}: нет задания task`);
 if(!strip(e.key))err(`${n}: нет ключа key`);
 else{const k=strip(e.key);if(k.length<20)warn(`${n}: очень короткий ключ «${k}»`);
  if(/^(пример|с пометками|составить|записать|работа со словар|отметить)[^.]*\.?$/i.test(k)||/для каждого\.?$/i.test(k))err(`${n}: ключ «${k.slice(0,60)}» — не ключ: нужен полный ответ или образец с критериями`)}
 if(e.st<=3&&!strip(e.obr)&&!e.os)warn(`${n}: ★${e.st} без образца obr`);
 if(!e.os&&strip(e.body).length<40&&!/сочин|составить|подобрать|найти в словар/i.test(e.task))warn(`${n}: мало материала (${strip(e.body).length} знаков) — упражнение меньше 5–7 минут?`)});
const sorted=[...ns].sort((a,b)=>a-b);if(sorted.length&&sorted[sorted.length-1]!==sorted.length)warn('номера упражнений не идут подряд 1…N (пропуски допустимы, только если номер когда-то удалён)');
if(X.length<=B.length)err(`упражнений в тетрадь ${X.length}, заданий тренажёра ${B.length}: упражнений должно быть больше (решение владельца)`);

// 7. тесты
T=C.tests||[];const tl={};
T.forEach((s,i)=>{const n=`тест [${i}] урок ${s.l}`;tl[s.l]=(tl[s.l]||0)+1;
 if(!['one','many','type','sort'].includes(s.k))err(`${n}: вид ${s.k}`);
 if(!s.q||!s.q.length)err(`${n}: нет формулировки q`);
 const it=s.items||[];
 if(it.length&&it.length<6&&s.k!=='many')warn(`${n}: ${it.length} примеров в слоте (норма 6–12)`);
 if(s.k==='one'&&!it.length&&!(s.o&&s.a))err(`${n}: нет ни items, ни o+a`);
 it.forEach(x=>{if(Array.isArray(x)&&s.k==='one'&&s.o&&!s.o.includes(x[1]))err(`${n}: ответ «${x[1]}» к «${x[0]}» не среди вариантов`);
  if(!Array.isArray(x)&&x&&x.o&&x.a){const a=[].concat(x.a);a.forEach(v=>{if(!x.o.includes(v))err(`${n}: ответ «${v}» не среди вариантов`)})}
  if(Array.isArray(x)&&s.k==='sort'&&s.cats&&!s.cats.includes(x[1]))err(`${n}: категория «${x[1]}» не в cats`)})});
for(let l=1;l<=NL;l++)if((tl[l]||0)<8)err(`тесты, урок ${l}: ${tl[l]||0} слотов (нужно 8)`);

// 8. повторы слов в заданиях (тренажёр, упражнения, тесты; без теории и ключей)
const text=[...B.filter(b=>b&&b.w).map(b=>b.w),...X.map(e=>e.body+' '+e.obr),...T.flatMap(s=>(s.items||[]).map(x=>Array.isArray(x)?x[0]:(x.o||[]).join(' ')))].join(' ').toLowerCase().replace(/[́]/g,'');
const STOP=new Set(('если когда чтобы который которая которые потому очень этот этого было были будет может можно нужно потом '+
 'слова слово слове слов предложение предложения пояснения сколько какое какой какая каком какие первый второй последний способов способом '+
 'звук звука звуки звуков буква буквы букв слог слога слоги слогов перенос переноса переносится ударение ударения ударный ударная').split(' '));
const freq={};for(const w of text.match(/[а-яё]{4,}/g)||[])if(!STOP.has(w))freq[w]=(freq[w]||0)+1;
const many=Object.entries(freq).filter(([,c])=>c>6).sort((a,b)=>b[1]-a[1]);
if(many.length)warn('повторы слов в заданиях (обычное слово — 2–3 раза, трудное — до 5–6): '+many.slice(0,15).map(([w,c])=>w+' ×'+c).join(', '));

// 9. транскрипция: школьная запись, как в «Звуках и буквах» — [й'], мягкость ', без [ъ] [ь] и без букв е ё ю я внутри скобок
const all=JSON.stringify([L,B,X,T]);
for(const m of all.matchAll(/\[([а-яё'́\- ]{2,})\]/g)){const t=m[1];if(!/[а-яё]/.test(t)||/ /.test(t.trim()))continue;
 const bad=[];if(/[еёюяъь]/.test(t))bad.push('буквы е/ё/ю/я/ъ/ь внутри транскрипции');
 if(/[чщй](?!')/.test(t))bad.push('ч, щ, й всегда с \' : [ч\'], [щ\'], [й\']');
 if(bad.length)warn(`транскрипция [${t}]: ${bad.join('; ')} — если это намеренно неверный пример (найти ошибку), сказать об этом в отчёте`)}

// 10. содержание: запрещённые темы для детей
const BAD=/(?<![а-яё])(водк|пив[оа]|вин[оа](?![а-яё]*(ват|вн))|пьян|курил|сигар|табак|убил|убийств|кров[ьи]|самоубий)/i;
const bm=strip(JSON.stringify([B,X,T])).match(BAD);if(bm)warn(`проверить содержание: «${bm[0]}…» — без сомнительного для детей (PRINCIPLES §6.4)`);

// 11. произведения, которые владелец убрал как неподходящие для детей (решение 05.11.2026); список пополнять
const BANNED=['«Ася»','«Барыня»'];
for(const w of BANNED)if(JSON.stringify([B,X,T]).includes(w))err(`цитата из ${w} — произведение убрано владельцем (PRINCIPLES §6.4), взять другое`);

report();process.exit(ERR.length?1:0);
function report(){
 console.log(`Глава ${id}: уроков ${NL||'?'}, схем ${Object.keys((box&&box.__L)||{}).length}, тренажёр ${B.length}, упражнений ${X.length}, слотов тестов ${T.length}`);
 if(ERR.length){console.log(`\nОШИБКИ (${ERR.length}) — сдавать нельзя:`);ERR.slice(0,80).forEach(e=>console.log('  ✗ '+e));if(ERR.length>80)console.log(`  … и ещё ${ERR.length-80}`)}
 if(WARN.length){console.log(`\nВНИМАНИЕ (${WARN.length}) — проверить и объяснить в отчёте:`);WARN.slice(0,60).forEach(e=>console.log('  ! '+e))}
 if(!ERR.length)console.log('\nОшибок нет.');
}
