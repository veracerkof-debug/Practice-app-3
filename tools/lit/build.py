# Сборка корпуса предложений классики: .cache/lit/sent.jsonl ({a: автор, w: произведение, s: предложение, p: 1 — стихи}).
# Тексты — только общественное достояние; подпись в упражнении: (А. П. Чехов, «Степь»). В текстах нет ё — восстанавливать вручную.
import os,re,json,html
B=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','.cache','lit')+'/'
R=B+'ruslit/';O=B
AU={'Blok':'А. А. Блок','Bryusov':'В. Я. Брюсов','Chekhov':'А. П. Чехов','Dostoevsky':'Ф. М. Достоевский','Gogol':'Н. В. Гоголь','Gorky':'М. Горький','Herzen':'А. И. Герцен','Lermontov':'М. Ю. Лермонтов','Pushkin':'А. С. Пушкин','Tolstoy':'Л. Н. Толстой','Turgenev':'И. С. Тургенев','Nekrasov':'Н. А. Некрасов'}
def sents(t,poem):
    t=t.replace('\r','')
    if poem:
        t=re.sub(r'[ \t]*\n[ \t]*\n+','\n\n',t)
        t=re.sub(r'(?<!\n)\n(?!\n)',' / ',t)
    t=re.sub(r'\s+',' ',t)
    return re.findall(r'[А-ЯЁ«—][^.!?…]*?[.!?…]+»?(?=\s+[«—–-]?\s*[А-ЯЁ]|\s*$)',t)
out=open(O+'sent.jsonl','w');stat={}
def add(a,w,t,poem):
    n=0;mx=420 if poem else 260
    for s in sents(t,poem):
        s=s.strip().lstrip('—/ ').strip()
        if 30<=len(s)<=mx and not re.search(r'[A-Za-z\[\]{}<>=]',s):
            out.write(json.dumps({'a':a,'w':w,'s':s,'p':1 if poem else 0},ensure_ascii=False)+'\n');n+=1
    stat[a]=stat.get(a,0)+n
for kind in ['prose','poems']:
    for d in sorted(os.listdir(R+kind)):
        for f in sorted(os.listdir(R+kind+'/'+d)):
            if not f.endswith('.txt'):continue
            add(AU[d],f[:-4],open(R+kind+'/'+d+'/'+f,encoding='utf-8',errors='replace').read(),kind=='poems')
AZ={'bg':('С. Т. Аксаков','Детские годы Багрова-внука'),'ay':('И. А. Бунин','Антоновские яблоки'),'iz':('А. И. Куприн','Изумруд'),'bp':('А. И. Куприн','Белый пудель'),'ol':('А. И. Куприн','Олеся'),'tu':('Ф. И. Тютчев','стихотворения'),'pr':('М. М. Пришвин','Августовские леса'),
 'oblomov':('И. А. Гончаров','Обломов'),'strannik':('Н. С. Лесков','Очарованный странник'),'levsha':('Н. С. Лесков','Левша'),'podzem':('В. Г. Короленко','Дети подземелья'),'cvetok':('В. М. Гаршин','Красный цветок'),'lyagushka':('В. М. Гаршин','Лягушка-путешественница'),'piskar':('М. Е. Салтыков-Щедрин','Премудрый пискарь'),'fet':('А. А. Фет','стихотворения'),'esenin':('С. А. Есенин','стихотворения')}
for k,(a,w) in AZ.items():
    raw=open(B+'az/'+k+'.html','rb').read().decode('cp1251','replace')
    t=re.sub(r'(?is)<(script|style).*?</\1>','',raw)
    poem=w=='стихотворения'
    t=re.sub(r'(?i)<br\s*/?>','\n',t)
    t=re.sub(r'(?i)</?(p|dd|div|h\d|li)[^>]*>','\n\n',t)
    t=re.sub(r'<[^>]+>','',t);t=html.unescape(t)
    add(a,w,t,poem)
out.close()
print(json.dumps(stat,ensure_ascii=False)); print(sum(stat.values()))
