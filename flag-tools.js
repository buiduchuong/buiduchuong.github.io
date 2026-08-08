(()=>{
'use strict';
const NS='http://www.w3.org/2000/svg';
const STORE='vn-map-flags-v1';
const $=id=>document.getElementById(id);
const svg=$('mapSvg'),viewport=$('viewport'),layer=$('flagLayer'),canvas=$('canvas');
if(!svg||!viewport||!layer)return;
const state={flags:[],selected:null,show:true,dragEnabled:true,drag:null,saveTimer:null};
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));return n};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function uid(){return'flag-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function normalizeFlag(f,i=0){return{id:String(f?.id||uid()),x:Number.isFinite(Number(f?.x))?Number(f.x):700+i*14,y:Number.isFinite(Number(f?.y))?Number(f.y):500+i*10,size:clamp(Number(f?.size)||34,12,120),flagColor:/^#[0-9a-f]{6}$/i.test(f?.flagColor||'')?f.flagColor:'#e51d49',poleColor:/^#[0-9a-f]{6}$/i.test(f?.poleColor||'')?f.poleColor:'#333333',direction:f?.direction==='left'?'left':'right'} }
function load(){try{const d=JSON.parse(localStorage.getItem(STORE)||'{}');state.flags=Array.isArray(d.flags)?d.flags.map(normalizeFlag):[];state.show=d.show!==false;state.dragEnabled=d.dragEnabled!==false}catch{state.flags=[]}}
function save(flush=false){try{localStorage.setItem(STORE,JSON.stringify({version:1,flags:state.flags,show:state.show,dragEnabled:state.dragEnabled,updatedAt:Date.now()}))}catch(e){console.warn('Không lưu được cờ',e)}if(flush&&window.__VN_PERSIST?.flush)window.__VN_PERSIST.flush();else scheduleFlush()}
function scheduleFlush(){clearTimeout(state.saveTimer);state.saveTimer=setTimeout(()=>window.__VN_PERSIST?.flush?.(),500)}
function selectedFlag(){return state.flags.find(f=>f.id===state.selected)||null}
function worldFromClient(e){const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const m=viewport.getScreenCTM();if(!m)return[700,500];const p=pt.matrixTransform(m.inverse());return[p.x,p.y]}
function visibleCenter(){const r=canvas?.getBoundingClientRect();if(!r)return[700,500];const fake={clientX:r.left+r.width/2,clientY:r.top+r.height/2};return worldFromClient(fake)}
function drawFlag(f){const g=el('g',{class:'flag-marker'+(f.id===state.selected?' selected':''),'data-id':f.id,transform:`translate(${f.x} ${f.y})`});const s=f.size,poleH=s*1.75,flagH=s*.68,flagW=s,dir=f.direction==='left'?-1:1;const minX=dir<0?-flagW-s*.25:-s*.25;g.appendChild(el('rect',{x:minX,y:-poleH-s*.12,width:flagW+s*.5,height:poleH+s*.38,class:'flag-hit'}));g.appendChild(el('line',{x1:0,y1:4,x2:0,y2:-poleH,class:'flag-pole',stroke:f.poleColor,'stroke-width':Math.max(1.7,s*.065)}));g.appendChild(el('polygon',{points:`0,${-poleH} ${dir*flagW},${-poleH+flagH*.48} 0,${-poleH+flagH}`,class:'flag-shape',fill:f.flagColor}));g.appendChild(el('circle',{cx:0,cy:4,r:Math.max(2.2,s*.095),class:'flag-base',fill:f.poleColor}));g.addEventListener('pointerdown',startDrag);g.addEventListener('click',e=>{e.stopPropagation();select(f.id)});return g}
function render(){layer.innerHTML='';layer.style.display=state.show?'':'none';if(state.show)state.flags.forEach(f=>layer.appendChild(drawFlag(f)));syncList();syncEditor()}
function syncList(){const s=$('flagSelect');if(!s)return;const cur=state.selected;s.innerHTML='';state.flags.forEach((f,i)=>{const o=document.createElement('option');o.value=f.id;o.textContent=`Cờ ${i+1}`;s.appendChild(o)});if(cur)s.value=cur;const c=$('flagCount');if(c)c.textContent=`${state.flags.length} cờ trên bản đồ`;const show=$('showFlags');if(show)show.checked=state.show;const drag=$('dragFlags');if(drag)drag.checked=state.dragEnabled}
function syncEditor(){const f=selectedFlag(),empty=$('flagEmpty'),ed=$('flagEditor');if(empty)empty.style.display=f?'none':'';if(ed)ed.style.display=f?'':'none';if(!f)return;$('flagSize').value=f.size;$('flagSizeRange').value=f.size;$('flagColor').value=f.flagColor;$('flagPoleColor').value=f.poleColor;$('flagX').value=Math.round(f.x);$('flagY').value=Math.round(f.y);$('flagDirection').value=f.direction}
function select(id){state.selected=id;render()}
function addFlag(){const [x,y]=visibleCenter();const f=normalizeFlag({id:uid(),x,y,size:34,flagColor:'#e51d49',poleColor:'#333333'});state.flags.push(f);state.selected=f.id;save();render()}
function duplicateFlag(){const f=selectedFlag();if(!f)return;const n=normalizeFlag({...f,id:uid(),x:f.x+18,y:f.y+18});state.flags.push(n);state.selected=n.id;save();render()}
function deleteFlag(){const f=selectedFlag();if(!f)return;state.flags=state.flags.filter(x=>x.id!==f.id);state.selected=state.flags.at(-1)?.id||null;save(true);render()}
function clearFlags(){if(!state.flags.length)return;if(!confirm('Xóa toàn bộ cờ đánh dấu?'))return;state.flags=[];state.selected=null;save(true);render()}
function centerFlag(){const f=selectedFlag();if(!f)return;const[x,y]=visibleCenter();f.x=x;f.y=y;save();render()}
function setSize(v){const f=selectedFlag();if(!f)return;f.size=clamp(Number(v)||34,12,120);$('flagSize').value=f.size;$('flagSizeRange').value=f.size;save();render()}
function startDrag(e){if(!state.dragEnabled)return;e.preventDefault();e.stopPropagation();const id=e.currentTarget.dataset.id;state.selected=id;const f=selectedFlag();if(!f)return;const p=worldFromClient(e);state.drag={id,dx:p[0]-f.x,dy:p[1]-f.y,pointerId:e.pointerId};try{svg.setPointerCapture(e.pointerId)}catch{}render()}
function moveDrag(e){if(!state.drag)return;const f=selectedFlag();if(!f||f.id!==state.drag.id)return;const p=worldFromClient(e);f.x=p[0]-state.drag.dx;f.y=p[1]-state.drag.dy;save(false);render()}
function endDrag(e){if(!state.drag)return;const pointerId=state.drag.pointerId;state.drag=null;try{svg.releasePointerCapture(pointerId)}catch{}save(true);render()}
function setPos(axis,v){const f=selectedFlag();if(!f)return;const n=Number(v);if(!Number.isFinite(n))return;f[axis]=n;save();render()}
load();
$('addFlag')?.addEventListener('click',addFlag);$('duplicateFlag')?.addEventListener('click',duplicateFlag);$('deleteFlag')?.addEventListener('click',deleteFlag);$('clearFlags')?.addEventListener('click',clearFlags);$('centerFlag')?.addEventListener('click',centerFlag);
$('flagSelect')?.addEventListener('change',e=>select(e.target.value));$('flagSize')?.addEventListener('input',e=>setSize(e.target.value));$('flagSizeRange')?.addEventListener('input',e=>setSize(e.target.value));$('flagColor')?.addEventListener('input',e=>{const f=selectedFlag();if(!f)return;f.flagColor=e.target.value;save();render()});$('flagPoleColor')?.addEventListener('input',e=>{const f=selectedFlag();if(!f)return;f.poleColor=e.target.value;save();render()});$('flagDirection')?.addEventListener('change',e=>{const f=selectedFlag();if(!f)return;f.direction=e.target.value==='left'?'left':'right';save();render()});$('flagX')?.addEventListener('input',e=>setPos('x',e.target.value));$('flagY')?.addEventListener('input',e=>setPos('y',e.target.value));$('showFlags')?.addEventListener('change',e=>{state.show=e.target.checked;save();render()});$('dragFlags')?.addEventListener('change',e=>{state.dragEnabled=e.target.checked;save();render()});
svg.addEventListener('pointermove',moveDrag);svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);window.addEventListener('pagehide',()=>save(true));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save(true)});
if(state.flags.length)state.selected=state.flags[0].id;render();save(false);
window.__VN_FLAGS={add:addFlag,render,save,getAll:()=>JSON.parse(JSON.stringify(state.flags))};
})();
