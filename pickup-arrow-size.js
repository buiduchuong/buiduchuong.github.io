(()=>{
'use strict';
// Legacy compatibility shim.
// The 13 Hanoi pickup arrows are now handled only by editor.js.
// Keeping this file inert prevents old cached loaders from creating observers,
// timers or modifying lineLayer while the 34 province boundaries are loading.
window.__VN_PICKUP_ARROW_SIZE=true;
try{document.getElementById('pickupArrowSizeGroup')?.remove()}catch{}
})();
