(()=>{
'use strict';
if(window.__VN_CHECKIN_NOTE_TOOL)return;
window.__VN_CHECKIN_NOTE_TOOL=true;

const NS='http://www.w3.org/2000/svg';
const STORE='vn-map-checkin-note-v1';
const $=id=>document.getElementById(id);
const svg=$('mapSvg'),viewport=$('viewport'),canvas=$('canvas');
if(!svg||!viewport||!canvas)return;
const FONT='Roboto, Arial, sans-serif';
const PROVINCE_FONT_WEIGHT=700;
const GROUPS=[
 {title:'1. BẮC TRUNG BỘ & BẮC BỘ',color:'#70409b',items:[[1,'Quảng Bình – Vũng Chùa Đảo Yến'],[2,'Quảng Bình – Động Phong Nha'],[35,'Quảng Trị – Nghĩa trang Trường Sơn'],[36,'Hà Tĩnh – Ngã Ba Đồng Lộc'],[37,'Nghệ An – Làng Sen'],[38,'Ninh Bình – Tràng An']]},
 {title:'2. DUYÊN HẢI MIỀN TRUNG',color:'#246aa4',items:[[3,'Đà Nẵng – Bà Nà Hills'],[4,'Hội An – Rừng Dừa Bảy Mẫu'],[5,'Bình Định – Eo Gió'],[6,'Bình Định – Bảo tàng Quang Trung'],[24,'Bình Thuận – Mũi Né'],[25,'Bình Thuận – Bàu Trắng'],[26,'Ninh Thuận – Vịnh Vĩnh Hy'],[27,'Khánh Hòa – VinWonders'],[28,'Khánh Hòa – Suối Hoa Lan'],[29,'Phú Yên – Vịnh Vũng Rô'],[30,'Phú Yên – Gành Đá Dĩa'],[31,'Quảng Ngãi – Đảo Lý Sơn'],[32,'Quảng Nam – Tượng đài Mẹ Thứ'],[33,'Quảng Nam – Cù Lao Chàm'],[34,'Đà Nẵng – Núi Thần Tài']]},
 {title:'3. TÂY NGUYÊN',color:'#c87518',items:[[7,'Kon Tum – Cửa khẩu Bờ Y'],[8,'Gia Lai – Biển Hồ T’Nưng'],[9,'Gia Lai – Chùa Minh Thành'],[10,'Đắk Lắk – Thác Dray Sáp'],[11,'Đắk Nông – Tà Đùng'],[12,'Đà Lạt – Hồ Tuyền Lâm'],[13,'Đà Lạt – Fresh Garden'],[14,'Đà Lạt – Chùa Linh Phước']]},
 {title:'4. NAM BỘ',color:'#278247',items:[[15,'Tiền Giang – Cù lao Thới Sơn'],[16,'Cà Mau – Đất Mũi'],[17,'Kiên Giang – U Minh Thượng'],[18,'An Giang – Rừng Tràm Trà Sư'],[19,'Đồng Tháp – Tràm Chim'],[20,'Đồng Tháp – Làng hoa Sa Đéc'],[21,'TP.HCM – Landmark 81'],[22,'Tây Ninh – Núi Bà Đen'],[23,'Vũng Tàu – Mũi Nghinh Phong']]}
];
const DEFAULT_TITLE='38 ĐIỂM CHECK-IN XUYÊN VIỆT';
const LEGACY_GROUPED_TEXT=GROUPS.map(g=>`## ${g.title}\n${g.items.map(([n,label])=>`${String(n).padStart(2,'0')} ${label}`).join('\n')}`).join('\n');
const DEFAULT_TEXT=GROUPS.flatMap(g=>g.items).sort((a,b)=>a[0]-b[0]).map(([n,label])=>`${String(n).padStart(2,'0')} ${label}`).join('\n');
const PALETTE=GROUPS.map(g=>g.color);
const defaults={version:4,visible:false,title:DEFAULT_TITLE,text:DEFAULT_TEXT,x:18,y:18,width:410,fontSize:16,bg:'#fffdf3',color:'#263845',border:'#60746f',borderWidth:1.5};
const state={...defaults,drag:null,saveTimer:null};
let layer=$('checkinNoteLayer');
if(!layer){layer=document.createElementNS(NS,'g');layer.id='checkinNoteLayer';layer.dataset.exportLayer='checkin-note';viewport.appendChild(layer)}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const color=(v,d)=>/^#[0-9a-f]{6}$/i.test(v||'')?v:d;
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,String(v)));return n};
function normalize(d={}){return{version:4,visible:d.visible===true,title:String(d.title??DEFAULT_TITLE).slice(0,120),text:String(d.text??DEFAULT_TEXT),x:Number.isFinite(Number(d.x))?Number(d.x):defaults.x,y:Number.isFinite(Number(d.y))?Number(d.y):defaults.y,width:clamp(Number(d.width)||defaults.width,300,620),fontSize:clamp(Number(d.fontSize)||defaults.fontSize,8,16),bg:color(d.bg,defaults.bg),color:color(d.color,defaults.color),border:color(d.border,defaults.border),borderWidth:clamp(Number(d.borderWidth)||defaults.borderWidth,.5,6)}}
function sortedText(text){const items=String(text||'').replace(/\r\n?/g,'\n').split('\n').map(line=>{const m=line.trim().match(/^(\d{1,3})\s+(.+)$/u);return m?{number:Number(m[1]),text:m[2]}:null}).filter(Boolean);if(!items.length)return'';items.sort((a,b)=>a.number-b.number);return items.map(item=>`${String(item.number).padStart(2,'0')} ${item.text}`).join('\n')}
function isComplete38(text){const numbers=String(text||'').replace(/\r\n?/g,'\n').split('\n').map(line=>line.trim().match(/^(\d{1,3})\s+(.+)$/u)).filter(Boolean).map(m=>Number(m[1]));return numbers.length===38&&new Set(numbers).size===38&&numbers.every(n=>n>=1&&n<=38)}
function load(){try{const raw=JSON.parse(localStorage.getItem(STORE)||'{}'),oldVersion=Number(raw.version)||0;Object.assign(state,normalize(raw));let changed=false;if(oldVersion<3&&(state.text===LEGACY_GROUPED_TEXT||isComplete38(state.text))){state.text=sortedText(state.text);changed=true}if(oldVersion<4&&(raw.fontSize==null||Number(raw.fontSize)===10)){state.fontSize=defaults.fontSize;changed=true}if(changed)localStorage.setItem(STORE,JSON.stringify(snapshot()))}catch{Object.assign(state,defaults)}}
function snapshot(){return{...normalize(state),updatedAt:Date.now()}}
function save(flush=false){try{localStorage.setItem(STORE,JSON.stringify(snapshot()))}catch(e){console.warn('Không lưu được ghi chú 38 điểm',e)}clearTimeout(state.saveTimer);if(flush)window.__VN_PERSIST?.flush?.();else state.saveTimer=setTimeout(()=>window.__VN_PERSIST?.flush?.(),450)}
function contentRows(){let section=-1,color=PALETTE[0];const rows=[],lines=String(state.text||'').replace(/\r\n?/g,'\n').split('\n'),first=lines.findIndex(x=>x.trim()),last=lines.findLastIndex(x=>x.trim());lines.forEach((raw,i)=>{const line=raw.trim();if(!line){if(i>first&&i<last)rows.push({type:'spacer'});return}const header=line.match(/^##\s*(.+)$/u);if(header){section++;color=PALETTE[section%PALETTE.length];rows.push({type:'header',text:header[1],color});return}const item=line.match(/^(\d{1,3})\s+(.+)$/u);if(item){rows.push({type:'item',number:item[1],text:item[2],color});return}rows.push({type:'text',text:line,color})});return rows}
function layout(){const pad=12,titleSize=state.fontSize+4,rowH=state.fontSize*1.46,sectionH=state.fontSize*1.52,spacerH=state.fontSize*.72,rows=contentRows(),height=pad+(state.title.trim()?titleSize*1.25+7:0)+rows.reduce((h,row)=>h+(row.type==='header'?sectionH:row.type==='spacer'?spacerH:rowH),0)+pad;return{pad,titleSize,rowH,sectionH,spacerH,rows,height:clamp(height,80,1400)}}
function appendText(g,attrs,text){const t=el('text',attrs);t.textContent=text;g.appendChild(t);return t}
function render(){
 layer.replaceChildren();if(!state.visible){syncUI();return}
 const L=layout(),g=el('g',{class:'checkin-note-card',transform:`translate(${state.x} ${state.y})`,'data-checkin-note-owned':'1'});
 g.appendChild(el('rect',{x:0,y:0,width:state.width,height:L.height,rx:9,ry:9,fill:state.bg,stroke:state.border,'stroke-width':state.borderWidth}));
 let y=L.pad;
 if(state.title.trim()){y+=L.titleSize;appendText(g,{x:state.width/2,y,'text-anchor':'middle','font-family':FONT,'font-size':L.titleSize,'font-weight':PROVINCE_FONT_WEIGHT,fill:state.color},state.title.trim());y+=7}
 for(const row of L.rows){
   if(row.type==='spacer'){y+=L.spacerH;continue}
   if(row.type==='header'){const top=y+state.fontSize*.12;g.appendChild(el('rect',{x:L.pad,y:top,width:state.width-L.pad*2,height:state.fontSize*1.28,rx:4,ry:4,fill:row.color,'fill-opacity':.14}));y+=state.fontSize*1.08;appendText(g,{x:L.pad+6,y,'font-family':FONT,'font-size':state.fontSize*.92,'font-weight':PROVINCE_FONT_WEIGHT,fill:row.color},row.text);y+=L.sectionH-state.fontSize*1.08;continue}
   y+=L.rowH;
   if(row.type==='text'){appendText(g,{x:L.pad,y,'font-family':FONT,'font-size':state.fontSize,'font-weight':PROVINCE_FONT_WEIGHT,fill:state.color},row.text);continue}
   const r=state.fontSize*.55,cx=L.pad+r,cy=y-state.fontSize*.34;g.appendChild(el('circle',{cx,cy,r,fill:row.color}));appendText(g,{x:cx,y:cy+state.fontSize*.2,'text-anchor':'middle','font-family':FONT,'font-size':state.fontSize*.54,'font-weight':PROVINCE_FONT_WEIGHT,fill:'#ffffff'},String(row.number).padStart(2,'0'));
   appendText(g,{x:L.pad+state.fontSize*1.48,y,'font-family':FONT,'font-size':state.fontSize,'font-weight':PROVINCE_FONT_WEIGHT,fill:state.color},row.text)
 }
 const hint=el('title');hint.textContent='Kéo để di chuyển ghi chú 38 điểm';g.appendChild(hint);g.addEventListener('pointerdown',startDrag);layer.appendChild(g);syncUI()
}
function clientToWorld(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const m=viewport.getScreenCTM();if(!m)return[0,0];const q=p.matrixTransform(m.inverse());return[q.x,q.y]}
function startDrag(e){if(e.button!==0)return;e.preventDefault();e.stopPropagation();const p=clientToWorld(e);state.drag={pointerId:e.pointerId,dx:p[0]-state.x,dy:p[1]-state.y};try{svg.setPointerCapture(e.pointerId)}catch{}}
function moveDrag(e){if(!state.drag||e.pointerId!==state.drag.pointerId)return;const p=clientToWorld(e);state.x=p[0]-state.drag.dx;state.y=p[1]-state.drag.dy;render();save(false)}
function endDrag(e){if(!state.drag||e.pointerId!==state.drag.pointerId)return;state.drag=null;try{svg.releasePointerCapture(e.pointerId)}catch{}save(true);syncUI()}
function center(){const r=canvas.getBoundingClientRect(),p=svg.createSVGPoint();p.x=r.left+r.width/2;p.y=r.top+r.height/2;const m=viewport.getScreenCTM();if(!m)return;const q=p.matrixTransform(m.inverse()),L=layout();state.x=q.x-state.width/2;state.y=q.y-L.height/2;state.visible=true;save(true);render()}
function show(){state.visible=true;save(true);render()}
function hide(){state.visible=false;save(true);render()}
function resetLayout(){if(!confirm('Đưa vị trí, kích thước và màu của ghi chú 38 điểm về mặc định?'))return;Object.assign(state,{x:defaults.x,y:defaults.y,width:defaults.width,fontSize:defaults.fontSize,bg:defaults.bg,color:defaults.color,border:defaults.border,borderWidth:defaults.borderWidth,visible:true});save(true);render()}
function resetContent(){if(!confirm('Khôi phục tiêu đề và toàn bộ 38 địa điểm về nội dung mẫu?'))return;state.title=DEFAULT_TITLE;state.text=DEFAULT_TEXT;state.visible=true;save(true);render();syncUI()}
function sortContent(){const text=sortedText(state.text);if(!text){alert('Không tìm thấy dòng địa điểm bắt đầu bằng số.');return}state.text=text;state.visible=true;save(true);render();syncUI()}
function setField(key,value){if(key==='visible')state.visible=!!value;else if(key==='title')state.title=String(value).slice(0,120);else if(key==='text')state.text=String(value);else if(key==='width')state.width=clamp(Number(value)||defaults.width,300,620);else if(key==='fontSize')state.fontSize=clamp(Number(value)||defaults.fontSize,8,16);else if(['bg','color','border'].includes(key))state[key]=color(value,state[key]);else if(key==='borderWidth')state.borderWidth=clamp(Number(value)||defaults.borderWidth,.5,6);else if(key==='x'||key==='y'){const n=Number(value);if(!Number.isFinite(n))return;state[key]=n}save();render()}
function syncUI(){const vals={showCheckinNote:state.visible,checkinNoteTitle:state.title,checkinNoteText:state.text,checkinNoteWidth:Math.round(state.width),checkinNoteFontSize:state.fontSize,checkinNoteBg:state.bg,checkinNoteColor:state.color,checkinNoteBorder:state.border,checkinNoteBorderWidth:state.borderWidth,checkinNoteX:Math.round(state.x),checkinNoteY:Math.round(state.y)};Object.entries(vals).forEach(([id,v])=>{const n=$(id);if(!n)return;if(n.type==='checkbox')n.checked=!!v;else if(n.value!==String(v))n.value=v})}
function injectUI(){
 if($('checkinNoteEditorGroup'))return;const anchor=$('noteEditorGroup')||[...document.querySelectorAll('.group')].find(g=>g.querySelector('.group-title')?.textContent?.trim()==='Hiển thị & lưu');if(!anchor)return;
 const group=document.createElement('div');group.className='group';group.id='checkinNoteEditorGroup';group.innerHTML=`<div class="group-title">Ghi chú mới · 38 điểm check-in</div><div class="row"><button id="showCheckinNoteButton" class="btn primary" type="button">Tạo / hiện ghi chú</button><button id="hideCheckinNoteButton" class="btn" type="button">Ẩn ghi chú</button></div><label class="check"><input id="showCheckinNote" type="checkbox"> Hiện ghi chú 38 điểm</label><label style="margin-top:8px">Tiêu đề ghi chú</label><input id="checkinNoteTitle" type="text" maxlength="120"><label style="margin-top:8px">Nội dung ghi chú</label><textarea id="checkinNoteText" rows="14"></textarea><div class="tip">Mỗi địa điểm bắt đầu bằng số như <b>01</b>, <b>02</b>… sẽ tự tạo huy hiệu màu. Dòng trống tạo khoảng cách thật trên ghi chú.</div><div class="row"><button id="sortCheckinNoteContent" class="btn primary" type="button">Sắp xếp 01 → 38</button><button id="resetCheckinNoteContent" class="btn" type="button">Khôi phục mẫu</button></div><div class="row"><div><label>Chiều rộng</label><input id="checkinNoteWidth" type="number" min="300" max="620" step="5"></div><div><label>Cỡ chữ</label><input id="checkinNoteFontSize" type="number" min="8" max="16" step="1"></div></div><div class="row"><div><label>Màu nền</label><input id="checkinNoteBg" type="color"></div><div><label>Màu chữ</label><input id="checkinNoteColor" type="color"></div></div><div class="row"><div><label>Màu viền</label><input id="checkinNoteBorder" type="color"></div><div><label>Độ dày viền</label><input id="checkinNoteBorderWidth" type="number" min="0.5" max="6" step="0.5"></div></div><div class="row"><div><label>X</label><input id="checkinNoteX" type="number" step="1"></div><div><label>Y</label><input id="checkinNoteY" type="number" step="1"></div></div><div class="row"><button id="centerCheckinNote" class="btn" type="button">Đưa vào giữa</button><button id="resetCheckinNote" class="btn" type="button">Về bố cục gốc</button></div><div class="tip">Đây là ghi chú thứ hai độc lập, không thay ghi chú hiện có. Có thể kéo trực tiếp và xuất cùng SVG / PNG / PDF.</div>`;
 anchor.insertAdjacentElement('beforebegin',group);$('showCheckinNoteButton').addEventListener('click',show);$('hideCheckinNoteButton').addEventListener('click',hide);$('showCheckinNote').addEventListener('change',e=>setField('visible',e.target.checked));$('centerCheckinNote').addEventListener('click',center);$('resetCheckinNote').addEventListener('click',resetLayout);$('sortCheckinNoteContent').addEventListener('click',sortContent);$('resetCheckinNoteContent').addEventListener('click',resetContent);
 [['checkinNoteTitle','title'],['checkinNoteText','text'],['checkinNoteWidth','width'],['checkinNoteFontSize','fontSize'],['checkinNoteBg','bg'],['checkinNoteColor','color'],['checkinNoteBorder','border'],['checkinNoteBorderWidth','borderWidth'],['checkinNoteX','x'],['checkinNoteY','y']].forEach(([id,key])=>$(id).addEventListener('input',e=>setField(key,e.target.value)));syncUI()
}
svg.addEventListener('pointermove',moveDrag,true);svg.addEventListener('pointerup',endDrag,true);svg.addEventListener('pointercancel',endDrag,true);window.addEventListener('pagehide',()=>save(true));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save(true)});
load();injectUI();render();
window.__VN_CHECKIN_NOTE={show,hide,render,save,center,get:()=>JSON.parse(JSON.stringify(snapshot()))};
})();
