(()=>{
'use strict';
if(window.__VN_TOUR_POINT_SHAPES)return;
window.__VN_TOUR_POINT_SHAPES=true;

const MARK='vn-map-tour-point-shapes-v5';
const VIS_KEY='vn-map-tour-point-shapes-visible-v1';
const $=id=>document.getElementById(id);
const dispatch=(node,type)=>node?.dispatchEvent(new Event(type,{bubbles:true}));
const wm=file=>'https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(file)+'?width=900';
const base={type:'image',w:96,h:60,fill:'#ffffff',border:'#555555',borderWidth:1.3,connectorColor:'#555555',connectorWidth:1.4,radius:4,connectorType:'elbow',elbowOffset:58,imageRatio:96/60,lockRatio:true,imageFit:'cover'};
const item=(id,tourName,x,y,side,offset,headDy,imageSrc)=>({...base,id,tourName,x,y,side,offset,headDy,imageSrc,imageUrl:imageSrc});

const LEGACY_IDS=[
 'tour-soc-trang','tour-bac-lieu','tour-dat-mui','tour-nam-can','tour-u-minh-thuong','tour-rach-gia','tour-ha-tien','tour-dinh-cau','tour-dinh-ba','tour-safari-phu-quoc','tour-vinwonders-phu-quoc','tour-grand-world','tour-ganh-dau','tour-ho-quoc','tour-hon-thom','tour-sunset-town','tour-nui-cam','tour-tra-su','tour-chau-doc','tour-lang-cham'
];

const ITEMS=[
 item('tour-soc-trang','Sóc Trăng - Chùa Som Rong',682.9,843.2,'right',215,-185,wm('Tượng phật nằm tại Sóc Trăng 2.jpg')),
 item('tour-bac-lieu','Bạc Liêu - Nhà Công tử Bạc Liêu',662.7,861.4,'right',225,-90,wm('Nhà Công tử Bạc Liêu, TX.Bạc Liêu.jpg')),
 item('tour-dat-mui','Cà Mau - Đất Mũi',584.87,901.42,'left',235,78,wm('Tuongdaimuicamau.jpg')),
 item('tour-u-minh-thuong','Kiên Giang - VQG U Minh Thượng',612.9,842.1,'left',245,-35,wm('U Minh Thượng, Kiên Giang.jpg')),
 item('tour-ha-tien','Hà Tiên - Thạch Động',567.0,797.6,'left',245,-125,wm('Thachdong.jpg')),
 item('tour-dinh-cau','Phú Quốc - Dinh Cậu',529.48,803.53,'left',245,-215,wm('Dinh Cậu ở Phú Quốc.jpg')),
 item('tour-tra-su','An Giang - Rừng tràm Trà Sư',616.46,789.30,'right',245,-65,wm('Trà Sư 2.jpg')),
 item('tour-chau-doc','Châu Đốc - Miếu Bà Chúa Xứ Núi Sam',612.9,780.0,'right',245,-155,wm('Miếu Bà Chúa Xứ Núi Sam.jpg'))
];
const IDS=ITEMS.map(x=>x.id);
const IDSET=new Set(IDS);
const LEGACY_SET=new Set(LEGACY_IDS);

function tourVisible(){
 try{return localStorage.getItem(VIS_KEY)!=='0'}catch{return true}
}
function setTourVisible(on){
 try{localStorage.setItem(VIS_KEY,on?'1':'0')}catch{}
 applyVisibility();
 syncToggle();
}
function applyVisibility(){
 const layer=$('shapeFlagLayer');
 if(!layer)return;
 const visible=tourVisible();
 layer.querySelectorAll('.flag-shape-marker[data-id]').forEach(g=>{
  if(IDSET.has(g.dataset.id))g.style.display=visible?'':'none';
 });
}
function syncToggle(){
 const btn=$('toggleTourPointShapes');
 if(!btn)return;
 const visible=tourVisible();
 btn.textContent=visible?'Ẩn 8 ảnh nổi bật':'Hiện 8 ảnh nổi bật';
 btn.title=visible?'Ẩn 8 shape ảnh nổi bật và đường nối':'Hiện lại 8 shape ảnh nổi bật và đường nối';
 btn.dataset.hidden=visible?'0':'1';
}
function injectToggle(){
 if($('toggleTourPointShapes')){syncToggle();return true}
 const select=$('shapeFlagSelect');
 const group=select?.closest('.group');
 if(!select||!group)return false;
 const wrap=document.createElement('div');
 wrap.id='tourPointShapeToggleWrap';
 wrap.style.cssText='margin:8px 0 7px';
 const btn=document.createElement('button');
 btn.id='toggleTourPointShapes';
 btn.type='button';
 btn.className='btn';
 btn.style.cssText='width:100%;font-weight:800';
 btn.addEventListener('click',()=>setTourVisible(!tourVisible()));
 wrap.appendChild(btn);
 select.insertAdjacentElement('beforebegin',wrap);
 syncToggle();
 return true;
}
let layerObserver=null;
function observeLayer(){
 const layer=$('shapeFlagLayer');
 if(!layer||layerObserver)return !!layer;
 layerObserver=new MutationObserver(()=>applyVisibility());
 layerObserver.observe(layer,{childList:true,subtree:true});
 applyVisibility();
 return true;
}

function removeLegacy(api,select,del){
 const current=api.getAll()||[];
 for(const id of LEGACY_IDS){
  if(!current.some(x=>x&&x.id===id))continue;
  select.value=id;
  dispatch(select,'change');
  del.click();
 }
}

function install(){
 if(localStorage.getItem(MARK)==='done')return true;
 const api=window.__VN_FLAG_SHAPES,select=$('shapeFlagSelect'),del=$('deleteShapeFlag');
 if(!api||typeof api.getAll!=='function'||typeof api.add!=='function'||typeof api.save!=='function'||typeof api.render!=='function'||!select||!del)return false;
 try{
  removeLegacy(api,select,del);
  for(const cfg of ITEMS){
   const f=api.add('image');
   if(!f)throw new Error('Không tạo được shape '+cfg.tourName);
   Object.assign(f,cfg);
  }
  api.save(true);
  api.render();
  const all=api.getAll()||[];
  const complete=IDS.every(id=>all.some(x=>x&&x.id===id));
  const oldGone=all.every(x=>!x?.id||!LEGACY_SET.has(x.id)||IDSET.has(x.id));
  if(complete&&oldGone){
   localStorage.setItem(MARK,'done');
   console.info('Đã rút gọn từ 20 xuống 8 shape điểm nổi bật, không reload trang.');
  }
  return complete&&oldGone;
 }catch(e){
  console.warn('Không cài được 8 shape điểm nổi bật',e);
  return false;
 }
}

let tries=0;
function boot(){
 tries++;
 const installed=install();
 const ui=injectToggle();
 const observed=observeLayer();
 applyVisibility();
 if(installed&&ui&&observed)return;
 if(tries<180)setTimeout(boot,100);
 else console.warn('Shape tool chưa sẵn sàng; không reload trang.');
}

window.__VN_TOUR_POINT_SHAPES={ids:[...IDS],show:()=>setTourVisible(true),hide:()=>setTourVisible(false),toggle:()=>setTourVisible(!tourVisible()),isVisible:tourVisible,apply:applyVisibility};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,300),{once:true});
else setTimeout(boot,300);
})();
