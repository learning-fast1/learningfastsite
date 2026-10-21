/* ============================================================
   TEACHER — πίνακας εκπαιδευτικού, CSV
   ============================================================ */
"use strict";

/* ---------- teacher ---------- */
let gateAns=0,backTo='profiles';
document.querySelectorAll('[data-teacher]').forEach(b=>b.onclick=()=>{backTo=document.querySelector('.screen.on').id;const a=Math.floor(rnd(6,10)),c=Math.floor(rnd(6,10));gateAns=a*c;$('#gateq').textContent=`Για να συνεχίσεις, γράψε πόσο κάνει ${a} × ${c}.`;$('#gatein').value='';$('#gate').hidden=false;$('#tpanel').hidden=true;show('teacher');});
$('#gateback').onclick=()=>show(backTo);
$('#gateok').onclick=()=>{if(parseInt($('#gatein').value,10)===gateAns){$('#gate').hidden=true;$('#tpanel').hidden=false;renderTeacher();}else toast('Λάθος απάντηση');};
$('#gatein').addEventListener('keydown',e=>{if(e.key==='Enter')$('#gateok').click();});
$('#tback').onclick=()=>{if(backTo==='map'&&cur&&store.profiles[cur]){renderMap();show('map');}else{renderProfiles();show('profiles');}};
const pct=v=>v==null?'–':Math.round(v*100)+'%';
const ms=v=>v==null?'–':Math.round(v);
function renderTeacher(){
  const sel=$('#tsel');const ids=Object.keys(store.profiles);
  const keep=sel.value&&store.profiles[sel.value]?sel.value:(cur&&store.profiles[cur]?cur:ids[0]);
  sel.innerHTML=ids.map(id=>`<option value="${id}">${esc(store.profiles[id].name)}</option>`).join('');
  const body=$('#tbody');
  if(!ids.length){body.innerHTML='<p class="note">Δεν υπάρχουν ακόμη μαθητές.</p>';return;}
  sel.value=keep;
  const p=store.profiles[keep];
  const seg=(s,cur)=>`<span class="seg" role="group" aria-label="Δυσκολία">${Object.keys(TIERS).map(t=>`<button data-t="${t}" data-s="${s}" aria-pressed="${cur===t}">${TIERS[t].name}</button>`).join('')}</span>`;
  const all=STAGES.map(s=>tierOf(s.id,p));
  let h='<h2>Δυσκολία ανά στάθμο</h2><p class="note">«Αυτόματο»: το παιχνίδι ανεβαίνει και κατεβαίνει ελεύθερα από το επίπεδο 1 ως το 10. Εύκολο (1–3), Μέτριο (4–6), Δύσκολο (7–10): το παιχνίδι προσαρμόζεται μόνο μέσα σε αυτά τα όρια.</p><div class="levels">';
  h+=`<div class="lvl lvlall"><span><b>Όλοι οι στάθμοι</b></span>${seg('all',all.every(t=>t===all[0])?all[0]:'')}</div>`;
  STAGES.filter(s=>!s.soon).forEach(s=>{const T=TIERS[tierOf(s.id,p)],L=level(s.id,p);h+=`<div class="lvl"><span><b>${s.id}. ${s.name}</b><br><span class="note">${s.skill}</span></span>${seg(s.id,tierOf(s.id,p))}<span class="ctl"><button data-l="${s.id}" data-d="-1" aria-label="Μείωση" ${L<=T.lo?'disabled':''}>−</button><b title="Επίπεδο">${L}</b><button data-l="${s.id}" data-d="1" aria-label="Αύξηση" ${L>=T.hi?'disabled':''}>+</button></span></div>`;});
  const lv=lives6(p);
  h+=`<div class="lvl"><span><b>Ζωές στο υποβρύχιο</b><br><span class="note">Στάθμος 6 και καθημερινή αποστολή · αρχικά ${LIVES_DEFAULT}</span></span><span></span><span class="ctl"><button data-lives="-1" aria-label="Λιγότερες ζωές" ${lv<=LIVES_MIN?'disabled':''}>−</button><b>${lv}</b><button data-lives="1" aria-label="Περισσότερες ζωές" ${lv>=LIVES_MAX?'disabled':''}>+</button></span></div>`;
  h+=`</div><label><input type="checkbox" id="unlockall" ${p.unlockAll?'checked':''}> Ανοιχτοί όλοι οι στάθμοι για αυτόν τον μαθητή</label>`;
  const S=(p.sessions||[]).slice().reverse();
  const md=missionDays(p);
  h+=`<h2>Καθημερινές αποστολές</h2><p>${allPassed(p)?`Ολοκληρωμένες μέρες: <b>${md.length}</b>, αυτή την εβδομάδα: <b>${weekCount(p)}</b>${md.length?`, τελευταία: ${new Date(md[md.length-1]+'T12:00').toLocaleDateString('el-GR')}`:''}.`:'Ανοίγουν όταν ο μαθητής ολοκληρώσει και τους 6 στάθμους.'}</p>`;
  if(allPassed(p))h+='<p><button class="btn ghost small" id="tdip">Άνοιγμα διπλώματος</button></p>';
  h+=`<h2>Γύροι (${S.length})</h2>`;
  if(!S.length)h+='<p class="note">Ο μαθητής δεν έχει παίξει ακόμη.</p>';
  else{
    h+='<div class="tbl"><table><thead><tr><th>Ημερομηνία</th><th>Στάθμος</th><th>Επίπεδο</th><th>Ακρίβεια</th><th>Παραλείψεις</th><th>Λανθ. πατήματα</th><th>Μέσος χρόνος (ms)</th><th>SD (ms)</th><th>1ο / 2ο μισό</th><th>Διάρκεια</th><th>Αυτοαξιολόγηση</th><th>Κόλπο</th><th>Ειδικά στοιχεία</th></tr></thead><tbody>';
    S.forEach(x=>{const d=new Date(x.date);h+=`<tr><td>${d.toLocaleDateString('el-GR')} ${d.toLocaleTimeString('el-GR',{hour:'2-digit',minute:'2-digit'})}</td><td>${x.stage}${x.mission?' (αποστολή)':''}</td><td>${x.level} → ${x.newLevel}${x.tier&&x.tier!=='auto'?` <span class="note">(${TIERS[x.tier].name})</span>`:''}</td><td>${pct(x.acc)}</td><td>${x.omissions}/${x.targets}</td><td>${x.commissions}</td><td>${ms(x.mean)}</td><td>${ms(x.sd)}</td><td>${pct(x.acc1)} / ${pct(x.acc2)}</td><td>${x.durSec}″</td><td>${x.self?SELF[x.self-1].t:'–'}</td><td>${(STRATS.find(s=>s.id===x.strategy)||{}).t||'–'}</td><td>${extraInfo(x)}</td></tr>`;});
    h+='</tbody></table></div>';
  }
  h+='<div class="row"><button class="btn small" id="csvbtn">Λήψη CSV</button><button class="btn ghost small" id="delp">Διαγραφή μαθητή</button></div>';
  body.innerHTML=h;
  body.querySelectorAll('[data-lives]').forEach(b=>b.onclick=()=>{p.lives6=Math.min(LIVES_MAX,Math.max(LIVES_MIN,lives6(p)+(+b.dataset.lives)));save();renderTeacher();});
  body.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{const s=+b.dataset.l;p.levels=p.levels||{};p.levels[s]=clampTier(s,level(s,p)+(+b.dataset.d),p);save();renderTeacher();});
  body.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const t=b.dataset.t,ss=b.dataset.s==='all'?STAGES.map(x=>x.id):[+b.dataset.s];
    p.tiers=p.tiers||{};p.levels=p.levels||{};ss.forEach(s=>{p.tiers[s]=t;p.levels[s]=level(s,p);});save();renderTeacher();});
  $('#unlockall').onchange=e=>{p.unlockAll=e.target.checked;save();};
  $('#delp').onclick=()=>{if(confirm(`Να διαγραφεί ο μαθητής ${p.name} και όλα τα δεδομένα του;`)){delete store.profiles[keep];if(cur===keep)cur=null;save();sel.value='';renderTeacher();}};
  $('#csvbtn').onclick=()=>exportCSV(p);
  const td=$('#tdip');if(td)td.onclick=()=>{cur=keep;openDiploma();};
}
$('#tsel').onchange=renderTeacher;

function extraInfo(x){const a=[];if(x.switchCost!=null)a.push(`Κόστος εναλλαγής ${x.switchCost} ms`);if(x.switchAcc!=null)a.push(`Ακρίβεια στις αλλαγές ${pct(x.switchAcc)}`);if(x.collisions!=null)a.push(`Συγκρούσεις ${x.collisions}/${x.rocks}`);if(x.lives!=null)a.push(`Ζωές ${x.livesLeft}/${x.lives}`+(x.gameOver?' (τελείωσαν)':''));return a.join(', ')||'–';}
async function exportCSV(p){
  const head=['Μαθητής','Ημερομηνία','Στάθμος','Δεξιότητα','Επίπεδο','Νέο επίπεδο','Ζώνη δυσκολίας','Δοκιμές','Στόχοι','Επιτυχίες','Παραλείψεις','Λανθασμένα πατήματα','Ακρίβεια %','Μέσος χρόνος ms','SD ms','Ακρίβεια 1ο μισό %','Ακρίβεια 2ο μισό %','Διάρκεια s','Αυτοαξιολόγηση','Κόλπο','Μεταφορά','Κόστος εναλλαγής ms','Ακρίβεια στις αλλαγές %','Συγκρούσεις','Βράχοι','Καθημερινή αποστολή'];
  const q=v=>`"${String(v==null?'':v).replace(/"/g,'""')}"`;
  const r=v=>v==null?'':Math.round(v*100);
  const rows=(p.sessions||[]).map(x=>[p.name,new Date(x.date).toLocaleString('el-GR'),x.stage,STAGES[x.stage-1].skill,x.level,x.newLevel,TIERS[x.tier||'auto'].name,x.n,x.targets,x.hits,x.omissions,x.commissions,r(x.acc),x.mean==null?'':Math.round(x.mean),x.sd==null?'':Math.round(x.sd),r(x.acc1),r(x.acc2),x.durSec,x.self?SELF[x.self-1].t:'',(STRATS.find(s=>s.id===x.strategy)||{}).t||'',x.transfer||'',x.switchCost==null?'':x.switchCost,r(x.switchAcc),x.collisions==null?'':x.collisions,x.rocks==null?'':x.rocks,x.mission?'ναι':'']);
  const csv='\ufeff'+[head,...rows].map(a=>a.map(q).join(',')).join('\r\n');
  const fname=`vythos-${p.name.replace(/[^\p{L}\p{N}]+/gu,'-')}.csv`;
  await saveFile(fname,csv,'text/csv');
}
