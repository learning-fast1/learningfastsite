/* ============================================================
   RHYME FAMILIES — Level 3 ("Βρες τη Ρίμα" and friends)

   RHYME RULE: two words rhyme ONLY if they match from the STRESSED
   syllable to the end, with the SAME stress position — not just a
   shared final vowel or letters. Every word below rhymes with every
   OTHER word in its own family; words never rhyme across families,
   even when they superficially share a final vowel.

   Example of the trap this avoids: "σπίτι" and "κουτί" both end in a
   vowel spelled with iota, but σπίτι is stressed ΣΠΙ-τι (proparoxytone)
   while κουτί is stressed κου-ΤΙ (oxytone) — different stress
   position, so a child hearing them would NOT perceive them as
   rhyming. They must never be paired as a correct answer.

   `easy: true` marks families that rhyme via a shared grammatical
   ending (all -ί oxytones, all -άκι diminutives) — genuinely correct
   rhymes, but a less interesting/instructive rhyme than families like
   -άτα/-όνι/-άρι/-ίδι. Games drawing from this bank should keep easy
   items to at most 1-2 per round.
   ============================================================ */
window.Phono = window.Phono || {};
Phono.data = Phono.data || {};

Phono.data.rhymesL3 = [
    // FAMILY "ί" — oxytone, stress on the final -ί (easy: shared ending)
    { word: "κουτί", family: "ί", easy: true, emoji: "📦" },
    { word: "παπί", family: "ί", easy: true, emoji: "🐥" },
    { word: "ψωμί", family: "ί", easy: true, emoji: "🍞" },
    { word: "κερί", family: "ί", easy: true, emoji: "🕯️" },
    { word: "τυρί", family: "ί", easy: true, emoji: "🧀" },
    { word: "κουμπί", family: "ί", easy: true, emoji: "🔘" },
    { word: "πουλί", family: "ί", easy: true, emoji: "🐦" },
    { word: "κλειδί", family: "ί", easy: true, emoji: "🔑" },
    { word: "χαρτί", family: "ί", easy: true, emoji: "📄" },
    { word: "σκουπί", family: "ί", easy: true, emoji: "🧹" },

    // FAMILY "ό" — oxytone, stress on the final -ό
    { word: "νερό", family: "ό", easy: false, emoji: "💧" },
    { word: "μωρό", family: "ό", easy: false, emoji: "👶" },
    { word: "φτερό", family: "ό", easy: false, emoji: "🪶" },
    { word: "γλυκό", family: "ό", easy: false, emoji: "🍬" },
    { word: "κερό", family: "ό", easy: false, emoji: "🕯️" },
    { word: "χορό", family: "ό", easy: false, emoji: "💃" },

    // FAMILY "άτα" — stress on the penultimate syllable, -άτα
    { word: "πατάτα", family: "άτα", easy: false, emoji: "🥔" },
    { word: "ντομάτα", family: "άτα", easy: false, emoji: "🍅" },
    { word: "σαλάτα", family: "άτα", easy: false, emoji: "🥗" },
    { word: "κανάτα", family: "άτα", easy: false, emoji: "🏺" },
    { word: "γραβάτα", family: "άτα", easy: false, emoji: "👔" },

    // FAMILY "όνι"
    { word: "μπαλόνι", family: "όνι", easy: false, emoji: "🎈" },
    { word: "λεμόνι", family: "όνι", easy: false, emoji: "🍋" },
    { word: "πεπόνι", family: "όνι", easy: false, emoji: "🍈" },
    { word: "σεντόνι", family: "όνι", easy: false, emoji: "🛏️" },
    { word: "τιμόνι", family: "όνι", easy: false, emoji: "🚗" },
    { word: "χελιδόνι", family: "όνι", easy: false, emoji: "🐦" },

    // FAMILY "άρι"
    { word: "φεγγάρι", family: "άρι", easy: false, emoji: "🌙" },
    { word: "φανάρι", family: "άρι", easy: false, emoji: "🏮" },
    { word: "καλαμάρι", family: "άρι", easy: false, emoji: "🦑" },
    { word: "μαξιλάρι", family: "άρι", easy: false, emoji: "🛌" },
    { word: "ζευγάρι", family: "άρι", easy: false, emoji: "👫" },

    // FAMILY "ίδι"
    { word: "φίδι", family: "ίδι", easy: false, emoji: "🐍" },
    { word: "ψαλίδι", family: "ίδι", easy: false, emoji: "✂️" },
    { word: "σκουπίδι", family: "ίδι", easy: false, emoji: "🗑️" },
    { word: "στολίδι", family: "ίδι", easy: false, emoji: "🎄" },

    // FAMILY "άλι"
    { word: "κεφάλι", family: "άλι", easy: false, emoji: "🙂" },
    { word: "κουτάλι", family: "άλι", easy: false, emoji: "🥄" },
    { word: "σανδάλι", family: "άλι", easy: false, emoji: "👡" },

    // FAMILY "έλι"
    { word: "μέλι", family: "έλι", easy: false, emoji: "🍯" },
    { word: "μπιζέλι", family: "έλι", easy: false, emoji: "🫛" },
    { word: "καρβέλι", family: "έλι", easy: false, emoji: "🥖" },

    // FAMILY "όνα"
    { word: "βελόνα", family: "όνα", easy: false, emoji: "🪡" },
    { word: "κολόνα", family: "όνα", easy: false, emoji: "🏛️" },
    { word: "κορόνα", family: "όνα", easy: false, emoji: "👑" },

    // FAMILY "άκι" — diminutives (easy: shared grammatical ending)
    { word: "σκυλάκι", family: "άκι", easy: true, emoji: "🐶" },
    { word: "γατάκι", family: "άκι", easy: true, emoji: "🐱" },
    { word: "σπιτάκι", family: "άκι", easy: true, emoji: "🏠" },
    { word: "ψωμάκι", family: "άκι", easy: true, emoji: "🥐" },
    { word: "δεντράκι", family: "άκι", easy: true, emoji: "🌳" },
    { word: "αστεράκι", family: "άκι", easy: true, emoji: "⭐" },
    { word: "λουλουδάκι", family: "άκι", easy: true, emoji: "🌼" },

    // FAMILY "ούρι" — NOT the same family as "ούδι" below; -ούρι and
    // -ούδι do NOT rhyme with each other despite the shared "ού".
    { word: "κουλούρι", family: "ούρι", easy: false, emoji: "🥨" },
    { word: "ταμπούρι", family: "ούρι", easy: false, emoji: "🥁" },

    // FAMILY "ούδι" — NOT the same family as "ούρι" above.
    { word: "λουλούδι", family: "ούδι", easy: false, emoji: "🌸" },
    { word: "τραγούδι", family: "ούδι", easy: false, emoji: "🎵" },
];

/** All words in one rhyme family (e.g. "άτα" -> πατάτα, ντομάτα, ...). */
Phono.data.rhymesL3ByFamily = function (family) {
    return Phono.data.rhymesL3.filter(w => w.family === family);
};

/** Look up one word's metadata (family/easy/emoji) by its text. */
Phono.data.rhymeL3Word = function (word) {
    return Phono.data.rhymesL3.find(w => w.word === word);
};

/** true if `family` is allowed under the teacher's content selection
 * (Settings -> "Επιλογή Λέξεων & Προτάσεων" -> Phono.app.contentSelection.
 * level3Families). Empty/null selection = no restriction — same
 * convention as level4LetterAllowed() in level4.js. */
Phono.data.rhymeFamilyAllowed = function (family) {
    const selected = Phono.app.contentSelection && Phono.app.contentSelection.level3Families;
    if (!selected || selected.length === 0) return true;
    return selected.includes(family);
};

/** findRhymeItemsL3, restricted to items whose base word's family is
 * allowed — falls back to the full list if that would leave nothing
 * (never let a narrow selection break the game). */
Phono.data.findRhymeItemsL3Pool = function () {
    const filtered = Phono.data.findRhymeItemsL3.filter(item => {
        const meta = Phono.data.rhymeL3Word(item.base);
        return meta && Phono.data.rhymeFamilyAllowed(meta.family);
    });
    return filtered.length > 0 ? filtered : Phono.data.findRhymeItemsL3;
};

/** Same idea as findRhymeItemsL3Pool, for rhymeOddOneOut's curated
 * rhyming/odd triples — filtered by the "rhyming" pair's family (the
 * odd word is, by construction, always from a different family). */
Phono.data.rhymeOddOneOutItemsL3Pool = function () {
    const filtered = Phono.data.rhymeOddOneOutItemsL3.filter(item => {
        const meta = Phono.data.rhymeL3Word(item.rhyming[0]);
        return meta && Phono.data.rhymeFamilyAllowed(meta.family);
    });
    return filtered.length > 0 ? filtered : Phono.data.rhymeOddOneOutItemsL3;
};

/** produceRhymeBasesL3, restricted to bases whose family is allowed —
 * same empty-selection/empty-result fallback as the two pools above. */
Phono.data.produceRhymeBasesL3Pool = function () {
    const filtered = Phono.data.produceRhymeBasesL3.filter(word => {
        const meta = Phono.data.rhymeL3Word(word);
        return meta && Phono.data.rhymeFamilyAllowed(meta.family);
    });
    return filtered.length > 0 ? filtered : Phono.data.produceRhymeBasesL3;
};

/* ----------------------------------------------------------
   «Βρες τη Ρίμα» round data — hand-curated (base | correct | 3
   distractors), NOT auto-generated from the families above, since an
   automatic picker risks a same-family word slipping into the
   distractors by accident. Every distractor here has been checked to
   come from a DIFFERENT family than base/correct.
   ---------------------------------------------------------- */
Phono.data.findRhymeItemsL3 = [
    { base: "πατάτα", correct: "ντομάτα", distractors: ["φεγγάρι", "μπαλόνι", "κουτί"] },
    { base: "φεγγάρι", correct: "καλαμάρι", distractors: ["λεμόνι", "πατάτα", "φίδι"] },
    { base: "μπαλόνι", correct: "λεμόνι", distractors: ["κεφάλι", "γραβάτα", "νερό"] },
    { base: "φίδι", correct: "ψαλίδι", distractors: ["φανάρι", "μπιζέλι", "πουλί"] },
    { base: "κεφάλι", correct: "κουτάλι", distractors: ["σεντόνι", "μωρό", "σαλάτα"] },
    { base: "μέλι", correct: "μπιζέλι", distractors: ["φανάρι", "κουτί", "βελόνα"] },
    { base: "βελόνα", correct: "κολόνα", distractors: ["ψαλίδι", "πεπόνι", "κερί"] },
    { base: "πουλί", correct: "κλειδί", distractors: ["ντομάτα", "φεγγάρι", "κεφάλι"], easy: true },
    { base: "νερό", correct: "φτερό", distractors: ["μπαλόνι", "ψαλίδι", "κανάτα"] },
    { base: "σκυλάκι", correct: "γατάκι", distractors: ["κουτάλι", "λεμόνι", "κερί"], easy: true },
];

/* ----------------------------------------------------------
   «Memory Ρίμες» board data — hand-curated, 6 pairs (12 tiles) per
   board. Two rules baked into the curation, not enforced at runtime:
   (1) both words in a pair share the same family; (2) the 6 families
   on one board are chosen to be clearly distinguishable from each
   other (no two endings a child could mishear as the same one), so
   don't add a 7th pair to a board without rechecking that.
   ---------------------------------------------------------- */
Phono.data.rhymeMemoryBoardsL3 = [
    [ // Board 1 — families: άτα, άρι, ίδι, όνι, άλι, ό
        ["πατάτα", "ντομάτα"],
        ["φεγγάρι", "φανάρι"],
        ["φίδι", "ψαλίδι"],
        ["μπαλόνι", "λεμόνι"],
        ["κεφάλι", "κουτάλι"],
        ["νερό", "φτερό"],
    ],
    [ // Board 2 — families: άτα, άρι, έλι, όνι, όνα, ί
        ["σαλάτα", "γραβάτα"],
        ["καλαμάρι", "μαξιλάρι"],
        ["μέλι", "μπιζέλι"],
        ["σεντόνι", "πεπόνι"],
        ["βελόνα", "κολόνα"],
        ["κουτί", "παπί"],
    ],
];

/* ----------------------------------------------------------
   «Βρες το Διαφορετικό» round data — hand-curated (2 words from the
   SAME family that rhyme | 1 "odd" word from a DIFFERENT family).
   Display order is shuffled per round in the game itself — don't rely
   on `odd` always being listed last here.
   ---------------------------------------------------------- */
Phono.data.rhymeOddOneOutItemsL3 = [
    { rhyming: ["μέλι", "μπιζέλι"], odd: "φίδι" },
    { rhyming: ["πατάτα", "ντομάτα"], odd: "φεγγάρι" },
    { rhyming: ["μπαλόνι", "λεμόνι"], odd: "κουτάλι" },
    { rhyming: ["φίδι", "ψαλίδι"], odd: "νερό" },
    { rhyming: ["φεγγάρι", "καλαμάρι"], odd: "μπιζέλι" },
    { rhyming: ["κεφάλι", "κουτάλι"], odd: "λεμόνι" },
    { rhyming: ["βελόνα", "κολόνα"], odd: "ψαλίδι" },
    { rhyming: ["νερό", "φτερό"], odd: "πατάτα" },
    { rhyming: ["κουτί", "παπί"], odd: "φεγγάρι" },
    { rhyming: ["σαλάτα", "γραβάτα"], odd: "μπαλόνι" },
];

/* ----------------------------------------------------------
   «Φτιάξε Ρίμα» (produceRhyme) target-word pool — one representative
   base word per family, all drawn from Phono.data.rhymesL3 above so
   "accepted answers" and the help-modal scaffold can pull real,
   verified same-family words instead of a separately-maintained list.
   "χιόνι" was considered for -όνι but dropped in favor of the cleaner
   "μπαλόνι" — χιόνι has a συνίζηση some speakers hear as 2 syllables
   and some as 1, which muddies the rhyme for a recognition task.
   ---------------------------------------------------------- */
Phono.data.produceRhymeBasesL3 = [
    "μπαλόνι", "πατάτα", "φεγγάρι", "φίδι", "μέλι", "κεφάλι", "βελόνα", "νερό", "κουτί",
];
