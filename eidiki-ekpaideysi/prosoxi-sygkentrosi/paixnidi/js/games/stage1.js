/* ============================================================
   STAGE 1 — Εστιασμένη προσοχή
   ============================================================ */
"use strict";

/* stage 1: focused */
async function stage1(L,mini){
  const n=Math.ceil(Math.min(22,12+L)*(mini?.6:1)),disp=3000-(L-1)*220,size=Math.max(56,120-(L-1)*7);
  ruleBar('Πάτα '+cue(pearl(),true));
  const trials=[];let commissions=0;
  arena.onpointerdown=e=>{if(e.target.closest('.sprite'))return;commissions++;const [x,y]=localXY(e);burst(x,y,'Μόνο στο μαργαριτάρι','#FFD6DE');sBad();};
  for(let i=0;i<n;i++){
    if(await wait(rnd(600,1400))==='abort')break;
    const tr={type:'target',responded:false,rt:null,correct:false};trials.push(tr);
    const sp=spriteAt(pearl(),rnd(12,88),rnd(14,86),size,'bob');
    trialState={onset:now(),pOn:pausedTotal};
    sp.onpointerdown=e=>{e.stopPropagation();if(tr.responded||paused)return;tr.responded=true;tr.correct=true;tr.rt=rtNow();const [x,y]=localXY(e);ring(x,y);burst(x,y,'+10','#FFF3B0');sGood();addPts(10);sp.remove();};
    const r=await wait(disp,()=>tr.responded);
    if(r==='abort')break;
    if(!tr.responded){sp.remove();sMiss();}
    progress(i+1,n);
  }
  return {trials,extraCommissions:commissions};
}
