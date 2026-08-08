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
const state={title:'GHI CHÚ',text:'',x:36,y:730,width:365,fontSize:16,bg:'#fff0c9',color:'#222222',border:'#555555',borderWidth:2,drag:null,saveTimer:null};
let db=null;
let observer=null;

function color(v,d){return /^#[0-9a-f]{6}$/i.test(v||'')?v:d}
function readEditorPickup(){
  try{const d=JSON.parse(localStorage.getItem('vn-map-editor-v4')||'{}');return d?.pickup||null}catch{return null}
}
function normalize(d={}){
  const old=readEditorPickup();
  return{
    title:String(d.title??'GHI CHÚ').slice(0,120),
    text:String(d.text??''),
    x:Number.isFinite(Number(d.x))?Number(d.x):(Number(old?.x)||36),
    y:Number.isFinite(Number(d.y))?Number(d.y):(Number(old?.y)||730),
    width:clamp(Number(d.width)||365,220,760),
    fontSize:clamp(Number(d.fontSize)||16,8,32),
    bg:color(d.bg,'#fff0c9'),
    color:color(d.color,'#222222'),
    border:color(d.border,'#555555'),
    borderWidth:clamp(Number(d.borderWidth)||2,0,8)
  };
}
function applyData(d){Object.assign(state,normalize(d))}
function loadLocal(){try{const raw=localStorage.getItem(STORE);if(raw)applyData(JSON.parse(raw));else applyData({})}catch{applyData({})}}
function snapshot(){return{version:1,title:state.title,text:state.text,x:state.x,y:state.y,width:state.width,fontSize:state.fontSize,bg:state.bg,color:state.color,border:state.border,borderWidth:state.borderWidth,updatedAt:Date.now()}}

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
function noteLayout(){
  const pad=18,titleSize=Math.max(16,state.fontSize+5),lineH=state.fontSize*1.38,maxTextW=state.width-pad*2;
  const body=wrapText(state.text,maxTextW,`${state.fontSize}px ${FONT}`);
  const title=String(state.title||'').trim();
  const titleBlock=title?titleSize*1.45:0;
  const bodyBlock=Math.max(lineH,body.length*lineH);
  const height=clamp(pad+titleBlock+(title&&state.text?6:0)+bodyBlock+pad,105,760);
  return{pad,titleSize,lineH,body,title,height};
}
function render(){
  if(!showToggle.checked){layer.replaceChildren();return}
  const L=noteLayout(),g=el('g',{class:'pickup-card note-card','data-note-owned':'1',transform:`translate(${state.x} ${state.y})`});
  g.appendChild(el('rect',{x:0,y:0,width:state.width,height:L.height,rx:8,ry:8,fill:state.bg,stroke:state.border,'stroke-width':state.borderWidth}));
  let y=L.pad;
  if(L.title){
    y+=L.titleSize;
    const t=el('text',{x:L.pad,y,'font-family':FONT,'font-size':L.titleSize,'font-weight':800,fill:state.color});t.textContent=L.title;g.appendChild(t);
    y+=6;
  }
  const body=el('text',{x:L.pad,y:y+state.fontSize,'font-family':FONT,'font-size':state.fontSize,'font-weight':500,fill:state.color});
  L.body.forEach((line,i)=>{const sp=el('tspan',{x:L.pad,dy:i===0?0:L.lineH});sp.textContent=line||' ';body.appendChild(sp)});
  g.appendChild(body);
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
  const vals={noteTitle:state.title,noteText:state.text,noteWidth:Math.round(state.width),noteFontSize:state.fontSize,noteBg:state.bg,noteColor:state.color,noteBorder:state.border,noteBorderWidth:state.borderWidth,noteX:Math.round(state.x),noteY:Math.round(state.y)};
  Object.entries(vals).forEach(([id,v])=>{const n=$(id);if(n&&n.value!==String(v))n.value=v});
}
function setField(key,v){
  if(key==='title')state.title=String(v).slice(0,120);
  else if(key==='text')state.text=String(v);
  else if(key==='width')state.width=clamp(Number(v)||365,220,760);
  else if(key==='fontSize')state.fontSize=clamp(Number(v)||16,8,32);
  else if(['bg','color','border'].includes(key))state[key]=color(v,state[key]);
  else if(key==='borderWidth')state.borderWidth=clamp(Number(v)||0,0,8);
  else if(key==='x'||key==='y'){const n=Number(v);if(Number.isFinite(n))state[key]=n;else return}
  save();render();syncUI()
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
  group.innerHTML=`<div class="group-title">Ghi chú</div><label>Tiêu đề</label><input id="noteTitle" type="text" placeholder="GHI CHÚ"><label style="margin-top:8px">Nội dung ghi chú</label><textarea id="noteText" rows="7" placeholder="Dán hoặc nhập ghi chú tại đây…\nHỗ trợ: ★ • → ✓ © ™ ⏰ 📍 😀"></textarea><div class="tip">Có thể Ctrl+V nội dung từ Word, Zalo, Excel hoặc website. Ký tự Unicode, dấu, emoji và ký hiệu đặc biệt được giữ nguyên.</div><div class="row"><div><label>Chiều rộng</label><input id="noteWidth" type="number" min="220" max="760" step="5"></div><div><label>Cỡ chữ</label><input id="noteFontSize" type="number" min="8" max="32" step="1"></div></div><div class="row"><div><label>Màu nền</label><input id="noteBg" type="color"></div><div><label>Màu chữ</label><input id="noteColor" type="color"></div></div><div class="row"><div><label>Màu viền</label><input id="noteBorder" type="color"></div><div><label>Độ dày viền</label><input id="noteBorderWidth" type="number" min="0" max="8" step="0.5"></div></div><div class="row"><div><label>X</label><input id="noteX" type="number" step="1"></div><div><label>Y</label><input id="noteY" type="number" step="1"></div></div><div class="row"><button id="centerNote" class="btn">Đưa vào giữa</button><button id="clearNote" class="btn danger">Xóa nội dung</button></div><div class="tip">Ô ghi chú tự tăng chiều cao theo nội dung và có thể kéo trực tiếp trên bản đồ. Ghi chú được xuất cùng SVG / PNG / PDF.</div>`;
  target.insertAdjacentElement('beforebegin',group);
  [['noteTitle','title'],['noteText','text'],['noteWidth','width'],['noteFontSize','fontSize'],['noteBg','bg'],['noteColor','color'],['noteBorder','border'],['noteBorderWidth','borderWidth'],['noteX','x'],['noteY','y']].forEach(([id,key])=>$(id)?.addEventListener('input',e=>setField(key,e.target.value)));
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
window.__VN_NOTE={render,save,get:()=>JSON.parse(JSON.stringify(snapshot()))};
})();
