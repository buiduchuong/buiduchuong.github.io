(()=>{
'use strict';

// Bảo vệ bước tải 34 GeoJSON.
// Quan trọng: không chỉ timeout phần nhận header, mà buffer TOÀN BỘ body trong timeout.
// Khi trả Response cho editor.js thì r.json() chỉ parse dữ liệu đã tải xong, không còn chờ mạng.
if(!window.__VN_GEOJSON_FETCH_GUARD){
  window.__VN_GEOJSON_FETCH_GUARD=true;
  const nativeFetch=window.fetch.bind(window);
  const RAW_PREFIX='https://raw.githubusercontent.com/thanglequoc/vietnamese-provinces-database/master/';
  const CDN_PREFIX='https://cdn.jsdelivr.net/gh/thanglequoc/vietnamese-provinces-database@master/';
  const isGeo=url=>typeof url==='string'&&url.startsWith(RAW_PREFIX)&&url.includes('/json/geojson/')&&url.endsWith('.geojson');

  const timeoutError=label=>{const e=new Error(label||'GeoJSON timeout');e.name='TimeoutError';return e};
  const deadline=(promise,ms,label)=>new Promise((resolve,reject)=>{
    let settled=false;
    const timer=setTimeout(()=>{if(settled)return;settled=true;reject(timeoutError(label))},ms);
    Promise.resolve(promise).then(
      v=>{if(settled)return;settled=true;clearTimeout(timer);resolve(v)},
      e=>{if(settled)return;settled=true;clearTimeout(timer);reject(e)}
    );
  });

  async function fetchBuffered(url,init={},ms=5000){
    const ctrl=new AbortController();
    let outerAbort=null;
    if(init?.signal){
      outerAbort=()=>{try{ctrl.abort(init.signal.reason)}catch{ctrl.abort()}};
      if(init.signal.aborted)outerAbort();else init.signal.addEventListener('abort',outerAbort,{once:true});
    }
    let response;
    try{
      response=await deadline(nativeFetch(url,{...init,signal:ctrl.signal}),ms,`GeoJSON fetch timeout: ${url}`);
      if(!response.ok)throw new Error(`GeoJSON HTTP ${response.status}`);
      const body=await deadline(response.arrayBuffer(),ms,`GeoJSON body timeout: ${url}`);
      const headers=new Headers(response.headers);
      return new Response(body,{status:response.status,statusText:response.statusText,headers});
    }catch(err){
      try{ctrl.abort()}catch{}
      throw err;
    }finally{
      if(init?.signal&&outerAbort)try{init.signal.removeEventListener('abort',outerAbort)}catch{}
    }
  }

  window.fetch=async function(input,init={}){
    const url=typeof input==='string'?input:input?.url;
    if(!isGeo(url))return nativeFetch(input,init);

    const fallback=url.replace(RAW_PREFIX,CDN_PREFIX);
    // Ưu tiên jsDelivr để tránh raw.githubusercontent bị nghẽn; sau đó thử raw GitHub.
    // Mỗi lượt có hard deadline cho CẢ header và body.
    const attempts=[
      [fallback,{...init,cache:'no-store'},4500],
      [url,{...init,cache:'no-store'},4500]
    ];
    let lastError=null;
    for(const [u,opt,ms] of attempts){
      try{return await fetchBuffered(u,opt,ms)}
      catch(err){lastError=err;console.warn('[GeoJSON] thử nguồn khác:',u,err?.name||err?.message||err)}
    }
    // editor.js đã có try/catch cho từng tỉnh; throw ở đây để worker tăng done và tiếp tục.
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