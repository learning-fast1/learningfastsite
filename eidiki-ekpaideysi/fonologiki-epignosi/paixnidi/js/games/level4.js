/* ============================================================
   LEVEL 4 — Αρχικό & Τελικό Φώνημα
   Games: findInitialPhoneme, initialSoundMC, groupBySound,
          soundOddOneOut, findFinalPhoneme

   Κοινός κανόνας: ΗΧΟΣ ≠ ΓΡΑΜΜΑ. Όλα τα ερεθίσματα τραβιούνται από
   Phono.data.initialPhonemesL4 / finalPhonemesL4 (js/initial_phonemes_l4.js,
   js/final_phonemes_l4.js) — τράπεζες όπου το πρώτο/τελευταίο ΓΡΑΜΜΑ
   κάθε λέξης ταυτίζεται πάντα με το πρώτο/τελευταίο ΗΧΟ της (καμία
   λέξη με μπ/ντ/γκ/τσ/τζ/ξ/ψ ή δίψηφο φωνήεν στην αρχή, καμία γ+ε/ι).
   Κάθε κουμπί-ήχος παίζει τον ήχο του όταν πατιέται.
   ============================================================ */
window.Phono = window.Phono || {};
Phono.games = Phono.games || {};

/**
 * true if `letter` is allowed under the educator's Level 4 letter
 * selection. Two layers, same as everywhere else in the app: a SESSION
 * override (Phono.app.level4Letters, re-picked fresh each time the
 * teacher enters the level via renderLevel4LetterPicker) takes priority
 * when set; otherwise falls back to the PERSISTED central selection from
 * Settings ("Επιλογή Λέξεων & Προτάσεων" -> Phono.app.contentSelection.
 * level4Letters). No selection at all, at either layer, means no
 * restriction — every letter is allowed, same as before either picker
 * existed.
 */
function level4LetterAllowed(letter) {
    const selected = Phono.app.level4Letters
        || (Phono.app.contentSelection && Phono.app.contentSelection.level4Letters);
    if (!selected || selected.length === 0) return true;
    return selected.includes(letter);
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

/**
 * Tier for a given round index (1-3), independent of Phono.engine's
 * currentRound — lets the whole session's rounds be pre-planned up
 * front (round-by-round difficulty is a fixed function of round index,
 * not of how well the child is doing), so a teacher word-list overlay
 * can show every round's word, not just ones already seen. Mirrors
 * Phono.engine.getDifficultyTier()'s own formula exactly.
 */
function level4TierForRound(round, total) {
    if (round < Math.ceil(total / 3)) return 1;
    if (round < Math.ceil(2 * total / 3)) return 2;
    return 3;
}

/**
 * Speaks an isolated phoneme, not a whole word — Greek TTS reads a bare
 * single letter as its LETTER NAME ("μι", not "mmm"), so this nudges it
 * toward the actual sound instead: continuants get elongated (repeated
 * 3x, "μμμ") since they can be sustained; stops and vowels get a
 * trailing period, which reads as a short clipped sound rather than a
 * spelled-out letter name. This is a best-effort approximation, not a
 * verified-correct pronunciation — actual output depends on the
 * installed Greek voice.
 */
function level4SpeakPhoneme(phoneme, type) {
    const text = type === 'cont' ? phoneme.repeat(3) : (phoneme + '.');
    Phono.audio.speak(text, 0.75);
}

/**
 * A phoneme button: shows the letter and always speaks the phoneme
 * sound when pressed — "ΚΟΥΜΠΙΑ ΑΚΟΥΓΟΝΤΑΙ". `onClick`, if given, also
 * fires on every press (used when the button doubles as an answer
 * choice); the sound always plays regardless of whether the press was
 * right or wrong.
 */
function level4CreateSoundButton(phoneme, type, opts) {
    const { el } = Phono.helpers;
    opts = opts || {};
    const btn = el('div', {
        className: opts.className || 'choice-card',
        onClick: () => {
            level4SpeakPhoneme(phoneme, type);
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

/**
 * Picks `count` distractor phonemes for `correctPhoneme`, preferring up
 * to 2 phonologically "close" ones (same type — cont/stop/vowel — as
 * the target, e.g. σ next to ζ/φ/τ) and filling the rest randomly from
 * whatever's left, matching the spec's own example items.
 */
function level4PickPhonemeDistractors(bank, phonemeField, correctPhoneme, correctType, count) {
    const allPhonemes = Array.from(new Set(bank.map(w => w[phonemeField]))).filter(p => p !== correctPhoneme);
    const typeOf = p => { const w = bank.find(x => x[phonemeField] === p); return w ? w.type : null; };
    const sameType = allPhonemes.filter(p => typeOf(p) === correctType);
    const closePicks = Phono.data.shuffle(sameType).slice(0, Math.min(2, sameType.length));
    const remainingPool = allPhonemes.filter(p => !closePicks.includes(p));
    const fillPicks = Phono.data.shuffle(remainingPool).slice(0, Math.max(0, count - closePicks.length));
    return Phono.data.shuffle([...closePicks, ...fillPicks]);
}

/* ===========================================
   GAME 1: findInitialPhoneme — "Βρίσκω το Αρχικό Φώνημα"
   Word (picture+audio) -> 4 sound buttons. Correct = the word's own
   initial phoneme; distractors prefer 1-2 phonologically close sounds.
   =========================================== */
Phono.games.findInitialPhoneme = {
    container: null,
    levelInfo: null,
    currentWord: null,
    roundWords: [],

    init(container, levelInfo, createVoiceToggle) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.roundWords = level4BuildInitialPhonemeWords(Phono.engine.totalRounds);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        this.currentWord = this.roundWords[Phono.engine.currentRound];

        const instruction = el('p', { className: 'game-instruction', textContent: 'Από ποιο φώνημα αρχίζει η λέξη;' });

        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: this.currentWord.emoji });
        const wordRow = el('div', { className: 'sentence-row' }, [
            this.createVoiceToggle(),
            el('button', {
                className: 'btn btn-secondary btn-small',
                innerHTML: '🔊 Άκουσε',
                onClick: () => Phono.audio.speak(this.currentWord.word),
            }),
            el('button', {
                className: 'btn btn-secondary btn-small',
                textContent: '🔒 Λέξεις (δάσκαλος)',
                onClick: () => this.showWordList(),
            }),
        ]);

        const distractors = level4PickPhonemeDistractors(
            Phono.data.initialPhonemesL4, 'initial', this.currentWord.initial, this.currentWord.type, 3
        );
        const allPhonemes = Phono.data.shuffle([this.currentWord.initial, ...distractors]);

        const choicesGrid = el('div', { className: 'choices-grid' });
        allPhonemes.forEach(phoneme => {
            const meta = Phono.data.initialPhonemesL4.find(w => w.initial === phoneme);
            const isCorrect = phoneme === this.currentWord.initial;
            const card = level4CreateSoundButton(phoneme, meta ? meta.type : 'cont', {
                onClick: () => this.checkAnswer(isCorrect, card),
            });
            choicesGrid.appendChild(card);
        });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, emojiDiv, wordRow, choicesGrid]));
        Phono.audio.speak(this.currentWord.word);
    },

    /** Teacher-only word list for the WHOLE session — same fixed-overlay
     * pattern as syllableCounting.showWordList. */
    showWordList() {
        const { el } = Phono.helpers;
        const close = () => overlay.remove();

        const list = el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', textAlign: 'left' } });
        this.roundWords.forEach((w, i) => {
            const isCurrent = i === Phono.engine.currentRound;
            list.appendChild(el('div', {
                style: {
                    display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)',
                    padding: 'var(--space-xs) var(--space-sm)', borderRadius: 'var(--radius-md)',
                    background: isCurrent ? 'var(--primary-light)' : 'transparent',
                    fontWeight: isCurrent ? '800' : '600',
                },
            }, [
                el('span', { textContent: `${i + 1}. ${w.emoji} ${w.word}` }),
                el('span', { textContent: `/${w.initial}/`, style: { color: 'var(--text-secondary)' } }),
            ]));
        });

        const overlay = el('div', {
            className: 'teacher-note-overlay',
            onClick: (e) => { if (e.target === overlay) close(); },
        }, [
            el('div', { className: 'teacher-note-card' }, [
                el('div', { className: 'teacher-note-title', textContent: '🔒 Λέξεις της συνεδρίας' }),
                el('p', {
                    textContent: 'Σημείωσε τις λέξεις ή βγάλε τις φωτογραφία για να τις διαβάζεις στο παιδί.',
                    style: { color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' },
                }),
                list,
                el('button', { className: 'btn btn-primary', textContent: 'Κατάλαβα', onClick: close, style: { marginTop: 'var(--space-lg)' } }),
            ]),
        ]);
        document.getElementById('app').appendChild(overlay);
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
            Phono.app.onGameComplete('findInitialPhoneme', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 2: initialSoundMC — "Τι Αρχίζει από...;"
   A pressable, audible sound chip -> 4 pictures, find the one that
   starts with that sound.
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

        const bank = Phono.data.initialPhonemesL4.filter(w => w.imageable);
        const allPhonemes = Array.from(new Set(bank.map(w => w.initial)))
            .filter(p => Phono.data.initialPhonemesL4ByPhoneme(p).length >= 1);
        const targetPhonemes = allPhonemes.filter(level4LetterAllowed);
        const targetPool = targetPhonemes.length > 0 ? targetPhonemes : allPhonemes;
        const pool = targetPool.filter(p => !this.usedSounds.includes(p));
        const available = level4AvoidLastLetter(pool.length > 0 ? pool : targetPool, this.lastSound, p => p);
        this.currentSound = Phono.data.getRandom(available);
        this.usedSounds.push(this.currentSound);
        this.lastSound = this.currentSound;

        this.correctWord = Phono.data.getRandom(Phono.data.initialPhonemesL4ByPhoneme(this.currentSound));

        // Distractors: any imageable word whose initial phoneme is
        // different — never accidentally the same sound, since we
        // filter on the structured `initial` field, not a text guess.
        const distractorPool = bank.filter(w => w.initial !== this.currentSound);
        const distractors = [];
        const usedWords = new Set([this.correctWord.word]);
        Phono.data.shuffle(distractorPool).forEach(w => {
            if (distractors.length >= 3 || usedWords.has(w.word)) return;
            distractors.push(w);
            usedWords.add(w.word);
        });

        const allChoices = Phono.data.shuffle([
            { ...this.correctWord, correct: true },
            ...distractors.map(d => ({ ...d, correct: false })),
        ]);

        const instruction = el('p', { className: 'game-instruction', innerHTML: `Ποια εικόνα αρχίζει από αυτόν τον ήχο;` });

        const currentMeta = bank.find(w => w.initial === this.currentSound);
        const soundBtnRow = el('div', { className: 'sentence-row' }, [
            level4CreateSoundButton(this.currentSound, currentMeta ? currentMeta.type : 'cont', {
                className: 'phoneme-bubble consonant visible',
                fontSize: 'var(--text-2xl)',
            }),
        ]);

        const choicesGrid = el('div', { className: 'choices-grid' });
        allChoices.forEach(choice => {
            const card = el('div', { className: 'choice-card', onClick: () => this.checkAnswer(choice.correct, card) }, [
                el('span', { className: 'choice-emoji', textContent: choice.emoji }),
                el('span', { className: 'choice-word', textContent: choice.word }),
            ]);
            choicesGrid.appendChild(card);
        });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, soundBtnRow, choicesGrid]));
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
            Phono.app.onGameComplete('initialSoundMC', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 3: groupBySound — Sorting / Categorization
   Boards come from Phono.data.groupBySoundBoardsL4 (js/level4 data
   below) — hand-curated so every board's 3 sounds stay in the same
   type-zone. Category chips are pressable/audible with a small anchor
   picture, instead of a plain "/ν/" label that can misread as "/v/".
   =========================================== */
Phono.games.groupBySound = {
    container: null,
    levelInfo: null,
    groups: [],
    items: [],
    correctCount: 0,
    totalItems: 0,

    init(container, levelInfo) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.correctCount = 0;

        Phono.engine.totalRounds = 1;
        Phono.engine.currentRound = 0;

        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        const board = Phono.data.getRandom(Phono.data.groupBySoundBoardsL4);
        this.groups = board;

        this.items = [];
        board.forEach(group => {
            group.words.forEach(word => {
                const meta = Phono.data.initialPhonemesL4.find(w => w.word === word);
                this.items.push({ word, emoji: meta.emoji, sound: group.phoneme, type: meta.type });
            });
        });
        this.totalItems = this.items.length;
        Phono.engine.maxScore = this.totalItems;
        this.items = Phono.data.shuffle(this.items);

        const instruction = el('p', { className: 'game-instruction', textContent: 'Βάλε κάθε λέξη στη σωστή ομάδα!' });

        const categoriesDiv = el('div', { className: 'sort-categories', id: 'sort-categories' });
        board.forEach(group => {
            const anchorMeta = Phono.data.initialPhonemesL4.find(w => w.word === group.words[0]);
            const labelBtn = level4CreateSoundButton(group.phoneme, anchorMeta.type, {
                className: 'btn btn-icon',
                fontSize: 'var(--text-lg)',
            });
            const cat = el('div', {
                className: 'sort-category drop-zone',
                'data-sound': group.phoneme,
                id: `cat-${group.phoneme}`,
            }, [
                el('div', {
                    className: 'sort-category-label',
                    style: { background: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', justifyContent: 'center' },
                }, [labelBtn, el('span', { textContent: anchorMeta.emoji, style: { fontSize: '20px' } })]),
                el('div', { className: 'sort-category-items', id: `cat-items-${group.phoneme}` }),
            ]);
            categoriesDiv.appendChild(cat);
        });

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
   GAME 4: soundOddOneOut — "Ο Παρείσακτος"
   Draws from Phono.data.soundOddOneOutItemsL4 — hand-curated 3-same +
   1-different sets. Position of the odd word is reshuffled every round.
   =========================================== */
Phono.games.soundOddOneOut = {
    container: null,
    levelInfo: null,
    roundItems: [],
    currentItem: null,

    init(container, levelInfo) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.roundItems = level4BuildOddOneOutItems(Phono.engine.totalRounds);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        this.currentItem = this.roundItems[Phono.engine.currentRound];
        const sameMeta = Phono.data.initialPhonemesL4.find(w => w.word === this.currentItem.same[0]);

        const allChoices = Phono.data.shuffle([
            ...this.currentItem.same.map(word => ({ word, emoji: level4WordEmoji(word), isOdd: false })),
            { word: this.currentItem.odd, emoji: level4WordEmoji(this.currentItem.odd), isOdd: true },
        ]);

        const instruction = el('p', {
            className: 'game-instruction',
            innerHTML: `Τρεις λέξεις αρχίζουν από <strong>/${sameMeta.initial}/</strong>. Βρες αυτή που αρχίζει διαφορετικά!`,
        });

        const choicesGrid = el('div', { className: 'choices-grid' });
        allChoices.forEach(choice => {
            const card = el('div', {
                className: 'choice-card',
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

/* ===========================================
   GAME 5: findFinalPhoneme — "Βρίσκω το Τελικό Φώνημα"
   LAST card in Level 4 on purpose — the final sound is harder to
   isolate than the initial one, tackled only after every game above.
   Word (picture+audio) -> 4 sound buttons, same mechanic as
   findInitialPhoneme but built on Phono.data.finalPhonemesL4.
   =========================================== */
Phono.games.findFinalPhoneme = {
    container: null,
    levelInfo: null,
    currentWord: null,
    roundWords: [],

    init(container, levelInfo, createVoiceToggle) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.roundWords = level4BuildFinalPhonemeWords(Phono.engine.totalRounds);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        this.currentWord = this.roundWords[Phono.engine.currentRound];

        const instruction = el('p', { className: 'game-instruction', textContent: 'Σε ποιο φώνημα τελειώνει η λέξη; (Μπορεί να είναι και φωνήεν!)' });

        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: this.currentWord.emoji });
        const wordRow = el('div', { className: 'sentence-row' }, [
            this.createVoiceToggle(),
            el('button', {
                className: 'btn btn-secondary btn-small',
                innerHTML: '🔊 Άκουσε',
                onClick: () => Phono.audio.speak(this.currentWord.word),
            }),
            el('button', {
                className: 'btn btn-secondary btn-small',
                textContent: '🔒 Λέξεις (δάσκαλος)',
                onClick: () => this.showWordList(),
            }),
        ]);

        const distractors = level4PickPhonemeDistractors(
            Phono.data.finalPhonemesL4, 'final', this.currentWord.final, this.currentWord.type, 3
        );
        const allPhonemes = Phono.data.shuffle([this.currentWord.final, ...distractors]);

        const choicesGrid = el('div', { className: 'choices-grid' });
        allPhonemes.forEach(phoneme => {
            const meta = Phono.data.finalPhonemesL4.find(w => w.final === phoneme);
            const isCorrect = phoneme === this.currentWord.final;
            // Final phonemes are all sustained (vowels, or /s/ and /n/),
            // so speak them the "cont" way regardless of the bank's own
            // vowel/cons type label — no final sound here is a stop.
            const card = level4CreateSoundButton(phoneme, 'cont', {
                onClick: () => this.checkAnswer(isCorrect, card),
            });
            choicesGrid.appendChild(card);
        });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, emojiDiv, wordRow, choicesGrid]));
        Phono.audio.speak(this.currentWord.word);
    },

    /** Teacher-only word list for the WHOLE session — same fixed-overlay
     * pattern as syllableCounting.showWordList. */
    showWordList() {
        const { el } = Phono.helpers;
        const close = () => overlay.remove();

        const list = el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', textAlign: 'left' } });
        this.roundWords.forEach((w, i) => {
            const isCurrent = i === Phono.engine.currentRound;
            list.appendChild(el('div', {
                style: {
                    display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)',
                    padding: 'var(--space-xs) var(--space-sm)', borderRadius: 'var(--radius-md)',
                    background: isCurrent ? 'var(--primary-light)' : 'transparent',
                    fontWeight: isCurrent ? '800' : '600',
                },
            }, [
                el('span', { textContent: `${i + 1}. ${w.emoji} ${w.word}` }),
                el('span', { textContent: `/${w.final}/`, style: { color: 'var(--text-secondary)' } }),
            ]));
        });

        const overlay = el('div', {
            className: 'teacher-note-overlay',
            onClick: (e) => { if (e.target === overlay) close(); },
        }, [
            el('div', { className: 'teacher-note-card' }, [
                el('div', { className: 'teacher-note-title', textContent: '🔒 Λέξεις της συνεδρίας' }),
                el('p', {
                    textContent: 'Σημείωσε τις λέξεις ή βγάλε τις φωτογραφία για να τις διαβάζεις στο παιδί.',
                    style: { color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' },
                }),
                list,
                el('button', { className: 'btn btn-primary', textContent: 'Κατάλαβα', onClick: close, style: { marginTop: 'var(--space-lg)' } }),
            ]),
        ]);
        document.getElementById('app').appendChild(overlay);
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
            Phono.app.onGameComplete('findFinalPhoneme', this.levelInfo.id);
        }
    },
};

/** Pre-plans findInitialPhoneme's whole session up front (one word per
 * round, no letter/word repeated back-to-back) — same tier-by-round-index
 * and no-repeat rules loadRound() used to apply lazily, just run for every
 * round now so a teacher word-list overlay can show rounds not yet played. */
function level4BuildInitialPhonemeWords(totalRounds) {
    const words = [];
    const usedWords = [];
    let lastLetter = null;
    for (let round = 0; round < totalRounds; round++) {
        const tier = level4TierForRound(round, totalRounds);
        const bank = Phono.data.initialPhonemesL4.filter(w => w.imageable);
        const byTier = tier < 3 ? bank.filter(w => w.type !== 'stop') : bank;
        const byLetter = byTier.filter(w => level4LetterAllowed(w.initial));
        const basePool = byLetter.length > 0 ? byLetter : byTier;
        const noRepeatLetter = level4AvoidLastLetter(basePool, lastLetter, w => w.initial);
        const pool = noRepeatLetter.filter(w => !usedWords.includes(w.word));
        const available = pool.length > 0 ? pool : noRepeatLetter;
        const word = Phono.data.getRandom(available);
        words.push(word);
        usedWords.push(word.word);
        lastLetter = word.initial;
    }
    return words;
}

/** Same idea as level4BuildInitialPhonemeWords, for findFinalPhoneme —
 * picks the LETTER first each round (uniformly among distinct letters
 * available), then a word ending in it, matching loadRound()'s old logic. */
function level4BuildFinalPhonemeWords(totalRounds) {
    const words = [];
    const usedWords = [];
    let lastLetter = null;
    for (let round = 0; round < totalRounds; round++) {
        const tier = level4TierForRound(round, totalRounds);
        const bank = Phono.data.finalPhonemesL4.filter(w => w.imageable);
        const byTier = tier < 3 ? bank.filter(w => w.type === 'vowel') : bank;
        const byLetter = byTier.filter(w => level4LetterAllowed(w.final));
        const basePool = byLetter.length > 0 ? byLetter : byTier;

        const distinctLetters = Array.from(new Set(basePool.map(w => w.final)));
        const letterChoices = level4AvoidLastLetter(distinctLetters, lastLetter, l => l);
        const chosenLetter = Phono.data.getRandom(letterChoices);

        const letterPool = basePool.filter(w => w.final === chosenLetter);
        const pool = letterPool.filter(w => !usedWords.includes(w.word));
        const available = pool.length > 0 ? pool : letterPool;
        const word = Phono.data.getRandom(available);
        words.push(word);
        usedWords.push(word.word);
        lastLetter = word.final;
    }
    return words;
}

/** Words used by soundOddOneOut that intentionally aren't in the clean
 * initialPhonemesL4 bank (e.g. "γραβάτα" — a real γ-word, but starts
 * with the cluster γρ, so it doesn't belong in a "single-letter = single
 * sound" bank; it's fine here purely as a contrast word). */
const LEVEL4_ODDITY_EXTRA_EMOJI = { "γραβάτα": "👔" };
function level4WordEmoji(word) {
    const meta = Phono.data.initialPhonemesL4.find(w => w.word === word);
    if (meta) return meta.emoji;
    return LEVEL4_ODDITY_EXTRA_EMOJI[word] || "❓";
}

/** Picks the whole session's oddity items up front, same
 * reshuffle-when-exhausted pattern as level2/level3's equivalents. */
function level4BuildOddOneOutItems(totalRounds) {
    const items = [];
    let deck = [];
    for (let round = 0; round < totalRounds; round++) {
        if (deck.length === 0) deck = Phono.data.shuffle(Phono.data.soundOddOneOutItemsL4);
        items.push(deck.pop());
    }
    return items;
}
