(()=>{
'use strict';
if(window.__VN_ARCHIPELAGO_LABELS)return;
window.__VN_ARCHIPELAGO_LABELS=true;

const NS='http://www.w3.org/2000/svg';
const svg=document.getElementById('mapSvg');
const viewport=document.getElementById('viewport');
if(!svg||!viewport)return;

// Nền đất trắng + biển xanh sạch, không dùng tông vàng/cam.
const paperStops=svg.querySelectorAll('#paper stop');
paperStops.forEach(stop=>{
  stop.setAttribute('stop-color','#ffffff');
  stop.setAttribute('stop-opacity','1');
});
const seaStops=svg.querySelectorAll('#sea stop');
if(seaStops[0]){
  seaStops[0].setAttribute('stop-color','#dff5ff');
  seaStops[0].setAttribute('stop-opacity','1');
}
if(seaStops[1]){
  seaStops[1].setAttribute('stop-color','#8fcff0');
  seaStops[1].setAttribute('stop-opacity','1');
}
const canvas=document.getElementById('canvas');
if(canvas)canvas.style.background='#ffffff';

// Làm nét tỉnh/thành và đường biên mượt hơn khi phóng lớn hoặc xuất 4K/8K/PDF.
if(!document.getElementById('map-polish-style')){
  const style=document.createElement('style');
  style.id='map-polish-style';
  style.textContent=`
    #mapSvg .province{stroke-width:1.14px!important;shape-rendering:geometricPrecision;stroke-linecap:round;stroke-linejoin:round}
    #mapSvg .province.active{stroke-width:2.35px!important}
    #neighborCountryOutlineLayer .neighbor-admin-region{shape-rendering:geometricPrecision}
    #regionalNationalBorderLayer .regional-country-border{shape-rendering:geometricPrecision}
    #regionalLandLayer .regional-country-land{shape-rendering:geometricPrecision}
  `;
  document.head.appendChild(style);
}

const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};
const project=(lon,lat)=>({
  x:PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,
  y:PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h
});
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));return n};

function getRegionalBox(){
  const vb=String(window.__VN_REGIONAL_CONTEXT?.viewBox||'').trim().split(/[ ,]+/).map(Number);
  if(vb.length===4&&vb.every(Number.isFinite))return{x:vb[0],y:vb[1],w:vb[2],h:vb[3]};
  return{x:-610,y:-400,w:3210,h:2560};
}

function setupSeaBackground(){
  const box=getRegionalBox();
  const rootRects=[...svg.children].filter(n=>n.tagName?.toLowerCase()==='rect');
  const background=rootRects[0];
  if(background){
    background.setAttribute('x',String(box.x));
    background.setAttribute('y',String(box.y));
    background.setAttribute('width',String(box.w));
    background.setAttribute('height',String(box.h));
    background.setAttribute('fill','url(#sea)');
    background.setAttribute('data-regional-sea','1');
    background.setAttribute('pointer-events','none');
  }
  // Dải biển chữ nhật cũ không còn cần thiết.
  rootRects.slice(1).forEach(rect=>{
    if(rect.getAttribute('x')==='1010'||rect.getAttribute('width')==='390')rect.setAttribute('fill','none');
  });
}

function drawSeaLabels(){
  let layer=document.getElementById('seaLabelLayer');
  if(!layer){
    layer=el('g',{id:'seaLabelLayer','data-export-layer':'sea-labels','pointer-events':'none'});
    const lineLayer=document.getElementById('lineLayer');
    viewport.insertBefore(layer,lineLayer||null);
  }
  layer.innerHTML='';

  const labels=[
    {text:'VỊNH BẮC BỘ',lon:108.1,lat:19.1,size:18,opacity:.66},
    {text:'BIỂN ĐÔNG',lon:114.6,lat:14.3,size:29,opacity:.50},
    {text:'VỊNH THÁI LAN',lon:103.0,lat:9.2,size:17,opacity:.55},
    {text:'BIỂN ANDAMAN',lon:96.5,lat:10.0,size:18,opacity:.42}
  ];
  labels.forEach(item=>{
    const p=project(item.lon,item.lat);
    const t=el('text',{
      x:p.x,y:p.y,
      'font-family':'Roboto,Arial,sans-serif','font-size':item.size,'font-weight':700,
      fill:'#237fb8',opacity:item.opacity,'text-anchor':'middle','letter-spacing':'1.2'
    });
    t.textContent=item.text;
    layer.appendChild(t);
  });
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

function drawArchipelagos(){
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

    const ring=el('ellipse',{
      cx:center.x,cy:center.y,rx:g.id==='hoang-sa'?47:82,ry:g.id==='hoang-sa'?31:73,
      fill:'none',stroke:'#6d8eaa','stroke-width':1.1,'stroke-dasharray':'5 5',
      'vector-effect':'non-scaling-stroke',opacity:.75
    });
    group.appendChild(ring);

    const label=el('text',{
      x:center.x+g.labelDx,y:center.y+g.labelDy,
      'font-family':'Roboto,Arial,sans-serif','font-size':13,'font-weight':900,
      fill:'#173a57',stroke:'#ffffff','stroke-width':3.8,'paint-order':'stroke fill','stroke-linejoin':'round'
    });
    label.textContent=g.name;
    group.appendChild(label);

    const title=el('title');title.textContent=g.name;group.appendChild(title);
    layer.appendChild(group);
  });
}

function draw(){
  setupSeaBackground();
  drawSeaLabels();
  drawArchipelagos();
}

draw();
window.__VN_ARCHIPELAGOS={
  render:draw,
  names:GROUPS.map(x=>x.name),
  regionalViewBox:()=>window.__VN_REGIONAL_CONTEXT?.viewBox||null
};
})();
