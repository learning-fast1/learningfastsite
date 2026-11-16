/* ============================================================
   ART — κέρματα, χαρτονομίσματα, κυρ-Στέλιος, προϊόντα
   ============================================================ */
"use strict";

/* pictures of the real money in img/money/: coins are square transparent PNGs named by cents, notes are JPGs */
const moneySrc=v=>`img/money/${v}.${isNote(v)?'jpg':'png'}`;
const moneyImg=v=>`<img src="${moneySrc(v)}" alt="" draggable="false">`;
/* load them all up front, so a new round never shows an empty coin while the picture arrives */
[1,2,5,10,20,50,100,200,500,1000,2000].forEach(v=>{new Image().src=moneySrc(v);});

/* on-screen size in px: coins keep their real order of size, but even 1λ stays a comfortable touch target */
const COINPX={1:62,2:66,5:70,10:68,20:72,50:76,100:74,200:80};
function moneyBtn(v,k=1){
  const b=el('button',{class:'money '+(isNote(v)?'note':'coin'),type:'button','aria-label':nameShort(v),'data-v':v},moneyImg(v));
  b.style.setProperty('--w',Math.round((isNote(v)?128:COINPX[v])*k)+'px');   // css may shrink it with --k on small screens
  return b;
}

/* money that is only shown (the budget, the change the cashier hands over), not picked up */
function stillMoney(v,k=.7){const m=moneyBtn(v,k);m.tabIndex=-1;m.setAttribute('aria-hidden','true');m.classList.add('still');return m;}

/* κυρ-Στέλιος, the friendly cashier: the whole figure on the home screen, a round portrait next to the speech bubble */
const stelios=full=>full
  ?'<img class="st-full" src="img/stelios.png" alt="Ο κυρ-Στέλιος">'
  :'<img class="st-face" src="img/stelios-face.png" alt="Ο κυρ-Στέλιος">';

/* a product's picture (sized in em, so it scales like the emoji it replaces) */
const prodIcon=p=>p.img?`<img class="pimg" src="${p.img}" alt="" draggable="false">`:p.emoji;

/* a product as the teacher chose: picture / picture + word / word only */
function productHTML(p,mode){
  const ico=`<span class="pico" role="img" aria-label="${p.name}">${prodIcon(p)}</span>`,word=`<span class="pword">${p.name}</span>`;
  return mode==='img'?ico:mode==='word'?word:ico+word;
}
