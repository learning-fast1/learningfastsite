/* ============================================================
   LEVEL 3 — Ομοιοκαταληξία
   Games: findRhyme, rhymeMemory, produceRhyme
   ============================================================ */
window.Phono = window.Phono || {};
Phono.games = Phono.games || {};

/* ===========================================
   GAME 1: findRhyme — Multiple Choice
   =========================================== */
Phono.games.findRhyme = {
    container: null,
    levelInfo: null,
    currentPair: null,
    usedPairs: [],

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        this.usedPairs = [];
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        // Pick a rhyme pair
        const pool = Phono.data.rhymePairs.filter(p => !this.usedPairs.includes(p.word1 + p.word2));
        const available = pool.length > 0 ? pool : Phono.data.rhymePairs;
        this.currentPair = Phono.data.getRandom(available);
        this.usedPairs.push(this.currentPair.word1 + this.currentPair.word2);

        const instruction = el('p', { className: 'game-instruction', innerHTML: `Ποια λέξη ομοιοκαταληκτεί με <strong>"${this.currentPair.word1}"</strong>;` });
        const targetEmoji = el('div', { className: 'game-main-emoji', textContent: this.currentPair.emoji1 });
        const targetWord = el('div', { className: 'game-main-word', textContent: this.currentPair.word1 });
        const targetRow = el('div', { className: 'sentence-row' }, [
            targetWord,
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(this.currentPair.word1)),
        ]);

        // Choices: correct + 3 distractors (non-rhyming)
        const rhymeEnding = this.currentPair.ending.replace(/^-/, '').replace(/\/.*/, '');
        const distractors = Phono.data.words
            .filter(w => w.word !== this.currentPair.word1 && w.word !== this.currentPair.word2 && !w.word.endsWith(rhymeEnding))
            .slice(0, 20);
        const picked = Phono.data.shuffle(distractors).slice(0, 3);

        const allChoices = Phono.data.shuffle([
            { word: this.currentPair.word2, emoji: this.currentPair.emoji2, correct: true },
            ...picked.map(d => ({ word: d.word, emoji: d.emoji, correct: false })),
        ]);

        const choicesGrid = el('div', { className: 'choices-grid' });
        allChoices.forEach(choice => {
            const card = el('div', { className: 'choice-card', onClick: () => this.checkAnswer(choice.correct, card) }, [
                el('span', { className: 'choice-emoji', textContent: choice.emoji }),
                el('span', { className: 'choice-word', textContent: choice.word }),
            ]);
            choicesGrid.appendChild(card);
        });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, targetEmoji, targetRow, choicesGrid]));
        Phono.audio.speak(this.currentPair.word1);
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
            Phono.app.onGameComplete('findRhyme', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 2: rhymeMemory — Memory Game
   =========================================== */
Phono.games.rhymeMemory = {
    container: null,
    levelInfo: null,
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 6,
    isChecking: false,
    correctDrops: 0,
    totalAttempts: 0,

    init(container, levelInfo) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.correctDrops = 0;
        this.totalAttempts = 0;

        // Override engine for single-round game
        Phono.engine.totalRounds = 1;
        Phono.engine.currentRound = 0;
        Phono.engine.maxScore = this.totalPairs;

        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        // Pick 6 rhyme pairs
        const shuffledPairs = Phono.data.shuffle([...Phono.data.rhymePairs]);
        // Ensure unique pairs (no duplicate word1)
        const usedWords = new Set();
        const selectedPairs = [];
        for (const pair of shuffledPairs) {
            if (!usedWords.has(pair.word1) && !usedWords.has(pair.word2) && selectedPairs.length < this.totalPairs) {
                selectedPairs.push(pair);
                usedWords.add(pair.word1);
                usedWords.add(pair.word2);
            }
        }

        // Create card data: each pair makes 2 cards
        this.cards = [];
        selectedPairs.forEach((pair, pairIndex) => {
            this.cards.push({ word: pair.word1, emoji: pair.emoji1, pairId: pairIndex, id: pairIndex * 2 });
            this.cards.push({ word: pair.word2, emoji: pair.emoji2, pairId: pairIndex, id: pairIndex * 2 + 1 });
        });
        this.cards = Phono.data.shuffle(this.cards);

        const instruction = el('p', { className: 'game-instruction', textContent: 'Βρες τα ζευγάρια που ομοιοκαταληκτούν!' });

        const grid = el('div', { className: 'memory-grid', id: 'memory-grid' });
        this.cards.forEach((card, i) => {
            const wrapper = el('div', {
                className: 'memory-card-wrapper',
                'data-card-index': String(i),
                onClick: () => this.flipCard(i),
            });
            const cardDiv = el('div', { className: 'memory-card', id: `mem-card-${i}` }, [
                el('div', { className: 'memory-card-face memory-card-front' }),
                el('div', { className: 'memory-card-face memory-card-back' }, [
                    el('span', { textContent: card.emoji, style: { fontSize: '32px' } }),
                    el('span', { className: 'memory-word', textContent: card.word }),
                ]),
            ]);
            wrapper.appendChild(cardDiv);
            grid.appendChild(wrapper);
        });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, grid]));
    },

    flipCard(index) {
        if (this.isChecking) return;
        const cardEl = document.getElementById(`mem-card-${index}`);
        if (!cardEl || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

        cardEl.classList.add('flipped');
        Phono.audio.playSfx('flip');
        this.flippedCards.push(index);

        if (this.flippedCards.length === 2) {
            this.isChecking = true;
            this.totalAttempts++;
            setTimeout(() => this.checkMatch(), 800);
        }
    },

    checkMatch() {
        const [i1, i2] = this.flippedCards;
        const card1 = this.cards[i1];
        const card2 = this.cards[i2];
        const el1 = document.getElementById(`mem-card-${i1}`);
        const el2 = document.getElementById(`mem-card-${i2}`);

        if (card1.pairId === card2.pairId) {
            // Match!
            el1.classList.add('matched');
            el2.classList.add('matched');
            this.matchedPairs++;
            this.correctDrops++;
            Phono.audio.playSfx('match');
            Phono.engine.recordCorrect();

            if (this.matchedPairs >= this.totalPairs) {
                setTimeout(() => {
                    Phono.app.onGameComplete('rhymeMemory', this.levelInfo.id);
                }, 1000);
            }
        } else {
            // No match — flip back
            setTimeout(() => {
                el1.classList.remove('flipped');
                el2.classList.remove('flipped');
            }, 600);
        }

        this.flippedCards = [];
        this.isChecking = false;
    },
};

/* ===========================================
   GAME 3: produceRhyme — Select Rhyme
   =========================================== */
/**
 * produceRhyme is open production, not recognition: the app shows a
 * target word and asks the child to SAY a rhyming word out loud — no
 * multiple-choice menu, since picking from four ready-made words would
 * just be recognition again. The app can't evaluate a spoken answer, so
 * the educator listens and marks the outcome with two buttons. If the
 * child gets stuck, "Χρειάζεται βοήθεια" reveals the target's ending
 * emphasized plus 2-3 example rhymes — but only as a hint, after the
 * child already had a free attempt.
 */
Phono.games.produceRhyme = {
    container: null,
    levelInfo: null,
    currentGroup: null,
    targetWord: null,
    usedGroups: [],

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        this.usedGroups = [];
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        // Needs at least 3 words in the group: 1 target + up to 3 hint
        // examples left over if the child needs help.
        const pool = Phono.data.rhymeGroups.filter(g => g.words.length >= 3 && !this.usedGroups.includes(g.ending));
        const available = pool.length > 0 ? pool : Phono.data.rhymeGroups.filter(g => g.words.length >= 3);
        this.currentGroup = Phono.data.getRandom(available);
        this.usedGroups.push(this.currentGroup.ending);

        this.targetWord = Phono.data.getRandom(this.currentGroup.words);

        const instruction = el('p', { className: 'game-instruction', textContent: 'Μπορείς να βρεις μια λέξη που να κάνει ρίμα;' });
        const targetEmoji = el('div', { className: 'game-main-emoji', textContent: this.targetWord.emoji });
        const targetWordDiv = el('div', { className: 'game-main-word', textContent: this.targetWord.word });
        const targetRow = el('div', { className: 'sentence-row' }, [
            targetWordDiv,
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(this.targetWord.word)),
        ]);
        const micHint = el('p', {
            className: 'game-instruction',
            textContent: '🎤 Το παιδί λέει την απάντησή του δυνατά.',
            style: { fontSize: 'var(--text-base)', color: 'var(--text-secondary)' },
        });

        // Teacher-judged outcome — the app has no way to check a spoken
        // answer itself.
        const controlsRow = el('div', { className: 'tap-controls', id: 'produce-rhyme-controls' }, [
            el('button', { className: 'btn btn-primary', textContent: '✓ Τα κατάφερε', onClick: () => this.markSuccess() }),
            el('button', { className: 'btn btn-secondary', textContent: '↻ Χρειάζεται βοήθεια', onClick: () => this.showHelp() }),
        ]);

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, targetEmoji, targetRow, micHint, controlsRow]));
        Phono.audio.speak(this.targetWord.word);
    },

    markSuccess() {
        const controlsRow = document.getElementById('produce-rhyme-controls');
        if (controlsRow) controlsRow.querySelectorAll('button').forEach(b => { b.disabled = true; b.classList.add('btn-disabled'); });

        Phono.feedback.showCorrect();
        Phono.engine.recordCorrect();
        setTimeout(() => this.nextOrComplete(), 1200);
    },

    /** Shown as a fixed overlay, not inline content — appending the hint
     * text + example cards into the page pushed it tall enough that the
     * child had to scroll to see everything at once. An overlay sits on
     * top instead, so the page height never changes. */
    showHelp() {
        const { el } = Phono.helpers;

        // Emphasize the shared ending within the target word itself, e.g.
        // "σοκολάτα" + ending "-άτα" -> "σοκολΆΤΑ".
        const endingLetters = this.currentGroup.ending.replace('-', '');
        const word = this.targetWord.word;
        const emphasized = word.toLowerCase().endsWith(endingLetters.toLowerCase())
            ? word.slice(0, word.length - endingLetters.length) + word.slice(word.length - endingLetters.length).toUpperCase()
            : word;

        const close = () => overlay.remove();

        // Falls back to recognition as a scaffold: 1 word from the same
        // rhyme group (correct) + 3 that don't share the ending
        // (distractors, also excluded from being an accidental rhyme).
        const correctWord = Phono.data.getRandom(this.currentGroup.words.filter(w => w.word !== this.targetWord.word));
        const distractorPool = Phono.data.words.filter(w =>
            !this.currentGroup.words.some(gw => gw.word === w.word) &&
            !w.word.toLowerCase().endsWith(endingLetters.toLowerCase())
        );
        const distractors = Phono.data.shuffle(distractorPool).slice(0, 3);
        const choices = Phono.data.shuffle([
            { word: correctWord.word, emoji: correctWord.emoji, correct: true },
            ...distractors.map(d => ({ word: d.word, emoji: d.emoji, correct: false })),
        ]);

        const choicesGrid = el('div', { className: 'choices-grid', id: 'produce-rhyme-help-choices' });
        choices.forEach(choice => {
            const card = el('div', {
                className: 'choice-card',
                onClick: () => this.checkHelpChoice(choice.correct, card, close),
            }, [
                el('span', { className: 'choice-emoji', textContent: choice.emoji }),
                el('span', { className: 'choice-word', textContent: choice.word }),
            ]);
            choicesGrid.appendChild(card);
        });

        const overlay = el('div', {
            className: 'teacher-note-overlay',
            onClick: (e) => { if (e.target === overlay) close(); },
        }, [
            el('div', { className: 'teacher-note-card' }, [
                el('div', { className: 'teacher-note-title', textContent: '💡 Βοήθεια' }),
                el('p', { className: 'teacher-note-text', textContent: `Άκου: ${emphasized}… ποια από αυτές τις λέξεις τελειώνει παρόμοια;` }),
                choicesGrid,
                el('button', { className: 'btn btn-secondary btn-small', textContent: 'Κλείσιμο', onClick: close, style: { marginTop: 'var(--space-lg)' } }),
            ]),
        ]);
        // Appended to the top-level #app container, not this.container
        // (game-body) — game-body sits inside the .fade-in screen, which
        // animates with a `transform`. That creates a new containing
        // block for `position: fixed` descendants, so the overlay would
        // end up positioned relative to that transformed screen instead
        // of the actual viewport (same reason app.js's own overlays and
        // the sound/info buttons are attached at the #app level).
        document.getElementById('app').appendChild(overlay);
    },

    checkHelpChoice(isCorrect, cardEl, closeOverlay) {
        if (cardEl.classList.contains('disabled')) return;

        if (isCorrect) {
            document.querySelectorAll('#produce-rhyme-help-choices .choice-card').forEach(c => c.classList.add('disabled'));
            cardEl.classList.add('correct');
            Phono.feedback.showCorrect();
            setTimeout(() => { closeOverlay(); this.markSuccess(); }, 900);
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
            Phono.app.onGameComplete('produceRhyme', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 4: rhymeOddOneOut — Find the word that
   does NOT rhyme with the others.
   =========================================== */
Phono.games.rhymeOddOneOut = {
    container: null,
    levelInfo: null,
    usedGroups: [],

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        this.usedGroups = [];
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        // Pick a rhyme group with at least 2 words
        const pool = Phono.data.rhymeGroups.filter(g => g.words.length >= 2 && !this.usedGroups.includes(g.ending));
        const available = pool.length > 0 ? pool : Phono.data.rhymeGroups.filter(g => g.words.length >= 2);
        const group = Phono.data.getRandom(available);
        this.usedGroups.push(group.ending);

        // 2 rhyming words from the group
        const rhyming = Phono.data.shuffle([...group.words]).slice(0, 2);

        // 1 odd word that does NOT rhyme (different ending)
        const ending = group.ending.replace(/^-/, '');
        const oddPool = Phono.data.words.filter(w =>
            !w.word.endsWith(ending) &&
            !group.words.some(gw => gw.word === w.word)
        );
        const odd = Phono.data.getRandom(oddPool);

        const allChoices = Phono.data.shuffle([
            ...rhyming.map(w => ({ word: w.word, emoji: w.emoji, isOdd: false })),
            { word: odd.word, emoji: odd.emoji, isOdd: true },
        ]);

        const instruction = el('p', { className: 'game-instruction', textContent: 'Δύο λέξεις ομοιοκαταληκτούν. Βρες αυτή που ΔΕΝ ταιριάζει!' });
        const instructionRow = el('div', { className: 'sentence-row' }, [
            instruction,
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speakSyllables(allChoices.map(c => c.word), 350)),
        ]);

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

        this.container.appendChild(el('div', { className: 'tap-area' }, [instructionRow, choicesGrid]));

        // Read all three words aloud so the child hears the rhyme
        Phono.audio.speakSyllables(allChoices.map(c => c.word), 350);
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
            Phono.app.onGameComplete('rhymeOddOneOut', this.levelInfo.id);
        }
    },
};
