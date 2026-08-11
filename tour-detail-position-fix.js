(()=>{
'use strict';
if(window.__VN_TOUR_DETAIL_POSITION_FIX)return;
window.__VN_TOUR_DETAIL_POSITION_FIX=true;
const MARK='vn-map-tour-detail-food-coords-v1';
const $=id=>document.getElementById(id);
const POS={
 'tour-detail-food-hue':[808.2,441.5],
 'tour-detail-food-cantho':[668.0,817.8],
 'tour-detail-food-namcan':[606.3,892.5],
 'tour-detail-food-chaudoc':[615.8,778.6],
 'tour-detail-food-vinhhy':[932.7,718.9],
 'tour-detail-food-culaoc':[879.7,471.6],
 'tour-detail-food-ninhbinh':[677.9,219.6],
 'tour-detail-temple-thienmu':[804.6,442.1],
 'tour-detail-temple-linhung':[861.5,462.8],
 'tour-detail-temple-minhthanh':[840.6,587.1],
 'tour-detail-temple-linhphuoc':[878.2,706.1],
 'tour-detail-temple-vinhtrang':[711.2,799.5],
 'tour-detail-temple-hoquoc':[532.6,817.9],
 'tour-detail-temple-caodai':[694.2,743.6],
 'tour-detail-temple-kienan':[665.5,802.9],
 'tour-detail-temple-haitang':[880.0,471.4],
 'tour-detail-boat-mytho':[712.4,799.1],
 'tour-detail-boat-hatien':[566.8,797.4],
 'tour-detail-boat-anthoi':[529.4,818.3],
 'tour-detail-boat-vinhhy':[932.7,718.9],
 'tour-detail-boat-saky':[910.8,514.7],
 'tour-detail-boat-cuadai':[868.9,475.6],
 'tour-detail-boat-trangan':[677.9,219.6]
};
function dispatch(node,type){node?.dispatchEvent(new Event(type,{bubbles:true}))}
function applyFoodPositions(showStatus=false){
 const api=window.__VN_FOOD,sel=$('foodSelect'),x=$('foodX'),y=$('foodY');
 if(!api||!sel||!x||!y||typeof api.getAll!=='function')return 0;
 const existing=new Set((api.getAll()||[]).map(v=>v?.id));let fixed=0;
 const before=sel.value;
 for(const [id,[px,py]] of Object.entries(POS)){
  if(!existing.has(id))continue;
  sel.value=id;dispatch(sel,'change');
  x.value=String(px);dispatch(x,'input');
  y.value=String(py);dispatch(y,'input');
  fixed++;
 }
 if(before&&existing.has(before)){sel.value=before;dispatch(sel,'change')}
 try{api.save(true)}catch{}
 try{localStorage.setItem(MARK,'done')}catch{}
 if(showStatus){const n=$('tourDetailCoordStatus');if(n){n.textContent=`✓ Đã cập nhật tọa độ thật ${fixed}/${Object.keys(POS).length} icon ăn uống, chùa và tàu/cano.`;n.style.color=fixed===Object.keys(POS).length?'#287247':'#a33a31'}}
 return fixed;
}
function attach(){
 const btn=$('fixTourDetailPositions');
 if(!btn||!window.__VN_FOOD)return false;
 if(btn.dataset.realPositionFix!=='1'){
  btn.dataset.realPositionFix='1';
  btn.addEventListener('click',()=>applyFoodPositions(false),true);
 }
 let done=false;try{done=localStorage.getItem(MARK)==='done'}catch{}
 if(!done)setTimeout(()=>applyFoodPositions(false),150);
 return true;
}
let tries=0;
function boot(){tries++;if(attach())return;if(tries<180)setTimeout(boot,120)}
window.__VN_TOUR_DETAIL_POSITION_FIX={apply:()=>applyFoodPositions(true)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,250),{once:true});else setTimeout(boot,250);
})();
