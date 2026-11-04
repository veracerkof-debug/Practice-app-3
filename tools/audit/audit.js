// Автоматический замер главы по стандарту задания (docs/PRINCIPLES.md, §4–5, §8.1).
// Запуск: node tools/audit/audit.js <id главы>   → docs/audit/<id>.md
// Считает: объём и распределение по урокам, звёздам, видам действий и материалу; повторы слов и корней;
// длину вариантов ответа; вопросы с отрицанием; наличие образцов и ключей. Это сигналы для проверки,
// а не приговор: решение по каждому сигналу принимает проверяющий.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const ROOT=path.resolve(__dirname,'../..');const id=process.argv[2]||'prichastie';
(async()=>{
 const T=path.join(ROOT,'dist','_audit.html');
 fs.writeFileSync(T,'<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(path.join(ROOT,'dist/index.html'),'utf8')+'</body></html>');
 const b=await chromium.launch();const p=await b.newPage();
 await p.goto('file://'+T+'?selftest#toc');
 const R=await p.evaluate(id=>{
  const c=window.__T.CHAPTERS[id],out={};
  const words=s=>(String(s).toLowerCase().replace(/<[^>]+>/g,' ').replace(/\([^)]*«[^)]*»\)/g,' ').match(/[а-яё]+/g)||[]); // подписи авторов «(А. С. Пушкин, «…»)» не считаем
  const STOP=new Set('и в во не на с со к по за из у о об от до для что как а но же ли бы то это он она они мы вы я ты его её их же ещё уже все всё был была были быть'.split(' '));
  const root=w=>w.replace(/(ющийся|ющиеся|ющийся|ящийся|вшийся|ющий|ющая|ющее|ющие|ящий|ящая|ящее|ящие|ущий|ущая|ащий|ащая|вший|вшая|вшее|вшие|емый|емая|имый|имая|омый|енный|ённый|анный|янный|енная|анная|ённая|енные|анные|тый|тая|тые|ший|шая|ые|ый|ий|ая|ое|ее|ой|ом|ем|им|ым|ую|юю|ах|ях|ами|ями|ть|ти|л|ла|ли|ло|ет|ит|ут|ют|ат|ят|а|я|о|е|ы|и|у|ю)$/,'').slice(0,6);
  const freq=(list)=>{const f={};list.forEach(w=>{if(w.length<4||STOP.has(w))return;const r=root(w);f[r]=(f[r]||0)+1});return Object.entries(f).sort((a,b)=>b[1]-a[1])};
  // упражнения в тетрадь
  const CL=c.classic||[];
  out.classic={n:CL.length,byL:{},byS:{},verbs:{},noObr:[],long:0,short:0};
  CL.forEach(e=>{out.classic.byL[e.l]=(out.classic.byL[e.l]||0)+1;out.classic.byS[e.st]=(out.classic.byS[e.st]||0)+1;
   const v=(e.task.match(/^[А-ЯЁа-яё]+/)||['?'])[0];out.classic.verbs[v]=(out.classic.verbs[v]||0)+1;
   if(e.st<=3&&!e.obr)out.classic.noObr.push(e.n);
   const L=String(e.body).length;if(L>500)out.classic.long++;if(L<120)out.classic.short++});
  out.classic.rep=freq(CL.flatMap(e=>words(e.body))).filter(x=>x[1]>3).slice(0,40);
  // банк тренажёра
  const B=c.bank||[];out.bank={n:B.length,byL:{},rep:freq(B.flatMap(x=>words(x.w))).filter(x=>x[1]>3).slice(0,40),dups:[]};
  const seen={};B.forEach(x=>{out.bank.byL[x.l]=(out.bank.byL[x.l]||0)+1;const k=x.w.toLowerCase();if(seen[k])out.bank.dups.push(x.w);seen[k]=1});
  // тесты
  const TS=c.tests||[];out.tests={n:TS.length,byL:{},kinds:{},neg:[],lenGap:[],items:0};
  TS.forEach(s=>{out.tests.byL[s.l]=(out.tests.byL[s.l]||0)+1;out.tests.kinds[s.k]=(out.tests.kinds[s.k]||0)+1;out.tests.items+=s.items?s.items.length:1;
   s.q.forEach(q=>{if(/(^|\s)НЕ(\s|$)|\bне является|лишнее|не причаст/i.test(q))out.tests.neg.push(q)});
   const sets=s.k==='one'?(s.items&&s.items.some(it=>!Array.isArray(it)&&it.o)?s.items.map(it=>it.o):[s.o]):s.k==='many'?[s.o]:[];
   sets.filter(Boolean).forEach(o=>{const ls=o.map(x=>String(x).length),mx=Math.max(...ls),mn=Math.min(...ls);if(mx>=2*mn&&mx-mn>12)out.tests.lenGap.push(o.join(' | '))})});
  // корпус
  const cs=window.__T.corpusSents(id,{});out.corpus={sents:cs.length,words:window.__T.corpusWords(id).length};
  return out},id);
 await b.close();fs.unlinkSync(T);
 const C=R.classic,Bk=R.bank,Ts=R.tests;
 const md=`# Автоматический замер главы «${id}»

_Сигналы для проверяющих (PRINCIPLES.md, §8.1). Сгенерировано: node tools/audit/audit.js ${id}._

## Упражнения в тетрадь — ${C.n}
- По урокам: ${Object.entries(C.byL).map(([k,v])=>`ур. ${k}: ${v}`).join(', ')}
- По звёздам: ${Object.entries(C.byS).map(([k,v])=>`${'★'.repeat(+k)}: ${v}`).join(', ')}
- Вид действия (первое слово задания): ${Object.entries(C.verbs).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k} ${v}`).join(', ')}
- ★–★★★ без образца: ${C.noObr.length?C.noObr.join(', '):'нет'}
- Материал: длинных (текст, >500 знаков) ${C.long}, коротких (<120) ${C.short}
- Частые корни в материале (>3 раз): ${C.rep.map(([k,v])=>`${k}… ${v}`).join(', ')||'нет'}

## Тренажёр (банк) — ${Bk.n}
- По урокам: ${Object.entries(Bk.byL).map(([k,v])=>`ур. ${k}: ${v}`).join(', ')}
- Повторы одного и того же задания: ${Bk.dups.length?Bk.dups.join('; '):'нет'}
- Частые корни (>3 раз): ${Bk.rep.map(([k,v])=>`${k}… ${v}`).join(', ')||'нет'}

## Тесты — ${Ts.n} вопросов, ${Ts.items} примеров
- По урокам: ${Object.entries(Ts.byL).map(([k,v])=>`ур. ${k}: ${v}`).join(', ')}
- Виды: ${Object.entries(Ts.kinds).map(([k,v])=>`${k}: ${v}`).join(', ')}
- Формулировки с отрицанием: ${Ts.neg.length?Ts.neg.map(x=>'«'+x+'»').join('; '):'нет'}
- Варианты сильно разной длины: ${Ts.lenGap.length?'\n  - '+Ts.lenGap.join('\n  - '):'нет'}

## Корпус для главы
- Предложений доступно: ${R.corpus.sents}; слов: ${R.corpus.words}

## Цели стандарта (для сравнения)
- Упражнений в тетрадь: 12–20 на урок, 100+ на главу, больше, чем заданий тренажёра.
- Пропорция в уроке: ~20 % узнавания, 50 % применения, 30 % разграничения; все звёзды; ★★★★–★★★★★ — в основном классика.
- Одно слово (корень) — не больше 2–3 раз на главу.
`;
 fs.mkdirSync(path.join(ROOT,'docs/audit'),{recursive:true});fs.writeFileSync(path.join(ROOT,'docs/audit',id+'.md'),md);console.log(md);
})();
