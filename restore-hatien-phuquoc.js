(()=>{
'use strict';
const ROUTE_STORE='vn-xuyen-viet-route-main35-v5';
const DONE='vn-route-restore-hatien-phuquoc-v1';
try{
  if(localStorage.getItem(DONE)==='done')return;
  const raw=localStorage.getItem(ROUTE_STORE);
  if(!raw){localStorage.setItem(DONE,'done');return;}
  const data=JSON.parse(raw);
  if(!data||data.version!==5||!Array.isArray(data.points)||data.points.length<30){localStorage.setItem(DONE,'done');return;}

  // Khôi phục đúng đoạn cũ: Rạch Giá → Hà Tiên (14) → Phú Quốc (15) → Hà Tiên → Núi Cấm.
  // Chỉ chạm vào 3 điểm và 3 độ cong liên quan, giữ nguyên toàn bộ chỉnh sửa khác của người dùng.
  data.points[27]={x:566.8055555555551,y:797.3945889570554}; // Hà Tiên số 14
  data.points[28]={x:526.3222222222219,y:807.1452883435585}; // Phú Quốc số 15
  data.points[29]={x:566.8055555555551,y:797.3945889570554}; // Hà Tiên quay về (ẩn)
  if(!Array.isArray(data.bends))data.bends=[];
  data.bends[26]=-7; // Rạch Giá → Hà Tiên
  data.bends[27]=-9; // Hà Tiên → Phú Quốc
  data.bends[28]=9;  // Phú Quốc → Hà Tiên

  localStorage.setItem(ROUTE_STORE,JSON.stringify(data));
  localStorage.setItem(DONE,'done');
  if(sessionStorage.getItem(DONE)!=='reloaded'){
    sessionStorage.setItem(DONE,'reloaded');
    location.reload();
  }
}catch(err){console.warn('Không thể khôi phục đoạn Hà Tiên - Phú Quốc',err)}
})();
