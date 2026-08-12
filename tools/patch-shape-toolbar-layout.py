from pathlib import Path

p=Path('tour-point-shapes.js')
s=p.read_text(encoding='utf-8')

old=" const select=$('shapeFlagSelect'),group=select?.closest('.group');if(!select||!group)return false;"
new=" const select=$('shapeFlagSelect'),group=select?.closest('.group'),quick=select?.closest('.flag-shape-quick');if(!select||!group)return false;"
if old in s:
    s=s.replace(old,new,1)
elif "quick=select?.closest('.flag-shape-quick')" not in s:
    raise SystemExit('injectToggle select anchor missing')

old=" if(!wrap){wrap=document.createElement('div');wrap.id='tourPointShapeToggleWrap';wrap.style.cssText='margin:8px 0 7px;display:grid;gap:6px';select.insertAdjacentElement('beforebegin',wrap)}"
new=" if(!wrap){wrap=document.createElement('div');wrap.id='tourPointShapeToggleWrap';wrap.style.cssText='margin:8px 0 7px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px;width:100%;min-width:0;box-sizing:border-box';(quick||select).insertAdjacentElement('beforebegin',wrap)}"
if old in s:
    s=s.replace(old,new,1)
elif "grid-template-columns:minmax(0,1fr) minmax(0,1fr)" not in s:
    raise SystemExit('wrap anchor missing')

old="btn.style.cssText='width:100%;font-weight:800'"
new="btn.style.cssText='width:100%;min-width:0;min-height:42px;padding:7px 9px;font-weight:800;line-height:1.2;white-space:normal;word-break:normal;box-sizing:border-box'"
if old in s:
    s=s.replace(old,new,1)
elif "min-height:42px" not in s:
    raise SystemExit('toggle button style anchor missing')

old="fix.style.cssText='width:100%;font-weight:800'"
new="fix.style.cssText='width:100%;min-width:0;min-height:42px;padding:7px 9px;font-weight:800;line-height:1.2;white-space:normal;word-break:normal;box-sizing:border-box'"
if old in s:
    s=s.replace(old,new,1)
elif s.count("min-height:42px") < 2:
    raise SystemExit('fix button style anchor missing')

old="note.style.cssText='font-size:10px;color:#746a60;line-height:1.35'"
new="note.style.cssText='grid-column:1/-1;width:100%;max-width:100%;font-size:10px;color:#746a60;line-height:1.4;white-space:normal;word-break:normal;overflow-wrap:break-word;box-sizing:border-box'"
if old in s:
    s=s.replace(old,new,1)
elif "grid-column:1/-1" not in s:
    raise SystemExit('note style anchor missing')

p.write_text(s,encoding='utf-8')

p=Path('index.html')
s=p.read_text(encoding='utf-8')
if 'tour-point-shapes.js?v=10' in s:
    s=s.replace('tour-point-shapes.js?v=10','tour-point-shapes.js?v=11',1)
elif 'tour-point-shapes.js?v=11' not in s:
    raise SystemExit('tour point cache anchor missing')
p.write_text(s,encoding='utf-8')
