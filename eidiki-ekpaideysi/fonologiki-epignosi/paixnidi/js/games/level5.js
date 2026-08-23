/* ============================================================
   LEVEL 5 — Φωνήματα (Προχωρημένο)
   Games: phonemeSynthesis, phonemeAnalysis, elkoninBoxes,
          findMiddlePhoneme, phonemeDeletion, phonemeSubstitution

   Κανόνας Διαφάνειας (ο αυστηρότερος όλων): ΚΑΘΕ λέξη πρέπει να είναι
   φωνημικά διάφανη — κάθε γράμμα = ένας ήχος ΚΑΙ κάθε ήχος = ένα
   γράμμα. Όλα τα ερεθίσματα τραβιούνται από Phono.data.phonemesL5
   (js/phonemes_l5.js) — καμία λέξη με δίψηφο σύμφωνο/φωνήεν, ξ/ψ,
   σύμπλεγμα συμφώνων ή διπλό γράμμα.
   ============================================================ */
window.Phono = window.Phono || {};
Phono.games = Phono.games || {};

/**
 * Phoneme "type" for Level 5's single-letter phoneme set — same
 * continuant/stop split as Level 4 (js/games/level4.js), reused here
 * independently so this file has no load-order dependency on level4.js.
 * Final -ς behaves like a continuant (sustainable /s/).
 */
const LEVEL5_CONTINUANTS = ['μ', 'ν', 'λ', 'ρ', 'σ', 'ς', 'φ', 'θ', 'χ', 'ζ', 'β', 'γ'];
const LEVEL5_STOPS = ['π', 'τ', 'κ', 'δ'];
function level5PhonemeType(phoneme) {
    if (Phono.helpers.isVowelSound(phoneme)) return 'vowel';
    if (LEVEL5_CONTINUANTS.includes(phoneme)) return 'cont';
    if (LEVEL5_STOPS.includes(phoneme)) return 'stop';
    return 'cont';
}

/**
 * Speaks an isolated phoneme — same best-effort approximation as
 * level4SpeakPhoneme: continuants are elongated (repeated 3x, "μμμ"),
 * stops/vowels get a trailing period for a short clipped sound instead
 * of the TTS reading out the letter's NAME.
 */
function level5SpeakPhoneme(phoneme, type) {
    const text = type === 'cont' ? phoneme.repeat(3) : (phoneme + '.');
    Phono.audio.speak(text, 0.75);
}

/** A phoneme button: shows the letter, always speaks the phoneme sound
 * when pressed — "ΚΟΥΜΠΙΑ ΑΚΟΥΓΟΝΤΑΙ", same as Level 4's sound buttons.
 * `onClick`, if given, also fires on every press (the button doubles as
 * an answer choice). */
function level5CreateSoundButton(phoneme, type, opts) {
    const { el } = Phono.helpers;
    opts = opts || {};
    const btn = el('div', {
        className: opts.className || 'choice-card',
        onClick: () => {
            level5SpeakPhoneme(phoneme, type);
            if (opts.onClick) opts.onClick(btn);
        },
    }, [
        el('span', {
            className: 'choice-word',
            textContent: phoneme,
            style: { fontSize: opts.fontSize || 'var(--text-3xl)', fontWeight: '800' },
        }),
    ]);
    return btn;
}

/** Sound-count range (min/max phonemes) for a given difficulty tier —
 * every Level 5 game that draws from phonemesL5 climbs 4 -> 4-5 -> 5-6
 * sounds the same way, per the spec's "Ξεκίνα 4 ήχους → 5 → 6". */
function level5TierRange(tier) {
    if (tier === 1) return { min: 4, max: 4 };
    if (tier === 2) return { min: 4, max: 5 };
    return { min: 5, max: 6 };
}

/* ===========================================
   GAME 1: phonemeSynthesis — "Ένωσε τους Ήχους"
   The word's sounds are shown ONLY visually, one at a time as animated
   phoneme bubbles — no audio, no written word. The child blends them
   mentally (or the educator reads them aloud) and picks the picture.
   =========================================== */
Phono.games.phonemeSynthesis = {
    container: null,
    levelInfo: null,
    currentWord: null,
    usedWords: [],

    init(container, levelInfo) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.usedWords = [];
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        const tier = Phono.engine.getDifficultyTier();
        const { min, max } = level5TierRange(tier);
        const bank = Phono.data.phonemesL5.filter(w => w.imageable && w.count >= min && w.count <= max);
        const pool = bank.filter(w => !this.usedWords.includes(w.word));
        const available = pool.length > 0 ? pool : bank;
        this.currentWord = Phono.data.getRandom(available);
        this.usedWords.push(this.currentWord.word);

        const instruction = el('p', { className: 'game-instruction', textContent: 'Δες τους ήχους. Ποια λέξη φτιάχνουν;' });

        // Phoneme bubbles with animated reveal — visual only, no audio.
        const phonemeDisplay = el('div', { className: 'phoneme-display', id: 'phoneme-display' });
        this.currentWord.phonemes.forEach((ph, i) => {
            if (i > 0) {
                const sep = el('span', { className: 'phoneme-separator', textContent: '+' });
                phonemeDisplay.appendChild(sep);
                setTimeout(() => sep.classList.add('visible'), 400 + i * 500);
            }
            const isVowel = Phono.helpers.isVowelSound(ph);
            const bubble = el('div', {
                className: `phoneme-bubble ${isVowel ? 'vowel' : 'consonant'}`,
                textContent: ph,
            });
            phonemeDisplay.appendChild(bubble);
            setTimeout(() => bubble.classList.add('visible'), 300 + i * 500);
        });

        const distractors = Phono.data.getDistractors(this.currentWord.word, 3);
        const allChoices = Phono.data.shuffle([
            { word: this.currentWord.word, emoji: this.currentWord.emoji, correct: true },
            ...distractors.map(d => ({ word: d.word, emoji: d.emoji, correct: false })),
        ]);

        const choicesGrid = el('div', { className: 'choices-grid' });
        allChoices.forEach(choice => {
            const card = el('div', { className: 'choice-card', onClick: () => this.checkAnswer(choice.correct, card) }, [
                el('span', { className: 'choice-emoji', textContent: choice.emoji }),
                el('span', { className: 'choice-word', textContent: choice.word }),
            ]);
            choicesGrid.appendChild(card);
        });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, phonemeDisplay, choicesGrid]));
    },

    checkAnswer(isCorrect, cardEl) {
        if (cardEl.classList.contains('disabled')) return;

        if (isCorrect) {
            document.querySelectorAll('.choice-card').forEach(c => c.classList.add('disabled'));
            cardEl.classList.add('correct');
            Phono.feedback.showCorrect();
            Phono.engine.recordCorrect();
            setTimeout(() => this.nextOrComplete(), 1500);
            return;
        }

        cardEl.classList.add('wrong', 'disabled');
        Phono.feedback.showWrong();
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('phonemeSynthesis', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 2: phonemeAnalysis — "Μέτρα τους Ήχους"
   Same mechanic as Level 2/4's counting games. Drawn only from
   phonemesL5 (no diphthong-workaround needed — the bank has none by
   construction). "Δύσκολο" mode hides the counting dots, same pattern
   as Level 2's syllableCounting.
   =========================================== */
Phono.games.phonemeAnalysis = {
    container: null,
    levelInfo: null,
    currentWord: null,
    tapCount: 0,
    answered: false,
    usedWords: [],
    hardMode: false,

    init(container, levelInfo) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.usedWords = [];
        try { this.hardMode = localStorage.getItem('phono_phonemeCountingHardMode') === '1'; } catch (e) { this.hardMode = false; }
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';
        this.tapCount = 0;
        this.answered = false;

        const tier = Phono.engine.getDifficultyTier();
        const { min, max } = level5TierRange(tier);
        const bank = Phono.data.phonemesL5.filter(w => w.imageable && w.count >= min && w.count <= max);
        const pool = bank.filter(w => !this.usedWords.includes(w.word));
        const available = pool.length > 0 ? pool : bank;
        this.currentWord = Phono.data.getRandom(available);
        this.usedWords.push(this.currentWord.word);

        const correct = this.currentWord.phonemes.length;

        const instruction = el('p', { className: 'game-instruction', textContent: 'Πόσους ήχους (φωνήματα) ακούς στη λέξη;' });
        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: this.currentWord.emoji });
        const wordDiv = el('div', { className: 'game-main-word', textContent: this.currentWord.word });
        const modeBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: this.hardMode ? 'Χωρίς βοήθεια (χωρίς τελείες)' : 'Βοήθεια - τελείες',
            title: 'Εναλλαγή: οι τελείες μέτρησης κρύβονται μόλις χτυπήσει, μετράει από μνήμη',
            onClick: () => {
                this.hardMode = !this.hardMode;
                try { localStorage.setItem('phono_phonemeCountingHardMode', this.hardMode ? '1' : '0'); } catch (e) { /* ignore */ }
                this.loadRound();
            },
        });
        const counterDiv = el('div', { className: 'tap-counter-dots', id: 'tap-counter' });

        const tapBtn = el('button', {
            className: 'tap-button',
            textContent: '🔢',
            id: 'tap-btn',
            onClick: () => this.handleTap(),
        });

        const tapControls = el('div', { className: 'tap-controls', id: 'tap-controls', style: { display: 'none' } }, [
            el('button', {
                className: 'btn btn-icon clap-reset-btn',
                textContent: '-1',
                style: { fontSize: 'var(--text-base)', fontWeight: '800' },
                title: 'Αφαίρεσε ένα χτύπημα',
                onClick: () => this.handleUndoTap(),
            }),
            el('button', {
                className: 'btn btn-icon clap-reset-btn',
                textContent: '↺',
                title: 'Μηδένισε τα χτυπήματα',
                onClick: () => this.handleResetTaps(),
            }),
        ]);

        const checkArea = el('div', { className: 'clap-check-area', id: 'check-area', style: { display: 'none' } });
        const label = el('p', { className: 'game-instruction', textContent: 'Πόσες φορές πάτησες; Πάτησε τον αριθμό!', style: { fontSize: 'var(--text-lg)' } });
        const maxChoice = Math.max(8, correct + 2);
        const choicesDiv = el('div', { className: 'clap-number-choices' });
        for (let i = 2; i <= maxChoice; i++) {
            choicesDiv.appendChild(el('button', {
                className: 'number-choice-btn',
                textContent: String(i),
                onClick: (e) => {
                    if (this.answered) return;
                    if (i !== this.tapCount) {
                        Phono.feedback.showWrong();
                        return;
                    }

                    if (i === correct) {
                        this.answered = true;
                        e.target.classList.add('correct');
                        Phono.feedback.showCorrect();
                        Phono.engine.recordCorrect();
                        document.querySelectorAll('.number-choice-btn').forEach(b => b.classList.add('btn-disabled'));
                        setTimeout(() => this.nextOrComplete(), 1200);
                    } else {
                        e.target.classList.add('wrong');
                        Phono.feedback.showWrong();
                        e.target.classList.add('btn-disabled');
                    }
                },
            }));
        }
        checkArea.appendChild(label);
        checkArea.appendChild(choicesDiv);

        this.container.appendChild(el('div', { className: 'tap-area' }, [
            instruction, emojiDiv, wordDiv, modeBtn, counterDiv, tapBtn, tapControls, checkArea,
        ]));
    },

    handleTap() {
        if (this.answered) return;
        const { el } = Phono.helpers;
        this.tapCount++;
        Phono.audio.playSfx('tap');

        const btn = document.getElementById('tap-btn');
        btn.classList.add('tapped');
        setTimeout(() => btn.classList.remove('tapped'), 300);

        const counter = document.getElementById('tap-counter');
        const dot = el('div', { className: 'tap-dot' });
        if (this.hardMode) dot.style.visibility = 'hidden';
        counter.appendChild(dot);

        const checkArea = document.getElementById('check-area');
        if (checkArea && checkArea.style.display === 'none') {
            checkArea.style.display = '';
        }
        const tapControls = document.getElementById('tap-controls');
        if (tapControls && tapControls.style.display === 'none') {
            tapControls.style.display = '';
        }
    },

    handleUndoTap() {
        if (this.answered || this.tapCount <= 0) return;
        this.tapCount--;
        Phono.audio.playSfx('drop');

        const counter = document.getElementById('tap-counter');
        if (counter && counter.lastElementChild) counter.removeChild(counter.lastElementChild);

        if (this.tapCount === 0) {
            const tapControls = document.getElementById('tap-controls');
            if (tapControls) tapControls.style.display = 'none';
            const checkArea = document.getElementById('check-area');
            if (checkArea) checkArea.style.display = 'none';
        }
    },

    handleResetTaps() {
        if (this.answered || this.tapCount === 0) return;
        this.tapCount = 0;
        Phono.audio.playSfx('drop');

        const counter = document.getElementById('tap-counter');
        if (counter) counter.innerHTML = '';

        const tapControls = document.getElementById('tap-controls');
        if (tapControls) tapControls.style.display = 'none';
        const checkArea = document.getElementById('check-area');
        if (checkArea) checkArea.style.display = 'none';
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('phonemeAnalysis', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 3: elkoninBoxes — "Κουτάκια Ήχων"
   Multi-round now (was a single fixed round) so the 4 -> 5 -> 6 sound
   progression actually has room to happen. 1-2 "trap" phoneme tiles
   that don't belong to the word are mixed in among the draggable
   tokens — they can never match any box (their phoneme never equals
   any of the word's own), so dropping one just bounces off, same
   "παγίδα" idea as Level 2's syllableSplit trap tile.
   =========================================== */
const LEVEL5_TRAP_PHONEME_POOL = ['π', 'τ', 'κ', 'δ', 'μ', 'ν', 'λ', 'ρ', 'σ', 'φ', 'θ', 'χ', 'ζ', 'β', 'γ', 'α', 'ε', 'η', 'ι', 'ο', 'ω', 'υ'];

Phono.games.elkoninBoxes = {
    container: null,
    levelInfo: null,
    currentWord: null,
    placed: [],
    correctCount: 0,
    usedWords: [],

    init(container, levelInfo) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.usedWords = [];
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';
        this.correctCount = 0;

        const tier = Phono.engine.getDifficultyTier();
        const { min, max } = level5TierRange(tier);
        const bank = Phono.data.phonemesL5.filter(w => w.imageable && w.count >= min && w.count <= max);
        const pool = bank.filter(w => !this.usedWords.includes(w.word));
        const available = pool.length > 0 ? pool : bank;
        this.currentWord = Phono.data.getRandom(available);
        this.usedWords.push(this.currentWord.word);
        this.placed = new Array(this.currentWord.phonemes.length).fill(null);
        Phono.engine.maxScore = this.currentWord.phonemes.length;

        const instruction = el('p', { className: 'game-instruction', textContent: 'Βάλε κάθε ήχο στο σωστό κουτάκι!' });
        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: this.currentWord.emoji });
        const wordDiv = el('div', { className: 'game-main-word', textContent: this.currentWord.word, style: { fontSize: 'var(--text-2xl)' } });

        const boxesDiv = el('div', { className: 'elkonin-boxes', id: 'elkonin-boxes' });
        this.currentWord.phonemes.forEach((ph, i) => {
            const box = el('div', {
                className: 'elkonin-box drop-zone',
                'data-index': String(i),
                'data-phoneme': ph,
                id: `elk-box-${i}`,
            });
            box.appendChild(el('span', {
                textContent: String(i + 1),
                style: { position: 'absolute', bottom: '-18px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' },
            }));
            box.style.position = 'relative';
            boxesDiv.appendChild(box);
        });

        // Trap tiles: 1-2 phonemes NOT present anywhere in this word, so
        // they can never land on a box correctly.
        const trapCandidates = LEVEL5_TRAP_PHONEME_POOL.filter(p => !this.currentWord.phonemes.includes(p));
        const trapCount = Math.min(Phono.data.getRandom([1, 2]), trapCandidates.length);
        const traps = Phono.data.shuffle(trapCandidates).slice(0, trapCount);

        const realTokens = this.currentWord.phonemes.map((ph, i) => ({ phoneme: ph, index: i, trap: false }));
        const trapTokens = traps.map(ph => ({ phoneme: ph, index: -1, trap: true }));
        const scrambled = Phono.data.shuffle([...realTokens, ...trapTokens]);

        const tokensDiv = el('div', { className: 'phoneme-tokens-source', id: 'phoneme-tokens' });
        scrambled.forEach((item, i) => {
            const isVowel = Phono.helpers.isVowelSound(item.phoneme);
            const token = el('div', {
                className: `phoneme-draggable draggable-item ${isVowel ? 'vowel' : 'consonant'}`,
                textContent: item.phoneme,
                'data-phoneme': item.phoneme,
                'data-orig-index': String(item.index),
                'data-trap': item.trap ? '1' : '0',
                id: `ph-token-${i}`,
                style: { borderRadius: '50%', border: 'none' },
            });
            tokensDiv.appendChild(token);
        });

        const legend = el('div', {
            style: { display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' },
        }, [
            el('span', { innerHTML: '<span style="color: var(--accent-warm)">●</span> Φωνήεν' }),
            el('span', { innerHTML: '<span style="color: var(--accent-cool)">●</span> Σύμφωνο' }),
        ]);

        this.container.appendChild(el('div', { className: 'elkonin-container' }, [instruction, emojiDiv, wordDiv, boxesDiv, tokensDiv, legend]));

        setTimeout(() => {
            Phono.dragDrop.init('#phoneme-tokens', '.phoneme-draggable', '.elkonin-box', (dragEl, dropZone) => {
                this.handleDrop(dragEl, dropZone);
            });
        }, 100);
    },

    handleDrop(dragEl, dropZone) {
        const boxIndex = parseInt(dropZone.getAttribute('data-index'));
        if (this.placed[boxIndex] !== null) return;

        const dragPhoneme = dragEl.getAttribute('data-phoneme');
        const expectedPhoneme = dropZone.getAttribute('data-phoneme');

        if (dragPhoneme === expectedPhoneme) {
            const isVowel = Phono.helpers.isVowelSound(dragPhoneme);
            const token = Phono.helpers.el('div', {
                className: `phoneme-token ${isVowel ? 'vowel' : 'consonant'}`,
                textContent: dragPhoneme,
            });
            dropZone.appendChild(token);
            dropZone.classList.add('filled');
            dragEl.classList.add('placed');
            this.placed[boxIndex] = dragPhoneme;
            this.correctCount++;
            Phono.audio.playSfx('pop');
            Phono.engine.recordCorrect();

            if (this.placed.every(p => p !== null)) {
                Phono.feedback.showCorrect();
                setTimeout(() => this.nextOrComplete(), 1200);
            }
        } else {
            Phono.feedback.highlightElement(dropZone, false);
            Phono.audio.playSfx('wrong');
        }
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('elkoninBoxes', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 4: findMiddlePhoneme — "Βρες τον Μεσαίο Ήχο" (NEW)
   Isolating the MIDDLE phoneme — the hardest position to identify,
   since it's neither first nor last. Draws from the curated
   Phono.data.middlePhonemeItemsL5 (js/phonemes_l5.js): 2 short 3-sound
   items plus four 5-sound items, whose distractors are always the
   word's own OTHER sounds — so the child has to pick by POSITION, not
   just recognize a sound present somewhere in the word.
   =========================================== */
Phono.games.findMiddlePhoneme = {
    container: null,
    levelInfo: null,
    currentItem: null,
    roundItems: [],

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        this.roundItems = level5BuildMiddlePhonemeItems(Phono.engine.totalRounds);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        this.currentItem = this.roundItems[Phono.engine.currentRound];
        const item = this.currentItem;
        const middlePhoneme = item.phonemes[item.middleIndex];

        const instruction = el('p', { className: 'game-instruction', textContent: 'Ποιος είναι ο μεσαίος ήχος της λέξης;' });
        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: item.emoji });
        const wordRow = el('div', { className: 'sentence-row' }, [
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(item.word)),
        ]);

        const allPhonemes = Phono.data.shuffle([middlePhoneme, ...item.distractors]);
        const choicesGrid = el('div', { className: 'choices-grid' });
        allPhonemes.forEach(phoneme => {
            const isCorrect = phoneme === middlePhoneme;
            const card = level5CreateSoundButton(phoneme, level5PhonemeType(phoneme), {
                onClick: () => this.checkAnswer(isCorrect, card),
            });
            choicesGrid.appendChild(card);
        });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, emojiDiv, wordRow, choicesGrid]));
        Phono.audio.speak(item.word);
    },

    checkAnswer(isCorrect, cardEl) {
        if (cardEl.classList.contains('disabled')) return;

        if (isCorrect) {
            document.querySelectorAll('.choice-card').forEach(c => c.classList.add('disabled'));
            cardEl.classList.add('correct');
            Phono.feedback.showCorrect();
            Phono.engine.recordCorrect();
            setTimeout(() => this.nextOrComplete(), 1500);
            return;
        }

        cardEl.classList.add('wrong', 'disabled');
        Phono.feedback.showWrong();
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('findMiddlePhoneme', this.levelInfo.id);
        }
    },
};

/** Picks the whole session's middle-phoneme items up front, same
 * reshuffle-when-exhausted pattern as Level 4's oddity items. */
function level5BuildMiddlePhonemeItems(totalRounds) {
    const items = [];
    let deck = [];
    for (let round = 0; round < totalRounds; round++) {
        if (deck.length === 0) deck = Phono.data.shuffle(Phono.data.middlePhonemeItemsL5);
        items.push(deck.pop());
    }
    return items;
}

/* ===========================================
   GAME 5: phonemeDeletion — "Σβήσε τον Ήχο"
   Extended from "remove only the first sound" to a togglable
   first/last mode (starting on "last" — the easier of the two per the
   spec). The 4 answer choices are pressable-audible buttons: tapping
   one SPEAKS that candidate remaining-word and submits it as the
   answer, so the child picks by listening, not by reading the letters
   the choice would otherwise show.
   =========================================== */
Phono.games.phonemeDeletion = {
    container: null,
    levelInfo: null,
    currentItem: null,
    roundItems: [],
    mode: 'last',
    answered: false,

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        try { this.mode = localStorage.getItem('phono_phonemeDeletionMode') || 'last'; } catch (e) { this.mode = 'last'; }
        this.roundItems = level5BuildPhonemeDeletionItems(Phono.engine.totalRounds);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';
        this.answered = false;

        this.currentItem = this.roundItems[Phono.engine.currentRound];
        const item = this.currentItem;
        const word = item.word;
        const isLast = this.mode === 'last';
        const targetPhoneme = isLast ? item.last : item.first;
        const correct = isLast ? item.lastRemoved : item.firstRemoved;
        const targetIndex = isLast ? word.length - 1 : 0;

        const instruction = el('p', {
            className: 'game-instruction',
            id: 'phonemedeletion-instruction',
            innerHTML: isLast
                ? `Πες τη λέξη χωρίς τον ΤΕΛΕΥΤΑΙΟ ήχο <strong>/${targetPhoneme}/</strong>. Τι μένει;`
                : `Πες τη λέξη χωρίς τον ΠΡΩΤΟ ήχο <strong>/${targetPhoneme}/</strong>. Τι μένει;`,
        });
        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: item.emoji });
        const emojiRow = el('div', { className: 'sentence-row' }, [
            emojiDiv,
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(word)),
        ]);

        const modeBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: isLast ? 'Σβήνω: Τελευταίο' : 'Σβήνω: Πρώτο',
            title: 'Εναλλαγή: σβήνει τον πρώτο ή τον τελευταίο ήχο της λέξης',
            onClick: () => {
                this.mode = isLast ? 'first' : 'last';
                try { localStorage.setItem('phono_phonemeDeletionMode', this.mode); } catch (e) { /* ignore */ }
                this.loadRound();
            },
        });
        const revealBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: '🔒 Λέξεις (δάσκαλος)',
            onClick: () => this.showWordList(),
        });

        const letterDisplay = el('div', { className: 'letter-display', id: 'pd-letters' });
        word.split('').forEach((char, i) => {
            letterDisplay.appendChild(el('div', {
                className: `letter-box ${i === targetIndex ? 'highlight' : ''}`,
                textContent: char,
                'data-index': String(i),
            }));
        });

        // Answer choices: pressable-audible, not readable text — each
        // button SPEAKS its own candidate word when pressed and submits
        // it immediately, same "press = hear + choose" idea as Level 4's
        // sound buttons.
        const distractors = this.generateDistractors(correct, word);
        const allChoices = Phono.data.shuffle([
            { text: correct, correct: true },
            ...distractors.map(d => ({ text: d, correct: false })),
        ]);

        const choicesGrid = el('div', { className: 'choices-grid', id: 'pd-choices', style: { display: 'none' } });
        allChoices.forEach((choice, i) => {
            const card = el('div', {
                className: 'choice-card',
                onClick: () => {
                    Phono.audio.speak(choice.text);
                    this.checkAnswer(choice.correct, card);
                },
            }, [
                el('span', { className: 'choice-word', textContent: '🔊 ' + (i + 1), style: { fontSize: 'var(--text-2xl)' } }),
            ]);
            choicesGrid.appendChild(card);
        });

        this.container.appendChild(el('div', { className: 'sound-change-area' }, [instruction, emojiRow, modeBtn, revealBtn, letterDisplay, choicesGrid]));

        Phono.audio.speak(word);

        setTimeout(() => {
            const letterDisplayEl = document.getElementById('pd-letters');
            const targetBox = letterDisplayEl ? letterDisplayEl.querySelector(`.letter-box[data-index="${targetIndex}"]`) : null;
            if (targetBox) {
                targetBox.classList.add('removing');
                Phono.audio.playSfx('pop');
                setTimeout(() => {
                    targetBox.style.visibility = 'hidden';
                    const choices = document.getElementById('pd-choices');
                    if (choices) choices.style.display = '';

                    setTimeout(() => {
                        if (letterDisplayEl) { letterDisplayEl.style.opacity = '0'; letterDisplayEl.style.visibility = 'hidden'; }
                        const instructionEl = document.getElementById('phonemedeletion-instruction');
                        if (instructionEl) instructionEl.classList.add('shake-attention');
                    }, 150);
                }, 800);
            }
        }, 1600);
    },

    /** Teacher-only word list for the WHOLE session — reflects whichever
     * mode (first/last) is currently active. Same fixed-overlay pattern
     * as syllableCounting.showWordList. */
    showWordList() {
        const { el } = Phono.helpers;
        const close = () => overlay.remove();
        const isLast = this.mode === 'last';

        const list = el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', textAlign: 'left' } });
        this.roundItems.forEach((item, i) => {
            const isCurrent = i === Phono.engine.currentRound;
            const phoneme = isLast ? item.last : item.first;
            const remaining = isLast ? item.lastRemoved : item.firstRemoved;
            list.appendChild(el('div', {
                style: {
                    display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)',
                    padding: 'var(--space-xs) var(--space-sm)', borderRadius: 'var(--radius-md)',
                    background: isCurrent ? 'var(--primary-light)' : 'transparent',
                    fontWeight: isCurrent ? '800' : '600',
                },
            }, [
                el('span', { textContent: `${i + 1}. ${item.emoji} ${item.word} (χωρίς /${phoneme}/)` }),
                el('span', { textContent: `→ ${remaining}`, style: { color: 'var(--text-secondary)' } }),
            ]));
        });

        const overlay = el('div', {
            className: 'teacher-note-overlay',
            onClick: (e) => { if (e.target === overlay) close(); },
        }, [
            el('div', { className: 'teacher-note-card' }, [
                el('div', { className: 'teacher-note-title', textContent: '🔒 Λέξεις της συνεδρίας' }),
                el('p', {
                    textContent: `Λίστα με τον ήχο που αφαιρείται σε κάθε λέξη (τρέχουσα λειτουργία: ${isLast ? 'τελευταίος' : 'πρώτος'} ήχος).`,
                    style: { color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' },
                }),
                list,
                el('button', { className: 'btn btn-primary', textContent: 'Κατάλαβα', onClick: close, style: { marginTop: 'var(--space-lg)' } }),
            ]),
        ]);
        document.getElementById('app').appendChild(overlay);
    },

    generateDistractors(correct, word) {
        const d = new Set();
        d.add(word);
        d.add(word.slice(0, -1));
        d.add(word.slice(1));
        d.add(word.slice(2));
        d.delete(correct);
        d.delete('');
        if (d.size < 2) d.add(word.slice(1) + 'α');
        return Phono.data.shuffle(Array.from(d)).slice(0, 3);
    },

    checkAnswer(isCorrect, cardEl) {
        if (this.answered || cardEl.classList.contains('disabled')) return;

        if (isCorrect) {
            this.answered = true;
            document.querySelectorAll('.choice-card').forEach(c => c.classList.add('disabled'));
            cardEl.classList.add('correct');
            Phono.feedback.showCorrect();
            Phono.engine.recordCorrect();
            setTimeout(() => this.nextOrComplete(), 1500);
            return;
        }

        cardEl.classList.add('wrong', 'disabled');
        Phono.feedback.showWrong();
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('phonemeDeletion', this.levelInfo.id);
        }
    },
};

/** Pre-selects every item for the whole session up front, drawn from
 * the phonemically transparent CVCV (4-sound) words in phonemesL5 —
 * both first- and last-sound removal are precomputed per item so the
 * mode toggle can switch without re-deriving anything. */
function level5BuildPhonemeDeletionItems(totalRounds) {
    const bank = Phono.data.phonemesL5.filter(w => w.count === 4 && w.imageable);
    const used = [];
    const items = [];
    for (let round = 0; round < totalRounds; round++) {
        const pool = bank.filter(w => !used.includes(w.word));
        const available = pool.length > 0 ? pool : bank;
        const w = Phono.data.getRandom(available);
        used.push(w.word);
        items.push({
            word: w.word,
            emoji: w.emoji,
            first: w.phonemes[0],
            firstRemoved: w.word.slice(1),
            last: w.phonemes[w.phonemes.length - 1],
            lastRemoved: w.word.slice(0, -1),
        });
    }
    return items;
}

/* ===========================================
   GAME 6: phonemeSubstitution — "Άλλαξε τον Ήχο" (NEW, LAST)
   Substitution is the hardest phonemic skill — made PRODUCTIVE like
   produceRhyme (level3.js), not multiple-choice: the app can't
   evaluate a spoken answer, so the educator listens and judges the
   outcome. Some results are real Greek words, others "αστεία λέξη"
   (accepted nonsense) — Phono.data.phonemeSubstitutionItemsL5 marks
   which. The "🔒 Απάντηση" button always reveals the target answer,
   independent of the success/help buttons.
   =========================================== */
Phono.games.phonemeSubstitution = {
    container: null,
    levelInfo: null,
    currentItem: null,
    roundItems: [],

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        this.roundItems = level5BuildSubstitutionItems(Phono.engine.totalRounds);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        this.currentItem = this.roundItems[Phono.engine.currentRound];
        const item = this.currentItem;

        const instruction = el('p', {
            className: 'game-instruction',
            innerHTML: `Πες <strong>${item.base}</strong>. Τώρα άλλαξε τον πρώτο ήχο <strong>/${item.from}/</strong> σε <strong>/${item.to}/</strong>. Τι λέξη γίνεται;`,
        });
        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: item.baseEmoji });
        const wordRow = el('div', { className: 'sentence-row' }, [
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(item.base)),
        ]);
        const micHint = el('p', {
            className: 'game-instruction',
            textContent: '🎤 Το παιδί λέει την απάντησή του δυνατά.',
            style: { fontSize: 'var(--text-base)', color: 'var(--text-secondary)' },
        });

        const controlsRow = el('div', { className: 'tap-controls', id: 'phoneme-sub-controls' }, [
            el('button', { className: 'btn btn-primary', textContent: '✓ Τα κατάφερε', onClick: () => this.markSuccess() }),
            el('button', { className: 'btn btn-secondary', textContent: '↻ Χρειάζεται βοήθεια', onClick: () => this.markHelp() }),
        ]);
        const answerBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: '🔒 Απάντηση (δάσκαλος)',
            onClick: () => this.showAnswer(),
        });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, emojiDiv, wordRow, micHint, controlsRow, answerBtn]));
        Phono.audio.speak(item.base);
    },

    markSuccess() {
        const controlsRow = document.getElementById('phoneme-sub-controls');
        if (controlsRow) controlsRow.querySelectorAll('button').forEach(b => { b.disabled = true; b.classList.add('btn-disabled'); });

        Phono.feedback.showCorrect();
        Phono.engine.recordCorrect();
        setTimeout(() => this.nextOrComplete(), 1200);
    },

    /** The child needed help — no scaffold to fall back on here (unlike
     * produceRhyme, the target is sometimes a nonsense word with no
     * picture), so this just moves on without crediting the round; the
     * educator can reveal the answer separately via "🔒 Απάντηση". */
    markHelp() {
        const controlsRow = document.getElementById('phoneme-sub-controls');
        if (controlsRow) controlsRow.querySelectorAll('button').forEach(b => { b.disabled = true; b.classList.add('btn-disabled'); });

        setTimeout(() => this.nextOrComplete(), 800);
    },

    showAnswer() {
        const { el } = Phono.helpers;
        const item = this.currentItem;
        const close = () => overlay.remove();

        const overlay = el('div', {
            className: 'teacher-note-overlay',
            onClick: (e) => { if (e.target === overlay) close(); },
        }, [
            el('div', { className: 'teacher-note-card' }, [
                el('div', { className: 'teacher-note-title', textContent: '🔒 Απάντηση (δάσκαλος)' }),
                el('p', {
                    className: 'teacher-note-text',
                    innerHTML: `${item.base} → <strong>${item.result}</strong>`,
                }),
                el('p', {
                    textContent: item.isReal ? 'Υπαρκτή λέξη.' : 'Αστεία λέξη (όχι πραγματική) — αποδεκτή απάντηση.',
                    style: { color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' },
                }),
                el('button', { className: 'btn btn-secondary btn-small', textContent: 'Κλείσιμο', onClick: close, style: { marginTop: 'var(--space-lg)' } }),
            ]),
        ]);
        document.getElementById('app').appendChild(overlay);
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('phonemeSubstitution', this.levelInfo.id);
        }
    },
};

/** Picks the whole session's substitution items up front, same
 * reshuffle-when-exhausted pattern as the other curated-item games. */
function level5BuildSubstitutionItems(totalRounds) {
    const items = [];
    let deck = [];
    for (let round = 0; round < totalRounds; round++) {
        if (deck.length === 0) deck = Phono.data.shuffle(Phono.data.phonemeSubstitutionItemsL5);
        items.push(deck.pop());
    }
    return items;
}
