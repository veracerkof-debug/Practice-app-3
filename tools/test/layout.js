// Проверка вёрстки: ищет вылезающие за границы элементы на всех экранах при трёх ширинах.
// Запуск: node tools/test/layout.js   (нужен playwright)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const ROOT=path.resolve(__dirname,'../..');const TMP=path.join(ROOT,'dist','_test.html');
(async()=>{
 fs.writeFileSync(TMP,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+fs.readFileSync(path.join(ROOT,'dist/index.html'),'utf8')+'</body></html>');
 const b=await chromium.launch();let bad=0;const errs=[];
 for(const W of [360,768,1280]){
  const p=await b.newPage({viewport:{width:W,height:900}});p.on('pageerror',e=>errs.push(W+' '+e.message));
  const routes=['toc','glossary','dict','cards','deck-nn','deck-udar'];
  for(const ch of ['nn','prichastie'])for(const tab of ['theory','train','classic'])routes.push('ch-'+ch+'|'+tab);
  routes.push('ch-deeprich|theory'); // главы «пока только теория»
  // главы фонетики — если они в сборке (черновики DRAFT из tools/build.py в неё не входят)
  for(const ch of ['zvuki','slog','udar'])for(const tab of ['theory','train','classic','tests'])routes.push('?'+ch+'|'+tab);
  await p.goto('file://'+TMP+'#toc');
  const words=await p.evaluate(()=>[...document.querySelectorAll('[data-word]')].length?[]:[]);
  await p.goto('file://'+TMP+'#dict');const ws=await p.evaluate(()=>[...new Set([...document.querySelectorAll('.wcloud [data-word]')].map(b=>b.dataset.word))]);
  ws.forEach(w=>routes.push('w-'+encodeURIComponent(w)));
  for(const r0 of routes){const opt=r0[0]==='?',r=opt?'ch-'+r0.slice(1):r0;const [h,tab]=r.split('|');
   await p.goto('file://'+TMP+'#'+h);
   if(opt&&!(await p.$(`[data-tab="${tab}"]`)))continue; // главы нет в сборке или вкладки ещё нет
   if(tab){await p.click(`[data-tab="${tab}"]`);if(tab==='train'){const g=await p.$('[data-trgo]');if(g){await g.click()}}}
   await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
   await p.waitForTimeout(30);
   const res=await p.evaluate(()=>{const out=[];const vw=document.documentElement.clientWidth;
    const scrollable=el=>{for(let e=el;e;e=e.parentElement){const o=getComputedStyle(e).overflowX;if(o==='auto'||o==='scroll')return true}return false};
    if(document.documentElement.scrollWidth>vw+1)out.push('page scrollWidth '+document.documentElement.scrollWidth);
    document.querySelectorAll('#app *').forEach(el=>{if(el.closest('.abc,.bklnav'))return;const r=el.getBoundingClientRect();if(!r.width)return;
     const par=el.parentElement.closest('.wsec,.bins,.bklex,.tpart,.gterm,.sheet,.card,.lab,.dlist,.study,.bhero,.clex,.bkles');
     if(scrollable(el))return;
     if(r.right>vw+1)out.push('viewport: '+el.tagName+'.'+el.className+' «'+(el.textContent||'').trim().slice(0,30)+'» '+Math.round(r.right));
     else if(par){const pr=par.getBoundingClientRect();if(r.right>pr.right+1)out.push('in '+par.className.split(' ')[0]+': '+el.tagName+'.'+el.className+' «'+(el.textContent||'').trim().slice(0,30)+'» +'+Math.round(r.right-pr.right))}});
    return [...new Set(out)].slice(0,6)});
   if(res.length){bad++;console.log(W,r);res.forEach(x=>console.log('   ',x))}
  }
  await p.close();
 }
 console.log(errs.length?errs.join('\n'):'JS: без ошибок');console.log(bad?'Проблемных экранов: '+bad:'Вёрстка: всё в границах');
 fs.unlinkSync(TMP);await b.close();
})();
