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
CSS = ['src/css/base.css', 'src/css/nav.css', 'src/css/dictionary.css', 'src/css/wide.css', 'src/css/end.css']
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
    'src/chapters/nn/labs.js',          # интерактивные схемы «Н и НН» + реестр LABS
    'src/chapters/prichastie/labs.js',  # схемы «Причастия»
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
    'src/js/core/screens.js',           # экраны, маршруты, обработчики
]
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
def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f: f.write(text)
def page(t):
    return ('<!doctype html><html lang="ru"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '</head><body>' + t + '</body></html>\n')
def build():
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
