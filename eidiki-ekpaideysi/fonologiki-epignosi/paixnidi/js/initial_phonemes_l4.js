/* ============================================================
   INITIAL PHONEME BANK — Level 4

   RULE: this level works with SOUNDS, not letters. Every word here has
   been checked so its first LETTER and first SOUND are the same thing
   — safe to represent with a single-letter button. Never add a word
   whose first sound is actually a digraph or cluster:
     - vowel digraphs at the start: ου, αι, ει, οι, αυ, ευ
     - consonant digraphs: μπ (=/b/), ντ (=/d/), γκ, τσ, τζ
     - ξ (=/ks/), ψ (=/ps/) — not a single-letter sound at all
     - γ before ε/ι (=/j/, as in γίδα/γελάω) — different sound from
       plain /γ/ (γάτα)

   Fields: word, initial (the phoneme), type ("cont"=continuant /
   "stop" / "vowel"), onsetVowel (true if a vowel follows the initial
   sound — every entry below is a simple word like this; false is
   reserved for a future consonant-cluster addition, e.g. "φράουλα"),
   imageable, emoji.
   ============================================================ */
window.Phono = window.Phono || {};
Phono.data = Phono.data || {};

Phono.data.initialPhonemesL4 = [
    // === CONTINUANTS (type:cont) — start here ===
    { word: "μήλο", initial: "μ", type: "cont", onsetVowel: true, imageable: true, emoji: "🍎" },
    { word: "μαμά", initial: "μ", type: "cont", onsetVowel: true, imageable: true, emoji: "👩" },
    { word: "μωρό", initial: "μ", type: "cont", onsetVowel: true, imageable: true, emoji: "👶" },
    { word: "μέλι", initial: "μ", type: "cont", onsetVowel: true, imageable: true, emoji: "🍯" },
    { word: "μύτη", initial: "μ", type: "cont", onsetVowel: true, imageable: true, emoji: "👃" },
    { word: "μολύβι", initial: "μ", type: "cont", onsetVowel: true, imageable: true, emoji: "✏️" },
    { word: "μαϊμού", initial: "μ", type: "cont", onsetVowel: true, imageable: true, emoji: "🐒" },
    { word: "μάτι", initial: "μ", type: "cont", onsetVowel: true, imageable: true, emoji: "👁️" },
    { word: "μανιτάρι", initial: "μ", type: "cont", onsetVowel: true, imageable: true, emoji: "🍄" },
    { word: "μέλισσα", initial: "μ", type: "cont", onsetVowel: true, imageable: true, emoji: "🐝" },

    { word: "νερό", initial: "ν", type: "cont", onsetVowel: true, imageable: true, emoji: "💧" },
    { word: "νύχι", initial: "ν", type: "cont", onsetVowel: true, imageable: true, emoji: "💅" },
    { word: "νότα", initial: "ν", type: "cont", onsetVowel: true, imageable: true, emoji: "🎵" },
    { word: "νεράιδα", initial: "ν", type: "cont", onsetVowel: true, imageable: true, emoji: "🧚" },
    { word: "νησί", initial: "ν", type: "cont", onsetVowel: true, imageable: true, emoji: "🏝️" },
    { word: "ναός", initial: "ν", type: "cont", onsetVowel: true, imageable: true, emoji: "⛩️" },

    { word: "λεμόνι", initial: "λ", type: "cont", onsetVowel: true, imageable: true, emoji: "🍋" },
    { word: "λάδι", initial: "λ", type: "cont", onsetVowel: true, imageable: true, emoji: "🫒" },
    { word: "λουλούδι", initial: "λ", type: "cont", onsetVowel: true, imageable: true, emoji: "🌸" },
    { word: "λύκος", initial: "λ", type: "cont", onsetVowel: true, imageable: true, emoji: "🐺" },
    { word: "λαγός", initial: "λ", type: "cont", onsetVowel: true, imageable: true, emoji: "🐇" },
    { word: "λιοντάρι", initial: "λ", type: "cont", onsetVowel: true, imageable: true, emoji: "🦁" },

    { word: "ρόδα", initial: "ρ", type: "cont", onsetVowel: true, imageable: true, emoji: "🛞" },
    { word: "ρολόι", initial: "ρ", type: "cont", onsetVowel: true, imageable: true, emoji: "⏰" },
    { word: "ρύζι", initial: "ρ", type: "cont", onsetVowel: true, imageable: true, emoji: "🍚" },
    { word: "ραδιόφωνο", initial: "ρ", type: "cont", onsetVowel: true, imageable: true, emoji: "📻" },
    { word: "ρακέτα", initial: "ρ", type: "cont", onsetVowel: true, imageable: true, emoji: "🎾" },

    // (ΟΧΙ σπ/στ/σκ!)
    { word: "σαλάτα", initial: "σ", type: "cont", onsetVowel: true, imageable: true, emoji: "🥗" },
    { word: "σαπούνι", initial: "σ", type: "cont", onsetVowel: true, imageable: true, emoji: "🧼" },
    { word: "σελίδα", initial: "σ", type: "cont", onsetVowel: true, imageable: true, emoji: "📄" },
    { word: "σύννεφο", initial: "σ", type: "cont", onsetVowel: true, imageable: true, emoji: "☁️" },
    { word: "σανδάλι", initial: "σ", type: "cont", onsetVowel: true, imageable: true, emoji: "👡" },
    { word: "σαλάχι", initial: "σ", type: "cont", onsetVowel: true, imageable: true, emoji: "🐠" },

    // (ΟΧΙ φρ/φτ!)
    { word: "φίδι", initial: "φ", type: "cont", onsetVowel: true, imageable: true, emoji: "🐍" },
    { word: "φεγγάρι", initial: "φ", type: "cont", onsetVowel: true, imageable: true, emoji: "🌙" },
    { word: "φανάρι", initial: "φ", type: "cont", onsetVowel: true, imageable: true, emoji: "🏮" },
    { word: "φασόλι", initial: "φ", type: "cont", onsetVowel: true, imageable: true, emoji: "🫘" },
    { word: "φώκια", initial: "φ", type: "cont", onsetVowel: true, imageable: true, emoji: "🦭" },

    { word: "θάλασσα", initial: "θ", type: "cont", onsetVowel: true, imageable: true, emoji: "🌊" },
    { word: "θεός", initial: "θ", type: "cont", onsetVowel: true, imageable: false, emoji: "⚡" },
    { word: "θυρίδα", initial: "θ", type: "cont", onsetVowel: true, imageable: true, emoji: "📬" },

    // (ΟΧΙ χτ!)
    { word: "χέρι", initial: "χ", type: "cont", onsetVowel: true, imageable: true, emoji: "✋" },
    { word: "χαρτί", initial: "χ", type: "cont", onsetVowel: true, imageable: true, emoji: "📃" },
    { word: "χελώνα", initial: "χ", type: "cont", onsetVowel: true, imageable: true, emoji: "🐢" },
    { word: "χορός", initial: "χ", type: "cont", onsetVowel: true, imageable: true, emoji: "💃" },
    { word: "χαρταετός", initial: "χ", type: "cont", onsetVowel: true, imageable: true, emoji: "🪁" },

    { word: "ζάρι", initial: "ζ", type: "cont", onsetVowel: true, imageable: true, emoji: "🎲" },
    { word: "ζώο", initial: "ζ", type: "cont", onsetVowel: true, imageable: true, emoji: "🐾" },
    { word: "ζαμπόν", initial: "ζ", type: "cont", onsetVowel: true, imageable: true, emoji: "🥓" },
    { word: "ζωγραφιά", initial: "ζ", type: "cont", onsetVowel: true, imageable: true, emoji: "🎨" },
    { word: "ζέβρα", initial: "ζ", type: "cont", onsetVowel: true, imageable: true, emoji: "🦓" },

    { word: "βάζο", initial: "β", type: "cont", onsetVowel: true, imageable: true, emoji: "🏺" },
    { word: "βίδα", initial: "β", type: "cont", onsetVowel: true, imageable: true, emoji: "🔩" },
    { word: "βελόνα", initial: "β", type: "cont", onsetVowel: true, imageable: true, emoji: "🪡" },
    { word: "βουνό", initial: "β", type: "cont", onsetVowel: true, imageable: true, emoji: "⛰️" },
    { word: "βάρκα", initial: "β", type: "cont", onsetVowel: true, imageable: true, emoji: "🛶" },
    { word: "βατόμουρο", initial: "β", type: "cont", onsetVowel: true, imageable: true, emoji: "🫐" },

    // ΜΟΝΟ γ+α/ο/ου — ΟΧΙ γ+ε/ι (=/j/)!
    { word: "γάτα", initial: "γ", type: "cont", onsetVowel: true, imageable: true, emoji: "🐱" },
    { word: "γάλα", initial: "γ", type: "cont", onsetVowel: true, imageable: true, emoji: "🥛" },
    { word: "γόμα", initial: "γ", type: "cont", onsetVowel: true, imageable: true, emoji: "🧽" },
    { word: "γουρούνι", initial: "γ", type: "cont", onsetVowel: true, imageable: true, emoji: "🐷" },
    { word: "γάιδαρος", initial: "γ", type: "cont", onsetVowel: true, imageable: true, emoji: "🫏" },

    // === STOPS (type:stop) — after the continuants ===
    { word: "πάπια", initial: "π", type: "stop", onsetVowel: true, imageable: true, emoji: "🦆" },
    { word: "πόδι", initial: "π", type: "stop", onsetVowel: true, imageable: true, emoji: "🦶" },
    { word: "πίτα", initial: "π", type: "stop", onsetVowel: true, imageable: true, emoji: "🫓" },
    { word: "πατάτα", initial: "π", type: "stop", onsetVowel: true, imageable: true, emoji: "🥔" },
    { word: "πεπόνι", initial: "π", type: "stop", onsetVowel: true, imageable: true, emoji: "🍈" },
    { word: "ποτάμι", initial: "π", type: "stop", onsetVowel: true, imageable: true, emoji: "🏞️" },
    { word: "παπί", initial: "π", type: "stop", onsetVowel: true, imageable: true, emoji: "🐥" },
    { word: "πουλί", initial: "π", type: "stop", onsetVowel: true, imageable: true, emoji: "🐦" },

    { word: "τυρί", initial: "τ", type: "stop", onsetVowel: true, imageable: true, emoji: "🧀" },
    { word: "τόπι", initial: "τ", type: "stop", onsetVowel: true, imageable: true, emoji: "⚽" },
    { word: "τόνος", initial: "τ", type: "stop", onsetVowel: true, imageable: true, emoji: "🐟" },
    { word: "τηγάνι", initial: "τ", type: "stop", onsetVowel: true, imageable: true, emoji: "🍳" },
    { word: "τιμόνι", initial: "τ", type: "stop", onsetVowel: true, imageable: true, emoji: "🚗" },
    { word: "τούρτα", initial: "τ", type: "stop", onsetVowel: true, imageable: true, emoji: "🎂" },

    { word: "κότα", initial: "κ", type: "stop", onsetVowel: true, imageable: true, emoji: "🐔" },
    { word: "κερί", initial: "κ", type: "stop", onsetVowel: true, imageable: true, emoji: "🕯️" },
    { word: "κεφάλι", initial: "κ", type: "stop", onsetVowel: true, imageable: true, emoji: "🙂" },
    { word: "καπέλο", initial: "κ", type: "stop", onsetVowel: true, imageable: true, emoji: "🎩" },
    { word: "καρότο", initial: "κ", type: "stop", onsetVowel: true, imageable: true, emoji: "🥕" },
    { word: "καρπούζι", initial: "κ", type: "stop", onsetVowel: true, imageable: true, emoji: "🍉" },
    { word: "κανάτα", initial: "κ", type: "stop", onsetVowel: true, imageable: true, emoji: "🫖" },
    { word: "κουτί", initial: "κ", type: "stop", onsetVowel: true, imageable: true, emoji: "📦" },
    { word: "καμήλα", initial: "κ", type: "stop", onsetVowel: true, imageable: true, emoji: "🐫" },

    { word: "δόντι", initial: "δ", type: "stop", onsetVowel: true, imageable: true, emoji: "🦷" },
    { word: "δώρο", initial: "δ", type: "stop", onsetVowel: true, imageable: true, emoji: "🎁" },
    { word: "δάσος", initial: "δ", type: "stop", onsetVowel: true, imageable: true, emoji: "🌲" },
    { word: "δελφίνι", initial: "δ", type: "stop", onsetVowel: true, imageable: true, emoji: "🐬" },

    // === VOWELS (type:vowel) — the initial sound IS the vowel ===
    { word: "αστέρι", initial: "α", type: "vowel", onsetVowel: true, imageable: true, emoji: "⭐" },
    { word: "αγελάδα", initial: "α", type: "vowel", onsetVowel: true, imageable: true, emoji: "🐄" },
    { word: "αλεπού", initial: "α", type: "vowel", onsetVowel: true, imageable: true, emoji: "🦊" },
    { word: "άλογο", initial: "α", type: "vowel", onsetVowel: true, imageable: true, emoji: "🐴" },

    { word: "ελέφαντας", initial: "ε", type: "vowel", onsetVowel: true, imageable: true, emoji: "🐘" },
    { word: "έλατο", initial: "ε", type: "vowel", onsetVowel: true, imageable: true, emoji: "🎄" },
    { word: "ελιά", initial: "ε", type: "vowel", onsetVowel: true, imageable: true, emoji: "🫒" },

    { word: "ομπρέλα", initial: "ο", type: "vowel", onsetVowel: true, imageable: true, emoji: "☂️" },
];

/** All imageable words sharing one initial phoneme (e.g. "μ" -> μήλο,
 * μαμά, ...). */
Phono.data.initialPhonemesL4ByPhoneme = function (phoneme) {
    return Phono.data.initialPhonemesL4.filter(w => w.initial === phoneme && w.imageable);
};

/* ----------------------------------------------------------
   «Ομαδοποίησε» board data — 3 boards, 3 sound-groups x 2 words each.
   Every word below exists in Phono.data.initialPhonemesL4 above (the
   game looks up its emoji/type from there, not duplicated here).
   ---------------------------------------------------------- */
Phono.data.groupBySoundBoardsL4 = [
    [
        { phoneme: "μ", words: ["μολύβι", "μαϊμού"] },
        { phoneme: "κ", words: ["καρότο", "καρπούζι"] },
        { phoneme: "ν", words: ["νεράιδα", "νερό"] },
    ],
    [
        { phoneme: "σ", words: ["σαλάτα", "σαπούνι"] },
        { phoneme: "φ", words: ["φίδι", "φεγγάρι"] },
        { phoneme: "λ", words: ["λεμόνι", "λουλούδι"] },
    ],
    [
        { phoneme: "β", words: ["βάζο", "βουνό"] },
        { phoneme: "γ", words: ["γάτα", "γάλα"] },
        { phoneme: "ρ", words: ["ρόδα", "ρολόι"] },
    ],
];

/* ----------------------------------------------------------
   «Ο Παρείσακτος» round data — 3 words sharing an initial sound + 1
   "odd" word starting differently. "γραβάτα" is used once as an odd
   word on purpose — it's a real γ-word but starts with the cluster γρ,
   so it doesn't belong in the clean single-letter bank above, but
   works fine here purely as a contrast (see level4WordEmoji in
   level4.js for its emoji).
   ---------------------------------------------------------- */
Phono.data.soundOddOneOutItemsL4 = [
    { same: ["φίδι", "φεγγάρι", "φανάρι"], odd: "γραβάτα" },
    { same: ["μήλο", "μαμά", "μέλι"], odd: "νερό" },
    { same: ["κότα", "καπέλο", "καρότο"], odd: "φίδι" },
    { same: ["σαλάτα", "σαπούνι", "σελίδα"], odd: "βουνό" },
    { same: ["νερό", "νύχι", "νότα"], odd: "μήλο" },
];
