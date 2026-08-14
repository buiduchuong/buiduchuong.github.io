(()=>{
'use strict';
const NS='http://www.w3.org/2000/svg';
const STORE='vn-xuyen-viet-attractions-standard38-v3';
const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};

// Điểm tham quan theo chương trình chuẩn 38 ngày - 37 đêm.
const ATTRACTIONS=[
 {name:'Mộ Đại tướng Võ Nguyên Giáp · Vũng Chùa - Đảo Yến',short:'Vũng Chùa',lat:17.8860,lon:106.4930},
 {name:'Bãi biển Nhật Lệ',short:'Nhật Lệ',lat:17.4670,lon:106.6230},
 {name:'Động Phong Nha',short:'Phong Nha',lat:17.5890,lon:106.2830},
 {name:'Thành Cổ Quảng Trị',short:'Thành Cổ',lat:16.7507,lon:107.1886},
 {name:'Chùa Thiên Mụ',short:'Thiên Mụ',lat:16.4536,lon:107.5440},
 {name:'Đại Nội Huế',short:'Đại Nội',lat:16.4700,lon:107.5780},
 {name:'Bà Nà Hills · Cầu Vàng',short:'Bà Nà',lat:15.9950,lon:107.9880},
 {name:'Bán đảo Sơn Trà · Linh Ứng',short:'Sơn Trà',lat:16.1190,lon:108.2770},
 {name:'Rừng Dừa Bảy Mẫu',short:'Rừng Dừa',lat:15.8810,lon:108.3620},
 {name:'Kỳ Co',short:'Kỳ Co',lat:13.7880,lon:109.3040},
 {name:'Eo Gió',short:'Eo Gió',lat:13.8740,lon:109.2910},
 {name:'Thiền Viện Thiên Hưng',short:'Thiên Hưng',lat:13.8930,lon:109.0730},
 {name:'Ghềnh Ráng Tiên Sa · Mộ Hàn Mặc Tử',short:'Ghềnh Ráng',lat:13.7420,lon:109.2150},
 {name:'Bảo tàng Quang Trung',short:'Quang Trung',lat:13.9480,lon:108.8790},
 {name:'Cửa khẩu Bờ Y · Ngã ba Đông Dương',short:'Bờ Y',lat:14.7070,lon:107.7290},
 {name:'Đức Mẹ Măng Đen',short:'Đức Mẹ MĐ',lat:14.6030,lon:108.2820},
 {name:'Chùa Khánh Lâm',short:'Khánh Lâm',lat:14.6120,lon:108.2770},
 {name:'Thác Pa Sỹ',short:'Pa Sỹ',lat:14.6240,lon:108.3020},
 {name:'Eban Farm · Hồ Đăk Ke',short:'Đăk Ke',lat:14.6030,lon:108.2910},
 {name:'Nhà thờ Gỗ Kon Tum',short:'Nhà thờ Gỗ',lat:14.3540,lon:108.0070},
 {name:'Cầu treo Kon Klor',short:'Kon Klor',lat:14.3370,lon:108.0280},
 {name:'Biển Hồ Pleiku',short:'Biển Hồ',lat:13.9820,lon:107.9950},
 {name:'Chùa Minh Thành',short:'Minh Thành',lat:13.9720,lon:108.0010},
 {name:'Biệt điện Bảo Đại · Buôn Ma Thuột',short:'Bảo Đại BMT',lat:12.6670,lon:108.0370},
 {name:'Chùa Sắc Tứ Khải Đoan',short:'Khải Đoan',lat:12.6780,lon:108.0440},
 {name:'Khu du lịch KoTam',short:'KoTam',lat:12.6330,lon:108.1080},
 {name:'Bảo tàng Cà phê Buôn Ma Thuột',short:'Bảo tàng Cafe',lat:12.6810,lon:108.0390},
 {name:'Buôn Akodhong',short:'Akodhong',lat:12.6950,lon:108.0470},
 {name:'Thác Dray Sap - Gia Long',short:'Dray Sap',lat:12.5750,lon:107.8900},
 {name:'Buôn Đôn · Cầu treo Sêrêpok',short:'Buôn Đôn',lat:12.9180,lon:107.6690},
 {name:'KDL Tà Đùng Top View',short:'Tà Đùng',lat:11.8350,lon:107.9980},
 {name:'Thiền viện Trúc Lâm · Hồ Tuyền Lâm',short:'Trúc Lâm',lat:11.9030,lon:108.4360},
 {name:'Đường Hầm Đất Sét',short:'Đất Sét',lat:11.8890,lon:108.4280},
 {name:'Fresh Garden Đà Lạt',short:'Fresh Garden',lat:11.9460,lon:108.3970},
 {name:'Nhà thờ Domaine De Marie',short:'Domaine',lat:11.9500,lon:108.4310},
 {name:'Ga Đà Lạt · Quảng trường Lâm Viên',short:'Ga Đà Lạt',lat:11.9410,lon:108.4550},
 {name:'Chùa Linh Phước',short:'Linh Phước',lat:11.9440,lon:108.4940},
 {name:'Chùa Vĩnh Tràng · Mỹ Tho',short:'Vĩnh Tràng',lat:10.3510,lon:106.3420},
 {name:'Cù lao Thới Sơn · Cồn Phụng',short:'Thới Sơn',lat:10.3450,lon:106.3470},
 {name:'Nhà cổ Bình Thủy',short:'Bình Thủy',lat:10.0550,lon:105.7630},
 {name:'KDL Mỹ Khánh',short:'Mỹ Khánh',lat:9.9940,lon:105.7250},
 {name:'Chợ nổi Cái Răng',short:'Cái Răng',lat:10.0010,lon:105.7500},
 {name:'Chùa Som Rong',short:'Som Rong',lat:9.6000,lon:105.9800},
 {name:'Chùa Chén Kiểu',short:'Chén Kiểu',lat:9.5600,lon:105.9120},
 {name:'Nhà Công Tử Bạc Liêu',short:'Công Tử BL',lat:9.2860,lon:105.7240},
 {name:'Đất Mũi Cà Mau',short:'Đất Mũi',lat:8.6059,lon:104.7197},
 {name:'Vườn quốc gia U Minh Thượng',short:'U Minh',lat:9.5980,lon:105.0720},
 {name:'Đình Nguyễn Trung Trực · Rạch Giá',short:'Nguyễn Trung Trực',lat:10.0120,lon:105.0800},
 {name:'Thạch Động · Hà Tiên',short:'Thạch Động',lat:10.4080,lon:104.4690},
 {name:'Phù Dung Cổ Tự',short:'Phù Dung',lat:10.3890,lon:104.4880},
 {name:'Núi Bình San · Lăng Mạc Cửu',short:'Bình San',lat:10.3830,lon:104.4870},
 {name:'Núi Cấm',short:'Núi Cấm',lat:10.4990,lon:104.9980},
 {name:'Rừng Tràm Trà Sư',short:'Trà Sư',lat:10.5850,lon:105.0600},
 {name:'Miếu Bà Chúa Xứ · Núi Sam',short:'Bà Chúa Xứ',lat:10.6820,lon:105.0790},
 {name:'Làng Chăm · Thánh đường Hồi giáo',short:'Làng Chăm',lat:10.7180,lon:105.1260},
 {name:'Lăng cụ Nguyễn Sinh Sắc',short:'Nguyễn Sinh Sắc',lat:10.4630,lon:105.6330},
 {name:'Vườn quốc gia Tràm Chim',short:'Tràm Chim',lat:10.7240,lon:105.5110},
 {name:'Làng hoa Sa Đéc',short:'Sa Đéc',lat:10.3105,lon:105.7397},
 {name:'Bến Nhà Rồng',short:'Bến Nhà Rồng',lat:10.7680,lon:106.7070},
 {name:'Núi Bà Đen',short:'Bà Đen',lat:11.3641,lon:106.1801},
 {name:'Địa đạo Củ Chi',short:'Củ Chi',lat:11.1420,lon:106.4610},
 {name:'Tượng Chúa Kitô · Vũng Tàu',short:'Vũng Tàu',lat:10.3260,lon:107.0840},
 {name:'Đồi Cát Bay · Bàu Sen',short:'Bàu Sen',lat:11.0710,lon:108.3950},
 {name:'Vườn nho Ninh Thuận',short:'Vườn nho',lat:11.7000,lon:109.0700},
 {name:'Vịnh Vĩnh Hy',short:'Vĩnh Hy',lat:11.7180,lon:109.1940},
 {name:'VinWonder Nha Trang',short:'VinWonder',lat:12.2050,lon:109.2140},
 {name:'Suối Hoa Lan · Vịnh Nha Phu',short:'Hoa Lan',lat:12.3700,lon:109.2400},
 {name:'Dốc Lết',short:'Dốc Lết',lat:12.6300,lon:109.2300},
 {name:'Vịnh Vũng Rô',short:'Vũng Rô',lat:12.8510,lon:109.4140},
 {name:'Gành Xếp',short:'Gành Xếp',lat:13.2860,lon:109.2800},
 {name:'Nhà thờ Mằng Lăng',short:'Mằng Lăng',lat:13.3230,lon:109.2250},
 {name:'Gành Đá Đĩa',short:'Gành Đá Đĩa',lat:13.3570,lon:109.2960},
 {name:'Khu chứng tích Sơn Mỹ',short:'Sơn Mỹ',lat:15.2240,lon:108.8880},
 {name:'Đảo Lý Sơn',short:'Lý Sơn',lat:15.3800,lon:109.1200},
 {name:'Tượng đài Mẹ Thứ',short:'Mẹ Thứ',lat:15.5500,lon:108.5000},
 {name:'Phố cổ Hội An',short:'Hội An',lat:15.8772,lon:108.3292},
 {name:'Cù Lao Chàm',short:'Cù Lao Chàm',lat:15.9500,lon:108.5000},
 {name:'KDL Núi Thần Tài',short:'Núi Thần Tài',lat:15.9430,lon:107.9930},
 {name:'Biển Lăng Cô',short:'Lăng Cô',lat:16.2460,lon:108.0790},
 {name:'Lăng Khải Định',short:'Khải Định',lat:16.3990,lon:107.5900},
 {name:'Nghĩa trang Liệt sĩ Trường Sơn',short:'Trường Sơn',lat:16.8790,lon:106.9820},
 {name:'Biển Bảo Ninh',short:'Bảo Ninh',lat:17.4700,lon:106.6420},
 {name:'Tượng đài Mẹ Suốt',short:'Mẹ Suốt',lat:17.4630,lon:106.6220},
 {name:'Động Thiên Đường',short:'Thiên Đường',lat:17.5200,lon:106.2240},
 {name:'Ngã Ba Đồng Lộc',short:'Đồng Lộc',lat:18.4011,lon:105.7397},
 {name:'Bãi biển Cửa Lò',short:'Cửa Lò',lat:18.8100,lon:105.7160},
 {name:'Làng Sen · Quê Bác',short:'Làng Sen',lat:18.6714,lon:105.5587},
 {name:'Cố đô Hoa Lư',short:'Hoa Lư',lat:20.2840,lon:105.9070},
 {name:'Tuyệt Tình Cốc',short:'Tuyệt Tình Cốc',lat:20.3000,lon:105.9000},
 {name:'Tràng An',short:'Tràng An',lat:20.2557,lon:105.9156},
 {name:'Hang Múa',short:'Hang Múa',lat:20.2290,lon:105.9360},
 {name:'Chùa Bái Đính',short:'Bái Đính',lat:20.2760,lon:105.8650}
];

const svg=document.getElementById('mapSvg');
const viewport=document.getElementById('viewport');
if(!svg||!viewport)return;
const $=id=>document.getElementById(id);
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,String(v)));return n};
const project=(lon,lat)=>({x:PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,y:PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h});
let data=load(),layer=null;
function defaults(){return{version:3,show:false,showLabels:false,color:'#f59e0b',size:4.2,labelSize:6.2}}
function load(){const d=defaults();try{const s=JSON.parse(localStorage.getItem(STORE)||'null');if(s&&s.version===3)return{...d,...s}}catch{}return d}
function save(){try{localStorage.setItem(STORE,JSON.stringify(data))}catch{}}
function addTitle(node,text){const t=el('title');t.textContent=text;node.appendChild(t)}
function ensureLayer(){if(layer)return;layer=el('g',{id:'tourAttractionLayer'});const labelLayer=document.getElementById('labelLayer');if(labelLayer)viewport.insertBefore(layer,labelLayer);else viewport.appendChild(layer)}
function marker(item,index){const p=project(item.lon,item.lat),g=el('g',{transform:`translate(${p.x} ${p.y})`,'data-attraction-index':index,cursor:'default'}),r=Number(data.size)||4.2;g.appendChild(el('circle',{r:r+1.2,fill:'#ffffff','fill-opacity':'.96',stroke:data.color,'stroke-width':1.5,'vector-effect':'non-scaling-stroke'}));g.appendChild(el('circle',{r:r*.55,fill:data.color,'pointer-events':'none'}));if(data.showLabels){const right=index%2===0,text=item.short,w=Math.max(30,text.length*4.2+10),x=right?r+3:-w-r-3,y=index%3===0?-16:5;g.appendChild(el('rect',{x,y,width:w,height:12,rx:3,ry:3,fill:'#ffffff','fill-opacity':'.95',stroke:data.color,'stroke-width':.7,'vector-effect':'non-scaling-stroke','pointer-events':'none'}));const tx=el('text',{x:x+w/2,y:y+8.2,'text-anchor':'middle','font-family':'Roboto,Arial,sans-serif','font-size':data.labelSize,'font-weight':700,fill:'#6f4500','pointer-events':'none'});tx.textContent=text;g.appendChild(tx)}addTitle(g,`🏛 Điểm tham quan: ${item.name}`);return g}
function render(){ensureLayer();layer.innerHTML='';if(!data.show)return;ATTRACTIONS.forEach((item,i)=>layer.appendChild(marker(item,i)))}
function syncButtons(){const b=$('toggleAllTourAttractions');if(b)b.textContent=data.show?'Tắt ALL điểm tham quan':'Hiện ALL điểm tham quan'}
function injectUI(){const controls=document.querySelector('.controls');if(!controls||$('tourAttractionGroup'))return;const g=document.createElement('div');g.className='group';g.id='tourAttractionGroup';g.innerHTML=`<div class="group-title">Điểm tham quan Xuyên Việt — chương trình chuẩn</div><button id="toggleAllTourAttractions" class="btn primary" style="width:100%;margin-bottom:8px">Hiện ALL điểm tham quan</button><label class="check"><input id="showTourAttractions" type="checkbox"> Hiện điểm tham quan</label><label class="check"><input id="showTourAttractionLabels" type="checkbox"> Hiện tên điểm tham quan</label><div class="row"><div><label>Màu marker</label><input id="tourAttractionColor" type="color" value="#f59e0b"></div><div><label>Kích thước</label><input id="tourAttractionSize" type="number" min="2" max="10" step="0.5" value="4.2"></div></div><div class="tip"><b style="color:#f59e0b">●</b> ${ATTRACTIONS.length} điểm tham quan theo PDF chuẩn. Mặc định ẩn để bản đồ không rối. Không còn marker Phú Quốc/Phú Quý.</div>`;const display=[...controls.children].find(x=>x.querySelector?.('.group-title')?.textContent.includes('Hiển thị & lưu'));if(display)controls.insertBefore(g,display);else controls.appendChild(g);$('showTourAttractions').checked=data.show;$('showTourAttractionLabels').checked=data.showLabels;$('tourAttractionColor').value=data.color;$('tourAttractionSize').value=data.size;$('toggleAllTourAttractions').addEventListener('click',()=>{data.show=!data.show;if(!data.show)data.showLabels=false;$('showTourAttractions').checked=data.show;$('showTourAttractionLabels').checked=data.showLabels;save();render();syncButtons()});$('showTourAttractions').addEventListener('change',e=>{data.show=e.target.checked;if(!data.show){data.showLabels=false;$('showTourAttractionLabels').checked=false}save();render();syncButtons()});$('showTourAttractionLabels').addEventListener('change',e=>{data.showLabels=e.target.checked;if(data.showLabels){data.show=true;$('showTourAttractions').checked=true}save();render();syncButtons()});$('tourAttractionColor').addEventListener('input',e=>{data.color=e.target.value;save();render()});$('tourAttractionSize').addEventListener('input',e=>{data.size=Math.max(2,Math.min(10,Number(e.target.value)||4.2));save();render()});syncButtons()}
injectUI();render();
})();