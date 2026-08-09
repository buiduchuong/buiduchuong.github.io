(()=>{
'use strict';
if(window.__VN_TOUR_DETAIL_MARKERS)return;
window.__VN_TOUR_DETAIL_MARKERS=true;

const MARK='vn-map-tour-detail-markers-v1';
const PREF_KEY='vn-map-tour-detail-prefs-v1';
const NS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id);

const ITEMS=[
  {id:'tour-detail-food-hue',cat:'food',type:'restaurant',x:812,y:451,label:'Huế - Đặc sản bánh bèo, lọc, nậm, khoái'},
  {id:'tour-detail-food-cantho',cat:'food',type:'restaurant',x:681,y:818,label:'Cần Thơ - Bữa tối trên du thuyền Ninh Kiều'},
  {id:'tour-detail-food-namcan',cat:'food',type:'restaurant',x:625,y:900,label:'Năm Căn - Đặc sản Cua Cà Mau'},
  {id:'tour-detail-food-chaudoc',cat:'food',type:'restaurant',x:628,y:785,label:'Châu Đốc - Lẩu cá linh, bông điên điển'},
  {id:'tour-detail-food-vinhhy',cat:'food',type:'restaurant',x:944,y:728,label:'Vĩnh Hy - Hải sản trên nhà bè'},
  {id:'tour-detail-food-culaoc',cat:'food',type:'restaurant',x:894,y:483,label:'Cù Lao Chàm - Hải sản và rau rừng'},
  {id:'tour-detail-food-ninhbinh',cat:'food',type:'restaurant',x:694,y:230,label:'Ninh Bình - Dê núi, cơm cháy'},

  {id:'tour-detail-temple-thienmu',cat:'temple',type:'temple',x:795,y:431,label:'Huế - Chùa Thiên Mụ'},
  {id:'tour-detail-temple-linhung',cat:'temple',type:'temple',x:872,y:454,label:'Đà Nẵng - Linh Ứng Tự Sơn Trà'},
  {id:'tour-detail-temple-minhthanh',cat:'temple',type:'temple',x:828,y:578,label:'Pleiku - Chùa Minh Thành'},
  {id:'tour-detail-temple-linhphuoc',cat:'temple',type:'temple',x:867,y:697,label:'Đà Lạt - Chùa Linh Phước'},
  {id:'tour-detail-temple-vinhtrang',cat:'temple',type:'temple',x:701,y:788,label:'Mỹ Tho - Chùa Vĩnh Tràng'},
  {id:'tour-detail-temple-hoquoc',cat:'temple',type:'temple',x:517,y:807,label:'Phú Quốc - Thiền viện Trúc Lâm Hộ Quốc'},
  {id:'tour-detail-temple-caodai',cat:'temple',type:'temple',x:706,y:734,label:'Tây Ninh - Tòa Thánh Cao Đài'},
  {id:'tour-detail-temple-kienan',cat:'temple',type:'temple',x:655,y:793,label:'Sa Đéc - Chùa Kiến An Cung'},
  {id:'tour-detail-temple-haitang',cat:'temple',type:'temple',x:870,y:460,label:'Cù Lao Chàm - Chùa Hải Tạng'},

  {id:'tour-detail-boat-mytho',cat:'boat',type:'boat',x:724,y:806,label:'Mỹ Tho - Thuyền tham quan 4 cù lao'},
  {id:'tour-detail-boat-hatien',cat:'boat',type:'boat',x:555,y:806,label:'Hà Tiên - Tàu cao tốc đi Phú Quốc'},
  {id:'tour-detail-boat-anthoi',cat:'boat',type:'boat',x:542,y:827,label:'An Thới - Cano Tour 4 đảo'},
  {id:'tour-detail-boat-vinhhy',cat:'boat',type:'boat',x:921,y:711,label:'Vĩnh Hy - Tàu đáy kính tham quan vịnh'},
  {id:'tour-detail-boat-saky',cat:'boat',type:'boat',x:916,y:524,label:'Sa Kỳ - Tàu cao tốc đi Lý Sơn'},
  {id:'tour-detail-boat-cuadai',cat:'boat',type:'boat',x:857,y:486,label:'Cửa Đại - Cano đi Cù Lao Chàm'},
  {id:'tour-detail-boat-trangan',cat:'boat',type:'boat',x:665,y:228,label:'Tràng An - Thuyền tham quan hang động'}
];
const ID_MAP=new Map(ITEMS.map(x=>[x.id,x]));

function prefs(){
  try{return{food:true,temple:true,boat:true,legend:true,...JSON.parse(localStorage.getItem(PREF_KEY)||'{}')}}catch{return{food:true,temple:true,boat:true,legend:true}}
}
function savePrefs(p){try{localStorage.setItem(PREF_KEY,JSON.stringify(p))}catch{}}
function applyVisibility(){
  const p=prefs(),layer=$('foodLayer');
  if(layer){
    layer.querySelectorAll('.food-marker[data-id]').forEach(g=>{
      const cfg=ID_MAP.get(g.dataset.id);if(cfg)g.style.display=p[cfg.cat]?'':'none';
    });
  }
  const legend=$('tourDetailLegend');if(legend)legend.style.display=p.legend?'':'none';
  syncUI(p);
}
function syncUI(p=prefs()){
  if($('showTourDetailFood'))$('showTourDetailFood').checked=!!p.food;
  if($('showTourDetailTemple'))$('showTourDetailTemple').checked=!!p.temple;
  if($('showTourDetailBoat'))$('showTourDetailBoat').checked=!!p.boat;
  if($('showTourDetailLegend'))$('showTourDetailLegend').checked=!!p.legend;
}
function setPref(key,value){const p=prefs();p[key]=!!value;savePrefs(p);applyVisibility()}

function install(){
  if(localStorage.getItem(MARK)==='done')return true;
  const api=window.__VN_FOOD;if(!api||typeof api.addAt!=='function'||typeof api.getAll!=='function'||typeof api.save!=='function'||typeof api.render!=='function')return false;
  try{
    let current=api.getAll()||[];
    for(const cfg of ITEMS){
      if(current.some(x=>x?.id===cfg.id))continue;
      const f=api.addAt(cfg.type,cfg.x,cfg.y);if(!f)throw new Error('Không tạo được '+cfg.label);
      Object.assign(f,{id:cfg.id,type:cfg.type,x:cfg.x,y:cfg.y,size:24,label:cfg.label,showLabel:false,bgColor:cfg.cat==='food'?'#f08a24':cfg.cat==='temple'?'#a9483d':'#2d77b8',iconColor:'#ffffff',textColor:'#333333'});
      current=api.getAll()||[];
    }
    api.save(true);api.render();
    const all=api.getAll()||[];
    const done=ITEMS.every(cfg=>all.some(x=>x?.id===cfg.id));
    if(done)localStorage.setItem(MARK,'done');
    return done;
  }catch(e){console.warn('Không cài được bộ icon chi tiết hành trình',e);return false}
}

function injectUI(){
  if($('tourDetailGroup')){syncUI();return true}
  const controls=document.querySelector('.controls');if(!controls)return false;
  const g=document.createElement('div');g.className='group';g.id='tourDetailGroup';
  g.innerHTML=`<div class="group-title">Chi tiết hành trình</div>
    <label class="check"><input id="showTourDetailFood" type="checkbox" checked> <b>Ăn đặc sản</b> · 7 điểm tiêu biểu</label>
    <label class="check"><input id="showTourDetailTemple" type="checkbox" checked> <b>Tâm linh / chùa</b> · 9 điểm tiêu biểu</label>
    <label class="check"><input id="showTourDetailBoat" type="checkbox" checked> <b>Tàu / Cano</b> · 7 chặng đặc biệt</label>
    <label class="check"><input id="showTourDetailLegend" type="checkbox" checked> Hiện chú giải trên bản đồ</label>
    <div class="row"><button id="showAllTourDetails" class="btn">Hiện tất cả</button><button id="hideAllTourDetails" class="btn">Ẩn chi tiết</button></div>
    <div class="tip">Icon được để nhỏ và ẩn nhãn để bản đồ không rối. Bấm icon để xem tên trong danh sách “Thư viện icon”, có thể kéo chỉnh vị trí như icon bình thường.</div>`;
  const route=$('tourRouteGroup');if(route)route.insertAdjacentElement('afterend',g);else controls.appendChild(g);
  $('showTourDetailFood').addEventListener('change',e=>setPref('food',e.target.checked));
  $('showTourDetailTemple').addEventListener('change',e=>setPref('temple',e.target.checked));
  $('showTourDetailBoat').addEventListener('change',e=>setPref('boat',e.target.checked));
  $('showTourDetailLegend').addEventListener('change',e=>setPref('legend',e.target.checked));
  $('showAllTourDetails').addEventListener('click',()=>{const p=prefs();Object.assign(p,{food:true,temple:true,boat:true,legend:true});savePrefs(p);applyVisibility()});
  $('hideAllTourDetails').addEventListener('click',()=>{const p=prefs();Object.assign(p,{food:false,temple:false,boat:false});savePrefs(p);applyVisibility()});
  syncUI();return true;
}

function svgEl(tag,a={}){const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));return n}
function text(g,x,y,value,size=12,weight=600,fill='#39332d'){const t=svgEl('text',{x,y,'font-family':'Roboto,Arial,sans-serif','font-size':size,'font-weight':weight,fill});t.textContent=value;g.appendChild(t);return t}
function injectLegend(){
  if($('tourDetailLegend'))return true;
  const svg=$('mapSvg');if(!svg)return false;
  const g=svgEl('g',{id:'tourDetailLegend',transform:'translate(1120 72)','pointer-events':'none'});
  g.appendChild(svgEl('rect',{x:0,y:0,width:230,height:112,rx:10,fill:'#fffdf8','fill-opacity':'.94',stroke:'#cdbb9e','stroke-width':'1.2'}));
  text(g,15,23,'KÝ HIỆU HÀNH TRÌNH',13,900,'#4b4035');
  const rows=[['#f08a24','Ăn đặc sản'],['#a9483d','Tâm linh / chùa'],['#2d77b8','Tàu / cano']];
  rows.forEach((r,i)=>{const y=47+i*25;g.appendChild(svgEl('circle',{cx:21,cy:y-4,r:7,fill:r[0],stroke:'#ffffff','stroke-width':'1.5'}));text(g,38,y,r[1],12,700,'#4a443e')});
  svg.appendChild(g);applyVisibility();return true;
}

let observer=null;
function observe(){const layer=$('foodLayer');if(!layer)return false;if(!observer){observer=new MutationObserver(()=>applyVisibility());observer.observe(layer,{childList:true,subtree:true})}applyVisibility();return true}
let tries=0;
function boot(){tries++;const a=install(),b=injectUI(),c=injectLegend(),d=observe();applyVisibility();if(a&&b&&c&&d)return;if(tries<180)setTimeout(boot,120);else console.warn('Bộ chi tiết hành trình chưa sẵn sàng')}

window.__VN_TOUR_DETAIL_MARKERS={items:ITEMS.map(x=>({...x})),apply:applyVisibility,showAll:()=>{const p=prefs();Object.assign(p,{food:true,temple:true,boat:true});savePrefs(p);applyVisibility()},hideAll:()=>{const p=prefs();Object.assign(p,{food:false,temple:false,boat:false});savePrefs(p);applyVisibility()}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,250),{once:true});else setTimeout(boot,250);
})();
