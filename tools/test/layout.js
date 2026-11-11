// Проверка вёрстки: ищет вылезающие за границы элементы на всех экранах при трёх ширинах.
// Запуск: node tools/test/layout.js   (нужен playwright)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const ROOT=path.resolve(__dirname,'../..');const TMP=path.join(ROOT,'dist','_test.html');
// «старый ученик»: длинное имя, ответы, тесты, время, заданное — чтобы проверить заполненные главную и кабинет
const SEED=()=>{const C=window.__T.CHAPTERS,day=Math.floor(Date.now()/864e5),p=n=>String(n).padStart(2,'0'),dk=o=>{const d=new Date();d.setDate(d.getDate()-o);return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())};
 const S={done:{},cards:{},view:'book',tests:{},ans:{},seen:{},time:{},prof:{name:'Константин-Александр',sur:'Староконстантиновский',cls:'11 «Б»'}};
 Object.values(C).slice(0,6).forEach((c,ci)=>c.lessons.forEach((l,i)=>{S.seen[l.id]=1;S.ans[l.id]={r:i%2?'101001101001':'11110111111011',n:14,ok:9,at:day-i};if(c.tests&&(ci+i)%3)S.tests[c.id+':'+(i+1)]={best:5,last:2+(i+ci)%4,tries:2,at:day-i}}));
 S.at={ch:'prichastie',tab:'train',l:3};S.recent=[{ch:'prichastie',r:'12-15,18,20-22,30',at:1},{ch:'nn',r:'4-6,10',at:1},{ch:'zvuki',r:'1',at:1}];
 for(let i=0;i<28;i++)if(i%3)S.time[dk(i)]=600+i*400;for(let i=1;i<30;i++)S.done['cl-nn-'+i]=true;
 localStorage.setItem('rus-uchebnik-v1',JSON.stringify(S))};
(async()=>{
 fs.writeFileSync(TMP,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+fs.readFileSync(path.join(ROOT,'dist/index.html'),'utf8')+'</body></html>');
 const b=await chromium.launch();let bad=0,P=null;const errs=[];
 for(const W of [360,768,1280]){
  const p=await b.newPage({viewport:{width:W,height:900}});P=p;p.on('pageerror',e=>errs.push(W+' '+e.message));
  const routes=['home','me','toc','glossary','dict','cards','deck-nn','deck-udar'];
  for(const ch of ['nn','prichastie'])for(const tab of ['theory','train','classic'])routes.push('ch-'+ch+'|'+tab);
  // главы — если они в сборке (черновики DRAFT из tools/build.py в неё не входят)
  for(const ch of ['zvuki','slog','udar','deeprich'])for(const tab of ['theory','train','classic','tests'])routes.push('?'+ch+'|'+tab);
  await p.goto('file://'+TMP+'#toc');
  const words=await p.evaluate(()=>[...document.querySelectorAll('[data-word]')].length?[]:[]);
  await p.goto('file://'+TMP+'#dict');const ws=await p.evaluate(()=>[...new Set([...document.querySelectorAll('.wcloud [data-word]')].map(b=>b.dataset.word))]);
  ws.forEach(w=>routes.push('w-'+encodeURIComponent(w)));
  for(const r0 of routes){const opt=r0[0]==='?',r=opt?'ch-'+r0.slice(1):r0;const [h,tab]=r.split('|');
   await p.goto('file://'+TMP+'#'+h);
   if(opt&&!(await p.$(`[data-tab="${tab}"]`)))continue; // главы нет в сборке или вкладки ещё нет
   if(tab){await p.click(`[data-tab="${tab}"]`);if(tab==='train'){const g=await p.$('[data-trgo]');if(g){await g.click()}}}
   await p.evaluate(()=>{document.querySelectorAll('details').forEach(d=>d.open=true);document.querySelectorAll('.tpanel[hidden]').forEach(x=>x.hidden=false)}); // все главы оглавления раскрыты
   await p.waitForTimeout(30);
   const res=await measure();
   if(res.length){bad++;console.log(W,r);res.forEach(x=>console.log('   ',x))}
  }
  // главная и кабинет с заполненными данными (имя, ответы, тесты, время, заданное) и с раскрытыми панелями кабинета
  await p.goto('file://'+TMP+'?selftest#toc');await p.evaluate(SEED);
  for(const r of ['home','me','me+']){
   await p.goto('file://'+TMP+'#'+r.replace('+',''));await p.reload();
   if(r==='me+'){for(const s of ['[data-meedit="1"]','[data-bk="text"]','[data-wipe="1"]']){await p.click(s)}}
   await p.waitForTimeout(30);const res=await measure();
   if(res.length){bad++;console.log(W,r+' (с данными)');res.forEach(x=>console.log('   ',x))}
  }
  await p.evaluate(()=>localStorage.clear());
  await p.close();
 }
 console.log(errs.length?errs.join('\n'):'JS: без ошибок');console.log(bad?'Проблемных экранов: '+bad:'Вёрстка: всё в границах');
 fs.unlinkSync(TMP);await b.close();
 async function measure(){return P.evaluate(()=>{const out=[];const vw=document.documentElement.clientWidth;
    const scrollable=el=>{for(let e=el;e;e=e.parentElement){const o=getComputedStyle(e).overflowX;if(o==='auto'||o==='scroll')return true}return false};
    if(document.documentElement.scrollWidth>vw+1)out.push('page scrollWidth '+document.documentElement.scrollWidth);
    document.querySelectorAll('#app *').forEach(el=>{if(el.closest('.abc,.bklnav'))return;const r=el.getBoundingClientRect();if(!r.width)return;
     const par=el.parentElement.closest('.wsec,.bins,.bklex,.tpart,.gterm,.sheet,.card,.lab,.dlist,.study,.bhero,.clex,.bkles,.mec,.mebox,.hmbox,.hmlist,.hmbook,.hmcont,.hmrow,.merow');
     if(scrollable(el))return;
     if(r.right>vw+1)out.push('viewport: '+el.tagName+'.'+el.className+' «'+(el.textContent||'').trim().slice(0,30)+'» '+Math.round(r.right));
     else if(par){const pr=par.getBoundingClientRect();if(r.right>pr.right+1)out.push('in '+par.className.split(' ')[0]+': '+el.tagName+'.'+el.className+' «'+(el.textContent||'').trim().slice(0,30)+'» +'+Math.round(r.right-pr.right))}});
    return [...new Set(out)].slice(0,6)})}
})();
