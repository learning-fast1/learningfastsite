/* ============================================================
   SCORING — ανάλυση, επίπεδα, οθόνη αποτελεσμάτων
   ============================================================ */
"use strict";

/* ---------- scoring ---------- */
function analyse(data){
  const T=data.trials;
  const targets=T.filter(t=>t.type==='target'||t.type==='wait');
  const non=T.filter(t=>t.type==='nontarget');
  const hits=targets.filter(t=>t.correct).length;
  const omissions=targets.filter(t=>!t.responded).length;
  const commissions=non.filter(t=>t.responded).length+T.filter(t=>t.early||t.wrong).length+data.extraCommissions;
  const correct=T.filter(t=>t.correct).length;
  const acc=T.length?correct/(T.length+data.extraCommissions):0;
  const rts=T.filter(t=>t.type==='target'&&t.correct&&t.rt!=null).map(t=>t.rt);
  const mean=rts.length?rts.reduce((a,b)=>a+b,0)/rts.length:null;
  const sd=rts.length>1?Math.sqrt(rts.reduce((a,b)=>a+(b-mean)**2,0)/(rts.length-1)):null;
  const h=Math.floor(T.length/2);
  const accOf=a=>a.length?a.filter(t=>t.correct).length/a.length:null;
  const rocksT=T.filter(t=>t.type==='rock');
  const mRT=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
  const swT=T.filter(t=>t.sw===true&&t.correct&&t.rt!=null).map(t=>t.rt),rpT=T.filter(t=>t.sw===false&&t.correct&&t.rt!=null).map(t=>t.rt);
  const switchCost=swT.length&&rpT.length?Math.round(mRT(swT)-mRT(rpT)):null;
  const swAll=T.filter(t=>t.sw===true);
  return {n:T.length,targets:targets.length,hits,omissions,commissions,acc,mean,sd,acc1:accOf(T.slice(0,h)),acc2:accOf(T.slice(h)),
    rocks:rocksT.length||null,collisions:rocksT.length?rocksT.filter(t=>!t.correct).length:null,switchCost,switchAcc:swAll.length?accOf(swAll):null,
    gameOver:!!data.gameOver,lives:data.lives==null?null:data.lives,livesLeft:data.livesLeft==null?null:data.livesLeft};
}

let lastSession=null;
function starsFor(acc){return acc>=.9?3:acc>=.8?2:acc>=.6?1:0;}
function applyResult(s,L,m,dur,mission){
  let stars=starsFor(m.acc);
  let newL=L;if(m.acc>=.8)newL=L+1;else if(m.acc<.6)newL=L-1;
  if(m.gameOver){stars=Math.min(stars,1);newL=Math.min(newL,L);}
  newL=clampTier(s,newL);
  const p=prof();p.levels=p.levels||{};p.best=p.best||{};p.passed=p.passed||{};
  p.levels[s]=newL;p.best[s]=Math.max(p.best[s]||0,stars);if(stars>=2)p.passed[s]=true;
  const rec={date:new Date().toISOString(),stage:s,level:L,newLevel:newL,tier:tierOf(s),stars,strategy,self:null,transfer:null,durSec:Math.round(dur/1000),mission:!!mission,...m};
  p.sessions=p.sessions||[];p.sessions.push(rec);save();
  return rec;
}
function allPassed(p){p=p||prof();return STAGES.every(x=>(p.passed||{})[x.id]);}
function finish(s,L,data,dur){
  const m=analyse(data);
  // a round with almost no trials is not counted, except when the lives ran out early: that round always counts
  if(m.n<4&&!m.gameOver){renderMap();show('map');return;}
  const wasUnlocked=s<6&&unlocked(s+1);
  lastSession=applyResult(s,L,m,dur,false);const stars=lastSession.stars,newL=lastSession.newLevel;

  $('#restitle').textContent=m.gameOver?'Τελείωσαν οι ζωές!':stars===3?'Φανταστική βουτιά!':stars===2?'Μπράβο!':stars===1?'Καλή προσπάθεια!':'Συνέχισε να προσπαθείς!';
  $('#resstars').innerHTML='★'.repeat(stars)+`<span class="off">${'★'.repeat(3-stars)}</span>`;
  let lv='';
  if(newL>L)lv=`Ανεβαίνεις στο επίπεδο ${newL}!`;else if(newL<L)lv=`Την επόμενη φορά θα παίξεις λίγο πιο εύκολα (επίπεδο ${newL}), για να δυναμώσεις.`;else lv=(m.acc>=.8&&!m.gameOver?'Τέλεια! ':'')+`Μένεις στο επίπεδο ${L}.`;
  if(s<6&&!wasUnlocked&&unlocked(s+1))lv+=' Άνοιξε ο επόμενος στάθμος!';else if(s<6&&!unlocked(s+1))lv+=' Κέρδισε 2 αστέρια για να ανοίξει ο επόμενος στάθμος.';
  $('#reslevel').textContent=lv;
  const tips=[];
  if(m.gameOver)tips.push('Έχασες όλες τις ζωές πριν τελειώσει η βουτιά. Πρόσεχε και τους βράχους και το χρυσόψαρο.');
  if(m.commissions>=Math.max(2,m.n*.15))tips.push('Θυμήσου: σταματώ και κοιτάζω πριν πατήσω.');
  if(m.omissions>=Math.max(2,m.targets*.2))tips.push('Κράτα τα μάτια σου στο παιχνίδι μέχρι το τέλος.');
  if(m.acc1!=null&&m.acc2!=null&&m.acc1-m.acc2>.15)tips.push('Στο τέλος κουράστηκες λίγο. Αυτό είναι φυσικό, και με εξάσκηση θα αντέχεις περισσότερο.');
  if(m.collisions!=null&&m.collisions>=Math.max(2,m.rocks*.2))tips.push('Κοίτα και τον δρόμο του υποβρυχίου, όχι μόνο το παράθυρο.');
  if(m.switchAcc!=null&&m.switchAcc<.6)tips.push('Όταν αλλάζει ο κανόνας, κοίτα πρώτα την πινακίδα.');
  if(!tips.length)tips.push('Πρόσεξες πολύ καλά από την αρχή ως το τέλος!');
  $('#restip').textContent=tips.join(' ');
  const sr=$('#selfrate');sr.innerHTML='';
  SELF.forEach((x,i)=>{const b=el('button',{class:'face','aria-pressed':'false'});b.innerHTML=`<span class="e">${x.e}</span>${x.t}`;b.onclick=()=>{sr.querySelectorAll('.face').forEach(f=>f.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');lastSession.self=i+1;save();};sr.appendChild(b);});
  const tf=$('#transfer');tf.innerHTML='';
  TRANSFER.forEach(t=>{const b=el('button',{class:'choice','aria-pressed':'false'});b.innerHTML=`<span>${t}</span>`;b.onclick=()=>{tf.querySelectorAll('.choice').forEach(f=>f.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');lastSession.transfer=t;save();};tf.appendChild(b);});
  show('result');
}
function afterResult(fn){const p=prof();if(allPassed(p)&&!p.treasureShown){p.treasureShown=true;save();openTreasure(true);return;}if(sessionMs>12*60*1000){sessionMs=0;show('brk');$('#brkok').onclick=()=>{renderMap();show('map');};}else fn();}
$('#againbtn').onclick=()=>afterResult(()=>openIntro(stage));
$('#donebtn').onclick=()=>afterResult(()=>{renderMap();show('map');});
