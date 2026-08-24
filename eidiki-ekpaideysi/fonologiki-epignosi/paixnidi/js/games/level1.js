/* ============================================================
   LEVEL 1 — Λέξη & Πρόταση
   Games: wordSizeCompare, wordCounting, wordPosition, sentenceBuilder,
          wordDeletion
   ============================================================ */
window.Phono = window.Phono || {};
Phono.games = Phono.games || {};

/* ===========================================
   GAME 0: wordSizeCompare — "Μεγάλη ή μικρή λέξη;"
   Teaches that the WORD is not the OBJECT it names: the "bigger"
   word is whichever has more syllables, regardless of the
   real-world size of the thing it refers to.
   =========================================== */
Phono.games.wordSizeCompare = {
    container: null,
    levelInfo: null,
    createVoiceToggle: null,
    currentPair: null,
    usedPairs: [],
    answered: false,
    cards: null,
    cardOrder: [],
    clapWordIndex: 0,
    clapSylIndex: 0,
    lastBigFirst: null,
    bigPositionStreak: 0,

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        this.usedPairs = [];
        this.lastBigFirst = null;
        this.bigPositionStreak = 0;
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';
        this.answered = false;

        // Progressive difficulty: stage A (big gap) -> B (smaller gap)
        // -> C (conflict: physically bigger object, shorter word).
        const tier = Phono.engine.getDifficultyTier();
        const stage = tier === 1 ? 'A' : tier === 2 ? 'B' : 'C';

        const pool = Phono.data.wordSizePairs.filter(p => p.stage === stage && !this.usedPairs.includes(p.word1 + p.word2));
        const available = pool.length > 0 ? pool : Phono.data.wordSizePairs.filter(p => p.stage === stage);
        this.currentPair = Phono.data.getRandom(available);
        this.usedPairs.push(this.currentPair.word1 + this.currentPair.word2);

        const instruction = el('p', {
            className: 'game-instruction',
            innerHTML: 'Ποια <strong style="text-decoration: underline;">ΛΕΞΗ</strong> είναι πιο μεγάλη;',
        });
        const instructionRow = el('div', { className: 'sentence-row' }, [
            instruction,
            this.createVoiceToggle(),
            this.createRepeatButton(() => this.speakBothWordsOnce()),
        ]);

        // Two cards, left/right order randomized each round so the
        // correct answer isn't always on the same side. Kept on `this` so
        // speakBothWordsOnce() can read them out in the same left-to-right
        // order they're displayed in.
        //
        // A plain 50/50 shuffle every round is "fair" but can still land
        // on the same position many rounds in a row by chance (a real
        // session hit 6 straight) — long enough that a child starts
        // predicting "it's always second". Capping the streak at 2 fixes
        // that without forcing strict alternation, which is its own
        // learnable pattern.
        let sides = Phono.data.shuffle(['word1', 'word2']);
        const correctSide = this.currentPair.syllables1.length > this.currentPair.syllables2.length ? 'word1' : 'word2';
        let bigFirst = sides[0] === correctSide;
        if (bigFirst === this.lastBigFirst && this.bigPositionStreak >= 2) {
            sides = [sides[1], sides[0]];
            bigFirst = !bigFirst;
        }
        this.bigPositionStreak = bigFirst === this.lastBigFirst ? this.bigPositionStreak + 1 : 1;
        this.lastBigFirst = bigFirst;
        this.sides = sides;
        this.cards = {};
        this.cardOrder = [];
        const choicesGrid = el('div', { className: 'choices-grid' });
        sides.forEach(side => {
            const boxesDiv = el('div', { className: 'syllable-boxes wordsize-syllable-boxes', style: { display: 'none', marginTop: 'var(--space-sm)' } });
            const card = el('div', {
                className: 'choice-card',
                onClick: () => this.checkAnswer(side),
            }, [
                el('span', { className: 'choice-emoji', textContent: this.currentPair[`emoji${side === 'word1' ? '1' : '2'}`] }),
                el('span', { className: 'choice-word', textContent: this.currentPair[side] }),
                boxesDiv,
            ]);
            card._boxesDiv = boxesDiv;
            card._side = side;
            this.cards[side] = card;
            this.cardOrder.push(card);
            choicesGrid.appendChild(card);
        });

        const footer = el('div', { className: 'round-footer', id: 'wordsize-footer' });

        this.container.appendChild(el('div', { className: 'tap-area compact-tap-area' }, [instructionRow, choicesGrid, footer]));

        // Read both words once, normally, as soon as they appear.
        this.speakBothWordsOnce();
    },

    async speakBothWordsOnce() {
        // Guards the gap between the two words: if the app navigated away
        // while waiting, this stops instead of speaking the second word
        // over whatever screen the child is on now (Phono.audio.speak()
        // itself only guards its own single call, not this sequence).
        const gen = Phono.audio.navGeneration;
        const pair = this.currentPair;
        await Phono.audio.speak(pair[this.sides[0]]);
        await Phono.helpers.wait(300);
        if (gen !== Phono.audio.navGeneration) return;
        await Phono.audio.speak(pair[this.sides[1]]);
    },

    checkAnswer(chosenSide) {
        if (this.answered) return;

        const pair = this.currentPair;
        const otherSide = chosenSide === 'word1' ? 'word2' : 'word1';
        const cardEl = this.cards[chosenSide];
        const otherCardEl = this.cards[otherSide];

        const correctSide = pair.syllables1.length > pair.syllables2.length ? 'word1' : 'word2';
        const isCorrect = chosenSide === correctSide;

        if (isCorrect) {
            this.answered = true;
            cardEl.classList.add('disabled', 'correct');
            otherCardEl.classList.add('disabled');
            Phono.feedback.showCorrect();
            Phono.engine.recordCorrect();
            setTimeout(() => this.startClapping(), 1200);
            return;
        }

        // Wrong pick: flash it red briefly, then let them try again. With
        // only two cards, permanently disabling the wrong one would give
        // away the correct one by elimination — so it un-disables itself.
        cardEl.classList.add('wrong');
        Phono.feedback.showWrong();
        setTimeout(() => cardEl.classList.remove('wrong'), 1500);

        // Diagnostic: in stage C, the only wrong choice is also the
        // physically bigger object — log that separately from a plain
        // wrong answer, since it points at a specific misconception.
        if (pair.stage === 'C' && pair[`objectSize${chosenSide === 'word1' ? '1' : '2'}`] === 'big') {
            Phono.diagnostics.record('wordSizeCompare', 'objectSizeConfusion', {
                chose: pair[chosenSide],
                correctWord: pair[correctSide],
            });
        }
    },

    /**
     * Instead of the app syllabifying the words out loud, ask the kids to
     * clap it out themselves — one clap reveals one syllable box (in the
     * left-to-right card order), for the first word, then the second.
     */
    startClapping() {
        this.clapWordIndex = 0;
        this.clapSylIndex = 0;
        this.renderClapStep();
    },

    renderClapStep() {
        const { el } = Phono.helpers;
        const footer = document.getElementById('wordsize-footer');
        footer.innerHTML = '';

        if (this.clapWordIndex >= this.cardOrder.length) {
            const nextBtn = el('button', {
                className: 'btn btn-primary',
                textContent: 'Επόμενο ▶',
                onClick: () => this.nextOrComplete(),
            });
            footer.appendChild(nextBtn);
            return;
        }

        const card = this.cardOrder[this.clapWordIndex];
        const side = card._side;
        const word = this.currentPair[side];

        // "Μπράβο!" only once, for the first word — repeating it again when
        // the prompt re-renders for the second word reads as odd/redundant.
        const promptText = this.clapWordIndex === 0
            ? `Μπράβο! Χτύπα παλαμάκια για κάθε συλλαβή της λέξης "${word}"!`
            : `Τώρα χτύπα παλαμάκια για κάθε συλλαβή της λέξης "${word}"!`;
        const prompt = el('p', { className: 'game-instruction', textContent: promptText });
        const clapBtn = el('button', {
            className: 'clap-button wordsize-clap-btn',
            textContent: '👏',
            onClick: () => this.handleSyllableClap(card, clapBtn),
        });
        footer.appendChild(prompt);
        footer.appendChild(clapBtn);
    },

    handleSyllableClap(card, clapBtn) {
        const { el } = Phono.helpers;
        const side = card._side;
        const syllables = this.currentPair[`syllables${side === 'word1' ? '1' : '2'}`];
        if (this.clapSylIndex >= syllables.length) return;

        Phono.audio.playSfx('clap');
        card._boxesDiv.style.display = '';
        card._boxesDiv.appendChild(el('div', { className: 'syllable-box syllable-box-mini', textContent: syllables[this.clapSylIndex] }));
        this.clapSylIndex++;

        if (this.clapSylIndex >= syllables.length) {
            // Disable right away — the counter resets for the NEXT word
            // below, so without this the still-visible button would pass
            // the guard above and add an extra box to the word just done.
            clapBtn.disabled = true;
            clapBtn.classList.add('btn-disabled');
            this.clapWordIndex++;
            this.clapSylIndex = 0;
            setTimeout(() => this.renderClapStep(), 500);
        }
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('wordSizeCompare', this.levelInfo.id);
        }
    },
};

/**
 * Smooth easy-to-hard progression for Level 1: whatever number of rounds
 * the child picked (3-10), the sentence length climbs evenly from the
 * shortest (1 word) on round 1 to the longest (5 words) on the last
 * round, instead of jumping between rough thirds. The 1-word tier is
 * the newest/easiest addition to the sentence pool, so it now leads.
 */
function level1TargetWordCount(round, totalRounds) {
    const minWords = 1, maxWords = 5;
    if (totalRounds <= 1) return maxWords;
    const progress = round / (totalRounds - 1);
    return Math.round(minWords + progress * (maxWords - minWords));
}

/**
 * Same progression, but for sentenceBuilder specifically: a 1-word
 * "sentence" has nothing to reorder, so that stage starts at 2 words
 * instead of 1 while every other Level 1 game still leads with 1-word
 * sentences via level1TargetWordCount above.
 */
function level1TargetWordCountForBuilder(round, totalRounds) {
    const minWords = 2, maxWords = 5;
    if (totalRounds <= 1) return maxWords;
    const progress = round / (totalRounds - 1);
    return Math.round(minWords + progress * (maxWords - minWords));
}

/**
 * Pre-selects every sentence for the whole session up front (rather than
 * one per round, live) so the teacher's reveal panel can list them all
 * before play even starts.
 */
function level1BuildSentenceBuilderSentences(totalRounds) {
    const used = [];
    const sentences = [];
    for (let round = 0; round < totalRounds; round++) {
        const targetWords = level1TargetWordCountForBuilder(round, totalRounds);
        const selPool = Phono.data.getSentencePool();
        const pool = selPool.filter(s => s.words.length === targetWords && !used.includes(s.text));
        const available = pool.length > 0 ? pool : selPool.filter(s => s.words.length === targetWords);
        // Last-resort fallback ignores the teacher's selection (never let
        // it leave this game with nothing to show) but still excludes
        // 1-word entries — nothing to reorder in a single word, so this
        // stage must never show one.
        const sentence = available.length > 0 ? Phono.data.getRandom(available) : Phono.data.getRandom(Phono.data.sentences.filter(s => s.words.length >= 2));
        used.push(sentence.text);
        sentences.push(sentence);
    }
    return sentences;
}

/** Replicates Phono.engine.getDifficultyTier()'s round->tier formula
 * directly (a pure function of round/total) instead of reading the
 * engine's live currentRound — needed because the whole session's
 * sentences are picked up front, before the engine has actually walked
 * through each round. */
function level1TierForRound(round, total) {
    if (round < Math.ceil(total / 3)) return 1;
    if (round < Math.ceil((2 * total) / 3)) return 2;
    return 3;
}

/** Pre-selects every sentence for the whole session up front — same
 * reasoning as level1BuildSentenceBuilderSentences — so the teacher's
 * reveal panel can list every sentence and its target word before play
 * even starts, instead of only the current round's. */
function level1BuildWordPositionSentences(totalRounds) {
    const used = [];
    const sentences = [];
    for (let round = 0; round < totalRounds; round++) {
        const tier = level1TierForRound(round, totalRounds);
        const stage = tier === 1 ? 'A' : tier === 2 ? 'B' : 'C';
        const matchesStage = s => stage === 'A' ? (s.words.length >= 2 && s.words.length <= 3) : s.words.length === 3;

        const selPool = Phono.data.getSentencePool();
        const pool = selPool.filter(s => matchesStage(s) && !used.includes(s.text));
        const stagePool = selPool.filter(matchesStage);
        // Third-tier fallback ignores the teacher's selection entirely —
        // needed since a narrow selection could have nothing at all
        // matching this round's stage yet.
        const available = pool.length > 0 ? pool : (stagePool.length > 0 ? stagePool : Phono.data.sentences.filter(matchesStage));
        const sentence = Phono.data.getRandom(available);
        used.push(sentence.text);
        sentences.push(sentence);
    }
    return sentences;
}

/**
 * Same easy-to-hard trend as above, but with a little randomness around
 * the "ideal" length each round. Used only for the clapping game
 * (wordCounting): once kids realize the exact word count is 100%
 * predictable from the round number, they stop actually counting and
 * just recite the pattern. A wobble of +/-1 word keeps the trend (short
 * sentences early, long ones late) without making any single round
 * guessable.
 */
function level1WordCountForClapping(round, totalRounds) {
    const minWords = 1, maxWords = 5;
    const ideal = level1TargetWordCount(round, totalRounds);
    const roll = Math.random();
    const wobble = roll < 0.25 ? -1 : roll < 0.75 ? 0 : 1;
    return Math.max(minWords, Math.min(maxWords, ideal + wobble));
}

/* ===========================================
   GAME 1: wordCounting — Clapping Game
   =========================================== */
Phono.games.wordCounting = {
    container: null,
    levelInfo: null,
    currentSentence: null,
    clapCount: 0,
    usedSentences: [],
    answered: false,
    missedThisRound: false,
    lastWordCount: null,
    struggledLastRound: false,

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createHighlightToggle = createHighlightToggle;
        this.createRepeatButton = createRepeatButton;
        this.usedSentences = [];
        this.lastWordCount = null;
        this.struggledLastRound = false;
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';
        this.clapCount = 0;
        this.answered = false;
        this.missedThisRound = false;

        // Progressive difficulty with a bit of wobble so the exact word
        // count per round can't be memorized (see level1WordCountForClapping).
        // But if the child got the last round wrong, don't push them to a
        // harder sentence yet — hold at (or below) that word count until
        // they succeed.
        let targetWords = level1WordCountForClapping(Phono.engine.currentRound, Phono.engine.totalRounds);
        if (this.struggledLastRound && this.lastWordCount != null) {
            targetWords = Math.min(targetWords, this.lastWordCount);
        }
        const selPool = Phono.data.getSentencePool();
        const pool = selPool.filter(s => s.words.length === targetWords && !this.usedSentences.includes(s.text));
        const available = pool.length > 0 ? pool : selPool.filter(s => s.words.length === targetWords);
        this.currentSentence = available.length > 0 ? Phono.data.getRandom(available) : Phono.data.getRandom(Phono.data.sentences);
        this.usedSentences.push(this.currentSentence.text);

        // Instruction
        const instruction = el('p', { className: 'game-instruction', textContent: 'Άκουσε την πρόταση και χτύπα τα χέρια σου για κάθε λέξη!' });

        // Sentence display
        const sentenceDiv = el('div', { className: 'clap-sentence', id: 'clap-sentence' });
        this.currentSentence.words.forEach((word, i) => {
            const isLast = i === this.currentSentence.words.length - 1;
            const span = el('span', { className: 'word', textContent: isLast ? `${word}.` : word, 'data-index': String(i) });
            sentenceDiv.appendChild(span);
            if (!isLast) {
                sentenceDiv.appendChild(document.createTextNode(' '));
            }
        });
        const sentenceRow = el('div', { className: 'sentence-row' }, [
            sentenceDiv,
            this.createVoiceToggle(),
            this.createHighlightToggle(),
            this.createRepeatButton(() => Phono.audio.speak(this.currentSentence.text, 0.5)),
        ]);

        // Clap counter
        const counterDiv = el('div', { className: 'clap-counter', id: 'clap-counter' });

        // Clap button
        const clapBtn = el('button', {
            className: 'clap-button',
            textContent: '👏',
            id: 'clap-btn',
            onClick: () => this.handleClap(),
        });

        // Undo/reset — in case of an accidental extra clap (or several)
        const undoBtn = el('button', {
            className: 'btn btn-icon clap-reset-btn',
            textContent: '-1',
            style: { fontSize: 'var(--text-base)', fontWeight: '800' },
            title: 'Αφαίρεσε ένα χτύπημα',
            onClick: () => this.undoClap(),
        });
        const resetBtn = el('button', {
            className: 'btn btn-icon clap-reset-btn',
            textContent: '↺',
            title: 'Ξαναμέτρα τα χτυπήματα',
            onClick: () => this.resetClaps(),
        });
        const clapRow = el('div', { className: 'clap-button-row' }, [clapBtn, undoBtn, resetBtn]);

        // Check area (shown after first clap)
        const checkArea = el('div', { className: 'clap-check-area', id: 'check-area', style: { display: 'none' } });
        this.buildAnswerChoices(checkArea);

        const area = el('div', { className: 'clap-area' }, [instruction, sentenceRow, counterDiv, clapRow, checkArea]);
        this.container.appendChild(area);

        // Speak the sentence
        Phono.audio.speak(this.currentSentence.text, 0.5);
    },

    handleClap() {
        if (this.answered) return;
        const { el } = Phono.helpers;

        this.clapCount++;
        Phono.audio.playSfx('clap');

        // Animate clap button
        const btn = document.getElementById('clap-btn');
        btn.classList.add('clapped');
        setTimeout(() => btn.classList.remove('clapped'), 300);

        // Add counter dot
        const counter = document.getElementById('clap-counter');
        const dot = el('div', { className: 'clap-dot' });
        counter.appendChild(dot);

        // Highlight word (optional assist, teacher can turn off per stage)
        if (Phono.assist.isHighlightEnabled('wordCounting')) {
            const words = document.querySelectorAll('#clap-sentence .word');
            if (this.clapCount <= words.length) {
                words[this.clapCount - 1].classList.add('highlighted');
            }
        }

        // Show answer choices after first clap (user can keep clapping)
        const checkArea = document.getElementById('check-area');
        if (checkArea && checkArea.style.display === 'none') {
            checkArea.style.display = '';
        }
    },

    /** Undo just the last clap (over-shot by one, no need to restart) */
    undoClap() {
        if (this.answered || this.clapCount <= 0) return;
        Phono.audio.playSfx('drop');

        this.clapCount--;

        const counter = document.getElementById('clap-counter');
        if (counter && counter.lastElementChild) counter.removeChild(counter.lastElementChild);

        if (Phono.assist.isHighlightEnabled('wordCounting')) {
            const words = document.querySelectorAll('#clap-sentence .word.highlighted');
            if (words.length > 0) words[words.length - 1].classList.remove('highlighted');
        }

        if (this.clapCount === 0) {
            const checkArea = document.getElementById('check-area');
            if (checkArea) checkArea.style.display = 'none';
        }
    },

    /** Undo an accidental extra clap: start the count over from zero */
    resetClaps() {
        if (this.answered) return;
        Phono.audio.playSfx('drop');

        this.clapCount = 0;

        const counter = document.getElementById('clap-counter');
        if (counter) counter.innerHTML = '';

        document.querySelectorAll('#clap-sentence .word.highlighted').forEach(w => w.classList.remove('highlighted'));

        const checkArea = document.getElementById('check-area');
        if (checkArea) checkArea.style.display = 'none';
    },

    buildAnswerChoices(checkArea) {
        const { el } = Phono.helpers;

        const label = el('p', { className: 'game-instruction', textContent: 'Πόσες λέξεις έχει η πρόταση;', style: { fontSize: 'var(--text-lg)' } });

        const correct = this.currentSentence.words.length;
        // Generate choices: 1 through max(7, correct+2)
        const maxChoice = Math.max(7, correct + 2);
        const choices = [];
        for (let i = 1; i <= maxChoice; i++) choices.push(i);

        const choicesDiv = el('div', { className: 'clap-number-choices' });
        choices.forEach(num => {
            const btn = el('button', {
                className: 'number-choice-btn',
                textContent: String(num),
                onClick: () => this.checkAnswer(num, btn),
            });
            choicesDiv.appendChild(btn);
        });

        checkArea.appendChild(label);
        checkArea.appendChild(choicesDiv);
    },

    checkAnswer(answer, btnEl) {
        if (this.answered) return;

        // The number picked has to match how many times the child
        // actually clapped — otherwise the clapping isn't really doing
        // the counting, they're just guessing a number. Doesn't disable
        // the button: they can fix their clap count (↺ reset) and pick
        // it again.
        if (answer !== this.clapCount) {
            Phono.feedback.showWrong();
            return;
        }

        const correct = this.currentSentence.words.length;
        if (answer === correct) {
            this.answered = true;
            btnEl.classList.add('correct');
            Phono.feedback.showCorrect();
            Phono.engine.recordCorrect();
            // Disable all buttons
            document.querySelectorAll('.number-choice-btn').forEach(b => b.classList.add('btn-disabled'));
            setTimeout(() => this.nextOrComplete(), 1200);
        } else {
            this.missedThisRound = true;
            btnEl.classList.add('wrong');
            Phono.feedback.showWrong();
            btnEl.classList.add('btn-disabled');
        }
    },

    nextOrComplete() {
        // Remember whether this round needed a mistake or two, so the next
        // round doesn't get harder until the child gets one right cleanly.
        this.lastWordCount = this.currentSentence.words.length;
        this.struggledLastRound = this.missedThisRound;

        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('wordCounting', this.levelInfo.id);
        }
    },
};

/**
 * Pick a word that was NOT in the given sentence, for the "does not
 * exist" distractor in wordPosition. Compares lowercase so an article
 * like "Ο"/"Το" never accidentally collides with a noun.
 */
function wordPositionPickOutsideWord(sentenceWords) {
    const lower = sentenceWords.map(w => w.toLowerCase());
    const pool = Phono.data.words.filter(w => !lower.includes(w.word.toLowerCase()));
    return Phono.data.getRandom(pool).word;
}

/* ===========================================
   GAME: wordPosition — "Πρώτη ή Τελευταία λέξη;"
   Position-in-sequence awareness — bridges toward Level 4's
   initial/final PHONEME task, same logic at the word level.
   =========================================== */
Phono.games.wordPosition = {
    container: null,
    levelInfo: null,
    createVoiceToggle: null,
    currentSentence: null,
    targetIndex: 0,
    positionLabel: '',
    roundSentences: [],
    answered: false,

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        // Whole session picked up front (not per-round) so the teacher's
        // sentence list can show every sentence for the round right away
        // — same reasoning as sentenceBuilder's roundSentences.
        this.roundSentences = level1BuildWordPositionSentences(Phono.engine.totalRounds);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';
        this.answered = false;

        // Progressive difficulty: stage A asks for the FIRST word (2-3
        // word sentences) -> B asks for the LAST word (3 words) -> C asks
        // for the MIDDLE word (3 words, hardest — depends on both edges).
        const tier = Phono.engine.getDifficultyTier();
        const stage = tier === 1 ? 'A' : tier === 2 ? 'B' : 'C';

        this.currentSentence = this.roundSentences[Phono.engine.currentRound];

        const words = this.currentSentence.words;
        this.targetIndex = stage === 'A' ? 0 : stage === 'B' ? words.length - 1 : 1;
        this.positionLabel = stage === 'A' ? 'ΠΡΩΤΗ' : stage === 'B' ? 'ΤΕΛΕΥΤΑΙΑ' : 'ΜΕΣΑΙΑ';

        const instruction = el('p', {
            className: 'game-instruction',
            innerHTML: `Ποια ήταν η <strong style="text-decoration: underline;">${this.positionLabel}</strong> λέξη;`,
        });
        const instructionRow = el('div', { className: 'sentence-row' }, [
            instruction,
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(this.currentSentence.text, 0.5)),
        ]);

        // Teacher-only peek at every sentence in the session and its
        // target word — the sentence is never shown written out, so the
        // teacher has no way to read it herself with the sound muted
        // without this.
        const revealBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: '🔒 Προτάσεις (δάσκαλος)',
            onClick: () => this.showSentenceList(),
        });

        // Word-position boxes — as many empty boxes as words in the
        // sentence, visualizing the sequence (no text yet).
        const boxesDiv = el('div', { className: 'syllable-boxes', id: 'wordpos-boxes' });
        words.forEach(() => boxesDiv.appendChild(el('div', { className: 'syllable-box' })));

        // Choices: the target word + one other word from the sentence
        // + one word that was NOT in the sentence at all.
        const otherIndices = words.map((_, i) => i).filter(i => i !== this.targetIndex);
        const inSentenceDistractorIndex = Phono.data.getRandom(otherIndices);
        const outsideWord = wordPositionPickOutsideWord(words);

        const choices = Phono.data.shuffle([
            { word: words[this.targetIndex], correct: true },
            { word: words[inSentenceDistractorIndex], correct: false },
            { word: outsideWord, correct: false },
        ]);

        // No emoji on these cards — the choice IS the word, unlike a
        // picture-choice game, and a 72px decorative "🔊" on every card
        // was pure wasted vertical space (the word is already read aloud
        // on tap).
        const choicesGrid = el('div', { className: 'choices-grid' });
        choices.forEach(choice => {
            const card = el('div', { className: 'choice-card', onClick: () => this.checkAnswer(card) }, [
                el('span', { className: 'choice-word', textContent: choice.word }),
            ]);
            card._correct = choice.correct;
            card._word = choice.word;
            choicesGrid.appendChild(card);
        });

        const footer = el('div', { className: 'round-footer', id: 'wordpos-footer' });

        this.container.appendChild(el('div', { className: 'tap-area compact-tap-area' }, [instructionRow, revealBtn, boxesDiv, choicesGrid, footer]));

        // Read the sentence once, normally, as soon as it appears.
        Phono.audio.speak(this.currentSentence.text, 0.5);
    },

    /** Teacher-only sentence list for the WHOLE session, not just the
     * current round, as a fixed overlay attached to #app (not
     * this.container, since the game area sits inside the .fade-in
     * screen, whose `transform` would break a fixed-position child). */
    showSentenceList() {
        const { el } = Phono.helpers;
        const close = () => overlay.remove();
        const total = this.roundSentences.length;

        const list = el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', textAlign: 'left' } });
        this.roundSentences.forEach((s, i) => {
            const isCurrent = i === Phono.engine.currentRound;
            const tier = level1TierForRound(i, total);
            const stage = tier === 1 ? 'A' : tier === 2 ? 'B' : 'C';
            const words = s.words;
            const targetIndex = stage === 'A' ? 0 : stage === 'B' ? words.length - 1 : 1;
            const positionLabel = stage === 'A' ? 'πρώτη' : stage === 'B' ? 'τελευταία' : 'μεσαία';
            list.appendChild(el('div', {
                style: {
                    display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)',
                    padding: 'var(--space-xs) var(--space-sm)', borderRadius: 'var(--radius-md)',
                    background: isCurrent ? 'var(--primary-light)' : 'transparent',
                    fontWeight: isCurrent ? '800' : '600',
                },
            }, [
                el('span', { textContent: `${i + 1}. ${s.text}` }),
                el('span', { textContent: `${positionLabel}: ${words[targetIndex]}`, style: { color: 'var(--text-secondary)' } }),
            ]));
        });

        const overlay = el('div', {
            className: 'teacher-note-overlay',
            onClick: (e) => { if (e.target === overlay) close(); },
        }, [
            el('div', { className: 'teacher-note-card' }, [
                el('div', { className: 'teacher-note-title', textContent: '🔒 Προτάσεις της συνεδρίας' }),
                el('p', {
                    textContent: 'Σημείωσε τις προτάσεις ή βγάλε τις φωτογραφία για να τις διαβάζεις στο παιδί.',
                    style: { color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' },
                }),
                list,
                el('button', { className: 'btn btn-primary', textContent: 'Κατάλαβα', onClick: close, style: { marginTop: 'var(--space-lg)' } }),
            ]),
        ]);
        document.getElementById('app').appendChild(overlay);
    },

    checkAnswer(cardEl) {
        if (this.answered || cardEl.classList.contains('disabled')) return;

        Phono.audio.speak(cardEl._word);

        if (cardEl._correct) {
            this.answered = true;
            const boxes = document.querySelectorAll('#wordpos-boxes .syllable-box');
            if (boxes[this.targetIndex]) boxes[this.targetIndex].classList.add('remaining');

            document.querySelectorAll('.choice-card').forEach(c => c.classList.add('disabled'));
            cardEl.classList.add('correct');
            Phono.feedback.showCorrect();
            Phono.engine.recordCorrect();
            setTimeout(() => this.showNextButton(), 1200);
            return;
        }

        // Wrong pick: don't reveal the correct one — just disable this
        // card and let them try one of the others.
        cardEl.classList.add('wrong', 'disabled');
        Phono.feedback.showWrong();
    },

    showNextButton() {
        const { el } = Phono.helpers;
        const footer = document.getElementById('wordpos-footer');
        if (!footer) return;
        footer.innerHTML = '';
        footer.appendChild(el('button', {
            className: 'btn btn-primary',
            textContent: 'Επόμενο ▶',
            onClick: () => this.nextOrComplete(),
        }));
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('wordPosition', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 2: sentenceBuilder — Drag & Drop
   =========================================== */
Phono.games.sentenceBuilder = {
    container: null,
    levelInfo: null,
    currentSentence: null,
    roundSentences: [],
    placedWords: [],

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        // Whole session picked up front (not per-round) so the teacher's
        // reveal panel can show every sentence right away — decoding a
        // sentence live from its scrambled words while the child is
        // already dragging them isn't realistic.
        this.roundSentences = level1BuildSentenceBuilderSentences(Phono.engine.totalRounds);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';
        this.placedWords = [];

        this.currentSentence = this.roundSentences[Phono.engine.currentRound];
        const words = this.currentSentence.words;
        this.placedWords = new Array(words.length).fill(null);

        // Instruction
        const instruction = el('p', { className: 'game-instruction', textContent: 'Βάλε τις λέξεις στη σωστή σειρά για να φτιάξεις πρόταση!' });

        // Never shown written out — a child who saw the finished sentence
        // could just copy it instead of actually reordering the scrambled
        // words, even with only a couple of seconds to read it. Audio
        // (and the mute/repeat controls) are still here; a placeholder
        // icon just keeps the row's layout instead of an empty gap.
        const preview = el('div', { className: 'clap-sentence', id: 'sentence-preview', textContent: '💬' });
        const previewRow = el('div', { className: 'sentence-row' }, [
            preview,
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(this.currentSentence.text, 0.5)),
        ]);

        // Teacher-only peek at every sentence in the session — hidden by
        // default, since the child can't rely on reading it anymore, but
        // the educator still needs to know it to help.
        const revealBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: '🔒 Πρόταση (δάσκαλος)',
            onClick: () => this.showSentenceList(),
        });

        // Drop zones
        const dropContainer = el('div', { className: 'drop-zone-container', id: 'drop-zones' });
        words.forEach((w, i) => {
            const zone = el('div', {
                className: 'drop-zone',
                'data-index': String(i),
                'data-word': w,
                id: `drop-zone-${i}`,
            });
            dropContainer.appendChild(zone);
        });

        // Scrambled draggable words — a genuine shuffle can land back on
        // the original order by pure chance (50% of the time for a
        // 2-word sentence!), which hands the child an already-solved
        // puzzle. Force a swap when that happens so the tiles are never
        // identical to the correct order.
        const scrambled = Phono.data.shuffle(words.map((w, i) => ({ word: w, origIndex: i })));
        if (scrambled.length > 1 && scrambled.every((item, i) => item.origIndex === i)) {
            [scrambled[0], scrambled[1]] = [scrambled[1], scrambled[0]];
        }
        const dragContainer = el('div', { className: 'draggable-items', id: 'drag-items' });
        scrambled.forEach((item, i) => {
            const drag = el('div', {
                className: 'draggable-item',
                textContent: item.word,
                'data-word': item.word,
                id: `drag-item-${i}`,
            });
            dragContainer.appendChild(drag);
        });

        const area = el('div', { className: 'drag-area' }, [instruction, previewRow, revealBtn, dropContainer, dragContainer]);
        this.container.appendChild(area);

        // Speak the sentence — no written preview to hide anymore.
        Phono.audio.speak(this.currentSentence.text, 0.5);

        // Init drag & drop
        setTimeout(() => {
            Phono.dragDrop.init('#drag-items', '.draggable-item', '.drop-zone', (dragEl, dropZone) => {
                this.handleDrop(dragEl, dropZone);
            });
        }, 100);
    },

    /** Teacher-only sentence list for the whole session, as a fixed
     * overlay (not inline content) so it never pushes the page around,
     * and attached to #app rather than this.container since the game
     * area sits inside the .fade-in screen, whose `transform` would
     * otherwise break a fixed-position child's positioning. */
    showSentenceList() {
        const { el } = Phono.helpers;
        const close = () => overlay.remove();

        const list = el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', textAlign: 'left' } });
        this.roundSentences.forEach((s, i) => {
            const isCurrent = i === Phono.engine.currentRound;
            list.appendChild(el('div', {
                style: {
                    padding: 'var(--space-xs) var(--space-sm)', borderRadius: 'var(--radius-md)',
                    background: isCurrent ? 'var(--primary-light)' : 'transparent',
                    fontWeight: isCurrent ? '800' : '600',
                },
                textContent: `${i + 1}. ${s.text}`,
            }));
        });

        const overlay = el('div', {
            className: 'teacher-note-overlay',
            onClick: (e) => { if (e.target === overlay) close(); },
        }, [
            el('div', { className: 'teacher-note-card' }, [
                el('div', { className: 'teacher-note-title', textContent: '🔒 Προτάσεις της συνεδρίας' }),
                el('p', {
                    textContent: 'Σημείωσε τις προτάσεις ή βγάλε τις φωτογραφία για να τις διαβάζεις στο παιδί.',
                    style: { color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' },
                }),
                list,
                el('button', { className: 'btn btn-primary', textContent: 'Κατάλαβα', onClick: close, style: { marginTop: 'var(--space-lg)' } }),
            ]),
        ]);
        document.getElementById('app').appendChild(overlay);
    },

    handleDrop(dragEl, dropZone) {
        const dragWord = dragEl.getAttribute('data-word');
        const zoneIndex = parseInt(dropZone.getAttribute('data-index'));
        const expectedWord = dropZone.getAttribute('data-word');

        if (dropZone.classList.contains('filled')) return;

        if (dragWord === expectedWord) {
            // Correct placement
            dropZone.textContent = dragWord;
            dropZone.classList.add('filled', 'correct');
            dragEl.classList.add('placed');
            this.placedWords[zoneIndex] = dragWord;
            Phono.audio.playSfx('pop');

            // Check if all placed
            if (this.placedWords.every(w => w !== null)) {
                Phono.feedback.showCorrect();
                Phono.engine.recordCorrect();
                setTimeout(() => this.nextOrComplete(), 1200);
            }
        } else {
            // Wrong placement
            Phono.feedback.highlightElement(dropZone, false);
            Phono.audio.playSfx('wrong');
        }
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('sentenceBuilder', this.levelInfo.id);
        }
    },
};

/** Shuffle words until the order differs from the original — used so the
 * "scrambled order" distractor in wordDeletion never accidentally matches
 * the correct answer. */
function wordDeletionShuffleDifferent(words) {
    if (words.length < 2) return words.slice();
    let shuffled = Phono.data.shuffle(words);
    let attempts = 0;
    while (shuffled.join(' ') === words.join(' ') && attempts < 10) {
        shuffled = Phono.data.shuffle(words);
        attempts++;
    }
    return shuffled;
}

/** Pre-selects every sentence for the whole session up front — same
 * reasoning as level1BuildWordPositionSentences — so the teacher's
 * reveal panel can list every sentence and what's being erased before
 * play even starts, instead of only the current round's. */
function level1BuildWordDeletionSentences(totalRounds) {
    const used = [];
    const sentences = [];
    for (let round = 0; round < totalRounds; round++) {
        const tier = level1TierForRound(round, totalRounds);
        const stage = tier === 1 ? 'A' : tier === 2 ? 'B' : 'C';
        const matchesStage = s => stage === 'C' ? s.words.length === 3 : (s.words.length >= 3 && s.words.length <= 4);

        const selPool = Phono.data.getSentencePool();
        const pool = selPool.filter(s => matchesStage(s) && !used.includes(s.text));
        const stagePool = selPool.filter(matchesStage);
        // Third-tier fallback ignores the teacher's selection entirely —
        // needed since a narrow selection could have nothing at all
        // matching this round's stage yet.
        const available = pool.length > 0 ? pool : (stagePool.length > 0 ? stagePool : Phono.data.sentences.filter(matchesStage));
        const sentence = Phono.data.getRandom(available);
        used.push(sentence.text);
        sentences.push(sentence);
    }
    return sentences;
}

/* ===========================================
   GAME: wordDeletion — "Πες την χωρίς μια λέξη"
   Introduces the DELETION operation on easy material (whole words) —
   the same rule the child later applies to a syllable (Level 2) and a
   phoneme (Level 5).
   =========================================== */
Phono.games.wordDeletion = {
    container: null,
    levelInfo: null,
    createVoiceToggle: null,
    createRepeatButton: null,
    currentSentence: null,
    targetIndex: 0,
    roundSentences: [],
    answered: false,

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        // Whole session picked up front (not per-round) so the teacher's
        // sentence list can show every sentence for the round right away
        // — same reasoning as sentenceBuilder's roundSentences.
        this.roundSentences = level1BuildWordDeletionSentences(Phono.engine.totalRounds);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';
        this.answered = false;

        // Progressive difficulty: stage A removes the LAST word (easiest)
        // -> B removes the FIRST word -> C removes the MIDDLE word
        // (hardest) — same escalation order as the syllable/phoneme
        // removal games this stage is meant to lead into.
        const tier = Phono.engine.getDifficultyTier();
        const stage = tier === 1 ? 'A' : tier === 2 ? 'B' : 'C';

        this.currentSentence = this.roundSentences[Phono.engine.currentRound];

        const words = this.currentSentence.words;
        this.targetIndex = stage === 'A' ? words.length - 1 : stage === 'B' ? 0 : 1;
        const targetWord = words[this.targetIndex];

        const instruction = el('p', {
            className: 'game-instruction',
            id: 'worddel-instruction',
            innerHTML: `Πες την πρόταση χωρίς το <strong style="text-decoration: underline;">${targetWord.toUpperCase()}</strong>!`,
        });
        const instructionRow = el('div', { className: 'sentence-row' }, [
            instruction,
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(this.currentSentence.text, 0.65)),
        ]);

        // Teacher-only peek at every sentence in the session and exactly
        // what's being erased each round — the choice cards eventually
        // show the answer among distractors, but the teacher shouldn't
        // have to guess which one is correct.
        const revealBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: '🔒 Προτάσεις (δάσκαλος)',
            onClick: () => this.showSentenceList(),
        });

        // Word boxes — one per word; the target box "erases" once the
        // intro sentence finishes playing (matches syllableRemoval /
        // phonemeDeletion's removal animation).
        const boxesDiv = el('div', { className: 'syllable-boxes', id: 'worddel-boxes' });
        words.forEach((w, i) => {
            boxesDiv.appendChild(el('div', {
                className: `syllable-box ${i === this.targetIndex ? 'active' : ''}`,
                textContent: w,
                'data-index': String(i),
            }));
        });

        // Choices: the correct removal, a wrong-word removal, and the
        // right words but in scrambled order.
        const correctWords = words.filter((_, i) => i !== this.targetIndex);
        const correctText = correctWords.join(' ');

        const otherIndices = words.map((_, i) => i).filter(i => i !== this.targetIndex);
        const wrongRemoveIndex = Phono.data.getRandom(otherIndices);
        const wrongRemovalText = words.filter((_, i) => i !== wrongRemoveIndex).join(' ');

        const scrambledText = wordDeletionShuffleDifferent(correctWords).join(' ');

        const choices = Phono.data.shuffle([
            { text: correctText, correct: true },
            { text: wrongRemovalText, correct: false },
            { text: scrambledText, correct: false },
        ]);

        // No emoji on these cards — same reasoning as wordPosition's
        // choice cards: the choice IS the sentence text, so a 72px
        // decorative "🔊" was pure wasted vertical space.
        const choicesGrid = el('div', { className: 'choices-grid' });
        choices.forEach(choice => {
            const card = el('div', { className: 'choice-card', onClick: () => this.checkAnswer(card) }, [
                el('span', { className: 'choice-word', textContent: choice.text }),
            ]);
            card._correct = choice.correct;
            card._text = choice.text;
            choicesGrid.appendChild(card);
        });

        const footer = el('div', { className: 'round-footer', id: 'worddel-footer' });

        this.container.appendChild(el('div', { className: 'tap-area compact-tap-area' }, [instructionRow, revealBtn, boxesDiv, choicesGrid, footer]));

        // Read the full sentence once, then erase the target word's box.
        // The REST of the sentence can't stay on screen after that, though
        // — those boxes spell out the exact answer to the multiple-choice
        // question below. So a second beat later, hide the whole sentence
        // and shake the instruction to pull the child's focus back to it,
        // forcing them to answer from memory instead of just reading it.
        Phono.audio.speak(this.currentSentence.text, 0.65).then(() => {
            const boxesEl = document.getElementById('worddel-boxes');
            const box = boxesEl ? boxesEl.querySelectorAll('.syllable-box')[this.targetIndex] : null;
            if (box) {
                box.classList.add('removing');
                Phono.audio.playSfx('pop');
                setTimeout(() => {
                    box.style.visibility = 'hidden';

                    setTimeout(() => {
                        // visibility (not just opacity) — some mobile
                        // browsers don't reliably run the opacity
                        // transition here, leaving the rest of the
                        // sentence visible instead of hiding with the
                        // target box.
                        if (boxesEl) { boxesEl.style.opacity = '0'; boxesEl.style.visibility = 'hidden'; }
                        const instructionEl = document.getElementById('worddel-instruction');
                        if (instructionEl) instructionEl.classList.add('shake-attention');
                    }, 150);
                }, 800);
            }
        });
    },

    /** Teacher-only sentence list for the WHOLE session, not just the
     * current round — same reasoning and fixed-overlay pattern as
     * wordPosition.showSentenceList. */
    showSentenceList() {
        const { el } = Phono.helpers;
        const close = () => overlay.remove();
        const total = this.roundSentences.length;

        const list = el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', textAlign: 'left' } });
        this.roundSentences.forEach((s, i) => {
            const isCurrent = i === Phono.engine.currentRound;
            const tier = level1TierForRound(i, total);
            const stage = tier === 1 ? 'A' : tier === 2 ? 'B' : 'C';
            const words = s.words;
            const targetIndex = stage === 'A' ? words.length - 1 : stage === 'B' ? 0 : 1;
            const targetWord = words[targetIndex];
            const correctText = words.filter((_, wi) => wi !== targetIndex).join(' ');
            list.appendChild(el('div', {
                style: {
                    padding: 'var(--space-xs) var(--space-sm)', borderRadius: 'var(--radius-md)',
                    background: isCurrent ? 'var(--primary-light)' : 'transparent',
                    fontWeight: isCurrent ? '800' : '600',
                },
            }, [
                el('div', { textContent: `${i + 1}. ${s.text}` }),
                el('div', { textContent: `χωρίς «${targetWord}» → ${correctText}`, style: { color: 'var(--text-secondary)', fontWeight: '600' } }),
            ]));
        });

        const overlay = el('div', {
            className: 'teacher-note-overlay',
            onClick: (e) => { if (e.target === overlay) close(); },
        }, [
            el('div', { className: 'teacher-note-card' }, [
                el('div', { className: 'teacher-note-title', textContent: '🔒 Προτάσεις της συνεδρίας' }),
                el('p', {
                    textContent: 'Σημείωσε τις προτάσεις ή βγάλε τις φωτογραφία για να τις διαβάζεις στο παιδί.',
                    style: { color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' },
                }),
                list,
                el('button', { className: 'btn btn-primary', textContent: 'Κατάλαβα', onClick: close, style: { marginTop: 'var(--space-lg)' } }),
            ]),
        ]);
        document.getElementById('app').appendChild(overlay);
    },

    checkAnswer(cardEl) {
        if (this.answered || cardEl.classList.contains('disabled')) return;

        Phono.audio.speak(cardEl._text, 0.7);

        if (cardEl._correct) {
            this.answered = true;
            document.querySelectorAll('.choice-card').forEach(c => c.classList.add('disabled'));
            cardEl.classList.add('correct');
            Phono.feedback.showCorrect();
            Phono.engine.recordCorrect();
            setTimeout(() => this.showNextButton(), 1200);
            return;
        }

        // Wrong pick: don't reveal the correct one — just disable this
        // card and let them try one of the others.
        cardEl.classList.add('wrong', 'disabled');
        Phono.feedback.showWrong();
    },

    showNextButton() {
        const { el } = Phono.helpers;
        const footer = document.getElementById('worddel-footer');
        if (!footer) return;
        footer.innerHTML = '';
        footer.appendChild(el('button', {
            className: 'btn btn-primary',
            textContent: 'Επόμενο ▶',
            onClick: () => this.nextOrComplete(),
        }));
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('wordDeletion', this.levelInfo.id);
        }
    },
};
