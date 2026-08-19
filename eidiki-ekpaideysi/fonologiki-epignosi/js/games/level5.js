/* ============================================================
   LEVEL 5 — Φωνήματα (Προχωρημένο)
   Games: phonemeSynthesis, phonemeAnalysis, elkoninBoxes
   ============================================================ */
window.Phono = window.Phono || {};
Phono.games = Phono.games || {};

/* ===========================================
   GAME 1: phonemeSynthesis — Blend Phonemes
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

        // Progressive difficulty (our words have 4-10 phonemes)
        const tier = Phono.engine.getDifficultyTier();
        let minPh, maxPh;
        if (tier === 1)      { minPh = 4; maxPh = 4; }
        else if (tier === 2) { minPh = 4; maxPh = 5; }
        else                 { minPh = 5; maxPh = 8; }

        const pool = Phono.data.words.filter(w =>
            w.phonemes.length >= minPh && w.phonemes.length <= maxPh && !this.usedWords.includes(w.word)
        );
        const available = pool.length > 0 ? pool : Phono.data.words.filter(w => w.phonemes.length >= minPh && w.phonemes.length <= maxPh);
        this.currentWord = Phono.data.getRandom(available);
        this.usedWords.push(this.currentWord.word);

        // No audio in this stage — the sounds are shown visually as
        // phoneme bubbles instead of being read aloud.
        const instruction = el('p', { className: 'game-instruction', textContent: 'Δες τους ήχους. Ποια λέξη φτιάχνουν;' });

        // Phoneme display with animated reveal
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

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, phonemeDisplay, choicesGrid]));

        // No auto-speak for Level 5
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
            Phono.app.onGameComplete('phonemeSynthesis', this.levelInfo.id);
        }
    },
};

/* ===========================================
   GAME 2: phonemeAnalysis — Count Phonemes
   =========================================== */
Phono.games.phonemeAnalysis = {
    container: null,
    levelInfo: null,
    currentWord: null,
    tapCount: 0,
    answered: false,
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
        this.tapCount = 0;
        this.answered = false;

        // Progressive difficulty (our words have 4-10 phonemes)
        const tier = Phono.engine.getDifficultyTier();
        let minPh, maxPh;
        if (tier === 1)      { minPh = 4; maxPh = 4; }
        else if (tier === 2) { minPh = 4; maxPh = 6; }
        else                 { minPh = 6; maxPh = 10; }

        // Excludes words with a two-letter diphthong vowel (αι, ει, οι,
        // ου, υι) — those count as ONE phoneme in the data, but a child
        // tapping while looking at the written word sees two letters and
        // can end up counting it as two sounds, throwing off exactly the
        // skill this stage is meant to build.
        const hasDiphthong = w => w.phonemes.some(p => ['αι', 'ει', 'οι', 'ου', 'υι'].includes(p));
        const bySize = w => w.phonemes.length >= minPh && w.phonemes.length <= maxPh;
        const sizeFiltered = Phono.data.words.filter(w => bySize(w) && !hasDiphthong(w));
        const pool = sizeFiltered.filter(w => !this.usedWords.includes(w.word));
        const available = pool.length > 0 ? pool : sizeFiltered;
        this.currentWord = Phono.data.getRandom(available);
        this.usedWords.push(this.currentWord.word);

        const correct = this.currentWord.phonemes.length;

        const instruction = el('p', { className: 'game-instruction', textContent: 'Πόσους ήχους (φωνήματα) ακούς στη λέξη;' });
        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: this.currentWord.emoji });
        const wordDiv = el('div', { className: 'game-main-word', textContent: this.currentWord.word });
        const counterDiv = el('div', { className: 'tap-counter-dots', id: 'tap-counter' });

        const tapBtn = el('button', {
            className: 'tap-button',
            textContent: '🔢',
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
        const label = el('p', { className: 'game-instruction', textContent: 'Πόσες φορές πάτησες; Πάτησε τον αριθμό!', style: { fontSize: 'var(--text-lg)' } });
        const maxChoice = Math.max(8, correct + 2);
        const choicesDiv = el('div', { className: 'clap-number-choices' });
        for (let i = 2; i <= maxChoice; i++) {
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

        this.container.appendChild(el('div', { className: 'tap-area' }, [instruction, emojiDiv, wordDiv, counterDiv, tapBtn, tapControls, checkArea]));
        // No auto-speak for Level 5
    },

    handleTap() {
        if (this.answered) return;
        const { el } = Phono.helpers;
        this.tapCount++;
        Phono.audio.playSfx('tap');

        const btn = document.getElementById('tap-btn');
        btn.classList.add('tapped');
        setTimeout(() => btn.classList.remove('tapped'), 300);

        document.getElementById('tap-counter').appendChild(el('div', { className: 'tap-dot' }));

        // Show answer choices + reset/undo controls after the first tap
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
   GAME 3: elkoninBoxes — Digital Elkonin Boxes
   =========================================== */
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

        // Single round game
        Phono.engine.totalRounds = 1;
        Phono.engine.currentRound = 0;

        this.loadRound();
    },

    loadRound() {
        const { el } = Phono.helpers;
        this.container.innerHTML = '';
        this.correctCount = 0;

        // Pick word with 3-5 phonemes
        const pool = Phono.data.words.filter(w =>
            w.phonemes.length >= 3 && w.phonemes.length <= 5 && !this.usedWords.includes(w.word)
        );
        const available = pool.length > 0 ? pool : Phono.data.words.filter(w => w.phonemes.length >= 3 && w.phonemes.length <= 5);
        this.currentWord = Phono.data.getRandom(available);
        this.usedWords.push(this.currentWord.word);
        this.placed = new Array(this.currentWord.phonemes.length).fill(null);
        Phono.engine.maxScore = this.currentWord.phonemes.length;

        const instruction = el('p', { className: 'game-instruction', textContent: 'Βάλε κάθε ήχο στο σωστό κουτάκι!' });
        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: this.currentWord.emoji });
        const wordDiv = el('div', { className: 'game-main-word', textContent: this.currentWord.word, style: { fontSize: 'var(--text-2xl)' } });

        // Elkonin boxes (drop zones)
        const boxesDiv = el('div', { className: 'elkonin-boxes', id: 'elkonin-boxes' });
        this.currentWord.phonemes.forEach((ph, i) => {
            const box = el('div', {
                className: 'elkonin-box drop-zone',
                'data-index': String(i),
                'data-phoneme': ph,
                id: `elk-box-${i}`,
            });
            // Add number label at bottom
            box.appendChild(el('span', {
                textContent: String(i + 1),
                style: { position: 'absolute', bottom: '-18px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' },
            }));
            box.style.position = 'relative';
            boxesDiv.appendChild(box);
        });

        // Phoneme tokens (draggable)
        const scrambled = Phono.data.shuffle(this.currentWord.phonemes.map((ph, i) => ({ phoneme: ph, index: i })));
        const tokensDiv = el('div', { className: 'phoneme-tokens-source', id: 'phoneme-tokens' });
        scrambled.forEach((item, i) => {
            const isVowel = Phono.helpers.isVowelSound(item.phoneme);
            const token = el('div', {
                className: `phoneme-draggable draggable-item ${isVowel ? 'vowel' : 'consonant'}`,
                textContent: item.phoneme,
                'data-phoneme': item.phoneme,
                'data-orig-index': String(item.index),
                id: `ph-token-${i}`,
                style: { borderRadius: '50%', border: 'none' },
            });
            tokensDiv.appendChild(token);
        });

        // Legend
        const legend = el('div', {
            style: { display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' },
        }, [
            el('span', { innerHTML: '<span style="color: var(--accent-warm)">●</span> Φωνήεν' }),
            el('span', { innerHTML: '<span style="color: var(--accent-cool)">●</span> Σύμφωνο' }),
        ]);

        this.container.appendChild(el('div', { className: 'elkonin-container' }, [instruction, emojiDiv, wordDiv, boxesDiv, tokensDiv, legend]));

        // No auto-speak for Level 5

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
        const origIndex = parseInt(dragEl.getAttribute('data-orig-index'));

        // Match if phoneme is correct AND (position matches OR it's the right phoneme for an unfilled box)
        if (dragPhoneme === expectedPhoneme) {
            // Correct placement
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

            // Check if all boxes filled
            if (this.placed.every(p => p !== null)) {
                Phono.feedback.showCorrect();
                setTimeout(() => {
                    Phono.app.onGameComplete('elkoninBoxes', this.levelInfo.id);
                }, 1200);
            }
        } else {
            Phono.feedback.highlightElement(dropZone, false);
            Phono.audio.playSfx('wrong');
        }
    },
};

/* ===========================================
   GAME 4: phonemeDeletion — Remove the first
   sound and say what remains.
   =========================================== */
Phono.games.phonemeDeletion = {
    container: null,
    levelInfo: null,
    currentItem: null,
    usedItems: [],
    answered: false,

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
        this.answered = false;

        const pool = Phono.data.phonemeDeletion.filter(i => !this.usedItems.includes(i.word));
        const available = pool.length > 0 ? pool : Phono.data.phonemeDeletion;
        this.currentItem = Phono.data.getRandom(available);
        this.usedItems.push(this.currentItem.word);

        const word = this.currentItem.word;

        const instruction = el('p', {
            className: 'game-instruction',
            id: 'phonemedeletion-instruction',
            innerHTML: `Πες τη λέξη χωρίς τον πρώτο ήχο <strong>/${this.currentItem.first}/</strong>. Τι μένει;`,
        });
        const emojiDiv = el('div', { className: 'game-main-emoji', textContent: this.currentItem.emoji });
        const emojiRow = el('div', { className: 'sentence-row' }, [
            emojiDiv,
            this.createVoiceToggle(),
            this.createRepeatButton(() => Phono.audio.speak(word)),
        ]);

        // Teacher-only peek at exactly what's being erased this round —
        // the choice cards eventually show the answer among distractors,
        // but the teacher shouldn't have to guess which one is correct.
        const revealBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: '🔒 Απάντηση (δάσκαλος)',
            onClick: () => this.showAnswer(),
        });

        // Letter boxes — first letter highlighted for removal
        const letterDisplay = el('div', { className: 'letter-display', id: 'pd-letters' });
        word.split('').forEach((char, i) => {
            letterDisplay.appendChild(el('div', {
                className: `letter-box ${i === 0 ? 'highlight' : ''}`,
                textContent: char,
                'data-index': String(i),
            }));
        });

        // Choices (hidden until the first sound is removed)
        const correct = this.currentItem.remaining;
        const distractors = this.generateDistractors(correct, word);
        const allChoices = Phono.data.shuffle([
            { text: correct, correct: true },
            ...distractors.map(d => ({ text: d, correct: false })),
        ]);

        const choicesGrid = el('div', { className: 'choices-grid', id: 'pd-choices', style: { display: 'none' } });
        allChoices.forEach(choice => {
            const card = el('div', {
                className: 'choice-card',
                onClick: () => this.checkAnswer(choice.correct, card),
            }, [el('span', { className: 'choice-word', textContent: choice.text, style: { fontSize: 'var(--text-2xl)' } })]);
            choicesGrid.appendChild(card);
        });

        this.container.appendChild(el('div', { className: 'sound-change-area' }, [instruction, emojiRow, revealBtn, letterDisplay, choicesGrid]));

        Phono.audio.speak(word);

        // Animate removal of the first sound, then reveal choices. The
        // REST of the letters can't just sit there afterwards, though —
        // they spell out the exact answer to the multiple-choice question
        // below. So a second beat later, hide the whole word too and
        // shake the instruction to pull focus back to it, forcing an
        // answer from memory instead of just reading it off the letters.
        setTimeout(() => {
            const letterDisplayEl = document.getElementById('pd-letters');
            const firstBox = letterDisplayEl ? letterDisplayEl.querySelector('.letter-box[data-index="0"]') : null;
            if (firstBox) {
                firstBox.classList.add('removing');
                Phono.audio.playSfx('pop');
                setTimeout(() => {
                    firstBox.style.visibility = 'hidden';
                    const choices = document.getElementById('pd-choices');
                    if (choices) choices.style.display = '';

                    setTimeout(() => {
                        if (letterDisplayEl) letterDisplayEl.style.opacity = '0';
                        const instructionEl = document.getElementById('phonemedeletion-instruction');
                        if (instructionEl) instructionEl.classList.add('shake-attention');
                    }, 150);
                }, 800);
            }
        }, 1600);
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
                el('p', { innerHTML: `<strong>Αφαιρείται ήχος:</strong> ${this.currentItem.first}` }),
                el('p', { innerHTML: `<strong>Απάντηση:</strong> ${this.currentItem.remaining}` }),
                el('button', { className: 'btn btn-primary', textContent: 'Κατάλαβα', onClick: close, style: { marginTop: 'var(--space-lg)' } }),
            ]),
        ]);
        document.getElementById('app').appendChild(overlay);
    },

    generateDistractors(correct, word) {
        const d = new Set();
        d.add(word);                    // whole word (forgot to remove)
        d.add(word.slice(0, -1));       // removed the last sound instead
        d.add(word.slice(2));           // removed two sounds
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
            Phono.app.onGameComplete('phonemeDeletion', this.levelInfo.id);
        }
    },
};
