(()=>{
'use strict';
if(window.__VN_OBJECT_SHORTCUTS)return;
window.__VN_OBJECT_SHORTCUTS=true;

const TYPES={
  flag:{selector:'.flag-marker[data-id]',selected:'.flag-marker.selected[data-id]',duplicate:'duplicateFlag',name:'cờ'},
  shapeFlag:{selector:'.flag-shape-marker[data-id]',selected:'.flag-shape-marker.selected[data-id]',duplicate:'duplicateShapeFlag',name:'shape cờ'},
  icon:{selector:'.food-marker[data-id]',selected:'.food-marker.selected[data-id]',duplicate:'duplicateFoodItem',name:'icon'},
  line:{selector:'.editor-line[data-id]',selected:'.editor-line.selected[data-id]',duplicate:'duplicateLine',name:'đường/mũi tên'}
};
const HISTORY_KEYS=['vn-map-editor-v4','vn-map-label-config-v2','vn-xuyen-viet-route-v1','vn-map-flags-v1','vn-map-food-v1','vn-map-flag-shapes-v1'];
const HISTORY_DB='vn-map-editor-undo-history';
const HISTORY_STORE='history';
const HISTORY_ID='main';
const MAX_HISTORY=30;
const GROUP_MS=650;
let active=null;
let clipboard=null;
let toastTimer=null;
let history=[];
let historyIndex=-1;
let lastHistoryAt=0;
let historyDb=null;
let historyReady=false;
let persistTimer=null;

function typingTarget(){
  const a=document.activeElement;
  return !!a&&(a.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(a.tagName));
}
function escAttr(v){return String(v).replace(/\\/g,'\\\\').replace(/"/g,'\\"')}
function nodeFor(kind,id){const t=TYPES[kind];return t?document.querySelector(`${t.selector}[data-id="${escAttr(id)}"]`):null}
function selectedFor(kind){const t=TYPES[kind];return t?document.querySelector(t.selected):null}
function findFromTarget(target){
  if(!(target instanceof Element))return null;
  for(const [kind,t] of Object.entries(TYPES)){
    const n=target.closest(t.selector);
    if(n)return{kind,id:n.dataset.id};
  }
  return null;
}
function currentObject(){
  if(active&&nodeFor(active.kind,active.id))return active;
  for(const kind of ['shapeFlag','flag','icon','line']){
    const n=selectedFor(kind);
    if(n)return{kind,id:n.dataset.id};
  }
  return null;
}
function friendlyName(obj){
  if(!obj)return'đối tượng';
  if(obj.kind==='flag'){
    const opt=document.querySelector('#flagSelect option:checked');
    return opt?.textContent?.trim()||'cờ';
  }
  if(obj.kind==='shapeFlag'){
    const opt=document.querySelector('#shapeFlagSelect option:checked');
    return opt?.textContent?.replace(/^\d+\.\s*/,'')?.trim()||'shape cờ';
  }
  if(obj.kind==='icon'){
    const opt=document.querySelector('#foodSelect option:checked');
    return opt?.textContent?.replace(/^\d+\.\s*/,'')?.trim()||'icon';
  }
  return'đường/mũi tên';
}
function toast(text){
  let n=document.getElementById('objectShortcutToast');
  if(!n){
    n=document.createElement('div');
    n.id='objectShortcutToast';
    Object.assign(n.style,{position:'fixed',right:'18px',top:'18px',zIndex:'99999',background:'rgba(30,30,30,.92)',color:'#fff',padding:'9px 13px',borderRadius:'9px',font:'600 12px Roboto,Arial,sans-serif',boxShadow:'0 4px 18px rgba(0,0,0,.18)',pointerEvents:'none',opacity:'0',transform:'translateY(-4px)',transition:'opacity .16s ease,transform .16s ease'});
    document.body.appendChild(n);
  }
  n.textContent=text;
  n.style.opacity='1';
  n.style.transform='translateY(0)';
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{n.style.opacity='0';n.style.transform='translateY(-4px)'},1400);
}
function selectSource(obj){
  const n=nodeFor(obj.kind,obj.id);
  if(!n)return false;
  try{n.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}))}catch{n.click?.()}
  return true;
}
function copySelected(){
  const obj=currentObject();
  if(!obj)return false;
  clipboard={...obj,name:friendlyName(obj)};
  active={...obj};
  toast(`Đã sao chép ${clipboard.name} · Ctrl+V để dán`);
  return true;
}
function pasteCopied(){
  if(!clipboard)return false;
  if(!selectSource(clipboard)){
    toast('Đối tượng gốc không còn tồn tại. Hãy Ctrl+C lại.');
    clipboard=null;
    return false;
  }
  const t=TYPES[clipboard.kind],btn=document.getElementById(t.duplicate);
  if(!btn){toast('Chưa thể nhân bản đối tượng này.');return false}
  btn.click();
  requestAnimationFrame(()=>{
    const n=selectedFor(clipboard.kind);
    if(n?.dataset.id){
      active={kind:clipboard.kind,id:n.dataset.id};
      clipboard={kind:clipboard.kind,id:n.dataset.id,name:friendlyName(active)};
    }
    toast(`Đã dán ${clipboard?.name||t.name}`);
  });
  return true;
}

function snapshot(){
  const s={};
  for(const key of HISTORY_KEYS){
    try{s[key]=localStorage.getItem(key)}catch{s[key]=null}
  }
  return s;
}
function sameSnapshot(a,b){
  if(!a||!b)return false;
  return HISTORY_KEYS.every(k=>a[k]===b[k]);
}
function applySnapshot(s){
  for(const key of HISTORY_KEYS){
    try{if(s[key]==null)localStorage.removeItem(key);else localStorage.setItem(key,s[key])}catch(e){console.warn('Không khôi phục được',key,e)}
  }
}
function openHistoryDb(){
  return new Promise(resolve=>{
    if(!window.indexedDB)return resolve(null);
    const r=indexedDB.open(HISTORY_DB,1);
    r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(HISTORY_STORE))r.result.createObjectStore(HISTORY_STORE,{keyPath:'id'})};
    r.onsuccess=()=>resolve(r.result);
    r.onerror=()=>resolve(null);
  });
}
function readHistory(){
  return new Promise(resolve=>{
    if(!historyDb)return resolve(null);
    try{const r=historyDb.transaction(HISTORY_STORE,'readonly').objectStore(HISTORY_STORE).get(HISTORY_ID);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>resolve(null)}catch{resolve(null)}
  });
}
function writeHistory(){
  if(!historyDb)return Promise.resolve(false);
  return new Promise(resolve=>{
    try{
      const tx=historyDb.transaction(HISTORY_STORE,'readwrite');
      tx.objectStore(HISTORY_STORE).put({id:HISTORY_ID,history,index:historyIndex,updatedAt:Date.now()});
      tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);tx.onabort=()=>resolve(false);
    }catch{resolve(false)}
  });
}
function scheduleHistoryPersist(){
  clearTimeout(persistTimer);
  persistTimer=setTimeout(()=>writeHistory(),500);
}
function trimHistory(){
  if(history.length<=MAX_HISTORY)return;
  const cut=history.length-MAX_HISTORY;
  history.splice(0,cut);
  historyIndex=Math.max(0,historyIndex-cut);
}
function captureNow(forceSeparate=false){
  if(!historyReady)return false;
  const cur=snapshot();
  const base=history[historyIndex];
  if(base&&sameSnapshot(cur,base))return false;
  if(historyIndex<history.length-1)history.splice(historyIndex+1);
  const now=Date.now();
  if(!forceSeparate&&historyIndex>=1&&now-lastHistoryAt<GROUP_MS){
    history[historyIndex]=cur;
  }else{
    history.push(cur);
    historyIndex=history.length-1;
  }
  lastHistoryAt=now;
  trimHistory();
  scheduleHistoryPersist();
  return true;
}
async function undo(){
  if(!historyReady)return false;
  captureNow(false);
  if(historyIndex<=0){toast('Không còn thao tác để hoàn tác.');return false}
  historyIndex--;
  applySnapshot(history[historyIndex]);
  await writeHistory();
  try{sessionStorage.setItem('vn-map-history-toast','↶ Đã hoàn tác · Ctrl+Y để làm lại')}catch{}
  location.reload();
  return true;
}
async function redo(){
  if(!historyReady)return false;
  if(historyIndex>=history.length-1){toast('Không còn thao tác để làm lại.');return false}
  historyIndex++;
  applySnapshot(history[historyIndex]);
  await writeHistory();
  try{sessionStorage.setItem('vn-map-history-toast','↷ Đã làm lại · Ctrl+Z để hoàn tác')}catch{}
  location.reload();
  return true;
}
async function initHistory(){
  historyDb=await openHistoryDb();
  const saved=await readHistory();
  const cur=snapshot();
  if(saved&&Array.isArray(saved.history)&&saved.history.length){
    history=saved.history.filter(x=>x&&typeof x==='object').slice(-MAX_HISTORY);
    historyIndex=Math.max(0,Math.min(Number(saved.index)||0,history.length-1));
    if(!sameSnapshot(cur,history[historyIndex])){
      if(historyIndex<history.length-1)history.splice(historyIndex+1);
      history.push(cur);historyIndex=history.length-1;trimHistory();
    }
  }else{
    history=[cur];historyIndex=0;
  }
  lastHistoryAt=Date.now();
  historyReady=true;
  await writeHistory();
  try{
    const msg=sessionStorage.getItem('vn-map-history-toast');
    if(msg){sessionStorage.removeItem('vn-map-history-toast');setTimeout(()=>toast(msg),250)}
  }catch{}
}

document.addEventListener('pointerdown',e=>{
  const obj=findFromTarget(e.target);
  if(obj)active=obj;
},true);
document.addEventListener('click',e=>{
  const obj=findFromTarget(e.target);
  if(obj)active=obj;
},true);

document.addEventListener('keydown',e=>{
  if(typingTarget())return;
  const mod=e.ctrlKey||e.metaKey;
  if(!mod||e.altKey)return;
  const key=String(e.key||'').toLowerCase();
  if(key==='c'){
    if(copySelected())e.preventDefault();
  }else if(key==='v'){
    if(pasteCopied())e.preventDefault();
  }else if(key==='z'&&!e.shiftKey){
    e.preventDefault();undo();
  }else if(key==='y'||(key==='z'&&e.shiftKey)){
    e.preventDefault();redo();
  }
},true);

setInterval(()=>captureNow(false),300);
window.addEventListener('pagehide',()=>{captureNow(true);writeHistory()});
initHistory();
window.__VN_SHORTCUTS={copy:copySelected,paste:pasteCopied,undo,redo,getClipboard:()=>clipboard?{...clipboard}:null,getHistory:()=>({index:historyIndex,total:history.length})};
})();