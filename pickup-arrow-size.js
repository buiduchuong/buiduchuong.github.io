(()=>{
'use strict';
if(window.__VN_PICKUP_ARROW_SIZE_CSS)return;
window.__VN_PICKUP_ARROW_SIZE_CSS=true;
const STORE='vn-pickup-arrow-size-safe-v2';
const MIN=0.7,MAX=4,STEP=0.1,DEFAULT=1.7;
const ROUTE_SELECTOR='#lineLayer .editor-line[data-id^="route-"]';
const EXPORT_IDS=new Set(['exportPngMap','exportPngFull','exportPdfMap','exportPdfFull','exportAll','exportPng4K','exportPng8K']);
const $=id=>document.getElementById(id);
const clamp=v=>Math.max(MIN,Math.min(MAX,Number(v)||DEFAULT));
function read(){try{return clamp(localStorage.getItem(STORE)||DEFAULT)}catch{return DEFAULT}}
function save(v){try{localStorage.setItem(STORE,String(v))}catch{}}
function bake(root=document,v=read()){
 v=clamp(v);
 try{
  const doc=root?.nodeType===9?root:root?.ownerDocument;
  if(doc?.documentElement)doc.documentElement.style.setProperty('--pickup-arrow-width',`${v}px`);
  if(root?.style?.setProperty)root.style.setProperty('--pickup-arrow-width',`${v}px`);
  root?.querySelectorAll?.(ROUTE_SELECTOR).forEach(p=>{
   p.setAttribute('stroke-width',String(v));
   p.style.setProperty('stroke-width',`${v}px`,'important');
   p.dataset.exportPickupWidth=String(v);
  });
 }catch(e){console.warn('Không cố định được kích thước 13 mũi tên',e)}
 return v;
}
function apply(v){
 v=clamp(v);
 document.documentElement.style.setProperty('--pickup-arrow-width',`${v}px`);
 const r=$('pickupArrowSizeRange'),n=$('pickupArrowSizeNumber'),s=$('pickupArrowSizeStatus');
 if(r)r.value=String(v);if(n)n.value=String(v);if(s)s.textContent=`${v.toFixed(1)} px · 13 mũi tên`;
 save(v);bake(document,v);
}
function injectStyle(){
 if($('pickupArrowSizeStyle'))return;
 const s=document.createElement('style');s.id='pickupArrowSizeStyle';
 s.textContent='#lineLayer .editor-line[data-id^="route-"]{stroke-width:var(--pickup-arrow-width,1.7px)!important}';
 document.head.appendChild(s);
}
function injectUI(){
 if($('pickupArrowSizeGroup'))return;
 const show=$('showRoutes');if(!show)return;
 const label=show.closest('label');if(!label)return;
 const box=document.createElement('div');box.id='pickupArrowSizeGroup';box.style.margin='7px 0 9px';
 box.innerHTML=`<label style="display:block;margin-bottom:5px"><b>Kích thước 13 mũi tên về Hà Nội</b></label><div class="value-line"><input id="pickupArrowSizeRange" type="range" min="${MIN}" max="${MAX}" step="${STEP}"><input id="pickupArrowSizeNumber" type="number" min="${MIN}" max="${MAX}" step="${STEP}"></div><div id="pickupArrowSizeStatus" class="mode-note" style="margin-top:5px"></div><div class="tip">Kích thước đang nhìn thấy sẽ được giữ nguyên khi xuất PNG, 4K/8K, SVG và PDF. Không đổi vị trí, độ cong hay dữ liệu tuyến.</div>`;
 label.insertAdjacentElement('afterend',box);
 $('pickupArrowSizeRange').addEventListener('input',e=>apply(e.target.value));
 $('pickupArrowSizeNumber').addEventListener('input',e=>apply(e.target.value));
}
function exportCapture(e){
 const btn=e.target?.closest?.('button');
 if(btn&&EXPORT_IDS.has(btn.id))bake(document,read());
}
function init(){
 injectStyle();injectUI();apply(read());
 document.addEventListener('click',exportCapture,true);
}
window.__VN_PICKUP_ARROW_SIZE={getWidth:read,apply,bake};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
