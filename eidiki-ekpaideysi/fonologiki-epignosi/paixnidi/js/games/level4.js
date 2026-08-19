/* ============================================================
   LEVEL 4 — Αρχικός/Τελικός Φθόγγος
   Games: groupBySound, initialSoundMC, findInitialPhoneme,
          findFinalPhoneme, soundOddOneOut
   ============================================================ */
window.Phono = window.Phono || {};
Phono.games = Phono.games || {};

/**
 * true if `letter` is allowed under the educator's Level 4 letter
 * selection (Phono.app.level4Letters, set by renderLevel4LetterPicker).
 * No selection at all (null/empty) means no restriction — every letter
 * is allowed, same as before that picker existed.
 */
function level4LetterAllowed(letter) {
    const selected = Phono.app.level4Letters;
    if (!selected || selected.length === 0) return true;
    return selected.includes(letter);
}

/**
 * Strips the accent/final-sigma off a single Greek letter, e.g. "ά"->"α",
 * "ς"->"σ". findInitialPhoneme/findFinalPhoneme derive their "correct
 * letter" straight from a word's first/last character (e.g. "ήλιος"
 * starts with accented "ή", "νερό" ends with accented "ό") — but the
 * answer-choice buttons only offer plain unaccented letters. Without
 * this, any word with an accented first/last letter has no correct
 * button to press at all.
 */
const GREEK_LETTER_ACCENT_MAP = { 'ά': 'α', 'έ': 'ε', 'ή': 'η', 'ί': 'ι', 'ό': 'ο', 'ύ': 'υ', 'ώ': 'ω', 'ς': 'σ' };
function level4PlainLetter(letter) {
    return GREEK_LETTER_ACCENT_MAP[letter] || letter;
}

/**
 * Filters `pool` down to entries whose letter (via `letterOf`) isn't
 * `lastLetter` — used right before the final random pick in every Level 4
 * game, so the same letter can't land twice in a row. Falls back to the
 * unfiltered pool if that would leave nothing (e.g. only one letter is
 * even in play), since a repeat is unavoidable in that case. This is a
 * per-round check, not a whole-session plan — deliberately not a fixed
 * alternation either, since the pick from whatever survives is still
 * random each time.
 */
function level4AvoidLastLetter(pool, lastLetter, letterOf) {
    if (lastLetter == null) return pool;
    const filtered = pool.filter(item => letterOf(item) !== lastLetter);
    return filtered.length > 0 ? filtered : pool;
}

/* ===========================================
   GAME 1: groupBySound — Sorting / Categorization
   =========================================== */
Phono.games.groupBySound = {
    container: null,
    levelInfo: null,
    sounds: [],
    items: [],
    correctCount: 0,
    totalItems: 0,

    init(container, levelInfo) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.correctCount = 0;

        // Override engine for single-round
        Phono.engine.totalRounds = 1;
        Phono.engine.currentRound = 0;

        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        // Pick 3 sounds — restricted to the educator's letter selection
        // when there are enough of them to fill all 3 categories.
        const allSounds = Object.keys(Phono.data.soundGroups).filter(s => Phono.data.soundGroups[s].length >= 2);
        const letterFiltered = allSounds.filter(level4LetterAllowed);
        const soundPool = letterFiltered.length >= 3 ? letterFiltered : allSounds;
        this.sounds = Phono.data.shuffle(soundPool).slice(0, 3);

        // Pick 2 items from each sound
        this.items = [];
        this.sounds.forEach(sound => {
            const words = Phono.data.shuffle([...Phono.data.soundGroups[sound]]).slice(0, 2);
            words.forEach(w => this.items.push({ ...w, sound }));
        });
        this.totalItems = this.items.length;
        Phono.engine.maxScore = this.totalItems;
        this.items = Phono.data.shuffle(this.items);

        const instruction = el('p', { className: 'game-instruction', textContent: 'Βάλε κάθε λέξη στη σωστή ομάδα!' });

        // Categories
        const categoriesDiv = el('div', { className: 'sort-categories', id: 'sort-categories' });
        this.sounds.forEach(sound => {
            const cat = el('div', {
                className: 'sort-category drop-zone',
                'data-sound': sound,
                id: `cat-${sound}`,
            }, [
                el('div', {
                    className: 'sort-category-label',
                    textContent: `/${sound}/`,
                    style: { background: 'var(--primary-light)' },
                }),
                el('div', { className: 'sort-category-items', id: `cat-items-${sound}` }),
            ]);
            categoriesDiv.appendChild(cat);
        });

        // Draggable items
        const itemsDiv = el('div', { className: 'sort-items-source', id: 'sort-items' });
        this.items.forEach((item, i) => {
            const drag = el('div', {
                className: 'sort-draggable draggable-item',
                'data-sound': item.sound,
                'data-word': item.word,
                id: `sort-drag-${i}`,
            }, [
                el('span', { className: 'sort-emoji', textContent: item.emoji }),
                el('span', { className: 'sort-word', textContent: item.word }),
            ]);
            itemsDiv.appendChild(drag);
        });

        this.container.appendChild(el('div', { className: 'sorting-area' }, [instruction, categoriesDiv, itemsDiv]));

        setTimeout(() => {
            Phono.dragDrop.init('#sort-items', '.sort-draggable', '.sort-category', (dragEl, dropZone) => {
                this.handleDrop(dragEl, dropZone);
            });
        }, 100);
    },

    handleDrop(dragEl, dropZone) {
        const itemSound = dragEl.getAttribute('data-sound');
        const catSound = dropZone.getAttribute('data-sound');
        const word = dragEl.getAttribute('data-word');

        if (itemSound === catSound) {
            // Correct!
            const itemsContainer = document.getElementById(`cat-items-${catSound}`);
            const sortItem = Phono.helpers.el('div', { className: 'sort-item', textContent: `${dragEl.querySelector('.sort-emoji').textContent} ${word}` });
            itemsContainer.appendChild(sortItem);
            dragEl.classList.add('placed');
            this.correctCount++;
            Phono.audio.playSfx('pop');
            Phono.engine.recordCorrect();

            if (this.correctCount >= this.totalItems) {
                Phono.feedback.showCorrect();
                setTimeout(() => {
                    Phono.app.onGameComplete('groupBySound', this.levelInfo.id);
                }, 1200);
            }
        } else {
            Phono.feedback.highlightElement(dropZone, false);
            Phono.audio.playSfx('wrong');
        }
    },
};

/* ===========================================
   GAME 2: initialSoundMC — Multiple Choice
   =========================================== */
Phono.games.initialSoundMC = {
    container: null,
    levelInfo: null,
    currentSound: null,
    correctWord: null,
    usedSounds: [],
    lastSound: null,

    init(container, levelInfo) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.usedSounds = [];
        this.lastSound = null;
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        // Pick a sound — the TARGET sound respects the educator's letter
        // selection; distractors below deliberately don't, since they
        // just need to be wrong, not also within the practiced letters.
        const allSounds = Object.keys(Phono.data.soundGroups).filter(s => Phono.data.soundGroups[s].length >= 2);
        const targetSounds = allSounds.filter(level4LetterAllowed);
        const targetPool = targetSounds.length > 0 ? targetSounds : allSounds;
        const pool = targetPool.filter(s => !this.usedSounds.includes(s));
        const available = level4AvoidLastLetter(pool.length > 0 ? pool : targetPool, this.lastSound, s => s);
        this.currentSound = Phono.data.getRandom(available);
        this.usedSounds.push(this.currentSound);
        this.lastSound = this.currentSound;

        // Pick correct word from this sound group
        this.correctWord = Phono.data.getRandom(Phono.data.soundGroups[this.currentSound]);

        // Pick 3 distractors from OTHER sound groups
        const otherSounds = allSounds.filter(s => s !== this.currentSound);
        const distractors = [];
        const usedDistractors = new Set();
        let attempts = 0;
        while (distractors.length < 3 && otherSounds.length > 0 && attempts < 30) {
            attempts++;
            const s = Phono.data.getRandom(otherSounds);
            const w = Phono.data.getRandom(Phono.data.soundGroups[s]);
            if (!usedDistractors.has(w.word)) {
                distractors.push(w);
                usedDistractors.add(w.word);
            }
        }

        const allChoices = Phono.data.shuffle([
            { ...this.correctWord, correct: true },
            ...distractors.map(d => ({ ...d, correct: false })),
        ]);

        // No audio in this stage — the target sound is shown as text in
        // the instruction and in the bubble below, and every choice
        // already shows its word written out.
        const instruction = el('p', { className: 'game-instruction', innerHTML: `Ποια λέξη αρχίζει από <strong>/${this.currentSound}/</strong>;` });

        // Sound bubble
        const soundBubble = el('div', {
            className: 'phoneme-bubble consonant visible',
            textContent: `/${this.currentSound}/`,
            style: { width: '80px', height: '80px', fontSize: 'var(--text-2xl)' },
        });

        const choicesGrid = el('div', { className: 'choices-grid' });
        allChoices.forEach(choice => {
            const card = el('div', { className: 'choice-card', onClick: () => this.checkAnswer(choice.correct, card) }, [
                el('span', { className: 'choice-emoji', textContent: choice.emoji }),
                el('span', { className: 'choice-word', textContent: choice.word }),
            ]);
            choicesGrid.appendChild(card);
        });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, soundBubble, choicesGrid]));
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

        // Wrong pick: don't reveal the correct one — just disable this
        // card and let them try one of the others.
        cardEl.classList.add('wrong', 'disabled');
        Phono.feedback.showWrong();
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('initialSoundMC', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 4: findInitialPhoneme — Find Starting Letter
   =========================================== */
Phono.games.findInitialPhoneme = {
    container: null,
    levelInfo: null,
    currentWord: null,
    usedWords: [],
    lastLetter: null,

    init(container, levelInfo, createVoiceToggle) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.usedWords = [];
        this.lastLetter = null;
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        // Progressive difficulty: shorter words first — plus, when the
        // educator picked specific letters, only words that START with
        // one of them (this game is about the INITIAL sound).
        const tier = Phono.engine.getDifficultyTier();
        let minSyl, maxSyl;
        if (tier === 1) { minSyl = 2; maxSyl = 2; }
        else if (tier === 2) { minSyl = 3; maxSyl = 3; }
        else { minSyl = 3; maxSyl = 5; }
        const bySize = w => w.syllables.length >= minSyl && w.syllables.length <= maxSyl;
        const byLetter = w => level4LetterAllowed(level4PlainLetter(w.word.charAt(0)));
        const letterFiltered = Phono.data.words.filter(w => bySize(w) && byLetter(w));
        const basePool = letterFiltered.length > 0 ? letterFiltered : Phono.data.words.filter(bySize);
        const noImmediateRepeat = level4AvoidLastLetter(basePool, this.lastLetter, w => level4PlainLetter(w.word.charAt(0)));
        const pool = noImmediateRepeat.filter(w => !this.usedWords.includes(w.word));
        const available = pool.length > 0 ? pool : noImmediateRepeat;
        this.currentWord = available.length > 0 ? Phono.data.getRandom(available) : Phono.data.getRandom(Phono.data.words);
        this.usedWords.push(this.currentWord.word);

        const correctLetter = level4PlainLetter(this.currentWord.word.charAt(0));
        this.lastLetter = correctLetter;

        const instruction = el('p', { className: 'game-instruction', textContent: 'Από ποιο φώνημα αρχίζει η λέξη;' });

        // Word display
        const wordDiv = el('div', { className: 'game-main-word', textContent: this.currentWord.word });
        const wordRow = el('div', { className: 'sentence-row' }, [wordDiv, this.createVoiceToggle()]);

        // Speak button
        const speakBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            innerHTML: '🔊 Άκουσε',
            onClick: () => Phono.audio.speak(this.currentWord.word),
        });

        // Generate 4 letter choices (1 correct + 3 distractors)
        const greekLetters = 'α β γ δ ε ζ η θ ι κ λ μ ν ξ ο π ρ σ τ υ φ χ ψ ω'.split(' ');
        const distractors = new Set();
        while (distractors.size < 3) {
            const letter = Phono.data.getRandom(greekLetters);
            if (letter !== correctLetter) distractors.add(letter);
        }
        const allChoices = Phono.data.shuffle([
            { letter: correctLetter, correct: true },
            ...Array.from(distractors).map(l => ({ letter: l, correct: false })),
        ]);

        const choicesGrid = el('div', { className: 'choices-grid' });
        allChoices.forEach(choice => {
            const card = el('div', {
                className: 'choice-card',
                onClick: () => this.checkAnswer(choice.correct, card),
            }, [
                el('span', { className: 'choice-word', textContent: choice.letter, style: { fontSize: 'var(--text-3xl)', fontWeight: '800' } }),
            ]);
            choicesGrid.appendChild(card);
        });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, wordRow, speakBtn, choicesGrid]));
        Phono.audio.speak(this.currentWord.word);
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

        // Wrong pick: don't reveal the correct one — just disable this
        // card and let them try one of the others.
        cardEl.classList.add('wrong', 'disabled');
        Phono.feedback.showWrong();
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('findInitialPhoneme', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 5: findFinalPhoneme — Find Ending Letter
   =========================================== */
Phono.games.findFinalPhoneme = {
    container: null,
    levelInfo: null,
    currentWord: null,
    usedWords: [],
    lastLetter: null,

    init(container, levelInfo, createVoiceToggle) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.usedWords = [];
        this.lastLetter = null;
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        // Progressive difficulty: shorter words first — plus, when the
        // educator picked specific letters, only words that END with one
        // of them (this game is about the FINAL sound).
        const tier = Phono.engine.getDifficultyTier();
        let minSyl, maxSyl;
        if (tier === 1) { minSyl = 2; maxSyl = 2; }
        else if (tier === 2) { minSyl = 3; maxSyl = 3; }
        else { minSyl = 3; maxSyl = 5; }
        const finalLetterOf = w => level4PlainLetter(w.word.charAt(w.word.length - 1));
        const bySize = w => w.syllables.length >= minSyl && w.syllables.length <= maxSyl;
        const byLetter = w => level4LetterAllowed(finalLetterOf(w));
        const letterFiltered = Phono.data.words.filter(w => bySize(w) && byLetter(w));
        const basePool = letterFiltered.length > 0 ? letterFiltered : Phono.data.words.filter(bySize);

        // Pick the LETTER first, uniformly among the distinct letters
        // actually available — not a random word from the pool. Most
        // Greek words end in ι/α/ο, so picking a random word would
        // overwhelmingly land on those two or three letters and barely
        // ever touch η/σ/υ, which reads as "always the same couple of
        // letters" even though no single round literally repeats.
        const distinctLetters = Array.from(new Set(basePool.map(finalLetterOf)));
        const letterChoices = level4AvoidLastLetter(distinctLetters, this.lastLetter, l => l);
        const chosenLetter = Phono.data.getRandom(letterChoices);

        const letterPool = basePool.filter(w => finalLetterOf(w) === chosenLetter);
        const pool = letterPool.filter(w => !this.usedWords.includes(w.word));
        const available = pool.length > 0 ? pool : letterPool;
        this.currentWord = available.length > 0 ? Phono.data.getRandom(available) : Phono.data.getRandom(Phono.data.words);
        this.usedWords.push(this.currentWord.word);

        const word = this.currentWord.word;
        const correctLetter = finalLetterOf(this.currentWord);
        this.lastLetter = correctLetter;

        const instruction = el('p', { className: 'game-instruction', textContent: 'Σε ποιο φώνημα τελειώνει η λέξη;' });

        // Word display
        const wordDiv = el('div', { className: 'game-main-word', textContent: word });
        const wordRow = el('div', { className: 'sentence-row' }, [wordDiv, this.createVoiceToggle()]);

        // Speak button
        const speakBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            innerHTML: '🔊 Άκουσε',
            onClick: () => Phono.audio.speak(word),
        });

        // Generate 4 letter choices (1 correct + 3 distractors)
        const greekLetters = 'α β γ δ ε ζ η θ ι κ λ μ ν ξ ο π ρ σ τ υ φ χ ψ ω'.split(' ');
        const distractors = new Set();
        while (distractors.size < 3) {
            const letter = Phono.data.getRandom(greekLetters);
            if (letter !== correctLetter) distractors.add(letter);
        }
        const allChoices = Phono.data.shuffle([
            { letter: correctLetter, correct: true },
            ...Array.from(distractors).map(l => ({ letter: l, correct: false })),
        ]);

        const choicesGrid = el('div', { className: 'choices-grid' });
        allChoices.forEach(choice => {
            const card = el('div', {
                className: 'choice-card',
                onClick: () => this.checkAnswer(choice.correct, card),
            }, [
                el('span', { className: 'choice-word', textContent: choice.letter, style: { fontSize: 'var(--text-3xl)', fontWeight: '800' } }),
            ]);
            choicesGrid.appendChild(card);
        });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, wordRow, speakBtn, choicesGrid]));
        Phono.audio.speak(word);
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

        // Wrong pick: don't reveal the correct one — just disable this
        // card and let them try one of the others.
        cardEl.classList.add('wrong', 'disabled');
        Phono.feedback.showWrong();
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('findFinalPhoneme', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 6: soundOddOneOut — Three words share an
   initial sound; find the intruder.
   =========================================== */
Phono.games.soundOddOneOut = {
    container: null,
    levelInfo: null,
    usedSounds: [],
    lastSound: null,

    init(container, levelInfo) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.usedSounds = [];
        this.lastSound = null;
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        // Pick a sound group with at least 3 words — restricted to the
        // educator's letters when possible. The ODD word's group below
        // deliberately isn't restricted: it's meant to be an outside
        // contrast, not also one of the practiced letters.
        const allSounds = Object.keys(Phono.data.soundGroups).filter(s => Phono.data.soundGroups[s].length >= 3);
        const letterFiltered = allSounds.filter(level4LetterAllowed);
        const soundPool = letterFiltered.length > 0 ? letterFiltered : allSounds;
        const pool = soundPool.filter(s => !this.usedSounds.includes(s));
        const available = level4AvoidLastLetter(pool.length > 0 ? pool : soundPool, this.lastSound, s => s);
        const sound = Phono.data.getRandom(available);
        this.usedSounds.push(sound);
        this.lastSound = sound;

        // 3 words that share the initial sound
        const sameWords = Phono.data.shuffle([...Phono.data.soundGroups[sound]]).slice(0, 3);

        // 1 odd word from a different sound group
        const otherSounds = Object.keys(Phono.data.soundGroups).filter(s => s !== sound);
        const oddSound = Phono.data.getRandom(otherSounds);
        const odd = Phono.data.getRandom(Phono.data.soundGroups[oddSound]);

        const allChoices = Phono.data.shuffle([
            ...sameWords.map(w => ({ word: w.word, emoji: w.emoji, isOdd: false })),
            { word: odd.word, emoji: odd.emoji, isOdd: true },
        ]);

        // No audio in this stage — the target sound and every word are
        // already shown as text, so nothing depends on hearing them.
        const instruction = el('p', {
            className: 'game-instruction',
            innerHTML: `Τρεις λέξεις αρχίζουν από <strong>/${sound}/</strong>. Βρες αυτή που αρχίζει διαφορετικά!`,
        });

        const choicesGrid = el('div', { className: 'choices-grid' });
        allChoices.forEach(choice => {
            const card = el('div', {
                className: 'choice-card',
                'data-odd': choice.isOdd ? '1' : '0',
                onClick: () => this.checkAnswer(choice.isOdd, card),
            }, [
                el('span', { className: 'choice-emoji', textContent: choice.emoji }),
                el('span', { className: 'choice-word', textContent: choice.word }),
            ]);
            choicesGrid.appendChild(card);
        });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, choicesGrid]));
    },

    checkAnswer(isOdd, cardEl) {
        if (cardEl.classList.contains('disabled')) return;

        if (isOdd) {
            document.querySelectorAll('.choice-card').forEach(c => c.classList.add('disabled'));
            cardEl.classList.add('correct');
            Phono.feedback.showCorrect();
            Phono.engine.recordCorrect();
            setTimeout(() => this.nextOrComplete(), 1500);
            return;
        }

        // Wrong pick: don't reveal the odd one — just disable this card
        // and let them try one of the others.
        cardEl.classList.add('wrong', 'disabled');
        Phono.feedback.showWrong();
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('soundOddOneOut', this.levelInfo.id);
        }
    },
};
