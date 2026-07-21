const Category2 = {
    stage: 0,
    questions: [],
    currentQ: 0,
    correctAnswer: null,
    
    startStage: (stageNum) => {
        Category2.stage = stageNum;
        Category2.questions = [];
        Category2.currentQ = 0;

        let total = stageNum === 3 ? 8 : 10;
        const used = new Set();

        for (let i = 0; i < total; i++) {
            let den, num;
            [num, den] = Utils.uniqueFraction(used, () => {
                let d = Utils.randomInt(2, 9);
                return [Utils.randomInt(1, d - 1), d];
            });
            let multiplier = Utils.randomInt(2, 6);
            let eqNum = num * multiplier;
            let eqDen = den * multiplier;

            if (stageNum === 3) {
                Category2.questions.push({ num, den, eqNum, eqDen });
            } else {
                let options = [{n: eqNum, d: eqDen, correct: true}];
                while (options.length < 4) {
                    let wDen = Utils.randomInt(2, 18);
                    let wNum = Utils.randomInt(1, wDen - 1);
                    if (Math.abs(wNum / wDen - num / den) > 0.001) {
                        let exists = options.find(o => o.n === wNum && o.d === wDen);
                        if (!exists) options.push({n: wNum, d: wDen, correct: false});
                    }
                }
                Utils.shuffle(options);
                Category2.questions.push({ num, den, options });
            }
        }

        Category2.loadQuestion();
    },
    
    loadQuestion: () => {
        if (Category2.currentQ >= Category2.questions.length) {
            app.showCelebration();
            return;
        }

        let q = Category2.questions[Category2.currentQ];
        Category2.correctAnswer = null;

        let promptHtml = `Βρες το ισοδύναμο κλάσμα του ${Utils.renderFraction(q.num, q.den)}`;
        app.prepareGameArea(`Ερώτηση ${Category2.currentQ + 1} / ${Category2.questions.length}`, promptHtml);

        let area = document.getElementById('game-area');
        area.innerHTML = '';

        if (Category2.stage === 3) {
            area.innerHTML = `
                <div class="input-numpad-row">
                    <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap; justify-content:center;">
                        ${Utils.renderFraction(q.num, q.den)}
                        <span style="font-family:var(--font-main); font-size:2.4rem; color:var(--wood-dark);">=</span>
                        <div style="display:inline-flex; flex-direction:column; align-items:center; gap:4px;">
                            <input id="input-num" class="fraction-input" type="text" readonly onclick="Utils.setActiveInput('input-num')" placeholder="?">
                            <div style="border-top:4px solid var(--wood-dark); width:100%;"></div>
                            <input id="input-den" class="fraction-input" type="text" readonly onclick="Utils.setActiveInput('input-den')" placeholder="?">
                        </div>
                    </div>
                    ${Utils.renderNumpad()}
                </div>`;
            setTimeout(() => Utils.setActiveInput('input-num'), 50);
            return;
        }

        if (Category2.stage === 1) {
            let shapeCol = document.createElement('div');
            shapeCol.className = 'shape-column';
            shapeCol.innerHTML = `
                ${Utils.renderFraction(q.num, q.den)}
                <div class="shape-container"><div class="pie-chart" style="${Utils.createPieChart(q.num, q.den)}"></div></div>
            `;
            area.appendChild(shapeCol);
        }

        let choicesDiv = document.createElement('div');
        choicesDiv.className = 'choice-container';

        q.options.forEach((opt, index) => {
            let btn = document.createElement('button');
            btn.className = 'btn-choice';
            btn.id = `choice-${index}`;

            if (Category2.stage === 1) {
                btn.classList.add('btn-choice-shapes');
                btn.innerHTML = `<div class="pie-chart" style="${Utils.createPieChart(opt.n, opt.d)}"></div>`;
            } else {
                btn.innerHTML = Utils.renderFraction(opt.n, opt.d);
            }

            btn.onclick = () => {
                document.querySelectorAll('.btn-choice').forEach(b => b.style.transform = '');
                document.querySelectorAll('.btn-choice').forEach(b => b.style.borderColor = 'var(--secondary)');
                btn.style.transform = 'translateY(-5px)';
                btn.style.borderColor = 'var(--primary)';
                Category2.correctAnswer = opt.correct;
                Utils.playSound('pop');
            };

            if (Category2.stage === 1) {
                let col = document.createElement('div');
                col.className = 'shape-column';
                col.innerHTML = Utils.renderFraction(opt.n, opt.d);
                col.appendChild(btn);
                choicesDiv.appendChild(col);
            } else {
                choicesDiv.appendChild(btn);
            }
        });

        area.appendChild(choicesDiv);
    },
    
    check: () => {
        if (Category2.stage === 3) {
            let inNum = parseInt(document.getElementById('input-num').value);
            let inDen = parseInt(document.getElementById('input-den').value);
            let q = Category2.questions[Category2.currentQ];

            if (!inNum || !inDen || inDen === 0) return;

            let isCorrect = (inNum * q.den === inDen * q.num) && inNum !== q.num;

            if (isCorrect) {
                Utils.playSound('correct');
                app.addScore(1);
                document.getElementById('input-num').style.borderColor = 'var(--grass-green)';
                document.getElementById('input-den').style.borderColor = 'var(--grass-green)';
                app.autoNext();
            } else {
                Utils.playSound('wrong');
                document.getElementById('input-num').style.borderColor = '#EF476F';
                document.getElementById('input-den').style.borderColor = '#EF476F';
                document.getElementById('input-num').classList.add('shake');
                document.getElementById('input-den').classList.add('shake');
                setTimeout(() => {
                    document.getElementById('input-num').classList.remove('shake');
                    document.getElementById('input-den').classList.remove('shake');
                    document.getElementById('input-num').style.borderColor = '';
                    document.getElementById('input-den').style.borderColor = '';
                    document.getElementById('input-num').value = '';
                    document.getElementById('input-den').value = '';
                    Utils.setActiveInput('input-num');
                }, 600);
            }
            return;
        }

        if (Category2.correctAnswer === null) return;

        if (Category2.correctAnswer === true) {
            Utils.playSound('correct');
            app.addScore(1);

            document.querySelectorAll('.btn-choice').forEach(b => {
                if(b.style.borderColor === 'var(--primary)' || b.style.borderColor === 'var(--wood-dark)' || b.style.transform !== '') {
                    b.classList.add('correct');
                }
            });

            document.getElementById('btn-submit').classList.add('hidden');
            document.getElementById('btn-next').classList.remove('hidden');
        } else {
            Utils.playSound('wrong');
            document.querySelectorAll('.btn-choice').forEach(b => {
                if(b.style.transform !== '') {
                    b.classList.add('wrong');
                    b.classList.add('shake');
                    setTimeout(() => {
                        b.classList.remove('shake');
                        b.classList.remove('wrong');
                        b.style.transform = '';
                    }, 500);
                }
            });
            Category2.correctAnswer = null;
        }
    },
    
    next: () => {
        Category2.currentQ++;
        Category2.loadQuestion();
    }
};
