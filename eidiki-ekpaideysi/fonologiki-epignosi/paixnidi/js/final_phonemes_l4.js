/* ============================================================
   FINAL PHONEME BANK — Level 4

   Fields: word, final (the phoneme), type ("vowel"/"cons"), imageable,
   emoji. Greek final sounds are overwhelmingly vowels, plus the -ς
   ending — start with vowels, bring in -ς after, and treat -ν as a
   rare/loanword tail (a handful of items only).
   ============================================================ */
window.Phono = window.Phono || {};
Phono.data = Phono.data || {};

Phono.data.finalPhonemesL4 = [
    // === FINAL VOWEL (type:vowel) — start here, most Greek words end this way ===
    { word: "γάτα", final: "α", type: "vowel", imageable: true, emoji: "🐱" },
    { word: "πατάτα", final: "α", type: "vowel", imageable: true, emoji: "🥔" },
    { word: "κότα", final: "α", type: "vowel", imageable: true, emoji: "🐔" },
    { word: "ντομάτα", final: "α", type: "vowel", imageable: true, emoji: "🍅" },
    { word: "σαλάτα", final: "α", type: "vowel", imageable: true, emoji: "🥗" },
    { word: "καμήλα", final: "α", type: "vowel", imageable: true, emoji: "🐫" },
    { word: "βελόνα", final: "α", type: "vowel", imageable: true, emoji: "🪡" },
    { word: "ρόδα", final: "α", type: "vowel", imageable: true, emoji: "🛞" },

    { word: "νερό", final: "ο", type: "vowel", imageable: true, emoji: "💧" },
    { word: "μωρό", final: "ο", type: "vowel", imageable: true, emoji: "👶" },
    { word: "δώρο", final: "ο", type: "vowel", imageable: true, emoji: "🎁" },
    { word: "φτερό", final: "ο", type: "vowel", imageable: true, emoji: "🪶" },
    { word: "βουνό", final: "ο", type: "vowel", imageable: true, emoji: "⛰️" },
    { word: "μήλο", final: "ο", type: "vowel", imageable: true, emoji: "🍎" },
    { word: "βάζο", final: "ο", type: "vowel", imageable: true, emoji: "🏺" },
    { word: "τόπι", final: "ι", type: "vowel", imageable: true, emoji: "⚽" },

    { word: "σπίτι", final: "ι", type: "vowel", imageable: true, emoji: "🏠" },
    { word: "κλειδί", final: "ι", type: "vowel", imageable: true, emoji: "🔑" },
    { word: "παπί", final: "ι", type: "vowel", imageable: true, emoji: "🐥" },
    { word: "φίδι", final: "ι", type: "vowel", imageable: true, emoji: "🐍" },
    { word: "ψαλίδι", final: "ι", type: "vowel", imageable: true, emoji: "✂️" },
    { word: "τυρί", final: "ι", type: "vowel", imageable: true, emoji: "🧀" },
    { word: "κουτί", final: "ι", type: "vowel", imageable: true, emoji: "📦" },
    { word: "μέλι", final: "ι", type: "vowel", imageable: true, emoji: "🍯" },
    { word: "νύχι", final: "ι", type: "vowel", imageable: true, emoji: "💅" },
    { word: "κερί", final: "ι", type: "vowel", imageable: true, emoji: "🕯️" },

    { word: "μαϊμού", final: "ου", type: "vowel", imageable: true, emoji: "🐒" },
    { word: "αλεπού", final: "ου", type: "vowel", imageable: true, emoji: "🦊" },

    { word: "κεφαλή", final: "η", type: "vowel", imageable: true, emoji: "🙂" },
    { word: "αυγή", final: "η", type: "vowel", imageable: true, emoji: "🌅" },

    // === FINAL CONSONANT (type:cons) ===
    // -ς (/s/) — the main consonant ending, large family
    { word: "λύκος", final: "ς", type: "cons", imageable: true, emoji: "🐺" },
    { word: "δρόμος", final: "ς", type: "cons", imageable: true, emoji: "🛣️" },
    { word: "τόνος", final: "ς", type: "cons", imageable: true, emoji: "🐟" },
    { word: "ήλιος", final: "ς", type: "cons", imageable: true, emoji: "☀️" },
    { word: "δάσος", final: "ς", type: "cons", imageable: true, emoji: "🌲" },
    { word: "λόφος", final: "ς", type: "cons", imageable: true, emoji: "⛰️" },
    { word: "κάδος", final: "ς", type: "cons", imageable: true, emoji: "🗑️" },
    { word: "ελέφαντας", final: "ς", type: "cons", imageable: true, emoji: "🐘" },
    { word: "ουρανός", final: "ς", type: "cons", imageable: true, emoji: "🌌" },
    { word: "ποντικός", final: "ς", type: "cons", imageable: true, emoji: "🐭" },
    { word: "σκύλος", final: "ς", type: "cons", imageable: true, emoji: "🐶" },
    { word: "βάτραχος", final: "ς", type: "cons", imageable: true, emoji: "🐸" },
    { word: "ανανάς", final: "ς", type: "cons", imageable: true, emoji: "🍍" },
    { word: "χαρταετός", final: "ς", type: "cons", imageable: true, emoji: "🪁" },
    { word: "τίγρης", final: "ς", type: "cons", imageable: true, emoji: "🐯" },
    { word: "γάιδαρος", final: "ς", type: "cons", imageable: true, emoji: "🫏" },
    { word: "δράκος", final: "ς", type: "cons", imageable: true, emoji: "🐉" },
    { word: "ζελές", final: "ς", type: "cons", imageable: true, emoji: "🍮" },
    { word: "ζωγράφος", final: "ς", type: "cons", imageable: true, emoji: "🎨" },
    { word: "θησαυρός", final: "ς", type: "cons", imageable: true, emoji: "💰" },
    { word: "θρόνος", final: "ς", type: "cons", imageable: true, emoji: "👑" },
    { word: "λαγός", final: "ς", type: "cons", imageable: true, emoji: "🐇" },
    { word: "φακός", final: "ς", type: "cons", imageable: true, emoji: "🔦" },
    { word: "φούρνος", final: "ς", type: "cons", imageable: true, emoji: "🔥" },
    { word: "χάρτης", final: "ς", type: "cons", imageable: true, emoji: "🗺️" },
    { word: "χορός", final: "ς", type: "cons", imageable: true, emoji: "💃" },
    { word: "ψαράς", final: "ς", type: "cons", imageable: true, emoji: "🎣" },
    { word: "καφές", final: "ς", type: "cons", imageable: true, emoji: "☕" },
    { word: "καναπές", final: "ς", type: "cons", imageable: true, emoji: "🛋️" },
    { word: "κουβάς", final: "ς", type: "cons", imageable: true, emoji: "🪣" },
    { word: "αετός", final: "ς", type: "cons", imageable: true, emoji: "🦅" },
    { word: "κροκόδειλος", final: "ς", type: "cons", imageable: true, emoji: "🐊" },
    { word: "ταύρος", final: "ς", type: "cons", imageable: true, emoji: "🐂" },
    { word: "τοίχος", final: "ς", type: "cons", imageable: true, emoji: "🧱" },
    { word: "ντους", final: "ς", type: "cons", imageable: true, emoji: "🚿" },
    { word: "φως", final: "ς", type: "cons", imageable: true, emoji: "💡" },
    { word: "πλανήτης", final: "ς", type: "cons", imageable: true, emoji: "🪐" },
    { word: "χιονάνθρωπος", final: "ς", type: "cons", imageable: true, emoji: "⛄" },
    { word: "οδηγός", final: "ς", type: "cons", imageable: true, emoji: "🚗" },

    // -ν (/n/) — rare, mostly loanwords; keep this family small
    { word: "ζαμπόν", final: "ν", type: "cons", imageable: true, emoji: "🥓" },
    { word: "σαμπουάν", final: "ν", type: "cons", imageable: true, emoji: "🧴" },
];

/** All imageable words sharing one final phoneme (e.g. "α" -> γάτα,
 * πατάτα, ...). */
Phono.data.finalPhonemesL4ByPhoneme = function (phoneme) {
    return Phono.data.finalPhonemesL4.filter(w => w.final === phoneme && w.imageable);
};
