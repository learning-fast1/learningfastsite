/* ============================================================
   LEVEL 2 — Συλλαβές
   Games: syllableCounting, syllableSynthesis,
          syllableSplit, syllableRemoval
   ============================================================ */
window.Phono = window.Phono || {};
Phono.games = Phono.games || {};

/* ===========================================
   GAME 1: syllableCounting — Tap Counting
   =========================================== */
Phono.games.syllableCounting = {
    container: null,
    levelInfo: null,
    currentWord: null,
    tapCount: 0,
    answered: false,
    usedWords: [],

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        this.usedWords = [];
        // Whole-session plan (not per-round math) — see
        // level2BuildSyllablePlan for why: computing each round's target
        // independently still let long runs of the same value happen by
        // chance (e.g. 4 two-syllable words in a row). Planning the full
        // sequence up front lets us actively break those runs up.
        this.syllablePlan = level2BuildSyllablePlan(Phono.engine.totalRounds);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';
        this.tapCount = 0;
        this.answered = false;

        const targetSyl = this.syllablePlan[Phono.engine.currentRound];
        const sourceWords = targetSyl === 1 ? Phono.data.oneSyllableWords : Phono.data.words;
        const pool = sourceWords.filter(w => w.syllables.length === targetSyl && !this.usedWords.includes(w.word));
        const available = pool.length > 0 ? pool : sourceWords.filter(w => w.syllables.length === targetSyl);
        this.currentWord = available.length > 0 ? Phono.data.getRandom(available) : Phono.data.getRandom(Phono.data.words);
        this.usedWords.push(this.currentWord.word);

        const correct = this.currentWord.syllables.length;

        const instruction = el('p', { className: 'game-instruction', textContent: 'Χτύπα για κάθε συλλαβή της λέξης!' });
        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: this.currentWord.emoji });
        const wordDiv = el('div', { className: 'game-main-word', textContent: this.currentWord.word });
        const wordRow = el('div', { className: 'sentence-row' }, [
            wordDiv,
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(this.currentWord.word)),
        ]);
        const counterDiv = el('div', { className: 'tap-counter-dots', id: 'tap-counter' });
        const tapBtn = el('button', {
            className: 'tap-button',
            textContent: '🥁',
            id: 'tap-btn',
            onClick: () => this.handleTap(),
        });

        // Lets the child fix a miscount without restarting the whole
        // round — hidden until the first tap, same as the answer choices.
        // Same small round-button style as the Level 1 clap counter, for
        // consistency across the whole game.
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

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, emojiDiv, wordRow, counterDiv, tapBtn, tapControls, checkArea]));
        Phono.audio.speak(this.currentWord.word);
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
        counter.appendChild(el('div', { className: 'tap-dot' }));

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

        // Back to zero taps — hide the reset/undo controls and the
        // answer choices again until the child starts tapping anew.
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
   GAME 2: syllableSynthesis — Find the Word
   =========================================== */
Phono.games.syllableSynthesis = {
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

        // Progressive difficulty
        const tier = Phono.engine.getDifficultyTier();
        let minSyl, maxSyl;
        if (tier === 1) { minSyl = 2; maxSyl = 2; }
        else if (tier === 2) { minSyl = 3; maxSyl = 3; }
        else { minSyl = 3; maxSyl = 5; }

        const pool = Phono.data.words.filter(w => w.syllables.length >= minSyl && w.syllables.length <= maxSyl && !this.usedWords.includes(w.word));
        const available = pool.length > 0 ? pool : Phono.data.words.filter(w => w.syllables.length >= minSyl && w.syllables.length <= maxSyl);
        this.currentWord = Phono.data.getRandom(available);
        this.usedWords.push(this.currentWord.word);

        const instruction = el('p', { className: 'game-instruction', textContent: 'Δες τις συλλαβές. Ποια λέξη είναι;' });

        // Syllable display — no audio in this stage, the syllables are
        // shown visually one by one (staggered fade-in below) instead of
        // being read aloud.
        const syllableDisplay = el('div', { className: 'phoneme-display', id: 'syllable-display' });
        this.currentWord.syllables.forEach((syl, i) => {
            if (i > 0) syllableDisplay.appendChild(el('span', { className: 'phoneme-separator visible', textContent: '—' }));
            const bubble = el('div', {
                className: 'phoneme-bubble consonant',
                textContent: syl,
                style: { width: 'auto', padding: '0 16px', minWidth: '50px' },
            });
            syllableDisplay.appendChild(bubble);
            // Animate in with delay
            setTimeout(() => bubble.classList.add('visible'), 300 + i * 400);
        });
        const syllableRow = el('div', { className: 'sentence-row' }, [syllableDisplay]);

        // Choices: 1 correct + 3 distractors
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

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, syllableRow, choicesGrid]));
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
            Phono.app.onGameComplete('syllableSynthesis', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 3: syllableSplit — Drag & Drop
   =========================================== */
Phono.games.syllableSplit = {
    container: null,
    levelInfo: null,
    currentWord: null,
    roundWords: [],
    placed: [],

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        // Whole session picked up front (not per-round) so the teacher's
        // reveal panel can show every word for the round right away,
        // instead of only knowing them one at a time as rounds happen.
        this.roundWords = level2BuildSyllableSplitWords(Phono.engine.totalRounds);
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        this.currentWord = this.roundWords[Phono.engine.currentRound];
        this.placed = new Array(this.currentWord.syllables.length).fill(null);

        // The word itself is never shown to the child — only the emoji,
        // the audio, and the (scrambled) syllable pieces they have to
        // place — otherwise they'd just read the finished word instead
        // of actually working out how it splits into syllables.
        const instruction = el('p', { className: 'game-instruction', textContent: 'Χώρισε τη λέξη στις συλλαβές της!' });
        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: this.currentWord.emoji });
        const wordRow = el('div', { className: 'sentence-row' }, [
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(this.currentWord.word)),
        ]);

        // Teacher-only peek at every word in the session — hidden by
        // default, since the child can't rely on reading the word
        // anymore, but the educator still needs to know it to help.
        const revealBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: '🔒 Λέξεις (δάσκαλος)',
            onClick: () => this.showWordList(),
        });

        // Drop zones (syllable boxes)
        const dropContainer = el('div', { className: 'syllable-boxes', id: 'syl-drop-zones' });
        this.currentWord.syllables.forEach((_, i) => {
            dropContainer.appendChild(el('div', {
                className: 'syllable-box drop-zone',
                'data-index': String(i),
                'data-syllable': this.currentWord.syllables[i],
            }));
        });

        // Scrambled syllable pieces — a genuine shuffle can land back on
        // the original order by pure chance (50% of the time for a
        // 2-syllable word!), which hands the child an already-solved
        // puzzle. Force a swap when that happens so the tiles are never
        // identical to the correct order.
        const scrambled = Phono.data.shuffle(this.currentWord.syllables.map((s, i) => ({ syllable: s, index: i })));
        if (scrambled.length > 1 && scrambled.every((item, i) => item.index === i)) {
            [scrambled[0], scrambled[1]] = [scrambled[1], scrambled[0]];
        }
        const dragContainer = el('div', { className: 'draggable-items', id: 'syl-drag-items' });
        scrambled.forEach((item, i) => {
            dragContainer.appendChild(el('div', {
                className: 'draggable-item',
                textContent: item.syllable,
                'data-syllable': item.syllable,
                id: `syl-drag-${i}`,
            }));
        });

        this.container.appendChild(el('div', { className: 'drag-area' }, [instruction, emojiDiv, wordRow, revealBtn, dropContainer, dragContainer]));
        Phono.audio.speak(this.currentWord.word);

        setTimeout(() => {
            Phono.dragDrop.init('#syl-drag-items', '.draggable-item', '.drop-zone', (dragEl, dropZone) => {
                this.handleDrop(dragEl, dropZone);
            });
        }, 100);
    },

    /** Teacher-only word list for the whole session, as a fixed overlay
     * (not inline content) so it never pushes the page around, and
     * attached to #app rather than this.container since the game area
     * sits inside the .fade-in screen, whose `transform` would otherwise
     * break a fixed-position child's positioning. */
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
                list,
                el('button', { className: 'btn btn-primary', textContent: 'Κατάλαβα', onClick: close, style: { marginTop: 'var(--space-lg)' } }),
            ]),
        ]);
        document.getElementById('app').appendChild(overlay);
    },

    handleDrop(dragEl, dropZone) {
        if (dropZone.classList.contains('filled')) return;
        const dragSyl = dragEl.getAttribute('data-syllable');
        const expected = dropZone.getAttribute('data-syllable');
        const index = parseInt(dropZone.getAttribute('data-index'));

        if (dragSyl === expected) {
            dropZone.textContent = dragSyl;
            dropZone.classList.add('filled', 'remaining');
            dragEl.classList.add('placed');
            this.placed[index] = dragSyl;
            Phono.audio.playSfx('pop');

            if (this.placed.every(p => p !== null)) {
                Phono.feedback.showCorrect();
                Phono.engine.recordCorrect();
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
            Phono.app.onGameComplete('syllableSplit', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 4: syllableRemoval — What Remains?
   =========================================== */
Phono.games.syllableRemoval = {
    container: null,
    levelInfo: null,
    currentItem: null,
    usedItems: [],

    init(container, levelInfo, createVoiceToggle, createHighlightToggle, createRepeatButton) {
        this.container = container;
        this.levelInfo = levelInfo;
        this.createVoiceToggle = createVoiceToggle;
        this.createRepeatButton = createRepeatButton;
        this.usedItems = [];
        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';

        // Progressive difficulty (syllableRemoval items start at 3 syllables)
        const tier = Phono.engine.getDifficultyTier();
        let minSyl, maxSyl;
        if (tier === 1) { minSyl = 3; maxSyl = 3; }
        else if (tier === 2) { minSyl = 3; maxSyl = 4; }
        else { minSyl = 3; maxSyl = 5; }

        const pool = Phono.data.syllableRemoval.filter(item => item.syllables.length >= minSyl && item.syllables.length <= maxSyl && !this.usedItems.includes(item.word + item.remove));
        const available = pool.length > 0 ? pool : Phono.data.syllableRemoval.filter(item => item.syllables.length >= minSyl && item.syllables.length <= maxSyl);
        this.currentItem = available.length > 0 ? Phono.data.getRandom(available) : Phono.data.getRandom(Phono.data.syllableRemoval);
        this.usedItems.push(this.currentItem.word + this.currentItem.remove);

        const instruction = el('p', {
            className: 'game-instruction',
            id: 'sylremoval-instruction',
            innerHTML: `Αν αφαιρέσω τη συλλαβή <strong>"${this.currentItem.remove}"</strong> τι μένει;`,
        });
        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: this.currentItem.emoji });
        const emojiRow = el('div', { className: 'sentence-row' }, [
            emojiDiv,
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(this.currentItem.word)),
        ]);

        // Teacher-only peek at exactly what's being erased this round —
        // the choice cards eventually show the answer among distractors,
        // but the teacher shouldn't have to guess which one is correct.
        const revealBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: '🔒 Απάντηση (δάσκαλος)',
            onClick: () => this.showAnswer(),
        });

        // Syllable boxes
        const boxesDiv = el('div', { className: 'syllable-boxes', id: 'syl-boxes' });
        this.currentItem.syllables.forEach((syl, i) => {
            const box = el('div', {
                className: `syllable-box ${i === this.currentItem.removeIndex ? 'active' : ''}`,
                textContent: syl,
                'data-index': String(i),
            });
            boxesDiv.appendChild(box);
        });

        // Choices
        const correct = this.currentItem.remaining;
        const distractors = this.generateDistractors(correct, this.currentItem.syllables);
        const allChoices = Phono.data.shuffle([
            { text: correct, isCorrect: true },
            ...distractors.map(d => ({ text: d, isCorrect: false })),
        ]);

        const choicesGrid = el('div', { className: 'choices-grid', id: 'removal-choices', style: { display: 'none' } });
        allChoices.forEach(choice => {
            const card = el('div', {
                className: 'choice-card',
                onClick: () => this.checkAnswer(choice.isCorrect, card),
            }, [el('span', { className: 'choice-word', textContent: choice.text, style: { fontSize: 'var(--text-2xl)' } })]);
            choicesGrid.appendChild(card);
        });

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, emojiRow, revealBtn, boxesDiv, choicesGrid]));

        Phono.audio.speak(this.currentItem.word);

        // Animate removal after 1.5s. The REST of the word can't just sit
        // there afterwards, though — those boxes spell out the exact
        // answer to the multiple-choice question below. So a second beat
        // later, hide the whole word too and shake the instruction to
        // pull focus back to it, forcing an answer from memory instead
        // of just reading it off the remaining boxes.
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
                        // visibility (not just opacity) — some mobile
                        // browsers don't reliably run the opacity
                        // transition here, leaving the rest of the
                        // word visible instead of hiding with the
                        // target box.
                        if (boxesEl) { boxesEl.style.opacity = '0'; boxesEl.style.visibility = 'hidden'; }
                        const instructionEl = document.getElementById('sylremoval-instruction');
                        if (instructionEl) instructionEl.classList.add('shake-attention');
                    }, 150);
                }, 800);
            }
        }, 1500);
    },

    /** Teacher-only overlay with exactly what's being erased this round
     * and the correct answer, as a fixed overlay attached to #app (not
     * this.container, since the game area sits inside the .fade-in
     * screen, whose `transform` would break a fixed-position child). */
    showAnswer() {
        const { el } = Phono.helpers;
        const close = () => overlay.remove();

        const overlay = el('div', {
            className: 'teacher-note-overlay',
            onClick: (e) => { if (e.target === overlay) close(); },
        }, [
            el('div', { className: 'teacher-note-card' }, [
                el('div', { className: 'teacher-note-title', textContent: '🔒 Για τον/την εκπαιδευτικό' }),
                el('p', { innerHTML: `<strong>Λέξη:</strong> ${this.currentItem.word}` }),
                el('p', { innerHTML: `<strong>Αφαιρείται συλλαβή:</strong> ${this.currentItem.remove}` }),
                el('p', { innerHTML: `<strong>Απάντηση:</strong> ${this.currentItem.remaining}` }),
                el('button', { className: 'btn btn-primary', textContent: 'Κατάλαβα', onClick: close, style: { marginTop: 'var(--space-lg)' } }),
            ]),
        ]);
        document.getElementById('app').appendChild(overlay);
    },

    generateDistractors(correct, syllables) {
        const distractors = new Set();
        // Rearrange syllables
        const shuffled = Phono.data.shuffle([...syllables]);
        distractors.add(shuffled.join(''));
        // Reverse
        distractors.add([...syllables].reverse().join(''));
        // Take just one random syllable
        distractors.add(Phono.data.getRandom(syllables));
        // Remove correct from distractors
        distractors.delete(correct);
        // Ensure we have at least 2
        if (distractors.size < 2) {
            distractors.add(correct + 'α');
            distractors.add(syllables[0] || 'νι');
        }
        return Array.from(distractors).slice(0, 3);
    },

    checkAnswer(isCorrect, cardEl) {
        if (cardEl.classList.contains('correct') || cardEl.classList.contains('wrong')) return;

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
            Phono.app.onGameComplete('syllableRemoval', this.levelInfo.id);
        }
    },
};

/**
 * Picks the word for every round of a syllableSplit session up front,
 * instead of one at a time as loadRound() would normally do. Needed so
 * the teacher's word-list reveal panel can show every word in the
 * session immediately, not just the ones already reached. Replicates
 * Phono.engine.getDifficultyTier()'s round->tier formula directly (it's
 * a pure function of round/total) rather than picking a word per round
 * while walking the engine's live currentRound forward.
 */
function level2BuildSyllableSplitWords(totalRounds) {
    const tierFor = (round, total) => {
        if (round < Math.ceil(total / 3)) return 1;
        if (round < Math.ceil((2 * total) / 3)) return 2;
        return 3;
    };
    const used = [];
    const words = [];
    for (let round = 0; round < totalRounds; round++) {
        const tier = tierFor(round, totalRounds);
        let minSyl, maxSyl;
        if (tier === 1) { minSyl = 2; maxSyl = 2; }
        else if (tier === 2) { minSyl = 3; maxSyl = 3; }
        else { minSyl = 3; maxSyl = 5; }

        const pool = Phono.data.words.filter(w => w.syllables.length >= minSyl && w.syllables.length <= maxSyl && !used.includes(w.word));
        const available = pool.length > 0 ? pool : Phono.data.words.filter(w => w.syllables.length >= minSyl && w.syllables.length <= maxSyl);
        const word = Phono.data.getRandom(available);
        used.push(word.word);
        words.push(word);
    }
    return words;
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
