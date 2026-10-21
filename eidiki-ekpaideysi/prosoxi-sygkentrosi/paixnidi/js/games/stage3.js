/* ============================================================
   STAGE 3 — Αναστολή αντίδρασης (go/no-go)
   ============================================================ */
"use strict";

/* stage 3: go/no-go + waiting */
async function stage3(L,mini){
  const n=Math.round((24+(L-1)*3)*(mini?.5:1)),nogoP=Math.min(.3,.2+L*.01),waitP=L>=4?.15:0;
  const stim=1400-(L-1)*70,size=Math.max(90,130-(L-1)*4);
  const seq=[];for(let i=0;i<n;i++){const r=Math.random();seq.push(i<3?'go':r<nogoP?'nogo':r<nogoP+waitP?'wait':'go');}
  ruleBar(cue(fish('#5BC0EB'),true)+cue(jelly(),false)+(L>=4?cue(oyster(false),false)+cue(oyster(true),true):''));
  const trials=[];
  for(let i=0;i<n;i++){
    if(await wait(rnd(700,1100))==='abort')break;
    const type=seq[i];
    const tr={type:type==='go'?'target':type==='nogo'?'nontarget':'wait',responded:false,rt:null,correct:type==='nogo'};trials.push(tr);
    const x=rnd(14,86),y=rnd(16,84);
    let sp,isOpen=false,openAt=0;
    if(type==='go')sp=spriteAt(fish(pick(FISHCOL)),x,y,size,'bob');
    else if(type==='nogo')sp=spriteAt(jelly(),x,y,size*.9,'bob');
    else sp=spriteAt(oyster(false),x,y,size);
    trialState={onset:now(),pOn:pausedTotal};
    sp.onpointerdown=e=>{e.stopPropagation();if(tr.responded||paused)return;const [px,py]=localXY(e);
      if(type==='go'){tr.responded=true;tr.correct=true;tr.rt=rtNow();ring(px,py);burst(px,py,'+10','#FFF3B0');sGood();addPts(10);sp.remove();}
      else if(type==='nogo'){tr.responded=true;tr.correct=false;tr.rt=rtNow();sp.classList.add('shake');burst(px,py,'Ωχ, μέδουσα!','#FFD6DE');sBad();addPts(-5);}
      else{
        tr.responded=true;
        if(isOpen){tr.correct=true;tr.rt=now()-openAt;ring(px,py);burst(px,py,'Περίμενες! +20','#FFF3B0');sGood();addPts(20);sp.remove();}
        else{tr.correct=false;tr.early=true;sp.classList.add('shake');burst(px,py,'Περίμενε να ανοίξει','#FFD6DE');sBad();}
      }
    };
    let r;
    if(type==='wait'){
      const delay=Math.min(2600,1000+L*150);
      r=await wait(delay,()=>tr.responded);
      if(r==='abort')break;
      if(!tr.responded){isOpen=true;openAt=now();sp.innerHTML=oyster(true);r=await wait(1500,()=>tr.responded);}
      else{await wait(500);}
    }else{
      r=await wait(stim,()=>tr.responded&&type==='go');
    }
    if(r==='abort')break;
    if(sp.isConnected){if(type==='go'&&!tr.responded)sMiss();sp.remove();}
    progress(i+1,n);
  }
  return {trials,extraCommissions:0};
}
