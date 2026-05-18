const Category1 = {
    stage: 0,
    questions: [],
    currentQ: 0,
    selectedCount: 0,
    targetCount: 0,
    
    startStage: (stageNum) => {
        Category1.stage = stageNum;
        Category1.questions = [];
        Category1.currentQ = 0;
        
        if (stageNum === 1) {
            // Unit fractions 1/2 – 1/9, big pool shuffled, take 10
            const pool = [
                [1,2],[1,2],[1,2],
                [1,3],[1,3],[1,3],
                [1,4],[1,4],[1,4],
                [1,5],[1,5],[1,5],
                [1,6],[1,6],[1,6],
                [1,7],[1,7],
                [1,8],[1,8],
                [1,9],[1,9],
            ];
            Utils.shuffle(pool);
            Category1.questions = pool.slice(0, 10).map(f => {
                const maxMult = Math.floor(20 / f[1]);
                let multiplier = Utils.randomInt(2, Math.max(2, maxMult));
                let total = f[1] * multiplier;
                return { num: f[0], den: f[1], total, target: total / f[1] };
            });
        }
        else if (stageNum === 2) {
            // 10 cases. Denominator = Total Objects (up to 15).
            for (let i = 0; i < 10; i++) {
                let den = Utils.randomInt(3, 15);
                let num = Utils.randomInt(1, den - 1);
                Category1.questions.push({ num, den, total: den, target: num });
            }
        }
        else if (stageNum === 3) {
            // 10 cases. Total objects > Denominator
            for (let i = 0; i < 10; i++) {
                let den = Utils.randomInt(2, 8);
                let num = Utils.randomInt(1, den - 1);
                let multiplier = Utils.randomInt(2, 5);
                let total = den * multiplier;
                Category1.questions.push({ num, den, total, target: num * multiplier });
            }
        }
        else if (stageNum === 4) {
            // 10 cases. Abstract calculation.
            for (let i = 0; i < 10; i++) {
                let den = Utils.randomInt(2, 12);
                let num = Utils.randomInt(1, den - 1);
                let multiplier = Utils.randomInt(2, 8);
                let total = den * multiplier;
                Category1.questions.push({ num, den, total, target: num * multiplier });
            }
        }
        else if (stageNum === 5) {
            // 10 cases. Find the whole: X/Y του ___ = result
            for (let i = 0; i < 10; i++) {
                let num = Utils.randomInt(1, 7);
                let den = Utils.randomInt(num + 1, num + 7);
                let multiplier = Utils.randomInt(2, 10);
                let result = num * multiplier;
                let total  = den * multiplier;
                Category1.questions.push({ num, den, total, result, target: total });
            }
        }

        Category1.loadQuestion();
    },
    
    loadQuestion: () => {
        if (Category1.currentQ >= Category1.questions.length) {
            app.showCelebration();
            return;
        }
        
        let q = Category1.questions[Category1.currentQ];
        Category1.selectedCount = 0;
        Category1.targetCount = q.target;
        
        let promptHtml = '';
        if (Category1.stage === 4) {
             app.prepareGameArea(`Ερώτηση ${Category1.currentQ + 1} / ${Category1.questions.length}`, '');

             let area = document.getElementById('game-area');
             area.innerHTML = `
                <div class="input-numpad-row">
                    <div style="display:flex; align-items:center; gap:15px; flex-wrap:wrap; justify-content:center;">
                        ${Utils.renderFraction(q.num, q.den)}
                        <span style="font-family:var(--font-alt); font-size:1.6rem; color:var(--wood-dark); font-weight:bold;">του ${q.total} =</span>
                        <input type="text" id="answer-input" class="fraction-input" readonly onclick="Utils.setActiveInput('answer-input')">
                    </div>
                    ${Utils.renderNumpad()}
                </div>
             `;
             setTimeout(() => Utils.setActiveInput('answer-input'), 50);
        } else if (Category1.stage === 5) {
             app.prepareGameArea(`Ερώτηση ${Category1.currentQ + 1} / ${Category1.questions.length}`, '');

             let area = document.getElementById('game-area');
             area.innerHTML = `
                <div class="input-numpad-row">
                    <div style="display:flex; align-items:center; gap:15px; flex-wrap:wrap; justify-content:center;">
                        ${Utils.renderFraction(q.num, q.den)}
                        <span style="font-family:var(--font-alt); font-size:1.6rem; color:var(--wood-dark); font-weight:bold;">του</span>
                        <input type="text" id="answer-input" class="fraction-input" data-maxlen="3" readonly onclick="Utils.setActiveInput('answer-input')">
                        <span style="font-family:var(--font-alt); font-size:1.6rem; color:var(--wood-dark); font-weight:bold;">= ${q.result}</span>
                    </div>
                    ${Utils.renderNumpad()}
                </div>
             `;
             setTimeout(() => Utils.setActiveInput('answer-input'), 50);
        } else {
             let objEmoji = Utils.getRandomObject();
             promptHtml = `Επέλεξε τα ${Utils.renderFraction(q.num, q.den)}`;
             app.prepareGameArea(`Ερώτηση ${Category1.currentQ + 1} / ${Category1.questions.length}`, promptHtml);
             
             let area = document.getElementById('game-area');
             area.innerHTML = '';
             for (let i = 0; i < q.total; i++) {
                 let div = document.createElement('div');
                 div.className = 'object-item';
                 div.innerText = objEmoji;
                 div.onclick = function() {
                     if (this.classList.contains('selected')) {
                         this.classList.remove('selected');
                         Category1.selectedCount--;
                     } else {
                         this.classList.add('selected');
                         Category1.selectedCount++;
                     }
                     Utils.playSound('pop');
                 };
                 area.appendChild(div);
             }
        }
    },
    
    check: () => {
        let isCorrect = false;
        
        if (Category1.stage === 4 || Category1.stage === 5) {
            let input = document.getElementById('answer-input');
            let val = parseInt(input.value);
            if (val === Category1.targetCount) {
                isCorrect = true;
                input.style.borderColor = 'var(--grass-green)';
                input.style.backgroundColor = '#d4edda';
            } else {
                input.style.borderColor = '#EF476F';
                input.style.backgroundColor = '#f8d7da';
                input.classList.add('shake');
                setTimeout(() => {
                    input.classList.remove('shake');
                    input.value = '';
                    input.style.borderColor = '';
                    input.style.backgroundColor = '';
                    Utils.setActiveInput('answer-input');
                }, 600);
            }
        } else {
            if (Category1.selectedCount === Category1.targetCount) {
                isCorrect = true;
                // Add bounce to selected items
                document.querySelectorAll('.object-item.selected').forEach(el => el.classList.add('bounce'));
            } else {
                // Shake area
                let area = document.getElementById('game-area');
                area.classList.add('shake');
                setTimeout(() => area.classList.remove('shake'), 500);
            }
        }
        
        if (isCorrect) {
            Utils.playSound('correct');
            app.addScore(1);
            app.autoNext();
        } else {
            Utils.playSound('wrong');
        }
    },
    
    next: () => {
        Category1.currentQ++;
        Category1.loadQuestion();
    }
};
