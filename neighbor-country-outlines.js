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
// Chỉ giữ các vùng lân cận Việt Nam để giống bản đồ hành chính nền tham khảo.
const DRAW_BOUNDS={minLon:99.2,maxLon:111.4,minLat:7.0,maxLat:25.2};

// geoBoundaries ADM1 simplified: các tỉnh/vùng cấp 1 của nước lân cận.
const SOURCES=[
  {id:'CHN',name:'Trung Quốc',url:'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/CHN/ADM1/geoBoundaries-CHN-ADM1_simplified.geojson'},
  {id:'LAO',name:'Lào',url:'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/LAO/ADM1/geoBoundaries-LAO-ADM1_simplified.geojson'},
  {id:'KHM',name:'Campuchia',url:'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/KHM/ADM1/geoBoundaries-KHM-ADM1_simplified.geojson'}
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
function walkCoords(coords,cb){
  if(!Array.isArray(coords))return;
  if(typeof coords[0]==='number'&&typeof coords[1]==='number'){cb(coords);return;}
  coords.forEach(c=>walkCoords(c,cb));
}
function geometryBBox(g){
  let minLon=Infinity,minLat=Infinity,maxLon=-Infinity,maxLat=-Infinity;
  if(!g?.coordinates)return null;
  walkCoords(g.coordinates,([lon,lat])=>{minLon=Math.min(minLon,lon);maxLon=Math.max(maxLon,lon);minLat=Math.min(minLat,lat);maxLat=Math.max(maxLat,lat)});
  return Number.isFinite(minLon)?{minLon,minLat,maxLon,maxLat}:null;
}
function intersectsView(g){
  const b=geometryBBox(g);if(!b)return false;
  return !(b.maxLon<DRAW_BOUNDS.minLon||b.minLon>DRAW_BOUNDS.maxLon||b.maxLat<DRAW_BOUNDS.minLat||b.minLat>DRAW_BOUNDS.maxLat);
}

// Dọn lớp biên giới vẽ tay cũ nếu trình duyệt còn giữ DOM từ cache trước.
document.getElementById('internationalBorderLayer')?.remove();

let layer=document.getElementById('neighborCountryOutlineLayer');
if(!layer){
  layer=el('g',{id:'neighborCountryOutlineLayer','data-vn-neighbor-outlines':'1','pointer-events':'none'});
  viewport.insertBefore(layer,mapLayer);
}

function drawFeature(countryId,feature,index){
  const g=feature?.geometry;if(!g||!intersectsView(g))return false;
  const d=geometryPath(g);if(!d)return false;
  // Giống ảnh tham khảo: không tô màu, chỉ các đường ranh giới hành chính xám rất nhạt.
  layer.appendChild(el('path',{
    d,fill:'none',stroke:'#aeb6bd','stroke-width':'0.82',opacity:'.58',
    'stroke-linecap':'round','stroke-linejoin':'round','vector-effect':'non-scaling-stroke',
    'shape-rendering':'geometricPrecision',class:'neighbor-admin-region',
    'data-country':countryId,'data-region':String(feature?.properties?.shapeName||feature?.properties?.name||index)
  }));
  return true;
}

async function loadOne(cfg){
  const r=await fetch(cfg.url,{mode:'cors',cache:'force-cache'});
  if(!r.ok)throw new Error(`${cfg.name}: HTTP ${r.status}`);
  const json=await r.json();
  const features=json?.type==='FeatureCollection'?json.features:(json?.type==='Feature'?[json]:[]);
  let drawn=0;features.forEach((f,i)=>{if(drawFeature(cfg.id,f,i))drawn++});
  return drawn;
}

async function draw(){
  layer.innerHTML='';
  const results=await Promise.allSettled(SOURCES.map(loadOne));
  const failed=results.map((r,i)=>r.status==='rejected'?SOURCES[i].name:null).filter(Boolean);
  const drawn=results.reduce((n,r)=>n+(r.status==='fulfilled'?Number(r.value)||0:0),0);
  if(failed.length)console.warn('Không tải được ranh giới vùng lân cận:',failed.join(', '));
  return {drawn,failed};
}

draw().catch(e=>console.warn('Không vẽ được ranh giới hành chính vùng lân cận',e));
window.__VN_NEIGHBOR_COUNTRY_OUTLINES_API={draw,layer,sources:SOURCES.map(x=>({...x}))};
})();
