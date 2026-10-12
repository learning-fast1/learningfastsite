/* =========================================================
   Διάκριση Συμφώνων — λογική εφαρμογής
   Στάδια 1–6: το παιδί διαβάζει δυνατά και ο ενήλικας πατά «Επόμενο».
   Στάδιο 7: το παιδί συμπληρώνει μόνο του το γράμμα που λείπει.
   ========================================================= */

const STORAGE_PROGRESS = 'diakrisi-progress';
const STORAGE_COLORS = 'diakrisi-colors';
const STORAGE_VOWELS = 'diakrisi-vowels';
const STORAGE_CUSTOM = 'diakrisi-custom-words';
const WORDS_PER_LETTER = 12;
const LEVEL_COLORS = ['#FFE082', '#A8E6CF', '#B8A9E8', '#87CEEB', '#FFB7B2'];

const STAGES = [
    { n: 1, syllables: true, title: 'Συλλαβές με τη σειρά',   desc: 'Διαβάζουμε τις συλλαβές κάθε γράμματος με τη σειρά' },
    { n: 2, syllables: true, title: 'Συλλαβές ανακατεμένες',  desc: 'Οι ίδιες συλλαβές, αλλά μπερδεμένες' },
    { n: 3, syllables: true, title: 'Δίπλα δίπλα',            desc: 'Πάνω → κάτω, κάτω → πάνω και ανακατεμένα' },
    { n: 4, syllables: true, title: 'Μία μία',                desc: 'Οι συλλαβές εμφανίζονται ανακατεμένες μία μία' },
    { n: 5, title: 'Λέξεις',                 desc: 'Πρώτα λέξεις με το ένα γράμμα, μετά με το άλλο' },
    { n: 6, title: 'Μπερδεμένες λέξεις',     desc: 'Λέξεις και των δύο γραμμάτων, από εύκολες σε δύσκολες' },
    { n: 7, title: 'Συμπλήρωσε το γράμμα',   desc: 'Λείπει το γράμμα — το παιδί πατά το σωστό' },
];

/* ---------------- Βοηθητικά ---------------- */

const $app = document.getElementById('app');

function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Ανακατεύει δύο ομάδες μαζί, χωρίς ποτέ πάνω από δύο της ίδιας ομάδας στη σειρά.
function mixTwo(a, b) {
    const pools = [shuffle(a), shuffle(b)];
    const out = [];
    let last = -1, run = 0;
    while (pools[0].length || pools[1].length) {
        let k = Math.random() * (pools[0].length + pools[1].length) < pools[0].length ? 0 : 1;
        if (k === last && run >= 2 && pools[1 - k].length) k = 1 - k;
        // Αν η μία ομάδα μένει πολύ πίσω, την προτιμάμε ώστε να μη μαζευτούν όλες στο τέλος.
        if (pools[1 - k].length > pools[k].length + 1 && !(1 - k === last && run >= 2)) k = 1 - k;
        run = k === last ? run + 1 : 1;
        last = k;
        out.push(pools[k].pop());
    }
    return out;
}

function baseChar(ch) {
    return ch.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace('ς', 'σ');
}

// Χωρίζει μια λέξη σε μονάδες· τα δίψηφα σύμφωνα (μπ, ντ, γκ, γγ, τζ, τσ) μετρούν ως μία.
function tokenize(word) {
    const chars = [...word];
    const out = [];
    for (let i = 0; i < chars.length; i++) {
        const b1 = baseChar(chars[i]);
        const b2 = i + 1 < chars.length ? baseChar(chars[i + 1]) : '';
        const b3 = i + 2 < chars.length ? baseChar(chars[i + 2]) : '';
        // Το «ντζ» διαβάζεται ν + τζ (νεράντζι, παντζάρι), όχι ντ + ζ.
        if (DIGRAPHS.includes(b1 + b2) && !(b1 + b2 === 'ντ' && b3 === 'ζ')) {
            out.push({ raw: chars[i] + chars[i + 1], base: b1 + b2 });
            i++;
        } else {
            out.push({ raw: chars[i], base: b1 });
        }
    }
    return out;
}

// Κατά προσέγγιση μέτρηση συλλαβών (για τη διαβάθμιση δυσκολίας).
function countSyllables(word) {
    const VOW = 'αεηιουω';
    const DIPH = ['αι', 'ει', 'οι', 'ου', 'υι', 'αυ', 'ευ'];
    let count = 0;
    let prev = null;
    for (const ch of word.toLowerCase()) {
        const nfd = ch.normalize('NFD');
        const b = nfd[0];
        if (!VOW.includes(b)) { prev = null; continue; }
        const accent = /́/.test(nfd);
        const diaer = /̈/.test(nfd);
        if (prev && !diaer) {
            if (DIPH.includes(prev.b + b) && !prev.accent) { prev = null; continue; }
            if ('ιυ'.includes(prev.b) && !prev.accent) { prev = { b, accent }; continue; }
        }
        count++;
        prev = { b, accent };
    }
    return Math.max(count, 1);
}

/* ---------------- Δικές μου λέξεις (αποθηκεύονται στον υπολογιστή της εκπαιδευτικού) ---------------- */

function loadCustom() {
    try {
        const o = JSON.parse(localStorage.getItem(STORAGE_CUSTOM));
        return o && typeof o === 'object' ? o : {};
    } catch { return {}; }
}

function saveCustom(o) {
    try { localStorage.setItem(STORAGE_CUSTOM, JSON.stringify(o)); return true; } catch { return false; }
}

function customFor(unit) {
    const l = loadCustom()[unit];
    return Array.isArray(l) ? l : [];
}

function customWordsOfPair(pair) {
    return [...new Set(customFor(pair.a).concat(customFor(pair.b)))];
}

function wordInfo(word, unit) {
    const tokens = tokenize(word);
    const units = tokens.map(t => t.base);
    const syll = countSyllables(word);
    const initial = units[0] === unit;
    return { word, tokens, units, difficulty: syll * 100 + (initial ? 0 : 30) + [...word].length };
}

// Λέξεις ταξινομημένες από εύκολες σε δύσκολες. Αν περισσεύουν, κρατάμε
// δείγμα απλωμένο σε όλο το εύρος δυσκολίας (όχι μόνο τις πιο εύκολες).
function wordsFor(unit, avoid, keep = [], withCustom = false) {
    const picked = baseWordsFor(unit, avoid, keep);
    if (!withCustom) return picked;
    const have = new Set(picked.map(i => i.word));
    const extra = customFor(unit)
        .filter(w => !have.has(w))
        .map(w => wordInfo(w, unit))
        .filter(info => info.units.includes(unit));
    return picked.concat(extra).sort((x, y) => x.difficulty - y.difficulty);
}

function baseWordsFor(unit, avoid, keep = []) {
    const seen = new Set();
    const all = (WORDS[unit] || [])
        .filter(w => !seen.has(w) && seen.add(w))
        .map(w => wordInfo(w, unit))
        .filter(info => info.units.includes(unit) && (keep.includes(info.word) || !avoid.some(a => info.units.includes(a))))
        .sort((x, y) => x.difficulty - y.difficulty);
    if (all.length <= WORDS_PER_LETTER) return all;
    const step = (all.length - 1) / (WORDS_PER_LETTER - 1);
    return range(WORDS_PER_LETTER).map(i => all[Math.round(i * step)]);
}

/* ---------------- Δημιουργία στοιχείων ---------------- */

function syllableItem(unit, vowel, side) {
    const cls = side === 'a' ? 'ca' : 'cb';
    return { side, plain: unit + vowel, html: `<span class="${cls}">${esc(unit)}</span>${esc(vowel)}` };
}

function wordItem(info, unit, side) {
    const cls = side === 'a' ? 'ca' : 'cb';
    const html = info.tokens.map(t => t.base === unit ? `<span class="${cls}">${esc(t.raw)}</span>` : esc(t.raw)).join('');
    return { side, plain: info.word, html, difficulty: info.difficulty, tokens: info.tokens, unit };
}

// Η λέξη με κενά στη θέση του γράμματος (στάδιο 7). Τα κενά γεμίζουν ένα ένα:
// fill[k] = { ok: true } (σωστό γράμμα) ή { ok: false, text, cls } (λάθος γράμμα που
// πρέπει να διορθωθεί), current = το κενό που είναι η σειρά του. Τα κενά έχουν πάντα
// το ίδιο πλάτος, ώστε να μην προδίδουν αν λείπει ένα γράμμα (π) ή δύο (μπ).
function blankHtml(item, fill = [], current = 0) {
    const cls = item.side === 'a' ? 'ca' : 'cb';
    let k = -1;
    return item.tokens.map(t => {
        if (t.base !== item.unit) return esc(t.raw);
        k++;
        const f = fill[k];
        if (f && f.ok) return `<span class="blank is-filled ${cls}">${esc(t.raw)}</span>`;
        if (f) return `<span class="blank is-wrong"><span class="${f.cls}">${esc(f.text)}</span></span>`;
        return `<span class="blank ${k === current ? 'is-current' : ''}">&nbsp;</span>`;
    }).join('');
}

function blankTokens(item) {
    return item.tokens.filter(t => t.base === item.unit);
}

// Το λάθος γράμμα όπως θα έμπαινε στη θέση του σωστού (κεφαλαίο αν είναι στην αρχή
// ονόματος, ς αν είναι στο τέλος της λέξης).
function wrongLetter(item, k, unit) {
    const tok = blankTokens(item)[k];
    const isLast = item.tokens[item.tokens.length - 1] === tok;
    let text = unit === 'σ' && isLast ? 'ς' : unit;
    if (tok.raw[0] !== tok.raw[0].toLowerCase()) text = text[0].toUpperCase() + text.slice(1);
    return text;
}

// Λέξεις και των δύο γραμμάτων: συγχώνευση κατά δυσκολία και ανακάτεμα
// μέσα σε μικρές ομάδες, ώστε να μένει η διαβάθμιση (εύκολες → δύσκολες).
function mixedWords(d) {
    const merged = d.wordsA.concat(d.wordsB).sort((x, y) => x.difficulty - y.difficulty);
    const items = [];
    for (let i = 0; i < merged.length; i += 4) items.push(...shuffle(merged.slice(i, i + 4)));
    return items;
}

function pairData(pair, withCustom = false) {
    const vowels = selectedVowels();
    const sylA = vowels.map(v => syllableItem(pair.a, v, 'a'));
    const sylB = vowels.map(v => syllableItem(pair.b, v, 'b'));
    const wordsA = wordsFor(pair.a, pair.avoidA || [pair.b], pair.keepA, withCustom).map(w => wordItem(w, pair.a, 'a'));
    const wordsB = wordsFor(pair.b, pair.avoidB || [pair.a], pair.keepB, withCustom).map(w => wordItem(w, pair.b, 'b'));
    return { sylA, sylB, wordsA, wordsB };
}

const range = n => [...Array(n).keys()];

// Επιστρέφει τα «μέρη» κάθε σταδίου. Κάθε μέρος έχει items και τη σειρά ανάγνωσης (order).
function buildStage(pair, n) {
    const d = pairData(pair, n === 5 || n === 6); // οι δικές μου λέξεις μπαίνουν μόνο στα στάδια «Λέξεις» και «Μπερδεμένες λέξεις»
    const A = `<b class="la-text">${esc(pair.a)}</b>`;
    const B = `<b class="lb-text">${esc(pair.b)}</b>`;

    switch (n) {
        case 1:
            return [
                { label: `Συλλαβές με το ${A}`, intro: `Διάβασε τις συλλαβές με το ${A} με τη σειρά.`, layout: 'grid', items: d.sylA, order: range(d.sylA.length) },
                { label: `Συλλαβές με το ${B}`, intro: `Διάβασε τις συλλαβές με το ${B} με τη σειρά.`, layout: 'grid', items: d.sylB, order: range(d.sylB.length) },
            ];
        case 2:
            return [
                { label: `Συλλαβές με το ${A}`, intro: `Διάβασε τις μπερδεμένες συλλαβές με το ${A}.`, layout: 'grid', items: shuffle(d.sylA), order: range(d.sylA.length) },
                { label: `Συλλαβές με το ${B}`, intro: `Διάβασε τις μπερδεμένες συλλαβές με το ${B}.`, layout: 'grid', items: shuffle(d.sylB), order: range(d.sylB.length) },
            ];
        case 3: {
            // items: 0..9 = στήλη Α, 10..19 = στήλη Β. Διαβάζουμε κάθε γραμμή αριστερά → δεξιά.
            const items = d.sylA.concat(d.sylB);
            const rows = d.sylA.length;
            const down = range(rows).flatMap(r => [r, rows + r]);
            const up = range(rows).reverse().flatMap(r => [r, rows + r]);
            const mixed = mixTwo(range(rows), range(rows).map(r => rows + r));
            return [
                { label: 'Από πάνω προς τα κάτω', intro: `Διάβασε τις συλλαβές ${A} και ${B} δίπλα δίπλα, <b>από πάνω προς τα κάτω</b>.`, layout: 'columns', items, order: down },
                { label: 'Από κάτω προς τα πάνω', intro: `Τώρα διάβασε <b>από κάτω προς τα πάνω</b>.`, layout: 'columns', items, order: up },
                { label: 'Ανακατεμένα', intro: `Τώρα διάβασε τη συλλαβή που φωτίζεται, <b>ανακατεμένα</b>.`, layout: 'columns', items, order: mixed },
            ];
        }
        case 4: {
            const items = mixTwo(d.sylA, d.sylB);
            return [
                { label: `Συλλαβές ${A} και ${B}`, intro: `Οι συλλαβές θα εμφανίζονται μία μία. Διάβασέ τες προσεκτικά!`, layout: 'card', items, order: range(items.length) },
            ];
        }
        case 5:
            return [
                { label: `Λέξεις με το ${A}`, intro: `Διάβασε τις λέξεις με το ${A}.`, layout: 'grid', words: true, items: d.wordsA, order: range(d.wordsA.length) },
                { label: `Λέξεις με το ${B}`, intro: `Διάβασε τις λέξεις με το ${B}.`, layout: 'grid', words: true, items: d.wordsB, order: range(d.wordsB.length) },
            ];
        case 6: {
            const items = mixedWords(d);
            return [
                { label: `Λέξεις με ${A} και ${B}`, intro: `Διάβασε τις λέξεις. Πρόσεχε: ${A} ή ${B};`, layout: 'grid', words: true, items, order: range(items.length) },
            ];
        }
        case 7: {
            const items = mixedWords(d);
            return [
                { label: `${A} ή ${B};`, intro: `Στη λέξη λείπει ένα γράμμα. Πάτα το σωστό: ${A} ή ${B};`, layout: 'choice', words: true, items, order: range(items.length) },
            ];
        }
    }
    return [];
}

/* ---------------- Αποθήκευση ---------------- */

function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_PROGRESS)) || {}; } catch { return {}; }
}
function saveStars(pairId, stage, stars) {
    const p = loadProgress();
    p[pairId] = p[pairId] || {};
    p[pairId][stage] = Math.max(p[pairId][stage] || 0, stars);
    try { localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(p)); } catch { /* ignore */ }
}
// Φωνήεντα που έχει επιλέξει ο εκπαιδευτικός (προεπιλογή: όλα), πάντα με τη σειρά του VOWELS.
function selectedVowels() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_VOWELS));
        if (Array.isArray(saved)) {
            const list = VOWELS.filter(v => saved.includes(v));
            if (list.length) return list;
        }
    } catch { /* ignore */ }
    return VOWELS.slice();
}
function saveVowels(list) {
    try { localStorage.setItem(STORAGE_VOWELS, JSON.stringify(list)); } catch { /* ignore */ }
}
function colorsOn() {
    try { return localStorage.getItem(STORAGE_COLORS) !== 'off'; } catch { return true; }
}
function setColors(on) {
    document.body.classList.toggle('colors-on', on);
    try { localStorage.setItem(STORAGE_COLORS, on ? 'on' : 'off'); } catch { /* ignore */ }
}

// Αστέρι σε SVG (όχι emoji), ώστε να είναι ίδιο σε κάθε συσκευή.
function starIcon(on = true) {
    return `<svg class="star ${on ? 'star-on' : 'star-off'}" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>`;
}

function starsHtml(n, cls = 'stars') {
    return `<div class="${cls}" aria-label="${n} από 3 αστέρια">${[1, 2, 3].map(i => starIcon(i <= n)).join('')}</div>`;
}

/* ---------------- Οθόνες ---------------- */

let game = null;     // τρέχουσα ανάγνωση
let cardMode = false; // εναλλαγή λίστας / κάρτας στα πλέγματα

// key: ταυτότητα της οθόνης. Το εφέ εμφάνισης και η κύλιση στην κορυφή γίνονται μόνο
// όταν αλλάζει οθόνη — όχι σε κάθε «Επόμενο» μέσα στην ίδια (αλλιώς η οθόνη «αναβοσβήνει»).
let lastScreenKey = null;
function render(html, key = Math.random()) {
    const isNew = key !== lastScreenKey;
    lastScreenKey = key;
    $app.innerHTML = `<div class="screen ${isNew ? 'enter' : ''}">${html}</div>`;
    if (isNew) window.scrollTo(0, 0);
}

// Εικονίδια κουμπιών σε SVG γραμμής, ώστε να είναι ίδια σε κάθε συσκευή.
const svgIcon = inner => `<svg class="ui-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"
    fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

const BACK_ICON = svgIcon('<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>');
const HOME_ICON = svgIcon('<path d="M3 11l9-8 9 8"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-5.5h4V20"/>');
const PALETTE_ICON = svgIcon(
    '<path d="M12 3a9 9 0 0 0 0 18c1 0 1.6-.7 1.6-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4.3-4-7.7-9-7.7z"/>' +
    '<circle class="dot-a" cx="7.5" cy="11" r="1.4"/><circle class="dot-b" cx="10.5" cy="7" r="1.4"/>' +
    '<circle class="dot-a" cx="15" cy="7.5" r="1.4"/><circle class="dot-b" cx="17" cy="11.5" r="1.4"/>');
const CARD_ICON = svgIcon('<rect x="6" y="3" width="12" height="18" rx="2.5"/><path d="M10 12h4"/>');
const GRID_ICON = svgIcon('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/>' +
    '<rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>');

function colorToggleBtn() {
    return `<button class="btn-icon ${colorsOn() ? '' : 'is-off'}" data-act="colors" title="Χρώματα γραμμάτων" aria-label="Χρώματα γραμμάτων">${PALETTE_ICON}</button>`;
}

function showHome() {
    game = null;
    render(`
        <div class="home-screen">
            <a class="back-site" href="/">← Learning Fast</a>
            <div class="home-letters"><span class="la">φ</span><span class="lb">β</span></div>
            <h1 class="home-logo">Διάκριση Συμφώνων</h1>
            <button class="btn btn-primary btn-large" data-act="levels">Ξεκινάμε!</button>
        </div>`);
}

function showLevels() {
    game = null;
    const prog = loadProgress();
    const cards = PAIRS.map((p, i) => {
        const st = prog[p.id] || {};
        const total = STAGES.reduce((s, x) => s + (st[x.n] || 0), 0);
        const done = STAGES.filter(x => st[x.n]).length;
        return `
            <button class="level-card" style="--level-color:${LEVEL_COLORS[i % LEVEL_COLORS.length]}" data-act="pair" data-id="${p.id}">
                <div class="pair-badge"><span class="la-text">${esc(p.a)}</span><span class="sep">–</span><span class="lb-text">${esc(p.b)}</span></div>
                <div class="level-info">
                    <div class="level-title">Επίπεδο ${i + 1}</div>
                    <div class="level-desc">${done}/${STAGES.length} στάδια · ${total}/${STAGES.length * 3} ${starIcon()}</div>
                </div>
            </button>`;
    }).join('');
    render(`
        <div class="topbar">
            <button class="btn-icon" data-act="home" title="Αρχική" aria-label="Αρχική">${HOME_ICON}</button>
            <div class="topbar-group">${colorToggleBtn()}</div>
        </div>
        <div class="page-header">
            <h1>Διάλεξε επίπεδο</h1>
            <p>Κάθε επίπεδο είναι ένα ζευγάρι γραμμάτων</p>
        </div>
        <div class="level-grid">${cards}</div>`);
}

function showStages(pairId) {
    game = null;
    const idx = PAIRS.findIndex(p => p.id === pairId);
    const pair = PAIRS[idx];
    const st = loadProgress()[pairId] || {};
    const cards = STAGES.map((s, i) => `
        <button class="stage-card" data-act="stage" data-id="${pair.id}" data-n="${s.n}">
            <div class="stage-num" style="--stage-color:${LEVEL_COLORS[i % LEVEL_COLORS.length]}">${s.n}</div>
            <div class="stage-info">
                <div class="stage-title">${s.title}</div>
                <div class="stage-desc">${s.desc}</div>
            </div>
            ${starsHtml(st[s.n] || 0)}
        </button>`).join('');
    render(`
        <div class="topbar">
            <button class="btn-icon" data-act="levels" title="Επίπεδα" aria-label="Επιστροφή">${BACK_ICON}</button>
            <div class="topbar-group">${colorToggleBtn()}</div>
        </div>
        <div class="page-header">
            <div class="level-hero"><span class="la">${esc(pair.a)}</span><span class="lb">${esc(pair.b)}</span></div>
            <h1>Επίπεδο ${idx + 1}</h1>
            <p>Διάλεξε στάδιο</p>
        </div>
        <div class="stage-list">${cards}</div>`);
}

function startStage(pairId, n) {
    const pair = PAIRS.find(p => p.id === pairId);
    const parts = buildStage(pair, n).filter(p => p.items.length);
    game = {
        pair, n, parts,
        partIdx: 0,
        pos: 0,
        marks: parts.map(p => p.order.map(() => null)),
        intro: true,
    };
    resetChoice(game);
    renderGame();
}

function renderGame() {
    const g = game;
    const part = g.parts[g.partIdx];
    const stage = STAGES[g.n - 1];
    const total = g.parts.reduce((s, p) => s + p.order.length, 0);
    const doneBefore = g.parts.slice(0, g.partIdx).reduce((s, p) => s + p.order.length, 0);
    const done = doneBefore + g.pos;
    const pct = Math.round(100 * done / total);
    const canCard = part.layout === 'grid';
    const showCard = part.layout === 'card' || (canCard && cardMode);

    let board;
    if (g.vowelPanel) {
        board = vowelPanelHtml(g);
    } else if (g.intro) {
        // Η επιλογή φωνηέντων εμφανίζεται μόνο πριν ξεκινήσει το στάδιο (αλλάζει όλες τις συλλαβές).
        const vowelPick = stage.syllables && g.partIdx === 0 ? `
                <div class="vowel-summary">Φωνήεντα: <b>${selectedVowels().map(esc).join(' · ')}</b></div>
                <button class="btn btn-white" data-act="vowels">Επιλογή φωνηέντων</button>` : '';
        const customBtn = stage.n === 5 || stage.n === 6 ? `
                <button class="btn btn-white" data-act="words">＋ Δικές μου λέξεις${customWordsOfPair(g.pair).length ? ` (${customWordsOfPair(g.pair).length})` : ''}</button>` : '';
        board = `
            <div class="intro-card">
                <h3>${g.parts.length > 1 ? `Μέρος ${g.partIdx + 1} από ${g.parts.length}` : stage.title}</h3>
                <p>${part.intro}</p>
                <div class="intro-actions">
                    <button class="btn btn-primary btn-large" data-act="begin">Ξεκινάμε!</button>
                    ${vowelPick}
                    ${customBtn}
                </div>
            </div>`;
    } else if (part.layout === 'choice') {
        const item = part.items[part.order[g.pos]];
        board = `
            <div class="choice-board">
                <div class="flash word" id="choice-word">${blankHtml(item, g.fill, g.blankIdx)}</div>
                <div class="choice-msg" id="choice-msg">${choiceMsg(g)}</div>
            </div>`;
    } else if (showCard) {
        const item = part.items[part.order[g.pos]];
        board = `<div class="flash ${part.words ? 'word' : ''}" data-act="ok">${item.html}</div>`;
    } else if (part.layout === 'columns') {
        const rows = part.items.length / 2;
        const cells = range(rows).map(r => tileHtml(part, r) + tileHtml(part, rows + r)).join('');
        board = `
            <div class="columns">
                <div class="col-head la-text">${esc(g.pair.a)}</div>
                <div class="col-head lb-text">${esc(g.pair.b)}</div>
                ${cells}
            </div>`;
    } else {
        board = `<div class="read-grid ${part.words ? 'words' : ''}">${part.order.map(i => tileHtml(part, i)).join('')}</div>`;
    }

    const controls = g.intro || g.vowelPanel ? '' : part.layout === 'choice' ? `
        <div class="controls choices">
            <button class="choice-btn la-bg" data-act="pick" data-side="a"><span class="ca">${esc(g.pair.a)}</span></button>
            <button class="choice-btn lb-bg" data-act="pick" data-side="b"><span class="cb">${esc(g.pair.b)}</span></button>
        </div>
        <div class="hint">Πάτα το γράμμα που λείπει · Πληκτρολόγιο: 1 = ${esc(g.pair.a)}, 2 = ${esc(g.pair.b)}</div>` : `
        <div class="controls">
            <button class="btn btn-primary btn-large btn-next" data-act="ok">Επόμενο</button>
        </div>`;

    render(`
        <div class="game-screen">
            <div class="topbar">
                <button class="btn-icon" data-act="exit" title="Έξοδος" aria-label="Επιστροφή">${BACK_ICON}</button>
                <div class="topbar-group">
                    ${canCard && !g.intro && !g.vowelPanel ? `<button class="btn-icon" data-act="view" title="${cardMode ? 'Προβολή λίστας' : 'Προβολή κάρτας'}" aria-label="${cardMode ? 'Προβολή λίστας' : 'Προβολή κάρτας'}">${cardMode ? GRID_ICON : CARD_ICON}</button>` : ''}
                    ${colorToggleBtn()}
                </div>
            </div>
            <div class="game-head">
                <h2>${stage.title}</h2>
                <div class="part-label">${part.label}</div>
                ${g.intro || g.vowelPanel || part.layout === 'choice' ? '' : `<p class="game-instruction">${part.words ? 'Διάβασε τις πιο κάτω λέξεις' : 'Διάβασε τις πιο κάτω συλλαβές'}</p>`}
            </div>
            <div class="progress-row">
                <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
                <div class="progress-text">${done}/${total}</div>
            </div>
            <div class="board">${board}</div>
            ${controls}
        </div>`, `game|${g.pair.id}|${g.n}|${g.partIdx}|${g.intro}|${!!g.vowelPanel}|${cardMode}`);

    fitFlash();
    const cur = $app.querySelector('.tile.is-current');
    if (cur) cur.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// Μικραίνει τα γράμματα της μεγάλης κάρτας ώστε να χωράει και η πιο μακριά λέξη
// (π.χ. «μελιτζανοσαλάτα» σε κινητό).
function fitFlash() {
    const el = $app.querySelector('.flash');
    if (!el) return;
    el.style.fontSize = '';
    // Όσο μετράμε, η λέξη στοιχίζεται αριστερά: κεντραρισμένη θα ξεχείλιζε και προς τις
    // δύο πλευρές και το scrollWidth θα έβλεπε μόνο τη δεξιά.
    el.style.justifyContent = 'flex-start';
    let size = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollWidth > el.clientWidth && size > 18) {
        size *= 0.92;
        el.style.fontSize = size + 'px';
    }
    el.style.justifyContent = '';
}
window.addEventListener('resize', fitFlash);

function vowelPanelHtml(g) {
    const chips = VOWELS.map(v => {
        const on = g.draft.includes(v);
        return `
            <button class="vowel-chip ${on ? 'is-on' : ''}" data-act="toggle-vowel" data-v="${esc(v)}" aria-pressed="${on}">
                <span class="v">${esc(v)}</span>
                <span class="ex"><span class="ca">${esc(g.pair.a)}</span>${esc(v)} · <span class="cb">${esc(g.pair.b)}</span>${esc(v)}</span>
            </button>`;
    }).join('');
    const none = g.draft.length === 0;
    return `
        <div class="intro-card vowel-panel">
            <h3>Επιλογή φωνηέντων</h3>
            <p>Διάλεξε τα φωνήεντα που έχει μάθει μέχρι τώρα το παιδί. Η επιλογή ισχύει σε όλα τα επίπεδα.</p>
            <div class="vowel-grid">${chips}</div>
            <div class="vowel-quick">
                <button class="btn btn-small btn-white" data-act="vowels-all">Όλα</button>
                <button class="btn btn-small btn-white" data-act="vowels-none">Κανένα</button>
            </div>
            ${none ? '<div class="vowel-warn">Διάλεξε τουλάχιστον ένα φωνήεν.</div>' : ''}
            <div class="results-actions">
                <button class="btn btn-white" data-act="vowels-cancel">Άκυρο</button>
                <button class="btn btn-primary ${none ? 'btn-disabled' : ''}" data-act="vowels-save">Αποθήκευση</button>
            </div>
        </div>`;
}

function tileHtml(part, itemIdx) {
    const g = game;
    const posOf = part.order.indexOf(itemIdx);
    const mark = g.marks[g.partIdx][posOf];
    const cls = ['tile'];
    if (posOf === g.pos) cls.push('is-current');
    if (mark === 'ok') cls.push('is-ok');
    if (mark === 'err') cls.push('is-err');
    return `<div class="${cls.join(' ')}" ${posOf === g.pos ? 'data-act="ok"' : ''}>${part.items[itemIdx].html}</div>`;
}

function mark(result) {
    const g = game;
    if (!g || g.intro) return;
    const part = g.parts[g.partIdx];
    g.marks[g.partIdx][g.pos] = result;
    g.pos++;
    resetChoice(g);
    if (g.pos >= part.order.length) {
        if (g.partIdx + 1 < g.parts.length) {
            g.partIdx++;
            g.pos = 0;
            g.intro = true;
        } else {
            return showResults();
        }
    }
    renderGame();
}

/* ---- Στάδιο 7: συμπλήρωση γράμματος ----
   Το παιδί γεμίζει τα κενά ένα ένα. Αν πατήσει λάθος γράμμα, αυτό μπαίνει στη λέξη,
   εμφανίζεται «Διάβασε τη λέξη και διόρθωσε» και το παιδί πατά το άλλο γράμμα για να
   το αντικαταστήσει. Η λέξη μετράει ως λάθος αν έγινε έστω και ένα λάθος σε αυτήν. */

function resetChoice(g) {
    g.fill = [];
    g.blankIdx = 0;
    g.tried = false;
}

function choiceMsg(g) {
    const f = (g.fill || [])[g.blankIdx || 0];
    return f && !f.ok ? 'Διάβασε τη λέξη και διόρθωσε' : '';
}

function shake(btn) {
    btn.classList.remove('is-wrong');
    void btn.offsetWidth; // επανεκκίνηση του animation
    btn.classList.add('is-wrong');
}

function pick(side, btn) {
    const g = game;
    if (!g || g.intro || g.locked) return;
    const part = g.parts[g.partIdx];
    if (part.layout !== 'choice') return;
    const item = part.items[part.order[g.pos]];
    if (!g.fill) resetChoice(g);
    const k = g.blankIdx;
    const wordEl = document.getElementById('choice-word');
    const msgEl = document.getElementById('choice-msg');

    if (side === item.side) {
        g.fill[k] = { ok: true };
        g.blankIdx = k + 1;
        $app.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('is-wrong'));
        if (g.blankIdx >= blankTokens(item).length) {
            // Όλα τα κενά σωστά: πράσινο και επόμενη λέξη.
            g.locked = true;
            const result = g.tried ? 'err' : 'ok';
            wordEl.innerHTML = blankHtml(item, g.fill, -1);
            fitFlash();
            wordEl.classList.add('is-correct');
            msgEl.textContent = '';
            btn.classList.add('is-right');
            setTimeout(() => {
                g.locked = false;
                if (game === g) mark(result);
            }, 1000);
            return;
        }
    } else {
        // Το λάθος γράμμα είναι ήδη στη λέξη: περιμένουμε τη διόρθωση με το άλλο γράμμα.
        if (g.fill[k] && !g.fill[k].ok) return shake(btn);
        g.tried = true;
        const unit = side === 'a' ? g.pair.a : g.pair.b;
        g.fill[k] = { ok: false, text: wrongLetter(item, k, unit), cls: side === 'a' ? 'ca' : 'cb' };
        shake(btn);
    }
    wordEl.innerHTML = blankHtml(item, g.fill, g.blankIdx);
    msgEl.textContent = choiceMsg(g);
    fitFlash();
}

function undo() {
    if (game && game.parts[game.partIdx].layout === 'choice') return;
    const g = game;
    if (!g) return;
    if (g.intro) {
        if (g.partIdx === 0) return;
        g.intro = false;
        g.partIdx--;
        g.pos = g.parts[g.partIdx].order.length;
    }
    if (g.pos === 0) {
        if (g.partIdx === 0) return renderGame();
        g.partIdx--;
        g.pos = g.parts[g.partIdx].order.length;
    }
    g.pos--;
    g.marks[g.partIdx][g.pos] = null;
    renderGame();
}

function showResults() {
    const g = game;
    let total = 0;
    const errors = [];
    g.parts.forEach((p, pi) => p.order.forEach((itemIdx, pos) => {
        total++;
        if (g.marks[pi][pos] === 'err') errors.push(p.items[itemIdx]);
    }));
    // Μόνο το στάδιο επιλογής (7) βαθμολογείται· στα στάδια ανάγνωσης δεν καταγράφονται λάθη,
    // οπότε η ολοκλήρωση δίνει πάντα 3 αστέρια.
    const scored = g.parts.some(p => p.layout === 'choice');
    const rate = errors.length / total;
    const stars = !scored || rate <= 0.1 ? 3 : rate <= 0.25 ? 2 : 1;
    saveStars(g.pair.id, g.n, stars);

    const uniq = [];
    errors.forEach(e => { if (!uniq.some(u => u.plain === e.plain)) uniq.push(e); });
    const title = stars === 3 ? 'Μπράβο σου!' : stars === 2 ? 'Πολύ καλά!' : 'Συνέχισε την προσπάθεια!';
    const hasNext = g.n < STAGES.length;

    render(`
        <div class="results">
            <h1>${title}</h1>
            ${starsHtml(stars, 'big-stars')}
            ${scored ? `<div class="score-line">Σωστά: <b>${total - errors.length}</b> από <b>${total}</b></div>` : ''}
            ${uniq.length ? `
                <div class="err-box">
                    <h3>Να τα ξαναδούμε:</h3>
                    <div class="err-list">${uniq.map(e => `<span class="err-chip">${e.html}</span>`).join('')}</div>
                </div>` : ''}
            <div class="results-actions">
                <button class="btn btn-white" data-act="stages" data-id="${g.pair.id}">Στάδια</button>
                <button class="btn btn-accent" data-act="stage" data-id="${g.pair.id}" data-n="${g.n}">Ξανά</button>
                ${hasNext ? `<button class="btn btn-primary" data-act="stage" data-id="${g.pair.id}" data-n="${g.n + 1}">Επόμενο στάδιο</button>` : ''}
            </div>
        </div>`);
    game = null;
    if (stars >= 2) confetti();
}

/* ---------------- Συμβάντα ---------------- */

$app.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    // Χωρίς focus σε κουμπί, ώστε το Space/Enter να πηγαίνει μόνο στον χειρισμό πλήκτρων.
    if (el.blur) el.blur();
    const { act, id, n } = el.dataset;
    switch (act) {
        case 'home': return showHome();
        case 'levels': return showLevels();
        case 'pair':
        case 'stages': return showStages(id);
        case 'stage': return startStage(id, Number(n));
        case 'begin': game.intro = false; return renderGame();
        case 'ok': return mark('ok');
        case 'pick': return pick(el.dataset.side, el);
        case 'view': cardMode = !cardMode; return renderGame();
        case 'words': return openWordsDialog();
        case 'vowels': game.vowelPanel = true; game.draft = selectedVowels(); return renderGame();
        case 'toggle-vowel': {
            const v = el.dataset.v;
            game.draft = game.draft.includes(v) ? game.draft.filter(x => x !== v) : VOWELS.filter(x => x === v || game.draft.includes(x));
            return renderGame();
        }
        case 'vowels-all': game.draft = VOWELS.slice(); return renderGame();
        case 'vowels-none': game.draft = []; return renderGame();
        case 'vowels-cancel': game.vowelPanel = false; return renderGame();
        case 'vowels-save':
            if (!game.draft.length) return;
            saveVowels(game.draft);
            return startStage(game.pair.id, game.n); // ξαναχτίζει τις συλλαβές με τα νέα φωνήεντα
        case 'exit': return showStages(game.pair.id);
        case 'colors':
            setColors(!colorsOn());
            el.classList.toggle('is-off', !colorsOn());
            return;
    }
});

document.addEventListener('keydown', e => {
    if (!game) return;
    if (e.target.closest && e.target.closest('textarea, input')) return;
    if (game.vowelPanel) {
        if (e.key === 'Escape') { game.vowelPanel = false; renderGame(); }
        return;
    }
    if (game.intro) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); game.intro = false; renderGame(); }
        else if (e.key === 'Backspace' || e.key === 'ArrowLeft') { e.preventDefault(); undo(); }
        else if (e.key === 'Escape') showStages(game.pair.id);
        return;
    }
    if (game.parts[game.partIdx].layout === 'choice') {
        const side = e.key === '1' ? 'a' : e.key === '2' ? 'b' : null;
        if (side) pick(side, $app.querySelector(`.choice-btn[data-side="${side}"]`));
        else if (e.key === 'Escape') showStages(game.pair.id);
        return;
    }
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); mark('ok'); }
    else if (e.key === 'Backspace' || e.key === 'ArrowLeft') { e.preventDefault(); undo(); }
    else if (e.key === 'Escape') { showStages(game.pair.id); }
});

/* ---------------- Παράθυρο «Δικές μου λέξεις» ---------------- */

function openWordsDialog() {
    const pair = game.pair;
    const overlay = document.createElement('div');
    overlay.className = 'cw-overlay';
    overlay.innerHTML = `
        <div class="cw-card" role="dialog" aria-modal="true" aria-labelledby="cw-title">
            <h3 id="cw-title">Δικές μου λέξεις</h3>
            <p>Γράψε λέξεις με το <b class="la-text">${esc(pair.a)}</b> ή το <b class="lb-text">${esc(pair.b)}</b>, μία σε κάθε γραμμή.
               Θα εμφανίζονται στα στάδια «Λέξεις» και «Μπερδεμένες λέξεις», με χρωματισμένο το γράμμα.
               Αποθηκεύονται μόνο σε αυτόν τον υπολογιστή.</p>
            <textarea class="cw-text" rows="8" spellcheck="false" placeholder="π.χ. φούρνος&#10;βιβλίο"></textarea>
            <div class="cw-msg" role="alert"></div>
            <div class="cw-actions">
                <button class="btn btn-primary" data-cw="save">Αποθήκευση</button>
                <button class="btn btn-white" data-cw="cancel">Άκυρο</button>
                <button class="btn btn-white cw-clear" data-cw="clear">Σβήσε όλες</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    const ta = overlay.querySelector('.cw-text');
    const msg = overlay.querySelector('.cw-msg');
    ta.value = customWordsOfPair(pair).join('\n');
    ta.focus();

    const close = () => overlay.remove();
    const store = (a, b) => {
        const all = loadCustom();
        if (a.length) all[pair.a] = a; else delete all[pair.a];
        if (b.length) all[pair.b] = b; else delete all[pair.b];
        if (!saveCustom(all)) { msg.textContent = 'Δεν ήταν δυνατή η αποθήκευση σε αυτόν τον υπολογιστή (ο browser δεν το επιτρέπει).'; return false; }
        return true;
    };
    overlay.addEventListener('click', e => {
        if (e.target === overlay) return close();
        const act = e.target.closest('[data-cw]');
        if (!act) return;
        if (act.dataset.cw === 'cancel') return close();
        if (act.dataset.cw === 'clear') {
            if (!confirm('Να σβηστούν όλες οι δικές σου λέξεις για αυτά τα γράμματα;')) return;
            if (store([], [])) { close(); startStage(pair.id, game.n); }
            return;
        }
        const words = [...new Set(ta.value.split(/[\n,;]+/).map(w => w.trim()).filter(Boolean))];
        const bad = words.filter(w => !/^[\p{L}'’-]+$/u.test(w) || !tokenize(w).some(t => t.base === pair.a || t.base === pair.b));
        if (bad.length) {
            msg.textContent = 'Αυτές οι λέξεις δεν έχουν ούτε «' + pair.a + '» ούτε «' + pair.b + '» (ή έχουν μη επιτρεπτό χαρακτήρα): ' + bad.join(', ');
            return;
        }
        const has = unit => words.filter(w => tokenize(w).some(t => t.base === unit));
        if (store(has(pair.a), has(pair.b))) { close(); startStage(pair.id, game.n); }
    });
    overlay.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ---------------- Κομφετί ---------------- */

function confetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#B8A9E8', '#A8E6CF', '#FFB7B2', '#87CEEB', '#FFE082'];
    const pieces = range(140).map(() => ({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        vy: 2 + Math.random() * 3,
        vx: -1.5 + Math.random() * 3,
        rot: Math.random() * Math.PI,
        vr: -0.1 + Math.random() * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
    }));
    const start = performance.now();
    (function frame(t) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.rot += p.vr;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });
        if (t - start < 3500) requestAnimationFrame(frame);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    })(start);
}

/* ---------------- Εκκίνηση ---------------- */

setColors(colorsOn());
showHome();

// iOS Safari αγνοεί το user-scalable=no: κόβουμε το zoom με τσίμπημα (gesture events) και με διπλό πάτημα.
['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
