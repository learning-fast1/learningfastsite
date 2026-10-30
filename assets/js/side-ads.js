/* Διαφημίσεις στο πλάι (στις σελίδες των παιχνιδιών).
   Μπαίνει στη σελίδα με ένα <script src=".../assets/js/side-ads.js"></script> πριν το </body>.
   Βρίσκει το .game-detail και βάζει δεξιά του μια στήλη με κάρτες· στα στενά παράθυρα οι κάρτες πάνε από κάτω.
   Για να προσθέσεις ή να αλλάξεις διαφήμιση, άλλαξε μόνο τη λίστα ADS (οι διαδρομές είναι από τη ρίζα του site).
   Για να σταματήσουν να εμφανίζονται, βάλε ENABLED = false. */
(function () {
  var ENABLED = true;
  if (!ENABLED || window.__lfSideAds) return;
  window.__lfSideAds = true;

  var script = document.currentScript;
  var root = new URL('../../', script && script.src ? script.src : location.href);
  function url(p) { return new URL(p, root).href; }

  var ADS = [
    {
      id: 'atzenta',
      title: 'Ατζέντα',
      text: 'Ατζέντα για ειδικούς εκπαιδευτικούς και λογοθεραπεύτριες.',
      img: 'ekpaideftika-vivlia/atzenta/preview-eidikou-paidagogou.png',
      href: 'ekpaideftika-vivlia/atzenta/index.html'
    },
    {
      id: 'tetradio-epikoinonias',
      title: 'Τετράδιο Επικοινωνίας',
      text: 'Για την επικοινωνία με τους γονείς: λογοθεραπευτές και ειδικοί παιδαγωγοί.',
      img: 'ekpaideftika-vivlia/tetradio-epikoinonias/preview-eidikou-paidagogou.png',
      href: 'ekpaideftika-vivlia/tetradio-epikoinonias/index.html'
    }
  ];

  var css = [
    '.lf-sa-wrap{display:flex;align-items:flex-start;gap:1.75rem;max-width:1400px;margin:0 auto 4rem;padding:0 1.5rem}',
    '.lf-sa-wrap>.game-detail{flex:1 1 0;min-width:0;max-width:none;margin:0;padding:0}',
    '.lf-sa{flex:0 0 232px;position:sticky;top:90px;display:flex;flex-direction:column;gap:14px}',
    '.lf-sa__head{margin:0;font-size:.8rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#6b6890}',
    '.lf-sa__card{display:block;text-decoration:none;color:#2d2a4a;background:#fff;border:2px solid #ece9fb;border-radius:16px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,.07);transition:transform .15s,box-shadow .15s}',
    '.lf-sa__card:hover,.lf-sa__card:focus-visible{transform:translateY(-3px);box-shadow:0 10px 24px rgba(108,99,255,.25);outline:none}',
    '.lf-sa__img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;object-position:top;background:#f4f2fd}',
    '.lf-sa__body{padding:10px 12px 12px}',
    '.lf-sa__title{margin:0 0 4px;font-size:1rem;font-weight:800;line-height:1.25}',
    '.lf-sa__text{margin:0;font-size:.88rem;line-height:1.4;color:#4a476a}',
    '@media (max-width:1100px){',
    '.lf-sa-wrap{flex-direction:column;align-items:stretch;gap:2rem}',
    '.lf-sa{flex:none;position:static;flex-direction:row;flex-wrap:wrap}',
    '.lf-sa__head{flex:0 0 100%}',
    '.lf-sa__card{flex:1 1 240px;max-width:340px}',
    '}'
  ].join('\n');

  function build() {
    var detail = document.querySelector('.game-detail');
    if (!detail || !detail.parentNode) return;

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var aside = document.createElement('aside');
    aside.className = 'lf-sa';
    aside.setAttribute('aria-label', 'Επίσης από το Learning Fast');
    var head = document.createElement('p');
    head.className = 'lf-sa__head';
    head.textContent = 'Επίσης από εμάς';
    aside.appendChild(head);

    ADS.forEach(function (ad) {
      var a = document.createElement('a');
      a.className = 'lf-sa__card';
      a.href = url(ad.href);
      a.addEventListener('click', function () {
        if (typeof gtag === 'function') gtag('event', 'side_ad_click', { event_category: 'SideAd', event_label: ad.id });
      });
      var img = document.createElement('img');
      img.className = 'lf-sa__img';
      img.src = url(ad.img);
      img.alt = '';
      img.loading = 'lazy';
      var body = document.createElement('div');
      body.className = 'lf-sa__body';
      var t = document.createElement('p');
      t.className = 'lf-sa__title';
      t.textContent = ad.title;
      var d = document.createElement('p');
      d.className = 'lf-sa__text';
      d.textContent = ad.text;
      body.appendChild(t);
      body.appendChild(d);
      a.appendChild(img);
      a.appendChild(body);
      aside.appendChild(a);
    });

    var wrap = document.createElement('div');
    wrap.className = 'lf-sa-wrap';
    detail.parentNode.insertBefore(wrap, detail);
    wrap.appendChild(detail);
    wrap.appendChild(aside);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
