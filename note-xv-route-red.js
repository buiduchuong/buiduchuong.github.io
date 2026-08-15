(()=>{
'use strict';
const KEY='vn-map-note-v1';
const RED='#d71945';
try{
 const raw=localStorage.getItem(KEY);
 if(!raw)return;
 const d=JSON.parse(raw);
 if(!d||typeof d!=='object')return;
 d.iconColors={...(d.iconColors||{}),xvRoute:RED};
 if(typeof d.text==='string'){
  d.text=d.text.replace(/^(\s*)_{2,}\s*(Tuyến\s+(?:hành\s+trình\s+)?Xuyên\s+Việt.*)$/gimu,'$1━━━━ $2');
 }
 localStorage.setItem(KEY,JSON.stringify(d));
}catch(e){console.warn('Không cập nhật được màu tuyến Xuyên Việt trong ghi chú',e)}
})();
