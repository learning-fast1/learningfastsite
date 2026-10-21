/* ============================================================
   APP — εκκίνηση
   ============================================================ */
"use strict";

/* ---------- boot ---------- */
renderProfiles();
if(store.last&&store.profiles[store.last]){cur=store.last;}
try{speechSynthesis&&speechSynthesis.getVoices();}catch(e){}
