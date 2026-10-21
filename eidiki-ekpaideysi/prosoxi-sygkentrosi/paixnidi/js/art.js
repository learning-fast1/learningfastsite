/* ============================================================
   ART — SVG σχέδια (ψάρια, μέδουσες, μαργαριτάρια, αστερίες κ.λπ.)
   ============================================================ */
"use strict";

/* ---------- art ---------- */
function fish(color,fin){fin=fin||shade(color);return `<svg viewBox="0 0 120 80"><path d="M92 40 L118 18 L112 40 L118 62Z" fill="${fin}"/><ellipse cx="55" cy="40" rx="44" ry="28" fill="${color}"/><path d="M48 14 Q62 2 74 16" fill="${fin}"/><path d="M40 28 Q48 40 40 52" stroke="${fin}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="26" cy="34" r="8" fill="#fff"/><circle cx="24" cy="34" r="4.5" fill="#0A3440"/><path d="M14 46 Q20 50 26 46" stroke="#0A3440" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;}
function goldfish(){return `<svg viewBox="0 0 120 80"><path d="M92 40 L118 14 L110 40 L118 66Z" fill="#E8A100"/><ellipse cx="55" cy="40" rx="44" ry="28" fill="#FFC933"/><path d="M46 13 L54 2 L60 12 L68 2 L72 15" fill="#E8A100"/><circle cx="60" cy="40" r="5" fill="#FFF3B0"/><circle cx="76" cy="32" r="4" fill="#FFF3B0"/><circle cx="74" cy="50" r="4" fill="#FFF3B0"/><circle cx="26" cy="34" r="8" fill="#fff"/><circle cx="24" cy="34" r="4.5" fill="#0A3440"/><path d="M14 46 Q20 50 26 46" stroke="#0A3440" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;}
function shade(h){const n=parseInt(h.slice(1),16);const r=Math.max(0,(n>>16)-50),g=Math.max(0,((n>>8)&255)-50),b=Math.max(0,(n&255)-50);return `rgb(${r},${g},${b})`;}
function jelly(){return `<svg viewBox="0 0 100 120"><path d="M10 52 Q10 8 50 8 Q90 8 90 52 Q80 58 70 52 Q60 58 50 52 Q40 58 30 52 Q20 58 10 52Z" fill="#C78BEA"/><path d="M24 58 q-6 16 2 30 q8 14 0 28 M42 58 q-6 18 2 34 M58 58 q6 18 -2 34 M76 58 q6 16 -2 30 q-8 14 0 28" stroke="#A865D6" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="38" cy="34" r="5" fill="#3B1553"/><circle cx="62" cy="34" r="5" fill="#3B1553"/><path d="M40 44 Q50 38 60 44" stroke="#3B1553" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="34" cy="20" rx="8" ry="4" fill="#fff" opacity=".45"/></svg>`;}
let pgN=0;
function pearl(){const id='pg'+(++pgN);return `<svg viewBox="0 0 100 100"><defs><radialGradient id="${id}" cx="35%" cy="30%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#F3E9FF"/><stop offset="1" stop-color="#C9B6E4"/></radialGradient></defs><circle cx="50" cy="50" r="44" fill="url(#${id})"/><ellipse cx="36" cy="30" rx="12" ry="7" fill="#fff"/></svg>`;}
function oyster(open){return open?`<svg viewBox="0 0 120 100"><path d="M8 62 Q60 110 112 62 Z" fill="#9C8466"/><path d="M8 62 Q30 4 60 8 Q90 4 112 62 Q60 40 8 62Z" fill="#BFA786"/><path d="M14 64 Q60 96 106 64 Q60 52 14 64Z" fill="#F4C6C9"/><circle cx="60" cy="66" r="14" fill="#fff"/><ellipse cx="55" cy="61" rx="4" ry="3" fill="#fff"/><circle cx="60" cy="66" r="14" fill="none" stroke="#E5DAF2" stroke-width="2"/></svg>`:`<svg viewBox="0 0 120 100"><path d="M8 58 Q60 104 112 58 Q60 44 8 58Z" fill="#9C8466"/><path d="M8 58 Q30 20 60 22 Q90 20 112 58 Q60 44 8 58Z" fill="#BFA786"/><path d="M30 44 Q60 30 90 44 M22 52 Q60 36 98 52" stroke="#8A7255" stroke-width="3" fill="none"/></svg>`;}
const FISHCOL=['#FF6F91','#5BC0EB','#3FAF7A','#8E6CD8','#FF8A3D','#4F7CFF'];

/* ---------- extra art ---------- */
function star(c){return `<svg viewBox="0 0 100 100"><path d="M50 6 L61 37 L94 38 L68 58 L78 91 L50 72 L22 91 L32 58 L6 38 L39 37Z" fill="${c}" stroke="${shade(c)}" stroke-width="4" stroke-linejoin="round"/><circle cx="43" cy="44" r="4" fill="#0A3440"/><circle cx="57" cy="44" r="4" fill="#0A3440"/><path d="M44 55 Q50 60 56 55" stroke="#0A3440" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;}
function shell(c){return `<svg viewBox="0 0 100 100"><path d="M50 10 C20 10 8 40 12 70 L50 90 L88 70 C92 40 80 10 50 10Z" fill="${c}" stroke="${shade(c)}" stroke-width="4" stroke-linejoin="round"/><path d="M50 86 L50 18 M50 86 L32 20 M50 86 L68 20 M50 86 L19 40 M50 86 L81 40" stroke="${shade(c)}" stroke-width="3"/></svg>`;}
function rock(){return `<svg viewBox="0 0 100 80"><path d="M8 70 L18 30 L40 10 L66 14 L88 34 L94 70Z" fill="#6E7B83"/><path d="M18 30 L40 10 L52 30 L30 44Z" fill="#8C9AA2"/><path d="M52 30 L66 14 L88 34 L70 46Z" fill="#7C8990"/></svg>`;}
function sub(){return `<svg viewBox="0 0 140 90"><rect x="60" y="8" width="18" height="24" rx="4" fill="#E8A100"/><rect x="66" y="0" width="4" height="12" fill="#6B5220"/><ellipse cx="70" cy="52" rx="62" ry="30" fill="#FFC933"/><circle cx="46" cy="50" r="11" fill="#9FE3EE" stroke="#E8A100" stroke-width="4"/><circle cx="76" cy="50" r="11" fill="#9FE3EE" stroke="#E8A100" stroke-width="4"/><path d="M128 52 L138 38 L138 66Z" fill="#E8A100"/></svg>`;}
/* self-rating: n of three rising bars filled (like a phone's signal) */
function levelBars(n){return `<svg viewBox="0 0 34 26" class="lvbars" aria-hidden="true">${[[2,17,9],[13,10,16],[24,2,24]].map(([x,y,h],i)=>`<rect x="${x}" y="${y}" width="8" height="${h}" rx="2" class="${i<n?'on':''}"/>`).join('')}</svg>`;}
const C4={yellow:'#FFC933',pink:'#FF6F91',blue:'#4F9CFF',green:'#3FAF7A'};
const SH4={star:star,shell:shell,fish:c=>fish(c)};
const TARGETS4=[
 {color:'yellow',shape:'star',label:'όλους τους ΚΙΤΡΙΝΟΥΣ αστερίες'},
 {color:'pink',shape:'shell',label:'όλα τα ΡΟΖ κοχύλια'},
 {color:'blue',shape:'fish',label:'όλα τα ΜΠΛΕ ψαράκια'}
];
let target4=TARGETS4[0];
const itemSVG=(c,sh)=>SH4[sh](C4[c]);
