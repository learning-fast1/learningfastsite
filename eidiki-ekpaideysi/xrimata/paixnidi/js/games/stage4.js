/* ============================================================
   STAGE 4 — Το Μανάβικο: προϋπολογισμός
   ============================================================ */
"use strict";

const MANAVIKO=['bananes','mila','ntomates','portokalia','agouria','patates','karota','stafylia','lemonia','karpouzi'];
/* «shop»: spend all the money, to the last cent; «enough»: «Φτάνουν τα χρήματα; Ναι/Όχι» */
const S4KIND=['shop','enough','shop','shop','enough','shop','enough','shop','shop','enough'];
const S4BUDGET={a:[5,6,5,7,6,8],b:[5,4,6,5,7,6],c:[5,4,6,5,7,6]};   // euros, one per «shop» round
const S4MAX=2;   // the same product can be bought at most this many times
const PURSE=[2000,1000,500,200,100,50,20,10,5,2,1];

/* every way to spend exactly `budget` with this stall, each product 0..S4MAX times (6 products → at most 729 tries) */
function s4ways(stall,budget){
  const out=[],c=stall.map(()=>0);
  (function rec(i,t){
    if(t>budget)return;
    if(i===stall.length){if(t===budget)out.push(c.slice());return;}
    for(let k=0;k<=S4MAX;k++){c[i]=k;rec(i+1,t+k*stall[i].price);}
    c[i]=0;
  })(0,0);
  return out;
}

STAGE[4]={
  setup(lvl){
    let s=0;
    /* with all the coins, no product costs whole euros: the child has to work with cents */
    const at=c=>{const v=priceAt(c,lvl);return lvl==='c'&&v%100===0?v-5:v;};
    const draw=()=>shuffle(MANAVIKO.slice()).map(id=>({p:PRODUCTS[id],price:at(PRODUCTS[id].price)}));
    return S4KIND.map(kind=>{
      if(kind==='shop'){
        /* a stall on which the money can be spent exactly (the planned amount if possible, else a near one) */
        const want=S4BUDGET[lvl][s++];
        for(const e of [want,want+1,want-1,want+2,want-2])
          for(let k=0;k<60;k++){
            const stall=draw().slice(0,6).sort((a,b)=>a.price-b.price);
            if(s4ways(stall,e*100).length)return {kind,budget:e*100,stall};
          }
        const stall=draw().slice(0,6).sort((a,b)=>a.price-b.price);   // (never needed so far) money = three of the products
        return {kind,budget:sum(stall.slice(0,3).map(x=>x.price))*2,stall};
      }
      const pool=draw();
      /* the money is just enough (sometimes exactly) or just short, so the child has to add up */
      const items=pool.slice(0,s<3?2:3),total=sum(items.map(x=>x.price));
      const budget=Math.max(100,Math.random()<.5?Math.ceil(total/100)*100+pick([0,100]):Math.floor((total-1)/100)*100);
      return {kind,items,total,budget,yes:budget>=total};
    });
  },
  round(r){r.kind==='shop'?s4shop(r):s4enough(r);},
  label:r=>r.kind==='shop'?`Ξόδεψε όλα τα ${fmt(r.budget)}`:`Φτάνουν ${fmt(r.budget)} για ${r.items.map(x=>fmt(x.price)).join(' + ')};`
};

/* «Έχεις:» with the budget as real notes and coins only: the child counts the sum (it shows only in the help) */
function s4purse(budget){
  const d=el('div',{class:'purse'},`<span>Έχεις:</span>`),pm=el('span',{class:'pm'});
  greedy(budget,PURSE).forEach(v=>pm.append(stillMoney(v)));
  d.append(pm);return d;
}
const verb=p=>p.pl?'κάνουν':'κάνει';

function s4shop({budget,stall}){
  const bought=[];let helpOn=false;
  /* each product at most twice, so the child cannot fill the bag with the one cheap thing */
  const count=x=>bought.filter(y=>y===x).length,full=x=>count(x)>=S4MAX;
  const left=()=>budget-sum(bought.map(x=>x.price)),fits=()=>stall.filter(x=>!full(x)&&x.price<=left());
  /* the ways to spend it all; for the help, the one closest to what is already in the bag */
  const ways=s4ways(stall,budget);
  const best=()=>{const b=stall.map(count);let top=ways[0],score=-1;
    ways.forEach(w=>{const s=sum(w.map((k,i)=>Math.min(k,b[i])));if(s>score){score=s;top=w;}});return top;};
  const intro=()=>say('Μέτρησε τα χρήματά σου. Αγόρασε φρούτα και λαχανικά, ώστε να ξοδέψεις όλα τα χρήματα. Κάθε προϊόν μπορείς να το πάρεις έως 2 φορές.');
  intro();

  const box=el('div',{class:'grocer'});
  /* spent/left (and the greyed-out products) is extra help: hidden until the child taps «Βοήθεια»; the same button hides it again */
  let meterOn=false;
  const top=el('div',{class:'grocertop'}),help=el('button',{class:'helpbtn',type:'button','aria-pressed':'false'},'💡 Βοήθεια');
  top.append(s4purse(budget),help);box.append(top);
  const meter=el('div',{class:'budget',hidden:''},`<div class="nums"><span>Ξόδεψες: <b class="sp"></b></span><span>Έμειναν: <b class="lf"></b></span></div><div class="track"><i></i></div>`);
  const setMeter=on=>{
    meterOn=on;meter.hidden=!on;
    help.textContent=on?'✕ Κλείσε':'💡 Βοήθεια';help.setAttribute('aria-pressed',String(on));
    help.setAttribute('aria-label',on?'Κλείσε τη βοήθεια':'Βοήθεια: δες πόσα ξόδεψες και πόσα έμειναν');help.classList.toggle('on',on);
    render();
  };
  const showMeter=byChild=>{
    if(meterOn)return;setMeter(true);
    if(byChild){
      const m=G.extra.meter=G.extra.meter||[];if(!m.includes(G.round))m.push(G.round);   // counted once per round
      track('help_button',{stage:4,round:G.round+1});
      say('Δες πόσα ξόδεψες και πόσα σου έμειναν. Ό,τι είναι γκρι δεν το φτάνουν τα χρήματα.');
    }
  };
  help.onclick=()=>{
    if(G.busy)return;
    if(!meterOn)return showMeter(true);
    setMeter(false);intro();
  };
  const bag=el('div',{class:'bag','aria-label':'Σακούλα. Πάτα ένα προϊόν για να το βγάλεις.'});
  box.append(meter,bag);$('#area').append(box);

  const st=el('div',{class:'stall'});
  const tiles=stall.map(x=>{
    const t=el('button',{class:'stallitem',type:'button','aria-label':`${x.p.name}, ${fmt(x.price)}`},`${productHTML(x.p,G.mode)}<span class="tag">${fmt(x.price)}</span><span class="max">έως ${S4MAX}</span>`);
    t.onclick=()=>buy(x,t);st.append(t);return t;
  });
  $('#tray').append(st);   // no «Τέλος»: the round ends by itself when all the money is spent

  function render(){
    const l=left();
    meter.querySelector('.sp').textContent=fmt(budget-l);meter.querySelector('.lf').textContent=fmt(l);
    meter.querySelector('.track i').style.width=(l*100/budget)+'%';
    /* visual help (2nd mistake): in the bag, what to take out glows; on the stall, what to take */
    const w=helpOn?best():null,seen=stall.map(()=>0);
    bag.innerHTML='';
    if(!bought.length)bag.append(el('span',{class:'empty'},'Πάτα ένα προϊόν για να το αγοράσεις.'));
    bought.forEach((x,i)=>{
      const k=stall.indexOf(x),extra=w&&++seen[k]>w[k];
      const b=el('button',{class:'bought'+(extra?' glow':''),type:'button','aria-label':`${x.p.name}. Πάτα για να το βγάλεις.`},prodIcon(x.p));
      b.onclick=()=>{if(G.busy)return;bought.splice(i,1);render();};bag.append(b);
    });
    const f=fits();
    /* a product taken twice is always marked (that is the rule, not a help); with «Βοήθεια» what no longer fits turns grey */
    tiles.forEach((t,k)=>{const ok=f.includes(stall[k]),mx=full(stall[k]);
      t.classList.toggle('maxed',mx);t.querySelector('.max').textContent=mx?`✓ ${S4MAX} φορές`:`έως ${S4MAX}`;
      t.classList.toggle('cant',meterOn&&!ok&&!mx);t.classList.toggle('glow',!!w&&count(stall[k])<w[k]);});
  }
  render();

  function buy(x,t){
    if(G.busy)return;
    if(full(x))return nudge(t),say(`Πήρες ήδη ${S4MAX} φορές ${x.p.acc}. Διάλεξε κάτι άλλο.`);   // a reminder of the rule, not a mistake
    if(x.price>left())return miss(t,`πήγε να πάρει ${x.p.name} (${fmt(x.price)}) ενώ έμεναν ${fmt(left())}`,`Δεν φτάνουν τα χρήματα. Έμειναν <b>${fmt(left())}</b>. ${x.p.nom} ${verb(x.p)} <b>${fmt(x.price)}</b>.`,
      `Δεν φτάνουν τα χρήματα. Έμειναν ${spoken(left())}. ${x.p.nom} ${verb(x.p)} ${spoken(x.price)}.`);
    bought.push(x);render();
    if(!left())return roundOk(`${pick(PRAISE[4])} Ξόδεψες όλα τα χρήματα: <b>${sumText()}</b>.`,`${pick(PRAISE[4])} Ξόδεψες όλα τα χρήματα.`,0,true);
    /* money is left but nothing fits: this way the money cannot all be spent */
    if(!fits().length)return miss(bag,`έμειναν ${fmt(left())} που δεν έφταναν για τίποτα`,
      `Έμειναν <b>${fmt(left())}</b> και δεν φτάνουν για τίποτα. Βγάλε κάτι από τη σακούλα και διάλεξε κάτι άλλο, για να ξοδέψεις όλα τα χρήματα.`);
  }
  /* «€0,80 + €1,20 + … = €5» */
  const sumText=()=>`${bought.slice().sort((a,b)=>a.price-b.price).map(x=>fmt(x.price)).join(' + ')} = ${fmt(budget)}`;
  function miss(node,what,html,voice){
    nudge(node);
    const step=roundMiss(what);
    if(step===1)return say(html,voice);
    if(step===2){
      helpOn=true;render();
      return say(bag.querySelector('.glow')?'Δες τι λάμπει. Βγάλε από τη σακούλα ό,τι λάμπει και πάρε ό,τι λάμπει στον πάγκο.':'Δες τι λάμπει στον πάγκο. Με αυτά ξοδεύεις όλα τα χρήματα.');
    }
    /* show: a way to spend it all, as close as possible to what the child had chosen */
    const w=best();helpOn=false;bought.length=0;
    stall.forEach((x,k)=>{for(let j=0;j<w[k];j++)bought.push(x);});
    showMeter(false);render();
    roundShown(`Δες: <b>${sumText()}</b>. Έτσι ξοδεύεις όλα τα χρήματα.`,'Δες. Έτσι ξοδεύεις όλα τα χρήματα.');
  }
}

/* «€5,30», «5.3», «5» → cents; anything else → NaN */
function parseEuro(s){
  const m=String(s).replace(/€|\s/g,'').replace('.',',').match(/^(\d{1,3})(?:,(\d{1,2}))?$/);
  return m?+m[1]*100+(m[2]?+m[2].padEnd(2,'0'):0):NaN;
}

/* «Φτάνουν;» in two steps: the child first writes how much money there is and how much the products make together,
   then answers yes/no. Each sum: a hint after a wrong try, the right number filled in after the second. */
function s4enough({items,total,budget,yes}){
  const sayWrite=()=>say('Μέτρησε τα χρήματά σου και πρόσθεσε τις τιμές. Γράψε τα ποσά από κάτω.');
  sayWrite();
  const box=el('div',{class:'grocer'});
  box.append(s4purse(budget));
  const row=el('div',{class:'wants'});
  items.forEach(x=>row.append(el('div',{class:'stallitem static'},`${productHTML(x.p,G.mode)}<span class="tag">${fmt(x.price)}</span>`)));
  /* the two sums the child writes */
  const sums=el('div',{class:'sums'});
  const field=(key,label,want)=>{
    const f=el('label',{class:'sum'},`<span>${label}</span><span class="eur">€</span>`);
    const inp=el('input',{type:'text',inputmode:'decimal',autocomplete:'off',enterkeyhint:'done','aria-label':`${label} (σε ευρώ)`,placeholder:'0'});
    f.append(inp);sums.append(f);
    return {key,label,want,inp,f,tries:0,ok:false};
  };
  const F=[field('have','Έχεις:',budget),field('cost','Κάνουν μαζί:',total)];
  const check=el('button',{class:'btn pay',type:'button'},'Έλεγχος');
  sums.append(check);
  /* visual help: the total next to the money, as two bars */
  const mx=Math.max(total,budget);
  const cmp=el('div',{class:'cmp',hidden:''},
    `<div><span>Κάνουν μαζί</span><i style="width:${total*100/mx}%"></i><b>${fmt(total)}</b></div><div><span>Έχεις</span><i class="have" style="width:${budget*100/mx}%"></i><b>${fmt(budget)}</b></div>`);
  box.append(row,cmp);$('#area').append(box);

  /* the sums are written in the tray; once both are right the yes/no buttons take their place */
  const w=el('div',{class:'choices',hidden:''});
  const bY=el('button',{class:'choice',type:'button',disabled:''},'<span class="yn yes" aria-hidden="true">✓</span> Ναι, φτάνουν'),bN=el('button',{class:'choice',type:'button',disabled:''},'<span class="yn no" aria-hidden="true">✕</span> Όχι, δεν φτάνουν');
  w.append(bY,bN);$('#tray').append(sums,w);

  const lock=x=>{x.ok=true;x.inp.value=fmt(x.want).slice(1);x.inp.readOnly=true;x.f.classList.remove('glow');x.f.classList.add('done');};
  function checkSums(){
    if(G.busy)return;
    const hints=[];
    F.filter(x=>!x.ok).forEach(x=>{
      const v=parseEuro(x.inp.value);
      if(v===x.want)return lock(x);
      x.tries++;nudge(x.f);
      roundMiss(`έγραψε «${x.label.replace(':','')} ${x.inp.value.trim()?'€'+x.inp.value.trim():'(κενό)'}» αντί για ${fmt(x.want)}`);
      if(x.tries>=2){lock(x);x.f.classList.add('shown');return;}   // second wrong try: the number is written in for the child
      x.f.classList.add('glow');
      hints.push(x.key==='have'?'Ξαναμέτρησε τα χρήματα που έχεις.':`Ξαναπρόσθεσε τις τιμές: ${items.map(i=>fmt(i.price)).join(' + ')}.`);
    });
    if(F.every(x=>x.ok)){
      sums.remove();w.hidden=false;[bY,bN].forEach(b=>b.disabled=false);
      say(`Έχεις <b>${fmt(budget)}</b> και κάνουν μαζί <b>${fmt(total)}</b>. Φτάνουν τα χρήματα;`);   // no focus on «Ναι»: its ring would look like a hint
    }else say(hints.length?hints.join(' '):'Δες ξανά το ποσό που λείπει.');
  }
  check.onclick=checkSums;
  F.forEach(x=>x.inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkSums();}}));

  const right=yes?bY:bN,why=`Μαζί κάνουν <b>${fmt(total)}</b>. Έχεις <b>${fmt(budget)}</b>. ${yes?'Φτάνουν.':'Δεν φτάνουν.'}`,
    whyV=`Μαζί κάνουν ${spoken(total)}. Έχεις ${spoken(budget)}. ${yes?'Φτάνουν.':'Δεν φτάνουν.'}`;
  let wrongAnswers=0;   // the yes/no answer has its own help ladder, so mistakes in the sums do not jump it ahead
  [bY,bN].forEach(b=>b.onclick=()=>{
    if(G.busy||b.disabled)return;
    if(b===right){cmp.hidden=false;b.classList.add('right');return roundOk(`${pick(PRAISE[4])} ${why}`,`${pick(PRAISE[4])} ${whyV}`,0,true);}
    nudge(b);roundMiss(`απάντησε «${yes?'Όχι':'Ναι'}» (έχει ${fmt(budget)}, κάνουν ${fmt(total)})`);
    const step=++wrongAnswers;
    if(step===1)say(`Κοίτα τα δύο ποσά: έχεις <b>${fmt(budget)}</b>, κάνουν <b>${fmt(total)}</b>. Ποιο είναι μεγαλύτερο;`);
    else if(step===2){cmp.hidden=false;say('Δες τις γραμμές. Αν το «Έχεις» είναι ίδιο ή μεγαλύτερο, φτάνουν.');}
    else{cmp.hidden=false;right.classList.add('glow','right');roundShown(why,whyV);}
  });
}
