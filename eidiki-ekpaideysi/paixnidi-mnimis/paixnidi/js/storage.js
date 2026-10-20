/* ============================================================
   STORAGE — ρυθμίσεις και αποτελέσματα στο localStorage
   Τα δεδομένα μένουν ΜΟΝΟ σε αυτή τη συσκευή/browser· δεν
   συγχρονίζονται και δεν στέλνονται πουθενά. Δεν αποθηκεύονται
   ονόματα παιδιών. Ελλιπή ή κατεστραμμένα δεδομένα αγνοούνται.
   ============================================================ */
(function (root) {
  "use strict";

  const SETTINGS_KEY = 'lf-memory-settings-v1';
  const RESULTS_KEY = 'lf-memory-results-v1';
  const PROFILES_KEY = 'lf-memory-profiles-v1';
  const MAX_RESULTS = 2000;
  const MAX_NAME = 20;

  const DEFAULTS = {
    level: 1,
    collection: 'zoa',
    pairs: null,          // null = προεπιλογή του επιπέδου
    preview: false,
    previewSec: null,     // null = διάρκεια του επιπέδου
    hints: true,
    reminders: true,
    showTimer: false,
    sound: true,
    mismatchMs: 1100,     // ίδιο με MG_CONFIG.TIMING.mismatchMs (το ελέγχει τεστ)
    mismatchSet: false    // true μόνο αν ο ενήλικας άλλαξε τον χρόνο στις ρυθμίσεις
  };

  const isBool = v => typeof v === 'boolean';
  const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  const isStr = v => typeof v === 'string' && v.length > 0 && v.length < 64;

  const SETTING_RULES = {
    level: v => isInt(v, 1, 4),
    collection: isStr,
    pairs: v => v === null || isInt(v, 1, 50),
    preview: isBool,
    previewSec: v => v === null || isInt(v, 1, 60),
    hints: isBool,
    reminders: isBool,
    showTimer: isBool,
    sound: isBool,
    mismatchMs: v => isInt(v, 300, 5000),
    mismatchSet: isBool
  };

  function validResult(r) {
    return !!r && typeof r === 'object' &&
      isStr(r.id) && typeof r.date === 'string' && !isNaN(Date.parse(r.date)) &&
      ['solo', 'versus', 'coop'].includes(r.mode) &&
      isInt(r.pairs, 1, 50) && isInt(r.moves, 0, 1e6) && isInt(r.matched, 0, r.pairs) &&
      isInt(r.failed, 0, 1e6) && isInt(r.hints, 0, 1e6) && isInt(r.timeMs, 0, 1e9) &&
      isBool(r.completed) && isBool(r.preview) &&
      (r.profileIds === undefined || (Array.isArray(r.profileIds) && r.profileIds.every(p => p === null || isStr(p))));
  }

  const validProfile = p => !!p && typeof p === 'object' && isStr(p.id) && typeof p.name === 'string' &&
    p.name.trim().length > 0 && p.name.length <= MAX_NAME;
  const cleanName = s => String(s || '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);
  const sameName = (a, b) => a.toLocaleLowerCase('el') === b.toLocaleLowerCase('el');

  function createStore(backend) {
    function read(key) {
      try {
        const raw = backend && backend.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    }
    function write(key, value) {
      try { backend.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
    }

    return {
      DEFAULTS,

      /* κάθε πεδίο ελέγχεται χωριστά: ένα χαλασμένο πεδίο δεν χαλάει τα υπόλοιπα */
      loadSettings() {
        const raw = read(SETTINGS_KEY);
        const s = Object.assign({}, DEFAULTS);
        if (raw && typeof raw === 'object') {
          for (const k in SETTING_RULES) if (k in raw && SETTING_RULES[k](raw[k])) s[k] = raw[k];
        }
        // τιμή που δεν άλλαξε ποτέ ο ενήλικας = παλιά προεπιλογή· ακολουθεί την τρέχουσα προεπιλογή
        if (!s.mismatchSet) s.mismatchMs = DEFAULTS.mismatchMs;
        return s;
      },

      saveSettings(s) {
        const clean = {};
        for (const k in SETTING_RULES) clean[k] = (k in s && SETTING_RULES[k](s[k])) ? s[k] : DEFAULTS[k];
        return write(SETTINGS_KEY, clean);
      },

      results() {
        const raw = read(RESULTS_KEY);
        return Array.isArray(raw) ? raw.filter(validResult) : [];
      },

      addResult(rec) {
        if (!validResult(rec)) return false;
        const list = this.results().filter(r => r.id !== rec.id);
        list.push(rec);
        return write(RESULTS_KEY, list.slice(-MAX_RESULTS));
      },

      /* προηγούμενη ολοκληρωμένη παρτίδα με ακριβώς τις ίδιες ρυθμίσεις */
      previousResult(rec) {
        const same = this.results().filter(r => r.id !== rec.id && r.completed &&
          r.mode === rec.mode && r.level === rec.level && r.collection === rec.collection &&
          r.pairs === rec.pairs && r.preview === rec.preview &&
          (r.profileIds || []).join() === (rec.profileIds || []).join());
        return same.length ? same[same.length - 1] : null;
      },

      clearResults() {
        try { backend.removeItem(RESULTS_KEY); return true; } catch (e) { return false; }
      },

      /* ---------- καταχωρημένοι παίκτες ----------
         Το όνομα μένει μόνο εδώ· τα αποτελέσματα κρατούν μόνο το id (profileIds). */
      profiles() {
        const raw = read(PROFILES_KEY);
        return Array.isArray(raw) ? raw.filter(validProfile) : [];
      },

      profile(id) {
        return this.profiles().find(p => p.id === id) || null;
      },

      /* επιστρέφει { profile } ή { error } — κενό ή διπλό όνομα δεν επιτρέπεται */
      addProfile(name) {
        const n = cleanName(name);
        if (!n) return { error: 'empty' };
        const list = this.profiles();
        if (list.some(p => sameName(p.name, n))) return { error: 'exists' };
        const profile = { id: 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), name: n, created: new Date().toISOString() };
        list.push(profile);
        return write(PROFILES_KEY, list) ? { profile } : { error: 'storage' };
      },

      /* διαγραφή παίκτη μαζί με όλες τις παρτίδες του */
      removeProfile(id) {
        const list = this.profiles().filter(p => p.id !== id);
        const results = this.results().filter(r => !(r.profileIds || []).includes(id));
        return write(PROFILES_KEY, list) && write(RESULTS_KEY, results);
      },

      resultsFor(id) {
        return this.results().filter(r => (r.profileIds || []).includes(id));
      },

      /* η πιο πρόσφατη παρτίδα του παίκτη (ολοκληρωμένη ή όχι) */
      lastResultFor(id) {
        const list = this.resultsFor(id);
        return list.length ? list[list.length - 1] : null;
      }
    };
  }

  const api = { createStore, DEFAULTS, SETTINGS_KEY, RESULTS_KEY, PROFILES_KEY, MAX_RESULTS, MAX_NAME, validResult };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MG_STORAGE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
