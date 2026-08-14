(()=>{
'use strict';
if(window.__VN_PHUQUOC_SEA_LINK)return;
window.__VN_PHUQUOC_SEA_LINK=true;
const NS='http://www.w3.org/2000/svg';
const svg=document.getElementById('mapSvg');
const viewport=document.getElementById('viewport');
if(!svg||!viewport)return;
const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};
const project=(lon,lat)=>({x:PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,y:PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h});
const HT=project(104.4875,10.3833);
const PQ=project(103.9670,10.2167);
function el(tag,a={}){const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,String(v)));return n}
function title(n,s){const t=el('title');t.textContent=s;n.appendChild(t)}
function ensureDefs(){
 let d=svg.querySelector('#phuQuocSeaDefs');if(d)return d;
 d=el('defs',{id:'phuQuocSeaDefs'});
 const mk=(id,color)=>{const m=el('marker',{id,viewBox:'0 0 10 10',refX:8.3,refY:5,markerWidth:5.2,markerHeight:5.2,orient:'auto',markerUnits:'strokeWidth'});m.appendChild(el('path',{d:'M0 0 L10 5 L0 10 Z',fill:color}));d.appendChild(m)};
 mk('phuQuocSeaArrow','#1677d2');
 svg.insertBefore(d,svg.firstChild);return d;
}
function addPath(g,d,label){
 const p=el('path',{d,fill:'none',stroke:'#1677d2','stroke-width':3.4,'stroke-linecap':'round','stroke-linejoin':'round','stroke-dasharray':'8 5','vector-effect':'non-scaling-stroke','marker-end':'url(#phuQuocSeaArrow)',opacity:'.98'});
 title(p,label);g.appendChild(p);
}
function render(){
 const old=document.getElementById('phuQuocSeaLinkLayer');if(old)old.remove();ensureDefs();
 const g=el('g',{id:'phuQuocSeaLinkLayer'});
 const dx=PQ.x-HT.x,dy=PQ.y-HT.y;
 const mx=(HT.x+PQ.x)/2,my=(HT.y+PQ.y)/2;
 const len=Math.hypot(dx,dy)||1;
 const nx=-dy/len,ny=dx/len;
 const c1={x:mx+nx*18,y:my+ny*18};
 const c2={x:mx-nx*18,y:my-ny*18};
 addPath(g,`M${HT.x},${HT.y} Q${c1.x},${c1.y} ${PQ.x},${PQ.y}`,'Tàu Hà Tiên → Phú Quốc');
 addPath(g,`M${PQ.x},${PQ.y} Q${c2.x},${c2.y} ${HT.x},${HT.y}`,'Tàu Phú Quốc → Hà Tiên');
 const t=el('text',{x:mx,y:my-22,'text-anchor':'middle','font-family':'Roboto,Arial,sans-serif','font-size':7.2,'font-weight':800,fill:'#0f5ea8','paint-order':'stroke','stroke':'#ffffff','stroke-width':2.6,'stroke-linejoin':'round','vector-effect':'non-scaling-stroke'});
 t.textContent='TÀU HÀ TIÊN ⇄ PHÚ QUỐC';g.appendChild(t);
 const labelLayer=document.getElementById('labelLayer');
 if(labelLayer)viewport.insertBefore(g,labelLayer);else viewport.appendChild(g);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();
