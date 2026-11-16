/* ============================================================
   CORE — αποθήκευση, βοηθητικά, ποσά, ήχος, ομιλία, analytics
   ============================================================ */
"use strict";

/* ---------- storage ---------- */
const KEY='lf-magazaki-v1';
let store={settings:{money:'a',list:'imgword',unit:'lepta'},done:{},results:{}};
try{const raw=localStorage.getItem(KEY);if(raw){const p=JSON.parse(raw);if(p&&p.settings)store={settings:Object.assign({},store.settings,p.settings),done:p.done||{},results:p.results||{}};}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}}

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const el=(t,a={},h='')=>{const e=document.createElement(t);for(const k in a){if(k==='class')e.className=a[k];else e.setAttribute(k,a[k]);}if(h)e.innerHTML=h;return e;};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));window.scrollTo(0,0);}
/* restart a one-shot css animation (gentle wobble on a wrong try) */
function nudge(n){n.classList.remove('wobble');void n.offsetWidth;n.classList.add('wobble');}

/* ---------- money: every amount is an integer number of cents; only the display converts ---------- */
const fmt=c=>c%100===0?`€${c/100}`:`€${Math.floor(c/100)},${String(c%100).padStart(2,'0')}`;   // the € sign goes before the number: «€5», «€1,20»
const isNote=v=>v>=500;
/* the word for cents is the teacher's choice (asked at start, top-left button): «σεντ» as said in Cyprus, or «λεπτά» */
const useSent=()=>store.settings.unit==='sent';
const centsWord=()=>useSent()?'σεντ':'λεπτά';
const cents=n=>useSent()?`${n} σεντ`:`${n} λεπτ${n===1?'ό':'ά'}`;       // «50 σεντ» / «50 λεπτά»
const nameShort=v=>v<100?cents(v):fmt(v);                                 // «50 λεπτά», «€2»
/* for the speech engine, which reads «€1,20» badly */
function spoken(c){
  const e=Math.floor(c/100),l=c%100,p=[];
  if(e)p.push(`${e} ευρώ`);
  if(l)p.push(cents(l));
  return p.join(' και ')||'μηδέν ευρώ';
}
/* fewest coins/notes from the given set that make the amount (the euro set is canonical, so greedy is optimal) */
function greedy(c,set){const out=[];for(const v of set.slice().sort((a,b)=>b-a))while(c>=v){out.push(v);c-=v;}return out;}
const sum=a=>a.reduce((s,v)=>s+v,0);

/* ---------- sound: the game is silent (no speech, no chimes) ----------
   the calls stay in the stages, so sound can come back later in one place */
const sGood=()=>{};
function speak(){}
function hush(){}

/* ---------- analytics (works without gtag, e.g. when blocked) ---------- */
function track(name,params){try{if(typeof gtag==='function')gtag('event',name,params||{});}catch(e){}}
