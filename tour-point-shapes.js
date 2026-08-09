(()=>{
'use strict';
if(window.__VN_TOUR_POINT_SHAPES)return;
window.__VN_TOUR_POINT_SHAPES=true;

const MARK='vn-map-tour-point-shapes-v4';
const $=id=>document.getElementById(id);
const dispatch=(node,type)=>node?.dispatchEvent(new Event(type,{bubbles:true}));
const wm=file=>'https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(file)+'?width=900';
const base={type:'image',w:90,h:56,fill:'#ffffff',border:'#555555',borderWidth:1.3,connectorColor:'#555555',connectorWidth:1.4,radius:4,connectorType:'elbow',elbowOffset:60,imageRatio:90/56,lockRatio:true,imageFit:'cover'};
const item=(id,tourName,x,y,side,offset,headDy,imageSrc)=>({...base,id,tourName,x,y,side,offset,headDy,imageSrc,imageUrl:imageSrc});

const ITEMS=[
 item('tour-soc-trang','Sóc Trăng - Chùa Som Rong',682.9,843.2,'right',240,-268,wm('Tượng phật nằm tại Sóc Trăng 2.jpg')),
 item('tour-bac-lieu','Bạc Liêu - Nhà Công tử Bạc Liêu',662.7,861.4,'right',250,-211,wm('Nhà Công tử Bạc Liêu, TX.Bạc Liêu.jpg')),
 item('tour-dat-mui','Đất Mũi Cà Mau',584.87,901.42,'left',300,34,wm('Tuongdaimuicamau.jpg')),
 item('tour-nam-can','Năm Căn',605.9,892.4,'left',300,-32,wm('Thị trấn Năm Căn, Cà Mau.jpg')),
 item('tour-u-minh-thuong','VQG U Minh Thượng',612.9,842.1,'left',300,-57,wm('U Minh Thượng, Kiên Giang.jpg')),
 item('tour-rach-gia','Rạch Giá',612.9,819.2,'left',300,-109,wm('Cổng tam quan Rạch Giá.jpg')),
 item('tour-ha-tien','Hà Tiên - Thạch Động',567.0,797.6,'left',300,-163,wm('Thachdong.jpg')),
 item('tour-dinh-cau','Phú Quốc - Dinh Cậu',529.48,803.53,'left',300,-243,wm('Dinh Cậu ở Phú Quốc.jpg')),
 item('tour-dinh-ba','Phú Quốc - Dinh Bà Thủy Long Thánh Mẫu',529.4,807.2,'left',180,-222,wm('Dinh Bà Thủy Long Thánh Mẫu.jpg')),
 item('tour-safari-phu-quoc','Vinpearl Safari Phú Quốc',520.41,800.10,'left',180,-145,wm('Vinpearl Safari Phú Quốc.jpg')),
 item('tour-vinwonders-phu-quoc','VinWonders Phú Quốc',518.2,800.7,'left',180,-76,wm('VinWonders-Phu-Quoc.jpg')),
 item('tour-grand-world','Grand World Phú Quốc',517.98,800.72,'left',180,-6,wm('2023-07-30 Grand World Phú Quốc 204809.jpg')),
 item('tour-ganh-dau','Mũi Gành Dầu',516.5,798.3,'left',180,67,'https://owa.bestprice.vn/images/destinations/uploads/mui-ganh-dau-5433a3b2cc59e.jpg'),
 item('tour-ho-quoc','Thiền viện Trúc Lâm Hộ Quốc',531.09,813.36,'left',180,122,wm('Chùa Hộ Quốc (52681168609).jpg')),
 item('tour-hon-thom','Hòn Thơm - Tour 4 đảo',529.46,818.24,'right',280,117,wm('Hon Thom Cable Car aerial view Phu Quoc Island Vietnam.jpg')),
 item('tour-sunset-town','Địa Trung Hải - Sunset Town Phú Quốc',529.50,818.25,'right',280,42,wm('Sunset-town-phu-quoc-2.jpg')),
 item('tour-nui-cam','Núi Cấm - An Giang',606.4,790.7,'right',280,-6,wm('Núi Cấm An Giang Việt Nam.jpg')),
 item('tour-tra-su','Rừng tràm Trà Sư',616.46,789.30,'right',280,-79,wm('Trà Sư 2.jpg')),
 item('tour-chau-doc','Châu Đốc - Miếu Bà Chúa Xứ Núi Sam',612.9,780.0,'right',280,-145,wm('Miếu Bà Chúa Xứ Núi Sam.jpg')),
 item('tour-lang-cham','Làng Chăm Châu Giang - Thánh đường Mubarak',616.67,778.27,'right',280,-218,wm('Chua nguoi cham,Chau giang-Tan chau,An giang, photo by Dyt - panoramio.jpg'))
];
const IDS=ITEMS.map(x=>x.id);

function install(){
 if(localStorage.getItem(MARK)==='done')return true;
 const api=window.__VN_FLAG_SHAPES,select=$('shapeFlagSelect'),del=$('deleteShapeFlag');
 if(!api||typeof api.getAll!=='function'||typeof api.add!=='function'||typeof api.save!=='function'||typeof api.render!=='function'||!select||!del)return false;
 try{
  const current=api.getAll()||[];
  for(const id of IDS){
   if(!current.some(x=>x&&x.id===id))continue;
   select.value=id;
   dispatch(select,'change');
   del.click();
  }
  for(const cfg of ITEMS){
   const f=api.add('image');
   if(!f)throw new Error('Không tạo được shape '+cfg.tourName);
   Object.assign(f,cfg);
  }
  api.save(true);
  api.render();
  const all=api.getAll()||[];
  const complete=IDS.every(id=>all.some(x=>x&&x.id===id));
  if(complete){
   localStorage.setItem(MARK,'done');
   console.info('Đã cài đủ 20 shape địa điểm với URL ảnh thật, không reload trang.');
  }
  return complete;
 }catch(e){
  console.warn('Không cài được 20 shape địa điểm',e);
  return false;
 }
}

let tries=0;
function boot(){
 tries++;
 if(install())return;
 if(tries<180)setTimeout(boot,100);
 else console.warn('Shape tool chưa sẵn sàng; không reload trang.');
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,300),{once:true});
else setTimeout(boot,300);
})();
