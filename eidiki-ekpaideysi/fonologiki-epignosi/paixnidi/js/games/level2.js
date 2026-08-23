/* ============================================================
   LEVEL 2 — Συλλαβές
   Games: syllableCounting, syllableSynthesis,
          syllableSplit, syllableRemoval

   Κοινοί κανόνες αυτού του επιπέδου (ισχύουν σε κάθε δραστηριότητα):
     1. Ήχος πριν το κείμενο — κάθε ερέθισμα ακούγεται πρώτα
        (Phono.audio.speak / speakSyllables, lang el-GR), με 🔊 επανάληψη.
        Εξαίρεση: το "Ένωσε τις Συλλαβές" δεν έχει καθόλου ήχο από την
        εφαρμογή — τις συλλαβές τις λέει ο ίδιος ο εκπαιδευτικός, αφού
        δει όλες τις λέξεις της συνεδρίας από το "🔒 Λέξεις (δάσκαλος)".
     2. Κάθε προσπάθεια καταγράφεται στο Phono.sessionLog.
     3. Όλα τα ερεθίσματα τραβιούνται από τον ενιαίο πίνακα
        Phono.data.wordsL2 (js/words_l2.js), φιλτραρισμένα κατά stage.
   ============================================================ */
window.Phono = window.Phono || {};
Phono.games = Phono.games || {};

/* ===========================================
   GAME 1: syllableCounting — "Μέτρα τις Συλλαβές"
   =========================================== */
Phono.games.syllableCounting = {
    container: null,
    levelInfo: null,
    currentWord: null,
    roundWords: [],
    tapCount: 0,
    answered: false,
    hardMode: false,

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        try {
            this.hardMode = localStorage.getItem('phono_syllableCountingHardMode') === '1';
        } catch (e) {
            this.hardMode = false;
        }
        // Whole-session plan (not per-round math) — see
        // level2BuildSyllablePlan for why: computing each round's target
        // independently still let long runs of the same value happen by
        // chance (e.g. 4 two-syllable words in a row). Planning the full
        // sequence up front lets us actively break those runs up.
        this.syllablePlan = level2BuildSyllablePlan(Phono.engine.totalRounds);
        // The actual WORDS are planned up front too (not just the target
        // counts above) so the teacher's word list can show every word
        // for the round right away — same reasoning as syllableSplit's
        // roundWords.
        this.roundWords = level2BuildSyllableCountingWords(Phono.engine.totalRounds, this.syllablePlan);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';
        this.tapCount = 0;
        this.answered = false;

        this.currentWord = this.roundWords[Phono.engine.currentRound];
        const correct = this.currentWord.syllables.length;

        const instruction = el('p', { className: 'game-instruction', textContent: 'Χτύπα για κάθε συλλαβή της λέξης!' });
        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: this.currentWord.emoji });

        // The written word stays hidden by default (common rule #2) — only
        // the picture + audio identify it. The therapist can still peek
        // via the lock button below, independent of the toggle.
        const wordRow = el('div', { className: 'sentence-row' }, [
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(this.currentWord.word)),
        ]);
        const revealBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: '🔒 Λέξεις (δάσκαλος)',
            onClick: () => this.showWordList(),
        });
        const modeBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: this.hardMode ? '🙈 Δύσκολο (κρυφές τελείες)' : '👁️ Εύκολο (ορατές τελείες)',
            title: 'Εναλλαγή: οι τελείες μέτρησης κρύβονται μόλις χτυπήσει, μετράει από μνήμη',
            onClick: () => {
                this.hardMode = !this.hardMode;
                try { localStorage.setItem('phono_syllableCountingHardMode', this.hardMode ? '1' : '0'); } catch (e) { /* ignore */ }
                this.loadRound();
            },
        });

        const counterDiv = el('div', { className: 'tap-counter-dots', id: 'tap-counter' });
        const tapBtn = el('button', {
            className: 'tap-button',
            textContent: '🥁',
            id: 'tap-btn',
            onClick: () => this.handleTap(),
        });

        // Lets the child fix a miscount without restarting the whole
        // round — hidden until the first tap, same as the answer choices.
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

        // Pre-build answer choices (hidden until first tap)
        const checkArea = el('div', { className: 'clap-check-area', id: 'check-area', style: { display: 'none' } });
        const label = el('p', { className: 'game-instruction', textContent: 'Πόσες φορές χτύπησες; Πάτησε τον αριθμό!', style: { fontSize: 'var(--text-lg)' } });
        const choicesDiv = el('div', { className: 'clap-number-choices' });
        for (let i = 1; i <= 5; i++) {
            choicesDiv.appendChild(el('button', {
                className: 'number-choice-btn',
                textContent: String(i),
                onClick: (e) => {
                    if (this.answered) return;

                    // The number picked has to match how many times the
                    // child actually tapped — otherwise the tapping isn't
                    // really doing the counting, they're just guessing a
                    // number. Doesn't disable the button: they can fix
                    // their tap count (undo/reset) and pick it again.
                    if (i !== this.tapCount) {
                        Phono.feedback.showWrong();
                        return;
                    }

                    Phono.sessionLog.record('syllableCounting', this.currentWord.word, String(i), i === correct);

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

        this.container.appendChild(el('div', { className: 'tap-area compact-tap-area' }, [
            instruction, emojiDiv, wordRow,
            el('div', { className: 'sentence-row' }, [revealBtn, modeBtn]),
            counterDiv, tapBtn, tapControls, checkArea,
        ]));
        Phono.audio.speak(this.currentWord.word);
    },

    /** Teacher-only word list for the WHOLE session, not just the current
     * round — same reasoning and fixed-overlay pattern as
     * syllableSynthesis.showWordList. */
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
                el('span', { textContent: `${w.syllables.join('-')} (${w.syllables.length})`, style: { color: 'var(--text-secondary)' } }),
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

    handleTap() {
        if (this.answered) return;
        const { el } = Phono.helpers;
        this.tapCount++;
        Phono.audio.playSfx('tap');

        const btn = document.getElementById('tap-btn');
        btn.classList.add('tapped');
        setTimeout(() => btn.classList.remove('tapped'), 300);

        // "Δύσκολο" mode: the dot is still added (undo/reset rely on it
        // being a real DOM node to remove), but stays invisible — the
        // child has to remember the count instead of reading it off the
        // row of dots.
        const counter = document.getElementById('tap-counter');
        const dot = el('div', { className: 'tap-dot' });
        if (this.hardMode) dot.style.visibility = 'hidden';
        counter.appendChild(dot);

        // Show answer choices + reset/undo controls after the first tap
        // (the child can keep tapping, or fix a miscount, before answering)
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
            Phono.app.onGameComplete('syllableCounting', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 2: syllableSynthesis — "Ένωσε τις Συλλαβές"
   No audio from the app at all — the educator says the syllables out
   loud themselves (paced however suits the child), and the child picks
   which picture/word they spell out.
   =========================================== */
Phono.games.syllableSynthesis = {
    container: null,
    levelInfo: null,
    currentWord: null,
    roundWords: [],
    answered: false,

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        // Whole session picked up front (not per-round) so the teacher's
        // word list can show every word for the round right away —
        // same reasoning as syllableSplit's roundWords below.
        this.roundWords = level2BuildSyllableSynthesisWords(Phono.engine.totalRounds);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';
        this.answered = false;

        this.currentWord = this.roundWords[Phono.engine.currentRound];

        // Distractors are picked live against the current tier's stage
        // pool (matches tierForRound's formula for this same round
        // number, so it's the same pool the word itself would have come
        // from) — only the target WORD needed to be planned up front for
        // the teacher's list, not the whole distractor set.
        const tier = Phono.engine.getDifficultyTier();
        const stage = Phono.data.wordsL2StageForTier(tier);
        const stagePool = Phono.data.wordsL2UpToStage(stage).filter(w => w.imageable);

        const instruction = el('p', { className: 'game-instruction', textContent: 'Άκουσε τις συλλαβές που θα πει ο εκπαιδευτικός. Ποια λέξη είναι;' });

        const controlsRow = el('div', { className: 'sentence-row' }, [
            el('button', {
                className: 'btn btn-secondary btn-small',
                textContent: '🔒 Λέξεις (δάσκαλος)',
                onClick: () => this.showWordList(),
            }),
        ]);

        // Choices: the target + up to 3 meaningful distractors (shares a
        // first syllable/sound and/or syllable count) — see
        // Phono.data.wordsL2GetDistractors. Only imageable=true words
        // ever appear here, both as target and distractor, since a
        // picture that doesn't name itself unambiguously would make the
        // choice cards themselves ambiguous.
        const distractors = Phono.data.wordsL2GetDistractors(this.currentWord, 3, stagePool);
        const choices = Phono.data.shuffle([
            Object.assign({}, this.currentWord, { correct: true }),
            ...distractors.map(d => Object.assign({}, d, { correct: false })),
        ]);

        const choicesGrid = el('div', { className: 'choices-grid' });
        choices.forEach(choice => {
            const card = el('div', { className: 'choice-card', onClick: () => this.checkAnswer(card) }, [
                el('span', { className: 'choice-emoji', textContent: choice.emoji }),
                el('span', { className: 'choice-word', textContent: choice.word }),
            ]);
            card._correct = choice.correct;
            card._word = choice.word;
            choicesGrid.appendChild(card);
        });

        const footer = el('div', { className: 'round-footer', id: 'sylsynth-footer' });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, controlsRow, choicesGrid, footer]));
    },

    /** Teacher-only word list for the WHOLE session, not just the current
     * round — the educator is the one saying the syllables out loud (no
     * app audio here at all), so they need every word up front to note
     * down or photograph before starting, not discover them one at a
     * time. Same fixed-overlay pattern as syllableSplit.showWordList. */
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
                el('span', { textContent: w.syllables.join('-'), style: { color: 'var(--text-secondary)' } }),
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

    checkAnswer(cardEl) {
        if (this.answered || cardEl.classList.contains('disabled')) return;

        const isCorrect = cardEl._correct;
        Phono.sessionLog.record('syllableSynthesis', this.currentWord.syllables.join('-'), cardEl._word, isCorrect);

        if (isCorrect) {
            this.answered = true;
            document.querySelectorAll('.choice-card').forEach(c => c.classList.add('disabled'));
            cardEl.classList.add('correct');
            Phono.feedback.showCorrect();
            Phono.engine.recordCorrect();
            this.showSyllableReveal();
            return;
        }

        // Wrong pick: don't reveal the correct one — just disable this
        // card and let them try one of the others.
        cardEl.classList.add('wrong', 'disabled');
        Phono.feedback.showWrong();
    },

    /** After a correct answer, break the word into syllable "bubbles"
     * (same phoneme-display visual used elsewhere in the app) as a
     * positive confirmation of what they just blended — never shown
     * before the child answers, only as the reveal afterward. */
    showSyllableReveal() {
        const { el } = Phono.helpers;
        const footer = document.getElementById('sylsynth-footer');
        if (!footer) return;
        footer.innerHTML = '';

        const syllableDisplay = el('div', { className: 'phoneme-display' });
        this.currentWord.syllables.forEach((syl, i) => {
            if (i > 0) syllableDisplay.appendChild(el('span', { className: 'phoneme-separator visible', textContent: '—' }));
            const bubble = el('div', {
                className: 'phoneme-bubble consonant',
                textContent: syl,
                style: { width: 'auto', padding: '0 16px', minWidth: '50px' },
            });
            syllableDisplay.appendChild(bubble);
            setTimeout(() => bubble.classList.add('visible'), 200 + i * 300);
        });
        footer.appendChild(syllableDisplay);

        const nextDelay = 900 + this.currentWord.syllables.length * 300;
        setTimeout(() => this.showNextButton(), nextDelay);
    },

    showNextButton() {
        const { el } = Phono.helpers;
        const footer = document.getElementById('sylsynth-footer');
        if (!footer) return;
        footer.appendChild(el('button', {
            className: 'btn btn-primary',
            textContent: 'Επόμενο ▶',
            style: { marginTop: 'var(--space-md)' },
            onClick: () => this.nextOrComplete(),
        }));
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('syllableSynthesis', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 3: syllableSplit — "Κόψε τη Λέξη"
   The child drags syllable tiles into a single growing collection area,
   IN ORDER — the number of syllables is never given away up front (no
   empty boxes pre-drawn), and one tile in the scramble is a trap that
   doesn't belong to the word at all.
   =========================================== */
Phono.games.syllableSplit = {
    container: null,
    levelInfo: null,
    createVoiceToggle: null,
    createRepeatButton: null,
    currentWord: null,
    roundWords: [],
    nextIndex: 0,

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        // Whole session picked up front (not per-round) so the teacher's
        // reveal panel can show every word for the round right away.
        this.roundWords = level2BuildSyllableSplitWords(Phono.engine.totalRounds);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';
        this.nextIndex = 0;

        this.currentWord = this.roundWords[Phono.engine.currentRound];

        const instruction = el('p', { className: 'game-instruction', textContent: 'Σύρε τις συλλαβές με τη σωστή σειρά για να φτιάξεις τη λέξη!' });
        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: this.currentWord.emoji });
        const wordRow = el('div', { className: 'sentence-row' }, [
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(this.currentWord.word)),
        ]);

        const controlsRow = el('div', { className: 'sentence-row' }, [
            el('button', {
                className: 'btn btn-secondary btn-small',
                textContent: '🔒 Λέξεις (δάσκαλος)',
                onClick: () => this.showWordList(),
            }),
        ]);

        // Collection area: starts empty, no placeholder slots — a syllable
        // box only appears once the child has actually placed the piece
        // that belongs there, so the number of syllables is never given
        // away in advance. The single .drop-zone here is the only target
        // Phono.dragDrop needs to know about (order is enforced in
        // handleDrop, not by separate per-index zones).
        const collectedRow = el('div', { className: 'syllable-boxes', id: 'syl-collected' });
        const dropZone = el('div', { className: 'drop-zone syl-drop-target', id: 'syl-drop-target' }, [
            el('span', { className: 'drop-zone-hint', textContent: 'Άφησε εδώ' }),
        ]);

        // Scrambled tiles: every real syllable, PLUS one trap syllable
        // that never belongs anywhere in this word — it simply never
        // matches whatever the "next expected" syllable is, so it always
        // bounces back, no special-case handling needed in handleDrop.
        const realTiles = this.currentWord.syllables.map((s, i) => ({ syllable: s, isTrap: false, origIndex: i }));
        const trapTile = { syllable: this.currentWord.splitTrap, isTrap: true, origIndex: -1 };
        const scrambled = Phono.data.shuffle([...realTiles, trapTile]);

        const dragContainer = el('div', { className: 'draggable-items', id: 'syl-drag-items' });
        scrambled.forEach((item, i) => {
            dragContainer.appendChild(el('div', {
                className: 'draggable-item',
                textContent: item.syllable,
                'data-syllable': item.syllable,
                'data-trap': item.isTrap ? '1' : '0',
                id: `syl-drag-${i}`,
            }));
        });

        this.container.appendChild(el('div', { className: 'drag-area' }, [
            instruction, emojiDiv, wordRow, controlsRow, collectedRow, dropZone, dragContainer,
        ]));
        Phono.audio.speak(this.currentWord.word);

        setTimeout(() => {
            Phono.dragDrop.init('#syl-drag-items', '.draggable-item', '.drop-zone', (dragEl, dropZoneEl) => {
                this.handleDrop(dragEl, dropZoneEl);
            });
        }, 100);
    },

    /** Teacher-only word list for the whole session — same fixed-overlay
     * pattern as before, attached to #app. */
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
                el('span', { textContent: `${w.syllables.join('-')} (παγίδα: ${w.splitTrap})`, style: { color: 'var(--text-secondary)' } }),
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

    handleDrop(dragEl, dropZoneEl) {
        const { el } = Phono.helpers;
        const dragSyl = dragEl.getAttribute('data-syllable');
        const expected = this.currentWord.syllables[this.nextIndex];

        if (dragSyl === expected) {
            // Correct next syllable, in order.
            const collected = document.getElementById('syl-collected');
            collected.appendChild(el('div', { className: 'syllable-box filled correct', textContent: dragSyl }));
            dragEl.remove();
            Phono.audio.playSfx('pop');
            this.nextIndex++;

            if (this.nextIndex >= this.currentWord.syllables.length) {
                Phono.sessionLog.record('syllableSplit', this.currentWord.word, this.currentWord.syllables.join('-'), true);
                Phono.feedback.showCorrect();
                Phono.engine.recordCorrect();
                setTimeout(() => this.nextOrComplete(), 1200);
            }
        } else {
            // Wrong syllable for this position — includes the trap tile
            // (never matches anything) and a right syllable placed out of
            // order. Bounces back without adding a box; logged as a miss
            // against the still-in-progress word.
            Phono.sessionLog.record('syllableSplit', this.currentWord.word, dragSyl, false);
            Phono.feedback.highlightElement(dropZoneEl, false);
            Phono.audio.playSfx('wrong');
        }
    },

    nextOrComplete() {
        if (Phono.engine.nextRound()) {
            Phono.app.updateGameProgress();
            this.loadRound();
        } else {
            Phono.app.onGameComplete('syllableSplit', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 4: syllableRemoval — "Τι Μένει;"
   Progression: last syllable removed first (easiest — the remaining
   chunk is still contiguous and familiar), then first, then middle
   (hardest — the two leftover pieces have to be mentally rejoined).
   =========================================== */
Phono.games.syllableRemoval = {
    container: null,
    levelInfo: null,
    currentItem: null,
    roundItems: [],

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        // Whole session picked up front (not per-round) so the teacher's
        // word list can show every item for the round right away — same
        // reasoning as syllableSplit's roundWords.
        this.roundItems = level2BuildSyllableRemovalItems(Phono.engine.totalRounds);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        this.currentItem = this.roundItems[Phono.engine.currentRound];
        const removedSyllable = this.currentItem.syllables[this.currentItem.removeIndex];
        const instruction = el('p', {
            className: 'game-instruction',
            id: 'sylremoval-instruction',
            innerHTML: `Αν αφαιρέσω τη συλλαβή <strong>"${removedSyllable}"</strong> τι μένει;`,
        });

        // wordsL2 entries always have an emoji (syllableRemovalL2 is
        // hand-curated from imageable words only), but fall back to a
        // neutral icon just in case a future entry doesn't.
        const wordMeta = Phono.data.wordsL2.find(w => w.word === this.currentItem.word);
        const emojiRow = el('div', { className: 'sentence-row' }, [
            el('span', { className: 'game-main-emoji', textContent: (wordMeta && wordMeta.emoji) || '🔤' }),
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(this.currentItem.word)),
        ]);

        const controlsRow = el('div', { className: 'sentence-row' }, [
            el('button', {
                className: 'btn btn-secondary btn-small',
                textContent: '🔒 Λέξεις (δάσκαλος)',
                onClick: () => this.showWordList(),
            }),
        ]);

        // Syllable boxes
        const boxesDiv = el('div', { className: 'syllable-boxes', id: 'syl-boxes' });
        this.currentItem.syllables.forEach((syl, i) => {
            boxesDiv.appendChild(el('div', {
                className: `syllable-box ${i === this.currentItem.removeIndex ? 'active' : ''}`,
                textContent: syl,
                'data-index': String(i),
            }));
        });

        // Choices: the correct residue + the 2 hand-picked distractors
        // (one "removed the wrong syllable", one "right syllables, wrong
        // order") — curated per word in syllableRemovalL2 rather than
        // generated, since an auto-generated residue risks accidentally
        // spelling something inappropriate (see the QA note in
        // words_l2.js).
        const allChoices = Phono.data.shuffle([
            { text: this.currentItem.remaining, isCorrect: true },
            ...this.currentItem.distractors.map(d => ({ text: d, isCorrect: false })),
        ]);

        const choicesGrid = el('div', { className: 'choices-grid', id: 'removal-choices', style: { display: 'none' } });
        allChoices.forEach(choice => {
            const card = el('div', {
                className: 'choice-card',
                onClick: () => this.checkAnswer(choice.isCorrect, choice.text, card),
            }, [el('span', { className: 'choice-word', textContent: choice.text, style: { fontSize: 'var(--text-2xl)' } })]);
            choicesGrid.appendChild(card);
        });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, emojiRow, controlsRow, boxesDiv, choicesGrid]));

        Phono.audio.speak(this.currentItem.word);

        // Animate removal after 1.5s, then hide the rest of the word too
        // (those boxes would otherwise spell out the exact answer) —
        // same two-stage reveal/hide used by wordDeletion in level1.js.
        setTimeout(() => {
            const boxesEl = document.getElementById('syl-boxes');
            const removeBox = boxesEl ? boxesEl.querySelector(`.syllable-box[data-index="${this.currentItem.removeIndex}"]`) : null;
            if (removeBox) {
                removeBox.classList.add('removing');
                Phono.audio.playSfx('pop');
                setTimeout(() => {
                    removeBox.style.visibility = 'hidden';
                    const choices = document.getElementById('removal-choices');
                    if (choices) choices.style.display = '';

                    setTimeout(() => {
                        if (boxesEl) { boxesEl.style.opacity = '0'; boxesEl.style.visibility = 'hidden'; }
                        const instructionEl = document.getElementById('sylremoval-instruction');
                        if (instructionEl) instructionEl.classList.add('shake-attention');
                        // Never speak the remaining piece here — that
                        // IS the answer the child is meant to work out.
                        // The app only ever says the original word
                        // (above); which syllable is being removed is
                        // shown in writing in the instruction, not
                        // spoken either.
                    }, 150);
                }, 800);
            }
        }, 1500);
    },

    /** Teacher-only word list for the WHOLE session, not just the current
     * round — same reasoning and fixed-overlay pattern as
     * syllableSynthesis.showWordList. */
    showWordList() {
        const { el } = Phono.helpers;
        const close = () => overlay.remove();
        const positionLabel = p => p === 'last' ? 'τελευταία' : p === 'first' ? 'πρώτη' : 'μεσαία';

        const list = el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', textAlign: 'left' } });
        this.roundItems.forEach((item, i) => {
            const isCurrent = i === Phono.engine.currentRound;
            const removedSyllable = item.syllables[item.removeIndex];
            list.appendChild(el('div', {
                style: {
                    display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)',
                    padding: 'var(--space-xs) var(--space-sm)', borderRadius: 'var(--radius-md)',
                    background: isCurrent ? 'var(--primary-light)' : 'transparent',
                    fontWeight: isCurrent ? '800' : '600',
                },
            }, [
                el('span', { textContent: `${i + 1}. ${item.word} (χωρίς "${removedSyllable}", ${positionLabel(item.position)})` }),
                el('span', { textContent: `→ ${item.remaining}`, style: { color: 'var(--text-secondary)' } }),
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

    checkAnswer(isCorrect, text, cardEl) {
        if (cardEl.classList.contains('correct') || cardEl.classList.contains('wrong')) return;

        Phono.sessionLog.record('syllableRemoval', `${this.currentItem.word} − ${this.currentItem.syllables[this.currentItem.removeIndex]}`, text, isCorrect);

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
            Phono.app.onGameComplete('syllableRemoval', this.levelInfo.id);
        }
    },
};

/**
 * Picks the word for every round of a syllableSplit session up front, so
 * the teacher's word-list reveal panel can show every word immediately.
 * Only draws from wordsL2 entries that have a splitTrap defined — that's
 * the hand-curated subset with a real trap syllable + verified stage
 * (see words_l2.js).
 */
function level2BuildSyllableSplitWords(totalRounds) {
    const trapPool = Phono.data.wordsL2.filter(w => w.splitTrap);
    const used = [];
    const words = [];
    for (let round = 0; round < totalRounds; round++) {
        const tier = tierForRound(round, totalRounds);
        const stage = Phono.data.wordsL2StageForTier(tier);
        const stagePool = trapPool.filter(w => Phono.data.wordsL2UpToStage(stage).some(s => s.word === w.word));

        const pool = stagePool.filter(w => !used.includes(w.word));
        const available = pool.length > 0 ? pool : (stagePool.length > 0 ? stagePool : trapPool);
        const word = Phono.data.getRandom(available);
        used.push(word.word);
        words.push(word);
    }
    return words;
}

/** Same up-front-planning reasoning as level2BuildSyllableSplitWords —
 * syllableSynthesis has no app audio of its own, so the educator needs
 * every round's word listed before starting, not revealed one at a
 * time. */
function level2BuildSyllableSynthesisWords(totalRounds) {
    const used = [];
    const words = [];
    for (let round = 0; round < totalRounds; round++) {
        const tier = tierForRound(round, totalRounds);
        const stage = Phono.data.wordsL2StageForTier(tier);
        const stagePool = Phono.data.wordsL2UpToStage(stage).filter(w => w.imageable);

        const pool = stagePool.filter(w => !used.includes(w.word));
        const available = pool.length > 0 ? pool : stagePool;
        const word = Phono.data.getRandom(available);
        used.push(word.word);
        words.push(word);
    }
    return words;
}

/** Replicates Phono.engine.getDifficultyTier()'s round->tier formula
 * directly (a pure function of round/total) instead of reading the
 * engine's live currentRound — needed because the whole session's words
 * are picked up front, before the engine has actually walked through
 * each round. */
function tierForRound(round, total) {
    if (round < Math.ceil(total / 3)) return 1;
    if (round < Math.ceil((2 * total) / 3)) return 2;
    return 3;
}

/**
 * Builds the full syllable-count target for every round of a
 * syllableCounting session up front, instead of computing each round's
 * target independently from just its round number. Computing it
 * per-round (a smooth "ideal" curve + a small wobble) still let long
 * runs of the same value happen purely by chance — the underlying climb
 * is itself a staircase (e.g. 2,2,2,3,3,3,3,4,4,4 for a 10-round game)
 * and a small wobble doesn't reliably break that up, so a real session
 * could still land on 4 twos in a row, then 5 threes, etc.
 *
 * Instead: figure out how many rounds SHOULD be 2/3/4 syllables overall
 * (keeping the same easy-to-hard trend), then greedily lay that bag of
 * values out round by round, at each step preferring any value that
 * wouldn't create a 3rd repeat in a row. That keeps the session trending
 * harder over time without ever feeling like predictable blocks.
 */
function level2BuildSyllablePlan(totalRounds) {
    const minSyl = 2, maxSyl = 4;
    if (totalRounds <= 0) return [];

    const counts = {};
    for (let v = minSyl; v <= maxSyl; v++) counts[v] = 0;
    for (let round = 0; round < totalRounds; round++) {
        let ideal;
        if (totalRounds <= 1) {
            ideal = maxSyl;
        } else {
            const progress = round / (totalRounds - 1);
            ideal = minSyl + progress * (maxSyl - minSyl);
        }
        const rounded = Math.max(minSyl, Math.min(maxSyl, Math.round(ideal)));
        counts[rounded]++;
    }

    const bag = [];
    for (let v = minSyl; v <= maxSyl; v++) {
        for (let i = 0; i < counts[v]; i++) bag.push(v);
    }

    const plan = [];
    let remaining = Phono.data.shuffle(bag);
    while (remaining.length > 0) {
        const wouldRepeat = v => plan.length >= 2 && plan[plan.length - 1] === v && plan[plan.length - 2] === v;
        let pickIndex = remaining.findIndex(v => !wouldRepeat(v));
        if (pickIndex === -1) pickIndex = 0; // every option repeats — rare, just take one
        plan.push(remaining[pickIndex]);
        remaining.splice(pickIndex, 1);
    }

    // 1-syllable words sit outside the 2-4 bag above and get sprinkled
    // in on top: always the very first round, plus a few more scattered
    // through the rest (never placed back-to-back with another one), so
    // kids can't just learn "1 syllable only happens first".
    if (plan.length > 0) plan[0] = 1;
    const laterIndices = [];
    for (let i = 2; i < plan.length; i++) laterIndices.push(i);
    const extraOnes = Math.max(0, Math.round(totalRounds * 0.2));
    Phono.data.shuffle(laterIndices).slice(0, extraOnes).forEach(i => {
        const prevIsOne = plan[i - 1] === 1;
        const nextIsOne = i + 1 < plan.length && plan[i + 1] === 1;
        if (!prevIsOne && !nextIsOne) plan[i] = 1;
    });

    return plan;
}

/** Turns a syllablePlan (target syllable COUNT per round, from
 * level2BuildSyllablePlan above) into actual WORD objects, one per
 * round, picked up front — same reasoning as level2BuildSyllableSplitWords:
 * the teacher's word list needs every round's word right away, not
 * revealed one at a time as loadRound() used to pick them live. */
function level2BuildSyllableCountingWords(totalRounds, syllablePlan) {
    const used = [];
    const words = [];
    for (let round = 0; round < totalRounds; round++) {
        const targetSyl = syllablePlan[round];
        let word;
        if (targetSyl === 1) {
            // 1-syllable words sit outside wordsL2's A-D stages (which
            // all start at 2 syllables) — keep drawing this one tier
            // from the small dedicated pool, same as before.
            const pool = Phono.data.oneSyllableWords.filter(w => !used.includes(w.word));
            const available = pool.length > 0 ? pool : Phono.data.oneSyllableWords;
            word = Phono.data.getRandom(available);
        } else {
            // 2+ syllables: pull from wordsL2, gated by the same
            // difficulty tier as every other Level 2 activity, so a
            // round never asks about a syllable cluster/diphthong the
            // child hasn't been introduced to yet via the easier stages.
            const tier = tierForRound(round, totalRounds);
            const stage = Phono.data.wordsL2StageForTier(tier);
            const stagePool = Phono.data.wordsL2UpToStage(stage).filter(w => w.imageable && w.syllables.length === targetSyl);
            const pool = stagePool.filter(w => !used.includes(w.word));
            const available = pool.length > 0 ? pool : (stagePool.length > 0 ? stagePool : Phono.data.wordsL2.filter(w => w.imageable && w.syllables.length === targetSyl));
            word = Phono.data.getRandom(available);
        }
        used.push(word.word);
        words.push(word);
    }
    return words;
}

/** Same up-front-planning reasoning as level2BuildSyllableSplitWords —
 * plans every round's removal item by POSITION difficulty (tier 1 ->
 * last, tier 2 -> first, tier 3 -> middle) so the teacher's word list
 * can show every item for the round right away. */
function level2BuildSyllableRemovalItems(totalRounds) {
    const used = [];
    const items = [];
    for (let round = 0; round < totalRounds; round++) {
        const tier = tierForRound(round, totalRounds);
        const position = tier === 1 ? 'last' : tier === 2 ? 'first' : 'middle';

        const pool = Phono.data.syllableRemovalL2.filter(item => item.position === position && !used.includes(item.word + item.position));
        const available = pool.length > 0 ? pool : Phono.data.syllableRemovalL2.filter(item => item.position === position);
        const item = available.length > 0 ? Phono.data.getRandom(available) : Phono.data.getRandom(Phono.data.syllableRemovalL2);
        used.push(item.word + item.position);
        items.push(item);
    }
    return items;
}
