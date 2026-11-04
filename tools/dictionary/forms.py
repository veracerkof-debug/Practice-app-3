#!/usr/bin/env python3
"""Таблицы форм для статей умного словаря (OpenCorpora через pymorphy3) → src/data/dictionary/forms.js.
Слова-причастия, которые pymorphy считает прилагательными, перечислены в over."""
import json,os,pymorphy3
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
M=pymorphy3.MorphAnalyzer()
d=json.load(open(os.path.join(ROOT,'.cache/wikt/pilot_wikt.json')))
C=['nomn','gent','datv','accs','ablt','loct']
def pick(p,pos,extra=()):
    for q in M.parse(p):
        if q.tag.POS==pos and all(e in q.tag for e in extra): return q
    return M.parse(p)[0]
def inf(lex,need):
    for f in lex:
        if all(n in f.tag for n in need): return f.word
    return ''
out={}
over={'брезжущий':'PRTF','колеблющийся':'PRTF','стелющийся':'PRTF','бреющий':'PRTF','гонимый':'PRTF','движимый':'PRTF','слышимый':'PRTF','видимый':'PRTF','обиженный':'PRTF','клеящий':'PRTF'}
for w in d:
    p=M.parse(w)[0];pos=p.tag.POS
    if w in over:
        q=pick(w,'PRTF')
        if q.tag.POS=='PRTF':p=q;pos='PRTF'
    lex=p.lexeme
    if pos in('ADJF','PRTF'):
        same=[f for f in lex if f.tag.POS==pos and (pos!='PRTF' or (f.tag.tense==p.tag.tense and f.tag.voice==p.tag.voice))]
        rows=[]
        for c in C:
            r=[]
            for g in ['masc','femn','neut','plur']:
                need=[c,g] if g!='plur' else [c,'plur']
                vs=[]
                for f in same:
                    if all(n in f.tag for n in need) and f.word not in vs and not (c=='ablt' and g=='femn' and f.word.endswith(('ою','ею'))): vs.append(f.word)
                r.append(' / '.join(vs[:2]))
            rows.append(r)
        sp='ADJS' if pos=='ADJF' else 'PRTS'
        short=[f.word for f in lex if f.tag.POS==sp and (pos!='PRTF' or (f.tag.tense==p.tag.tense and f.tag.voice==p.tag.voice))]
        sh=[]; [sh.append(x) for x in short if x not in sh]
        out[w]={'t':'adj','rows':rows,'short':sh[:4]}
    elif pos=='NOUN':
        rows=[[inf(lex,[c,'sing']),inf(lex,[c,'plur'])] for c in C]
        out[w]={'t':'noun','rows':rows}
    elif pos=='INFN':
        L=lex;g=lambda *n:inf(L,list(n))
        pres=[[g('1per','sing','pres') or g('1per','sing','futr'),g('1per','plur','pres') or g('1per','plur','futr')],
              [g('2per','sing','pres') or g('2per','sing','futr'),g('2per','plur','pres') or g('2per','plur','futr')],
              [g('3per','sing','pres') or g('3per','sing','futr'),g('3per','plur','pres') or g('3per','plur','futr')]]
        past=[g('past','masc'),g('past','femn'),g('past','neut'),g('past','plur')]
        imp=[g('impr','sing'),g('impr','plur')]
        parts=[]
        for t,v in [('pres','actv'),('past','actv'),('pres','pssv'),('past','pssv')]:
            x=g('PRTF',t,v,'masc','sing','nomn');parts.append(x)
        gr=[f.word for f in L if f.tag.POS=='GRND'];grs=[];[grs.append(x) for x in gr if x not in grs]
        out[w]={'t':'verb','pres':pres,'past':past,'imp':imp,'parts':parts,'grnd':grs[:2]}
    else:
        comp=[f.word for f in M.parse(w)[0].lexeme if f.tag.POS=='COMP']
        out[w]={'t':'none'}
open(os.path.join(ROOT,'src/data/dictionary/forms.js'),'w').write('const FORMS='+json.dumps(out,ensure_ascii=False)+';')
print(len(out),"слов → src/data/dictionary/forms.js")
