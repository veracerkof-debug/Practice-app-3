// Дымовой тест: все схемы «Причастия», все режимы тренажёра, упражнения, навигация, глоссарий, словари.
// Запуск: node tools/test/smoke.js   (нужен playwright: npm i -D playwright && npx playwright install chromium)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const ROOT=path.resolve(__dirname,'../..');const T=path.join(ROOT,'dist','_smoke.html');const U='file://'+T;
const ok=[],fail=[];const check=(c,msg)=>(c?ok:fail).push(msg);
(async()=>{
 fs.writeFileSync(T,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+fs.readFileSync(path.join(ROOT,'dist/index.html'),'utf8')+'</body></html>');
 const b=await chromium.launch();const errs=[];
 const p=await b.newPage({viewport:{width:400,height:900}});p.on('pageerror',e=>errs.push(e.message));
 // схемы
 await p.goto(U+'#ch-prichastie');
 for(const s of ['[data-parse="1"]','[data-matrix="прийти"]','[data-build="нести"]','[data-bf="2"]','[data-spr="4"]','[data-pair="2"]','[data-decl="строящийся"]','[data-dg="2"]','[data-new="1"]','[data-cm="3"]','[data-kpos="before"]'])
  {const el=await p.$(s);check(!!el,'схема: '+s);if(el)await el.click()}
 check(await p.evaluate(()=>document.querySelectorAll('.bterm').length)>50,'автоссылки терминов');
 // тренажёр
 await p.click('[data-tab="train"]');
 for(const m of ['pick','cols','err','mix']){await p.click(`[data-trm="${m}"]`);await p.click('[data-trc="20"]');await p.click('[data-trgo]');let steps=0;
  for(let k=0;k<25;k++){
   if(await p.$('[data-trp]:not([disabled])')) await p.click('[data-trp]:not([disabled])');
   if(await p.$('[data-trp]:not([disabled])')&&!(await p.$('[data-trnext]'))) await p.click('[data-trp]:not([disabled])');
   if(await p.$('[data-tre]:not([disabled])')) await p.click('[data-tre]');
   while(await p.$('[data-trset]')) await p.click('[data-trset]');
   if(await p.$('[data-trcheck]:not([disabled])')) await p.click('[data-trcheck]');
   if(await p.$('[data-trnext]')){await p.click('[data-trnext]');steps++} else break;}
  check(steps>0,'тренажёр, режим '+m);await p.click('[data-trsetup]');}
 // упражнения и звёзды
 await p.click('[data-tab="classic"]');await p.click('[data-cls="5"]');const n5=await p.evaluate(()=>document.querySelectorAll('.clex').length);
 await p.click('[data-cls="0"]');const nAll=await p.evaluate(()=>document.querySelectorAll('.clex').length);
 check(nAll>=40&&n5>0&&n5<nAll,`упражнения: всего ${nAll}, ★★★★★ ${n5}`);
 // глава Н и НН
 await p.goto(U+'#ch-nn');await p.click('[data-tab="train"]');
 check((await p.evaluate(()=>document.querySelector('#trainer').innerText)).includes('189'),'тренажёр «Н и НН»: 189 заданий');
 // оглавление → урок
 await p.goto(U+'#toc');await p.click('[data-ojump2="pr4"]');await p.waitForTimeout(500);
 check(await p.evaluate(()=>Math.abs(document.getElementById('pr4').getBoundingClientRect().top)<200),'переход к уроку из оглавления');
 // термин → шторка → урок
 await p.click('#pr4 .bterm');check(!!await p.$('.sheet'),'шторка термина');
 if(await p.$('.sheet [data-tsee]')){await p.click('.sheet [data-tsee]');check(!!await p.$('[data-shback]'),'переход к связанному термину')}
 await p.click('[data-close]');
 await p.click('[data-outline]');check(await p.evaluate(()=>document.querySelectorAll('.otl [data-ojump]').length)>7,'содержание главы');await p.click('[data-close]');
 // глоссарий, словарик, словарь
 await p.goto(U+'#glossary');check(await p.evaluate(()=>document.querySelectorAll('.gterm').length)>100,'глоссарий');
 await p.fill('#gq','причаст');check(await p.evaluate(()=>document.querySelectorAll('.gterm').length)>2,'поиск в глоссарии');
 await p.goto(U+'#dict');check(await p.evaluate(()=>document.querySelectorAll('.dw').length)>250,'словарик правописания');
 await p.click('.wcloud [data-word="деревянный"]');
 for(let i=1;i<=5;i++)await p.click(`[data-wstep][data-to="${i}"]`);
 check(await p.evaluate(()=>document.querySelectorAll('.mword .m-root,.mword .m-suf,.mword .m-end').length)===3,'разбор по шагам');
 await p.goto(U+'#ch-prichastie');check(await p.evaluate(()=>document.querySelectorAll('.bktext .wl').length)>5,'ссылки на слова в примерах');
 // поиск
 await p.goto(U+'#toc');await p.fill('#q','деревян');check(await p.evaluate(()=>document.querySelectorAll('#sres button').length)>1,'поиск на главной');
 // упражнения: номера, задание по номерам, ссылка, поиск номера
 const cnt=()=>p.evaluate(()=>document.querySelectorAll('.clex').length);
 await p.goto(U+'#ch-prichastie');await p.click('[data-tab="classic"]');
 check(await p.evaluate(()=>document.querySelectorAll('.clnav [data-clgo]').length)===40,'карта номеров упражнений');
 await p.fill('.clnav [data-clform] input','12–15');await p.press('.clnav [data-clform] input','Enter');
 check(await cnt()===4&&(await p.evaluate(()=>location.hash))==='#ex-prichastie-12-15','задание «12–15»: только 4 упражнения и ссылка');
 await p.click('[data-clall]');await p.click('[data-cls="5"]');await p.click('.clnav [data-clgo="3"]');await p.waitForTimeout(100);
 check(await cnt()===40,'переход к номеру снимает фильтры');
 await p.goto(U+'#ex-nn-4-6,10');await p.reload();check(await cnt()===4,'ссылка на упражнения 4–6, 10');
 await p.goto(U+'#toc');await p.fill('#q','4.6.12');check(await p.evaluate(()=>!!document.querySelector('[data-exgo="prichastie:12"]')),'поиск упражнения по номеру 4.6.12');
 await p.click('[data-exgo="prichastie:12"]');check(await cnt()===1,'переход из поиска к упражнению');
 await p.goto(U+'#ch-prichastie');await p.click('[data-tab="theory"]');
 // тесты «Причастия» и термины в упражнениях
 p.on('dialog',d=>d.accept());
 await p.goto(U+'#ch-prichastie');await p.click('[data-tab="classic"]');
 check(await p.evaluate(()=>document.querySelectorAll('.clex .bterm').length)>50,'термины кликабельны в упражнениях');
 await p.click('[data-tab="tests"]');check(await p.evaluate(()=>document.querySelectorAll('#tests [data-tsgo]').length)===8,'список тестов: 7 уроков + итоговый');
 for(const key of ['2','final']){
  await p.click(`#tests [data-tsgo="${key}"]`);let qn=0;
  for(let k=0;k<20;k++){
   if(!(await p.$('.tscard')))break;qn++;
   const kind=await p.evaluate(()=>document.querySelector('.tscard .ty').innerText);
   if(/вписать/i.test(kind))await p.fill('[data-tsform] input','а');
   else if(/разложить/i.test(kind)){const n=(await p.$$('.tssr')).length;for(let i=0;i<n;i++)await p.click(`[data-tss="${i}"]`)}
   else await p.click('[data-tsa="0"]');
   await p.click('[data-tsnext]');
  }
  check(!!(await p.$('.tsgrade'))&&qn===(key==='final'?12:6),`тест ${key==='final'?'итоговый':'по уроку '+key}: ${qn} вопросов, оценка`);
  await p.click('[data-tslist]');
 }
 check(await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('rus-uchebnik-v1'));return !!(s.tests&&s.tests['prichastie:final']&&s.tlog&&s.tlog.length===2)}),'результаты тестов сохраняются');
 errs.forEach(e=>fail.push('JS: '+e));
 ok.forEach(m=>console.log('  ✓ '+m));fail.forEach(m=>console.log('  ✗ '+m));
 console.log(fail.length?`Ошибок: ${fail.length}`:`Всё работает (${ok.length} проверок)`);
 fs.unlinkSync(T);await b.close();process.exit(fail.length?1:0);
})();
