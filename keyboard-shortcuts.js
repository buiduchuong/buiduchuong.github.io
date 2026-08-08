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
let active=null;
let clipboard=null;
let toastTimer=null;

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
  toastTimer=setTimeout(()=>{n.style.opacity='0';n.style.transform='translateY(-4px)'},1250);
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
  }
},true);

window.__VN_SHORTCUTS={copy:copySelected,paste:pasteCopied,getClipboard:()=>clipboard?{...clipboard}:null};
})();