(()=>{
'use strict';
if(window.__VN_JOURNEY_SYMBOL_MENU)return;
window.__VN_JOURNEY_SYMBOL_MENU=true;
const $=id=>document.getElementById(id);
const STORE='vn-journey-symbol-menu-v1';
const CONTROL_MAP={
 route:['showTourRoute'],
 numbers:['showTourNumbers'],
 arrows:['showTourArrows'],
 attractions:['showAttractions','showTourAttractions'],
 attractionLabels:['showAttractionLabels','showTourAttractionLabels'],
 food:['showTourDetailFood'],
 temple:['showTourDetailTemple'],
 boat:['showTourDetailBoat'],
 visit:['showTourDetailVisit'],
 legend:['showTourDetailLegend']
};
function first(ids){for(const id of ids){const n=$(id);if(n)return n}return null}
function dispatch(n){if(!n)return;n.dispatchEvent(new Event('change',{bubbles:true}))}
function setControl(key,value){const n=first(CONTROL_MAP[key]||[]);if(!n)return false;n.checked=!!value;dispatch(n);return true}
function getControl(key){const n=first(CONTROL_MAP[key]||[]);return n?!!n.checked:null}
function save(){try{localStorage.setItem(STORE,JSON.stringify({open:!$('journeySymbolBody')?.hidden}))}catch{}}
function symbolRow(symbol,label,key){return `<button type="button" class="btn journey-symbol-toggle" data-key="${key}" style="display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;margin-top:6px;text-align:left"><span style="min-width:50px;font-weight:900;text-align:center">${symbol}</span><span style="flex:1">${label}</span><b class="journey-symbol-state" data-state="${key}" style="font-size:11px">—</b></button>`}
function inject(){
 const controls=document.querySelector('.controls');
 if(!controls||$('journeySymbolGroup'))return false;
 const g=document.createElement('div');g.className='group';g.id='journeySymbolGroup';
 g.innerHTML=`
  <div class="group-title" style="display:flex;align-items:center;justify-content:space-between;gap:8px">
    <span>Ký hiệu hành trình</span>
    <button id="journeySymbolCollapse" type="button" class="btn" style="padding:4px 8px;min-width:auto">Thu gọn</button>
  </div>
  <div id="journeySymbolBody">
    <div class="row" style="margin-bottom:6px">
      <button id="journeySymbolsShowAll" type="button" class="btn primary">Bật tất cả</button>
      <button id="journeySymbolsHideAll" type="button" class="btn danger">Tắt tất cả</button>
    </div>
    <div style="padding:7px 9px;border:1px solid rgba(0,0,0,.12);border-radius:8px;background:rgba(255,255,255,.55);font-size:12px;line-height:1.65">
      <div><b style="color:#f4b400">★</b> Điểm khởi hành</div>
      <div><b style="color:#d71945">━━━━</b> Tuyến đường bộ</div>
      <div><b style="color:#1677d2">┄ ┄ ┄</b> Tuyến tàu / cano</div>
      <div><b style="color:#d71945">①</b> Số thứ tự hành trình</div>
      <div><b style="color:#f59e0b">●</b> Điểm tham quan</div>
      <div>🍴 Điểm ăn uống &nbsp; 🏛️ Chùa / tâm linh &nbsp; ⛴️ Tàu / cano</div>
      <div><b style="color:#16803a">✓</b> Điểm kết thúc</div>
    </div>
    ${symbolRow('<span style="color:#d71945">━━━━</span>','Cung đường Xuyên Việt','route')}
    ${symbolRow('<span style="color:#d71945">①</span>','Số thứ tự','numbers')}
    ${symbolRow('➜','Mũi tên chỉ hướng','arrows')}
    ${symbolRow('<span style="color:#f59e0b">●</span>','Điểm tham quan','attractions')}
    ${symbolRow('🏷️','Tên điểm tham quan','attractionLabels')}
    ${symbolRow('🍴','Điểm ăn uống','food')}
    ${symbolRow('🏛️','Chùa / tâm linh','temple')}
    ${symbolRow('⛴️','Tàu / cano','boat')}
    ${symbolRow('🖼️','Điểm hành trình nổi bật','visit')}
    ${symbolRow('ℹ️','Chú giải chi tiết','legend')}
    <div class="tip" style="margin-top:8px">Dùng <b>Tắt tất cả</b> khi cần bản đồ sạch để xem tuyến. Sau đó bật riêng ký hiệu bạn muốn.</div>
  </div>`;
 const route=$('tourRouteGroup');
 if(route&&route.parentNode===controls)controls.insertBefore(g,route.nextSibling);else controls.insertBefore(g,controls.firstChild);
 bind();sync();
 return true;
}
function supportedKeys(){return Object.keys(CONTROL_MAP).filter(k=>first(CONTROL_MAP[k]))}
function setAll(value){
 const keys=supportedKeys();
 for(const k of keys){
  // Khi tắt ALL, tắt luôn tên điểm. Khi bật ALL, chỉ bật các nhóm thực sự có control.
  setControl(k,value);
 }
 setTimeout(sync,40);
}
function toggleKey(key){const n=first(CONTROL_MAP[key]||[]);if(!n)return;n.checked=!n.checked;dispatch(n);setTimeout(sync,30)}
function sync(){
 document.querySelectorAll('[data-state]').forEach(n=>{
  const key=n.dataset.state,v=getControl(key);
  if(v===null){n.textContent='N/A';n.style.opacity='.45';return}
  n.textContent=v?'BẬT':'TẮT';n.style.opacity='1';n.style.color=v?'#287247':'#a33a31';
 });
 document.querySelectorAll('.journey-symbol-toggle').forEach(btn=>{
  const v=getControl(btn.dataset.key);btn.disabled=v===null;btn.style.opacity=v===null?'.5':'1';
 });
}
function bind(){
 $('journeySymbolsShowAll')?.addEventListener('click',()=>setAll(true));
 $('journeySymbolsHideAll')?.addEventListener('click',()=>setAll(false));
 document.querySelectorAll('.journey-symbol-toggle').forEach(btn=>btn.addEventListener('click',()=>toggleKey(btn.dataset.key)));
 $('journeySymbolCollapse')?.addEventListener('click',()=>{
  const body=$('journeySymbolBody'),btn=$('journeySymbolCollapse');if(!body||!btn)return;
  body.hidden=!body.hidden;btn.textContent=body.hidden?'Mở':'Thu gọn';save();
 });
 try{const s=JSON.parse(localStorage.getItem(STORE)||'{}');if(s.open===false){$('journeySymbolBody').hidden=true;$('journeySymbolCollapse').textContent='Mở'}}catch{}
 const mo=new MutationObserver(()=>sync());
 mo.observe(document.querySelector('.controls'),{childList:true,subtree:true,attributes:true,attributeFilter:['checked']});
 document.querySelector('.controls').addEventListener('change',()=>setTimeout(sync,0));
}
let tries=0;
function boot(){tries++;if(inject())return;if(tries<200)setTimeout(boot,100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
