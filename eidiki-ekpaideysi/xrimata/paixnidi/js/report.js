/* ============================================================
   REPORT — μικρή αναφορά στο τέλος κάθε σταδίου: σε τι δυσκολεύτηκε το παιδί
   ============================================================ */
"use strict";

const listAnd=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' και '+a[a.length-1];
const HELPWORD=['με την πρώτη','μετά από υπόδειξη','με οπτική βοήθεια','του δείξαμε τη λύση'];
const times=k=>k===1?'1 φορά':`${k} φορές`;

/* the rounds of the stage just played that needed any help, oldest first */
const troubleRounds=()=>G.log.filter(r=>r.help>0);

/* fills #rsum, #rlist, #rextra from G (the stage just finished) */
function renderReport(n){
  const h=[0,0,0,0];G.log.forEach(r=>h[r.help]++);
  const bad=troubleRounds();
  $('#rsum').textContent=`Σωστά με την πρώτη προσπάθεια: ${h[0]} από ${G.total}.`+
    (bad.length?` Δυσκολεύτηκε σε ${bad.length===1?'1 γύρο':bad.length+' γύρους'}:`:' Δεν δυσκολεύτηκε σε κανέναν γύρο!');

  const ul=$('#rlist');ul.innerHTML='';
  bad.forEach(r=>{
    const li=el('li',{});
    li.append(el('span',{class:'lab'}),el('span',{class:'how h'+r.help}));
    li.firstChild.textContent=STAGE[n].label(G.items[r.i]);
    li.children[1].textContent=HELPWORD[r.help];
    const slips=G.slips[r.i]||[];
    if(slips.length){const s=el('small',{});s.textContent=slips.join(' · ');li.append(s);}
    ul.append(li);
  });
  ul.hidden=!bad.length;

  /* one extra line where the stage keeps something more to say */
  const e=G.extra,extra=[];
  if(n===4){const m=(e.meter||[]).length;extra.push(m?`Πάτησε «Βοήθεια» (ξόδεψες/έμειναν) σε ${m===1?'1 αγορά':m+' αγορές'}.`:'Υπολόγιζε μόνος/η του/της πόσα έμειναν, χωρίς το κουμπί «Βοήθεια».');}
  if(n===6&&(e.rude||e.off))extra.push(`Διάλεξε αγενή φράση ${times(e.rude||0)} και άσχετη φράση ${times(e.off||0)}.`);
  $('#rextra').textContent=extra.join(' ');$('#rextra').hidden=!extra.length;
  return bad;
}
