(()=>{
'use strict';
if(window.__VN_EXPORT_IMAGE_REPORT)return;

const $=id=>document.getElementById(id);
let last=[];

function absoluteUrl(value){
  const s=String(value||'');
  if(!s)return'';
  if(/^data:/i.test(s))return'[Ảnh Data URL nội bộ]';
  try{return new URL(s,location.href).href}catch{return s}
}
function normalize(items=[]){
  return items.map((x,i)=>({
    id:String(x?.id||`image-${i+1}`),
    name:String(x?.name||''),
    href:String(x?.href||''),
    url:String(x?.url||absoluteUrl(x?.href||'')),
    error:String(x?.error||'Không xác định được lỗi')
  }));
}
function reportText(items,context='Xuất file'){
  const lines=[`BÁO CÁO ẢNH LỖI - ${context}`,`Tổng số ảnh lỗi: ${items.length}`,`Thời gian: ${new Date().toLocaleString('vi-VN')}`,''];
  items.forEach((x,i)=>{
    lines.push(`${i+1}. ID: ${x.id}`);
    if(x.name)lines.push(`   Tên: ${x.name}`);
    lines.push(`   URL: ${x.url||x.href||'(không có URL)'}`);
    if(x.href&&x.href!==x.url)lines.push(`   Nguồn trong SVG: ${x.href}`);
    lines.push(`   Lỗi: ${x.error}`,'');
  });
  return lines.join('\n');
}
function ensurePanel(){
  let panel=$('exportImageErrorReport');
  if(panel)return panel;
  const status=$('exportStatus');
  const group=status?.closest('.group')||status?.parentElement;
  if(!group)return null;
  panel=document.createElement('div');
  panel.id='exportImageErrorReport';
  panel.style.cssText='display:none;margin-top:10px;padding:10px;border:1px solid #d97979;border-radius:8px;background:#fff4f4;color:#5c2020';
  const title=document.createElement('div');
  title.id='exportImageErrorTitle';
  title.style.cssText='font-weight:900;margin-bottom:7px';
  panel.appendChild(title);
  const links=document.createElement('div');
  links.id='exportImageErrorLinks';
  links.style.cssText='max-height:180px;overflow:auto;margin-bottom:8px;font-size:12px;line-height:1.45';
  panel.appendChild(links);
  const pre=document.createElement('textarea');
  pre.id='exportImageErrorText';
  pre.readOnly=true;
  pre.style.cssText='width:100%;min-height:145px;resize:vertical;box-sizing:border-box;font:11px/1.45 Consolas,monospace;white-space:pre;background:#fff;border:1px solid #e2b6b6;border-radius:6px;padding:7px;color:#3d2525';
  panel.appendChild(pre);
  const row=document.createElement('div');
  row.style.cssText='display:flex;gap:7px;margin-top:7px';
  const copy=document.createElement('button');copy.type='button';copy.className='btn';copy.textContent='Copy báo cáo';
  copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.value);copy.textContent='✓ Đã copy';setTimeout(()=>copy.textContent='Copy báo cáo',1300)}catch{pre.focus();pre.select();document.execCommand?.('copy')}});
  const clear=document.createElement('button');clear.type='button';clear.className='btn';clear.textContent='Xóa báo cáo';clear.addEventListener('click',()=>api.clear());
  row.append(copy,clear);panel.appendChild(row);
  status.insertAdjacentElement('afterend',panel);
  return panel;
}
function show(items,context='Xuất file'){
  last=normalize(items);
  const panel=ensurePanel();if(!panel)return;
  panel.style.display='block';
  const title=$('exportImageErrorTitle');if(title)title.textContent=`⚠ ${last.length} ảnh lỗi khi ${context}`;
  const text=$('exportImageErrorText');if(text)text.value=reportText(last,context);
  const links=$('exportImageErrorLinks');if(links){
    links.innerHTML='';
    last.forEach((x,i)=>{
      const line=document.createElement('div');line.style.cssText='margin:4px 0;padding-bottom:4px;border-bottom:1px dashed #e7c3c3';
      const b=document.createElement('b');b.textContent=`${i+1}. ${x.id}`;line.appendChild(b);
      line.appendChild(document.createTextNode(` — ${x.error} — `));
      if(x.url&&/^https?:/i.test(x.url)){
        const a=document.createElement('a');a.href=x.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=x.url;a.style.cssText='word-break:break-all;color:#9c1f38;text-decoration:underline';line.appendChild(a);
      }else{const code=document.createElement('code');code.textContent=x.url||x.href||'(không có URL)';code.style.wordBreak='break-all';line.appendChild(code)}
      links.appendChild(line);
    });
  }
  console.group(`Ảnh lỗi - ${context}`);console.table(last);console.groupEnd();
}
const api={
  show,
  clear(){last=[];const p=$('exportImageErrorReport');if(p)p.style.display='none';const t=$('exportImageErrorText');if(t)t.value='';const l=$('exportImageErrorLinks');if(l)l.innerHTML=''},
  getLast:()=>last.map(x=>({...x})),
  text:(context='Xuất file')=>reportText(last,context)
};
window.__VN_EXPORT_IMAGE_REPORT=api;
})();
