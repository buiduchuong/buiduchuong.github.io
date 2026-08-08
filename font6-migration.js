(()=>{
'use strict';
const STORE='vn-map-editor-v4';
const MIGRATION='vn-map-label-font6-migrated-v1';
if(localStorage.getItem(MIGRATION)==='1')return;
let tries=0;
const timer=setInterval(()=>{
  tries++;
  try{
    const raw=localStorage.getItem(STORE);
    if(!raw){if(tries>120)clearInterval(timer);return}
    const data=JSON.parse(raw);
    const labels=data&&data.labels;
    const keys=labels&&typeof labels==='object'?Object.keys(labels):[];
    if(keys.length<34){if(tries>120)clearInterval(timer);return}
    keys.forEach(code=>{
      if(labels[code]&&typeof labels[code]==='object')labels[code].fontSize=6;
    });
    localStorage.setItem(STORE,JSON.stringify(data));
    localStorage.setItem(MIGRATION,'1');
    try{window.__VN_PERSIST?.flush?.()}catch{}
    clearInterval(timer);
    setTimeout(()=>location.reload(),120);
  }catch(e){
    console.warn('Không thể chuyển toàn bộ font tỉnh về 6px',e);
    if(tries>120)clearInterval(timer);
  }
},150);
})();
