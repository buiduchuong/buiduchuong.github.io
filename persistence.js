(()=>{
'use strict';

// Bảo vệ bước tải 34 GeoJSON: raw.githubusercontent.com đôi lúc giữ request quá lâu.
// Mỗi request có timeout + retry/fallback; nếu vẫn lỗi editor.js sẽ tự bỏ qua tỉnh đó
// và tiếp tục tăng tiến độ thay vì kẹt vô hạn ở 25/34, 26/34...
if(!window.__VN_GEOJSON_FETCH_GUARD){
  window.__VN_GEOJSON_FETCH_GUARD=true;
  const nativeFetch=window.fetch.bind(window);
  const RAW_PREFIX='https://raw.githubusercontent.com/thanglequoc/vietnamese-provinces-database/master/';
  const CDN_PREFIX='https://cdn.jsdelivr.net/gh/thanglequoc/vietnamese-provinces-database@master/';
  const isGeo=url=>typeof url==='string'&&url.startsWith(RAW_PREFIX)&&url.includes('/json/geojson/')&&url.endsWith('.geojson');
  const withTimeout=(url,init,ms)=>new Promise((resolve,reject)=>{
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(new DOMException('GeoJSON request timeout','TimeoutError')),ms);
    let outerAbort=null;
    if(init?.signal){
      outerAbort=()=>ctrl.abort(init.signal.reason||new DOMException('Aborted','AbortError'));
      if(init.signal.aborted)outerAbort();else init.signal.addEventListener('abort',outerAbort,{once:true});
    }
    nativeFetch(url,{...init,signal:ctrl.signal}).then(resolve,reject).finally(()=>{
      clearTimeout(timer);
      if(init?.signal&&outerAbort)init.signal.removeEventListener('abort',outerAbort);
    });
  });
  window.fetch=async function(input,init={}){
    const url=typeof input==='string'?input:input?.url;
    if(!isGeo(url))return nativeFetch(input,init);
    const fallback=url.replace(RAW_PREFIX,CDN_PREFIX);
    const attempts=[
      [url,{...init,cache:'no-store'},5500],
      [url,{...init,cache:'reload'},5500],
      [fallback,{...init,cache:'no-store'},6500]
    ];
    let lastError=null;
    for(const [u,opt,timeout] of attempts){
      try{
        const r=await withTimeout(u,opt,timeout);
        if(r.ok)return r;
        lastError=new Error(`GeoJSON HTTP ${r.status}`);
      }catch(err){lastError=err;console.warn('GeoJSON retry:',u,err?.name||err)}
    }
    throw lastError||new Error('Không tải được GeoJSON');
  };
}

const KEYS=['vn-map-editor-v4','vn-map-label-config-v2','vn-xuyen-viet-route-v1','vn-map-flags-v1','vn-map-food-v1','vn-map-flag-shapes-v1'];
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