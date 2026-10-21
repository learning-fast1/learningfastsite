/* ============================================================
   CORE — αποθήκευση, βοηθητικά, φυσαλίδες, ήχος, ομιλία
   ============================================================ */
"use strict";

/* ---------- storage ---------- */
const KEY='lf-vythos-v1';
let store={profiles:{},last:null};
try{const raw=localStorage.getItem(KEY); if(raw){const p=JSON.parse(raw); if(p&&p.profiles) store=p;}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}}
let cur=null; // profile id

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const el=(t,a={},h='')=>{const e=document.createElement(t);for(const k in a){if(k==='class')e.className=a[k];else e.setAttribute(k,a[k]);}if(h)e.innerHTML=h;return e;};
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));window.scrollTo(0,0);if(id==='map'&&typeof layoutMap==='function')layoutMap();if(typeof fitScreen==='function')fitScreen();}
/* safety net so every screen fits without scrolling: shrinks the screen's .fit block (zoom) until the page fits.
   The layout is already compact, so this only kicks in on small screens; the minimum keeps text readable. */
function fitScreen(){
  const s=document.querySelector('.screen.on'),box=s&&s.querySelector('.fit');if(!box)return;
  const de=document.documentElement,min=parseFloat(box.dataset.minzoom)||.5;
  const fits=()=>de.scrollHeight<=innerHeight+1&&box.scrollWidth<=box.clientWidth+1;
  box.style.zoom='';if(fits())return;
  // shrinking lets text re-wrap into fewer lines, so search for the largest zoom that still fits
  let lo=min,hi=1;
  for(let k=0;k<8;k++){const mid=(lo+hi)/2;box.style.zoom=mid.toFixed(3);if(fits())lo=mid;else hi=mid;}
  box.style.zoom=lo.toFixed(3);
}
window.addEventListener('resize',()=>requestAnimationFrame(fitScreen));
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>requestAnimationFrame(fitScreen));
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2200);}
const AVC=['#FF6F91','#3FAF7A','#2A8FA3','#E89B2C','#8E6CD8','#E0506F'];
const AVI=['🐙','🐢','🐬','🦀','🐠','🐳','🦭','🐡'];

/* bubbles */
document.querySelectorAll('.bubbles').forEach(b=>{for(let i=0;i<14;i++){const s=el('span');const z=rnd(6,22);s.style.cssText=`left:${rnd(0,100)}%;width:${z}px;height:${z}px;animation-duration:${rnd(8,18)}s;animation-delay:-${rnd(0,18)}s`;b.appendChild(s);}});

/* ---------- audio ---------- */
let ac=null;
function tone(f,d,type,vol){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.value=vol||.12;g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d);}catch(e){}}
const sGood=()=>{tone(660,.12);setTimeout(()=>tone(880,.16),70);};
const sBad=()=>tone(180,.25,'triangle',.1);
const sMiss=()=>tone(320,.18,'sine',.06);

/* speech */
/* recorded instructions (Studio): play the recording when it exists for this exact text, otherwise the computer voice */
let voiceAudio=null;
function stopVoice(){try{speechSynthesis.cancel();}catch(e){}if(voiceAudio){voiceAudio.pause();voiceAudio=null;}}
function sayVoice(id,text){
  stopVoice();const m=(window.VOICE_MANIFEST||{})[id];
  if(!m||m.text!==text)return speak(text);
  try{voiceAudio=new Audio('audio/'+m.file);voiceAudio.onerror=()=>speak(text);voiceAudio.play().catch(()=>speak(text));}catch(e){speak(text);}
}
function speak(t){try{const sy=window.speechSynthesis;if(!sy)return toast('Η ανάγνωση δεν υποστηρίζεται σε αυτή τη συσκευή');sy.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='el-GR';u.rate=.9;const v=sy.getVoices().find(v=>/^el/i.test(v.lang));if(v)u.voice=v;sy.speak(u);}catch(e){}}
