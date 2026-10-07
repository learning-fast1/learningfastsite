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
        'βουνο': 'vouno', 'βροχη': 'vrochi', 'βρυση': 'vrysi', 'γαιδαρος': 'gaidouri', 'γαιδουρι': 'gaidouri', 'γαλα': 'gala', 'γατα': 'gata',
        'γατακι': 'gata', 'γατος': 'gata', 'γεια': 'geia', 'γεφυρα': 'gefyra', 'γομα': 'goma', 'γουρουνι': 'gourouni', 'γραβατα': 'gravata',
        'γρασιδι': 'grasidi', 'γριλοσ': 'grilos', 'γυαλια': 'gyalia', 'δασοσ': 'dasos', 'δελφινι': 'delfini', 'δεμα': 'dema', 'δεντρακι': 'dentro',
        'δεντρο': 'dentro', 'δοντι': 'dodi', 'δρακοσ': 'drakos', 'δρομοσ': 'dromos', 'δωρο': 'doro', 'εκκλησια': 'ekklisia', 'ελατο': 'elato',
        'ελαφι': 'elafi', 'ελεφαντασ': 'elefantas', 'ελια': 'elia', 'ελικοπτερο': 'elikoptero', 'εξωπορτα': 'exoporta', 'ζαμπον': 'zabon',
        'ζαρι': 'zaria', 'ζαρια': 'zaria', 'ζεβρα': 'zevra', 'ζευγαρι': 'zeygari', 'ζωα': 'zoa', 'ζωγραφια': 'zografia', 'ζωο': 'zoo',
        'ηθοποιοσ': 'ithopoios', 'ηλιοσ': 'ilios', 'ημερολογιο': 'imerologio', 'ηπειροσ': 'ipeiros', 'ηρωασ': 'iroas', 'ηφαιστειο': 'ifaisteio',
        'ηχω': 'icho', 'θαλασσα': 'thalassa', 'θεατρο': 'theatro', 'θεοσ': 'theos', 'θερμομετρο': 'thermometro', 'θηριο': 'thirio',
        'θορυβοσ': 'thoryvos', 'θρανιο': 'thranio', 'θυριδα': 'thyrida', 'καδοσ': 'kados', 'καλαθι': 'kalathi', 'καλαμαρι': 'kalamari',
        'καλτσα': 'kaltsa', 'καμηλα': 'kamila', 'καναπεσ': 'kanapes', 'κανατα': 'kanata', 'κανονι': 'kanoni', 'καπακι': 'kapaki', 'καπελο': 'kapelo',
        'καρεκλα': 'karekla', 'καροτο': 'karoto', 'καρπουζι': 'karpouzi', 'καστανο': 'kastano', 'κατσαριδα': 'katsarida', 'καφεσ': 'kafes',
        'κερασι': 'kerasi', 'κερι': 'keri', 'κεφαλη': 'kefali', 'κεφαλι': 'kefali', 'κλαδι': 'kladi', 'κλειδι': 'kleidi', 'κολονα': 'kolona',
        'κοπελα': 'kopela', 'κοτα': 'kota', 'κουδουνι': 'koudouni', 'κουζινα': 'kouzina', 'κουνελι': 'kouneli', 'κουταλι': 'koutali',
        'κουτι': 'kouti', 'κρεβατι': 'krevati', 'κροκοδειλοσ': 'krokodeilos', 'κυμα': 'kyma', 'λαγοσ': 'lagos', 'λαδι': 'ladi',
        'λαχανικα': 'lachanika', 'λεμονι': 'lemoni', 'λεωφορειο': 'leoforeio', 'λιονταρι': 'liodari', 'λουλουδακι': 'louloudaki',
        'λουλουδι': 'louloudi', 'λοφοσ': 'lofos', 'λυκοσ': 'lykos', 'μαιμου': 'maimou', 'μαμα': 'mitera', 'μανιταρι': 'manitari',
        'μαξιλαρι': 'maxilari', 'ματι': 'mati', 'μελι': 'meli', 'μελισσα': 'melissa', 'μηλο': 'milo', 'μητερα': 'mitera', 'μηχανη': 'michani',
        'μια': 'mia', 'μολυβι': 'molyvi', 'μπαλα': 'bala', 'μπαλονι': 'baloni', 'μπανανα': 'banana', 'μπιζελι': 'bizeli', 'μπλε': 'ble',
        'μποτα': 'bota', 'μπουμπουκι': 'boubouki', 'μυρμηγκι': 'myrmigki', 'μυτη': 'myti', 'μωρο': 'moro', 'ναοσ': 'naos', 'νεραιδα': 'neraida',
        'νερο': 'nero', 'νησι': 'nisi', 'νιφαδα': 'nifada', 'νομισμα': 'nomisma', 'νοτα': 'nota', 'νουσ': 'nous', 'ντοματα': 'domata',
        'ντουσ': 'dous', 'νυχι': 'nychi', 'οδηγοσ': 'odigos', 'οδοντοβουρτσα': 'ododovourtsa', 'οδοσ': 'odos', 'οικογενεια': 'oikogeneia',
        'ομελετα': 'omeleta', 'ομπρελα': 'obrela', 'ονειρο': 'oneiro', 'παζαρι': 'pazari', 'πανα': 'pani', 'πανι': 'pani', 'παπακι': 'papaki',
        'παπι': 'papi', 'παπια': 'papia', 'παπουτσι': 'papoutsi', 'παραθυρο': 'parathyro', 'πασχαλιτσα': 'paschalitsa', 'πατατα': 'patata',
        'πεπονι': 'peponi', 'πεταλουδα': 'petalouda', 'πιατο': 'piato', 'πιτα': 'pita', 'πλοιο': 'ploio', 'ποδηλατο': 'podilato', 'ποδι': 'podi',
        'ποντικι': 'podiki', 'ποντικοσ': 'podikos', 'πορτα': 'porta', 'πορτοκαλαδα': 'portokalada', 'πορτοκαλι': 'portokali', 'ποταμι': 'potami',
        'ποτηρι': 'potiri', 'πουλι': 'pouli', 'προβατο': 'provato', 'ραδιοφωνο': 'radiofono', 'ρακετα': 'raketa', 'ριζα': 'riza', 'ροδα': 'roda',
        'ρολοι': 'roloi', 'ρομπα': 'roba', 'ρυζι': 'ryzi', 'σαλατα': 'salata', 'σαλαχι': 'salachi', 'σαλιγκαρι': 'saligkari', 'σαμπουαν': 'sabouan',
        'σανδαλι': 'sandali', 'σαπουνι': 'sapouni', 'σελιδα': 'selida', 'σεντονι': 'sedoni', 'σκαθαρι': 'skathari', 'σκαλα': 'skala',
        'σκουληκι': 'skouliki', 'σκυλακι': 'skylaki', 'σκυλοσ': 'skylos', 'σοκολατα': 'sokolata', 'σπιτι': 'spiti', 'σταφυλι': 'stafyli',
        'στομα': 'stoma', 'συννεφο': 'synnefo', 'σωμα': 'soma', 'ταπα': 'tapa', 'ταυροσ': 'tayros', 'ταψι': 'tapsi', 'τετραδιο': 'tetradio',
        'τηγανι': 'tigani', 'τηλεοραση': 'tileorasi', 'τηλεφωνο': 'tilefono', 'τιγρησ': 'tigris', 'τιμονι': 'timoni', 'τονοσ': 'tonos',
        'τοπι': 'topi', 'τουρτα': 'tourta', 'τρακτερ': 'trakter', 'τραπεζι': 'trapezi', 'τρενο': 'treno', 'τριγωνο': 'trigono', 'τσαντα': 'tsada',
        'τυρι': 'tyri', 'φακοσ': 'fakos', 'φαλαινα': 'falaina', 'φαναρι': 'fanari', 'φασολι': 'fasoli', 'φεγγαρι': 'fengari', 'φιδι': 'fidi',
        'φλιτζανι': 'flitzani', 'φραουλα': 'fraoula', 'φτερο': 'ftero', 'φυλλο': 'fyllo', 'φυλο': 'fylo', 'φωκια': 'fokia', 'φωσ': 'fos',
        'φωτια': 'fotia', 'χαμογελο': 'chamogelo', 'χαρταετοσ': 'chartaetos', 'χαρτησ': 'chartis', 'χαρτι': 'charti', 'χελιδονι': 'chelidoni',
        'χελωνα': 'xelona', 'χερι': 'cheri', 'χιονανθρωποσ': 'chionanthropos', 'χιονι': 'chioni', 'χοροσ': 'choros', 'χταποδι': 'xtapodi',
        'ψαλιδι': 'psalidi', 'ψαρασ': 'psaras', 'ψαρι': 'psari', 'ψητο': 'psito', 'ψιλλοσ': 'psillos', 'ψιψινα': 'gata', 'ψυγειο': 'psygeio',
        'ψωμι': 'psomi',
    };

    // τα κλειδιά περνούν από την ίδια fold() (π.χ. το τελικό ς γίνεται σ), ώστε να ταιριάζουν με τις λέξεις του παιχνιδιού
    const MAP = {}; Object.keys(PICS).forEach((k) => { MAP[fold(k)] = PICS[k]; });

    // αύξησε τον αριθμό όταν αλλάζεις κάποια εικόνα, για να την ξαναφορτώσουν οι browsers
    const V = 9;

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
