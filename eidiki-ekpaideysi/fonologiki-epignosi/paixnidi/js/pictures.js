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

    // λέξη (χωρίς τόνους) -> αρχείο στο img/pics. Φτιάχνεται αυτόματα από τον φάκελο εικόνες (ο πίνακας περιλαμβάνει και μερικές συγγενικές λέξεις:
    // π.χ. γατάκι -> γάτα, ζάρι -> ζάρια).
    const PICS = {
        'αγελαδα': 'agelada', 'αδελφη': 'adelfi', 'αεροπλανο': 'aeroplano', 'αετοσ': 'aetos', 'αλεπου': 'alepou', 'αλογο': 'alogo',
        'ανανασ': 'ananas', 'αρκουδα': 'arkouda', 'αστερακι': 'asteri', 'αστερι': 'asteri', 'αυγη': 'aygi', 'αυγο': 'aygo', 'αυτι': 'ayti',
        'αυτοκινητο': 'aytokinito', 'αχλαδι': 'achladi', 'βαζο': 'vazo', 'βαλιτσα': 'valitsa', 'βαρελι': 'vareli', 'βαρκα': 'varka',
        'βατομουρα': 'vatomoura', 'βατομουρο': 'vatomoura', 'βατραχοσ': 'vatraxos', 'βγεσ': 'vges', 'βελονα': 'veloni', 'βελονι': 'veloni',
        'βερικοκο': 'verikoko', 'βιβλιο': 'vivlio', 'βιδα': 'vida', 'βιολι': 'violi', 'βοτανο': 'votano', 'βοτσαλα': 'votsala', 'βοτσαλο': 'votsala',
        'βουνο': 'vouno', 'βροχη': 'vrochi', 'βρυση': 'vrysi', 'γαλα': 'gala', 'γατα': 'gata', 'γατακι': 'gata', 'γατος': 'gata', 'γεφυρα': 'gefyra',
        'γομα': 'goma', 'γραβατα': 'gravata', 'δασοσ': 'dasos', 'δελφινι': 'delfini', 'δεμα': 'dema', 'δεντρακι': 'dentro', 'δεντρο': 'dentro',
        'δρακοσ': 'drakos', 'δωρο': 'doro', 'εκκλησια': 'ekklisia', 'ελαφι': 'elafi', 'ελεφαντασ': 'elefantas', 'ελια': 'elia',
        'ελικοπτερο': 'elikoptero', 'ζαμπον': 'zabon', 'ζαρι': 'zaria', 'ζαρια': 'zaria', 'ηλιοσ': 'ilios', 'ημερολογιο': 'imerologio',
        'ηφαιστειο': 'ifaisteio', 'θαλασσα': 'thalassa', 'θεατρο': 'theatro', 'θερμομετρο': 'thermometro', 'καδοσ': 'kados', 'καμηλα': 'kamila',
        'καπελο': 'kapelo', 'καρεκλα': 'karekla', 'καροτο': 'karoto', 'κερασι': 'kerasi', 'κερι': 'keri', 'κεφαλι': 'kefali', 'κλειδι': 'kleidi',
        'κολονα': 'kolona', 'κουνελι': 'kouneli', 'κουταλι': 'koutali', 'κουτι': 'kouti', 'κρεβατι': 'krevati', 'λαδι': 'ladi', 'λεμονι': 'lemoni',
        'λυκοσ': 'lykos', 'μαιμου': 'maimou', 'μαμα': 'mitera', 'ματι': 'mati', 'μελι': 'meli', 'μηλο': 'milo', 'μητερα': 'mitera',
        'μολυβι': 'molyvi', 'μπαλονι': 'baloni', 'μπιζελι': 'bizeli', 'μυτη': 'myti', 'μωρο': 'moro', 'νεραιδα': 'neraida', 'νερο': 'nero',
        'νοτα': 'nota', 'ντοματα': 'domata', 'νυχι': 'nychi', 'οδηγοσ': 'odigos', 'οδοντοβουρτσα': 'ododovourtsa', 'οδοσ': 'odos',
        'ομελετα': 'omeleta', 'ομπρελα': 'obrela', 'ονειρο': 'oneiro', 'παπακι': 'papaki', 'πατατα': 'patata', 'πεπονι': 'peponi', 'πιτα': 'pita',
        'ποδηλατο': 'podilato', 'ποδι': 'podi', 'ποταμι': 'potami', 'πουλι': 'pouli', 'ροδα': 'roda', 'ρολοι': 'roloi', 'σαλατα': 'salata',
        'σαπουνι': 'sapouni', 'σελιδα': 'selida', 'τονοσ': 'tonos', 'τοπι': 'topi', 'τρενο': 'treno', 'τυρι': 'tyri', 'φακοσ': 'fakos',
        'φαλαινα': 'falaina', 'φαναρι': 'fanari', 'φασολι': 'fasoli', 'φεγγαρι': 'fengari', 'φιδι': 'fidi', 'φλιτζανι': 'flitzani',
        'φραουλα': 'fraoula', 'φτερο': 'ftero', 'φωτια': 'fotia', 'χαμογελο': 'chamogelo', 'χαρτησ': 'chartis', 'χελωνα': 'xelona', 'χερι': 'cheri',
        'χιονανθρωποσ': 'chionanthropos', 'χιονι': 'chioni', 'χοροσ': 'choros', 'χταποδι': 'xtapodi', 'ψαλιδι': 'psalidi', 'ψαρασ': 'psaras',
        'ψαρι': 'psari', 'ψητο': 'psito', 'ψιψινα': 'gata', 'ψυγειο': 'psygeio', 'ψωμι': 'psomi',
    };

    // τα κλειδιά περνούν από την ίδια fold() (π.χ. το τελικό ς γίνεται σ), ώστε να ταιριάζουν με τις λέξεις του παιχνιδιού
    const MAP = {}; Object.keys(PICS).forEach((k) => { MAP[fold(k)] = PICS[k]; });

    // αύξησε τον αριθμό όταν αλλάζεις κάποια εικόνα, για να την ξαναφορτώσουν οι browsers
    const V = 3;

    const wrap = (emoji, word) => {
        const file = MAP[fold(word)];
        if (!file || !emoji) return emoji;
        const s = new String(String(emoji));
        s.img = 'img/pics/' + file + '.webp?v=' + V;
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
        let k = 0; const tick = () => { if (k >= files.length) return; const i = new Image(); i.src = 'img/pics/' + files[k++] + '.webp?v=' + V; setTimeout(tick, 120); };
        setTimeout(tick, 2500);
    } catch (e) {}

    Phono.pictures = { PICS, fold };
})();
