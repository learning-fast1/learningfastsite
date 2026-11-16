/* ============================================================
   STAGE 3 — Το Περίπτερο: ακριβής πληρωμή
   ============================================================ */
"use strict";

const KIOSK=['nero','karameles','koulouri','xymos','sokolata','kroisan','gala','tetradio','pita','pagoto','kiromboyies','bataries','efimerida','periodiko'];
/* the wallet holds as many of each coin as the child needs; the 5 € note is there on purpose (it overpays) */
const WALLET3={a:[100,200,500],b:[50,100,200,500],c:[1,2,5,10,20,50,100,200]};

STAGE[3]={
  setup(lvl){
    /* one product per different price first, so level (α) is not ten times «1 €»; then cheap → dear */
    const by={};
    shuffle(KIOSK.slice()).forEach(id=>{const price=priceAt(PRODUCTS[id].price,lvl);(by[price]=by[price]||[]).push({p:PRODUCTS[id],price});});
    const groups=Object.values(by),out=[];
    while(out.length<ROUNDS)for(const g of groups)if(g.length&&out.length<ROUNDS)out.push(g.pop());
    return out.sort((a,b)=>a.price-b.price);
  },
  round(r){s3round(r);},
  label:r=>`Πλήρωσε ${fmt(r.price)} (${r.p.name})`
};

function s3round({p,price}){
  const W=WALLET3[G.lvl];let placed=[],helpOn=false;
  say(`${p.nom} ${p.pl?'κάνουν':'κάνει'} <b>${fmt(price)}</b>. Βάλε τα χρήματα στον πάγκο.`,`${p.nom} ${p.pl?'κάνουν':'κάνει'} ${spoken(price)}. Βάλε τα χρήματα στον πάγκο.`);

  const box=el('div',{class:'kiosk'});
  box.innerHTML=`<div class="product">${productHTML(p,G.mode)}<span class="tag">${fmt(price)}</span></div>
<div class="counter" data-drop="counter" aria-label="Πάγκος"></div>
<div class="paybar"><div class="nums"><span>Έβαλες: <b class="s3sum"></b></span><span>Χρειάζεται: <b>${fmt(price)}</b></span></div>
<div class="track"><i></i>${price>100?Array.from({length:Math.ceil(price/100)-1},(_,k)=>`<b class="tick" style="left:${(k+1)*10000/price}%"></b>`).join(''):''}</div></div>`;
  $('#area').append(box);
  const counter=box.querySelector('.counter'),track=box.querySelector('.track');

  const wallet=el('div',{class:'wallet','aria-label':'Πορτοφόλι. Σύρε ή πάτα ένα κέρμα για να το βάλεις στον πάγκο.'});
  W.forEach(v=>{const b=moneyBtn(v);draggable(b,{onDrop:()=>add(v),onTap:()=>add(v)});wallet.append(b);});
  const pay=el('button',{class:'btn pay',type:'button'},'Πλήρωσε');pay.onclick=payNow;
  $('#tray').append(wallet,pay);

  function add(v){if(G.busy)return;placed.push(v);render(true);}
  function render(landed){
    counter.innerHTML='';
    const fix=helpOn?s3fix(placed,price,W):null,mark=fix?fix.out.slice():[];
    if(!placed.length&&!fix)counter.append(el('span',{class:'empty'},'Σύρε εδώ τα χρήματα'));
    placed.forEach((v,i)=>{
      const b=moneyBtn(v,.82);b.setAttribute('aria-label',nameShort(v)+'. Πάτα για να το βγάλεις.');
      const m=mark.indexOf(v);if(m>=0){mark.splice(m,1);b.classList.add('glow');}
      if(landed&&i===placed.length-1&&!RM)b.classList.add('land');
      b.onclick=()=>{if(G.busy)return;placed.splice(i,1);render(false);};
      counter.append(b);
    });
    const s=sum(placed);
    box.querySelector('.s3sum').textContent=fmt(s);
    track.firstChild.style.width=Math.min(100,s*100/price)+'%';
    track.classList.toggle('over',s>price);track.classList.toggle('exact',s===price);
    /* visual help (2nd wrong try): what to take out glows on the counter, what to add glows in the wallet and waits as a shadow on the counter */
    wallet.querySelectorAll('.money').forEach(b=>b.classList.toggle('glow',!!fix&&fix.add.includes(+b.dataset.v)));
    if(fix)fix.add.forEach(v=>{const g=moneyBtn(v,.82);g.classList.add('shadow');g.disabled=true;g.setAttribute('aria-hidden','true');counter.append(g);});
  }
  render(false);

  function payNow(){
    if(G.busy)return;const s=sum(placed);
    if(s===price){
      helpOn=false;render(false);
      return roundOk(`${pick(PRAISE[3])} Ορίστε ${p.acc} σου.`,`${pick(PRAISE[3])} Ορίστε ${p.acc} σου.`);
    }
    nudge(counter);
    const step=roundMiss(s?`έβαλε ${fmt(s)}`:'πάτησε «Πλήρωσε» χωρίς χρήματα'),d=price-s;
    if(step===1){
      if(!s)say('Ο πάγκος είναι άδειος. Σύρε χρήματα από το πορτοφόλι.');
      else if(d>0)say(`Λείπουν ακόμη <b>${fmt(d)}</b>. Βάλε κι άλλα.`,`Λείπουν ακόμη ${spoken(d)}. Βάλε κι άλλα.`);
      else say(`Έβαλες <b>${fmt(-d)}</b> παραπάνω. Πάτα ένα κέρμα στον πάγκο για να το βγάλεις.`,`Έβαλες ${spoken(-d)} παραπάνω. Πάτα ένα κέρμα στον πάγκο για να το βγάλεις.`);
    }else if(step===2){
      helpOn=true;render(false);
      const f=s3fix(placed,price,W);
      say(f.out.length?'Βγάλε ό,τι λάμπει στον πάγκο. Βάλε ό,τι λάμπει στο πορτοφόλι.':'Βάλε στον πάγκο τα κέρματα που λάμπουν.');
    }else{
      helpOn=false;placed=greedy(price,W);render(false);
      roundShown(`Δες: ${placed.map(nameShort).join(' + ')} = <b>${fmt(price)}</b>.`,`Δες. ${placed.map(spoken).join(', και ')}. Μαζί κάνουν ${spoken(price)}.`);
    }
  }
}

/* what to take off the counter (out) and add from the wallet (add) to reach the price exactly */
function s3fix(placed,price,W){
  const keep=placed.slice(),out=[];let s=sum(keep);
  while(s>price){
    const big=keep.filter(v=>v>=s-price),v=big.length?Math.min(...big):Math.max(...keep);
    keep.splice(keep.indexOf(v),1);out.push(v);s-=v;
  }
  return {out,add:greedy(price-s,W)};
}
