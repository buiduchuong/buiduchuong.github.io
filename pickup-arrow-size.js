(()=>{
'use strict';
if(window.__VN_PICKUP_ARROW_SIZE)return;
window.__VN_PICKUP_ARROW_SIZE=true;
const $=id=>document.getElementById(id);
const STORE='vn-pickup-arrow-size-v2';
const DEFAULT_SIZE=1.2;
const MIN=.4,MAX=4,STEP=.1;
let size=load();
function clamp(v){return Math.max(MIN,Math.min(MAX,Number(v)||DEFAULT_SIZE))}
function load(){try{const v=Number(localStorage.getItem(STORE));return Number.isFinite(v)&&v>=MIN&&v<=MAX?v:DEFAULT_SIZE}catch{return DEFAULT_SIZE}}
function save(){try{localStorage.setItem(STORE,String(size))}catch{}}
function apply(){
 const layer=$('lineLayer');if(!layer)return;
 const s=String(size);
 layer.querySelectorAll('path[data-id^="route-"]').forEach(p=>{
  if(p.getAttribute('stroke-width')!==s)p.setAttribute('stroke-width',s);
 });
 const range=$('pickupArrowSizeRange'),num=$('pickupArrowSize');
 if(range&&range.value!==s)range.value=s;
 if(num&&num.value!==s)num.value=s;
 const value=$('pickupArrowSizeValue');if(value)value.textContent=size.toFixed(1);
}
function setSize(v){size=clamp(v);save();apply()}
function inject(){
 if($('pickupArrowSizeGroup'))return true;
 const show=$('showRoutes');if(!show)return false;
 const group=show.closest('.group');if(!group)return false;
 const box=document.createElement('div');
 box.id='pickupArrowSizeGroup';
 box.style.marginTop='9px';
 box.innerHTML=`
  <label for="pickupArrowSizeRange"><b>Kích thước 13 mũi tên về Hà Nội</b> <span id="pickupArrowSizeValue">${size.toFixed(1)}</span></label>
  <div class="value-line" style="margin-top:5px">
    <input id="pickupArrowSizeRange" type="range" min="${MIN}" max="${MAX}" step="${STEP}" value="${size}">
    <input id="pickupArrowSize" type="number" min="${MIN}" max="${MAX}" step="${STEP}" value="${size}">
  </div>
  <div class="tip" style="margin-top:5px">Kéo sang trái để 13 mũi tên nhỏ/mảnh hơn, kéo sang phải để lớn hơn.</div>`;
 const showLabel=show.closest('label');
 if(showLabel?.nextSibling)group.insertBefore(box,showLabel.nextSibling);else group.appendChild(box);
 $('pickupArrowSizeRange')?.addEventListener('input',e=>setSize(e.target.value));
 $('pickupArrowSize')?.addEventListener('input',e=>setSize(e.target.value));
 show.addEventListener('change',()=>setTimeout(apply,0));
 return true;
}
function bindLightRefresh(){
 const svg=$('mapSvg');
 if(svg){
  svg.addEventListener('pointerup',()=>setTimeout(apply,0));
  svg.addEventListener('click',()=>setTimeout(apply,0));
 }
 document.addEventListener('change',e=>{
  if(e.target?.id==='pickupArrowSizeRange'||e.target?.id==='pickupArrowSize')return;
  setTimeout(apply,0);
 });
}
let tries=0;
function boot(){
 tries++;
 if(!inject()){if(tries<100)setTimeout(boot,100);return}
 bindLightRefresh();
 apply();
 [100,300,700,1500,3000].forEach(ms=>setTimeout(apply,ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
