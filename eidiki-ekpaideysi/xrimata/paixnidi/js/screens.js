/* ============================================================
   SCREENS — αρχική (ρυθμίσεις + χάρτης), αποτελέσματα
   ============================================================ */
"use strict";

const SETTINGS=[
  {key:'money',title:'Επίπεδο χρημάτων',opts:[
    ['a',LEVELS.a.name,[100,200,500]],['b',LEVELS.b.name,[50,100,200]],['c',LEVELS.c.name,[5,20,100,200]]]},
  /* only the Φούρνος has a shopping list */
  {key:'list',title:'Λίστα αγορών',only:2,opts:[['img','Εικόνα'],['imgword','Εικόνα και λέξη'],['word','Μόνο λέξη']]}
];

function renderHome(){
  $('#hst').innerHTML=stelios(true);
  const map=$('#map');map.innerHTML='';
  SHOPS.forEach(s=>{
    const ready=!!STAGE[s.n],done=!!store.done[s.n];
    const b=el('button',{type:'button',class:'shop',style:`--c:${s.col}`,'aria-label':`${s.n}. ${s.name}: ${s.sub}${done?'. Ολοκληρώθηκε':''}${ready?'':'. Έρχεται σύντομα'}`},
      `<span class="awn" aria-hidden="true"></span><span class="ttl"><span class="num">${s.n}</span><b>${s.name}</b></span><small>${s.sub}</small>`+
      (done?'<span class="star" aria-hidden="true">⭐</span>':'')+(ready?'':'<span class="soon">Σύντομα</span>'));
    if(ready)b.onclick=()=>openSetup(s.n);else b.disabled=true;
    map.append(b);
  });
}

/* a shop picked on the map: the teacher checks the settings, then «Ξεκίνα» starts its stage */
let setupShop=null;
function openSetup(n){
  const s=SHOPS[n-1];setupShop=n;
  $('#setupimg').src=s.img;$('#setuptitle').textContent=s.name;
  renderSettings();
  $('#setup').hidden=false;$('#setupgo').focus({preventScroll:true});
}
const closeSetup=()=>{$('#setup').hidden=true;setupShop=null;};
$('#setupback').onclick=closeSetup;
$('#setupgo').onclick=()=>{const n=setupShop;closeSetup();startStage(n);};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#setup').hidden)closeSetup();});

function renderSettings(){
  const box=$('#settings');box.innerHTML='';
  SETTINGS.filter(s=>!s.only||s.only===setupShop).forEach(s=>{
    const g=el('div',{class:'setgroup',role:'radiogroup','aria-label':s.title});
    g.append(el('h3',{},s.title));
    const seg=el('div',{class:'seg'});
    s.opts.forEach(([val,label,coins])=>{
      const b=el('button',{type:'button',role:'radio','aria-checked':String(store.settings[s.key]===val)},
        `<span>${typeof label==='function'?label():label}</span>${coins?`<span class="mini">${coins.map(v=>moneyImg(v).replace('<img ',`<img class="${isNote(v)?'n':'c'}" `)).join('')}</span>`:''}`);
      b.onclick=()=>{store.settings[s.key]=val;save();renderSettings();box.querySelector(`[aria-label="${s.title}"] [aria-checked="true"]`).focus({preventScroll:true});};
      seg.append(b);
    });
    g.append(seg);box.append(g);
  });
}

/* σεντ or λεπτά: the window at start and the top-left buttons */
function syncUnit(){document.querySelectorAll('[data-unit-open]').forEach(b=>{b.innerHTML=`<img src="img/money/50.png" alt=""> ${centsWord()}`;b.setAttribute('aria-label',`Κέρματα: ${centsWord()}. Πάτα για αλλαγή.`);});}
function askUnit(){
  $('#ust').innerHTML=stelios();
  document.querySelectorAll('#unitask [data-unit]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.unit===store.settings.unit)));
  $('#unitask').hidden=false;
  $(`#unitask [data-unit="${store.settings.unit}"]`).focus({preventScroll:true});
}
document.querySelectorAll('#unitask [data-unit]').forEach(b=>b.onclick=()=>{
  store.settings.unit=b.dataset.unit;save();$('#unitask').hidden=true;syncUnit();
  track('unit_choice',{unit:b.dataset.unit});
  if($('#home').classList.contains('on'))renderHome();
  else if(G&&!G.busy)nextRound();   // redraw the round in progress with the new word
});
document.querySelectorAll('[data-unit-open]').forEach(b=>b.onclick=askUnit);

$('#tomap').onclick=leaveStage;

function renderResult(n){
  $('#rst').innerHTML=stelios();
  $('#restitle').textContent='Μπράβο!';
  $('#ressub').textContent=G.practice?'Ξαναδούλεψες τα λάθη σου!':`Τελείωσες ${SHOPACC[n]}. Πήρες ένα αυτοκόλλητο για τον χάρτη!`;
  const rd=$('#rdots');rd.innerHTML='';
  G.log.forEach((r,i)=>rd.append(el('i',{class:'h'+r.help,title:`Γύρος ${i+1}: ${HELPWORD[r.help]}`})));
  const bad=renderReport(n);

  /* replay only the rounds that went wrong, with the same amounts and products */
  const redo=$('#redobtn'),items=bad.map(r=>G.items[r.i]),lvl=G.lvl;
  redo.hidden=!items.length;
  redo.textContent=`🔁 Ξαναπαίξε τα λάθη (${items.length})`;
  redo.onclick=()=>startStage(n,{lvl,items:STAGE[n].practice?STAGE[n].practice(items):items.map(r=>Object.assign({},r))});
  $('#againbtn').onclick=()=>startStage(n);
  $('#mapbtn').onclick=leaveStage;
}
