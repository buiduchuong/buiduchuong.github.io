(()=>{
'use strict';
const NS='http://www.w3.org/2000/svg';
const STORE='vn-xuyen-viet-attractions-v1';
const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};

// Các điểm tham quan nổi bật theo chương trình Xuyên Việt.
const ATTRACTIONS=[
 {name:'Mộ Đại tướng Võ Nguyên Giáp · Vũng Chùa - Đảo Yến',short:'Vũng Chùa',lat:17.8860,lon:106.4930},
 {name:'Bãi biển Nhật Lệ',short:'Nhật Lệ',lat:17.4670,lon:106.6230},
 {name:'Động Phong Nha',short:'Phong Nha',lat:17.5890,lon:106.2830},
 {name:'Động Thiên Đường',short:'Thiên Đường',lat:17.5200,lon:106.2240},
 {name:'Thành Cổ Quảng Trị',short:'Thành Cổ',lat:16.7507,lon:107.1886},
 {name:'Chùa Thiên Mụ',short:'Thiên Mụ',lat:16.4536,lon:107.5440},
 {name:'Đại Nội Huế',short:'Đại Nội',lat:16.4700,lon:107.5780},
 {name:'Bà Nà Hills',short:'Bà Nà',lat:15.9950,lon:107.9880},
 {name:'Rừng Dừa Bảy Mẫu',short:'Rừng Dừa',lat:15.8810,lon:108.3620},
 {name:'Kỳ Co',short:'Kỳ Co',lat:13.7880,lon:109.3040},
 {name:'Eo Gió',short:'Eo Gió',lat:13.8740,lon:109.2910},
 {name:'Thiền Viện Thiên Hưng',short:'Thiên Hưng',lat:13.8930,lon:109.0730},
 {name:'Bảo tàng Quang Trung',short:'Quang Trung',lat:13.9480,lon:108.8790},
 {name:'Thác Pa Sỹ · Măng Đen',short:'Pa Sỹ',lat:14.6240,lon:108.3020},
 {name:'Nhà thờ Gỗ Kon Tum',short:'Nhà thờ Gỗ',lat:14.3540,lon:108.0070},
 {name:'Biển Hồ Pleiku',short:'Biển Hồ',lat:13.9820,lon:107.9950},
 {name:'Đất Mũi Cà Mau',short:'Đất Mũi',lat:8.6059,lon:104.7197},
 {name:'Vườn quốc gia U Minh Thượng',short:'U Minh',lat:9.5980,lon:105.0720},
 {name:'Dinh Cậu · Phú Quốc',short:'Dinh Cậu',lat:10.2167,lon:103.9670},
 {name:'Chùa Hộ Quốc · Phú Quốc',short:'Hộ Quốc',lat:10.0030,lon:104.0530},
 {name:'Núi Cấm',short:'Núi Cấm',lat:10.4990,lon:104.9980},
 {name:'Rừng Tràm Trà Sư',short:'Trà Sư',lat:10.5850,lon:105.0600},
 {name:'Vườn quốc gia Tràm Chim',short:'Tràm Chim',lat:10.7240,lon:105.5110},
 {name:'Làng hoa Sa Đéc',short:'Sa Đéc',lat:10.3105,lon:105.7397},
 {name:'Núi Bà Đen',short:'Bà Đen',lat:11.3641,lon:106.1801},
 {name:'Địa đạo Củ Chi',short:'Củ Chi',lat:11.1420,lon:106.4610},
 {name:'Đảo Phú Quý',short:'Phú Quý',lat:10.5300,lon:108.9500},
 {name:'Đồi Cát Bay · Bàu Trắng',short:'Bàu Trắng',lat:11.0710,lon:108.3950},
 {name:'Vịnh Vĩnh Hy',short:'Vĩnh Hy',lat:11.7180,lon:109.1940},
 {name:'VinWonders Nha Trang',short:'VinWonders',lat:12.2050,lon:109.2140},
 {name:'Dốc Lết',short:'Dốc Lết',lat:12.6300,lon:109.2300},
 {name:'Vịnh Vũng Rô',short:'Vũng Rô',lat:12.8510,lon:109.4140},
 {name:'Nhà thờ Mằng Lăng',short:'Mằng Lăng',lat:13.3230,lon:109.2250},
 {name:'Gành Đá Đĩa',short:'Gành Đá Đĩa',lat:13.3570,lon:109.2960},
 {name:'Khu chứng tích Sơn Mỹ',short:'Sơn Mỹ',lat:15.2240,lon:108.8880},
 {name:'Đảo Lý Sơn',short:'Lý Sơn',lat:15.3800,lon:109.1200},
 {name:'Tượng đài Mẹ Thứ',short:'Mẹ Thứ',lat:15.5500,lon:108.5000},
 {name:'Phố cổ Hội An',short:'Hội An',lat:15.8772,lon:108.3292},
 {name:'Cù Lao Chàm',short:'Cù Lao Chàm',lat:15.9500,lon:108.5000},
 {name:'KDL Núi Thần Tài',short:'Núi Thần Tài',lat:15.9430,lon:107.9930},
 {name:'Lăng Khải Định',short:'Khải Định',lat:16.3990,lon:107.5900},
 {name:'Nghĩa trang Liệt sĩ Trường Sơn',short:'Trường Sơn',lat:16.8790,lon:106.9820},
 {name:'Ngã Ba Đồng Lộc',short:'Đồng Lộc',lat:18.4011,lon:105.7397},
 {name:'Làng Sen · Quê Bác',short:'Làng Sen',lat:18.6714,lon:105.5587},
 {name:'Cố đô Hoa Lư',short:'Hoa Lư',lat:20.2840,lon:105.9070},
 {name:'Tràng An',short:'Tràng An',lat:20.2557,lon:105.9156},
 {name:'Hang Múa',short:'Hang Múa',lat:20.2290,lon:105.9360}
];

const svg=document.getElementById('mapSvg');
const viewport=document.getElementById('viewport');
if(!svg||!viewport)return;
const $=id=>document.getElementById(id);
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,String(v)));return n};
const project=(lon,lat)=>({x:PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,y:PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h});

let data=load();
let layer=null;
function defaults(){return{version:1,show:true,showLabels:false,color:'#f59e0b',size:4.2,labelSize:6.2}}
function load(){const d=defaults();try{const s=JSON.parse(localStorage.getItem(STORE)||'null');if(s&&s.version===1)return{...d,...s}}catch{}return d}
function save(){try{localStorage.setItem(STORE,JSON.stringify(data))}catch{}}
function addTitle(node,text){const t=el('title');t.textContent=text;node.appendChild(t)}
function ensureLayer(){
 if(layer)return;
 layer=el('g',{id:'tourAttractionLayer'});
 const labelLayer=document.getElementById('labelLayer');
 if(labelLayer)viewport.insertBefore(layer,labelLayer);else viewport.appendChild(layer);
}
function marker(item,index){
 const p=project(item.lon,item.lat);
 const g=el('g',{transform:`translate(${p.x} ${p.y})`,'data-attraction-index':index,cursor:'default'});
 const r=Number(data.size)||4.2;
 g.appendChild(el('circle',{r:r+1.2,fill:'#ffffff','fill-opacity':'.96',stroke:data.color,'stroke-width':1.5,'vector-effect':'non-scaling-stroke'}));
 g.appendChild(el('circle',{r:r*.55,fill:data.color,'pointer-events':'none'}));
 if(data.showLabels){
   const right=index%2===0;
   const text=item.short;
   const w=Math.max(30,text.length*4.2+10);
   const x=right?r+3:-w-r-3;
   const y=index%3===0?-16:5;
   g.appendChild(el('rect',{x,y,width:w,height:12,rx:3,ry:3,fill:'#ffffff','fill-opacity':'.95',stroke:data.color,'stroke-width':.7,'vector-effect':'non-scaling-stroke','pointer-events':'none'}));
   const tx=el('text',{x:x+w/2,y:y+8.2,'text-anchor':'middle','font-family':'Roboto,Arial,sans-serif','font-size':data.labelSize,'font-weight':700,fill:'#6f4500','pointer-events':'none'});
   tx.textContent=text;g.appendChild(tx);
 }
 addTitle(g,`🏛 Điểm tham quan: ${item.name}`);
 return g;
}
function render(){
 ensureLayer();layer.innerHTML='';
 if(!data.show)return;
 ATTRACTIONS.forEach((item,i)=>layer.appendChild(marker(item,i)));
}
function injectUI(){
 const controls=document.querySelector('.controls');
 if(!controls||$('tourAttractionGroup'))return;
 const g=document.createElement('div');g.className='group';g.id='tourAttractionGroup';
 g.innerHTML=`<div class="group-title">Điểm tham quan Xuyên Việt</div>
 <label class="check"><input id="showTourAttractions" type="checkbox" checked> Hiện điểm tham quan</label>
 <label class="check"><input id="showTourAttractionLabels" type="checkbox"> Hiện tên điểm tham quan</label>
 <div class="row"><div><label>Màu marker</label><input id="tourAttractionColor" type="color" value="#f59e0b"></div><div><label>Kích thước</label><input id="tourAttractionSize" type="number" min="2" max="10" step="0.5" value="4.2"></div></div>
 <div class="tip"><b style="color:#f59e0b">●</b> ${ATTRACTIONS.length} điểm tham quan. Rê chuột vào chấm để xem tên. Có thể bật “Hiện tên điểm tham quan” khi cần xuất bản đồ chi tiết.</div>`;
 const display=[...controls.children].find(x=>x.querySelector?.('.group-title')?.textContent.includes('Hiển thị & lưu'));
 if(display)controls.insertBefore(g,display);else controls.appendChild(g);
 $('showTourAttractions').checked=data.show;
 $('showTourAttractionLabels').checked=data.showLabels;
 $('tourAttractionColor').value=data.color;
 $('tourAttractionSize').value=data.size;
 $('showTourAttractions').addEventListener('change',e=>{data.show=e.target.checked;save();render()});
 $('showTourAttractionLabels').addEventListener('change',e=>{data.showLabels=e.target.checked;save();render()});
 $('tourAttractionColor').addEventListener('input',e=>{data.color=e.target.value;save();render()});
 $('tourAttractionSize').addEventListener('input',e=>{data.size=Math.max(2,Math.min(10,Number(e.target.value)||4.2));save();render()});
}
injectUI();render();
})();