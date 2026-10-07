/* ============================================================
   ΕΙΚΟΝΕΣ ΛΕΞΕΩΝ
   Οι δικές μας εικόνες (img/pics/*.png) αντικαθιστούν τα emoji, λέξη προς λέξη.
   Όπου μια λέξη δεν έχει ακόμα εικόνα, μένει το emoji της.

   Πώς δουλεύει: η εικόνα μπαίνει στο πεδίο `emoji` της λέξης ως "αντικείμενο
   String" που θυμάται το αρχείο της (`.img`). Στα κείμενα (π.χ. στη λίστα του
   εκπαιδευτικού) φαίνεται κανονικά το emoji, ενώ το Phono.helpers.el() βλέπει
   το `.img` και φτιάχνει εικόνα. Έτσι δεν χρειάστηκε να αλλάξει κανένα παιχνίδι.
   ============================================================ */
(function () {
    const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/ς/g, 'σ');

    // λέξη (χωρίς τόνους) -> αρχείο στο img/pics
    const PICS = {
        'αλεπου': 'alepou', 'αλογο': 'alogo', 'αστερι': 'asteri', 'αστερακι': 'asteri',
        'βατραχος': 'vatraxos', 'βιβλιο': 'vivlio', 'βουνο': 'vouno', 'βροχη': 'vrochi',
        'γαλα': 'gala', 'γατα': 'gata', 'γατακι': 'gata', 'γατος': 'gata', 'ψιψινα': 'gata', 'γεφυρα': 'gefyra',
        'δεντρο': 'dentro', 'δεντρακι': 'dentro', 'ελεφαντας': 'elefantas', 'ελικοπτερο': 'elikoptero',
        'ηφαιστειο': 'ifaisteio', 'θαλασσα': 'thalassa', 'θερμομετρο': 'thermometro', 'καρεκλα': 'karekla',
        'κερασι': 'kerasi', 'νερο': 'nero', 'ρολοι': 'roloi', 'φαλαινα': 'falaina', 'φασολι': 'fasoli',
        'φεγγαρι': 'fengari', 'φιδι': 'fidi', 'φλιτζανι': 'flitzani', 'φραουλα': 'fraoula', 'φτερο': 'ftero',
        'φωτια': 'fotia', 'χελωνα': 'xelona', 'χταποδι': 'xtapodi', 'ψαρας': 'psaras', 'ψαρι': 'psari',
        'ψητο': 'psito', 'ψυγειο': 'psygeio', 'ψωμι': 'psomi',
    };

    // τα κλειδιά περνούν από την ίδια fold() (π.χ. το τελικό ς γίνεται σ), ώστε να ταιριάζουν με τις λέξεις του παιχνιδιού
    const MAP = {}; Object.keys(PICS).forEach((k) => { MAP[fold(k)] = PICS[k]; });

    const wrap = (emoji, word) => {
        const file = MAP[fold(word)];
        if (!file || !emoji) return emoji;
        const s = new String(String(emoji));
        s.img = 'img/pics/' + file + '.png';
        return s;
    };

    const D = Phono.data;
    ['words', 'oneSyllableWords', 'wordsL2', 'rhymesL3', 'initialPhonemesL4', 'finalPhonemesL4', 'phonemesL5'].forEach((bank) => {
        (D[bank] || []).forEach((w) => { if (w && w.word && w.emoji) w.emoji = wrap(w.emoji, w.word); });
    });
    (D.wordSizePairs || []).forEach((p) => {
        if (p.emoji1) p.emoji1 = wrap(p.emoji1, p.word1);
        if (p.emoji2) p.emoji2 = wrap(p.emoji2, p.word2);
    });

    // προφόρτωση, λίγο μετά την εκκίνηση και μία-μία, ώστε να μη καθυστερεί η πρώτη οθόνη
    try {
        const files = [...new Set(Object.values(PICS))];
        let k = 0; const tick = () => { if (k >= files.length) return; const i = new Image(); i.src = 'img/pics/' + files[k++] + '.png'; setTimeout(tick, 120); };
        setTimeout(tick, 2500);
    } catch (e) {}

    Phono.pictures = { PICS, fold };
})();
