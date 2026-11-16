/* ============================================================
   STAGE 2 — Ο Φούρνος: λίστα αγορών
   ============================================================ */
"use strict";

const BAKERY=['psomi','koulouri','pita','kroisan','tyri','baketa','ntonat','kekaki','biskoto','glyko','pitsa','santouits','gala'];

/* the list grows from 3 to 6 products; the shelf adds 2–3 products that are not on it */
STAGE[2]={
  setup(){
    return [3,3,4,4,4,5,5,5,6,6].map((n,i)=>{
      const pool=shuffle(BAKERY.slice()),list=pool.slice(0,n),shelf=shuffle(pool.slice(0,n+(i<2?2:3)));
      return {list:list.map(id=>PRODUCTS[id]),shelf:shelf.map(id=>PRODUCTS[id])};
    });
  },
  round(r){s2round(r);},
  label:r=>`Λίστα: ${r.list.map(p=>p.name).join(', ')}`
};

function s2round({list,shelf}){
  const got=new Set();
  const names=listAnd(list.map(p=>p.name));
  /* with pictures the list is read aloud; «μόνο λέξη» is a reading task, so the words are not */
  say('Βάλε στο καλάθι <b>μόνο</b> όσα γράφει η λίστα.',G.mode==='word'?'Διάβασε τη λίστα. Βάλε στο καλάθι μόνο όσα γράφει.':`Βάλε στο καλάθι: ${names}.`);

  const box=el('div',{class:'bakery'});
  const note=el('div',{class:'shoplist','aria-label':'Λίστα αγορών'},'<h3>Λίστα</h3>');
  const ul=el('ul');
  const rows=list.map(p=>{
    const li=el('li',{},`<span class="tick" aria-hidden="true"></span>${productHTML(p,G.mode)}`);
    ul.append(li);return li;
  });
  note.append(ul);
  const basket=el('div',{class:'basket','data-drop':'basket','aria-label':'Καλάθι'},'<span class="bk" aria-hidden="true">🧺</span><div class="inbasket"></div>');
  box.append(note,basket);$('#area').append(box);
  const inb=basket.querySelector('.inbasket');

  const sh=el('div',{class:'shelf','aria-label':'Ράφι. Σύρε ή πάτα ένα προϊόν για να το βάλεις στο καλάθι.'});
  const tiles=shelf.map(p=>{
    const t=el('button',{class:'prod',type:'button','aria-label':p.name},`<span aria-hidden="true">${prodIcon(p)}</span>`);
    draggable(t,{onDrop:()=>take(p,t),onTap:()=>take(p,t)});
    sh.append(t);return t;
  });
  $('#tray').append(sh);

  function put(p,t){
    got.add(p);t.classList.add('taken');t.classList.remove('glow');
    const k=list.indexOf(p);rows[k].classList.add('done');rows[k].classList.remove('glow');
    inb.append(el('span',{class:'inb'+(RM?'':' land'),role:'img','aria-label':p.name},prodIcon(p)));
  }
  /* returns false for a product that is not on the list, so the drag sends it back to the shelf */
  function take(p,t){
    if(G.busy||got.has(p))return;
    if(list.includes(p)){
      put(p,t);
      if(got.size===list.length)roundOk(pick(PRAISE[2]));
      return;
    }
    nudge(t);
    const step=roundMiss(`έβαλε ${p.name} (δεν ήταν στη λίστα)`);
    if(step===1)say(`${p.nom} δεν είναι στη λίστα. Κοίτα ξανά τη λίστα.`);
    else if(step===2){glowNeeded();say('Δες τι λάμπει στο ράφι. Αυτά γράφει η λίστα.');}
    else{
      list.forEach(q=>{if(!got.has(q))put(q,tiles[shelf.indexOf(q)]);});
      roundShown(`Αυτά γράφει η λίστα: <b>${names}</b>.`,`Αυτά γράφει η λίστα: ${names}.`);
    }
    return false;
  }
  function glowNeeded(){list.forEach((q,k)=>{if(!got.has(q)){tiles[shelf.indexOf(q)].classList.add('glow');rows[k].classList.add('glow');}});}
}
