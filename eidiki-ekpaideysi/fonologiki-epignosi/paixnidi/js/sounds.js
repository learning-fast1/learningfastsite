/* ============================================================
   ΗΧΟΙ ΜΕ ΤΗ ΦΩΝΗ ΤΗΣ ΕΚΠΑΙΔΕΥΤΙΚΟΥ
   - Phono.soundList: οι μεμονωμένοι ήχοι που λέει το παιχνίδι (στάδια του Επιπέδου 4).
   - Phono.recordings: αποθήκευση ηχογραφήσεων στον browser (IndexedDB) της συσκευής όπου ηχογραφήθηκαν.
   Το Στούντιο (studio.html) γράφει εδώ· το παιχνίδι διαβάζει από εδώ (Phono.audio.playSound).
   ============================================================ */
window.Phono = window.Phono || {};

// key = ο ήχος όπως τον ζητά το παιχνίδι. type: cont = παρατεινόμενος, stop = σύντομος, vowel = φωνήεν.
// Το τελικό «ς» χρησιμοποιεί την ηχογράφηση του «σ».
Phono.soundList = [
    { key: 'μ', file: 'm',   type: 'cont' },
    { key: 'ν', file: 'n',   type: 'cont' },
    { key: 'λ', file: 'l',   type: 'cont' },
    { key: 'ρ', file: 'r',   type: 'cont' },
    { key: 'σ', file: 's',   type: 'cont' },
    { key: 'φ', file: 'f',   type: 'cont' },
    { key: 'θ', file: 'th',  type: 'cont' },
    { key: 'χ', file: 'ch',  type: 'cont' },
    { key: 'ζ', file: 'z',   type: 'cont' },
    { key: 'β', file: 'v',   type: 'cont' },
    { key: 'γ', file: 'g',   type: 'cont' },
    { key: 'π', file: 'p',   type: 'stop' },
    { key: 'τ', file: 't',   type: 'stop' },
    { key: 'κ', file: 'k',   type: 'stop' },
    { key: 'δ', file: 'd',   type: 'stop' },
    { key: 'α', file: 'a',   type: 'vowel' },
    { key: 'ε', file: 'e',   type: 'vowel' },
    { key: 'η', file: 'ita', type: 'vowel' },
    { key: 'ι', file: 'iota', type: 'vowel' },
    { key: 'ο', file: 'o',   type: 'vowel' },
    { key: 'ου', file: 'ou', type: 'vowel' },
];

Phono.soundHint = function (s) {
    if (s.type === 'cont') return 'Κράτα τον ήχο περίπου 2 δευτερόλεπτα, χωρίς φωνήεν. Π.χ. «' + s.key + s.key + s.key + '», όχι το όνομα του γράμματος.';
    if (s.type === 'stop') return 'Πες τον ήχο σύντομα, χωρίς φωνήεν. Π.χ. «' + s.key + '», όχι «' + s.key + 'ι».';
    return 'Πες το φωνήεν καθαρά και σύντομα.';
};

/* ---------- IndexedDB ---------- */
Phono.recordings = (function () {
    var DB = 'phono-recordings', STORE = 'sounds', dbp = null;
    function open() {
        if (dbp) return dbp;
        dbp = new Promise(function (resolve, reject) {
            if (!window.indexedDB) { reject(new Error('no indexedDB')); return; }
            var rq = indexedDB.open(DB, 1);
            rq.onupgradeneeded = function () { rq.result.createObjectStore(STORE); };
            rq.onsuccess = function () { resolve(rq.result); };
            rq.onerror = function () { reject(rq.error); };
        });
        return dbp;
    }
    function run(mode, fn) {
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE, mode), out = fn(tx.objectStore(STORE));
                tx.oncomplete = function () { resolve(out && out.result); };
                tx.onerror = function () { reject(tx.error); };
            });
        });
    }
    return {
        get: function (key) { return run('readonly', function (s) { return s.get(key); }); },
        put: function (key, blob) { return run('readwrite', function (s) { return s.put(blob, key); }); },
        del: function (key) { return run('readwrite', function (s) { return s.delete(key); }); },
    };
})();
