(()=>{
'use strict';

const $=id=>document.getElementById(id);
const app=document.querySelector('.app');
const panel=document.querySelector('.panel');
const head=document.querySelector('.head');
const controls=document.querySelector('.controls');
const mapCanvas=$('canvas');
const exportButtons=['exportPngMap','exportPngFull','exportPdfMap','exportPdfFull'];

function setStatus(text,isError=false){
  const n=$('exportStatus');
  if(!n)return;
  n.textContent=text;
  n.style.color=isError?'#b11435':'';
}

function setBusy(on){
  exportButtons.forEach(id=>{const b=$(id);if(b)b.disabled=on});
}

function waitFonts(){
  return document.fonts?.ready||Promise.resolve();
}

function cleanClone(doc){
  doc.querySelectorAll('#handleLayer,#previewLayer,.tooltip,.loading').forEach(n=>n.remove());
  doc.querySelectorAll('.editor-line.selected').forEach(n=>n.classList.remove('selected'));
  doc.querySelectorAll('.province.active').forEach(n=>n.classList.remove('active'));
  doc.querySelectorAll('.flag-marker.selected').forEach(n=>n.classList.remove('selected'));
  doc.querySelectorAll('.flag-shape-marker.selected').forEach(n=>n.classList.remove('selected'));
  doc.querySelectorAll('.food-marker.selected').forEach(n=>n.classList.remove('selected'));
  doc.querySelectorAll('.shape-drop-ready').forEach(n=>n.classList.remove('shape-drop-ready'));
}

function safeScale(width,height,wanted){
  const maxDimension=14000;
  const maxPixels=70000000;
  const dimScale=Math.min(maxDimension/Math.max(1,width),maxDimension/Math.max(1,height));
  const pixelScale=Math.sqrt(maxPixels/Math.max(1,width*height));
  return Math.max(.75,Math.min(wanted,dimScale,pixelScale));
}

function fullSize(){
  const rect=app.getBoundingClientRect();
  const headH=head?.getBoundingClientRect().height||0;
  const controlsH=controls?.scrollHeight||0;
  const panelH=headH+controlsH+26;
  return{
    width:Math.ceil(Math.max(rect.width,app.scrollWidth)),
    height:Math.ceil(Math.max(rect.height,panelH,900))
  };
}

async function captureMap(){
  if(!window.html2canvas)throw new Error('html2canvas chưa tải xong.');
  await waitFonts();
  const r=mapCanvas.getBoundingClientRect();
  const scale=safeScale(r.width,r.height,3);
  return window.html2canvas(mapCanvas,{
    backgroundColor:'#f5e6cf',
    useCORS:true,
    allowTaint:false,
    logging:false,
    scale,
    scrollX:0,
    scrollY:0,
    onclone:cleanClone
  });
}

async function captureFull(){
  if(!window.html2canvas)throw new Error('html2canvas chưa tải xong.');
  await waitFonts();
  const size=fullSize();
  const scale=safeScale(size.width,size.height,2);
  return window.html2canvas(app,{
    backgroundColor:'#e9ddcb',
    useCORS:true,
    allowTaint:false,
    logging:false,
    scale,
    width:size.width,
    height:size.height,
    windowWidth:Math.max(document.documentElement.clientWidth,size.width+24),
    windowHeight:Math.max(document.documentElement.clientHeight,size.height+24),
    scrollX:0,
    scrollY:0,
    onclone:doc=>{
      cleanClone(doc);
      doc.documentElement.style.height='auto';
      doc.body.style.height='auto';
      doc.body.style.overflow='visible';
      const a=doc.querySelector('.app');
      const p=doc.querySelector('.panel');
      const c=doc.querySelector('.controls');
      const w=doc.querySelector('.workspace');
      if(a){a.style.height=size.height+'px';a.style.minHeight=size.height+'px'}
      if(p){p.style.height=size.height+'px';p.style.overflow='visible'}
      if(c){c.style.overflow='visible';c.style.maxHeight='none';c.style.height='auto'}
      if(w){w.style.height=size.height+'px';w.style.minHeight=size.height+'px'}
    }
  });
}

function downloadBlob(blob,name){
  const a=document.createElement('a');
  const url=URL.createObjectURL(blob);
  a.href=url;
  a.download=name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1200);
}

function canvasBlob(canvas,type='image/png',quality=1){
  return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Không tạo được file ảnh.')),type,quality));
}

async function savePng(canvas,name){
  const blob=await canvasBlob(canvas,'image/png',1);
  downloadBlob(blob,name);
}

function savePdf(canvas,name){
  const JsPdf=window.jspdf?.jsPDF;
  if(!JsPdf)throw new Error('jsPDF chưa tải xong.');
  const orientation=canvas.width>=canvas.height?'landscape':'portrait';
  const pdf=new JsPdf({
    orientation,
    unit:'px',
    format:[canvas.width,canvas.height],
    hotfixes:['px_scaling'],
    compress:true
  });
  const pageW=pdf.internal.pageSize.getWidth();
  const pageH=pdf.internal.pageSize.getHeight();
  const data=canvas.toDataURL('image/png',1);
  pdf.addImage(data,'PNG',0,0,pageW,pageH,undefined,'FAST');
  pdf.save(name);
}

async function runExport(kind,target){
  setBusy(true);
  try{
    const label=target==='map'?'bản đồ':'full web';
    setStatus(`Đang tạo ${kind.toUpperCase()} ${label}…`);
    const canvas=target==='map'?await captureMap():await captureFull();
    if(kind==='png'){
      await savePng(canvas,target==='map'?'ban-do-viet-nam.png':'full-web-ban-do-viet-nam.png');
    }else{
      savePdf(canvas,target==='map'?'ban-do-viet-nam.pdf':'full-web-ban-do-viet-nam.pdf');
    }
    setStatus(`Đã xuất ${kind.toUpperCase()} ${label}. Cấu hình hiện tại không bị thay đổi.`);
  }catch(err){
    console.error(err);
    setStatus('Xuất file lỗi: '+(err?.message||err),true);
    alert('Không xuất được file: '+(err?.message||err));
  }finally{
    setBusy(false);
  }
}

$('exportPngMap')?.addEventListener('click',()=>runExport('png','map'));
$('exportPngFull')?.addEventListener('click',()=>runExport('png','full'));
$('exportPdfMap')?.addEventListener('click',()=>runExport('pdf','map'));
$('exportPdfFull')?.addEventListener('click',()=>runExport('pdf','full'));

setStatus('Xuất file chỉ đọc trạng thái hiện tại; không ghi đè cấu hình hoặc localStorage.');
})();

(()=>{
  if(!document.querySelector('link[data-vn-flag-shapes]')){
    const l=document.createElement('link');l.rel='stylesheet';l.href='flag-shape-tools.css?v=3';l.dataset.vnFlagShapes='1';document.head.appendChild(l);
  }
  if(!window.__VN_FLAG_SHAPES&&!document.querySelector('script[data-vn-flag-shapes]')){
    const s=document.createElement('script');s.src='flag-shape-tools.js?v=2';s.dataset.vnFlagShapes='1';s.onerror=()=>console.warn('Không tải được thư viện shape cờ ngang');document.body.appendChild(s);
  }
})();

(()=>{
  if(window.__VN_OBJECT_SHORTCUTS||document.querySelector('script[data-vn-object-shortcuts]'))return;
  const s=document.createElement('script');
  s.src='keyboard-shortcuts.js?v=4';
  s.dataset.vnObjectShortcuts='1';
  s.onerror=()=>console.warn('Không tải được phím tắt Ctrl+C / Ctrl+V / Ctrl+Z / Delete');
  document.body.appendChild(s);
})();