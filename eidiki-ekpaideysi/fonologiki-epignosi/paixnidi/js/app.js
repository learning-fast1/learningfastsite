/* ============================================================
   ΦΩΝΟΠΑΙΧΝΙΔΙ — App Controller
   Router, Screens (Home, Level Select, Game Select,
   Game Complete, Settings)
   ============================================================ */

window.Phono = window.Phono || {};

Phono.app = {
    container: null,
    currentScreen: null,
    settings: {
        soundEnabled: true,
        ttsEnabled: true,
        roundCount: 5,
    },

    // Which letters Level 4's games should draw words from — chosen fresh
    // each time the teacher enters the level (see renderLevel4LetterPicker),
    // since it's meant to change per child/session, not stick permanently.
    // null/empty means "no restriction, use everything" (default, and what
    // every other level always does).
    level4Letters: null,

    // Teacher-configured subset of words/sentences to draw from — set once
    // centrally from Settings ("Επιλογή Λέξεων & Προτάσεων", see
    // renderContentPicker), unlike level4Letters above: this is meant to
    // stick across sessions (persisted to localStorage), not get re-picked
    // every time a level is entered. null/empty per key means "no
    // restriction, use everything" — same convention as level4Letters.
    // Currently wired into Level 1 (sentences) and Level 2 (words) only —
    // see Phono.data.getSentencePool() / Phono.data.wordsL2UpToStage().
    contentSelection: {
        level1Sentences: null,
        level2Words: null,
    },

    /** Initialize the app */
    init() {
        this.container = document.getElementById('app');
        this.loadSettings();
        this.loadContentSelection();
        Phono.audio.loadVoiceMuted();
        Phono.assist.loadHighlightDisabled();
        this.navigate('home');

        // Ensure AudioContext is initialized on first user interaction
        document.addEventListener('click', () => Phono.audio.init(), { once: true });
        document.addEventListener('touchstart', () => Phono.audio.init(), { once: true });
    },

    /** Navigate to a screen */
    navigate(screen, params = {}) {
        // Clean up previous
        Phono.dragDrop.destroy();
        Phono.confetti.stop();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        Phono.audio.currentGameId = null;
        // Invalidates any in-flight speak()/speakSyllables()/speakPhonemes()
        // chain left over from the stage being left — see the comment on
        // Phono.audio.navGeneration for why cancel() alone isn't enough.
        Phono.audio.navGeneration++;

        this.container.innerHTML = '';
        this.currentScreen = screen;

        switch (screen) {
            case 'home':
                this.renderHome();
                break;
            case 'levelSelect':
                this.renderLevelSelect();
                break;
            case 'level4LetterPicker':
                this.renderLevel4LetterPicker();
                break;
            case 'gameSelect':
                this.renderGameSelect(params.levelId);
                break;
            case 'game':
                this.renderGame(params.gameId, params.levelId);
                break;
            case 'gameComplete':
                this.renderGameComplete(params);
                break;
            case 'settings':
                this.renderSettings();
                break;
            case 'contentPicker':
                this.renderContentPicker();
                break;
        }
    },

    /* ===========================================
       HOME SCREEN
       =========================================== */
    renderHome() {
        const { el } = Phono.helpers;

        // Settings button — kept OUTSIDE the fade-in screen below (see the
        // comment in renderLevelSelect for why: a fixed-position element
        // nested inside an ancestor with an active entrance `transform`
        // gets visually dragged along by it).
        const settingsBtn = el('button', {
            className: 'btn btn-icon home-settings',
            textContent: '⚙️',
            onClick: () => this.navigate('settings'),
            id: 'btn-settings',
        });

        // Link back to the main Learning Fast site — this copy lives at
        // eidiki-ekpaideysi/fonologiki-epignosi/paixnidi/, three levels below root.
        // Kept OUTSIDE the fade-in screen below, same reason as settingsBtn
        // above: its `position:fixed` gets dragged along by the screen's
        // entrance `transform` if nested inside it, so it visibly drifts
        // every time this screen re-renders (entering/leaving the game).
        const backLink = el('a', {
            className: 'site-back-link',
            href: '../../../index.html',
            textContent: '← Learning Fast',
        });

        const screen = el('div', { className: 'home-screen fade-in' }, [
            // Logo image (replaces mascot)
            (() => {
                const img = document.createElement('img');
                img.src = 'logo.png';
                img.alt = 'Learning Fast';
                img.className = 'home-logo-img';
                img.id = 'home-logo';
                return img;
            })(),

            // Title
            el('h1', { className: 'home-logo', textContent: 'Φωνολογική Επίγνωση' }),

            // Subtitle
            el('p', { className: 'home-subtitle', textContent: 'Μαθαίνω τους ήχους παίζοντας!' }),

            // Play button
            el('button', {
                className: 'btn btn-primary btn-large',
                innerHTML: 'Ας ξεκινήσουμε',
                onClick: () => {
                    Phono.audio.playSfx('pop');
                    this.navigate('levelSelect');
                },
                id: 'btn-play',
            }),
        ]);

        this.container.appendChild(screen);
        this.container.appendChild(settingsBtn);
        this.container.appendChild(backLink);
    },

    /* ===========================================
       LEVEL SELECT SCREEN
       =========================================== */
    renderLevelSelect() {
        const { el } = Phono.helpers;

        // Sound toggle button
        const soundBtn = el('button', {
            className: 'btn btn-icon sound-toggle-level',
            textContent: Phono.audio.muted ? '🔇' : '🔊',
            onClick: () => {
                const muted = Phono.audio.toggleMute();
                soundBtn.textContent = muted ? '🔇' : '🔊';
                this.settings.soundEnabled = !muted;
                this.saveSettings();
            },
            id: 'btn-sound-level',
        });

        // Settings button (same as on the home screen)
        const settingsBtn = el('button', {
            className: 'btn btn-icon',
            textContent: '⚙️',
            onClick: () => this.navigate('settings'),
            id: 'btn-settings-level',
        });

        const screen = el('div', { className: 'level-select-screen fade-in' }, [
            // Back button
            el('button', {
                className: 'btn btn-icon btn-back',
                textContent: '←',
                onClick: () => {
                    Phono.audio.playSfx('click');
                    this.navigate('home');
                },
                id: 'btn-back-home',
            }),

            // Header
            el('div', { className: 'level-select-header' }, [
                el('h1', { textContent: 'Επίλεξε Επίπεδο!' }),
                el('p', { textContent: 'Ξεκίνα από οποιοδήποτε επίπεδο θέλεις' }),
            ]),

            // Level list
            el('div', { className: 'level-list' },
                Phono.data.levels.map((level, index) => {
                    const card = el('div', {
                        className: 'card level-card card-interactive',
                        style: { '--level-color': level.color, animationDelay: `${index * 0.1}s` },
                        onClick: () => {
                            Phono.audio.playSfx('pop');
                            // Level 4 gets an extra stop first: which
                            // letters to focus on today, for this child.
                            if (level.id === 4) {
                                this.navigate('level4LetterPicker', { levelId: level.id });
                            } else {
                                this.navigate('gameSelect', { levelId: level.id });
                            }
                        },
                        id: `level-card-${level.id}`,
                    }, [
                        el('div', { className: 'level-info' }, [
                            el('div', { className: 'level-title', textContent: `Επίπεδο ${level.id}: ${level.title}` }),
                            el('div', { className: 'level-desc', textContent: level.description }),
                        ]),
                    ]);
                    card.style.animation = `fadeSlideIn ${0.5}s var(--ease-smooth) ${index * 0.1}s both`;
                    return card;
                })
            ),
        ]);

        this.container.appendChild(screen);
        // Appended after (and outside) `screen` on purpose: `screen` has the
        // fade-in entrance animation, which uses `transform`. A fixed/absolute
        // element nested INSIDE an ancestor with an active `transform` gets
        // dragged along by it visually, so these icons must be siblings of
        // `screen`, not children, to stay put during the transition.
        this.container.appendChild(el('div', { className: 'level-select-topbar-icons' }, [settingsBtn, soundBtn]));
    },

    /* ===========================================
       LEVEL 4 LETTER PICKER
       Lets the educator restrict which letters Level 4's games draw
       words from — e.g. only the letters a specific child is currently
       working on that day. Shown once, right when entering Level 4 from
       the level list (not on every game/round transition inside it).
       =========================================== */
    renderLevel4LetterPicker() {
        const { el } = Phono.helpers;
        const level = Phono.data.levels.find(l => l.id === 4);

        // Only offer letters the word data can actually produce rounds
        // for — no point letting a teacher pick a letter that would just
        // silently fall back to "everything" every round.
        const available = Phono.data.getLevel4AvailableLetters();
        // Starts EMPTY (not all pre-selected) — tapping a letter has to
        // mean "practice this one", not "stop practicing this one". This
        // used to default to everything selected, so tapping just α/μ
        // actually deselected those two and left the other 19 active,
        // which is the opposite of what a teacher wants when narrowing
        // to a couple of letters. Re-opening the picker later in the same
        // session still restores whatever was last chosen.
        const selected = new Set(this.level4Letters || []);

        const chipsGrid = el('div', { className: 'letter-picker-grid', id: 'letter-picker-grid' });
        available.forEach(letter => {
            const chip = el('button', {
                className: `letter-chip${selected.has(letter) ? ' selected' : ''}`,
                textContent: letter,
                onClick: () => {
                    Phono.audio.playSfx('click');
                    if (selected.has(letter)) selected.delete(letter);
                    else selected.add(letter);
                    chip.classList.toggle('selected');
                },
            });
            chipsGrid.appendChild(chip);
        });

        const selectAllBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: 'Επιλογή όλων',
            onClick: () => {
                available.forEach(l => selected.add(l));
                chipsGrid.querySelectorAll('.letter-chip').forEach(c => c.classList.add('selected'));
            },
        });
        const selectNoneBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: 'Καμία επιλογή',
            onClick: () => {
                selected.clear();
                chipsGrid.querySelectorAll('.letter-chip').forEach(c => c.classList.remove('selected'));
            },
        });

        const continueBtn = el('button', {
            className: 'btn btn-primary',
            textContent: 'Συνέχεια ▶',
            onClick: () => {
                Phono.audio.playSfx('pop');
                // Nothing picked = no restriction, same as before this
                // feature existed.
                this.level4Letters = selected.size > 0 ? Array.from(selected) : null;
                this.navigate('gameSelect', { levelId: 4 });
            },
        });

        const screen = el('div', { className: 'level-select-screen fade-in' }, [
            el('button', {
                className: 'btn btn-icon btn-back',
                textContent: '←',
                onClick: () => {
                    Phono.audio.playSfx('click');
                    this.navigate('levelSelect');
                },
                id: 'btn-back-levels-from-letters',
            }),
            el('div', { className: 'level-select-header' }, [
                el('h1', { textContent: 'Ποιους ήχους δουλεύουμε σήμερα;' }),
                el('p', { textContent: `Επίπεδο 4: ${level.title}. Διάλεξε τους ήχους που θέλεις να εξασκηθεί το παιδί. Χωρίς επιλογή, χρησιμοποιούνται όλοι.` }),
            ]),
            chipsGrid,
            el('div', { className: 'tap-controls', style: { marginTop: 'var(--space-md)' } }, [selectAllBtn, selectNoneBtn]),
            el('div', { style: { marginTop: 'var(--space-xl)', display: 'flex', justifyContent: 'center' } }, [continueBtn]),
        ]);

        this.container.appendChild(screen);
    },

    /* ===========================================
       GAME SELECT SCREEN (sub-games in a level)
       =========================================== */
    renderGameSelect(levelId) {
        const { el } = Phono.helpers;
        const level = Phono.data.levels.find(l => l.id === levelId);
        if (!level) return this.navigate('levelSelect');

        const screen = el('div', { className: 'game-select-screen fade-in' }, [
            // Back button
            el('button', {
                className: 'btn btn-icon btn-back',
                textContent: '←',
                onClick: () => {
                    Phono.audio.playSfx('click');
                    this.navigate('levelSelect');
                },
                id: 'btn-back-levels',
            }),

            // Header
            el('div', { className: 'game-select-header' }, [
                el('span', {
                    className: 'level-badge',
                    innerHTML: `Επίπεδο ${level.id}`,
                    style: { background: level.color },
                }),
                el('h1', { textContent: level.title }),
                el('p', {
                    className: 'level-desc',
                    textContent: level.description,
                    style: { color: 'var(--text-secondary)' },
                }),
            ]),

            // Game list
            el('div', { className: 'game-list' },
                level.games.map((game, index) => {
                    const stars = Phono.scoring.getGameStars(game.id);
                    const card = el('div', {
                        className: 'card game-card card-interactive',
                        style: { '--level-color': level.color },
                        onClick: () => {
                            Phono.audio.playSfx('pop');
                            this.navigate('game', { gameId: game.id, levelId: level.id });
                        },
                        id: `game-card-${game.id}`,
                    }, [
                        game.img ? (() => {
                            const img = document.createElement('img');
                            img.src = `img/${game.img}`;
                            img.alt = game.title;
                            img.className = 'game-icon-img';
                            return img;
                        })() : game.icon ? el('div', { className: 'game-icon', innerHTML: game.icon }) : null,
                        el('div', { className: 'game-info' }, [
                            el('div', { className: 'game-title', textContent: game.title }),
                            el('div', { className: 'game-desc', textContent: game.description }),
                        ]),
                        el('div', {
                            className: 'game-stars',
                            textContent: Phono.scoring.getStarDisplay(stars),
                        }),
                    ]);
                    card.style.animation = `fadeSlideIn 0.5s var(--ease-smooth) ${index * 0.1}s both`;
                    return card;
                })
            ),
        ]);

        this.container.appendChild(screen);
    },

    /* ===========================================
       GAME SCREEN — Delegates to game module
       =========================================== */
    renderGame(gameId, levelId) {
        const game = Phono.games[gameId];
        if (!game) {
            console.error('Game not found:', gameId);
            return this.navigate('gameSelect', { levelId });
        }

        // Find game info
        let gameInfo = null;
        let levelInfo = null;
        for (const level of Phono.data.levels) {
            const found = level.games.find(g => g.id === gameId);
            if (found) {
                gameInfo = found;
                levelInfo = level;
                break;
            }
        }

        // Start engine
        Phono.engine.startGame({
            gameId,
            totalRounds: this.settings.roundCount,
        });
        Phono.audio.currentGameId = gameId;

        // Render game wrapper
        const { el } = Phono.helpers;
        const screen = el('div', { className: 'game-screen fade-in' }, [
            // Header
            el('div', { className: 'game-header' }, [
                el('button', {
                    className: 'btn btn-icon',
                    textContent: '←',
                    onClick: () => {
                        Phono.audio.playSfx('click');
                        this.navigate('gameSelect', { levelId: levelInfo.id });
                    },
                    id: 'btn-back-game',
                }),
                el('div', { className: 'game-header-title', textContent: gameInfo.title }),
                el('div', { className: 'game-header-progress' }, [
                    el('div', { className: 'progress-bar' }, [
                        el('div', { className: 'progress-bar-fill', id: 'game-progress-fill', style: { width: '0%' } }),
                    ]),
                    el('div', { className: 'round-counter', id: 'round-counter', textContent: `1 / ${Phono.engine.totalRounds}` }),
                ]),
            ]),

            // Game body (games render here)
            el('div', { className: 'game-body', id: 'game-body' }),
        ]);

        // Sound toggle
        const soundBtn = el('button', {
            className: 'btn btn-icon sound-toggle',
            textContent: Phono.audio.muted ? '🔇' : '🔊',
            onClick: () => {
                const muted = Phono.audio.toggleMute();
                soundBtn.textContent = muted ? '🔇' : '🔊';
            },
            id: 'btn-sound-toggle',
        });

        // Teacher-note toggle — opens guidance for the educator on this
        // specific stage (e.g. reading the words aloud themselves instead
        // of the app's voice). Sibling of screen, same reason as soundBtn:
        // an element nested inside the .fade-in-animated screen gets
        // visually dragged by that transform during screen transitions.
        const infoBtn = el('button', {
            className: 'btn btn-secondary btn-small teacher-info-toggle',
            textContent: 'ΟΔΗΓΙΕΣ',
            title: 'Οδηγίες για τον εκπαιδευτικό',
            onClick: () => this.showTeacherNote(gameId, gameInfo.title),
            id: 'btn-teacher-info',
        });

        this.container.appendChild(screen);
        this.container.appendChild(soundBtn);
        this.container.appendChild(infoBtn);

        // Initialize the specific game. The voice-toggle, highlight-toggle,
        // and repeat buttons are created fresh (not appended anywhere here)
        // — each game places them itself, right next to its own
        // word/sentence/card box.
        game.init(
            document.getElementById('game-body'),
            levelInfo,
            () => this.createVoiceToggle(gameId),
            () => this.createHighlightToggle(gameId),
            (speakFn) => this.createRepeatButton(speakFn)
        );
    },

    /**
     * Create a voice-toggle button (🔊/🔇) for one specific stage. Mutes
     * only the read-aloud voice for that stage — independent of the
     * general sound toggle and of every other stage. Games call the
     * factory passed into init() each time they rebuild their round, so
     * a fresh button (same toggle logic) can be placed next to whatever
     * box is showing that round.
     */
    createVoiceToggle(gameId) {
        const { el } = Phono.helpers;
        const voiceBtn = el('button', {
            className: 'btn btn-icon voice-toggle-inline',
            textContent: Phono.audio.isVoiceMuted(gameId) ? '🔇' : '🔊',
            title: 'Ενεργοποίηση/απενεργοποίηση φωνής εκφώνησης',
            onClick: () => {
                const voiceMuted = Phono.audio.toggleVoiceMute(gameId);
                voiceBtn.textContent = voiceMuted ? '🔇' : '🔊';
            },
        });
        return voiceBtn;
    },

    /**
     * Create a highlight-assist toggle (🖍️/⬜) for one specific stage. Only
     * used by wordCounting for now (the word-by-word color-highlight while
     * clapping) — on by default, a teacher can turn it off per stage for a
     * child who doesn't need the extra visual cue.
     */
    createHighlightToggle(gameId) {
        const { el } = Phono.helpers;
        const highlightBtn = el('button', {
            className: 'btn btn-icon voice-toggle-inline',
            textContent: Phono.assist.isHighlightEnabled(gameId) ? '🖍️' : '⬜',
            title: 'Ενεργοποίηση/απενεργοποίηση χρωματισμού λέξεων',
            onClick: () => {
                const enabled = Phono.assist.toggleHighlight(gameId);
                highlightBtn.textContent = enabled ? '🖍️' : '⬜';
            },
        });
        return highlightBtn;
    },

    /**
     * Create a repeat button ("Επανάληψη") that just re-plays whatever this
     * round's audio is — the child might not catch a word/sentence the
     * first time. Stateless (unlike the voice toggle): each game passes in
     * the exact function it already uses to speak, so this only needs to
     * call it again.
     */
    createRepeatButton(speakFn) {
        const { el } = Phono.helpers;
        return el('button', {
            className: 'btn btn-secondary btn-small repeat-btn-text',
            textContent: 'Επανάληψη',
            title: 'Επανάληψη',
            onClick: () => speakFn(),
        });
    },

    /**
     * Show the per-stage guidance for an educator/therapist who might be
     * reading the words aloud themselves instead of relying on the app's
     * voice. Content lives in Phono.data.teacherNotes, keyed by gameId.
     */
    showTeacherNote(gameId, gameTitle) {
        const { el } = Phono.helpers;
        const note = Phono.data.teacherNotes[gameId] || 'Δεν υπάρχουν ακόμα οδηγίες για αυτό το στάδιο.';

        const close = () => overlay.remove();
        const overlay = el('div', {
            className: 'teacher-note-overlay',
            onClick: (e) => { if (e.target === overlay) close(); },
        }, [
            el('div', { className: 'teacher-note-card' }, [
                el('div', { className: 'teacher-note-title', textContent: gameTitle }),
                el('p', { className: 'teacher-note-text', textContent: note }),
                el('button', {
                    className: 'btn btn-primary',
                    textContent: 'Κατάλαβα',
                    onClick: close,
                }),
            ]),
        ]);

        this.container.appendChild(overlay);
    },

    /** Update progress bar in game header */
    updateGameProgress() {
        const fill = document.getElementById('game-progress-fill');
        const counter = document.getElementById('round-counter');
        if (fill) fill.style.width = Phono.engine.getProgress() + '%';
        if (counter) counter.textContent = `${Phono.engine.currentRound + 1} / ${Phono.engine.totalRounds}`;
    },

    /** Called by games when complete */
    onGameComplete(gameId, levelId) {
        const result = Phono.engine.completeGame();
        Phono.audio.playSfx('fanfare');
        Phono.confetti.launch(4000);
        
        setTimeout(() => {
            this.navigate('gameComplete', {
                gameId,
                levelId,
                stars: result.stars,
                score: result.score,
                total: result.total,
            });
        }, 800);
    },

    /* ===========================================
       GAME COMPLETE SCREEN
       =========================================== */
    renderGameComplete(params) {
        const { el } = Phono.helpers;
        const { stars, score, total, gameId, levelId } = params;
        const message = Phono.data.getRandom(Phono.data.encouragement.levelComplete);

        // Find next game
        const level = Phono.data.levels.find(l => l.id === levelId);
        let nextGame = null;
        if (level) {
            const currentIdx = level.games.findIndex(g => g.id === gameId);
            if (currentIdx >= 0 && currentIdx < level.games.length - 1) {
                nextGame = level.games[currentIdx + 1];
            }
        }

        const screen = el('div', { className: 'game-complete-screen fade-in' }, [
            // Back button
            el('button', {
                className: 'btn btn-icon btn-back',
                textContent: '←',
                onClick: () => {
                    Phono.audio.playSfx('click');
                    this.navigate('gameSelect', { levelId });
                },
                id: 'btn-back-complete',
            }),
            el('div', { className: 'complete-emoji', textContent: stars >= 2 ? '🏆' : '👏' }),
            el('h1', { className: 'complete-title', textContent: stars >= 2 ? 'Φανταστικά!' : 'Μπράβο!' }),
            el('p', { className: 'complete-message', textContent: message }),
            el('p', {
                className: 'complete-message',
                textContent: `Σωστές απαντήσεις: ${score} / ${total}`,
                style: { fontSize: 'var(--text-lg)' },
            }),

            // Stars
            el('div', { className: 'complete-stars' },
                [1, 2, 3].map(i => {
                    const star = el('span', {
                        className: `complete-star ${i <= stars ? 'earned' : ''}`,
                        textContent: i <= stars ? '⭐' : '☆',
                    });
                    return star;
                })
            ),

            // Buttons
            el('div', { className: 'complete-buttons' }, [
                el('button', {
                    className: 'btn btn-secondary',
                    innerHTML: '🔄 Παίξε Ξανά',
                    onClick: () => {
                        Phono.audio.playSfx('pop');
                        this.navigate('game', { gameId, levelId });
                    },
                    id: 'btn-replay',
                }),
                nextGame ? el('button', {
                    className: 'btn btn-primary',
                    innerHTML: '➡️ Επόμενο',
                    onClick: () => {
                        Phono.audio.playSfx('pop');
                        this.navigate('game', { gameId: nextGame.id, levelId });
                    },
                    id: 'btn-next-game',
                }) : null,
                el('button', {
                    className: 'btn btn-accent btn-small',
                    innerHTML: '📋 Επίπεδα',
                    onClick: () => {
                        Phono.audio.playSfx('click');
                        this.navigate('gameSelect', { levelId });
                    },
                    id: 'btn-back-to-level',
                }),
            ].filter(Boolean)),
        ]);

        this.container.appendChild(screen);

        // Trigger star animation after mount
        requestAnimationFrame(() => {
            document.querySelectorAll('.complete-star').forEach(s => s.offsetHeight); // force reflow
        });
    },

    /* ===========================================
       SETTINGS SCREEN (Therapist Panel)
       =========================================== */
    renderSettings() {
        const { el } = Phono.helpers;

        const overlay = el('div', { className: 'settings-overlay', id: 'settings-overlay' });
        const panel = el('div', { className: 'settings-panel' }, [
            el('h2', { textContent: '⚙️ Ρυθμίσεις Θεραπευτή' }),

            // Sound toggle
            this._settingToggle('Ήχοι παιχνιδιού', 'soundEnabled'),

            // TTS toggle
            this._settingToggle('Εκφώνηση λέξεων (TTS)', 'ttsEnabled'),

            // Round count
            el('div', { className: 'setting-group' }, [
                el('label', { textContent: `Αριθμός γύρων: ${this.settings.roundCount}` }),
                (() => {
                    const range = el('input', {
                        type: 'range',
                        min: '3',
                        max: '10',
                        value: String(this.settings.roundCount),
                    });
                    range.addEventListener('input', (e) => {
                        this.settings.roundCount = parseInt(e.target.value);
                        e.target.previousElementSibling.textContent = `Αριθμός γύρων: ${this.settings.roundCount}`;
                    });
                    return range;
                })(),
            ]),

            // Content selection — lets the teacher restrict which words
            // (Level 2) and sentences (Level 1) the games draw from, e.g.
            // to match what a specific child is currently working on.
            // Persists across sessions (see contentSelection / renderContentPicker).
            el('div', { className: 'setting-group', style: { marginTop: 'var(--space-xl)' } }, [
                el('label', { textContent: 'Περιεχόμενο παιχνιδιού' }),
                el('button', {
                    className: 'btn btn-secondary btn-small w-full',
                    textContent: '📝 Επιλογή Λέξεων & Προτάσεων',
                    onClick: () => this.navigate('contentPicker'),
                }),
            ]),

            // Session log export — per-trial record (stimulus, answer,
            // σωστό/λάθος) across every activity, not just the star
            // scores above. Kept as its own group since it's a therapist
            // reporting tool, not a play setting.
            el('div', { className: 'setting-group', style: { marginTop: 'var(--space-xl)' } }, [
                el('label', { textContent: `Καταγραφή συνεδρίας: ${Phono.sessionLog.getLog().length} εγγραφές` }),
                el('div', { style: { display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' } }, [
                    el('button', {
                        className: 'btn btn-secondary btn-small',
                        textContent: '⬇ Εξαγωγή CSV',
                        onClick: () => Phono.sessionLog.exportCSV(),
                    }),
                    el('button', {
                        className: 'btn btn-secondary btn-small',
                        textContent: '⬇ Εξαγωγή JSON',
                        onClick: () => Phono.sessionLog.exportJSON(),
                    }),
                    el('button', {
                        className: 'btn btn-secondary btn-small',
                        textContent: '🗑 Καθαρισμός',
                        onClick: () => {
                            if (confirm('Θέλεις σίγουρα να διαγραφεί η καταγραφή συνεδρίας;')) {
                                Phono.sessionLog.clear();
                                this.navigate('settings');
                            }
                        },
                    }),
                ]),
            ]),

            // Reset progress
            el('div', { className: 'setting-group', style: { marginTop: 'var(--space-xl)' } }, [
                el('button', {
                    className: 'btn btn-accent btn-small w-full',
                    textContent: 'Μηδενισμός Προόδου',
                    onClick: () => {
                        if (confirm('Θέλεις σίγουρα να μηδενιστεί η πρόοδος;')) {
                            Phono.scoring.resetProgress();
                            Phono.feedback.show('Η πρόοδος μηδενίστηκε!', true);
                        }
                    },
                    id: 'btn-reset-progress',
                }),
            ]),

            // Close buttons
            el('div', { className: 'complete-buttons', style: { marginTop: 'var(--space-xl)' } }, [
                el('button', {
                    className: 'btn btn-primary',
                    textContent: 'Αποθήκευση',
                    onClick: () => {
                        this.saveSettings();
                        Phono.audio.muted = !this.settings.soundEnabled;
                        Phono.audio.playSfx('correct');
                        this.navigate('home');
                    },
                    id: 'btn-save-settings',
                }),
                el('button', {
                    className: 'btn btn-secondary',
                    textContent: '✖ Κλείσιμο',
                    onClick: () => this.navigate('home'),
                    id: 'btn-close-settings',
                }),
            ]),
        ]);

        overlay.appendChild(panel);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.navigate('home');
        });

        // Use a different rendering: overlay on top of current screen
        const screen = el('div', { className: 'home-screen' }); // placeholder
        this.container.appendChild(screen);
        document.body.appendChild(overlay);

        // Clean up overlay when navigating away
        const origNav = this.navigate.bind(this);
        const cleanup = () => {
            if (overlay.parentNode) overlay.remove();
        };
        const origNavRef = this.navigate;
        this.navigate = (s, p) => {
            cleanup();
            this.navigate = origNavRef;
            this.navigate(s, p);
        };
    },

    /* ===========================================
       CONTENT PICKER (Settings -> "Επιλογή Λέξεων & Προτάσεων")
       Lets the teacher restrict which Level 1 sentences and Level 2 words
       every game draws from — one central screen, persisted across
       sessions (unlike the per-entry Level 4 letter picker). Backed by
       Phono.data.getSentencePool() / Phono.data.wordsL2UpToStage(), which
       both fall back to "everything" when nothing is selected.
       =========================================== */
    renderContentPicker() {
        const { el } = Phono.helpers;

        const sentenceSelected = new Set(this.contentSelection.level1Sentences || []);
        const wordSelected = new Set(this.contentSelection.level2Words || []);

        const sentencesByDifficulty = {};
        Phono.data.sentences.forEach(s => {
            (sentencesByDifficulty[s.difficulty] = sentencesByDifficulty[s.difficulty] || []).push(s);
        });
        const difficultyLabels = { 1: '1 λέξη', 2: '2-3 λέξεις', 3: '4 λέξεις', 4: '5 λέξεις' };

        const wordsByStage = {};
        Phono.data.wordsL2.forEach(w => {
            (wordsByStage[w.stage] = wordsByStage[w.stage] || []).push(w);
        });
        const stageLabels = { A: 'Στάδιο Α — δισύλλαβα απλά', B: 'Στάδιο Β — τρισύλλαβα απλά', C: 'Στάδιο Γ — δίψηφα', D: 'Στάδιο Δ — συμπλέγματα' };

        const sentenceCountLabel = el('span', { textContent: `${sentenceSelected.size} / ${Phono.data.sentences.length}` });
        const wordCountLabel = el('span', { textContent: `${wordSelected.size} / ${Phono.data.wordsL2.length}` });

        const sentenceSections = Object.keys(sentencesByDifficulty).sort().map(diff => {
            const items = sentencesByDifficulty[diff];
            const block = this._contentPickerGroupBlock(
                items, sentenceSelected, s => s.text, s => s.text,
                () => { sentenceCountLabel.textContent = `${sentenceSelected.size} / ${Phono.data.sentences.length}`; }
            );
            return el('div', { className: 'content-picker-group' }, [
                el('div', { className: 'content-picker-group-header' }, [
                    el('span', { textContent: `${difficultyLabels[diff] || diff} (${items.length})` }),
                    block.controls,
                ]),
                block.grid,
            ]);
        });

        const wordSections = Phono.data.wordsL2StageOrder.filter(s => wordsByStage[s]).map(stage => {
            const items = wordsByStage[stage];
            const block = this._contentPickerGroupBlock(
                items, wordSelected, w => w.word, w => w.word,
                () => { wordCountLabel.textContent = `${wordSelected.size} / ${Phono.data.wordsL2.length}`; }
            );
            return el('div', { className: 'content-picker-group' }, [
                el('div', { className: 'content-picker-group-header' }, [
                    el('span', { textContent: `${stageLabels[stage] || stage} (${items.length})` }),
                    block.controls,
                ]),
                block.grid,
            ]);
        });

        const saveBtn = el('button', {
            className: 'btn btn-primary',
            textContent: 'Αποθήκευση',
            onClick: () => {
                Phono.audio.playSfx('pop');
                this.contentSelection.level1Sentences = sentenceSelected.size > 0 ? Array.from(sentenceSelected) : null;
                this.contentSelection.level2Words = wordSelected.size > 0 ? Array.from(wordSelected) : null;
                this.saveContentSelection();
                this.navigate('settings');
            },
        });
        const cancelBtn = el('button', {
            className: 'btn btn-secondary',
            textContent: '✖ Ακύρωση',
            onClick: () => this.navigate('settings'),
        });

        const screen = el('div', { className: 'level-select-screen fade-in content-picker-screen' }, [
            el('button', {
                className: 'btn btn-icon btn-back',
                textContent: '←',
                onClick: () => {
                    Phono.audio.playSfx('click');
                    this.navigate('settings');
                },
            }),
            el('div', { className: 'level-select-header' }, [
                el('h1', { textContent: '📝 Επιλογή Λέξεων & Προτάσεων' }),
                el('p', { textContent: 'Διάλεξε ποιες λέξεις και προτάσεις θα χρησιμοποιούνται στα παιχνίδια. Χωρίς επιλογή σε μια ενότητα, χρησιμοποιούνται όλες.' }),
            ]),
            el('div', { className: 'content-picker-section' }, [
                el('div', { className: 'content-picker-section-header' }, [
                    el('h2', { textContent: 'Επίπεδο 1 — Προτάσεις' }),
                    sentenceCountLabel,
                ]),
                ...sentenceSections,
            ]),
            el('div', { className: 'content-picker-section' }, [
                el('div', { className: 'content-picker-section-header' }, [
                    el('h2', { textContent: 'Επίπεδο 2 — Λέξεις' }),
                    wordCountLabel,
                ]),
                ...wordSections,
            ]),
            el('div', { className: 'complete-buttons', style: { marginTop: 'var(--space-xl)' } }, [saveBtn, cancelBtn]),
        ]);

        this.container.appendChild(screen);
    },

    /** Builds one group's chip grid + "Όλα/Κανένα" controls, shared by
     * both sections of renderContentPicker(). `keyOf`/`labelOf` extract an
     * item's unique identity (stored in `selectedSet`) and its display
     * text — same function for both here, but kept separate in case a
     * future section needs a different identity than its label. */
    _contentPickerGroupBlock(items, selectedSet, keyOf, labelOf, onChange) {
        const { el } = Phono.helpers;
        const grid = el('div', { className: 'content-chip-grid' });
        items.forEach(item => {
            const key = keyOf(item);
            const label = labelOf(item);
            const chip = el('button', {
                className: `content-chip${selectedSet.has(key) ? ' selected' : ''}`,
                textContent: label,
                title: label,
                onClick: () => {
                    if (selectedSet.has(key)) selectedSet.delete(key);
                    else selectedSet.add(key);
                    chip.classList.toggle('selected');
                    onChange();
                },
            });
            grid.appendChild(chip);
        });

        const selectAllBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: 'Όλα',
            onClick: () => {
                items.forEach(item => selectedSet.add(keyOf(item)));
                grid.querySelectorAll('.content-chip').forEach(c => c.classList.add('selected'));
                onChange();
            },
        });
        const selectNoneBtn = el('button', {
            className: 'btn btn-secondary btn-small',
            textContent: 'Κανένα',
            onClick: () => {
                items.forEach(item => selectedSet.delete(keyOf(item)));
                grid.querySelectorAll('.content-chip').forEach(c => c.classList.remove('selected'));
                onChange();
            },
        });

        return { grid, controls: el('div', { className: 'content-picker-group-controls' }, [selectAllBtn, selectNoneBtn]) };
    },

    _settingToggle(label, key) {
        const { el } = Phono.helpers;
        const toggle = el('div', { className: `toggle-switch ${this.settings[key] ? 'active' : ''}` });
        toggle.addEventListener('click', () => {
            this.settings[key] = !this.settings[key];
            toggle.classList.toggle('active', this.settings[key]);
        });

        return el('div', { className: 'setting-group' }, [
            el('div', { className: 'setting-toggle' }, [
                el('label', { textContent: label }),
                toggle,
            ]),
        ]);
    },

    /** Save settings to localStorage */
    saveSettings() {
        try {
            localStorage.setItem('phono_settings', JSON.stringify(this.settings));
        } catch (e) { /* ignore */ }
    },

    /** Load settings from localStorage */
    loadSettings() {
        try {
            const saved = localStorage.getItem('phono_settings');
            if (saved) {
                Object.assign(this.settings, JSON.parse(saved));
            }
        } catch (e) { /* ignore */ }
    },

    /** Save the teacher's content selection (words/sentences) to
     * localStorage — a null/missing key is stored as "not set" (removed)
     * rather than an empty array, so loadContentSelection() reliably
     * treats it as "no restriction" on the next visit. */
    saveContentSelection() {
        try {
            ['level1Sentences', 'level2Words'].forEach(key => {
                const value = this.contentSelection[key];
                const storageKey = `phono_contentSelection_${key}`;
                if (value && value.length > 0) localStorage.setItem(storageKey, JSON.stringify(value));
                else localStorage.removeItem(storageKey);
            });
        } catch (e) { /* ignore */ }
    },

    /** Load the teacher's content selection from localStorage. */
    loadContentSelection() {
        try {
            ['level1Sentences', 'level2Words'].forEach(key => {
                const saved = localStorage.getItem(`phono_contentSelection_${key}`);
                this.contentSelection[key] = saved ? JSON.parse(saved) : null;
            });
        } catch (e) { /* ignore */ }
    },
};

/* ===========================================
   GAMES REGISTRY — All games register here
   =========================================== */
Phono.games = Phono.games || {};


/* ===========================================
   BOOT
   =========================================== */
document.addEventListener('DOMContentLoaded', () => {
    Phono.app.init();
});
