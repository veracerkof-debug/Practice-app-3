#!/usr/bin/env python3
"""Сборка учебника в один файл dist/index.html (+ www/index.html — полная страница для Pages и Android).

Порядок файлов важен: всё исполняется внутри одной функции (()=>{ ... })(),
поэтому позже объявленное может использовать раньше объявленное.
Новую главу добавляйте в CHAPTERS (lessons → bank → classic → index → labs).
"""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = ['src/css/base.css', 'src/css/nav.css', 'src/css/dictionary.css', 'src/css/wide.css', 'src/css/end.css']
JS = [
    'src/js/core/store.js',            # хранилище, PARTS (оглавление курса)
    'src/data/corpus/levels.js',        # общий корпус: порядок изучения тем, уровни доступа, разборы
    'src/data/corpus/orthograms.js',    # ORTHO_R — правила орфограмм для разметки слов
    'src/data/corpus/sentences.js',     # CORPUS_S — предложения с полной разметкой
    'src/data/corpus/words.js',         # CORPUS_W — слова
    'src/chapters/nn/lessons.js',       # глава «Н и НН»: теория
    'src/chapters/nn/bank.js',          #   тренажёр
    'src/chapters/nn/classic.js',       #   упражнения в тетрадь
    'src/js/core/trainer.js',           # общий тренажёр
    'src/js/core/classic.js',           # общий вывод упражнений
    'src/chapters/nn/index.js',         #   сборка главы «Н и НН»
    'src/chapters/nn/workshop.js',      #   механики тренажёра «Н и НН»
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
def build():
    t = read('src/index.html')
    t = t.replace('/*@CSS*/\n', ''.join(read(p) for p in CSS))
    t = t.replace('/*@JS*/\n', ''.join(read(p) if read(p).endswith('\n') else read(p)+'\n' for p in JS))
    out = os.path.join(ROOT, 'dist', 'index.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f: f.write(t)
    print('dist/index.html', len(t.encode('utf-8')) // 1024, 'КБ')
    # www/index.html — полноценная страница для GitHub Pages и Android (Capacitor)
    www = os.path.join(ROOT, 'www', 'index.html')
    os.makedirs(os.path.dirname(www), exist_ok=True)
    with open(www, 'w', encoding='utf-8') as f:
        f.write('<!doctype html><html lang="ru"><head><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
                '</head><body>' + t + '</body></html>\n')
    print('www/index.html')
if __name__ == '__main__': build()
