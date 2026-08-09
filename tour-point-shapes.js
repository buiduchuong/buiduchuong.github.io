(()=>{
'use strict';
if(window.__VN_TOUR_POINT_SHAPES)return;
window.__VN_TOUR_POINT_SHAPES=true;

const MARK='vn-map-tour-point-shapes-v7-embedded-webp';
const VIS_KEY='vn-map-tour-point-shapes-visible-v1';
const $=id=>document.getElementById(id);
const dispatch=(node,type)=>node?.dispatchEvent(new Event(type,{bubbles:true}));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const base={type:'image',w:96,h:60,fill:'#ffffff',border:'#555555',borderWidth:1.3,connectorColor:'#555555',connectorWidth:1.4,radius:4,connectorType:'elbow',elbowOffset:58,imageRatio:96/60,lockRatio:true,imageFit:'cover'};
const item=(id,tourName,x,y,side,offset,headDy,imageSrc)=>({...base,id,tourName,x,y,side,offset,headDy,imageSrc,imageUrl:imageSrc});

// Giữ đúng các ảnh cũ. Lần đầu mở bản v7, ảnh sẽ được tải rồi nén về WebP
// và lưu thẳng vào imageSrc dạng data:image/... để PNG 4K/8K không phụ thuộc CORS.
const PHOTO={
 socTrang:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/T%C6%B0%E1%BB%A3ng_ph%E1%BA%ADt_n%E1%BA%B1m_t%E1%BA%A1i_S%C3%B3c_Tr%C4%83ng_2.jpg/960px-T%C6%B0%E1%BB%A3ng_ph%E1%BA%ADt_n%E1%BA%B1m_t%E1%BA%A1i_S%C3%B3c_Tr%C4%83ng_2.jpg',
 bacLieu:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Nh%C3%A0_C%C3%B4ng_t%E1%BB%AD_B%E1%BA%A1c_Li%C3%AAu%2C_TX.B%E1%BA%A1c_Li%C3%AAu.jpg/960px-Nh%C3%A0_C%C3%B4ng_t%E1%BB%AD_B%E1%BA%A1c_Li%C3%AAu%2C_TX.B%E1%BA%A1c_Li%C3%AAu.jpg',
 datMui:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Tuongdaimuicamau.jpg/960px-Tuongdaimuicamau.jpg',
 uMinh:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/U_Minh_Th%C6%B0%E1%BB%A3ng%2C_Ki%C3%AAn_Giang.jpg/960px-U_Minh_Th%C6%B0%E1%BB%A3ng%2C_Ki%C3%AAn_Giang.jpg',
 haTien:'https://upload.wikimedia.org/wikipedia/commons/0/03/Thachdong.jpg',
 dinhCau:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Dinh_C%E1%BA%ADu_%E1%BB%9F_Ph%C3%BA_Qu%E1%BB%91c.jpg/960px-Dinh_C%E1%BA%ADu_%E1%BB%9F_Ph%C3%BA_Qu%E1%BB%91c.jpg',
 traSu:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Tr%C3%A0_S%C6%B0_2.jpg/960px-Tr%C3%A0_S%C6%B0_2.jpg',
 chauDoc:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Mi%E1%BA%BFu_B%C3%A0_Ch%C3%BAa_X%E1%BB%A9_N%C3%BAi_Sam.jpg/960px-Mi%E1%BA%BFu_B%C3%A0_Ch%C3%BAa_X%E1%BB%A9_N%C3%BAi_Sam.jpg'
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
const IDS=ITEMS.map(x=>x.id);
const IDSET=new Set(IDS);
const LEGACY_SET=new Set(LEGACY_IDS);
const KEEP_FIELDS=['x','y','side','offset','headDy','connectorType','elbowOffset','w','h','fill','border','borderWidth','connectorColor','connectorWidth','radius','lockRatio','imageFit'];

function tourVisible(){try{return localStorage.getItem(VIS_KEY)!=='0'}catch{return true}}
function setTourVisible(on){try{localStorage.setItem(VIS_KEY,on?'1':'0')}catch{}applyVisibility();syncToggle()}
function applyVisibility(){const layer=$('shapeFlagLayer');if(!layer)return;const visible=tourVisible();layer.querySelectorAll('.flag-shape-marker[data-id]').forEach(g=>{if(IDSET.has(g.dataset.id))g.style.display=visible?'':'none'})}
function syncToggle(){const btn=$('toggleTourPointShapes');if(!btn)return;const visible=tourVisible();btn.textContent=visible?'Ẩn 8 ảnh nổi bật':'Hiện 8 ảnh nổi bật';btn.title=visible?'Ẩn 8 shape ảnh nổi bật và đường nối':'Hiện lại 8 shape ảnh nổi bật và đường nối';btn.dataset.hidden=visible?'0':'1'}
function injectToggle(){if($('toggleTourPointShapes')){syncToggle();return true}const select=$('shapeFlagSelect'),group=select?.closest('.group');if(!select||!group)return false;const wrap=document.createElement('div');wrap.id='tourPointShapeToggleWrap';wrap.style.cssText='margin:8px 0 7px';const btn=document.createElement('button');btn.id='toggleTourPointShapes';btn.type='button';btn.className='btn';btn.style.cssText='width:100%;font-weight:800';btn.addEventListener('click',()=>setTourVisible(!tourVisible()));wrap.appendChild(btn);select.insertAdjacentElement('beforebegin',wrap);syncToggle();return true}
let layerObserver=null;
function observeLayer(){const layer=$('shapeFlagLayer');if(!layer||layerObserver)return !!layer;layerObserver=new MutationObserver(()=>applyVisibility());layerObserver.observe(layer,{childList:true,subtree:true});applyVisibility();return true}

function removeLegacy(api,select,del){const current=api.getAll()||[];for(const id of LEGACY_IDS){if(!current.some(x=>x&&x.id===id))continue;select.value=id;dispatch(select,'change');del.click()}}
function savedLayout(current){const out=new Map();for(const f of current){if(!f?.id||!IDSET.has(f.id))continue;const keep={};for(const k of KEEP_FIELDS)if(f[k]!==undefined)keep[k]=f[k];out.set(f.id,keep)}return out}
function loadHtmlImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Không đọc được ảnh'));im.src=src})}
async function optimizeBlob(blob){
 if(!blob?.type?.startsWith('image/'))throw new Error('Nguồn trả về không phải ảnh');
 const url=URL.createObjectURL(blob);
 try{
  const im=await loadHtmlImage(url),max=900,scale=Math.min(1,max/Math.max(im.naturalWidth||1,im.naturalHeight||1));
  const w=Math.max(1,Math.round((im.naturalWidth||1)*scale)),h=Math.max(1,Math.round((im.naturalHeight||1)*scale));
  const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');if(!ctx)throw new Error('Không tạo được canvas nén ảnh');ctx.drawImage(im,0,0,w,h);
  let data=c.toDataURL('image/webp',.84);if(!data.startsWith('data:image/webp'))data=c.toDataURL('image/jpeg',.88);
  return{data,width:im.naturalWidth||w,height:im.naturalHeight||h};
 }finally{URL.revokeObjectURL(url)}
}
async function fetchEmbedded(url){
 let last;
 for(let i=0;i<2;i++){
  try{
   const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),20000);
   const r=await fetch(url,{mode:'cors',cache:i?'reload':'no-store',credentials:'omit',signal:ctrl.signal});clearTimeout(timer);
   if(!r.ok)throw new Error('HTTP '+r.status);
   return await optimizeBlob(await r.blob());
  }catch(e){last=e}
 }
 throw last||new Error('Không tải được ảnh');
}

let installRunning=false;
async function install(){
 if(localStorage.getItem(MARK)==='done')return true;
 const api=window.__VN_FLAG_SHAPES,select=$('shapeFlagSelect'),del=$('deleteShapeFlag');
 if(!api||typeof api.getAll!=='function'||typeof api.add!=='function'||typeof api.save!=='function'||typeof api.render!=='function'||!select||!del)return false;
 if(installRunning)return false;
 installRunning=true;
 try{
  console.info('Đang chuyển 8 ảnh nổi bật sang WebP nội bộ để xuất 8K ổn định…');
  const embedded=await Promise.all(ITEMS.map(cfg=>fetchEmbedded(cfg.imageSrc)));
  const before=api.getAll()||[],layouts=savedLayout(before);
  removeLegacy(api,select,del);
  for(let i=0;i<ITEMS.length;i++){
   const cfg=ITEMS[i],photo=embedded[i],f=api.add('image');
   if(!f)throw new Error('Không tạo được shape '+cfg.tourName);
   Object.assign(f,cfg,layouts.get(cfg.id)||{});
   f.imageSrc=photo.data;
   f.imageUrl=cfg.imageUrl;
   if(photo.width>0&&photo.height>0)f.imageRatio=photo.width/photo.height;
  }
  api.save(true);api.render();
  const all=api.getAll()||[];
  const complete=IDS.every(id=>all.some(x=>x&&x.id===id&&/^data:image\//i.test(x.imageSrc||'')));
  const oldGone=all.every(x=>!x?.id||!LEGACY_SET.has(x.id)||IDSET.has(x.id));
  if(complete&&oldGone){localStorage.setItem(MARK,'done');console.info('✓ 8 ảnh nổi bật đã được nhúng WebP nội bộ; PNG 8K không còn phụ thuộc Wikimedia.');return true}
  return false;
 }catch(e){console.warn('Chưa chuyển được 8 ảnh sang WebP nội bộ; sẽ thử lại khi mở trang/lần sau.',e);return false}
 finally{installRunning=false}
}

let tries=0;
async function boot(){
 tries++;
 const installed=await install();
 const ui=injectToggle(),observed=observeLayer();applyVisibility();
 if(installed&&ui&&observed)return;
 if(tries<8)setTimeout(boot,1800*Math.min(tries,3));
 else console.warn('Chưa nhúng đủ 8 ảnh nội bộ; giữ nguyên ảnh hiện tại, không reload trang.');
}

window.__VN_TOUR_POINT_SHAPES={ids:[...IDS],show:()=>setTourVisible(true),hide:()=>setTourVisible(false),toggle:()=>setTourVisible(!tourVisible()),isVisible:tourVisible,apply:applyVisibility};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,500),{once:true});else setTimeout(boot,500);
})();

(()=>{
 if(window.__VN_PNG_EXPORT_FIX||document.querySelector('script[data-vn-png-export-fix]'))return;
 const s=document.createElement('script');s.src='png-export-fix.js?v=1';s.dataset.vnPngExportFix='1';s.onerror=()=>console.warn('Không tải được bộ sửa xuất PNG 4K/8K');document.body.appendChild(s);
})();
