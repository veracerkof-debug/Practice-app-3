// Аудит пропусков: все слова с «..» и «_» во всех файлах главы.
global.CHAPTERS={};global.LABS={};global.relab=()=>{};global.document={addEventListener(){}};const fs=require('fs');
const D=require('path').resolve(__dirname,'../../src/chapters/koren')+'/';
eval(['lessons','bank','classic','labs','tests'].map(f=>fs.readFileSync(D+f+'.js','utf8')).join('\n;\n')+';global.R={B:KR_BANK,X:KR_CLASSIC,T:KR_TESTS,S:KR_STEP}');
const out=[];const add=(src,t)=>{for(const m of String(t).matchAll(/[А-Яа-яЁё-]*(?:\.\.|_)(?:[А-Яа-яЁё-]+(?:\.\.|_))*[А-Яа-яЁё-]*/g))out.push([src,m[0].toLowerCase()])};
R.X.forEach(e=>{add('упр.'+e.n,e.body);add('упр.'+e.n+' образец',e.obr||'')});R.B.forEach((b,i)=>add('тренажёр '+(i+1),b.w));
R.T.forEach((s,i)=>{(s.items||[]).forEach(x=>{if(Array.isArray(x))add('тест '+(i+1),x[0]);else{add('тест '+(i+1),x.w||'');(x.o||[]).forEach(o=>add('тест '+(i+1),o))}});(s.o||[]).forEach(o=>add('тест '+(i+1),o))});
for(const id in R.S)R.S[id].items.forEach(x=>add('схема '+id,x.w));
// Намеренно ударные пропуски: правило «под ударением — как слышится» в корнях гар/гор, зар/зор, клан/клон, твар/твор (урок 4) и «выскочка».
const STRESSED=new Set(['заг_р','наг_р','наг..р','накл_н','з_рька','з..рькой','кл_няться','з_рево','ог_рок','раскл..нялся','тв..рчества','выск_чка']);
// Слова, где второй пропуск заведомо ударный и это входит в задание (сравнить: проверяется / под ударением): д..р..вня, м..л..ток (упр. 6).
const SPECIAL=new Set(['д..р..вня','м..л..ток']);
const u={};for(const [s,w] of out){(u[w]=u[w]||[]).push(s)}
const words=Object.keys(u).sort();
const mode=process.argv[2]||'list';
if(mode==='list')console.log(words.map(w=>w+(STRESSED.has(w)?'  [ударный, намеренно]':SPECIAL.has(w)?'  [второй пропуск ударный, намеренно]':'')+'\t'+[...new Set(u[w])].join(', ')).join('\n'));
console.error('всего пропусков:',out.length,'разных слов:',words.length,'намеренно ударных:',words.filter(w=>STRESSED.has(w)).length);
