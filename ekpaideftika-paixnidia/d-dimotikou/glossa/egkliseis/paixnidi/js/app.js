"use strict";
/* Screens and game flow. No timer: the child moves on with the «Επόμενο» button. */
const $=s=>document.querySelector(s);
const view=$('#screen');
const KEY='egkliseis-v2';
/* Read-aloud button is switched off for now: set to true to bring it back */
const READ_ALOUD=false;
let save={stars:{},done:{},sound:true};
/* A damaged save must never stop the game from opening: whatever is not usable is ignored */
try{
  const s=JSON.parse(localStorage.getItem(KEY)||'{}')||{};
  const isMap=o=>o&&typeof o==='object'&&!Array.isArray(o);
  if(isMap(s.stars))save.stars=Object.fromEntries(Object.entries(s.stars).filter(([,n])=>Number.isInteger(n)&&n>=1&&n<=3));
  if(isMap(s.done))save.done=s.done;
  if(typeof s.sound==='boolean')save.sound=s.sound;
}catch(e){}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(save));}catch(e){}};
const stageId=(l,i)=>`${l.id}-${i}`;

/* ---------- sound & speech ---------- */
let actx=null;
function tone(freqs,dur=.16,gap=.1){
  if(!save.sound)return;
  try{
    actx=actx||new(window.AudioContext||window.webkitAudioContext)();
    /* phones suspend audio until a tap, and again when the tab returns from the background */
    if(actx.state==='suspended')actx.resume();
    const t0=actx.currentTime;
    freqs.forEach((f,i)=>{
      const o=actx.createOscillator(),g=actx.createGain(),s=t0+i*gap;
      o.type='sine';o.frequency.value=f;
      g.gain.setValueAtTime(.0001,s);g.gain.exponentialRampToValueAtTime(.09,s+.02);g.gain.exponentialRampToValueAtTime(.0001,s+dur);
      o.connect(g);g.connect(actx.destination);o.start(s);o.stop(s+dur+.03);
    });
  }catch(e){}
}
const sfx={good:()=>tone([587,784]),bad:()=>tone([294,262],.18),win:()=>tone([523,659,784],.28,.14)};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2600);}
function say(text){
  const sy=window.speechSynthesis;
  if(!sy)return toast('Η ανάγνωση δεν υποστηρίζεται σε αυτή τη συσκευή.');
  const voice=sy.getVoices().find(v=>/^el/i.test(v.lang));
  sy.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='el-GR';u.rate=.88;
  if(voice)u.voice=voice;
  sy.speak(u);
}
const stopVoice=()=>{try{speechSynthesis.cancel();}catch(e){}};

/* ---------- shared bits ---------- */
function refreshTop(){
  $('#starTotal').textContent=Object.values(save.stars).reduce((a,b)=>a+b,0);
  const b=$('#soundBtn');b.textContent=save.sound?'🔊':'🔇';b.setAttribute('aria-pressed',save.sound);
}
const starsHtml=n=>`<span class="stars" aria-label="${n} από 3 αστέρια">${'★'.repeat(n)}<i>${'★'.repeat(3-n)}</i></span>`;
const stagesOf=l=>l.stages.filter(s=>s.kind!=='lesson');
const levelStars=l=>l.stages.reduce((a,s,i)=>a+(save.stars[stageId(l,i)]||0),0);
function show(html){
  stopVoice();
  view.innerHTML=html;
  refreshTop();
  window.scrollTo(0,0);
}
function lessonHtml(l){
  const les=LESSONS[l.id];
  return `<div class="lesson">${les.cards.map(c=>`<article class="lcard k-${c.k}"><h3>${c.h}</h3><p>${c.p}</p><ul>${c.ex.map(e=>`<li>${e}</li>`).join('')}</ul></article>`).join('')}</div><div class="tip"><p>${les.tip}</p>${les.tipList?`<ul>${les.tipList.map(t=>`<li>${t}</li>`).join('')}</ul>`:''}</div>`;
}

/* ---------- home ---------- */
function home(){
  show(`<section class="hero">
      <h1>Οι Εγκλίσεις</h1>
      <p>Μαθαίνω τις εγκλίσεις γρήγορα και εύκολα!</p>
      <div class="legend"><span class="k-o">Οριστική</span><span class="k-y">Υποτακτική</span><span class="k-p">Προστακτική</span></div>
    </section>
    <div class="levels">${LEVELS.map((l,i)=>{
      const total=stagesOf(l).length, done=l.stages.filter((s,j)=>s.kind!=='lesson'&&save.done[stageId(l,j)]).length;
      return `<button class="level" type="button" data-level="${i}">
        <span class="num">${i+1}</span>
        <span class="txt"><strong>Επίπεδο ${i+1}: ${l.title}</strong><small>${l.sub}</small>
        <span class="bar"><i style="width:${Math.round(done/total*100)}%"></i></span></span>
        <span class="meta"><span class="star">★</span> ${levelStars(l)}/${total*3}</span>
      </button>`;}).join('')}</div>`);
  view.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>level(+b.dataset.level));
}

/* ---------- stage list ---------- */
function level(li){
  const l=LEVELS[li];
  show(`<button class="back" type="button" id="toHome">← Επίπεδα</button>
    <section class="head"><h2>Επίπεδο ${li+1}: ${l.title}</h2><p>${l.sub}</p></section>
    <div class="stages">${l.stages.map((s,i)=>{
      const id=stageId(l,i), done=save.done[id];
      return `<button class="stage ${done?'done':''}" type="button" data-stage="${i}">
        <span class="num">${done?'✓':i+1}</span>
        <span class="txt"><strong>${s.title}</strong><small>${s.sub}</small></span>
        ${s.kind==='lesson'?'':starsHtml(save.stars[id]||0)}
      </button>`;}).join('')}</div>`);
  $('#toHome').onclick=home;
  view.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>start(li,+b.dataset.stage));
}
function start(li,si){
  LEVELS[li].stages[si].kind==='lesson'?lesson(li,si):play(li,si);
}

/* ---------- lesson ---------- */
function lesson(li,si){
  const l=LEVELS[li];
  show(`<button class="back" type="button" id="back">← Στάδια</button>
    <section class="head"><h2>${LESSONS[l.id].title}</h2></section>
    ${lessonHtml(l)}
    <div class="actions"><button class="btn" type="button" id="go">Κατάλαβα, πάμε!</button></div>`);
  $('#back').onclick=()=>level(li);
  $('#go').onclick=()=>{save.done[stageId(l,si)]=true;persist();next(li,si);};
}
function next(li,si){
  const l=LEVELS[li];
  if(si+1<l.stages.length)start(li,si+1);else level(li);
}

/* ---------- play ---------- */
function play(li,si){
  const l=LEVELS[li], st=l.stages[si], rounds=buildRounds(l,st), total=rounds.length;
  /* A wrong question goes back to the end of the queue until it is answered right first time. Stars count only the first pass. */
  let idx=0, firstTry=0;
  const missed=[];

  function round(){
    const r=rounds[idx];
    let tried=false, finished=false;
    const repeat=idx>=total;
    if(repeat&&!r.options[0].mood)r.options=shuffle(r.options);
    const want=r.want?`<div class="want k-${r.want[0]}">${LABELS[r.want]}</div>`:'';
    show(`<div class="pbar">
        <button class="back" type="button" id="back">← Στάδια</button>
        <span class="ptitle">${st.title}</span>
        <button class="icon-btn" type="button" id="help" aria-label="Θυμήσου τον κανόνα">💡</button>
      </div>
      <div class="progress" role="img" aria-label="Ερώτηση ${idx+1} από ${rounds.length}">${rounds.map((_,i)=>`<span class="${i<idx?'on':i===idx?'now':''}"></span>`).join('')}</div>
      <section class="card">
        ${repeat?'<p class="again">Ξανά, για να το θυμάσαι</p>':''}
        <p class="ask">${r.ask}</p>
        ${want}
        ${r.show?`<div class="prompt"><div class="ptext" id="ptext">${r.show}</div>${READ_ALOUD&&r.say?'<button class="say" type="button" id="say" aria-label="Άκουσε">🗣️</button>':''}</div>`:''}
        <div class="options ${r.show?'':'wide'} ${r.options.length===5?'five':''}" id="opts"></div>
        <div class="fb" id="fb" aria-live="polite"></div>
        <div class="actions" hidden><button class="btn" type="button" id="nextBtn"></button></div>
      </section>`);
    $('#back').onclick=()=>level(li);
    $('#help').onclick=()=>help(l);
    if(READ_ALOUD&&r.say)$('#say').onclick=()=>say(finished&&r.sayDone||r.say);
    const box=$('#opts');
    r.options.forEach(o=>{
      const b=document.createElement('button');
      b.type='button';b.className='opt'+(o.mood?` k-${o.mood}`:'');b.textContent=o.t;
      b.onclick=()=>{
        if(finished)return;
        const fb=$('#fb');
        if(o.ok){
          finished=true;
          if(tried){
            rounds.push(r);
            if(!missed.includes(r))missed.push(r);
          }else if(!repeat)firstTry++;
          b.classList.add('right');
          box.querySelectorAll('.opt').forEach(x=>x.disabled=true);
          if(r.filled)$('#ptext').innerHTML=r.filled;
          fb.className='fb good';fb.textContent=r.why+(tried?' Θα τη δεις ξανά πριν το τέλος.':'');
          sfx.good();
          const n=$('#nextBtn');n.textContent=idx+1<rounds.length?'Επόμενο':'Τέλος';n.parentElement.hidden=false;n.focus({preventScroll:true});n.scrollIntoView({block:'nearest'});
        }else{
          tried=true;
          b.classList.add('wrong');b.disabled=true;
          fb.className='fb try';
          fb.textContent=`Όχι ακόμη. ${r.hint||(o.label?WHY[o.label]:'')} Δοκίμασε ξανά.`.replace(/\s+/g,' ');
          fb.scrollIntoView({block:'nearest'});
          sfx.bad();
        }
      };
      box.append(b);
    });
    $('#nextBtn').onclick=()=>{idx++;idx<rounds.length?round():result();};
  }

  function result(){
    const ratio=firstTry/total;
    const stars=ratio>=.9?3:ratio>=.7?2:1, id=stageId(l,si);
    save.stars[id]=Math.max(save.stars[id]||0,stars);
    save.done[id]=true;
    persist();sfx.win();
    const title=stars===3?'Εξαιρετικά!':stars===2?'Πολύ καλά!':'Καλή προσπάθεια!';
    const hasNext=si+1<l.stages.length;
    show(`<section class="card result">
        <h2>${title}</h2>
        <div class="bigstars">${starsHtml(stars)}</div>
        <p>${firstTry} από τις ${total} απαντήσεις σωστές με την πρώτη.</p>
        ${missed.length?`<div class="review"><h3>Να τις ξαναδείς</h3><ul>${missed.map(r=>`<li>${r.filled||r.show||(r.want?LABELS[r.want]:'')}<small>Σωστό: <b>${r.options.find(o=>o.ok).t}</b></small></li>`).join('')}</ul></div>`:''}
        <div class="actions">
          <button class="btn ghost" type="button" id="again">Ξανά</button>
          <button class="btn ghost" type="button" id="list">Στάδια</button>
          ${hasNext?'<button class="btn" type="button" id="nextStage">Επόμενο στάδιο</button>':'<button class="btn" type="button" id="toLevels">Επίπεδα</button>'}
        </div>
      </section>`);
    $('#again').onclick=()=>play(li,si);
    $('#list').onclick=()=>level(li);
    if(hasNext)$('#nextStage').onclick=()=>next(li,si);else $('#toLevels').onclick=home;
  }
  round();
}

/* The rule stays one tap away during play, so the child never gets stuck */
function help(l){
  const m=$('#modal');
  m.innerHTML=`<div class="mcard"><h2>${LESSONS[l.id].title}</h2>${lessonHtml(l)}<div class="actions"><button class="btn" type="button" id="closeHelp">Εντάξει</button></div></div>`;
  m.hidden=false;
  m.scrollTop=0;
  document.body.style.overflow='hidden';
  const esc=e=>{if(e.key==='Escape')close();};
  const close=()=>{m.hidden=true;m.innerHTML='';document.body.style.overflow='';document.removeEventListener('keydown',esc);};
  document.addEventListener('keydown',esc);
  $('#closeHelp').onclick=close;
  m.onclick=e=>{if(e.target===m)close();};
  $('#closeHelp').focus({preventScroll:true});
}

$('#brand').onclick=home;
$('#soundBtn').onclick=()=>{save.sound=!save.sound;persist();refreshTop();};
if(window.speechSynthesis)speechSynthesis.getVoices();
home();
