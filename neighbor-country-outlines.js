(()=>{
'use strict';
if(window.__VN_NEIGHBOR_COUNTRY_OUTLINES)return;
window.__VN_NEIGHBOR_COUNTRY_OUTLINES=true;

const NS='http://www.w3.org/2000/svg';
const viewport=document.getElementById('viewport');
const mapLayer=document.getElementById('mapLayer');
const lineLayer=document.getElementById('lineLayer');
if(!viewport||!mapLayer)return;

// Giữ nguyên phép chiếu của editor để toàn bộ tỉnh/thành, tuyến và icon không bị lệch.
const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};
const project=([lon,lat])=>[
  PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,
  PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h
];

// Khung Đông Nam Á mở rộng dùng riêng cho xuất PNG/SVG/PDF.
// Vẫn giữ giao diện editor gần Việt Nam; khi xuất sẽ tự mở rộng ra biển + đất liền xung quanh.
const REGION_GEO={minLon:90,maxLon:130,minLat:-12,maxLat:30};
const nw=project([REGION_GEO.minLon,REGION_GEO.maxLat]);
const se=project([REGION_GEO.maxLon,REGION_GEO.minLat]);
const margin=48;
const REGION_VIEWBOX=[
  nw[0]-margin,
  nw[1]-margin,
  (se[0]-nw[0])+margin*2,
  (se[1]-nw[1])+margin*2
];
window.__VN_REGIONAL_CONTEXT={
  geoBounds:{...REGION_GEO},
  viewBox:REGION_VIEWBOX.map(v=>Number(v.toFixed(2))).join(' '),
  source:'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json'
};

// Ranh giới ADM1 chi tiết hiện có trong repo.
const DRAW_BOUNDS={minLon:89.5,maxLon:130.5,minLat:-12.5,maxLat:30.5};
const ADM1_SOURCES=[
  {id:'CHN',name:'Trung Quốc',url:'map-assets/neighbors/CHN-ADM1.geojson'},
  {id:'LAO',name:'Lào',url:'map-assets/neighbors/LAO-ADM1.geojson'},
  {id:'KHM',name:'Campuchia',url:'map-assets/neighbors/KHM-ADM1.geojson'}
];

// Lớp đất liền khu vực lấy từ bộ country GeoJSON công khai trên GitHub.
const REGIONAL_URL='https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
const REGION_COUNTRIES=new Set([
  'VNM','CHN','LAO','KHM','THA','MMR','MYS','SGP','BRN','IDN','PHL','TLS','BGD','IND'
]);

const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));return n};
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

// Dọn các lớp cũ từ cache/phiên trước.
document.getElementById('internationalBorderLayer')?.remove();
document.getElementById('regionalLandLayer')?.remove();
document.getElementById('regionalNationalBorderLayer')?.remove();

const regionalLandLayer=el('g',{id:'regionalLandLayer','data-export-layer':'regional-land','pointer-events':'none'});
viewport.insertBefore(regionalLandLayer,mapLayer);

let adminLayer=document.getElementById('neighborCountryOutlineLayer');
if(!adminLayer){
  adminLayer=el('g',{id:'neighborCountryOutlineLayer','data-vn-neighbor-outlines':'1','pointer-events':'none'});
  viewport.insertBefore(adminLayer,mapLayer);
}

// Biên giới quốc gia đặt TRÊN lớp tỉnh Việt Nam để đường đất liền và đường bờ biển rõ, đẹp hơn.
const nationalBorderLayer=el('g',{id:'regionalNationalBorderLayer','data-export-layer':'national-borders','pointer-events':'none'});
viewport.insertBefore(nationalBorderLayer,lineLayer||null);

function drawRegionalFeature(feature){
  const id=String(feature?.id||'').toUpperCase();
  if(!REGION_COUNTRIES.has(id))return false;
  const g=feature?.geometry;if(!g||!intersectsView(g))return false;
  const d=geometryPath(g);if(!d)return false;

  // Đất liền trắng, nằm trên nền biển xanh.
  regionalLandLayer.appendChild(el('path',{
    d,fill:'#ffffff','fill-rule':'evenodd',stroke:'none',
    class:'regional-country-land','data-country':id
  }));

  // Viền quốc gia rộng hơn để khi xuất 4K/8K/PDF không bị nhạt hoặc đứt nét.
  nationalBorderLayer.appendChild(el('path',{
    d,fill:'none',stroke:id==='VNM'?'#465b68':'#6d7b85',
    'stroke-width':id==='VNM'?'2.55':'2.05',opacity:id==='VNM'?'1':'.96',
    'stroke-linecap':'round','stroke-linejoin':'round','vector-effect':'non-scaling-stroke',
    'shape-rendering':'geometricPrecision',class:'regional-country-border','data-country':id
  }));
  return true;
}

function drawAdm1Feature(countryId,feature,index){
  const g=feature?.geometry;if(!g||!intersectsView(g))return false;
  const d=geometryPath(g);if(!d)return false;
  // Không tô trắng từng tỉnh nước ngoài nữa để tránh chồng mảng; chỉ giữ ranh giới hành chính nhẹ.
  adminLayer.appendChild(el('path',{
    d,fill:'none',stroke:'#a6afb6','stroke-width':'1.02',opacity:'.80',
    'stroke-linecap':'round','stroke-linejoin':'round','vector-effect':'non-scaling-stroke',
    'shape-rendering':'geometricPrecision',class:'neighbor-admin-region',
    'data-country':countryId,'data-region':String(feature?.properties?.shapeName||feature?.properties?.name||index)
  }));
  return true;
}

async function loadRegional(){
  const r=await fetch(REGIONAL_URL,{mode:'cors',cache:'force-cache'});
  if(!r.ok)throw new Error(`Regional countries: HTTP ${r.status}`);
  const json=await r.json();
  const features=json?.type==='FeatureCollection'?json.features:[];
  let drawn=0;features.forEach(f=>{if(drawRegionalFeature(f))drawn++});
  return drawn;
}

async function loadAdm1(cfg){
  const r=await fetch(cfg.url,{mode:'cors',cache:'force-cache'});
  if(!r.ok)throw new Error(`${cfg.name}: HTTP ${r.status}`);
  const json=await r.json();
  const features=json?.type==='FeatureCollection'?json.features:(json?.type==='Feature'?[json]:[]);
  let drawn=0;features.forEach((f,i)=>{if(drawAdm1Feature(cfg.id,f,i))drawn++});
  return drawn;
}

async function draw(){
  regionalLandLayer.innerHTML='';
  nationalBorderLayer.innerHTML='';
  adminLayer.innerHTML='';

  const [regionalResult,...admResults]=await Promise.allSettled([
    loadRegional(),
    ...ADM1_SOURCES.map(loadAdm1)
  ]);

  const failed=[];
  if(regionalResult.status==='rejected')failed.push('Nền Đông Nam Á');
  admResults.forEach((r,i)=>{if(r.status==='rejected')failed.push(ADM1_SOURCES[i].name)});
  if(failed.length)console.warn('Không tải được một số lớp bản đồ:',failed.join(', '));

  return{
    regional:regionalResult.status==='fulfilled'?regionalResult.value:0,
    adm1:admResults.reduce((n,r)=>n+(r.status==='fulfilled'?(Number(r.value)||0):0),0),
    failed
  };
}

draw().catch(e=>console.warn('Không vẽ được nền Đông Nam Á',e));
window.__VN_NEIGHBOR_COUNTRY_OUTLINES_API={
  draw,
  layer:adminLayer,
  regionalLandLayer,
  nationalBorderLayer,
  sources:ADM1_SOURCES.map(x=>({...x})),
  regionalContext:window.__VN_REGIONAL_CONTEXT
};
})();
