/* Παράθυρο ανακοίνωσης νέου παιχνιδιού.
   Εμφανίζεται κάθε φορά που ανοίγει ένα παιχνίδι και κλείνει με το Χ (πάνω αριστερά), με κλικ έξω από το παράθυρο ή με Esc.
   Μπαίνει στα παιχνίδια με ένα <script src=".../assets/js/new-game-popup.js"></script> πριν το </body>.
   Για να σταματήσει να εμφανίζεται, αρκεί να αφαιρεθεί αυτό το script από τα παιχνίδια (ή να αλλάξει η σταθερά ENABLED). */
(function () {
  var ENABLED = true;
  if (!ENABLED || window.__lfNewGamePopup) return;
  window.__lfNewGamePopup = true;

  var script = document.currentScript;
  var base = script && script.src ? script.src : location.href;
  /* τα παιχνίδια της ανακοίνωσης: δύο, ένα σε κάθε μισό του παραθύρου */
  var GAMES = [
    { name: 'Διάκριση Συμφώνων', img: new URL('../images/diakrisi-epipeda.jpg', base).href, alt: 'Διάκριση Συμφώνων – τα 14 επίπεδα του παιχνιδιού' },
    { name: 'Βουτιά Συγκέντρωσης', img: new URL('../images/prosoxi-sygkentrosi.jpg', base).href, alt: 'Βουτιά Συγκέντρωσης – ο χάρτης του βυθού με τους έξι στάθμους' }
  ];

  var css = [
    '.lf-np-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(26,26,46,.62);font-family:"Segoe UI",system-ui,-apple-system,Arial,sans-serif;animation:lf-np-fade .25s ease-out}',
    '.lf-np-card{position:relative;box-sizing:border-box;width:min(880px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#fff;color:#2d2a4a;border-radius:20px;padding:30px 28px 24px;box-shadow:0 20px 60px rgba(0,0,0,.35);text-align:center}',
    '.lf-np-close{position:absolute;top:10px;left:10px;width:40px;height:40px;border:none;border-radius:50%;background:#f0eefc;color:#6C63FF;font-size:24px;font-weight:700;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit}',
    '.lf-np-close:hover,.lf-np-close:focus-visible{background:#6C63FF;color:#fff;outline:none}',
    '.lf-np-title{margin:6px 0 12px;font-size:1.6rem;font-weight:800;line-height:1.2;color:#4b3fb5}',
    '.lf-np-games{display:flex;align-items:flex-start}',
    '.lf-np-game{flex:1 1 0;min-width:0;padding:0 14px}',
    '.lf-np-game+.lf-np-game{border-left:2px solid #ece9fb}',
    '.lf-np-gname{margin:12px 0 0;font-size:1.1rem;font-weight:800;line-height:1.3;color:#2d2a4a}',
    '@media (max-width:640px){.lf-np-card{padding-top:56px}.lf-np-games{flex-direction:column;align-items:stretch;gap:18px}.lf-np-game{padding:0 4px}.lf-np-game+.lf-np-game{border-left:0;border-top:2px solid #ece9fb;padding-top:18px}}',
    '.lf-np-img{display:block;width:100%;height:auto;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.15)}',
    '@keyframes lf-np-fade{from{opacity:0}to{opacity:1}}',
    '@media (max-height:560px){.lf-np-card{padding:22px 20px 16px}.lf-np-title{font-size:1.3rem}.lf-np-gname{font-size:1rem;margin-top:8px}}'
  ].join('\n');

  function show() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.className = 'lf-np-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'lf-np-title');

    var card = document.createElement('div');
    card.className = 'lf-np-card';

    var close = document.createElement('button');
    close.className = 'lf-np-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Κλείσιμο');
    close.textContent = '✕';

    var title = document.createElement('h2');
    title.className = 'lf-np-title';
    title.id = 'lf-np-title';
    title.textContent = 'Δύο νέα παιχνίδια!';

    var row = document.createElement('div');
    row.className = 'lf-np-games';
    GAMES.forEach(function (g) {
      var box = document.createElement('div');
      box.className = 'lf-np-game';
      var img = document.createElement('img');
      img.className = 'lf-np-img';
      img.src = g.img;
      img.alt = g.alt;
      var name = document.createElement('p');
      name.className = 'lf-np-gname';
      name.textContent = g.name;
      box.appendChild(img);
      box.appendChild(name);
      row.appendChild(box);
    });

    card.appendChild(close);
    card.appendChild(title);
    card.appendChild(row);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    close.focus();

    function shut() {
      document.removeEventListener('keydown', onKey, true);
      overlay.remove();
      style.remove();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); shut(); }
    }
    close.addEventListener('click', shut);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) shut(); });
    document.addEventListener('keydown', onKey, true);
  }

  if (document.body) show();
  else document.addEventListener('DOMContentLoaded', show);
})();
