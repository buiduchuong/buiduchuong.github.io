(()=>{
'use strict';
if(window.__VN_INTERNATIONAL_BORDERS)return;
window.__VN_INTERNATIONAL_BORDERS=true;

const NS='http://www.w3.org/2000/svg';
const svg=document.getElementById('mapSvg');
const viewport=document.getElementById('viewport');
const mapLayer=document.getElementById('mapLayer');
if(!svg||!viewport||!mapLayer)return;

const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7};
const PLOT={x:350,y:18,w:700,h:954};
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));return n};
function project([lon,lat]){
  return[
    PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,
    PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h
  ];
}
function linePath(coords){return coords.map((p,i)=>{const[x,y]=project(p);return`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`}).join(' ')}

// Các polyline được giản lược cho mục đích trình bày trên infographic.
// Chúng mô tả ba dải biên giới đất liền của Việt Nam với các nước láng giềng.
const BORDERS=[
  {
    id:'china',name:'TRUNG QUỐC',label:[105.35,23.18],rotate:-3,
    coords:[
      [102.18,22.40],[102.52,22.57],[102.86,22.67],[103.18,22.78],[103.55,22.61],
      [103.87,22.54],[104.18,22.66],[104.48,22.75],[104.78,22.86],[105.08,23.02],
      [105.42,23.12],[105.78,23.07],[106.08,22.96],[106.38,22.88],[106.70,22.92],
      [107.00,22.82],[107.32,22.63],[107.62,22.50],[107.92,22.43],[108.24,22.34],
      [108.55,22.20],[108.86,21.97]
    ]
  },
  {
    id:'laos',name:'LÀO',label:[103.18,18.10],rotate:-72,
    coords:[
      [102.18,22.40],[102.18,22.05],[102.34,21.72],[102.55,21.42],[102.65,21.08],
      [102.79,20.72],[102.91,20.38],[103.06,20.04],[103.17,19.70],[103.32,19.40],
      [103.45,19.05],[103.57,18.72],[103.76,18.40],[103.88,18.04],[104.03,17.70],
      [104.17,17.35],[104.32,17.02],[104.43,16.68],[104.57,16.34],[104.74,16.02],
      [104.88,15.68],[105.02,15.36],[105.18,15.10],[105.38,14.82]
    ]
  },
  {
    id:'cambodia',name:'CAMPUCHIA',label:[104.18,12.15],rotate:-18,
    coords:[
      [105.38,14.82],[105.17,14.55],[104.98,14.26],[104.80,13.98],[104.63,13.67],
      [104.48,13.34],[104.37,13.02],[104.25,12.70],[104.19,12.37],[104.23,12.05],
      [104.34,11.77],[104.51,11.52],[104.73,11.30],[104.95,11.10],[105.15,10.92],
      [105.42,10.78],[105.68,10.69],[105.92,10.62],[106.16,10.57]
    ]
  }
];

let layer=document.getElementById('internationalBorderLayer');
if(!layer){
  layer=el('g',{id:'internationalBorderLayer','data-vn-international-borders':'1'});
  if(mapLayer.nextSibling)viewport.insertBefore(layer,mapLayer.nextSibling);else viewport.appendChild(layer);
}

function draw(){
  layer.innerHTML='';
  BORDERS.forEach(b=>{
    const d=linePath(b.coords);
    layer.appendChild(el('path',{d,fill:'none',stroke:'#ffffff','stroke-width':'4.4','stroke-linecap':'round','stroke-linejoin':'round',opacity:'.92','vector-effect':'non-scaling-stroke',class:'international-border-casing'}));
    layer.appendChild(el('path',{d,fill:'none',stroke:'#34495e','stroke-width':'2.15','stroke-linecap':'round','stroke-linejoin':'round',opacity:'.98','vector-effect':'non-scaling-stroke',class:'international-border','data-border':b.id}));
    const[x,y]=project(b.label);
    const t=el('text',{x,y,'text-anchor':'middle','font-family':'Roboto,Arial,sans-serif','font-size':'11','font-weight':'900',fill:'#34495e',stroke:'#fff8ee','stroke-width':'3','paint-order':'stroke fill','letter-spacing':'.8',class:'international-border-label',transform:`rotate(${b.rotate||0} ${x} ${y})`});
    t.textContent=b.name;layer.appendChild(t);
  });
}

draw();
window.__VN_INTERNATIONAL_BORDERS_API={draw,layer,borders:BORDERS.map(b=>({...b,coords:b.coords.map(p=>[...p])}))};
})();
