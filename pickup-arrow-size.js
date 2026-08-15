(()=>{
'use strict';
if(window.__VN_PICKUP_ARROW_SIZE_SAFE)return;
window.__VN_PICKUP_ARROW_SIZE_SAFE=true;

const STORE='vn-pickup-arrow-size-safe-v1';
const ROUTE_IDS=['route-08','route-04','route-12','route-15','route-19','route-11','route-20','route-14','route-25','route-24','route-22','route-31','route-33'];
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let scale=1;

try{
 const d=JSON.parse(localStorage.getItem(STORE)||'null');
 if(d&&Number.isFinite(Number(d.scale)))scale=clamp(Number(d.scale),.4,1.8);
}catch{}

function save(){try{localStorage.setItem(STORE,JSON.stringify({scale}))}catch{}}

function apply(){
 const layer=$('lineLayer');
 if(!layer)return 0;
 let count=0;
 ROUTE_IDS.forEach(id=>{
  const p=layer.querySelector(`path[data-id="${id}"]`);
  if(!p)return;
  let base=Number(p.dataset.pickupBaseWidth);
  if(!Number.isFinite(base)||base<=0){
   base=Number(p.getAttribute('stroke-width'))||2;
   p.dataset.pickupBaseWidth=String(base);
  }
  p.setAttribute('stroke-width',String(Math.max(.25,base*scale)));
  p.dataset.pickupSizeScale=String(scale);
  count++;
 });
 return count;
}

function syncInputs(){
 const r=$('pickupArrowSizeRange'),n=$('pickupArrowSizeNumber'),s=$('pickupArrowSizeStatus');
 const pct=Math.round(scale*100);
 if(r)r.value=String(pct);
 if(n)n.value=String(pct);
 if(s)s.textContent=`${pct}% · áp dụng cho 13 mũi tên`;
}

function setScalePercent(v){
 const pct=clamp(Number(v)||100,40,180);
 scale=pct/100;
 syncInputs();apply();save();
}

function injectUI(){
 if($('pickupArrowSizeGroup'))return true;
 const controls=document.querySelector('.controls');
 if(!controls)return false;
 const g=document.createElement('div');
 g.className='group';g.id='pickupArrowSizeGroup';
 g.innerHTML=`<div class="group-title">13 mũi tên về Hà Nội</div><label><b>Kích thước đồng loạt</b></label><div class="value-line"><input id="pickupArrowSizeRange" type="range" min="40" max="180" step="5" value="100"><input id="pickupArrowSizeNumber" type="number" min="40" max="180" step="5" value="100"></div><div id="pickupArrowSizeStatus" class="mode-note" style="margin-top:6px">100% · áp dụng cho 13 mũi tên</div><button id="pickupArrowSizeReset" class="btn" style="width:100%;margin-top:7px">Khôi phục 100%</button><div class="tip">Điều chỉnh đồng thời độ dày thân đường và kích thước đầu mũi tên của 13 tuyến đón khách về Hà Nội. Không thay đổi vị trí, độ cong hoặc cung đường.</div>`;
 const provinceGroup=[...controls.children].find(x=>x.querySelector?.('.group-title')?.textContent.includes('Tỉnh & điểm tuyến'));
 if(provinceGroup&&provinceGroup.nextSibling)controls.insertBefore(g,provinceGroup.nextSibling);else if(provinceGroup)controls.appendChild(g);else controls.insertBefore(g,controls.firstChild);
 $('pickupArrowSizeRange').addEventListener('input',e=>setScalePercent(e.target.value));
 $('pickupArrowSizeNumber').addEventListener('input',e=>setScalePercent(e.target.value));
 $('pickupArrowSizeReset').addEventListener('click',()=>setScalePercent(100));
 syncInputs();return true;
}

function scheduleApply(){requestAnimationFrame(()=>requestAnimationFrame(apply))}
function bindRefreshEvents(){
 if(window.__VN_PICKUP_ARROW_SIZE_EVENTS)return;
 window.__VN_PICKUP_ARROW_SIZE_EVENTS=true;
 const controls=document.querySelector('.controls'),svg=$('mapSvg');
 if(controls){
  controls.addEventListener('input',e=>{if(e.target?.id==='pickupArrowSizeRange'||e.target?.id==='pickupArrowSizeNumber')return;scheduleApply()},true);
  controls.addEventListener('change',scheduleApply,true);
  controls.addEventListener('click',scheduleApply,true);
 }
 if(svg){svg.addEventListener('pointerup',scheduleApply,true);svg.addEventListener('pointercancel',scheduleApply,true)}
 window.addEventListener('resize',scheduleApply,{passive:true});
}

let tries=0;
function boot(){
 tries++;
 const ui=injectUI(),count=apply();
 if(ui&&count===ROUTE_IDS.length){bindRefreshEvents();syncInputs();return}
 if(tries<120)setTimeout(boot,250);
 else{bindRefreshEvents();syncInputs();console.warn(`Kích thước mũi tên: chỉ tìm thấy ${count}/${ROUTE_IDS.length} tuyến.`)}
}

window.__VN_PICKUP_ARROW_SIZE={getScale:()=>scale,setPercent:setScalePercent,apply};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,300),{once:true});else setTimeout(boot,300);
})();
