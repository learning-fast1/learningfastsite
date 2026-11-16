/* ============================================================
   STAGE 6 — Μιλάω στον Ταμία: κοινωνική επικοινωνία
   ============================================================ */
"use strict";

/* each scenario walks the same five steps; per step one fitting phrase, one rude, one off-topic,
   each wrong one with a gentle reason. {P} is the price at the teacher's money level. */
const S6STEPS=['greet','ask','pay','thanks','bye'];
const S6NAMES={greet:'χαιρετισμός',ask:'αίτημα',pay:'πληρωμή',thanks:'ευχαριστίες',bye:'αποχαιρετισμός'};
const SCENES=[
  {shop:2,p:'psomi',
    greet:{note:'Μπαίνεις στον Φούρνο. Ο φούρναρης σε κοιτά και χαμογελά.',good:'Καλημέρα σας!',reply:'Καλημέρα! Τι θα πάρεις;',
      rude:['Έι, εσύ! Έλα εδώ!','Αυτό ακούγεται απότομο. Όταν μπαίνουμε σε ένα μαγαζί, λέμε «Καλημέρα».'],
      off:['Χθες έβρεξε πολύ.','Αυτό δεν ταιριάζει τώρα. Μόλις μπήκες στο μαγαζί: πρώτα χαιρετάμε.']},
    ask:{good:'Θα ήθελα ένα ψωμί, παρακαλώ.',reply:'Ορίστε το ψωμί σου. Κάνει {P}.',
      rude:['Δώσε μου ψωμί. Γρήγορα!','Αυτό ακούγεται σαν διαταγή. Ζητάμε ευγενικά και λέμε «παρακαλώ».'],
      off:['Πού είναι η παιδική χαρά;','Αυτό δεν απαντά στην ερώτηση. Σε ρώτησα τι θα πάρεις.']},
    pay:{good:'Ορίστε τα χρήματα.',reply:'Ευχαριστώ! Ορίστε τα ρέστα σου.',
      rude:['Πολύ ακριβό είναι! Ούφ!','Αυτό με στενοχωρεί λίγο. Δίνουμε τα χρήματα και λέμε «Ορίστε».'],
      off:['Μου αρέσουν οι γάτες.','Αυτό δεν ταιριάζει τώρα. Περιμένω να πληρώσεις.']},
    thanks:{good:'Ευχαριστώ πολύ!',reply:'Παρακαλώ! Καλή σου όρεξη!',
      rude:['Επιτέλους! Άργησες πολύ.','Αυτό ακούγεται αγενές. Όταν παίρνουμε κάτι, λέμε «Ευχαριστώ».'],
      off:['Πόσο χρονών είσαι;','Αυτό δεν ταιριάζει τώρα. Πήρες το ψωμί και τα ρέστα. Τι λέμε;']},
    bye:{note:'Πήρες ό,τι χρειαζόσουν. Ήρθε η ώρα να φύγεις.',good:'Γεια σας! Καλή σας μέρα!',reply:'Γεια σου! Να ξανάρθεις!',
      rude:['Άντε, φεύγω. Βαρέθηκα.','Αυτό ακούγεται αγενές. Όταν φεύγουμε, χαιρετάμε ευγενικά.'],
      off:['Θέλω να παίξω μπάλα.','Αυτό δεν ταιριάζει τώρα. Πριν φύγεις από το μαγαζί, χαιρετάς.']}},
  {shop:3,p:'nero',
    greet:{note:'Πηγαίνεις στο Περίπτερο. Ο περιπτεράς είναι στο παράθυρο.',good:'Γεια σας!',reply:'Γεια σου! Τι θα ήθελες;',
      rude:['Ψιτ! Εσύ!','Το «ψιτ» ακούγεται αγενές. Λέμε «Γεια σας».'],
      off:['Το αγαπημένο μου χρώμα είναι το μπλε.','Αυτό δεν ταιριάζει τώρα. Πρώτα χαιρετάμε.']},
    ask:{good:'Ένα νερό, παρακαλώ.',reply:'Ορίστε. Κάνει {P}.',
      rude:['Νερό! Τώρα!','Αυτό ακούγεται σαν φωνή και διαταγή. Ζητάμε ήρεμα, με «παρακαλώ».'],
      off:['Έχω διαγώνισμα αύριο.','Αυτό δεν απαντά στην ερώτηση. Σε ρώτησα τι θέλεις.']},
    pay:{good:'Ορίστε, παρακαλώ.',reply:'Ευχαριστώ! Ορίστε και τα ρέστα σου.',
      rude:['Πάρ’ τα!','Αυτό ακούγεται απότομο. Δίνουμε τα χρήματα στο χέρι και λέμε «Ορίστε».'],
      off:['Πού μένεις;','Αυτό δεν ταιριάζει τώρα. Περιμένω να πληρώσεις.']},
    thanks:{good:'Ευχαριστώ!',reply:'Να είσαι καλά!',
      rude:['Δεν λέω ευχαριστώ.','Σε εξυπηρέτησα. Όταν μας βοηθούν, λέμε «Ευχαριστώ».'],
      off:['Ο σκύλος μου λέγεται Ρεξ.','Αυτό δεν ταιριάζει τώρα. Πήρες το νερό σου. Τι λέμε;']},
    bye:{note:'Τελείωσες. Φεύγεις από το Περίπτερο.',good:'Γεια σας!',reply:'Γεια σου! Καλή συνέχεια!',
      rude:['Ούφ, επιτέλους φεύγω.','Αυτό με στενοχωρεί λίγο. Όταν φεύγουμε, χαιρετάμε.'],
      off:['Μου αρέσει η πίτσα.','Αυτό δεν ταιριάζει τώρα. Πριν φύγεις, χαιρετάς.']}},
  {shop:4,p:'mila',
    greet:{note:'Μπαίνεις στο Μανάβικο. Ο μανάβης τακτοποιεί τα φρούτα.',good:'Καλησπέρα σας!',reply:'Καλησπέρα! Πώς μπορώ να σε βοηθήσω;',
      rude:['Γρήγορα, βιάζομαι!','Αυτό ακούγεται απότομο. Πρώτα χαιρετάμε ήρεμα.'],
      off:['Το ποδήλατό μου είναι κόκκινο.','Αυτό δεν ταιριάζει τώρα. Μόλις μπήκες: πρώτα χαιρετάμε.']},
    ask:{good:'Θα ήθελα μήλα, παρακαλώ.',reply:'Ορίστε τα μήλα σου. Κάνουν {P}.',
      rude:['Θέλω μήλα. Κουνήσου!','Αυτό ακούγεται αγενές. Ζητάμε ευγενικά και λέμε «παρακαλώ».'],
      off:['Σήμερα έχει ήλιο.','Αυτό δεν απαντά στην ερώτηση. Σε ρώτησα πώς μπορώ να σε βοηθήσω.']},
    pay:{good:'Ορίστε τα χρήματα.',reply:'Ευχαριστώ! Ορίστε τα ρέστα σου.',
      rude:['Δεν σου δίνω τίποτα!','Αυτό δεν είναι σωστό. Τα μήλα κοστίζουν χρήματα. Πληρώνουμε και λέμε «Ορίστε».'],
      off:['Μου αρέσει να ζωγραφίζω.','Αυτό δεν ταιριάζει τώρα. Περιμένω να πληρώσεις.']},
    thanks:{good:'Σας ευχαριστώ!',reply:'Εγώ ευχαριστώ! Να τα φας με υγεία!',
      rude:['Τα μήλα σου είναι άσχημα.','Αυτό με πληγώνει λίγο. Λέμε «Ευχαριστώ».'],
      off:['Αύριο έχω γενέθλια.','Αυτό δεν ταιριάζει τώρα. Πήρες τα μήλα και τα ρέστα. Τι λέμε;']},
    bye:{note:'Πήρες τα μήλα. Φεύγεις από το Μανάβικο.',good:'Καλό απόγευμα! Γεια σας!',reply:'Γεια σου! Να προσέχεις!',
      rude:['Μπλιαχ, φεύγω.','Αυτό ακούγεται αγενές. Όταν φεύγουμε, χαιρετάμε ευγενικά.'],
      off:['Ποιο είναι το αγαπημένο σου ζώο;','Αυτό δεν ταιριάζει τώρα. Πριν φύγεις, χαιρετάς.']}},
  {shop:5,p:'gala',
    greet:{note:'Είσαι στο ταμείο της Υπεραγοράς. Ήρθε η σειρά σου.',good:'Καλημέρα σας!',reply:'Καλημέρα! Τι έχεις στο καλάθι σου;',
      rude:['Επιτέλους! Πολλή ώρα περίμενα!','Αυτό ακούγεται θυμωμένο. Περιμένουμε τη σειρά μας ήρεμα και χαιρετάμε.'],
      off:['Η αδελφή μου λέγεται Μαρία.','Αυτό δεν ταιριάζει τώρα. Πρώτα χαιρετάμε τον ταμία.']},
    ask:{good:'Ένα γάλα, παρακαλώ.',reply:'Ωραία. Κάνει {P}.',
      rude:['Βιάσου, έχω δουλειές!','Αυτό ακούγεται απότομο. Λέμε τι αγοράζουμε, με «παρακαλώ».'],
      off:['Είδες τον αγώνα χθες;','Αυτό δεν απαντά στην ερώτηση. Σε ρώτησα τι έχεις στο καλάθι.']},
    pay:{good:'Ορίστε, παρακαλώ.',reply:'Ευχαριστώ! Θέλεις σακούλα;',
      rude:['Πάρ’ τα και τελείωνε!','Αυτό ακούγεται αγενές. Δίνουμε τα χρήματα και λέμε «Ορίστε».'],
      off:['Μου αρέσουν τα αυτοκίνητα.','Αυτό δεν ταιριάζει τώρα. Περιμένω να πληρώσεις.']},
    thanks:{good:'Ναι, παρακαλώ. Ευχαριστώ!',reply:'Ορίστε! Καλή σου μέρα!',
      rude:['Ναι, και γρήγορα!','Αυτό ακούγεται απότομο. Λέμε «Ναι, παρακαλώ» και «Ευχαριστώ».'],
      off:['Το σχολείο μου είναι μεγάλο.','Αυτό δεν απαντά στην ερώτηση. Σε ρώτησα αν θέλεις σακούλα.']},
    bye:{note:'Πήρες το γάλα. Φεύγεις από την Υπεραγορά.',good:'Ευχαριστώ, γεια σας!',reply:'Γεια σου! Καλή συνέχεια!',
      rude:['Ούφ, επιτέλους!','Αυτό με στενοχωρεί λίγο. Όταν φεύγουμε, χαιρετάμε.'],
      off:['Πόσα σκαλιά έχει το σχολείο;','Αυτό δεν ταιριάζει τώρα. Πριν φύγεις, χαιρετάς.']}}
];

let s6chat=[];   // the conversation of the scenario in progress; it carries over between its five rounds

STAGE[6]={
  setup(lvl){
    const out=[];
    shuffle(SCENES.slice()).slice(0,2).forEach(sc=>{
      const price=priceAt(PRODUCTS[sc.p].price,lvl);
      S6STEPS.forEach((step,k)=>out.push(Object.assign({sc,step,first:k===0,price},sc[step])));
    });
    return out;
  },
  round(r){s6round(r);},
  label:r=>`${SHOPS[r.sc.shop-1].name}: ${S6NAMES[r.step]}`,
  /* replaying mistakes: each round stands alone, so it starts with what the shopkeeper said just before */
  practice:items=>items.map(r=>{const k=S6STEPS.indexOf(r.step);return Object.assign({},r,{first:true,noted:false,ctx:k>0?r.sc[S6STEPS[k-1]].reply:''});})
};

function s6round(r){
  const P=t=>t.replace('{P}',fmt(r.price)),PV=t=>t.replace('{P}',spoken(r.price)),p=PRODUCTS[r.sc.p];
  /* a round can be drawn again (σεντ/λεπτά changed mid-round): add its narration to the talk only once */
  if(r.first&&!r.noted){s6chat=[];if(r.ctx)s6chat.push({who:'st',text:P(r.ctx)});}
  if(r.note&&!r.noted)s6chat.push({who:'note',text:r.note});
  r.noted=true;
  say(r.note?`${r.note} <b>Τι θα πεις;</b>`:'<b>Τι θα πεις;</b>',r.note?`${r.note} Τι θα πεις;`:'Τι θα πεις;');

  const box=el('div',{class:'talk'});
  box.append(el('div',{class:'scene'},`<img class="shopimg" src="${SHOPS[r.sc.shop-1].img}" alt=""><span>${SHOPS[r.sc.shop-1].name}</span><span class="want">Θέλεις: ${productHTML(p,G.mode==='word'?'word':'imgword')}</span>`));
  const chat=el('div',{class:'chat','aria-live':'polite'});box.append(chat);
  $('#area').append(box);
  const draw=fresh=>{
    chat.innerHTML='';
    s6chat.slice(innerHeight<540?-4:-5).forEach((m,i,a)=>{   // the last lines of the talk; one fewer on short screens
      const n=fresh&&i===a.length-1&&!RM?' land':'';
      if(m.who==='note')chat.append(el('p',{class:'cnote'+n},m.text));
      else if(m.who==='st')chat.append(el('div',{class:'cl st'+n},`<img src="img/stelios-face.png" alt="Κυρ-Στέλιος:"><span></span>`));
      else chat.append(el('div',{class:'cl me'+n},'<span></span>'));
      if(m.who!=='note')chat.lastChild.querySelector('span').textContent=m.text;
    });
    $('#area').scrollTop=1e6;
  };
  draw(false);

  const opts=shuffle([['good',P(r.good)],['rude',r.rude[0],r.rude[1]],['off',r.off[0],r.off[1]]]);
  const list=el('div',{class:'phrases'}),rows=[];
  opts.forEach(([kind,text,why])=>{
    const row=el('div',{class:'prow'});
    const b=el('button',{class:'choice',type:'button'});b.textContent=text;
    b.onclick=()=>choose(kind,text,why,row,b);
    row.append(b);list.append(row);rows.push([kind,row,b]);
  });
  $('#tray').append(list);
  const goodBtn=rows.find(x=>x[0]==='good')[2];

  function choose(kind,text,why,row,b){
    if(G.busy||row.classList.contains('off'))return;
    if(kind==='good'){
      s6chat.push({who:'me',text});draw(true);b.classList.add('right');
      const pr=pick(PRAISE[6]);
      /* no voice any more: the reply comes quickly, then a short pause to read it before the next choices */
      roundOk(pr,`${text} ... ${PV(r.reply)}`,1300);
      later(()=>{s6chat.push({who:'st',text:P(r.reply)});draw(true);},300);
      return;
    }
    /* a rude or off-topic phrase: it fades, Stelios explains gently why it does not fit */
    row.classList.add('off');nudge(b);
    G.extra[kind]=(G.extra[kind]||0)+1;
    const step=roundMiss(`διάλεξε ${kind==='rude'?'αγενή':'άσχετη'} φράση: «${text}»`);
    if(step===1)say(why);
    else{goodBtn.classList.add('glow');say(`${why} Δες τι λάμπει.`,why+' Δες τι λάμπει.');}
  }
}
