(()=>{
'use strict';
const NS='http://www.w3.org/2000/svg';
const STORE='vn-xuyen-viet-route-39d-v2';
const RESET_MARK='vn-xuyen-viet-route-39d-reset-v1';
const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};

const DAY_TITLES={
 1:'HÀ NỘI - VŨNG CHÙA ĐẢO YẾN - NHẬT LỆ',
 2:'ĐỘNG PHONG NHA - QUẢNG TRỊ - HUẾ',
 3:'THĂM QUAN HUẾ - BÀ NÀ HILL - TP. ĐÀ NẴNG',
 4:'ĐÀ NẴNG - RỪNG DỪA 7 MẪU - QUY NHƠN',
 5:'ĐẢO KỲ CO - EO GIÓ - THIỀN VIỆN THIÊN HƯNG',
 6:'BẢO TÀNG QUANG TRUNG - MĂNG ĐEN',
 7:'MĂNG ĐEN - KON TUM - PLEIKU',
 8:'PLEIKU - BUÔN MÊ THUỘT',
 9:'BUÔN MÊ THUỘT - ĐÀ LẠT',
 10:'THAM QUAN TP. ĐÀ LẠT',
 11:'ĐÀ LẠT - KHU DU LỊCH TÀ ĐÙNG',
 12:'KHU DU LỊCH TÀ ĐÙNG - TP. HCM',
 13:'TP. HCM - TIỀN GIANG - BẾN TRE - CẦN THƠ',
 14:'CẦN THƠ - SÓC TRĂNG - BẠC LIÊU - ĐẤT MŨI - NĂM CĂN',
 15:'NĂM CĂN - VƯỜN QUỐC GIA U MINH THƯỢNG - RẠCH GIÁ - HÀ TIÊN',
 16:'DINH CẬU - MIẾU BÀ - SAFARI - VIN WONDER - GRAND WORLD - MŨI GÀNH DẦU',
 17:'CHÙA HỘ QUỐC - TOUR 4 ĐẢO - CHECK IN ĐỊA TRUNG HẢI',
 18:'CỬA KHẨU HÀ TIÊN - KDL NÚI CẤM - RỪNG TRÀM TRÀ SƯ - CỬA KHẨU TỊNH BIÊN',
 19:'CHÂU ĐỐC - LÀNG CHĂM - THÁNH ĐƯỜNG HỒI GIÁO - ĐỒNG THÁP',
 20:'LÀNG HOA SA ĐÉC - TP. HCM',
 21:'THAM QUAN TP.HCM',
 22:'TP.HCM - NÚI BÀ ĐEN - ĐỊA ĐẠO CỦ CHI',
 23:'TP. HỒ CHÍ MINH - VŨNG TÀU',
 24:'VŨNG TÀU - PHAN THIẾT - PHÚ QUÝ',
 25:'PHÚ QUÝ - PHAN THIẾT - MŨI NÉ',
 26:'MŨI NÉ - ĐỒI CÁT BAY - BÀU SEN - NINH THUẬN - NINH CHỮ',
 27:'NINH CHỮ - VƯỜN NHO NINH THUẬN - VỊNH VĨNH HY',
 28:'VỊNH VĨNH HY - NHA TRANG - VINWONDER',
 29:'NHA TRANG - SUỐI HOA LAN - VỊNH NHA PHU',
 30:'NHA TRANG - KDL DỐC LẾT - VỊNH VŨNG RÔ - PHÚ YÊN',
 31:'GÀNH XẾP - NHÀ THỜ MẰNG LĂNG - GÀNH ĐÁ DĨA - QUY NHƠN',
 32:'QUY NHƠN - QUẢNG NGÃI - ĐẢO LÝ SƠN',
 33:'ĐẢO LÝ SƠN - QUẢNG NGÃI - TƯỢNG ĐÀI MẸ THỨ - HỘI AN',
 34:'HỘI AN - CÙ LAO CHÀM - ĐÀ NẴNG',
 35:'ĐÀ NẴNG - KDL THẦN TÀI/BÀ NÀ HILL - BÃI BIỂN LĂNG CÔ',
 36:'LĂNG CÔ - LĂNG KHẢI ĐỊNH - NT TRƯỜNG SƠN - ĐỒNG HỚI',
 37:'ĐỒNG HỚI - ĐỘNG THIÊN ĐƯỜNG - NGÃ BA ĐỒNG LỘC - CỬA LÒ',
 38:'CỬA LÒ - LÀNG SEN - QUÊ BÁC - NINH BÌNH',
 39:'KHU DU LỊCH TRÀNG AN - HANG MÚA - HÀ NỘI'
};

const NODES=[
 {name:'Nhà hát Lớn Hà Nội',lat:21.024167,lon:105.857778,start:true,offset:{x:-10,y:-8}},
 {name:'Phủ Lý · Hà Nam cũ',lat:20.544180,lon:105.915420},
 {name:'TP. Hà Tĩnh',lat:18.343056,lon:105.905833},
 {name:'Vũng Chùa - Đảo Yến',lat:17.8860,lon:106.4930},
 {name:'Nhật Lệ · Đồng Hới',lat:17.4670,lon:106.6230,day:1},
 {name:'Động Phong Nha',lat:17.5890,lon:106.2830},
 {name:'Thành Cổ Quảng Trị',lat:16.7507,lon:107.1886},
 {name:'Huế',lat:16.456111,lon:107.576389,day:2},
 {name:'Bà Nà Hills',lat:15.9950,lon:107.9880},
 {name:'Đà Nẵng',lat:16.067780,lon:108.220830,day:3,offset:{x:-8,y:-6}},
 {name:'Bán đảo Sơn Trà',lat:16.1180,lon:108.2770},
 {name:'Rừng Dừa Bảy Mẫu · Hội An',lat:15.8810,lon:108.3620},
 {name:'Quy Nhơn',lat:13.769583,lon:109.231389,day:4,offset:{x:-11,y:-7}},
 {name:'Kỳ Co',lat:13.7880,lon:109.3040},
 {name:'Eo Gió',lat:13.8740,lon:109.2910},
 {name:'Thiền Viện Thiên Hưng',lat:13.8930,lon:109.0730},
 {name:'Quy Nhơn',lat:13.769583,lon:109.231389,day:5,offset:{x:11,y:7}},
 {name:'Bảo tàng Quang Trung · Tây Sơn',lat:13.9480,lon:108.8790},
 {name:'Măng Đen',lat:14.600278,lon:108.290833,day:6},
 {name:'Kon Tum',lat:14.3545,lon:108.0076},
 {name:'Pleiku',lat:13.971519,lon:108.014673,day:7},
 {name:'Buôn Ma Thuột',lat:12.667470,lon:108.037750,day:8},
 {name:'Đà Lạt',lat:11.940000,lon:108.437500,day:9,offset:{x:-9,y:-6}},
 {name:'KDL Fresh Đà Lạt',lat:11.9650,lon:108.4140},
 {name:'Đà Lạt',lat:11.940000,lon:108.437500,day:10,offset:{x:9,y:6}},
 {name:'KDL Tà Đùng',lat:11.8350,lon:107.9980,day:11},
 {name:'TP. Hồ Chí Minh',lat:10.823020,lon:106.629650,day:12,offset:{x:-14,y:-10}},
 {name:'Mỹ Tho · Tiền Giang',lat:10.3600,lon:106.3600},
 {name:'Bến Tre',lat:10.241470,lon:106.375850},
 {name:'Cần Thơ',lat:10.037220,lon:105.788330,day:13},
 {name:'Sóc Trăng',lat:9.6025,lon:105.9739},
 {name:'Bạc Liêu',lat:9.2940,lon:105.7220},
 {name:'Đất Mũi Cà Mau',lat:8.605920,lon:104.719690},
 {name:'Năm Căn',lat:8.7590,lon:105.0010,day:14},
 {name:'VQG U Minh Thượng',lat:9.5980,lon:105.0720},
 {name:'Rạch Giá',lat:10.0124,lon:105.0809},
 {name:'Hà Tiên',lat:10.3833,lon:104.4875,day:15},
 {name:'Dương Đông · Phú Quốc',lat:10.2167,lon:103.9670,kind:'sea',day:16,offset:{x:-9,y:-7}},
 {name:'Chùa Hộ Quốc',lat:10.0030,lon:104.0530},
 {name:'An Thới · Nam đảo Phú Quốc',lat:10.0260,lon:104.0090},
 {name:'Dương Đông · Phú Quốc',lat:10.2167,lon:103.9670,day:17,offset:{x:9,y:7}},
 {name:'Hà Tiên',lat:10.3833,lon:104.4875,kind:'sea'},
 {name:'Núi Cấm',lat:10.4990,lon:104.9980},
 {name:'Rừng Tràm Trà Sư',lat:10.5850,lon:105.0600},
 {name:'Châu Đốc',lat:10.7000,lon:105.116667,day:18},
 {name:'VQG Tràm Chim · Đồng Tháp',lat:10.7240,lon:105.5110},
 {name:'Sa Đéc',lat:10.310519,lon:105.739681,day:19},
 {name:'TP. Hồ Chí Minh',lat:10.823020,lon:106.629650,day:20,offset:{x:14,y:-10}},
 {name:'Landmark 81',lat:10.7948,lon:106.7218},
 {name:'TP. Hồ Chí Minh',lat:10.823020,lon:106.629650,day:21,offset:{x:-14,y:10}},
 {name:'Núi Bà Đen',lat:11.364053,lon:106.180054},
 {name:'Địa đạo Củ Chi',lat:11.1420,lon:106.4610},
 {name:'TP. Hồ Chí Minh',lat:10.823020,lon:106.629650,day:22,offset:{x:14,y:10}},
 {name:'Vũng Tàu',lat:10.404167,lon:107.141667,day:23},
 {name:'Phan Thiết',lat:10.9280,lon:108.1020},
 {name:'Đảo Phú Quý',lat:10.5300,lon:108.9500,kind:'sea',day:24},
 {name:'Phan Thiết',lat:10.9280,lon:108.1020,kind:'sea'},
 {name:'Mũi Né',lat:10.981999,lon:108.251183,day:25},
 {name:'Bàu Sen · Bàu Trắng',lat:11.0710,lon:108.3950},
 {name:'Ninh Chữ',lat:11.5950,lon:109.0010,day:26},
 {name:'Vườn nho Ninh Thuận',lat:11.6400,lon:109.0550},
 {name:'Hang Rái',lat:11.6770,lon:109.1640},
 {name:'Vịnh Vĩnh Hy',lat:11.7180,lon:109.1940,day:27},
 {name:'Nha Trang',lat:12.2450,lon:109.191667,day:28,offset:{x:-9,y:-6}},
 {name:'Vịnh Nha Phu · Suối Hoa Lan',lat:12.3700,lon:109.2340},
 {name:'Nha Trang',lat:12.2450,lon:109.191667,day:29,offset:{x:9,y:6}},
 {name:'Dốc Lết',lat:12.6300,lon:109.2300},
 {name:'Vịnh Vũng Rô',lat:12.8510,lon:109.4140},
 {name:'TP. Tuy Hòa · Phú Yên',lat:13.086872,lon:109.308589,day:30},
 {name:'Gành Xếp',lat:13.2980,lon:109.2800},
 {name:'Nhà thờ Mằng Lăng',lat:13.3230,lon:109.2250},
 {name:'Gành Đá Đĩa',lat:13.3570,lon:109.2960},
 {name:'Quy Nhơn',lat:13.769583,lon:109.231389,day:31,offset:{x:0,y:13}},
 {name:'Khu chứng tích Sơn Mỹ · Quảng Ngãi',lat:15.2240,lon:108.8880},
 {name:'Cảng Sa Kỳ',lat:15.2140,lon:108.9100},
 {name:'Đảo Lý Sơn',lat:15.3800,lon:109.1200,kind:'sea',day:32},
 {name:'Cảng Sa Kỳ',lat:15.2140,lon:108.9100,kind:'sea'},
 {name:'Tượng đài Mẹ Thứ · Tam Kỳ',lat:15.5500,lon:108.5000},
 {name:'Phố cổ Hội An',lat:15.877222,lon:108.329167,day:33},
 {name:'Cửa Đại',lat:15.8800,lon:108.3640},
 {name:'Cù Lao Chàm',lat:15.9500,lon:108.5000,kind:'sea'},
 {name:'Cửa Đại',lat:15.8800,lon:108.3640,kind:'sea'},
 {name:'Đà Nẵng',lat:16.067780,lon:108.220830,day:34,offset:{x:9,y:7}},
 {name:'KDL Núi Thần Tài',lat:15.9430,lon:107.9930},
 {name:'Lăng Cô',lat:16.2520,lon:108.0720,day:35},
 {name:'Lăng Khải Định · Huế',lat:16.3990,lon:107.5900},
 {name:'Nghĩa trang Trường Sơn',lat:16.8790,lon:106.9820},
 {name:'Đồng Hới · Nhật Lệ',lat:17.4580,lon:106.6359,day:36},
 {name:'Động Thiên Đường',lat:17.5200,lon:106.2240},
 {name:'Ngã Ba Đồng Lộc',lat:18.401110,lon:105.739660},
 {name:'Cửa Lò',lat:18.8100,lon:105.7160,day:37},
 {name:'Làng Sen · Kim Liên',lat:18.671430,lon:105.558720},
 {name:'Ninh Bình',lat:20.2500,lon:105.9700,day:38},
 {name:'Tràng An',lat:20.255694,lon:105.915611},
 {name:'Hang Múa',lat:20.2290,lon:105.9360},
 {name:'Nhà hát Lớn Hà Nội',lat:21.024167,lon:105.857778,day:39,offset:{x:10,y:8}}
];

const svg=document.getElementById('mapSvg');
const viewport=document.getElementById('viewport');
if(!svg||!viewport)return;
let layer=null,selected=-1,selectedPoint=-1,drag=null,data=null;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,String(v)));return n};
function project(lon,lat){return{x:PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,y:PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h}}
const basePoints=NODES.map(n=>project(n.lon,n.lat));
function defaultBend(i){const a=NODES[i],b=NODES[i+1];if(!a||!b)return 0;if(a.kind==='sea'||b.kind==='sea')return(i%2?1:-1)*8;if(Math.hypot(basePoints[i+1].x-basePoints[i].x,basePoints[i+1].y-basePoints[i].y)<6)return 10;return(i%5===0?9:0)*(i%2?1:-1)}
function defaultData(){return{version:2,points:basePoints.map(p=>({...p})),bends:Array.from({length:NODES.length-1},(_,i)=>defaultBend(i)),color:'#d71945',seaColor:'#1677d2',width:2.5,show:true,showNumbers:true,showArrows:true}}
function load(){const fresh=defaultData();try{const d=JSON.parse(localStorage.getItem(STORE)||'null');if(d&&d.version===2&&Array.isArray(d.points)&&d.points.length===NODES.length){data={...fresh,...d};data.points=d.points.map((p,i)=>({x:Number(p?.x)||fresh.points[i].x,y:Number(p?.y)||fresh.points[i].y}));data.bends=Array.from({length:NODES.length-1},(_,i)=>Number(d.bends?.[i])||0);return}}catch{}data=fresh}
function save(){try{localStorage.setItem(STORE,JSON.stringify(data))}catch{}}
function controlPoint(s,e,bend){const dx=e.x-s.x,dy=e.y-s.y,len=Math.hypot(dx,dy)||1;return{x:(s.x+e.x)/2-dy/len*bend,y:(s.y+e.y)/2+dx/len*bend}}
function addTitle(node,text){const t=el('title');t.textContent=text;node.appendChild(t)}
function dayLabel(n){return n.start?'★':String(n.day||'')}
function nodeDescription(i){const n=NODES[i];if(n.start)return'Điểm khởi hành: Nhà hát Lớn Hà Nội';if(n.day)return`Ngày ${String(n.day).padStart(2,'0')}: ${DAY_TITLES[n.day]} · Nghỉ/điểm cuối: ${n.name}`;return n.name}
function segmentKind(i){return NODES[i+1]?.kind==='sea'?'sea':'land'}
function markerOffset(i){return NODES[i]?.offset||{x:0,y:0}}
function ensureDefs(){let defs=svg.querySelector('#tourRouteDefs');if(defs)return defs;defs=el('defs',{id:'tourRouteDefs'});const mk=(id,color)=>{const m=el('marker',{id,viewBox:'0 0 10 10',refX:8.5,refY:5,markerWidth:5.5,markerHeight:5.5,orient:'auto-start-reverse',markerUnits:'strokeWidth'});m.appendChild(el('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:color}));defs.appendChild(m)};mk('tourArrowLand',data?.color||'#d71945');mk('tourArrowSea',data?.seaColor||'#1677d2');svg.insertBefore(defs,svg.firstChild);return defs}
function refreshArrowDefs(){const defs=svg.querySelector('#tourRouteDefs');if(defs)defs.remove();ensureDefs()}
function render(){if(!layer)return;layer.innerHTML='';if(!data.show)return;ensureDefs();const segments=el('g',{id:'tourSegments'}),marks=el('g',{id:'tourMarkers'});for(let i=0;i<data.points.length-1;i++){const s=data.points[i],e=data.points[i+1],c=controlPoint(s,e,data.bends[i]||0),kind=segmentKind(i),stroke=kind==='sea'?data.seaColor:data.color;const p=el('path',{d:`M${s.x},${s.y} Q${c.x},${c.y} ${e.x},${e.y}`,fill:'none',stroke,'stroke-width':selected===i?Number(data.width)+1.2:data.width,'stroke-linecap':'round','stroke-linejoin':'round','vector-effect':'non-scaling-stroke','data-tour-segment':i,opacity:selected===i?'1':'.94',cursor:'pointer'});if(kind==='sea')p.setAttribute('stroke-dasharray','7 5');if(data.showArrows)p.setAttribute('marker-end',kind==='sea'?'url(#tourArrowSea)':'url(#tourArrowLand)');addTitle(p,`${NODES[i].name} → ${NODES[i+1].name}${kind==='sea'?' · đường biển/tàu':' · đường bộ'}`);p.addEventListener('click',ev=>{ev.stopPropagation();selected=i;syncSegment();render()});segments.appendChild(p)}NODES.forEach((n,i)=>{if(!n.start&&!n.day)return;const p=data.points[i],o=markerOffset(i),g=el('g',{transform:`translate(${p.x+o.x} ${p.y+o.y})`,'data-tour-point':i,cursor:'grab'}),active=selectedPoint===i;if(n.start){const halo=el('circle',{r:active?10.5:9.5,fill:'#fff','fill-opacity':'.96',stroke:'#d71945','stroke-width':active?2.8:2,'vector-effect':'non-scaling-stroke'});const star=el('text',{x:0,y:4,'text-anchor':'middle','font-family':'Arial,sans-serif','font-size':15,'font-weight':900,fill:'#f4b400','pointer-events':'none'});star.textContent='★';g.append(halo,star)}else{const outer=el('circle',{r:active?9.5:8.2,fill:'#fff','fill-opacity':'.97',stroke:data.color,'stroke-width':active?2.8:2,'vector-effect':'non-scaling-stroke'});g.appendChild(outer);if(data.showNumbers){const txt=el('text',{x:0,y:2.5,'text-anchor':'middle','font-family':'Roboto,Arial,sans-serif','font-size':n.day>=10?6.1:6.8,'font-weight':900,fill:data.color,'pointer-events':'none'});txt.textContent=dayLabel(n);g.appendChild(txt)}else g.appendChild(el('circle',{r:2.8,fill:data.color,'pointer-events':'none'}))}addTitle(g,nodeDescription(i));g.addEventListener('pointerdown',startPointDrag);g.addEventListener('click',ev=>{ev.stopPropagation();selectedPoint=i;syncPoint();render()});marks.appendChild(g)});layer.append(segments,marks)}
function localPoint(ev){const p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;const m=layer.getScreenCTM();if(!m)return[0,0];const q=p.matrixTransform(m.inverse());return[q.x,q.y]}
function startPointDrag(ev){ev.preventDefault();ev.stopPropagation();const idx=Number(ev.currentTarget.dataset.tourPoint),p=localPoint(ev),q=data.points[idx],o=markerOffset(idx);selectedPoint=idx;syncPoint();drag={idx,dx:p[0]-(q.x+o.x),dy:p[1]-(q.y+o.y),pointerId:ev.pointerId};window.addEventListener('pointermove',movePoint,true);window.addEventListener('pointerup',endPoint,true);window.addEventListener('pointercancel',endPoint,true)}
function movePoint(ev){if(!drag)return;ev.preventDefault();ev.stopPropagation();const p=localPoint(ev),q=data.points[drag.idx],o=markerOffset(drag.idx);q.x=p[0]-drag.dx-o.x;q.y=p[1]-drag.dy-o.y;render()}
function endPoint(ev){if(!drag)return;ev.preventDefault();ev.stopPropagation();drag=null;window.removeEventListener('pointermove',movePoint,true);window.removeEventListener('pointerup',endPoint,true);window.removeEventListener('pointercancel',endPoint,true);save();syncPoint()}
function syncSegment(){const info=$('tourSelected');if(!info)return;if(selected<0){info.textContent='Chưa chọn chặng';$('tourBend').disabled=true;$('tourBendNumber').disabled=true;return}const kind=segmentKind(selected)==='sea'?'đường biển/tàu':'đường bộ';info.textContent=`Chặng ${selected+1}: ${NODES[selected].name} → ${NODES[selected+1].name} · ${kind}`;$('tourBend').disabled=false;$('tourBendNumber').disabled=false;$('tourBend').value=data.bends[selected]||0;$('tourBendNumber').value=data.bends[selected]||0}
function setBend(v){if(selected<0)return;v=clamp(Number(v)||0,-160,160);data.bends[selected]=v;$('tourBend').value=v;$('tourBendNumber').value=v;render();save()}
function syncPoint(){const n=$('tourPointSelected'),btn=$('tourFixSelected');if(!n)return;if(selectedPoint<0){n.textContent='Chọn marker ★ hoặc số ngày để xem điểm dừng và tọa độ đại diện.';if(btn)btn.disabled=true;return}const node=NODES[selectedPoint],p=data.points[selectedPoint],head=node.start?'Điểm khởi hành':`Ngày ${String(node.day).padStart(2,'0')}`,detail=node.start?'Nhà hát Lớn Hà Nội':DAY_TITLES[node.day];n.innerHTML=`<b>${head}: ${node.name}</b><br>${detail}<br>GPS đại diện: ${node.lat.toFixed(6)}, ${node.lon.toFixed(6)}<br>SVG: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}`;if(btn)btn.disabled=false}
function fixPoint(idx){if(!NODES[idx]||!data?.points?.[idx])return false;data.points[idx]={...basePoints[idx]};save();render();syncPoint();return true}
function fixAllPoints(showMessage=true){data.points=basePoints.map(p=>({...p}));save();render();syncPoint();try{localStorage.setItem(RESET_MARK,'done')}catch{}if(showMessage){const n=$('tourPointSelected');if(n)n.insertAdjacentHTML('beforeend','<br><b>✓ Đã đưa toàn bộ cung đường về tọa độ đại diện của chương trình.</b>')}}
function injectUI(){const controls=document.querySelector('.controls');if(!controls||$('tourRouteGroup'))return;const g=document.createElement('div');g.className='group';g.id='tourRouteGroup';g.innerHTML=`<div class="group-title">Cung đường Xuyên Việt 39 ngày</div>
 <label class="check"><input id="showTourRoute" type="checkbox" checked> Hiện cung đường theo chương trình</label>
 <label class="check"><input id="showTourNumbers" type="checkbox" checked> Hiện marker ngày 1–39</label>
 <label class="check"><input id="showTourArrows" type="checkbox" checked> Hiện mũi tên hướng đi</label>
 <div class="row"><div><label>Màu đường bộ</label><input id="tourColor" type="color" value="#d71945"></div><div><label>Màu đường biển</label><input id="tourSeaColor" type="color" value="#1677d2"></div></div>
 <div class="row"><div><label>Độ dày tuyến</label><input id="tourWidth" type="number" min="0.8" max="8" step="0.2" value="2.5"></div></div>
 <div id="tourSelected" class="mode-note">Chưa chọn chặng</div>
 <label style="margin-top:8px">Độ cong chặng đang chọn</label>
 <div class="value-line"><input id="tourBend" type="range" min="-160" max="160" step="1" value="0" disabled><input id="tourBendNumber" type="number" min="-160" max="160" step="1" value="0" disabled></div>
 <div class="row"><button id="tourStraight" class="btn">Làm thẳng chặng</button><button id="tourReset" class="btn">Khôi phục tuyến</button></div>
 <div id="tourPointSelected" class="mode-note" style="margin-top:8px">Chọn marker ★ hoặc số ngày để xem điểm dừng và tọa độ đại diện.</div>
 <div class="row"><button id="tourFixAll" class="btn primary">Sửa đúng toàn bộ tuyến</button><button id="tourFixSelected" class="btn" disabled>Sửa điểm đang chọn</button></div>
 <div class="tip"><b>★</b> Hà Nội là điểm khởi hành. Marker <b>1–39</b> tương ứng từng ngày trong chương trình. <b style="color:#d71945">Đường đỏ liền</b> là chặng đường bộ; <b style="color:#1677d2">đường xanh nét đứt</b> là chặng tàu/cano ra đảo. Các điểm trung gian giúp đường đi bám đúng hành trình nhưng không hiện số để bản đồ thoáng.</div>`;const displayGroup=[...controls.children].find(x=>x.querySelector?.('.group-title')?.textContent.includes('Hiển thị'));if(displayGroup)controls.insertBefore(g,displayGroup);else controls.appendChild(g);$('showTourRoute').checked=data.show;$('showTourNumbers').checked=data.showNumbers;$('showTourArrows').checked=data.showArrows;$('tourColor').value=data.color;$('tourSeaColor').value=data.seaColor;$('tourWidth').value=data.width;$('showTourRoute').addEventListener('change',e=>{data.show=e.target.checked;render();save()});$('showTourNumbers').addEventListener('change',e=>{data.showNumbers=e.target.checked;render();save()});$('showTourArrows').addEventListener('change',e=>{data.showArrows=e.target.checked;render();save()});$('tourColor').addEventListener('input',e=>{data.color=e.target.value;refreshArrowDefs();render();save()});$('tourSeaColor').addEventListener('input',e=>{data.seaColor=e.target.value;refreshArrowDefs();render();save()});$('tourWidth').addEventListener('input',e=>{data.width=clamp(Number(e.target.value)||2.5,.8,8);render();save()});$('tourBend').addEventListener('input',e=>setBend(e.target.value));$('tourBendNumber').addEventListener('input',e=>setBend(e.target.value));$('tourStraight').addEventListener('click',()=>{if(selected>=0)setBend(0)});$('tourFixAll').addEventListener('click',()=>fixAllPoints(true));$('tourFixSelected').addEventListener('click',()=>{if(selectedPoint>=0)fixPoint(selectedPoint)});$('tourReset').addEventListener('click',()=>{if(!confirm('Khôi phục toàn bộ cung đường Xuyên Việt 39 ngày về tọa độ và độ cong mặc định?'))return;data=defaultData();selected=-1;selectedPoint=-1;save();refreshArrowDefs();syncSegment();syncPoint();$('showTourRoute').checked=data.show;$('showTourNumbers').checked=data.showNumbers;$('showTourArrows').checked=data.showArrows;$('tourColor').value=data.color;$('tourSeaColor').value=data.seaColor;$('tourWidth').value=data.width;render()});syncSegment();syncPoint()}
function initLayer(){if(layer)return;layer=el('g',{id:'tourRouteLayer'});const labelLayer=document.getElementById('labelLayer');if(labelLayer)viewport.insertBefore(layer,labelLayer);else viewport.appendChild(layer)}
function init(){load();initLayer();injectUI();render()}
init();
})();