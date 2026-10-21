/* ============================================================
   SCREENS — προφίλ, χάρτης, εισαγωγή στάθμου
   ============================================================ */
"use strict";

/* ---------- screens: profiles ---------- */
function renderProfiles(){
  const box=$('#plist');box.innerHTML='';
  const ids=Object.keys(store.profiles);
  if(!ids.length){box.innerHTML='<p class="note" style="grid-column:1/-1">Δεν υπάρχει ακόμη δύτης. Γράψε ένα όνομα για να ξεκινήσεις.</p>';}
  ids.forEach(id=>{const p=store.profiles[id];const b=el('button',{class:'pcard'});b.innerHTML=`<div class="av" style="background:${p.color}">${p.icon}</div>${esc(p.name)}`;b.onclick=()=>{cur=id;store.last=id;save();renderMap();show('map');};box.appendChild(b);});
}
$('#addbtn').onclick=()=>{const n=$('#newname').value.trim();if(!n)return $('#newname').focus();const id='p'+Date.now().toString(36);const k=Object.keys(store.profiles).length;store.profiles[id]={name:n,color:AVC[k%AVC.length],icon:AVI[k%AVI.length],levels:{},best:{},sessions:[],unlockAll:false,created:new Date().toISOString()};$('#newname').value='';save();renderProfiles();};
$('#newname').addEventListener('keydown',e=>{if(e.key==='Enter')$('#addbtn').click();});

/* ---------- map ---------- */
function renderMap(){
  const p=prof();$('#whoname').textContent=p.icon+' '+p.name;
  const d=$('#dive');d.querySelectorAll('.station').forEach(x=>x.remove());
  STAGES.forEach((s,i)=>{
    const open=!s.soon&&unlocked(s.id);
    const st=el('div',{class:'station '+(i%2?'r':'l')});
    const n=el('button',{class:'node'+(open?((prof().passed||{})[s.id]?' done':''):' lock'),'aria-label':s.name});
    n.textContent=open?s.id:'🔒';
    if(open)n.onclick=()=>openIntro(s.id);
    const bs=bestStars(s.id);
    const info=el('div',{class:'sinfo',title:`${s.depth} μέτρα βάθος`});
    info.innerHTML=`<h3>${s.name}</h3>`+
      (s.soon?'<div class="soon">Έρχεται σύντομα</div>':open?`<div class="soon"><span class="stars">${'★'.repeat(bs)}${'☆'.repeat(3-bs)}</span> Επίπεδο ${level(s.id)}</div>`:'<div class="soon">Κέρδισε 2★ στον προηγούμενο</div>');
    st.append(n,info);d.appendChild(st);
  });
  const done=allPassed(p);
  const extra=[
    {ic:'🧰',name:'Ο θησαυρός του βυθού',depth:35,info:done?'Δες το δίπλωμά σου':'Τελείωσε και τους 6 στάθμους',go:()=>openTreasure(false)},
    {ic:'🧭',name:'Καθημερινή αποστολή',depth:40,info:done?`Εβδομάδα: ${weekCount(p)}/5 · Μαργαριτάρια: ${pearls(p)}`:'Ανοίγει μαζί με τον θησαυρό',go:openMission}
  ];
  extra.forEach((x,j)=>{
    const st=el('div',{class:'station '+((STAGES.length+j)%2?'r':'l')});
    const n=el('button',{class:'node special'+(done?'':' lock'),'aria-label':x.name});
    n.textContent=done?x.ic:'🔒';if(done)n.onclick=x.go;
    const info=el('div',{class:'sinfo',title:`${x.depth} μέτρα βάθος`});info.innerHTML=`<h3>${x.name}</h3><div class="soon">${x.info}</div>`;
    st.append(n,info);d.appendChild(st);
  });
  // the diver swims next to the child's current station (first not yet passed; the daily mission once all are done)
  const idx=done?STAGES.length+1:STAGES.findIndex(s=>!(p.passed||{})[s.id]);
  const here=d.querySelectorAll('.station')[idx];
  if(here){here.classList.add('cur');here.appendChild(el('img',{class:'diver',src:'img/diver.png',alt:'','aria-hidden':'true'}));}
  layoutMap(); // no-op while the map is hidden; show('map') lays it out the moment it appears
}
/* Places the stations so the whole route fits the screen without scrolling.
   Tall screens: the route winds downwards, nodes alternating right (label left) / left (label right).
   Wide screens: the route runs left→right as a descending wave, labels above the high nodes and below the low ones. */
function layoutMap(){
  const d=$('#dive');if(!d.offsetParent)return;
  const W=d.clientWidth,H=d.clientHeight,sts=[...d.querySelectorAll('.station')],N=sts.length;if(!N||!W||!H)return;
  const wide=W/H>=1.15;d.classList.toggle('wide',wide);
  const pts=[];
  if(!wide){
    const step=H/N,D=Math.round(Math.max(40,Math.min(80,step*.66))),r=D/2,A=Math.min(W*.13,80),gap=12;
    d.style.setProperty('--nd',D+'px');
    sts.forEach((st,i)=>{
      const right=i%2===0,x=W/2+(right?A:-A),y=step*(i+.5);pts.push([x,y]);
      st.className=st.className.replace(/\b(l|r|b|t)\b/g,'').trim()+' '+(right?'l':'r');
      st.style.cssText=`left:${x}px;top:${y}px;`;
      st.querySelector('.sinfo').style.width=Math.max(90,Math.min(320,(right?x-r:W-x-r)-gap-6))+'px';
      const dv=st.querySelector('.diver');
      if(dv)dv.style.width=Math.max(60,Math.min(150,(right?W-x-r:x-r)-gap-4))+'px';
    });
  }else{
    // labels alternate above/below, so a label may be wider than its column (same-side neighbours are two columns away)
    const col=W/N,D=Math.round(Math.max(44,Math.min(80,col*.5,H*.13))),r=D/2,lw=Math.min(col*1.45,220);
    d.style.setProperty('--nd',D+'px');
    sts.forEach(st=>{st.className=st.className.replace(/\b(l|r|b|t)\b/g,'').trim();st.querySelector('.sinfo').style.width=Math.round(lw)+'px';});
    // label height decides how much room the wave has
    sts.forEach((st,i)=>st.classList.add(i%2?'b':'t'));
    const lab=Math.max(...sts.map(st=>st.querySelector('.sinfo').offsetHeight))+6;
    const top=lab+r+6,bottom=H-lab-r-6,span=Math.max(0,bottom-top);
    const B=Math.max(span*.42,Math.min(span,r*2.4)),Dsc=Math.max(0,span-B);
    sts.forEach((st,i)=>{
      const x=col*(i+.5),y=top+Dsc*(i/(N-1))+(i%2?B:0);pts.push([x,y]);
      st.style.cssText=`left:${x}px;top:${y}px;`;
      // keep the first/last labels inside the screen
      st.querySelector('.sinfo').style.left=Math.max(0,lw/2+4-x)-Math.max(0,x+lw/2+4-W)+'px';
      const dv=st.querySelector('.diver');
      if(dv)dv.style.width=Math.max(60,Math.min(150,col*.95,(i%2?y-r:H-y-r)*1.2))+'px';
    });
  }
  drawRoute(pts,wide,W,H);
}
/* winding S-curve through the node centres; tall layout leaves each node vertically, wide layout horizontally */
function drawRoute(pts,wide,W,H){
  const f=v=>v.toFixed(1),P=pts.slice();
  if(wide){P.unshift([0,P[0][1]]);P.push([W,P[P.length-1][1]]);}else{P.unshift([P[0][0],0]);P.push([P[P.length-1][0],H]);}
  let path=`M${f(P[0][0])} ${f(P[0][1])}`;
  for(let i=0;i<P.length-1;i++){const b=P[i],c=P[i+1];
    if(wide){const dx=(c[0]-b[0])*.55;path+=` C${f(b[0]+dx)} ${f(b[1])} ${f(c[0]-dx)} ${f(c[1])} ${f(c[0])} ${f(c[1])}`;}
    else{const dy=(c[1]-b[1])*.55;path+=` C${f(b[0])} ${f(b[1]+dy)} ${f(c[0])} ${f(c[1]-dy)} ${f(c[0])} ${f(c[1])}`;}}
  $('#dive .rope').innerHTML=`<svg width="${f(W)}" height="${f(H)}" aria-hidden="true"><path class="trail" d="${path}"/><path class="dash" d="${path}"/></svg>`;
}
window.addEventListener('resize',()=>requestAnimationFrame(layoutMap));
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>requestAnimationFrame(layoutMap));
function dayKey(d){d=new Date(d);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function missionDays(p){return [...new Set((p.missions||[]).map(m=>dayKey(m.date)))];}
function pearls(p){return missionDays(p).length;}
function weekCount(p){const t=new Date();const mon=new Date(t.getFullYear(),t.getMonth(),t.getDate()-((t.getDay()+6)%7));return missionDays(p).filter(k=>new Date(k+'T12:00')>=mon).length;}
$('#switchp').onclick=()=>{renderProfiles();show('profiles');};

/* ---------- intro ---------- */
let stage=1,strategy=null;
function openIntro(s){
  stage=s;if(s===4)target4=pick(TARGETS4);const L=level(s);const S=STAGES[s-1];
  $('#introtitle').textContent=`Στάθμος ${s}: ${S.name}`;
  $('#introlevel').textContent=`Επίπεδο ${L}`;
  $('#introdemo').innerHTML=demoHTML(s,L);
  $('#introtext').textContent=instructions(s,L);
  const box=$('#strategies');box.innerHTML='';
  STRATS.forEach(x=>{const b=el('button',{class:'choice','aria-pressed':String(strategy===x.id)});b.innerHTML=`<span class="ic">${x.ic}</span><span>${x.t}</span>`;b.onclick=()=>{strategy=x.id;box.querySelectorAll('.choice').forEach(c=>c.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');};box.appendChild(b);});
  show('intro');
}
$('#speakbtn').onclick=()=>sayVoice(stage===0?'mission':voiceId(stage,level(stage)),$('#introtext').textContent);
$('#introback').onclick=()=>{stage=Math.max(stage,1);stopVoice(); renderMap();show('map');};
$('#startbtn').onclick=()=>{if(!strategy){toast('Διάλεξε πρώτα ένα κόλπο');return;}stopVoice(); if(stage===0)runMission();else runRound(stage);};
