(()=>{
'use strict';
const NS='http://www.w3.org/2000/svg';
const STORE='vn-xuyen-viet-route-overview-v3';
const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};
const ROUTE=[
 {name:'Hà Nội',lat:21.024167,lon:105.857778,start:true,offset:{x:-10,y:-8}},
 {name:'Quảng Bình',lat:17.4580,lon:106.6359,num:1,bend:12},
 {name:'Huế',lat:16.456111,lon:107.576389,num:2,bend:12},
 {name:'Đà Nẵng',lat:16.067780,lon:108.220830,num:3,bend:10},
 {name:'Quy Nhơn',lat:13.769583,lon:109.231389,num:4,bend:8,offset:{x:-8,y:-6}},
 {name:'Măng Đen',lat:14.600278,lon:108.290833,num:5,bend:-8},
 {name:'Pleiku',lat:13.971519,lon:108.014673,num:6,bend:-7},
 {name:'Buôn Ma Thuột',lat:12.667470,lon:108.037750,num:7,bend:-5},
 {name:'Đà Lạt',lat:11.940000,lon:108.437500,num:8,bend:6},
 {name:'Tà Đùng',lat:11.8350,lon:107.9980,num:9,bend:5},
 {name:'TP.HCM',lat:10.823020,lon:106.629650,num:10,bend:8,offset:{x:-10,y:-8}},
 {name:'Tiền Giang · Bến Tre',lat:10.3000,lon:106.3700,num:11,bend:5},
 {name:'Cần Thơ',lat:10.037220,lon:105.788330,num:12,bend:5},
 {name:'Cà Mau',lat:8.7590,lon:105.0010,num:13,bend:-5},
 {name:'Hà Tiên · Rạch Giá',lat:10.2000,lon:104.8000,num:14,bend:-7},
 {name:'Phú Quốc',lat:10.2167,lon:103.9670,num:15,sea:true,bend:-8,offset:{x:-4,y:-6}},
 {name:'Hà Tiên',lat:10.3833,lon:104.4875,hidden:true,sea:true,bend:8},
 {name:'Châu Đốc',lat:10.7000,lon:105.116667,num:16,bend:5},
 {name:'Đồng Tháp',lat:10.4500,lon:105.6500,num:17,bend:5},
 {name:'TP.HCM',lat:10.823020,lon:106.629650,num:18,bend:10,offset:{x:10,y:-8}},
 {name:'Tây Ninh',lat:11.364053,lon:106.180054,num:19,bend:-9},
 {name:'Vũng Tàu',lat:10.404167,lon:107.141667,num:20,bend:12},
 {name:'Mũi Né',lat:10.981999,lon:108.251183,num:21,bend:8},
 {name:'Ninh Chữ · Vĩnh Hy',lat:11.6800,lon:109.1200,num:22,bend:5},
 {name:'Nha Trang',lat:12.2450,lon:109.191667,num:23,bend:5},
 {name:'Phú Yên',lat:13.086872,lon:109.308589,num:24,bend:6},
 {name:'Quy Nhơn',lat:13.769583,lon:109.231389,num:25,bend:-12,offset:{x:8,y:7}},
 {name:'Quảng Ngãi',lat:15.1200,lon:108.8050,num:26,bend:-7},
 {name:'Hội An',lat:15.877222,lon:108.329167,num:27,bend:-6},
 {name:'Đà Nẵng',lat:16.067780,lon:108.220830,num:28,bend:-12,offset:{x:8,y:7}},
 {name:'Huế',lat:16.456111,lon:107.576389,num:29,bend:-15,offset:{x:8,y:7}},
 {name:'Quảng Bình',lat:17.4580,lon:106.6359,num:30,bend:-16,offset:{x:8,y:7}},
 {name:'Nghệ An',lat:18.671430,lon:105.558720,num:31,bend:-8},
 {name:'Ninh Bình',lat:20.255694,lon:105.915611,num:32,bend:-7},
 {name:'Hà Nội',lat:21.024167,lon:105.857778,finish:true,bend:-12,offset:{x:10,y:8}}
];
const svg=document.getElementById('mapSvg'),viewport=document.getElementById('viewport');
if(!svg||!viewport)return;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,String(v)));return n};
function project(lon,lat){return{x:PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,y:PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h}}
const BASE=ROUTE.map(p=>project(p.lon,p.lat));
let layer=null,data=null,selected=-1,selectedPoint=-1,drag=null;
function defaults(){return{version:3,points:BASE.map(p=>({...p})),bends:ROUTE.slice(0,-1).map((p,i)=>Number(ROUTE[i+1]?.bend)||0),color:'#d71945',seaColor:'#1677d2',width:2.6,show:true,showNumbers:true,showArrows:true}}
function load(){const fresh=defaults();try{const d=JSON.parse(localStorage.getItem(STORE)||'null');if(d&&d.version===3&&Array.isArray(d.points)&&d.points.length===ROUTE.length){data={...fresh,...d};data.points=d.points.map((p,i)=>({x:Number(p?.x)||fresh.points[i].x,y:Number(p?.y)||fresh.points[i].y}));data.bends=ROUTE.slice(0,-1).map((_,i)=>Number(d.bends?.[i])||0);return}}catch{}data=fresh}
function save(){try{localStorage.setItem(STORE,JSON.stringify(data))}catch{}}
function controlPoint(s,e,b){const dx=e.x-s.x,dy=e.y-s.y,len=Math.hypot(dx,dy)||1;return{x:(s.x+e.x)/2-dy/len*b,y:(s.y+e.y)/2+dx/len*b}}
function addTitle(n,text){const t=el('title');t.textContent=text;n.appendChild(t)}
function ensureDefs(){let d=svg.querySelector('#tourOverviewDefs');if(d)return d;d=el('defs',{id:'tourOverviewDefs'});const add=(id,color)=>{const m=el('marker',{id,viewBox:'0 0 10 10',refX:8.2,refY:5,markerWidth:4.6,markerHeight:4.6,orient:'auto',markerUnits:'strokeWidth'});m.appendChild(el('path',{d:'M0 0 L10 5 L0 10 Z',fill:color}));d.appendChild(m)};add('tourOverviewArrow',data?.color||'#d71945');add('tourOverviewSeaArrow',data?.seaColor||'#1677d2');svg.insertBefore(d,svg.firstChild);return d}
function refreshDefs(){const d=svg.querySelector('#tourOverviewDefs');if(d)d.remove();ensureDefs()}
function isSea(i){return!!(ROUTE[i]?.sea||ROUTE[i+1]?.sea)}
function shouldArrow(i){return data.showArrows&&(isSea(i)||i%3===1||i===ROUTE.length-2)}
function off(i){return ROUTE[i]?.offset||{x:0,y:0}}
function render(){if(!layer)return;layer.innerHTML='';if(!data.show)return;ensureDefs();const segs=el('g',{id:'tourOverviewSegments'}),marks=el('g',{id:'tourOverviewMarkers'});for(let i=0;i<data.points.length-1;i++){const s=data.points[i],e=data.points[i+1],c=controlPoint(s,e,data.bends[i]||0),sea=isSea(i),stroke=sea?data.seaColor:data.color;const p=el('path',{d:`M${s.x},${s.y} Q${c.x},${c.y} ${e.x},${e.y}`,fill:'none',stroke,'stroke-width':selected===i?Number(data.width)+1.15:data.width,'stroke-linecap':'round','stroke-linejoin':'round','vector-effect':'non-scaling-stroke',opacity:selected===i?'1':'.93',cursor:'pointer','data-tour-segment':i});if(sea)p.setAttribute('stroke-dasharray','7 5');if(shouldArrow(i))p.setAttribute('marker-end',sea?'url(#tourOverviewSeaArrow)':'url(#tourOverviewArrow)');addTitle(p,`${ROUTE[i].name} → ${ROUTE[i+1].name}${sea?' · tàu/đường biển':''}`);p.addEventListener('click',ev=>{ev.stopPropagation();selected=i;syncSegment();render()});segs.appendChild(p)}ROUTE.forEach((r,i)=>{if(r.hidden)return;const p=data.points[i],o=off(i),g=el('g',{transform:`translate(${p.x+o.x} ${p.y+o.y})`,'data-tour-point':i,cursor:'grab'}),active=selectedPoint===i;if(r.start){g.appendChild(el('circle',{r:active?10.2:9.2,fill:'#fff',stroke:data.color,'stroke-width':active?2.7:2,'vector-effect':'non-scaling-stroke'}));const t=el('text',{x:0,y:4.2,'text-anchor':'middle','font-family':'Arial,sans-serif','font-size':15,'font-weight':900,fill:'#f4b400','pointer-events':'none'});t.textContent='★';g.appendChild(t)}else if(r.finish){g.appendChild(el('circle',{r:active?10.2:9.2,fill:'#fff',stroke:'#16803a','stroke-width':active?2.7:2,'vector-effect':'non-scaling-stroke'}));const t=el('text',{x:0,y:3.8,'text-anchor':'middle','font-family':'Roboto,Arial,sans-serif','font-size':10.5,'font-weight':900,fill:'#16803a','pointer-events':'none'});t.textContent='✓';g.appendChild(t)}else{g.appendChild(el('circle',{r:active?8.9:7.8,fill:'#fff','fill-opacity':'.98',stroke:data.color,'stroke-width':active?2.7:1.9,'vector-effect':'non-scaling-stroke'}));if(data.showNumbers){const t=el('text',{x:0,y:2.35,'text-anchor':'middle','font-family':'Roboto,Arial,sans-serif','font-size':r.num>=10?5.7:6.5,'font-weight':900,fill:data.color,'pointer-events':'none'});t.textContent=String(r.num);g.appendChild(t)}else g.appendChild(el('circle',{r:2.5,fill:data.color,'pointer-events':'none'}))}addTitle(g,r.start?`★ Khởi hành: ${r.name}`:r.finish?`✓ Kết thúc: ${r.name}`:`${r.num}. ${r.name}`);g.addEventListener('pointerdown',startPointDrag);g.addEventListener('click',ev=>{ev.stopPropagation();selectedPoint=i;syncPoint();render()});marks.appendChild(g)});layer.append(segs,marks)}
function localPoint(ev){const p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;const m=layer.getScreenCTM();if(!m)return[0,0];const q=p.matrixTransform(m.inverse());return[q.x,q.y]}
function startPointDrag(ev){ev.preventDefault();ev.stopPropagation();const idx=Number(ev.currentTarget.dataset.tourPoint),p=localPoint(ev),q=data.points[idx],o=off(idx);selectedPoint=idx;syncPoint();drag={idx,dx:p[0]-(q.x+o.x),dy:p[1]-(q.y+o.y)};window.addEventListener('pointermove',movePoint,true);window.addEventListener('pointerup',endPoint,true);window.addEventListener('pointercancel',endPoint,true)}
function movePoint(ev){if(!drag)return;ev.preventDefault();ev.stopPropagation();const p=localPoint(ev),q=data.points[drag.idx],o=off(drag.idx);q.x=p[0]-drag.dx-o.x;q.y=p[1]-drag.dy-o.y;render()}
function endPoint(ev){if(!drag)return;ev.preventDefault();ev.stopPropagation();drag=null;window.removeEventListener('pointermove',movePoint,true);window.removeEventListener('pointerup',endPoint,true);window.removeEventListener('pointercancel',endPoint,true);save();syncPoint()}
function syncSegment(){const info=$('tourSelected');if(!info)return;if(selected<0){info.textContent='Chưa chọn chặng';$('tourBend').disabled=true;$('tourBendNumber').disabled=true;return}info.textContent=`Chặng: ${ROUTE[selected].name} → ${ROUTE[selected+1].name}${isSea(selected)?' · đường biển':''}`;$('tourBend').disabled=false;$('tourBendNumber').disabled=false;$('tourBend').value=data.bends[selected]||0;$('tourBendNumber').value=data.bends[selected]||0}
function setBend(v){if(selected<0)return;v=clamp(Number(v)||0,-100,100);data.bends[selected]=v;$('tourBend').value=v;$('tourBendNumber').value=v;render();save()}
function syncPoint(){const n=$('tourPointSelected'),btn=$('tourFixSelected');if(!n)return;if(selectedPoint<0){n.textContent='Chọn một marker để xem tên điểm và tọa độ đại diện.';if(btn)btn.disabled=true;return}const r=ROUTE[selectedPoint],p=data.points[selectedPoint],head=r.start?'★ Điểm khởi hành':r.finish?'✓ Điểm kết thúc':`Điểm ${r.num}`;n.innerHTML=`<b>${head}: ${r.name}</b><br>GPS đại diện: ${r.lat.toFixed(6)}, ${r.lon.toFixed(6)}<br>SVG: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}`;if(btn)btn.disabled=false}
function fixPoint(i){if(!ROUTE[i]||!data?.points?.[i])return;data.points[i]={...BASE[i]};save();render();syncPoint()}
function fixAll(){const d=defaults();data.points=d.points;data.bends=d.bends;save();render();syncSegment();syncPoint()}
function injectUI(){const controls=document.querySelector('.controls');if(!controls||$('tourRouteGroup'))return;const g=document.createElement('div');g.className='group';g.id='tourRouteGroup';g.innerHTML=`<div class="group-title">Cung đường Xuyên Việt — tổng quan</div><label class="check"><input id="showTourRoute" type="checkbox" checked> Hiện cung đường</label><label class="check"><input id="showTourNumbers" type="checkbox" checked> Hiện số thứ tự</label><label class="check"><input id="showTourArrows" type="checkbox" checked> Hiện mũi tên thưa</label><div class="row"><div><label>Màu đường bộ</label><input id="tourColor" type="color" value="#d71945"></div><div><label>Màu đường biển</label><input id="tourSeaColor" type="color" value="#1677d2"></div></div><label style="margin-top:8px">Độ dày tuyến</label><input id="tourWidth" type="number" min="0.8" max="8" step="0.2" value="2.6"><div id="tourSelected" class="mode-note" style="margin-top:8px">Chưa chọn chặng</div><label style="margin-top:8px">Độ cong chặng đang chọn</label><div class="value-line"><input id="tourBend" type="range" min="-100" max="100" step="1" value="0" disabled><input id="tourBendNumber" type="number" min="-100" max="100" step="1" value="0" disabled></div><div class="row"><button id="tourStraight" class="btn">Làm thẳng chặng</button><button id="tourReset" class="btn">Khôi phục tuyến</button></div><div id="tourPointSelected" class="mode-note" style="margin-top:8px">Chọn một marker để xem tên điểm và tọa độ đại diện.</div><div class="row"><button id="tourFixAll" class="btn primary">Sửa đúng toàn bộ tuyến</button><button id="tourFixSelected" class="btn" disabled>Sửa điểm đang chọn</button></div><div class="tip">Bản tổng quan chỉ giữ các điểm chính để tránh đường bị díu. <b>★ Hà Nội</b> là điểm khởi hành, vòng tròn là thứ tự hành trình, <b style="color:#d71945">đỏ liền</b> là đường bộ và <b style="color:#1677d2">xanh nét đứt</b> là chặng Phú Quốc.</div>`;const displayGroup=[...controls.children].find(x=>x.querySelector?.('.group-title')?.textContent.includes('Hiển thị'));if(displayGroup)controls.insertBefore(g,displayGroup);else controls.appendChild(g);$('showTourRoute').checked=data.show;$('showTourNumbers').checked=data.showNumbers;$('showTourArrows').checked=data.showArrows;$('tourColor').value=data.color;$('tourSeaColor').value=data.seaColor;$('tourWidth').value=data.width;$('showTourRoute').addEventListener('change',e=>{data.show=e.target.checked;render();save()});$('showTourNumbers').addEventListener('change',e=>{data.showNumbers=e.target.checked;render();save()});$('showTourArrows').addEventListener('change',e=>{data.showArrows=e.target.checked;render();save()});$('tourColor').addEventListener('input',e=>{data.color=e.target.value;refreshDefs();render();save()});$('tourSeaColor').addEventListener('input',e=>{data.seaColor=e.target.value;refreshDefs();render();save()});$('tourWidth').addEventListener('input',e=>{data.width=clamp(Number(e.target.value)||2.6,.8,8);render();save()});$('tourBend').addEventListener('input',e=>setBend(e.target.value));$('tourBendNumber').addEventListener('input',e=>setBend(e.target.value));$('tourStraight').addEventListener('click',()=>{if(selected>=0)setBend(0)});$('tourFixAll').addEventListener('click',fixAll);$('tourFixSelected').addEventListener('click',()=>{if(selectedPoint>=0)fixPoint(selectedPoint)});$('tourReset').addEventListener('click',()=>{if(!confirm('Khôi phục cung đường tổng quan về mặc định?'))return;data=defaults();selected=-1;selectedPoint=-1;save();refreshDefs();render();syncSegment();syncPoint();$('showTourRoute').checked=data.show;$('showTourNumbers').checked=data.showNumbers;$('showTourArrows').checked=data.showArrows;$('tourColor').value=data.color;$('tourSeaColor').value=data.seaColor;$('tourWidth').value=data.width});syncSegment();syncPoint()}
function initLayer(){if(layer)return;layer=el('g',{id:'tourRouteLayer'});const labels=document.getElementById('labelLayer');if(labels)viewport.insertBefore(layer,labels);else viewport.appendChild(layer)}
function init(){load();initLayer();injectUI();render()}
init();
})();