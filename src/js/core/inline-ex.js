// ---------- упражнения ----------
const exState={};
function exHTML(les){
 const st=exState[les.id]||(exState[les.id]={});
 let ok=0,tot=les.ex.length,ans=0;
 const items=les.ex.map((e,i)=>{
  const a=st[i];
  if(a){ans++; if(a===e.a) ok++;}
  const cls=a?(a===e.a?'ok':'bad'):'';
  const word=esc(e.w).replace('_',`<span class="slot ${cls}">${a?e.a:'…'}</span>`);
  const btns=['н','нн'].map(v=>{let c='';if(a){if(v===e.a)c='ok';else if(v===a)c='bad'}return `<button data-ex="${les.id}" data-i="${i}" data-v="${v}" class="${c}" ${a?'disabled':''} aria-label="${v}">${v}</button>`}).join('');
  const why=a?`<div class="why">${a===e.a?'<b class="okt">Верно.</b>':'<b class="badt">Неверно.</b>'} ${e.why}</div>`:'';
  return `<div class="item"><div class="line"><span class="w">${word}</span><span class="ans">${btns}</span></div>${why}</div>`;
 }).join('');
 const sc=ans===tot?`<div class="score"><span>Верно ${ok} из ${tot}</span><button class="linkbtn" data-exreset="${les.id}">Ещё раз</button></div>`:`<div class="score"><span>Ответов: ${ans} из ${tot}</span></div>`;
 return `<div class="bklex" id="ex-${les.id}"><div class="top"><b>Упражнения</b><span class="bkhint">выбрать букву</span></div><div class="items">${items}</div>${sc}
 <details class="bkhelp"><summary>Проще</summary><div class="body"><p>${les.easy}</p></div></details>
 <details class="bkhelp fix"><summary>Если не получается</summary><div class="body"><p>${les.fix}</p></div></details>
 ${les.deep?`<details class="bkhelp deep"><summary>Тонкости</summary><div class="body">${les.deep}</div></details>`:''}
 <button class="bkldone ${S.done[les.id]?'is':''}" data-done="${les.id}">${S.done[les.id]?'✓ Урок пройден':'Урок пройден'}</button></div>`;
}

