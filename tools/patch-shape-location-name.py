from pathlib import Path

p=Path('flag-shape-tools.js')
s=p.read_text(encoding='utf-8')

# 1) Built-in names + helper
anchor="const TYPES={square:'Vuông',rect:'Chữ nhật',circle:'Tròn',triangle:'Tam giác',image:'Ảnh'};"
insert=anchor+"\nconst BUILTIN_NAMES={'tour-soc-trang':'Chùa Som Rong','tour-bac-lieu':'Nhà Công tử Bạc Liêu','tour-dat-mui':'Đất Mũi','tour-u-minh-thuong':'VQG U Minh Thượng','tour-ha-tien':'Thạch Động Hà Tiên','tour-dinh-cau':'Dinh Cậu Phú Quốc','tour-tra-su':'Rừng tràm Trà Sư','tour-chau-doc':'Miếu Bà Chúa Xứ Núi Sam'};\nfunction shapeSavedName(f){return String(f?.name||f?.tourName||BUILTIN_NAMES[String(f?.id||'')]||'').trim().slice(0,80)}"
if 'const BUILTIN_NAMES=' not in s:
    if anchor not in s: raise SystemExit('TYPES anchor missing')
    s=s.replace(anchor,insert,1)

# 2) Persist name in normalize
old="return{id:String(f?.id||uid()),x:Number.isFinite(Number(f?.x))?Number(f.x):700+i*12"
new="return{id:String(f?.id||uid()),name:shapeSavedName(f),x:Number.isFinite(Number(f?.x))?Number(f.x):700+i*12"
if old in s:
    s=s.replace(old,new,1)
elif 'name:shapeSavedName(f)' not in s:
    raise SystemExit('normalize anchor missing')

# 3) setField supports name
old="  }else if(key==='side')f.side=v==='left'?'left':'right';"
new="  }else if(key==='name')f.name=String(v||'').replace(/\\s+/g,' ').trimStart().slice(0,80);\n  else if(key==='side')f.side=v==='left'?'left':'right';"
if old in s:
    s=s.replace(old,new,1)
elif "key==='name'" not in s:
    raise SystemExit('setField anchor missing')

# 4) image swap list uses custom name
old="function imageShapeName(f){const i=state.items.indexOf(f)+1;return `${i}. ${f?.tourName||'Shape ảnh'} · ${f?.side==='left'?'trái':'phải'}`}"
new="function imageShapeName(f){const i=state.items.indexOf(f)+1,name=f?.name||f?.tourName||BUILTIN_NAMES[f?.id]||'Shape ảnh';return `${i}. ${name} · ${f?.side==='left'?'trái':'phải'}`}"
if old in s:
    s=s.replace(old,new,1)
elif "name=f?.name||f?.tourName" not in s:
    raise SystemExit('imageShapeName anchor missing')

# 5) Add name input at top of editor grid
old='<div id="shapeFlagEditor" style="display:none"><div class="flag-shape-grid"><label>Loại<select id="shapeFlagType">'
new='<div id="shapeFlagEditor" style="display:none"><div class="flag-shape-grid"><label style="grid-column:1/-1">Tên địa điểm<input id="shapeFlagName" type="text" maxlength="80" placeholder="VD: Chùa Som Rong, Đất Mũi..."></label><label>Loại<select id="shapeFlagType">'
if old in s:
    s=s.replace(old,new,1)
elif 'id="shapeFlagName"' not in s:
    raise SystemExit('UI grid anchor missing')

# 6) Bind name input
old="[['shapeFlagType','type','change'],['shapeFlagSide','side','change']"
new="[['shapeFlagName','name','input'],['shapeFlagType','type','change'],['shapeFlagSide','side','change']"
if old in s:
    s=s.replace(old,new,1)
elif "['shapeFlagName','name','input']" not in s:
    raise SystemExit('binding anchor missing')

# 7) Dropdown displays location name when available
old="state.items.forEach((x,i)=>{const o=document.createElement('option');o.value=x.id;o.textContent=`${i+1}. ${typeLabel(x.type)} · ${x.side==='left'?'trái':'phải'}`;s.appendChild(o)})"
new="state.items.forEach((x,i)=>{const o=document.createElement('option');o.value=x.id;const title=x.name||typeLabel(x.type);o.textContent=`${i+1}. ${title} · ${x.side==='left'?'trái':'phải'}`;s.appendChild(o)})"
if old in s:
    s=s.replace(old,new,1)
elif 'const title=x.name||typeLabel(x.type)' not in s:
    raise SystemExit('dropdown anchor missing')

# 8) Sync input value
old="const vals={shapeFlagType:f.type,shapeFlagSide:f.side"
new="const vals={shapeFlagName:f.name||'',shapeFlagType:f.type,shapeFlagSide:f.side"
if old in s:
    s=s.replace(old,new,1)
elif "shapeFlagName:f.name||''" not in s:
    raise SystemExit('sync values anchor missing')

p.write_text(s,encoding='utf-8')

# 9) Bump dynamic loader cache
p=Path('export-tools.js')
s=p.read_text(encoding='utf-8')
if "s.src='flag-shape-tools.js?v=6'" in s:
    s=s.replace("s.src='flag-shape-tools.js?v=6'","s.src='flag-shape-tools.js?v=7'",1)
elif "s.src='flag-shape-tools.js?v=7'" not in s:
    raise SystemExit('flag shape loader anchor missing')
p.write_text(s,encoding='utf-8')

# 10) Force browsers to receive new export-tools loader
p=Path('index.html')
s=p.read_text(encoding='utf-8')
if "load('export-tools.js?v=8')" in s:
    s=s.replace("load('export-tools.js?v=8')","load('export-tools.js?v=9')",1)
elif "load('export-tools.js?v=9')" not in s:
    raise SystemExit('export-tools loader anchor missing')
p.write_text(s,encoding='utf-8')
