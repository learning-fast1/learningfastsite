/* ============================================================
   STAGE 5 — Η Υπεραγορά: σύνολο και ρέστα
   ============================================================ */
"use strict";

const SUPER=['gala','psomi','tyri','mila','bananes','ntomates','xymos','nero','sokolata','biskoto','patates','karota','portokalia','pagoto','karameles','kekaki','kroisan','lemonia'];
/* the cash drawer the change comes from (the change is always 10 € or less, so 5 € is the biggest note needed) */
const DRAWER={a:[100,200,500],b:[50,100,200,500],c:[1,2,5,10,20,50,100,200,500]};
/* two parts of ten: first the child is the cashier and gives the change («make»),
   then Stelios is the cashier and the child checks the change («check»: Σωστά / Λάθος) */
STAGE[5]={
  parts:2,
  setup(lvl){
    return Array.from({length:ROUNDS*2},(_,i)=>{
      const items=shuffle(SUPER.slice()).slice(0,i%ROUNDS<3?2:3).map(id=>({p:PRODUCTS[id],price:priceAt(PRODUCTS[id].price,lvl)}));
      const total=sum(items.map(x=>x.price)),pay=[500,1000,2000].find(v=>v>total);
      const r={kind:i<ROUNDS?'make':'check',first:i%ROUNDS===0,items,total,pay,change:pay-total};
      if(r.kind==='check'){
        /* about half the time the cashier is off by one small coin */
        const off=lvl==='a'?100:lvl==='b'?50:pick([10,20,50]);
        r.right=Math.random()<.5;
        r.given=r.right?r.change:r.change+(r.change>off&&Math.random()<.5?-off:off);
      }
      return r;
    });
  },
  round(r){r.kind==='check'?s5check(r):s5make(r);},
  label:r=>r.kind==='make'?`Ταμίας: ρέστα από ${fmt(r.pay)} για ${fmt(r.total)}`:`Έλεγχος ρέστων: ${fmt(r.pay)} για ${fmt(r.total)}`,
  /* replaying mistakes: the role-swap introduction goes on the first round of each kind */
  practice:items=>items.map((r,i)=>Object.assign({},r,{first:items.findIndex(x=>x.kind===r.kind)===i}))
};

/* the receipt (items, total, what was paid) on the left; the change on the right */
function s5layout({kind,items,total,pay}){
  const box=el('div',{class:'market'});
  const rc=el('div',{class:'receipt','aria-label':'Απόδειξη'},
    '<h3>🧾 Απόδειξη</h3><div class="rlines">'+items.map(x=>`<div class="rline"><span>${productHTML(x.p,G.mode)}</span><span>${fmt(x.price)}</span></div>`).join('')+
    `</div><div class="rline total"><b>Σύνολο</b><b>${fmt(total)}</b></div>`);
  const paid=el('div',{class:'rline paid'},`<span>${kind==='make'?'Ο πελάτης έδωσε:':'Πλήρωσες:'}</span>`);
  paid.append(stillMoney(pay,.55),el('b',{},fmt(pay)));
  rc.append(paid);
  const side=el('div',{class:'side'});
  box.append(rc,side);$('#area').append(box);
  return side;
}
const S5SUB=(pay,total)=>[`<b>${fmt(pay)}</b> − <b>${fmt(total)}</b>`,`${spoken(pay)} μείον ${spoken(total)}`];

function s5check(r){
  const {total,pay,change,given,right}=r,[sub,subV]=S5SUB(pay,total);
  const intro=r.first?'Τώρα αλλάζουμε! Εγώ είμαι ο ταμίας κι εσύ ελέγχεις τα ρέστα. ':'';
  say(`${intro}Πλήρωσες με <b>${fmt(pay)}</b>. Σου δίνω ρέστα. Είναι σωστά;`,`${intro}Πλήρωσες με ${spoken(pay)}. Σου δίνω ρέστα. Είναι σωστά;`);
  const side=s5layout(r);
  const plate=el('div',{class:'plate','aria-label':'Τα ρέστα που σου δίνει'});side.append(plate);
  const showCoins=c=>{plate.innerHTML='<span class="cap">Ρέστα:</span>';greedy(c,DRAWER[G.lvl]).forEach(v=>plate.append(stillMoney(v,.8)));};
  showCoins(given);
  /* visual help: what the cashier gave next to what you should get */
  const mx=Math.max(given,change);
  const cmp=el('div',{class:'cmp',hidden:''},
    `<div><span>Σου έδωσα</span><i style="width:${given*100/mx}%"></i><b>${fmt(given)}</b></div><div><span>Πρέπει</span><i class="have" style="width:${change*100/mx}%"></i><b>${fmt(change)}</b></div>`);
  side.append(cmp);

  const w=el('div',{class:'choices'});
  const bOk=el('button',{class:'choice',type:'button'},'👍 Σωστά'),bNo=el('button',{class:'choice',type:'button'},'🤔 Λάθος');
  w.append(bOk,bNo);$('#tray').append(w);
  const good=right?bOk:bNo;
  const why=right?`Τα ρέστα είναι <b>${fmt(change)}</b>.`:`Έπρεπε να πάρεις <b>${fmt(change)}</b>. Συγγνώμη! Ορίστε τα σωστά ρέστα.`;
  const whyV=right?`Τα ρέστα είναι ${spoken(change)}.`:`Έπρεπε να πάρεις ${spoken(change)}. Συγγνώμη! Ορίστε τα σωστά ρέστα.`;
  [bOk,bNo].forEach(b=>b.onclick=()=>{
    if(G.busy)return;
    if(b===good){
      b.classList.add('right');cmp.hidden=false;if(!right)showCoins(change);
      const pr=right?pick(PRAISE[5]):pick(['Μπράβο, το πρόσεξες!','Τέλεια, το βρήκες!','Πολύ προσεκτικά!']);
      return roundOk(`${pr} ${why}`,`${pr} ${whyV}`);
    }
    nudge(b);
    const step=roundMiss(right?`είπε «Λάθος» ενώ τα ρέστα (${fmt(given)}) ήταν σωστά`:`είπε «Σωστά» ενώ πήρε ${fmt(given)} αντί για ${fmt(change)}`);
    if(step===1)say(`Τα ρέστα είναι ${sub}. Μέτρα τα κέρματα που σου έδωσα.`,`Τα ρέστα είναι ${subV}. Μέτρα τα κέρματα που σου έδωσα.`);
    else if(step===2){cmp.hidden=false;say('Δες τις γραμμές. Αν είναι ίδιες, τα ρέστα είναι σωστά.');}
    else{cmp.hidden=false;good.classList.add('glow','right');if(!right)showCoins(change);roundShown(why,whyV);}
  });
}

function s5make(r){
  const {total,pay,change}=r,W=DRAWER[G.lvl],[sub,subV]=S5SUB(pay,total);
  let placed=[],helpOn=false;
  /* role swap: Stelios is the customer, the child the cashier */
  const intro=r.first?'Σήμερα είσαι εσύ ο ταμίας κι εγώ ο πελάτης! ':'';
  say(`${intro}Σου δίνω <b>${fmt(pay)}</b>. Πόσα ρέστα θα μου δώσεις; Βάλ' τα στο πιατάκι.`,`${intro}Σου δίνω ${spoken(pay)}. Πόσα ρέστα θα μου δώσεις; Βάλ' τα στο πιατάκι.`);
  const side=s5layout(r);
  const plate=el('div',{class:'plate','data-drop':'plate','aria-label':'Πιατάκι για τα ρέστα του πελάτη'});
  /* the target stays hidden until the visual help: working it out is the task */
  const bar=el('div',{class:'paybar'},`<div class="nums"><span>Ρέστα: <b class="s5sum"></b></span><span class="need" hidden>Πρέπει: <b>${fmt(change)}</b></span></div>`);
  side.append(plate,bar);

  const wallet=el('div',{class:'wallet','aria-label':'Συρτάρι της ταμειακής. Σύρε ή πάτα ένα κέρμα για να το βάλεις στο πιατάκι.'});
  W.forEach(v=>{const b=moneyBtn(v);draggable(b,{onDrop:()=>add(v),onTap:()=>add(v)});wallet.append(b);});
  const ok=el('button',{class:'btn pay',type:'button'},'Έτοιμα τα ρέστα');ok.onclick=check;
  $('#tray').append(wallet,ok);

  function add(v){if(G.busy)return;placed.push(v);render(true);}
  function render(landed){
    plate.innerHTML='';
    const fix=helpOn?s3fix(placed,change,W):null,mark=fix?fix.out.slice():[];
    if(!placed.length&&!fix)plate.append(el('span',{class:'empty'},'Σύρε εδώ τα ρέστα'));
    placed.forEach((v,i)=>{
      const b=moneyBtn(v,.8);b.setAttribute('aria-label',nameShort(v)+'. Πάτα για να το βγάλεις.');
      const m=mark.indexOf(v);if(m>=0){mark.splice(m,1);b.classList.add('glow');}
      if(landed&&i===placed.length-1&&!RM)b.classList.add('land');
      b.onclick=()=>{if(G.busy)return;placed.splice(i,1);render(false);};
      plate.append(b);
    });
    const s=sum(placed);
    bar.querySelector('.s5sum').textContent=fmt(s);
    wallet.querySelectorAll('.money').forEach(b=>b.classList.toggle('glow',!!fix&&fix.add.includes(+b.dataset.v)));
    if(fix)fix.add.forEach(v=>{const g=moneyBtn(v,.8);g.classList.add('shadow');g.disabled=true;g.setAttribute('aria-hidden','true');plate.append(g);});
  }
  render(false);

  function check(){
    if(G.busy)return;const s=sum(placed);
    if(s===change){helpOn=false;render(false);return roundOk(`${pick(PRAISE[5])} Τα ρέστα είναι <b>${fmt(change)}</b>. Ευχαριστώ!`,`${pick(PRAISE[5])} Τα ρέστα είναι ${spoken(change)}. Ευχαριστώ!`);}
    nudge(plate);
    const step=roundMiss(s?`έδωσε ${fmt(s)} ρέστα αντί για ${fmt(change)}`:'πάτησε «Έτοιμα» χωρίς ρέστα');
    if(step===1)say(`Σκέψου: ${sub}. ${s<change?'Μου χρωστάς κι άλλα.':'Μου έδωσες πολλά.'}`,`Σκέψου: ${subV}. ${s<change?'Μου χρωστάς κι άλλα.':'Μου έδωσες πολλά.'}`);
    else if(step===2){
      helpOn=true;bar.querySelector('.need').hidden=false;render(false);
      say(`Τα ρέστα είναι <b>${fmt(change)}</b>. Δες τι λάμπει.`,`Τα ρέστα είναι ${spoken(change)}. Δες τι λάμπει.`);
    }else{
      helpOn=false;placed=greedy(change,W);bar.querySelector('.need').hidden=false;render(false);
      roundShown(`Δες: ${sub} = <b>${fmt(change)}</b>.`,`Δες. ${subV} κάνει ${spoken(change)}.`);
    }
  }
}
