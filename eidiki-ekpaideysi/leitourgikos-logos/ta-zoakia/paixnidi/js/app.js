/* ============================================================
   ΤΑ ΖΩΑΚΙΑ — Game logic
   Το παιδί πληκτρολογεί το όνομα ενός ζώου. Μόλις το γράψει
   (αγνοώντας τόνους και μικρά ορθογραφικά λάθη), εμφανίζεται
   η εικόνα του ζώου.
   ============================================================ */

(function () {
    "use strict";

    /* -----------------------------------------------------
       1. Normalization: αφαιρεί τόνους/διαλυτικά, πεζά,
          ενοποιεί τελικό/μη τελικό σίγμα.
       ----------------------------------------------------- */
    function normalize(str) {
        return (str || "")
            .toString()
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "") // τόνοι / διαλυτικά
            .replace(/ς/g, "σ")
            .replace(/\s+/g, " "); // πολλαπλά κενά -> ένα (χρήσιμο για προτάσεις)
    }

    /* -----------------------------------------------------
       2. Απόσταση Levenshtein (αριθμός επεξεργασιών ανάμεσα
          σε δύο λέξεις) — χρησιμοποιείται για να ανιχνεύει
          μικρά ορθογραφικά λάθη.
       ----------------------------------------------------- */
    function levenshtein(a, b) {
        const m = a.length, n = b.length;
        if (m === 0) return n;
        if (n === 0) return m;
        let prev = new Array(n + 1);
        let curr = new Array(n + 1);
        for (let j = 0; j <= n; j++) prev[j] = j;
        for (let i = 1; i <= m; i++) {
            curr[0] = i;
            for (let j = 1; j <= n; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                curr[j] = Math.min(
                    prev[j] + 1,      // διαγραφή
                    curr[j - 1] + 1,  // εισαγωγή
                    prev[j - 1] + cost // αντικατάσταση
                );
            }
            [prev, curr] = [curr, prev];
        }
        return prev[n];
    }

    function maxAllowedDistance(len) {
        if (len <= 3) return 0;
        if (len <= 5) return 1;
        if (len <= 8) return 2;
        return 3;
    }

    // Μεγαλύτερη ανοχή, ειδικά για γράμματα που λείπουν (χρησιμοποιείται
    // ΕΠΙΠΛΕΟΝ των συνηθισμένων ορθογραφικών λαθών στη ρύθμιση
    // "παράλειψη γραμμάτων" — βλ. matchDistance).
    function maxOmissionAllowance(len) {
        if (len <= 3) return 1;
        if (len <= 5) return 2;
        if (len <= 8) return 3;
        return 4;
    }

    /** Αληθές αν το "input" προκύπτει από το "form" αφαιρώντας μόνο
     *  γράμματα (χωρίς να αλλάζει η σειρά, χωρίς αντικατάσταση/προσθήκη
     *  λάθος γραμμάτων) — π.χ. "σκυλς" είναι υπο-ακολουθία του "σκυλος". */
    function isSubsequence(input, form) {
        let i = 0;
        for (let j = 0; j < form.length && i < input.length; j++) {
            if (form[j] === input[i]) i++;
        }
        return i === input.length;
    }

    /* -----------------------------------------------------
       2b. Ρύθμιση εκπαιδευτικού: πόση ανοχή δείχνει το παιχνίδι
           στη γραφή του παιδιού. Αποθηκεύεται τοπικά (σε αντίθεση
           με την πρόοδο του παιδιού, αυτή η ρύθμιση ΠΡΕΠΕΙ να
           θυμάται την επιλογή του εκπαιδευτικού από τη μια
           επίσκεψη στην άλλη).
           - "exact":     μόνο η σωστή γραφή (αγνοώντας πάντα τόνους)
           - "typos":     ανοχή σε γενικά ορθογραφικά λάθη (προεπιλογή)
           - "omissions": ό,τι δέχεται το "typos" + ΕΠΙΠΛΕΟΝ, μεγαλύτερη
             ανοχή ειδικά σε γράμματα που λείπουν
       ----------------------------------------------------- */
    const MATCH_MODE_KEY = "zoa_match_mode";
    const DEFAULT_MATCH_MODE = "typos";
    function loadMatchMode() {
        try {
            const saved = localStorage.getItem(MATCH_MODE_KEY);
            if (saved === "exact" || saved === "typos" || saved === "omissions") return saved;
        } catch (e) { /* ignore */ }
        return DEFAULT_MATCH_MODE;
    }
    function saveMatchMode(mode) {
        try { localStorage.setItem(MATCH_MODE_KEY, mode); } catch (e) { /* ignore */ }
    }
    let matchMode = loadMatchMode();

    /** Κοινή λογική "πόσο κοντά είναι το input στο form" και για τις
     *  3 ρυθμίσεις ανοχής. Το thresholdLen είναι το μήκος πάνω στο
     *  οποίο υπολογίζεται η επιτρεπτή απόσταση (για προτάσεις είναι
     *  μόνο το μήκος του ζώου, όχι ολόκληρης της πρότασης — βλ.
     *  WANT_PREFIX_LEN παρακάτω). Επιστρέφει την "απόσταση" (0 = τέλειο
     *  ταίριασμα) ή null αν δεν είναι αποδεκτό στην τρέχουσα ρύθμιση. */
    function matchDistance(input, form, thresholdLen) {
        const allowed = maxAllowedDistance(thresholdLen);

        if (matchMode === "exact") {
            return input === form ? 0 : null;
        }

        // Γενική ανοχή σε ορθογραφικά λάθη (αντικατάσταση/προσθήκη/αφαίρεση
        // γράμματος) — ισχύει και στο "typos" ΚΑΙ στο "omissions", αφού η
        // παράλειψη γραμμάτων εννοείται πάντα ΕΠΙΠΛΕΟΝ των συνηθισμένων
        // ορθογραφικών λαθών, όχι αντί για αυτά.
        let dist = null;
        if (Math.abs(form.length - input.length) <= allowed + 1) {
            const d = levenshtein(input, form);
            if (d <= allowed) dist = d;
        }

        if (matchMode === "omissions") {
            // Επιπλέον ανοχή ειδικά για γράμματα που λείπουν, μεγαλύτερη
            // από ό,τι επιτρέπει η γενική ανοχή παραπάνω.
            if (input.length <= form.length) {
                const missing = form.length - input.length;
                const omitAllowed = maxOmissionAllowance(thresholdLen);
                if (missing <= omitAllowed && isSubsequence(input, form)) {
                    if (dist === null || missing < dist) dist = missing;
                }
            }
        }

        return dist;
    }

    /* -----------------------------------------------------
       3. Χτίσιμο επίπεδου καταλόγου λέξεων -> ζώο, με βάση
          το animals.js (name + aliases, normalized).
       ----------------------------------------------------- */
    const ANIMALS = (window.ZOA_ANIMALS || []).map((a) => {
        const forms = [a.name, ...(a.aliases || [])].map(normalize);
        return { ...a, forms };
    });

    // Ακριβής αντιστοίχιση (χωρίς ανοχή λαθών) — χρησιμοποιείται για να
    // εμφανίζεται το ζώο ΑΜΕΣΩΣ μόλις γραφτεί σωστά η λέξη, χωρίς να
    // περιμένει το debounce του ελέγχου με ανοχή λαθών.
    const EXACT_LOOKUP = new Map();
    ANIMALS.forEach((animal) => {
        animal.forms.forEach((form) => {
            if (!EXACT_LOOKUP.has(form)) EXACT_LOOKUP.set(form, animal);
        });
    });
    function findExactMatch(rawInput) {
        const input = normalize(rawInput);
        if (input.length < 2) return null;
        return EXACT_LOOKUP.get(input) || null;
    }

    /** Βρίσκει το καλύτερο ταιριαστό ζώο ΜΕ ανοχή ορθογραφικών λαθών.
     *  Καλείται μόνο αφού το παιδί σταματήσει να πληκτρολογεί για λίγο
     *  (βλ. debounce παρακάτω) — έτσι δεν "μαντεύει" και δεν εμφανίζει
     *  το ζώο ενώ η λέξη γράφεται ακόμα.
     *  Επιστρέφει null αν δεν υπάρχει σαφής νικητής. */
    function findMatch(rawInput) {
        const input = normalize(rawInput);
        if (input.length < 2) return null;

        let best = null;
        let bestDist = Infinity;
        let tie = false;

        for (const animal of ANIMALS) {
            for (const form of animal.forms) {
                const dist = matchDistance(input, form, form.length);
                if (dist === null) continue;
                if (dist < bestDist) {
                    bestDist = dist;
                    best = animal;
                    tie = false;
                } else if (dist === bestDist && best && animal !== best) {
                    tie = true;
                }
            }
        }

        if (tie) return null; // διφορούμενο — περίμενε να γραφτούν κι άλλα γράμματα
        return best;
    }

    /* -----------------------------------------------------
       3b. Επίπεδα 2 & 3: αντιστοίχιση ολόκληρης πρότασης
           «Θέλω <ζώο σε αιτιατική>» (π.χ. "Θέλω σκύλο").
       ----------------------------------------------------- */
    const WANT_WORD = "Θέλω";
    const WANT_PREFIX_LEN = normalize(WANT_WORD).length + 1; // +1 για το κενό
    ANIMALS.forEach((animal) => {
        animal.sentence = normalize(WANT_WORD + " " + (animal.acc || animal.name));
    });

    const SENTENCE_EXACT_LOOKUP = new Map();
    ANIMALS.forEach((animal) => {
        if (!SENTENCE_EXACT_LOOKUP.has(animal.sentence)) {
            SENTENCE_EXACT_LOOKUP.set(animal.sentence, animal);
        }
    });
    function findSentenceExactMatch(rawInput) {
        const input = normalize(rawInput);
        if (input.length < 6) return null; // "θελω " + τουλάχιστον 1 γράμμα
        return SENTENCE_EXACT_LOOKUP.get(input) || null;
    }

    /** Ίδια λογική ανοχής λαθών με το findMatch, αλλά σε επίπεδο
     *  ολόκληρης πρότασης — χρησιμοποιείται στα Επίπεδα 2 & 3. */
    function findSentenceMatch(rawInput) {
        const input = normalize(rawInput);
        if (input.length < 6) return null;

        let best = null;
        let bestDist = Infinity;
        let tie = false;

        for (const animal of ANIMALS) {
            const form = animal.sentence;
            // Η ανοχή υπολογίζεται στο μήκος ΜΟΝΟ του ζώου (όχι όλης της
            // πρότασης) — αλλιώς το σταθερό πρόθεμα "θέλω " θα "φούσκωνε"
            // τεχνητά το μήκος και θα επέτρεπε ασφαλή αλλά λανθασμένα
            // ταιριάσματα ανάμεσα σε εντελώς διαφορετικά ζώα (π.χ.
            // "γάτα"/"κότα").
            const dist = matchDistance(input, form, form.length - WANT_PREFIX_LEN);
            if (dist === null) continue;
            if (dist < bestDist) {
                bestDist = dist;
                best = animal;
                tie = false;
            } else if (dist === bestDist && best && animal !== best) {
                tie = true;
            }
        }

        if (tie) return null;
        return best;
    }

    /* -----------------------------------------------------
       4. Ελληνική φωνή (Web Speech API) — προαιρετική.
       ----------------------------------------------------- */
    let cachedVoice;
    function getGreekVoice() {
        if (cachedVoice !== undefined) return cachedVoice;
        if (!("speechSynthesis" in window)) return (cachedVoice = null);
        const voices = window.speechSynthesis.getVoices();
        const greek = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("el"));
        cachedVoice = greek[0] || null;
        return cachedVoice;
    }
    function speak(text) {
        if (muted || !("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "el-GR";
        utter.rate = 0.9;
        const voice = getGreekVoice();
        if (voice) utter.voice = voice;
        window.speechSynthesis.speak(utter);
    }
    if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = () => { cachedVoice = undefined; };
    }

    /* -----------------------------------------------------
       5. Κομφετί (canvas)
       ----------------------------------------------------- */
    const confetti = {
        canvas: null, ctx: null, particles: [], animId: null,
        launch(duration = 2200) {
            this.canvas = document.getElementById("confetti-canvas");
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext("2d");
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            const colors = ["#B8A9E8", "#A8E6CF", "#FFB7B2", "#87CEEB", "#FFE082"];
            this.particles = [];
            for (let i = 0; i < 70; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: -20 - Math.random() * 100,
                    w: 8 + Math.random() * 8,
                    h: 6 + Math.random() * 6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    vx: (Math.random() - 0.5) * 4,
                    vy: 2 + Math.random() * 4,
                    rotation: Math.random() * 360,
                    rotSpeed: (Math.random() - 0.5) * 10,
                    opacity: 1,
                });
            }
            const start = Date.now();
            const animate = () => {
                const elapsed = Date.now() - start;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.particles.forEach((p) => {
                    p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.rotation += p.rotSpeed;
                    if (elapsed > duration - 800) p.opacity = Math.max(0, p.opacity - 0.03);
                    this.ctx.save();
                    this.ctx.translate(p.x, p.y);
                    this.ctx.rotate((p.rotation * Math.PI) / 180);
                    this.ctx.globalAlpha = p.opacity;
                    this.ctx.fillStyle = p.color;
                    this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                    this.ctx.restore();
                });
                if (elapsed < duration) this.animId = requestAnimationFrame(animate);
                else this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            };
            if (this.animId) cancelAnimationFrame(this.animId);
            animate();
        },
    };

    /* -----------------------------------------------------
       6. Εικόνα ζώου: δοκιμάζει .png/.jpg/.jpeg/.webp,
          αλλιώς πέφτει πίσω στο emoji.
       ----------------------------------------------------- */
    const EXTS = ["png", "jpg", "jpeg", "webp", "avif"];
    function loadAnimalImage(imgEl, animal, onFallback) {
        let i = 0;
        function tryNext() {
            if (i >= EXTS.length) { onFallback(); return; }
            const ext = EXTS[i++];
            imgEl.onerror = tryNext;
            imgEl.onload = () => { imgEl.hidden = false; };
            imgEl.src = "img/animals/" + encodeURIComponent(animal.name) + "." + ext;
        }
        tryNext();
    }

    /* -----------------------------------------------------
       7. Συλλογή ζώων που έχουν βρεθεί (μόνο για την τρέχουσα
          επίσκεψη — κάθε φορά που ανοίγει η σελίδα το παιχνίδι
          ξεκινάει από την αρχή, χωρίς να θυμάται προηγούμενη
          πρόοδο).
       ----------------------------------------------------- */
    let found = [];

    /* -----------------------------------------------------
       8. UI wiring
       ----------------------------------------------------- */
    let muted = false;
    let currentLevel = 1;
    const homeScreen = document.getElementById("home-screen");
    const levelsScreen = document.getElementById("levels-screen");
    const gameScreen = document.getElementById("game-screen");
    const startBtn = document.getElementById("start-btn");
    const levelsBackBtn = document.getElementById("levels-back-btn");
    const levelBtns = document.querySelectorAll(".level-card");
    const backBtn = document.getElementById("back-btn");
    const muteBtn = document.getElementById("mute-btn");
    const wantBtn = document.getElementById("want-btn");
    const input = document.getElementById("animal-input");
    const gameInstructions = document.getElementById("game-instructions");
    const revealCard = document.getElementById("reveal-card");
    const revealImg = document.getElementById("reveal-img");
    const revealEmoji = document.getElementById("reveal-emoji");
    const revealLabel = document.getElementById("reveal-label");
    const revealHint = document.getElementById("reveal-hint");
    const collectionStrip = document.getElementById("collection-strip");
    const collectionCount = document.getElementById("collection-count");
    const settingsBtn = document.getElementById("settings-btn");
    const settingsOverlay = document.getElementById("settings-overlay");
    const settingsCloseBtn = document.getElementById("settings-close-btn");
    const settingsOptions = document.querySelectorAll(".settings-option");

    const LEVEL_INFO = {
        1: { instructions: "Ποιο ζώο θέλεις να δεις; Γράψε το όνομά του!" },
        2: { instructions: "Πάτα το κουμπί «Θέλω» και μετά γράψε το ζώο, για να φτιάξεις την πρόταση!" },
        3: { instructions: "Γράψε ολόκληρη την πρόταση για να δεις το ζώο! (Θέλω+ζώο)" },
    };

    function showScreen(name) {
        homeScreen.hidden = name !== "home";
        levelsScreen.hidden = name !== "levels";
        gameScreen.hidden = name !== "game";
    }

    function resetGameScreenState() {
        clearTimeout(revealTimer);
        clearTimeout(typoTimer);
        hasRevealed = false;
        input.value = "";
        input.classList.remove("correct");
        revealImg.hidden = true;
        revealEmoji.hidden = true;
        revealLabel.textContent = "";
        revealCard.classList.remove("pop");
        revealHint.hidden = false;
    }

    function startLevel(level) {
        currentLevel = level;
        gameInstructions.textContent = LEVEL_INFO[level].instructions;
        wantBtn.hidden = level !== 2;
        resetGameScreenState();
        showScreen("game");
        renderCollection();
        setTimeout(() => input.focus(), 50);
    }

    startBtn.addEventListener("click", () => {
        showScreen("levels");
    });

    levelsBackBtn.addEventListener("click", () => {
        showScreen("home");
    });

    levelBtns.forEach((btn) => {
        btn.addEventListener("click", () => startLevel(Number(btn.dataset.level)));
    });

    backBtn.addEventListener("click", () => {
        showScreen("levels");
        window.speechSynthesis && window.speechSynthesis.cancel();
    });

    muteBtn.addEventListener("click", () => {
        muted = !muted;
        muteBtn.textContent = muted ? "🔇" : "🔊";
        if (muted && "speechSynthesis" in window) window.speechSynthesis.cancel();
    });

    wantBtn.addEventListener("click", () => {
        const normalizedValue = normalize(input.value);
        if (!normalizedValue.startsWith(normalize(WANT_WORD))) {
            input.value = WANT_WORD + " " + input.value.replace(/^\s+/, "");
        }
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    });

    /* -----------------------------------------------------
       Ρυθμίσεις εκπαιδευτικού (ανοχή σε λάθη)
       ----------------------------------------------------- */
    function syncSettingsUI() {
        settingsOptions.forEach((opt) => {
            opt.classList.toggle("active", opt.dataset.mode === matchMode);
        });
    }

    function openSettings() {
        syncSettingsUI();
        settingsOverlay.hidden = false;
    }

    function closeSettings() {
        settingsOverlay.hidden = true;
    }

    settingsBtn.addEventListener("click", openSettings);
    settingsCloseBtn.addEventListener("click", closeSettings);
    settingsOverlay.addEventListener("click", (e) => {
        if (e.target === settingsOverlay) closeSettings(); // κλικ έξω από το πλαίσιο
    });

    settingsOptions.forEach((opt) => {
        opt.addEventListener("click", () => {
            matchMode = opt.dataset.mode;
            saveMatchMode(matchMode);
            syncSettingsUI();
        });
    });

    function renderCollection() {
        collectionStrip.innerHTML = "";
        collectionCount.textContent = found.length + " / " + ANIMALS.length;
        found.forEach((name) => {
            const animal = ANIMALS.find((a) => a.name === name);
            if (!animal) return;
            const chip = document.createElement("div");
            chip.className = "collection-chip";
            const img = document.createElement("img");
            img.alt = animal.name;
            img.hidden = true;
            const fallback = document.createElement("span");
            fallback.className = "collection-chip-emoji";
            fallback.textContent = animal.emoji;
            fallback.hidden = true;
            loadAnimalImage(img, animal, () => { fallback.hidden = false; });
            chip.appendChild(img);
            chip.appendChild(fallback);
            collectionStrip.appendChild(chip);
        });
    }

    let revealTimer = null;
    let hasRevealed = false;
    function revealAnimal(animal) {
        hasRevealed = true;
        clearTimeout(revealTimer);
        revealCard.classList.remove("pop");
        void revealCard.offsetWidth; // restart animation
        revealCard.classList.add("pop");

        revealImg.hidden = true;
        revealEmoji.hidden = true;
        loadAnimalImage(revealImg, animal, () => {
            revealEmoji.textContent = animal.emoji;
            revealEmoji.hidden = false;
        });

        const spokenText = currentLevel === 1 ? animal.name : (WANT_WORD + " " + (animal.acc || animal.name));
        revealLabel.textContent = spokenText;
        revealHint.hidden = true;
        revealCard.hidden = false;
        input.classList.add("correct");

        speak(spokenText);
        confetti.launch();

        if (!found.includes(animal.name)) {
            found.push(animal.name);
            renderCollection();
        }

        revealTimer = setTimeout(() => {
            input.value = "";
            input.classList.remove("correct");
            input.focus();
        }, 1600);
    }

    // Πόσο περιμένουμε αφού σταματήσει να πληκτρολογεί πριν ελέγξουμε
    // με ανοχή ορθογραφικών λαθών — ώστε να μην εμφανίζεται το ζώο ενώ
    // το παιδί γράφει ακόμα τη λέξη.
    const TYPO_CHECK_DELAY = 700;
    let typoTimer = null;

    function checkTypoMatch() {
        const value = input.value;
        if (!value.trim()) return;
        const match = currentLevel === 1 ? findMatch(value) : findSentenceMatch(value);
        if (match) revealAnimal(match);
    }

    input.addEventListener("input", () => {
        input.classList.remove("correct");
        clearTimeout(typoTimer);

        const value = input.value;
        if (!value.trim()) {
            if (!hasRevealed) revealHint.hidden = false;
            return;
        }

        // Σωστά γραμμένη λέξη/πρόταση -> εμφάνιση αμέσως, χωρίς καθυστέρηση.
        const exact = currentLevel === 1 ? findExactMatch(value) : findSentenceExactMatch(value);
        if (exact) { revealAnimal(exact); return; }

        // Πιθανό ορθογραφικό λάθος -> περίμενε να σταματήσει λίγο να
        // γράφει πριν αποφασίσεις ότι τελείωσε τη λέξη/πρόταση.
        typoTimer = setTimeout(checkTypoMatch, TYPO_CHECK_DELAY);
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            // Το Enter σημαίνει "τελείωσα" -> έλεγξε αμέσως, με ανοχή λαθών.
            clearTimeout(typoTimer);
            checkTypoMatch();
        }
    });

    // Ζέσταμα φωνών (κάποια browsers τις φορτώνουν ασύγχρονα)
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();

    window.addEventListener("resize", () => {
        if (confetti.canvas) {
            confetti.canvas.width = window.innerWidth;
            confetti.canvas.height = window.innerHeight;
        }
    });
})();
