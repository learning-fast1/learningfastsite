const Category3 = {
    stage: 0,
    questions: [],
    currentQ: 0,
    correctSign: null,
    answered: false,

    startStage: (stageNum) => {
        Category3.stage = stageNum;
        Category3.questions = [];
        Category3.currentQ = 0;

        const used = new Set();
        for (let i = 0; i < 10; i++) {
            let den1, num1, den2, num2, key;
            do {
                den1 = Utils.randomInt(2, 10);
                num1 = Utils.randomInt(1, den1);
                den2 = Utils.randomInt(2, 10);
                num2 = Utils.randomInt(1, den2);
                let a = `${num1}/${den1}`, b = `${num2}/${den2}`;
                key = a < b ? `${a}|${b}` : `${b}|${a}`;
            } while (used.has(key));
            used.add(key);

            let val1 = num1 / den1;
            let val2 = num2 / den2;
            let sign = val1 < val2 ? '<' : val1 > val2 ? '>' : '=';
            Category3.questions.push({ n1: num1, d1: den1, n2: num2, d2: den2, sign });
        }

        Category3.loadQuestion();
    },

    loadQuestion: () => {
        if (Category3.currentQ >= Category3.questions.length) {
            app.showCelebration();
            return;
        }

        let q = Category3.questions[Category3.currentQ];
        Category3.correctSign = q.sign;
        Category3.answered = false;

        app.prepareGameArea(
            `Ερώτηση ${Category3.currentQ + 1} / ${Category3.questions.length}`,
            'Σύγκρινε τα κλάσματα'
        );

        // Hide submit — answer is given by pressing a sign button directly
        document.getElementById('btn-submit').classList.add('hidden');

        let area = document.getElementById('game-area');
        area.innerHTML = '';
        area.style.flexDirection = 'column';
        area.style.flexWrap = 'nowrap';
        area.style.alignItems = 'center';
        area.style.gap = '22px';

        // ── Row: fraction | empty box | fraction ──────────────────────────
        let compareDiv = document.createElement('div');
        compareDiv.className = 'compare-container';

        let f1Div = document.createElement('div');
        f1Div.className = 'compare-box';
        f1Div.innerHTML = Utils.renderFraction(q.n1, q.d1);
        if (Category3.stage === 1) {
            f1Div.innerHTML += `<div class="pie-chart" style="margin-top:12px; ${Utils.createPieChart(q.n1, q.d1)}"></div>`;
        }

        let signBox = document.createElement('div');
        signBox.className = 'compare-sign-box';
        signBox.id = 'sign-box';

        let f2Div = document.createElement('div');
        f2Div.className = 'compare-box';
        f2Div.innerHTML = Utils.renderFraction(q.n2, q.d2);
        if (Category3.stage === 1) {
            f2Div.innerHTML += `<div class="pie-chart" style="margin-top:12px; ${Utils.createPieChart(q.n2, q.d2)}"></div>`;
        }

        compareDiv.appendChild(f1Div);
        compareDiv.appendChild(signBox);
        compareDiv.appendChild(f2Div);
        area.appendChild(compareDiv);

        // ── Row: sign buttons ─────────────────────────────────────────────
        let btnsDiv = document.createElement('div');
        btnsDiv.className = 'sign-buttons';

        ['<', '=', '>'].forEach(s => {
            let btn = document.createElement('button');
            btn.className = 'btn-sign';
            btn.innerText = s;
            btn.onclick = () => Category3.trySign(s, btn);
            btnsDiv.appendChild(btn);
        });

        area.appendChild(btnsDiv);
    },

    trySign: (s, btn) => {
        if (Category3.answered) return;

        if (s === Category3.correctSign) {
            Category3.answered = true;
            Utils.playSound('correct');
            app.addScore(1);

            let signBox = document.getElementById('sign-box');
            signBox.innerText = s;
            signBox.classList.add('sign-correct');

            // Disable all sign buttons visually
            document.querySelectorAll('.btn-sign').forEach(b => {
                b.disabled = true;
                b.style.opacity = b === btn ? '1' : '0.35';
            });

            app.autoNext();
        } else {
            Utils.playSound('wrong');
            btn.classList.add('wrong', 'shake');
            setTimeout(() => btn.classList.remove('wrong', 'shake'), 500);
        }
    },

    check: () => {},   // submit hidden — not used

    next: () => {
        Category3.currentQ++;
        Category3.loadQuestion();
    }
};
