/* ============================================================
   ΦΩΝΟΠΑΙΧΝΙΔΙ — Game Engine
   Core systems: GameEngine, AudioManager, DragDrop,
   Feedback, Scoring, Confetti
   ============================================================ */

window.Phono = window.Phono || {};

/* ===========================================
   GAME ENGINE — Base controller for all games
   =========================================== */
Phono.engine = {
    currentGame: null,
    currentRound: 0,
    totalRounds: 5,
    score: 0,
    maxScore: 0,

    /**
     * Start a new game session
     * @param {Object} config - { gameId, totalRounds, onComplete }
     */
    startGame(config) {
        this.currentGame = config.gameId;
        this.currentRound = 0;
        this.totalRounds = config.totalRounds || 5;
        this.score = 0;
        this.maxScore = this.totalRounds;
        return this;
    },

    /** Record a correct answer */
    recordCorrect() {
        this.score++;
    },

    /** Move to next round. Returns false if game is complete */
    nextRound() {
        this.currentRound++;
        return this.currentRound < this.totalRounds;
    },

    /** Get progress as percentage */
    getProgress() {
        return Math.round((this.currentRound / this.totalRounds) * 100);
    },

    /**
     * Get difficulty tier (1-3) based on current round.
     * Tier 1 = first third of rounds (easy)
     * Tier 2 = second third (medium)
     * Tier 3 = last third (hard)
     */
    getDifficultyTier() {
        const round = this.currentRound;
        const total = this.totalRounds;
        if (round < Math.ceil(total / 3)) return 1;
        if (round < Math.ceil(2 * total / 3)) return 2;
        return 3;
    },

    /** Calculate stars (1-3) based on score */
    getStars() {
        const ratio = this.score / this.maxScore;
        if (ratio >= 0.9) return 3;
        if (ratio >= 0.6) return 2;
        if (ratio >= 0.3) return 1;
        return 0;
    },

    /** Complete the game and save progress */
    completeGame() {
        const stars = this.getStars();
        Phono.scoring.saveGameResult(this.currentGame, stars);
        return { stars, score: this.score, total: this.maxScore };
    },
};


/* ===========================================
   AUDIO MANAGER — TTS & Sound Effects
   =========================================== */
Phono.audio = {
    muted: false,
    audioCtx: null,

    // Bumped by Phono.app.navigate() every time the screen changes. A
    // stray setTimeout/await chain left over from the PREVIOUS stage
    // (e.g. mid-way through speakSyllables' syllable-by-syllable loop,
    // or a wordDeletion/syllableRemoval reveal animation's delayed
    // Phono.audio.speak() call) doesn't know the child has already
    // navigated away — cancelling the in-flight utterance once at
    // navigation time doesn't stop it from queuing up a NEW one a moment
    // later. Every speak entry point checks this before actually
    // starting playback, so a stale chain silently stops instead of
    // talking over whatever stage the child is on now.
    navGeneration: 0,

    // Per-stage voice (read-aloud) mute, independent from the general
    // sound mute above — e.g. a teacher reading the words herself can
    // turn off just the voice on one stage without losing sound effects
    // or affecting any other stage.
    voiceMuted: {},
    currentGameId: null,

    init() {
        // Lazy init AudioContext on user interaction
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    /** Toggle mute */
    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    },

    /** Load per-stage voice-mute preferences (survives reloads) */
    loadVoiceMuted() {
        try {
            this.voiceMuted = JSON.parse(localStorage.getItem('phono_voiceMuted')) || {};
        } catch (e) {
            this.voiceMuted = {};
        }
    },

    saveVoiceMuted() {
        try {
            localStorage.setItem('phono_voiceMuted', JSON.stringify(this.voiceMuted));
        } catch (e) { /* ignore */ }
    },

    isVoiceMuted(gameId) {
        return !!this.voiceMuted[gameId];
    },

    /** Toggle the read-aloud voice for one specific stage/game */
    toggleVoiceMute(gameId) {
        this.voiceMuted[gameId] = !this.voiceMuted[gameId];
        this.saveVoiceMuted();
        return this.voiceMuted[gameId];
    },

    /** Cached choice of Greek voice (see getBestGreekVoice) */
    _cachedVoice: undefined,

    /**
     * Pick the best-sounding installed Greek voice. Browsers/OSes often
     * ship several: a basic local one (usually the one that sounds most
     * "robotic") alongside better cloud/neural ones when available
     * (e.g. Edge's "Microsoft ... Online (Natural)" voices). Prefer those
     * when present instead of just taking whichever comes first.
     */
    getBestGreekVoice() {
        if (this._cachedVoice !== undefined) return this._cachedVoice;
        if (!('speechSynthesis' in window)) return null;

        const voices = window.speechSynthesis.getVoices();
        const greekVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('el'));
        if (greekVoices.length === 0) { this._cachedVoice = null; return null; }

        const qualityKeywords = ['natural', 'online', 'neural', 'enhanced', 'premium'];
        const preferred = greekVoices.find(v => qualityKeywords.some(k => v.name.toLowerCase().includes(k)));

        this._cachedVoice = preferred || greekVoices[0];
        return this._cachedVoice;
    },

    /** Speak text using Web Speech API (Greek) */
    speak(text, rate = 0.95) {
        if (this.muted) return Promise.resolve();
        if (this.currentGameId && this.isVoiceMuted(this.currentGameId)) return Promise.resolve();
        const gen = this.navGeneration;
        return new Promise((resolve) => {
            if (!('speechSynthesis' in window)) { resolve(); return; }
            window.speechSynthesis.cancel();
            // Chrome/Web Speech API quirk: calling speak() in the same tick
            // as cancel() often clips the start of the next utterance —
            // very noticeable on short single-syllable audio. A tiny delay
            // lets the engine actually reset before queuing the next one.
            setTimeout(() => {
                // The app navigated to a different screen while this was
                // waiting — don't let a stale call start talking now.
                if (gen !== this.navGeneration) { resolve(); return; }
                this._queueUtterance(text, rate, resolve);
            }, 60);
        });
    },

    /** Build and queue one utterance without calling cancel() first — used
     * for a sequence (speakSyllables/speakPhonemes) that already cleared
     * the queue once up front, since a mid-sequence cancel() risks
     * clipping the tail of the item that just finished playing (onend can
     * fire slightly before the system audio actually finishes draining
     * it). */
    _queueUtterance(text, rate, resolve) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'el-GR';
        utterance.rate = rate;
        utterance.pitch = 1.0;
        utterance.volume = 1;

        const voice = this.getBestGreekVoice();
        if (voice) utterance.voice = voice;

        utterance.onend = resolve;
        utterance.onerror = resolve;
        window.speechSynthesis.speak(utterance);
    },

    /** Speak syllables one by one with pauses */
    async speakSyllables(syllables, delay = 700) {
        if (this.muted) return;
        if (this.currentGameId && this.isVoiceMuted(this.currentGameId)) return;
        if (!('speechSynthesis' in window)) return;

        // Cancel exactly once, up front, then queue every syllable back
        // to back without cancelling again in between — repeatedly
        // cancelling before EACH syllable (as this used to do, via
        // this.speak()) was cutting off the tail of the syllable that
        // had just finished.
        const gen = this.navGeneration;
        window.speechSynthesis.cancel();
        await this._wait(80);

        for (let i = 0; i < syllables.length; i++) {
            // The app navigated away mid-sequence — stop here instead of
            // continuing to speak syllables over whatever screen is up now.
            if (gen !== this.navGeneration) return;
            // Trailing period: some Greek voices otherwise treat a bare
            // 2-letter syllable (e.g. "δι") as an abbreviation and spell
            // out the letter names ("δέλτα γιώτα") instead of reading it
            // as a syllable.
            await new Promise(resolve => this._queueUtterance(syllables[i] + '.', 0.7, resolve));
            if (i < syllables.length - 1) {
                await this._wait(delay);
            }
        }
    },

    /** Speak phonemes one by one */
    async speakPhonemes(phonemes, delay = 550) {
        if (this.muted) return;
        if (this.currentGameId && this.isVoiceMuted(this.currentGameId)) return;
        if (!('speechSynthesis' in window)) return;

        const gen = this.navGeneration;
        window.speechSynthesis.cancel();
        await this._wait(80);

        for (let i = 0; i < phonemes.length; i++) {
            if (gen !== this.navGeneration) return;
            await new Promise(resolve => this._queueUtterance(phonemes[i], 0.6, resolve));
            if (i < phonemes.length - 1) {
                await this._wait(delay);
            }
        }
    },

    /** Play a synthesized sound effect */
    playSfx(type) {
        if (this.muted) return;
        this.init();
        const ctx = this.audioCtx;
        const now = ctx.currentTime;
        
        switch (type) {
            case 'correct': this._playTone(ctx, [523.25, 659.25, 783.99], 0.15, 'sine', 0.3); break;
            case 'wrong': this._playTone(ctx, [311, 233], 0.2, 'sawtooth', 0.15); break;
            case 'clap': this._playNoise(ctx, 0.08); break;
            case 'tap': this._playTone(ctx, [440], 0.05, 'sine', 0.2); break;
            case 'pop': this._playTone(ctx, [600, 800], 0.06, 'sine', 0.25); break;
            case 'flip': this._playTone(ctx, [300, 500], 0.08, 'triangle', 0.15); break;
            case 'match': this._playTone(ctx, [523.25, 659.25, 783.99, 1046.5], 0.15, 'sine', 0.2); break;
            case 'star': this._playTone(ctx, [783.99, 987.77, 1174.66], 0.2, 'sine', 0.25); break;
            case 'fanfare': this._playFanfare(ctx); break;
            case 'drop': this._playTone(ctx, [350, 250], 0.05, 'triangle', 0.2); break;
            case 'click': this._playTone(ctx, [1000], 0.03, 'square', 0.08); break;
        }
    },

    /** Internal: play a sequence of tones */
    _playTone(ctx, freqs, duration, type, volume) {
        freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(volume, ctx.currentTime + i * duration);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (i + 1) * duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * duration);
            osc.stop(ctx.currentTime + (i + 1) * duration + 0.05);
        });
    },

    /** Internal: play noise burst (for clap sound) */
    _playNoise(ctx, duration) {
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
    },

    /** Internal: play fanfare */
    _playFanfare(ctx) {
        const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
        const durations = [0.15, 0.15, 0.15, 0.3, 0.15, 0.4];
        let time = ctx.currentTime;
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + durations[i]);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + durations[i] + 0.05);
            time += durations[i];
        });
    },

    /** Internal: wait helper */
    _wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
};

/* ===========================================
   ASSIST SETTINGS — Per-stage optional visual aids
   =========================================== */
Phono.assist = {
    // Word-by-word color highlight while clapping (wordCounting): on by
    // default (it helps most kids), but a teacher can turn it off per
    // stage for a child who doesn't need the extra cue.
    highlightDisabled: {},

    loadHighlightDisabled() {
        try {
            this.highlightDisabled = JSON.parse(localStorage.getItem('phono_highlightDisabled')) || {};
        } catch (e) {
            this.highlightDisabled = {};
        }
    },

    saveHighlightDisabled() {
        try {
            localStorage.setItem('phono_highlightDisabled', JSON.stringify(this.highlightDisabled));
        } catch (e) { /* ignore */ }
    },

    isHighlightEnabled(gameId) {
        return !this.highlightDisabled[gameId];
    },

    /** Toggle for one specific stage/game. Returns the new enabled state. */
    toggleHighlight(gameId) {
        this.highlightDisabled[gameId] = !this.highlightDisabled[gameId];
        this.saveHighlightDisabled();
        return !this.highlightDisabled[gameId];
    },
};

// Load voices when available. The list often arrives asynchronously after
// the first call, so drop the cached choice and let getBestGreekVoice()
// re-pick once the full (better) list is in.
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
        Phono.audio._cachedVoice = undefined;
    };
}


/* ===========================================
   DRAG & DROP ENGINE — Touch & Mouse support
   =========================================== */
Phono.dragDrop = {
    _activeDrag: null,
    _dragClone: null,
    _offsetX: 0,
    _offsetY: 0,
    _dropZones: [],

    /**
     * Make elements draggable
     * @param {string} containerSelector - parent container
     * @param {string} itemSelector - draggable items class
     * @param {Function} onDrop - callback(draggedEl, dropZoneEl)
     */
    init(containerSelector, itemSelector, dropZoneSelector, onDrop) {
        this._dropZones = [];
        this._onDropCallback = onDrop;

        const container = document.querySelector(containerSelector);
        if (!container) return;

        // Register drop zones
        document.querySelectorAll(dropZoneSelector).forEach(zone => {
            this._dropZones.push(zone);
        });

        // Bind events to draggable items
        container.querySelectorAll(itemSelector).forEach(item => {
            this._bindDragEvents(item);
        });
    },

    /** Re-register drop zones (call after DOM changes) */
    updateDropZones(dropZoneSelector) {
        this._dropZones = Array.from(document.querySelectorAll(dropZoneSelector));
    },

    _bindDragEvents(el) {
        // Mouse events
        el.addEventListener('mousedown', (e) => this._onDragStart(e, el));
        // Touch events
        el.addEventListener('touchstart', (e) => this._onDragStart(e, el), { passive: false });
    },

    _onDragStart(e, el) {
        if (el.classList.contains('placed')) return;
        e.preventDefault();

        const rect = el.getBoundingClientRect();
        const point = e.touches ? e.touches[0] : e;

        this._activeDrag = el;
        this._offsetX = point.clientX - rect.left;
        this._offsetY = point.clientY - rect.top;

        // Create floating clone
        this._dragClone = el.cloneNode(true);
        this._dragClone.style.position = 'fixed';
        this._dragClone.style.zIndex = '1000';
        this._dragClone.style.width = rect.width + 'px';
        this._dragClone.style.pointerEvents = 'none';
        this._dragClone.style.transform = 'scale(1.1) rotate(2deg)';
        this._dragClone.style.opacity = '0.9';
        this._dragClone.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
        this._dragClone.style.left = (point.clientX - this._offsetX) + 'px';
        this._dragClone.style.top = (point.clientY - this._offsetY) + 'px';
        document.body.appendChild(this._dragClone);

        el.classList.add('dragging');
        el.style.opacity = '0.4';

        Phono.audio.playSfx('click');

        // Bind move/end
        const moveHandler = (e2) => this._onDragMove(e2);
        const endHandler = (e2) => {
            this._onDragEnd(e2);
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', endHandler);
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('touchend', endHandler);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', endHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('touchend', endHandler);
    },

    _onDragMove(e) {
        if (!this._dragClone) return;
        e.preventDefault();
        const point = e.touches ? e.touches[0] : e;
        this._dragClone.style.left = (point.clientX - this._offsetX) + 'px';
        this._dragClone.style.top = (point.clientY - this._offsetY) + 'px';

        // Highlight drop zones
        this._dropZones.forEach(zone => {
            const rect = zone.getBoundingClientRect();
            const isOver = point.clientX >= rect.left && point.clientX <= rect.right &&
                          point.clientY >= rect.top && point.clientY <= rect.bottom;
            zone.classList.toggle('drag-over', isOver);
        });
    },

    _onDragEnd(e) {
        if (!this._activeDrag) return;
        const point = e.changedTouches ? e.changedTouches[0] : e;

        // Find which drop zone we're over
        let targetZone = null;
        this._dropZones.forEach(zone => {
            const rect = zone.getBoundingClientRect();
            if (point.clientX >= rect.left && point.clientX <= rect.right &&
                point.clientY >= rect.top && point.clientY <= rect.bottom) {
                targetZone = zone;
            }
            zone.classList.remove('drag-over');
        });

        // Remove clone
        if (this._dragClone) {
            this._dragClone.remove();
            this._dragClone = null;
        }

        // Reset original element
        this._activeDrag.classList.remove('dragging');
        this._activeDrag.style.opacity = '';

        // Call onDrop callback
        if (targetZone && this._onDropCallback) {
            Phono.audio.playSfx('drop');
            this._onDropCallback(this._activeDrag, targetZone);
        }

        this._activeDrag = null;
    },

    /** Clean up all bindings */
    destroy() {
        this._activeDrag = null;
        if (this._dragClone) {
            this._dragClone.remove();
            this._dragClone = null;
        }
        this._dropZones = [];
    },
};


/* ===========================================
   FEEDBACK — Visual feedback system
   =========================================== */
Phono.feedback = {
    /** Show a floating feedback message */
    show(text, isCorrect = true) {
        const existing = document.querySelector('.feedback-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'feedback-overlay';
        overlay.innerHTML = `<div class="feedback-message ${isCorrect ? 'correct' : 'wrong'}">${text}</div>`;
        document.body.appendChild(overlay);

        // Play sound
        Phono.audio.playSfx(isCorrect ? 'correct' : 'wrong');

        setTimeout(() => overlay.remove(), 1300);
    },

    /** Show random encouragement message */
    showCorrect() {
        const msg = Phono.data.getRandom(Phono.data.encouragement.correct);
        this.show(msg, true);
    },

    showWrong() {
        this.show('Προσπάθησε πάλι!', false);
    },

    /** Highlight element with correct/wrong animation */
    highlightElement(el, isCorrect) {
        el.classList.add(isCorrect ? 'correct' : 'wrong');
        setTimeout(() => {
            el.classList.remove('correct', 'wrong');
        }, 800);
    },
};


/* ===========================================
   SCORING — Progress & Stars persistence
   =========================================== */
Phono.scoring = {
    STORAGE_KEY: 'phono_progress',

    /** Get all saved progress */
    getProgress() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch {
            return {};
        }
    },

    /** Save game result (keeps best score) */
    saveGameResult(gameId, stars) {
        const progress = this.getProgress();
        if (!progress[gameId] || progress[gameId] < stars) {
            progress[gameId] = stars;
        }
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
    },

    /** Get stars for a specific game */
    getGameStars(gameId) {
        const progress = this.getProgress();
        return progress[gameId] || 0;
    },

    /** Get total stars for a level */
    getLevelStars(levelId) {
        const level = Phono.data.levels.find(l => l.id === levelId);
        if (!level) return { earned: 0, total: 0 };
        let earned = 0;
        let total = level.games.length * 3;
        level.games.forEach(g => {
            earned += this.getGameStars(g.id);
        });
        return { earned, total };
    },

    /** Get star display string (⭐/☆) */
    getStarDisplay(count, max = 3) {
        let s = '';
        for (let i = 0; i < max; i++) {
            s += i < count ? '⭐' : '☆';
        }
        return s;
    },

    /** Reset all progress */
    resetProgress() {
        localStorage.removeItem(this.STORAGE_KEY);
    },
};


/* ===========================================
   DIAGNOSTICS — Records specific mistake patterns
   (not just right/wrong) so a teacher can see WHY a
   child got something wrong, not only that they did.
   =========================================== */
Phono.diagnostics = {
    STORAGE_KEY: 'phono_diagnostics',

    getLog() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    /** Record a categorized mistake. Kept as a capped list of recent entries. */
    record(gameId, type, details) {
        const log = this.getLog();
        log.push({ gameId, type, details, ts: Date.now() });
        if (log.length > 200) log.splice(0, log.length - 200);
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(log));
        } catch (e) { /* ignore */ }
    },

    /** Count how many times a mistake type was recorded for a game */
    countByType(gameId, type) {
        return this.getLog().filter(e => e.gameId === gameId && e.type === type).length;
    },
};


/* ===========================================
   SESSION LOG — Per-trial record for every activity: what was shown,
   what the child answered, and whether it was right, so a therapist can
   review or export a plain summary after the session (not just stars).
   =========================================== */
Phono.sessionLog = {
    STORAGE_KEY: 'phono_sessionLog',

    getLog() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    /** Record one trial. `activity` is the game id (e.g. "syllableSplit"),
     * `stimulus` is whatever was shown/spoken (a word, sentence, etc.),
     * `response` is what the child answered (or null if not applicable),
     * `correct` is a plain boolean. Capped so a very long session doesn't
     * grow localStorage without bound — same pattern as the diagnostics
     * log above. */
    record(activity, stimulus, response, correct) {
        const log = this.getLog();
        log.push({ activity, stimulus, response, correct: !!correct, ts: Date.now() });
        if (log.length > 1000) log.splice(0, log.length - 1000);
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(log));
        } catch (e) { /* ignore */ }
    },

    clear() {
        try { localStorage.removeItem(this.STORAGE_KEY); } catch (e) { /* ignore */ }
    },

    _dateStamp() {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
    },

    /** Triggers a browser download for `content` — no server involved,
     * just a throwaway <a download> pointed at a Blob URL. */
    _download(filename, content, mime) {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    },

    exportJSON() {
        this._download(`fonologiki-katagrafi-${this._dateStamp()}.json`, JSON.stringify(this.getLog(), null, 2), 'application/json');
    },

    /** CSV with a UTF-8 BOM so Excel opens the Greek text correctly
     * instead of mangling it as some other encoding. */
    exportCSV() {
        const escape = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
        const header = 'δραστηριότητα,ερέθισμα,απάντηση,σωστό/λάθος,ημερομηνία\n';
        const rows = this.getLog().map(e => [
            escape(e.activity),
            escape(e.stimulus),
            escape(e.response),
            e.correct ? 'σωστό' : 'λάθος',
            escape(new Date(e.ts).toLocaleString('el-GR')),
        ].join(','));
        this._download(`fonologiki-katagrafi-${this._dateStamp()}.csv`, '﻿' + header + rows.join('\n'), 'text/csv;charset=utf-8');
    },
};


/* ===========================================
   CONFETTI — Canvas-based celebration
   =========================================== */
Phono.confetti = {
    particles: [],
    canvas: null,
    ctx: null,
    animId: null,

    /** Launch confetti burst */
    launch(duration = 3000) {
        this.canvas = document.getElementById('confetti-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Create particles
        const colors = ['#B8A9E8', '#A8E6CF', '#FFB7B2', '#87CEEB', '#FFE082', '#FF6B6B', '#4ECDC4'];
        this.particles = [];
        for (let i = 0; i < 80; i++) {
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

        // Animate
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1; // gravity
                p.rotation += p.rotSpeed;

                if (elapsed > duration - 1000) {
                    p.opacity = Math.max(0, p.opacity - 0.02);
                }

                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.rotation * Math.PI) / 180);
                this.ctx.globalAlpha = p.opacity;
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                this.ctx.restore();
            });

            if (elapsed < duration) {
                this.animId = requestAnimationFrame(animate);
            } else {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        };

        if (this.animId) cancelAnimationFrame(this.animId);
        animate();
    },

    stop() {
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },
};


/* ===========================================
   HELPERS — Shared utility functions
   =========================================== */
Phono.helpers = {
    /** Create DOM element with attributes */
    el(tag, attrs = {}, children = []) {
        const elem = document.createElement(tag);
        Object.entries(attrs).forEach(([key, val]) => {
            if (key === 'className') elem.className = val;
            else if (key === 'textContent') elem.textContent = val;
            else if (key === 'innerHTML') elem.innerHTML = val;
            else if (key.startsWith('on')) elem.addEventListener(key.slice(2).toLowerCase(), val);
            else if (key === 'style' && typeof val === 'object') Object.assign(elem.style, val);
            else elem.setAttribute(key, val);
        });
        children.forEach(child => {
            if (typeof child === 'string') elem.appendChild(document.createTextNode(child));
            else if (child) elem.appendChild(child);
        });
        return elem;
    },

    /** Wait ms then resolve */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /** Greek vowels check */
    isGreekVowel(char) {
        return 'αεηιοωυάέήίόώύϊϋΐΰ'.includes(char.toLowerCase());
    },

    /** Check if phoneme is a vowel sound */
    isVowelSound(phoneme) {
        const vowelSounds = ['α', 'ε', 'η', 'ι', 'ο', 'ω', 'υ', 'ου', 'ει', 'οι', 'αι', 'αυ', 'ευ'];
        return vowelSounds.includes(phoneme.toLowerCase());
    },
};
