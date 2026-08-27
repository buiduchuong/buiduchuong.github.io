(()=>{
'use strict';
if(window.__VN_NOTE_TOOL)return;
window.__VN_NOTE_TOOL=true;

const NS='http://www.w3.org/2000/svg';
const STORE='vn-map-note-v1';
const DB_NAME='vn-map-editor-safe-storage';
const DB_STORE='backups';
const $=id=>document.getElementById(id);
const svg=$('mapSvg'),layer=$('pickupLayer'),canvas=$('canvas'),showToggle=$('showPickup');
if(!svg||!layer||!canvas||!showToggle)return;

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,String(v)));return n};
const FONT='Roboto, Arial, "Segoe UI Symbol", "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
const ICON_FONT='Roboto, Arial, "Segoe UI Symbol", "Noto Sans Symbols 2", sans-serif';
const DEFAULT_ICON_COLORS={departure:'#e51d49',xvRoute:'#d71945',pickupRoute:'#e51d49',order:'#e51d49',food:'#f08a24',visit:'#d24b58',stay:'#3f79c5',other:'#222222'};
const CHECKIN_PRESET=`## 1. BẮC TRUNG BỘ & BẮC BỘ
01 Quảng Bình – Vũng Chùa Đảo Yến
02 Quảng Bình – Động Phong Nha
35 Quảng Trị – Nghĩa trang Trường Sơn
36 Hà Tĩnh – Ngã Ba Đồng Lộc
37 Nghệ An – Làng Sen
38 Ninh Bình – Tràng An
## 2. DUYÊN HẢI MIỀN TRUNG
03 Đà Nẵng – Bà Nà Hills
04 Hội An – Rừng Dừa Bảy Mẫu
05 Bình Định – Eo Gió
06 Bình Định – Bảo tàng Quang Trung
24 Bình Thuận – Mũi Né
25 Bình Thuận – Bàu Trắng
26 Ninh Thuận – Vịnh Vĩnh Hy
27 Khánh Hòa – VinWonders
28 Khánh Hòa – Suối Hoa Lan
29 Phú Yên – Vịnh Vũng Rô
30 Phú Yên – Gành Đá Dĩa
31 Quảng Ngãi – Đảo Lý Sơn
32 Quảng Nam – Tượng đài Mẹ Thứ
33 Quảng Nam – Cù Lao Chàm
34 Đà Nẵng – Núi Thần Tài
## 3. TÂY NGUYÊN
07 Kon Tum – Cửa khẩu Bờ Y
08 Gia Lai – Biển Hồ T’Nưng
09 Gia Lai – Chùa Minh Thành
10 Đắk Lắk – Thác Dray Sáp
11 Đắk Nông – Tà Đùng
12 Đà Lạt – Hồ Tuyền Lâm
13 Đà Lạt – Fresh Garden
14 Đà Lạt – Chùa Linh Phước
## 4. NAM BỘ
15 Tiền Giang – Cù lao Thới Sơn
16 Cà Mau – Đất Mũi
17 Kiên Giang – U Minh Thượng
18 An Giang – Rừng Tràm Trà Sư
19 Đồng Tháp – Tràm Chim
20 Đồng Tháp – Làng hoa Sa Đéc
21 TP.HCM – Landmark 81
22 Tây Ninh – Núi Bà Đen
23 Vũng Tàu – Mũi Nghinh Phong`;
const state={title:'GHI CHÚ',text:'',x:36,y:730,width:300,fontSize:16,iconScale:1.35,bg:'#fff0c9',color:'#222222',border:'#555555',borderWidth:2,iconColors:{...DEFAULT_ICON_COLORS},drag:null,saveTimer:null};
let db=null;
let observer=null;

function color(v,d){return /^#[0-9a-f]{6}$/i.test(v||'')?v:d}
function readEditorPickup(){
  try{const d=JSON.parse(localStorage.getItem('vn-map-editor-v4')||'{}');return d?.pickup||null}catch{return null}
}
function normalizeIconColors(v={}){
  const out={};
  Object.keys(DEFAULT_ICON_COLORS).forEach(k=>out[k]=color(v?.[k],DEFAULT_ICON_COLORS[k]));
  return out;
}
function normalize(d={}){
  const old=readEditorPickup();
  const version=Number(d.version)||0;
  const rawWidth=Number.isFinite(Number(d.width))?Number(d.width):300;
  return{
    title:String(d.title??'GHI CHÚ').slice(0,120),
    text:String(d.text??''),
    x:Number.isFinite(Number(d.x))?Number(d.x):(Number(old?.x)||36),
    y:Number.isFinite(Number(d.y))?Number(d.y):(Number(old?.y)||730),
    width:clamp(version<3?Math.min(rawWidth,300):rawWidth,180,650),
    fontSize:clamp(Number(d.fontSize)||16,8,32),
    iconScale:clamp(Number(d.iconScale)||1.35,.8,2.2),
    bg:color(d.bg,'#fff0c9'),
    color:color(d.color,'#222222'),
    border:color(d.border,'#555555'),
    borderWidth:clamp(Number(d.borderWidth)||2,0,8),
    iconColors:normalizeIconColors(d.iconColors)
  };
}
function applyData(d){const n=normalize(d);Object.assign(state,n);state.iconColors={...n.iconColors}}
function loadLocal(){try{const raw=localStorage.getItem(STORE);if(raw)applyData(JSON.parse(raw));else applyData({})}catch{applyData({})}}
function snapshot(){return{version:3,title:state.title,text:state.text,x:state.x,y:state.y,width:state.width,fontSize:state.fontSize,iconScale:state.iconScale,bg:state.bg,color:state.color,border:state.border,borderWidth:state.borderWidth,iconColors:{...state.iconColors},updatedAt:Date.now()}}

function openDb(){return new Promise(resolve=>{
  if(!window.indexedDB)return resolve(null);
  try{
    const r=indexedDB.open(DB_NAME,1);
    r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(DB_STORE))r.result.createObjectStore(DB_STORE,{keyPath:'key'})};
    r.onsuccess=()=>resolve(r.result);
    r.onerror=()=>resolve(null);
  }catch{resolve(null)}
})}
function getBackup(){return new Promise(resolve=>{
  if(!db)return resolve(null);
  try{const r=db.transaction(DB_STORE,'readonly').objectStore(DB_STORE).get(STORE);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>resolve(null)}catch{resolve(null)}
})}
function putBackup(value){return new Promise(resolve=>{
  if(!db)return resolve(false);
  try{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put({key:STORE,value,updatedAt:Date.now()});tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);tx.onabort=()=>resolve(false)}catch{resolve(false)}
})}
async function initBackup(){
  db=await openDb();
  let local=null;try{local=localStorage.getItem(STORE)}catch{}
  if(local==null){const rec=await getBackup();if(rec?.value){try{localStorage.setItem(STORE,rec.value);applyData(JSON.parse(rec.value))}catch{}}}
  save(true);
}
function save(flush=false){
  const value=JSON.stringify(snapshot());
  try{localStorage.setItem(STORE,value)}catch(e){console.warn('Không lưu được ghi chú',e)}
  clearTimeout(state.saveTimer);
  if(flush)putBackup(value);else state.saveTimer=setTimeout(()=>putBackup(value),450);
}

const measureCanvas=document.createElement('canvas');
const measureCtx=measureCanvas.getContext('2d');
function graphemes(s){
  try{if(Intl?.Segmenter)return[...new Intl.Segmenter('vi',{granularity:'grapheme'}).segment(s)].map(x=>x.segment)}catch{}
  return Array.from(s);
}
function breakToken(token,maxWidth,font){
  measureCtx.font=font;const out=[];let cur='';
  for(const ch of graphemes(token)){const next=cur+ch;if(cur&&measureCtx.measureText(next).width>maxWidth){out.push(cur);cur=ch}else cur=next}
  if(cur||!out.length)out.push(cur);return out;
}
function wrapText(text,maxWidth,font){
  measureCtx.font=font;const result=[];
  String(text??'').replace(/\r\n?/g,'\n').split('\n').forEach(raw=>{
    if(raw===''){result.push('');return}
    const words=raw.split(/(\s+)/).filter(Boolean);let line='';
    for(const word of words){
      const candidate=line+word;
      if(!line||measureCtx.measureText(candidate).width<=maxWidth){line=candidate;continue}
      if(line.trim())result.push(line.replace(/\s+$/,''));
      if(measureCtx.measureText(word).width<=maxWidth){line=word.replace(/^\s+/,'')}
      else{const parts=breakToken(word,maxWidth,font);result.push(...parts.slice(0,-1));line=parts.at(-1)||''}
    }
    result.push(line.replace(/\s+$/,''));
  });
  return result.length?result:[''];
}

function legendInfo(line){
  const raw=String(line||'');
  const s=raw.trimStart();
  if(!s)return null;
  if(/^★\s*/u.test(s))return{kind:'departure',symbol:'★',rest:s.replace(/^★\s*/u,''),type:'symbol'};
  if(/^(━━|──|—{2,}|━{2,})\s*/u.test(s))return{kind:'xvRoute',symbol:'━━',rest:s.replace(/^(━━|──|—{2,}|━{2,})\s*/u,''),type:'line'};
  if(/^(---+|–{2,}|-{2,})\s*/u.test(s))return{kind:'pickupRoute',symbol:'---',rest:s.replace(/^(---+|–{2,}|-{2,})\s*/u,''),type:'dash'};
  if(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/u.test(s))return{kind:'order',symbol:s.match(/^[①②③④⑤⑥⑦⑧⑨⑩]/u)?.[0]||'①',rest:s.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/u,''),type:'symbol'};
  if(/^(🍴|🍽|♨|☕)\s*/u.test(s))return{kind:'food',symbol:'♨',rest:s.replace(/^(🍴|🍽|♨|☕)\s*/u,''),type:'food'};
  if(/^(🏛️?|⛩️?|🛕|⌂)\s*/u.test(s))return{kind:'visit',symbol:'◆',rest:s.replace(/^(🏛️?|⛩️?|🛕|⌂)\s*/u,''),type:'visit'};
  if(/^(🏨|🛏️?|▣)\s*/u.test(s))return{kind:'stay',symbol:'▣',rest:s.replace(/^(🏨|🛏️?|▣)\s*/u,''),type:'stay'};
  return null;
}
function noteLayout(){
  const pad=12,titleSize=Math.max(15,state.fontSize+3),lineH=state.fontSize*1.48,maxTextW=state.width-pad*2;
  const body=wrapText(state.text,maxTextW,`${state.fontSize}px ${FONT}`);
  const title=String(state.title||'').trim();
  const titleBlock=title?titleSize*1.22:0;
  const bodyBlock=Math.max(lineH,body.length*lineH);
  const height=clamp(pad+titleBlock+(title&&state.text?4:0)+bodyBlock+pad,95,720);
  return{pad,titleSize,lineH,body,title,height};
}
function renderLegendLine(g,line,y,L){
  const info=legendInfo(line);
  if(!info)return false;
  const iconColor=state.iconColors[info.kind]||state.iconColors.other;
  const scale=state.iconScale;
  const iconX=L.pad+state.fontSize*.62*scale;
  const textX=L.pad+state.fontSize*(1.55+.55*scale);
  if(info.type==='line'||info.type==='dash'){
    const y0=y-state.fontSize*.28;
    g.appendChild(el('line',{x1:L.pad,y1:y0,x2:L.pad+state.fontSize*1.55*scale,y2:y0,stroke:iconColor,'stroke-width':Math.max(2.8,state.fontSize*.22*scale),'stroke-linecap':'round','stroke-dasharray':info.type==='dash'?`${Math.max(4,state.fontSize*.42*scale)} ${Math.max(2.5,state.fontSize*.28*scale)}`:''}));
  }else if(info.type==='food'){
    const c=el('circle',{cx:iconX,cy:y-state.fontSize*.34,r:state.fontSize*.58*scale,fill:iconColor});g.appendChild(c);
    const t=el('text',{x:iconX,y:y-state.fontSize*.03,'text-anchor':'middle','font-family':ICON_FONT,'font-size':state.fontSize*.74*scale,'font-weight':900,fill:'#ffffff'});t.textContent='↟';g.appendChild(t);
  }else if(info.type==='visit'){
    const w=state.fontSize*1.02*scale,h=state.fontSize*.94*scale;
    const r=el('rect',{x:iconX-w/2,y:y-state.fontSize*.84*scale,width:w,height:h,rx:state.fontSize*.16*scale,fill:iconColor});g.appendChild(r);
    const t=el('text',{x:iconX,y:y-state.fontSize*.08,'text-anchor':'middle','font-family':ICON_FONT,'font-size':state.fontSize*.72*scale,'font-weight':900,fill:'#ffffff'});t.textContent='⌂';g.appendChild(t);
  }else if(info.type==='stay'){
    const w=state.fontSize*1.04*scale,h=state.fontSize*.9*scale;
    const r=el('rect',{x:iconX-w/2,y:y-state.fontSize*.82*scale,width:w,height:h,rx:state.fontSize*.13*scale,fill:iconColor});g.appendChild(r);
    const t=el('text',{x:iconX,y:y-state.fontSize*.1,'text-anchor':'middle','font-family':ICON_FONT,'font-size':state.fontSize*.64*scale,'font-weight':900,fill:'#ffffff'});t.textContent='H';g.appendChild(t);
  }else{
    const t=el('text',{x:iconX,y:y+state.fontSize*.06,'text-anchor':'middle','font-family':ICON_FONT,'font-size':state.fontSize*.98*scale,'font-weight':900,fill:iconColor});t.textContent=info.symbol;t.setAttribute('style','font-variant-emoji:text');g.appendChild(t);
  }
  const tx=el('text',{x:textX,y,'font-family':FONT,'font-size':state.fontSize,'font-weight':500,fill:state.color});tx.textContent=info.rest||' ';g.appendChild(tx);
  return true;
}
function checkinColor(number=0,title=''){
  if(/TÂY NGUYÊN/i.test(title)||(number>=7&&number<=14))return'#c87518';
  if(/NAM BỘ/i.test(title)||(number>=15&&number<=23))return'#278247';
  if(/BẮC TRUNG BỘ|BẮC BỘ/i.test(title)||[1,2,35,36,37,38].includes(number))return'#70409b';
  return'#246aa4';
}
function renderCheckinLine(g,line,y,L){
  const raw=String(line||'').trim(),header=raw.match(/^##\s*(.+)$/u);
  if(header){
    const color=checkinColor(0,header[1]),h=state.fontSize*1.34,top=y-state.fontSize*.98;
    g.appendChild(el('rect',{x:L.pad,y:top,width:state.width-L.pad*2,height:h,rx:h*.3,ry:h*.3,fill:color,'fill-opacity':.13}));
    const t=el('text',{x:L.pad+state.fontSize*.55,y:y-state.fontSize*.02,'font-family':FONT,'font-size':state.fontSize*.92,'font-weight':900,fill:color});t.textContent=header[1];g.appendChild(t);return true
  }
  const item=raw.match(/^(\d{2})\s+(.+)$/u);if(!item)return false;
  const number=Number(item[1]),color=checkinColor(number),r=state.fontSize*.55,cx=L.pad+r,cy=y-state.fontSize*.34;
  g.appendChild(el('circle',{cx,cy,r,fill:color}));
  const badge=el('text',{x:cx,y:cy+state.fontSize*.2,'text-anchor':'middle','font-family':FONT,'font-size':state.fontSize*.55,'font-weight':900,fill:'#ffffff'});badge.textContent=item[1];g.appendChild(badge);
  const text=el('text',{x:L.pad+state.fontSize*1.48,y,'font-family':FONT,'font-size':state.fontSize,'font-weight':550,fill:state.color});text.textContent=item[2];g.appendChild(text);return true
}
function render(){
  if(!showToggle.checked){layer.replaceChildren();return}
  const L=noteLayout(),g=el('g',{class:'pickup-card note-card','data-note-owned':'1',transform:`translate(${state.x} ${state.y})`});
  g.appendChild(el('rect',{x:0,y:0,width:state.width,height:L.height,rx:7,ry:7,fill:state.bg,stroke:state.border,'stroke-width':state.borderWidth}));
  let y=L.pad;
  if(L.title){
    y+=L.titleSize;
    const t=el('text',{x:L.pad,y,'font-family':FONT,'font-size':L.titleSize,'font-weight':800,fill:state.color});t.textContent=L.title;g.appendChild(t);
    y+=4;
  }
  const firstY=y+state.fontSize;
  let plainGroup=null;
  L.body.forEach((line,i)=>{
    const yy=firstY+i*L.lineH;
    if(renderCheckinLine(g,line,yy,L))return;
    if(renderLegendLine(g,line,yy,L))return;
    if(!plainGroup){plainGroup=el('text',{x:L.pad,y:firstY,'font-family':FONT,'font-size':state.fontSize,'font-weight':500,fill:state.color});g.appendChild(plainGroup)}
    const sp=el('tspan',{x:L.pad,y:yy});sp.textContent=line||' ';plainGroup.appendChild(sp);
  });
  const hint=el('title');hint.textContent='Kéo để di chuyển ghi chú';g.appendChild(hint);
  g.addEventListener('pointerdown',startDrag);
  layer.replaceChildren(g);
}
function clientToSvg(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const m=svg.getScreenCTM();if(!m)return[0,0];const q=p.matrixTransform(m.inverse());return[q.x,q.y]}
function startDrag(e){
  if(e.button!==0)return;e.preventDefault();e.stopPropagation();const p=clientToSvg(e);state.drag={pointerId:e.pointerId,dx:p[0]-state.x,dy:p[1]-state.y};try{svg.setPointerCapture(e.pointerId)}catch{}
}
function moveDrag(e){
  if(!state.drag||e.pointerId!==state.drag.pointerId)return;e.preventDefault();e.stopPropagation();const p=clientToSvg(e);state.x=p[0]-state.drag.dx;state.y=p[1]-state.drag.dy;render();syncPosition();save(false)
}
function endDrag(e){
  if(!state.drag||e.pointerId!==state.drag.pointerId)return;e.preventDefault();e.stopPropagation();const id=state.drag.pointerId;state.drag=null;try{svg.releasePointerCapture(id)}catch{}save(true);syncUI()
}
function centerNote(){const r=canvas.getBoundingClientRect(),p=svg.createSVGPoint();p.x=r.left+r.width/2;p.y=r.top+r.height/2;const q=p.matrixTransform(svg.getScreenCTM().inverse()),L=noteLayout();state.x=q.x-state.width/2;state.y=q.y-L.height/2;save();render();syncUI()}
function syncPosition(){if($('noteX'))$('noteX').value=Math.round(state.x);if($('noteY'))$('noteY').value=Math.round(state.y)}
function syncUI(){
  const iconPct=Math.round(state.iconScale*100);
  const vals={noteTitle:state.title,noteText:state.text,noteWidth:Math.round(state.width),noteFontSize:state.fontSize,noteIconScaleRange:iconPct,noteIconScale:iconPct,noteBg:state.bg,noteColor:state.color,noteBorder:state.border,noteBorderWidth:state.borderWidth,noteX:Math.round(state.x),noteY:Math.round(state.y),noteIconDeparture:state.iconColors.departure,noteIconXvRoute:state.iconColors.xvRoute,noteIconPickupRoute:state.iconColors.pickupRoute,noteIconOrder:state.iconColors.order,noteIconFood:state.iconColors.food,noteIconVisit:state.iconColors.visit,noteIconStay:state.iconColors.stay};
  Object.entries(vals).forEach(([id,v])=>{const n=$(id);if(n&&n.value!==String(v))n.value=v});
}
function setField(key,v){
  if(key==='title')state.title=String(v).slice(0,120);
  else if(key==='text')state.text=String(v);
  else if(key==='width')state.width=clamp(Number(v)||300,180,650);
  else if(key==='fontSize')state.fontSize=clamp(Number(v)||16,8,32);
  else if(key==='iconScale')state.iconScale=clamp((Number(v)||135)/100,.8,2.2);
  else if(['bg','color','border'].includes(key))state[key]=color(v,state[key]);
  else if(key.startsWith('icon.')){const k=key.slice(5);if(k in state.iconColors)state.iconColors[k]=color(v,state.iconColors[k]);else return}
  else if(key==='borderWidth')state.borderWidth=clamp(Number(v)||0,0,8);
  else if(key==='x'||key==='y'){const n=Number(v);if(Number.isFinite(n))state[key]=n;else return}
  save();render();syncUI()
}
function resetIconColors(){state.iconColors={...DEFAULT_ICON_COLORS};save();render();syncUI()}
function applyCheckinPreset(){
  if(state.text.trim()&&!confirm('Thay nội dung ghi chú hiện tại bằng mẫu 38 điểm check-in?'))return;
  Object.assign(state,{title:'38 ĐIỂM CHECK-IN XUYÊN VIỆT',text:CHECKIN_PRESET,x:18,y:18,width:410,fontSize:10,bg:'#fffdf3',color:'#263845',border:'#60746f',borderWidth:1.5});
  showToggle.checked=true;showToggle.dispatchEvent(new Event('change',{bubbles:true}));save(true);render();syncUI()
}
function renameOldToggle(){
  const lab=showToggle.closest('label');if(!lab)return;
  [...lab.childNodes].forEach(n=>{if(n.nodeType===Node.TEXT_NODE&&n.textContent.trim())n.textContent=' Hiện ghi chú'});
}
function injectUI(){
  if($('noteEditorGroup'))return;
  renameOldToggle();
  const target=showToggle.closest('.group');if(!target)return;
  const group=document.createElement('div');group.className='group';group.id='noteEditorGroup';
  group.innerHTML=`<div class="group-title">Ghi chú</div><button id="applyCheckinPreset" class="btn primary" type="button" style="width:100%;margin-bottom:9px">Tạo ghi chú 38 điểm check-in</button><label>Tiêu đề</label><input id="noteTitle" type="text" placeholder="GHI CHÚ"><label style="margin-top:8px">Nội dung ghi chú</label><textarea id="noteText" rows="7" placeholder="Dán hoặc nhập ghi chú tại đây…\nHỗ trợ: ★ • → ✓ © ™ ⏰ 📍 😀"></textarea><div class="tip">Dòng bắt đầu bằng ## là tiêu đề vùng; dòng bắt đầu bằng số 01–38 sẽ tự tạo huy hiệu màu như mẫu.</div><details id="noteLegendColors" style="margin-top:9px"><summary style="cursor:pointer;font-size:11px;font-weight:800;color:#5d554e">Màu icon / ký hiệu trong ghi chú</summary><div class="row"><div><label>★ Điểm tập kết</label><input id="noteIconDeparture" type="color"></div><div><label>━━ Tuyến Xuyên Việt</label><input id="noteIconXvRoute" type="color"></div></div><div class="row"><div><label>--- Tuyến về Hà Nội</label><input id="noteIconPickupRoute" type="color"></div><div><label>① Thứ tự hành trình</label><input id="noteIconOrder" type="color"></div></div><div class="row"><div><label>Ăn uống</label><input id="noteIconFood" type="color"></div><div><label>Tham quan</label><input id="noteIconVisit" type="color"></div></div><div class="row"><div><label>Lưu trú</label><input id="noteIconStay" type="color"></div><div><label>&nbsp;</label><button id="resetNoteIconColors" class="btn" type="button" style="width:100%">Màu mặc định</button></div></div><div class="tip">Các dòng bắt đầu bằng ★, ━━, ---, ①, 🍴/🍽, 🏛/🛕 hoặc 🏨/🛏 sẽ tự tách ký hiệu ra để tô màu riêng; phần chữ vẫn dùng “Màu chữ”.</div></details><div class="row"><div><label>Chiều rộng bảng</label><input id="noteWidth" type="number" min="180" max="650" step="5"></div><div><label>Cỡ chữ</label><input id="noteFontSize" type="number" min="8" max="32" step="1"></div></div><label style="margin-top:8px">Kích thước icon</label><div class="value-line"><input id="noteIconScaleRange" type="range" min="80" max="220" step="5"><input id="noteIconScale" type="number" min="80" max="220" step="5"></div><div class="tip">100% = cỡ cũ. Mặc định mới 135% để icon nổi bật hơn trong bảng nhỏ.</div><div class="row"><div><label>Màu nền</label><input id="noteBg" type="color"></div><div><label>Màu chữ</label><input id="noteColor" type="color"></div></div><div class="row"><div><label>Màu viền</label><input id="noteBorder" type="color"></div><div><label>Độ dày viền</label><input id="noteBorderWidth" type="number" min="0" max="8" step="0.5"></div></div><div class="row"><div><label>X</label><input id="noteX" type="number" step="1"></div><div><label>Y</label><input id="noteY" type="number" step="1"></div></div><div class="row"><button id="centerNote" class="btn">Đưa vào giữa</button><button id="clearNote" class="btn danger">Xóa nội dung</button></div><div class="tip">Ô ghi chú tự tăng chiều cao theo nội dung và có thể kéo trực tiếp trên bản đồ. Ghi chú được xuất cùng SVG / PNG / PDF.</div>`;
  target.insertAdjacentElement('beforebegin',group);
  [['noteTitle','title'],['noteText','text'],['noteWidth','width'],['noteFontSize','fontSize'],['noteIconScaleRange','iconScale'],['noteIconScale','iconScale'],['noteBg','bg'],['noteColor','color'],['noteBorder','border'],['noteBorderWidth','borderWidth'],['noteX','x'],['noteY','y'],['noteIconDeparture','icon.departure'],['noteIconXvRoute','icon.xvRoute'],['noteIconPickupRoute','icon.pickupRoute'],['noteIconOrder','icon.order'],['noteIconFood','icon.food'],['noteIconVisit','icon.visit'],['noteIconStay','icon.stay']].forEach(([id,key])=>$(id)?.addEventListener('input',e=>setField(key,e.target.value)));
  $('resetNoteIconColors')?.addEventListener('click',resetIconColors);
  $('applyCheckinPreset')?.addEventListener('click',applyCheckinPreset);
  $('centerNote')?.addEventListener('click',centerNote);
  $('clearNote')?.addEventListener('click',()=>{state.text='';save();render();syncUI();$('noteText')?.focus()});
  syncUI();
}

showToggle.addEventListener('change',()=>{render();save()});
svg.addEventListener('pointermove',moveDrag,true);
svg.addEventListener('pointerup',endDrag,true);
svg.addEventListener('pointercancel',endDrag,true);
window.addEventListener('pagehide',()=>save(true));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save(true)});
observer=new MutationObserver(()=>{const own=layer.querySelector(':scope > .note-card[data-note-owned="1"]');if(showToggle.checked&&!own)render();else if(!showToggle.checked&&layer.children.length)layer.replaceChildren()});
observer.observe(layer,{childList:true});

loadLocal();injectUI();render();initBackup().then(()=>{injectUI();render();syncUI()});
window.__VN_NOTE={render,save,get:()=>JSON.parse(JSON.stringify(snapshot())),resetIconColors};
})();
