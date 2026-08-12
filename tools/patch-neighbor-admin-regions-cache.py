from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old="load('neighbor-country-outlines.js?v=1')"
new="load('neighbor-country-outlines.js?v=2')"
if new not in s:
    if old not in s:
        raise SystemExit('neighbor outline loader anchor missing')
    s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
