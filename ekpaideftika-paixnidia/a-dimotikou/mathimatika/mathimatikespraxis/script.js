// GA4 Event Tracking Helper
function trackEvent(eventName, params) {
    try {
        if (typeof gtag === 'function') {
            gtag('event', eventName, params || {});
        }
    } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {

    // Screens
    const operationSelectionScreen = document.getElementById('operation-selection-screen');
    const selectionScreen = document.getElementById('selection-screen');
    const timeSelectionScreen = document.getElementById('time-selection-screen');
    const gameContainer = document.getElementById('game-container');
    const gameOverScreen = document.getElementById('game-over-screen');
    
    // Buttons
    const btnSingle = document.getElementById('btn-single');
    const btnTablet = document.getElementById('btn-tablet');
    const btnBoard = document.getElementById('btn-board');
    const btnBack = document.getElementById('btn-back');
    const btnBackToOp = document.getElementById('btn-back-to-op');
    const btnBackToMode = document.getElementById('btn-back-to-mode');
    const btnPlayAgain = document.getElementById('btn-play-again');
    const btnReplayMistakes = document.getElementById('btn-replay-mistakes');
    const btnHome = document.getElementById('btn-home');

    // Global Game State
    let selectedOperation = '';
    let selectedMode = '';
    let selectedTime = 0;
    let timerInterval = null;
    let remainingTime = 0;
    let isReplayMode = false;

    // Player State
    const players = {
        1: { score: 0, answerStr: '', currentAnswer: 0, isActive: false, usedProblems: new Set(), mistakenProblems: [] },
        2: { score: 0, answerStr: '', currentAnswer: 0, isActive: false, usedProblems: new Set(), mistakenProblems: [] }
    };

    // Elements
    const getEl = (id) => document.getElementById(id);
    const scoreEls = { 1: getEl('score-p1'), 2: getEl('score-p2') };
    const num1Els = { 1: getEl('num1-p1'), 2: getEl('num1-p2') };
    const num2Els = { 1: getEl('num2-p1'), 2: getEl('num2-p2') };
    const opEls = { 1: getEl('operator-p1'), 2: getEl('operator-p2') };
    const answerEls = { 1: getEl('answer-p1'), 2: getEl('answer-p2') };
    const feedbackEls = { 1: getEl('feedback-p1'), 2: getEl('feedback-p2') };
    const timerEls = { 1: getEl('timer-p1'), 2: getEl('timer-p2') };

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function updateAnswerDisplay(player) {
        answerEls[player].textContent = players[player].answerStr;
    }

    function generateProblem(p) {
        players[p].isActive = true;
        players[p].answerStr = '';
        updateAnswerDisplay(p);

        feedbackEls[p].className = 'feedback';
        feedbackEls[p].textContent = '';

        if (isReplayMode) {
            if (players[p].mistakenProblems.length === 0) {
                players[p].isActive = false;
                opEls[p].textContent = '✔️';
                answerEls[p].textContent = '';
                num1Els[p].textContent = '';
                num2Els[p].textContent = '';
                checkEndMistakesReplay();
                return;
            }
            const mistake = players[p].mistakenProblems.shift();
            let num1 = mistake.num1;
            let num2 = mistake.num2;
            let answer = mistake.answer;
            let operator = mistake.operator;
            players[p].currentProblemAttempt = { num1, num2, answer, operator, handledMistake: true }; // already handled so it doesn't get saved again
            players[p].currentAnswer = answer;
            opEls[p].textContent = operator;
            num1Els[p].textContent = num1;
            num2Els[p].textContent = num2;
            num1Els[p].classList.add('pop-animation');
            num2Els[p].classList.add('pop-animation');
            setTimeout(() => {
                num1Els[p].classList.remove('pop-animation');
                num2Els[p].classList.remove('pop-animation');
            }, 400);
            return;
        }

        let num1, num2, answer, operator;
        let problemKey;
        let attempts = 0;
        const maxAttempts = 2000; // increase attempts to ensure we find all combinations mathematically

        do {
            let activeOp = selectedOperation;
            if (activeOp === 'mix') {
                const ops = ['add10', 'addBridge', 'addTeen', 'sub10', 'subBreak', 'subTeen'];
                activeOp = ops[getRandomInt(0, ops.length - 1)];
            }

            if (activeOp === 'add10') {
                answer = getRandomInt(2, 10);
                num1 = getRandomInt(1, answer - 1);
                num2 = answer - num1;
                operator = '+';
            } else if (activeOp === 'addBridge') {
                // Single digits 2-9, sum > 10
                num1 = getRandomInt(2, 9);
                // num2 must be large enough to break 10, but max 9
                const minNum2 = 11 - num1;
                num2 = getRandomInt(Math.max(2, minNum2), 9);
                answer = num1 + num2;
                operator = '+';
            } else if (activeOp === 'addTeen') {
                // One two-digit (10-19), one single-digit (1-9), sum <= 20
                num1 = getRandomInt(10, 19);
                num2 = getRandomInt(1, 20 - num1);
                answer = num1 + num2;
                operator = '+';
                
                // 50% chance to swap num1 and num2 so the single digit isn't always second
                if (Math.random() < 0.5) {
                    let temp = num1;
                    num1 = num2;
                    num2 = temp;
                }
            } else if (activeOp === 'sub10') {
                // Up to 10
                num1 = getRandomInt(1, 10);
                num2 = getRandomInt(1, num1); // answer won't be negative
                answer = num1 - num2;
                operator = '-';
            } else if (activeOp === 'subBreak') {
                // First is 11-18, subtract 2-9, answer < 10
                num1 = getRandomInt(11, 18);
                // minNum2 must be enough to bring it under 10
                const minNum2 = num1 - 9;
                // maxNum2 could be up to 9, but must not exceed the number itself (though num1 > 10, so 9 is fine)
                // We enforce num2 max 9 because it's breaking a single ten
                num2 = getRandomInt(minNum2, Math.min(9, num1 - 1));
                answer = num1 - num2;
                operator = '-';
            } else if (activeOp === 'subTeen') {
                // Answer stays >= 10. E.g. 15-4=11.
                // num1 is 11-20
                num1 = getRandomInt(11, 20);
                // We want result to be >= 10. So num1 - num2 >= 10 => num2 <= num1 - 10
                const maxNum2 = num1 - 10;
                num2 = getRandomInt(1, maxNum2);
                answer = num1 - num2;
                operator = '-';
            } else {
                // Fallback (legacy add20/sub20 or errors)
                answer = getRandomInt(2, 10);
                num1 = getRandomInt(1, answer - 1);
                num2 = answer - num1;
                operator = '+';
            }
            
            problemKey = `${num1}${operator}${num2}`;
            attempts++;
            
            // If all combinations seem exhausted
            if (attempts > maxAttempts) {
                // Clear the used set and keep generating randomly
                players[p].usedProblems.clear();
                break;
            }
        } while (players[p].usedProblems.has(problemKey));

        players[p].usedProblems.add(problemKey);
        players[p].currentProblemAttempt = { num1, num2, answer, operator, handledMistake: false };
        opEls[p].textContent = operator;
        players[p].currentAnswer = answer;

        num1Els[p].textContent = num1;
        num2Els[p].textContent = num2;
        num1Els[p].classList.add('pop-animation');
        num2Els[p].classList.add('pop-animation');
        
        setTimeout(() => {
            num1Els[p].classList.remove('pop-animation');
            num2Els[p].classList.remove('pop-animation');
        }, 400);
    }

    function checkAnswer(player) {
        if (!players[player].isActive) return;

        const val = parseInt(players[player].answerStr, 10);
        
        if (isNaN(val)) {
            feedbackEls[player].textContent = 'Γράψε αριθμό!';
            feedbackEls[player].className = 'feedback show wrong';
            return;
        }

        if (val === players[player].currentAnswer) {
            // Correct format: this player wins the round
            players[player].isActive = false; // Disable further inputs for this round
            const prob = players[player].currentProblemAttempt;
            trackEvent('answer_submitted', { problem: `${prob.num1}${prob.operator}${prob.num2}`, is_correct: true, player });
            trackEvent('correct_answer', { problem: `${prob.num1}${prob.operator}${prob.num2}`, player, operation: selectedOperation });
            if (!isReplayMode) {
                players[player].score += 10;
                scoreEls[player].textContent = players[player].score;
                scoreEls[player].parentElement.classList.add('pop-animation');
                setTimeout(() => scoreEls[player].parentElement.classList.remove('pop-animation'), 400);
            }

            feedbackEls[player].textContent = 'Σωστά! 🎉';
            feedbackEls[player].className = 'feedback show win';

            createConfetti(player);

            // Wait a bit less, then next problem just for them
            setTimeout(() => generateProblem(player), 500);

        } else {
            // Wrong answer
            const prob = players[player].currentProblemAttempt;
            trackEvent('answer_submitted', { problem: `${prob.num1}${prob.operator}${prob.num2}`, is_correct: false, player });
            trackEvent('wrong_answer', { problem: `${prob.num1}${prob.operator}${prob.num2}`, correct_answer: players[player].currentAnswer, given_answer: val, player, operation: selectedOperation });
            feedbackEls[player].textContent = 'Λάθος! 💫';
            feedbackEls[player].className = 'feedback show wrong';
            players[player].answerStr = ''; // clear for retry
            updateAnswerDisplay(player);
            
            // If they made a mistake on this newly drawn problem, save it
            if (!players[player].currentProblemAttempt.handledMistake) {
                players[player].mistakenProblems.push(players[player].currentProblemAttempt);
                players[player].currentProblemAttempt.handledMistake = true; // ensure we only push it once
            }
        }
    }

    // Numpad logic
    document.querySelectorAll('.num-btn').forEach(btn => {
        const handler = (e) => {
            e.preventDefault(); // allow multi-touch to work instantly
            const p = e.target.getAttribute('data-player');
            if (!players[p].isActive) return;
            const val = e.target.textContent;
            if (players[p].answerStr.length < 3) {
                players[p].answerStr += val;
                updateAnswerDisplay(p);
            }
        };
        btn.addEventListener('touchstart', handler, {passive: false});
        btn.addEventListener('mousedown', handler);
    });

    document.querySelectorAll('.cmd-btn.clear').forEach(btn => {
        const handler = (e) => {
            e.preventDefault();
            const p = e.target.getAttribute('data-player');
            if (!players[p].isActive) return;
            players[p].answerStr = '';
            updateAnswerDisplay(p);
        };
        btn.addEventListener('touchstart', handler, {passive: false});
        btn.addEventListener('mousedown', handler);
    });

    document.querySelectorAll('.cmd-btn.check').forEach(btn => {
        const handler = (e) => {
            e.preventDefault();
            const p = parseInt(e.target.getAttribute('data-player'), 10);
            if (!players[p].isActive) return;
            checkAnswer(p);
        };
        btn.addEventListener('touchstart', handler, {passive: false});
        btn.addEventListener('mousedown', handler);
    });

    // Create simple confetti effect originating from winner's side
    function createConfetti(winnerPlayer) {
        // ... (confetti creation code is same, but respect tablet/board mode)
        const isTablet = gameContainer.classList.contains('tablet-mode');
        const isSingle = gameContainer.classList.contains('single-mode');
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#9D75CB', '#45B7D1'];
        for (let i = 0; i < 40; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            
            if (isSingle) {
                confetti.style.top = '-10px';
                confetti.style.left = Math.random() * 100 + 'vw';
            } else if (isTablet) {
                if (winnerPlayer === 1) {
                    confetti.style.top = '-10px';
                    confetti.style.left = Math.random() * 100 + 'vw';
                } else {
                    confetti.style.bottom = '50vh';
                    confetti.style.left = Math.random() * 100 + 'vw';
                }
            } else {
                // Board mode (side by side)
                confetti.style.top = '-10px';
                if (winnerPlayer === 1) {
                    confetti.style.left = Math.random() * 50 + 'vw'; // Left half
                } else {
                    confetti.style.left = (Math.random() * 50 + 50) + 'vw'; // Right half
                }
            }
            
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            const duration = Math.random() * 2 + 2;
            confetti.style.animationDuration = duration + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            
            document.body.appendChild(confetti);
            setTimeout(() => { confetti.remove(); }, (duration + 1) * 1000);
        }
    }

    function checkEndMistakesReplay() {
        const p1Done = !players[1].isActive;
        const p2Done = (selectedMode === 'single') || (!players[2].isActive);
        if (p1Done && p2Done) {
            endGameMistakesReplay();
        }
    }

    function endGameMistakesReplay() {
        players[1].isActive = false;
        players[2].isActive = false;
        isReplayMode = false;
        
        let resultHtml = `Μπράβο! 🎉<br>Ολοκλήρωσες τέλεια τη διόρθωση των λαθών σου!`;
        createConfetti(1);
        if (selectedMode !== 'single') {
            createConfetti(2);
        }
        
        document.getElementById('game-results').innerHTML = resultHtml;
        btnReplayMistakes.classList.add('hidden');
        gameOverScreen.classList.remove('hidden');
        btnBack.classList.add('hidden');
    }

    // View Selection Logic
    document.querySelectorAll('.op-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedOperation = btn.getAttribute('data-op');
            operationSelectionScreen.classList.add('hidden');
            selectionScreen.classList.remove('hidden');
        });
    });

    function selectMode(mode) {
        selectedMode = mode;
        selectionScreen.classList.add('hidden');
        timeSelectionScreen.classList.remove('hidden');
    }

    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedTime = parseInt(btn.getAttribute('data-time'), 10);
            startGameWithTime();
        });
    });

    btnReplayMistakes.addEventListener('click', () => {
        startMistakesReplay();
    });

    function startMistakesReplay() {
        isReplayMode = true;
        clearInterval(timerInterval);
        
        // Reset visually, leave score alone or clear
        timerEls[1].textContent = '∞';
        timerEls[2].textContent = '∞';
        timerEls[1].classList.remove('timer-pulse');
        timerEls[2].classList.remove('timer-pulse');

        // Apply mode class
        gameContainer.className = 'split-screen'; 
        if (selectedMode === 'tablet') {
            gameContainer.classList.add('tablet-mode');
        } else if (selectedMode === 'board') {
            gameContainer.classList.add('board-mode');
        } else if (selectedMode === 'single') {
            gameContainer.classList.add('single-mode');
        }

        timeSelectionScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        btnBack.classList.remove('hidden');

        // Start problem (will pull from mistakes)
        generateProblem(1);
        if (selectedMode !== 'single') {
            generateProblem(2);
        } else {
            players[2].isActive = false;
        }
    }

    function startGameWithTime() {
        isReplayMode = false;
        // Reset scores and timers
        players[1].score = 0;
        players[2].score = 0;
        
        // Clear history completely for new timed game
        players[1].usedProblems.clear();
        players[2].usedProblems.clear();
        players[1].mistakenProblems = [];
        players[2].mistakenProblems = [];
        
        scoreEls[1].textContent = 0;
        scoreEls[2].textContent = 0;
        remainingTime = selectedTime;
        timerEls[1].textContent = remainingTime;
        timerEls[2].textContent = remainingTime;
        timerEls[1].classList.remove('timer-pulse');
        timerEls[2].classList.remove('timer-pulse');

        // Apply mode class
        gameContainer.className = 'split-screen'; // Reset classes
        if (selectedMode === 'tablet') {
            gameContainer.classList.add('tablet-mode');
        } else if (selectedMode === 'board') {
            gameContainer.classList.add('board-mode');
        } else if (selectedMode === 'single') {
            gameContainer.classList.add('single-mode');
        }

        // Switch screens
        timeSelectionScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        btnBack.classList.remove('hidden');

        trackEvent('start_game', { operation: selectedOperation, mode: selectedMode, duration_seconds: selectedTime });

        // Start first problem
        generateProblem(1);
        if (selectedMode !== 'single') {
            generateProblem(2);
        } else {
            players[2].isActive = false;
        }

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            remainingTime--;
            timerEls[1].textContent = remainingTime;
            timerEls[2].textContent = remainingTime;

            if (remainingTime <= 10 && remainingTime > 0) {
                timerEls[1].classList.add('timer-pulse');
                timerEls[2].classList.add('timer-pulse');
            }

            if (remainingTime <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(timerInterval);
        players[1].isActive = false;
        players[2].isActive = false;
        timerEls[1].classList.remove('timer-pulse');
        timerEls[2].classList.remove('timer-pulse');
        
        let resultHtml = '';
        if (selectedMode === 'single') {
            resultHtml = `Μπράβο! Το σκορ σου είναι <b>${players[1].score}</b> 🎉`;
            createConfetti(1);
        } else {
            if (players[1].score > players[2].score) {
                resultHtml = `Νικητής: Παίκτης 1 με ${players[1].score} πόντους! 🎉<br>Παίκτης 2: ${players[2].score} πόντους.`;
                createConfetti(1);
            } else if (players[2].score > players[1].score) {
                resultHtml = `Νικητής: Παίκτης 2 με ${players[2].score} πόντους! 🎉<br>Παίκτης 1: ${players[1].score} πόντους.`;
                createConfetti(2);
            } else {
                resultHtml = `Ισοπαλία με ${players[1].score} πόντους! 🤝`;
                createConfetti(1);
                createConfetti(2);
            }
        }
        document.getElementById('game-results').innerHTML = resultHtml;
        
        // Show replay mistakes button if any player has mistakes queued
        if (players[1].mistakenProblems.length > 0 || (selectedMode !== 'single' && players[2].mistakenProblems.length > 0)) {
            btnReplayMistakes.classList.remove('hidden');
        } else {
            btnReplayMistakes.classList.add('hidden');
        }

        trackEvent('finish_game', {
            score_p1: players[1].score,
            score_p2: selectedMode !== 'single' ? players[2].score : 0,
            operation: selectedOperation,
            mode: selectedMode,
            duration_seconds: selectedTime
        });

        gameOverScreen.classList.remove('hidden');
        btnBack.classList.add('hidden');
    }

    btnSingle.addEventListener('click', () => selectMode('single'));
    btnTablet.addEventListener('click', () => selectMode('tablet'));
    btnBoard.addEventListener('click', () => selectMode('board'));

    btnBackToOp.addEventListener('click', () => {
        selectionScreen.classList.add('hidden');
        operationSelectionScreen.classList.remove('hidden');
    });

    btnBackToMode.addEventListener('click', () => {
        timeSelectionScreen.classList.add('hidden');
        selectionScreen.classList.remove('hidden');
    });

    btnPlayAgain.addEventListener('click', () => {
        trackEvent('restart_game', { operation: selectedOperation, mode: selectedMode });
        startGameWithTime();
    });

    btnHome.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        operationSelectionScreen.classList.remove('hidden');
    });

    btnBack.addEventListener('click', () => {
        clearInterval(timerInterval);
        players[1].isActive = false;
        players[2].isActive = false;
        gameContainer.classList.add('hidden');
        btnBack.classList.add('hidden');
        operationSelectionScreen.classList.remove('hidden');
    });

});
