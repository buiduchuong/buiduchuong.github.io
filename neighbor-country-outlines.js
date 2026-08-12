(()=>{
'use strict';
if(window.__VN_NEIGHBOR_COUNTRY_OUTLINES)return;
window.__VN_NEIGHBOR_COUNTRY_OUTLINES=true;

const NS='http://www.w3.org/2000/svg';
const viewport=document.getElementById('viewport');
const mapLayer=document.getElementById('mapLayer');
if(!viewport||!mapLayer)return;

// Cùng phép chiếu đang dùng trong editor.js.
const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};
const SOURCES=[
  {id:'CHN',name:'TRUNG QUỐC',url:'https://raw.githubusercontent.com/johan/world.geo.json/master/countries/CHN.geo.json',label:[105.3,23.38]},
  {id:'LAO',name:'LÀO',url:'https://raw.githubusercontent.com/johan/world.geo.json/master/countries/LAO.geo.json',label:[102.75,18.2]},
  {id:'KHM',name:'CAMPUCHIA',url:'https://raw.githubusercontent.com/johan/world.geo.json/master/countries/KHM.geo.json',label:[103.75,12.25]}
];

const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));return n};
function project([lon,lat]){
  return[
    PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,
    PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h
  ];
}
function ringPath(ring){
  if(!Array.isArray(ring)||ring.length<2)return'';
  return ring.map((p,i)=>{const[x,y]=project(p);return`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`}).join(' ')+' Z';
}
function geometryPath(g){
  if(!g)return'';
  if(g.type==='Polygon')return g.coordinates.map(ringPath).join(' ');
  if(g.type==='MultiPolygon')return g.coordinates.flatMap(poly=>poly.map(ringPath)).join(' ');
  return'';
}
function getGeometry(json){
  if(json?.type==='FeatureCollection')return json.features?.[0]?.geometry||null;
  if(json?.type==='Feature')return json.geometry||null;
  return json?.coordinates?json:null;
}

// Dọn lớp biên giới vẽ tay cũ nếu trình duyệt còn giữ DOM từ bản cache trước.
document.getElementById('internationalBorderLayer')?.remove();

let layer=document.getElementById('neighborCountryOutlineLayer');
if(!layer){
  layer=el('g',{id:'neighborCountryOutlineLayer','data-vn-neighbor-outlines':'1'});
  viewport.insertBefore(layer,mapLayer);
}

function drawCountry(cfg,geometry){
  const d=geometryPath(geometry);if(!d)return false;
  // Chỉ vẽ đường bao quốc gia, tuyệt đối không tô diện tích.
  layer.appendChild(el('path',{
    d,fill:'none',stroke:'#ffffff','stroke-width':'4.1',opacity:'.90',
    'stroke-linecap':'round','stroke-linejoin':'round','vector-effect':'non-scaling-stroke',
    class:'neighbor-country-outline-casing','data-country':cfg.id
  }));
  layer.appendChild(el('path',{
    d,fill:'none',stroke:'#697783','stroke-width':'1.65',opacity:'.92',
    'stroke-linecap':'round','stroke-linejoin':'round','vector-effect':'non-scaling-stroke',
    class:'neighbor-country-outline','data-country':cfg.id
  }));
  const[x,y]=project(cfg.label);
  const t=el('text',{
    x:x.toFixed(2),y:y.toFixed(2),'text-anchor':'middle',
    'font-family':'Roboto,Arial,sans-serif','font-size':'10.5','font-weight':'800',
    fill:'#68747d',stroke:'#fff8ee','stroke-width':'3','paint-order':'stroke fill',
    'letter-spacing':'.8',class:'neighbor-country-name','pointer-events':'none'
  });
  t.textContent=cfg.name;layer.appendChild(t);return true;
}

async function loadOne(cfg){
  const r=await fetch(cfg.url,{mode:'cors',cache:'force-cache'});
  if(!r.ok)throw new Error(`${cfg.name}: HTTP ${r.status}`);
  const json=await r.json(),geometry=getGeometry(json);
  if(!geometry)throw new Error(`${cfg.name}: không có geometry`);
  return drawCountry(cfg,geometry);
}

async function draw(){
  layer.innerHTML='';
  const results=await Promise.allSettled(SOURCES.map(loadOne));
  const failed=results.map((r,i)=>r.status==='rejected'?SOURCES[i].name:null).filter(Boolean);
  if(failed.length)console.warn('Không tải được outline quốc gia:',failed.join(', '));
  return {loaded:SOURCES.length-failed.length,failed};
}

draw().catch(e=>console.warn('Không vẽ được khung quốc gia lân cận',e));
window.__VN_NEIGHBOR_COUNTRY_OUTLINES_API={draw,layer,sources:SOURCES.map(x=>({...x}))};
})();
