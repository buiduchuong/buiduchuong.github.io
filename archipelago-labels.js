(()=>{
'use strict';
if(window.__VN_ARCHIPELAGO_LABELS)return;
window.__VN_ARCHIPELAGO_LABELS=true;

const NS='http://www.w3.org/2000/svg';
const svg=document.getElementById('mapSvg');
const viewport=document.getElementById('viewport');
if(!svg||!viewport)return;

// Palette bản đồ: nền đất trắng + biển xanh, không dùng nền vàng/cam.
const paperStops=svg.querySelectorAll('#paper stop');
paperStops.forEach(stop=>{
  stop.setAttribute('stop-color','#ffffff');
  stop.setAttribute('stop-opacity','1');
});
const seaStops=svg.querySelectorAll('#sea stop');
if(seaStops[0]){
  seaStops[0].setAttribute('stop-color','#d8f3ff');
  seaStops[0].setAttribute('stop-opacity','1');
}
if(seaStops[1]){
  seaStops[1].setAttribute('stop-color','#88cff2');
  seaStops[1].setAttribute('stop-opacity','1');
}
const canvas=document.getElementById('canvas');
if(canvas)canvas.style.background='#ffffff';

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
    const mapLayer=document.getElementById('mapLayer');
    viewport.insertBefore(layer,mapLayer||viewport.firstChild);
  }
  layer.innerHTML='';
  layer.style.pointerEvents='none';

  // Đường bờ biển xấp xỉ từ Quảng Ninh xuống Cà Mau. Phần đất tỉnh nằm phía trên nên
  // đường biển luôn gọn theo bản đồ, đồng thời vẫn giữ các nước lân cận trên nền trắng.
  const eastCoast=[
    [107.85,21.55],[107.20,21.05],[106.75,20.55],[106.25,19.95],[105.80,18.55],
    [106.10,17.95],[106.70,17.25],[107.35,16.70],[108.00,16.10],[108.55,15.45],
    [108.95,14.65],[109.20,13.75],[109.15,12.75],[109.05,11.95],[108.75,11.25],
    [108.25,10.75],[107.55,10.35],[106.95,10.15],[106.35,9.85],[105.85,9.55],
    [105.35,9.20],[104.95,8.80]
  ].map(([lon,lat])=>project(lon,lat));

  const eastPath=`${pathFromPoints(eastCoast)} L 1400 1000 L 1400 0 L 1030 0 Z`;
  layer.appendChild(el('path',{
    d:eastPath,
    fill:'url(#sea)',
    opacity:'0.98'
  }));

  // Vịnh Thái Lan ở phía tây nam.
  const gulfCoast=[
    [104.95,8.80],[104.70,9.15],[104.45,9.65],[104.10,10.05],[103.85,10.40]
  ].map(([lon,lat])=>project(lon,lat));
  const gulfPath=`${pathFromPoints(gulfCoast)} L 350 1000 L ${eastCoast[eastCoast.length-1].x.toFixed(1)} ${eastCoast[eastCoast.length-1].y.toFixed(1)} Z`;
  layer.appendChild(el('path',{
    d:gulfPath,
    fill:'url(#sea)',
    opacity:'0.94'
  }));

  // Nhãn biển nhẹ, giống phong cách bản đồ hành chính tham khảo.
  const gulf=project(107.9,19.25);
  const gulfLabel=el('text',{
    x:gulf.x,y:gulf.y,
    'font-family':'Roboto,Arial,sans-serif','font-size':20,'font-weight':700,
    fill:'#1978b7',opacity:'.72','text-anchor':'middle'
  });
  gulfLabel.textContent='VỊNH BẮC BỘ';
  layer.appendChild(gulfLabel);

  const seaLabel=el('text',{
    x:1165,y:430,
    'font-family':'Roboto,Arial,sans-serif','font-size':23,'font-weight':700,
    fill:'#1978b7',opacity:'.58','text-anchor':'middle'
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
      fill:'none',stroke:'#6d8eaa','stroke-width':1,'stroke-dasharray':'5 5','vector-effect':'non-scaling-stroke',opacity:.78});
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
