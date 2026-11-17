document.addEventListener('DOMContentLoaded', () => {

    // --- Constants ---
    const OPS_345 = [[3,3],[3,4],[3,5],[4,4],[4,5],[5,5],[3,6]];

    // --- State ---
    let currentMode   = null;
    let playerCount   = 1;
    let selectedTime  = 60;
    let timeLeft      = 60;
    let timerInterval = null;
    let isReviewMode  = false;

    // Question pools: 0=single player, 1=player1, 2=player2
    const pools = {
        0: { list: [], idx: 0 },
        1: { list: [], idx: 0 },
        2: { list: [], idx: 0 }
    };

    // Wrong answers (Map: "min,max" -> [min,max])
    const wrongMap = new Map();

    // Single player
    let score         = 0;
    let correctAnswer = null;
    let currentPair   = [0, 0];
    let waiting       = false;

    // Two player
    const p = {
        1: { score: 0, correct: null, pair: [0,0], waiting: false },
        2: { score: 0, correct: null, pair: [0,0], waiting: false }
    };

    // --- DOM ---
    const app        = document.getElementById('app');
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const twoScreen  = document.getElementById('two-player-screen');
    const gameOver   = document.getElementById('game-over');

    const btn1p  = document.getElementById('btn-1p');
    const btn2p  = document.getElementById('btn-2p');

    const scoreEl       = document.getElementById('score');
    const questionEl    = document.getElementById('question');
    const answerEl      = document.getElementById('answer-display');
    const feedbackEl    = document.getElementById('feedback-inline');
    const timerEl       = document.getElementById('timer-display');
    const timerEl2p     = document.getElementById('timer-display-2p');
    const gameOverTitle = document.getElementById('game-over-title');
    const reviewBtn     = document.getElementById('review-btn');

    const el = {
        1: {
            score:    document.getElementById('score-p1'),
            question: document.getElementById('question-p1'),
            answer:   document.getElementById('answer-p1'),
            feedback: document.getElementById('feedback-p1')
        },
        2: {
            score:    document.getElementById('score-p2'),
            question: document.getElementById('question-p2'),
            answer:   document.getElementById('answer-p2'),
            feedback: document.getElementById('feedback-p2')
        }
    };

    // --- Player toggle ---
    btn1p.addEventListener('click', () => {
        playerCount = 1;
        btn1p.classList.add('selected');
        btn2p.classList.remove('selected');
    });
    btn2p.addEventListener('click', () => {
        playerCount = 2;
        btn2p.classList.add('selected');
        btn1p.classList.remove('selected');
    });

    // --- Time selection ---
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedTime = parseInt(btn.dataset.time);
        });
    });

    // --- Menu / game over buttons ---
    document.querySelector('.mode-012').addEventListener('click', () => startGame('012'));
    document.querySelector('.mode-345').addEventListener('click', () => startGame('345'));
    document.querySelector('.mode-all').addEventListener('click', () => startGame('all'));
    document.getElementById('back-btn').addEventListener('click', showMenu);
    document.getElementById('back-btn-2p').addEventListener('click', showMenu);
    document.getElementById('play-again-btn').addEventListener('click', () => {
        gameOver.classList.add('hidden');
        isReviewMode = false;
        startGame(currentMode);
    });
    document.getElementById('go-menu-btn').addEventListener('click', () => {
        gameOver.classList.add('hidden');
        isReviewMode = false;
        showMenu();
    });
    reviewBtn.addEventListener('click', () => {
        gameOver.classList.add('hidden');
        startReview();
    });

    // ─── Pool management ───────────────────────────────────────────────────────

    function buildPool(mode) {
        const seen  = new Set();
        const pairs = [];
        const add   = (a, b) => {
            const key = `${Math.min(a,b)},${Math.max(a,b)}`;
            if (!seen.has(key)) { seen.add(key); pairs.push([Math.min(a,b), Math.max(a,b)]); }
        };
        if (mode === '012' || mode === 'all') {
            for (let a = 0; a <= 2; a++)
                for (let b = 0; b <= 10; b++) add(a, b);
        }
        if (mode === '345' || mode === 'all') {
            OPS_345.forEach(([a,b]) => add(a, b));
        }
        return shuffle(pairs);
    }

    function initPools(mode) {
        [0, 1, 2].forEach(k => { pools[k].list = buildPool(mode); pools[k].idx = 0; });
    }

    function nextFromPool(key) {
        const pool = pools[key];
        if (pool.idx >= pool.list.length) {
            if (isReviewMode) return null;
            shuffle(pool.list);
            pool.idx = 0;
        }
        const [a, b] = pool.list[pool.idx++];
        return Math.random() > 0.5 ? [a, b] : [b, a];
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ─── Wrong answer tracking ─────────────────────────────────────────────────

    function trackWrong(n1, n2) {
        const key = `${Math.min(n1,n2)},${Math.max(n1,n2)}`;
        if (!wrongMap.has(key)) wrongMap.set(key, [Math.min(n1,n2), Math.max(n1,n2)]);
    }

    // ─── Game flow ──────────────────────────────────────────────────────────────

    function startGame(mode) {
        currentMode = mode;
        wrongMap.clear();
        initPools(mode);
        menuScreen.classList.remove('active');

        gtag('event', 'page_view', {
            page_title:    'Παιχνίδι - ' + mode,
            page_location: window.location.href + '#game'
        });
        gtag('event', 'game_start', {
            mode:    mode,
            players: playerCount,
            time:    selectedTime
        });

        timerEl.style.visibility = '';

        if (playerCount === 2) {
            p[1].score = 0; p[2].score = 0;
            el[1].score.textContent = '0';
            el[2].score.textContent = '0';
            app.classList.add('two-player-mode');
            twoScreen.classList.add('active');
            newQuestion(1);
            newQuestion(2);
            startTimer(timerEl2p);
        } else {
            score = 0;
            scoreEl.textContent = '0';
            gameScreen.classList.add('active');
            newQuestion(0);
            startTimer(timerEl);
        }
    }

    function startReview() {
        gtag('event', 'review_start', { wrong_count: wrongMap.size });
        const reviewPairs = shuffle(Array.from(wrongMap.values()));
        wrongMap.clear();

        pools[0].list = reviewPairs;
        pools[0].idx  = 0;

        isReviewMode = true;
        score        = 0;
        scoreEl.textContent = '0';

        twoScreen.classList.remove('active');
        app.classList.remove('two-player-mode');
        gameScreen.classList.add('active');

        // Κρύβουμε τον χρόνο στην επανάληψη
        timerEl.style.visibility = 'hidden';
        stopTimer();

        newQuestion(0);
    }

    function showMenu() {
        stopTimer();
        gameScreen.classList.remove('active');
        twoScreen.classList.remove('active');
        menuScreen.classList.add('active');
        app.classList.remove('two-player-mode');
        currentMode  = null;
        waiting      = false;
        isReviewMode = false;
        feedbackEl.className     = 'feedback-inline hidden';
        timerEl.style.visibility = '';
        gtag('event', 'page_view', {
            page_title:    'Μενού',
            page_location: window.location.href + '#menu'
        });
    }

    // ─── Timer ─────────────────────────────────────────────────────────────────

    function startTimer(display) {
        stopTimer();
        timeLeft = selectedTime;
        updateTimerDisplay(display);
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay(display);
            if (timeLeft <= 0) { stopTimer(); showGameOver(); }
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        timerEl.classList.remove('warning');
        timerEl2p.classList.remove('warning');
    }

    function updateTimerDisplay(display) {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        display.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        display.classList.toggle('warning', timeLeft <= 10);
    }

    // ─── Game over ─────────────────────────────────────────────────────────────

    function showGameOver(reviewCompleted = false) {
        const scoresDiv = document.getElementById('game-over-scores');

        if (reviewCompleted) {
            gameOverTitle.textContent = '🎉 Μπράβο! Τα έλυσες όλα!';
        } else {
            gameOverTitle.textContent = '⏰ Τελείωσε ο χρόνος!';
        }

        if (playerCount === 2 && !isReviewMode) {
            const s1 = p[1].score, s2 = p[2].score;
            const winner = s1 > s2
                ? `<div class="winner">🏆 Νικητής: Παίκτης 1!</div>`
                : s2 > s1
                    ? `<div class="winner">🏆 Νικητής: Παίκτης 2!</div>`
                    : `<div class="winner">🤝 Ισοπαλία!</div>`;
            scoresDiv.innerHTML = `
                ${winner}
                <div>🔵 Παίκτης 1: <strong>${s1}</strong> πόντοι</div>
                <div>🔴 Παίκτης 2: <strong>${s2}</strong> πόντοι</div>`;
        } else {
            scoresDiv.innerHTML = `<div>Σκορ: <strong>${score}</strong> πόντοι ⭐</div>`;
        }

        if (wrongMap.size > 0) {
            reviewBtn.style.display = '';
            reviewBtn.textContent   = `📝 Επανάληψη Λαθών (${wrongMap.size})`;
        } else {
            reviewBtn.style.display = 'none';
        }

        if (playerCount === 2 && !isReviewMode) {
            gtag('event', 'game_end', {
                score_p1:    p[1].score,
                score_p2:    p[2].score,
                wrong_count: wrongMap.size,
                mode:        currentMode,
                time:        selectedTime
            });
        } else {
            gtag('event', 'game_end', {
                score:       score,
                wrong_count: wrongMap.size,
                mode:        currentMode,
                time:        selectedTime,
                review:      isReviewMode
            });
        }

        gameOver.classList.remove('hidden');
    }

    // ─── Answer choices (4 buttons, the child picks the right one) ─────────────

    // 3 plausible wrong answers (a neighbour product, a sum, a near number) + the right one, shuffled
    function makeChoices(a, b) {
        const r = a * b;
        const cand = [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, a + b, r + 1, r - 1, r + 2, r - 2, r + 10, r - 10];
        const wrong = shuffle([...new Set(cand.filter(v => v >= 0 && v !== r))]).slice(0, 3);
        for (let x = 0; wrong.length < 3; x++) if (x !== r && !wrong.includes(x)) wrong.push(x);
        return shuffle([r, ...wrong]);
    }

    function renderChoices(player, a, b) {
        const box = document.getElementById('choices-' + player);
        box.innerHTML = '';
        makeChoices(a, b).forEach(v => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'choice-btn';
            btn.textContent = v;
            btn.addEventListener('click', () => handleChoice(player, btn, v));
            box.appendChild(btn);
        });
    }

    function handleChoice(player, btn, value) {
        const single = player === 0;
        const st     = single ? null : p[player];
        if (single ? waiting : st.waiting) return;
        const correct  = single ? correctAnswer : st.correct;
        const pair     = single ? currentPair : st.pair;
        const feedback = single ? feedbackEl : el[player].feedback;
        const answer   = single ? answerEl : el[player].answer;

        if (value === correct) {
            btn.classList.add('right');
            document.querySelectorAll('#choices-' + player + ' .choice-btn').forEach(b => { b.disabled = true; });
            answer.textContent = value;
            if (single) {
                score += 10;
                scoreEl.textContent = score;
                scoreEl.style.animation = 'none';
                void scoreEl.offsetWidth;
                scoreEl.style.animation = 'pulse 0.5s';
                waiting = true;
            } else {
                st.score += 10;
                el[player].score.textContent = st.score;
                st.waiting = true;
            }
            setFeedback(feedback, true);
            setTimeout(() => newQuestion(player), 1200);
        } else {
            trackWrong(...pair);
            setFeedback(feedback, false);
            btn.classList.add('wrong');
            btn.disabled = true;
        }
    }

    // ─── Generate question ─────────────────────────────────────────────────────

    function newQuestion(player) {
        const pair = nextFromPool(player);
        if (!pair) { showGameOver(true); return; } // επανάληψη ολοκληρώθηκε
        const [n1, n2] = pair;
        const result   = n1 * n2;

        if (player === 0) {
            waiting       = false;
            correctAnswer = result;
            currentPair   = [n1, n2];
            answerEl.textContent   = ';';
            feedbackEl.className   = 'feedback-inline hidden';
            questionEl.textContent = `${n1} × ${n2}`;
            renderChoices(0, n1, n2);
        } else {
            p[player].waiting = false;
            p[player].correct = result;
            p[player].pair    = [n1, n2];
            el[player].answer.textContent   = ';';
            el[player].feedback.className   = 'feedback-inline hidden';
            el[player].question.textContent = `${n1} × ${n2}`;
            renderChoices(player, n1, n2);
        }
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    function setFeedback(el, isCorrect) {
        el.className   = `feedback-inline ${isCorrect ? 'correct' : 'wrong'}`;
        el.textContent = isCorrect ? '✓ Σωστό!' : '✗ Λάθος! Διάλεξε άλλη απάντηση.';
    }
});
