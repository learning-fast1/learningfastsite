/* ============================================================
   ENGINE — ο μηχανισμός του παιχνιδιού, χωρίς DOM και χρονόμετρα.
   Το UI καλεί τις μεθόδους και αποφασίζει μόνο πότε (π.χ. μετά από
   1,1 δλ. καλεί resolveMismatch()). Έτσι η λογική ελέγχεται με node --test.

   Φάσεις: ready → (preview) → playing ⇄ resolving / hint → finished
                                   └→ abandoned (διακοπή)
   Μία «κίνηση» = μία πλήρης προσπάθεια με δύο κάρτες.
   ============================================================ */
(function (root) {
  "use strict";

  const CONFIG = (typeof module !== 'undefined' && module.exports) ? require('./config.js') : root.MG_CONFIG;

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* n διαφορετικές εικόνες από τη συλλογή — καμία εικόνα δεν επαναλαμβάνεται σε δύο ζευγάρια */
  function pickItems(items, n, rng) {
    const unique = [];
    const seen = new Set();
    for (const item of items) if (!seen.has(item.id)) { seen.add(item.id); unique.push(item); }
    if (n < 1) throw new Error('Χρειάζεται τουλάχιστον ένα ζευγάρι');
    if (unique.length < n) throw new Error(`Η συλλογή έχει ${unique.length} μοναδικές εικόνες, χρειάζονται ${n}`);
    return shuffle(unique, rng).slice(0, n);
  }

  /* κάθε εικόνα ακριβώς δύο φορές, ανακατεμένες μία φορά στην αρχή */
  function buildDeck(items, pairs, rng) {
    const chosen = pickItems(items, pairs, rng);
    const cards = [];
    chosen.forEach((item, pairId) => {
      cards.push({ pairId, item });
      cards.push({ pairId, item });
    });
    return shuffle(cards, rng).map((c, index) => ({ index, pairId: c.pairId, item: c.item, state: 'closed' }));
  }

  /* κάρτες που επιτρέπονται στο επίπεδο (minLevel)· χωρίς επίπεδο, όλες */
  function itemsForLevel(items, level) {
    return level == null ? items.slice() : items.filter(i => !i.minLevel || level >= i.minLevel);
  }

  function makeId(rng) {
    try { if (root.crypto && root.crypto.randomUUID) return root.crypto.randomUUID(); } catch (e) { /* ignore */ }
    return Date.now().toString(36) + '-' + Math.floor(rng() * 1e9).toString(36);
  }

  function createGame(opts) {
    const rng = opts.rng || Math.random;
    const now = opts.now || (() => Date.now());
    const mode = ['solo', 'versus', 'coop'].includes(opts.mode) ? opts.mode : 'solo';
    const names = mode === 'solo' ? ['Παίκτης'] : (opts.players || []).slice(0, 2);
    while (mode !== 'solo' && names.length < 2) names.push('Παίκτης ' + (names.length + 1));

    const g = {
      id: makeId(rng),
      mode,
      level: opts.level || null,
      collection: opts.collection || null,
      pairs: opts.pairs,
      preview: !!opts.preview,
      hintsAllowed: opts.hintsAllowed !== false,
      cards: buildDeck(itemsForLevel(opts.items, opts.level), opts.pairs, rng),
      phase: 'ready',
      open: [],          // δείκτες ανοιχτών (μη αντιστοιχισμένων) καρτών, 0–2
      hintCards: [],
      moves: 0,
      matched: 0,
      failed: 0,
      hints: 0,
      turn: 0,
      players: names.map(name => ({ name, pairs: 0, moves: 0 })),
      startedAt: null,
      finishedAt: null,
      createdAt: now()
    };

    function beginPlay() {
      g.phase = 'playing';
      g.startedAt = now();
    }

    function nextTurn() {
      if (g.mode !== 'solo') g.turn = (g.turn + 1) % g.players.length;
    }

    const api = {
      state: g,

      start() {
        if (g.phase !== 'ready') return false;
        if (g.preview) g.phase = 'preview'; else beginPlay();
        return true;
      },

      /* η μέτρηση χρόνου ξεκινά μόνο αφού τελειώσει η προεπισκόπηση */
      endPreview() {
        if (g.phase !== 'preview') return false;
        beginPlay();
        return true;
      },

      canSelect(i) {
        const c = g.cards[i];
        return g.phase === 'playing' && !!c && c.state === 'closed' && g.open.length < 2;
      },

      select(i) {
        if (!api.canSelect(i)) return { ok: false };
        const c = g.cards[i];
        c.state = 'open';
        g.open.push(i);
        if (g.open.length === 1) return { ok: true, type: 'first', cards: [i] };

        const [a, b] = g.open;
        const player = g.players[g.turn];
        g.moves++;
        player.moves++;
        if (g.cards[a].pairId === g.cards[b].pairId) {
          g.cards[a].state = g.cards[b].state = 'matched';
          g.open = [];
          g.matched++;
          player.pairs++;
          const finished = g.matched === g.pairs;
          if (finished) { g.phase = 'finished'; g.finishedAt = now(); }
          else if (g.mode === 'coop' && CONFIG.COOP_SWITCH_ON_MATCH) nextTurn();
          return { ok: true, type: 'match', cards: [a, b], finished, player: g.players.indexOf(player) };
        }
        g.failed++;
        g.phase = 'resolving'; // καμία επιλογή μέχρι να κλείσουν οι κάρτες
        return { ok: true, type: 'mismatch', cards: [a, b], player: g.players.indexOf(player) };
      },

      /* καλείται από το UI όταν περάσει ο χρόνος εμφάνισης των διαφορετικών καρτών */
      resolveMismatch() {
        if (g.phase !== 'resolving') return false;
        g.open.forEach(i => { g.cards[i].state = 'closed'; });
        g.open = [];
        nextTurn();
        g.phase = 'playing';
        return true;
      },

      canHint() {
        return g.hintsAllowed && g.phase === 'playing' && g.open.length === 0 && g.matched < g.pairs;
      },

      /* δείχνει προσωρινά ένα ζευγάρι που δεν έχει βρεθεί */
      hint() {
        if (!api.canHint()) return null;
        const closed = g.cards.filter(c => c.state === 'closed');
        const target = closed[Math.floor(rng() * closed.length)].pairId;
        g.hintCards = g.cards.filter(c => c.pairId === target).map(c => c.index);
        g.hints++;
        g.phase = 'hint';
        return g.hintCards.slice();
      },

      endHint() {
        if (g.phase !== 'hint') return false;
        g.hintCards = [];
        g.phase = 'playing';
        return true;
      },

      /* διακοπή παρτίδας πριν βρεθούν όλα τα ζευγάρια */
      abandon() {
        if (g.phase === 'finished' || g.phase === 'abandoned') return false;
        g.phase = 'abandoned';
        g.finishedAt = now();
        return true;
      },

      isFaceUp(i) {
        const c = g.cards[i];
        return c.state !== 'closed' || g.phase === 'preview' || g.hintCards.includes(i);
      },

      elapsedMs() {
        if (g.startedAt == null) return 0;
        return Math.max(0, (g.finishedAt != null ? g.finishedAt : now()) - g.startedAt);
      },

      /* ουσιαστικά ξεκίνησε: για να μην αποθηκεύονται άδειες διακοπείσες παρτίδες */
      hasActivity() {
        return g.moves > 0 || g.hints > 0;
      },

      record() {
        const completed = g.phase === 'finished';
        const rec = {
          id: g.id,
          date: new Date(g.finishedAt != null ? g.finishedAt : now()).toISOString(),
          mode: g.mode,
          level: g.level,
          collection: g.collection,
          pairs: g.pairs,
          moves: g.moves,
          matched: g.matched,
          failed: g.failed,
          timeMs: api.elapsedMs(),
          hints: g.hints,
          preview: g.preview,
          completed,
          successRate: successRate(g.matched, g.pairs)
        };
        // δύο παίκτες: μόνο θέση και σκορ, όχι ονόματα
        if (g.mode === 'versus') {
          rec.scores = g.players.map(p => p.pairs);
          if (completed) rec.winner = winnerOf(rec.scores);
        }
        return rec;
      }
    };
    return api;
  }

  function successRate(found, total) {
    return total > 0 ? Math.round((found / total) * 100) : 0;
  }

  /* δείκτης παίκτη με τα περισσότερα ζευγάρια ή 'tie' */
  function winnerOf(scores) {
    const max = Math.max(...scores);
    const top = scores.map((s, i) => s === max ? i : -1).filter(i => i >= 0);
    return top.length === 1 ? top[0] : 'tie';
  }

  const api = { createGame, buildDeck, pickItems, itemsForLevel, shuffle, successRate, winnerOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MG_ENGINE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
