/* ============================================================
   APP — οθόνες, ροή παρτίδας, χρονισμοί και αποτελέσματα
   Οι κανόνες βρίσκονται στο engine.js· εδώ μόνο καλούνται.
   ============================================================ */
(function () {
  "use strict";

  const { LEVELS, TIMING } = window.MG_CONFIG;
  const { COLLECTIONS, getCollection } = window.MG_COLLECTIONS;
  const SND = window.MG_SOUND;

  let ls = null;
  try { ls = window.localStorage; } catch (e) { ls = null; }
  const store = window.MG_STORAGE.createStore(ls);
  let settings = store.loadSettings();
  SND.setEnabled(settings.sound);
  const saveSettings = () => store.saveSettings(settings);

  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const levelById = id => LEVELS.find(l => l.id === id) || LEVELS[0];
  const MODE_NAMES = { solo: 'Ατομικό παιχνίδι', versus: 'Δύο παίκτες', coop: 'Συνεργατικό παιχνίδι' };

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id));
    document.body.dataset.screen = id; // στο παιχνίδι το φόντο μένει απλό (λιγότερα ερεθίσματα)
    window.scrollTo(0, 0);
    const h = document.querySelector('#' + id + ' h1, #' + id + ' h2');
    if (h && id !== 'play') { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }
  document.querySelectorAll('[data-home]').forEach(b => b.addEventListener('click', () => show('home')));

  /* ---------- μηνύματα ---------- */
  const MSG = {
    match: ['Μπράβο! Το θυμήθηκες!', 'Υπέροχα! Βρήκες το ζευγάρι!', 'Τα κατάφερες!'],
    matchTeam: ['Μπράβο! Το θυμηθήκατε!', 'Υπέροχα! Βρήκατε το ζευγάρι!', 'Τα καταφέρατε!'],
    miss: ['Δεν πειράζει, δοκίμασε ξανά.', 'Θυμήσου πού βρίσκονται οι κάρτες.', 'Κάθε προσπάθεια σε βοηθά να εξασκηθείς.'],
    remind: ['Κοίταξε προσεκτικά τις θέσεις.', 'Θυμήσου ποιες κάρτες έχεις ήδη ανοίξει.']
  };
  const lastPick = {};
  function pick(key) {
    const list = MSG[key];
    let i = Math.floor(Math.random() * list.length);
    if (list.length > 1 && i === lastPick[key]) i = (i + 1) % list.length;
    lastPick[key] = i;
    return list[i];
  }
  const msgEl = $('#msg');
  function say(text, kind) {
    msgEl.textContent = text;
    msgEl.className = 'msg' + (kind ? ' ' + kind : '');
  }
  $('#speakbtn').hidden = !SND.canSpeak;
  $('#speakbtn').addEventListener('click', () => SND.speak(msgEl.textContent));

  /* ---------- επιβεβαίωση ---------- */
  const dlg = $('#confirm');
  function confirmBox(text, yes, no) {
    if (!dlg.showModal) return Promise.resolve(window.confirm(text));
    $('#confirm-text').textContent = text;
    $('#confirm-yes').textContent = yes;
    $('#confirm-no').textContent = no;
    return new Promise(resolve => {
      const done = v => { dlg.close(); cleanup(); resolve(v); };
      const onYes = () => done(true), onNo = () => done(false), onCancel = e => { e.preventDefault(); done(false); };
      function cleanup() {
        $('#confirm-yes').removeEventListener('click', onYes);
        $('#confirm-no').removeEventListener('click', onNo);
        dlg.removeEventListener('cancel', onCancel);
      }
      $('#confirm-yes').addEventListener('click', onYes);
      $('#confirm-no').addEventListener('click', onNo);
      dlg.addEventListener('cancel', onCancel);
      dlg.showModal();
      $('#confirm-no').focus();
    });
  }

  const fmtDate = d => new Date(d).toLocaleString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const collectionName = id => { const c = COLLECTIONS.find(x => x.id === id); return c ? c.name : '–'; };

  /* ============================================================
     ΕΠΙΛΟΓΗ: λειτουργία → παίκτης/ες → επίπεδο → κάρτες
     ============================================================ */
  const setup = {
    mode: 'solo', step: 0, level: settings.level, pairs: settings.pairs, collection: settings.collection,
    names: ['', ''],        // ψευδώνυμα μόνο για αυτή την παρτίδα (όταν δεν επιλέγεται καταχωρημένος παίκτης)
    profiles: [null, null]  // id καταχωρημένων παικτών ή null για επισκέπτη
  };
  const stepsFor = mode => mode === 'solo' ? ['who', 'level', 'collection'] : ['players', 'level', 'collection'];
  const STEP_TITLES = { who: 'Ποιος παίζει;', players: 'Ποιοι παίζουν;', level: 'Διάλεξε επίπεδο', collection: 'Διάλεξε κάρτες' };

  function validPairs(level, p) {
    return Number.isInteger(p) && p >= level.minPairs && p <= level.maxPairs ? p : level.pairs;
  }

  // από την αρχική ξεκινά πάντα χωρίς επιλεγμένο παίκτη, ώστε να μη γραφτεί παρτίδα σε λάθος παιδί
  document.querySelectorAll('.mode').forEach(b => b.addEventListener('click', () => {
    setup.profiles = [null, null];
    setup.names = ['', ''];
    openSetup(b.dataset.mode, 0);
  }));

  function openSetup(mode, step) {
    setup.mode = mode;
    setup.step = step;
    renderSetup();
    show('setup');
  }

  function radioGroup(container, items, selected, onSelect) {
    container.innerHTML = '';
    const btns = items.map(it => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(it.value === selected));
      b.tabIndex = it.value === selected ? 0 : -1;
      b.innerHTML = it.html;
      b.addEventListener('click', () => {
        btns.forEach(x => { x.setAttribute('aria-checked', String(x === b)); x.tabIndex = x === b ? 0 : -1; });
        onSelect(it.value);
      });
      container.appendChild(b);
      return b;
    });
    container.onkeydown = e => {
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      const j = (i + d + btns.length) % btns.length;
      btns[j].focus();
      btns[j].click();
    };
  }

  function renderSetup() {
    const steps = stepsFor(setup.mode);
    const step = steps[setup.step];
    $('#stepinfo').textContent = `${MODE_NAMES[setup.mode]} · Βήμα ${setup.step + 1} από ${steps.length}`;
    $('#stepdots').innerHTML = steps.map((s, k) => `<li class="${k < setup.step ? 'done' : k === setup.step ? 'cur' : ''}"></li>`).join('');
    $('#setup-title').textContent = STEP_TITLES[step];
    ['who', 'players', 'level', 'collection'].forEach(s => { $('#step-' + s).hidden = s !== step; });
    $('#addbox').hidden = step !== 'who' && step !== 'players';
    if (!$('#addbox').hidden) { setAddForm(false); $('#addmsg').textContent = ''; }
    $('#setupnext').innerHTML = setup.step === steps.length - 1 ? '<span aria-hidden="true">▶</span> Ξεκινάμε!' : 'Επόμενο';

    if (step === 'who') {
      renderWho();
    } else if (step === 'players') {
      renderSlots();
    } else if (step === 'level') {
      radioGroup($('#levellist'), LEVELS.map(l => ({
        value: l.id,
        html: `<span class="olvl">Επίπεδο ${l.id}</span>` +
              `<b>${esc(l.name)}</b><small>${l.minPairs === l.maxPairs ? l.minPairs : l.minPairs + '–' + l.maxPairs} ζευγάρια</small>`
      })), setup.level, v => {
        setup.level = v;
        setup.pairs = levelById(v).pairs;
        renderPairs();
        persistSetup();
      });
      renderPairs();
    } else if (step === 'collection') {
      radioGroup($('#collist'), COLLECTIONS.map(c => {
        const sample = c.items.find(i => i.id === c.icon) || c.items[0];
        return { value: c.id, html: `<img src="${esc(sample.src)}" alt="" class="cimg"><b>${esc(c.name)}</b>` };
      }), getCollection(setup.collection).id, v => { setup.collection = v; persistSetup(); });
    }
  }

  /* ---------- καταχωρημένοι παίκτες ---------- */
  const exists = id => !!id && !!store.profile(id);

  /* ειδοποίηση: τι έκανε ο παίκτης την προηγούμενη φορά */
  function lastInfoHtml(id) {
    const p = store.profile(id);
    const r = store.lastResultFor(id);
    if (!r) return `<span class="lico" aria-hidden="true">📋</span><div><b>${esc(p.name)}</b>: δεν υπάρχει ακόμη προηγούμενη παρτίδα. Διαλέξτε το επίπεδο που ταιριάζει.</div>`;
    const lvl = r.level ? `Επίπεδο ${r.level} · ${levelById(r.level).name}` : 'Επίπεδο –';
    const mode = r.mode !== 'solo' ? ` (${MODE_NAMES[r.mode]})` : '';
    const how = r.completed
      ? `Ολοκληρώθηκε με ${r.moves} κινήσεις, ${r.hints ? `${r.hints} ${r.hints === 1 ? 'βοήθεια' : 'βοήθειες'}` : 'χωρίς βοήθεια'}, σε ${fmtTime(r.timeMs)}.`
      : `Δεν ολοκληρώθηκε: βρέθηκαν ${r.matched} από ${r.pairs} ζευγάρια.`;
    return `<span class="lico" aria-hidden="true">📋</span><div><b>${esc(p.name)}</b> — την προηγούμενη φορά (${fmtDate(r.date)}):<br>` +
      `<b>${lvl}</b>, ${esc(collectionName(r.collection))}, ${r.pairs} ζευγάρια${mode}.<br>${how}` +
      `<small>Επιλέχθηκαν οι ίδιες ρυθμίσεις για να συνεχίσει από εκεί. Μπορείτε να τις αλλάξετε στα επόμενα βήματα.</small></div>`;
  }
  function showInfo(el, id) {
    el.hidden = !exists(id);
    el.innerHTML = exists(id) ? lastInfoHtml(id) : '';
  }

  /* επιλογή παίκτη: ειδοποίηση + προεπιλογή των ρυθμίσεων της τελευταίας του παρτίδας */
  function selectProfile(slot, id) {
    setup.profiles[slot] = exists(id) ? id : null;
    const last = setup.profiles[slot] && store.lastResultFor(id);
    if (last && last.level) {
      setup.level = last.level;
      setup.collection = getCollection(last.collection).id;
      setup.pairs = validPairs(levelById(last.level), last.pairs);
      persistSetup();
    }
  }

  function lastShort(id) {
    const r = store.lastResultFor(id);
    return r && r.level ? `Τελευταία: Επίπεδο ${r.level}` : 'Καμία παρτίδα ακόμη';
  }

  function renderWho() {
    if (!exists(setup.profiles[0])) setup.profiles[0] = null;
    radioGroup($('#wholist'), [
      { value: null, html: '<b>Επισκέπτης</b><small>χωρίς καταχώρηση</small>' },
      ...store.profiles().map(p => ({ value: p.id, html: `<b>${esc(p.name)}</b><small>${lastShort(p.id)}</small>` }))
    ], setup.profiles[0], v => {
      selectProfile(0, v);
      showInfo($('#whoinfo'), setup.profiles[0]);
      // η λίστα μένει στη θέση της· η ειδοποίηση (κάτω από τη λίστα) έρχεται σε θέα αν χρειάζεται
      if (!$('#whoinfo').hidden) $('#whoinfo').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    showInfo($('#whoinfo'), setup.profiles[0]);
  }

  function renderSlots() {
    const opts = '<option value="">Επισκέπτης (χωρίς καταχώρηση)</option>' +
      store.profiles().map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
    [0, 1].forEach(k => {
      if (!exists(setup.profiles[k])) setup.profiles[k] = null;
      $('#sel' + (k + 1)).innerHTML = opts;
      $('#sel' + (k + 1)).value = setup.profiles[k] || '';
      $('#name' + (k + 1)).value = setup.names[k];
      $('#name' + (k + 1)).hidden = !!setup.profiles[k];
      showInfo($('#info' + (k + 1)), setup.profiles[k]);
    });
    $('#slotsmsg').textContent = '';
  }
  [0, 1].forEach(k => $('#sel' + (k + 1)).addEventListener('change', e => {
    selectProfile(k, e.target.value || null);
    $('#name' + (k + 1)).hidden = !!setup.profiles[k];
    showInfo($('#info' + (k + 1)), setup.profiles[k]);
    $('#slotsmsg').textContent = '';
  }));

  const ADD_ERRORS = { empty: 'Γράψτε ένα όνομα ή ψευδώνυμο.', exists: 'Υπάρχει ήδη παίκτης με αυτό το όνομα.', storage: 'Δεν ήταν δυνατή η αποθήκευση σε αυτή τη συσκευή.' };
  function setAddForm(open) {
    $('#addform').hidden = !open;
    $('#newplayerbtn').hidden = open;
    $('#newplayerbtn').setAttribute('aria-expanded', String(open));
    $('#newname').value = '';
    if (open) { $('#addmsg').textContent = ''; $('#newname').focus(); }
  }
  $('#newplayerbtn').addEventListener('click', () => setAddForm(true));
  $('#addcancel').addEventListener('click', () => { setAddForm(false); $('#newplayerbtn').focus(); });

  function addPlayer() {
    const res = store.addProfile($('#newname').value);
    if (res.error) { $('#addmsg').textContent = ADD_ERRORS[res.error]; return; }
    setAddForm(false);
    $('#addmsg').textContent = `Καταχωρήθηκε: ${res.profile.name}.`;
    if (stepsFor(setup.mode)[setup.step] === 'who') {
      selectProfile(0, res.profile.id);
      renderWho();
    } else {
      const k = setup.profiles[0] ? (setup.profiles[1] ? null : 1) : 0;
      if (k !== null) selectProfile(k, res.profile.id);
      renderSlots();
    }
  }
  $('#addbtn').addEventListener('click', addPlayer);
  $('#newname').addEventListener('keydown', e => { if (e.key === 'Enter') addPlayer(); });

  function renderPairs() {
    const lvl = levelById(setup.level);
    setup.pairs = validPairs(lvl, setup.pairs);
    $('#pairsval').textContent = `${setup.pairs} (${setup.pairs * 2} κάρτες)`;
    $('#pairsminus').disabled = setup.pairs <= lvl.minPairs;
    $('#pairsplus').disabled = setup.pairs >= lvl.maxPairs;
  }
  function stepPairs(d) {
    setup.pairs += d;
    renderPairs();
    persistSetup();
  }
  $('#pairsminus').addEventListener('click', () => stepPairs(-1));
  $('#pairsplus').addEventListener('click', () => stepPairs(1));

  /* η τελευταία επιλογή του ενήλικα θυμάται για την επόμενη φορά */
  function persistSetup() {
    settings.level = setup.level;
    settings.pairs = setup.pairs;
    settings.collection = setup.collection;
    saveSettings();
  }

  $('#setupback').addEventListener('click', () => {
    if (setup.step === 0) return show('home');
    setup.step--;
    renderSetup();
  });
  $('#setupnext').addEventListener('click', () => {
    const steps = stepsFor(setup.mode);
    if (steps[setup.step] === 'players') {
      if (setup.profiles[0] && setup.profiles[0] === setup.profiles[1]) {
        $('#slotsmsg').textContent = 'Διαλέξτε δύο διαφορετικούς παίκτες.';
        return;
      }
      setup.names = [$('#name1').value.trim(), $('#name2').value.trim()];
    }
    if (setup.step < steps.length - 1) { setup.step++; renderSetup(); return; }
    startGame();
  });

  /* ============================================================
     ΠΑΡΤΙΔΑ
     ============================================================ */
  let game = null;
  let seen = new Set();          // κάρτες που έχουν ανοίξει τουλάχιστον μία φορά (για τις υπενθυμίσεις)
  let gameProfiles = [null];     // καταχωρημένοι παίκτες της παρτίδας ανά θέση (null = επισκέπτης)
  /* εγγραφή παρτίδας: μόνο οι κωδικοί των παικτών, όχι τα ονόματα */
  const makeRecord = () => Object.assign(game.record(), { profileIds: gameProfiles.slice() });
  const timers = {};
  const board = window.MG_BOARD.createBoard($('#grid'), $('#board'), onPick);

  function clearTimers() {
    clearTimeout(timers.mismatch); clearTimeout(timers.hint); clearTimeout(timers.preview);
    clearTimeout(timers.finish); clearInterval(timers.countdown); clearInterval(timers.clock);
  }

  function startGame() {
    clearTimers();
    const level = levelById(setup.level);
    const col = getCollection(setup.collection);
    const slots = setup.mode === 'solo' ? [0] : [0, 1];
    gameProfiles = slots.map(k => exists(setup.profiles[k]) ? setup.profiles[k] : null);
    const names = setup.mode === 'solo' ? null : slots.map(k =>
      gameProfiles[k] ? store.profile(gameProfiles[k]).name : (setup.names[k] || `Παίκτης ${k + 1}`));
    game = window.MG_ENGINE.createGame({
      mode: setup.mode,
      pairs: validPairs(level, setup.pairs),
      items: col.items,
      players: names,
      preview: settings.preview,
      hintsAllowed: settings.hints,
      level: level.id,
      collection: col.id
    });
    seen = new Set();
    show('play');
    $('#play').dataset.level = level.id;
    board.render(game, { maxCard: level.maxCard });
    game.start();

    if (game.state.phase === 'preview') {
      const g = game;
      let left = settings.previewSec || level.previewSec;
      const tick = () => say(`Κοίτα προσεκτικά τις κάρτες! ${left}`, 'info');
      tick();
      $('#skipprev').hidden = false;
      timers.countdown = setInterval(() => { left--; if (left > 0) tick(); }, 1000);
      timers.preview = setTimeout(() => { if (game === g) endPreview(); }, left * 1000);
    } else {
      beginPlayUI();
    }
    refresh();
  }

  function endPreview() {
    clearTimeout(timers.preview);
    clearInterval(timers.countdown);
    $('#skipprev').hidden = true;
    if (game.endPreview()) beginPlayUI();
    refresh();
  }
  $('#skipprev').addEventListener('click', () => { if (game) endPreview(); });

  function beginPlayUI() {
    const solo = game.state.mode === 'solo';
    const intro = settings.reminders ? MSG.remind[0] : (solo ? 'Άνοιξε δύο κάρτες.' : '');
    say(solo ? intro : `${intro} ${turnText()}`.trim(), 'info');
    startClock();
    board.focusFirst();
  }

  function turnText() {
    return `Σειρά: ${game.state.players[game.state.turn].name}`;
  }

  function onPick(i) {
    if (!game) return;
    const g = game;
    const r = g.select(i);
    if (!r.ok) return; // επαναλαμβανόμενα ή μη επιτρεπτά πατήματα αγνοούνται
    SND.play('flip');

    if (r.type === 'first') { seen.add(i); refresh(); return; }

    if (r.type === 'match') {
      seen.add(i);
      refresh({ cards: r.cards, cls: 'pop' });
      SND.play('match');
      let text = pick(g.state.mode === 'coop' ? 'matchTeam' : 'match');
      if (g.state.mode === 'versus') text += ` (${g.state.players[r.player].name})`;
      if (!r.finished && g.state.mode === 'coop' && g.state.turn !== r.player) text += ` ${turnText()}`;
      say(text, 'good');
      if (r.finished) timers.finish = setTimeout(() => { if (game === g) finishGame(); }, 900);
      return;
    }

    // διαφορετικές κάρτες: φαίνονται για λίγο και μετά κλείνουν
    const text = mismatchText(r.cards);
    seen.add(i);
    refresh();
    say(text, 'try');
    timers.mismatch = setTimeout(() => {
      if (game !== g) return;
      g.resolveMismatch();
      refresh();
      if (g.state.mode !== 'solo') say(`${text} ${turnText()}`, 'try');
    }, settings.mismatchMs);
  }

  function mismatchText(cards) {
    if (settings.reminders) {
      // αν το ταίρι μιας από τις δύο κάρτες έχει ήδη εμφανιστεί, υπενθύμισε ποια εικόνα να θυμηθεί
      for (const i of cards.slice().reverse()) {
        const c = game.state.cards[i];
        const partner = game.state.cards.find(o => o.pairId === c.pairId && o.index !== i);
        if (seen.has(partner.index)) return `Προσπάθησε να θυμηθείς πού είδες ${c.item.acc}.`;
      }
      if (Math.random() < 0.3) return MSG.remind[1];
    }
    return pick('miss');
  }

  $('#hintbtn').addEventListener('click', () => {
    if (!game) return;
    const g = game;
    const cards = g.hint();
    if (!cards) return;
    refresh();
    say('Κοίτα! Αυτές οι δύο κάρτες είναι ζευγάρι.', 'info');
    timers.hint = setTimeout(() => {
      if (game !== g) return;
      g.endHint();
      refresh();
      say(g.state.mode === 'solo' ? 'Βρες τις ίδιες εικόνες!' : `Βρες τις ίδιες εικόνες! ${turnText()}`, 'info');
    }, TIMING.hintMs);
  });

  /* ---------- HUD ---------- */
  function refresh(flash) {
    if (!game) return;
    board.update(flash);
    const g = game.state;
    const found = `<span class="found"><span aria-hidden="true">⭐</span> <span class="flabel">Ζευγάρια:</span> <b>${g.matched}</b> / ${g.pairs}</span>`;
    $('#status').innerHTML = found;

    const hintBtn = $('#hintbtn');
    hintBtn.hidden = !g.hintsAllowed;
    hintBtn.disabled = !game.canHint();

    const pl = $('#players');
    pl.hidden = g.mode === 'solo';
    if (g.mode !== 'solo') {
      pl.innerHTML = g.players.map((p, k) => {
        const active = k === g.turn && g.phase !== 'finished';
        const score = g.mode === 'versus' ? `<span class="pscore" aria-label="${p.pairs} ζευγάρια">${p.pairs} <span aria-hidden="true">⭐</span></span>` : '';
        return `<div class="pchip p${k + 1}${active ? ' turn' : ''}"${active ? ' aria-current="true"' : ''}>` +
          `<span class="arrow" aria-hidden="true">${active ? '▶' : ''}</span><span class="pname">${esc(p.name)}</span>` +
          `${active ? '<span class="sr">παίζει τώρα</span>' : ''}${score}</div>`;
      }).join(g.mode === 'coop' ? '<span class="team" aria-hidden="true">🤝</span>' : '');
    }
    updateMute();
  }

  function startClock() {
    const lvl = levelById(game.state.level);
    const visible = settings.showTimer && lvl.timerAllowed;
    $('#timer').hidden = !visible;
    clearInterval(timers.clock);
    if (!visible) return;
    const g = game;
    const tick = () => { if (game === g) $('#timer').textContent = '⏱ ' + fmtTime(g.elapsedMs()); };
    tick();
    timers.clock = setInterval(tick, 1000);
  }

  function fmtTime(ms) {
    const s = Math.round(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function updateMute() {
    const b = $('#mutebtn');
    b.innerHTML = `<span aria-hidden="true">${settings.sound ? '🔊' : '🔇'}</span>`;
    b.setAttribute('aria-label', 'Ήχοι');
    b.setAttribute('aria-pressed', String(settings.sound));
  }
  $('#mutebtn').addEventListener('click', () => {
    settings.sound = !settings.sound;
    SND.setEnabled(settings.sound);
    saveSettings();
    updateMute();
  });

  /* ---------- τέλος / διακοπή ---------- */
  function finishGame() {
    clearTimers();
    const rec = makeRecord();
    const prev = store.previousResult(rec);
    store.addResult(rec);
    SND.play('finish');
    renderResult(rec, prev);
    show('result');
  }

  /* διακοπείσα παρτίδα: αποθηκεύεται ως μη ολοκληρωμένη μόνο αν έγινε τουλάχιστον μία κίνηση ή βοήθεια */
  function abandonGame() {
    if (!game) return;
    clearTimers();
    if (game.abandon() && game.hasActivity()) store.addResult(makeRecord());
    game = null;
    board.clear();
  }

  $('#exitbtn').addEventListener('click', async () => {
    if (!game) return;
    const ok = await confirmBox('Θέλεις να σταματήσεις την παρτίδα;', 'Ναι, έξοδος', 'Όχι, συνεχίζω');
    if (ok) { abandonGame(); show('home'); }
  });

  /* κλείσιμο/ανανέωση σελίδας στη μέση της παρτίδας: κρατάμε στιγμιότυπο ως μη ολοκληρωμένο.
     Αν η σελίδα επανέλθει από την cache και η παρτίδα ολοκληρωθεί, η εγγραφή αντικαθίσταται (ίδιο id). */
  window.addEventListener('pagehide', () => {
    if (game && !['finished', 'abandoned'].includes(game.state.phase) && game.hasActivity()) store.addResult(makeRecord());
  });

  /* ---------- αποτελέσματα ---------- */
  function renderResult(rec, prev) {
    const g = game.state;
    const stat = (k, v) => `<div><dt>${k}</dt><dd>${v}</dd></div>`;
    let icon = '🎉', title, sub, scores = '';
    if (g.mode === 'solo') {
      title = 'Τα κατάφερες! Βρήκες όλα τα ζευγάρια!';
      sub = 'Μπράβο για την προσπάθειά σου!';
    } else if (g.mode === 'coop') {
      icon = '🤝';
      title = 'Τα καταφέρατε μαζί!';
      sub = 'Βρήκατε όλα τα ζευγάρια ως ομάδα. Μπράβο και στους δύο!';
    } else {
      if (rec.winner === 'tie') {
        icon = '🤝';
        title = 'Ισοπαλία!';
        sub = 'Βρήκατε τον ίδιο αριθμό ζευγαριών. Μπράβο και στους δύο!';
      } else {
        icon = '🏅';
        title = `Μπράβο, ${g.players[rec.winner].name}!`;
        sub = 'Βρήκες τα περισσότερα ζευγάρια. Μπράβο και στους δύο για την προσπάθεια!';
      }
      scores = g.players.map((p, k) => `<div class="pchip p${k + 1}${rec.winner === k ? ' win' : ''}">` +
        `<span class="pname">${esc(p.name)}</span><span class="pscore">${p.pairs} ${p.pairs === 1 ? 'ζευγάρι' : 'ζευγάρια'}</span></div>`).join('');
    }
    $('#resicon').textContent = icon;
    $('#res-title').textContent = title;
    $('#ressub').textContent = sub;
    $('#resscores').innerHTML = scores;
    $('#resstats').innerHTML =
      stat('Ζευγάρια', rec.matched) +
      stat('Κινήσεις', rec.moves) +
      stat('Προσπάθειες χωρίς ζευγάρι', rec.failed) +
      stat('Χρόνος', fmtTime(rec.timeMs)) +
      stat('Βοήθειες', rec.hints);
    $('#resprev').textContent = g.mode === 'solo' && prev
      ? `Την προηγούμενη φορά, με τις ίδιες ρυθμίσεις: ${prev.moves} κινήσεις σε ${fmtTime(prev.timeMs)}${prev.hints ? `, με ${prev.hints} ${prev.hints === 1 ? 'βοήθεια' : 'βοήθειες'}` : ''}.`
      : '';
  }

  $('#againbtn').addEventListener('click', startGame);
  $('#levelbtn').addEventListener('click', () => { game = null; board.clear(); openSetup(setup.mode, 1); }); // κρατά τον/τους ίδιους παίκτες
  $('#homebtn').addEventListener('click', () => { game = null; board.clear(); show('home'); });

  /* ============================================================
     ΟΔΗΓΙΕΣ
     ============================================================ */
  $('#howbtn').addEventListener('click', () => show('how'));

  /* ============================================================
     ΡΥΘΜΙΣΕΙΣ
     ============================================================ */
  const prevMin = TIMING.previewMinSec, prevMax = TIMING.previewMaxSec;
  function renderSettings() {
    $('#s-preview').checked = settings.preview;
    $('#s-prevbox').hidden = !settings.preview;
    $('#s-prevauto').checked = settings.previewSec == null;
    $('#s-prevmanual').hidden = settings.previewSec == null;
    $('#s-prevsec').textContent = settings.previewSec || '';
    $('#s-prevminus').disabled = settings.previewSec <= prevMin;
    $('#s-prevplus').disabled = settings.previewSec >= prevMax;
    $('#s-hints').checked = settings.hints;
    $('#s-reminders').checked = settings.reminders;
    $('#s-timer').checked = settings.showTimer;
    $('#s-sound').checked = settings.sound;
    const r = $('#s-mismatch');
    r.min = TIMING.mismatchMinMs; r.max = TIMING.mismatchMaxMs; r.value = settings.mismatchMs;
    $('#s-mismatchval').textContent = (settings.mismatchMs / 1000).toLocaleString('el-GR', { minimumFractionDigits: 1 }) + ' δευτ.';
  }
  function bindToggle(id, key, after) {
    $(id).addEventListener('change', e => { settings[key] = e.target.checked; if (after) after(); saveSettings(); renderSettings(); });
  }
  bindToggle('#s-preview', 'preview');
  bindToggle('#s-hints', 'hints');
  bindToggle('#s-reminders', 'reminders');
  bindToggle('#s-timer', 'showTimer');
  bindToggle('#s-sound', 'sound', () => SND.setEnabled(settings.sound));
  $('#s-prevauto').addEventListener('change', e => {
    settings.previewSec = e.target.checked ? null : levelById(settings.level).previewSec;
    saveSettings(); renderSettings();
  });
  const stepPrev = d => {
    settings.previewSec = Math.min(prevMax, Math.max(prevMin, (settings.previewSec || 6) + d));
    saveSettings(); renderSettings();
  };
  $('#s-prevminus').addEventListener('click', () => stepPrev(-1));
  $('#s-prevplus').addEventListener('click', () => stepPrev(1));
  $('#s-mismatch').addEventListener('input', e => {
    settings.mismatchMs = Number(e.target.value);
    settings.mismatchSet = true;   // επιλογή του ενήλικα: δεν αντικαθίσταται από αλλαγές προεπιλογής
    saveSettings(); renderSettings();
  });
  $('#setbtn').addEventListener('click', () => { renderSettings(); show('settings'); });

  /* ============================================================
     ΕΚΠΑΙΔΕΥΤΙΚΟΣ — απλή «πύλη ενηλίκων», όχι σύστημα λογαριασμών
     ============================================================ */
  let gateAnswer = 0;
  let tFilter = 'all';   // 'all' | 'guest' | id παίκτη
  function openTeacher() {
    const a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
    gateAnswer = a * b;
    $('#gateq').textContent = `Για να συνεχίσετε, γράψτε πόσο κάνει ${a} × ${b}.`;
    $('#gatein').value = '';
    $('#gatemsg').textContent = '';
    $('#gate').hidden = false;
    $('#tpanel').hidden = true;
    show('teacher');
    $('#gatein').focus();
  }
  $('#teacherbtn').addEventListener('click', openTeacher);
  $('#setplayersbtn').addEventListener('click', openTeacher);
  function tryGate() {
    if (Number($('#gatein').value.trim()) === gateAnswer) {
      $('#gate').hidden = true;
      $('#tpanel').hidden = false;
      $('#taddmsg').textContent = '';
      renderTeacher();
      $('#tpanel h2').tabIndex = -1;
      $('#tpanel h2').focus();
    } else {
      $('#gatemsg').textContent = 'Δεν είναι σωστό. Δοκιμάστε ξανά.';
    }
  }
  $('#gateok').addEventListener('click', tryGate);
  $('#gatein').addEventListener('keydown', e => { if (e.key === 'Enter') tryGate(); });

  function renderTeacher() {
    renderPlayers();
    renderFilter();
    renderHistory();
  }

  /* λίστα καταχωρημένων παικτών */
  function renderPlayers() {
    const list = store.profiles();
    if (!list.length) {
      $('#tplayers').innerHTML = '<p class="note">Δεν υπάρχουν ακόμη καταχωρημένοι παίκτες. Μπορείτε να τους καταχωρίσετε εδώ ή στο βήμα «Ποιος παίζει;».</p>';
      return;
    }
    $('#tplayers').innerHTML = '<ul class="plist">' + list.map(p => {
      const games = store.resultsFor(p.id);
      const r = games[games.length - 1];
      const last = r ? `Τελευταία: Επίπεδο ${r.level || '–'}, ${esc(collectionName(r.collection))}, ${fmtDate(r.date)}` : 'Καμία παρτίδα ακόμη';
      return `<li><div class="pinfo"><b>${esc(p.name)}</b><small>${games.length} ${games.length === 1 ? 'παρτίδα' : 'παρτίδες'} · ${last}</small></div>` +
        `<button class="btn small" data-show="${esc(p.id)}">Επιδόσεις</button>` +
        `<button class="btn ghost small danger" data-del="${esc(p.id)}" aria-label="Διαγραφή: ${esc(p.name)}">Διαγραφή</button></li>`;
    }).join('') + '</ul>';
  }
  $('#tplayers').addEventListener('click', async e => {
    const showId = e.target.closest('[data-show]');
    const delId = e.target.closest('[data-del]');
    if (showId) {
      tFilter = showId.dataset.show;
      renderFilter(); renderHistory();
      $('#thist-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (delId) {
      const p = store.profile(delId.dataset.del);
      if (!p) return;
      const ok = await confirmBox(`Διαγραφή του παίκτη «${p.name}» και όλων των παρτίδων του από αυτή τη συσκευή;`, 'Ναι, διαγραφή', 'Ακύρωση');
      if (!ok) return;
      store.removeProfile(p.id);
      if (tFilter === p.id) tFilter = 'all';
      renderTeacher();
    }
  });
  function teacherAdd() {
    const res = store.addProfile($('#tnewname').value);
    if (res.error) { $('#taddmsg').textContent = ADD_ERRORS[res.error]; return; }
    $('#tnewname').value = '';
    $('#taddmsg').textContent = `Καταχωρήθηκε: ${res.profile.name}.`;
    renderTeacher();
  }
  $('#taddbtn').addEventListener('click', teacherAdd);
  $('#tnewname').addEventListener('keydown', e => { if (e.key === 'Enter') teacherAdd(); });

  function renderFilter() {
    const list = store.profiles();
    if (tFilter !== 'all' && tFilter !== 'guest' && !list.some(p => p.id === tFilter)) tFilter = 'all';
    $('#tfilter').innerHTML = '<option value="all">Όλες οι παρτίδες</option><option value="guest">Επισκέπτες (χωρίς καταχώρηση)</option>' +
      list.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
    $('#tfilter').value = tFilter;
  }
  $('#tfilter').addEventListener('change', e => { tFilter = e.target.value; renderHistory(); });

  const isGuestGame = r => !(r.profileIds || []).some(Boolean);
  function playersOf(r) {
    const ids = r.profileIds || [];
    const n = r.mode === 'solo' ? 1 : 2;
    const names = [];
    for (let k = 0; k < n; k++) {
      const p = ids[k] && store.profile(ids[k]);
      names.push(p ? p.name : (n === 1 ? 'Επισκέπτης' : `Π${k + 1}`));
    }
    return names.join(' – ');
  }

  /* σύνοψη επιδόσεων ενός παίκτη ανά τρόπο, επίπεδο και αριθμό ζευγαριών.
     Ο τρόπος μετράει: στους δύο παίκτες οι κινήσεις είναι κοινές και δεν συγκρίνονται με τις ατομικές. */
  const MODE_ORDER = ['solo', 'coop', 'versus'];
  function profileSummary(list) {
    const groups = new Map();
    list.forEach(r => {
      const key = `${r.mode}|${r.level || 0}|${r.pairs}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(r);
    });
    const parse = k => { const [m, l, p] = k.split('|'); return [MODE_ORDER.indexOf(m), Number(l), Number(p), m]; };
    const rows = [...groups.entries()].sort((a, b) => {
      const [ma, la, pa] = parse(a[0]), [mb, lb, pb] = parse(b[0]);
      return ma - mb || la - lb || pa - pb;
    }).map(([key, rs]) => {
      const [, lvl, pairs, mode] = parse(key);
      const done = rs.filter(r => r.completed);
      const clean = done.filter(r => r.hints === 0);
      const best = clean.length ? Math.min(...clean.map(r => r.moves)) : null;
      const last = rs[rs.length - 1];
      return `<tr><td>${MODE_NAMES[mode] || esc(mode)}</td><td>${lvl ? `${lvl} · ${esc(levelById(lvl).name)}` : '–'}</td><td>${pairs}</td><td>${rs.length}</td><td>${done.length}</td>` +
        `<td>${best === null ? '–' : best}</td><td>${rs.reduce((s, r) => s + r.hints, 0)}</td><td>${fmtDate(last.date)}</td></tr>`;
    }).join('');
    return '<h4>Επιδόσεις ανά επίπεδο</h4><div class="tablewrap"><table class="hist sum"><thead><tr>' +
      ['Τρόπος', 'Επίπεδο', 'Ζευγάρια', 'Παρτίδες', 'Ολοκληρωμένες', 'Λιγότερες κινήσεις χωρίς βοήθεια', 'Βοήθειες (σύνολο)', 'Τελευταία φορά']
        .map(h => `<th scope="col">${h}</th>`).join('') + `</tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function renderHistory() {
    const all = store.results();
    const filtered = tFilter === 'all' ? all : tFilter === 'guest' ? all.filter(isGuestGame) : store.resultsFor(tFilter);
    const list = filtered.slice().reverse();
    const done = list.filter(r => r.completed).length;
    const who = tFilter === 'all' ? '' : tFilter === 'guest' ? 'Επισκέπτες: ' : `${esc(store.profile(tFilter).name)}: `;
    $('#tsummary').innerHTML = (list.length
      ? `<p>${who}<b>${list.length}</b> ${list.length === 1 ? 'παρτίδα' : 'παρτίδες'}: <b>${done}</b> ολοκληρωμένες, <b>${list.length - done}</b> διακοπείσες.</p>`
      : `<p>${who}Δεν υπάρχουν αποθηκευμένες παρτίδες.</p>`) +
      (tFilter !== 'all' && tFilter !== 'guest' && list.length ? profileSummary(filtered) : '');
    $('#tclear').hidden = !all.length;
    if (!list.length) { $('#thist').innerHTML = ''; return; }
    const head = ['Ημερομηνία', 'Παίκτης', 'Τρόπος', 'Επίπεδο', 'Κάρτες', 'Ζευγάρια', 'Κινήσεις', 'Χωρίς ζευγάρι', 'Χρόνος', 'Βοήθειες', 'Προεπισκόπηση', 'Κατάσταση', 'Ποσοστό', 'Σκορ'];
    const raw = html => ({ html });   // κελί με έτοιμο HTML· όλα τα υπόλοιπα περνούν από esc
    const rows = list.map(r => '<tr>' + [
      fmtDate(r.date),
      playersOf(r),
      MODE_NAMES[r.mode] || r.mode,
      r.level ? `${r.level} · ${levelById(r.level).name}` : '–',
      collectionName(r.collection),
      `${r.matched} / ${r.pairs}`,
      r.moves, r.failed, fmtTime(r.timeMs), r.hints,
      r.preview ? 'Ναι' : 'Όχι',
      r.completed ? 'Ολοκληρώθηκε' : raw('<span class="tag">Διακόπηκε</span>'),
      r.successRate + '%',
      Array.isArray(r.scores) ? `${r.scores[0]} – ${r.scores[1]}` : '–'
    ].map(v => `<td>${v && v.html ? v.html : esc(v)}</td>`).join('') + '</tr>').join('');
    $('#thist').innerHTML = `<thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody>`;
  }
  $('#tclear').addEventListener('click', async () => {
    const ok = await confirmBox('Να διαγραφούν όλα τα αποθηκευμένα αποτελέσματα από αυτή τη συσκευή; Οι καταχωρημένοι παίκτες θα παραμείνουν.', 'Ναι, διαγραφή', 'Ακύρωση');
    if (ok) { store.clearResults(); renderTeacher(); }
  });

  // για αυτόματο έλεγχο (tests/e2e.mjs)
  window.MG_APP = { get game() { return game; }, store };
})();
