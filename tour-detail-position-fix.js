(()=>{
'use strict';
if(window.__VN_TOUR_DETAIL_POSITION_FIX)return;
window.__VN_TOUR_DETAIL_POSITION_FIX=true;
const MARK='vn-map-tour-detail-food-coords-standard38-v2';
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
 'tour-detail-temple-caodai':[694.2,743.6],
 'tour-detail-temple-kienan':[665.5,802.9],
 'tour-detail-temple-haitang':[880.0,471.4],
 'tour-detail-boat-mytho':[712.4,799.1],
 'tour-detail-boat-vinhhy':[932.7,718.9],
 'tour-detail-boat-saky':[910.8,514.7],
 'tour-detail-boat-cuadai':[868.9,475.6],
 'tour-detail-boat-trangan':[677.9,219.6]
};
const LEGACY_FOOD_IDS=['tour-detail-temple-hoquoc','tour-detail-boat-hatien','tour-detail-boat-anthoi'];
const LEGACY_DOM_IDS=['tour-detail-visit-vinwonders'];
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
 if(showStatus){const n=$('tourDetailCoordStatus');if(n){n.textContent=`✓ Đã cập nhật tọa độ ${fixed}/${Object.keys(POS).length} icon theo chương trình chuẩn.`;n.style.color=fixed===Object.keys(POS).length?'#287247':'#a33a31'}}
 return fixed;
}
function removeLegacyFoodIcons(){
 const api=window.__VN_FOOD,sel=$('foodSelect'),del=$('deleteFoodItem');
 if(!api||!sel||!del||typeof api.getAll!=='function')return;
 let all=api.getAll()||[];
 const before=sel.value;
 for(const id of LEGACY_FOOD_IDS){
  if(!all.some(x=>x?.id===id))continue;
  sel.value=id;dispatch(sel,'change');del.click();all=api.getAll()||[];
 }
 if(before&&all.some(x=>x?.id===before)){sel.value=before;dispatch(sel,'change')}
}
function hideLegacyDom(){
 for(const id of LEGACY_DOM_IDS){
  document.querySelectorAll(`[data-id="${id}"]`).forEach(n=>{n.style.display='none';n.setAttribute('data-standard38-hidden','1')});
 }
}
function ensureStandardRoute(){
 if(document.getElementById('tourStandard38Layer'))return;
 const old=document.getElementById('tourMain35Layer');if(old)old.remove();
 const oldDefs=document.getElementById('tourMain35Defs');if(oldDefs)oldDefs.remove();
 const oldGroup=document.getElementById('tourRouteGroup');if(oldGroup)oldGroup.remove();
 if(document.querySelector('script[data-standard38-route="1"]'))return;
 const s=document.createElement('script');s.src='tour-route.js?v=9';s.dataset.standard38Route='1';s.onerror=()=>console.warn('Không tải được tour-route.js bản chuẩn 38 ngày');document.body.appendChild(s);
}
function attach(){
 const btn=$('fixTourDetailPositions');
 if(!btn||!window.__VN_FOOD)return false;
 if(btn.dataset.realPositionFix!=='1'){
  btn.dataset.realPositionFix='1';
  btn.addEventListener('click',()=>applyFoodPositions(false),true);
 }
 removeLegacyFoodIcons();hideLegacyDom();ensureStandardRoute();
 let done=false;try{done=localStorage.getItem(MARK)==='done'}catch{}
 if(!done)setTimeout(()=>applyFoodPositions(false),150);
 return true;
}
let tries=0;
function boot(){tries++;if(attach())return;if(tries<180)setTimeout(boot,120)}
function loadAttractions(){
 if(document.getElementById('tourAttractionLayer')||document.querySelector('script[data-xv-attractions="1"]'))return;
 const s=document.createElement('script');
 s.src='tour-attractions.js?v=3';
 s.dataset.xvAttractions='1';
 s.onerror=()=>console.warn('Không tải được tour-attractions.js');
 document.body.appendChild(s);
}
function loadJourneySymbolMenu(){
 if(document.getElementById('journeySymbolGroup')||document.querySelector('script[data-journey-symbol-menu="1"]'))return;
 const s=document.createElement('script');
 s.src='journey-symbol-menu.js?v=1';
 s.dataset.journeySymbolMenu='1';
 s.onerror=()=>console.warn('Không tải được journey-symbol-menu.js');
 document.body.appendChild(s);
}
function loadPickupArrowSize(){
 if(document.getElementById('pickupArrowSizeControl')||document.querySelector('script[data-pickup-arrow-size="1"]'))return;
 const s=document.createElement('script');
 s.src='pickup-arrow-size.js?v=1';
 s.dataset.pickupArrowSize='1';
 s.onerror=()=>console.warn('Không tải được pickup-arrow-size.js');
 document.body.appendChild(s);
}
function keepLegacyHidden(){
 hideLegacyDom();
 const target=document.getElementById('viewport')||document.body;
 try{new MutationObserver(()=>hideLegacyDom()).observe(target,{childList:true,subtree:true})}catch{}
}
function startAll(){setTimeout(boot,250);loadAttractions();loadJourneySymbolMenu();loadPickupArrowSize();keepLegacyHidden();ensureStandardRoute()}
window.__VN_TOUR_DETAIL_POSITION_FIX={apply:()=>applyFoodPositions(true)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startAll,{once:true});else startAll();
})();
