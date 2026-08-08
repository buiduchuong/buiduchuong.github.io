(()=>{
'use strict';
const STORE='vn-map-editor-v4';
const MIGRATION='vn-map-label-font6-migrated-v1';
const CODES=['01','04','08','11','12','14','15','19','20','22','24','25','31','33','37','38','40','42','44','46','48','51','52','56','66','68','75','79','80','82','86','91','92','96'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const $=id=>document.getElementById(id);

function readData(){
  try{return JSON.parse(localStorage.getItem(STORE)||'null')}catch{return null}
}
function labelSizes(){
  const d=readData(),labels=d?.labels;
  if(!labels||typeof labels!=='object')return[];
  return CODES.map(c=>Number(labels[c]?.fontSize)).filter(Number.isFinite);
}
function editorReady(){
  return !!($('provinceSelect')&&$('fontSizeRange')&&$('fontSize')&&labelSizes().length>=34);
}

function runMigration(){
  if(localStorage.getItem(MIGRATION)==='1')return false;
  const data=readData(),labels=data?.labels;
  if(!labels||Object.keys(labels).length<34)return false;
  CODES.forEach(code=>{if(labels[code]&&typeof labels[code]==='object')labels[code].fontSize=6});
  localStorage.setItem(STORE,JSON.stringify(data));
  localStorage.setItem(MIGRATION,'1');
  try{window.__VN_PERSIST?.flush?.()}catch{}
  setTimeout(()=>location.reload(),100);
  return true;
}

function addStyle(){
  if($('bulkProvinceFontStyle'))return;
  const s=document.createElement('style');s.id='bulkProvinceFontStyle';
  s.textContent=`
  .bulk-font-box{margin-top:9px;padding:8px;border:1px solid #ddd0bf;border-radius:8px;background:#fffaf1}
  .bulk-font-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;font-size:10.5px;font-weight:800;color:#5d554d}
  .bulk-font-status{font-size:9px;font-weight:600;color:#7a7067;text-align:right}
  .bulk-font-box .value-line{margin-top:0}
  .bulk-font-tip{margin-top:5px;font-size:9px;line-height:1.35;color:#7c7167}
  `;
  document.head.appendChild(s);
}

function currentSummary(){
  const sizes=labelSizes();
  if(!sizes.length)return{value:6,text:'Đang chờ dữ liệu…'};
  const unique=[...new Set(sizes.map(v=>clamp(Math.round(v),6,40)))];
  if(unique.length===1)return{value:unique[0],text:`34 tỉnh · ${unique[0]}px`};
  const selected=Number($('fontSize')?.value);
  return{value:Number.isFinite(selected)?clamp(selected,6,40):unique[0],text:`Nhiều cỡ (${Math.min(...unique)}–${Math.max(...unique)}px)`};
}

let applying=false,commitTimer=null;
function preview(v){
  v=clamp(Number(v)||6,6,40);
  document.querySelectorAll('#labelLayer .province-name').forEach(n=>n.setAttribute('font-size',String(v)));
}
function setStatus(text){const n=$('allProvinceFontStatus');if(n)n.textContent=text}
function syncBulkUI(){
  const r=$('allProvinceFontRange'),n=$('allProvinceFontSize');if(!r||!n)return;
  const s=currentSummary();r.value=s.value;n.value=s.value;setStatus(s.text);
}
function dispatch(node,type){node?.dispatchEvent(new Event(type,{bubbles:true}))}
function applyAll(v){
  if(applying||!editorReady())return;
  applying=true;
  v=clamp(Number(v)||6,6,40);
  const sel=$('provinceSelect'),search=$('search'),singleRange=$('fontSizeRange');
  const oldSearch=search?.value||'',oldSelected=sel?.value||'01';
  try{
    setStatus(`Đang áp dụng ${v}px…`);
    if(search){search.value='';dispatch(search,'input')}
    for(const code of CODES){
      sel.value=code;dispatch(sel,'change');
      singleRange.value=v;dispatch(singleRange,'input');
    }
    sel.value=oldSelected;dispatch(sel,'change');
    if(search){search.value=oldSearch;dispatch(search,'input')}
    $('allProvinceFontRange').value=v;$('allProvinceFontSize').value=v;
    try{window.__VN_PERSIST?.flush?.()}catch{}
    setStatus(`34 tỉnh · ${v}px`);
  }finally{applying=false}
}
function scheduleApply(v,delay=280){
  clearTimeout(commitTimer);commitTimer=setTimeout(()=>applyAll(v),delay);
}

function injectUI(){
  if($('bulkProvinceFontBox')||!editorReady())return;
  addStyle();
  const singleLine=$('fontSizeRange')?.closest('.value-line');if(!singleLine)return;
  const box=document.createElement('div');box.id='bulkProvinceFontBox';box.className='bulk-font-box';
  const s=currentSummary();
  box.innerHTML=`<div class="bulk-font-head"><span>Cỡ chữ tất cả tỉnh</span><span id="allProvinceFontStatus" class="bulk-font-status">${s.text}</span></div><div class="value-line"><input id="allProvinceFontRange" type="range" min="6" max="40" step="1" value="${s.value}"><input id="allProvinceFontSize" type="number" min="6" max="40" step="1" value="${s.value}"></div><div class="bulk-font-tip">Kéo để đổi đồng thời toàn bộ 34 tên tỉnh. Vẫn có thể chỉnh riêng từng tỉnh sau đó.</div>`;
  singleLine.insertAdjacentElement('afterend',box);
  const range=$('allProvinceFontRange'),num=$('allProvinceFontSize');
  range.addEventListener('input',e=>{const v=clamp(Number(e.target.value)||6,6,40);num.value=v;preview(v);setStatus(`Xem trước · ${v}px`)});
  range.addEventListener('change',e=>applyAll(e.target.value));
  num.addEventListener('input',e=>{const v=clamp(Number(e.target.value)||6,6,40);range.value=v;preview(v);setStatus(`Xem trước · ${v}px`);scheduleApply(v)});
  num.addEventListener('change',e=>applyAll(e.target.value));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&commitTimer){clearTimeout(commitTimer);applyAll(num.value)}});
  window.addEventListener('pagehide',()=>{if(commitTimer){clearTimeout(commitTimer);applyAll(num.value)}});
}

let tries=0;
const timer=setInterval(()=>{
  tries++;
  if(runMigration()){clearInterval(timer);return}
  if(editorReady()){
    injectUI();
    if($('bulkProvinceFontBox'))clearInterval(timer);
  }
  if(tries>160)clearInterval(timer);
},150);
})();
