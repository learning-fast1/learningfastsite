/* ============================================================
   PHONEMES DATA — Level 5 (Φωνήματα)
   Κανόνας Διαφάνειας: ΚΑΘΕ λέξη εδώ είναι φωνημικά διάφανη —
   κάθε γράμμα = ένας ήχος ΚΑΙ κάθε ήχος = ένα γράμμα. Καμία λέξη με
   δίψηφο σύμφωνο (μπ, ντ, γκ/γγ, τσ, τζ), δίψηφο φωνήεν (ου, αι, ει,
   οι, αυ, ευ), ξ/ψ, σύμπλεγμα συμφώνων (σπ, στ, σκ, τρ, δρ, κρ, βρ,
   γρ, φρ, χτ, φτ, πλ, κλ, βλ, γλ, ντρ...) ή διπλό γράμμα (μμ, σσ,
   λλ, νν). Κάθε γράμμα της λέξης αντιστοιχεί σε ακριβώς ένα φώνημα
   στο `phonemes` array, στην ίδια σειρά.
   ============================================================ */
window.Phono = window.Phono || {};
Phono.data = Phono.data || {};

Phono.data.phonemesL5 = [
    // === 4 ΗΧΟΙ (CVCV) ===
    { word: "γάτα", phonemes: ["γ", "ά", "τ", "α"], count: 4, imageable: true, emoji: "🐱" },
    { word: "μήλο", phonemes: ["μ", "ή", "λ", "ο"], count: 4, imageable: true, emoji: "🍎" },
    { word: "νερό", phonemes: ["ν", "ε", "ρ", "ό"], count: 4, imageable: true, emoji: "💧" },
    { word: "γάλα", phonemes: ["γ", "ά", "λ", "α"], count: 4, imageable: true, emoji: "🥛" },
    { word: "κότα", phonemes: ["κ", "ό", "τ", "α"], count: 4, imageable: true, emoji: "🐔" },
    { word: "πόδι", phonemes: ["π", "ό", "δ", "ι"], count: 4, imageable: true, emoji: "🦶" },
    { word: "μέλι", phonemes: ["μ", "έ", "λ", "ι"], count: 4, imageable: true, emoji: "🍯" },
    { word: "τυρί", phonemes: ["τ", "υ", "ρ", "ί"], count: 4, imageable: true, emoji: "🧀" },
    { word: "δώρο", phonemes: ["δ", "ώ", "ρ", "ο"], count: 4, imageable: true, emoji: "🎁" },
    { word: "μύτη", phonemes: ["μ", "ύ", "τ", "η"], count: 4, imageable: true, emoji: "👃" },
    { word: "ρόδα", phonemes: ["ρ", "ό", "δ", "α"], count: 4, imageable: true, emoji: "🛞" },
    { word: "λάδι", phonemes: ["λ", "ά", "δ", "ι"], count: 4, imageable: true, emoji: "🫒" },
    { word: "φίδι", phonemes: ["φ", "ί", "δ", "ι"], count: 4, imageable: true, emoji: "🐍" },
    { word: "βάζο", phonemes: ["β", "ά", "ζ", "ο"], count: 4, imageable: true, emoji: "🏺" },
    { word: "πίτα", phonemes: ["π", "ί", "τ", "α"], count: 4, imageable: true, emoji: "🫓" },
    { word: "κερί", phonemes: ["κ", "ε", "ρ", "ί"], count: 4, imageable: true, emoji: "🕯️" },
    { word: "ζάρι", phonemes: ["ζ", "ά", "ρ", "ι"], count: 4, imageable: true, emoji: "🎲" },
    { word: "τόπι", phonemes: ["τ", "ό", "π", "ι"], count: 4, imageable: true, emoji: "⚽" },
    { word: "γόμα", phonemes: ["γ", "ό", "μ", "α"], count: 4, imageable: true, emoji: "🧽" },
    { word: "νότα", phonemes: ["ν", "ό", "τ", "α"], count: 4, imageable: true, emoji: "🎵" },
    { word: "χέρι", phonemes: ["χ", "έ", "ρ", "ι"], count: 4, imageable: true, emoji: "🤚" },
    { word: "μάτι", phonemes: ["μ", "ά", "τ", "ι"], count: 4, imageable: true, emoji: "👁️" },
    { word: "πάνα", phonemes: ["π", "ά", "ν", "α"], count: 4, imageable: true, emoji: "🧷" },
    { word: "βίδα", phonemes: ["β", "ί", "δ", "α"], count: 4, imageable: true, emoji: "🔩" },

    // === 5 ΗΧΟΙ (CVCVC) ===
    { word: "χορός", phonemes: ["χ", "ο", "ρ", "ό", "ς"], count: 5, imageable: true, emoji: "💃" },
    { word: "λύκος", phonemes: ["λ", "ύ", "κ", "ο", "ς"], count: 5, imageable: true, emoji: "🐺" },
    { word: "τόνος", phonemes: ["τ", "ό", "ν", "ο", "ς"], count: 5, imageable: true, emoji: "🐟" },
    { word: "δάσος", phonemes: ["δ", "ά", "σ", "ο", "ς"], count: 5, imageable: true, emoji: "🌲" },
    // ρόλος/νόμος: abstract nouns, not imageable — kept in the bank
    // (counting/Elkonin games work fine without a picture) but excluded
    // from any picture-choice game (e.g. phonemeSynthesis).
    { word: "ρόλος", phonemes: ["ρ", "ό", "λ", "ο", "ς"], count: 5, imageable: false, emoji: null },
    { word: "λόφος", phonemes: ["λ", "ό", "φ", "ο", "ς"], count: 5, imageable: true, emoji: "⛰️" },
    { word: "κάδος", phonemes: ["κ", "ά", "δ", "ο", "ς"], count: 5, imageable: true, emoji: "🗑️" },
    { word: "γάτος", phonemes: ["γ", "ά", "τ", "ο", "ς"], count: 5, imageable: true, emoji: "🐈" },
    { word: "νόμος", phonemes: ["ν", "ό", "μ", "ο", "ς"], count: 5, imageable: false, emoji: null },

    // === 6 ΗΧΟΙ (CVCVCV) ===
    { word: "πατάτα", phonemes: ["π", "α", "τ", "ά", "τ", "α"], count: 6, imageable: true, emoji: "🥔" },
    { word: "λεμόνι", phonemes: ["λ", "ε", "μ", "ό", "ν", "ι"], count: 6, imageable: true, emoji: "🍋" },
    { word: "καπέλο", phonemes: ["κ", "α", "π", "έ", "λ", "ο"], count: 6, imageable: true, emoji: "🎩" },
    { word: "σαλάτα", phonemes: ["σ", "α", "λ", "ά", "τ", "α"], count: 6, imageable: true, emoji: "🥗" },
    { word: "κεφάλι", phonemes: ["κ", "ε", "φ", "ά", "λ", "ι"], count: 6, imageable: true, emoji: "🙂" },
    { word: "μολύβι", phonemes: ["μ", "ο", "λ", "ύ", "β", "ι"], count: 6, imageable: true, emoji: "✏️" },
    { word: "κανάτα", phonemes: ["κ", "α", "ν", "ά", "τ", "α"], count: 6, imageable: true, emoji: "🫖" },
    { word: "καμήλα", phonemes: ["κ", "α", "μ", "ή", "λ", "α"], count: 6, imageable: true, emoji: "🐫" },
    { word: "φασόλι", phonemes: ["φ", "α", "σ", "ό", "λ", "ι"], count: 6, imageable: true, emoji: "🫘" },
    { word: "πεπόνι", phonemes: ["π", "ε", "π", "ό", "ν", "ι"], count: 6, imageable: true, emoji: "🍈" },
    { word: "ποτάμι", phonemes: ["π", "ο", "τ", "ά", "μ", "ι"], count: 6, imageable: true, emoji: "🏞️" },
    { word: "βελόνα", phonemes: ["β", "ε", "λ", "ό", "ν", "α"], count: 6, imageable: true, emoji: "🪡" },
];

/** Same word, normalized-key lookup (accents stripped) for callers that
 * only have the plain word text (e.g. from another bank's word field). */
Phono.data.phonemesL5ByWord = function (word) {
    return Phono.data.phonemesL5.find(w => w.word === word) || null;
};
