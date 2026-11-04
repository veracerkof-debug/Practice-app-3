#!/usr/bin/env python3
"""Вытаскивает из Викисловаря ударение и значения для списка слов.
Использование: python3 tools/dictionary/pick.py words.txt   (по слову в строке или через пробел)"""
import pickle, re, json, sys, os
import pymorphy3
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
E=pickle.load(open(os.path.join(ROOT,'.cache/wikt/E.pkl'),'rb')); M=pymorphy3.MorphAnalyzer()
W=open(sys.argv[1],encoding='utf-8').read().split()
def clean(h):
    h=re.sub(r'<i>◆.*?</i>','',h,flags=re.S)
    return [t for t in (re.sub(r'<[^>]+>','',x).strip() for x in re.findall(r'<li>(.*?)</li>',h,flags=re.S)) if t]
out={}
for w in W:
    es=E.get(w) or E.get(w.replace('ё','е')) or []
    p=M.parse(w)[0]
    out[w]={'wikt':[{'stressed':s,'meanings':clean(h)} for s,h in es],'tag':str(p.tag),'lemma':p.normal_form}
    if not es: print('нет в Викисловаре:',w)
json.dump(out,open(os.path.join(ROOT,'.cache/wikt/pilot_wikt.json'),'w'),ensure_ascii=False,indent=1)
print(len(out),'слов → .cache/wikt/pilot_wikt.json')
