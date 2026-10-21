/* ============================================================
   STAGE 5 — Εναλλασσόμενη προσοχή (αλλαγή κανόνα)
   ============================================================ */
"use strict";

/* stage 5: alternating (rule switching) */
const RULES={
 color:{name:'Χρώμα',bg:'#FFE1EA',left:`<span class="dot" style="background:${C4.pink}"></span>`,right:`<span class="dot" style="background:${C4.blue}"></span>`,side:it=>it.c==='pink'?'L':'R'},
 shape:{name:'Σχήμα',bg:'#D9F3EA',left:()=>fish('#B8C4C9','#8A979C'),right:()=>star('#B8C4C9'),side:it=>it.s==='fish'?'L':'R'}
};
async function stage5(L,mini){
  const n=Math.round((24+(L-1)*3)*(mini?.55:1)),win=3200-(L-1)*170;
  const seq=[];let rule=Math.random()<.5?'color':'shape',left=0;
  for(let i=0;i<n;i++){
    let sw=false;
    if(i>0){
      if(L<=3){if(i%8===0)sw=true;}
      else if(L<=6){if(left<=0)sw=true;}
      else if(i>=3&&Math.random()<.3)sw=true;
    }
    if(sw)rule=rule==='color'?'shape':'color';
    if(i===0||sw)left=4+Math.floor(Math.random()*3);
    left--;
    seq.push({rule,sw});
  }
  const sign=el('div',{class:'rulesign'});arena.appendChild(sign);
  const center=el('div',{class:'center5'});arena.appendChild(center);
  const bL=el('button',{class:'sidebtn l','aria-label':'Αριστερά'}),bR=el('button',{class:'sidebtn r','aria-label':'Δεξιά'});arena.append(bL,bR);
  const banner=el('div',{class:'banner'});
  const trials=[];let tr=null,curItem=null,curRule=null;
  const paint=r=>{const R5=RULES[r];sign.style.background=R5.bg;sign.innerHTML=`Κανόνας: <b>${R5.name}</b>`;
    bL.innerHTML=typeof R5.left==='function'?`<div class="bi">${R5.left()}</div>`:`<div class="bi">${R5.left}</div>`;
    bR.innerHTML=typeof R5.right==='function'?`<div class="bi">${R5.right()}</div>`:`<div class="bi">${R5.right}</div>`;};
  const answer=(side,e)=>{if(!tr||tr.responded||paused)return;tr.responded=true;tr.rt=rtNow();const ok=RULES[curRule].side(curItem)===side;tr.correct=ok;if(!ok)tr.wrong=true;
    const r=center.getBoundingClientRect(),a=arena.getBoundingClientRect();const x=r.left-a.left+r.width/2,y=r.top-a.top+r.height/2;
    if(ok){ring(x,y);burst(x,y-60,'Σωστά!','#FFF3B0');sGood();addPts(10);center.style.transform=`translate(calc(-50% ${side==='L'?'- 120px':'+ 120px'}),-50%) scale(.6)`;center.style.opacity='0';}
    else{center.classList.remove('shake');void center.offsetWidth;center.classList.add('shake');burst(x,y-60,`Κανόνας: ${RULES[curRule].name}`,'#FFD6DE');sBad();}
  };
  bL.onpointerdown=e=>{e.preventDefault();answer('L',e);};
  bR.onpointerdown=e=>{e.preventDefault();answer('R',e);};
  keyH=e=>{if(e.key==='ArrowLeft'){answer('L');return true;}if(e.key==='ArrowRight'){answer('R');return true;}return false;};
  for(let i=0;i<n;i++){
    const s=seq[i];
    if(i===0||s.sw){paint(s.rule);
      if(i===0||L<=6){banner.innerHTML=i===0?`Ξεκινάμε με: <b>${RULES[s.rule].name}</b>`:`Ο κανόνας αλλάζει!<br><b>${RULES[s.rule].name}</b>`;arena.appendChild(banner);tone(440,.12);setTimeout(()=>tone(660,.14),120);
        if(await wait(i===0||L<=3?1600:900)==='abort')break;banner.remove();}
      else{sign.classList.remove('flash');void sign.offsetWidth;sign.classList.add('flash');}
    }
    curRule=s.rule;curItem={c:pick(['pink','blue']),s:pick(['fish','star'])};
    tr={type:'target',sw:s.sw&&i>0,responded:false,rt:null,correct:false};trials.push(tr);
    center.style.transition='none';center.style.transform='translate(-50%,-50%)';center.style.opacity='1';
    center.innerHTML=itemSVG(curItem.c,curItem.s);void center.offsetWidth;center.style.transition='transform .25s, opacity .25s';
    trialState={onset:now(),pOn:pausedTotal};
    const r=await wait(win,()=>tr.responded);
    if(r==='abort')break;
    if(!tr.responded){sMiss();center.style.opacity='0';}
    if(await wait(tr.correct?450:800)==='abort')break;
    center.innerHTML='';
    progress(i+1,n);
  }
  keyH=null;tr=null;banner.remove();
  return {trials,extraCommissions:0};
}
