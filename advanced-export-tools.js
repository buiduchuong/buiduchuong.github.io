(()=>{
'use strict';
if(window.__VN_ADVANCED_EXPORT)return;
window.__VN_ADVANCED_EXPORT=true;

const $=id=>document.getElementById(id);
const svg=$('mapSvg');
const mapCanvas=$('canvas');
const STATUS=()=>$('exportStatus');
const XLINK='http://www.w3.org/1999/xlink';
const SVG_NS='http://www.w3.org/2000/svg';
let busy=false;

function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function status(text,error=false){const n=STATUS();if(!n)return;n.textContent=text;n.style.color=error?'#b11435':''}
function waitFonts(){return document.fonts?.ready||Promise.resolve()}
function keepView(){return $('exportKeepView')?.checked!==false}
function currentView(){const vp=$('viewport');return{transform:vp?.getAttribute('transform')||'',style:vp?.getAttribute('style')||''}}
function applyView(root,view){const vp=root.querySelector?.('#viewport');if(!vp)return;if(keepView()){view.transform?vp.setAttribute('transform',view.transform):vp.removeAttribute('transform');view.style?vp.setAttribute('style',view.style):vp.removeAttribute('style')}else{vp.removeAttribute('transform');vp.removeAttribute('style')}}
function cleanSvg(root){
  root.querySelectorAll('#handleLayer,#previewLayer').forEach(n=>n.remove());
  root.querySelectorAll('.editor-line.selected,.flag-marker.selected,.flag-shape-marker.selected,.food-marker.selected').forEach(n=>n.classList.remove('selected'));
  root.querySelectorAll('.province.active').forEach(n=>n.classList.remove('active'));
  root.querySelectorAll('.shape-anchor-hit,.shape-head-hit').forEach(n=>n.setAttribute('opacity','0'));
}
function cleanHtmlClone(doc,view){
  doc.querySelectorAll('#handleLayer,#previewLayer,.tooltip,.loading').forEach(n=>n.remove());
  doc.querySelectorAll('.editor-line.selected,.flag-marker.selected,.flag-shape-marker.selected,.food-marker.selected').forEach(n=>n.classList.remove('selected'));
  doc.querySelectorAll('.province.active').forEach(n=>n.classList.remove('active'));
  doc.querySelectorAll('.shape-drop-ready').forEach(n=>n.classList.remove('shape-drop-ready'));
  applyView(doc,view);
}
function blobToDataURL(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(r.error||new Error('Không đọc được ảnh'));r.readAsDataURL(blob)})}
async function hrefToDataURL(href){
  if(!href||/^data:/i.test(href))return href;
  const absolute=new URL(href,location.href).href;
  const res=await fetch(absolute,{mode:'cors',cache:'no-store'});
  if(!res.ok)throw new Error('HTTP '+res.status);
  return blobToDataURL(await res.blob());
}
async function inlineSvgImages(root){
  const images=[...root.querySelectorAll('image')];
  const failed=[];
  for(let i=0;i<images.length;i++){
    const image=images[i];
    const href=image.getAttribute('href')||image.getAttributeNS(XLINK,'href')||'';
    if(!href||/^data:/i.test(href))continue;
    status(`Đang nhúng ảnh vào SVG/PDF… ${i+1}/${images.length}`);
    try{
      const data=await hrefToDataURL(href);
      if(data){image.setAttribute('href',data);image.setAttributeNS(XLINK,'xlink:href',data)}
    }catch(err){failed.push({href,error:err?.message||String(err)})}
  }
  return failed;
}
function collectLocalCss(){
  let css='';
  for(const sheet of [...document.styleSheets]){
    try{for(const rule of [...sheet.cssRules])css+=rule.cssText+'\n'}catch{}
  }
  return css;
}
function injectSvgStyles(root){
  root.querySelectorAll('style[data-vn-export-style]').forEach(n=>n.remove());
  const style=document.createElementNS(SVG_NS,'style');
  style.setAttribute('data-vn-export-style','1');
  style.textContent=collectLocalCss()+`\n.province-name{font-family:Roboto,Arial,sans-serif;text-anchor:middle;stroke:none}.province-distance{font-family:Roboto,Arial,sans-serif;text-anchor:middle;font-weight:700;fill:#333;stroke:none}.editor-line{fill:none}.shape-anchor-hit,.shape-head-hit{opacity:0}.pin-o{fill:#fff8ea;stroke:#e51d49;stroke-width:1.8}.pin-i{fill:#e51d49}`;
  root.insertBefore(style,root.firstChild);
}
async function buildStandaloneSvg(){
  if(!svg)throw new Error('Không tìm thấy bản đồ SVG.');
  await waitFonts();
  window.__VN_DEFAULT_ROUTE_DASH?.apply?.();
  const view=currentView();
  const clone=svg.cloneNode(true);
  clone.setAttribute('xmlns',SVG_NS);
  clone.setAttribute('xmlns:xlink',XLINK);
  cleanSvg(clone);
  applyView(clone,view);
  injectSvgStyles(clone);
  const failed=await inlineSvgImages(clone);
  return{clone,failed};
}
function downloadBlob(blob,name){const a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1400)}
function downloadText(text,name,type){downloadBlob(new Blob([text],{type}),name)}
function serializeSvg(node){return'<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(node)}
async function exportEmbeddedSvg(){
  const{clone,failed}=await buildStandaloneSvg();
  downloadText(serializeSvg(clone),'ban-do-viet-nam-tu-nhung-anh.svg','image/svg+xml;charset=utf-8');
  if(failed.length)status(`Đã xuất SVG, nhưng ${failed.length} ảnh URL bị máy chủ chặn CORS nên vẫn phải giữ link ngoài. Hãy dùng ảnh từ máy để file độc lập 100%.`,true);
  else status('✓ Đã xuất SVG tự nhúng toàn bộ ảnh. File có thể mở độc lập mà không phụ thuộc URL ảnh.');
}
function targetScale(targetWidth){
  const r=mapCanvas.getBoundingClientRect();
  if(!r.width||!r.height)return 2;
  const desired=targetWidth?targetWidth/r.width:Math.max(2,window.devicePixelRatio||1);
  const maxDim=14000,maxPixels=95000000;
  const dimLimit=maxDim/Math.max(r.width,r.height);
  const pixelLimit=Math.sqrt(maxPixels/(r.width*r.height));
  return clamp(Math.min(desired,dimLimit,pixelLimit),.75,10);
}
async function renderMapPng(targetWidth){
  if(!window.html2canvas)throw new Error('html2canvas chưa tải xong.');
  await waitFonts();
  window.__VN_DEFAULT_ROUTE_DASH?.apply?.();
  const view=currentView(),r=mapCanvas.getBoundingClientRect(),scale=targetScale(targetWidth);
  return window.html2canvas(mapCanvas,{backgroundColor:'#f5e6cf',useCORS:true,allowTaint:false,logging:false,scale,scrollX:0,scrollY:0,width:Math.ceil(r.width),height:Math.ceil(r.height),onclone:doc=>cleanHtmlClone(doc,view)});
}
function canvasToBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Không tạo được PNG.')),'image/png',1))}
async function exportPng(targetWidth,label,file){
  status(`Đang xuất ${label}…`);
  const canvas=await renderMapPng(targetWidth);
  downloadBlob(await canvasToBlob(canvas),file);
  status(`✓ Đã xuất ${label}: ${canvas.width} × ${canvas.height}px${keepView()?' · giữ zoom/pan hiện tại':''}.`);
}
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=()=>resolve(s);s.onerror=()=>{s.remove();reject(new Error('Không tải được '+src))};document.head.appendChild(s)})}
async function ensureSvg2Pdf(){
  const JsPdf=window.jspdf?.jsPDF;
  if(!JsPdf)throw new Error('jsPDF chưa tải xong.');
  if(typeof JsPdf.API?.svg==='function')return JsPdf;
  const urls=['https://cdn.jsdelivr.net/npm/svg2pdf.js@2.6.0/dist/svg2pdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/svg2pdf.js/2.6.0/svg2pdf.umd.min.js'];
  let last;
  for(const url of urls){try{await loadScript(url);if(typeof JsPdf.API?.svg==='function')return JsPdf}catch(e){last=e}}
  throw last||new Error('Không khởi tạo được bộ xuất PDF vector.');
}
function svgBox(node){
  const vb=node.getAttribute('viewBox')?.trim().split(/[ ,]+/).map(Number)||[];
  if(vb.length===4&&vb.every(Number.isFinite)&&vb[2]>0&&vb[3]>0)return{w:vb[2],h:vb[3]};
  return{w:Number(node.getAttribute('width'))||1400,h:Number(node.getAttribute('height'))||1000};
}
async function exportVectorPdf(){
  status('Đang chuẩn bị PDF Vector…');
  const JsPdf=await ensureSvg2Pdf();
  const{clone,failed}=await buildStandaloneSvg();
  const{w,h}=svgBox(clone);
  clone.setAttribute('width',String(w));clone.setAttribute('height',String(h));
  const host=document.createElement('div');
  host.style.cssText=`position:fixed;left:-20000px;top:0;width:${w}px;height:${h}px;opacity:0;pointer-events:none`;
  host.appendChild(clone);document.body.appendChild(host);
  try{
    const pdf=new JsPdf({orientation:w>=h?'landscape':'portrait',unit:'px',format:[w,h],hotfixes:['px_scaling'],compress:true});
    if(typeof pdf.svg!=='function')throw new Error('Thư viện PDF vector không khả dụng.');
    status('Đang chuyển đường, chữ và shape sang PDF Vector…');
    await pdf.svg(clone,{x:0,y:0,width:w,height:h});
    pdf.save('ban-do-viet-nam-vector.pdf');
    if(failed.length)status(`✓ Đã xuất PDF Vector. ${failed.length} ảnh URL bị CORS có thể không xuất được; dùng ảnh local để chắc chắn.`,true);
    else status('✓ Đã xuất PDF Vector. Ranh giới, đường, shape và chữ giữ dạng vector; ảnh bitmap được nhúng ở độ phân giải gốc.');
  }finally{host.remove()}
}
function replaceButton(id,label,handler){
  const old=$(id);if(!old)return null;
  const btn=old.cloneNode(true);btn.textContent=label;old.replaceWith(btn);btn.addEventListener('click',handler);return btn;
}
function setBusy(v){
  busy=v;
  ['exportPngMap','exportPng4K','exportPng8K','exportPdfMap','exportAll'].forEach(id=>{const b=$(id);if(b)b.disabled=v});
}
async function run(fn){if(busy)return;setBusy(true);try{await fn()}catch(err){console.error(err);status('Lỗi xuất file: '+(err?.message||err),true);alert('Không xuất được file: '+(err?.message||err))}finally{setBusy(false)}}
function injectUi(){
  const pngOld=$('exportPngMap'),pdfOld=$('exportPdfMap'),svgOld=$('exportAll');
  if(!pngOld||!pdfOld||!svgOld){setTimeout(injectUi,150);return}
  if($('exportPng4K'))return;
  const firstRow=pngOld.closest('.row');
  replaceButton('exportPngMap','PNG thường',()=>run(()=>exportPng(null,'PNG thường','ban-do-viet-nam.png')));
  replaceButton('exportPdfMap','PDF Vector',()=>run(exportVectorPdf));
  replaceButton('exportAll','SVG tự nhúng ảnh',()=>run(exportEmbeddedSvg));
  const hi=document.createElement('div');hi.className='row';hi.innerHTML='<button id="exportPng4K" class="btn primary" type="button">PNG 4K</button><button id="exportPng8K" class="btn primary" type="button">PNG 8K</button>';
  firstRow.insertAdjacentElement('afterend',hi);
  $('exportPng4K').addEventListener('click',()=>run(()=>exportPng(3840,'PNG 4K','ban-do-viet-nam-4k.png')));
  $('exportPng8K').addEventListener('click',()=>run(()=>exportPng(7680,'PNG 8K','ban-do-viet-nam-8k.png')));
  const group=STATUS()?.closest('.group'),tip=group?.querySelector('.tip');
  if(tip)tip.textContent='PNG thường/4K/8K xuất bản đồ theo góc zoom hiện tại. SVG tự nhúng ảnh tạo file độc lập. PDF Vector giữ ranh giới, đường, chữ và shape dạng vector; ảnh chèn vẫn giữ theo chất lượng ảnh gốc. PNG/PDF full web cũ vẫn dùng để xuất toàn bộ giao diện dài.';
  status('Sẵn sàng: PNG thường / PNG 4K / PNG 8K / SVG tự nhúng ảnh / PDF Vector.');
}

injectUi();
})();
