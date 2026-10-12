/* Κωδικός πρόσβασης για το παιχνίδι.
   Το παιχνίδι (data.js, app.js και το παράθυρο ανακοίνωσης) φορτώνει ΜΟΝΟ αφού δοθεί ο σωστός κωδικός.
   Ο κωδικός δεν γράφεται πουθενά στο αρχείο· συγκρίνεται το SHA-256 του. Ο χρήστης θυμάται την είσοδο σε αυτή τη συσκευή.
   Σημείωση: είναι προστασία στον browser (όχι πραγματική ασφάλεια server), αρκεί για να μην μπαίνει κάποιος τυχαία. */
(function () {
  var HASH = '5a50ceeae845fc0e4ad99f7d54e06b4a882d3344db457f9a3b2c39dc7833049d';
  var KEY = 'diakrisi-access';
  var SCRIPTS = ['js/data.js?v=11', 'js/app.js?v=21', '../../../../../assets/js/new-game-popup.js'];

  function loadGame() {
    SCRIPTS.forEach(function (src) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false; // κρατά τη σειρά φόρτωσης
      document.body.appendChild(s);
    });
  }
  function sha256(text) {
    var data = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', data).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }
  function remembered() { try { return localStorage.getItem(KEY) === HASH; } catch (e) { return false; } }
  function remember() { try { localStorage.setItem(KEY, HASH); } catch (e) { /* ok */ } }

  function ask() {
    var box = document.createElement('div');
    box.id = 'gate';
    box.innerHTML =
      '<a class="gate-back" href="/">← Learning Fast</a>' +
      '<form class="gate-card" autocomplete="off">' +
      '<div class="gate-letters"><span class="la">φ</span><span class="lb">β</span></div>' +
      '<h1>Διάκριση Συμφώνων</h1>' +
      '<p>Γράψε τον κωδικό για να μπεις στο παιχνίδι.</p>' +
      '<input class="gate-input" type="password" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Κωδικός" placeholder="Κωδικός">' +
      '<div class="gate-msg" role="alert"></div>' +
      '<button class="gate-btn" type="submit">Είσοδος</button>' +
      '</form>';
    document.body.appendChild(box);
    var form = box.querySelector('form'), input = box.querySelector('input'), msg = box.querySelector('.gate-msg');
    input.focus();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!window.crypto || !crypto.subtle) { msg.textContent = 'Ο browser δεν υποστηρίζει τον έλεγχο κωδικού. Άνοιξε τη σελίδα με https.'; return; }
      sha256(input.value.trim()).then(function (h) {
        if (h === HASH) { remember(); box.remove(); loadGame(); }
        else { msg.textContent = 'Λάθος κωδικός. Δοκίμασε ξανά.'; input.value = ''; input.focus(); }
      });
    });
  }

  function start() { if (remembered()) loadGame(); else ask(); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
