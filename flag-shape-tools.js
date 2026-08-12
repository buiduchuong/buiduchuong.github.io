(()=>{
'use strict';
const NS='http://www.w3.org/2000/svg';
const STORE='vn-map-flag-shapes-v1';
const $=id=>document.getElementById(id);
const svg=$('mapSvg'),viewport=$('viewport'),canvas=$('canvas');
if(!svg||!viewport||!canvas)return;
let layer=$('shapeFlagLayer');
if(!layer){layer=document.createElementNS(NS,'g');layer.id='shapeFlagLayer';const flagLayer=$('flagLayer'),foodLayer=$('foodLayer');viewport.insertBefore(layer,foodLayer||flagLayer?.nextSibling||null)}
const state={items:[],selected:null,show:true,dragEnabled:true,drag:null,saveTimer:null,lastPaletteDrag:0};
const TYPES={square:'Vuông',rect:'Chữ nhật',circle:'Tròn',triangle:'Tam giác',image:'Ảnh'};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const color=(v,d)=>/^#[0-9a-f]{6}$/i.test(v||'')?v:d;
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));return n};
function uid(){return'shape-flag-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function defaults(type){if(type==='rect')return{w:94,h:52};if(type==='circle')return{w:56,h:56};if(type==='triangle')return{w:66,h:56};if(type==='image')return{w:80,h:50};return{w:56,h:56}}
function normalize(f,i=0){
  const type=TYPES[f?.type]?f.type:'square',d=defaults(type);
  let w=clamp(Number(f?.w)||d.w,24,360),h=clamp(Number(f?.h)||d.h,20,280);
  if(type==='square'||type==='circle')w=h=Math.max(w,h);
  const rawRatio=Number(f?.imageRatio),imageRatio=rawRatio>0?rawRatio:(w/h||1.6);
  return{id:String(f?.id||uid()),x:Number.isFinite(Number(f?.x))?Number(f.x):700+i*12,y:Number.isFinite(Number(f?.y))?Number(f.y):500+i*8,type,side:f?.side==='left'?'left':'right',offset:clamp(Number(f?.offset)||34,10,320),headDy:clamp(Number(f?.headDy)||0,-320,320),connectorType:f?.connectorType==='elbow'?'elbow':'straight',elbowOffset:clamp(Number(f?.elbowOffset)||50,6,320),w,h,fill:color(f?.fill,'#f0c95e'),border:color(f?.border,'#554b43'),borderWidth:clamp(Number(f?.borderWidth)||1.8,.5,8),connectorColor:color(f?.connectorColor,'#554b43'),connectorWidth:clamp(Number(f?.connectorWidth)||1.7,.5,8),radius:clamp(Number(f?.radius)||4,0,30),imageSrc:String(f?.imageSrc||''),imageUrl:String(f?.imageUrl||''),imageRatio,lockRatio:type==='image'?false:f?.lockRatio!==false,imageFit:f?.imageFit==='cover'?'cover':'contain'}
}
function load(){try{const d=JSON.parse(localStorage.getItem(STORE)||'{}');state.items=Array.isArray(d.items)?d.items.map(normalize):[];state.show=d.show!==false;state.dragEnabled=d.dragEnabled!==false}catch{state.items=[]}}
function save(flush=false){try{localStorage.setItem(STORE,JSON.stringify({version:3,items:state.items,show:state.show,dragEnabled:state.dragEnabled,updatedAt:Date.now()}))}catch(e){console.warn('Không lưu được shape cờ',e);setImageStatus('Dung lượng lưu shape ảnh đã đầy. Hãy dùng ảnh nhỏ hơn.','error')}if(flush&&window.__VN_PERSIST?.flush)window.__VN_PERSIST.flush();else{clearTimeout(state.saveTimer);state.saveTimer=setTimeout(()=>window.__VN_PERSIST?.flush?.(),450)}}
function selected(){return state.items.find(x=>x.id===state.selected)||null}
function worldFromClient(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const m=viewport.getScreenCTM();if(!m)return[700,500];const q=p.matrixTransform(m.inverse());return[q.x,q.y]}
function visibleCenter(){const r=canvas.getBoundingClientRect();return worldFromClient({clientX:r.left+r.width/2,clientY:r.top+r.height/2})}
function box(f){const side=f.side==='left'?-1:1,x=side>0?f.offset:-f.offset-f.w,centerY=f.headDy,y=centerY-f.h/2;return{side,x,y,w:f.w,h:f.h,edgeX:side>0?f.offset:-f.offset,edgeY:centerY,centerX:x+f.w/2,centerY}}
function connectorPath(f,b){
  if(f.connectorType==='elbow'){
    const limit=Math.max(6,Math.abs(b.edgeX)),bend=b.side*Math.min(clamp(Number(f.elbowOffset)||50,6,320),limit);
    return`M0,0 H${bend} V${b.edgeY} H${b.edgeX}`;
  }
  return`M0,0 L${b.edgeX},${b.edgeY}`;
}
function bindHead(node,f){node.dataset.role='head';node.addEventListener('pointerdown',startHeadDrag);node.addEventListener('click',e=>{e.stopPropagation();select(f.id)})}
function appendImageBody(g,f,b){
  const clipId='shape-img-'+f.id.replace(/[^a-zA-Z0-9_-]/g,'');
  const cp=el('clipPath',{id:clipId}),cr=el('rect',{x:b.x,y:b.y,width:b.w,height:b.h,rx:f.radius,ry:f.radius});cp.appendChild(cr);g.appendChild(cp);
  g.appendChild(el('rect',{x:b.x,y:b.y,width:b.w,height:b.h,rx:f.radius,ry:f.radius,fill:'#ffffff'}));
  if(f.imageSrc){g.appendChild(el('image',{x:b.x,y:b.y,width:b.w,height:b.h,href:f.imageSrc,'clip-path':`url(#${clipId})`,preserveAspectRatio:f.imageFit==='cover'?'xMidYMid slice':'xMidYMid meet',class:'shape-image'}))}
  else{const t=el('text',{x:b.x+b.w/2,y:b.y+b.h/2+4,'text-anchor':'middle','font-family':'Roboto,Arial,sans-serif','font-size':clamp(Math.min(b.w,b.h)*.22,9,22),'font-weight':'700',fill:'#8a8177',class:'shape-image-placeholder'});t.textContent='ẢNH';g.appendChild(t)}
  const border=el('rect',{x:b.x,y:b.y,width:b.w,height:b.h,rx:f.radius,ry:f.radius,fill:'none',stroke:f.border,'stroke-width':f.borderWidth,class:'shape-body'});bindHead(border,f);g.appendChild(border);
}
function appendBody(g,f,b){
  if(f.type==='image')appendImageBody(g,f,b);
  else{
    let body;
    if(f.type==='circle')body=el('ellipse',{cx:b.x+b.w/2,cy:b.centerY,rx:b.w/2,ry:b.h/2,fill:f.fill,stroke:f.border,'stroke-width':f.borderWidth,class:'shape-body'});
    else if(f.type==='triangle'){const pts=b.side>0?`${b.x},${b.y} ${b.x+b.w},${b.centerY} ${b.x},${b.y+b.h}`:`${b.x+b.w},${b.y} ${b.x},${b.centerY} ${b.x+b.w},${b.y+b.h}`;body=el('polygon',{points:pts,fill:f.fill,stroke:f.border,'stroke-width':f.borderWidth,'stroke-linejoin':'round',class:'shape-body'})}
    else body=el('rect',{x:b.x,y:b.y,width:b.w,height:b.h,rx:f.type==='square'?Math.min(f.radius,b.w/3):f.radius,ry:f.type==='square'?Math.min(f.radius,b.h/3):f.radius,fill:f.fill,stroke:f.border,'stroke-width':f.borderWidth,class:'shape-body'});
    bindHead(body,f);g.appendChild(body);
  }
  const hit=el('rect',{x:b.x-6,y:b.y-6,width:b.w+12,height:b.h+12,class:'shape-head-hit','data-role':'head'});hit.dataset.id=f.id;hit.addEventListener('pointerdown',startHeadDrag);hit.addEventListener('click',e=>{e.stopPropagation();select(f.id)});g.appendChild(hit)
}
function draw(f){
  const g=el('g',{class:'flag-shape-marker'+(f.id===state.selected?' selected':''),'data-id':f.id,transform:`translate(${f.x} ${f.y})`}),b=box(f);
  g.appendChild(el('path',{d:connectorPath(f,b),stroke:f.connectorColor,'stroke-width':f.connectorWidth,fill:'none',class:'shape-connector'}));
  appendBody(g,f,b);
  const hit=el('circle',{cx:0,cy:0,r:13,class:'shape-anchor-hit'});hit.dataset.role='anchor';hit.addEventListener('pointerdown',startAnchorDrag);hit.addEventListener('click',e=>{e.stopPropagation();select(f.id)});g.appendChild(hit);
  return g
}
function render(){layer.innerHTML='';layer.style.display=state.show?'':'none';if(state.show)state.items.forEach(f=>layer.appendChild(draw(f)));syncUI()}
function typeLabel(t){return TYPES[t]||'Shape'}
function select(id){state.selected=id;render()}
function create(type,x,y){const f=normalize({id:uid(),type,x,y});state.items.push(f);state.selected=f.id;save();render();if(type==='image'){$('shapeFlagDetails')?.setAttribute('open','');setImageStatus('Dán URL ảnh hoặc chọn ảnh từ máy.','')}return f}
function createCenter(type){const[x,y]=visibleCenter();return create(type,x,y)}
function duplicate(){const f=selected();if(!f)return;const n=normalize({...f,id:uid(),x:f.x+16,y:f.y+16});state.items.push(n);state.selected=n.id;save(true);render()}
function remove(){const f=selected();if(!f)return;state.items=state.items.filter(x=>x.id!==f.id);state.selected=state.items.at(-1)?.id||null;save(true);render()}
function clearAll(){if(!state.items.length)return;if(!confirm('Xóa toàn bộ shape cờ ngang?'))return;state.items=[];state.selected=null;save(true);render()}
function setField(key,v){
  const f=selected();if(!f)return;
  if(key==='type'){
    if(!TYPES[v])return;
    const was=f.type;f.type=v;const d=defaults(v);
    if(v==='square'||v==='circle'){const s=Math.max(f.w,f.h,d.w);f.w=f.h=clamp(s,24,180)}
    else if(v==='image'&&was!=='image'){f.w=d.w;f.h=d.h;f.imageRatio=d.w/d.h;f.lockRatio=false}
  }else if(key==='side')f.side=v==='left'?'left':'right';
  else if(key==='connectorType')f.connectorType=v==='elbow'?'elbow':'straight';
  else if(['fill','border','connectorColor'].includes(key))f[key]=v;
  else if(key==='w'){
    const n=clamp(Number(v)||f.w,24,360);f.w=n;
    if(f.type==='square'||f.type==='circle')f.h=n
  }else if(key==='h'){
    const n=clamp(Number(v)||f.h,20,280);f.h=n;
    if(f.type==='square'||f.type==='circle')f.w=n
  }else if(key==='offset')f.offset=clamp(Number(v)||f.offset,10,320);
  else if(key==='headDy')f.headDy=clamp(Number(v)||0,-320,320);
  else if(key==='elbowOffset')f.elbowOffset=clamp(Number(v)||50,6,320);
  else if(key==='borderWidth')f.borderWidth=clamp(Number(v)||1.8,.5,8);
  else if(key==='connectorWidth')f.connectorWidth=clamp(Number(v)||1.7,.5,8);
  else if(key==='radius')f.radius=clamp(Number(v)||0,0,30);
  else if(key==='x'||key==='y'){const n=Number(v);if(Number.isFinite(n))f[key]=n}else return;
  save();render()
}
function startAnchorDrag(e){if(!state.dragEnabled)return;e.preventDefault();e.stopPropagation();const g=e.currentTarget.closest('.flag-shape-marker'),id=g?.dataset.id;if(!id)return;state.selected=id;const f=selected(),p=worldFromClient(e);state.drag={mode:'anchor',id,pointerId:e.pointerId,dx:p[0]-f.x,dy:p[1]-f.y};try{svg.setPointerCapture(e.pointerId)}catch{}render()}
function startHeadDrag(e){if(!state.dragEnabled)return;e.preventDefault();e.stopPropagation();const g=e.currentTarget.closest('.flag-shape-marker'),id=g?.dataset.id;if(!id)return;state.selected=id;const f=selected(),p=worldFromClient(e),b=box(f);state.drag={mode:'head',id,pointerId:e.pointerId,grabX:p[0]-(f.x+b.centerX),grabY:p[1]-(f.y+b.centerY)};try{svg.setPointerCapture(e.pointerId)}catch{}render()}
function moveDrag(e){if(!state.drag)return;const f=state.items.find(x=>x.id===state.drag.id);if(!f)return;const p=worldFromClient(e);if(state.drag.mode==='anchor'){f.x=p[0]-state.drag.dx;f.y=p[1]-state.drag.dy}else{const centerX=p[0]-state.drag.grabX,centerY=p[1]-state.drag.grabY,dx=centerX-f.x;f.side=dx<0?'left':'right';f.offset=clamp(Math.abs(dx)-f.w/2,10,320);f.headDy=clamp(centerY-f.y,-320,320)}save(false);render()}
function endDrag(){if(!state.drag)return;const id=state.drag.pointerId;state.drag=null;try{svg.releasePointerCapture(id)}catch{}save(true);render()}
function setImageStatus(text,type=''){const n=$('shapeFlagImageStatus');if(!n)return;n.textContent=text;n.className='shape-image-status'+(type?' '+type:'')}
function loadHtmlImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Không đọc được ảnh'));im.src=src})}
async function optimizeBlob(blob){if(!blob?.type?.startsWith('image/'))throw new Error('File không phải hình ảnh.');if(blob.size>18*1024*1024)throw new Error('Ảnh quá lớn. Vui lòng chọn ảnh dưới 18 MB.');const url=URL.createObjectURL(blob);try{const im=await loadHtmlImage(url),max=1200,scale=Math.min(1,max/Math.max(im.naturalWidth||1,im.naturalHeight||1)),w=Math.max(1,Math.round(im.naturalWidth*scale)),h=Math.max(1,Math.round(im.naturalHeight*scale)),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(im,0,0,w,h);let data=c.toDataURL('image/webp',.86);if(!data.startsWith('data:image/webp'))data=c.toDataURL('image/png');return{data,width:im.naturalWidth,height:im.naturalHeight}}finally{URL.revokeObjectURL(url)}}
function applyImageData(f,data,width,height,sourceUrl=''){f.type='image';f.imageSrc=data;f.imageUrl=sourceUrl;const ratio=(Number(width)||f.w)/(Number(height)||f.h);if(Number.isFinite(ratio)&&ratio>0)f.imageRatio=ratio;f.lockRatio=false;save(true);render()}
async function chooseLocalFile(file){const f=selected();if(!f||f.type!=='image'||!file)return;try{setImageStatus('Đang xử lý ảnh từ máy…','');const out=await optimizeBlob(file);applyImageData(f,out.data,out.width,out.height,'');setImageStatus(`✓ Đã lưu ảnh từ máy: ${file.name}`,'ok')}catch(e){setImageStatus(e.message||String(e),'error')}}
async function useImageUrl(){const f=selected();if(!f||f.type!=='image')return;const url=String($('shapeFlagImageUrl')?.value||'').trim();if(!url){setImageStatus('Hãy nhập URL ảnh.','warn');return}if(!/^https?:\/\//i.test(url)&&!/^data:image\//i.test(url)){setImageStatus('URL ảnh phải bắt đầu bằng http:// hoặc https://','error');return}try{setImageStatus('Đang tải ảnh từ URL…','');if(/^data:image\//i.test(url)){const im=await loadHtmlImage(url);applyImageData(f,url,im.naturalWidth,im.naturalHeight,'');setImageStatus('✓ Đã dùng ảnh data URL.','ok');return}const r=await fetch(url,{mode:'cors',cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const blob=await r.blob(),out=await optimizeBlob(blob);applyImageData(f,out.data,out.width,out.height,url);setImageStatus('✓ Đã tải và nhúng ảnh URL.','ok')}catch(e){f.imageSrc=url;f.imageUrl=url;try{const im=await loadHtmlImage(url),ratio=(im.naturalWidth||1)/(im.naturalHeight||1);if(ratio>0)f.imageRatio=ratio;f.lockRatio=false}catch{}save(true);render();setImageStatus('Máy chủ ảnh chặn CORS; đang dùng URL trực tiếp. Xuất PNG/PDF có thể phụ thuộc máy chủ ảnh.','warn')}}
function clearImage(){const f=selected();if(!f||f.type!=='image')return;f.imageSrc='';f.imageUrl='';save(true);render();setImageStatus('Đã xóa ảnh khỏi shape.','')}
function imageShapes(){return state.items.filter(x=>x?.type==='image')}
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
}
function restoreImageRatio(){const f=selected();if(!f||f.type!=='image')return;const ratio=Number(f.imageRatio)||1.6;f.lockRatio=true;f.h=clamp(f.w/ratio,20,280);save();render();setImageStatus('✓ Đã về đúng tỷ lệ ảnh gốc.','ok')}
function injectUI(){
  const group=[...document.querySelectorAll('.group')].find(g=>g.querySelector('.group-title')?.textContent?.trim()==='Cờ đánh dấu');if(!group||$('flagShapePaletteBlock'))return;
  const oldAdd=$('addFlag')?.closest('.flag-toolbar');if(oldAdd)oldAdd.classList.add('flag-old-add-compact');if($('flagSelect'))$('flagSelect').size=1;
  const block=document.createElement('div');block.id='flagShapePaletteBlock';block.className='flag-shape-block';
  block.innerHTML=`<div class="flag-shape-headline"><span>Shape cờ ngang</span><span id="shapeFlagCount">0 shape</span></div><div class="flag-shape-palette" id="flagShapePalette">${Object.entries(TYPES).map(([k,n])=>`<button type="button" class="flag-shape-palette-item" draggable="true" data-shape="${k}" title="Kéo ${n} vào bản đồ"><span class="flag-shape-preview ${k}"><i></i></span><span>${n}</span></button>`).join('')}</div><div class="flag-shape-hint">Kéo shape vào bản đồ. Có thể kéo khung sang trái/phải và lên/xuống. Chọn “Gấp khúc” để đường nối tự bẻ góc vuông.</div><div class="flag-shape-quick"><select id="shapeFlagSelect"><option value="">Chưa có shape</option></select><button id="duplicateShapeFlag" class="btn" type="button">Nhân bản</button><button id="deleteShapeFlag" class="btn danger" type="button">Xóa</button></div><details id="shapeFlagDetails" class="flag-shape-editor"><summary>Chỉnh shape đang chọn</summary><div id="shapeFlagEditor" style="display:none"><div class="flag-shape-grid"><label>Loại<select id="shapeFlagType">${Object.entries(TYPES).map(([k,n])=>`<option value="${k}">${n}</option>`).join('')}</select></label><label>Phía<select id="shapeFlagSide"><option value="left">Bên trái</option><option value="right">Bên phải</option></select></label><label>Khoảng ngang<input id="shapeFlagOffset" type="number" min="10" max="320" step="1"></label><label>Lệch dọc<input id="shapeFlagHeadDy" type="number" min="-320" max="320" step="1"></label><label>Kiểu đường nối<select id="shapeFlagConnectorType"><option value="straight">Thẳng</option><option value="elbow">Gấp khúc</option></select></label><label>Vị trí góc gấp<input id="shapeFlagElbowOffset" type="number" min="6" max="320" step="1"></label><label>Bo góc<input id="shapeFlagRadius" type="number" min="0" max="30" step="1"></label><span></span><label>Rộng<input id="shapeFlagW" type="number" min="24" max="360" step="1"></label><label>Cao<input id="shapeFlagH" type="number" min="20" max="280" step="1"></label><label>Màu nền<input id="shapeFlagFill" type="color"></label><label>Màu viền<input id="shapeFlagBorder" type="color"></label><label>Độ dày viền<input id="shapeFlagBorderWidth" type="number" min="0.5" max="8" step="0.5"></label><label>Màu đường nối<input id="shapeFlagConnectorColor" type="color"></label><label>Độ dày nối<input id="shapeFlagConnectorWidth" type="number" min="0.5" max="8" step="0.5"></label><span></span><label>X điểm neo<input id="shapeFlagX" type="number" step="1"></label><label>Y điểm neo<input id="shapeFlagY" type="number" step="1"></label></div><div id="shapeFlagImageOptions" class="shape-image-options" style="display:none"><label>Ảnh từ URL</label><div class="shape-image-source"><input id="shapeFlagImageUrl" type="text" placeholder="https://.../anh.jpg"><button id="applyShapeFlagImageUrl" class="btn" type="button">Dùng URL</button></div><div class="shape-image-actions"><button id="chooseShapeFlagImage" class="btn primary" type="button">Đổi ảnh từ máy</button><button id="clearShapeFlagImage" class="btn" type="button">Xóa ảnh</button></div><input id="shapeFlagImageFile" type="file" accept="image/*" hidden><div style="margin-top:9px;padding:8px;border:1px solid #ddd0bd;border-radius:8px;background:#fffaf1"><label><b>Đổi ảnh nhanh giữa các Shape Ảnh</b></label><div class="shape-image-source" style="margin-top:5px"><select id="shapeFlagSwapTarget" style="min-width:0;flex:1"></select><button id="swapShapeFlagImages" class="btn primary" type="button">Hoán đổi ảnh</button></div><div class="shape-image-actions"><button id="copyShapeFlagImage" class="btn" type="button">Lấy ảnh sang shape này</button><button id="nextShapeFlagImage" class="btn" type="button">Shape ảnh kế tiếp →</button></div><div style="font-size:9.5px;color:#746a60;margin-top:4px">Chỉ đổi nội dung ảnh; giữ nguyên W×H, vị trí, đường nối, hướng và bo góc.</div></div><label class="check"><input id="shapeFlagLockRatio" type="checkbox" checked> Giữ tỷ lệ ảnh khi đổi kích thước</label><div class="row"><div><label>Cách lấp đầy</label><select id="shapeFlagImageFit"><option value="contain">Hiện toàn bộ ảnh</option><option value="cover">Phủ kín khung</option></select></div><div><label>&nbsp;</label><button id="restoreShapeFlagImageRatio" class="btn" type="button" style="width:100%">Tỷ lệ gốc</button></div></div><div id="shapeFlagImageStatus" class="shape-image-status">Có thể dùng URL hoặc chọn ảnh từ máy.</div></div><label class="check"><input id="showShapeFlags" type="checkbox" checked> Hiện shape cờ ngang</label><label class="check"><input id="dragShapeFlags" type="checkbox" checked> Cho phép kéo shape/điểm neo</label><button id="clearShapeFlags" class="btn danger" type="button" style="width:100%;margin-top:7px">Xóa tất cả shape ngang</button></div></details>`;
  if(oldAdd)oldAdd.insertAdjacentElement('beforebegin',block);else group.querySelector('.group-title')?.insertAdjacentElement('afterend',block);
  block.querySelectorAll('.flag-shape-palette-item').forEach(b=>{b.addEventListener('click',()=>{if(Date.now()-state.lastPaletteDrag<350)return;createCenter(b.dataset.shape)});b.addEventListener('dragstart',e=>{state.lastPaletteDrag=Date.now();e.dataTransfer.effectAllowed='copy';e.dataTransfer.setData('application/x-vn-flag-shape',b.dataset.shape);e.dataTransfer.setData('text/plain','vn-flag-shape:'+b.dataset.shape)});b.addEventListener('dragend',()=>{state.lastPaletteDrag=Date.now();canvas.classList.remove('shape-drop-ready')})});
  $('shapeFlagSelect')?.addEventListener('change',e=>select(e.target.value));$('duplicateShapeFlag')?.addEventListener('click',duplicate);$('deleteShapeFlag')?.addEventListener('click',remove);$('clearShapeFlags')?.addEventListener('click',clearAll);
  [['shapeFlagType','type','change'],['shapeFlagSide','side','change'],['shapeFlagOffset','offset','input'],['shapeFlagHeadDy','headDy','input'],['shapeFlagConnectorType','connectorType','change'],['shapeFlagElbowOffset','elbowOffset','input'],['shapeFlagRadius','radius','input'],['shapeFlagW','w','input'],['shapeFlagH','h','input'],['shapeFlagFill','fill','input'],['shapeFlagBorder','border','input'],['shapeFlagBorderWidth','borderWidth','input'],['shapeFlagConnectorColor','connectorColor','input'],['shapeFlagConnectorWidth','connectorWidth','input'],['shapeFlagX','x','input'],['shapeFlagY','y','input']].forEach(([id,key,ev])=>$(id)?.addEventListener(ev,e=>setField(key,e.target.value)));
  $('showShapeFlags')?.addEventListener('change',e=>{state.show=e.target.checked;save();render()});$('dragShapeFlags')?.addEventListener('change',e=>{state.dragEnabled=e.target.checked;save();render()});
  $('applyShapeFlagImageUrl')?.addEventListener('click',useImageUrl);$('chooseShapeFlagImage')?.addEventListener('click',()=>$('shapeFlagImageFile')?.click());$('shapeFlagImageFile')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(file)chooseLocalFile(file);e.target.value=''});$('clearShapeFlagImage')?.addEventListener('click',clearImage);$('restoreShapeFlagImageRatio')?.addEventListener('click',restoreImageRatio);
  $('swapShapeFlagImages')?.addEventListener('click',swapSelectedImages);$('copyShapeFlagImage')?.addEventListener('click',copySelectedImageFromTarget);$('nextShapeFlagImage')?.addEventListener('click',selectNextImageShape);
  $('shapeFlagLockRatio')?.addEventListener('change',e=>{const f=selected();if(!f||f.type!=='image')return;f.lockRatio=e.target.checked;if(f.lockRatio){f.imageRatio=Number(f.imageRatio)||f.w/f.h;f.h=clamp(f.w/f.imageRatio,20,280)}save();render()});
  $('shapeFlagImageFit')?.addEventListener('change',e=>{const f=selected();if(!f||f.type!=='image')return;f.imageFit=e.target.value==='cover'?'cover':'contain';save();render()});
}
function syncUI(){
  const s=$('shapeFlagSelect'),c=$('shapeFlagCount'),ed=$('shapeFlagEditor'),f=selected();
  if(c)c.textContent=`${state.items.length} shape`;
  if(s){const cur=state.selected;s.innerHTML=state.items.length?'':'<option value="">Chưa có shape</option>';state.items.forEach((x,i)=>{const o=document.createElement('option');o.value=x.id;o.textContent=`${i+1}. ${typeLabel(x.type)} · ${x.side==='left'?'trái':'phải'}`;s.appendChild(o)});if(cur)s.value=cur}
  if(ed)ed.style.display=f?'':'none';if($('showShapeFlags'))$('showShapeFlags').checked=state.show;if($('dragShapeFlags'))$('dragShapeFlags').checked=state.dragEnabled;
  syncImageSwapUI();
  if(!f)return;
  const vals={shapeFlagType:f.type,shapeFlagSide:f.side,shapeFlagOffset:Math.round(f.offset),shapeFlagHeadDy:Math.round(f.headDy),shapeFlagConnectorType:f.connectorType,shapeFlagElbowOffset:Math.round(f.elbowOffset),shapeFlagRadius:f.radius,shapeFlagW:Math.round(f.w),shapeFlagH:Math.round(f.h),shapeFlagFill:f.fill,shapeFlagBorder:f.border,shapeFlagBorderWidth:f.borderWidth,shapeFlagConnectorColor:f.connectorColor,shapeFlagConnectorWidth:f.connectorWidth,shapeFlagX:Math.round(f.x),shapeFlagY:Math.round(f.y)};Object.entries(vals).forEach(([id,v])=>{if($(id))$(id).value=v});
  if($('shapeFlagElbowOffset'))$('shapeFlagElbowOffset').disabled=f.connectorType!=='elbow';
  if($('shapeFlagImageOptions'))$('shapeFlagImageOptions').style.display=f.type==='image'?'':'none';
  if($('shapeFlagImageUrl'))$('shapeFlagImageUrl').value=f.imageUrl||(/^https?:/i.test(f.imageSrc)?f.imageSrc:'');
  if($('shapeFlagLockRatio'))$('shapeFlagLockRatio').checked=f.lockRatio;
  if($('shapeFlagImageFit'))$('shapeFlagImageFit').value=f.imageFit;
}
canvas.addEventListener('dragover',e=>{const types=[...(e.dataTransfer?.types||[])];if(types.includes('application/x-vn-flag-shape')||types.includes('text/plain')){e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='copy';canvas.classList.add('shape-drop-ready')}});
canvas.addEventListener('dragleave',e=>{if(!canvas.contains(e.relatedTarget))canvas.classList.remove('shape-drop-ready')});
canvas.addEventListener('drop',e=>{let type='';try{type=e.dataTransfer.getData('application/x-vn-flag-shape')||String(e.dataTransfer.getData('text/plain')||'').replace(/^vn-flag-shape:/,'')}catch{}if(!TYPES[type])return;e.preventDefault();canvas.classList.remove('shape-drop-ready');const[x,y]=worldFromClient(e);create(type,x,y)});
svg.addEventListener('pointermove',moveDrag);svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);window.addEventListener('pagehide',()=>save(true));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save(true)});
injectUI();load();if(state.items.length)state.selected=state.items[0].id;render();save(false);
window.__VN_FLAG_SHAPES={add:(type='square')=>createCenter(TYPES[type]?type:'square'),duplicate,render,save,getAll:()=>JSON.parse(JSON.stringify(state.items)),swapSelectedImages,copySelectedImageFromTarget,selectNextImageShape};
})();