(()=>{
'use strict';
if(window.__VN_TOUR_DETAIL_MARKERS)return;
window.__VN_TOUR_DETAIL_MARKERS=true;

const MARK='vn-map-tour-detail-markers-v3';
const COORD_MARK='vn-map-tour-detail-coords-v2';
const PREF_KEY='vn-map-tour-detail-prefs-v1';
const VISIT_KEY='vn-map-tour-visit-positions-v1';
const NS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id);
const GEO={minLon:101.7,maxLon:110.7,minLat:7.4,maxLat:23.7},PLOT={x:350,y:18,w:700,h:954};
const COLORS={food:'#f08a24',temple:'#a9483d',boat:'#2d77b8',visit:'#5f8a46'};
function project(lon,lat){return{x:PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,y:PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h}}
function item(id,cat,type,lon,lat,label){const p=project(lon,lat);return{id,cat,type,lon,lat,x:p.x,y:p.y,label}}

const ICON_ITEMS=[
  item('tour-detail-food-hue','food','restaurant',107.5909,16.4637,'Huế - Đặc sản bánh bèo, lọc, nậm, khoái'),
  item('tour-detail-food-cantho','food','restaurant',105.7883,10.0340,'Cần Thơ - Bữa tối trên du thuyền Ninh Kiều'),
  item('tour-detail-food-namcan','food','restaurant',104.9950,8.7586,'Năm Căn - Đặc sản Cua Cà Mau'),
  item('tour-detail-food-chaudoc','food','restaurant',105.1170,10.7040,'Châu Đốc - Lẩu cá linh, bông điên điển'),
  item('tour-detail-food-vinhhy','food','restaurant',109.1920,11.7240,'Vĩnh Hy - Hải sản trên nhà bè'),
  item('tour-detail-food-culaoc','food','restaurant',108.5100,15.9500,'Cù Lao Chàm - Hải sản và rau rừng'),
  item('tour-detail-food-ninhbinh','food','restaurant',105.9156,20.2557,'Ninh Bình - Dê núi, cơm cháy'),

  item('tour-detail-temple-thienmu','temple','temple',107.5447,16.4530,'Huế - Chùa Thiên Mụ'),
  item('tour-detail-temple-linhung','temple','temple',108.2770,16.1007,'Đà Nẵng - Linh Ứng Tự Sơn Trà'),
  item('tour-detail-temple-minhthanh','temple','temple',108.0080,13.9770,'Pleiku - Chùa Minh Thành'),
  item('tour-detail-temple-linhphuoc','temple','temple',108.4910,11.9440,'Đà Lạt - Chùa Linh Phước'),
  item('tour-detail-temple-vinhtrang','temple','temple',106.3435,10.3469,'Mỹ Tho - Chùa Vĩnh Tràng'),
  item('tour-detail-temple-hoquoc','temple','temple',104.0480,10.0330,'Phú Quốc - Thiền viện Trúc Lâm Hộ Quốc'),
  item('tour-detail-temple-caodai','temple','temple',106.1260,11.3030,'Tây Ninh - Tòa Thánh Cao Đài'),
  item('tour-detail-temple-kienan','temple','temple',105.7560,10.2900,'Sa Đéc - Chùa Kiến An Cung'),
  item('tour-detail-temple-haitang','temple','temple',108.5140,15.9530,'Cù Lao Chàm - Chùa Hải Tạng'),

  item('tour-detail-boat-mytho','boat','boat',106.3600,10.3550,'Mỹ Tho - Thuyền tham quan 4 cù lao'),
  item('tour-detail-boat-hatien','boat','boat',104.4870,10.3830,'Hà Tiên - Tàu cao tốc đi Phú Quốc'),
  item('tour-detail-boat-anthoi','boat','boat',104.0070,10.0260,'An Thới - Cano Tour 4 đảo'),
  item('tour-detail-boat-vinhhy','boat','boat',109.1920,11.7240,'Vĩnh Hy - Tàu đáy kính tham quan vịnh'),
  item('tour-detail-boat-saky','boat','boat',108.9100,15.2140,'Sa Kỳ - Tàu cao tốc đi Lý Sơn'),
  item('tour-detail-boat-cuadai','boat','boat',108.3710,15.8820,'Cửa Đại - Cano đi Cù Lao Chàm'),
  item('tour-detail-boat-trangan','boat','boat',105.9156,20.2557,'Tràng An - Thuyền tham quan hang động')
];
const VISIT_ITEMS=[
  item('tour-detail-visit-rungdua','visit','visit',108.3780,15.8890,'Hội An - Rừng Dừa Bảy Mẫu'),
  item('tour-detail-visit-kyco','visit','visit',109.3050,13.7560,'Quy Nhơn - Kỳ Co / Eo Gió'),
  item('tour-detail-visit-quangtrung','visit','visit',108.9070,13.8870,'Bình Định cũ - Bảo tàng Quang Trung'),
  item('tour-detail-visit-vinwonders','visit','visit',103.8530,10.3340,'Phú Quốc - VinWonders / Grand World'),
  item('tour-detail-visit-trasu','visit','visit',105.0580,10.6200,'An Giang - Rừng Tràm Trà Sư'),
  item('tour-detail-visit-nuibaden','visit','visit',106.1730,11.3740,'Tây Ninh - Núi Bà Đen'),
  item('tour-detail-visit-vinhhy','visit','visit',109.1940,11.7240,'Khánh Hòa - Vịnh Vĩnh Hy'),
  item('tour-detail-visit-hangmua','visit','visit',105.9340,20.2280,'Ninh Bình - Hang Múa')
];
const ITEMS=[...ICON_ITEMS,...VISIT_ITEMS];
const ID_MAP=new Map(ITEMS.map(x=>[x.id,x]));
const VISIT_IDS=new Set(VISIT_ITEMS.map(x=>x.id));
const COUNTS=ITEMS.reduce((a,x)=>(a[x.cat]=(a[x.cat]||0)+1,a),{});
let visitPositions=new Map();
let visitLayer=null,visitDrag=null,observer=null,tries=0;

function prefs(){try{return{food:true,temple:true,boat:true,visit:true,legend:true,...JSON.parse(localStorage.getItem(PREF_KEY)||'{}')}}catch{return{food:true,temple:true,boat:true,visit:true,legend:true}}}
function savePrefs(p){try{localStorage.setItem(PREF_KEY,JSON.stringify(p))}catch{}}
function setPref(key,value){const p=prefs();p[key]=!!value;savePrefs(p);applyVisibility()}
function setStatus(text,ok=true){const n=$('tourDetailCoordStatus');if(!n)return;n.textContent=text;n.style.color=ok?'#287247':'#a33a31'}
function visitPos(cfg){return visitPositions.get(cfg.id)||{x:cfg.x,y:cfg.y}}
function loadVisitPositions(){
  try{const d=JSON.parse(localStorage.getItem(VISIT_KEY)||'{}');VISIT_ITEMS.forEach(cfg=>{const p=d[cfg.id];visitPositions.set(cfg.id,p&&Number.isFinite(Number(p.x))&&Number.isFinite(Number(p.y))?{x:Number(p.x),y:Number(p.y)}:{x:cfg.x,y:cfg.y})})}
  catch{VISIT_ITEMS.forEach(cfg=>visitPositions.set(cfg.id,{x:cfg.x,y:cfg.y}))}
}
function saveVisitPositions(){try{localStorage.setItem(VISIT_KEY,JSON.stringify(Object.fromEntries(visitPositions)))}catch{}}

function syncUI(p=prefs()){
  if($('showTourDetailFood'))$('showTourDetailFood').checked=!!p.food;
  if($('showTourDetailTemple'))$('showTourDetailTemple').checked=!!p.temple;
  if($('showTourDetailBoat'))$('showTourDetailBoat').checked=!!p.boat;
  if($('showTourDetailVisit'))$('showTourDetailVisit').checked=!!p.visit;
  if($('showTourDetailLegend'))$('showTourDetailLegend').checked=!!p.legend;
}
function applyVisibility(){
  const p=prefs(),layer=$('foodLayer');
  if(layer)layer.querySelectorAll('.food-marker[data-id]').forEach(g=>{const cfg=ID_MAP.get(g.dataset.id);if(cfg&&!VISIT_IDS.has(cfg.id))g.style.display=p[cfg.cat]?'':'none'});
  if(visitLayer)visitLayer.style.display=p.visit?'':'none';
  const legend=$('tourDetailLegend');if(legend)legend.style.display=p.legend?'':'none';
  syncUI(p);
}

function installIcons(){
  if(localStorage.getItem(MARK)==='done')return true;
  const api=window.__VN_FOOD;if(!api||typeof api.addAt!=='function'||typeof api.getAll!=='function'||typeof api.save!=='function'||typeof api.render!=='function')return false;
  try{
    let current=api.getAll()||[];
    for(const cfg of ICON_ITEMS){
      if(current.some(x=>x?.id===cfg.id))continue;
      const f=api.addAt(cfg.type,cfg.x,cfg.y);if(!f)throw new Error('Không tạo được '+cfg.label);
      Object.assign(f,{id:cfg.id,type:cfg.type,x:cfg.x,y:cfg.y,size:typeof api.getBulkSize==='function'?api.getBulkSize():24,label:cfg.label,showLabel:false,bgColor:COLORS[cfg.cat],iconColor:'#ffffff',textColor:'#333333'});
      current=api.getAll()||[];
    }
    api.save(true);api.render();
    const all=api.getAll()||[],done=ICON_ITEMS.every(cfg=>all.some(x=>x?.id===cfg.id));
    if(done)localStorage.setItem(MARK,'done');
    return done;
  }catch(e){console.warn('Không cài được bộ icon chi tiết hành trình',e);return false}
}
function removeLegacyVisitIcons(){
  const api=window.__VN_FOOD,sel=$('foodSelect'),del=$('deleteFoodItem');if(!api||!sel||!del)return;
  let all=api.getAll?.()||[];
  for(const id of VISIT_IDS){
    if(!all.some(x=>x?.id===id))continue;
    sel.value=id;sel.dispatchEvent(new Event('change',{bubbles:true}));del.click();all=api.getAll?.()||[];
  }
}

function svgEl(tag,a={}){const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));return n}
function ensureVisitLayer(){
  if(visitLayer)return true;
  const viewport=$('viewport');if(!viewport)return false;
  visitLayer=svgEl('g',{id:'tourVisitLayer'});
  const food=$('foodLayer');if(food)viewport.insertBefore(visitLayer,food);else viewport.appendChild(visitLayer);
  return true;
}
function visitSize(){const api=window.__VN_FOOD;return Math.max(16,Math.min(140,Number(api?.getBulkSize?.())||38))}
function drawVisitIcon(g,s){
  const c='#ffffff',w=Math.max(1.4,s*.055);
  g.appendChild(svgEl('path',{d:`M${-s*.28},${s*.18} L${-s*.07},${-s*.11} L${s*.04},${s*.03} L${s*.16},${-s*.15} L${s*.30},${s*.18}`,fill:'none',stroke:c,'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round'}));
  g.appendChild(svgEl('line',{x1:-s*.31,y1:s*.20,x2:s*.32,y2:s*.20,stroke:c,'stroke-width':w,'stroke-linecap':'round'}));
  g.appendChild(svgEl('circle',{cx:s*.17,cy:-s*.26,r:s*.06,fill:'none',stroke:c,'stroke-width':w*.8}));
}
function renderVisits(){
  if(!ensureVisitLayer())return;
  visitLayer.innerHTML='';const s=visitSize(),r=s*.52;
  for(const cfg of VISIT_ITEMS){
    const p=visitPos(cfg),g=svgEl('g',{class:'tour-visit-marker','data-id':cfg.id,transform:`translate(${p.x} ${p.y})`});g.style.cursor='move';
    const title=svgEl('title');title.textContent=cfg.label;g.appendChild(title);
    g.appendChild(svgEl('rect',{x:-Math.max(s*1.3,60),y:-s*.65,width:Math.max(s*2.6,120),height:s*1.3,fill:'transparent','pointer-events':'all'}));
    g.appendChild(svgEl('circle',{cx:0,cy:0,r,fill:COLORS.visit,stroke:'#fffdf8','stroke-width':'2.2'}));drawVisitIcon(g,s);
    g.addEventListener('pointerdown',startVisitDrag);visitLayer.appendChild(g);
  }
  applyVisibility();
}
function worldFromClient(e){const svg=$('mapSvg'),viewport=$('viewport');if(!svg||!viewport)return[700,500];const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const m=viewport.getScreenCTM();if(!m)return[700,500];const q=pt.matrixTransform(m.inverse());return[q.x,q.y]}
function startVisitDrag(e){e.preventDefault();e.stopPropagation();const id=e.currentTarget.dataset.id,p=visitPositions.get(id);if(!p)return;const q=worldFromClient(e);visitDrag={id,dx:q[0]-p.x,dy:q[1]-p.y};window.addEventListener('pointermove',moveVisitDrag,true);window.addEventListener('pointerup',endVisitDrag,true);window.addEventListener('pointercancel',endVisitDrag,true)}
function moveVisitDrag(e){if(!visitDrag)return;e.preventDefault();const q=worldFromClient(e),p=visitPositions.get(visitDrag.id);if(!p)return;p.x=q[0]-visitDrag.dx;p.y=q[1]-visitDrag.dy;renderVisits()}
function endVisitDrag(){if(!visitDrag)return;visitDrag=null;window.removeEventListener('pointermove',moveVisitDrag,true);window.removeEventListener('pointerup',endVisitDrag,true);window.removeEventListener('pointercancel',endVisitDrag,true);saveVisitPositions()}

function fixAllPositions(showMessage=true){
  const api=window.__VN_FOOD;let fixed=0;
  if(api&&typeof api.getAll==='function'){
    const all=api.getAll()||[];
    for(const cfg of ICON_ITEMS){const f=all.find(x=>x?.id===cfg.id);if(!f)continue;f.x=cfg.x;f.y=cfg.y;f.type=cfg.type;f.label=cfg.label;f.bgColor=COLORS[cfg.cat];fixed++}
    if(fixed){api.save(true);api.render()}
  }
  for(const cfg of VISIT_ITEMS){visitPositions.set(cfg.id,{x:cfg.x,y:cfg.y});fixed++}
  saveVisitPositions();renderVisits();applyVisibility();
  try{localStorage.setItem(COORD_MARK,'done')}catch{}
  if(showMessage)setStatus(`✓ Đã sửa đúng vị trí ${fixed}/${ITEMS.length} icon theo chương trình.`,fixed===ITEMS.length);
  return fixed;
}
function migrateCoordsOnce(){let done=false;try{done=localStorage.getItem(COORD_MARK)==='done'}catch{}if(done)return;fixAllPositions(false)}

function injectUI(){
  if($('tourDetailGroup')){syncUI();return true}
  const controls=document.querySelector('.controls');if(!controls)return false;
  const g=document.createElement('div');g.className='group';g.id='tourDetailGroup';
  g.innerHTML=`<div class="group-title">Chi tiết hành trình</div>
    <label class="check"><input id="showTourDetailFood" type="checkbox" checked> <b>Ăn đặc sản</b> · ${COUNTS.food} điểm</label>
    <label class="check"><input id="showTourDetailTemple" type="checkbox" checked> <b>Tâm linh / chùa</b> · ${COUNTS.temple} điểm</label>
    <label class="check"><input id="showTourDetailVisit" type="checkbox" checked> <b>Điểm tham quan</b> · ${COUNTS.visit} điểm</label>
    <label class="check"><input id="showTourDetailBoat" type="checkbox" checked> <b>Tàu / Cano</b> · ${COUNTS.boat} chặng</label>
    <label class="check"><input id="showTourDetailLegend" type="checkbox" checked> Hiện chú giải trên bản đồ</label>
    <button id="fixTourDetailPositions" class="btn primary" style="width:100%;margin-top:7px">Sửa đúng vị trí toàn bộ ${ITEMS.length} icon</button>
    <div id="tourDetailCoordStatus" class="mode-note" style="margin-top:6px">Chỉ sửa icon preset của chương trình; icon bạn tự tạo không bị thay đổi.</div>
    <div class="row"><button id="showAllTourDetails" class="btn">Hiện tất cả</button><button id="hideAllTourDetails" class="btn">Ẩn chi tiết</button></div>
    <div class="tip">Nút sửa vị trí đưa ăn uống, chùa/tâm linh, điểm tham quan và tàu/cano về tọa độ đại diện trong chương trình. Icon tham quan màu xanh lá vẫn có thể kéo thủ công trên bản đồ.</div>`;
  const route=$('tourRouteGroup');if(route)route.insertAdjacentElement('afterend',g);else controls.appendChild(g);
  $('showTourDetailFood').addEventListener('change',e=>setPref('food',e.target.checked));$('showTourDetailTemple').addEventListener('change',e=>setPref('temple',e.target.checked));$('showTourDetailVisit').addEventListener('change',e=>setPref('visit',e.target.checked));$('showTourDetailBoat').addEventListener('change',e=>setPref('boat',e.target.checked));$('showTourDetailLegend').addEventListener('change',e=>setPref('legend',e.target.checked));
  $('fixTourDetailPositions').addEventListener('click',()=>fixAllPositions(true));
  $('showAllTourDetails').addEventListener('click',()=>{const p=prefs();Object.assign(p,{food:true,temple:true,visit:true,boat:true,legend:true});savePrefs(p);applyVisibility()});
  $('hideAllTourDetails').addEventListener('click',()=>{const p=prefs();Object.assign(p,{food:false,temple:false,visit:false,boat:false});savePrefs(p);applyVisibility()});syncUI();return true;
}
function text(g,x,y,value,size=12,weight=600,fill='#39332d'){const t=svgEl('text',{x,y,'font-family':'Roboto,Arial,sans-serif','font-size':size,'font-weight':weight,fill});t.textContent=value;g.appendChild(t);return t}
function injectLegend(){
  if($('tourDetailLegend'))return true;const svg=$('mapSvg');if(!svg)return false;
  const g=svgEl('g',{id:'tourDetailLegend',transform:'translate(1120 72)','pointer-events':'none'});g.appendChild(svgEl('rect',{x:0,y:0,width:230,height:138,rx:10,fill:'#fffdf8','fill-opacity':'.94',stroke:'#cdbb9e','stroke-width':'1.2'}));text(g,15,23,'KÝ HIỆU HÀNH TRÌNH',13,900,'#4b4035');
  [[COLORS.food,'Ăn đặc sản'],[COLORS.temple,'Tâm linh / chùa'],[COLORS.visit,'Điểm tham quan'],[COLORS.boat,'Tàu / cano']].forEach((r,i)=>{const y=47+i*25;g.appendChild(svgEl('circle',{cx:21,cy:y-4,r:7,fill:r[0],stroke:'#ffffff','stroke-width':'1.5'}));text(g,38,y,r[1],12,700,'#4a443e')});svg.appendChild(g);applyVisibility();return true;
}
function observe(){const layer=$('foodLayer');if(!layer)return false;if(!observer){observer=new MutationObserver(()=>{applyVisibility();renderVisits()});observer.observe(layer,{childList:true,subtree:true})}applyVisibility();return true}
function boot(){
  tries++;loadVisitPositions();const a=installIcons(),b=injectUI(),c=injectLegend(),d=ensureVisitLayer();if(a){removeLegacyVisitIcons();migrateCoordsOnce()}renderVisits();observe();applyVisibility();
  if(a&&b&&c&&d)return;if(tries<180)setTimeout(boot,120);else console.warn('Bộ chi tiết hành trình chưa sẵn sàng')
}
window.__VN_TOUR_DETAIL_MARKERS={items:ITEMS.map(x=>({...x})),apply:applyVisibility,fixPositions:()=>fixAllPositions(true),showAll:()=>{const p=prefs();Object.assign(p,{food:true,temple:true,visit:true,boat:true});savePrefs(p);applyVisibility()},hideAll:()=>{const p=prefs();Object.assign(p,{food:false,temple:false,visit:false,boat:false});savePrefs(p);applyVisibility()}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,250),{once:true});else setTimeout(boot,250);
})();
