/* ============================================================
   ENGINE — μηχανή γύρου (χρονισμός, παύση, εφέ, αντίστροφη μέτρηση)
   ============================================================ */
"use strict";

let keyH=null;
document.addEventListener('keydown',e=>{if(keyH&&$('#play').classList.contains('on')&&!paused){if(keyH(e))e.preventDefault();}});

/* ---------- round engine ---------- */
let paused=false,aborted=false,pausedTotal=0,pauseStart=0,trialState=null,points=0;
let sessionMs=0;
const arena=$('#arena');
function now(){return performance.now();}
function wait(ms,until){return new Promise(res=>{let el2=0,last=now();function tick(t){if(aborted)return res('abort');if(!paused)el2+=t-last;last=t;if(until&&until())return res('hit');if(el2>=ms)return res('time');requestAnimationFrame(tick);}requestAnimationFrame(tick);});}
function setPause(v){if(v===paused)return;paused=v;if(v){pauseStart=now();}else{pausedTotal+=now()-pauseStart;}$('#pausebox').classList.toggle('on',v);}
$('#pausebtn').onclick=()=>setPause(true);
$('#resumebtn').onclick=()=>setPause(false);
$('#quitbtn').onclick=()=>{aborted=true;setPause(false);};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&$('#play').classList.contains('on'))setPause(true);});
function rtNow(){return now()-trialState.onset-(pausedTotal-trialState.pOn);}
function burst(x,y,txt,color){const b=el('div',{class:'burst'});b.textContent=txt;b.style.left=x+'px';b.style.top=y+'px';b.style.color=color||'#fff';arena.appendChild(b);setTimeout(()=>b.remove(),700);}
function ring(x,y){const r=el('div',{class:'ring'});r.style.left=x+'px';r.style.top=y+'px';arena.appendChild(r);setTimeout(()=>r.remove(),500);}
function addPts(n){points=Math.max(0,points+n);$('#pts').textContent=points+' ✦';}
function progress(i,n){$('#oxy').style.width=Math.round(100*i/n)+'%';}
function clearArena(){arena.querySelectorAll(':scope > :not(.ray)').forEach(x=>x.remove());arena.scrollTop=arena.scrollLeft=0;}
function localXY(e){const r=arena.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];}
/* in-game reminder of the rule: small icons, ✓ = tap it, red X = don't */
function cue(svg,yes){return `<span class="cue"><span class="cueic">${svg}</span>`+(yes?'<b class="cuev">✓</b>':'<svg class="cuex" viewBox="0 0 10 10" preserveAspectRatio="none"><path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="#fff" stroke-width="1.5"/><path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="#E0506F" stroke-width=".9"/></svg>')+'</span>';}
function ruleBar(html){const b=el('div',{class:'rulebar'});b.innerHTML=html;arena.appendChild(b);return b;}
function spriteAt(svg,xPct,yPct,size,cls){const b=el('button',{class:'sprite '+(cls||'')});b.style.left=xPct+'%';b.style.top=yPct+'%';b.style.width=size+'px';b.style.height=size+'px';b.innerHTML=svg;arena.appendChild(b);return b;}

async function countdown(){for(const n of ['3','2','1']){const c=el('div',{class:'countdown'});c.textContent=n;arena.appendChild(c);tone(520,.1,'sine',.06);await wait(700);c.remove();if(aborted)return;}}

async function runRound(s){
  const L=level(s);
  paused=false;aborted=false;pausedTotal=0;points=0;trialState=null;
  $('#pts').textContent='0 ✦';progress(0,1);clearArena();arena.onpointerdown=null;
  show('play');
  const t0=now();
  await countdown();
  let data;
  if(!aborted){
    data=await [stage1,stage2,stage3,stage4,stage5,stage6][s-1](L);
  }
  keyH=null;clearArena();arena.onpointerdown=null;
  const dur=now()-t0-pausedTotal;sessionMs+=dur;
  if(aborted){renderMap();show('map');return;}
  finish(s,L,data,dur);
}
