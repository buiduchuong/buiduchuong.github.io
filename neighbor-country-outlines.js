(()=>{
'use strict';
if(window.__VN_NEIGHBOR_COUNTRY_OUTLINES)return;
window.__VN_NEIGHBOR_COUNTRY_OUTLINES=true;

const NS='http://www.w3.org/2000/svg';
const viewport=document.getElementById('viewport');
const mapLayer=document.getElementById('mapLayer');
if(!viewport||!mapLayer)return;

// Giữ nguyên phép chiếu của editor để tỉnh/thành, tuyến và icon Việt Nam không bị lệch.
const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};
const project=([lon,lat])=>[
  PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,
  PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h
];

// Khung toàn Đông Nam Á dùng khi xuất PNG/SVG/PDF.
const REGION_GEO={minLon:88,maxLon:145,minLat:-13,maxLat:31};
const nw=project([REGION_GEO.minLon,REGION_GEO.maxLat]);
const se=project([REGION_GEO.maxLon,REGION_GEO.minLat]);
const margin=52;
const REGION_VIEWBOX=[nw[0]-margin,nw[1]-margin,(se[0]-nw[0])+margin*2,(se[1]-nw[1])+margin*2];
window.__VN_REGIONAL_CONTEXT={
  geoBounds:{...REGION_GEO},
  viewBox:REGION_VIEWBOX.map(v=>Number(v.toFixed(2))).join(' '),
  source:'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json'
};

const DRAW_BOUNDS={minLon:87.5,maxLon:145.5,minLat:-13.5,maxLat:31.5};
const GEOBOUNDARIES_API='https://www.geoboundaries.org/api/current/gbOpen';
const REGIONAL_URL='https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

// Chỉ lấy ADM1 (tỉnh/bang/vùng cấp 1). Không hiện tên, không tô màu, không có viền quốc gia riêng.
// Trung Quốc/Lào/Campuchia dùng file local để tải nhanh; các nước Đông Nam Á khác lấy geoBoundaries simplified.
const ADM1_SOURCES=[
  {id:'CHN',name:'Trung Quốc',url:'map-assets/neighbors/CHN-ADM1.geojson',local:true},
  {id:'LAO',name:'Lào',url:'map-assets/neighbors/LAO-ADM1.geojson',local:true},
  {id:'KHM',name:'Campuchia',url:'map-assets/neighbors/KHM-ADM1.geojson',local:true},
  {id:'THA',name:'Thái Lan'},
  {id:'MMR',name:'Myanmar'},
  {id:'MYS',name:'Malaysia'},
  {id:'SGP',name:'Singapore'},
  {id:'BRN',name:'Brunei'},
  {id:'IDN',name:'Indonesia'},
  {id:'PHL',name:'Philippines'},
  {id:'TLS',name:'Timor-Leste'}
];

// Các mảng đất trắng chỉ dùng để che nền biển; hoàn toàn không vẽ viền quốc gia.
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
function fetchJson(url,timeout=22000){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout);
  return fetch(url,{mode:'cors',cache:'force-cache',signal:controller.signal})
    .then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()})
    .finally(()=>clearTimeout(timer));
}
async function resolveAdm1Urls(cfg){
  if(cfg.url)return[cfg.url];
  const meta=await fetchJson(`${GEOBOUNDARIES_API}/${cfg.id}/ADM1/`,12000);
  const urls=[];
  if(meta?.simplifiedGeometryGeoJSON)urls.push(meta.simplifiedGeometryGeoJSON);
  if(meta?.gjDownloadURL)urls.push(meta.gjDownloadURL);
  if(!urls.length)throw new Error(`${cfg.name}: không có URL GeoJSON ADM1`);
  return [...new Set(urls)];
}
async function fetchFirstJson(urls,cfg){
  let lastErr=null;
  for(const url of urls){try{return await fetchJson(url,30000)}catch(err){lastErr=err}}
  throw new Error(`${cfg.name}: ${lastErr?.message||'không tải được dữ liệu'}`);
}

// Dọn sạch mọi lớp viền quốc gia cũ để không còn các đường to, thô cứng từ cache/phiên trước.
document.getElementById('internationalBorderLayer')?.remove();
document.getElementById('regionalLandLayer')?.remove();
document.getElementById('regionalNationalBorderLayer')?.remove();
document.getElementById('neighborCountryOutlineLayer')?.remove();

// Nền đất trắng không viền, nằm dưới toàn bộ ranh giới hành chính.
const regionalLandLayer=el('g',{id:'regionalLandLayer','data-export-layer':'regional-land','pointer-events':'none'});
viewport.insertBefore(regionalLandLayer,mapLayer);

// Chỉ một lớp ADM1 cho toàn khu vực. Không có lớp national border riêng nữa.
const adminLayer=el('g',{id:'neighborCountryOutlineLayer','data-vn-neighbor-outlines':'1','data-export-layer':'regional-adm1','pointer-events':'none'});
viewport.insertBefore(adminLayer,mapLayer);

function drawRegionalFeature(feature){
  const id=String(feature?.id||'').toUpperCase();
  if(!REGION_COUNTRIES.has(id))return false;
  const g=feature?.geometry;if(!g||!intersectsView(g))return false;
  const d=geometryPath(g);if(!d)return false;

  // Chỉ che biển bằng nền trắng. Không stroke nên không còn đường biên quốc gia to.
  regionalLandLayer.appendChild(el('path',{
    d,
    fill:'#ffffff',
    'fill-rule':'evenodd',
    stroke:'none',
    class:'regional-country-land',
    'data-country':id
  }));
  return true;
}

function drawAdm1Feature(countryId,feature,index){
  const g=feature?.geometry;if(!g||!intersectsView(g))return false;
  const d=geometryPath(g);if(!d)return false;

  // Kiểu giống ranh giới tỉnh: chỉ có nét hành chính mảnh, không màu nền và không tên.
  // Không dùng vector-effect để khi xuất khung Đông Nam Á, nét tự thu nhỏ theo tỷ lệ và không bị thô.
  adminLayer.appendChild(el('path',{
    d,
    fill:'none',
    stroke:'#aeb8bf',
    'stroke-width':'0.72',
    opacity:'.78',
    'stroke-linecap':'round',
    'stroke-linejoin':'round',
    'stroke-miterlimit':'1',
    'shape-rendering':'geometricPrecision',
    class:'neighbor-admin-region',
    'data-country':countryId,
    'data-region':String(feature?.properties?.shapeName||feature?.properties?.name||feature?.properties?.shapeISO||index)
  }));
  return true;
}

async function loadRegional(){
  const json=await fetchJson(REGIONAL_URL,22000);
  const features=json?.type==='FeatureCollection'?json.features:[];
  let drawn=0;features.forEach(f=>{if(drawRegionalFeature(f))drawn++});
  return drawn;
}
async function loadAdm1(cfg){
  const urls=await resolveAdm1Urls(cfg);
  const json=await fetchFirstJson(urls,cfg);
  const features=json?.type==='FeatureCollection'?json.features:(json?.type==='Feature'?[json]:[]);
  let drawn=0;features.forEach((f,i)=>{if(drawAdm1Feature(cfg.id,f,i))drawn++});
  return{country:cfg.id,name:cfg.name,drawn};
}
async function draw(){
  regionalLandLayer.innerHTML='';
  adminLayer.innerHTML='';

  let regional=0;
  try{regional=await loadRegional()}catch(err){console.warn('Không tải được nền Đông Nam Á',err)}

  const admResults=await Promise.allSettled(ADM1_SOURCES.map(loadAdm1));
  const failed=[],loaded=[];
  admResults.forEach((r,i)=>{
    if(r.status==='rejected')failed.push(ADM1_SOURCES[i].name);
    else loaded.push(r.value);
  });
  if(failed.length)console.warn('Không tải được ADM1 của:',failed.join(', '));

  window.__VN_ADM1_STATUS={regional,loaded,failed,updatedAt:new Date().toISOString()};
  return{regional,adm1:loaded.reduce((n,x)=>n+(Number(x.drawn)||0),0),loaded,failed};
}

draw().catch(e=>console.warn('Không vẽ được nền Đông Nam Á',e));
window.__VN_NEIGHBOR_COUNTRY_OUTLINES_API={
  draw,
  layer:adminLayer,
  regionalLandLayer,
  sources:ADM1_SOURCES.map(x=>({...x})),
  regionalContext:window.__VN_REGIONAL_CONTEXT,
  getStatus:()=>window.__VN_ADM1_STATUS||null
};
})();
