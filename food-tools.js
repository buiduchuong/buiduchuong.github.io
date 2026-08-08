(()=>{
'use strict';
const NS='http://www.w3.org/2000/svg';
const STORE='vn-map-food-v1';
const $=id=>document.getElementById(id);
const svg=$('mapSvg'),viewport=$('viewport'),layer=$('foodLayer'),canvas=$('canvas');
if(!svg||!viewport||!layer)return;
const state={items:[],selected:null,show:true,dragEnabled:true,drag:null,saveTimer:null};
const el=(tag,a={})=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));return n};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const color=(v,d)=>/^#[0-9a-f]{6}$/i.test(v||'')?v:d;
function uid(){return'food-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function normalizeItem(f,i=0){return{id:String(f?.id||uid()),x:Number.isFinite(Number(f?.x))?Number(f.x):700+i*14,y:Number.isFinite(Number(f?.y))?Number(f.y):500+i*10,size:clamp(Number(f?.size)||38,16,140),type:['restaurant','coffee','drink'].includes(f?.type)?f.type:'restaurant',label:String(f?.label??'Ăn uống').slice(0,60),showLabel:f?.showLabel!==false,bgColor:color(f?.bgColor,'#f08a24'),iconColor:color(f?.iconColor,'#ffffff'),textColor:color(f?.textColor,'#333333')}}
function load(){try{const d=JSON.parse(localStorage.getItem(STORE)||'{}');state.items=Array.isArray(d.items)?d.items.map(normalizeItem):[];state.show=d.show!==false;state.dragEnabled=d.dragEnabled!==false}catch{state.items=[]}}
function save(flush=false){try{localStorage.setItem(STORE,JSON.stringify({version:1,items:state.items,show:state.show,dragEnabled:state.dragEnabled,updatedAt:Date.now()}))}catch(e){console.warn('Không lưu được item ăn uống',e)}if(flush&&window.__VN_PERSIST?.flush)window.__VN_PERSIST.flush();else scheduleFlush()}
function scheduleFlush(){clearTimeout(state.saveTimer);state.saveTimer=setTimeout(()=>window.__VN_PERSIST?.flush?.(),500)}
function selectedItem(){return state.items.find(f=>f.id===state.selected)||null}
function worldFromClient(e){const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const m=viewport.getScreenCTM();if(!m)return[700,500];const p=pt.matrixTransform(m.inverse());return[p.x,p.y]}
function visibleCenter(){const r=canvas?.getBoundingClientRect();if(!r)return[700,500];return worldFromClient({clientX:r.left+r.width/2,clientY:r.top+r.height/2})}
function line(g,a){const n=el('line',{...a,fill:'none','stroke-linecap':'round','stroke-linejoin':'round',class:'food-icon-line'});g.appendChild(n);return n}
function path(g,a){const n=el('path',{...a,fill:'none','stroke-linecap':'round','stroke-linejoin':'round',class:'food-icon-line'});g.appendChild(n);return n}
function drawRestaurant(g,s,c,w){
  const x=-s*.15;
  line(g,{x1:x,y1:-s*.26,x2:x,y2:s*.24,stroke:c,'stroke-width':w});
  [-.22,-.15,-.08].forEach(v=>line(g,{x1:s*v,y1:-s*.28,x2:s*v,y2:-s*.12,stroke:c,'stroke-width':w*.78}));
  line(g,{x1:-s*.22,y1:-s*.12,x2:-s*.08,y2:-s*.12,stroke:c,'stroke-width':w*.8});
  const spoon=el('ellipse',{cx:s*.15,cy:-s*.16,rx:s*.075,ry:s*.115,fill:'none',stroke:c,'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round',class:'food-icon-line'});g.appendChild(spoon);
  line(g,{x1:s*.15,y1:-s*.045,x2:s*.15,y2:s*.24,stroke:c,'stroke-width':w});
}
function drawCoffee(g,s,c,w){
  const cup=el('rect',{x:-s*.23,y:-s*.12,width:s*.38,height:s*.25,rx:s*.04,fill:'none',stroke:c,'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round',class:'food-icon-line'});g.appendChild(cup);
  path(g,{d:`M${s*.15},${-s*.07} C${s*.31},${-s*.08} ${s*.31},${s*.1} ${s*.15},${s*.08}`,stroke:c,'stroke-width':w});
  line(g,{x1:-s*.27,y1:s*.19,x2:s*.28,y2:s*.19,stroke:c,'stroke-width':w*.85});
  [-.12,.02,.16].forEach(x=>path(g,{d:`M${s*x},${-s*.2} C${s*(x-.04)},${-s*.28} ${s*(x+.05)},${-s*.32} ${s*x},${-s*.39}`,stroke:c,'stroke-width':w*.75}));
}
function drawDrink(g,s,c,w){
  path(g,{d:`M${-s*.22},${-s*.2} L${s*.22},${-s*.2} L${s*.14},${s*.25} L${-s*.13},${s*.25} Z`,stroke:c,'stroke-width':w});
  line(g,{x1:s*.05,y1:-s*.2,x2:s*.2,y2:-s*.39,stroke:c,'stroke-width':w});
  line(g,{x1:s*.2,y1:-s*.39,x2:s*.3,y2:-s*.39,stroke:c,'stroke-width':w*.85});
  line(g,{x1:-s*.13,y1:s*.02,x2:s*.16,y2:s*.02,stroke:c,'stroke-width':w*.75});
}
function drawItem(f){
  const g=el('g',{class:'food-marker'+(f.id===state.selected?' selected':'')+(state.dragEnabled?'':' drag-disabled'),'data-id':f.id,transform:`translate(${f.x} ${f.y})`});
  const s=f.size,r=s*.52,labelY=s*.82,hitW=Math.max(s*2.6,120),hitH=s*(f.showLabel&&f.label?1.35:1.1);
  g.appendChild(el('rect',{x:-hitW/2,y:-s*.62,width:hitW,height:hitH,class:'food-hit',fill:'transparent','pointer-events':'all'}));
  g.appendChild(el('circle',{cx:0,cy:0,r,class:'food-badge',fill:f.bgColor,stroke:'#fffdf8','stroke-width':'2.2'}));
  const w=Math.max(1.4,s*.055);
  if(f.type==='coffee')drawCoffee(g,s,f.iconColor,w);else if(f.type==='drink')drawDrink(g,s,f.iconColor,w);else drawRestaurant(g,s,f.iconColor,w);
  if(f.showLabel&&f.label){const t=el('text',{x:0,y:labelY,class:'food-label','font-family':'Roboto,Arial,sans-serif','text-anchor':'middle','font-weight':'700','paint-order':'stroke',stroke:'#fffdf8','stroke-width':'3','stroke-linejoin':'round','font-size':clamp(s*.29,9,28),fill:f.textColor});t.textContent=f.label;g.appendChild(t)}
  g.addEventListener('pointerdown',startDrag);g.addEventListener('click',e=>{e.stopPropagation();select(f.id)});return g
}
function render(){layer.innerHTML='';layer.style.display=state.show?'':'none';if(state.show)state.items.forEach(f=>layer.appendChild(drawItem(f)));syncList();syncEditor()}
function syncList(){const s=$('foodSelect');if(!s)return;const cur=state.selected;s.innerHTML='';state.items.forEach((f,i)=>{const o=document.createElement('option');o.value=f.id;o.textContent=`${i+1}. ${f.label||'Ăn uống'}`;s.appendChild(o)});if(cur)s.value=cur;const c=$('foodCount');if(c)c.textContent=`${state.items.length} điểm ăn uống`;if($('showFoodItems'))$('showFoodItems').checked=state.show;if($('dragFoodItems'))$('dragFoodItems').checked=state.dragEnabled}
function syncEditor(){const f=selectedItem(),empty=$('foodEmpty'),ed=$('foodEditor');if(empty)empty.style.display=f?'none':'';if(ed)ed.style.display=f?'':'none';if(!f)return;$('foodType').value=f.type;$('foodLabel').value=f.label;$('foodShowLabel').checked=f.showLabel;$('foodSize').value=f.size;$('foodSizeRange').value=f.size;$('foodBgColor').value=f.bgColor;$('foodIconColor').value=f.iconColor;$('foodTextColor').value=f.textColor;$('foodX').value=Math.round(f.x);$('foodY').value=Math.round(f.y)}
function select(id){state.selected=id;render()}
function addItem(){const[x,y]=visibleCenter(),f=normalizeItem({id:uid(),x,y,size:38,type:'restaurant',label:'Ăn uống',showLabel:true,bgColor:'#f08a24',iconColor:'#ffffff',textColor:'#333333'});state.items.push(f);state.selected=f.id;save();render()}
function duplicateItem(){const f=selectedItem();if(!f)return;const n=normalizeItem({...f,id:uid(),x:f.x+20,y:f.y+20});state.items.push(n);state.selected=n.id;save();render()}
function deleteItem(){const f=selectedItem();if(!f)return;state.items=state.items.filter(x=>x.id!==f.id);state.selected=state.items.at(-1)?.id||null;save(true);render()}
function clearItems(){if(!state.items.length)return;if(!confirm('Xóa toàn bộ điểm ăn uống?'))return;state.items=[];state.selected=null;save(true);render()}
function centerItem(){const f=selectedItem();if(!f)return;const[x,y]=visibleCenter();f.x=x;f.y=y;save();render()}
function setSize(v){const f=selectedItem();if(!f)return;f.size=clamp(Number(v)||38,16,140);$('foodSize').value=f.size;$('foodSizeRange').value=f.size;save();render()}
function setPos(axis,v){const f=selectedItem(),n=Number(v);if(!f||!Number.isFinite(n))return;f[axis]=n;save();render()}
function startDrag(e){e.preventDefault();e.stopPropagation();const id=e.currentTarget.dataset.id;state.selected=id;const f=selectedItem();render();if(!f||!state.dragEnabled)return;const p=worldFromClient(e);state.drag={id,dx:p[0]-f.x,dy:p[1]-f.y,pointerId:e.pointerId};try{svg.setPointerCapture(e.pointerId)}catch{}}
function moveDrag(e){if(!state.drag)return;const f=state.items.find(x=>x.id===state.drag.id);if(!f)return;const p=worldFromClient(e);f.x=p[0]-state.drag.dx;f.y=p[1]-state.drag.dy;save(false);render()}
function endDrag(e){if(!state.drag)return;try{svg.releasePointerCapture(state.drag.pointerId)}catch{}state.drag=null;save(true);render()}
load();
$('addFoodItem')?.addEventListener('click',addItem);$('duplicateFoodItem')?.addEventListener('click',duplicateItem);$('deleteFoodItem')?.addEventListener('click',deleteItem);$('clearFoodItems')?.addEventListener('click',clearItems);$('centerFoodItem')?.addEventListener('click',centerItem);
$('foodSelect')?.addEventListener('change',e=>select(e.target.value));$('foodSize')?.addEventListener('input',e=>setSize(e.target.value));$('foodSizeRange')?.addEventListener('input',e=>setSize(e.target.value));
$('foodType')?.addEventListener('change',e=>{const f=selectedItem();if(!f)return;f.type=e.target.value;save();render()});
$('foodLabel')?.addEventListener('input',e=>{const f=selectedItem();if(!f)return;f.label=e.target.value.slice(0,60);save();render()});
$('foodShowLabel')?.addEventListener('change',e=>{const f=selectedItem();if(!f)return;f.showLabel=e.target.checked;save();render()});
$('foodBgColor')?.addEventListener('input',e=>{const f=selectedItem();if(!f)return;f.bgColor=e.target.value;save();render()});$('foodIconColor')?.addEventListener('input',e=>{const f=selectedItem();if(!f)return;f.iconColor=e.target.value;save();render()});$('foodTextColor')?.addEventListener('input',e=>{const f=selectedItem();if(!f)return;f.textColor=e.target.value;save();render()});
$('foodX')?.addEventListener('input',e=>setPos('x',e.target.value));$('foodY')?.addEventListener('input',e=>setPos('y',e.target.value));$('showFoodItems')?.addEventListener('change',e=>{state.show=e.target.checked;save();render()});$('dragFoodItems')?.addEventListener('change',e=>{state.dragEnabled=e.target.checked;save();render()});
svg.addEventListener('pointermove',moveDrag);svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);window.addEventListener('pagehide',()=>save(true));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save(true)});
if(state.items.length)state.selected=state.items[0].id;render();save(false);
window.__VN_FOOD={add:addItem,render,save,getAll:()=>JSON.parse(JSON.stringify(state.items))};
})();
