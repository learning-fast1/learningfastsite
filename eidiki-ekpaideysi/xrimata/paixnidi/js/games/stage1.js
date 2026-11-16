/* ============================================================
   STAGE 1 — Το Πορτοφόλι: αναγνώριση χρημάτων
   ============================================================ */
"use strict";

/* rounds alternate: «Δώσε μου 2 €» (pick the coin) and «Πόσα χρήματα είναι αυτό;» (pick the value) */
STAGE[1]={
  setup(lvl){
    const d=LEVELS[lvl].money,targets=[];
    while(targets.length<ROUNDS){const s=shuffle(d.slice());if(targets.length&&s[0]===targets[targets.length-1])s.push(s.shift());targets.push(...s);}
    return targets.slice(0,ROUNDS).map((v,i)=>{
      const k=Math.min(d.length,i<4?3:4);
      return {kind:i%2?'value':'find',v,opts:shuffle([v,...s1confusers(v,d).slice(0,k-1)])};
    });
  },
  round(r){r.kind==='find'?s1find(r):s1value(r);},
  label:r=>r.kind==='find'?`Βρες ${nameShort(r.v)}`:`Τι αξία έχει ${isNote(r.v)?'το χαρτονόμισμα':'το κέρμα'} ${nameShort(r.v)}`
};

/* the wrong options are the ones easiest to mix up with v (from the level's money):
   first the same number in the other unit (20 λεπτά ↔ €20), then the same first digit (2 λεπτά, €2), then anything */
function s1confusers(v,d){
  const num=x=>x<100?x:x/100,first=x=>String(num(x))[0];
  const score=x=>num(x)===num(v)?3:first(x)===first(v)?2:0;
  return shuffle(d.filter(x=>x!==v)).sort((a,b)=>score(b)-score(a));
}

function s1find(r){
  say(`Δώσε μου <b>${nameShort(r.v)}</b>.`,`Δώσε μου ${spoken(r.v)}.`);
  $('#area').append(el('div',{class:'sign'},`<small>Ο κυρ-Στέλιος ζητά:</small><b>${nameShort(r.v)}</b>`));
  const w=el('div',{class:'wallet','aria-label':'Πορτοφόλι'});
  const btns=r.opts.map(v=>{const b=moneyBtn(v,1.2);w.append(b);return b;});
  $('#tray').append(w);
  s1choose(r,btns,btns[r.opts.indexOf(r.v)]);
}

function s1value(r){
  say(`Τι αξία έχει ${isNote(r.v)?'αυτό το χαρτονόμισμα':'αυτό το κέρμα'};`);
  const sh=el('div',{class:'showcase'});sh.append(moneyBtn(r.v));sh.firstChild.tabIndex=-1;
  $('#area').append(sh);
  const w=el('div',{class:'choices'});
  const btns=r.opts.map(v=>{const b=el('button',{class:'choice',type:'button'},nameShort(v));w.append(b);return b;});
  $('#tray').append(w);
  s1choose(r,btns,btns[r.opts.indexOf(r.v)]);
}

function s1hint(r){
  /* the pictures are the real coins: cent coins read «EURO CENT», the 1 € and 2 € coins only «EURO» */
  if(r.kind==='value')return [`Κοίτα τον αριθμό. Αν γράφει <b>CENT</b>, είναι ${centsWord()}. Αν γράφει μόνο <b>EURO</b>, είναι ευρώ.`,`Κοίτα τον αριθμό. Αν γράφει σεντ, είναι ${centsWord()}. Αν γράφει μόνο ευρώ, είναι ευρώ.`];
  const v=r.v,w=spoken(v);
  if(isNote(v))return [`Είναι χαρτονόμισμα, χάρτινο. Έχει μεγάλο τον αριθμό <b>${v/100}</b>.`,`Είναι χαρτονόμισμα, χάρτινο. Έχει μεγάλο τον αριθμό ${v/100}.`];
  if(v===100)return ['Είναι κέρμα με ασημί μέση και χρυσό γύρω γύρω. Έχει τον αριθμό <b>1</b>.',`Είναι κέρμα με ασημί μέση και χρυσό γύρω γύρω. Έχει τον αριθμό 1.`];
  if(v===200)return ['Είναι κέρμα με χρυσή μέση και ασημί γύρω γύρω. Έχει τον αριθμό <b>2</b>.',`Είναι κέρμα με χρυσή μέση και ασημί γύρω γύρω. Έχει τον αριθμό 2.`];
  const c=v<10?'χάλκινο':'χρυσό';
  return [`Είναι ${c} κέρμα με τον αριθμό <b>${v}</b> και τη λέξη CENT.`,`Είναι ${c} κέρμα με τον αριθμό ${v}. Είναι ${w}.`];
}

/* shared by both kinds: a wrong pick fades out (cannot be picked again), then the ladder: words → glow → solution */
function s1choose(r,btns,right){
  btns.forEach(b=>b.addEventListener('click',()=>{
    if(G.busy||b.classList.contains('off'))return;
    if(b===right){b.classList.add('right');return roundOk(`${pick(PRAISE[1])} Αυτό είναι <b>${nameShort(r.v)}</b>.`,`${pick(PRAISE[1])} Αυτό είναι ${spoken(r.v)}.`);}
    b.classList.add('off');b.setAttribute('aria-disabled','true');nudge(b);
    const step=roundMiss(`διάλεξε ${nameShort(r.opts[btns.indexOf(b)])}`);
    if(step===1)say(...s1hint(r));
    else if(step===2){right.classList.add('glow');say('Δες αυτό που λάμπει.');}
    else{btns.forEach(x=>x!==right&&x.classList.add('off'));right.classList.add('glow','right');
      roundShown(`Αυτό είναι <b>${nameShort(r.v)}</b>. Την επόμενη φορά θα το βρεις!`,`Αυτό είναι ${spoken(r.v)}. Την επόμενη φορά θα το βρεις!`);}
  }));
}
