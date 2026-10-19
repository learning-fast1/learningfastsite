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

    // FAMILY "ό" — oxytone, stress on the final -ό
    { word: "νερό", family: "ό", easy: false, emoji: "💧" },
    { word: "μωρό", family: "ό", easy: false, emoji: "👶" },
    { word: "φτερό", family: "ό", easy: false, emoji: "🪶" },
    { word: "γλυκό", family: "ό", easy: false, emoji: "🍬" },
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
    // FAMILY "ήμα" — new words from the educator's rhyme list
    { word: "κύμα", family: "ήμα", emoji: "🌊" },
    // FAMILY "άτα" — new words from the educator's rhyme list
    { word: "γάτα", family: "άτα", emoji: "🐱" },
    // FAMILY "άλα" — new words from the educator's rhyme list
    { word: "σκάλα", family: "άλα", emoji: "🪜" },
    { word: "μπάλα", family: "άλα", emoji: "⚽" },
    { word: "γάλα", family: "άλα", emoji: "🥛" },
    // FAMILY "ίνι" — new words from the educator's rhyme list
    { word: "δελφίνι", family: "ίνι", emoji: "🐬" },
    // FAMILY "όμα" — new words from the educator's rhyme list
    { word: "γόμα", family: "όμα", emoji: "▫️" },
    { word: "στόμα", family: "όμα", emoji: "👄" },
    // FAMILY "άνα" — new words from the educator's rhyme list
    { word: "μπανάνα", family: "άνα", emoji: "🍌" },
    { word: "καμπάνα", family: "άνα", emoji: "🔔" },
    // FAMILY "ό" — new words from the educator's rhyme list
    { word: "ψητό", family: "ό", emoji: "🍖" },
    // FAMILY "έρι" — new words from the educator's rhyme list
    { word: "χέρι", family: "έρι", emoji: "🤚" },
    { word: "αστέρι", family: "έρι", emoji: "⭐" },
    // FAMILY "ί" — new words from the educator's rhyme list
    { word: "βροχή", family: "ί", easy: true, emoji: "🌧️" },
    { word: "εξοχή", family: "ί", easy: true, emoji: "🏞️" },
    // FAMILY "ίτσα" — new words from the educator's rhyme list
    { word: "πίτσα", family: "ίτσα", emoji: "🍕" },
    // FAMILY "άδι" — new words from the educator's rhyme list
    { word: "λάδι", family: "άδι", emoji: "🛢️" },
    { word: "αχλάδι", family: "άδι", emoji: "🍐" },
    // FAMILY "ίκι" — new words from the educator's rhyme list
    { word: "ποντίκι", family: "ίκι", emoji: "🐭" },
    // FAMILY "άδα" — new words from the educator's rhyme list
    { word: "αγελάδα", family: "άδα", emoji: "🐄" },
    // FAMILY "ίδι" — new words from the educator's rhyme list
    { word: "φρύδι", family: "ίδι", emoji: "🤨" },
    // FAMILY "ίδα" — new words from the educator's rhyme list
    { word: "βίδα", family: "ίδα", emoji: "🔩" },
    // FAMILY "είο" — new words from the educator's rhyme list
    { word: "ψυγείο", family: "είο", emoji: "🧊" },
    // FAMILY "άρι" — new words from the educator's rhyme list
    { word: "ζάρι", family: "άρι", emoji: "🎲" },
    { word: "ψάρι", family: "άρι", emoji: "🐟" },
    // FAMILY "έλι" — new words from the educator's rhyme list
    { word: "κουνέλι", family: "έλι", emoji: "🐰" },
    // FAMILY "ότα" — new words from the educator's rhyme list
    { word: "μπότα", family: "ότα", emoji: "🥾" },
    { word: "κότα", family: "ότα", emoji: "🐔" },
    // FAMILY "άμι" — new words from the educator's rhyme list
    { word: "ποτάμι", family: "άμι", emoji: "🏞️" },
    // FAMILY "άντα" — new words from the educator's rhyme list
    { word: "τσάντα", family: "άντα", emoji: "👜" },
    // FAMILY "όνα" — new words from the educator's rhyme list
    { word: "χελώνα", family: "όνα", emoji: "🐢" },
    // FAMILY "ούπα" — new words from the educator's rhyme list
    { word: "κούπα", family: "ούπα", emoji: "🍵" },
    { word: "σκούπα", family: "ούπα", emoji: "🧹" },
    // FAMILY "άνι" — new words from the educator's rhyme list
    { word: "τηγάνι", family: "άνι", emoji: "🍳" },
    // FAMILY "άσι" — new words from the educator's rhyme list
    { word: "κεράσι", family: "άσι", emoji: "🍒" },
    // FAMILY "ύλος" — new words from the educator's rhyme list
    { word: "σκύλος", family: "ύλος", emoji: "🐶" },
    // FAMILY "ιά" — new words from the educator's rhyme list
    { word: "ελιά", family: "ιά", emoji: "🫒" },
    // FAMILY "όνος" — new words from the educator's rhyme list
    { word: "τόνος", family: "όνος", emoji: "🐟" },
    // FAMILY "έτα" — new words from the educator's rhyme list
    { word: "ομελέτα", family: "έτα", emoji: "🍳" },
    // FAMILY "όδι" — new words from the educator's rhyme list
    { word: "ρόδι", family: "όδι", emoji: "🥭" },
    { word: "πόδι", family: "όδι", emoji: "🦶" },
    // FAMILY "άτι" — new words from the educator's rhyme list
    { word: "μάτι", family: "άτι", emoji: "👁️" },
    // FAMILY "έλα" — new words from the educator's rhyme list
    { word: "ομπρέλα", family: "έλα", emoji: "☂️" },
    // FAMILY "έμα" — new words from the educator's rhyme list
    { word: "δέμα", family: "έμα", emoji: "📦" },
    // FAMILY "όμα" — new words from the educator's rhyme list
    { word: "σώμα", family: "όμα", emoji: "🧍" },
    // FAMILY "έντρο" — new words from the educator's rhyme list
    { word: "δέντρο", family: "έντρο", emoji: "🌳" },
    // FAMILY "ήμα" — new words from the educator's rhyme list
    { word: "σήμα", family: "ήμα", emoji: "🛑" },
    { word: "νήμα", family: "ήμα", emoji: "🧵" },
    { word: "λίμα", family: "ήμα", emoji: "🔧" },
    // FAMILY "άτα" — new words from the educator's rhyme list
    { word: "πιάτα", family: "άτα", emoji: "🍽️" },
    // FAMILY "ήλα" — new words from the educator's rhyme list
    { word: "μήλα", family: "ήλα", emoji: "🍎" },
    { word: "φύλλα", family: "ήλα", emoji: "🍂" },
    { word: "πιπίλα", family: "ήλα", emoji: "🍼" },
    { word: "ξύλα", family: "ήλα", emoji: "🪵" },
    // FAMILY "ίνι" — new words from the educator's rhyme list
    { word: "πίνει", family: "ίνι", emoji: "🥤" },
    { word: "δίνει", family: "ίνι", emoji: "🎁" },
    { word: "καναρίνι", family: "ίνι", emoji: "🐤" },
    // FAMILY "όμα" — new words from the educator's rhyme list
    { word: "χρώμα", family: "όμα", emoji: "🎨" },
    { word: "πώμα", family: "όμα", emoji: "🍾" },
    { word: "χώμα", family: "όμα", emoji: "🟤" },
    // FAMILY "άνα" — new words from the educator's rhyme list
    { word: "μελιτζάνα", family: "άνα", emoji: "🍆" },
    // FAMILY "αία" — new words from the educator's rhyme list
    { word: "σημαία", family: "αία", emoji: "🇬🇷" },
    { word: "κεραία", family: "αία", emoji: "📡" },
    // FAMILY "ό" — new words from the educator's rhyme list
    { word: "κινητό", family: "ό", emoji: "📱" },
    { word: "φαγητό", family: "ό", emoji: "🍝" },
    { word: "φυτό", family: "ό", emoji: "🪴" },
    // FAMILY "άνος" — new words from the educator's rhyme list
    { word: "κράνος", family: "άνος", emoji: "⛑️" },
    { word: "νάνος", family: "άνος", emoji: "🧙" },
    // FAMILY "έρι" — new words from the educator's rhyme list
    { word: "κασέρι", family: "έρι", emoji: "🧀" },
    { word: "πιπέρι", family: "έρι", emoji: "🫑" },
    { word: "ταίρι", family: "έρι", emoji: "👫" },
    { word: "μαχαίρι", family: "έρι", emoji: "🔪" },
    // FAMILY "ωτός" — new words from the educator's rhyme list
    { word: "λωτός", family: "ωτός", emoji: "🍊" },
    { word: "κιβωτός", family: "ωτός", emoji: "🚢" },
    // FAMILY "ίτσα" — new words from the educator's rhyme list
    { word: "σκίτσα", family: "ίτσα", emoji: "✏️" },
    // FAMILY "άδι" — new words from the educator's rhyme list
    { word: "κοπάδι", family: "άδι", emoji: "🐑" },
    { word: "λιβάδι", family: "άδι", emoji: "🌾" },
    { word: "σκοτάδι", family: "άδι", emoji: "🌑" },
    { word: "πηγάδι", family: "άδι", emoji: "🕳️" },
    // FAMILY "ίκι" — new words from the educator's rhyme list
    { word: "αποθήκη", family: "ίκι", emoji: "🏚️" },
    { word: "βιβλιοθήκη", family: "ίκι", emoji: "📚" },
    { word: "φιστίκι", family: "ίκι", emoji: "🥜" },
    { word: "θήκη", family: "ίκι", emoji: "📱" },
    // FAMILY "ιέρα" — new words from the educator's rhyme list
    { word: "μπανιέρα", family: "ιέρα", emoji: "🛁" },
    { word: "καφετιέρα", family: "ιέρα", emoji: "☕" },
    // FAMILY "ίση" — new words from the educator's rhyme list
    { word: "φύση", family: "ίση", emoji: "🏞️" },
    { word: "πτήση", family: "ίση", emoji: "✈️" },
    // FAMILY "άδα" — new words from the educator's rhyme list
    { word: "λεμονάδα", family: "άδα", emoji: "🍋" },
    { word: "μακαρονάδα", family: "άδα", emoji: "🍝" },
    { word: "βαρκάδα", family: "άδα", emoji: "🚣" },
    // FAMILY "ήρι" — new words from the educator's rhyme list
    { word: "σουρωτήρι", family: "ήρι", emoji: "🥣" },
    { word: "ξυπνητήρι", family: "ήρι", emoji: "⏰" },
    // FAMILY "όνι" — new words from the educator's rhyme list
    { word: "βαγόνι", family: "όνι", emoji: "🚃" },
    { word: "βελόνι", family: "όνι", emoji: "🪡" },
    { word: "σαλόνι", family: "όνι", emoji: "🛋️" },
    { word: "ζώνη", family: "όνι", emoji: "🥋" },
    { word: "πιόνι", family: "όνι", emoji: "♟️" },
    { word: "παγόνι", family: "όνι", emoji: "🦚" },
    // FAMILY "ίδι" — new words from the educator's rhyme list
    { word: "παιχνίδι", family: "ίδι", emoji: "🧸" },
    { word: "κρεμμύδι", family: "ίδι", emoji: "🧅" },
    { word: "ξύδι", family: "ίδι", emoji: "🍾" },
    { word: "μύδι", family: "ίδι", emoji: "🦪" },
    // FAMILY "ίδα" — new words from the educator's rhyme list
    { word: "ακρίδα", family: "ίδα", emoji: "🦗" },
    { word: "ασπίδα", family: "ίδα", emoji: "🛡️" },
    { word: "γίδα", family: "ίδα", emoji: "🐐" },
    { word: "καρύδα", family: "ίδα", emoji: "🥥" },
    { word: "λεπίδα", family: "ίδα", emoji: "🪒" },
    { word: "γαρίδα", family: "ίδα", emoji: "🦐" },
    // FAMILY "είο" — new words from the educator's rhyme list
    { word: "φορείο", family: "είο", emoji: "🚑" },
    { word: "δοχείο", family: "είο", emoji: "🥡" },
    { word: "σχολείο", family: "είο", emoji: "🏫" },
    { word: "ηχείο", family: "είο", emoji: "🔊" },
    { word: "λαχείο", family: "είο", emoji: "🎟️" },
    // FAMILY "ένα" — new words from the educator's rhyme list
    { word: "τρένα", family: "ένα", emoji: "🚂" },
    { word: "πένα", family: "ένα", emoji: "🖊️" },
    { word: "ένα", family: "ένα", emoji: "1️⃣" },
    // FAMILY "άρι" — new words from the educator's rhyme list
    { word: "βάρη", family: "άρι", emoji: "🏋️" },
    { word: "σιτάρι", family: "άρι", emoji: "🌾" },
    { word: "θυμάρι", family: "άρι", emoji: "🌿" },
    // FAMILY "άμι" — new words from the educator's rhyme list
    { word: "σαλάμι", family: "άμι", emoji: "🥓" },
    // FAMILY "άντα" — new words from the educator's rhyme list
    { word: "πάντα", family: "άντα", emoji: "🐼" },
    // FAMILY "όλα" — new words from the educator's rhyme list
    { word: "μπριζόλα", family: "όλα", emoji: "🥩" },
    // FAMILY "ούπα" — new words from the educator's rhyme list
    { word: "σούπα", family: "ούπα", emoji: "🥣" },
    // FAMILY "άνι" — new words from the educator's rhyme list
    { word: "τρυπάνι", family: "άνι", emoji: "🔧" },
    { word: "μελάνι", family: "άνι", emoji: "🖋️" },
    // FAMILY "άσι" — new words from the educator's rhyme list
    { word: "φαράσι", family: "άσι", emoji: "🧹" },
    // FAMILY "έντρο" — new words from the educator's rhyme list
    { word: "κέντρο", family: "έντρο", emoji: "🎯" },
    // FAMILY "ύρα" — new words from the educator's rhyme list
    { word: "μπύρα", family: "ύρα", emoji: "🍺" },
    { word: "λύρα", family: "ύρα", emoji: "🎻" },
    // FAMILY "ίτα" — new words from the educator's rhyme list
    { word: "μαργαρίτα", family: "ίτα", emoji: "🌼" },
    { word: "γρανίτα", family: "ίτα", emoji: "🍧" },
    // FAMILY "ύλος" — new words from the educator's rhyme list
    { word: "μύλος", family: "ύλος", emoji: "🌬️" },
    // FAMILY "ιά" — new words from the educator's rhyme list
    { word: "ψησταριά", family: "ιά", emoji: "🍖" },
    { word: "ζυγαριά", family: "ιά", emoji: "⚖️" },
    { word: "πουλιά", family: "ιά", emoji: "🐦" },
    { word: "φωλιά", family: "ιά", emoji: "🪺" },
    { word: "αγκαλιά", family: "ιά", emoji: "🤗" },
    // FAMILY "όνος" — new words from the educator's rhyme list
    { word: "πόνος", family: "όνος", emoji: "🤕" },
    // FAMILY "έτα" — new words from the educator's rhyme list
    { word: "κασέτα", family: "έτα", emoji: "📼" },
    // FAMILY "όδι" — new words from the educator's rhyme list
    { word: "βόδι", family: "όδι", emoji: "🐂" },
    // FAMILY "άρος" — new words from the educator's rhyme list
    { word: "φάρος", family: "άρος", emoji: "🗼" },
    { word: "γλάρος", family: "άρος", emoji: "🕊️" },
    // FAMILY "άτι" — new words from the educator's rhyme list
    { word: "παλάτι", family: "άτι", emoji: "🏰" },
    // FAMILY "έλα" — new words from the educator's rhyme list
    { word: "σέλα", family: "έλα", emoji: "🏇" },
    // FAMILY "ώνω" — new words from the educator's rhyme list
    { word: "θυμώνω", family: "ώνω", emoji: "😠" },
    { word: "ιδρώνω", family: "ώνω", emoji: "😓" },
    // FAMILY "έμα" — new words from the educator's rhyme list
    { word: "στέμμα", family: "έμα", emoji: "👑" },
    // FAMILY "ήνα" — new words from the educator's rhyme list
    { word: "χήνα", family: "ήνα", emoji: "🪿" },
    { word: "αχτίνα", family: "ήνα", emoji: "☀️" },
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

/* ----------------------------------------------------------
   Words whose PICTURES look alike (a couple, birds, a phone and its case...). Two words of the same group never show up
   together in one round of "Βρες τη ρίμα" / "Βρες το διαφορετικό", so the child is never shown two pictures that could both be the answer.
   ---------------------------------------------------------- */
Phono.data.rhymeLookGroups = (function () {
    const groups = [
        ['ζευγάρι', 'ταίρι'],
        ['πουλί', 'πουλιά', 'καναρίνι', 'γλάρος'],
        ['λουλούδι', 'μαργαρίτα', 'φυτό'],
        ['κινητό', 'θήκη'],
        ['βαγόνι', 'τρένα'],
        ['λάδι', 'ξύδι'],
        ['φαγητό', 'μακαρονάδα'],
    ];
    const map = {};
    groups.forEach((g, i) => g.forEach(w => { map[w] = 'look' + i; }));
    return map;
})();
