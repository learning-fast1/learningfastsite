/* ============================================================
   MISSION — καθημερινή αποστολή
   ============================================================ */
"use strict";

/* ---------- daily mission ---------- */
function openMission(){
  stage=0;
  $('#introtitle').textContent='Καθημερινή αποστολή';
  $('#introlevel').textContent='Λίγο από κάθε στάθμο, περίπου 5 λεπτά';
  $('#introdemo').innerHTML=`<figure><div class="tile"><div style="width:70px;height:60px">${pearl()}</div></div><span class="yes">1 μαργαριτάρι την ημέρα</span></figure>`;
  $('#introtext').textContent='Θα περάσεις από όλους τους στάθμους με τη σειρά. Πριν από κάθε στάθμο θα δεις τον κανόνα. Στο τέλος κερδίζεις το μαργαριτάρι της ημέρας για το σεντούκι σου.';
  const box=$('#strategies');box.innerHTML='';
  STRATS.forEach(x=>{const b=el('button',{class:'choice','aria-pressed':String(strategy===x.id)});b.innerHTML=`<span class="ic">${x.ic}</span><span>${x.t}</span>`;b.onclick=()=>{strategy=x.id;box.querySelectorAll('.choice').forEach(c=>c.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');};box.appendChild(b);});
  show('intro');
}
function missionCard(s,L){
  return new Promise(res=>{
    const S=STAGES[s-1];
    const c=el('div',{class:'mcard'});
    c.innerHTML=`<div class="mcin"><p class="note">Στάθμος ${s} από 6</p><h2>${S.name}</h2><div class="demo">${demoHTML(s,L)}</div><p>${instructions(s,L)}</p><div class="row" style="justify-content:center"><button class="speak">🔊 Άκουσε</button><button class="btn">Είμαι έτοιμος/η</button></div></div>`;
    arena.appendChild(c);
    c.querySelector('.speak').onclick=()=>sayVoice(voiceId(s,L),instructions(s,L));
    const go=c.querySelector('.btn');go.focus();
    go.onclick=()=>{stopVoice();c.remove();res('go');};
    const chk=()=>{if(aborted){c.remove();res('abort');}else requestAnimationFrame(chk);};requestAnimationFrame(chk);
  });
}
async function runMission(){
  paused=false;aborted=false;pausedTotal=0;points=0;trialState=null;
  $('#pts').textContent='0 ✦';progress(0,1);clearArena();arena.onpointerdown=null;
  show('play');
  const results=[];
  const fns=[stage1,stage2,stage3,stage4,stage5,stage6];
  for(let s=1;s<=6&&!aborted;s++){
    const L=level(s);
    if(s===4)target4=pick(TARGETS4);
    if(await missionCard(s,L)==='abort')break;
    const t0=now(),p0=pausedTotal;
    await countdown();if(aborted)break;
    const data=await fns[s-1](L,true);
    keyH=null;clearArena();arena.onpointerdown=null;
    const dur=now()-t0-(pausedTotal-p0);sessionMs+=dur;
    if(aborted)break;
    const m=analyse(data);
    if(m.n>=3||m.gameOver)results.push(applyResult(s,L,m,dur,true));
  }
  keyH=null;clearArena();arena.onpointerdown=null;
  if(aborted||results.length<6){renderMap();show('map');return;}
  finishMission(results);
}
function finishMission(results){
  const p=prof();
  const had=pearls(p);
  p.missions=p.missions||[];
  const rec={date:new Date().toISOString(),stars:results.map(r=>r.stars),acc:results.reduce((a,r)=>a+r.acc,0)/results.length,self:null};
  p.missions.push(rec);save();
  const gained=pearls(p)>had;
  $('#mresult .pearlbig').innerHTML=pearl();
  $('#mrpearl').textContent=gained?`Κέρδισες ένα μαργαριτάρι! Τώρα έχεις ${pearls(p)}. Αυτή την εβδομάδα: ${weekCount(p)} από 5 αποστολές.`:'Το σημερινό μαργαριτάρι το έχεις ήδη. Έλα ξανά αύριο για το επόμενο!';
  $('#mrlist').innerHTML=results.map(r=>{const S=STAGES[r.stage-1];const ch=r.newLevel>r.level?'<span class="up">▲ επίπεδο '+r.newLevel+'</span>':r.newLevel<r.level?'<span class="down">επίπεδο '+r.newLevel+'</span>':'<span>επίπεδο '+r.level+'</span>';return `<div class="mrow"><span>${S.id}. ${S.name}</span><span class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(3-r.stars)}</span>${ch}</div>`;}).join('');
  const worst=results.slice().sort((a,b)=>a.acc-b.acc)[0];
  $('#mrtip').textContent=worst.acc>=.8?'Πολύ δυνατή αποστολή σε όλους τους στάθμους!':`Αύριο πρόσεξε λίγο περισσότερο στο «${STAGES[worst.stage-1].name}».`;
  const sr=$('#mrself');sr.innerHTML='';
  SELF.forEach((x,i)=>{const b=el('button',{class:'face','aria-pressed':'false'});b.innerHTML=`<span class="e">${x.e}</span>${x.t}`;b.onclick=()=>{sr.querySelectorAll('.face').forEach(f=>f.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');rec.self=i+1;results.forEach(r=>r.self=i+1);save();};sr.appendChild(b);});
  show('mresult');
  if(gained){sGood();setTimeout(sGood,200);}
}
$('#mrdone').onclick=()=>{sessionMs=0;renderMap();show('map');};
