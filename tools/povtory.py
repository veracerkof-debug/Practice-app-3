#!/usr/bin/env python3
"""Повторы слов в заданиях главы — по местам и по леммам (PRINCIPLES §5.7).

Запуск: python3 tools/povtory.py <id главы> [порог=7] [--slovo лемма]
Нужен pymorphy3 (pip install pymorphy3). Место — одно задание тренажёра (условие и свои варианты; общий набор вариантов-ярлыков не считается),
одно упражнение (образец и материал, без задания и ключа), один слот теста (все его примеры).
Подписи цитат «(И. О. Фамилия, «Название»)» из счёта убраны. Печатает леммы, которые стоят
в «порог» и более местах, и сами места: Т12 — задание тренажёра № 12 (с единицы), №34 — упражнение,
т3.5 — тест урока 3, слот 5. С ключом --slovo печатает места одной леммы.
Служебные слова и слова оформления (STOP) не считаются.
"""
import sys, re, json, subprocess, pathlib
import pymorphy3
ROOT = pathlib.Path(__file__).resolve().parent.parent
cid = sys.argv[1]; args = sys.argv[2:]
slovo = args[args.index('--slovo') + 1] if '--slovo' in args else None
porog = int(args[0]) if args and args[0].isdigit() else 7
JS = r"""
const fs=require('fs'),path=require('path'),vm=require('vm');const ROOT=process.argv[1],id=process.argv[2];
const dir=path.join(ROOT,'src/chapters',id);
const box={MECH:{},relab(){},queueMicrotask:f=>f(),console,document:{addEventListener(){},getElementById(){return null},querySelector(){return null},querySelectorAll(){return []}},shuffle:a=>a,pick1:a=>a[0],esc:s=>String(s),window:{},localStorage:{getItem(){return null},setItem(){}},S:{}};
vm.createContext(box);
const PRE=['src/js/core/store.js','src/data/corpus/levels.js','src/data/corpus/orthograms.js','src/data/corpus/sentences.js','src/data/corpus/words.js','src/data/corpus/texts.js'].map(f=>path.join(ROOT,f)).filter(f=>fs.existsSync(f));
const files=['lessons','bank','classic','labs','tests','workshop','index'].map(f=>path.join(dir,f+'.js')).filter(f=>fs.existsSync(f));
const SRC=[...PRE,...files].map(f=>fs.readFileSync(f,'utf8')).join('\n;\n');
const pre=(/^const CHAPTERS\b/m.test(SRC)?'':'var CHAPTERS={};')+(/^const LABS\b/m.test(SRC)?'':'var LABS={};');
vm.runInContext(pre+SRC+'\n;globalThis.__C=CHAPTERS;',box);const C=box.__C[id];const out=[];
const oc={};(C.bank||[]).forEach(b=>{const k=(b.opts||[]).join('|');oc[k]=(oc[k]||0)+1});
(C.bank||[]).forEach((b,i)=>out.push(['Т'+(i+1),b.w+' '+(oc[(b.opts||[]).join('|')]>2?'':(b.opts||[]).join(' '))]));
(C.classic||[]).forEach(e=>out.push(['№'+e.n,(e.obr||'')+' '+(e.body||'')]));
const cnt={};(C.tests||[]).forEach(s=>{cnt[s.l]=(cnt[s.l]||0)+1;out.push(['т'+s.l+'.'+cnt[s.l],(s.items||[]).map(x=>Array.isArray(x)?x[0]:((x.w||'')+' '+(x.o||[]).join(' '))).join(' ')+' '+(s.cats||[]).join(' ')])});
console.log(JSON.stringify(out));
"""
places = json.loads(subprocess.run(['node', '-e', JS, str(ROOT), cid], capture_output=True, text=True, check=True).stdout)
STOP = set('''быть весь это этот тот такой который свой наш мой твой ваш его её их он она оно они мы вы ты я себя кто что как так там тут где
когда если чтобы потому или либо тоже также уже ещё еще только даже лишь вот ведь же бы ли не ни да нет но а и в во на с со к ко у о об от до по за из
под над при для без через между перед про один два три первый второй другой каждый самый очень можно нужно надо мочь стать сказать говорить
слово предложение текст пояснение набор часть сочетание пример группа ошибка правка оборот фраза вопрос задание вариант объявление запись
год день время человек раз чем всё после много какой среди есть писатель строка большой'''.split())
SIG = re.compile(r'\((?:[А-ЯЁ]\. ){1,2}[А-ЯЁ][а-яё-]+(?:, [^()]*)?\)')
m = pymorphy3.MorphAnalyzer(); lem = {}
def L(w):
    if w not in lem: lem[w] = m.parse(w)[0].normal_form
    return lem[w]
where = {}
for tag, txt in places:
    txt = SIG.sub(' ', txt.replace('<br>', ' ')).lower().replace('́', '')
    for l in {L(w) for w in re.findall(r'[а-яё]{3,}', txt)}:
        if l not in STOP: where.setdefault(l, []).append(tag)
if slovo:
    print(slovo, len(where.get(slovo, [])), ' '.join(where.get(slovo, [])))
else:
    rows = sorted(((len(v), k, v) for k, v in where.items() if len(v) >= porog), reverse=True)
    for n, k, v in rows: print(f'{k} — {n}: ' + ' '.join(v))
    print(f'\nлемм в {porog} и более местах: {len(rows)}')
