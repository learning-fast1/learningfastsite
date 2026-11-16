/* ============================================================
   DATA — επίπεδα χρημάτων, προϊόντα, τιμές, μαγαζιά, επαίνους
   ============================================================ */
"use strict";

/* teacher's money level: which coins/notes appear; ape() is the wording used in the report (follows σεντ/λεπτά) */
const LEVELS={
  a:{name:()=>'Μόνο ακέραια ευρώ',money:[100,200,500,1000]},
  b:{name:()=>`Ευρώ και ${cents(50)}`,money:[50,100,200,500,1000]},
  c:{name:()=>'Όλα τα κέρματα',money:[1,2,5,10,20,50,100,200,500,1000,2000]}
};
/* (α) whole euros, (β) up to the next 50λ, (γ) the real price */
const priceAt=(c,lvl)=>lvl==='a'?Math.max(100,Math.round(c/100)*100):lvl==='b'?Math.max(50,Math.ceil(c/50)*50):c;

/* prices in cents (realistic for Cyprus); nom/acc for the sentences, e.g. «Η τυρόπιτα κάνει…», «Ορίστε την τυρόπιτα σου» */
const PRODUCTS={
  nero:      {name:'νερό',      emoji:'💧',price:50, nom:'Το νερό',      acc:'το νερό'},
  koulouri:  {name:'κουλούρι',  emoji:'🥨',price:80, nom:'Το κουλούρι',  acc:'το κουλούρι'},
  kroisan:   {name:'κρουασάν',  emoji:'🥐',price:120,nom:'Το κρουασάν',  acc:'το κρουασάν'},
  gala:      {name:'γάλα',      emoji:'🥛',price:150,nom:'Το γάλα',      acc:'το γάλα'},
  psomi:     {name:'ψωμί',      emoji:'🍞',price:120,nom:'Το ψωμί',      acc:'το ψωμί'},
  pita:      {name:'πίτα',      emoji:'🥧',price:180,nom:'Η πίτα',       acc:'την πίτα'},
  pagoto:    {name:'παγωτό',    emoji:'🍦',price:200,nom:'Το παγωτό',    acc:'το παγωτό'},
  bananes:   {name:'μπανάνες',  emoji:'🍌',price:150,nom:'Οι μπανάνες',  acc:'τις μπανάνες',pl:1},
  mila:      {name:'μήλα',      emoji:'🍎',price:190,nom:'Τα μήλα',      acc:'τα μήλα',pl:1},
  ntomates:  {name:'ντομάτες',  emoji:'🍅',price:180,nom:'Οι ντομάτες',  acc:'τις ντομάτες',pl:1},
  portokalia:{name:'πορτοκάλια',emoji:'🍊',price:120,nom:'Τα πορτοκάλια',acc:'τα πορτοκάλια',pl:1},
  agouria:   {name:'αγγούρια',  emoji:'🥒',price:80, nom:'Τα αγγούρια',  acc:'τα αγγούρια',pl:1},
  patates:   {name:'πατάτες',   emoji:'🥔',price:250,nom:'Οι πατάτες',   acc:'τις πατάτες',pl:1},
  karota:    {name:'καρότα',    emoji:'🥕',price:90, nom:'Τα καρότα',    acc:'τα καρότα',pl:1},
  stafylia:  {name:'σταφύλια',  emoji:'🍇',price:280,nom:'Τα σταφύλια',  acc:'τα σταφύλια',pl:1},
  lemonia:   {name:'λεμόνια',   emoji:'🍋',price:95, nom:'Τα λεμόνια',   acc:'τα λεμόνια',pl:1},
  karpouzi:  {name:'καρπούζι',  emoji:'🍉',price:350,nom:'Το καρπούζι',  acc:'το καρπούζι'},
  tyri:      {name:'τυρί',      emoji:'🧀',price:350,nom:'Το τυρί',      acc:'το τυρί'},
  xymos:     {name:'χυμός',     emoji:'🧃',price:90, nom:'Ο χυμός',      acc:'τον χυμό'},
  sokolata:  {name:'σοκολάτα',  emoji:'🍫',price:110,nom:'Η σοκολάτα',   acc:'τη σοκολάτα'},
  karameles: {name:'καραμέλες', emoji:'🍬',price:40, nom:'Οι καραμέλες', acc:'τις καραμέλες',pl:1},
  tetradio:  {name:'τετράδιο',  emoji:'📒',price:150,nom:'Το τετράδιο',  acc:'το τετράδιο'},
  kiromboyies:{name:'κηρομπογιές',emoji:'🖍️',price:250,nom:'Οι κηρομπογιές',acc:'τις κηρομπογιές',pl:1},
  bataries:  {name:'μπαταρίες', emoji:'🔋',price:300,nom:'Οι μπαταρίες', acc:'τις μπαταρίες',pl:1},
  efimerida: {name:'εφημερίδα', emoji:'📰',price:200,nom:'Η εφημερίδα', acc:'την εφημερίδα'},
  periodiko: {name:'περιοδικό', emoji:'📖',price:350,nom:'Το περιοδικό', acc:'το περιοδικό'},
  baketa:    {name:'μπαγκέτα',  emoji:'🥖',price:100,nom:'Η μπαγκέτα',   acc:'την μπαγκέτα'},
  ntonat:    {name:'ντόνατ',    emoji:'🍩',price:120,nom:'Το ντόνατ',    acc:'το ντόνατ'},
  kekaki:    {name:'κεκάκι',    emoji:'🧁',price:150,nom:'Το κεκάκι',    acc:'το κεκάκι'},
  biskoto:   {name:'μπισκότο',  emoji:'🍪',price:80, nom:'Το μπισκότο',  acc:'το μπισκότο'},
  glyko:     {name:'γλυκό',     emoji:'🍰',price:280,nom:'Το γλυκό',     acc:'το γλυκό'},
  pitsa:     {name:'πίτσα',     emoji:'🍕',price:250,nom:'Η πίτσα',      acc:'την πίτσα'},
  santouits: {name:'σάντουιτς', emoji:'🥪',price:280,nom:'Το σάντουιτς', acc:'το σάντουιτς'}
};
/* products with a picture in img/food/<id>.png; the rest show their emoji until a picture arrives */
const FOODIMG=['gala','glyko','biskoto','pita','pitsa','tyri','psomi','sokolata','efimerida','karameles','kekaki','kiromboyies',
  'koulouri','kroisan','baketa','bataries','nero','ntonat','pagoto','santouits','tetradio','xymos','periodiko','agouria','karota','karpouzi','lemonia','mila','bananes','ntomates','patates','stafylia','portokalia'];
for(const id in PRODUCTS){PRODUCTS[id].id=id;if(FOODIMG.includes(id))PRODUCTS[id].img=`img/food/${id}.png`;}
FOODIMG.forEach(id=>{new Image().src=PRODUCTS[id].img;});

/* the six shops of the map; a shop is playable once its js/games/stageN.js is loaded */
const SHOPS=[
  {n:1,emoji:'🏦',name:'Το Πορτοφόλι',     sub:'Αναγνωρίζω τα χρήματα',col:'#8DB9D8'},
  {n:2,emoji:'🥖',name:'Ο Φούρνος',        sub:'Η λίστα αγορών',      col:'#E2B877'},
  {n:3,emoji:'🍦',name:'Το Περίπτερο',     sub:'Πληρώνω ακριβώς',      col:'#E8A3B4'},
  {n:4,emoji:'🍎',name:'Το Μανάβικο',      sub:'Φτάνουν τα χρήματα;',  col:'#93C48B'},
  {n:5,emoji:'🛒',name:'Η Υπεραγορά',      sub:'Σύνολο και ρέστα',     col:'#A3ADE2'},
  {n:6,emoji:'💬',name:'Μιλάω στον Ταμία', sub:'Λέω το σωστό',         col:'#C9A6DA'}
];
SHOPS.forEach(s=>{s.img=`img/shops/${s.n}.png`;});   // a picture per shop for the top bar, the setup and the cashier talk/* «Τελείωσες το Περίπτερο» */
const SHOPACC={1:'το Πορτοφόλι',2:'τον Φούρνο',3:'το Περίπτερο',4:'το Μανάβικο',5:'την Υπεραγορά',6:'τη συζήτηση με τον ταμία'};

const PRAISE={
  1:['Μπράβο!','Σωστά!','Πολύ καλά!','Τέλεια!','Ναι, αυτό είναι!','Πολύ ωραία!'],
  2:['Μπράβο! Τα πήρες όλα!','Τέλεια! Το καλάθι είναι έτοιμο!','Πολύ ωραία ψώνια!','Σωστά! Όλα από τη λίστα!'],
  4:['Μπράβο! Υπολόγισες σωστά!','Τέλεια!','Πολύ καλά!','Σωστά!','Πολύ ωραία!'],
  5:['Σωστά ρέστα!','Μπράβο!','Τέλεια!','Πολύ προσεκτικά!','Σωστά!'],
  6:['Μπράβο, πολύ ευγενικά!','Τέλεια! Αυτό ταιριάζει!','Πολύ ωραία το είπες!','Σωστά!'],
  3:['Τέλεια πληρωμή!','Μπράβο, ακριβώς!','Σωστό ποσό!','Πολύ ωραία!','Τα κατάφερες!']
};
