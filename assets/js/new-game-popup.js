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
  var imgUrl = new URL('../images/mathainw-grafw-diavazw.jpg', base).href;

  var css = [
    '.lf-np-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(26,26,46,.62);font-family:"Segoe UI",system-ui,-apple-system,Arial,sans-serif;animation:lf-np-fade .25s ease-out}',
    '.lf-np-card{position:relative;box-sizing:border-box;width:min(560px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#fff;color:#2d2a4a;border-radius:20px;padding:30px 28px 24px;box-shadow:0 20px 60px rgba(0,0,0,.35);text-align:center}',
    '.lf-np-close{position:absolute;top:10px;left:10px;width:40px;height:40px;border:none;border-radius:50%;background:#f0eefc;color:#6C63FF;font-size:24px;font-weight:700;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit}',
    '.lf-np-close:hover,.lf-np-close:focus-visible{background:#6C63FF;color:#fff;outline:none}',
    '.lf-np-title{margin:6px 0 12px;font-size:1.6rem;font-weight:800;line-height:1.2;color:#4b3fb5}',
    '.lf-np-text{margin:0 0 16px;font-size:1rem;line-height:1.55;color:#4a476a;text-align:left}',
    '.lf-np-img{display:block;width:100%;height:auto;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.15)}',
    '@keyframes lf-np-fade{from{opacity:0}to{opacity:1}}',
    '@media (max-height:560px){.lf-np-card{padding:22px 20px 16px}.lf-np-title{font-size:1.3rem}.lf-np-text{font-size:.92rem;margin-bottom:10px}}'
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
    title.textContent = 'Νέο εκπαιδευτικό παιχνίδι!';

    var text = document.createElement('p');
    text.className = 'lf-np-text';
    text.textContent = 'Στα παιχνίδια θα βρείτε το νέο εκπαιδευτικό παιχνίδι "Μαθαίνω να γράφω και να διαβάζω" για παιδιά Α΄ δημοτικού ή για παιδιά με γενικές/ειδικές μαθησιακές δυσκολίες. Στο παιχνίδι τα παιδιά αναγνωρίζουν και εντοπίζουν το κάθε γράμμα, συνθέτουν συλλαβές και λέξεις. Θα το βρείτε στην αρχική οθόνη.';

    var img = document.createElement('img');
    img.className = 'lf-np-img';
    img.src = imgUrl;
    img.alt = 'Μαθαίνω να γράφω και να διαβάζω – η αρχική οθόνη του παιχνιδιού';

    card.appendChild(close);
    card.appendChild(title);
    card.appendChild(text);
    card.appendChild(img);
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
