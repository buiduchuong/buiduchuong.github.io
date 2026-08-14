(()=>{
'use strict';
const NS='http://www.w3.org/2000/svg';
const STORE='vn-xuyen-viet-route-main35-v5';
const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};

// 35 marker chính để bản đồ dễ đọc. Các waypoint hidden chỉ dùng để uốn tuyến đúng hành trình.
// mode:'sea' nghĩa là chặng TỪ điểm trước đó ĐẾN điểm này đi bằng tàu/cano.
const ROUTE=[
 {name:'Hà Nội',lat:21.024167,lon:105.857778,num:1,start:true,offset:{x:-10,y:-8},note:'Điểm khởi hành'},
 {name:'TP. Hà Tĩnh',lat:18.343056,lon:105.905833,hidden:true,bend:4},
 {name:'Quảng Bình · Nhật Lệ',lat:17.4580,lon:106.6359,num:2,bend:8,offset:{x:-7,y:-5},note:'Vũng Chùa - Đảo Yến, Nhật Lệ'},
 {name:'Động Phong Nha',lat:17.5890,lon:106.2830,hidden:true,bend:-7},
 {name:'Thành Cổ Quảng Trị',lat:16.7507,lon:107.1886,hidden:true,bend:7},
 {name:'Huế',lat:16.456111,lon:107.576389,num:3,bend:7,offset:{x:-7,y:-5},note:'Cố đô Huế'},
 {name:'Bà Nà Hills',lat:15.9950,lon:107.9880,hidden:true,bend:6},
 {name:'Đà Nẵng',lat:16.067780,lon:108.220830,num:4,bend:6,offset:{x:-8,y:-6}},
 {name:'Rừng Dừa Bảy Mẫu · Hội An',lat:15.8810,lon:108.3620,hidden:true,bend:5},
 {name:'Quy Nhơn',lat:13.769583,lon:109.231389,num:5,bend:8,offset:{x:-9,y:-7},note:'Kỳ Co - Eo Gió - Thiền Viện Thiên Hưng'},
 {name:'Bảo tàng Quang Trung · Tây Sơn',lat:13.9480,lon:108.8790,hidden:true,bend:-6},
 {name:'Măng Đen',lat:14.600278,lon:108.290833,num:6,bend:-8},
 {name:'Kon Tum',lat:14.3545,lon:108.0076,hidden:true,bend:-5},
 {name:'Pleiku',lat:13.971519,lon:108.014673,num:7,bend:-4},
 {name:'Buôn Ma Thuột',lat:12.667470,lon:108.037750,num:8,bend:-5},
 {name:'Đà Lạt',lat:11.940000,lon:108.437500,num:9,bend:6},
 {name:'Tà Đùng',lat:11.8350,lon:107.9980,num:10,bend:6},
 {name:'TP.HCM',lat:10.823020,lon:106.629650,num:11,bend:9,offset:{x:-13,y:-10}},
 {name:'Mỹ Tho · Tiền Giang',lat:10.3600,lon:106.3600,hidden:true,bend:4},
 {name:'Bến Tre',lat:10.241470,lon:106.375850,hidden:true,bend:4},
 {name:'Cần Thơ',lat:10.037220,lon:105.788330,num:12,bend:5},
 {name:'Sóc Trăng',lat:9.6025,lon:105.9739,hidden:true,bend:4},
 {name:'Bạc Liêu',lat:9.2940,lon:105.7220,hidden:true,bend:4},
 {name:'Đất Mũi Cà Mau',lat:8.605920,lon:104.719690,hidden:true,bend:-5},
 {name:'Cà Mau · Năm Căn',lat:8.7590,lon:105.0010,num:13,bend:-6,note:'Đất Mũi - Năm Căn'},
 {name:'VQG U Minh Thượng',lat:9.5980,lon:105.0720,hidden:true,bend:-7},
 {name:'Rạch Giá',lat:10.0124,lon:105.0809,hidden:true,bend:-5},
 {name:'Hà Tiên',lat:10.3833,lon:104.4875,num:14,bend:-7},
 {name:'Phú Quốc',lat:10.2167,lon:103.9670,num:15,mode:'sea',bend:-9,offset:{x:-5,y:-6},note:'Dinh Cậu - Nam đảo - tour đảo'},
 {name:'Hà Tiên',lat:10.3833,lon:104.4875,hidden:true,mode:'sea',bend:9},
 {name:'Núi Cấm',lat:10.4990,lon:104.9980,hidden:true,bend:5},
 {name:'Rừng Tràm Trà Sư',lat:10.5850,lon:105.0600,hidden:true,bend:4},
 {name:'Châu Đốc',lat:10.7000,lon:105.116667,num:16,bend:4},
 {name:'VQG Tràm Chim',lat:10.7240,lon:105.5110,hidden:true,bend:5},
 {name:'Đồng Tháp · Sa Đéc',lat:10.310519,lon:105.739681,num:17,bend:6,note:'Tràm Chim - Làng hoa Sa Đéc'},
 {name:'TP.HCM',lat:10.823020,lon:106.629650,num:18,bend:10,offset:{x:13,y:-10}},
 {name:'Tây Ninh',lat:11.364053,lon:106.180054,num:19,bend:-10,note:'Núi Bà Đen'},
 {name:'Địa đạo Củ Chi',lat:11.1420,lon:106.4610,hidden:true,bend:-7},
 {name:'TP.HCM',lat:10.823020,lon:106.629650,num:20,bend:10,offset:{x:0,y:13},note:'Quay lại TP.HCM trước chặng Vũng Tàu'},
 {name:'Vũng Tàu',lat:10.404167,lon:107.141667,num:21,bend:10},
 {name:'Phan Thiết',lat:10.9280,lon:108.1020,hidden:true,bend:8},
 {name:'Đảo Phú Quý',lat:10.5300,lon:108.9500,num:22,mode:'sea',bend:11,offset:{x:3,y:-6}},
 {name:'Phan Thiết',lat:10.9280,lon:108.1020,hidden:true,mode:'sea',bend:-11},
 {name:'Mũi Né',lat:10.981999,lon:108.251183,num:23,bend:8},
 {name:'Bàu Trắng · Đồi Cát Bay',lat:11.0710,lon:108.3950,hidden:true,bend:5},
 {name:'Ninh Chữ · Vĩnh Hy',lat:11.6800,lon:109.1200,num:24,bend:6,note:'Ninh Chữ - Vườn nho - Vịnh Vĩnh Hy'},
 {name:'Nha Trang',lat:12.2450,lon:109.191667,num:25,bend:5},
 {name:'Dốc Lết',lat:12.6300,lon:109.2300,hidden:true,bend:5},
 {name:'Vịnh Vũng Rô',lat:12.8510,lon:109.4140,hidden:true,bend:6},
 {name:'Phú Yên · Tuy Hòa',lat:13.086872,lon:109.308589,num:26,bend:6},
 {name:'Nhà thờ Mằng Lăng',lat:13.3230,lon:109.2250,hidden:true,bend:4},
 {name:'Gành Đá Đĩa',lat:13.3570,lon:109.2960,hidden:true,bend:4},
 {name:'Quy Nhơn',lat:13.769583,lon:109.231389,num:27,bend:-10,offset:{x:9,y:8}},
 {name:'Sơn Mỹ · Quảng Ngãi',lat:15.2240,lon:108.8880,hidden:true,bend:-7},
 {name:'Cảng Sa Kỳ',lat:15.2140,lon:108.9100,hidden:true,bend:-4},
 {name:'Đảo Lý Sơn',lat:15.3800,lon:109.1200,num:28,mode:'sea',bend:8,offset:{x:5,y:-5}},
 {name:'Cảng Sa Kỳ',lat:15.2140,lon:108.9100,hidden:true,mode:'sea',bend:-8},
 {name:'Tượng đài Mẹ Thứ · Tam Kỳ',lat:15.5500,lon:108.5000,hidden:true,bend:-6},
 {name:'Hội An',lat:15.877222,lon:108.329167,num:29,bend:-6},
 {name:'Cửa Đại',lat:15.8800,lon:108.3640,hidden:true,bend:4},
 {name:'Cù Lao Chàm',lat:15.9500,lon:108.5000,hidden:true,mode:'sea',bend:7},
 {name:'Cửa Đại',lat:15.8800,lon:108.3640,hidden:true,mode:'sea',bend:-7},
 {name:'Đà Nẵng',lat:16.067780,lon:108.220830,num:30,bend:-10,offset:{x:8,y:7}},
 {name:'KDL Núi Thần Tài',lat:15.9430,lon:107.9930,hidden:true,bend:-6},
 {name:'Lăng Cô · Huế',lat:16.3000,lon:107.9100,num:31,bend:-9,offset:{x:7,y:5},note:'Lăng Cô - Lăng Khải Định - Huế'},
 {name:'Nghĩa trang Trường Sơn',lat:16.8790,lon:106.9820,hidden:true,bend:-8},
 {name:'Quảng Bình · Đồng Hới',lat:17.4580,lon:106.6359,num:32,bend:-12,offset:{x:8,y:6},note:'Nhật Lệ - Đồng Hới'},
 {name:'Động Thiên Đường',lat:17.5200,lon:106.2240,hidden:true,bend:-8},
 {name:'Ngã Ba Đồng Lộc',lat:18.401110,lon:105.739660,hidden:true,bend:-7},
 {name:'Nghệ An · Cửa Lò',lat:18.8100,lon:105.7160,num:33,bend:-7,note:'Cửa Lò - Làng Sen - Quê Bác'},
 {name:'Làng Sen · Kim Liên',lat:18.671430,lon:105.558720,hidden:true,bend:-6},
 {name:'Ninh Bình',lat:20.255694,lon:105.915611,num:34,bend:-7,note:'Hoa Lư - Tràng An - Hang Múa'},
 {name:'Tràng An',lat:20.255694,lon:105.915611,hidden:true,bend:-5},
 {name:'Hang Múa',lat:20.2290,lon:105.9360,hidden:true,bend:-4},
 {name:'Hà Nội',lat:21.024167,lon:105.857778,num:35,finish:true,bend:-10,offset:{x:10,y:8},note:'Kết thúc hành trình'}
];

const svg=document.getElementById('mapSvg'),viewport=document.getElementById('viewport');
if(!svg||!viewport)return;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,String(v)));return n};
function project(lon,lat){return{x:PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,y:PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h}}
const BASE=ROUTE.map(p=>project(p.lon,p.lat));
let layer=null,data=null,selected=-1,selectedPoint=-1,drag=null;
function defaults(){return{version:5,points:BASE.map(p=>({...p})),bends:ROUTE.slice(0,-1).map((_,i)=>Number(ROUTE[i+1]?.bend)||0),color:'#d71945',seaColor:'#1677d2',width:2.5,show:true,showNumbers:true,showArrows:true}}
function load(){const fresh=defaults();try{const d=JSON.parse(localStorage.getItem(STORE)||'null');if(d&&d.version===5&&Array.isArray(d.points)&&d.points.length===ROUTE.length){data={...fresh,...d};data.points=d.points.map((p,i)=>({x:Number(p?.x)||fresh.points[i].x,y:Number(p?.y)||fresh.points[i].y}));data.bends=ROUTE.slice(0,-1).map((_,i)=>Number(d.bends?.[i])||0);return}}catch{}data=fresh}
function save(){try{localStorage.setItem(STORE,JSON.stringify(data))}catch{}}
function controlPoint(s,e,b){const dx=e.x-s.x,dy=e.y-s.y,len=Math.hypot(dx,dy)||1;return{x:(s.x+e.x)/2-dy/len*b,y:(s.y+e.y)/2+dx/len*b}}
function addTitle(n,text){const t=el('title');t.textContent=text;n.appendChild(t)}
function ensureDefs(){let d=svg.querySelector('#tourMain35Defs');if(d)return d;d=el('defs',{id:'tourMain35Defs'});const add=(id,color)=>{const m=el('marker',{id,viewBox:'0 0 10 10',refX:8.2,refY:5,markerWidth:4.5,markerHeight:4.5,orient:'auto',markerUnits:'strokeWidth'});m.appendChild(el('path',{d:'M0 0 L10 5 L0 10 Z',fill:color}));d.appendChild(m)};add('tourMain35Arrow',data?.color||'#d71945');add('tourMain35SeaArrow',data?.seaColor||'#1677d2');svg.insertBefore(d,svg.firstChild);return d}
function refreshDefs(){const d=svg.querySelector('#tourMain35Defs');if(d)d.remove();ensureDefs()}
function isSea(i){return ROUTE[i+1]?.mode==='sea'}
function shouldArrow(i){if(!data.showArrows)return false;if(isSea(i))return true;const a=ROUTE[i],b=ROUTE[i+1];return(!a.hidden&&!b.hidden)||(i%5===2)||i===ROUTE.length-2}
function off(i){return ROUTE[i]?.offset||{x:0,y:0}}
function visibleLabel(r){return r.num?`${r.num}. ${r.name}`:r.name}
function addNumberMarker(g,r,active){const finish=!!r.finish;g.appendChild(el('circle',{r:active?8.9:7.8,fill:'#fff','fill-opacity':'.98',stroke:finish?'#16803a':data.color,'stroke-width':active?2.7:1.9,'vector-effect':'non-scaling-stroke'}));if(data.showNumbers){const t=el('text',{x:0,y:2.25,'text-anchor':'middle','font-family':'Roboto,Arial,sans-serif','font-size':r.num>=10?5.6:6.5,'font-weight':900,fill:finish?'#16803a':data.color,'pointer-events':'none'});t.textContent=String(r.num);g.appendChild(t)}else g.appendChild(el('circle',{r:2.5,fill:finish?'#16803a':data.color,'pointer-events':'none'}));if(r.start){const star=el('text',{x:-8.4,y:-6.4,'text-anchor':'middle','font-family':'Arial,sans-serif','font-size':10.5,'font-weight':900,fill:'#f4b400','pointer-events':'none'});star.textContent='★';g.appendChild(star)}if(r.finish){const check=el('text',{x:8.4,y:-6.4,'text-anchor':'middle','font-family':'Arial,sans-serif','font-size':8.4,'font-weight':900,fill:'#16803a','pointer-events':'none'});check.textContent='✓';g.appendChild(check)}}
function render(){if(!layer)return;layer.innerHTML='';if(!data.show)return;ensureDefs();const segs=el('g',{id:'tourMain35Segments'}),marks=el('g',{id:'tourMain35Markers'});for(let i=0;i<data.points.length-1;i++){const s=data.points[i],e=data.points[i+1],c=controlPoint(s,e,data.bends[i]||0),sea=isSea(i),stroke=sea?data.seaColor:data.color;const p=el('path',{d:`M${s.x},${s.y} Q${c.x},${c.y} ${e.x},${e.y}`,fill:'none',stroke,'stroke-width':selected===i?Number(data.width)+1.05:data.width,'stroke-linecap':'round','stroke-linejoin':'round','vector-effect':'non-scaling-stroke',opacity:selected===i?'1':'.92',cursor:'pointer','data-tour-segment':i});if(sea)p.setAttribute('stroke-dasharray','7 5');if(shouldArrow(i))p.setAttribute('marker-end',sea?'url(#tourMain35SeaArrow)':'url(#tourMain35Arrow)');addTitle(p,`${ROUTE[i].name} → ${ROUTE[i+1].name}${sea?' · tàu/cano':''}`);p.addEventListener('click',ev=>{ev.stopPropagation();selected=i;syncSegment();render()});segs.appendChild(p)}ROUTE.forEach((r,i)=>{if(r.hidden||!r.num)return;const p=data.points[i],o=off(i),g=el('g',{transform:`translate(${p.x+o.x} ${p.y+o.y})`,'data-tour-point':i,cursor:'grab'}),active=selectedPoint===i;addNumberMarker(g,r,active);addTitle(g,`${r.start?'★ ':r.finish?'✓ ':''}${visibleLabel(r)}${r.note?' · '+r.note:''}`);g.addEventListener('pointerdown',startPointDrag);g.addEventListener('click',ev=>{ev.stopPropagation();selectedPoint=i;syncPoint();render()});marks.appendChild(g)});layer.append(segs,marks)}
function localPoint(ev){const p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;const m=layer.getScreenCTM();if(!m)return[0,0];const q=p.matrixTransform(m.inverse());return[q.x,q.y]}
function startPointDrag(ev){ev.preventDefault();ev.stopPropagation();const idx=Number(ev.currentTarget.dataset.tourPoint),p=localPoint(ev),q=data.points[idx],o=off(idx);selectedPoint=idx;syncPoint();drag={idx,dx:p[0]-(q.x+o.x),dy:p[1]-(q.y+o.y)};window.addEventListener('pointermove',movePoint,true);window.addEventListener('pointerup',endPoint,true);window.addEventListener('pointercancel',endPoint,true)}
function movePoint(ev){if(!drag)return;ev.preventDefault();ev.stopPropagation();const p=localPoint(ev),q=data.points[drag.idx],o=off(drag.idx);q.x=p[0]-drag.dx-o.x;q.y=p[1]-drag.dy-o.y;render()}
function endPoint(ev){if(!drag)return;ev.preventDefault();ev.stopPropagation();drag=null;window.removeEventListener('pointermove',movePoint,true);window.removeEventListener('pointerup',endPoint,true);window.removeEventListener('pointercancel',endPoint,true);save();syncPoint()}
function syncSegment(){const info=$('tourSelected');if(!info)return;if(selected<0){info.textContent='Chưa chọn chặng';$('tourBend').disabled=true;$('tourBendNumber').disabled=true;return}info.textContent=`${ROUTE[selected].name} → ${ROUTE[selected+1].name}${isSea(selected)?' · tàu/cano':''}`;$('tourBend').disabled=false;$('tourBendNumber').disabled=false;$('tourBend').value=data.bends[selected]||0;$('tourBendNumber').value=data.bends[selected]||0}
function setBend(v){if(selected<0)return;v=clamp(Number(v)||0,-100,100);data.bends[selected]=v;$('tourBend').value=v;$('tourBendNumber').value=v;render();save()}
function syncPoint(){const n=$('tourPointSelected'),btn=$('tourFixSelected');if(!n)return;if(selectedPoint<0){n.textContent='Chọn một marker số để xem điểm tuyến.';if(btn)btn.disabled=true;return}const r=ROUTE[selectedPoint],p=data.points[selectedPoint],head=r.start?`★ Điểm ${r.num} · khởi hành`:r.finish?`✓ Điểm ${r.num} · kết thúc`:`Điểm ${r.num}`;n.innerHTML=`<b>${head}: ${r.name}</b>${r.note?`<br>${r.note}`:''}<br>GPS đại diện: ${r.lat.toFixed(6)}, ${r.lon.toFixed(6)}<br>SVG: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}`;if(btn)btn.disabled=false}
function fixPoint(i){if(!ROUTE[i]||!data?.points?.[i])return;data.points[i]={...BASE[i]};save();render();syncPoint()}
function fixAll(){const d=defaults();data.points=d.points;data.bends=d.bends;save();render();syncSegment();syncPoint()}
function injectUI(){const controls=document.querySelector('.controls');if(!controls||$('tourRouteGroup'))return;const g=document.createElement('div');g.className='group';g.id='tourRouteGroup';g.innerHTML=`<div class="group-title">Cung đường Xuyên Việt — 35 điểm chính</div><label class="check"><input id="showTourRoute" type="checkbox" checked> Hiện cung đường</label><label class="check"><input id="showTourNumbers" type="checkbox" checked> Hiện số 1–35</label><label class="check"><input id="showTourArrows" type="checkbox" checked> Hiện mũi tên hướng đi</label><div class="row"><div><label>Màu đường bộ</label><input id="tourColor" type="color" value="#d71945"></div><div><label>Màu tàu/biển</label><input id="tourSeaColor" type="color" value="#1677d2"></div></div><label style="margin-top:8px">Độ dày tuyến</label><input id="tourWidth" type="number" min="0.8" max="8" step="0.2" value="2.5"><div id="tourSelected" class="mode-note" style="margin-top:8px">Chưa chọn chặng</div><label style="margin-top:8px">Độ cong chặng đang chọn</label><div class="value-line"><input id="tourBend" type="range" min="-100" max="100" step="1" value="0" disabled><input id="tourBendNumber" type="number" min="-100" max="100" step="1" value="0" disabled></div><div class="row"><button id="tourStraight" class="btn">Làm thẳng chặng</button><button id="tourReset" class="btn">Khôi phục tuyến</button></div><div id="tourPointSelected" class="mode-note" style="margin-top:8px">Chọn một marker số để xem điểm tuyến.</div><div class="row"><button id="tourFixAll" class="btn primary">Sửa đúng toàn bộ tuyến</button><button id="tourFixSelected" class="btn" disabled>Sửa điểm đang chọn</button></div><div class="tip"><b>① Hà Nội</b> là điểm bắt đầu; <b>35 Hà Nội</b> là điểm kết thúc. Marker là <b>điểm tuyến chính</b>, không phải số ngày trong PDF. Các điểm tham quan nhỏ vẫn được dùng làm waypoint ẩn để đường bám đúng hành trình. <b style="color:#d71945">Đỏ liền</b>: đường bộ. <b style="color:#1677d2">Xanh nét đứt</b>: tàu/cano ra đảo.</div>`;const displayGroup=[...controls.children].find(x=>x.querySelector?.('.group-title')?.textContent.includes('Hiển thị'));if(displayGroup)controls.insertBefore(g,displayGroup);else controls.appendChild(g);$('showTourRoute').checked=data.show;$('showTourNumbers').checked=data.showNumbers;$('showTourArrows').checked=data.showArrows;$('tourColor').value=data.color;$('tourSeaColor').value=data.seaColor;$('tourWidth').value=data.width;$('showTourRoute').addEventListener('change',e=>{data.show=e.target.checked;render();save()});$('showTourNumbers').addEventListener('change',e=>{data.showNumbers=e.target.checked;render();save()});$('showTourArrows').addEventListener('change',e=>{data.showArrows=e.target.checked;render();save()});$('tourColor').addEventListener('input',e=>{data.color=e.target.value;refreshDefs();render();save()});$('tourSeaColor').addEventListener('input',e=>{data.seaColor=e.target.value;refreshDefs();render();save()});$('tourWidth').addEventListener('input',e=>{data.width=clamp(Number(e.target.value)||2.5,.8,8);render();save()});$('tourBend').addEventListener('input',e=>setBend(e.target.value));$('tourBendNumber').addEventListener('input',e=>setBend(e.target.value));$('tourStraight').addEventListener('click',()=>{if(selected>=0)setBend(0)});$('tourFixAll').addEventListener('click',fixAll);$('tourFixSelected').addEventListener('click',()=>{if(selectedPoint>=0)fixPoint(selectedPoint)});$('tourReset').addEventListener('click',()=>{if(!confirm('Khôi phục toàn bộ cung đường 35 điểm chính về mặc định?'))return;data=defaults();selected=-1;selectedPoint=-1;save();refreshDefs();render();syncSegment();syncPoint();$('showTourRoute').checked=data.show;$('showTourNumbers').checked=data.showNumbers;$('showTourArrows').checked=data.showArrows;$('tourColor').value=data.color;$('tourSeaColor').value=data.seaColor;$('tourWidth').value=data.width});syncSegment();syncPoint()}
function initLayer(){if(layer)return;layer=el('g',{id:'tourRouteLayer'});const labels=document.getElementById('labelLayer');if(labels)viewport.insertBefore(layer,labels);else viewport.appendChild(layer)}
function init(){load();initLayer();injectUI();render()}
init();
})();