from pathlib import Path

p=Path('tour-route.js')
s=p.read_text(encoding='utf-8')

s=s.replace("const POINT26_MARK='vn-xuyen-viet-route-point26-saky-v1';", "const POINT26_MARK='vn-xuyen-viet-route-point26-saky-v1';\nconst OVERLAP_MARK='vn-xuyen-viet-route-overlap-separated-v1';", 1)

fixed_end=" 32:{name:'Nhà hát Lớn Hà Nội',lat:21.024167,lon:105.857778,note:'Kết thúc hành trình, về lại điểm đón ban đầu'}\n};"
insert=""" 32:{name:'Nhà hát Lớn Hà Nội',lat:21.024167,lon:105.857778,note:'Kết thúc hành trình, về lại điểm đón ban đầu'}
};
// Dịch hiển thị nhỏ cho các marker trùng hoặc quá gần nhau. GPS thật trong FIXED_GEO không đổi.
// Mục tiêu: mọi vòng tròn số 1–33 đều nhìn thấy riêng, kể cả khi hành trình quay lại cùng một thành phố.
const DISPLAY_OFFSET={
  0:{x:-11,y:-8},32:{x:11,y:8},       // Hà Nội: đầu / cuối
  2:{x:0,y:-12},29:{x:0,y:12},        // TP Hà Tĩnh / Ngã Ba Đồng Lộc
  3:{x:-11,y:-7},28:{x:11,y:7},       // Đồng Hới - Nhật Lệ: lượt đi / lượt về
  4:{x:-11,y:-7},27:{x:11,y:7},       // Huế: lượt đi / lượt về
  6:{x:-11,y:-7},24:{x:11,y:7},       // Quy Nhơn: lượt đi / lượt về
 11:{x:-11,y:-7},18:{x:11,y:7},       // TP.HCM: trước miền Tây / quay lại
 12:{x:-9,y:-7},13:{x:9,y:7},         // Mỹ Tho / Bến Tre
  5:{x:-8,y:-6},26:{x:8,y:6},         // Đà Nẵng / Hội An
 14:{x:-8,y:0},17:{x:8,y:0},          // Cần Thơ / Sa Đéc
  1:{x:-6,y:-3},31:{x:6,y:3}          // Phủ Lý / Tràng An
};"""
if 'const DISPLAY_OFFSET=' not in s:
    if fixed_end not in s: raise SystemExit('FIXED_GEO end anchor missing')
    s=s.replace(fixed_end,insert,1)

geo_anchor="function geoProject(lon,lat){return{x:PLOT.x+(lon-GEO.minLon)/(GEO.maxLon-GEO.minLon)*PLOT.w,y:PLOT.y+(GEO.maxLat-lat)/(GEO.maxLat-GEO.minLat)*PLOT.h}}"
geo_new=geo_anchor+"\nfunction fixedDisplayPoint(idx){const f=FIXED_GEO[idx];if(!f)return null;const p=geoProject(f.lon,f.lat),o=DISPLAY_OFFSET[idx]||{x:0,y:0};return{x:p.x+o.x,y:p.y+o.y}}"
if 'function fixedDisplayPoint(idx)' not in s:
    if geo_anchor not in s: raise SystemExit('geoProject anchor missing')
    s=s.replace(geo_anchor,geo_new,1)

old="Object.entries(FIXED_GEO).forEach(([idx,g])=>{const i=Number(idx);if(i>=0&&i<basePoints.length)basePoints[i]=geoProject(g.lon,g.lat)});"
new="Object.keys(FIXED_GEO).forEach(idx=>{const i=Number(idx),p=fixedDisplayPoint(i);if(p&&i>=0&&i<basePoints.length)basePoints[i]=p});"
if old in s: s=s.replace(old,new,1)
elif new not in s: raise SystemExit('buildBasePoints anchor missing')

old="function fixPoint(idx){const fixed=FIXED_GEO[idx];if(!fixed||!data?.points?.[idx])return false;data.points[idx]=geoProject(fixed.lon,fixed.lat);save();render();syncPoint();return true}"
new="function fixPoint(idx){const fixed=FIXED_GEO[idx],p=fixedDisplayPoint(idx);if(!fixed||!p||!data?.points?.[idx])return false;data.points[idx]=p;save();render();syncPoint();return true}"
if old in s: s=s.replace(old,new,1)
elif new not in s: raise SystemExit('fixPoint anchor missing')

old="function migrateAllPointsOnce(){let done=false;try{done=localStorage.getItem(COORD_MARK)==='done'}catch{}if(done)return;for(let i=0;i<ROUTE.length;i++){const f=FIXED_GEO[i];if(f&&data?.points?.[i])data.points[i]=geoProject(f.lon,f.lat)}save();try{localStorage.setItem(COORD_MARK,'done')}catch{}}"
new="function migrateAllPointsOnce(){let done=false;try{done=localStorage.getItem(COORD_MARK)==='done'}catch{}if(done)return;for(let i=0;i<ROUTE.length;i++){const p=fixedDisplayPoint(i);if(p&&data?.points?.[i])data.points[i]=p}save();try{localStorage.setItem(COORD_MARK,'done')}catch{}}"
if old in s: s=s.replace(old,new,1)
elif new not in s: raise SystemExit('migrateAllPoints anchor missing')

old="function migratePoint26Once(){let done=false;try{done=localStorage.getItem(POINT26_MARK)==='done'}catch{}if(done)return;const f=FIXED_GEO[25];if(f&&data?.points?.[25]){data.points[25]=geoProject(f.lon,f.lat);save()}try{localStorage.setItem(POINT26_MARK,'done')}catch{}}"
new="function migratePoint26Once(){let done=false;try{done=localStorage.getItem(POINT26_MARK)==='done'}catch{}if(done)return;const p=fixedDisplayPoint(25);if(p&&data?.points?.[25]){data.points[25]=p;save()}try{localStorage.setItem(POINT26_MARK,'done')}catch{}}\nfunction separateOverlaps(showMessage=true){Object.keys(DISPLAY_OFFSET).forEach(idx=>{const i=Number(idx),p=fixedDisplayPoint(i);if(p&&data?.points?.[i])data.points[i]=p});save();render();syncPoint();try{localStorage.setItem(OVERLAP_MARK,'done')}catch{}if(showMessage){const n=$('tourPointSelected');if(n)n.insertAdjacentHTML('beforeend','<br><b>✓ Đã tách các marker trùng/quá gần nhau; GPS thật không đổi.</b>')}}\nfunction migrateOverlapOnce(){let done=false;try{done=localStorage.getItem(OVERLAP_MARK)==='done'}catch{}if(done)return;separateOverlaps(false)}"
if old in s: s=s.replace(old,new,1)
elif 'function migrateOverlapOnce()' not in s: raise SystemExit('migratePoint26 anchor missing')

old="if(fixed){n.innerHTML=`<b>Điểm ${selectedPoint+1}: ${ROUTE[selectedPoint][1]}</b><br>${fixed.name}<br>GPS: ${fixed.lat.toFixed(6)}, ${fixed.lon.toFixed(6)}<br>SVG: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}<br><span style=\"font-size:11px\">${fixed.note}</span>`;if(btn)btn.disabled=false}"
new="if(fixed){const shifted=!!DISPLAY_OFFSET[selectedPoint];n.innerHTML=`<b>Điểm ${selectedPoint+1}: ${ROUTE[selectedPoint][1]}</b><br>${fixed.name}<br>GPS thật: ${fixed.lat.toFixed(6)}, ${fixed.lon.toFixed(6)}<br>SVG hiển thị: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}${shifted?'<br><span style=\"font-size:11px;color:#9a5a13\">Marker được dịch nhẹ để không chồng số; GPS thật không đổi.</span>':''}<br><span style=\"font-size:11px\">${fixed.note}</span>`;if(btn)btn.disabled=false}"
if old in s: s=s.replace(old,new,1)
elif 'GPS thật:' not in s: raise SystemExit('syncPoint anchor missing')

old='<div class="row"><button id="tourFixAll" class="btn primary">Sửa đúng tọa độ toàn bộ 33 điểm</button><button id="tourFixSelected" class="btn" disabled>Sửa điểm đang chọn</button></div>\n <div class="tip">33 marker được đặt theo <b>điểm dừng thực tế đại diện</b> trong chương trình, không đặt ở tâm tỉnh. Với tỉnh mới sáp nhập, tên tỉnh trên bản đồ có thể khác tên địa danh cũ. Bấm marker để xem tên điểm + GPS; vẫn có thể kéo thủ công.</div>`;'
new='<div class="row"><button id="tourFixAll" class="btn primary">Sửa đúng tọa độ toàn bộ 33 điểm</button><button id="tourFixSelected" class="btn" disabled>Sửa điểm đang chọn</button></div>\n <button id="tourSeparateOverlaps" class="btn" style="width:100%;margin-top:6px">Tách các marker trùng / quá gần</button>\n <div class="tip">33 marker theo <b>điểm dừng thực tế đại diện</b>. Các lần quay lại cùng địa điểm và các điểm quá gần nhau được dịch hiển thị nhẹ để không chồng số; <b>GPS thật vẫn giữ nguyên</b>. Bấm marker để xem GPS; vẫn có thể kéo thủ công.</div>`;'
if old in s: s=s.replace(old,new,1)
elif 'id="tourSeparateOverlaps"' not in s: raise SystemExit('UI overlap button anchor missing')

old="$('tourFixSelected').addEventListener('click',()=>{if(selectedPoint>=0)fixPoint(selectedPoint)});"
new=old+"\n $('tourSeparateOverlaps').addEventListener('click',()=>separateOverlaps(true));"
if "$('tourSeparateOverlaps').addEventListener" not in s:
    if old not in s: raise SystemExit('event anchor missing')
    s=s.replace(old,new,1)

old="buildBasePoints();load();migrateAllPointsOnce();migratePoint26Once();initLayer();injectUI();render();"
new="buildBasePoints();load();migrateAllPointsOnce();migratePoint26Once();migrateOverlapOnce();initLayer();injectUI();render();"
if old in s: s=s.replace(old,new,1)
elif new not in s: raise SystemExit('init anchor missing')

p.write_text(s,encoding='utf-8')

p=Path('index.html')
s=p.read_text(encoding='utf-8')
if "load('tour-route.js?v=5')" in s:
    s=s.replace("load('tour-route.js?v=5')","load('tour-route.js?v=6')",1)
elif "load('tour-route.js?v=6')" not in s:
    raise SystemExit('index route loader anchor missing')
p.write_text(s,encoding='utf-8')
