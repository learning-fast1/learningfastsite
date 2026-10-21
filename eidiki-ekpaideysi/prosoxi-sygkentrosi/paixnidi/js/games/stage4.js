/* ============================================================
   STAGE 4 — Επιλεκτική προσοχή (οπτική αναζήτηση)
   ============================================================ */
"use strict";

/* stage 4: selective (visual search) */
async function stage4(L,mini){
  const screens=mini?3:6+Math.floor(L/3);
  const nItems=Math.min(34,8+Math.round(L*2.6));
  const conj=L>=4,moving=L>=7;
  const T=target4;
  const hint=ruleBar('');
  const trials=[];let extra=0;
  const colors=Object.keys(C4),shapes=Object.keys(SH4);
  for(let sc=0;sc<screens;sc++){
    if(await wait(500)==='abort')break;
    const k=2+Math.floor(Math.random()*3);
    const items=[];for(let i=0;i<k;i++)items.push({c:T.color,s:T.shape,t:true});
    const oc=colors.filter(c=>c!==T.color),os=shapes.filter(s=>s!==T.shape);
    for(let i=k;i<nItems;i++){
      const r=Math.random();
      if(conj&&r<.38)items.push({c:T.color,s:pick(os)});
      else if(conj&&r<.76)items.push({c:pick(oc),s:T.shape});
      else items.push({c:pick(oc),s:pick(os)});
    }
    shuffle(items);
    const R=arena.getBoundingClientRect();
    const areaH=R.height*.82,cols=Math.max(3,Math.ceil(Math.sqrt(nItems*R.width/areaH))),rows=Math.ceil(nItems/cols)+1;
    const cells=shuffle(Array.from({length:cols*rows},(_,i)=>i)).slice(0,nItems);
    const cw=R.width/cols,chh=areaH/rows,size=Math.max(40,Math.min(100,Math.min(cw,chh)*.72));
    let found=0;const tgtEls=[];
    const fh=()=>{hint.innerHTML=`Βρες ${cue(itemSVG(T.color,T.shape),true)} ${found} / ${k}`;};fh();
    trialState={onset:now(),pOn:pausedTotal};
    items.forEach((it,idx)=>{
      const cell=cells[idx],cx=cell%cols,cy=Math.floor(cell/cols);
      const x=(cx+.5+rnd(-.12,.12))*cw/R.width*100,y=12+(cy+.5+rnd(-.12,.12))*chh/R.height*100;
      const sp=spriteAt(itemSVG(it.c,it.s),x,y,size);
      sp.style.transform=`translate(-50%,-50%) rotate(${rnd(-20,20)}deg)`;
      if(moving&&!it.t){sp.style.setProperty('--dx',rnd(-30,30)+'px');sp.style.setProperty('--dy',rnd(-24,24)+'px');sp.style.animation=`popin .18s ease-out, drift ${rnd(2.5,5)}s ease-in-out infinite alternate`;}
      if(it.t){const tr={type:'target',responded:false,rt:null,correct:false};trials.push(tr);tgtEls.push({sp,tr});
        sp.onpointerdown=e=>{e.stopPropagation();if(tr.responded||paused)return;tr.responded=true;tr.correct=true;tr.rt=rtNow();found++;fh();const [px,py]=localXY(e);ring(px,py);burst(px,py,'+10','#FFF3B0');sGood();addPts(10);sp.style.opacity='.25';sp.style.pointerEvents='none';};
      }else{
        sp.onpointerdown=e=>{e.stopPropagation();if(paused)return;extra++;const [px,py]=localXY(e);sp.classList.remove('shake');void sp.offsetWidth;sp.classList.add('shake');burst(px,py,'Δεν είναι αυτό','#FFD6DE');sBad();};
      }
    });
    const limit=9000+nItems*350;
    const r=await wait(limit,()=>found>=k);
    if(r==='abort')break;
    const missed=tgtEls.filter(o=>!o.tr.responded);
    if(missed.length){missed.forEach(o=>{o.sp.style.animation='none';o.sp.style.filter='drop-shadow(0 0 10px #fff) drop-shadow(0 0 18px #FFF3B0)';});hint.textContent='Εδώ κρύβονταν και άλλοι!';sMiss();if(await wait(1300)==='abort')break;}
    else{if(await wait(350)==='abort')break;}
    arena.querySelectorAll('.sprite').forEach(x=>x.remove());
    progress(sc+1,screens);
  }
  return {trials,extraCommissions:extra};
}
