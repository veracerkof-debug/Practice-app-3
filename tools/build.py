#!/usr/bin/env python3
"""Сборка учебника в один файл. Две версии (решение владельца, 04.11.2026):
  ученик  — dist/index.html и www/index.html (Pages, Android): ключей к упражнениям в тетрадь НЕТ в файле вообще;
  учитель — dist/teacher.html (полная страница): те же упражнения с ответами. В www/ (Pages, Android) не попадает.

Порядок файлов важен: всё исполняется внутри одной функции (()=>{ ... })(),
поэтому позже объявленное может использовать раньше объявленное.
Новую главу добавляйте в CHAPTERS (lessons → bank → classic → index → labs).
"""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = ['src/css/base.css', 'src/css/nav.css', 'src/css/dictionary.css', 'src/css/home.css', 'src/css/wide.css', 'src/css/end.css']
JS = [
    'src/js/core/store.js',            # хранилище, PARTS (оглавление курса)
    'src/data/corpus/levels.js',        # общий корпус: порядок изучения тем, уровни доступа, разборы
    'src/data/corpus/orthograms.js',    # ORTHO_R — правила орфограмм для разметки слов
    'src/data/corpus/sentences.js',     # CORPUS_S — предложения с полной разметкой
    'src/data/corpus/words.js',         # CORPUS_W — слова
    'src/data/corpus/texts.js',         # CORPUS_T — связные тексты (отрывки классики)
    'src/chapters/nn/lessons.js',       # глава «Н и НН»: теория
    'src/chapters/nn/bank.js',          #   тренажёр
    'src/chapters/nn/classic.js',       #   упражнения в тетрадь
    'src/js/core/trainer.js',           # общий тренажёр
    'src/js/core/classic.js',           # общий вывод упражнений
    'src/chapters/nn/index.js',         #   сборка главы «Н и НН»
    'src/chapters/nn/workshop.js',      #   механики тренажёра «Н и НН»
    'src/chapters/nn/tests.js',         #   тесты «Н и НН»
    'src/chapters/prichastie/lessons.js',
    'src/chapters/prichastie/bank.js',
    'src/chapters/prichastie/classic.js',
    'src/chapters/prichastie/tests.js', #   тесты «Причастия»
    'src/chapters/prichastie/workshop.js', # размеченный материал для механик тренажёра
    'src/chapters/deeprich/lessons.js',  # глава «Деепричастие»: теория
    'src/chapters/deeprich/bank.js',     #   тренажёр
    'src/chapters/deeprich/classic.js',  #   упражнения в тетрадь
    'src/chapters/deeprich/tests.js',    #   тесты
    'src/chapters/deeprich/index.js',    #   подключение
    'src/chapters/zvuki/lessons.js',
    'src/chapters/zvuki/bank.js',
    'src/chapters/zvuki/classic.js',
    'src/chapters/zvuki/tests.js',
    'src/chapters/zvuki/index.js',
    'src/chapters/slog/lessons.js',
    'src/chapters/slog/bank.js',
    'src/chapters/slog/classic.js',
    'src/chapters/slog/tests.js',
    'src/chapters/slog/index.js',
    'src/chapters/udar/lessons.js',
    'src/chapters/udar/bank.js',
    'src/chapters/udar/classic.js',
    'src/chapters/udar/tests.js',
    'src/chapters/udar/index.js',
    'src/chapters/proizn/lessons.js',
    'src/chapters/proizn/bank.js',
    'src/chapters/proizn/classic.js',
    'src/chapters/proizn/tests.js',
    'src/chapters/proizn/index.js',
    'src/chapters/koren/lessons.js',
    'src/chapters/koren/bank.js',
    'src/chapters/koren/classic.js',
    'src/chapters/koren/tests.js',
    'src/chapters/koren/index.js',
    'src/chapters/soglas/lessons.js',
    'src/chapters/soglas/bank.js',
    'src/chapters/soglas/classic.js',
    'src/chapters/soglas/tests.js',
    'src/chapters/soglas/index.js',
    'src/chapters/pristavki/lessons.js',
    'src/chapters/pristavki/bank.js',
    'src/chapters/pristavki/classic.js',
    'src/chapters/pristavki/tests.js',
    'src/chapters/pristavki/index.js',
    'src/chapters/shipyashie/lessons.js',
    'src/chapters/shipyashie/bank.js',
    'src/chapters/shipyashie/classic.js',
    'src/chapters/shipyashie/tests.js',
    'src/chapters/shipyashie/index.js',
    'src/chapters/znaki/lessons.js',
    'src/chapters/znaki/bank.js',
    'src/chapters/znaki/classic.js',
    'src/chapters/znaki/tests.js',
    'src/chapters/znaki/index.js',
    'src/chapters/leks/lessons.js',
    'src/chapters/leks/bank.js',
    'src/chapters/leks/classic.js',
    'src/chapters/leks/tests.js',
    'src/chapters/leks/index.js',
    'src/chapters/omon/lessons.js',
    'src/chapters/omon/bank.js',
    'src/chapters/omon/classic.js',
    'src/chapters/omon/tests.js',
    'src/chapters/omon/index.js',
    'src/chapters/fraz/lessons.js',
    'src/chapters/fraz/bank.js',
    'src/chapters/fraz/classic.js',
    'src/chapters/fraz/tests.js',
    'src/chapters/fraz/index.js',
    'src/chapters/sush/lessons.js',
    'src/chapters/sush/bank.js',
    'src/chapters/sush/classic.js',
    'src/chapters/sush/tests.js',
    'src/chapters/sush/index.js',
    'src/chapters/pril/lessons.js',
    'src/chapters/pril/bank.js',
    'src/chapters/pril/classic.js',
    'src/chapters/pril/tests.js',
    'src/chapters/pril/index.js',
    'src/chapters/ne/lessons.js',
    'src/chapters/ne/bank.js',
    'src/chapters/ne/classic.js',
    'src/chapters/ne/tests.js',
    'src/chapters/ne/index.js',
    'src/chapters/stili/lessons.js',   # глава «Стили речи»
    'src/chapters/stili/bank.js',
    'src/chapters/stili/classic.js',
    'src/chapters/stili/tests.js',
    'src/chapters/stili/index.js',
    'src/chapters/normy/lessons.js',   # глава «Грамматические нормы»
    'src/chapters/normy/bank.js',
    'src/chapters/normy/classic.js',
    'src/chapters/normy/tests.js',
    'src/chapters/normy/index.js',
    'src/chapters/leknorm/lessons.js',   # глава «Лексические нормы» (в DRAFT, пока не проверена)
    'src/chapters/leknorm/bank.js',
    'src/chapters/leknorm/classic.js',
    'src/chapters/leknorm/tests.js',
    'src/chapters/leknorm/index.js',
    'src/chapters/slozhnoe/lessons.js', # глава «Сложное предложение»
    'src/chapters/slozhnoe/bank.js',
    'src/chapters/slozhnoe/classic.js',
    'src/chapters/slozhnoe/tests.js',
    'src/chapters/slozhnoe/index.js',
    'src/chapters/rech/lessons.js',     # глава «Прямая речь и цитаты»
    'src/chapters/rech/bank.js',
    'src/chapters/rech/classic.js',
    'src/chapters/rech/tests.js',
    'src/chapters/rech/index.js',
    'src/chapters/tekst/lessons.js',   # глава «Текст»
    'src/chapters/tekst/bank.js',
    'src/chapters/tekst/classic.js',
    'src/chapters/tekst/tests.js',
    'src/chapters/tekst/index.js',
    'src/chapters/tipy/lessons.js',   # глава «Типы речи»
    'src/chapters/tipy/bank.js',
    'src/chapters/tipy/classic.js',
    'src/chapters/tipy/tests.js',
    'src/chapters/tipy/index.js',
    'src/chapters/vyraz/lessons.js',   # глава «Выразительные средства»
    'src/chapters/vyraz/bank.js',
    'src/chapters/vyraz/classic.js',
    'src/chapters/vyraz/tests.js',
    'src/chapters/vyraz/index.js',
    'src/chapters/sostav/lessons.js',   # глава «Морфемика» (проверена 13.11.2026)
    'src/chapters/sostav/bank.js',
    'src/chapters/sostav/classic.js',
    'src/chapters/sostav/tests.js',
    'src/chapters/sostav/index.js',
    'src/chapters/slovoobr/lessons.js',
    'src/chapters/slovoobr/bank.js',
    'src/chapters/slovoobr/classic.js',
    'src/chapters/slovoobr/tests.js',
    'src/chapters/slovoobr/index.js',
    'src/chapters/raznye/lessons.js',
    'src/chapters/raznye/bank.js',
    'src/chapters/raznye/classic.js',
    'src/chapters/raznye/tests.js',
    'src/chapters/raznye/index.js',
    'src/chapters/znakisvod/lessons.js',
    'src/chapters/znakisvod/bank.js',
    'src/chapters/znakisvod/classic.js',
    'src/chapters/znakisvod/tests.js',
    'src/chapters/znakisvod/index.js',
    'src/chapters/glag/lessons.js',
    'src/chapters/glag/bank.js',
    'src/chapters/glag/classic.js',
    'src/chapters/glag/tests.js',
    'src/chapters/glag/index.js',
    'src/chapters/chisl/lessons.js',
    'src/chapters/chisl/bank.js',
    'src/chapters/chisl/classic.js',
    'src/chapters/chisl/tests.js',
    'src/chapters/chisl/index.js',
    'src/chapters/mest/lessons.js',
    'src/chapters/mest/bank.js',
    'src/chapters/mest/classic.js',
    'src/chapters/mest/tests.js',
    'src/chapters/mest/index.js',
    'src/chapters/narech/lessons.js',
    'src/chapters/narech/bank.js',
    'src/chapters/narech/classic.js',
    'src/chapters/narech/tests.js',
    'src/chapters/narech/index.js',
    'src/chapters/nn/labs.js',          # интерактивные схемы «Н и НН» + реестр LABS
    'src/chapters/prichastie/labs.js',  # схемы «Причастия»
    'src/chapters/zvuki/labs.js',       # схемы «Звуков и букв»
    'src/chapters/slog/labs.js',        # схемы «Слога и переноса»
    'src/chapters/udar/labs.js',        # схемы «Ударения»
    'src/chapters/proizn/labs.js',
    'src/chapters/koren/labs.js',
    'src/chapters/soglas/labs.js',
    'src/chapters/pristavki/labs.js',
    'src/chapters/shipyashie/labs.js',
    'src/chapters/znaki/labs.js',
    'src/chapters/leks/labs.js',
    'src/chapters/omon/labs.js',
    'src/chapters/fraz/labs.js',
    'src/chapters/sush/labs.js',
    'src/chapters/pril/labs.js',
    'src/chapters/ne/labs.js',
    'src/chapters/deeprich/labs.js',    # схемы «Деепричастия»
    'src/chapters/stili/labs.js',       # схемы «Стилей речи»
    'src/chapters/normy/labs.js',       # схемы «Грамматических норм»
    'src/chapters/leknorm/labs.js',     # схемы «Лексических норм»
    'src/chapters/slozhnoe/labs.js',    # схемы «Сложного предложения»
    'src/chapters/rech/labs.js',        # схемы «Прямой речи и цитат»
    'src/chapters/tekst/labs.js',       # схемы «Текста»
    'src/chapters/tipy/labs.js',        # схемы «Типов речи»
    'src/chapters/vyraz/labs.js',       # схемы «Выразительных средств»
    'src/chapters/sostav/labs.js',      # схемы «Морфемики»
    'src/chapters/slovoobr/labs.js',
    'src/chapters/glag/labs.js',
    'src/chapters/chisl/labs.js',
    'src/chapters/mest/labs.js',
    'src/chapters/narech/labs.js',
    'src/chapters/raznye/labs.js',
    'src/chapters/znakisvod/labs.js',
    'src/js/core/tests.js',             # тесты: сборка вариантов, прохождение, оценка
    'src/js/core/mech.js',              # механики тренажёра: выделить, подчеркнуть, собрать, разобрать…
    'src/js/core/inline-ex.js',
    'src/js/core/cards.js',             # карточки (интервальное повторение)
    'src/data/glossary.js',             # GLOSS — глоссарий
    'src/data/spelling-words.js',       # WORDS — словарик правописания
    'src/js/core/nav.js',               # термины, ссылки, оглавление, глоссарий, словарик
    'src/data/dictionary/forms.js',     # FORMS — формы слов (OpenCorpora)
    'src/data/dictionary/entries-1.js', # DICT1 — статьи умного словаря
    'src/data/dictionary/entries-2.js', # DICT2
    'src/js/core/dictionary.js',        # карточка слова
    'src/js/core/stats.js',             # статистика на устройстве: ступени уроков, слабые места, время, копия данных
    'src/js/core/home.js',              # главная (#home) и кабинет «Мои результаты» (#me)
    'src/js/core/screens.js',           # экраны, маршруты, обработчики
]
# главы, которые ещё проходят проверки (PRINCIPLES §8, §9.3): в сборку не входят, пока не пройдут проверку и исправление;
# так законченная тема уходит на сайт сразу, а незаконченная — не раньше времени
DRAFT = set()
JS = [p for p in JS if not (p.startswith('src/chapters/') and p.split('/')[2] in DRAFT)]
def read(p):
    with open(os.path.join(ROOT, p), encoding='utf-8') as f: return f.read()
# ключи упражнений в тетрадь: поле key:'…' в src/chapters/*/classic.js
KEY_RE = re.compile(r"\s*key:'(?:[^'\\]|\\.)*'")
def js_for(teacher):
    out = ['const TEACHER=%s;\n' % ('true' if teacher else 'false')]
    for p in JS:
        t = read(p)
        if not teacher and p.endswith('/classic.js') and p.startswith('src/chapters/'):
            t, n = KEY_RE.subn('', t)
            t = re.sub(r",(\s*)\}", r"\1}", t)        # хвостовая запятая перед } после вырезанного key
            assert "key:" not in t, p + ': ключ не вырезан'
        out.append(t if t.endswith('\n') else t + '\n')
    return ''.join(out)
DECL_RE = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)
def check_js():
    """Защита от поломки всего учебника: одно имя верхнего уровня в двух файлах и синтаксические ошибки."""
    seen, errs = {}, []
    for p in JS:
        for m in DECL_RE.finditer(read(p)):
            n = m.group(1)
            if n in seen and seen[n] != p: errs.append(f'имя {n} объявлено и в {seen[n]}, и в {p}')
            seen.setdefault(n, p)
    if errs: sys.exit('Ошибка сборки:\n  ' + '\n  '.join(errs))
    import shutil, subprocess
    if shutil.which('node'):
        for p in JS:   # каждый файл — отдельно, чтобы ошибка указывала на файл
            r = subprocess.run(['node', '--check', os.path.join(ROOT, p)], capture_output=True, text=True)
            if r.returncode: sys.exit(f'Синтаксическая ошибка в {p}:\n{r.stderr.strip()[:600]}')
def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f: f.write(text)
def page(t):
    return ('<!doctype html><html lang="ru"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '</head><body>' + t + '</body></html>\n')
def build():
    check_js()
    tpl = read('src/index.html').replace('/*@CSS*/\n', ''.join(read(p) for p in CSS))
    for teacher, name in ((False, 'index'), (True, 'teacher')):
        t = tpl.replace('/*@JS*/\n', js_for(teacher))
        if teacher:
            write(os.path.join(ROOT, 'dist', 'teacher.html'), page(t))
        else:
            write(os.path.join(ROOT, 'dist', 'index.html'), t)
            write(os.path.join(ROOT, 'www', 'index.html'), page(t))   # полная страница для Pages и Android
        print('dist/%s.html' % name, len(t.encode('utf-8')) // 1024, 'КБ', '(учитель, с ответами)' if teacher else '(ученик, без ответов)')
if __name__ == '__main__': build()
