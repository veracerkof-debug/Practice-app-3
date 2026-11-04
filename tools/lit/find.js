// Поиск предложений в корпусе русской классики (lit/sent.jsonl, ~270 тыс. предложений, 24 автора).
// node tools/lit/find.js "<регулярка>" [--a "Чехов"] [--w "Степь"] [--n 40] [--poem|--prose] [--min 40] [--max 200]
// Регулярка — JS, флаг i; для границ слова вместо \b: (?<![а-яё]) и (?![а-яё]).
// --seed <число> — другая случайная выборка. Тексты — без буквы ё: восстанавливать её вручную.
// Исключает предложения, уже использованные в упражнениях любой главы (src/chapters/*/classic.js) и в файлах из --used <папка>.
const fs=require('fs'),path=require('path');const B=path.resolve(__dirname,'../../.cache/lit'),ROOT=path.resolve(__dirname,'../..');
const a=process.argv.slice(2);const opt=k=>{const i=a.indexOf(k);return i>=0?a[i+1]:null};
const re=new RegExp(a[0],'i'),A=opt('--a'),W=opt('--w'),N=+(opt('--n')||40),MIN=+(opt('--min')||30),MAX=+(opt('--max')||260);
const used=new Set();const add=t=>{const w=t.toLowerCase().replace(/ё/g,'е').split(/[^а-я]+/).filter(Boolean);for(let i=0;i+4<=w.length;i++)used.add(w.slice(i,i+4).join(' '))};
for(const ch of fs.readdirSync(ROOT+'/src/chapters')){try{add(fs.readFileSync(ROOT+'/src/chapters/'+ch+'/classic.js','utf8'))}catch(e){}}
const U=opt('--used');if(U)for(const f of fs.readdirSync(U))if(/\.(js|md)$/.test(f))add(fs.readFileSync(path.join(U,f),'utf8'));
let n=0;const L=fs.readFileSync(B+'/sent.jsonl','utf8').split('\n');
// перемешать детерминированно, чтобы выдача не была всегда из первых авторов
let st=+(opt('--seed')||Date.now()%100000);const rnd=()=>{st|=0;st=st+0x6D2B79F5|0;let t=Math.imul(st^st>>>15,1|st);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
for(let i=L.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[L[i],L[j]]=[L[j],L[i]]}
for(const l of L){if(!l)continue;const o=JSON.parse(l);if(A&&!o.a.includes(A))continue;if(W&&!o.w.includes(W))continue;
 if(a.includes('--poem')&&!o.p)continue;if(a.includes('--prose')&&o.p)continue;if(o.s.length<MIN||o.s.length>MAX)continue;if(!re.test(o.s))continue;
 const w=o.s.toLowerCase().replace(/ё/g,'е').split(/[^а-я]+/).filter(Boolean);let hit=false;for(let i=0;i+4<=w.length;i++)if(used.has(w.slice(i,i+4).join(' '))){hit=true;break}if(hit)continue;
 console.log(`${o.a} | ${o.w} | ${o.s}`);if(++n>=N)break}
