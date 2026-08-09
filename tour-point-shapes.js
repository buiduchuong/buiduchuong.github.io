(()=>{
'use strict';
if(window.__VN_TOUR_POINT_SHAPES)return;
window.__VN_TOUR_POINT_SHAPES=true;
const STORE='vn-map-flag-shapes-v1';
const MARK='vn-map-tour-point-shapes-v1';
const ITEMS=[
 {id:'tour-soc-trang',tourName:'Sóc Trăng - Chùa Som Rong',type:'image',x:682.9,y:843.2,w:118,h:75,side:'right',offset:155,headDy:-95,fill:'#ffffff',border:'#555555',borderWidth:1.5,connectorColor:'#555555',connectorWidth:1.6,radius:4,connectorType:'elbow',elbowOffset:60,imageSrc:'tour-assets/soc-trang.svg?v=1',imageUrl:'',imageRatio:118/75,lockRatio:true,imageFit:'cover'},
 {id:'tour-bac-lieu',tourName:'Bạc Liêu - Nhà Công tử Bạc Liêu',type:'image',x:662.7,y:861.4,w:118,h:75,side:'right',offset:155,headDy:10,fill:'#ffffff',border:'#555555',borderWidth:1.5,connectorColor:'#555555',connectorWidth:1.6,radius:4,connectorType:'elbow',elbowOffset:60,imageSrc:'tour-assets/bac-lieu.svg?v=1',imageUrl:'',imageRatio:118/75,lockRatio:true,imageFit:'cover'},
 {id:'tour-dat-mui',tourName:'Đất Mũi Cà Mau',type:'image',x:591.1,y:901.2,w:120,h:76,side:'left',offset:145,headDy:55,fill:'#ffffff',border:'#555555',borderWidth:1.5,connectorColor:'#555555',connectorWidth:1.6,radius:4,connectorType:'elbow',elbowOffset:60,imageSrc:'tour-assets/dat-mui.svg?v=1',imageUrl:'',imageRatio:120/76,lockRatio:true,imageFit:'cover'},
 {id:'tour-nam-can',tourName:'Năm Căn',type:'image',x:611.3,y:893,w:118,h:75,side:'left',offset:155,headDy:-55,fill:'#ffffff',border:'#555555',borderWidth:1.5,connectorColor:'#555555',connectorWidth:1.6,radius:4,connectorType:'elbow',elbowOffset:60,imageSrc:'tour-assets/nam-can.svg?v=1',imageUrl:'',imageRatio:118/75,lockRatio:true,imageFit:'cover'},
 {id:'tour-u-minh-thuong',tourName:'VQG U Minh Thượng',type:'image',x:616.8,y:843.2,w:120,h:76,side:'left',offset:170,headDy:-115,fill:'#ffffff',border:'#555555',borderWidth:1.5,connectorColor:'#555555',connectorWidth:1.6,radius:4,connectorType:'elbow',elbowOffset:60,imageSrc:'tour-assets/u-minh-thuong.svg?v=1',imageUrl:'',imageRatio:120/76,lockRatio:true,imageFit:'cover'}
];
function merge(){
 try{
  if(localStorage.getItem(MARK)==='done')return false;
  let data={version:3,items:[],show:true,dragEnabled:true};
  try{const raw=localStorage.getItem(STORE);if(raw){const p=JSON.parse(raw);if(p&&typeof p==='object')data={...data,...p,items:Array.isArray(p.items)?p.items:[]}}}catch{}
  const existing=new Set(data.items.map(x=>x&&x.id));let added=0;
  ITEMS.forEach(item=>{if(!existing.has(item.id)){data.items.push(item);added++}});
  data.version=Math.max(Number(data.version)||0,3);data.updatedAt=Date.now();
  localStorage.setItem(STORE,JSON.stringify(data));localStorage.setItem(MARK,'done');
  return added>0;
 }catch(e){console.warn('Không thêm được 5 shape điểm miền Tây',e);return false}
}
function boot(){const changed=merge();if(changed){setTimeout(()=>location.reload(),120);return}try{window.__VN_FLAG_SHAPES?.render?.()}catch{}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,450),{once:true});else setTimeout(boot,450);
})();
