/* ============================================================
   CONFIG — επίπεδα δυσκολίας και χρονισμοί
   Όλοι οι αριθμοί είναι αρχικές σχεδιαστικές επιλογές προς
   αξιολόγηση και αλλάζουν ελεύθερα εδώ.
   ============================================================ */
(function (root) {
  "use strict";

  const LEVELS = [
    { id: 1, name: 'Πρώτα βήματα',     pairs: 3, minPairs: 2, maxPairs: 3,  previewSec: 8, maxCard: 200, timerAllowed: false },
    { id: 2, name: 'Εξερευνητής',      pairs: 4, minPairs: 4, maxPairs: 5,  previewSec: 6, maxCard: 170, timerAllowed: true },
    { id: 3, name: 'Μάστορας μνήμης',  pairs: 6, minPairs: 6, maxPairs: 8,  previewSec: 5, maxCard: 150, timerAllowed: true },
    { id: 4, name: 'Πρωταθλητής',      pairs: 9, minPairs: 9, maxPairs: 12, previewSec: 4, maxCard: 140, timerAllowed: true }
  ];

  const TIMING = {
    mismatchMs: 1100,      // πόσο μένουν ανοιχτές δύο διαφορετικές κάρτες (προεπιλογή· αλλάζει από τις ρυθμίσεις)
    mismatchMinMs: 800,
    mismatchMaxMs: 2500,
    hintMs: 2000,          // πόσο φαίνεται το ζευγάρι της «Βοήθειας»
    previewMinSec: 2,
    previewMaxSec: 15,
    flipMs: 350            // διάρκεια της κίνησης αναστροφής (CSS)
  };

  /* Συνεργατικό: η σειρά αλλάζει μετά από κάθε προσπάθεια, ώστε να συμμετέχουν και οι δύο ισότιμα.
     Στο παιχνίδι δύο παικτών ο παίκτης που βρίσκει ζευγάρι συνεχίζει. */
  const COOP_SWITCH_ON_MATCH = true;

  const MAX_PAIRS = Math.max(...LEVELS.map(l => l.maxPairs));

  const api = { LEVELS, TIMING, COOP_SWITCH_ON_MATCH, MAX_PAIRS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MG_CONFIG = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
