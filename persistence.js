(()=>{
'use strict';
const KEYS=['vn-map-editor-v4','vn-map-label-config-v2','vn-xuyen-viet-route-v1'];
const DB_NAME='vn-map-editor-safe-storage';
const DB_STORE='backups';
const DB_VERSION=1;
let db=null;
const last=new Map();

function status(text,state='saved'){
  const n=document.getElementById('saveStatus');
  if(!n)return;
  n.textContent=text;
  n.dataset.state=state;
}
function openDb(){return new Promise((resolve,reject)=>{
  if(!window.indexedDB)return resolve(null);
  const r=indexedDB.open(DB_NAME,DB_VERSION);
  r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(DB_STORE))r.result.createObjectStore(DB_STORE,{keyPath:'key'})};
  r.onsuccess=()=>resolve(r.result);
  r.onerror=()=>reject(r.error);
})}
function getBackup(key){return new Promise(resolve=>{
  if(!db)return resolve(null);
  try{const r=db.transaction(DB_STORE,'readonly').objectStore(DB_STORE).get(key);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>resolve(null)}catch{resolve(null)}
})}
function putBackup(key,value){return new Promise(resolve=>{
  if(!db)return resolve(false);
  try{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put({key,value,updatedAt:Date.now()});tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);tx.onabort=()=>resolve(false)}catch{resolve(false)}
})}
async function restoreMissing(){let count=0;for(const key of KEYS){let value=null;try{value=localStorage.getItem(key)}catch{}if(value!=null){last.set(key,value);continue}const rec=await getBackup(key);if(rec&&typeof rec.value==='string'){try{localStorage.setItem(key,rec.value);last.set(key,rec.value);count++}catch{}}}return count}
async function backupChanged(showStatus=true){const jobs=[];let changed=false;for(const key of KEYS){let value=null;try{value=localStorage.getItem(key)}catch{}if(value==null)continue;if(last.get(key)!==value){last.set(key,value);changed=true;jobs.push(putBackup(key,value))}}if(changed&&showStatus)status('Đang lưu…','saving');if(jobs.length){const ok=(await Promise.all(jobs)).every(Boolean);if(showStatus)status(ok?'✓ Đã lưu an toàn':'✓ Đã lưu trên trình duyệt',ok?'saved':'local')}return changed}
async function backupAll(showStatus=false){const jobs=[];for(const key of KEYS){let value=null;try{value=localStorage.getItem(key)}catch{}if(value!=null){last.set(key,value);jobs.push(putBackup(key,value))}}if(jobs.length){if(showStatus)status('Đang lưu…','saving');const ok=(await Promise.all(jobs)).every(Boolean);if(showStatus)status(ok?'✓ Đã lưu an toàn':'✓ Đã lưu trên trình duyệt',ok?'saved':'local')}}
async function init(){status('Đang kiểm tra bản lưu…','saving');try{db=await openDb()}catch(e){console.warn('IndexedDB unavailable',e)}const restored=await restoreMissing();await backupAll(false);status(restored?`✓ Đã khôi phục ${restored} cấu hình`:'✓ Đã bật lưu an toàn','saved');try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch{}return{restored,indexedDB:!!db}}
window.__VN_PERSIST_READY=init();
window.__VN_PERSIST={flush:()=>backupAll(true)};
setInterval(()=>backupChanged(true),800);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')backupAll(false)});
window.addEventListener('pagehide',()=>backupAll(false));
window.addEventListener('beforeunload',()=>backupAll(false));
})();
