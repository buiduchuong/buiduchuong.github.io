(()=>{
'use strict';
if(window.__VN_ARCHIPELAGO_LABELS)return;
window.__VN_ARCHIPELAGO_LABELS=true;

const NS='http://www.w3.org/2000/svg';
const svg=document.getElementById('mapSvg');
const viewport=document.getElementById('viewport');
if(!svg||!viewport)return;

const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};
const project=(lon,lat)=>({
  x:PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,
  y:PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h
});
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));return n};

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
