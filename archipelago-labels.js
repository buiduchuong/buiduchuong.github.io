(()=>{
'use strict';
if(window.__VN_ARCHIPELAGO_LABELS)return;
window.__VN_ARCHIPELAGO_LABELS=true;

const NS='http://www.w3.org/2000/svg';
const svg=document.getElementById('mapSvg');
const viewport=document.getElementById('viewport');
if(!svg||!viewport)return;

// Palette bản đồ: nền đất trắng + biển xanh, sạch và sáng khi xuất PNG/PDF.
const paperStops=svg.querySelectorAll('#paper stop');
paperStops.forEach(stop=>{
  stop.setAttribute('stop-color','#ffffff');
  stop.setAttribute('stop-opacity','1');
});
const seaStops=svg.querySelectorAll('#sea stop');
if(seaStops[0]){
  seaStops[0].setAttribute('stop-color','#d9f3ff');
  seaStops[0].setAttribute('stop-opacity','1');
}
if(seaStops[1]){
  seaStops[1].setAttribute('stop-color','#8fd3f2');
  seaStops[1].setAttribute('stop-opacity','1');
}
const canvas=document.getElementById('canvas');
if(canvas)canvas.style.background='#ffffff';

// Làm nét bản đồ rõ hơn khi zoom và khi xuất ảnh/PDF.
if(!document.getElementById('map-polish-style')){
  const style=document.createElement('style');
  style.id='map-polish-style';
  style.textContent=`
    #mapSvg .province{stroke-width:1.18px!important;shape-rendering:geometricPrecision;stroke-linecap:round;stroke-linejoin:round}
    #mapSvg .province.active{stroke-width:2.35px!important}
    #neighborCountryOutlineLayer .neighbor-admin-region{stroke-width:1.55px!important;shape-rendering:geometricPrecision}
    #seaBackdropLayer .sea-coastline{fill:none;stroke:#547d92;stroke-width:1.7px;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;shape-rendering:geometricPrecision}
    #seaBackdropLayer .sea-coastline-halo{fill:none;stroke:#ffffff;stroke-width:3.5px;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;opacity:.86}
  `;
  document.head.appendChild(style);
}

// Bỏ dải biển hình chữ nhật cũ để thay bằng vùng biển bám theo bờ biển.
Array.from(svg.children).forEach(node=>{
  if(node.tagName&&node.tagName.toLowerCase()==='rect'&&node.getAttribute('x')==='1010'&&node.getAttribute('width')==='390'){
    node.setAttribute('fill','none');
  }
});

const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};
const project=(lon,lat)=>({
  x:PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,
  y:PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h
});
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));return n};
const pathFromPoints=pts=>pts.map((p,i)=>`${i?'L':'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

function drawSeaBackdrop(){
  let layer=document.getElementById('seaBackdropLayer');
  if(!layer){
    layer=el('g',{id:'seaBackdropLayer','data-export-layer':'sea-background'});
    // Đặt biển phía dưới đường ranh giới nước lân cận để đường biên luôn nổi rõ.
    const neighbor=document.getElementById('neighborCountryOutlineLayer');
    const mapLayer=document.getElementById('mapLayer');
    viewport.insertBefore(layer,neighbor||mapLayer||viewport.firstChild);
  }
  layer.innerHTML='';
  layer.style.pointerEvents='none';

  // Đường bờ biển xấp xỉ từ Quảng Ninh xuống Cà Mau, thêm nhiều điểm để nét mềm hơn.
  const eastCoast=[
    [107.85,21.55],[107.55,21.35],[107.28,21.12],[107.05,20.88],[106.82,20.65],
    [106.58,20.30],[106.34,19.98],[106.08,19.55],[105.88,19.05],[105.80,18.55],
    [105.92,18.20],[106.12,17.88],[106.36,17.55],[106.66,17.27],[107.00,16.98],
    [107.35,16.70],[107.70,16.42],[108.00,16.10],[108.28,15.78],[108.55,15.45],
    [108.78,15.05],[108.95,14.65],[109.08,14.20],[109.18,13.75],[109.20,13.25],
    [109.15,12.75],[109.10,12.35],[109.05,11.95],[108.92,11.58],[108.75,11.25],
    [108.52,11.00],[108.25,10.75],[107.92,10.55],[107.55,10.35],[107.25,10.24],
    [106.95,10.15],[106.65,10.02],[106.35,9.85],[106.10,9.70],[105.85,9.55],
    [105.58,9.38],[105.35,9.20],[105.15,9.00],[104.95,8.80]
  ].map(([lon,lat])=>project(lon,lat));

  const first=eastCoast[0];
  const last=eastCoast[eastCoast.length-1];

  // Không dùng đường chéo lớn nữa: nối ngang ra mép phải và đi xuống đáy canvas.
  const eastPath=`${pathFromPoints(eastCoast)} L ${last.x.toFixed(1)} 1000 L 1400 1000 L 1400 ${first.y.toFixed(1)} Z`;
  layer.appendChild(el('path',{
    d:eastPath,
    fill:'url(#sea)',
    opacity:'0.985',
    class:'sea-fill sea-east'
  }));

  // Vịnh Thái Lan phía tây nam, cũng dùng cạnh ngang/dọc để tránh tam giác cắt chéo.
  const gulfCoast=[
    [104.95,8.80],[104.82,8.98],[104.70,9.15],[104.55,9.38],[104.45,9.65],
    [104.28,9.82],[104.10,10.05],[103.98,10.24],[103.85,10.40]
  ].map(([lon,lat])=>project(lon,lat));
  const gulfFirst=gulfCoast[0],gulfLast=gulfCoast[gulfCoast.length-1];
  const gulfPath=`${pathFromPoints(gulfCoast)} L 350 ${gulfLast.y.toFixed(1)} L 350 1000 L ${gulfFirst.x.toFixed(1)} 1000 Z`;
  layer.appendChild(el('path',{
    d:gulfPath,
    fill:'url(#sea)',
    opacity:'0.97',
    class:'sea-fill sea-gulf'
  }));

  // Viền trắng mảnh bên dưới + viền xanh xám bên trên giúp bờ biển tách rõ khỏi đất liền.
  const eastD=pathFromPoints(eastCoast);
  layer.appendChild(el('path',{d:eastD,class:'sea-coastline-halo'}));
  layer.appendChild(el('path',{d:eastD,class:'sea-coastline'}));
  const gulfD=pathFromPoints(gulfCoast);
  layer.appendChild(el('path',{d:gulfD,class:'sea-coastline-halo'}));
  layer.appendChild(el('path',{d:gulfD,class:'sea-coastline'}));

  // Nhãn biển nhẹ, giống phong cách bản đồ hành chính tham khảo.
  const gulf=project(107.9,19.25);
  const gulfLabel=el('text',{
    x:gulf.x,y:gulf.y,
    'font-family':'Roboto,Arial,sans-serif','font-size':20,'font-weight':700,
    fill:'#1978b7',opacity:'.68','text-anchor':'middle'
  });
  gulfLabel.textContent='VỊNH BẮC BỘ';
  layer.appendChild(gulfLabel);

  const seaLabel=el('text',{
    x:1165,y:430,
    'font-family':'Roboto,Arial,sans-serif','font-size':23,'font-weight':700,
    fill:'#1978b7',opacity:'.52','text-anchor':'middle'
  });
  seaLabel.textContent='BIỂN ĐÔNG';
  layer.appendChild(seaLabel);
}

const GROUPS=[
  {
    id:'hoang-sa',name:'Quần đảo Hoàng Sa',lon:112.00,lat:16.50,
    labelDx:18,labelDy:-10,
    points:[[111.45,16.55],[111.70,16.38],[111.90,16.70],[112.08,16.40],[112.28,16.62],[112.45,16.30],[111.82,16.12]]
  },
  {
    id:'truong-sa',name:'Quần đảo Trường Sa',lon:114.00,lat:10.50,
    labelDx:-128,labelDy:-20,
    points:[[112.90,11.20],[113.30,10.92],[113.72,10.70],[114.05,10.45],[114.42,10.15],[114.80,9.90],[115.18,9.62],[113.90,9.38]]
  }
];

function draw(){
  drawSeaBackdrop();

  let layer=document.getElementById('archipelagoLayer');
  if(!layer){
    layer=el('g',{id:'archipelagoLayer','data-export-layer':'archipelagos'});
    const handle=document.getElementById('handleLayer');
    viewport.insertBefore(layer,handle||null);
  }
  layer.innerHTML='';
  layer.style.pointerEvents='none';

  GROUPS.forEach(g=>{
    const group=el('g',{'data-archipelago':g.id});
    const center=project(g.lon,g.lat);

    g.points.forEach(([lon,lat],i)=>{
      const p=project(lon,lat);
      const dot=el(i%3===0?'rect':'circle',i%3===0?{
        x:p.x-3,y:p.y-2,width:6,height:4,rx:1.2,
        fill:'#f4c65f',stroke:'#7a5b25','stroke-width':1.1,'vector-effect':'non-scaling-stroke'
      }:{
        cx:p.x,cy:p.y,r:2.8,fill:'#d9485f',stroke:'#ffffff','stroke-width':1.1,'vector-effect':'non-scaling-stroke'
      });
      group.appendChild(dot);
    });

    const ring=el('ellipse',{cx:center.x,cy:center.y,rx:g.id==='hoang-sa'?47:82,ry:g.id==='hoang-sa'?31:73,
      fill:'none',stroke:'#6d8eaa','stroke-width':1.15,'stroke-dasharray':'5 5','vector-effect':'non-scaling-stroke',opacity:.8});
    group.appendChild(ring);

    const lx=center.x+g.labelDx,ly=center.y+g.labelDy;
    const label=el('text',{x:lx,y:ly,'font-family':'Roboto,Arial,sans-serif','font-size':13,'font-weight':900,
      fill:'#173a57',stroke:'#ffffff','stroke-width':3.8,'paint-order':'stroke fill','stroke-linejoin':'round'});
    label.textContent=g.name;
    group.appendChild(label);

    const title=el('title');title.textContent=g.name;group.appendChild(title);
    layer.appendChild(group);
  });
}

draw();
window.__VN_ARCHIPELAGOS={render:draw,names:GROUPS.map(x=>x.name)};
})();
