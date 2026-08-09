(()=>{
'use strict';
if(window.__VN_DEFAULT_ROUTE_DASH)return;
window.__VN_DEFAULT_ROUTE_DASH=true;

const ROUTE_CODES=['08','04','12','15','19','11','20','14','25','24','22','31','33'];
const ROUTE_IDS=new Set(ROUTE_CODES.map(code=>'route-'+code));
const DASH='8 6';

function applyDash(root=document){
  const layer=document.getElementById('lineLayer');
  if(!layer)return;
  layer.querySelectorAll('.editor-line[data-id]').forEach(path=>{
    if(ROUTE_IDS.has(path.dataset.id)){
      path.setAttribute('stroke-dasharray',DASH);
      path.setAttribute('stroke-linecap','round');
      path.dataset.defaultRouteDash='1';
    }
  });
}

function loadTourPointShapes(){
  if(window.__VN_TOUR_POINT_SHAPES||document.querySelector('script[data-vn-tour-point-shapes]'))return;
  const s=document.createElement('script');
  s.src='tour-point-shapes.js?v=3';
  s.dataset.vnTourPointShapes='1';
  s.onerror=()=>console.warn('Không tải được 5 shape điểm miền Tây');
  document.body.appendChild(s);
}

function init(){
  const layer=document.getElementById('lineLayer');
  if(!layer){setTimeout(init,120);return}
  applyDash();
  const observer=new MutationObserver(()=>applyDash());
  observer.observe(layer,{childList:true,subtree:true});
  window.__VN_DEFAULT_ROUTE_DASH={apply:applyDash,ids:[...ROUTE_IDS],observer};
  loadTourPointShapes();
}

init();
})();
