from pathlib import Path

p = Path('flag-shape-tools.js')
s = p.read_text(encoding='utf-8')

anchor = "function clearImage(){const f=selected();if(!f||f.type!=='image')return;f.imageSrc='';f.imageUrl='';save(true);render();setImageStatus('Đã xóa ảnh khỏi shape.','')}"
helpers = r'''function imageShapes(){return state.items.filter(x=>x?.type==='image')}
function imageShapeName(f){const i=state.items.indexOf(f)+1;return `${i}. ${f?.tourName||'Shape ảnh'} · ${f?.side==='left'?'trái':'phải'}`}
function swapTarget(){const id=String($('shapeFlagSwapTarget')?.value||'');return state.items.find(x=>x?.id===id&&x.type==='image')||null}
function syncImageSwapUI(){
  const sel=$('shapeFlagSwapTarget'),swapBtn=$('swapShapeFlagImages'),copyBtn=$('copyShapeFlagImage'),nextBtn=$('nextShapeFlagImage');if(!sel)return;
  const cur=selected(),old=sel.value,candidates=imageShapes().filter(x=>x.id!==cur?.id);
  sel.innerHTML=candidates.length?'':'<option value="">Không có shape ảnh khác</option>';
  candidates.forEach(f=>{const o=document.createElement('option');o.value=f.id;o.textContent=imageShapeName(f);sel.appendChild(o)});
  if(candidates.some(x=>x.id===old))sel.value=old;
  const ok=!!cur&&cur.type==='image'&&candidates.length>0;
  if(swapBtn)swapBtn.disabled=!ok;if(copyBtn)copyBtn.disabled=!ok;if(nextBtn)nextBtn.disabled=imageShapes().length<2;
}
function swapSelectedImages(){
  const a=selected(),b=swapTarget();if(!a||a.type!=='image'){setImageStatus('Hãy chọn một Shape Ảnh trước.','warn');return}if(!b){setImageStatus('Không có Shape Ảnh khác để hoán đổi.','warn');return}
  const src=a.imageSrc,url=a.imageUrl,ratio=a.imageRatio;
  a.imageSrc=b.imageSrc;a.imageUrl=b.imageUrl;a.imageRatio=b.imageRatio;
  b.imageSrc=src;b.imageUrl=url;b.imageRatio=ratio;
  a.lockRatio=false;b.lockRatio=false;save(true);render();setImageStatus('✓ Đã hoán đổi 2 ảnh. Khung, vị trí và đường nối được giữ nguyên.','ok');
}
function copySelectedImageFromTarget(){
  const a=selected(),b=swapTarget();if(!a||a.type!=='image'){setImageStatus('Hãy chọn một Shape Ảnh trước.','warn');return}if(!b){setImageStatus('Không có Shape Ảnh khác để lấy ảnh.','warn');return}
  a.imageSrc=b.imageSrc;a.imageUrl=b.imageUrl;a.imageRatio=b.imageRatio;a.lockRatio=false;save(true);render();setImageStatus('✓ Đã lấy ảnh từ shape khác. Kích thước khung không đổi.','ok');
}
function selectNextImageShape(){
  const list=imageShapes();if(list.length<2){setImageStatus('Cần ít nhất 2 Shape Ảnh.','warn');return}
  const cur=selected(),i=Math.max(0,list.findIndex(x=>x.id===cur?.id)),next=list[(i+1)%list.length];state.selected=next.id;$('shapeFlagDetails')?.setAttribute('open','');render();setImageStatus(`Đang chọn ${imageShapeName(next)}.`,'');
}'''
if 'function swapSelectedImages()' not in s:
    if anchor not in s:
        raise SystemExit('clearImage anchor missing')
    s = s.replace(anchor, anchor + '\n' + helpers, 1)

old = '<div class="shape-image-actions"><button id="chooseShapeFlagImage" class="btn primary" type="button">Chọn ảnh từ máy</button><button id="clearShapeFlagImage" class="btn" type="button">Xóa ảnh</button></div><input id="shapeFlagImageFile" type="file" accept="image/*" hidden>'
new = '<div class="shape-image-actions"><button id="chooseShapeFlagImage" class="btn primary" type="button">Đổi ảnh từ máy</button><button id="clearShapeFlagImage" class="btn" type="button">Xóa ảnh</button></div><input id="shapeFlagImageFile" type="file" accept="image/*" hidden><div style="margin-top:9px;padding:8px;border:1px solid #ddd0bd;border-radius:8px;background:#fffaf1"><label><b>Đổi ảnh nhanh giữa các Shape Ảnh</b></label><div class="shape-image-source" style="margin-top:5px"><select id="shapeFlagSwapTarget" style="min-width:0;flex:1"></select><button id="swapShapeFlagImages" class="btn primary" type="button">Hoán đổi ảnh</button></div><div class="shape-image-actions"><button id="copyShapeFlagImage" class="btn" type="button">Lấy ảnh sang shape này</button><button id="nextShapeFlagImage" class="btn" type="button">Shape ảnh kế tiếp →</button></div><div style="font-size:9.5px;color:#746a60;margin-top:4px">Chỉ đổi nội dung ảnh; giữ nguyên W×H, vị trí, đường nối, hướng và bo góc.</div></div>'
if old in s:
    s = s.replace(old, new, 1)
elif 'id="swapShapeFlagImages"' not in s:
    raise SystemExit('image actions HTML anchor missing')

old_events = "$('applyShapeFlagImageUrl')?.addEventListener('click',useImageUrl);$('chooseShapeFlagImage')?.addEventListener('click',()=>$('shapeFlagImageFile')?.click());$('shapeFlagImageFile')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(file)chooseLocalFile(file);e.target.value=''});$('clearShapeFlagImage')?.addEventListener('click',clearImage);$('restoreShapeFlagImageRatio')?.addEventListener('click',restoreImageRatio);"
new_events = old_events + "\n  $('swapShapeFlagImages')?.addEventListener('click',swapSelectedImages);$('copyShapeFlagImage')?.addEventListener('click',copySelectedImageFromTarget);$('nextShapeFlagImage')?.addEventListener('click',selectNextImageShape);"
if "$('swapShapeFlagImages')?.addEventListener" not in s:
    if old_events not in s:
        raise SystemExit('image event anchor missing')
    s = s.replace(old_events, new_events, 1)

old_sync = "  if(ed)ed.style.display=f?'':'none';if($('showShapeFlags'))$('showShapeFlags').checked=state.show;if($('dragShapeFlags'))$('dragShapeFlags').checked=state.dragEnabled;\n  if(!f)return;"
new_sync = "  if(ed)ed.style.display=f?'':'none';if($('showShapeFlags'))$('showShapeFlags').checked=state.show;if($('dragShapeFlags'))$('dragShapeFlags').checked=state.dragEnabled;\n  syncImageSwapUI();\n  if(!f)return;"
if '  syncImageSwapUI();\n  if(!f)return;' not in s:
    if old_sync not in s:
        raise SystemExit('syncUI anchor missing')
    s = s.replace(old_sync, new_sync, 1)

old_api = "window.__VN_FLAG_SHAPES={add:(type='square')=>createCenter(TYPES[type]?type:'square'),duplicate,render,save,getAll:()=>JSON.parse(JSON.stringify(state.items))};"
new_api = "window.__VN_FLAG_SHAPES={add:(type='square')=>createCenter(TYPES[type]?type:'square'),duplicate,render,save,getAll:()=>JSON.parse(JSON.stringify(state.items)),swapSelectedImages,copySelectedImageFromTarget,selectNextImageShape};"
if old_api in s:
    s = s.replace(old_api, new_api, 1)
elif 'swapSelectedImages,copySelectedImageFromTarget' not in s:
    raise SystemExit('API anchor missing')

p.write_text(s, encoding='utf-8')

p = Path('export-tools.js')
s = p.read_text(encoding='utf-8')
if "flag-shape-tools.js?v=5" in s:
    s = s.replace("flag-shape-tools.js?v=5", "flag-shape-tools.js?v=6", 1)
elif "flag-shape-tools.js?v=6" not in s:
    raise SystemExit('flag shape loader anchor missing')
p.write_text(s, encoding='utf-8')
