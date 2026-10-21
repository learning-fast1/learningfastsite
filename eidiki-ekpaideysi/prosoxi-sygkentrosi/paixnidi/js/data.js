/* ============================================================
   DATA — στάθμοι, κόλπα, οδηγίες, επιδείξεις
   ============================================================ */
"use strict";

/* ---------- stages ---------- */
const STAGES=[
 {id:1,name:'Βρες τα μαργαριτάρια',skill:'Εστιασμένη προσοχή',depth:5},
 {id:2,name:'Το χρυσόψαρο στο φινιστρίνι',skill:'Διατηρούμενη προσοχή',depth:10},
 {id:3,name:'Ψάρια ναι, μέδουσες όχι',skill:'Αναστολή αντίδρασης',depth:15},
 {id:4,name:'Κρυμμένοι θησαυροί',skill:'Επιλεκτική προσοχή',depth:20},
 {id:5,name:'Ο κανόνας αλλάζει',skill:'Εναλλασσόμενη προσοχή',depth:25},
 {id:6,name:'Οδηγός υποβρυχίου',skill:'Διαιρεμένη προσοχή',depth:30}
];
const STRATS=[
 {id:'stop',ic:'<img src="img/strat-stop.png" alt="">',t:'Σταματώ, κοιτάζω, πατώ'},
 {id:'rule',ic:'<img src="img/strat-rule.png" alt="">',t:'Λέω μέσα μου τον κανόνα'},
 {id:'eyes',ic:'<img src="img/strat-eyes.png" alt="">',t:'Κρατώ τα μάτια μου στο παιχνίδι'}
];
const TRANSFER=['Όταν γράφω στην τάξη','Όταν ακούω τη δασκάλα','Όταν διαβάζω','Όταν λύνω μαθηματικά'];
const SELF=[{e:levelBars(1),t:'Λίγο'},{e:levelBars(2),t:'Αρκετά'},{e:levelBars(3),t:'Πάρα πολύ'}];

function prof(){return store.profiles[cur];}
/* difficulty zones the teacher picks per stage; the game adapts only inside the zone */
const TIERS={auto:{name:'Αυτόματο',lo:1,hi:10},easy:{name:'Εύκολο',lo:1,hi:3},mid:{name:'Μέτριο',lo:4,hi:6},hard:{name:'Δύσκολο',lo:7,hi:10}};
function tierOf(s,p){p=p||prof();return (p.tiers||{})[s]||'auto';}
function clampTier(s,L,p){const T=TIERS[tierOf(s,p)];return Math.min(T.hi,Math.max(T.lo,L));}
function level(s,p){p=p||prof();return clampTier(s,(p.levels||{})[s]||1,p);}
// the next stage opens with 2 stars (80%+) in the previous one, exactly as the map and result screens say
function unlocked(s){const p=prof();if(s===1||p.unlockAll)return true;return !!((p.passed||{})[s-1])||((p.best||{})[s-1]||0)>=2;}
function bestStars(s){return (prof().best||{})[s]||0;}

function instructions(s,L){
  // keep in step with js/games/stageN.js: each sentence describes what that level actually does
  if(s===4)return `Βρες και πάτα ${target4.label}. Μην πατάς τα άλλα`+(L>=4?', ακόμη κι αν έχουν το ίδιο σχήμα.':'.');
  if(s===5)return 'Ακολούθα τον κανόνα που θα σου εμφανίζεται πάνω στην οθόνη. Οι δύο κανόνες θα είναι είτε να ακολουθήσεις το ίδιο χρώμα είτε να ακολουθήσεις το ίδιο σχήμα. Ανάλογα με το τι σου ζητάει ο κανόνας, θα πατάς τα κουμπιά δεξιά και αριστερά.'+(L>=7?' Καμιά φορά αλλάζει χωρίς να σου το πει, γι’ αυτό κοίτα συχνά την πινακίδα.':'');
  if(s===6)return (L<=3?'Στην αρχή μόνο οδηγείς. Λίγο μετά ανάβει και το παράθυρο. ':'')+'Με τα βελάκια οδήγησε το υποβρύχιο και απόφυγε τους βράχους. Ταυτόχρονα κοίτα το παράθυρο επάνω: όταν δεις το χρυσόψαρο, πάτα την κάμερα. Για τα άλλα ψάρια μην πατάς.';
  if(s===1)return 'Πάτα κάθε μαργαριτάρι μόλις εμφανιστεί, πριν χαθεί. Πάτα πάνω στο μαργαριτάρι, όχι στο νερό.';
  if(s===2)return 'Κοίτα μέσα στο στρογγυλό παράθυρο. Πάτα το κουμπί «Πάτα!» μόνο όταν βλέπεις το χρυσόψαρο. Για τα άλλα ψάρια μην πατάς.'+(L>=6?' Πρόσεξε: κάποια ψάρια μοιάζουν με το χρυσόψαρο!':'')+' Αν παίζετε από τον υπολογιστή, μπορείτε να πατάτε το κουμπί Space όταν βλέπετε το χρυσόψαρο.';
  let t='Πάτα όλα τα ψαράκια. Μην πατάς τις μέδουσες!';
  if(L>=4)t+=' Όταν δεις κλειστό στρείδι, περίμενε να ανοίξει και μετά πάτα το.';
  return t;
}
/* which recorded instruction (Studio, ../studio) belongs to instructions(s,L): one id per distinct text */
function voiceId(s,L){
  if(s===1)return 's1';
  if(s===2)return L>=6?'s2-l6':'s2';
  if(s===3)return L>=4?'s3-l4':'s3';
  if(s===4)return `s4-${target4.color}`+(L>=4?'-l4':'');
  if(s===5)return L>=7?'s5-l7':'s5';
  return L<=3?'s6-l1':'s6';
}
function demoHTML(s,L){
  const tile=(svg,cap,cls)=>`<figure><div class="tile"><div style="width:70px;height:60px">${svg}</div></div><span class="${cls}">${cap}</span></figure>`;
  if(s===1)return tile(pearl(),'Πάτα ✓','yes');
  if(s===4){const T=target4,oc=Object.keys(C4).find(c=>c!==T.color),os=Object.keys(SH4).find(x=>x!==T.shape);return tile(itemSVG(T.color,T.shape),'Πάτα ✓','yes')+tile(itemSVG(oc,os),'Μην πατάς ✗','no')+(L>=4?tile(itemSVG(T.color,os),'Μην πατάς ✗','no')+tile(itemSVG(oc,T.shape),'Μην πατάς ✗','no'):'');}
  if(s===5)return tile(itemSVG('pink','star'),'«Χρώμα»: αριστερά<br>«Σχήμα»: δεξιά','yes')+tile(itemSVG('blue','fish'),'«Χρώμα»: δεξιά<br>«Σχήμα»: αριστερά','yes');
  if(s===6)return tile(rock(),'Απόφυγε ✗','no')+tile(goldfish(),'📷 Πάτα ✓','yes')+tile(fish('#FF6F91'),'Μην πατάς ✗','no');
  if(s===2)return tile(goldfish(),'Πάτα ✓','yes')+tile(fish('#FF6F91'),'Μην πατάς ✗','no')+(L>=6?tile(fish('#FF9A1F','#D9740A'),'Μην πατάς ✗','no'):'');
  return tile(fish('#5BC0EB'),'Πάτα ✓','yes')+tile(jelly(),'Μην πατάς ✗','no')+(L>=4?tile(oyster(false),'Περίμενε…','no')+tile(oyster(true),'Τώρα πάτα ✓','yes'):'');
}
