from pathlib import Path

p=Path('tour-point-shapes.js')
s=p.read_text(encoding='utf-8')

s=s.replace("const VIS_KEY='vn-map-tour-point-shapes-visible-v1';", "const VIS_KEY='vn-map-tour-point-shapes-visible-v1';\nconst POSITION_MARK='vn-map-tour-point-shapes-position-fixed-v1';", 1)

old="function injectToggle(){if($('toggleTourPointShapes')){syncToggle();return true}const select=$('shapeFlagSelect'),group=select?.closest('.group');if(!select||!group)return false;const wrap=document.createElement('div');wrap.id='tourPointShapeToggleWrap';wrap.style.cssText='margin:8px 0 7px';const btn=document.createElement('button');btn.id='toggleTourPointShapes';btn.type='button';btn.className='btn';btn.style.cssText='width:100%;font-weight:800';btn.addEventListener('click',()=>setTourVisible(!tourVisible()));wrap.appendChild(btn);select.insertAdjacentElement('beforebegin',wrap);syncToggle();return true}"
new="""function injectToggle(){
 const select=$('shapeFlagSelect'),group=select?.closest('.group');if(!select||!group)return false;
 let wrap=$('tourPointShapeToggleWrap');
 if(!wrap){wrap=document.createElement('div');wrap.id='tourPointShapeToggleWrap';wrap.style.cssText='margin:8px 0 7px;display:grid;gap:6px';select.insertAdjacentElement('beforebegin',wrap)}
 let btn=$('toggleTourPointShapes');
 if(!btn){btn=document.createElement('button');btn.id='toggleTourPointShapes';btn.type='button';btn.className='btn';btn.style.cssText='width:100%;font-weight:800';btn.addEventListener('click',()=>setTourVisible(!tourVisible()));wrap.appendChild(btn)}
 let fix=$('fixTourPointShapePositions');
 if(!fix){fix=document.createElement('button');fix.id='fixTourPointShapePositions';fix.type='button';fix.className='btn primary';fix.style.cssText='width:100%;font-weight:800';fix.textContent='Sửa đúng vị trí 8 Shape Ảnh';fix.title='Đưa điểm neo của 8 Shape Ảnh về đúng địa danh; giữ nguyên ảnh, kích thước và kiểu khung';fix.addEventListener('click',()=>fixManagedPositions(true));wrap.appendChild(fix)}
 let note=$('tourPointShapePositionNote');
 if(!note){note=document.createElement('div');note.id='tourPointShapePositionNote';note.style.cssText='font-size:10px;color:#746a60;line-height:1.35';note.textContent='Chỉ sửa X/Y điểm neo. Ảnh, W×H, khung và đường nối bạn đã chỉnh vẫn được giữ nguyên.';wrap.appendChild(note)}
 syncToggle();return true
}"""
if old not in s:
    raise SystemExit('injectToggle anchor missing')
s=s.replace(old,new,1)

anchor="function savedLayout(current){const out=new Map();for(const f of current){if(!f?.id||!IDSET.has(f.id))continue;const keep={};for(const k of KEEP_FIELDS)if(f[k]!==undefined)keep[k]=f[k];out.set(f.id,keep)}return out}"
insert=anchor+"""
function setSelectedPosition(id,x,y){
 const select=$('shapeFlagSelect'),ix=$('shapeFlagX'),iy=$('shapeFlagY');
 if(!select||!ix||!iy)return false;
 const exists=[...select.options].some(o=>o.value===id);if(!exists)return false;
 select.value=id;dispatch(select,'change');
 ix.value=String(x);dispatch(ix,'input');
 iy.value=String(y);dispatch(iy,'input');
 return true
}
function fixManagedPositions(showMessage=false){
 const select=$('shapeFlagSelect');if(!select)return 0;
 const previous=select.value;let fixed=0;
 for(const cfg of ITEMS)if(setSelectedPosition(cfg.id,cfg.x,cfg.y))fixed++;
 if(previous&&[...select.options].some(o=>o.value===previous)){select.value=previous;dispatch(select,'change')}
 if(fixed===ITEMS.length){try{localStorage.setItem(POSITION_MARK,'done')}catch{}}
 const note=$('tourPointShapePositionNote');
 if(note&&showMessage)note.innerHTML=fixed===ITEMS.length?'<b>✓ Đã đưa đúng vị trí 8 Shape Ảnh.</b> Chỉ X/Y điểm neo thay đổi; ảnh, W×H và khung được giữ nguyên.':`Đã sửa ${fixed}/${ITEMS.length} Shape Ảnh; hãy tải lại trang nếu còn shape chưa sẵn sàng.`;
 return fixed
}
function migrateManagedPositionsOnce(){let done=false;try{done=localStorage.getItem(POSITION_MARK)==='done'}catch{}if(done)return true;return fixManagedPositions(false)===ITEMS.length}
"""
if 'function fixManagedPositions(' not in s:
    if anchor not in s: raise SystemExit('savedLayout anchor missing')
    s=s.replace(anchor,insert,1)

old="async function boot(){tries++;const installed=await install(),ui=injectToggle(),observed=observeLayer();applyVisibility();if(installed&&ui&&observed)return;if(tries<12)setTimeout(boot,900);else console.warn('Shape tool hoặc ảnh nội bộ chưa sẵn sàng; không reload trang.')}"
new="async function boot(){tries++;const installed=await install(),ui=injectToggle(),observed=observeLayer(),positioned=migrateManagedPositionsOnce();applyVisibility();if(installed&&ui&&observed&&positioned)return;if(tries<12)setTimeout(boot,900);else console.warn('Shape tool, ảnh nội bộ hoặc vị trí shape chưa sẵn sàng; không reload trang.')}"
if old not in s:
    raise SystemExit('boot anchor missing')
s=s.replace(old,new,1)

old="window.__VN_TOUR_POINT_SHAPES={ids:[...IDS],show:()=>setTourVisible(true),hide:()=>setTourVisible(false),toggle:()=>setTourVisible(!tourVisible()),isVisible:tourVisible,apply:applyVisibility};"
new="window.__VN_TOUR_POINT_SHAPES={ids:[...IDS],show:()=>setTourVisible(true),hide:()=>setTourVisible(false),toggle:()=>setTourVisible(!tourVisible()),isVisible:tourVisible,apply:applyVisibility,fixPositions:()=>fixManagedPositions(true)};"
if old not in s:
    raise SystemExit('api anchor missing')
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')

p=Path('index.html')
s=p.read_text(encoding='utf-8')
if 'tour-point-shapes.js?v=9' in s:
    s=s.replace('tour-point-shapes.js?v=9','tour-point-shapes.js?v=10',1)
elif 'tour-point-shapes.js?v=10' not in s:
    raise SystemExit('tour-point loader anchor missing')
p.write_text(s,encoding='utf-8')
