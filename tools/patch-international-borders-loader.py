from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old="then(()=>load('editor.js?v=5')).then(()=>load('archipelago-labels.js?v=1'))"
new="then(()=>load('editor.js?v=5')).then(()=>load('international-borders.js?v=1')).then(()=>load('archipelago-labels.js?v=1'))"
if new not in s:
    if old not in s:
        raise SystemExit('loader anchor not found')
    s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
