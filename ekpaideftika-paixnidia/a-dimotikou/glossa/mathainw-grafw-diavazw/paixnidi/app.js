'use strict';

/* =========================================================
   Βοηθητικά
   ========================================================= */
const app = document.getElementById('app');
const COLORS = ['c-blue', 'c-sage', 'c-butter', 'c-peach', 'c-lav', 'c-rose'];

const h = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
const shuffle = (a) => {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pick = (a, n) => shuffle(a).slice(0, n);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Γράμμα χωρίς τόνους, πεζό, με το τελικό ς → σ.
const base = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/ς/g, 'σ');
const sameSound = (a, b) => a === b || SAME_SOUND.some((g) => g.includes(a) && g.includes(b));

/* ---------- πρόοδος ---------- */
const store = {
  load() { try { return JSON.parse(localStorage.getItem('anagnosi-v1') || '{}'); } catch (e) { return {}; } },
  save(o) { try { localStorage.setItem('anagnosi-v1', JSON.stringify(o)); } catch (e) { /* ok */ } },
};
const isDone = (l, n) => !!(store.load()[l] || {})[n];
const markDone = (l, n) => { const p = store.load(); (p[l] = p[l] || {})[n] = true; store.save(p); };
const doneCount = (l) => Object.keys(store.load()[l] || {}).length;

/* ---------- ήχος ---------- */
let muted = false;
let audioCtx = null;
function tone(freqs, dur = 0.12) {
  if (muted) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const t = audioCtx.currentTime + i * dur;
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.7);
      o.connect(g).connect(audioCtx.destination);
      o.start(t);
      o.stop(t + dur * 1.9);
    });
  } catch (e) { /* ok */ }
}
const sfx = { ok: () => tone([660, 880]), good: () => tone([523, 659, 784, 1047], 0.13), bad: () => tone([260, 220], 0.1) };


function muteButton() {
  const b = h('button', 'round-btn', muted ? '🔇' : '🔊');
  b.title = 'Ήχος';
  b.onclick = () => { muted = !muted; b.textContent = muted ? '🔇' : '🔊'; };
  return b;
}

/* ---------- δεδομένα λέξεων ---------- */
const startsWith = (w, l) => base(w[0]) === l && !DIGRAPHS.includes(base(w).slice(0, 2));

// Έγκυρη θέση για "κρυφό" γράμμα (όχι μέσα σε δίψηφο / διπλό γράμμα / τελικό ς).
function okPos(w, i, l) {
  const b = base(w);
  if (b[i] !== l || w[i] === 'ς') return false;
  const before = i > 0 ? b[i - 1] + b[i] : '';
  const after = i < b.length - 1 ? b[i] + b[i + 1] : '';
  if (DIGRAPHS.includes(before) || DIGRAPHS.includes(after)) return false;
  if (i > 0 && b[i - 1] === b[i]) return false;
  if (i < b.length - 1 && b[i + 1] === b[i]) return false;
  return true;
}

// Δύο λέξεις με παρόμοιες εικόνες (βλ. CONFLICTS στο data.js);
const conflicts = (a, b) => a !== b && CONFLICTS.some((g) => g.includes(a) && g.includes(b));

// Εικόνα λέξης: αρχείο (αν υπάρχει) αλλιώς emoji.
const picHtml = (x) => (x.img ? `<img class="pic" src="${encodeURI(x.img)}" alt="" draggable="false">` : x.e || '');
const picKey = (x) => x.img || x.e;

// Λέξεις της μορφής (σύμφωνο+φωνήεν)×n, προαιρετικά με τελικό ς.
const SYL_RE = /^((?:[βγδζθκλμνξπρστφχψ][αεηιουω])+)(σ?)$/;
const SYL_WORDS = [];
WORDS.forEach(([w, e, img]) => {
  w = w.normalize('NFC');
  const m = base(w).match(SYL_RE);
  if (!m) return;
  const n = m[1].length / 2;
  if (n < 2 || n > 3) return;
  const syl = [];
  for (let i = 0; i < n; i++) syl.push(w.slice(i * 2, i * 2 + 2));
  if (m[2]) syl[n - 1] += w.slice(-1);
  SYL_WORDS.push({ w, e, img, syl, n, pure: !m[2] });
});

function letterDistractors(L, n) {
  const sim = (SIM.find((g) => g.includes(L.l)) || []).filter((x) => x !== L.l && x !== 'ς');
  const rest = shuffle(LETTERS.filter((x) => x.l !== L.l && !sim.includes(x.l)).map((x) => x.l));
  return [...shuffle(sim), ...rest].slice(0, n).map((l) => LETTERS.find((x) => x.l === l));
}
const randCase = (x) => (Math.random() < 0.5 ? x.u : x.l);

/* =========================================================
   Οθόνες
   ========================================================= */
function resetProgressDialog() {
  const ov = h('div', 'overlay');
  const box = h('div', 'box');
  box.innerHTML = '<h2>Μηδενισμός προόδου</h2><p>Θα σβηστούν όλα τα αστεράκια. Να ξεκινήσουμε από την αρχή;</p>';
  const row = h('div', 'row');
  const no = h('button', 'brick big-btn c-sand', 'Όχι');
  no.onclick = () => ov.remove();
  const yes = h('button', 'brick big-btn c-rose', 'Ναι, μηδένισε');
  yes.onclick = () => { store.save({}); ov.remove(); home(); };
  row.append(no, yes);
  box.append(row);
  ov.append(box);
  document.body.append(ov);
}

function home() {
  app.innerHTML = '';
  const top = h('div', 'top home-top');
  const back = h('a', 'pill-btn', '← Learning Fast');
  back.href = '/';
  const reset = h('button', 'pill-btn', 'Μηδενισμός προόδου');
  reset.onclick = resetProgressDialog;
  top.append(back, h('span', 'spacer'), reset, muteButton());
  app.append(top);

  const hero = h('div', 'hero');
  hero.innerHTML = `
    <img class="brand-logo" src="logo-game.png" alt="Learning Fast">
    <h1>Παίζοντας με την αλφαβήτα</h1>
    <p>Μαθαίνω να γράφω και να διαβάζω</p>`;
  app.append(hero);

  const grid = h('div', 'letters');
  LETTERS.forEach((L, i) => {
    const n = Math.min(doneCount(L.l), STAGES.length);
    const b = h('button', `brick letter-tile ${COLORS[i % COLORS.length]}`, `${L.u}${L.l}<small>${'★'.repeat(n)}${'☆'.repeat(STAGES.length - n)}</small>`);
    b.onclick = () => stageMap(L);
    grid.append(b);
  });
  app.append(grid);
  app.append(h('p', 'copy', '© 2026 Learning Fast. Όλα τα δικαιώματα διατηρούνται.'));
}

const STAGES = [
  { t: 'Βρες το γράμμα', i: '🔍', c: 'c-blue', run: stage1 },
  { t: 'Χρωμάτισε', i: '🖍️', c: 'c-butter', run: stage2 },
  { t: 'Ποιες εικόνες;', i: '🖼️', c: 'c-rose', run: stage3 },
  { t: 'Βάλε το γράμμα', i: '🧩', c: 'c-sage', run: stage4 },
  { t: 'Φτιάξε συλλαβές', i: '🏗️', c: 'c-lav', run: stageBuild },
  { t: 'Ένωσε και διάβασε', i: '🔗', c: 'c-peach', run: stage5 },
  { t: 'Διαβάζω λέξεις', i: '🧱', c: 'c-blue', run: stage6 },
  { t: 'Γράφω τις λέξεις', i: '✏️', c: 'c-sage', run: stageWrite },
];

function stageMap(L) {
  app.innerHTML = '';
  const top = h('div', 'top');
  const back = h('button', 'round-btn', '←');
  back.onclick = home;
  top.append(back, h('div', 'ttl', 'Διάλεξε στάδιο'), muteButton());
  app.append(top);

  const hero = h('div', 'stage-hero');
  const hb = h('button', 'brick c-butter', `${L.u}${L.l}`);
  hero.append(hb);
  app.append(hero);

  const wrap = h('div', 'stages');
  STAGES.forEach((S, i) => {
    const b = h('button', `brick stage-card ${S.c}`, `<span class="num">${i + 1}</span><span>${S.t}</span>`);
    if (isDone(L.l, i + 1)) b.append(h('span', 'tick', '✓'));
    b.onclick = () => startStage(L, i);
    wrap.append(b);
  });
  app.append(wrap);
}

function startStage(L, idx) {
  const S = STAGES[idx];
  app.innerHTML = '';
  const top = h('div', 'top');
  const back = h('button', 'round-btn', '←');
  back.onclick = () => stageMap(L);
  top.append(back, h('div', 'ttl', `${L.u}${L.l} · ${idx + 1}. ${S.t}`), muteButton());
  const prog = h('div', 'prog');
  const prompt = h('div', 'prompt');
  const toast = h('div', 'toast');
  const play = h('div', 'play');
  app.append(top, prog, prompt, toast, play);

  const ui = {
    top,
    play,
    prompt: (html) => { prompt.innerHTML = html; },
    toast: (t) => { toast.textContent = t; },
    progress(done, total) {
      prog.innerHTML = '';
      for (let i = 0; i < total; i++) prog.append(h('i', i < done ? 'on' : ''));
    },
  };
  const finish = () => {
    markDone(L.l, idx + 1);
    sfx.good();
    celebrate(L, idx);
  };
  S.run(L, ui, finish);
}

function celebrate(L, idx) {
  const ov = h('div', 'overlay');
  for (let i = 0; i < 36; i++) {
    const c = h('i', 'confetti');
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = `var(--${['blue', 'sage', 'butter', 'peach', 'lav', 'rose'][i % 6]})`;
    c.style.animationDuration = 2.4 + Math.random() * 2.2 + 's';
    c.style.animationDelay = Math.random() * 0.8 + 's';
    ov.append(c);
  }
  const box = h('div', 'box');
  box.innerHTML = '<h2>Μπράβο! 🎉</h2><p>Ολοκλήρωσες το στάδιο!</p>';
  const row = h('div', 'row');
  const again = h('button', 'brick big-btn c-sand', 'Ξανά');
  again.onclick = () => { ov.remove(); startStage(L, idx); };
  const next = h('button', 'brick big-btn c-sage', idx < STAGES.length - 1 ? 'Επόμενο' : 'Τέλος');
  next.onclick = () => { ov.remove(); idx < STAGES.length - 1 ? startStage(L, idx + 1) : stageMap(L); };
  const map = h('button', 'brick big-btn c-blue', 'Στάδια');
  map.onclick = () => { ov.remove(); stageMap(L); };
  row.append(again, map, next);
  box.append(row);
  ov.append(box);
  document.body.append(ov);
}

function runRounds(ui, count, fn, onEnd) {
  let i = 0;
  const go = () => {
    ui.progress(i, count);
    ui.toast('');
    if (i >= count) return onEnd();
    const idx = i++;
    ui.play.innerHTML = '';
    fn(idx, () => setTimeout(go, 900));
  };
  go();
}

function wrong(el) {
  sfx.bad();
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

/* =========================================================
   Στάδιο 1 — βρες το γράμμα
   ========================================================= */
function stage1(L, ui, finish) {
  ui.prompt(`Βρες όλα τα <b class="inl">${L.u} ${L.l}</b>`);
  runRounds(ui, 10, (r, next) => {
    const cells = [];
    for (let k = 0; k < 4; k++) cells.push({ ch: k % 2 ? L.u : L.l, t: true });
    letterDistractors(L, 8).forEach((x) => cells.push({ ch: randCase(x), t: false }));
    let left = 4;
    const grid = h('div', 'grid g4');
    shuffle(cells).forEach((c) => {
      const b = h('button', 'brick cell c-sand', c.ch);
      b.onclick = () => {
        if (c.t) {
          b.classList.add('found');
          sfx.ok();
          if (--left === 0) next();
        } else wrong(b);
      };
      grid.append(b);
    });
    ui.play.append(grid);
  }, finish);
}

/* =========================================================
   Στάδιο 2 — χρωμάτισε κεφαλαίο / μικρό
   ========================================================= */
function stage2(L, ui, finish) {
  ui.prompt(`Χρωμάτισε το <b class="inl">${L.u}</b> μπλε και το <b class="inl">${L.l}</b> κίτρινο`);
  runRounds(ui, 10, (r, next) => {
    let tool = 'u';
    const tools = h('div', 'tools');
    const tu = h('button', 'brick tool c-blue sel', `<b>${L.u}</b>κεφαλαίο`);
    const tl = h('button', 'brick tool c-butter', `<b>${L.l}</b>μικρό`);
    const setTool = (t) => { tool = t; tu.classList.toggle('sel', t === 'u'); tl.classList.toggle('sel', t === 'l'); ui.toast(''); };
    tu.onclick = () => setTool('u');
    tl.onclick = () => setTool('l');
    tools.append(tu, tl);

    const cells = [];
    for (let k = 0; k < 2; k++) { cells.push({ ch: L.u, k: 'u' }); cells.push({ ch: L.l, k: 'l' }); }
    letterDistractors(L, 8).forEach((x) => cells.push({ ch: randCase(x), k: null }));
    let left = 4;
    const grid = h('div', 'grid g4');
    shuffle(cells).forEach((c) => {
      const b = h('button', 'brick cell c-sand', c.ch);
      b.onclick = () => {
        if (!c.k) return wrong(b);
        if (c.k !== tool) {
          wrong(b);
          ui.toast(c.k === 'u' ? 'Αυτό είναι κεφαλαίο — διάλεξε το μπλε!' : 'Αυτό είναι μικρό — διάλεξε το κίτρινο!');
          return;
        }
        b.classList.add(c.k === 'u' ? 'paint-u' : 'paint-l');
        sfx.ok();
        if (--left === 0) next();
      };
      grid.append(b);
    });
    ui.play.append(tools, grid);
  }, finish);
}

/* =========================================================
   Στάδιο 3 — εικόνες που ξεκινούν από το γράμμα
   ========================================================= */
function stage3(L, ui, finish) {
  ui.prompt(`Ποιες εικόνες ξεκινούν από <b class="inl">${L.u} ${L.l}</b>;`);
  const all = WORDS.map(([w, e, img]) => ({ w: w.normalize('NFC'), e, img }));
  const targets = all.filter((x) => startsWith(x.w, L.l));
  let used = [];
  // Κουμπί «Βοήθεια»: εμφανίζει/κρύβει τα ονόματα των λέξεων (για τη δασκάλα).
  let helpOn = false;
  const help = h('button', 'pill-btn', 'Βοήθεια');
  help.onclick = () => {
    helpOn = !helpOn;
    help.classList.toggle('on', helpOn);
    ui.play.querySelectorAll('.grid.cards').forEach((g) => g.classList.toggle('show-names', helpOn));
  };
  ui.top.insertBefore(help, ui.top.lastChild);
  runRounds(ui, 10, (r, next) => {
    const nT = targets.length >= 8 ? 4 : 3;
    let fresh = targets.filter((x) => !used.includes(x.w));
    if (fresh.length < Math.min(nT, targets.length)) { used = []; fresh = targets; }
    const tg = pick(fresh, Math.min(nT, fresh.length));
    used.push(...tg.map((x) => x.w));
    const tEmoji = new Set(targets.map(picKey));
    const pool = all.filter((x) => !sameSound(base(x.w[0]), L.l) && !tEmoji.has(picKey(x)) && !targets.some((t) => conflicts(t.w, x.w)));
    const seenE = new Set();
    const dis = [];
    shuffle(pool).forEach((x) => { if (dis.length < 12 - tg.length && !seenE.has(picKey(x))) { seenE.add(picKey(x)); dis.push(x); } });
    let left = tg.length;
    const grid = h('div', `grid g4 cards${helpOn ? ' show-names' : ''}`);
    shuffle([...tg.map((x) => ({ ...x, t: true })), ...dis.map((x) => ({ ...x, t: false }))]).forEach((c, i) => {
      const b = h('button', `brick card c-sand`, `${picHtml(c)}<span class="cap">${c.w}</span>`);
      b.onclick = () => {
        if (c.t) {
          b.classList.add('found');
          sfx.ok();
          if (--left === 0) next();
        } else wrong(b);
      };
      grid.append(b);
    });
    ui.play.append(grid);
  }, finish);
}

/* =========================================================
   Στάδιο 4 — βάλε το γράμμα που λείπει
   ========================================================= */
function stage4(L, ui, finish) {
  ui.prompt(`Βάλε το γράμμα <b class="inl">${L.l}</b> που λείπει`);
  const all = WORDS.map(([w, e, img]) => ({ w: w.normalize('NFC'), e, img }));
  const seen = new Set();
  const uniq = all.filter((x) => (seen.has(x.w) ? false : seen.add(x.w)));

  // Φάση 1: το γράμμα είναι το πρώτο.
  const first = pick(uniq.filter((x) => startsWith(x.w, L.l)), 5).map((x) => ({ ...x, i: 0 }));
  // Φάση 2: το γράμμα είναι σε άλλες θέσεις — με ποικιλία θέσεων.
  const byPos = {};
  shuffle(uniq).forEach((x) => {
    const b = base(x.w);
    const spots = [];
    for (let i = 1; i < b.length; i++) if (okPos(x.w, i, L.l)) spots.push(i);
    if (!spots.length) return;
    const i = spots[Math.floor(Math.random() * spots.length)];
    const key = i === b.length - 1 ? 'end' : i === 1 ? 'second' : 'mid';
    (byPos[key] = byPos[key] || []).push({ ...x, i });
  });
  const rest = [];
  const keys = ['second', 'mid', 'end'];
  for (let n = 0; rest.length < 10 - first.length && n < 60; n++) {
    const k = keys[n % 3];
    if (byPos[k] && byPos[k].length) rest.push(byPos[k].shift());
  }
  const items = [...first, ...rest];
  // Αν λείπουν λέξεις, συμπληρώνουμε με επανάληψη ώστε να φτάσουν τις 10.
  const spare = shuffle(uniq.filter((x) => startsWith(x.w, L.l)).map((x) => ({ ...x, i: 0 })));
  for (let n = 0; items.length < 10 && spare.length && n < 30; n++) items.push(spare[n % spare.length]);
  if (!items.length) { ui.prompt('Δεν βρέθηκαν λέξεις.'); return finish(); }

  runRounds(ui, items.length, (r, next) => {
    const it = items[r];
    const hint = r === first.length && rest.length ? 'Τώρα το γράμμα κρύβεται μέσα στη λέξη!' : '';
    ui.toast(hint);
    ui.play.append(h('div', 'fill-pic', picHtml(it)));
    const row = h('div', 'word-row');
    let slot;
    [...it.w].forEach((ch, i) => {
      if (i === it.i) { slot = h('div', 'slot', '?'); row.append(slot); }
      else row.append(h('div', `brick flat lt ${COLORS[i % COLORS.length]}`, ch));
    });
    const opts = shuffle([L, ...letterDistractors(L, 2)]);
    const ch = h('div', 'choices');
    opts.forEach((o, k) => {
      const b = h('button', `brick choice ${COLORS[(k + 1) % COLORS.length]}`, o.l);
      b.onclick = () => {
        if (o.l === L.l) {
          slot.textContent = it.w[it.i];
          slot.classList.add('ok');
          ch.querySelectorAll('.choice').forEach((x) => x.classList.add('gone'));
          sfx.ok();
          next();
        } else { wrong(b); b.classList.add('gone'); }
      };
      ch.append(b);
    });
    ui.play.append(row, ch);
  }, finish);
}

/* =========================================================
   Στάδιο 5 — lego συλλαβές
   ========================================================= */
function flipTo(el, text, cb) {
  el.classList.add('flip-out');
  setTimeout(() => {
    el.querySelector('.t').textContent = text;
    el.classList.remove('flip-out');
    el.classList.add('flip-in');
    setTimeout(() => el.classList.remove('flip-in'), 280);
    if (cb) cb();
  }, 220);
}

const VOWEL_OPTS = ['α', 'ε', 'ο', 'ι', 'η', 'υ', 'ω', 'ου', 'ει', 'αι', 'οι'];
function getVowels() {
  try {
    const v = JSON.parse(localStorage.getItem('anagnosi-vowels'));
    const ok = Array.isArray(v) ? v.filter((x) => VOWEL_OPTS.includes(x)) : [];
    if (ok.length) return ok;
  } catch (e) { /* ok */ }
  return ['α', 'ε', 'ι', 'ο'];
}
const COUNT_OPTS = [5, 10, 15, 20];
function getCount() {
  try { const c = Number(localStorage.getItem('anagnosi-count')); if (COUNT_OPTS.includes(c)) return c; } catch (e) { /* ok */ }
  return 10;
}
function setCount(c) { try { localStorage.setItem('anagnosi-count', String(c)); } catch (e) { /* ok */ } }
function setVowels(v) { try { localStorage.setItem('anagnosi-vowels', JSON.stringify(v)); } catch (e) { /* ok */ } }

// Παράθυρο για να διαλέξει ο εκπαιδευτικός ποια φωνήεντα θα συνοδεύουν το σύμφωνο.
function vowelPicker(L, onDone, showCount = true) {
  let sel = getVowels();
  let count = getCount();
  const ov = h('div', 'overlay');
  const box = h('div', 'box');
  box.innerHTML = L.v ? '<h2>Πόσες συλλαβές;</h2>' : '<h2>Επιλογή φωνηέντων</h2><p>Διάλεξε με ποια φωνήεντα θα ενώνεται το σύμφωνο</p>';
  const chips = h('div', 'chips');
  (L.v ? [] : VOWEL_OPTS).forEach((v, i) => {
    const b = h('button', `brick chip ${COLORS[i % COLORS.length]}${sel.includes(v) ? ' sel' : ''}`, v);
    b.onclick = () => {
      if (sel.includes(v)) { if (sel.length === 1) return; sel = sel.filter((x) => x !== v); }
      else sel = VOWEL_OPTS.filter((x) => sel.includes(x) || x === v);
      b.classList.toggle('sel', sel.includes(v));
    };
    chips.append(b);
  });
  const cnt = h('div', 'chips');
  cnt.append(h('p', 'chips-label', 'Πόσες συλλαβές θα διαβάσει;'));
  COUNT_OPTS.forEach((n, i) => {
    const b = h('button', `brick chip c-peach${n === count ? ' sel' : ''}`, String(n));
    b.onclick = () => { count = n; cnt.querySelectorAll('.chip').forEach((x) => x.classList.toggle('sel', x === b)); };
    cnt.append(b);
  });
  const ok = h('button', 'brick big-btn c-sage', 'Εντάξει');
  ok.onclick = () => { setVowels(sel); setCount(count); ov.remove(); onDone(); };
  box.append(...(L.v ? [] : [chips]), ...(showCount ? [cnt] : []), h('div', 'row', ''));
  box.lastChild.append(ok);
  ov.append(box);
  document.body.append(ov);
}

function stageBuild(L, ui, finish) {
  // Σταθερό lego με το γράμμα· στήλη με τα lego που διαλέγει η δασκάλα· στη μέση ενώνονται.
  const options = L.v ? shuffle(['μ', 'ν', 'π', 'τ', 'κ', 'λ', 'ρ', 'σ']) : shuffle(getVowels());
  const syl = (x) => (L.v ? x + L.l : L.l + x);
  const used = new Set();
  let current = null; // το στοιχείο της στήλης που είναι ενωμένο
  ui.prompt(L.v ? 'Διάλεξε ένα σύμφωνο να ενωθεί με το lego' : `Διάλεξε ένα φωνήεν να ενωθεί με το <b class="inl">${L.l}</b>`);
  ui.progress(0, options.length);

  const wrap = h('div', 'stage5 build');
  if (!L.v) {
    const side = h('button', 'brick side-btn c-lav', 'Επιλογή φωνηέντων');
    side.onclick = () => vowelPicker(L, () => startStage(L, 4), false);
    wrap.append(side);
  }
  const area = h('div', 'build-area');
  const row = h('div', 'joinrow build-row joined');
  const fixed = h('div', `brick syl ${L.v ? 'last c-blue' : 'c-blue'}`, `<span class="t">${L.l}</span>`);
  fixed.style.zIndex = L.v ? 1 : 2;
  const makePh = () => h('div', `syl-ph ${L.v ? '' : 'last'}`, '');
  let mid = makePh();
  row.append(...(L.v ? [mid, fixed] : [fixed, mid]));

  const col = h('div', 'vcol');
  const items = options.map((o, k) => {
    const b = h('button', `brick syl small vitem ${COLORS[(k + 1) % COLORS.length]}`, `<span class="t">${o}</span>`);
    b.classList.add('last');
    col.append(b);
    return { o, b };
  });

  const actions = h('div', 'actions');
  const shuf = h('button', 'brick big-btn c-sand', 'Ανακάτεψε');
  shuf.onclick = () => {
    const order = shuffle(items);
    order.forEach((it) => col.append(it.b));
  };
  const end = h('button', 'brick big-btn c-sage', 'Τέλος');
  end.style.display = 'none';
  end.onclick = finish;
  actions.append(shuf, end);

  const place = (it) => {
    if (current) current.b.classList.remove('gone');
    const nbk = h('div', `brick syl tap ${L.v ? '' : 'last'} ${L.v ? 'c-peach' : 'c-peach'}`, `<span class="t">${it.o}</span>`);
    nbk.style.zIndex = L.v ? 1 : 1;
    const src = it.b.getBoundingClientRect();
    mid.replaceWith(nbk);
    mid = nbk;
    const dst = nbk.getBoundingClientRect();
    nbk.style.transition = 'none';
    nbk.style.transform = `translate(${src.left - dst.left}px, ${src.top - dst.top}px) scale(.7)`;
    void nbk.offsetWidth;
    nbk.style.transition = 'transform .5s cubic-bezier(.3,1.3,.5,1)';
    nbk.style.transform = '';
    it.b.classList.add('gone');
    current = it;
    nbk.onclick = () => release();
    sfx.ok();
    used.add(it.o);
    ui.progress(used.size, options.length);
    if (used.size === options.length) end.style.display = '';
  };
  const release = () => {
    if (!current) return;
    current.b.classList.remove('gone');
    const ph = makePh();
    mid.replaceWith(ph);
    mid = ph;
    current = null;
  };
  items.forEach((it) => { it.b.onclick = () => { if (current === it) release(); else place(it); }; });

  area.append(row, col);
  wrap.append(area, actions);
  ui.play.append(wrap);
}

function stage5(L, ui, finish) {
  const pool = L.v ? ['μ', 'ν', 'π', 'τ', 'κ', 'λ', 'ρ', 'σ', 'β', 'γ', 'δ', 'φ'] : getVowels();
  // Πρώτα όλα με τη σειρά, μετά τυχαία (χωρίς διπλή επανάληψη στη σειρά) ώστε να φτάσουν τον αριθμό που ζητήθηκε.
  const want = getCount();
  const seq = pool.length > want ? shuffle(pool).slice(0, want) : [...pool];
  while (seq.length < want) {
    const x = pick(pool, 1)[0];
    if (pool.length === 1 || x !== seq[seq.length - 1]) seq.push(x);
  }
  const total = seq.length;
  let i = 0;
  let joined = false;
  let busy = false;
  ui.prompt('Ένωσε τα lego και διάβασε');

  const wrap = h('div', 'stage5');
  const row = h('div', 'joinrow');
  const left = h('div', `brick syl ${L.v ? 'c-peach' : 'c-blue'}`, `<span class="t">${L.v ? seq[0] : L.l}</span>`);
  const right = h('div', `brick syl tap last ${L.v ? 'c-blue' : 'c-peach'}`, `<span class="t">${L.v ? L.l : seq[0]}</span>`);
  left.style.zIndex = 2;
  row.append(left, right);
  const spinner = L.v ? left : right;

  const actions = h('div', 'actions');
  const btn = h('button', 'brick big-btn c-butter', 'Ένωσε');
  actions.append(btn);

  const join = () => {
    if (joined || busy) return;
    joined = true;
    right.style.marginLeft = '';
    row.classList.add('joined');
    sfx.ok();
    btn.textContent = i === total - 1 ? 'Τέλος' : 'Επόμενο';
    btn.classList.replace('c-butter', 'c-sage');
  };
  const nextCase = () => {
    if (i === total - 1) return finish();
    busy = true;
    i++;
    joined = false;
    ui.progress(i + 1, total);
    row.classList.remove('joined');
    btn.textContent = 'Ένωσε';
    btn.classList.replace('c-sage', 'c-butter');
    setTimeout(() => flipTo(spinner, seq[i], () => { busy = false; }), 250);
  };
  btn.onclick = () => (joined ? nextCase() : join());
  right.onclick = () => { if (!dragged) join(); };

  // Σύρσιμο του δεξιού lego προς το αριστερό.
  let dragged = false;
  right.addEventListener('pointerdown', (e) => {
    if (joined || busy) return;
    const gap = parseFloat(getComputedStyle(right).marginLeft) || 0;
    const x0 = e.clientX;
    dragged = false;
    row.classList.add('dragging');
    right.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const dx = Math.max(-gap, Math.min(0, ev.clientX - x0));
      if (Math.abs(dx) > 6) dragged = true;
      right.style.marginLeft = gap + dx + 'px';
    };
    const up = (ev) => {
      right.removeEventListener('pointermove', move);
      right.removeEventListener('pointerup', up);
      right.removeEventListener('pointercancel', up);
      row.classList.remove('dragging');
      const dx = ev.clientX - x0;
      if (dragged && dx < -gap * 0.4) join();
      else right.style.marginLeft = '';
      setTimeout(() => { dragged = false; }, 50);
    };
    right.addEventListener('pointermove', move);
    right.addEventListener('pointerup', up);
    right.addEventListener('pointercancel', up);
  });

  {
    const side = h('button', 'brick side-btn c-lav', '');
    side.textContent = L.v ? 'Πόσες συλλαβές;' : 'Επιλογή φωνηέντων / αριθμού';
    side.onclick = () => vowelPicker(L, () => startStage(L, 5));
    wrap.append(side);
  }
  ui.progress(1, total);
  wrap.append(row, actions);
  ui.play.append(wrap);
}

/* =========================================================
   Στάδιο 6 — λέξεις από lego
   ========================================================= */
function stage6(L, ui, finish) {
  ui.prompt('Διάβασε τη λέξη και βρες την εικόνα');
  // 5 λέξεις ανά αριθμό συλλαβών: πρώτα όσες ξεκινούν από το γράμμα, μετά όσες το περιέχουν,
  // και αν δεν φτάνουν συμπληρώνουμε με άλλες λέξεις ώστε να γίνουν πάντα 5.
  const take = (n) => {
    const pool = SYL_WORDS.filter((x) => x.n === n);
    const ofLetter = L.v ? [] : pool.filter((x) => startsWith(x.w, L.l));
    const has = pool.filter((x) => base(x.w).includes(L.l) && !ofLetter.includes(x));
    const order = (arr) => [...shuffle(arr.filter((x) => x.pure)), ...shuffle(arr.filter((x) => !x.pure))];
    const chosen = [...order(ofLetter), ...order(has)].slice(0, 5);
    if (chosen.length < 5) {
      const rest = order(pool.filter((x) => !chosen.includes(x)));
      chosen.push(...rest.slice(0, 5 - chosen.length));
    }
    return chosen;
  };
  const two = take(2);
  const items = [...two, ...take(3)];
  if (!items.length) { ui.prompt('Δεν βρέθηκαν λέξεις.'); return finish(); }

  runRounds(ui, items.length, (r, next) => {
    const it = items[r];
    ui.toast(r === two.length && r > 0 ? 'Τώρα λέξεις με τρία lego!' : '');
    const wb = h('div', 'word-bricks');
    it.syl.forEach((s, i) => {
      const b = h('div', `brick syl small ${COLORS[(i * 2 + r) % COLORS.length]} ${i === it.syl.length - 1 ? 'last' : ''}`,
        `${i ? '<i class="sock"></i>' : ''}<span class="t">${s}</span>`);
      b.style.zIndex = it.syl.length - i;
      wb.append(b);
    });

    const others = shuffle(SYL_WORDS.filter((x) => picKey(x) !== picKey(it)));
    const eSeen = new Set([picKey(it)]);
    const wrongs = [];
    others.forEach((x) => { if (wrongs.length < 2 && !eSeen.has(picKey(x)) && !conflicts(it.w, x.w)) { eSeen.add(picKey(x)); wrongs.push(x); } });
    const opts = h('div', 'opts');
    shuffle([it, ...wrongs]).forEach((o) => {
      const b = h('button', 'brick opt c-sand', picHtml(o));
      b.onclick = () => {
        if (o === it) {
          b.classList.add('right');
          opts.querySelectorAll('.opt').forEach((x) => { if (x !== b) x.classList.add('gone'); });
          sfx.ok();
          ui.toast(it.w);
          next();
        } else { wrong(b); b.style.opacity = '.3'; b.style.pointerEvents = 'none'; }
      };
      opts.append(b);
    });
    ui.play.append(wb, opts);
  }, finish);
}

/* =========================================================
   Στάδιο 8 — Γράφω τις λέξεις
   ========================================================= */
// Γράμματα με ίδιο ήχο: ποτέ δύο διαφορετικά από την ίδια ομάδα στα γράμματα που δίνονται.
const SOUND_GROUPS = [['η', 'ι', 'υ'], ['ο', 'ω']];

// Λέξεις που ταιριάζουν στο στάδιο: χωρίς δίψηφα και χωρίς διπλά γράμματα, ώστε να μη χρειάζεται ορθογραφία.
// (Λέξεις όπως «ήλιος» με δύο γράμματα ίδιου ήχου επιτρέπονται· τα ΕΞΤΡΑ γράμματα όμως δεν έχουν ποτέ ίδιο ήχο.)
function writable(w) {
  if (WRITE_ALLOW.includes(w)) return true;
  const b = base(w);
  if (b.length < 3 || b.length > 9) return false;
  if (/[^α-ω]/.test(b)) return false;
  if (DIGRAPHS.some((d) => b.includes(d))) return false;
  if (/(.)\1/.test(b)) return false;
  return true;
}

// 10 λέξεις: πρώτα όσες ξεκινούν από το γράμμα, μετά όσες το περιέχουν, μετά άλλες.
// Ταξινομούνται από τις μικρές στις μεγάλες.
function pickWriteWords(L) {
  const all = WORDS.map(([w, e, img]) => ({ w: w.normalize('NFC'), e, img })).filter((x) => writable(x.w));
  const own = all.filter((x) => startsWith(x.w, L.l));
  const has = all.filter((x) => !own.includes(x) && base(x.w).includes(L.l));
  const rest = all.filter((x) => !own.includes(x) && !has.includes(x));
  const chosen = [...shuffle(own), ...shuffle(has), ...shuffle(rest)].slice(0, 10);
  return chosen.sort((a, b) => base(a.w).length - base(b.w).length);
}

// Έξτρα γράμματα που δεν υπάρχουν στη λέξη και δεν έχουν ίδιο ήχο με γράμμα της λέξης ή μεταξύ τους.
function extraLetters(wordLetters, n) {
  const banned = new Set(wordLetters);
  if (wordLetters.includes('σ')) banned.add('σ');
  SOUND_GROUPS.forEach((g) => { if (g.some((x) => banned.has(x))) g.forEach((x) => banned.add(x)); });
  const out = [];
  for (const c of shuffle(LETTERS.map((x) => x.l).filter((x) => !banned.has(x)))) {
    if (out.length >= n) break;
    const grp = SOUND_GROUPS.find((g) => g.includes(c));
    if (grp && out.some((o) => grp.includes(o))) continue;
    out.push(c);
  }
  return out;
}

function stageWrite(L, ui, finish) {
  const items = pickWriteWords(L);
  ui.prompt('Γράψε τη λέξη και βάλε τον τόνο');
  if (!items.length) { ui.prompt('Δεν βρέθηκαν λέξεις.'); return finish(); }

  runRounds(ui, items.length, (r, next) => {
    const it = items[r];
    const letters = [...base(it.w)];
    const frac = r / items.length;
    const nExtra = frac < 0.3 ? 0 : frac < 0.6 ? 1 : frac < 0.8 ? 2 : 3;
    if (nExtra > 0 && (r === 0 || (r - 1) / items.length < 0.3)) ui.toast('Πρόσεχε! Υπάρχουν γράμματα που δεν χρειάζονται.');
    const lastSigma = it.w[it.w.length - 1] === 'ς';
    const make = (l, k, shown) => ({ l, id: k, shown: shown || l });
    let tiles = letters.map((l, k) => make(l, k, lastSigma && k === letters.length - 1 ? 'ς' : l));
    extraLetters(letters, nExtra).forEach((l, k) => tiles.push(make(l, 100 + k)));
    for (let t = 0; t < 8; t++) { // ανακάτεμα, όχι στη σωστή σειρά
      tiles = shuffle(tiles);
      if (tiles.slice(0, letters.length).map((x) => x.l).join('') !== letters.join('')) break;
    }
    const placed = Array(letters.length).fill(null);
    const locked = Array(letters.length).fill(false);
    let finished = false;
    let phase = 'build'; // 'build': βάζει τα γράμματα · 'accent': επιλέγει πού μπαίνει ο τόνος
    const accIdx = [...it.w].findIndex((c) => c.normalize('NFD').includes('́'));

    ui.play.append(h('div', 'write-pic', picHtml(it)));
    const slotsEl = h('div', 'write-slots');
    const bankEl = h('div', 'write-bank');
    ui.play.append(slotsEl, bankEl);

    const render = () => {
      slotsEl.innerHTML = '';
      placed.forEach((t, i) => {
        const s = h('button', t ? `brick flat wslot ${COLORS[i % COLORS.length]}${locked[i] ? ' locked' : ''}${phase === 'accent' ? ' accent-pick' : ''}` : 'wslot empty', t ? t.shown : '');
        if (phase === 'accent') s.onclick = () => pickAccent(i);
        else if (t && !locked[i]) s.onclick = () => { if (finished) return; placed[i] = null; render(); };
        slotsEl.append(s);
      });
      bankEl.innerHTML = '';
      tiles.filter((t) => !placed.includes(t)).forEach((t) => {
        const b = h('button', `brick tile ${COLORS[(t.id + 1) % COLORS.length]}`, t.shown);
        b.onclick = () => {
          if (finished) return;
          const i = placed.findIndex((x) => x === null);
          if (i < 0) return;
          placed[i] = t;
          render();
          if (placed.every(Boolean)) check();
        };
        bankEl.append(b);
      });
    };
    const finishWord = () => {
      finished = true;
      ui.toast('');
      [...slotsEl.children].forEach((s, i) => { s.textContent = it.w[i]; s.classList.remove('accent-pick'); s.classList.add('ok'); s.onclick = null; });
      next();
    };
    const pickAccent = (i) => {
      if (finished) return;
      if (i === accIdx) { sfx.ok(); finishWord(); } else wrong(slotsEl.children[i]);
    };
    const check = () => {
      const wrongAt = placed.map((t, i) => (t.l !== letters[i] ? i : -1)).filter((i) => i >= 0);
      if (!wrongAt.length) {
        placed.forEach((_, i) => { locked[i] = true; });
        sfx.ok();
        if (accIdx < 0) return finishWord(); // χωρίς τόνο (μονοσύλλαβη)
        phase = 'accent';
        ui.toast('Πάτα το γράμμα που θα μπει ο τόνος');
        render();
        return;
      }
      sfx.bad();
      slotsEl.classList.remove('shake'); void slotsEl.offsetWidth; slotsEl.classList.add('shake');
      setTimeout(() => {
        placed.forEach((t, i) => { if (wrongAt.includes(i)) placed[i] = null; else locked[i] = true; });
        render();
      }, 600);
    };
    render();
  }, finish);
}

home();

// Άμεση μετάβαση, π.χ. index.html#ρ-5 (χρήσιμο για δοκιμές).
const jump = decodeURIComponent(location.hash.slice(1)).split('-');
if (jump.length === 2) {
  const L = LETTERS.find((x) => x.l === jump[0]);
  if (L) startStage(L, Number(jump[1]) - 1);
}
