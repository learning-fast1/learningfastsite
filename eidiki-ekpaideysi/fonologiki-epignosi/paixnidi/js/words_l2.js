/* ============================================================
   ΤΡΑΠΕΖΑ ΛΕΞΕΩΝ — LEVEL 2 (Συλλαβές)
   Ενιαία πηγή δεδομένων για όλες τις δραστηριότητες του Επιπέδου 2.
   Κάθε δραστηριότητα φιλτράρει από εδώ κατά stage — δεν κρατάει δικές
   της λίστες λέξεων.

   Πεδία:
     word        — η λέξη (string)
     syllables   — array με τις συλλαβές, ήδη χωρισμένες
     stage       — "A" | "B" | "C" | "D" (βλ. κλίμακα δυσκολίας παρακάτω)
     imageable   — true μόνο αν η λέξη εικονίζεται μονοσήμαντα (χρειάζεται
                   για δραστηριότητες που δείχνουν εικόνες αντί για κείμενο,
                   π.χ. "Ένωσε τις Συλλαβές")
     emoji       — μόνο για imageable:true λέξεις

   ΚΛΙΜΑΚΑ ΔΥΣΚΟΛΙΑΣ:
     A: δισύλλαβα, ανοιχτές συλλαβές — χωρίς δίψηφα/συμπλέγματα (πιο εύκολο)
     B: τρισύλλαβα ανοιχτά (μερικά με 4 ανοιχτές συλλαβές, ελαφρώς πιο δύσκολα)
     C: με δίψηφα φωνήεντα (ου, αι, ει, οι) ή δίψηφα σύμφωνα (μπ, ντ, γκ, τσ, τζ)
     D: με συμπλέγματα συμφώνων (γρ, τρ, στ, κρ, δρ, βλ, σκ, φτ, χτ…) — πιο δύσκολο

   Σκόπιμα εκτός τράπεζας:
     - Λέξεις με συνίζηση (γυαλιά, μάτια, παιδιά, χέρια, πόδια, φωτιά,
       καρδιά, δόντια...) — δεν έχουν μία «σωστή» απάντηση στον αριθμό
       συλλαβών, άρα ακατάλληλες για μετρήσιμες δραστηριότητες.
     - "μπίρα" — ακατάλληλο περιεχόμενο για παιδιά.
     - "καλοκαίρι" — δόθηκε μόνο ως παραπομπή σε stage C, χωρίς πλήρη
       δεδομένα συλλαβοποίησης· παραλείπεται μέχρι να οριστεί πλήρως.
   ============================================================ */
window.Phono = window.Phono || {};

Phono.data = Phono.data || {};

Phono.data.wordsL2 = [
    /* ===================== STAGE A — δισύλλαβα ανοιχτά ===================== */
    { word: "γάτα", syllables: ["γά", "τα"], stage: "A", imageable: true, emoji: "🐱" , splitTrap: "μο" },
    { word: "μήλο", syllables: ["μή", "λο"], stage: "A", imageable: true, emoji: "🍎" , splitTrap: "τα" },
    { word: "μαμά", syllables: ["μα", "μά"], stage: "A", imageable: false },
    { word: "μωρό", syllables: ["μω", "ρό"], stage: "A", imageable: true, emoji: "👶" },
    { word: "νερό", syllables: ["νε", "ρό"], stage: "A", imageable: true, emoji: "💧" },
    { word: "παπί", syllables: ["πα", "πί"], stage: "A", imageable: true, emoji: "🦆" },
    { word: "ψωμί", syllables: ["ψω", "μί"], stage: "A", imageable: true, emoji: "🍞" },
    { word: "πόδι", syllables: ["πό", "δι"], stage: "A", imageable: true, emoji: "🦶" },
    { word: "χέρι", syllables: ["χέ", "ρι"], stage: "A", imageable: true, emoji: "✋" },
    { word: "μέλι", syllables: ["μέ", "λι"], stage: "A", imageable: true, emoji: "🍯" },
    { word: "πίτα", syllables: ["πί", "τα"], stage: "A", imageable: true, emoji: "🥧" , splitTrap: "νε" },
    { word: "γάλα", syllables: ["γά", "λα"], stage: "A", imageable: true, emoji: "🥛" },
    { word: "κότα", syllables: ["κό", "τα"], stage: "A", imageable: true, emoji: "🐔" , splitTrap: "λι" },
    { word: "μύτη", syllables: ["μύ", "τη"], stage: "A", imageable: true, emoji: "👃" },
    { word: "τυρί", syllables: ["τυ", "ρί"], stage: "A", imageable: true, emoji: "🧀" },
    { word: "δώρο", syllables: ["δώ", "ρο"], stage: "A", imageable: true, emoji: "🎁" , splitTrap: "πα" },
    { word: "ρόδα", syllables: ["ρό", "δα"], stage: "A", imageable: true, emoji: "🛞" },
    { word: "τόπι", syllables: ["τό", "πι"], stage: "A", imageable: true, emoji: "⚽" },
    { word: "βάζο", syllables: ["βά", "ζο"], stage: "A", imageable: true, emoji: "🏺" , splitTrap: "τι" },
    { word: "κερί", syllables: ["κε", "ρί"], stage: "A", imageable: true, emoji: "🕯️" },
    { word: "νύχι", syllables: ["νύ", "χι"], stage: "A", imageable: true, emoji: "💅" },
    { word: "φίδι", syllables: ["φί", "δι"], stage: "A", imageable: true, emoji: "🐍" , splitTrap: "κα" },
    { word: "λάδι", syllables: ["λά", "δι"], stage: "A", imageable: true, emoji: "🛢️" },
    { word: "μάτι", syllables: ["μά", "τι"], stage: "A", imageable: true, emoji: "👁️" },
    { word: "βίδα", syllables: ["βί", "δα"], stage: "A", imageable: true, emoji: "🔩" },
    { word: "ζάρι", syllables: ["ζά", "ρι"], stage: "A", imageable: true, emoji: "🎲" , splitTrap: "μου" },
    { word: "γόμα", syllables: ["γό", "μα"], stage: "A", imageable: true, emoji: "▫️" },
    { word: "νότα", syllables: ["νό", "τα"], stage: "A", imageable: true, emoji: "🎵" },
    { word: "κύμα", syllables: ["κύ", "μα"], stage: "A", imageable: true, emoji: "🌊" },
    { word: "σώμα", syllables: ["σώ", "μα"], stage: "A", imageable: true, emoji: "🧍" },
    { word: "φύλο", syllables: ["φύ", "λο"], stage: "A", imageable: true, emoji: "🚻" },
    { word: "ζώο", syllables: ["ζώ", "ο"], stage: "A", imageable: true, emoji: "🐾" },
    { word: "δάσος", syllables: ["δά", "σος"], stage: "A", imageable: true, emoji: "🌲" },
    { word: "λόφος", syllables: ["λό", "φος"], stage: "A", imageable: true, emoji: "⛰️" },
    { word: "καφές", syllables: ["κα", "φές"], stage: "A", imageable: true, emoji: "☕" },
    { word: "βήμα", syllables: ["βή", "μα"], stage: "A", imageable: false },
    { word: "θέμα", syllables: ["θέ", "μα"], stage: "A", imageable: false },
    { word: "μέρα", syllables: ["μέ", "ρα"], stage: "A", imageable: false },
    { word: "πόλη", syllables: ["πό", "λη"], stage: "A", imageable: false },
    { word: "τόνος", syllables: ["τό", "νος"], stage: "A", imageable: true, emoji: "🐟" },
    { word: "ρόλος", syllables: ["ρό", "λος"], stage: "A", imageable: false },
    { word: "χάρη", syllables: ["χά", "ρη"], stage: "A", imageable: false },
    { word: "ρίζα", syllables: ["ρί", "ζα"], stage: "A", imageable: true, emoji: "🌱" },
    { word: "τάπα", syllables: ["τά", "πα"], stage: "A", imageable: true, emoji: "🍾" },
    { word: "πάνα", syllables: ["πά", "να"], stage: "A", imageable: true, emoji: "🧷" },
    { word: "δέμα", syllables: ["δέ", "μα"], stage: "A", imageable: true, emoji: "📦" },
    { word: "μόδα", syllables: ["μό", "δα"], stage: "A", imageable: false },
    { word: "κάδος", syllables: ["κά", "δος"], stage: "A", imageable: true, emoji: "🗑️" },

    /* ===================== STAGE B — τρισύλλαβα ανοιχτά ===================== */
    { word: "πατάτα", syllables: ["πα", "τά", "τα"], stage: "B", imageable: true, emoji: "🥔" , splitTrap: "λο" },
    { word: "καπέλο", syllables: ["κα", "πέ", "λο"], stage: "B", imageable: true, emoji: "🎩" , splitTrap: "ρι" },
    { word: "πεπόνι", syllables: ["πε", "πό", "νι"], stage: "B", imageable: true, emoji: "🍈" , splitTrap: "κα" },
    { word: "λεμόνι", syllables: ["λε", "μό", "νι"], stage: "B", imageable: true, emoji: "🍋" , splitTrap: "τα" },
    { word: "σαλάτα", syllables: ["σα", "λά", "τα"], stage: "B", imageable: true, emoji: "🥗" },
    { word: "κανάτα", syllables: ["κα", "νά", "τα"], stage: "B", imageable: true, emoji: "🍶" },
    { word: "καμήλα", syllables: ["κα", "μή", "λα"], stage: "B", imageable: true, emoji: "🐫" , splitTrap: "ρο" },
    { word: "σελίδα", syllables: ["σε", "λί", "δα"], stage: "B", imageable: true, emoji: "📄" , splitTrap: "πο" },
    { word: "μολύβι", syllables: ["μο", "λύ", "βι"], stage: "B", imageable: true, emoji: "✏️" , splitTrap: "σα" },
    { word: "ζάχαρη", syllables: ["ζά", "χα", "ρη"], stage: "B", imageable: false },
    { word: "ποτάμι", syllables: ["πο", "τά", "μι"], stage: "B", imageable: true, emoji: "🏞️" , splitTrap: "νε" },
    { word: "φανάρι", syllables: ["φα", "νά", "ρι"], stage: "B", imageable: true, emoji: "🚦" },
    { word: "βελόνα", syllables: ["βε", "λό", "να"], stage: "B", imageable: true, emoji: "🪡" , splitTrap: "κι" },
    { word: "ποτήρι", syllables: ["πο", "τή", "ρι"], stage: "B", imageable: true, emoji: "🍷" },
    { word: "ψαλίδι", syllables: ["ψα", "λί", "δι"], stage: "B", imageable: true, emoji: "✂️" },
    { word: "κεφάλι", syllables: ["κε", "φά", "λι"], stage: "B", imageable: true, emoji: "🗣️" },
    { word: "κοπέλα", syllables: ["κο", "πέ", "λα"], stage: "B", imageable: true, emoji: "👧" },
    { word: "τηγάνι", syllables: ["τη", "γά", "νι"], stage: "B", imageable: true, emoji: "🍳" , splitTrap: "λο" },
    { word: "καλάθι", syllables: ["κα", "λά", "θι"], stage: "B", imageable: true, emoji: "🧺" , splitTrap: "μου" },
    { word: "καπάκι", syllables: ["κα", "πά", "κι"], stage: "B", imageable: true, emoji: "🫙" },
    { word: "βότανο", syllables: ["βό", "τα", "νο"], stage: "B", imageable: true, emoji: "🌿" },
    { word: "καναπές", syllables: ["κα", "να", "πές"], stage: "B", imageable: true, emoji: "🛋️" },
    { word: "φασόλι", syllables: ["φα", "σό", "λι"], stage: "B", imageable: true, emoji: "🫘" , splitTrap: "ρι" },
    { word: "σαλάχι", syllables: ["σα", "λά", "χι"], stage: "B", imageable: true, emoji: "🐠" },
    { word: "κανόνι", syllables: ["κα", "νό", "νι"], stage: "B", imageable: true, emoji: "💥" },
    { word: "παζάρι", syllables: ["πα", "ζά", "ρι"], stage: "B", imageable: true, emoji: "🏪" },
    { word: "κολόνα", syllables: ["κο", "λό", "να"], stage: "B", imageable: true, emoji: "🏛️" },
    { word: "μηχανή", syllables: ["μη", "χα", "νή"], stage: "B", imageable: true, emoji: "🏍️" },
    { word: "κάμαρα", syllables: ["κά", "μα", "ρα"], stage: "B", imageable: false },
    { word: "μέλισσα", syllables: ["μέ", "λισ", "σα"], stage: "B", imageable: true, emoji: "🐝" },
    { word: "σκυλάκι", syllables: ["σκυ", "λά", "κι"], stage: "B", imageable: true, emoji: "🐶" },
    { word: "γατάκι", syllables: ["γα", "τά", "κι"], stage: "B", imageable: true, emoji: "🐱" },
    { word: "νεράκι", syllables: ["νε", "ρά", "κι"], stage: "B", imageable: false },
    // B+ (4 ανοιχτές συλλαβές — λίγο πιο δύσκολα, παραμένουν stage B)
    { word: "σοκολάτα", syllables: ["σο", "κο", "λά", "τα"], stage: "B", imageable: true, emoji: "🍫" },
    { word: "τηλέφωνο", syllables: ["τη", "λέ", "φω", "νο"], stage: "B", imageable: true, emoji: "📞" },
    { word: "λαχανικά", syllables: ["λα", "χα", "νι", "κά"], stage: "B", imageable: true, emoji: "🥦" },
    { word: "μαξιλάρι", syllables: ["μα", "ξι", "λά", "ρι"], stage: "B", imageable: true, emoji: "🛏️" },

    /* ============== STAGE C — δίψηφα φωνήεντα & δίψηφα σύμφωνα ============== */
    { word: "κουνέλι", syllables: ["κου", "νέ", "λι"], stage: "C", imageable: true, emoji: "🐰" , splitTrap: "πα" },
    { word: "ντομάτα", syllables: ["ντο", "μά", "τα"], stage: "C", imageable: true, emoji: "🍅" , splitTrap: "κου" },
    { word: "μπανάνα", syllables: ["μπα", "νά", "να"], stage: "C", imageable: true, emoji: "🍌" },
    { word: "μπαλόνι", syllables: ["μπα", "λό", "νι"], stage: "C", imageable: true, emoji: "🎈" , splitTrap: "τι" },
    { word: "πουλί", syllables: ["που", "λί"], stage: "C", imageable: true, emoji: "🐦" },
    { word: "μπότα", syllables: ["μπό", "τα"], stage: "C", imageable: true, emoji: "👢" },
    { word: "τσάντα", syllables: ["τσά", "ντα"], stage: "C", imageable: true, emoji: "👜" },
    { word: "κουτάλι", syllables: ["κου", "τά", "λι"], stage: "C", imageable: true, emoji: "🥄" , splitTrap: "βε" },
    { word: "τζάκι", syllables: ["τζά", "κι"], stage: "C", imageable: true, emoji: "🔥" },
    { word: "ντουλάπα", syllables: ["ντου", "λά", "πα"], stage: "C", imageable: true, emoji: "🗄️" },
    { word: "κουλούρι", syllables: ["κου", "λού", "ρι"], stage: "C", imageable: true, emoji: "🥨" },
    { word: "παιδί", syllables: ["παι", "δί"], stage: "C", imageable: true, emoji: "🧒" },
    { word: "φεγγάρι", syllables: ["φεγ", "γά", "ρι"], stage: "C", imageable: true, emoji: "🌙" },
    { word: "μπαμπάς", syllables: ["μπα", "μπάς"], stage: "C", imageable: false },
    { word: "κουτί", syllables: ["κου", "τί"], stage: "C", imageable: true, emoji: "📦" },
    { word: "καμπάνα", syllables: ["κα", "μπά", "να"], stage: "C", imageable: true, emoji: "🔔" },
    { word: "σαπούνι", syllables: ["σα", "πού", "νι"], stage: "C", imageable: true, emoji: "🧼" , splitTrap: "λα" },
    { word: "γουρούνι", syllables: ["γου", "ρού", "νι"], stage: "C", imageable: true, emoji: "🐷" },
    { word: "λουλούδι", syllables: ["λου", "λού", "δι"], stage: "C", imageable: true, emoji: "🌸" },
    { word: "πεταλούδα", syllables: ["πε", "τα", "λού", "δα"], stage: "C", imageable: true, emoji: "🦋" },
    { word: "μπουκάλι", syllables: ["μπου", "κά", "λι"], stage: "C", imageable: true, emoji: "🍾" },
    { word: "τσάι", syllables: ["τσά", "ι"], stage: "C", imageable: true, emoji: "🍵" },
    { word: "μπάλα", syllables: ["μπά", "λα"], stage: "C", imageable: true, emoji: "⚽" },
    { word: "τσέπη", syllables: ["τσέ", "πη"], stage: "C", imageable: true, emoji: "👖" },
    { word: "κουβάς", syllables: ["κου", "βάς"], stage: "C", imageable: true, emoji: "🪣" },
    { word: "κουδούνι", syllables: ["κου", "δού", "νι"], stage: "C", imageable: true, emoji: "🛎️" },
    { word: "κουμπί", syllables: ["κου", "μπί"], stage: "C", imageable: true, emoji: "🔘" },
    { word: "γκαράζ", syllables: ["γκα", "ράζ"], stage: "C", imageable: true, emoji: "🚗" },
    { word: "μπουμπούκι", syllables: ["μπου", "μπού", "κι"], stage: "C", imageable: true, emoji: "🌱" },
    { word: "νεράιδα", syllables: ["νε", "ρά", "ι", "δα"], stage: "C", imageable: true, emoji: "🧚" },
    { word: "κούπα", syllables: ["κού", "πα"], stage: "C", imageable: true, emoji: "🍵" },
    { word: "ουρά", syllables: ["ου", "ρά"], stage: "C", imageable: true, emoji: "〰️" },
    { word: "αετός", syllables: ["α", "ε", "τός"], stage: "C", imageable: true, emoji: "🦅" },
    { word: "είδωλο", syllables: ["εί", "δω", "λο"], stage: "C", imageable: false },
    { word: "οικία", syllables: ["οι", "κί", "α"], stage: "C", imageable: false },

    /* ================= STAGE D — συμπλέγματα συμφώνων ================= */
    { word: "τίγρης", syllables: ["τί", "γρης"], stage: "D", imageable: true, emoji: "🐯" },
    { word: "γραβάτα", syllables: ["γρα", "βά", "τα"], stage: "D", imageable: true, emoji: "👔" },
    { word: "τραπέζι", syllables: ["τρα", "πέ", "ζι"], stage: "D", imageable: true, emoji: "🍽️" , splitTrap: "κο" },
    { word: "δέντρο", syllables: ["δέ", "ντρο"], stage: "D", imageable: true, emoji: "🌳" },
    { word: "κρεβάτι", syllables: ["κρε", "βά", "τι"], stage: "D", imageable: true, emoji: "🛏️" },
    { word: "δράκος", syllables: ["δρά", "κος"], stage: "D", imageable: true, emoji: "🐉" },
    { word: "σκύλος", syllables: ["σκύ", "λος"], stage: "D", imageable: true, emoji: "🐶" },
    { word: "αστέρι", syllables: ["α", "στέ", "ρι"], stage: "D", imageable: true, emoji: "⭐" },
    { word: "φράουλα", syllables: ["φρά", "ου", "λα"], stage: "D", imageable: true, emoji: "🍓" },
    { word: "σταφύλι", syllables: ["στα", "φύ", "λι"], stage: "D", imageable: true, emoji: "🍇" , splitTrap: "νε" },
    { word: "σκάλα", syllables: ["σκά", "λα"], stage: "D", imageable: true, emoji: "🪜" },
    { word: "φρούτο", syllables: ["φρού", "το"], stage: "D", imageable: true, emoji: "🍏" },
    { word: "χταπόδι", syllables: ["χτα", "πό", "δι"], stage: "D", imageable: true, emoji: "🐙" , splitTrap: "ρι" },
    { word: "βιβλίο", syllables: ["βι", "βλί", "ο"], stage: "D", imageable: true, emoji: "📖" },
    { word: "καρέκλα", syllables: ["κα", "ρέ", "κλα"], stage: "D", imageable: true, emoji: "🪑" },
    { word: "πλοίο", syllables: ["πλοί", "ο"], stage: "D", imageable: true, emoji: "🚢" },
    { word: "γλυκό", syllables: ["γλυ", "κό"], stage: "D", imageable: true, emoji: "🍰" },
    { word: "ψυγείο", syllables: ["ψυ", "γεί", "ο"], stage: "D", imageable: true, emoji: "🧊" },
    { word: "τρένο", syllables: ["τρέ", "νο"], stage: "D", imageable: true, emoji: "🚂" },
    { word: "δρόμος", syllables: ["δρό", "μος"], stage: "D", imageable: true, emoji: "🛣️" },
    { word: "γράμμα", syllables: ["γράμ", "μα"], stage: "D", imageable: true, emoji: "✉️" },
    { word: "βρύση", syllables: ["βρύ", "ση"], stage: "D", imageable: true, emoji: "🚰" },
    { word: "φρύδι", syllables: ["φρύ", "δι"], stage: "D", imageable: true, emoji: "🤨" },
    { word: "κλαδί", syllables: ["κλα", "δί"], stage: "D", imageable: true, emoji: "🌿" },
    { word: "σφουγγάρι", syllables: ["σφουγ", "γά", "ρι"], stage: "D", imageable: true, emoji: "🧽" },
    { word: "στρώμα", syllables: ["στρώ", "μα"], stage: "D", imageable: true, emoji: "🛏️" },
    { word: "σκούπα", syllables: ["σκού", "πα"], stage: "D", imageable: true, emoji: "🧹" },
    { word: "σπίτι", syllables: ["σπί", "τι"], stage: "D", imageable: true, emoji: "🏠" },
    { word: "στόμα", syllables: ["στό", "μα"], stage: "D", imageable: true, emoji: "👄" },
    { word: "πλάτη", syllables: ["πλά", "τη"], stage: "D", imageable: true, emoji: "🧍" },
    { word: "κλειδί", syllables: ["κλει", "δί"], stage: "D", imageable: true, emoji: "🔑" },
    { word: "πρόβατο", syllables: ["πρό", "βα", "το"], stage: "D", imageable: true, emoji: "🐑" , splitTrap: "μι" },
    { word: "τρίγωνο", syllables: ["τρί", "γω", "νο"], stage: "D", imageable: true, emoji: "🔺" },
    { word: "φτερό", syllables: ["φτε", "ρό"], stage: "D", imageable: true, emoji: "🪶" },
    { word: "χτένα", syllables: ["χτέ", "να"], stage: "D", imageable: true, emoji: "🪮" },
    { word: "βροχή", syllables: ["βρο", "χή"], stage: "D", imageable: true, emoji: "🌧️" },
    { word: "θρόνος", syllables: ["θρό", "νος"], stage: "D", imageable: true, emoji: "👑" },
    { word: "σκόρδο", syllables: ["σκόρ", "δο"], stage: "D", imageable: true, emoji: "🧄" },
    { word: "σπαθί", syllables: ["σπα", "θί"], stage: "D", imageable: true, emoji: "🗡️" },
    { word: "φλιτζάνι", syllables: ["φλι", "τζά", "νι"], stage: "D", imageable: true, emoji: "☕" },
    { word: "γρύλος", syllables: ["γρύ", "λος"], stage: "D", imageable: true, emoji: "🦗" },
    { word: "πλανήτης", syllables: ["πλα", "νή", "της"], stage: "D", imageable: true, emoji: "🪐" },
];

/** Stage order, easiest to hardest — used everywhere a game needs to
 * walk "start at A, unlock the rest gradually" instead of repeating the
 * literal ["A","B","C","D"] array in every file. */
Phono.data.wordsL2StageOrder = ["A", "B", "C", "D"];

/** Words from wordsL2 up to and including `stage` (e.g. tier 2 of 4 -> "B"
 * -> every A and B word). Mirrors how Phono.engine.getDifficultyTier()
 * gates the rest of the app: earlier stages stay in the mix instead of
 * disappearing once a harder one unlocks, so recently-learned material
 * keeps getting reviewed.
 *
 * Also applies the teacher's content selection (Settings -> "Επιλογή
 * Λέξεων & Προτάσεων"), same empty/null-means-no-restriction convention
 * as Phono.app.level4Letters. If the selection happens to contain
 * nothing at this stage yet (e.g. teacher only picked stage-D words but
 * the round is still at tier 1), falls back to the unrestricted stage
 * pool rather than returning nothing. */
Phono.data.wordsL2UpToStage = function (stage) {
    const idx = Phono.data.wordsL2StageOrder.indexOf(stage);
    const allowed = idx === -1 ? Phono.data.wordsL2StageOrder : Phono.data.wordsL2StageOrder.slice(0, idx + 1);
    const stagePool = Phono.data.wordsL2.filter(w => allowed.includes(w.stage));

    const selection = Phono.app.contentSelection && Phono.app.contentSelection.level2Words;
    if (!selection || selection.length === 0) return stagePool;
    const allowedWords = new Set(selection);
    const filtered = stagePool.filter(w => allowedWords.has(w.word));
    return filtered.length > 0 ? filtered : stagePool;
};

/** Maps Phono.engine.getDifficultyTier() (1-3) onto this bank's 4 stages
 * (A-D) so every Level 2 activity gates difficulty the same way: tier 1
 * -> A only, tier 2 -> up to B, tier 3 -> up to D (C and D are both
 * "hard", so tier 3 opens both rather than leaving D for a 4th tier that
 * doesn't exist in the engine). */
Phono.data.wordsL2StageForTier = function (tier) {
    if (tier <= 1) return "A";
    if (tier === 2) return "B";
    return "D";
};

/**
 * Picks `count` distractors for `correctWord` from the imageable words in
 * `pool` (defaults to the whole wordsL2 bank). "Meaningful" here means
 * phonologically or visually confusable rather than purely random: it
 * scores every other imageable word by shared syllable count, a shared
 * first syllable/sound, and same stage, then samples from the
 * highest-scoring ones so a round's wrong pictures are plausible
 * near-misses (e.g. μήλο -> μέλι, μπάλα) instead of something wildly
 * unrelated the child can dismiss without listening.
 */
Phono.data.wordsL2GetDistractors = function (correctWord, count, pool) {
    const source = (pool || Phono.data.wordsL2).filter(w => w.imageable && w.word !== correctWord.word);
    if (source.length <= count) return Phono.data.shuffle(source);

    const correctFirstSyl = (correctWord.syllables[0] || "").toLowerCase();
    const correctFirstSound = correctWord.word.charAt(0).toLowerCase();

    const scored = source.map(w => {
        let score = 0;
        if (w.syllables.length === correctWord.syllables.length) score += 2;
        if (w.stage === correctWord.stage) score += 1;
        const firstSyl = (w.syllables[0] || "").toLowerCase();
        if (firstSyl === correctFirstSyl) score += 3;
        else if (w.word.charAt(0).toLowerCase() === correctFirstSound) score += 2;
        return { w, score };
    });

    scored.sort((a, b) => b.score - a.score);
    // Keep only the strongest matches, but shuffle within that top slice
    // so the same distractor trio doesn't show up every time this word
    // is the target.
    const topSlice = scored.slice(0, Math.max(count * 3, 6)).map(s => s.w);
    return Phono.data.shuffle(topSlice).slice(0, count);
};

/* ============================================================
   «ΤΙ ΜΕΝΕΙ;» — LEVEL 2 syllable-removal dataset
   Hand-curated (not auto-derived from wordsL2) because the removal
   position and the two wrong-answer choices both need to make sense per
   word, and because every residue was checked by hand to make sure it
   never happens to spell something inappropriate — see the QA note
   below before adding more entries.

   Fields:
     word, syllables       — same shape as wordsL2
     position               — "last" | "first" | "middle": which syllable
                               is removed. Sessions start at "last"
                               (easiest — the whole rest of the word is
                               still a contiguous, familiar chunk), then
                               "first", then "middle" (hardest — the two
                               remaining pieces have to be joined back
                               together across the gap).
     removeIndex            — numeric index into `syllables` matching
                               `position`, so games don't have to
                               re-derive it.
     remaining               — the correct spoken/written residue
     residueReal             — true only if `remaining` happens to also
                               be a real Greek word on its own (rare —
                               most entries are false, and the residue
                               should still be spoken out clearly as a
                               syllable string either way, not implied to
                               "mean" something).
     distractors[2]           — one "removed the wrong syllable" choice,
                               one "right syllables, wrong order" choice

   QA: "παπούτσι" is deliberately excluded — removing its first syllable
   leaves a residue that reads as a vulgar word in Greek. Before adding
   any new entry here, say the candidate `remaining` value out loud (and
   double-check it against a dictionary) to rule out the same problem.
   ============================================================ */
Phono.data.syllableRemovalL2 = [
    // ΤΕΛΕΥΤΑΙΑ ΣΥΛΛΑΒΗ (πιο εύκολο — ξεκινάει η συνεδρία από εδώ)
    { word: "καπέλο", syllables: ["κα", "πέ", "λο"], position: "last", removeIndex: 2, remaining: "καπέ", residueReal: false, distractors: ["κα", "πέλο"] },
    { word: "λεμόνι", syllables: ["λε", "μό", "νι"], position: "last", removeIndex: 2, remaining: "λεμό", residueReal: false, distractors: ["λε", "μόνι"] },
    { word: "πατάτα", syllables: ["πα", "τά", "τα"], position: "last", removeIndex: 2, remaining: "πατά", residueReal: false, distractors: ["πα", "τάτα"] },
    { word: "πεπόνι", syllables: ["πε", "πό", "νι"], position: "last", removeIndex: 2, remaining: "πεπό", residueReal: false, distractors: ["πε", "πόνι"] },
    { word: "καμήλα", syllables: ["κα", "μή", "λα"], position: "last", removeIndex: 2, remaining: "καμή", residueReal: false, distractors: ["κα", "μήλα"] },
    { word: "μολύβι", syllables: ["μο", "λύ", "βι"], position: "last", removeIndex: 2, remaining: "μολύ", residueReal: false, distractors: ["μο", "λύβι"] },
    { word: "σελίδα", syllables: ["σε", "λί", "δα"], position: "last", removeIndex: 2, remaining: "σελί", residueReal: false, distractors: ["σε", "λίδα"] },
    { word: "τηγάνι", syllables: ["τη", "γά", "νι"], position: "last", removeIndex: 2, remaining: "τηγά", residueReal: false, distractors: ["τη", "γάνι"] },
    { word: "γάτα", syllables: ["γά", "τα"], position: "last", removeIndex: 1, remaining: "γα", residueReal: false, distractors: ["τα", "γατα"] },
    { word: "μήλο", syllables: ["μή", "λο"], position: "last", removeIndex: 1, remaining: "μη", residueReal: false, distractors: ["λο", "μηλο"] },

    // ΠΡΩΤΗ ΣΥΛΛΑΒΗ (μεσαίο επίπεδο δυσκολίας)
    { word: "κουνέλι", syllables: ["κου", "νέ", "λι"], position: "first", removeIndex: 0, remaining: "νέλι", residueReal: false, distractors: ["λι", "λινέκου"] },
    { word: "μπανάνα", syllables: ["μπα", "νά", "να"], position: "first", removeIndex: 0, remaining: "νάνα", residueReal: false, distractors: ["να", "ναμπά"] },
    { word: "ποτάμι", syllables: ["πο", "τά", "μι"], position: "first", removeIndex: 0, remaining: "τάμι", residueReal: false, distractors: ["μι", "μιτάπο"] },
    { word: "φανάρι", syllables: ["φα", "νά", "ρι"], position: "first", removeIndex: 0, remaining: "νάρι", residueReal: false, distractors: ["ρι", "ριφανά"] },
    { word: "βελόνα", syllables: ["βε", "λό", "να"], position: "first", removeIndex: 0, remaining: "λόνα", residueReal: false, distractors: ["να", "ναλόβε"] },
    { word: "κανάτα", syllables: ["κα", "νά", "τα"], position: "first", removeIndex: 0, remaining: "νάτα", residueReal: false, distractors: ["τα", "τανάκα"] },

    // ΜΕΣΑΙΑ ΣΥΛΛΑΒΗ (δυσκολότερο — έρχεται τελευταίο στη σειρά)
    { word: "πατάτα", syllables: ["πα", "τά", "τα"], position: "middle", removeIndex: 1, remaining: "πατα", residueReal: false, distractors: ["τα", "τάπα"] },
    { word: "καμήλα", syllables: ["κα", "μή", "λα"], position: "middle", removeIndex: 1, remaining: "καλα", residueReal: false, distractors: ["μη", "μηκα"] },
    { word: "πεπόνι", syllables: ["πε", "πό", "νι"], position: "middle", removeIndex: 1, remaining: "πενι", residueReal: false, distractors: ["πο", "πόπε"] },
];

/** syllableRemovalL2, filtered by the teacher's Level 2 content selection
 * (same contentSelection.level2Words array wordsL2UpToStage() reads —
 * this bank's words mostly overlap with wordsL2 itself). Falls back to
 * the full list if the selection excludes every entry. */
Phono.data.getSyllableRemovalL2Pool = function () {
    const selection = Phono.app.contentSelection && Phono.app.contentSelection.level2Words;
    if (!selection || selection.length === 0) return Phono.data.syllableRemovalL2;
    const allowed = new Set(selection);
    const filtered = Phono.data.syllableRemovalL2.filter(item => allowed.has(item.word));
    return filtered.length > 0 ? filtered : Phono.data.syllableRemovalL2;
};
