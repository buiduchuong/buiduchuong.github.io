(()=>{
'use strict';
const NS='http://www.w3.org/2000/svg';
// Giữ nguyên key/version v9 để bảo toàn các vị trí cung đường người dùng đã chỉnh tay.
const STORE='vn-xuyen-viet-route-standard38-v9';
const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};

// Hình học cung đường chuẩn 38 ngày - 37 đêm.
// Hà Nội đầu tuyến chỉ là ★ điểm khởi hành. Số 01 bắt đầu tại Quảng Bình.
// Các điểm hidden chỉ dùng để bẻ tuyến đúng hướng và không làm bản đồ bị rối.
// mode:'sea' nghĩa là chặng TỪ điểm trước đó ĐẾN điểm này đi bằng tàu/cano.
const ROUTE=[
 {name:'Hà Nội',lat:21.024167,lon:105.857778,start:true,offset:{x:-10,y:-8},note:'Điểm khởi hành'},
 {name:'TP. Hà Tĩnh',lat:18.343056,lon:105.905833,hidden:true,bend:3},
 {name:'Quảng Bình · Nhật Lệ',lat:17.4580,lon:106.6359,bend:7,offset:{x:-7,y:-5},note:'Vũng Chùa - Đảo Yến, Nhật Lệ'},
 {name:'Động Phong Nha',lat:17.5890,lon:106.2830,hidden:true,bend:-6},
 {name:'Thành Cổ Quảng Trị',lat:16.7507,lon:107.1886,hidden:true,bend:6},
 {name:'Huế',lat:16.456111,lon:107.576389,bend:6,offset:{x:-7,y:-5},note:'Chùa Thiên Mụ - Đại Nội'},
 {name:'Bà Nà Hills',lat:15.9950,lon:107.9880,hidden:true,bend:5},
 {name:'Đà Nẵng',lat:16.067780,lon:108.220830,bend:5,offset:{x:-8,y:-6},note:'Bán đảo Sơn Trà - Linh Ứng'},
 {name:'Rừng Dừa Bảy Mẫu · Hội An',lat:15.8810,lon:108.3620,hidden:true,bend:5},
 {name:'Quy Nhơn',lat:13.769583,lon:109.231389,bend:8,offset:{x:-9,y:-7},note:'Kỳ Co - Eo Gió - Thiền Viện Thiên Hưng'},
 {name:'Bảo tàng Quang Trung · Tây Sơn',lat:13.9480,lon:108.8790,hidden:true,bend:-6},
 {name:'Pleiku',lat:13.971519,lon:108.014673,bend:-6,offset:{x:-7,y:-4}},
 {name:'Cửa khẩu Bờ Y',lat:14.7070,lon:107.7290,bend:-9,offset:{x:-5,y:-6},note:'Ngã ba Đông Dương'},
 {name:'Măng Đen',lat:14.600278,lon:108.290833,bend:9,offset:{x:7,y:-4},note:'Đức Mẹ Măng Đen - Thác Pa Sỹ - Hồ Đăk Ke'},
 {name:'Kon Tum',lat:14.3545,lon:108.0076,hidden:true,bend:-6},
 {name:'Pleiku',lat:13.971519,lon:108.014673,bend:-7,offset:{x:8,y:7},note:'Biển Hồ - Đường Thông Cổ'},
 {name:'Buôn Ma Thuột',lat:12.667470,lon:108.037750,bend:-5,offset:{x:-8,y:-5},note:'Biệt điện Bảo Đại - KoTam'},
 {name:'Thác Dray Sap',lat:12.5750,lon:107.8900,hidden:true,bend:-6},
 {name:'Buôn Đôn',lat:12.9180,lon:107.6690,bend:-8,offset:{x:-6,y:-5},note:'Cầu treo Sêrêpok - nhà cổ Lào'},
 {name:'Buôn Ma Thuột',lat:12.667470,lon:108.037750,hidden:true,bend:9},
 {name:'Tà Đùng',lat:11.8350,lon:107.9980,bend:-6,note:'KDL Tà Đùng Top View'},
 {name:'Đà Lạt',lat:11.9400,lon:108.4375,bend:6,note:'Trúc Lâm - Hồ Tuyền Lâm - Đường Hầm Đất Sét'},
 {name:'Bảo Lộc',lat:11.5470,lon:107.8070,hidden:true,bend:-4},
 {name:'TP.HCM',lat:10.823020,lon:106.629650,bend:9,offset:{x:-13,y:-10}},
 {name:'Mỹ Tho · Tiền Giang',lat:10.3600,lon:106.3600,hidden:true,bend:4},
 {name:'Bến Tre',lat:10.241470,lon:106.375850,hidden:true,bend:4},
 {name:'Cần Thơ',lat:10.037220,lon:105.788330,bend:5,note:'Nhà cổ Bình Thủy - Mỹ Khánh - Ninh Kiều'},
 {name:'Sóc Trăng',lat:9.6025,lon:105.9739,hidden:true,bend:4},
 {name:'Bạc Liêu',lat:9.2940,lon:105.7220,hidden:true,bend:4},
 {name:'Đất Mũi Cà Mau',lat:8.605920,lon:104.719690,hidden:true,bend:-5},
 {name:'Năm Căn',lat:8.7580,lon:104.9940,bend:-6,note:'Đất Mũi - Năm Căn'},
 {name:'VQG U Minh Thượng',lat:9.5980,lon:105.0720,hidden:true,bend:-7},
 {name:'Rạch Giá',lat:10.0124,lon:105.0809,hidden:true,bend:-5},
 {name:'Hà Tiên',lat:10.3833,lon:104.4875,bend:-7,note:'Thạch Động - Phù Dung - Núi Bình San - Lăng Mạc Cửu'},
 {name:'Núi Cấm',lat:10.4990,lon:104.9980,hidden:true,bend:5},
 {name:'Rừng Tràm Trà Sư',lat:10.5850,lon:105.0600,hidden:true,bend:4},
 {name:'Cửa khẩu Tịnh Biên',lat:10.6010,lon:104.9550,hidden:true,bend:-4},
 {name:'Châu Đốc',lat:10.7000,lon:105.116667,bend:5,note:'Miếu Bà Chúa Xứ'},
 {name:'Làng Chăm · Thánh đường Hồi giáo',lat:10.7180,lon:105.1260,hidden:true,bend:4},
 {name:'Lăng cụ Nguyễn Sinh Sắc',lat:10.4630,lon:105.6330,hidden:true,bend:4},
 {name:'VQG Tràm Chim',lat:10.7240,lon:105.5110,hidden:true,bend:5},
 {name:'Đồng Tháp · Sa Đéc',lat:10.310519,lon:105.739681,bend:6,note:'Tràm Chim - Làng hoa Sa Đéc'},
 {name:'TP.HCM',lat:10.823020,lon:106.629650,bend:10,offset:{x:13,y:-10},note:'Tham quan TP.HCM'},
 {name:'Tây Ninh',lat:11.364053,lon:106.180054,bend:-10,note:'Núi Bà Đen'},
 {name:'Địa đạo Củ Chi',lat:11.1420,lon:106.4610,hidden:true,bend:-7},
 {name:'TP.HCM',lat:10.823020,lon:106.629650,bend:10,offset:{x:0,y:13},note:'Quay lại TP.HCM trước chặng Vũng Tàu'},
 {name:'Vũng Tàu',lat:10.404167,lon:107.141667,bend:10},
 {name:'Phan Thiết',lat:10.9280,lon:108.1020,hidden:true,bend:8},
 {name:'Mũi Né',lat:10.981999,lon:108.251183,bend:8},
 {name:'Đồi Cát Bay · Bàu Sen',lat:11.0710,lon:108.3950,hidden:true,bend:5},
 {name:'Ninh Chữ',lat:11.5750,lon:109.0080,bend:6,note:'Ninh Thuận - Ninh Chữ'},
 {name:'Vườn nho Ninh Thuận',lat:11.7000,lon:109.0700,hidden:true,bend:4},
 {name:'Vịnh Vĩnh Hy',lat:11.7180,lon:109.1940,bend:5,note:'Vườn nho - Vịnh Vĩnh Hy'},
 {name:'Nha Trang',lat:12.2450,lon:109.191667,bend:5,note:'VinWonder - Suối Hoa Lan - Vịnh Nha Phu'},
 {name:'Suối Hoa Lan · Vịnh Nha Phu',lat:12.3700,lon:109.2400,hidden:true,bend:5},
 {name:'Dốc Lết',lat:12.6300,lon:109.2300,hidden:true,bend:5},
 {name:'Vịnh Vũng Rô',lat:12.8510,lon:109.4140,hidden:true,bend:6},
 {name:'Phú Yên · Tuy Hòa',lat:13.086872,lon:109.308589,bend:6},
 {name:'Gành Xếp',lat:13.2860,lon:109.2800,hidden:true,bend:4},
 {name:'Nhà thờ Mằng Lăng',lat:13.3230,lon:109.2250,hidden:true,bend:4},
 {name:'Gành Đá Đĩa',lat:13.3570,lon:109.2960,hidden:true,bend:4},
 {name:'Quy Nhơn',lat:13.769583,lon:109.231389,bend:-10,offset:{x:9,y:8}},
 {name:'Sơn Mỹ · Quảng Ngãi',lat:15.2240,lon:108.8880,hidden:true,bend:-7},
 {name:'Cảng Sa Kỳ',lat:15.2140,lon:108.9100,hidden:true,bend:-4},
 {name:'Đảo Lý Sơn',lat:15.3800,lon:109.1200,mode:'sea',bend:8,offset:{x:5,y:-5}},
 {name:'Cảng Sa Kỳ',lat:15.2140,lon:108.9100,hidden:true,mode:'sea',bend:-8},
 {name:'Tượng đài Mẹ Thứ · Tam Kỳ',lat:15.5500,lon:108.5000,hidden:true,bend:-6},
 {name:'Hội An',lat:15.877222,lon:108.329167,bend:-6,note:'Phố cổ Hội An'},
 {name:'Cửa Đại',lat:15.8800,lon:108.3640,hidden:true,bend:4},
 {name:'Cù Lao Chàm',lat:15.9500,lon:108.5000,hidden:true,mode:'sea',bend:7},
 {name:'Cửa Đại',lat:15.8800,lon:108.3640,hidden:true,mode:'sea',bend:-7},
 {name:'Đà Nẵng',lat:16.067780,lon:108.220830,bend:-10,offset:{x:8,y:7}},
 {name:'KDL Núi Thần Tài',lat:15.9430,lon:107.9930,hidden:true,bend:-6},
 {name:'Biển Lăng Cô',lat:16.2460,lon:108.0790,bend:-7,offset:{x:7,y:5},note:'Lăng Cô - Cố đô Huế'},
 {name:'Lăng Khải Định · Huế',lat:16.3990,lon:107.5900,hidden:true,bend:-7},
 {name:'Nghĩa trang Trường Sơn',lat:16.8790,lon:106.9820,hidden:true,bend:-8},
 {name:'Đồng Hới · Bảo Ninh',lat:17.4580,lon:106.6359,bend:-12,offset:{x:8,y:6},note:'Biển Bảo Ninh - Tượng đài Mẹ Suốt'},
 {name:'Động Thiên Đường',lat:17.5200,lon:106.2240,hidden:true,bend:-8},
 {name:'Ngã Ba Đồng Lộc',lat:18.401110,lon:105.739660,hidden:true,bend:-7},
 {name:'Cửa Lò',lat:18.8100,lon:105.7160,bend:-7,note:'Cửa Lò - Làng Sen - Quê Bác'},
 {name:'Làng Sen · Kim Liên',lat:18.671430,lon:105.558720,hidden:true,bend:-6},
 {name:'Ninh Bình',lat:20.255694,lon:105.915611,bend:-7,note:'Hoa Lư - Tuyệt Tình Cốc - Tràng An - Hang Múa'},
 {name:'Cố đô Hoa Lư',lat:20.2840,lon:105.9070,hidden:true,bend:-4},
 {name:'Tuyệt Tình Cốc',lat:20.3000,lon:105.9000,hidden:true,bend:4},
 {name:'Tràng An',lat:20.255694,lon:105.915611,hidden:true,bend:-5},
 {name:'Hang Múa',lat:20.2290,lon:105.9360,hidden:true,bend:-4},
 {name:'Hà Nội',lat:21.024167,lon:105.857778,finish:true,bend:-10,offset:{x:10,y:8},note:'Kết thúc hành trình 38 ngày - 37 đêm'}
];

// 38 marker = 38 ngày của chương trình.
// PDF bị lặp "NGÀY 09" cho chặng Măng Đen -> Kon Tum -> Pleiku và không có tiêu đề NGÀY 08.
// Để bản đồ đủ 38 ngày theo đúng thứ tự chương trình, chặng đó được hiển thị là Ngày 08.
const DAYS=[
 {num:1,anchor:'Quảng Bình · Nhật Lệ',label:'Vũng Chùa Đảo Yến - Nhật Lệ'},
 {num:2,anchor:'Huế',label:'Động Phong Nha - Quảng Trị - Huế'},
 {num:3,anchor:'Đà Nẵng',occ:0,label:'Huế - Bà Nà Hills - Đà Nẵng'},
 {num:4,anchor:'Quy Nhơn',occ:0,label:'Đà Nẵng - Rừng Dừa 7 Mẫu - Quy Nhơn'},
 {num:5,anchor:'Quy Nhơn',occ:0,dx:14,dy:13,label:'Kỳ Co - Eo Gió - Thiền Viện Thiên Hưng'},
 {num:6,anchor:'Pleiku',occ:0,label:'Bảo tàng Quang Trung - Pleiku'},
 {num:7,anchor:'Măng Đen',label:'Pleiku - Cửa khẩu Bờ Y - Măng Đen'},
 {num:8,anchor:'Pleiku',occ:1,label:'Măng Đen - Kon Tum - Biển Hồ - Pleiku'},
 {num:9,anchor:'Buôn Ma Thuột',occ:0,label:'Pleiku - Buôn Ma Thuột'},
 {num:10,anchor:'Buôn Đôn',label:'Buôn Ma Thuột - Thác Dray Sap - Buôn Đôn'},
 {num:11,anchor:'Tà Đùng',label:'Buôn Ma Thuột - Khu du lịch Tà Đùng'},
 {num:12,anchor:'Đà Lạt',label:'Tà Đùng - Đà Lạt'},
 {num:13,anchor:'Đà Lạt',dx:12,dy:10,label:'Tham quan TP. Đà Lạt'},
 {num:14,anchor:'TP.HCM',occ:0,label:'Đà Lạt - TP.HCM'},
 {num:15,anchor:'Cần Thơ',label:'TP.HCM - Tiền Giang - Bến Tre - Cần Thơ'},
 {num:16,anchor:'Năm Căn',label:'Cần Thơ - Sóc Trăng - Bạc Liêu - Đất Mũi - Năm Căn'},
 {num:17,anchor:'Hà Tiên',label:'Năm Căn - U Minh Thượng - Rạch Giá - Hà Tiên'},
 {num:18,anchor:'Châu Đốc',label:'Hà Tiên - Núi Cấm - Trà Sư - Tịnh Biên - Châu Đốc'},
 {num:19,anchor:'Đồng Tháp · Sa Đéc',label:'Châu Đốc - Làng Chăm - Nguyễn Sinh Sắc - Sa Đéc'},
 {num:20,anchor:'TP.HCM',occ:1,label:'Làng hoa Sa Đéc - TP.HCM'},
 {num:21,anchor:'TP.HCM',occ:1,dx:0,dy:14,label:'Tham quan TP.HCM'},
 {num:22,anchor:'Tây Ninh',label:'TP.HCM - Núi Bà Đen - Địa đạo Củ Chi'},
 {num:23,anchor:'Vũng Tàu',label:'TP.HCM - Vũng Tàu'},
 {num:24,anchor:'Mũi Né',label:'Vũng Tàu - Phan Thiết - Mũi Né'},
 {num:25,anchor:'Ninh Chữ',label:'Mũi Né - Đồi Cát Bay - Bàu Sen - Ninh Chữ'},
 {num:26,anchor:'Vịnh Vĩnh Hy',label:'Ninh Chữ - Vườn nho - Vịnh Vĩnh Hy'},
 {num:27,anchor:'Nha Trang',label:'Vĩnh Hy - Nha Trang - VinWonder'},
 {num:28,anchor:'Nha Trang',dx:12,dy:10,label:'Nha Trang - Suối Hoa Lan - Vịnh Nha Phu'},
 {num:29,anchor:'Phú Yên · Tuy Hòa',label:'Nha Trang - Dốc Lết - Vũng Rô - Phú Yên'},
 {num:30,anchor:'Quy Nhơn',occ:1,label:'Gành Xếp - Mằng Lăng - Gành Đá Đĩa - Quy Nhơn'},
 {num:31,anchor:'Đảo Lý Sơn',label:'Quy Nhơn - Quảng Ngãi - Đảo Lý Sơn'},
 {num:32,anchor:'Hội An',label:'Lý Sơn - Quảng Ngãi - Tượng đài Mẹ Thứ - Hội An'},
 {num:33,anchor:'Đà Nẵng',occ:1,label:'Hội An - Cù Lao Chàm - Đà Nẵng'},
 {num:34,anchor:'Biển Lăng Cô',label:'Đà Nẵng - Núi Thần Tài/Bà Nà - Lăng Cô'},
 {num:35,anchor:'Đồng Hới · Bảo Ninh',label:'Lăng Cô - Khải Định - Trường Sơn - Đồng Hới'},
 {num:36,anchor:'Cửa Lò',label:'Đồng Hới - Động Thiên Đường - Ngã Ba Đồng Lộc - Cửa Lò'},
 {num:37,anchor:'Ninh Bình',label:'Cửa Lò - Làng Sen - Quê Bác - Ninh Bình'},
 {num:38,anchor:'Hà Nội',occ:1,finish:true,label:'Tràng An - Hang Múa - Hà Nội'}
];

const svg=document.getElementById('mapSvg'),viewport=document.getElementById('viewport');
if(!svg||!viewport)return;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,String(v)));return n};
function project(lon,lat){return{x:PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,y:PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h}}
const BASE=ROUTE.map(p=>project(p.lon,p.lat));
let layer=null,data=null,selected=-1,selectedPoint=-1,selectedDay=0,drag=null;

function routeIndex(name,occ=0){let seen=0;for(let i=0;i<ROUTE.length;i++){if(ROUTE[i].name===name){if(seen===occ)return i;seen++}}return-1}
function dayRouteIndex(d){return routeIndex(d.anchor,Number(d.occ)||0)}
function off(i){return ROUTE[i]?.offset||{x:0,y:0}}
function dayOff(d,i){const b=off(i);return{x:b.x+(Number(d.dx)||0),y:b.y+(Number(d.dy)||0)}}
function defaults(){return{version:9,points:BASE.map(p=>({...p})),bends:ROUTE.slice(0,-1).map((_,i)=>Number(ROUTE[i+1]?.bend)||0),color:'#d71945',seaColor:'#1677d2',width:2.5,show:true,showNumbers:true,showArrows:true}}
function load(){const fresh=defaults();try{const d=JSON.parse(localStorage.getItem(STORE)||'null');if(d&&d.version===9&&Array.isArray(d.points)&&d.points.length===ROUTE.length){data={...fresh,...d};data.points=d.points.map((p,i)=>({x:Number(p?.x)||fresh.points[i].x,y:Number(p?.y)||fresh.points[i].y}));data.bends=ROUTE.slice(0,-1).map((_,i)=>Number(d.bends?.[i])||0);return}}catch{}data=fresh}
function save(){try{localStorage.setItem(STORE,JSON.stringify(data))}catch{}}
function controlPoint(s,e,b){const dx=e.x-s.x,dy=e.y-s.y,len=Math.hypot(dx,dy)||1;return{x:(s.x+e.x)/2-dy/len*b,y:(s.y+e.y)/2+dx/len*b}}
function addTitle(n,text){const t=el('title');t.textContent=text;n.appendChild(t)}
function ensureDefs(){let d=svg.querySelector('#tourStandard38Defs');if(d)return d;d=el('defs',{id:'tourStandard38Defs'});const add=(id,color)=>{const m=el('marker',{id,viewBox:'0 0 10 10',refX:8.2,refY:5,markerWidth:4.5,markerHeight:4.5,orient:'auto',markerUnits:'strokeWidth'});m.appendChild(el('path',{d:'M0 0 L10 5 L0 10 Z',fill:color}));d.appendChild(m)};add('tourStandard38Arrow',data?.color||'#d71945');add('tourStandard38SeaArrow',data?.seaColor||'#1677d2');svg.insertBefore(d,svg.firstChild);return d}
function refreshDefs(){const d=svg.querySelector('#tourStandard38Defs');if(d)d.remove();ensureDefs()}
function isSea(i){return ROUTE[i+1]?.mode==='sea'}
function shouldArrow(i){if(!data.showArrows)return false;if(isSea(i))return true;const a=ROUTE[i],b=ROUTE[i+1];return(!a.hidden&&!b.hidden)||(i%5===2)||i===ROUTE.length-2}

function addStartMarker(g,active){g.appendChild(el('circle',{r:active?8.9:7.8,fill:'#fff','fill-opacity':'.98',stroke:'#f4b400','stroke-width':active?2.7:1.9,'vector-effect':'non-scaling-stroke'}));const star=el('text',{x:0,y:3.2,'text-anchor':'middle','font-family':'Arial,sans-serif','font-size':11,'font-weight':900,fill:'#f4b400','pointer-events':'none'});star.textContent='★';g.appendChild(star)}
function addDayMarker(g,d,active){const finish=!!d.finish;g.appendChild(el('circle',{r:active?8.9:7.8,fill:'#fff','fill-opacity':'.98',stroke:finish?'#16803a':data.color,'stroke-width':active?2.7:1.9,'vector-effect':'non-scaling-stroke'}));if(data.showNumbers){const t=el('text',{x:0,y:2.25,'text-anchor':'middle','font-family':'Roboto,Arial,sans-serif','font-size':d.num>=10?5.6:6.5,'font-weight':900,fill:finish?'#16803a':data.color,'pointer-events':'none'});t.textContent=String(d.num);g.appendChild(t)}else g.appendChild(el('circle',{r:2.5,fill:finish?'#16803a':data.color,'pointer-events':'none'}));if(finish){const check=el('text',{x:8.4,y:-6.4,'text-anchor':'middle','font-family':'Arial,sans-serif','font-size':8.4,'font-weight':900,fill:'#16803a','pointer-events':'none'});check.textContent='✓';g.appendChild(check)}}

function render(){
 if(!layer)return;layer.innerHTML='';if(!data.show)return;ensureDefs();
 const segs=el('g',{id:'tourStandard38Segments'}),marks=el('g',{id:'tourStandard38Markers'});
 for(let i=0;i<data.points.length-1;i++){
  const s=data.points[i],e=data.points[i+1],c=controlPoint(s,e,data.bends[i]||0),sea=isSea(i),stroke=sea?data.seaColor:data.color;
  const p=el('path',{d:`M${s.x},${s.y} Q${c.x},${c.y} ${e.x},${e.y}`,fill:'none',stroke,'stroke-width':selected===i?Number(data.width)+1.05:data.width,'stroke-linecap':'round','stroke-linejoin':'round','vector-effect':'non-scaling-stroke',opacity:selected===i?'1':'.92',cursor:'pointer','data-tour-segment':i});
  if(sea)p.setAttribute('stroke-dasharray','7 5');if(shouldArrow(i))p.setAttribute('marker-end',sea?'url(#tourStandard38SeaArrow)':'url(#tourStandard38Arrow)');
  addTitle(p,`${ROUTE[i].name} → ${ROUTE[i+1].name}${sea?' · tàu/cano':''}`);
  p.addEventListener('click',ev=>{ev.stopPropagation();selected=i;syncSegment();render()});segs.appendChild(p)
 }
 const startIdx=ROUTE.findIndex(r=>r.start);
 if(startIdx>=0){const p=data.points[startIdx],o=off(startIdx),g=el('g',{transform:`translate(${p.x+o.x} ${p.y+o.y})`,'data-tour-point':startIdx,'data-day-number':0,cursor:'grab'});addStartMarker(g,selectedDay===0&&selectedPoint===startIdx);addTitle(g,'★ Hà Nội · Điểm khởi hành');g.addEventListener('pointerdown',startPointDrag);g.addEventListener('click',ev=>{ev.stopPropagation();selectedPoint=startIdx;selectedDay=0;syncPoint();render()});marks.appendChild(g)}
 DAYS.forEach(d=>{const idx=dayRouteIndex(d);if(idx<0)return;const p=data.points[idx],o=dayOff(d,idx),g=el('g',{transform:`translate(${p.x+o.x} ${p.y+o.y})`,'data-tour-point':idx,'data-day-number':d.num,cursor:'grab'});addDayMarker(g,d,selectedDay===d.num);addTitle(g,`${d.finish?'✓ ':''}Ngày ${String(d.num).padStart(2,'0')}: ${d.label}`);g.addEventListener('pointerdown',startPointDrag);g.addEventListener('click',ev=>{ev.stopPropagation();selectedPoint=idx;selectedDay=d.num;syncPoint();render()});marks.appendChild(g)});
 layer.append(segs,marks)
}
function localPoint(ev){const p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;const m=layer.getScreenCTM();if(!m)return[0,0];const q=p.matrixTransform(m.inverse());return[q.x,q.y]}
function selectedMarkerOffset(){if(selectedDay>0){const d=DAYS.find(x=>x.num===selectedDay);if(d&&selectedPoint>=0)return dayOff(d,selectedPoint)}return off(selectedPoint)}
function startPointDrag(ev){ev.preventDefault();ev.stopPropagation();const idx=Number(ev.currentTarget.dataset.tourPoint),day=Number(ev.currentTarget.dataset.dayNumber||0),p=localPoint(ev),q=data.points[idx];selectedPoint=idx;selectedDay=day;syncPoint();const o=day>0?dayOff(DAYS.find(x=>x.num===day)||{},idx):off(idx);drag={idx,dx:p[0]-(q.x+o.x),dy:p[1]-(q.y+o.y),ox:o.x,oy:o.y};window.addEventListener('pointermove',movePoint,true);window.addEventListener('pointerup',endPoint,true);window.addEventListener('pointercancel',endPoint,true)}
function movePoint(ev){if(!drag)return;ev.preventDefault();ev.stopPropagation();const p=localPoint(ev),q=data.points[drag.idx];q.x=p[0]-drag.dx-drag.ox;q.y=p[1]-drag.dy-drag.oy;render()}
function endPoint(ev){if(!drag)return;ev.preventDefault();ev.stopPropagation();drag=null;window.removeEventListener('pointermove',movePoint,true);window.removeEventListener('pointerup',endPoint,true);window.removeEventListener('pointercancel',endPoint,true);save();syncPoint()}
function syncSegment(){const info=$('tourSelected');if(!info)return;if(selected<0){info.textContent='Chưa chọn chặng';$('tourBend').disabled=true;$('tourBendNumber').disabled=true;return}info.textContent=`${ROUTE[selected].name} → ${ROUTE[selected+1].name}${isSea(selected)?' · tàu/cano':''}`;$('tourBend').disabled=false;$('tourBendNumber').disabled=false;$('tourBend').value=data.bends[selected]||0;$('tourBendNumber').value=data.bends[selected]||0}
function setBend(v){if(selected<0)return;v=clamp(Number(v)||0,-100,100);data.bends[selected]=v;$('tourBend').value=v;$('tourBendNumber').value=v;render();save()}
function syncPoint(){const n=$('tourPointSelected'),btn=$('tourFixSelected');if(!n)return;if(selectedPoint<0){n.textContent='Chọn một marker để xem điểm tuyến.';if(btn)btn.disabled=true;return}const r=ROUTE[selectedPoint],p=data.points[selectedPoint];if(selectedDay>0){const d=DAYS.find(x=>x.num===selectedDay);const head=d?.finish?`✓ Ngày ${String(selectedDay).padStart(2,'0')} · kết thúc`:`Ngày ${String(selectedDay).padStart(2,'0')}`;n.innerHTML=`<b>${head}: ${d?.label||r.name}</b><br>Điểm đại diện: ${r.name}<br>GPS đại diện: ${r.lat.toFixed(6)}, ${r.lon.toFixed(6)}<br>SVG: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}`}else n.innerHTML=`<b>★ Điểm khởi hành: Hà Nội</b><br>GPS đại diện: ${r.lat.toFixed(6)}, ${r.lon.toFixed(6)}<br>SVG: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}`;if(btn)btn.disabled=false}
function fixPoint(i){if(!ROUTE[i]||!data?.points?.[i])return;data.points[i]={...BASE[i]};save();render();syncPoint()}
function fixAll(){const d=defaults();data.points=d.points;data.bends=d.bends;save();render();syncSegment();syncPoint()}
function injectUI(){const controls=document.querySelector('.controls');if(!controls||$('tourRouteGroup'))return;const g=document.createElement('div');g.className='group';g.id='tourRouteGroup';g.innerHTML=`<div class="group-title">Cung đường Xuyên Việt — đủ 38 ngày</div><label class="check"><input id="showTourRoute" type="checkbox" checked> Hiện cung đường</label><label class="check"><input id="showTourNumbers" type="checkbox" checked> Hiện số ngày 01–38</label><label class="check"><input id="showTourArrows" type="checkbox" checked> Hiện mũi tên</label><div class="row"><div><label>Màu đường bộ</label><input id="tourColor" type="color" value="#d71945"></div><div><label>Màu đường biển</label><input id="tourSeaColor" type="color" value="#1677d2"></div></div><label>Độ dày tuyến</label><input id="tourWidth" type="number" min="0.8" max="8" step="0.2" value="2.5"><div id="tourSelected" class="mode-note" style="margin-top:8px">Chưa chọn chặng</div><label style="margin-top:8px">Độ cong chặng đang chọn</label><div class="value-line"><input id="tourBend" type="range" min="-100" max="100" step="1" value="0" disabled><input id="tourBendNumber" type="number" min="-100" max="100" step="1" value="0" disabled></div><div class="row"><button id="tourStraight" class="btn">Làm thẳng chặng</button><button id="tourReset" class="btn">Khôi phục tuyến</button></div><div id="tourPointSelected" class="mode-note" style="margin-top:8px">Chọn một marker để xem ngày.</div><div class="row"><button id="tourFixAll" class="btn primary">Sửa đúng toàn bộ tuyến</button><button id="tourFixSelected" class="btn" disabled>Sửa điểm đang chọn</button></div><div class="tip"><b>★ Hà Nội</b> là điểm khởi hành không số. <b>01 Quảng Bình</b> là Ngày 01 và <b>38 Hà Nội ✓</b> là Ngày 38. Các ngày tham quan cùng một thành phố vẫn có marker riêng để đủ 38 ngày. <b style="color:#d71945">Đỏ liền</b> là đường bộ, <b style="color:#1677d2">xanh nét đứt</b> là tàu/cano ra Lý Sơn hoặc Cù Lao Chàm.</div>`;const displayGroup=[...controls.children].find(x=>x.querySelector?.('.group-title')?.textContent.includes('Hiển thị'));if(displayGroup)controls.insertBefore(g,displayGroup);else controls.appendChild(g);$('showTourRoute').checked=data.show;$('showTourNumbers').checked=data.showNumbers;$('showTourArrows').checked=data.showArrows;$('tourColor').value=data.color;$('tourSeaColor').value=data.seaColor;$('tourWidth').value=data.width;$('showTourRoute').addEventListener('change',e=>{data.show=e.target.checked;render();save()});$('showTourNumbers').addEventListener('change',e=>{data.showNumbers=e.target.checked;render();save()});$('showTourArrows').addEventListener('change',e=>{data.showArrows=e.target.checked;render();save()});$('tourColor').addEventListener('input',e=>{data.color=e.target.value;refreshDefs();render();save()});$('tourSeaColor').addEventListener('input',e=>{data.seaColor=e.target.value;refreshDefs();render();save()});$('tourWidth').addEventListener('input',e=>{data.width=clamp(Number(e.target.value)||2.5,.8,8);render();save()});$('tourBend').addEventListener('input',e=>setBend(e.target.value));$('tourBendNumber').addEventListener('input',e=>setBend(e.target.value));$('tourStraight').addEventListener('click',()=>{if(selected>=0)setBend(0)});$('tourFixAll').addEventListener('click',()=>fixAll());$('tourFixSelected').addEventListener('click',()=>{if(selectedPoint>=0)fixPoint(selectedPoint)});$('tourReset').addEventListener('click',()=>{if(!confirm('Khôi phục toàn bộ cung đường chuẩn 38 ngày - 37 đêm về mặc định?'))return;data=defaults();selected=-1;selectedPoint=-1;selectedDay=0;save();refreshDefs();syncSegment();syncPoint();$('showTourRoute').checked=data.show;$('showTourNumbers').checked=data.showNumbers;$('showTourArrows').checked=data.showArrows;$('tourColor').value=data.color;$('tourSeaColor').value=data.seaColor;$('tourWidth').value=data.width;render()});syncSegment();syncPoint()}
function initLayer(){if(layer)return;layer=el('g',{id:'tourStandard38Layer'});const labelLayer=document.getElementById('labelLayer');if(labelLayer)viewport.insertBefore(layer,labelLayer);else viewport.appendChild(layer)}
function init(){load();initLayer();injectUI();render()}
init();
})();