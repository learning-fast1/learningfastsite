/* ============================================================
   TREASURE — θησαυρός, δίπλωμα, αποθήκευση αρχείων
   ============================================================ */
"use strict";

/* ---------- treasure & diploma ---------- */
function chestSVG(open){return open?`<svg viewBox="0 0 200 170"><path d="M20 20 Q100 -20 180 20 L180 60 L20 60Z" fill="#B0703A" transform="rotate(-18 20 60)"/><rect x="20" y="70" width="160" height="90" rx="10" fill="#A0602E"/><rect x="20" y="70" width="160" height="16" fill="#7A451D"/><circle cx="70" cy="70" r="16" fill="#fff"/><circle cx="100" cy="62" r="18" fill="#F3E9FF"/><circle cx="132" cy="70" r="15" fill="#fff"/><circle cx="84" cy="56" r="10" fill="#FFC933"/><circle cx="118" cy="52" r="9" fill="#FFC933"/><rect x="92" y="96" width="16" height="22" rx="3" fill="#FFC933"/><path d="M20 110 H180" stroke="#7A451D" stroke-width="6"/></svg>`
:`<svg viewBox="0 0 200 170"><path d="M20 70 Q100 20 180 70Z" fill="#B0703A"/><rect x="20" y="70" width="160" height="90" rx="10" fill="#A0602E"/><rect x="20" y="66" width="160" height="16" fill="#7A451D"/><rect x="92" y="76" width="16" height="22" rx="3" fill="#FFC933"/><path d="M20 120 H180" stroke="#7A451D" stroke-width="6"/></svg>`;}
function openTreasure(celebrate){
  const p=prof();
  const done=allPassed(p);
  const ch=$('#chest');ch.innerHTML=chestSVG(false);
  $('#trtitle').textContent=`Συγχαρητήρια, ${p.name}!`;
  $('#trtext').textContent=celebrate?'Έφτασες στον βυθό και βρήκες τον θησαυρό! Είσαι πλέον Δύτης Συγκέντρωσης. Από εδώ και πέρα σε περιμένει η καθημερινή αποστολή.':'Αυτός είναι ο θησαυρός σου. Κάθε μέρα που κάνεις την καθημερινή αποστολή, προστίθεται ένα μαργαριτάρι.';
  const pr=$('#pearlrow');const n=pearls(p);pr.innerHTML=n?Array.from({length:Math.min(n,30)},()=>`<span>${pearl()}</span>`).join('')+(n>30?`<b> +${n-30}</b>`:''):'';
  $('#todiploma').hidden=!done;
  show('treasure');
  setTimeout(()=>{ch.innerHTML=chestSVG(true);ch.classList.add('open');if(celebrate){sGood();setTimeout(sGood,250);confetti();}},celebrate?700:50);
}
function confetti(){const c=$('#confetti');c.innerHTML='';const cols=['#FFC933','#FF6F91','#3FAF7A','#4F9CFF','#fff'];for(let i=0;i<60;i++){const s=el('i');s.style.cssText=`left:${rnd(0,100)}%;background:${pick(cols)};animation-delay:${rnd(0,1.2)}s;animation-duration:${rnd(2.4,4)}s;transform:rotate(${rnd(0,360)}deg)`;c.appendChild(s);}setTimeout(()=>c.innerHTML='',5000);}
$('#trmap').onclick=()=>{renderMap();show('map');};
$('#todiploma').onclick=()=>openDiploma();
function diplomaMarkup(p,name){
  const first=Object.fromEntries(STAGES.map(x=>[x.id,null]));
  const d=new Date().toLocaleDateString('el-GR',{day:'numeric',month:'long',year:'numeric'});
  const rows=STAGES.map(x=>{const b=(p.best||{})[x.id]||0;return `<li><span class="dn">${x.id}</span><span><b>${x.name}</b><br><small>${x.skill}</small></span><span class="ds">${'★'.repeat(b)}<span class="off">${'★'.repeat(3-b)}</span></span></li>`;}).join('');
  return `<div class="dip"><div class="dipin">
<svg class="dipwave" viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M0 30 C150 60 300 0 450 30 S750 60 900 30 1050 0 1200 30 V0 H0Z" fill="#2A8FA3"/></svg>
<div class="dipseal">${chestSVG(true)}</div>
<h1>Δίπλωμα Δύτη Συγκέντρωσης</h1>
<p class="dipsub">Το δίπλωμα αυτό απονέμεται σε</p>
<p class="dipname">${esc(name)}</p>
<p class="dipsub">που ολοκλήρωσε και τους έξι στάθμους της «Βουτιάς Συγκέντρωσης»</p>
<ul class="dipgrid">${rows}</ul>
<div class="dipfoot"><span>Ημερομηνία: ${d}</span><span class="sig">Υπογραφή εκπαιδευτικού</span></div>
<p class="dipsite">learning-fast.com</p>
</div></div>`;
}
/* before the diploma is issued, ask which name to print: the profile may hold a nickname */
let dipName='';
function openDiploma(){
  const box=$('#dipask'),inp=$('#dipnamein');
  inp.value=prof().name;box.hidden=false;inp.focus();inp.select();
}
function issueDiploma(){
  const n=$('#dipnamein').value.trim();
  if(!n){toast('Γράψε το όνομα που θα μπει στο δίπλωμα');$('#dipnamein').focus();return;}
  dipName=n;$('#dipask').hidden=true;
  $('#dipbox').innerHTML=diplomaMarkup(prof(),dipName);show('diploma');
}
// after the diploma is issued: change the printed name
$('#dipedit').onclick=()=>{const box=$('#dipask'),inp=$('#dipnamein');inp.value=dipName;box.hidden=false;inp.focus();inp.select();};
$('#dipok').onclick=issueDiploma;
$('#dipcancel').onclick=()=>{$('#dipask').hidden=true;};
$('#dipnamein').addEventListener('keydown',e=>{if(e.key==='Enter')issueDiploma();});
$('#dipback').onclick=()=>openTreasure(false);
$('#dipprint').onclick=()=>{try{window.print();}catch(e){toast('Η εκτύπωση δεν είναι διαθέσιμη εδώ');}};
$('#dipdl').onclick=async()=>{
  const p=prof();
  const css=$('#dipcss').textContent;
  const doc=`<!DOCTYPE html><html lang="el"><head><meta charset="UTF-8"><title>Δίπλωμα ${esc(dipName)}</title><link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@500;700&family=Didact+Gothic&display=swap" rel="stylesheet"><style>body{margin:0;padding:20px;background:#fff;font-family:'Didact Gothic',sans-serif}${css}</style></head><body>${diplomaMarkup(p,dipName)}<script>window.onload=()=>setTimeout(()=>window.print(),600)<\/script></body></html>`;
  const fname=`diploma-${dipName.replace(/[^\p{L}\p{N}]+/gu,'-')}.html`;
  await saveFile(fname,doc,'text/html');
};
async function saveFile(fname,data,type){
  let dl=null;
  try{if(window.claude&&window.claude.use)dl=await window.claude.use('downloads');}catch(e){}
  if(dl){try{await dl.save({filename:fname,data});toast('Το αρχείο αποθηκεύτηκε');}catch(e){if(e&&e.code!=='declined')toast('Η λήψη δεν είναι διαθέσιμη εδώ');}return;}
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type}));a.download=fname;document.body.appendChild(a);a.click();a.remove();}catch(e){toast('Η λήψη δεν είναι διαθέσιμη εδώ');}
}
