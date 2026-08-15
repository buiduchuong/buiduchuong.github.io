(()=>{
'use strict';
const KEY='vn-map-note-v1';
const LINE='🚗 Di chuyển bằng ô tô';
try{
  let d={version:3};
  const raw=localStorage.getItem(KEY);
  if(raw){
    try{d=JSON.parse(raw)||d}catch{}
  }
  if(!d||typeof d!=='object')d={version:3};
  const text=String(d.text||'').trimEnd();
  if(!/(^|\n)\s*🚗\s*Di chuyển bằng ô tô\s*($|\n)/iu.test(text)){
    d.text=text?`${text}\n${LINE}`:LINE;
    d.updatedAt=Date.now();
    localStorage.setItem(KEY,JSON.stringify(d));
  }
}catch(e){console.warn('Không thêm được dòng di chuyển bằng ô tô vào ghi chú',e)}
})();
