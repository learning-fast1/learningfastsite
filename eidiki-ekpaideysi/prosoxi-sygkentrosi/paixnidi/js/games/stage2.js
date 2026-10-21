/* ============================================================
   STAGE 2 — Διατηρούμενη προσοχή (CPT)
   ============================================================ */
"use strict";

/* stage 2: sustained (CPT) */
async function stage2(L,mini){
  const n=Math.round((30+(L-1)*8)*(mini?.5:1)),stim=1300-(L-1)*50,isi=1600-(L-1)*60;
  const nT=Math.round(n*.25);
  const seq=shuffle(Array.from({length:n},(_,i)=>i<nT?'target':'nontarget'));
  // avoid target in first 2 positions
  for(let k=0;k<2;k++)if(seq[k]==='target'){const j=seq.findIndex((v,idx)=>idx>2&&v==='nontarget');if(j>0)[seq[k],seq[j]]=[seq[j],seq[k]];}
  const ph=el('div',{class:'porthole'});const slot=el('div',{class:'fishslot'});ph.appendChild(slot);arena.appendChild(ph);
  ruleBar('Πάτα μόνο '+cue(goldfish(),true)+cue(fish('#FF6F91'),false)+(L>=6?cue(fish('#FF9A1F','#D9740A'),false):''));
  const btn=el('button',{class:'bigtap'});btn.textContent='Πάτα!';arena.appendChild(btn);
  const trials=[];let tr=null;
  const respond=e=>{e.preventDefault();if(!tr||tr.responded||paused)return;tr.responded=true;tr.rt=rtNow();const r=ph.getBoundingClientRect(),a=arena.getBoundingClientRect();const x=r.left-a.left+r.width/2,y=r.top-a.top+r.height/2;
    if(tr.type==='target'){tr.correct=true;ring(x,y);burst(x,y-40,'Το έπιασες!','#FFF3B0');sGood();addPts(10);}
    else{tr.correct=false;ph.classList.remove('shake');void ph.offsetWidth;ph.classList.add('shake');burst(x,y-40,'Δεν ήταν χρυσόψαρο','#FFD6DE');sBad();}
  };
  btn.onpointerdown=respond;ph.onpointerdown=respond;
  // on a computer the Space key does the same as the «Πάτα!» button (the instruction says so)
  keyH=e=>{if(e.key===' '){respond(e);return true;}return false;};
  const similar=L>=6;
  for(let i=0;i<n;i++){
    tr={type:seq[i],responded:false,rt:null,correct:seq[i]==='nontarget'};trials.push(tr);
    slot.innerHTML=tr.type==='target'?goldfish():(similar&&Math.random()<.4?fish('#FF9A1F','#D9740A'):fish(pick(FISHCOL)));
    slot.style.animation='none';void slot.offsetWidth;slot.style.animation='grow .18s ease-out';
    trialState={onset:now(),pOn:pausedTotal};
    if(await wait(stim)==='abort')break;
    slot.innerHTML='';
    if(await wait(isi)==='abort')break;
    if(tr.type==='target'&&!tr.responded){const r=ph.getBoundingClientRect(),a=arena.getBoundingClientRect();burst(r.left-a.left+r.width/2,r.top-a.top+r.height/2,'Σου ξέφυγε το χρυσόψαρο!','#CFEFF5');sMiss();}
    progress(i+1,n);
  }
  tr=null;keyH=null;
  return {trials,extraCommissions:0};
}
