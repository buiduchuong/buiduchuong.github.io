(()=>{
'use strict';
const KEY='vn-pickup-arrow-size-v1';
const MIN=0.7,MAX=4,STEP=0.1,DEFAULT=1.7;
const root=document.documentElement;
const $=id=>document.getElementById(id);
const clamp=v=>Math.max(MIN,Math.min(MAX,Number(v)||DEFAULT));
function read(){try{return clamp(localStorage.getItem(KEY)||DEFAULT)}catch{return DEFAULT}}
function save(v){try{localStorage.setItem(KEY,String(v))}catch{}}
function apply(v){v=clamp(v);root.style.setProperty('--pickup-arrow-size',String(v));const r=$('pickupArrowSizeRange'),n=$('pickupArrowSizeNumber');if(r)r.value=v;if(n)n.value=v;save(v)}
function injectStyle(){if($('pickupArrowSizeStyle'))return;const s=document.createElement('style');s.id='pickupArrowSizeStyle';s.textContent=`#lineLayer .editor-line[data-id^="route-"]{stroke-width:var(--pickup-arrow-size,1.7px)!important}`;document.head.appendChild(s)}
function injectUI(){if($('pickupArrowSizeControl'))return;const show=$('showRoutes');if(!show)return;const label=show.closest('label');if(!label)return;const box=document.createElement('div');box.id='pickupArrowSizeControl';box.style.margin='7px 0 8px';box.innerHTML=`<label style="display:block;margin-bottom:5px"><b>Kích thước 13 mũi tên về Hà Nội</b></label><div class="value-line"><input id="pickupArrowSizeRange" type="range" min="${MIN}" max="${MAX}" step="${STEP}"><input id="pickupArrowSizeNumber" type="number" min="${MIN}" max="${MAX}" step="${STEP}"></div><div class="tip" style="margin-top:5px">Kéo sang trái để mũi tên nhỏ hơn, sang phải để lớn hơn. Chỉ áp dụng cho 13 mũi tên mặc định về Hà Nội.</div>`;label.insertAdjacentElement('afterend',box);const r=$('pickupArrowSizeRange'),n=$('pickupArrowSizeNumber');r.addEventListener('input',e=>apply(e.target.value));n.addEventListener('input',e=>apply(e.target.value));}
function init(){injectStyle();injectUI();apply(read())}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
