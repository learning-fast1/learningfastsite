/* ============================================================
   ENGINE — ροή σταδίου, γύροι, κλιμακούμενη βοήθεια, σύρσιμο
   ============================================================ */
"use strict";

const ROUNDS=10;  // rounds in a stage, or in each part of a stage that has parts
const STAGE={};   // js/games/stageN.js: STAGE[n]={setup(lvl)→one item per round, round(item), parts?}
let G=null;       // the stage being played
let token=0;      // bumps when a stage starts or is left, so pending timeouts of the old one do nothing
function later(fn,ms){const t=token;setTimeout(()=>{if(t===token)fn();},ms);}

/* practice = {items, lvl}: replay only the rounds that went wrong (from the result screen) */
function startStage(n,practice){
  token++;hush();
  const lvl=practice?practice.lvl:store.settings.money,s=SHOPS[n-1];
  G={n,lvl,mode:n===2?store.settings.list:'imgword',   // the list setting is the Φούρνος's; the other shops show picture and word
round:0,total:practice?practice.items.length:ROUNDS*(STAGE[n].parts||1),practice:!!practice,
     errs:0,busy:false,log:[],slips:[],extra:{},said:''};
  G.items=practice?practice.items:STAGE[n].setup(lvl);
  $('#shopname').innerHTML=`<img src="${s.img}" alt=""> <span>${s.name}</span>`;
  show('play');
  track(practice?'practice_start':'stage_start',{stage:n,stage_name:s.name,money_level:lvl,rounds:G.total});
  nextRound();
}
function leaveStage(){token++;hush();G=null;renderHome();show('home');}

function nextRound(){
  if(G.round>=G.total)return finishStage();
  G.errs=0;G.busy=false;
  $('#area').innerHTML='';const tray=$('#tray');tray.innerHTML='';tray.className='tray';
  renderDots();
  STAGE[G.n].round(G.items[G.round]);
  fitArea();
}

/* Short phones (the browser's bars take height): if the round's picture does not fit the middle of the screen,
   it shrinks there (down to 70%), so nothing needs scrolling. Rechecked whenever the round or Stelios' words change.
   The talk with the cashier is left alone: its chat scrolls by design. */
const FIT_MIN=.7;
function fitArea(){
  const a=$('#area');
  a.style.setProperty('--fit','1');
  if(!G||G.n===6||!$('#play').classList.contains('on'))return;
  for(let k=0,z=1;k<4&&a.scrollHeight>a.clientHeight+1&&z>FIT_MIN;k++){
    z=Math.max(FIT_MIN,z*(a.clientHeight-16)/(a.scrollHeight-16));
    a.style.setProperty('--fit',z.toFixed(3));
  }
}
let fitRaf=0;
const refit=()=>{cancelAnimationFrame(fitRaf);fitRaf=requestAnimationFrame(fitArea);};
new MutationObserver(refit).observe($('#area'),{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
new MutationObserver(refit).observe($('#bubble'),{childList:true,subtree:true,characterData:true});
addEventListener('resize',refit);
/* ten dots for the rounds; a stage in parts shows «Μέρος 1/2» and the dots of the part in progress */
function renderDots(){
  const d=$('#dots');
  if(G.practice){   // replaying the mistakes: one dot per round to replay
    d.innerHTML='';d.append(el('span',{class:'part'},'Επανάληψη'));
    for(let i=0;i<G.total;i++)d.append(el('i',{class:i<G.round?'done':i===G.round?'cur':''}));
    d.setAttribute('aria-label',`Επανάληψη: γύρος ${G.round+1} από ${G.total}`);return;
  }
  const parts=G.total/ROUNDS,part=Math.floor(G.round/ROUNDS),r=G.round%ROUNDS;d.innerHTML='';
  if(parts>1)d.append(el('span',{class:'part'},`Μέρος ${part+1}/${parts}`));
  for(let i=0;i<ROUNDS;i++)d.append(el('i',{class:i<r?'done':i===r?'cur':''}));
  d.setAttribute('aria-label',(parts>1?`Μέρος ${part+1} από ${parts}, `:'')+`γύρος ${r+1} από ${ROUNDS}`);
}

/* Stelios' speech bubble; `voice` is the same sentence written for the speech engine (amounts in words) */
function say(html,voice){$('#bubble').innerHTML=`<span>${html}</span>`;G.said=voice||$('#bubble').textContent;speak(G.said);}

/* help ladder: help 0 = alone, 1 = after a hint in words, 2 = after the visual help, 3 = the game showed the solution */
/* manual: the round waits for «Επόμενο» instead of moving on by itself (the child reads the result first) */
function roundOk(html,voice,ms=1900,manual){
  if(G.busy)return;G.busy=true;
  G.log.push({help:Math.min(G.errs,2),i:G.round});
  track('answer_correct',{stage:G.n,round:G.round+1,errors:G.errs});
  sGood();say(html,voice);
  if(manual)return nextButton('Επόμενο ▶');
  later(()=>{G.round++;nextRound();},ms);
}
function nextButton(text){
  const tray=$('#tray');tray.classList.add('locked');
  const b=el('button',{class:'btn next',type:'button'},text);
  b.onclick=()=>{G.round++;nextRound();};
  tray.append(b);b.focus({preventScroll:true});
}
/* a wrong try: returns the step of the ladder to give now (1 words, 2 visual help, 3 show the solution).
   `what` says what the child did («διάλεξε 50 λεπτά»), for the teacher's report */
function roundMiss(what){
  G.errs++;
  if(what)(G.slips[G.round]=G.slips[G.round]||[]).push(what);
  track('answer_wrong',{stage:G.n,round:G.round+1,errors:G.errs});
  return Math.min(G.errs,3);
}
/* 3rd wrong try: the solution is on screen and the child moves on when ready (no timer) */
function roundShown(html,voice){
  G.busy=true;G.log.push({help:3,i:G.round});say(html,voice);
  nextButton('Εντάξει, πάμε παρακάτω ▶');
}

function finishStage(){
  const n=G.n,h=[0,0,0,0];G.log.forEach(r=>h[r.help]++);
  const res={lvl:G.lvl,mode:G.mode,h,total:G.total,ok:G.total-h[3],extra:G.extra,helps:G.log.map(r=>r.help),date:Date.now()};
  if(!G.practice){store.done[n]=true;store.results[n]=res;save();}   // a replay of the mistakes does not replace the stage result
  track(G.practice?'practice_complete':'stage_complete',{stage:n,money_level:G.lvl,correct:res.ok,first_try:h[0],shown:h[3]});
  renderResult(n);show('result');
}

/* ---------- drag & drop with finger, pen or mouse (pointer events) ----------
   A press that does not move counts as a tap, so a child who cannot drag can tap instead.
   Drop zones carry [data-drop]; outside a zone, or when onDrop refuses it, the item floats back softly. */
function draggable(node,{onDrop,onTap}){
  node.addEventListener('click',e=>{if(e.detail===0&&onTap&&!G.busy)onTap();});   // keyboard (Enter/Space)
  node.addEventListener('pointerdown',e=>{
    if(e.button>0||!G||G.busy)return;
    e.preventDefault();
    const sx=e.clientX,sy=e.clientY;let ghost=null,over=null;
    try{node.setPointerCapture(e.pointerId);}catch(_){}
    const zone=ev=>{const t=document.elementFromPoint(ev.clientX,ev.clientY);return t&&t.closest('[data-drop]');};
    const move=ev=>{
      if(!ghost){
        if(Math.hypot(ev.clientX-sx,ev.clientY-sy)<8)return;
        ghost=node.cloneNode(true);ghost.classList.add('floater');ghost.classList.remove('glow');ghost.style.width=node.offsetWidth+'px';
        document.body.append(ghost);node.classList.add('lifted');
      }
      ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';
      const z=zone(ev);if(z!==over){over&&over.classList.remove('over');over=z;over&&over.classList.add('over');}
    };
    const end=(ev,cancel)=>{
      node.removeEventListener('pointermove',move);node.removeEventListener('pointerup',up);node.removeEventListener('pointercancel',cnc);
      over&&over.classList.remove('over');node.classList.remove('lifted');
      if(!ghost){if(!cancel&&onTap&&!G.busy)onTap();return;}
      const z=cancel?null:zone(ev);
      if(z&&!G.busy&&onDrop(z)!==false){ghost.remove();return;}   // onDrop returns false to refuse the item: it floats back
      if(RM)return ghost.remove();
      const r=node.getBoundingClientRect();
      ghost.style.transition='left .35s ease,top .35s ease,opacity .35s';
      ghost.style.left=r.left+r.width/2+'px';ghost.style.top=r.top+r.height/2+'px';ghost.style.opacity='.4';
      setTimeout(()=>ghost.remove(),380);
    };
    const up=ev=>end(ev,false),cnc=ev=>end(ev,true);
    node.addEventListener('pointermove',move);node.addEventListener('pointerup',up);node.addEventListener('pointercancel',cnc);
  });
}
