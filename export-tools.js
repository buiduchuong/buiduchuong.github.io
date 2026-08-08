(()=>{
'use strict';

const $=id=>document.getElementById(id);
const app=document.querySelector('.app');
const panel=document.querySelector('.panel');
const head=document.querySelector('.head');
const controls=document.querySelector('.controls');
const mapCanvas=$('canvas');
const exportButtons=['exportPngMap','exportPngFull','exportPdfMap','exportPdfFull'];
const PREF_KEY='vn-map-export-prefs-v1';

function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function setStatus(text,isError=false){
  const n=$('exportStatus');
  if(!n)return;
  n.textContent=text;
  n.style.color=isError?'#b11435':'';
}
function setBusy(on){exportButtons.forEach(id=>{const b=$(id);if(b)b.disabled=on})}
function waitFonts(){return document.fonts?.ready||Promise.resolve()}
function readPrefs(){
  try{
    const p=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');
    return{keepView:p.keepView!==false,fullHeight:clamp(Number(p.fullHeight)||0,0,12000)};
  }catch{return{keepView:true,fullHeight:0}}
}
function savePrefs(){
  try{localStorage.setItem(PREF_KEY,JSON.stringify({keepView:$('exportKeepView')?.checked!==false,fullHeight:clamp(Number($('exportFullHeight')?.value)||0,0,12000)}))}catch{}
}
function injectExportOptions(){
  const status=$('exportStatus');
  if(!status||$('exportKeepView'))return;
  const prefs=readPrefs();
  const box=document.createElement('div');
  box.id='exportAdvancedOptions';
  box.style.cssText='margin-top:8px;padding:8px;border:1px solid #ddd0bd;border-radius:9px;background:#fffaf1';
  box.innerHTML=`<label class="check" style="margin-top:0"><input id="exportKeepView" type="checkbox" ${prefs.keepView?'checked':''}> Giữ nguyên zoom / pan hiện tại khi xuất</label><label style="margin-top:8px">Chiều cao full web (px)</label><div class="value-line"><input id="exportFullHeightRange" type="range" min="0" max="8000" step="100" value="${Math.min(prefs.fullHeight,8000)}"><input id="exportFullHeight" type="number" min="0" max="12000" step="100" value="${prefs.fullHeight}"></div><div style="font-size:9.5px;color:#746a60;margin-top:4px">0 = tự động theo nội dung. Có thể nhập 2000, 3000, 5000… để PNG/PDF full web dài hơn.</div>`;
  status.insertAdjacentElement('beforebegin',box);
  const range=$('exportFullHeightRange'),num=$('exportFullHeight');
  function syncHeight(v,fromRange=false){
    v=clamp(Number(v)||0,0,12000);
    if(num)num.value=v;
    if(range)range.value=Math.min(v,8000);
    savePrefs();
    setStatus(v?`Full web sẽ có chiều cao tối thiểu ${v}px và giữ nguyên trạng thái bản đồ hiện tại.`:'Chiều cao full web đang để tự động theo nội dung.');
  }
  range?.addEventListener('input',e=>syncHeight(e.target.value,true));
  num?.addEventListener('input',e=>syncHeight(e.target.value));
  $('exportKeepView')?.addEventListener('change',()=>{savePrefs();setStatus($('exportKeepView').checked?'Khi xuất sẽ giữ nguyên zoom / pan đang nhìn thấy.':'Khi xuất sẽ dùng góc nhìn mặc định của bản đồ.')});
}
function liveViewState(){
  const vp=document.getElementById('viewport');
  return{attr:vp?.getAttribute('transform')||'',style:vp?.getAttribute('style')||''};
}
function applyViewState(doc,view,keepView){
  const vp=doc.getElementById('viewport');
  if(!vp)return;
  if(keepView){
    if(view.attr)vp.setAttribute('transform',view.attr);else vp.removeAttribute('transform');
    if(view.style)vp.setAttribute('style',view.style);
  }else{
    vp.removeAttribute('transform');
    vp.removeAttribute('style');
  }
}
function cleanClone(doc,view,keepView){
  doc.querySelectorAll('#handleLayer,#previewLayer,.tooltip,.loading').forEach(n=>n.remove());
  doc.querySelectorAll('.editor-line.selected').forEach(n=>n.classList.remove('selected'));
  doc.querySelectorAll('.province.active').forEach(n=>n.classList.remove('active'));
  doc.querySelectorAll('.flag-marker.selected').forEach(n=>n.classList.remove('selected'));
  doc.querySelectorAll('.flag-shape-marker.selected').forEach(n=>n.classList.remove('selected'));
  doc.querySelectorAll('.food-marker.selected').forEach(n=>n.classList.remove('selected'));
  doc.querySelectorAll('.shape-drop-ready').forEach(n=>n.classList.remove('shape-drop-ready'));
  applyViewState(doc,view,keepView);
}
function safeScale(width,height,wanted){
  const maxDimension=14000,maxPixels=70000000;
  const dimScale=Math.min(maxDimension/Math.max(1,width),maxDimension/Math.max(1,height));
  const pixelScale=Math.sqrt(maxPixels/Math.max(1,width*height));
  return Math.max(.65,Math.min(wanted,dimScale,pixelScale));
}
function requestedFullHeight(){return clamp(Number($('exportFullHeight')?.value)||0,0,12000)}
function fullSize(){
  const rect=app.getBoundingClientRect();
  const headH=head?.getBoundingClientRect().height||0;
  const controlsH=controls?.scrollHeight||0;
  const panelH=headH+controlsH+26;
  const autoHeight=Math.ceil(Math.max(rect.height,panelH,900));
  return{width:Math.ceil(Math.max(rect.width,app.scrollWidth)),height:Math.max(autoHeight,requestedFullHeight())};
}
async function captureMap(){
  if(!window.html2canvas)throw new Error('html2canvas chưa tải xong.');
  await waitFonts();
  const r=mapCanvas.getBoundingClientRect(),view=liveViewState(),keepView=$('exportKeepView')?.checked!==false;
  const scale=safeScale(r.width,r.height,3);
  return window.html2canvas(mapCanvas,{backgroundColor:'#f5e6cf',useCORS:true,allowTaint:false,logging:false,scale,scrollX:0,scrollY:0,onclone:doc=>cleanClone(doc,view,keepView)});
}
async function captureFull(){
  if(!window.html2canvas)throw new Error('html2canvas chưa tải xong.');
  await waitFonts();
  const size=fullSize(),view=liveViewState(),keepView=$('exportKeepView')?.checked!==false;
  const scale=safeScale(size.width,size.height,2);
  return window.html2canvas(app,{
    backgroundColor:'#e9ddcb',useCORS:true,allowTaint:false,logging:false,scale,width:size.width,height:size.height,
    windowWidth:Math.max(document.documentElement.clientWidth,size.width+24),windowHeight:Math.max(document.documentElement.clientHeight,size.height+24),scrollX:0,scrollY:0,
    onclone:doc=>{
      cleanClone(doc,view,keepView);
      doc.documentElement.style.height='auto';doc.body.style.height='auto';doc.body.style.overflow='visible';
      const a=doc.querySelector('.app'),p=doc.querySelector('.panel'),c=doc.querySelector('.controls'),w=doc.querySelector('.workspace');
      if(a){a.style.height=size.height+'px';a.style.minHeight=size.height+'px'}
      if(p){p.style.height=size.height+'px';p.style.overflow='visible'}
      if(c){c.style.overflow='visible';c.style.maxHeight='none';c.style.height='auto'}
      if(w){w.style.height=size.height+'px';w.style.minHeight=size.height+'px'}
    }
  });
}
function downloadBlob(blob,name){
  const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function canvasBlob(canvas,type='image/png',quality=1){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Không tạo được file ảnh.')),type,quality))}
async function savePng(canvas,name){downloadBlob(await canvasBlob(canvas,'image/png',1),name)}
function savePdf(canvas,name){
  const JsPdf=window.jspdf?.jsPDF;if(!JsPdf)throw new Error('jsPDF chưa tải xong.');
  const orientation=canvas.width>=canvas.height?'landscape':'portrait';
  const pdf=new JsPdf({orientation,unit:'px',format:[canvas.width,canvas.height],hotfixes:['px_scaling'],compress:true});
  const pageW=pdf.internal.pageSize.getWidth(),pageH=pdf.internal.pageSize.getHeight();
  pdf.addImage(canvas.toDataURL('image/png',1),'PNG',0,0,pageW,pageH,undefined,'FAST');pdf.save(name);
}
async function runExport(kind,target){
  setBusy(true);
  try{
    savePrefs();
    const label=target==='map'?'bản đồ':'full web',keep=$('exportKeepView')?.checked!==false;
    setStatus(`Đang tạo ${kind.toUpperCase()} ${label}${keep?' · giữ zoom hiện tại':''}…`);
    const canvas=target==='map'?await captureMap():await captureFull();
    if(kind==='png')await savePng(canvas,target==='map'?'ban-do-viet-nam.png':'full-web-ban-do-viet-nam.png');
    else savePdf(canvas,target==='map'?'ban-do-viet-nam.pdf':'full-web-ban-do-viet-nam.pdf');
    setStatus(`Đã xuất ${kind.toUpperCase()} ${label}${keep?' và giữ nguyên zoom/pan':''}. Cấu hình bản đồ không bị thay đổi.`);
  }catch(err){console.error(err);setStatus('Xuất file lỗi: '+(err?.message||err),true);alert('Không xuất được file: '+(err?.message||err))}
  finally{setBusy(false)}
}

injectExportOptions();
$('exportPngMap')?.addEventListener('click',()=>runExport('png','map'));
$('exportPngFull')?.addEventListener('click',()=>runExport('png','full'));
$('exportPdfMap')?.addEventListener('click',()=>runExport('pdf','map'));
$('exportPdfFull')?.addEventListener('click',()=>runExport('pdf','full'));
setStatus('Mặc định giữ nguyên zoom / pan hiện tại khi xuất. Full web có thể tăng chiều cao theo ý muốn.');
})();

(()=>{
  if(!document.querySelector('link[data-vn-flag-shapes]')){
    const l=document.createElement('link');l.rel='stylesheet';l.href='flag-shape-tools.css?v=3';l.dataset.vnFlagShapes='1';document.head.appendChild(l);
  }
  if(!window.__VN_FLAG_SHAPES&&!document.querySelector('script[data-vn-flag-shapes]')){
    const s=document.createElement('script');s.src='flag-shape-tools.js?v=3';s.dataset.vnFlagShapes='1';s.onerror=()=>console.warn('Không tải được thư viện shape cờ ngang');document.body.appendChild(s);
  }
})();

(()=>{
  if(window.__VN_OBJECT_SHORTCUTS||document.querySelector('script[data-vn-object-shortcuts]'))return;
  const s=document.createElement('script');s.src='keyboard-shortcuts.js?v=4';s.dataset.vnObjectShortcuts='1';s.onerror=()=>console.warn('Không tải được phím tắt Ctrl+C / Ctrl+V / Ctrl+Z / Delete');document.body.appendChild(s);
})();

(()=>{
  if(document.querySelector('script[data-vn-font6-migration]'))return;
  const s=document.createElement('script');s.src='font6-migration.js?v=2';s.dataset.vnFont6Migration='1';s.onerror=()=>console.warn('Không tải được công cụ font tên tỉnh');document.body.appendChild(s);
})();

(()=>{
  if(window.__VN_NOTE_TOOL||document.querySelector('script[data-vn-note-tool]'))return;
  const s=document.createElement('script');s.src='note-tools.js?v=1';s.dataset.vnNoteTool='1';s.onerror=()=>console.warn('Không tải được công cụ ghi chú');document.body.appendChild(s);
})();
