(()=>{
'use strict';
if(window.__VN_TOUR_POINT_SHAPES)return;
window.__VN_TOUR_POINT_SHAPES=true;

const MARK='vn-map-tour-point-shapes-v8-local-jpg';
const VIS_KEY='vn-map-tour-point-shapes-visible-v1';
const POSITION_MARK='vn-map-tour-point-shapes-position-fixed-v1';
const $=id=>document.getElementById(id);
const dispatch=(node,type)=>node?.dispatchEvent(new Event(type,{bubbles:true}));
const base={type:'image',w:96,h:60,fill:'#ffffff',border:'#555555',borderWidth:1.3,connectorColor:'#555555',connectorWidth:1.4,radius:4,connectorType:'elbow',elbowOffset:58,imageRatio:96/60,lockRatio:true,imageFit:'cover'};
const item=(id,tourName,x,y,side,offset,headDy,imageSrc)=>({...base,id,tourName,x,y,side,offset,headDy,imageSrc,imageUrl:''});

// 8 ảnh thật đã được lưu trực tiếp trong repo. Không còn dùng Wikimedia/CORS/localStorage base64.
const PHOTO={
 socTrang:'tour-assets/photos/soc-trang.jpg',
 bacLieu:'tour-assets/photos/bac-lieu.jpg',
 datMui:'tour-assets/photos/dat-mui.jpg',
 uMinh:'tour-assets/photos/u-minh-thuong.jpg',
 haTien:'tour-assets/photos/ha-tien-thach-dong.jpg',
 dinhCau:'tour-assets/photos/phu-quoc-dinh-cau.jpg',
 traSu:'tour-assets/photos/tra-su.jpg',
 chauDoc:'tour-assets/photos/chau-doc-mieu-ba.jpg'
};

const LEGACY_IDS=[
 'tour-soc-trang','tour-bac-lieu','tour-dat-mui','tour-nam-can','tour-u-minh-thuong','tour-rach-gia','tour-ha-tien','tour-dinh-cau','tour-dinh-ba','tour-safari-phu-quoc','tour-vinwonders-phu-quoc','tour-grand-world','tour-ganh-dau','tour-ho-quoc','tour-hon-thom','tour-sunset-town','tour-nui-cam','tour-tra-su','tour-chau-doc','tour-lang-cham'
];
const ITEMS=[
 item('tour-soc-trang','Sóc Trăng - Chùa Som Rong',682.9,843.2,'right',215,-185,PHOTO.socTrang),
 item('tour-bac-lieu','Bạc Liêu - Nhà Công tử Bạc Liêu',662.7,861.4,'right',225,-90,PHOTO.bacLieu),
 item('tour-dat-mui','Cà Mau - Đất Mũi',584.87,901.42,'left',235,78,PHOTO.datMui),
 item('tour-u-minh-thuong','Kiên Giang - VQG U Minh Thượng',612.9,842.1,'left',245,-35,PHOTO.uMinh),
 item('tour-ha-tien','Hà Tiên - Thạch Động',567.0,797.6,'left',245,-125,PHOTO.haTien),
 item('tour-dinh-cau','Phú Quốc - Dinh Cậu',529.48,803.53,'left',245,-215,PHOTO.dinhCau),
 item('tour-tra-su','An Giang - Rừng tràm Trà Sư',616.46,789.30,'right',245,-65,PHOTO.traSu),
 item('tour-chau-doc','Châu Đốc - Miếu Bà Chúa Xứ Núi Sam',612.9,780.0,'right',245,-155,PHOTO.chauDoc)
];
const IDS=ITEMS.map(x=>x.id),IDSET=new Set(IDS),LEGACY_SET=new Set(LEGACY_IDS);
const KEEP_FIELDS=['x','y','side','offset','headDy','connectorType','elbowOffset','w','h','fill','border','borderWidth','connectorColor','connectorWidth','radius','lockRatio','imageFit'];

function tourVisible(){try{return localStorage.getItem(VIS_KEY)!=='0'}catch{return true}}
function setTourVisible(on){try{localStorage.setItem(VIS_KEY,on?'1':'0')}catch{}applyVisibility();syncToggle()}
function applyVisibility(){const layer=$('shapeFlagLayer');if(!layer)return;const visible=tourVisible();layer.querySelectorAll('.flag-shape-marker[data-id]').forEach(g=>{if(IDSET.has(g.dataset.id))g.style.display=visible?'':'none'})}
function syncToggle(){const btn=$('toggleTourPointShapes');if(!btn)return;const visible=tourVisible();btn.textContent=visible?'Ẩn 8 ảnh nổi bật':'Hiện 8 ảnh nổi bật';btn.title=visible?'Ẩn 8 shape ảnh nổi bật và đường nối':'Hiện lại 8 shape ảnh nổi bật và đường nối';btn.dataset.hidden=visible?'0':'1'}
function injectToggle(){
 const select=$('shapeFlagSelect'),group=select?.closest('.group'),quick=select?.closest('.flag-shape-quick');if(!select||!group)return false;
 let wrap=$('tourPointShapeToggleWrap');
 if(!wrap){wrap=document.createElement('div');wrap.id='tourPointShapeToggleWrap';wrap.style.cssText='margin:8px 0 7px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px;width:100%;min-width:0;box-sizing:border-box';(quick||select).insertAdjacentElement('beforebegin',wrap)}
 let btn=$('toggleTourPointShapes');
 if(!btn){btn=document.createElement('button');btn.id='toggleTourPointShapes';btn.type='button';btn.className='btn';btn.style.cssText='width:100%;min-width:0;min-height:42px;padding:7px 9px;font-weight:800;line-height:1.2;white-space:normal;word-break:normal;box-sizing:border-box';btn.addEventListener('click',()=>setTourVisible(!tourVisible()));wrap.appendChild(btn)}
 let fix=$('fixTourPointShapePositions');
 if(!fix){fix=document.createElement('button');fix.id='fixTourPointShapePositions';fix.type='button';fix.className='btn primary';fix.style.cssText='width:100%;min-width:0;min-height:42px;padding:7px 9px;font-weight:800;line-height:1.2;white-space:normal;word-break:normal;box-sizing:border-box';fix.textContent='Sửa đúng vị trí 8 Shape Ảnh';fix.title='Đưa điểm neo của 8 Shape Ảnh về đúng địa danh; giữ nguyên ảnh, kích thước và kiểu khung';fix.addEventListener('click',()=>fixManagedPositions(true));wrap.appendChild(fix)}
 let note=$('tourPointShapePositionNote');
 if(!note){note=document.createElement('div');note.id='tourPointShapePositionNote';note.style.cssText='grid-column:1/-1;width:100%;max-width:100%;font-size:10px;color:#746a60;line-height:1.4;white-space:normal;word-break:normal;overflow-wrap:break-word;box-sizing:border-box';note.textContent='Chỉ sửa X/Y điểm neo. Ảnh, W×H, khung và đường nối bạn đã chỉnh vẫn được giữ nguyên.';wrap.appendChild(note)}
 syncToggle();return true
}
let layerObserver=null;
function observeLayer(){const layer=$('shapeFlagLayer');if(!layer||layerObserver)return !!layer;layerObserver=new MutationObserver(()=>applyVisibility());layerObserver.observe(layer,{childList:true,subtree:true});applyVisibility();return true}
function savedLayout(current){const out=new Map();for(const f of current){if(!f?.id||!IDSET.has(f.id))continue;const keep={};for(const k of KEEP_FIELDS)if(f[k]!==undefined)keep[k]=f[k];out.set(f.id,keep)}return out}
function setSelectedPosition(id,x,y){
 const select=$('shapeFlagSelect'),ix=$('shapeFlagX'),iy=$('shapeFlagY');
 if(!select||!ix||!iy)return false;
 const exists=[...select.options].some(o=>o.value===id);if(!exists)return false;
 select.value=id;dispatch(select,'change');
 ix.value=String(x);dispatch(ix,'input');
 iy.value=String(y);dispatch(iy,'input');
 return true
}
function fixManagedPositions(showMessage=false){
 const select=$('shapeFlagSelect');if(!select)return 0;
 const previous=select.value;let fixed=0;
 for(const cfg of ITEMS)if(setSelectedPosition(cfg.id,cfg.x,cfg.y))fixed++;
 if(previous&&[...select.options].some(o=>o.value===previous)){select.value=previous;dispatch(select,'change')}
 if(fixed===ITEMS.length){try{localStorage.setItem(POSITION_MARK,'done')}catch{}}
 const note=$('tourPointShapePositionNote');
 if(note&&showMessage)note.innerHTML=fixed===ITEMS.length?'<b>✓ Đã đưa đúng vị trí 8 Shape Ảnh.</b> Chỉ X/Y điểm neo thay đổi; ảnh, W×H và khung được giữ nguyên.':`Đã sửa ${fixed}/${ITEMS.length} Shape Ảnh; hãy tải lại trang nếu còn shape chưa sẵn sàng.`;
 return fixed
}
function migrateManagedPositionsOnce(){let done=false;try{done=localStorage.getItem(POSITION_MARK)==='done'}catch{}if(done)return true;return fixManagedPositions(false)===ITEMS.length}

function removeLegacy(api,select,del){const current=api.getAll()||[];for(const id of LEGACY_IDS){if(!current.some(x=>x&&x.id===id))continue;select.value=id;dispatch(select,'change');del.click()}}
function loadAsset(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(true);im.onerror=()=>reject(new Error('Không tải được '+src));im.src=src+'?v=8'})}
async function assetsReady(){await Promise.all(Object.values(PHOTO).map(loadAsset));return true}

let installing=false;
async function install(){
 if(localStorage.getItem(MARK)==='done')return true;
 const api=window.__VN_FLAG_SHAPES,select=$('shapeFlagSelect'),del=$('deleteShapeFlag');
 if(!api||typeof api.getAll!=='function'||typeof api.add!=='function'||typeof api.save!=='function'||typeof api.render!=='function'||!select||!del)return false;
 if(installing)return false;installing=true;
 try{
  await assetsReady();
  const before=api.getAll()||[],layouts=savedLayout(before);
  removeLegacy(api,select,del);
  for(const cfg of ITEMS){
   const f=api.add('image');if(!f)throw new Error('Không tạo được shape '+cfg.tourName);
   Object.assign(f,cfg,layouts.get(cfg.id)||{});
   // Luôn ép về ảnh JPG nội bộ; loại bỏ data URL/URL ngoài cũ.
   f.imageSrc=cfg.imageSrc;f.imageUrl='';
  }
  api.save(true);api.render();
  const all=api.getAll()||[];
  const complete=ITEMS.every(cfg=>all.some(x=>x?.id===cfg.id&&x.imageSrc===cfg.imageSrc));
  const oldGone=all.every(x=>!x?.id||!LEGACY_SET.has(x.id)||IDSET.has(x.id));
  if(complete&&oldGone){localStorage.setItem(MARK,'done');console.info('✓ 8 shape đã chuyển sang JPG nội bộ trong GitHub; không còn ảnh URL ngoài/base64.');return true}
  return false;
 }catch(e){console.warn('Chưa chuyển được 8 shape sang JPG nội bộ',e);return false}
 finally{installing=false}
}

let tries=0;
async function boot(){tries++;const installed=await install(),ui=injectToggle(),observed=observeLayer(),positioned=migrateManagedPositionsOnce();applyVisibility();if(installed&&ui&&observed&&positioned)return;if(tries<12)setTimeout(boot,900);else console.warn('Shape tool, ảnh nội bộ hoặc vị trí shape chưa sẵn sàng; không reload trang.')}
window.__VN_TOUR_POINT_SHAPES={ids:[...IDS],show:()=>setTourVisible(true),hide:()=>setTourVisible(false),toggle:()=>setTourVisible(!tourVisible()),isVisible:tourVisible,apply:applyVisibility,fixPositions:()=>fixManagedPositions(true)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,350),{once:true});else setTimeout(boot,350);
})();

(()=>{
 if(window.__VN_PNG_EXPORT_FIX||document.querySelector('script[data-vn-png-export-fix]'))return;
 const s=document.createElement('script');s.src='png-export-fix.js?v=13';s.dataset.vnPngExportFix='1';s.onerror=()=>console.warn('Không tải được bộ sửa xuất PNG 4K/8K');document.body.appendChild(s);
})();
