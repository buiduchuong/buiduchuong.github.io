(()=>{
'use strict';
if(window.__VN_NEIGHBOR_COUNTRY_OUTLINES)return;
window.__VN_NEIGHBOR_COUNTRY_OUTLINES=true;

const NS='http://www.w3.org/2000/svg';
const viewport=document.getElementById('viewport');
const mapLayer=document.getElementById('mapLayer');
if(!viewport||!mapLayer)return;

function keepNoteOverlayOnTop(){
  const noteLayer=document.getElementById('pickupLayer');
  const root=noteLayer?.parentNode;
  if(root&&root.lastElementChild!==noteLayer)root.appendChild(noteLayer);
}
keepNoteOverlayOnTop();
const noteOverlayRoot=document.getElementById('pickupLayer')?.parentNode;
if(noteOverlayRoot&&window.MutationObserver){
  new MutationObserver(()=>keepNoteOverlayOnTop()).observe(noteOverlayRoot,{childList:true});
}

const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};
const project=([lon,lat])=>[
  PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,
  PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h
];
const REGION_GEO={minLon:88,maxLon:145,minLat:-13,maxLat:31};
const nw=project([REGION_GEO.minLon,REGION_GEO.maxLat]);
const se=project([REGION_GEO.maxLon,REGION_GEO.minLat]);
const margin=52;
const REGION_VIEWBOX=[nw[0]-margin,nw[1]-margin,(se[0]-nw[0])+margin*2,(se[1]-nw[1])+margin*2];
window.__VN_REGIONAL_CONTEXT={
  geoBounds:{...REGION_GEO},
  viewBox:REGION_VIEWBOX.map(v=>Number(v.toFixed(2))).join(' '),
  source:'local map-assets/neighbors'
};

const DRAW_BOUNDS={minLon:87.5,maxLon:145.5,minLat:-13.5,maxLat:31.5};
const ADM1_SOURCES=[
  {id:'CHN',name:'Trung Quốc',url:'map-assets/neighbors/CHN-ADM1.geojson'},
  {id:'LAO',name:'Lào',url:'map-assets/neighbors/LAO-ADM1.geojson'},
  {id:'KHM',name:'Campuchia',url:'map-assets/neighbors/KHM-ADM1.geojson'}
];

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
  if(typeof coords[0]==='number'&&typeof coords[1]==='number'){cb(coords);return}
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
function fetchLocalJson(url,timeout=7000){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout);
  return fetch(url,{cache:'force-cache',signal:controller.signal})
    .then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()})
    .finally(()=>clearTimeout(timer));
}

document.getElementById('internationalBorderLayer')?.remove();
document.getElementById('regionalLandLayer')?.remove();
document.getElementById('regionalNationalBorderLayer')?.remove();
document.getElementById('neighborCountryOutlineLayer')?.remove();

const regionalLandLayer=el('g',{id:'regionalLandLayer','data-export-layer':'regional-land','pointer-events':'none'});
viewport.insertBefore(regionalLandLayer,mapLayer);
const adminLayer=el('g',{id:'neighborCountryOutlineLayer','data-vn-neighbor-outlines':'1','data-export-layer':'regional-adm1','pointer-events':'none'});
viewport.insertBefore(adminLayer,mapLayer);

function drawAdm1Feature(countryId,feature,index){
  const g=feature?.geometry;if(!g||!intersectsView(g))return false;
  const d=geometryPath(g);if(!d)return false;
  regionalLandLayer.appendChild(el('path',{
    d,fill:'#ffffff','fill-rule':'evenodd',stroke:'none',class:'regional-country-land','data-country':countryId
  }));
  adminLayer.appendChild(el('path',{
    d,fill:'none',stroke:'#aeb8bf','stroke-width':'0.72',opacity:'.78',
    'stroke-linecap':'round','stroke-linejoin':'round','stroke-miterlimit':'1',
    'shape-rendering':'geometricPrecision',class:'neighbor-admin-region',
    'data-country':countryId,
    'data-region':String(feature?.properties?.shapeName||feature?.properties?.name||feature?.properties?.shapeISO||index)
  }));
  return true;
}

async function loadAdm1(cfg){
  const json=await fetchLocalJson(cfg.url,7000);
  const features=json?.type==='FeatureCollection'?json.features:(json?.type==='Feature'?[json]:[]);
  let drawn=0;features.forEach((f,i)=>{if(drawAdm1Feature(cfg.id,f,i))drawn++});
  return{country:cfg.id,name:cfg.name,drawn};
}
async function draw(){
  regionalLandLayer.innerHTML='';
  adminLayer.innerHTML='';
  const results=await Promise.allSettled(ADM1_SOURCES.map(loadAdm1));
  const failed=[],loaded=[];
  results.forEach((r,i)=>{if(r.status==='rejected')failed.push(ADM1_SOURCES[i].name);else loaded.push(r.value)});
  if(failed.length)console.warn('Không tải được ADM1 local của:',failed.join(', '));
  window.__VN_ADM1_STATUS={regional:0,loaded,failed,localOnly:true,updatedAt:new Date().toISOString()};
  return{regional:0,adm1:loaded.reduce((n,x)=>n+(Number(x.drawn)||0),0),loaded,failed,localOnly:true};
}

function scheduleInitialDraw(){
  const run=()=>{
    const task=()=>draw().catch(e=>console.warn('Không vẽ được nền lân cận local',e));
    if('requestIdleCallback' in window)requestIdleCallback(task,{timeout:1200});
    else setTimeout(task,0);
  };
  if(document.readyState==='complete')run();
  else window.addEventListener('load',run,{once:true});
}

window.__VN_NEIGHBOR_COUNTRY_OUTLINES_API={
  draw,
  layer:adminLayer,
  regionalLandLayer,
  sources:ADM1_SOURCES.map(x=>({...x})),
  regionalContext:window.__VN_REGIONAL_CONTEXT,
  getStatus:()=>window.__VN_ADM1_STATUS||null
};
scheduleInitialDraw();
})();