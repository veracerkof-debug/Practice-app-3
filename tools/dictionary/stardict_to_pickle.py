#!/usr/bin/env python3
"""Читает выгрузку Русского Викисловаря (StarDict) и сохраняет словарь {слово без ударения: [(слово с ударением, html)]}."""
import gzip, struct, pickle, os
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
D=os.path.join(ROOT,'.cache/wikt/Russian-Russian-dict/Russian-Russian dictionary')
idx=open(D+'.idx','rb').read(); data=gzip.open(D+'.dict.dz').read()
E={}; i=0
while i<len(idx):
    j=idx.index(b'\0',i); w=idx[i:j].decode(); o,s=struct.unpack('>II',idx[j+1:j+9]); i=j+9
    E.setdefault(w.replace('́',''),[]).append((w,data[o:o+s].decode()))
pickle.dump(E,open(os.path.join(ROOT,'.cache/wikt/E.pkl'),'wb')); print(len(E),'слов')
