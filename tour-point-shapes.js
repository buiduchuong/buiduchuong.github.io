(()=>{
'use strict';
if(window.__VN_TOUR_POINT_SHAPES)return;
window.__VN_TOUR_POINT_SHAPES=true;
const MARK='vn-map-tour-point-shapes-v3';
const IDS=['tour-soc-trang','tour-bac-lieu','tour-dat-mui','tour-nam-can','tour-u-minh-thuong'];
const ITEMS=[
 {id:'tour-soc-trang',tourName:'Sóc Trăng - Chùa Som Rong',type:'image',x:682.9,y:843.2,w:118,h:75,side:'right',offset:155,headDy:-95,fill:'#ffffff',border:'#555555',borderWidth:1.5,connectorColor:'#555555',connectorWidth:1.6,radius:4,connectorType:'elbow',elbowOffset:60,imageSrc:'tour-assets/soc-trang.svg?v=1',imageUrl:'',imageRatio:118/75,lockRatio:true,imageFit:'cover'},
 {id:'tour-bac-lieu',tourName:'Bạc Liêu - Nhà Công tử Bạc Liêu',type:'image',x:662.7,y:861.4,w:118,h:75,side:'right',offset:155,headDy:10,fill:'#ffffff',border:'#555555',borderWidth:1.5,connectorColor:'#555555',connectorWidth:1.6,radius:4,connectorType:'elbow',elbowOffset:60,imageSrc:'tour-assets/bac-lieu.svg?v=1',imageUrl:'',imageRatio:118/75,lockRatio:true,imageFit:'cover'},
 {id:'tour-dat-mui',tourName:'Đất Mũi Cà Mau',type:'image',x:591.1,y:901.2,w:120,h:76,side:'left',offset:145,headDy:55,fill:'#ffffff',border:'#555555',borderWidth:1.5,connectorColor:'#555555',connectorWidth:1.6,radius:4,connectorType:'elbow',elbowOffset:60,imageSrc:'tour-assets/dat-mui.svg?v=1',imageUrl:'',imageRatio:120/76,lockRatio:true,imageFit:'cover'},
 {id:'tour-nam-can',tourName:'Năm Căn',type:'image',x:611.3,y:893,w:118,h:75,side:'left',offset:155,headDy:-55,fill:'#ffffff',border:'#555555',borderWidth:1.5,connectorColor:'#555555',connectorWidth:1.6,radius:4,connectorType:'elbow',elbowOffset:60,imageSrc:'tour-assets/nam-can.svg?v=1',imageUrl:'',imageRatio:118/75,lockRatio:true,imageFit:'cover'},
 {id:'tour-u-minh-thuong',tourName:'VQG U Minh Thượng',type:'image',x:616.8,y:843.2,w:120,h:76,side:'left',offset:170,headDy:-115,fill:'#ffffff',border:'#555555',borderWidth:1.5,connectorColor:'#555555',connectorWidth:1.6,radius:4,connectorType:'elbow',elbowOffset:60,imageSrc:'tour-assets/u-minh-thuong.svg?v=1',imageUrl:'',imageRatio:120/76,lockRatio:true,imageFit:'cover'}
];

function applyThroughLiveApi(){
 const api=window.__VN_FLAG_SHAPES;
 if(!api||typeof api.getAll!=='function'||typeof api.add!=='function'||typeof api.save!=='function'||typeof api.render!=='function')return false;
 try{
  const existing=new Set((api.getAll()||[]).map(x=>x&&x.id));
  let added=0;
  for(const item of ITEMS){
   if(existing.has(item.id))continue;
   const f=api.add('image');
   if(!f)continue;
   Object.assign(f,item);
   existing.add(item.id);
   added++;
  }
  api.save(true);
  api.render();
  const complete=IDS.every(id=>(api.getAll()||[]).some(x=>x&&x.id===id));
  if(complete)localStorage.setItem(MARK,'done');
  if(added)console.info(`Đã thêm ${added} shape điểm miền Tây mà không reload trang.`);
  return complete;
 }catch(e){
  console.warn('Không thêm được 5 shape điểm miền Tây qua API',e);
  return false;
 }
}

let tries=0;
function boot(){
 tries++;
 if(applyThroughLiveApi())return;
 if(tries<160)setTimeout(boot,100);
 else console.warn('Shape tool chưa sẵn sàng; bỏ qua thêm 5 điểm để tránh vòng lặp reload.');
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,250),{once:true});
else setTimeout(boot,250);
})();
