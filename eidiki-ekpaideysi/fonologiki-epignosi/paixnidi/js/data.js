/* ============================================================
   ΦΩΝΟΠΑΙΧΝΙΔΙ — Game Data
   All words, sentences, rhymes, and phoneme data for Greek
   phonological awareness activities.
   ============================================================ */

window.Phono = window.Phono || {};

Phono.data = {

    /* ----------------------------------------------------------
       WORDS DATABASE
       Each word includes syllable & phoneme breakdown, emoji,
       initial sound, and category for filtering.
       ---------------------------------------------------------- */
    words: [
        // === ΖΩΑ ===
        { word: "γάτα", syllables: ["γά", "τα"], phonemes: ["γ", "α", "τ", "α"], emoji: "🐱", initialSound: "γ", category: "ζώα" },
        { word: "σκύλος", syllables: ["σκύ", "λος"], phonemes: ["σ", "κ", "ι", "λ", "ο", "σ"], emoji: "🐶", initialSound: "σ", category: "ζώα" },
        { word: "πουλί", syllables: ["που", "λί"], phonemes: ["π", "ου", "λ", "ι"], emoji: "🐦", initialSound: "π", category: "ζώα" },
        { word: "ψάρι", syllables: ["ψά", "ρι"], phonemes: ["ψ", "α", "ρ", "ι"], emoji: "🐟", initialSound: "ψ", category: "ζώα" },
        { word: "αλεπού", syllables: ["α", "λε", "πού"], phonemes: ["α", "λ", "ε", "π", "ου"], emoji: "🦊", initialSound: "α", category: "ζώα" },
        { word: "κουνέλι", syllables: ["κου", "νέ", "λι"], phonemes: ["κ", "ου", "ν", "ε", "λ", "ι"], emoji: "🐰", initialSound: "κ", category: "ζώα" },
        { word: "πεταλούδα", syllables: ["πε", "τα", "λού", "δα"], phonemes: ["π", "ε", "τ", "α", "λ", "ου", "δ", "α"], emoji: "🦋", initialSound: "π", category: "ζώα" },
        { word: "φίδι", syllables: ["φί", "δι"], phonemes: ["φ", "ι", "δ", "ι"], emoji: "🐍", initialSound: "φ", category: "ζώα" },
        { word: "αρκούδα", syllables: ["αρ", "κού", "δα"], phonemes: ["α", "ρ", "κ", "ου", "δ", "α"], emoji: "🐻", initialSound: "α", category: "ζώα" },
        { word: "μέλισσα", syllables: ["μέ", "λισ", "σα"], phonemes: ["μ", "ε", "λ", "ι", "σ", "α"], emoji: "🐝", initialSound: "μ", category: "ζώα" },
        { word: "κότα", syllables: ["κό", "τα"], phonemes: ["κ", "ο", "τ", "α"], emoji: "🐔", initialSound: "κ", category: "ζώα" },
        { word: "λιοντάρι", syllables: ["λιο", "ντά", "ρι"], phonemes: ["λ", "ι", "ο", "ντ", "α", "ρ", "ι"], emoji: "🦁", initialSound: "λ", category: "ζώα" },
        { word: "βάτραχος", syllables: ["βά", "τρα", "χος"], phonemes: ["β", "α", "τ", "ρ", "α", "χ", "ο", "σ"], emoji: "🐸", initialSound: "β", category: "ζώα" },
        { word: "ελέφαντας", syllables: ["ε", "λέ", "φα", "ντας"], phonemes: ["ε", "λ", "ε", "φ", "α", "ντ", "α", "σ"], emoji: "🐘", initialSound: "ε", category: "ζώα" },
        { word: "μαϊμού", syllables: ["μα", "ϊ", "μού"], phonemes: ["μ", "α", "ι", "μ", "ου"], emoji: "🐒", initialSound: "μ", category: "ζώα" },

        // === ΦΡΟΥΤΑ & ΛΑΧΑΝΙΚΑ ===
        { word: "μήλο", syllables: ["μή", "λο"], phonemes: ["μ", "η", "λ", "ο"], emoji: "🍎", initialSound: "μ", category: "φρούτα" },
        { word: "μπανάνα", syllables: ["μπα", "νά", "να"], phonemes: ["μπ", "α", "ν", "α", "ν", "α"], emoji: "🍌", initialSound: "μ", category: "φρούτα" },
        { word: "πεπόνι", syllables: ["πε", "πό", "νι"], phonemes: ["π", "ε", "π", "ο", "ν", "ι"], emoji: "🍈", initialSound: "π", category: "φρούτα" },
        { word: "πορτοκάλι", syllables: ["πορ", "το", "κά", "λι"], phonemes: ["π", "ο", "ρ", "τ", "ο", "κ", "α", "λ", "ι"], emoji: "🍊", initialSound: "π", category: "φρούτα" },
        { word: "φράουλα", syllables: ["φρά", "ου", "λα"], phonemes: ["φ", "ρ", "α", "ου", "λ", "α"], emoji: "🍓", initialSound: "φ", category: "φρούτα" },
        { word: "σταφύλι", syllables: ["στα", "φύ", "λι"], phonemes: ["σ", "τ", "α", "φ", "ι", "λ", "ι"], emoji: "🍇", initialSound: "σ", category: "φρούτα" },
        { word: "καρπούζι", syllables: ["καρ", "πού", "ζι"], phonemes: ["κ", "α", "ρ", "π", "ου", "ζ", "ι"], emoji: "🍉", initialSound: "κ", category: "φρούτα" },
        { word: "αχλάδι", syllables: ["α", "χλά", "δι"], phonemes: ["α", "χ", "λ", "α", "δ", "ι"], emoji: "🍐", initialSound: "α", category: "φρούτα" },
        { word: "ντομάτα", syllables: ["ντο", "μά", "τα"], phonemes: ["ντ", "ο", "μ", "α", "τ", "α"], emoji: "🍅", initialSound: "ν", category: "φρούτα" },
        { word: "καρότο", syllables: ["κα", "ρό", "το"], phonemes: ["κ", "α", "ρ", "ο", "τ", "ο"], emoji: "🥕", initialSound: "κ", category: "φρούτα" },
        { word: "λεμόνι", syllables: ["λε", "μό", "νι"], phonemes: ["λ", "ε", "μ", "ο", "ν", "ι"], emoji: "🍋", initialSound: "λ", category: "φρούτα" },
        { word: "κεράσι", syllables: ["κε", "ρά", "σι"], phonemes: ["κ", "ε", "ρ", "α", "σ", "ι"], emoji: "🍒", initialSound: "κ", category: "φρούτα" },
        { word: "ρόδι", syllables: ["ρό", "δι"], phonemes: ["ρ", "ο", "δ", "ι"], emoji: "🥭", initialSound: "ρ", category: "φρούτα" },
        { word: "πατάτα", syllables: ["πα", "τά", "τα"], phonemes: ["π", "α", "τ", "α", "τ", "α"], emoji: "🥔", initialSound: "π", category: "φρούτα" },

        // === ΑΝΤΙΚΕΙΜΕΝΑ & ΣΠΙΤΙ ===
        { word: "σπίτι", syllables: ["σπί", "τι"], phonemes: ["σ", "π", "ι", "τ", "ι"], emoji: "🏠", initialSound: "σ", category: "αντικείμενα" },
        { word: "μπάλα", syllables: ["μπά", "λα"], phonemes: ["μπ", "α", "λ", "α"], emoji: "⚽", initialSound: "μ", category: "αντικείμενα" },
        { word: "βιβλίο", syllables: ["βι", "βλί", "ο"], phonemes: ["β", "ι", "β", "λ", "ι", "ο"], emoji: "📖", initialSound: "β", category: "αντικείμενα" },
        { word: "τραπέζι", syllables: ["τρα", "πέ", "ζι"], phonemes: ["τ", "ρ", "α", "π", "ε", "ζ", "ι"], emoji: "🪑", initialSound: "τ", category: "αντικείμενα" },
        { word: "καρέκλα", syllables: ["κα", "ρέ", "κλα"], phonemes: ["κ", "α", "ρ", "ε", "κ", "λ", "α"], emoji: "💺", initialSound: "κ", category: "αντικείμενα" },
        { word: "κλειδί", syllables: ["κλει", "δί"], phonemes: ["κ", "λ", "ει", "δ", "ι"], emoji: "🔑", initialSound: "κ", category: "αντικείμενα" },
        { word: "ποτήρι", syllables: ["πο", "τή", "ρι"], phonemes: ["π", "ο", "τ", "η", "ρ", "ι"], emoji: "🥤", initialSound: "π", category: "αντικείμενα" },
        { word: "κουτί", syllables: ["κου", "τί"], phonemes: ["κ", "ου", "τ", "ι"], emoji: "📦", initialSound: "κ", category: "αντικείμενα" },
        { word: "λουλούδι", syllables: ["λου", "λού", "δι"], phonemes: ["λ", "ου", "λ", "ου", "δ", "ι"], emoji: "🌸", initialSound: "λ", category: "φύση" },
        { word: "ήλιος", syllables: ["ή", "λιος"], phonemes: ["η", "λ", "ι", "ο", "ς"], emoji: "☀️", initialSound: "η", category: "φύση" },
        { word: "φεγγάρι", syllables: ["φεγ", "γά", "ρι"], phonemes: ["φ", "ε", "γ", "α", "ρ", "ι"], emoji: "🌙", initialSound: "φ", category: "φύση" },
        { word: "βουνό", syllables: ["βου", "νό"], phonemes: ["β", "ου", "ν", "ο"], emoji: "🏔️", initialSound: "β", category: "φύση" },
        { word: "δέντρο", syllables: ["δέ", "ντρο"], phonemes: ["δ", "ε", "ντ", "ρ", "ο"], emoji: "🌳", initialSound: "δ", category: "φύση" },
        { word: "σύννεφο", syllables: ["σύν", "νε", "φο"], phonemes: ["σ", "ι", "ν", "ε", "φ", "ο"], emoji: "☁️", initialSound: "σ", category: "φύση" },
        { word: "αστέρι", syllables: ["α", "στέ", "ρι"], phonemes: ["α", "σ", "τ", "ε", "ρ", "ι"], emoji: "⭐", initialSound: "α", category: "φύση" },
        { word: "θάλασσα", syllables: ["θά", "λασ", "σα"], phonemes: ["θ", "α", "λ", "α", "σ", "α"], emoji: "🌊", initialSound: "θ", category: "φύση" },

        // === ΣΩΜΑ ===
        { word: "μάτι", syllables: ["μά", "τι"], phonemes: ["μ", "α", "τ", "ι"], emoji: "👁️", initialSound: "μ", category: "σώμα" },
        { word: "μύτη", syllables: ["μύ", "τη"], phonemes: ["μ", "ι", "τ", "ι"], emoji: "👃", initialSound: "μ", category: "σώμα" },
        { word: "στόμα", syllables: ["στό", "μα"], phonemes: ["σ", "τ", "ο", "μ", "α"], emoji: "👄", initialSound: "σ", category: "σώμα" },
        { word: "χέρι", syllables: ["χέ", "ρι"], phonemes: ["χ", "ε", "ρ", "ι"], emoji: "🤚", initialSound: "χ", category: "σώμα" },
        { word: "πόδι", syllables: ["πό", "δι"], phonemes: ["π", "ο", "δ", "ι"], emoji: "🦶", initialSound: "π", category: "σώμα" },
        { word: "αυτί", syllables: ["αυ", "τί"], phonemes: ["α", "υ", "τ", "ι"], emoji: "👂", initialSound: "α", category: "σώμα" },
        { word: "δόντι", syllables: ["δό", "ντι"], phonemes: ["δ", "ο", "ντ", "ι"], emoji: "🦷", initialSound: "δ", category: "σώμα" },

        // === ΤΡΟΦΙΜΑ ===
        { word: "ψωμί", syllables: ["ψω", "μί"], phonemes: ["ψ", "ο", "μ", "ι"], emoji: "🍞", initialSound: "ψ", category: "τρόφιμα" },
        { word: "νερό", syllables: ["νε", "ρό"], phonemes: ["ν", "ε", "ρ", "ο"], emoji: "💧", initialSound: "ν", category: "τρόφιμα" },
        { word: "γάλα", syllables: ["γά", "λα"], phonemes: ["γ", "α", "λ", "α"], emoji: "🥛", initialSound: "γ", category: "τρόφιμα" },
        { word: "τυρί", syllables: ["τυ", "ρί"], phonemes: ["τ", "ι", "ρ", "ι"], emoji: "🧀", initialSound: "τ", category: "τρόφιμα" },
        { word: "μέλι", syllables: ["μέ", "λι"], phonemes: ["μ", "ε", "λ", "ι"], emoji: "🍯", initialSound: "μ", category: "τρόφιμα" },
        { word: "σοκολάτα", syllables: ["σο", "κο", "λά", "τα"], phonemes: ["σ", "ο", "κ", "ο", "λ", "α", "τ", "α"], emoji: "🍫", initialSound: "σ", category: "τρόφιμα" },

        // === ΑΛΛΑ ===
        { word: "μπαλόνι", syllables: ["μπα", "λό", "νι"], phonemes: ["μπ", "α", "λ", "ο", "ν", "ι"], emoji: "🎈", initialSound: "μ", category: "αντικείμενα" },
        { word: "φανάρι", syllables: ["φα", "νά", "ρι"], phonemes: ["φ", "α", "ν", "α", "ρ", "ι"], emoji: "🏮", initialSound: "φ", category: "αντικείμενα" },
        { word: "σκάλα", syllables: ["σκά", "λα"], phonemes: ["σ", "κ", "α", "λ", "α"], emoji: "🪜", initialSound: "σ", category: "αντικείμενα" },
        { word: "μολύβι", syllables: ["μο", "λύ", "βι"], phonemes: ["μ", "ο", "λ", "ι", "β", "ι"], emoji: "✏️", initialSound: "μ", category: "αντικείμενα" },
        { word: "τηλέφωνο", syllables: ["τη", "λέ", "φω", "νο"], phonemes: ["τ", "η", "λ", "ε", "φ", "ο", "ν", "ο"], emoji: "📱", initialSound: "τ", category: "αντικείμενα" },
        { word: "ομπρέλα", syllables: ["ο", "μπρέ", "λα"], phonemes: ["ο", "μπ", "ρ", "ε", "λ", "α"], emoji: "☂️", initialSound: "ο", category: "αντικείμενα" },
        { word: "σαλάτα", syllables: ["σα", "λά", "τα"], phonemes: ["σ", "α", "λ", "α", "τ", "α"], emoji: "🥗", initialSound: "σ", category: "τρόφιμα" },
        { word: "μακαρόνι", syllables: ["μα", "κα", "ρό", "νι"], phonemes: ["μ", "α", "κ", "α", "ρ", "ο", "ν", "ι"], emoji: "🍝", initialSound: "μ", category: "τρόφιμα" },
        { word: "τραγούδι", syllables: ["τρα", "γού", "δι"], phonemes: ["τ", "ρ", "α", "γ", "ου", "δ", "ι"], emoji: "🎵", initialSound: "τ", category: "αντικείμενα" },
        { word: "παπούτσι", syllables: ["πα", "πού", "τσι"], phonemes: ["π", "α", "π", "ου", "τσ", "ι"], emoji: "👟", initialSound: "π", category: "αντικείμενα" },
        { word: "καπέλο", syllables: ["κα", "πέ", "λο"], phonemes: ["κ", "α", "π", "ε", "λ", "ο"], emoji: "🎩", initialSound: "κ", category: "αντικείμενα" },
        { word: "αυτοκίνητο", syllables: ["αυ", "το", "κί", "νη", "το"], phonemes: ["α", "υ", "τ", "ο", "κ", "ι", "ν", "η", "τ", "ο"], emoji: "🚗", initialSound: "α", category: "αντικείμενα" },

        // === ΖΩΑ (νέα) ===
        { word: "πάπια", syllables: ["πά", "πια"], phonemes: ["π", "α", "π", "ι", "α"], emoji: "🦆", initialSound: "π", category: "ζώα" },
        { word: "ζέβρα", syllables: ["ζέ", "βρα"], phonemes: ["ζ", "ε", "β", "ρ", "α"], emoji: "🦓", initialSound: "ζ", category: "ζώα" },
        { word: "χελώνα", syllables: ["χε", "λώ", "να"], phonemes: ["χ", "ε", "λ", "ο", "ν", "α"], emoji: "🐢", initialSound: "χ", category: "ζώα" },
        { word: "δελφίνι", syllables: ["δελ", "φί", "νι"], phonemes: ["δ", "ε", "λ", "φ", "ι", "ν", "ι"], emoji: "🐬", initialSound: "δ", category: "ζώα" },
        { word: "γουρούνι", syllables: ["γου", "ρού", "νι"], phonemes: ["γ", "ου", "ρ", "ου", "ν", "ι"], emoji: "🐷", initialSound: "γ", category: "ζώα" },
        { word: "πρόβατο", syllables: ["πρό", "βα", "το"], phonemes: ["π", "ρ", "ο", "β", "α", "τ", "ο"], emoji: "🐑", initialSound: "π", category: "ζώα" },
        { word: "καμήλα", syllables: ["κα", "μή", "λα"], phonemes: ["κ", "α", "μ", "η", "λ", "α"], emoji: "🐫", initialSound: "κ", category: "ζώα" },
        { word: "σαλιγκάρι", syllables: ["σα", "λιγ", "κά", "ρι"], phonemes: ["σ", "α", "λ", "ι", "γκ", "α", "ρ", "ι"], emoji: "🐌", initialSound: "σ", category: "ζώα" },

        // === ΦΡΟΥΤΑ (νέα) ===
        { word: "ανανάς", syllables: ["α", "να", "νάς"], phonemes: ["α", "ν", "α", "ν", "α", "σ"], emoji: "🍍", initialSound: "α", category: "φρούτα" },
        { word: "βερίκοκο", syllables: ["βε", "ρί", "κο", "κο"], phonemes: ["β", "ε", "ρ", "ι", "κ", "ο", "κ", "ο"], emoji: "🍑", initialSound: "β", category: "φρούτα" },

        // === ΤΡΟΦΙΜΑ (νέα) ===
        { word: "πίτσα", syllables: ["πί", "τσα"], phonemes: ["π", "ι", "τσ", "α"], emoji: "🍕", initialSound: "π", category: "τρόφιμα" },
        { word: "τούρτα", syllables: ["τούρ", "τα"], phonemes: ["τ", "ου", "ρ", "τ", "α"], emoji: "🎂", initialSound: "τ", category: "τρόφιμα" },
        { word: "παγωτό", syllables: ["πα", "γω", "τό"], phonemes: ["π", "α", "γ", "ο", "τ", "ο"], emoji: "🍦", initialSound: "π", category: "τρόφιμα" },
        { word: "μπισκότο", syllables: ["μπι", "σκό", "το"], phonemes: ["μπ", "ι", "σ", "κ", "ο", "τ", "ο"], emoji: "🍪", initialSound: "μ", category: "τρόφιμα" },
        { word: "κοτόπουλο", syllables: ["κο", "τό", "που", "λο"], phonemes: ["κ", "ο", "τ", "ο", "π", "ου", "λ", "ο"], emoji: "🍗", initialSound: "κ", category: "τρόφιμα" },
        { word: "μανιτάρι", syllables: ["μα", "νι", "τά", "ρι"], phonemes: ["μ", "α", "ν", "ι", "τ", "α", "ρ", "ι"], emoji: "🍄", initialSound: "μ", category: "τρόφιμα" },

        // === ΑΝΤΙΚΕΙΜΕΝΑ (νέα) ===
        { word: "πόρτα", syllables: ["πόρ", "τα"], phonemes: ["π", "ο", "ρ", "τ", "α"], emoji: "🚪", initialSound: "π", category: "αντικείμενα" },
        { word: "λάμπα", syllables: ["λά", "μπα"], phonemes: ["λ", "α", "μπ", "α"], emoji: "💡", initialSound: "λ", category: "αντικείμενα" },
        { word: "βάρκα", syllables: ["βάρ", "κα"], phonemes: ["β", "α", "ρ", "κ", "α"], emoji: "⛵", initialSound: "β", category: "αντικείμενα" },
        { word: "δώρο", syllables: ["δώ", "ρο"], phonemes: ["δ", "ο", "ρ", "ο"], emoji: "🎁", initialSound: "δ", category: "αντικείμενα" },
        { word: "κουδούνι", syllables: ["κου", "δού", "νι"], phonemes: ["κ", "ου", "δ", "ου", "ν", "ι"], emoji: "🔔", initialSound: "κ", category: "αντικείμενα" },
        { word: "κιθάρα", syllables: ["κι", "θά", "ρα"], phonemes: ["κ", "ι", "θ", "α", "ρ", "α"], emoji: "🎸", initialSound: "κ", category: "αντικείμενα" },
        { word: "κεράκι", syllables: ["κε", "ρά", "κι"], phonemes: ["κ", "ε", "ρ", "α", "κ", "ι"], emoji: "🕯️", initialSound: "κ", category: "αντικείμενα" },
        { word: "ψυγείο", syllables: ["ψυ", "γεί", "ο"], phonemes: ["ψ", "ι", "γ", "ι", "ο"], emoji: "🧊", initialSound: "ψ", category: "αντικείμενα" },

        // === ΜΕΤΑΦΟΡΑ & ΜΕΓΑΛΑ (νέα) ===
        { word: "ποδήλατο", syllables: ["πο", "δή", "λα", "το"], phonemes: ["π", "ο", "δ", "η", "λ", "α", "τ", "ο"], emoji: "🚲", initialSound: "π", category: "αντικείμενα" },
        { word: "παράθυρο", syllables: ["πα", "ρά", "θυ", "ρο"], phonemes: ["π", "α", "ρ", "α", "θ", "ι", "ρ", "ο"], emoji: "🪟", initialSound: "π", category: "αντικείμενα" },
        { word: "χαρταετός", syllables: ["χαρ", "τα", "ε", "τός"], phonemes: ["χ", "α", "ρ", "τ", "α", "ε", "τ", "ο", "σ"], emoji: "🪁", initialSound: "χ", category: "αντικείμενα" },
        { word: "ελικόπτερο", syllables: ["ε", "λι", "κό", "πτε", "ρο"], phonemes: ["ε", "λ", "ι", "κ", "ο", "π", "τ", "ε", "ρ", "ο"], emoji: "🚁", initialSound: "ε", category: "αντικείμενα" },
        { word: "τηλεόραση", syllables: ["τη", "λε", "ό", "ρα", "ση"], phonemes: ["τ", "η", "λ", "ε", "ο", "ρ", "α", "σ", "η"], emoji: "📺", initialSound: "τ", category: "αντικείμενα" },
        { word: "ζωγραφιά", syllables: ["ζω", "γρα", "φιά"], phonemes: ["ζ", "ο", "γ", "ρ", "α", "φ", "ι", "α"], emoji: "🎨", initialSound: "ζ", category: "αντικείμενα" },

        // === ΝΕΕΣ ΛΕΞΕΙΣ (επέκταση) ===
        { word: "λύκος", syllables: ["λύ", "κος"], phonemes: ["λ", "ι", "κ", "ο", "σ"], emoji: "🐺", initialSound: "λ", category: "ζώα" },
        { word: "τίγρης", syllables: ["τί", "γρης"], phonemes: ["τ", "ι", "γ", "ρ", "ι", "σ"], emoji: "🐯", initialSound: "τ", category: "ζώα" },
        { word: "κρεβάτι", syllables: ["κρε", "βά", "τι"], phonemes: ["κ", "ρ", "ε", "β", "α", "τ", "ι"], emoji: "🛏️", initialSound: "κ", category: "αντικείμενα" },
        { word: "ποτάμι", syllables: ["πο", "τά", "μι"], phonemes: ["π", "ο", "τ", "α", "μ", "ι"], emoji: "🏞️", initialSound: "π", category: "φύση" },
        { word: "γέφυρα", syllables: ["γέ", "φυ", "ρα"], phonemes: ["γ", "ε", "φ", "ι", "ρ", "α"], emoji: "🌉", initialSound: "γ", category: "αντικείμενα" },
        { word: "ρολόι", syllables: ["ρο", "λό", "ι"], phonemes: ["ρ", "ο", "λ", "ο", "ι"], emoji: "⏰", initialSound: "ρ", category: "αντικείμενα" },
        { word: "σκούπα", syllables: ["σκού", "πα"], phonemes: ["σ", "κ", "ου", "π", "α"], emoji: "🧹", initialSound: "σ", category: "αντικείμενα" },
        { word: "φωτιά", syllables: ["φω", "τιά"], phonemes: ["φ", "ο", "τ", "ι", "α"], emoji: "🔥", initialSound: "φ", category: "φύση" },
        { word: "χιόνι", syllables: ["χιό", "νι"], phonemes: ["χ", "ι", "ο", "ν", "ι"], emoji: "❄️", initialSound: "χ", category: "φύση" },
        { word: "βροχή", syllables: ["βρο", "χή"], phonemes: ["β", "ρ", "ο", "χ", "ι"], emoji: "🌧️", initialSound: "β", category: "φύση" },
        { word: "δάσος", syllables: ["δά", "σος"], phonemes: ["δ", "α", "σ", "ο", "σ"], emoji: "🌲", initialSound: "δ", category: "φύση" },
        { word: "κάστανο", syllables: ["κά", "στα", "νο"], phonemes: ["κ", "α", "σ", "τ", "α", "ν", "ο"], emoji: "🌰", initialSound: "κ", category: "τρόφιμα" },
        { word: "αυγό", syllables: ["αυ", "γό"], phonemes: ["α", "υ", "γ", "ο"], emoji: "🥚", initialSound: "α", category: "τρόφιμα" },
        { word: "καραμέλα", syllables: ["κα", "ρα", "μέ", "λα"], phonemes: ["κ", "α", "ρ", "α", "μ", "ε", "λ", "α"], emoji: "🍬", initialSound: "κ", category: "τρόφιμα" },
        { word: "πιάτο", syllables: ["πιά", "το"], phonemes: ["π", "ι", "α", "τ", "ο"], emoji: "🍽️", initialSound: "π", category: "αντικείμενα" },
        { word: "γάντι", syllables: ["γά", "ντι"], phonemes: ["γ", "α", "ντ", "ι"], emoji: "🧤", initialSound: "γ", category: "αντικείμενα" },
        { word: "μπότα", syllables: ["μπό", "τα"], phonemes: ["μπ", "ο", "τ", "α"], emoji: "🥾", initialSound: "μ", category: "αντικείμενα" },

        // Added for Level 4's letter picker: ζ, ν, ρ, γ, ψ, φ, χ only had
        // 2-4 words each, too few to avoid fast repetition once a
        // teacher restricts a session to just one or two letters.
        { word: "ζώο", syllables: ["ζώ", "ο"], phonemes: ["ζ", "ο", "ο"], emoji: "🐾", initialSound: "ζ", category: "ζώα" },
        { word: "ζαμπόν", syllables: ["ζα", "μπόν"], phonemes: ["ζ", "α", "μπ", "ο", "ν"], emoji: "🍖", initialSound: "ζ", category: "τρόφιμα" },
        { word: "ζάχαρη", syllables: ["ζά", "χα", "ρη"], phonemes: ["ζ", "α", "χ", "α", "ρ", "η"], emoji: "🧂", initialSound: "ζ", category: "τρόφιμα" },
        { word: "νύχι", syllables: ["νύ", "χι"], phonemes: ["ν", "ι", "χ", "ι"], emoji: "💅", initialSound: "ν", category: "σώμα" },
        { word: "νησί", syllables: ["νη", "σί"], phonemes: ["ν", "η", "σ", "ι"], emoji: "🏝️", initialSound: "ν", category: "φύση" },
        { word: "ντουλάπα", syllables: ["ντου", "λά", "πα"], phonemes: ["ντ", "ου", "λ", "α", "π", "α"], emoji: "🚪", initialSound: "ν", category: "αντικείμενα" },
        { word: "νεράιδα", syllables: ["νε", "ράι", "δα"], phonemes: ["ν", "ε", "ρ", "αι", "δ", "α"], emoji: "🧚", initialSound: "ν", category: "αντικείμενα" },
        { word: "ρούχο", syllables: ["ρού", "χο"], phonemes: ["ρ", "ου", "χ", "ο"], emoji: "👕", initialSound: "ρ", category: "αντικείμενα" },
        { word: "ρόδα", syllables: ["ρό", "δα"], phonemes: ["ρ", "ο", "δ", "α"], emoji: "🛞", initialSound: "ρ", category: "αντικείμενα" },
        { word: "ραδιόφωνο", syllables: ["ρα", "διό", "φω", "νο"], phonemes: ["ρ", "α", "δ", "ι", "ο", "φ", "ο", "ν", "ο"], emoji: "📻", initialSound: "ρ", category: "αντικείμενα" },
        { word: "γραβάτα", syllables: ["γρα", "βά", "τα"], phonemes: ["γ", "ρ", "α", "β", "α", "τ", "α"], emoji: "👔", initialSound: "γ", category: "αντικείμενα" },
        { word: "γρασίδι", syllables: ["γρα", "σί", "δι"], phonemes: ["γ", "ρ", "α", "σ", "ι", "δ", "ι"], emoji: "🌱", initialSound: "γ", category: "φύση" },
        { word: "ψαλίδι", syllables: ["ψα", "λί", "δι"], phonemes: ["ψ", "α", "λ", "ι", "δ", "ι"], emoji: "✂️", initialSound: "ψ", category: "αντικείμενα" },
        { word: "ψώνια", syllables: ["ψώ", "νια"], phonemes: ["ψ", "ο", "ν", "ι", "α"], emoji: "🛒", initialSound: "ψ", category: "αντικείμενα" },
        { word: "φύλλο", syllables: ["φύλ", "λο"], phonemes: ["φ", "ι", "λ", "ο"], emoji: "🍃", initialSound: "φ", category: "φύση" },
        { word: "χταπόδι", syllables: ["χτα", "πό", "δι"], phonemes: ["χ", "τ", "α", "π", "ο", "δ", "ι"], emoji: "🐙", initialSound: "χ", category: "ζώα" },
        // Adds depth to final-letter "η" too (findFinalPhoneme) — most
        // Greek words end in α/ο/ι/σ, so words ending in η are scarce.
        { word: "αδελφή", syllables: ["α", "δελ", "φή"], phonemes: ["α", "δ", "ε", "λ", "φ", "η"], emoji: "👧", initialSound: "α", category: "αντικείμενα" },

        // Brings every initial letter up to 10+ words for findInitialPhoneme,
        // so a session restricted to one letter (via the Level 4 letter
        // picker) doesn't run out of variety after a couple of rounds.
        { word: "αγελάδα", syllables: ["α", "γε", "λά", "δα"], phonemes: ["α", "γ", "ε", "λ", "α", "δ", "α"], emoji: "🐄", initialSound: "α", category: "ζώα" },

        { word: "βαλίτσα", syllables: ["βα", "λί", "τσα"], phonemes: ["β", "α", "λ", "ι", "τσ", "α"], emoji: "🧳", initialSound: "β", category: "αντικείμενα" },
        { word: "βιολί", syllables: ["βιο", "λί"], phonemes: ["β", "ι", "ο", "λ", "ι"], emoji: "🎻", initialSound: "β", category: "αντικείμενα" },
        { word: "βότσαλο", syllables: ["βό", "τσα", "λο"], phonemes: ["β", "ο", "τσ", "α", "λ", "ο"], emoji: "🪨", initialSound: "β", category: "φύση" },
        { word: "βαρέλι", syllables: ["βα", "ρέ", "λι"], phonemes: ["β", "α", "ρ", "ε", "λ", "ι"], emoji: "🛢️", initialSound: "β", category: "αντικείμενα" },

        { word: "γάιδαρος", syllables: ["γάι", "δα", "ρος"], phonemes: ["γ", "αι", "δ", "α", "ρ", "ο", "σ"], emoji: "🫏", initialSound: "γ", category: "ζώα" },
        { word: "γυαλιά", syllables: ["γυα", "λιά"], phonemes: ["γ", "ι", "α", "λ", "ι", "α"], emoji: "👓", initialSound: "γ", category: "αντικείμενα" },
        { word: "γλάστρα", syllables: ["γλά", "στρα"], phonemes: ["γ", "λ", "α", "σ", "τ", "ρ", "α"], emoji: "🪴", initialSound: "γ", category: "αντικείμενα" },

        { word: "δάχτυλο", syllables: ["δά", "χτυ", "λο"], phonemes: ["δ", "α", "χ", "τ", "ι", "λ", "ο"], emoji: "👆", initialSound: "δ", category: "σώμα" },
        { word: "δίσκος", syllables: ["δί", "σκος"], phonemes: ["δ", "ι", "σ", "κ", "ο", "σ"], emoji: "💿", initialSound: "δ", category: "αντικείμενα" },
        { word: "δράκος", syllables: ["δρά", "κος"], phonemes: ["δ", "ρ", "α", "κ", "ο", "σ"], emoji: "🐉", initialSound: "δ", category: "ζώα" },
        { word: "δέμα", syllables: ["δέ", "μα"], phonemes: ["δ", "ε", "μ", "α"], emoji: "📦", initialSound: "δ", category: "αντικείμενα" },
        { word: "διάδρομος", syllables: ["διά", "δρο", "μος"], phonemes: ["δ", "ι", "α", "δ", "ρ", "ο", "μ", "ο", "σ"], emoji: "🚪", initialSound: "δ", category: "αντικείμενα" },

        { word: "ελάφι", syllables: ["ε", "λά", "φι"], phonemes: ["ε", "λ", "α", "φ", "ι"], emoji: "🦌", initialSound: "ε", category: "ζώα" },
        { word: "εργαλείο", syllables: ["ερ", "γα", "λεί", "ο"], phonemes: ["ε", "ρ", "γ", "α", "λ", "ει", "ο"], emoji: "🔧", initialSound: "ε", category: "αντικείμενα" },
        { word: "εξοχή", syllables: ["ε", "ξο", "χή"], phonemes: ["ε", "ξ", "ο", "χ", "η"], emoji: "🏞️", initialSound: "ε", category: "φύση" },
        { word: "έλατο", syllables: ["έ", "λα", "το"], phonemes: ["ε", "λ", "α", "τ", "ο"], emoji: "🎄", initialSound: "ε", category: "φύση" },
        { word: "εκκλησία", syllables: ["εκ", "κλη", "σί", "α"], phonemes: ["ε", "κ", "λ", "η", "σ", "ι", "α"], emoji: "⛪", initialSound: "ε", category: "αντικείμενα" },
        { word: "εξώπορτα", syllables: ["ε", "ξώ", "πορ", "τα"], phonemes: ["ε", "ξ", "ο", "π", "ο", "ρ", "τ", "α"], emoji: "🚪", initialSound: "ε", category: "αντικείμενα" },
        { word: "ελιά", syllables: ["ε", "λιά"], phonemes: ["ε", "λ", "ι", "α"], emoji: "🫒", initialSound: "ε", category: "φύση" },
        { word: "εφημερίδα", syllables: ["ε", "φη", "με", "ρί", "δα"], phonemes: ["ε", "φ", "η", "μ", "ε", "ρ", "ι", "δ", "α"], emoji: "📰", initialSound: "ε", category: "αντικείμενα" },

        { word: "ζάρι", syllables: ["ζά", "ρι"], phonemes: ["ζ", "α", "ρ", "ι"], emoji: "🎲", initialSound: "ζ", category: "αντικείμενα" },
        { word: "ζελές", syllables: ["ζε", "λές"], phonemes: ["ζ", "ε", "λ", "ε", "σ"], emoji: "🍮", initialSound: "ζ", category: "τρόφιμα" },
        { word: "ζευγάρι", syllables: ["ζευ", "γά", "ρι"], phonemes: ["ζ", "ευ", "γ", "α", "ρ", "ι"], emoji: "👫", initialSound: "ζ", category: "αντικείμενα" },
        { word: "ζυμαρικά", syllables: ["ζυ", "μα", "ρι", "κά"], phonemes: ["ζ", "ι", "μ", "α", "ρ", "ι", "κ", "α"], emoji: "🍝", initialSound: "ζ", category: "τρόφιμα" },
        { word: "ζωγράφος", syllables: ["ζω", "γρά", "φος"], phonemes: ["ζ", "ο", "γ", "ρ", "α", "φ", "ο", "σ"], emoji: "🎨", initialSound: "ζ", category: "αντικείμενα" },

        { word: "ηφαίστειο", syllables: ["η", "φαί", "στει", "ο"], phonemes: ["η", "φ", "αι", "σ", "τ", "ει", "ο"], emoji: "🌋", initialSound: "η", category: "φύση" },
        { word: "ήρωας", syllables: ["ή", "ρω", "ας"], phonemes: ["η", "ρ", "ο", "α", "σ"], emoji: "🦸", initialSound: "η", category: "αντικείμενα" },
        { word: "ήπειρος", syllables: ["ή", "πει", "ρος"], phonemes: ["η", "π", "ει", "ρ", "ο", "σ"], emoji: "🌍", initialSound: "η", category: "φύση" },
        { word: "ηχώ", syllables: ["η", "χώ"], phonemes: ["η", "χ", "ο"], emoji: "🔊", initialSound: "η", category: "αντικείμενα" },
        { word: "ημερολόγιο", syllables: ["η", "με", "ρο", "λό", "γιο"], phonemes: ["η", "μ", "ε", "ρ", "ο", "λ", "ο", "γ", "ι", "ο"], emoji: "📅", initialSound: "η", category: "αντικείμενα" },
        { word: "ηλιαχτίδα", syllables: ["η", "λι", "α", "χτί", "δα"], phonemes: ["η", "λ", "ι", "α", "χ", "τ", "ι", "δ", "α"], emoji: "☀️", initialSound: "η", category: "φύση" },
        { word: "ηθοποιός", syllables: ["η", "θο", "ποι", "ός"], phonemes: ["η", "θ", "ο", "π", "οι", "ο", "σ"], emoji: "🎭", initialSound: "η", category: "αντικείμενα" },
        { word: "ησυχία", syllables: ["η", "συ", "χί", "α"], phonemes: ["η", "σ", "ι", "χ", "ι", "α"], emoji: "🤫", initialSound: "η", category: "αντικείμενα" },

        { word: "θησαυρός", syllables: ["θη", "σαυ", "ρός"], phonemes: ["θ", "η", "σ", "αυ", "ρ", "ο", "σ"], emoji: "💰", initialSound: "θ", category: "αντικείμενα" },
        { word: "θέατρο", syllables: ["θέ", "α", "τρο"], phonemes: ["θ", "ε", "α", "τ", "ρ", "ο"], emoji: "🎭", initialSound: "θ", category: "αντικείμενα" },
        { word: "θερμόμετρο", syllables: ["θερ", "μό", "με", "τρο"], phonemes: ["θ", "ε", "ρ", "μ", "ο", "μ", "ε", "τ", "ρ", "ο"], emoji: "🌡️", initialSound: "θ", category: "αντικείμενα" },
        { word: "θρανίο", syllables: ["θρα", "νί", "ο"], phonemes: ["θ", "ρ", "α", "ν", "ι", "ο"], emoji: "🪑", initialSound: "θ", category: "αντικείμενα" },
        { word: "θρόνος", syllables: ["θρό", "νος"], phonemes: ["θ", "ρ", "ο", "ν", "ο", "σ"], emoji: "👑", initialSound: "θ", category: "αντικείμενα" },
        { word: "θόρυβος", syllables: ["θό", "ρυ", "βος"], phonemes: ["θ", "ο", "ρ", "ι", "β", "ο", "σ"], emoji: "🔊", initialSound: "θ", category: "αντικείμενα" },
        { word: "θηρίο", syllables: ["θη", "ρί", "ο"], phonemes: ["θ", "η", "ρ", "ι", "ο"], emoji: "🦁", initialSound: "θ", category: "ζώα" },
        { word: "θαύμα", syllables: ["θαύ", "μα"], phonemes: ["θ", "αυ", "μ", "α"], emoji: "✨", initialSound: "θ", category: "αντικείμενα" },
        { word: "θεατής", syllables: ["θε", "α", "τής"], phonemes: ["θ", "ε", "α", "τ", "η", "σ"], emoji: "👀", initialSound: "θ", category: "αντικείμενα" },

        { word: "λαγός", syllables: ["λα", "γός"], phonemes: ["λ", "α", "γ", "ο", "σ"], emoji: "🐇", initialSound: "λ", category: "ζώα" },
        { word: "λεωφορείο", syllables: ["λε", "ω", "φο", "ρεί", "ο"], phonemes: ["λ", "ε", "ο", "φ", "ο", "ρ", "ει", "ο"], emoji: "🚌", initialSound: "λ", category: "αντικείμενα" },
        { word: "λάστιχο", syllables: ["λά", "στι", "χο"], phonemes: ["λ", "α", "σ", "τ", "ι", "χ", "ο"], emoji: "🛞", initialSound: "λ", category: "αντικείμενα" },
        { word: "λόφος", syllables: ["λό", "φος"], phonemes: ["λ", "ο", "φ", "ο", "σ"], emoji: "⛰️", initialSound: "λ", category: "φύση" },
        { word: "λιμάνι", syllables: ["λι", "μά", "νι"], phonemes: ["λ", "ι", "μ", "α", "ν", "ι"], emoji: "⚓", initialSound: "λ", category: "φύση" },

        { word: "νεφέλη", syllables: ["νε", "φέ", "λη"], phonemes: ["ν", "ε", "φ", "ε", "λ", "η"], emoji: "☁️", initialSound: "ν", category: "φύση" },
        { word: "νόμισμα", syllables: ["νό", "μι", "σμα"], phonemes: ["ν", "ο", "μ", "ι", "σ", "μ", "α"], emoji: "🪙", initialSound: "ν", category: "αντικείμενα" },
        { word: "ναός", syllables: ["να", "ός"], phonemes: ["ν", "α", "ο", "σ"], emoji: "🏛️", initialSound: "ν", category: "αντικείμενα" },
        { word: "νιφάδα", syllables: ["νι", "φά", "δα"], phonemes: ["ν", "ι", "φ", "α", "δ", "α"], emoji: "❄️", initialSound: "ν", category: "φύση" },

        { word: "όνειρο", syllables: ["ό", "νει", "ρο"], phonemes: ["ο", "ν", "ει", "ρ", "ο"], emoji: "💭", initialSound: "ο", category: "αντικείμενα" },
        { word: "ουρανός", syllables: ["ου", "ρα", "νός"], phonemes: ["ου", "ρ", "α", "ν", "ο", "σ"], emoji: "🌌", initialSound: "ο", category: "φύση" },
        { word: "ουρά", syllables: ["ου", "ρά"], phonemes: ["ου", "ρ", "α"], emoji: "🐾", initialSound: "ο", category: "σώμα" },
        { word: "οδοντόβουρτσα", syllables: ["ο", "δο", "ντό", "βου", "ρτσα"], phonemes: ["ο", "δ", "ο", "ντ", "ο", "β", "ου", "ρ", "τσ", "α"], emoji: "🪥", initialSound: "ο", category: "αντικείμενα" },
        { word: "οικογένεια", syllables: ["οι", "κο", "γέ", "νεια"], phonemes: ["οι", "κ", "ο", "γ", "ε", "ν", "ι", "α"], emoji: "👨‍👩‍👧‍👦", initialSound: "ο", category: "αντικείμενα" },
        { word: "οδηγός", syllables: ["ο", "δη", "γός"], phonemes: ["ο", "δ", "η", "γ", "ο", "σ"], emoji: "🚗", initialSound: "ο", category: "αντικείμενα" },
        { word: "οδός", syllables: ["ο", "δός"], phonemes: ["ο", "δ", "ο", "σ"], emoji: "🛣️", initialSound: "ο", category: "αντικείμενα" },
        { word: "όαση", syllables: ["ό", "α", "ση"], phonemes: ["ο", "α", "σ", "η"], emoji: "🏜️", initialSound: "ο", category: "φύση" },
        { word: "ομελέτα", syllables: ["ο", "με", "λέ", "τα"], phonemes: ["ο", "μ", "ε", "λ", "ε", "τ", "α"], emoji: "🍳", initialSound: "ο", category: "τρόφιμα" },

        { word: "ρόμπα", syllables: ["ρό", "μπα"], phonemes: ["ρ", "ο", "μπ", "α"], emoji: "🥋", initialSound: "ρ", category: "αντικείμενα" },
        { word: "ρακέτα", syllables: ["ρα", "κέ", "τα"], phonemes: ["ρ", "α", "κ", "ε", "τ", "α"], emoji: "🎾", initialSound: "ρ", category: "αντικείμενα" },
        { word: "ρίζα", syllables: ["ρί", "ζα"], phonemes: ["ρ", "ι", "ζ", "α"], emoji: "🌱", initialSound: "ρ", category: "φύση" },
        { word: "ρομπότ", syllables: ["ρο", "μπότ"], phonemes: ["ρ", "ο", "μπ", "ο", "τ"], emoji: "🤖", initialSound: "ρ", category: "αντικείμενα" },
        { word: "ράφι", syllables: ["ρά", "φι"], phonemes: ["ρ", "α", "φ", "ι"], emoji: "📚", initialSound: "ρ", category: "αντικείμενα" },

        { word: "τσάντα", syllables: ["τσά", "ντα"], phonemes: ["τσ", "α", "ντ", "α"], emoji: "👜", initialSound: "τ", category: "αντικείμενα" },
        { word: "τρένο", syllables: ["τρέ", "νο"], phonemes: ["τ", "ρ", "ε", "ν", "ο"], emoji: "🚂", initialSound: "τ", category: "αντικείμενα" },
        { word: "τοίχος", syllables: ["τοί", "χος"], phonemes: ["τ", "οι", "χ", "ο", "σ"], emoji: "🧱", initialSound: "τ", category: "αντικείμενα" },

        { word: "φούρνος", syllables: ["φούρ", "νος"], phonemes: ["φ", "ου", "ρ", "ν", "ο", "σ"], emoji: "🔥", initialSound: "φ", category: "αντικείμενα" },
        { word: "φουστάνι", syllables: ["φου", "στά", "νι"], phonemes: ["φ", "ου", "σ", "τ", "α", "ν", "ι"], emoji: "👗", initialSound: "φ", category: "αντικείμενα" },
        { word: "φλιτζάνι", syllables: ["φλι", "τζά", "νι"], phonemes: ["φ", "λ", "ι", "τζ", "α", "ν", "ι"], emoji: "☕", initialSound: "φ", category: "αντικείμενα" },
        { word: "φακός", syllables: ["φα", "κός"], phonemes: ["φ", "α", "κ", "ο", "σ"], emoji: "🔦", initialSound: "φ", category: "αντικείμενα" },

        { word: "χαλί", syllables: ["χα", "λί"], phonemes: ["χ", "α", "λ", "ι"], emoji: "🟫", initialSound: "χ", category: "αντικείμενα" },
        { word: "χάρτης", syllables: ["χάρ", "της"], phonemes: ["χ", "α", "ρ", "τ", "η", "σ"], emoji: "🗺️", initialSound: "χ", category: "αντικείμενα" },
        { word: "χιονάνθρωπος", syllables: ["χιο", "νά", "νθρω", "πος"], phonemes: ["χ", "ι", "ο", "ν", "α", "ν", "θ", "ρ", "ο", "π", "ο", "σ"], emoji: "⛄", initialSound: "χ", category: "αντικείμενα" },
        { word: "χορός", syllables: ["χο", "ρός"], phonemes: ["χ", "ο", "ρ", "ο", "σ"], emoji: "💃", initialSound: "χ", category: "αντικείμενα" },
        { word: "χαμόγελο", syllables: ["χα", "μό", "γε", "λο"], phonemes: ["χ", "α", "μ", "ο", "γ", "ε", "λ", "ο"], emoji: "😊", initialSound: "χ", category: "αντικείμενα" },

        { word: "ψαράς", syllables: ["ψα", "ράς"], phonemes: ["ψ", "α", "ρ", "α", "σ"], emoji: "🎣", initialSound: "ψ", category: "αντικείμενα" },
        { word: "ψιψίνα", syllables: ["ψι", "ψί", "να"], phonemes: ["ψ", "ι", "ψ", "ι", "ν", "α"], emoji: "🐱", initialSound: "ψ", category: "ζώα" },
        { word: "ψητό", syllables: ["ψη", "τό"], phonemes: ["ψ", "η", "τ", "ο"], emoji: "🍖", initialSound: "ψ", category: "τρόφιμα" },
        { word: "ψαλίδα", syllables: ["ψα", "λί", "δα"], phonemes: ["ψ", "α", "λ", "ι", "δ", "α"], emoji: "🐛", initialSound: "ψ", category: "ζώα" },
        { word: "ψύλλος", syllables: ["ψύλ", "λος"], phonemes: ["ψ", "ι", "λ", "ο", "σ"], emoji: "🦟", initialSound: "ψ", category: "ζώα" },
    ],

    /* ----------------------------------------------------------
       ONE-SYLLABLE WORDS — a separate, small pool kept apart from the
       main `words` list above. These are mostly interjections/short
       verb forms rather than picturable nouns, so they wouldn't fit the
       category/rhyme/initial-phoneme games that pull from `words` — they
       exist purely so syllableCounting (Level 2, "Μέτρα τις Συλλαβές")
       can include a 1-syllable tier.
       ---------------------------------------------------------- */
    oneSyllableWords: [
        { word: "πιες", syllables: ["πιες"], emoji: "🥤" },
        { word: "μια", syllables: ["μια"], emoji: "1️⃣" },
        { word: "μπλε", syllables: ["μπλε"], emoji: "🔵" },
        { word: "μπρος", syllables: ["μπρος"], emoji: "➡️" },
        { word: "βγες", syllables: ["βγες"], emoji: "🚪" },
        { word: "φως", syllables: ["φως"], emoji: "💡" },
        { word: "ντους", syllables: ["ντους"], emoji: "🚿" },
        { word: "γεια", syllables: ["γεια"], emoji: "👋" },
        { word: "νους", syllables: ["νους"], emoji: "🧠" },
        { word: "μη", syllables: ["μη"], emoji: "🚫" },
    ],

    /* ----------------------------------------------------------
       SENTENCES for Level 1
       Simple sentences (3-6 words) for word counting
       and sentence building.
       ---------------------------------------------------------- */
    sentences: [
        // 1-word sentences (easiest)
        { text: "Έλα.", words: ["Έλα"], difficulty: 1 },
        { text: "Φύγε.", words: ["Φύγε"], difficulty: 1 },
        { text: "Θέλω.", words: ["Θέλω"], difficulty: 1 },
        { text: "Πάμε!", words: ["Πάμε"], difficulty: 1 },
        { text: "Φάτε.", words: ["Φάτε"], difficulty: 1 },
        { text: "Παίξτε.", words: ["Παίξτε"], difficulty: 1 },
        { text: "Κοιμάται.", words: ["Κοιμάται"], difficulty: 1 },
        { text: "Διαβάζω.", words: ["Διαβάζω"], difficulty: 1 },
        { text: "Πονώ.", words: ["Πονώ"], difficulty: 1 },
        { text: "Τρέξτε.", words: ["Τρέξτε"], difficulty: 1 },
        { text: "Πάρε.", words: ["Πάρε"], difficulty: 1 },
        { text: "Πηδώ.", words: ["Πηδώ"], difficulty: 1 },

        // 2-word sentences
        { text: "Κάνει κρύο.", words: ["Κάνει", "κρύο"], difficulty: 2 },
        { text: "Έλα εδώ.", words: ["Έλα", "εδώ"], difficulty: 2 },
        { text: "Σε αγαπώ.", words: ["Σε", "αγαπώ"], difficulty: 2 },
        { text: "Φυσάει αέρας.", words: ["Φυσάει", "αέρας"], difficulty: 2 },
        { text: "Βρέχει δυνατά.", words: ["Βρέχει", "δυνατά"], difficulty: 2 },
        { text: "Πηδώ ψηλά.", words: ["Πηδώ", "ψηλά"], difficulty: 2 },
        { text: "Χιονίζει έξω.", words: ["Χιονίζει", "έξω"], difficulty: 2 },
        { text: "Φυσάει δυνατά.", words: ["Φυσάει", "δυνατά"], difficulty: 2 },
        { text: "Κάνει ζέστη.", words: ["Κάνει", "ζέστη"], difficulty: 2 },
        { text: "Βροντάει δυνατά.", words: ["Βροντάει", "δυνατά"], difficulty: 2 },
        { text: "Αστράφτει απόψε.", words: ["Αστράφτει", "απόψε"], difficulty: 2 },
        { text: "Ξημερώνει νωρίς.", words: ["Ξημερώνει", "νωρίς"], difficulty: 2 },
        { text: "Νυχτώνει γρήγορα.", words: ["Νυχτώνει", "γρήγορα"], difficulty: 2 },
        { text: "Παγώνει έξω.", words: ["Παγώνει", "έξω"], difficulty: 2 },
        { text: "Ζεσταίνει σήμερα.", words: ["Ζεσταίνει", "σήμερα"], difficulty: 2 },
        { text: "Φύγε τώρα.", words: ["Φύγε", "τώρα"], difficulty: 2 },
        { text: "Πέταξέ το.", words: ["Πέταξέ", "το"], difficulty: 2 },
        { text: "Τρέξε αργά.", words: ["Τρέξε", "αργά"], difficulty: 2 },
        { text: "Μαρία, έλα.", words: ["Μαρία,", "έλα"], difficulty: 2 },
        { text: "Γιώργο, πάρε.", words: ["Γιώργο,", "πάρε"], difficulty: 2 },

        // 3-word sentences
        { text: "Η γάτα τρέχει.", words: ["Η", "γάτα", "τρέχει"], difficulty: 2 },
        { text: "Ο σκύλος γαβγίζει.", words: ["Ο", "σκύλος", "γαβγίζει"], difficulty: 2 },
        { text: "Το πουλί πετάει.", words: ["Το", "πουλί", "πετάει"], difficulty: 2 },
        { text: "Ο μπαμπάς μαγειρεύει.", words: ["Ο", "μπαμπάς", "μαγειρεύει"], difficulty: 2 },
        { text: "Ο ήλιος λάμπει.", words: ["Ο", "ήλιος", "λάμπει"], difficulty: 2 },
        { text: "Η μαμά ξαπλώνει.", words: ["Η", "μαμά", "ξαπλώνει"], difficulty: 2 },
        { text: "Ο Νίκος γελάει.", words: ["Ο", "Νίκος", "γελάει"], difficulty: 2 },
        { text: "Η Μαρία πηδάει.", words: ["Η", "Μαρία", "πηδάει"], difficulty: 2 },
        { text: "Εγώ τρώω μήλο.", words: ["Εγώ", "τρώω", "μήλο"], difficulty: 2 },
        { text: "Εσύ παίζεις μπάλα.", words: ["Εσύ", "παίζεις", "μπάλα"], difficulty: 2 },
        { text: "Η πάπια κολυμπάει.", words: ["Η", "πάπια", "κολυμπάει"], difficulty: 2 },
        { text: "Το μωρό γελάει.", words: ["Το", "μωρό", "γελάει"], difficulty: 2 },
        { text: "Η χελώνα περπατάει.", words: ["Η", "χελώνα", "περπατάει"], difficulty: 2 },
        { text: "Το χιόνι πέφτει.", words: ["Το", "χιόνι", "πέφτει"], difficulty: 2 },
        { text: "Το μωρό κλαίει.", words: ["Το", "μωρό", "κλαίει"], difficulty: 2 },
        { text: "Η αγελάδα μουγκρίζει.", words: ["Η", "αγελάδα", "μουγκρίζει"], difficulty: 2 },
        { text: "Η αλυσίδα κόπηκε.", words: ["Η", "αλυσίδα", "κόπηκε"], difficulty: 2 },
        { text: "Ο πετεινός λαλεί.", words: ["Ο", "πετεινός", "λαλεί"], difficulty: 2 },
        { text: "Η μαμά τραγουδάει.", words: ["Η", "μαμά", "τραγουδάει"], difficulty: 2 },
        { text: "Η δασκάλα γράφει.", words: ["Η", "δασκάλα", "γράφει"], difficulty: 2 },
        { text: "Η μέλισσα βουίζει.", words: ["Η", "μέλισσα", "βουίζει"], difficulty: 2 },
        { text: "Ο βάτραχος πηδάει.", words: ["Ο", "βάτραχος", "πηδάει"], difficulty: 2 },
        { text: "Το φίδι σέρνεται.", words: ["Το", "φίδι", "σέρνεται"], difficulty: 2 },
        { text: "Ο ελέφαντας περπατάει.", words: ["Ο", "ελέφαντας", "περπατάει"], difficulty: 2 },
        { text: "Η αρκούδα χορεύει.", words: ["Η", "αρκούδα", "χορεύει"], difficulty: 2 },
        { text: "Το ποντίκι τρέχει.", words: ["Το", "ποντίκι", "τρέχει"], difficulty: 2 },
        { text: "Ο αετός πετάει.", words: ["Ο", "αετός", "πετάει"], difficulty: 2 },
        { text: "Η μαϊμού πηδάει.", words: ["Η", "μαϊμού", "πηδάει"], difficulty: 2 },
        { text: "Ο Αντρέας παίζει.", words: ["Ο", "Αντρέας", "παίζει"], difficulty: 2 },
        { text: "Ο παππούς χαμογελάει.", words: ["Ο", "παππούς", "χαμογελάει"], difficulty: 2 },
        { text: "Η γιαγιά πλέκει.", words: ["Η", "γιαγιά", "πλέκει"], difficulty: 2 },
        { text: "Το κοριτσάκι σκαρφαλώνει.", words: ["Το", "κοριτσάκι", "σκαρφαλώνει"], difficulty: 2 },
        { text: "Το αγοράκι χρωματίζει.", words: ["Το", "αγοράκι", "χρωματίζει"], difficulty: 2 },
        { text: "Το παιδί κολυμπάει.", words: ["Το", "παιδί", "κολυμπάει"], difficulty: 2 },
        { text: "Η Ελένη κοιμάται.", words: ["Η", "Ελένη", "κοιμάται"], difficulty: 2 },
        { text: "Ο Γιάννης χτενίζεται.", words: ["Ο", "Γιάννης", "χτενίζεται"], difficulty: 2 },
        { text: "Η Άννα ποτίζει.", words: ["Η", "Άννα", "ποτίζει"], difficulty: 2 },
        { text: "Ο Σάββας καθαρίζει.", words: ["Ο", "Σάββας", "καθαρίζει"], difficulty: 2 },
        { text: "Ο Κωνσταντίνος οδηγεί.", words: ["Ο", "Κωνσταντίνος", "οδηγεί"], difficulty: 2 },
        { text: "Η Γεωργία λούζεται.", words: ["Η", "Γεωργία", "λούζεται"], difficulty: 2 },
        { text: "Έλα εδώ γρήγορα.", words: ["Έλα", "εδώ", "γρήγορα"], difficulty: 2 },
        { text: "Πήγαινε στο σπίτι.", words: ["Πήγαινε", "στο", "σπίτι"], difficulty: 2 },
        { text: "Φάε μία σοκολάτα.", words: ["Φάε", "μία", "σοκολάτα"], difficulty: 2 },
        { text: "Πάρε ένα φρούτο.", words: ["Πάρε", "ένα", "φρούτο"], difficulty: 2 },
        { text: "Κάνε δύο στροφές.", words: ["Κάνε", "δύο", "στροφές"], difficulty: 2 },
        { text: "Δώσε πέντε κάρτες.", words: ["Δώσε", "πέντε", "κάρτες"], difficulty: 2 },
        { text: "Κάνε την άσκηση.", words: ["Κάνε", "την", "άσκηση"], difficulty: 2 },
        { text: "Θέλω μια σοκολάτα.", words: ["Θέλω", "μια", "σοκολάτα"], difficulty: 2 },
        { text: "Έφτιαξα ένα κάστρο.", words: ["Έφτιαξα", "ένα", "κάστρο"], difficulty: 2 },
        { text: "Κατασκεύασα ένα δέντρο.", words: ["Κατασκεύασα", "ένα", "δέντρο"], difficulty: 2 },
        { text: "Έσπασε το ποτήρι.", words: ["Έσπασε", "το", "ποτήρι"], difficulty: 2 },
        { text: "Αγόρασε μία φούσκα.", words: ["Αγόρασε", "μία", "φούσκα"], difficulty: 2 },
        { text: "Πήδησαν τον φράκτη.", words: ["Πήδησαν", "τον", "φράκτη"], difficulty: 2 },

        // 4-word sentences
        { text: "Η γάτα τρώει ψάρι.", words: ["Η", "γάτα", "τρώει", "ψάρι"], difficulty: 3 },
        { text: "Η γάτα πίνει γάλα.", words: ["Η", "γάτα", "πίνει", "γάλα"], difficulty: 3 },
        { text: "Το παιδί παίζει μπάλα.", words: ["Το", "παιδί", "παίζει", "μπάλα"], difficulty: 3 },
        { text: "Το κουνέλι τρώει καρότο.", words: ["Το", "κουνέλι", "τρώει", "καρότο"], difficulty: 3 },
        { text: "Το λουλούδι είναι κόκκινο.", words: ["Το", "λουλούδι", "είναι", "κόκκινο"], difficulty: 3 },
        { text: "Ο μπαμπάς διαβάζει βιβλίο.", words: ["Ο", "μπαμπάς", "διαβάζει", "βιβλίο"], difficulty: 3 },
        { text: "Το πουλί τρώει σπόρους.", words: ["Το", "πουλί", "τρώει", "σπόρους"], difficulty: 3 },
        { text: "Η χελώνα τρώει σαλάτα.", words: ["Η", "χελώνα", "τρώει", "σαλάτα"], difficulty: 3 },
        { text: "Ο μπαμπάς φτιάχνει παγωτό.", words: ["Ο", "μπαμπάς", "φτιάχνει", "παγωτό"], difficulty: 3 },
        { text: "Το δελφίνι κολυμπάει γρήγορα.", words: ["Το", "δελφίνι", "κολυμπάει", "γρήγορα"], difficulty: 3 },
        { text: "Η λάμπα φωτίζει δυνατά.", words: ["Η", "λάμπα", "φωτίζει", "δυνατά"], difficulty: 3 },
        { text: "Το ρολόι χτυπάει δυνατά.", words: ["Το", "ρολόι", "χτυπάει", "δυνατά"], difficulty: 3 },
        { text: "Η αγελάδα τρώει χόρτο.", words: ["Η", "αγελάδα", "τρώει", "χόρτο"], difficulty: 3 },
        { text: "Το άλογο τρώει σανό.", words: ["Το", "άλογο", "τρώει", "σανό"], difficulty: 3 },
        { text: "Ο πετεινός ξυπνάει νωρίς.", words: ["Ο", "πετεινός", "ξυπνάει", "νωρίς"], difficulty: 3 },
        { text: "Η κότα γεννάει αυγό.", words: ["Η", "κότα", "γεννάει", "αυγό"], difficulty: 3 },
        { text: "Η μέλισσα φτιάχνει μέλι.", words: ["Η", "μέλισσα", "φτιάχνει", "μέλι"], difficulty: 3 },
        { text: "Ο βάτραχος πηδάει ψηλά.", words: ["Ο", "βάτραχος", "πηδάει", "ψηλά"], difficulty: 3 },
        { text: "Το φίδι είναι μακρύ.", words: ["Το", "φίδι", "είναι", "μακρύ"], difficulty: 3 },
        { text: "Ο ελέφαντας είναι μεγάλος.", words: ["Ο", "ελέφαντας", "είναι", "μεγάλος"], difficulty: 3 },
        { text: "Το ποντίκι τρώει τυρί.", words: ["Το", "ποντίκι", "τρώει", "τυρί"], difficulty: 3 },
        { text: "Ο αετός πετάει ψηλά.", words: ["Ο", "αετός", "πετάει", "ψηλά"], difficulty: 3 },
        { text: "Η μαϊμού τρώει μπανάνα.", words: ["Η", "μαϊμού", "τρώει", "μπανάνα"], difficulty: 3 },
        { text: "Το λιοντάρι είναι δυνατό.", words: ["Το", "λιοντάρι", "είναι", "δυνατό"], difficulty: 3 },
        { text: "Ο παππούς πίνει καφέ.", words: ["Ο", "παππούς", "πίνει", "καφέ"], difficulty: 3 },
        { text: "Η γιαγιά ψήνει κέικ.", words: ["Η", "γιαγιά", "ψήνει", "κέικ"], difficulty: 3 },
        { text: "Το κοριτσάκι φοράει φόρεμα.", words: ["Το", "κοριτσάκι", "φοράει", "φόρεμα"], difficulty: 3 },
        { text: "Το αγοράκι φοράει παπούτσια.", words: ["Το", "αγοράκι", "φοράει", "παπούτσια"], difficulty: 3 },
        { text: "Ο δάσκαλος γράφει γράμματα.", words: ["Ο", "δάσκαλος", "γράφει", "γράμματα"], difficulty: 3 },
        { text: "Η νηπιαγωγός λέει παραμύθι.", words: ["Η", "νηπιαγωγός", "λέει", "παραμύθι"], difficulty: 3 },
        { text: "Ο κύριος οδηγεί αυτοκίνητο.", words: ["Ο", "κύριος", "οδηγεί", "αυτοκίνητο"], difficulty: 3 },
        { text: "Η κυρία κρατάει ομπρέλα.", words: ["Η", "κυρία", "κρατάει", "ομπρέλα"], difficulty: 3 },
        { text: "Τα παιδιά παίζουν παιχνίδια.", words: ["Τα", "παιδιά", "παίζουν", "παιχνίδια"], difficulty: 3 },
        { text: "Ο Κώστας φωνάζει δυνατά.", words: ["Ο", "Κώστας", "φωνάζει", "δυνατά"], difficulty: 3 },
        { text: "Έλα, πάμε στο πάρκο!", words: ["Έλα,", "πάμε", "στο", "πάρκο"], difficulty: 3 },
        { text: "Φώτη, πάμε στη θάλασσα;.", words: ["Φώτη,", "πάμε", "στη", "θάλασσα;"], difficulty: 3 },
        { text: "Μου αρέσει το κολύμπι.", words: ["Μου", "αρέσει", "το", "κολύμπι"], difficulty: 3 },
        { text: "Το ροδάκινο είναι φρούτο.", words: ["Το", "ροδάκινο", "είναι", "φρούτο"], difficulty: 3 },
        { text: "Το κόκκινο είναι χρώμα.", words: ["Το", "κόκκινο", "είναι", "χρώμα"], difficulty: 3 },
        { text: "Πάμε να φάμε σουβλάκια.", words: ["Πάμε", "να", "φάμε", "σουβλάκια"], difficulty: 3 },
        { text: "Έχω μια μεγάλη σοκολάτα.", words: ["Έχω", "μια", "μεγάλη", "σοκολάτα"], difficulty: 3 },
        { text: "Το γουρούνι είναι μεγάλο.", words: ["Το", "γουρούνι", "είναι", "μεγάλο"], difficulty: 3 },
        { text: "Το δέντρο χρειάζεται νερό.", words: ["Το", "δέντρο", "χρειάζεται", "νερό"], difficulty: 3 },
        { text: "Ο πυροσβέστης δουλεύει σκληρά.", words: ["Ο", "πυροσβέστης", "δουλεύει", "σκληρά"], difficulty: 3 },
        { text: "Το σπίτι χρειάζεται καθάρισμα.", words: ["Το", "σπίτι", "χρειάζεται", "καθάρισμα"], difficulty: 3 },
        { text: "Ο Μαρίνος διαβάζει παραμύθι.", words: ["Ο", "Μαρίνος", "διαβάζει", "παραμύθι"], difficulty: 3 },
        { text: "Η δασκάλα πίνει γρανίτα.", words: ["Η", "δασκάλα", "πίνει", "γρανίτα"], difficulty: 3 },

        // 5-word sentences (hardest)
        { text: "Η Μαρία έσπασε το βάζο.", words: ["Η", "Μαρία", "έσπασε", "το", "βάζο"], difficulty: 4 },
        { text: "Ο Γιώργος πήρε τα λουλούδια.", words: ["Ο", "Γιώργος", "πήρε", "τα", "λουλούδια"], difficulty: 4 },
        { text: "Η γάτα κάθεται στην καρέκλα.", words: ["Η", "γάτα", "κάθεται", "στην", "καρέκλα"], difficulty: 4 },
        { text: "Ο σκύλος κοιμάται στο σπίτι.", words: ["Ο", "σκύλος", "κοιμάται", "στο", "σπίτι"], difficulty: 4 },
        { text: "Τα παιδιά παίζουν στην αυλή.", words: ["Τα", "παιδιά", "παίζουν", "στην", "αυλή"], difficulty: 4 },
        { text: "Η μαμά αγαπάει το παιδί.", words: ["Η", "μαμά", "αγαπάει", "το", "παιδί"], difficulty: 4 },
        { text: "Ο ήλιος λάμπει στον ουρανό.", words: ["Ο", "ήλιος", "λάμπει", "στον", "ουρανό"], difficulty: 4 },
        { text: "Το ψάρι κολυμπάει στη θάλασσα.", words: ["Το", "ψάρι", "κολυμπάει", "στη", "θάλασσα"], difficulty: 4 },
        { text: "Η μαμά αγόρασε φρέσκα φρούτα.", words: ["Η", "μαμά", "αγόρασε", "φρέσκα", "φρούτα"], difficulty: 4 },
        { text: "Τα παιδιά τρέχουν στο πάρκο.", words: ["Τα", "παιδιά", "τρέχουν", "στο", "πάρκο"], difficulty: 4 },
        { text: "Ο Γιώργος φτιάχνει ένα πλοίο.", words: ["Ο", "Γιώργος", "φτιάχνει", "ένα", "πλοίο"], difficulty: 4 },
        { text: "Μαρία, πάμε να φάμε παγωτό;.", words: ["Μαρία,", "πάμε", "να", "φάμε", "παγωτό;"], difficulty: 4 },
        { text: "Η αγελάδα τρώει πράσινο χορτάρι.", words: ["Η", "αγελάδα", "τρώει", "πράσινο", "χορτάρι"], difficulty: 4 },
        { text: "Το άλογο τρέχει στο χωράφι.", words: ["Το", "άλογο", "τρέχει", "στο", "χωράφι"], difficulty: 4 },
        { text: "Ο πετεινός φωνάζει το πρωί.", words: ["Ο", "πετεινός", "φωνάζει", "το", "πρωί"], difficulty: 4 },
        { text: "Η κότα γεννάει φρέσκα αυγά.", words: ["Η", "κότα", "γεννάει", "φρέσκα", "αυγά"], difficulty: 4 },
        { text: "Η μέλισσα πετάει στα λουλούδια.", words: ["Η", "μέλισσα", "πετάει", "στα", "λουλούδια"], difficulty: 4 },
        { text: "Ο βάτραχος ζει στη λίμνη.", words: ["Ο", "βάτραχος", "ζει", "στη", "λίμνη"], difficulty: 4 },
        { text: "Το φίδι κρύβεται στα χόρτα.", words: ["Το", "φίδι", "κρύβεται", "στα", "χόρτα"], difficulty: 4 },
        { text: "Ο ελέφαντας ζει στη ζούγκλα.", words: ["Ο", "ελέφαντας", "ζει", "στη", "ζούγκλα"], difficulty: 4 },
        { text: "Το ποντίκι κρύβεται στην τρύπα.", words: ["Το", "ποντίκι", "κρύβεται", "στην", "τρύπα"], difficulty: 4 },
        { text: "Ο Δημήτρης τρώει ένα παγωτό.", words: ["Ο", "Δημήτρης", "τρώει", "ένα", "παγωτό"], difficulty: 4 },
        { text: "Η μαϊμού κάθεται στο δέντρο.", words: ["Η", "μαϊμού", "κάθεται", "στο", "δέντρο"], difficulty: 4 },
        { text: "Το λιοντάρι κοιμάται στη σκιά.", words: ["Το", "λιοντάρι", "κοιμάται", "στη", "σκιά"], difficulty: 4 },
        { text: "Ο παππούς κάθεται στην πολυθρόνα.", words: ["Ο", "παππούς", "κάθεται", "στην", "πολυθρόνα"], difficulty: 4 },
        { text: "Η γιαγιά ξεκουράζεται στον καναπέ.", words: ["Η", "γιαγιά", "ξεκουράζεται", "στον", "καναπέ"], difficulty: 4 },
        { text: "Το κοριτσάκι αγαπά τη μαμά.", words: ["Το", "κοριτσάκι", "αγαπά", "τη", "μαμά"], difficulty: 4 },
        { text: "Το αγοράκι πηδάει το φράκτη.", words: ["Το", "αγοράκι", "πηδάει", "το", "φράκτη"], difficulty: 4 },
        { text: "Ο δάσκαλος γράφει στον πίνακα.", words: ["Ο", "δάσκαλος", "γράφει", "στον", "πίνακα"], difficulty: 4 },
        { text: "Η νηπιαγωγός διαβάζει ένα βιβλίο.", words: ["Η", "νηπιαγωγός", "διαβάζει", "ένα", "βιβλίο"], difficulty: 4 },
        { text: "Ο κύριος περπατάει στο πάρκο.", words: ["Ο", "κύριος", "περπατάει", "στο", "πάρκο"], difficulty: 4 },
        { text: "Η κυρία ψωνίζει στην αγορά.", words: ["Η", "κυρία", "ψωνίζει", "στην", "αγορά"], difficulty: 4 },
    ],

    /* ----------------------------------------------------------
       RHYME PAIRS for Level 3
       Pairs of words that rhyme (share ending sounds).
       ---------------------------------------------------------- */
    rhymePairs: [
        { word1: "γάτα", word2: "ντομάτα", emoji1: "🐱", emoji2: "🍅", ending: "-άτα" },
        { word1: "γάτα", word2: "σαλάτα", emoji1: "🐱", emoji2: "🥗", ending: "-άτα" },
        { word1: "γάτα", word2: "πατάτα", emoji1: "🐱", emoji2: "🥔", ending: "-άτα" },
        { word1: "μπάλα", word2: "σκάλα", emoji1: "⚽", emoji2: "🪜", ending: "-άλα" },
        { word1: "μπάλα", word2: "γάλα", emoji1: "⚽", emoji2: "🥛", ending: "-άλα" },
        { word1: "λουλούδι", word2: "τραγούδι", emoji1: "🌸", emoji2: "🎵", ending: "-ούδι" },
        { word1: "ψάρι", word2: "φανάρι", emoji1: "🐟", emoji2: "🏮", ending: "-άρι" },
        { word1: "ψάρι", word2: "φεγγάρι", emoji1: "🐟", emoji2: "🌙", ending: "-άρι" },
        // "φίδι"/"κλειδί" and "σπίτι"/"κουτί" used to live here, but
        // neither actually rhymes — φίδι is stressed ΦΙ-δι and κλειδί is
        // stressed κλει-ΔΙ; σπίτι is stressed ΣΠΙ-τι and κουτί is
        // stressed κου-ΤΙ. Same trap as the rhymeGroups note below:
        // sharing a final letter isn't the same as sharing stress
        // position, so a child hearing them wouldn't perceive them as
        // rhyming.
        { word1: "μέλι", word2: "κουνέλι", emoji1: "🍯", emoji2: "🐰", ending: "-έλι" },
        { word1: "πόδι", word2: "ρόδι", emoji1: "🦶", emoji2: "🥭", ending: "-όδι" },
        { word1: "μπαλόνι", word2: "μακαρόνι", emoji1: "🎈", emoji2: "🍝", ending: "-όνι" },
        { word1: "μπαλόνι", word2: "πεπόνι", emoji1: "🎈", emoji2: "🍈", ending: "-όνι" },
        { word1: "σκύλος", word2: "μύλος", emoji1: "🐶", emoji2: "🏭", ending: "-ύλος" },
        { word1: "βουνό", word2: "νερό", emoji1: "🏔️", emoji2: "💧", ending: "-ό" },
        { word1: "πορτοκάλι", word2: "σανδάλι", emoji1: "🍊", emoji2: "👡", ending: "-άλι" },
        { word1: "αστέρι", word2: "χέρι", emoji1: "⭐", emoji2: "🤚", ending: "-έρι" },
        { word1: "λεμόνι", word2: "πεπόνι", emoji1: "🍋", emoji2: "🍈", ending: "-όνι" },
        { word1: "χελώνα", word2: "κορώνα", emoji1: "🐢", emoji2: "👑", ending: "-ώνα" },
        { word1: "γουρούνι", word2: "κουδούνι", emoji1: "🐷", emoji2: "🔔", ending: "-ούνι" },
        { word1: "βάρκα", word2: "μάρκα", emoji1: "⛵", emoji2: "🏷️", ending: "-άρκα" },
        { word1: "λάμπα", word2: "ράμπα", emoji1: "💡", emoji2: "🛤️", ending: "-άμπα" },
        { word1: "τούρτα", word2: "κούρτα", emoji1: "🎂", emoji2: "🪟", ending: "-ούρτα" },
        { word1: "χιόνι", word2: "πεπόνι", emoji1: "❄️", emoji2: "🍈", ending: "-όνι" },
        { word1: "λύκος", word2: "σκύλος", emoji1: "🐺", emoji2: "🐶", ending: "-ύλος" },
        { word1: "γάντι", word2: "δόντι", emoji1: "🧤", emoji2: "🦷", ending: "-ντι" },
    ],

    /* ----------------------------------------------------------
       RHYME GROUPS for rhyme production
       Each group has a pattern ending and multiple words.
       ---------------------------------------------------------- */
    rhymeGroups: [
        { ending: "-άτα", words: [
            { word: "γάτα", emoji: "🐱" },
            { word: "ντομάτα", emoji: "🍅" },
            { word: "σαλάτα", emoji: "🥗" },
            { word: "πατάτα", emoji: "🥔" },
            { word: "σοκολάτα", emoji: "🍫" },
        ]},
        { ending: "-άλα", words: [
            { word: "μπάλα", emoji: "⚽" },
            { word: "σκάλα", emoji: "🪜" },
            { word: "γάλα", emoji: "🥛" },
        ]},
        { ending: "-ούδι", words: [
            { word: "λουλούδι", emoji: "🌸" },
            { word: "τραγούδι", emoji: "🎵" },
        ]},
        { ending: "-άρι", words: [
            { word: "ψάρι", emoji: "🐟" },
            { word: "φανάρι", emoji: "🏮" },
            { word: "φεγγάρι", emoji: "🌙" },
            { word: "λιοντάρι", emoji: "🦁" },
        ]},
        { ending: "-έλι", words: [
            { word: "μέλι", emoji: "🍯" },
            { word: "κουνέλι", emoji: "🐰" },
            { word: "χέλι", emoji: "🐡" },
            { word: "μπιζέλι", emoji: "🫛" },
        ]},
        { ending: "-όνι", words: [
            { word: "μπαλόνι", emoji: "🎈" },
            { word: "μακαρόνι", emoji: "🍝" },
            { word: "πεπόνι", emoji: "🍈" },
            { word: "λεμόνι", emoji: "🍋" },
            { word: "χιόνι", emoji: "❄️" },
        ]},
        // NOTE: "κλειδί" used to live here, but it doesn't actually rhyme
        // with φίδι — φίδι is stressed on the FI (ΦΙ-δι), while κλειδί is
        // stressed on the very last syllable (κλει-ΔΙ). Different stress
        // placement means a child hearing them wouldn't perceive them as
        // rhyming, which defeats the point of a rhyme-recognition game.
        // Replaced with two words that genuinely share φίδι's stressed
        // "-ίδι"/"-ύδι" (same /idi/ sound) pattern.
        { ending: "-ίδι", words: [
            { word: "φίδι", emoji: "🐍" },
            { word: "στρείδι", emoji: "🦪" },
            { word: "καρύδι", emoji: "🌰" },
        ]},
        { ending: "-ώνα", words: [
            { word: "χελώνα", emoji: "🐢" },
            { word: "κορώνα", emoji: "👑" },
            { word: "κολώνα", emoji: "🏛️" },
        ]},
        { ending: "-ούνι", words: [
            { word: "γουρούνι", emoji: "🐷" },
            { word: "κουδούνι", emoji: "🔔" },
        ]},
    ],

    /* ----------------------------------------------------------
       SOUND GROUPS for Level 4
       Words grouped by initial sound for sorting activities.
       ---------------------------------------------------------- */
    soundGroups: {
        "μ": [
            { word: "μήλο", emoji: "🍎" },
            { word: "μπάλα", emoji: "⚽" },
            { word: "μέλι", emoji: "🍯" },
            { word: "μύτη", emoji: "👃" },
            { word: "μάτι", emoji: "👁️" },
            { word: "μπανάνα", emoji: "🍌" },
            { word: "μολύβι", emoji: "✏️" },
            { word: "μαϊμού", emoji: "🐒" },
            { word: "μέλισσα", emoji: "🐝" },
            { word: "μπισκότο", emoji: "🍪" },
            { word: "μανιτάρι", emoji: "🍄" },
        ],
        "σ": [
            { word: "σπίτι", emoji: "🏠" },
            { word: "σκύλος", emoji: "🐶" },
            { word: "σαλάτα", emoji: "🥗" },
            { word: "σκάλα", emoji: "🪜" },
            { word: "σοκολάτα", emoji: "🍫" },
            { word: "σταφύλι", emoji: "🍇" },
            { word: "σύννεφο", emoji: "☁️" },
            { word: "στόμα", emoji: "👄" },
            { word: "σαλιγκάρι", emoji: "🐌" },
        ],
        "κ": [
            { word: "κουνέλι", emoji: "🐰" },
            { word: "κλειδί", emoji: "🔑" },
            { word: "κουτί", emoji: "📦" },
            { word: "καρπούζι", emoji: "🍉" },
            { word: "κότα", emoji: "🐔" },
            { word: "καρέκλα", emoji: "💺" },
            { word: "καρότο", emoji: "🥕" },
            { word: "καπέλο", emoji: "🎩" },
            { word: "κεράσι", emoji: "🍒" },
            { word: "καμήλα", emoji: "🐫" },
            { word: "κουδούνι", emoji: "🔔" },
            { word: "κιθάρα", emoji: "🎸" },
            { word: "κεράκι", emoji: "🕯️" },
            { word: "κοτόπουλο", emoji: "🍗" },
        ],
        "π": [
            { word: "πουλί", emoji: "🐦" },
            { word: "πόδι", emoji: "🦶" },
            { word: "πεπόνι", emoji: "🍈" },
            { word: "πεταλούδα", emoji: "🦋" },
            { word: "πορτοκάλι", emoji: "🍊" },
            { word: "ποτήρι", emoji: "🥤" },
            { word: "πατάτα", emoji: "🥔" },
            { word: "παπούτσι", emoji: "👟" },
            { word: "πάπια", emoji: "🦆" },
            { word: "πρόβατο", emoji: "🐑" },
            { word: "πίτσα", emoji: "🍕" },
            { word: "πόρτα", emoji: "🚪" },
            { word: "παγωτό", emoji: "🍦" },
            { word: "ποδήλατο", emoji: "🚲" },
            { word: "παράθυρο", emoji: "🪟" },
        ],
        "φ": [
            { word: "φίδι", emoji: "🐍" },
            { word: "φανάρι", emoji: "🏮" },
            { word: "φράουλα", emoji: "🍓" },
            { word: "φεγγάρι", emoji: "🌙" },
            { word: "φύλλο", emoji: "🍃" },
        ],
        "λ": [
            { word: "λουλούδι", emoji: "🌸" },
            { word: "λιοντάρι", emoji: "🦁" },
            { word: "λεμόνι", emoji: "🍋" },
            { word: "λάμπα", emoji: "💡" },
            { word: "λύκος", emoji: "🐺" },
        ],
        "β": [
            { word: "βιβλίο", emoji: "📖" },
            { word: "βουνό", emoji: "🏔️" },
            { word: "βάτραχος", emoji: "🐸" },
            { word: "βάρκα", emoji: "⛵" },
            { word: "βερίκοκο", emoji: "🍑" },
        ],
        "τ": [
            { word: "τραπέζι", emoji: "🪑" },
            { word: "τυρί", emoji: "🧀" },
            { word: "τραγούδι", emoji: "🎵" },
            { word: "τηλέφωνο", emoji: "📱" },
            { word: "τούρτα", emoji: "🎂" },
            { word: "τηλεόραση", emoji: "📺" },
        ],
        "γ": [
            { word: "γάτα", emoji: "🐱" },
            { word: "γάλα", emoji: "🥛" },
            { word: "γουρούνι", emoji: "🐷" },
            { word: "γραβάτα", emoji: "👔" },
            { word: "γρασίδι", emoji: "🌱" },
        ],
        "ν": [
            { word: "νερό", emoji: "💧" },
            { word: "ντομάτα", emoji: "🍅" },
            { word: "νύχι", emoji: "💅" },
            { word: "νησί", emoji: "🏝️" },
            { word: "ντουλάπα", emoji: "🚪" },
            { word: "νεράιδα", emoji: "🧚" },
        ],
        "δ": [
            { word: "δέντρο", emoji: "🌳" },
            { word: "δόντι", emoji: "🦷" },
            { word: "δελφίνι", emoji: "🐬" },
            { word: "δώρο", emoji: "🎁" },
            { word: "δάσος", emoji: "🌲" },
        ],
        "ζ": [
            { word: "ζέβρα", emoji: "🦓" },
            { word: "ζωγραφιά", emoji: "🎨" },
            { word: "ζώο", emoji: "🐾" },
            { word: "ζαμπόν", emoji: "🍖" },
            { word: "ζάχαρη", emoji: "🧂" },
        ],
        "χ": [
            { word: "χέρι", emoji: "🤚" },
            { word: "χελώνα", emoji: "🐢" },
            { word: "χαρταετός", emoji: "🪁" },
            { word: "χιόνι", emoji: "❄️" },
            { word: "χταπόδι", emoji: "🐙" },
        ],
        "ρ": [
            { word: "ρόδι", emoji: "🥭" },
            { word: "ρολόι", emoji: "⏰" },
            { word: "ρούχο", emoji: "👕" },
            { word: "ρόδα", emoji: "🛞" },
            { word: "ραδιόφωνο", emoji: "📻" },
        ],
        "ψ": [
            { word: "ψάρι", emoji: "🐟" },
            { word: "ψωμί", emoji: "🍞" },
            { word: "ψυγείο", emoji: "🧊" },
            { word: "ψαλίδι", emoji: "✂️" },
            { word: "ψώνια", emoji: "🛒" },
        ],
    },

    /* ----------------------------------------------------------
       PHONEME DELETION DATA for Level 5 (Remove first sound)
       remaining = word χωρίς το πρώτο φώνημα.
       ---------------------------------------------------------- */
    phonemeDeletion: [
        { word: "γάτα", first: "γ", remaining: "άτα", emoji: "🐱" },
        { word: "μήλο", first: "μ", remaining: "ήλο", emoji: "🍎" },
        { word: "πόδι", first: "π", remaining: "όδι", emoji: "🦶" },
        { word: "κότα", first: "κ", remaining: "ότα", emoji: "🐔" },
        { word: "φίδι", first: "φ", remaining: "ίδι", emoji: "🐍" },
        { word: "ψάρι", first: "ψ", remaining: "άρι", emoji: "🐟" },
        { word: "νερό", first: "ν", remaining: "ερό", emoji: "💧" },
        { word: "λεμόνι", first: "λ", remaining: "εμόνι", emoji: "🍋" },
        { word: "ζέβρα", first: "ζ", remaining: "έβρα", emoji: "🦓" },
        { word: "χέρι", first: "χ", remaining: "έρι", emoji: "🤚" },
        { word: "ρόδι", first: "ρ", remaining: "όδι", emoji: "🥭" },
        { word: "μάτι", first: "μ", remaining: "άτι", emoji: "👁️" },
        { word: "τυρί", first: "τ", remaining: "υρί", emoji: "🧀" },
        { word: "δόντι", first: "δ", remaining: "όντι", emoji: "🦷" },
    ],

    /* ----------------------------------------------------------
       WORD-SIZE PAIRS for Level 1 ("Μεγάλη ή μικρή λέξη;")
       Teaches that the WORD is not the OBJECT: the "bigger" word is
       whichever has more syllables — regardless of the real-world size
       of what it names.
       stage A = easy, big syllable-count gap
       stage B = harder, smaller gap
       stage C = conflict — the physically bigger object has the
       SHORTER word (objectSize marks which side that is, so a wrong
       answer here can be logged separately as "chose by object size").
       ---------------------------------------------------------- */
    wordSizePairs: [
        // Stage A — easy, big gap
        { word1: "γάτα", syllables1: ["γά", "τα"], emoji1: "🐱", word2: "ελικόπτερο", syllables2: ["ε", "λι", "κό", "πτε", "ρο"], emoji2: "🚁", stage: "A" },
        { word1: "ψωμί", syllables1: ["ψω", "μί"], emoji1: "🍞", word2: "πορτοκαλάδα", syllables2: ["πορ", "το", "κα", "λά", "δα"], emoji2: "🧃", stage: "A" },
        { word1: "μπάλα", syllables1: ["μπά", "λα"], emoji1: "⚽", word2: "τηλεόραση", syllables2: ["τη", "λε", "ό", "ρα", "ση"], emoji2: "📺", stage: "A" },
        { word1: "σκύλος", syllables1: ["σκύ", "λος"], emoji1: "🐶", word2: "αυτοκίνητο", syllables2: ["αυ", "το", "κί", "νη", "το"], emoji2: "🚗", stage: "A" },
        { word1: "ψάρι", syllables1: ["ψά", "ρι"], emoji1: "🐟", word2: "αεροπλάνο", syllables2: ["α", "ε", "ρο", "πλά", "νο"], emoji2: "✈️", stage: "A" },
        { word1: "γάλα", syllables1: ["γά", "λα"], emoji1: "🥛", word2: "λεωφορείο", syllables2: ["λε", "ω", "φο", "ρεί", "ο"], emoji2: "🚌", stage: "A" },
        { word1: "φως", syllables1: ["φως"], emoji1: "💡", word2: "ελέφαντας", syllables2: ["ε", "λέ", "φα", "ντας"], emoji2: "🐘", stage: "A" },
        { word1: "αυγό", syllables1: ["αυ", "γό"], emoji1: "🥚", word2: "σοκολάτα", syllables2: ["σο", "κο", "λά", "τα"], emoji2: "🍫", stage: "A" },
        { word1: "σπίτι", syllables1: ["σπί", "τι"], emoji1: "🏠", word2: "ποδήλατο", syllables2: ["πο", "δή", "λα", "το"], emoji2: "🚲", stage: "A" },
        { word1: "νερό", syllables1: ["νε", "ρό"], emoji1: "💧", word2: "κροκόδειλος", syllables2: ["κρο", "κό", "δει", "λος"], emoji2: "🐊", stage: "A" },

        // Stage B — harder, smaller gap
        { word1: "μήλο", syllables1: ["μή", "λο"], emoji1: "🍎", word2: "καρπούζι", syllables2: ["καρ", "πού", "ζι"], emoji2: "🍉", stage: "B" },
        { word1: "πόρτα", syllables1: ["πόρ", "τα"], emoji1: "🚪", word2: "παράθυρο", syllables2: ["πα", "ρά", "θυ", "ρο"], emoji2: "🪟", stage: "B" },
        { word1: "πιάτο", syllables1: ["πιά", "το"], emoji1: "🍽️", word2: "κουζίνα", syllables2: ["κου", "ζί", "να"], emoji2: "🍳", stage: "B" },
        { word1: "σκάλα", syllables1: ["σκά", "λα"], emoji1: "🪜", word2: "καρέκλα", syllables2: ["κα", "ρέ", "κλα"], emoji2: "💺", stage: "B" },
        { word1: "κάλτσα", syllables1: ["κάλ", "τσα"], emoji1: "🧦", word2: "παπούτσι", syllables2: ["πα", "πού", "τσι"], emoji2: "👟", stage: "B" },
        { word1: "βιβλίο", syllables1: ["βι", "βλί", "ο"], emoji1: "📖", word2: "τετράδιο", syllables2: ["τε", "τρά", "δι", "ο"], emoji2: "📓", stage: "B" },
        { word1: "δέντρο", syllables1: ["δέ", "ντρο"], emoji1: "🌳", word2: "λουλούδι", syllables2: ["λου", "λού", "δι"], emoji2: "🌸", stage: "B" },
        { word1: "ρολόι", syllables1: ["ρο", "λό", "ι"], emoji1: "⏰", word2: "τηλέφωνο", syllables2: ["τη", "λέ", "φω", "νο"], emoji2: "📱", stage: "B" },
        { word1: "ψυγείο", syllables1: ["ψυ", "γεί", "ο"], emoji1: "🧊", word2: "σοκολάτα", syllables2: ["σο", "κο", "λά", "τα"], emoji2: "🍫", stage: "B" },
        { word1: "μολύβι", syllables1: ["μο", "λύ", "βι"], emoji1: "✏️", word2: "ποδήλατο", syllables2: ["πο", "δή", "λα", "το"], emoji2: "🚲", stage: "B" },

        // Stage C — conflict: physically bigger object, shorter word
        { word1: "τρένο", syllables1: ["τρέ", "νο"], emoji1: "🚂", objectSize1: "big", word2: "πεταλούδα", syllables2: ["πε", "τα", "λού", "δα"], emoji2: "🦋", objectSize2: "small", stage: "C" },
        { word1: "φίδι", syllables1: ["φί", "δι"], emoji1: "🐍", objectSize1: "big", word2: "μυρμήγκι", syllables2: ["μυρ", "μή", "γκι"], emoji2: "🐜", objectSize2: "small", stage: "C" },
        { word1: "λύκος", syllables1: ["λύ", "κος"], emoji1: "🐺", objectSize1: "big", word2: "κατσαρίδα", syllables2: ["κα", "τσα", "ρί", "δα"], emoji2: "🪳", objectSize2: "small", stage: "C" },
        { word1: "βουνό", syllables1: ["βου", "νό"], emoji1: "🏔️", objectSize1: "big", word2: "λουλουδάκι", syllables2: ["λου", "λου", "δά", "κι"], emoji2: "🌸", objectSize2: "small", stage: "C" },
        { word1: "σπίτι", syllables1: ["σπί", "τι"], emoji1: "🏠", objectSize1: "big", word2: "σκουλήκι", syllables2: ["σκου", "λή", "κι"], emoji2: "🐛", objectSize2: "small", stage: "C" },
        { word1: "πλοίο", syllables1: ["πλοί", "ο"], emoji1: "🚢", objectSize1: "big", word2: "μέλισσα", syllables2: ["μέ", "λισ", "σα"], emoji2: "🐝", objectSize2: "small", stage: "C" },
        { word1: "αρκούδα", syllables1: ["αρ", "κού", "δα"], emoji1: "🐻", objectSize1: "big", word2: "πασχαλίτσα", syllables2: ["πα", "σχα", "λί", "τσα"], emoji2: "🐞", objectSize2: "small", stage: "C" },
        { word1: "φάλαινα", syllables1: ["φά", "λαι", "να"], emoji1: "🐋", objectSize1: "big", word2: "σαλιγκάρι", syllables2: ["σα", "λι", "γκά", "ρι"], emoji2: "🐌", objectSize2: "small", stage: "C" },
        { word1: "τρακτέρ", syllables1: ["τρα", "κτέρ"], emoji1: "🚜", objectSize1: "big", word2: "σκαθάρι", syllables2: ["σκα", "θά", "ρι"], emoji2: "🪲", objectSize2: "small", stage: "C" },
        { word1: "ταύρος", syllables1: ["ταύ", "ρος"], emoji1: "🐂", objectSize1: "big", word2: "ποντίκι", syllables2: ["πο", "ντί", "κι"], emoji2: "🐭", objectSize2: "small", stage: "C" },
    ],

    /* ----------------------------------------------------------
       LEVEL CONFIGURATION
       ---------------------------------------------------------- */
    levels: [
        {
            id: 1,
            title: "Λέξη & Πρόταση",
            description: "Μαθαίνω να μετράω λέξεις και να φτιάχνω προτάσεις!",
            emoji: "",
            color: "#FFE082",
            colorDark: "#F9A825",
            games: [
                { id: "wordSizeCompare", title: "Μεγάλη ή μικρή λέξη;", description: "Ποια λέξη έχει περισσότερες συλλαβές;", icon: "🐘<span style=\"font-size: 0.5em;\">🐜</span>" },
                { id: "wordCounting", title: "Χτύπα τις Λέξεις!", description: "Μέτρησε τις λέξεις χτυπώντας τα χέρια σου", icon: "👏" },
                { id: "wordPosition", title: "Πρώτη ή Τελευταία λέξη;", description: "Ποια λέξη ήταν πρώτη, τελευταία ή μεσαία;", icon: "↔️" },
                { id: "sentenceBuilder", title: "Φτιάξε Πρόταση!", description: "Βάλε τις λέξεις στη σωστή σειρά", icon: "🧩" },
                { id: "wordDeletion", title: "Πες την πρόταση χωρίς μια λέξη", description: "Πες την πρόταση χωρίς τη λέξη που λείπει!", icon: "🗑️" },
            ]
        },
        {
            id: 2,
            title: "Συλλαβές",
            description: "Χωρίζω τις λέξεις σε κομμάτια!",
            emoji: "",
            color: "#A8E6CF",
            colorDark: "#43A047",
            games: [
                { id: "syllableSynthesis", title: "Ένωσε τις Συλλαβές!", description: "Βρες ποια λέξη κρύβεται", img: "syllable_synthesis.png" },
                { id: "syllableCounting", title: "Μέτρα τις Συλλαβές!", description: "Πόσα κομμάτια έχει η λέξη;", img: "syllable_counting.png" },
                { id: "syllableSplit", title: "Κόψε τη Λέξη!", description: "Χώρισε τη λέξη σε συλλαβές", icon: "✂️" },
                { id: "syllableRemoval", title: "Τι Μένει;", description: "Αφαίρεσε μια συλλαβή!", img: "syllable_removal.png" },
            ]
        },
        {
            id: 3,
            title: "Ομοιοκαταληξία",
            description: "Βρίσκω λέξεις που μοιάζουν!",
            emoji: "",
            color: "#B8A9E8",
            colorDark: "#7E57C2",
            games: [
                { id: "findRhyme", title: "Βρες τη Ρίμα!", description: "Ποια λέξη ταιριάζει;", icon: "🎯" },
                { id: "rhymeMemory", title: "Memory Ρίμες!", description: "Ταίριαξε τα ζευγάρια", img: "memory_cards.png" },
                { id: "produceRhyme", title: "Φτιάξε Ρίμα!", description: "Βρες λέξη που ομοιοκαταληκτεί", img: "building_blocks.png" },
                { id: "rhymeOddOneOut", title: "Βρες το Διαφορετικό!", description: "Ποια λέξη δεν ομοιοκαταληκτεί;", icon: "🕵️" },
            ]
        },
        {
            id: 4,
            title: "Αρχικό & Τελικό Φώνημα",
            description: "Ακούω τον πρώτο και τον τελευταίο ήχο!",
            emoji: "",
            color: "#87CEEB",
            colorDark: "#1976D2",
            games: [
                { id: "findInitialPhoneme", title: "Βρίσκω το Αρχικό Φώνημα!", description: "Από ποιο φώνημα αρχίζει η λέξη;", icon: "⏮️" },
                { id: "groupBySound", title: "Ομαδοποίησε!", description: "Βάλε τις λέξεις στη σωστή ομάδα", icon: "🧺" },
                { id: "initialSoundMC", title: "Τι Αρχίζει από...;", description: "Βρες τη σωστή λέξη!", icon: "🆎" },
                { id: "findFinalPhoneme", title: "Βρίσκω το Τελικό Φώνημα!", description: "Σε ποιο φώνημα τελειώνει η λέξη;", icon: "⏭️" },
                { id: "soundOddOneOut", title: "Ο Παρείσακτος!", description: "Ποια λέξη αρχίζει διαφορετικά;", icon: "<span style=\"display: inline-grid; grid-template-columns: 1fr 1fr; gap: 1px; font-size: 0.5em; line-height: 1; vertical-align: middle;\"><span>🟥</span><span>🟥</span><span>🟥</span><span>🟦</span></span>" },
            ]
        },
        {
            id: 5,
            title: "Φωνήματα",
            description: "Ακούω κάθε ήχο ξεχωριστά!",
            emoji: "",
            color: "#FFB7B2",
            colorDark: "#E53935",
            games: [
                { id: "phonemeSynthesis", title: "Ένωσε τους Ήχους!", description: "Τι λέξη φτιάχνουν μαζί;", icon: "🔗" },
                { id: "phonemeAnalysis", title: "Μέτρα τους Ήχους!", description: "Πόσους ήχους ακούς;", icon: "🔢" },
                { id: "elkoninBoxes", title: "Κουτάκια Ήχων!", description: "Βάλε κάθε ήχο στο κουτάκι του", icon: "📦" },
                { id: "phonemeDeletion", title: "Σβήσε τον Πρώτο Ήχο!", description: "Τι μένει χωρίς τον πρώτο ήχο;", icon: "🧹" },
            ]
        },
    ],

    /* ----------------------------------------------------------
       ENCOURAGEMENT MESSAGES
       ---------------------------------------------------------- */
    encouragement: {
        correct: [
            "Μπράβο!",
            "Τέλεια!",
            "Σωστά!",
            "Πολύ καλά!",
            "Φανταστικά!",
            "Εξαιρετικά!",
            "Υπέροχα!",
            "Σούπερ!",
        ],
        levelComplete: [
            "Ολοκλήρωσες! Είσαι αστέρι!",
            "Τα κατάφερες! Μπράβο!",
            "Τέλεια δουλειά!",
            "Φανταστικός/ή!",
        ],
    },

    /* ----------------------------------------------------------
       TEACHER NOTES — per-stage guidance for an educator/therapist
       who may be playing alongside the child and reading the words
       aloud themselves instead of relying on the app's voice. Each
       note names the actual controls that stage has (🔊 per-stage
       voice mute, "Επανάληψη" repeat, 🖍️ highlight, or in-stage "🔊 Άκουσε"
       buttons) — a few stages have no spoken audio at all, and their
       notes say so explicitly rather than pointing at a toggle that
       isn't there.
       ---------------------------------------------------------- */
    teacherNotes: {
        // Level 1 — Λέξη & Πρόταση
        wordSizeCompare: "Το παιδί ακούει δύο λέξεις και επιλέγει ποια έχει περισσότερες συλλαβές. Αν προτιμάς να διαβάσεις εσύ τις λέξεις, πάτησε το εικονίδιο 🔊 δίπλα σε κάθε λέξη για να σιγήσεις τη φωνή του παιχνιδιού. Πρόσεξε αν το παιδί απαντά σωστά επειδή μέτρησε τις συλλαβές ή επειδή θεωρεί «μεγαλύτερη» τη λέξη που δηλώνει μεγαλύτερο αντικείμενο (στάδιο Γ: σύγκρουση μεγέθους).",
        wordCounting: "Το παιδί χτυπά παλαμάκι για κάθε λέξη μιας πρότασης. Μπορείς να διαβάσεις εσύ την πρόταση αντί για τη φωνή του παιχνιδιού (σίγασέ την από το εικονίδιο 🔊) ώστε να ελέγχεις τον ρυθμό ανάγνωσης. Ο χρωματισμός κάθε λέξης καθώς χτυπάει μπορεί να απενεργοποιηθεί ξεχωριστά από το εικονίδιο 🖍️, αν θέλεις μεγαλύτερη πρόκληση.",
        wordPosition: "Το παιδί ακούει μια πρόταση και μετά βρίσκει ποια λέξη ήταν πρώτη, τελευταία ή μεσαία. Σίγασε τη φωνή από το εικονίδιο 🔊 αν θέλεις να διαβάζεις εσύ και να επαναλαμβάνεις την πρόταση με τον δικό σου ρυθμό. Το κουμπί «🔒 Προτάσεις (δάσκαλος)» δείχνει όλες τις προτάσεις της συνεδρίας και ποια λέξη ζητείται σε κάθε μία. Το στάδιο της μεσαίας λέξης είναι το πιο απαιτητικό. Φρόντισε να έχει εμπεδωθεί πρώτα η πρώτη/τελευταία θέση.",
        sentenceBuilder: "Το παιδί ακούει μια πρόταση και μετά την ανασυνθέτει σέρνοντας τις λέξεις στη σωστή σειρά. Η πρόταση δεν εμφανίζεται γραπτά, ώστε το παιδί να μην την αντιγράψει. Αν θέλεις να τη διαβάσεις εσύ, πάτησε το κουμπί «🔒 Πρόταση (δάσκαλος)» για να δεις όλες τις προτάσεις της συνεδρίας από πριν. Σίγασε τη φωνή από το εικονίδιο 🔊 αν θέλεις να διαβάζεις μόνο εσύ, με τον δικό σου ρυθμό.",
        wordDeletion: "Το παιδί ακούει μόνο την αρχική πρόταση — ποια λέξη αφαιρείται φαίνεται μόνο οπτικά (το αντίστοιχο κουτάκι σβήνει), και η σωστή απάντηση δεν ακούγεται ποτέ αυτόματα. Αν σιγάσεις τη φωνή από το εικονίδιο 🔊, πες εσύ μόνο την αρχική πρόταση και ονόμασε ποια λέξη αφαιρείται — το παιδί πρέπει να πει μόνο του τι απομένει. Χρησιμοποίησε το κουμπί «Επανάληψη» όσες φορές χρειαστεί πριν αποφασίσει το παιδί. Το κουμπί «🔒 Προτάσεις (δάσκαλος)» δείχνει όλες τις προτάσεις της συνεδρίας, τη λέξη που αφαιρείται σε κάθε μία και τη σωστή απάντηση.",

        // Level 2 — Συλλαβές
        syllableSynthesis: "Χωρίς ήχο από την εφαρμογή: πες ο ίδιος/η ίδια τις συλλαβές μιας λέξης, μία-μία με παύση ανάμεσά τους (π.χ. «τούρ … τα»), και το παιδί διαλέγει ποια εικόνα/λέξη ταιριάζει. Πάτησε «🔒 Λέξεις (δάσκαλος)» ΠΡΙΝ ξεκινήσετε για να δεις όλες τις λέξεις της συνεδρίας μαζί με τις συλλαβές τους — σημείωσέ τις ή βγάλε τους φωτογραφία, ώστε να τις έχεις πρόχειρες καθώς παίζετε. Μόλις το παιδί βρει τη σωστή εικόνα, η λέξη εμφανίζεται συλλαβιστά στην οθόνη ως επιβεβαίωση.",
        syllableCounting: "Το παιδί χτυπά για κάθε συλλαβή μιας λέξης. Το κουμπί δίπλα εναλλάσσει Βοήθεια/Χωρίς βοήθεια: χωρίς βοήθεια, οι τελείες μέτρησης κρύβονται αμέσως μόλις χτυπήσει, οπότε το παιδί πρέπει να θυμάται πόσες φορές χτύπησε αντί να τις μετράει βλέποντάς τες.",
        syllableSplit: "Το παιδί σέρνει τις συλλαβές μιας λέξης, με τη σωστή σειρά, σε ένα κοινό σημείο — δεν υπάρχουν έτοιμα άδεια κουτάκια από πριν, οπότε δεν μαθαίνει πόσες συλλαβές έχει η λέξη πριν αρχίσει. Ανάμεσα στα κομμάτια υπάρχει πάντα ένα «παγιδευμένο» πλακίδιο που δεν ανήκει καθόλου στη λέξη — αν το παιδί το σύρει, απλά δεν κουμπώνει. Πάτησε «🔒 Λέξεις (δάσκαλος)» για να δεις όλες τις λέξεις (και ποια είναι η παγίδα) πριν ξεκινήσετε.",
        syllableRemoval: "Το παιδί ακούει μόνο την αρχική λέξη — ποια συλλαβή αφαιρείται φαίνεται γραπτά στην οδηγία, όχι στην εκφώνηση, και η σωστή απάντηση δεν ακούγεται ποτέ αυτόματα. Η σειρά δυσκολίας είναι: πρώτα αφαιρείται η ΤΕΛΕΥΤΑΙΑ συλλαβή (πιο εύκολο — ό,τι μένει είναι ήδη ένα γνώριμο κομμάτι), μετά η ΠΡΩΤΗ, και τελευταία η ΜΕΣΑΙΑ (πιο δύσκολο — τα δύο κομμάτια που μένουν πρέπει να «κολλήσουν» νοητά). Αν σιγάσεις τη φωνή από το εικονίδιο 🔊, πες εσύ μόνο την αρχική λέξη και ονόμασε τη συλλαβή που αφαιρείται (π.χ. «γάτα, χωρίς το “τα”») — το παιδί πρέπει να πει μόνο του τι απομένει. Το κουμπί «🔒 Λέξεις (δάσκαλος)» δείχνει όλες τις λέξεις της συνεδρίας, τη συλλαβή που αφαιρείται σε κάθε μία και τη σωστή απάντηση.",

        // Level 3 — Ομοιοκαταληξία
        findRhyme: "Το παιδί ακούει μια λέξη και διαλέγει ποια εικόνα ομοιοκαταληκτεί μαζί της — το γραπτό δεν εμφανίζεται πουθενά, μόνο ήχος και εικόνα. Οι λανθασμένες επιλογές είναι πάντα ελεγμένες ώστε να ΜΗΝ ομοιοκαταληκτούν κατά λάθος (π.χ. «σπίτι» και «κουτί» μοιάζουν αλλά δεν ομοιοκαταληκτούν — διαφορετική θέση τόνου). Η δική σου φωνή μπορεί να τονίζει καλύτερα την κατάληξη — σίγασε τη φωνή από το εικονίδιο 🔊 αν θέλεις να το κάνεις εσύ. Το κουμπί «🔒 Λέξεις (δάσκαλος)» δείχνει όλα τα ζευγάρια της συνεδρίας.",
        rhymeMemory: "Παιχνίδι μνήμης χωρίς εκφώνηση φωνής (δεν υπάρχει διαθέσιμο εικονίδιο 🔊 σε αυτό το στάδιο). Το παιδί βλέπει τις λέξεις γραπτά στις κάρτες. Αν δεν διαβάζει ακόμα άνετα, διάβασε εσύ κάθε κάρτα καθώς ανοίγει.",
        produceRhyme: "Το παιδί ακούει τη λέξη-στόχο και πρέπει να πει μόνο του, προφορικά, μια λέξη που κάνει ρίμα — η εφαρμογή δεν μπορεί να αξιολογήσει προφορική απάντηση, οπότε ακούς εσύ το παιδί και πατάς «✓ Τα κατάφερε» ή «↻ Χρειάζεται βοήθεια». Το «Χρειάζεται βοήθεια» δείχνει την κατάληξη τονισμένη και 4 λέξεις για να διαλέξει ποια κάνει ρίμα (ένα πιο εύκολο, αναγνωριστικό βήμα πριν ξαναδοκιμάσει να πει μόνο του μια λέξη). Δέξου κάθε σωστή ρίμα, όχι μόνο μία προκαθορισμένη απάντηση.",
        rhymeOddOneOut: "Το παιχνίδι λέει τρεις λέξεις και το παιδί βρίσκει ποια δεν ομοιοκαταληκτεί. Χρειάζεται καθαρή, αργή εκφώνηση και των τριών. Σίγασε τη φωνή από το εικονίδιο 🔊 και πες τις λέξεις εσύ, με μικρή παύση ανάμεσά τους.",

        // Level 4 — Αρχικό & Τελικό Φώνημα
        findInitialPhoneme: "Το παιδί ακούει μια λέξη και βρίσκει με ποιο φώνημα ξεκινάει. Υπάρχει και ξεχωριστό κουμπί «εικονίδιο 🔊 Άκουσε» μέσα στο στάδιο για επανάληψη. Αν σιγάσεις τη φωνή από το εικονίδιο 🔊, μπορείς να χρησιμοποιείς εσύ αυτό το σημείο για να προφέρεις τη λέξη κάθε φορά που το πατά το παιδί.",
        groupBySound: "Το παιδί ομαδοποιεί λέξεις ανάλογα με τον αρχικό τους ήχο (δεν υπάρχει εκφώνηση φωνής σε αυτό το στάδιο, μόνο εικόνες/λέξεις). Αν δεν διαβάζει ακόμα άνετα, διάβασε εσύ κάθε λέξη πριν τη σύρει στην ομάδα της.",
        initialSoundMC: "Ο ήχος εμφανίζεται γραπτά (π.χ. /σ/) και το παιδί βρίσκει ποια λέξη ξεκινάει από αυτόν — δεν υπάρχει εκφώνηση φωνής σε αυτό το στάδιο. Πες εσύ τον ήχο δυνατά πριν διαλέξει το παιδί. Πρόσεξε να τον πεις καθαρά, χωρίς το φωνήεν που συχνά «κολλάει» στα σύμφωνα (π.χ. «μ», όχι «μου»).",
        findFinalPhoneme: "Ίδια λογική με το αρχικό φώνημα, αλλά το παιδί ψάχνει τώρα τον τελικό ήχο. Έχει κι αυτό κουμπί «εικονίδιο 🔊 Άκουσε» μέσα στο στάδιο. Σίγασε τη φωνή από το εικονίδιο 🔊 αν προτιμάς να το χρησιμοποιείς εσύ.",
        soundOddOneOut: "Οι τρεις λέξεις με κοινό αρχικό ήχο εμφανίζονται γραπτά. Δεν υπάρχει εκφώνηση φωνής σε αυτό το στάδιο. Πες εσύ και τις τέσσερις λέξεις δυνατά, αργά και με μικρή παύση, ώστε το παιδί να ακούσει καθαρά ποια ξεχωρίζει.",

        // Level 5 — Φωνήματα (Προχωρημένο)
        phonemeSynthesis: "Οι ήχοι μιας λέξης εμφανίζονται οπτικά, έναν-έναν σε φυσαλίδες, και το παιδί τους ενώνει νοερά — δεν υπάρχει εκφώνηση φωνής σε αυτό το στάδιο. Πες εσύ κάθε ήχο δυνατά καθώς εμφανίζεται, με μικρή παύση ανάμεσά τους ανάλογα με το επίπεδο του παιδιού.",
        phonemeAnalysis: "Το παιδί χτυπά για κάθε ήχο (φώνημα) μιας λέξης. Δεν υπάρχει εκφώνηση φωνής σε αυτό το στάδιο. Πες εσύ τη λέξη αργά, φωνηματικά (π.χ. «μ-π-α-λ-α»), πριν ξεκινήσει το παιδί να χτυπά.",
        elkoninBoxes: "Το παιδί τοποθετεί κάθε ήχο μιας λέξης στο δικό του κουτάκι (κουτάκια Elkonin). Δεν υπάρχει εκφώνηση φωνής σε αυτό το στάδιο. Πες εσύ τη λέξη φωνηματικά, αργά, πριν ξεκινήσει η άσκηση, ώστε το παιδί να έχει καθαρό ηχητικό μοντέλο.",
        phonemeDeletion: "Το παιδί ακούει μόνο την αρχική λέξη — ποιος ήχος αφαιρείται φαίνεται γραπτά στην οδηγία, όχι στην εκφώνηση, και η σωστή απάντηση δεν ακούγεται ποτέ αυτόματα. Αν σιγάσεις τη φωνή από το εικονίδιο 🔊, πες εσύ μόνο την αρχική λέξη και τόνισε καθαρά τον ήχο που αφαιρείται — το παιδί πρέπει να πει μόνο του τι απομένει. Το κουμπί «🔒 Λέξεις (δάσκαλος)» δείχνει όλες τις λέξεις της συνεδρίας, τον ήχο που αφαιρείται σε κάθε μία και τη σωστή απάντηση.",
    },

    /* ----------------------------------------------------------
       HELPER: Get random item from array
       ---------------------------------------------------------- */
    getRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    /* ----------------------------------------------------------
       HELPER: Shuffle array (Fisher-Yates)
       ---------------------------------------------------------- */
    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    /* ----------------------------------------------------------
       HELPER: Get words by syllable count
       ---------------------------------------------------------- */
    getWordsBySyllableCount(count) {
        return this.words.filter(w => w.syllables.length === count);
    },

    /* ----------------------------------------------------------
       HELPER: Get words by initial sound
       ---------------------------------------------------------- */
    getWordsByInitialSound(sound) {
        return this.soundGroups[sound] || [];
    },

    /* ----------------------------------------------------------
       HELPER: Every letter Level 4's games could actually produce a
       round for — the union of soundGroups keys and words' first/last
       letters. Backs the Level 4 letter-picker screen, so it never
       offers a letter that would just silently fall back to "no
       restriction" every round.
       ---------------------------------------------------------- */
    getLevel4AvailableLetters() {
        // Strips accents/final-sigma so e.g. "ήλιος" (starts with accented
        // "ή") correctly marks plain "η" as available — the letter-picker
        // only offers plain letters, and findInitialPhoneme/
        // findFinalPhoneme normalize the same way (level4PlainLetter in
        // level4.js) when matching a round's correct answer.
        const accentMap = { 'ά': 'α', 'έ': 'ε', 'ή': 'η', 'ί': 'ι', 'ό': 'ο', 'ύ': 'υ', 'ώ': 'ω', 'ς': 'σ' };
        const plain = l => accentMap[l] || l;

        const letters = new Set();
        Object.keys(this.soundGroups).forEach(l => letters.add(plain(l)));
        this.words.forEach(w => {
            letters.add(plain(w.word.charAt(0)));
            letters.add(plain(w.word.charAt(w.word.length - 1)));
        });
        const greekOrder = 'αβγδεζηθικλμνξοπρστυφχψω'.split('');
        return greekOrder.filter(l => letters.has(l));
    },

    /* ----------------------------------------------------------
       HELPER: Get N random distractors (words not matching filter)
       ---------------------------------------------------------- */
    getDistractors(excludeWord, count) {
        const others = this.words.filter(w => w.word !== excludeWord);
        return this.shuffle(others).slice(0, count);
    },
};
