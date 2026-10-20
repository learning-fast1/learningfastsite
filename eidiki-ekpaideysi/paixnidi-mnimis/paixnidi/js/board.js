/* ============================================================
   BOARD — πλέγμα καρτών: απόδοση, διάταξη, πληκτρολόγιο
   Δεν περιέχει κανόνες παιχνιδιού· διαβάζει την κατάσταση της
   μηχανής (engine) και καλεί onPick(index) όταν επιλέγεται κάρτα.
   ============================================================ */
(function (root) {
  "use strict";

  /* Βρίσκει τις στήλες που δίνουν τη μεγαλύτερη κάρτα χωρίς κύλιση.
     Αν ακόμη και έτσι η κάρτα βγαίνει μικρότερη από minCard, κρατάμε
     λιγότερες στήλες (μεγαλύτερες κάρτες) και επιτρέπουμε κάθετη κύλιση. */
  function bestLayout(n, W, H, gap, maxCard, minCard) {
    let best = null;
    for (let cols = 1; cols <= n; cols++) {
      const rows = Math.ceil(n / cols);
      const size = Math.min((W - (cols - 1) * gap) / cols, (H - (rows - 1) * gap) / rows, maxCard);
      const empty = rows * cols - n;
      const score = size - empty * 3; // προτίμηση σε γεμάτες σειρές
      const shape = Math.abs(Math.log((cols / rows) / (W / H))); // σε ισοβαθμία: σχήμα πλέγματος κοντά στο σχήμα της οθόνης
      if (!best || score > best.score + 0.5 || (score > best.score - 0.5 && shape < best.shape)) best = { cols, rows, size, score, shape };
    }
    if (best.size < minCard) {
      const cols = Math.max(1, Math.min(n, Math.floor((W + gap) / (minCard + gap))));
      const size = Math.min(maxCard, (W - (cols - 1) * gap) / cols);
      best = { cols, rows: Math.ceil(n / cols), size, scroll: true };
    }
    best.size = Math.floor(best.size);
    return best;
  }

  // πίσω όψη: το λογότυπο-κείμενο του LearningFast (ίδιο σε όλες τις κάρτες, δεν αποκαλύπτει τίποτα)
  const BACK_HTML = '<img class="brandmark" src="learning%20fast.png" alt="" draggable="false">';

  function createBoard(gridEl, boardEl, onPick) {
    let game = null, cells = [], layout = null, maxCard = 160, focusIdx = 0;

    function label(i) {
      const n = game.state.cards.length, c = game.state.cards[i];
      const pos = `Κάρτα ${i + 1} από ${n}`;
      if (c.state === 'matched') return `${pos}, ${c.item.name}, βρέθηκε`;
      if (game.isFaceUp(i)) return `${pos}, ${c.item.name}`;
      return `${pos}, κλειστή`;
    }

    function render(g, opts) {
      game = g;
      maxCard = opts.maxCard;
      focusIdx = 0;
      gridEl.innerHTML = '';
      cells = g.state.cards.map((c, i) => {
        const b = document.createElement('button');
        b.className = 'card';
        b.type = 'button';
        b.tabIndex = i === 0 ? 0 : -1;
        b.dataset.i = i;
        b.innerHTML =
          '<span class="inner"><span class="face back">' + BACK_HTML + '</span>' +
          '<span class="face front"><img alt="" draggable="false" decoding="async"><span class="tick" aria-hidden="true">✓</span></span></span>';
        b.querySelector('.front img').src = c.item.src;
        b.addEventListener('click', () => { focusIdx = i; onPick(i); });
        b.addEventListener('focus', () => { focusIdx = i; setRoving(i); });
        gridEl.appendChild(b);
        return b;
      });
      layoutNow();
      update();
    }

    function setRoving(i) {
      cells.forEach((b, k) => { b.tabIndex = k === i ? 0 : -1; });
    }

    function update(flash) {
      if (!game) return;
      const g = game.state;
      cells.forEach((b, i) => {
        const c = g.cards[i];
        b.classList.toggle('up', game.isFaceUp(i));
        b.classList.toggle('matched', c.state === 'matched');
        b.classList.toggle('hinted', g.hintCards.includes(i));
        b.setAttribute('aria-label', label(i));
        // αντιστοιχισμένες κάρτες: μένουν εστιάσιμες για πλοήγηση αλλά δηλώνονται ανενεργές
        b.setAttribute('aria-disabled', c.state === 'matched' || !game.canSelect(i) ? 'true' : 'false');
      });
      gridEl.classList.toggle('locked', g.phase !== 'playing');
      if (flash) flash.cards.forEach(i => {
        const b = cells[i];
        b.classList.remove(flash.cls);
        void b.offsetWidth;
        b.classList.add(flash.cls);
      });
    }

    function layoutNow() {
      if (!game) return;
      const n = cells.length;
      const cs = getComputedStyle(boardEl);
      const W = boardEl.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const H = boardEl.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const gap = W < 420 ? 8 : W < 800 ? 12 : 16;
      const minCard = W < 420 ? 64 : 84;
      layout = bestLayout(n, W, H, gap, maxCard, minCard);
      // με κάθετη κύλιση η μπάρα (στον υπολογιστή) τρώει πλάτος· αφήνουμε περιθώριο για να μη χρειαστεί οριζόντια
      if (layout.scroll) layout = bestLayout(n, W - 18, H, gap, maxCard, minCard);
      gridEl.style.setProperty('--cols', layout.cols);
      gridEl.style.setProperty('--size', layout.size + 'px');
      gridEl.style.setProperty('--gap', gap + 'px');
      boardEl.classList.toggle('scroll', !!layout.scroll);
    }

    /* βελάκια: κινούν την εστίαση μέσα στο πλέγμα (roving tabindex) */
    gridEl.addEventListener('keydown', e => {
      if (!layout || !cells.length) return;
      const cols = layout.cols, n = cells.length;
      let j = focusIdx;
      switch (e.key) {
        case 'ArrowRight': j = Math.min(n - 1, j + 1); break;
        case 'ArrowLeft': j = Math.max(0, j - 1); break;
        case 'ArrowDown': j = j + cols < n ? j + cols : j; break;
        case 'ArrowUp': j = j - cols >= 0 ? j - cols : j; break;
        case 'Home': j = 0; break;
        case 'End': j = n - 1; break;
        default: return;
      }
      e.preventDefault();
      cells[j].focus();
    });

    // ξαναϋπολογισμός όταν αλλάζει ο διαθέσιμος χώρος: περιστροφή, αλλαγή παραθύρου,
    // αλλά και όταν η πάνω γραμμή ή το μήνυμα τυλίγονται σε δεύτερη σειρά (στενά κινητά)
    let raf = 0;
    const relayout = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layoutNow); };
    if (root.ResizeObserver) new ResizeObserver(relayout).observe(boardEl);
    root.addEventListener('resize', relayout);

    return {
      render, update, layout: layoutNow,
      focusFirst() { if (cells.length) cells[Math.min(focusIdx, cells.length - 1)].focus({ preventScroll: true }); },
      clear() { game = null; cells = []; gridEl.innerHTML = ''; }
    };
  }

  const api = { createBoard, bestLayout };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MG_BOARD = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
