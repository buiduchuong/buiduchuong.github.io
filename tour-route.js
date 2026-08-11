(()=>{
'use strict';
const NS='http://www.w3.org/2000/svg';
const STORE='vn-xuyen-viet-route-v1';
const ROUTE=[
 ['01','Hà Nội'],['37','Ninh Bình · Hà Nam cũ'],['42','Hà Tĩnh'],['44','Quảng Trị'],['46','Huế'],['48','Đà Nẵng'],
 ['52','Gia Lai'],['51','Quảng Ngãi'],['52','Gia Lai'],['66','Đắk Lắk'],['68','Lâm Đồng'],['79','TP.HCM'],
 ['82','Đồng Tháp'],['86','Vĩnh Long'],['92','Cần Thơ'],['96','Cà Mau'],['91','An Giang'],['82','Đồng Tháp'],
 ['79','TP.HCM'],['80','Tây Ninh'],['79','TP.HCM'],['68','Lâm Đồng'],['56','Khánh Hòa'],['66','Đắk Lắk'],
 ['52','Gia Lai'],['51','Quảng Ngãi'],['48','Đà Nẵng'],['46','Huế'],['44','Quảng Trị'],['42','Hà Tĩnh'],
 ['40','Nghệ An'],['37','Ninh Bình'],['01','Hà Nội']
];
// Tọa độ GPS chuẩn cho các điểm đầu hành trình. Điểm 2 dùng trung tâm Phủ Lý vì chương trình chỉ ghi ăn sáng tại Hà Nam, không nêu nhà hàng cụ thể.
const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7},PLOT={x:350,y:18,w:700,h:954};
const FIXED_GEO={
  0:{name:'Nhà hát Lớn Hà Nội',lat:21.024167,lon:105.857778,note:'Điểm đón 05h30 theo chương trình'},
  1:{name:'Phủ Lý · Hà Nam cũ',lat:20.54418,lon:105.91542,note:'Đại diện điểm ăn sáng tại Hà Nam; chương trình không ghi nhà hàng cụ thể'}
};
const svg=document.getElementById('mapSvg'),viewport=document.getElementById('viewport');
if(!svg||!viewport)return;
let layer=null,selected=-1,selectedPoint=-1,drag=null,basePoints=[];
let data=null;
const $=id=>document.getElementById(id);
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));return n};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function provinceCenter(code){
 const p=document.getElementById('province-'+code);
 if(!p)return[700,500];
 const b=p.getBBox();
 return[b.x+b.width/2,b.y+b.height/2];
}
function geoProject(lon,lat){return{x:PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,y:PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h}}
function occurrenceOffsets(){
 const total={};ROUTE.forEach(([c])=>total[c]=(total[c]||0)+1);
 const seen={};
 return ROUTE.map(([c])=>{
  const n=total[c],i=seen[c]||0;seen[c]=i+1;
  if(n===1)return[0,0];
  if(n===2)return i===0?[-8,-6]:[8,6];
  if(n===3)return [[0,-11],[-10,7],[10,7]][i];
  const ang=-Math.PI/2+i*Math.PI*2/n;return[Math.cos(ang)*11,Math.sin(ang)*11];
 });
}
function buildBasePoints(){
 const offs=occurrenceOffsets();
 basePoints=ROUTE.map(([code],i)=>{const p=provinceCenter(code);return{x:p[0]+offs[i][0],y:p[1]+offs[i][1]}});
 Object.entries(FIXED_GEO).forEach(([idx,g])=>{const i=Number(idx);if(i>=0&&i<basePoints.length)basePoints[i]=geoProject(g.lon,g.lat)});
}
function defaultData(){
 const bends=Array.from({length:ROUTE.length-1},(_,i)=>{
  const a=ROUTE[i][0],b=ROUTE[i+1][0];
  if(a===b)return 0;
  return (i%2===0?1:-1)*(i%5===0?16:10);
 });
 return{version:1,points:basePoints.map(p=>({...p})),bends,color:'#d71945',width:2.4,show:true,showNumbers:true,showArrows:true};
}
function load(){
 try{
  const d=JSON.parse(localStorage.getItem(STORE)||'null');
  if(d&&d.version===1&&Array.isArray(d.points)&&d.points.length===ROUTE.length){
   const fresh=defaultData();data={...fresh,...d};
   data.points=d.points.map((p,i)=>({x:Number(p.x)||fresh.points[i].x,y:Number(p.y)||fresh.points[i].y}));
   data.bends=Array.from({length:ROUTE.length-1},(_,i)=>Number(d.bends?.[i])||0);
   return;
  }
 }catch{}
 data=defaultData();
}
function save(){localStorage.setItem(STORE,JSON.stringify(data))}
function controlPoint(s,e,bend){
 const dx=e.x-s.x,dy=e.y-s.y,len=Math.hypot(dx,dy)||1;
 return{x:(s.x+e.x)/2-dy/len*bend,y:(s.y+e.y)/2+dx/len*bend};
}
function addTitle(node,text){const t=el('title');t.textContent=text;node.appendChild(t)}
function render(){
 if(!layer)return;
 layer.innerHTML='';
 if(!data.show)return;
 const segments=el('g',{id:'tourSegments'}),marks=el('g',{id:'tourMarkers'});
 for(let i=0;i<data.points.length-1;i++){
  const s=data.points[i],e=data.points[i+1],c=controlPoint(s,e,data.bends[i]||0);
  const p=el('path',{
   d:`M${s.x},${s.y} Q${c.x},${c.y} ${e.x},${e.y}`,
   fill:'none',stroke:data.color,'stroke-width':data.width,
   'vector-effect':'non-scaling-stroke','data-tour-segment':i,
   opacity:selected===i?'1':'.92'
  });
  if(data.showArrows)p.setAttribute('marker-end','url(#arrow)');
  if(selected===i){p.setAttribute('stroke-width',Number(data.width)+1.4);p.setAttribute('filter','drop-shadow(0 0 2px rgba(255,255,255,.95))')}
  p.style.cursor='pointer';
  addTitle(p,`Chặng ${i+1}: ${ROUTE[i][1]} → ${ROUTE[i+1][1]}`);
  p.addEventListener('pointerdown',ev=>{ev.stopPropagation()});
  p.addEventListener('click',ev=>{ev.stopPropagation();selected=i;syncSegment();render()});
  segments.appendChild(p);
 }
 data.points.forEach((p,i)=>{
  const g=el('g',{transform:`translate(${p.x} ${p.y})`,'data-tour-point':i});g.style.cursor='move';
  const outer=el('circle',{r:selectedPoint===i?9.4:8.2,fill:'#fffdf8',stroke:data.color,'stroke-width':selectedPoint===i?2.8:2,'vector-effect':'non-scaling-stroke'});
  g.appendChild(outer);
  if(data.showNumbers){
   const txt=el('text',{x:0,y:2.3,'text-anchor':'middle','font-family':'Roboto,Arial,sans-serif','font-size':6.6,'font-weight':900,fill:data.color,'pointer-events':'none'});txt.textContent=String(i+1);g.appendChild(txt);
  }else{
   g.appendChild(el('circle',{r:3,fill:data.color,'pointer-events':'none'}));
  }
  const fixed=FIXED_GEO[i];addTitle(g,`${i+1}. ${ROUTE[i][1]}${fixed?' · '+fixed.name:''}`);
  g.addEventListener('pointerdown',startPointDrag);
  g.addEventListener('click',ev=>{ev.stopPropagation();selectedPoint=i;syncPoint();render()});
  marks.appendChild(g);
 });
 layer.append(segments,marks);
}
function localPoint(ev){
 const p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;
 const m=layer.getScreenCTM();if(!m)return[0,0];
 const q=p.matrixTransform(m.inverse());return[q.x,q.y];
}
function startPointDrag(ev){
 ev.preventDefault();ev.stopPropagation();
 const idx=Number(ev.currentTarget.dataset.tourPoint),p=localPoint(ev),q=data.points[idx];
 selectedPoint=idx;syncPoint();
 drag={idx,dx:p[0]-q.x,dy:p[1]-q.y,pointerId:ev.pointerId};
 window.addEventListener('pointermove',movePoint,true);window.addEventListener('pointerup',endPoint,true);window.addEventListener('pointercancel',endPoint,true);
}
function movePoint(ev){
 if(!drag)return;ev.preventDefault();ev.stopPropagation();
 const p=localPoint(ev),q=data.points[drag.idx];q.x=p[0]-drag.dx;q.y=p[1]-drag.dy;render();
}
function endPoint(ev){
 if(!drag)return;ev.preventDefault();ev.stopPropagation();drag=null;
 window.removeEventListener('pointermove',movePoint,true);window.removeEventListener('pointerup',endPoint,true);window.removeEventListener('pointercancel',endPoint,true);save();
}
function syncSegment(){
 const info=$('tourSelected');if(!info)return;
 if(selected<0){info.textContent='Chưa chọn chặng';$('tourBend').disabled=true;$('tourBendNumber').disabled=true;return}
 info.textContent=`Chặng ${selected+1}: ${ROUTE[selected][1]} → ${ROUTE[selected+1][1]}`;
 $('tourBend').disabled=false;$('tourBendNumber').disabled=false;
 $('tourBend').value=data.bends[selected]||0;$('tourBendNumber').value=data.bends[selected]||0;
}
function setBend(v){if(selected<0)return;v=clamp(Number(v)||0,-160,160);data.bends[selected]=v;$('tourBend').value=v;$('tourBendNumber').value=v;render();save()}
function syncPoint(){
 const n=$('tourPointSelected'),btn=$('tourFixSelected');if(!n)return;
 if(selectedPoint<0){n.textContent='Chưa chọn marker số. Điểm 1–2 có tọa độ chuẩn riêng.';if(btn)btn.disabled=true;return}
 const p=data.points[selectedPoint],fixed=FIXED_GEO[selectedPoint];
 if(fixed){n.innerHTML=`<b>Điểm ${selectedPoint+1}: ${ROUTE[selectedPoint][1]}</b><br>${fixed.name}<br>GPS: ${fixed.lat.toFixed(6)}, ${fixed.lon.toFixed(6)}<br>SVG: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}<br><span style="font-size:11px">${fixed.note}</span>`;if(btn)btn.disabled=false}
 else{n.innerHTML=`<b>Điểm ${selectedPoint+1}: ${ROUTE[selectedPoint][1]}</b><br>SVG hiện tại: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}<br><span style="font-size:11px">Chưa khai báo GPS chuẩn cho điểm này.</span>`;if(btn)btn.disabled=true}
}
function fixPoint(idx){const fixed=FIXED_GEO[idx];if(!fixed||!data?.points?.[idx])return false;data.points[idx]=geoProject(fixed.lon,fixed.lat);save();render();syncPoint();return true}
function fixFirstTwo(){fixPoint(0);fixPoint(1);selectedPoint=1;syncPoint();render();const n=$('tourPointSelected');if(n)n.insertAdjacentHTML('beforeend','<br><b>✓ Đã sửa đúng tọa độ điểm 1–2.</b>')}
function injectUI(){
 const controls=document.querySelector('.controls');if(!controls||$('tourRouteGroup'))return;
 const g=document.createElement('div');g.className='group';g.id='tourRouteGroup';
 g.innerHTML=`<div class="group-title">Cung đường Xuyên Việt</div>
 <label class="check"><input id="showTourRoute" type="checkbox" checked> Hiện cung đường 33 điểm</label>
 <label class="check"><input id="showTourNumbers" type="checkbox" checked> Hiện số thứ tự 1–33</label>
 <label class="check"><input id="showTourArrows" type="checkbox" checked> Hiện mũi tên hướng đi</label>
 <div class="row"><div><label>Màu tuyến</label><input id="tourColor" type="color" value="#d71945"></div><div><label>Độ dày</label><input id="tourWidth" type="number" min="0.8" max="8" step="0.2" value="2.4"></div></div>
 <div id="tourSelected" class="mode-note">Chưa chọn chặng</div>
 <label style="margin-top:8px">Độ cong chặng đang chọn</label>
 <div class="value-line"><input id="tourBend" type="range" min="-160" max="160" step="1" value="0" disabled><input id="tourBendNumber" type="number" min="-160" max="160" step="1" value="0" disabled></div>
 <div class="row"><button id="tourStraight" class="btn">Làm thẳng chặng</button><button id="tourReset" class="btn">Khôi phục tuyến</button></div>
 <div id="tourPointSelected" class="mode-note" style="margin-top:8px">Chưa chọn marker số. Điểm 1–2 có tọa độ chuẩn riêng.</div>
 <div class="row"><button id="tourFix12" class="btn primary">Sửa đúng tọa độ điểm 1–2</button><button id="tourFixSelected" class="btn" disabled>Sửa điểm đang chọn</button></div>
 <div class="tip"><b>Điểm 1:</b> Nhà hát Lớn Hà Nội. <b>Điểm 2:</b> khu vực Phủ Lý (Hà Nam cũ, nay thuộc Ninh Bình). Bấm marker để xem GPS/SVG. Kéo marker vẫn được và tuyến tự lưu.</div>`;
 const displayGroup=[...controls.children].find(x=>x.querySelector?.('.group-title')?.textContent.includes('Hiển thị'));
 if(displayGroup)controls.insertBefore(g,displayGroup);else controls.appendChild(g);
 $('showTourRoute').checked=data.show;$('showTourNumbers').checked=data.showNumbers;$('showTourArrows').checked=data.showArrows;$('tourColor').value=data.color;$('tourWidth').value=data.width;
 $('showTourRoute').addEventListener('change',e=>{data.show=e.target.checked;render();save()});
 $('showTourNumbers').addEventListener('change',e=>{data.showNumbers=e.target.checked;render();save()});
 $('showTourArrows').addEventListener('change',e=>{data.showArrows=e.target.checked;render();save()});
 $('tourColor').addEventListener('input',e=>{data.color=e.target.value;render();save()});
 $('tourWidth').addEventListener('input',e=>{data.width=clamp(Number(e.target.value)||2.4,.8,8);render();save()});
 $('tourBend').addEventListener('input',e=>setBend(e.target.value));$('tourBendNumber').addEventListener('input',e=>setBend(e.target.value));
 $('tourStraight').addEventListener('click',()=>{if(selected>=0)setBend(0)});
 $('tourFix12').addEventListener('click',fixFirstTwo);
 $('tourFixSelected').addEventListener('click',()=>{if(selectedPoint>=0)fixPoint(selectedPoint)});
 $('tourReset').addEventListener('click',()=>{if(!confirm('Khôi phục toàn bộ cung đường Xuyên Việt về vị trí và độ cong mặc định?'))return;data=defaultData();selected=-1;selectedPoint=-1;save();syncSegment();syncPoint();$('showTourRoute').checked=data.show;$('showTourNumbers').checked=data.showNumbers;$('showTourArrows').checked=data.showArrows;$('tourColor').value=data.color;$('tourWidth').value=data.width;render()});
 syncSegment();syncPoint();
}
function initLayer(){
 if(layer)return;
 layer=el('g',{id:'tourRouteLayer'});
 const labelLayer=document.getElementById('labelLayer');
 if(labelLayer)viewport.insertBefore(layer,labelLayer);else viewport.appendChild(layer);
}
function ready(){return ROUTE.every(([code])=>document.getElementById('province-'+code))}
function init(){
 if(!ready()){setTimeout(init,250);return}
 buildBasePoints();load();initLayer();injectUI();render();
}
init();
})();