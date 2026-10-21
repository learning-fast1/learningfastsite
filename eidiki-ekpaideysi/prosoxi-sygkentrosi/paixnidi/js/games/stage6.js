/* ============================================================
   STAGE 6 — Διαιρεμένη προσοχή (οδήγηση + εντοπισμός)
   ============================================================ */
"use strict";

/* lives: the same at every level; the teacher can raise or lower them per child (teacher panel) */
const LIVES_DEFAULT=4,LIVES_MIN=1,LIVES_MAX=10;
function lives6(p){p=p||prof();return p.lives6||LIVES_DEFAULT;}
const heart=()=>`<svg viewBox="0 0 24 22" aria-hidden="true"><path d="M12 21 C5 15 1 11.5 1 7 A5.5 5.5 0 0 1 12 4.2 A5.5 5.5 0 0 1 23 7 C23 11.5 19 15 12 21Z" fill="#FF6F91" stroke="#fff" stroke-width="1.5"/></svg>`;

/* stage 6: divided (steer + spot) */
async function stage6(L,mini){
  const duration=mini?45000:60000+(L-1)*10000,warm=L<=3?(mini?6000:12000):0;
  const spawnInt=2400-(L-1)*120,fallT=3600-(L-1)*170;
  const stim=1300-(L-1)*50,isi=1500-(L-1)*50;
  // positions are fractions of the arena width. One arrow press moves half a sub's width, and rocks fall
  // anywhere across the width, so dodging a rock takes the same two presses on a phone and on a big screen
  let subF=.5;
  const geom=()=>{const W=arena.clientWidth,sw=subEl.offsetWidth,m=(sw/2+6)/W;return {W,sw,minF:m,maxF:1-m,stepF:sw*.5/W};};
  const win6=el('div',{class:'win6'});const slot=el('div',{class:'fishslot'});win6.appendChild(slot);arena.appendChild(win6);
  const hint=el('div',{class:'hint6'});arena.appendChild(hint);
  const subEl=el('div',{class:'sub6'});subEl.innerHTML=sub();arena.appendChild(subEl);
  const place=()=>{subEl.style.left=(subF*100).toFixed(2)+'%';};place();
  const lb=el('button',{class:'ctl6 left','aria-label':'Αριστερά'},'◀'),rb=el('button',{class:'ctl6 right','aria-label':'Δεξιά'},'▶'),cam=el('button',{class:'cam6','aria-label':'Φωτογραφία'},'📷');
  arena.append(lb,rb,cam);
  const move=d=>{if(paused||done)return;const g=geom();subF=Math.max(g.minF,Math.min(g.maxF,subF+d*g.stepF));place();};
  // a tap moves one step; keeping the finger on the arrow keeps moving
  const holds=[];
  const hold=(btn,d)=>{let t=null;const stop=()=>{clearTimeout(t);t=null;};holds.push(stop);
    btn.onpointerdown=e=>{e.preventDefault();stop();move(d);const rep=()=>{move(d);t=setTimeout(rep,110);};t=setTimeout(rep,280);};
    btn.onpointerup=btn.onpointercancel=btn.onpointerleave=stop;};
  hold(lb,-1);hold(rb,1);
  const trials=[];let ptr=null,elapsed=0,done=false;

  // lives
  const LIVES=lives6();let left=LIVES,gameOver=false;
  const livesEl=el('div',{class:'lives6','aria-label':`Ζωές: ${LIVES}`});
  livesEl.innerHTML=Array.from({length:LIVES},()=>`<span>${heart()}</span>`).join('');arena.appendChild(livesEl);
  const loseLife=()=>{if(left<=0)return;left--;const h=livesEl.children[left];h.classList.add('off','lost');livesEl.setAttribute('aria-label',`Ζωές: ${left} από ${LIVES}`);
    if(left<=0){gameOver=true;done=true;}};

  const shoot=()=>{if(!ptr||ptr.responded||paused||done)return;ptr.responded=true;ptr.rt=rtNow();const r=win6.getBoundingClientRect(),a=arena.getBoundingClientRect();const x=r.left-a.left+r.width/2,y=r.top-a.top+r.height/2;
    if(ptr.type==='target'){ptr.correct=true;ring(x,y);burst(x,y+40,'Κλικ! +10','#FFF3B0');sGood();addPts(10);}
    else{ptr.correct=false;win6.classList.remove('shake');void win6.offsetWidth;win6.classList.add('shake');burst(x,y+40,'Δεν ήταν χρυσόψαρο','#FFD6DE');sBad();}};
  cam.onpointerdown=e=>{e.preventDefault();shoot();};
  keyH=e=>{if(e.key==='ArrowLeft'){move(-1);return true;}if(e.key==='ArrowRight'){move(1);return true;}if(e.key===' '||e.key==='Enter'){shoot();return true;}return false;};
  const cues=both=>{hint.innerHTML=cue(rock(),false)+(both?cue(goldfish(),true)+cue(fish('#FF6F91'),false):'');};
  cues(!warm);
  win6.style.opacity=warm?'.35':'1';

  // rocks loop
  const rocks=[];let spawnAcc=spawnInt*.6;
  const rockLoop=new Promise(res=>{let last=now();function tick(t){
    if(aborted||done){return res();}
    const dt=t-last;last=t;
    if(!paused){
      elapsed+=dt;spawnAcc+=dt;progress(Math.min(elapsed,duration),duration);
      // 6 in 10 rocks fall where the sub is when they appear (it has to move away); the rest fall anywhere
      if(elapsed<duration-fallT*.5&&spawnAcc>=spawnInt){spawnAcc=0;const g=geom(),xF=Math.random()<.6?Math.max(g.minF,Math.min(g.maxF,subF+(Math.random()-.5)*g.stepF)):g.minF+Math.random()*(g.maxF-g.minF);const d=el('div',{class:'rock6'});d.innerHTML=rock();d.style.left=(xF*100).toFixed(2)+'%';arena.appendChild(d);rocks.push({d,xF,p:0,hit:false});}
      for(let i=rocks.length-1;i>=0;i--){const o=rocks[i];o.p+=dt/fallT;o.d.style.top=(26+o.p*62)+'%';
        if(!o.hit&&o.p>=.72&&o.p<=.86){
          // hit when the rock and the sub overlap sideways (a little forgiving at the edges)
          const W=arena.clientWidth,rw=o.d.offsetWidth,sw=subEl.offsetWidth;
          if(Math.abs(o.xF-subF)*W<(rw+sw)/2*.8){
            o.hit=true;trials.push({type:'rock',responded:true,correct:false});subEl.classList.remove('shake');void subEl.offsetWidth;subEl.classList.add('shake');const a=arena.getBoundingClientRect(),r=subEl.getBoundingClientRect();burst(r.left-a.left+r.width/2,r.top-a.top,'Μπαμ!','#FFD6DE');sBad();addPts(-5);o.d.remove();rocks.splice(i,1);loseLife();continue;}
        }
        if(o.p>=1){trials.push({type:'rock',responded:true,correct:true});o.d.remove();rocks.splice(i,1);}
      }
      if(warm&&elapsed>=warm&&win6.style.opacity!=='1'){win6.style.opacity='1';cues(true);tone(660,.15);}
      if(elapsed>=duration&&!rocks.length){done=true;return res();}
    }
    requestAnimationFrame(tick);}
    requestAnimationFrame(tick);});

  // spotting loop: in every three fish exactly one is the goldfish (the first one comes within the first three)
  const spotLoop=(async()=>{
    if(warm&&await wait(warm,()=>done)!=='time')return;
    let k=0,goldAt=1+Math.floor(Math.random()*2);
    while(!done&&!aborted&&elapsed<duration-stim-isi){
      if(k>0&&k%3===0)goldAt=k+Math.floor(Math.random()*3);
      const type=k===goldAt?'target':'nontarget';k++;
      ptr={type,responded:false,rt:null,correct:type==='nontarget'};trials.push(ptr);
      slot.innerHTML=type==='target'?goldfish():fish(pick(FISHCOL));
      slot.style.animation='none';void slot.offsetWidth;slot.style.animation='grow .18s ease-out';
      trialState={onset:now(),pOn:pausedTotal};
      if(await wait(stim,()=>done)==='abort')return;
      slot.innerHTML='';
      if(done)break;
      if(await wait(isi,()=>done)==='abort')return;
      if(ptr.type==='target'&&!ptr.responded){const r=win6.getBoundingClientRect(),a=arena.getBoundingClientRect();burst(r.left-a.left+r.width/2,r.top-a.top+r.height+20,'Σου ξέφυγε το χρυσόψαρο!','#CFEFF5');sMiss();loseLife();}
    }
    ptr=null;
  })();
  await Promise.all([rockLoop,spotLoop]);
  holds.forEach(f=>f());
  keyH=null;
  rocks.forEach(o=>o.d.remove());
  if(gameOver&&!aborted){
    const b=el('div',{class:'banner'});b.innerHTML='Τελείωσαν οι ζωές!';arena.appendChild(b);sBad();
    await wait(1800);b.remove();
  }
  return {trials,extraCommissions:0,gameOver,lives:LIVES,livesLeft:left};
}
