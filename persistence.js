(()=>{
'use strict';

// Bảo vệ bước tải 34 GeoJSON.
// Ngoài timeout mạng, dữ liệu biên được làm nhẹ trước khi giao cho editor.js.
// Mục tiêu: tránh khóa luồng JavaScript khi interiorPoint() quét quá nhiều đỉnh biên.
if(!window.__VN_GEOJSON_FETCH_GUARD){
  window.__VN_GEOJSON_FETCH_GUARD=true;
  const nativeFetch=window.fetch.bind(window);
  const RAW_PREFIX='https://raw.githubusercontent.com/thanglequoc/vietnamese-provinces-database/master/';
  const CDN_PREFIX='https://cdn.jsdelivr.net/gh/thanglequoc/vietnamese-provinces-database@master/';
  const isGeo=url=>typeof url==='string'&&url.startsWith(RAW_PREFIX)&&url.includes('/json/geojson/')&&url.endsWith('.geojson');
  const geoCache=new Map();
  const MAX_ACTIVE=3;
  let active=0;
  const waiters=[];

  const timeoutError=label=>{const e=new Error(label||'GeoJSON timeout');e.name='TimeoutError';return e};
  const deadline=(promise,ms,label)=>new Promise((resolve,reject)=>{
    let settled=false;
    const timer=setTimeout(()=>{if(settled)return;settled=true;reject(timeoutError(label))},ms);
    Promise.resolve(promise).then(
      v=>{if(settled)return;settled=true;clearTimeout(timer);resolve(v)},
      e=>{if(settled)return;settled=true;clearTimeout(timer);reject(e)}
    );
  });

  async function acquire(){
    if(active<MAX_ACTIVE){active++;return}
    await new Promise(resolve=>waiters.push(resolve));
    active++;
  }
  function release(){
    active=Math.max(0,active-1);
    const next=waiters.shift();
    if(next)next();
  }
  function samePoint(a,b){return Array.isArray(a)&&Array.isArray(b)&&a[0]===b[0]&&a[1]===b[1]}
  function thinRing(r,maxPoints=240){
    if(!Array.isArray(r)||r.length<=maxPoints)return r;
    const closed=samePoint(r[0],r[r.length-1]);
    const usable=closed?r.length-1:r.length;
    if(usable<=3)return r;
    const target=Math.max(3,maxPoints-(closed?1:0));
    const out=[];
    let lastIndex=-1;
    for(let i=0;i<target;i++){
      const idx=Math.min(usable-1,Math.round(i*(usable-1)/(target-1)));
      if(idx!==lastIndex){out.push(r[idx]);lastIndex=idx}
    }
    if(closed&&out.length)out.push([out[0][0],out[0][1]]);
    return out.length>=4?out:r;
  }
  function simplifyGeometry(g){
    if(!g||!g.coordinates)return;
    if(g.type==='Polygon')g.coordinates=g.coordinates.map(r=>thinRing(r));
    else if(g.type==='MultiPolygon')g.coordinates=g.coordinates.map(poly=>poly.map(r=>thinRing(r)));
  }
  function simplifyGeoJSON(buffer){
    const text=new TextDecoder().decode(buffer);
    const data=JSON.parse(text);
    if(Array.isArray(data?.features))data.features.forEach(f=>simplifyGeometry(f?.geometry));
    else if(data?.type==='Feature')simplifyGeometry(data.geometry);
    else simplifyGeometry(data);
    return JSON.stringify(data);
  }
  function responseFrom(record){
    return new Response(record.text,{status:record.status,statusText:record.statusText,headers:new Headers(record.headers)});
  }

  async function fetchBuffered(url,init={},ms=6500){
    const ctrl=new AbortController();
    let outerAbort=null;
    if(init?.signal){
      outerAbort=()=>{try{ctrl.abort(init.signal.reason)}catch{ctrl.abort()}};
      if(init.signal.aborted)outerAbort();else init.signal.addEventListener('abort',outerAbort,{once:true});
    }
    try{
      const response=await deadline(nativeFetch(url,{...init,signal:ctrl.signal}),ms,`GeoJSON fetch timeout: ${url}`);
      if(!response.ok)throw new Error(`GeoJSON HTTP ${response.status}`);
      const body=await deadline(response.arrayBuffer(),ms,`GeoJSON body timeout: ${url}`);
      const text=await deadline(Promise.resolve().then(()=>simplifyGeoJSON(body)),2500,`GeoJSON simplify timeout: ${url}`);
      return {text,status:response.status,statusText:response.statusText,headers:[...response.headers.entries()]};
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
    if(geoCache.has(url))return responseFrom(geoCache.get(url));

    await acquire();
    try{
      if(geoCache.has(url))return responseFrom(geoCache.get(url));
      const fallback=url.replace(RAW_PREFIX,CDN_PREFIX);
      const attempts=[
        [fallback,{...init,cache:'no-store'},6500],
        [url,{...init,cache:'no-store'},6500]
      ];
      let lastError=null;
      for(const [u,opt,ms] of attempts){
        try{
          const record=await fetchBuffered(u,opt,ms);
          geoCache.set(url,record);
          return responseFrom(record);
        }catch(err){
          lastError=err;
          console.warn('[GeoJSON] thử nguồn khác:',u,err?.name||err?.message||err);
        }
      }
      // editor.js có try/catch riêng cho từng tỉnh, nên một tỉnh lỗi không được chặn toàn bộ 34 tỉnh.
      throw lastError||new Error('Không tải được GeoJSON');
    }finally{
      release();
    }
  };
}

const KEYS=['vn-map-editor-v4','vn-map-label-config-v2','vn-xuyen-viet-route-v1','vn-map-flags-v1','vn-map-food-v1','vn-map-flag-shapes-v1'];
const DB_NAME='vn-map-editor-safe-storage';
const DB_STORE='backups';
const DB_VERSION=1;
const PENDING_IMPORT_KEY='__vn-map-full-import-pending__';
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
function getAllBackups(){return new Promise(resolve=>{
  if(!db)return resolve([]);
  try{const r=db.transaction(DB_STORE,'readonly').objectStore(DB_STORE).getAll();r.onsuccess=()=>resolve(Array.isArray(r.result)?r.result:[]);r.onerror=()=>resolve([])}catch{resolve([])}
})}
function deleteBackup(key){return new Promise(resolve=>{
  if(!db)return resolve(false);
  try{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).delete(key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);tx.onabort=()=>resolve(false)}catch{resolve(false)}
})}
function restoreBackups(records){return new Promise((resolve,reject)=>{
  if(!db||!Array.isArray(records))return resolve(0);
  const valid=records.filter(r=>r&&typeof r.key==='string'&&typeof r.value==='string');
  if(!valid.length)return resolve(0);
  try{
    const tx=db.transaction(DB_STORE,'readwrite'),store=tx.objectStore(DB_STORE);
    valid.forEach(r=>store.put({key:r.key,value:r.value,updatedAt:Number(r.updatedAt)||Date.now()}));
    tx.oncomplete=()=>resolve(valid.length);tx.onerror=()=>reject(tx.error||new Error('Không ghi được IndexedDB'));tx.onabort=()=>reject(tx.error||new Error('IndexedDB đã hủy thao tác'));
  }catch(e){reject(e)}
})}
async function stageImport(payload){
  if(!db)throw new Error('Trình duyệt không mở được IndexedDB để chuẩn bị nhập dữ liệu.');
  const ok=await putBackup(PENDING_IMPORT_KEY,JSON.stringify(payload));
  if(!ok)throw new Error('Không lưu được bản nhập tạm thời vào IndexedDB.');
  return true
}
async function applyPendingImport(){
  const rec=await getBackup(PENDING_IMPORT_KEY);
  if(!rec?.value)return null;
  let payload;
  try{payload=JSON.parse(rec.value)}catch{await deleteBackup(PENDING_IMPORT_KEY);throw new Error('Bản nhập tạm thời bị lỗi định dạng.')}
  const source=payload?.localStorage;
  if(payload?.format!=='vn-map-browser-backup'||payload?.version!==1||!source||typeof source!=='object'||Array.isArray(source)){await deleteBackup(PENDING_IMPORT_KEY);throw new Error('Bản nhập tạm thời không hợp lệ.')}
  const entries=Object.entries(source).filter(([key,value])=>typeof key==='string'&&typeof value==='string'),previous=new Map(entries.map(([key])=>[key,localStorage.getItem(key)])),written=[];
  try{
    for(const [key,value] of entries){localStorage.setItem(key,value);written.push(key)}
    const records=Array.isArray(payload.indexedDB?.records)?payload.indexedDB.records:[];
    const restored=await restoreBackups(records);
    await deleteBackup(PENDING_IMPORT_KEY);
    return{entries:entries.length,backups:restored}
  }catch(e){
    written.forEach(key=>{const value=previous.get(key);if(value==null)localStorage.removeItem(key);else localStorage.setItem(key,value)});
    await deleteBackup(PENDING_IMPORT_KEY);
    throw e
  }
}
async function restoreMissing(){let count=0;for(const key of KEYS){let value=null;try{value=localStorage.getItem(key)}catch{}if(value!=null){last.set(key,value);continue}const rec=await getBackup(key);if(rec&&typeof rec.value==='string'){try{localStorage.setItem(key,rec.value);last.set(key,rec.value);count++}catch{}}}return count}
async function backupChanged(showStatus=true){const jobs=[];let changed=false;for(const key of KEYS){let value=null;try{value=localStorage.getItem(key)}catch{}if(value==null)continue;if(last.get(key)!==value){last.set(key,value);changed=true;jobs.push(putBackup(key,value))}}if(changed&&showStatus)status('Đang lưu…','saving');if(jobs.length){const ok=(await Promise.all(jobs)).every(Boolean);if(showStatus)status(ok?'✓ Đã lưu an toàn':'✓ Đã lưu trên trình duyệt',ok?'saved':'local')}return changed}
async function backupAll(showStatus=false){const jobs=[];for(const key of KEYS){let value=null;try{value=localStorage.getItem(key)}catch{}if(value!=null){last.set(key,value);jobs.push(putBackup(key,value))}}if(jobs.length){if(showStatus)status('Đang lưu…','saving');const ok=(await Promise.all(jobs)).every(Boolean);if(showStatus)status(ok?'✓ Đã lưu an toàn':'✓ Đã lưu trên trình duyệt',ok?'saved':'local')}}
async function init(){status('Đang kiểm tra bản lưu…','saving');try{db=await openDb()}catch(e){console.warn('IndexedDB unavailable',e)}let imported=null,importError=null;try{imported=await applyPendingImport()}catch(e){importError=e;console.error('Full browser data import failed',e)}const restored=await restoreMissing();await backupAll(false);status(importError?'Không nhập được dữ liệu: '+importError.message:imported?`✓ Đã nhập ${imported.entries} mục dữ liệu và ${imported.backups} bản sao`:restored?`✓ Đã khôi phục ${restored} cấu hình`:'✓ Đã bật lưu an toàn',importError?'error':'saved');try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch{}return{restored,imported,importError,indexedDB:!!db}}
window.__VN_PERSIST_READY=init();
window.__VN_PERSIST={flush:()=>backupAll(true),getAllBackups,restoreBackups,stageImport};
setInterval(()=>backupChanged(true),800);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')backupAll(false)});
window.addEventListener('pagehide',()=>backupAll(false));
window.addEventListener('beforeunload',()=>backupAll(false));
})();
