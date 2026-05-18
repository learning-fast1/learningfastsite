const Category5 = {
    stage: 0,
    questions: [],
    currentQ: 0,

    startStage(stageNum) {
        Category5.stage = stageNum;
        Category5.questions = [];
        Category5.currentQ = 0;

        // Build a shuffled pool of template indices so no template repeats within a session
        let poolSize = stageNum === 1 ? Category5.templates1.length
                     : stageNum === 3 ? Category5.templates3.length
                     : 0;
        let indices = Array.from({ length: poolSize }, (_, i) => i);
        Utils.shuffle(indices);

        for (let i = 0; i < 10; i++) {
            Category5.questions.push(
                Category5.generateQuestion(stageNum, indices[i % poolSize])
            );
        }
        Category5.loadQuestion();
    },

    // ── Stage 1 templates (find fraction of number) ─────────────────────────
    // Each is a function(name, total, num, den, answer) → text string
    templates1: [
        (n,t,a,b,r) => `${n} έχει ${t} καραμέλες. Τα <b>${a}/${b}</b> είναι σοκολατένιες. Πόσες καραμέλες είναι σοκολατένιες;`,
        (n,t,a,b,r) => `Σε ένα καλάθι υπάρχουν ${t} μήλα. Τα <b>${a}/${b}</b> είναι κόκκινα. Πόσα μήλα είναι κόκκινα;`,
        (n,t,a,b,r) => `${n} έχει ${t} ευρώ. Ξόδεψε τα <b>${a}/${b}</b> για παιχνίδια. Πόσα ευρώ ξόδεψε;`,
        (n,t,a,b,r) => `Μια τάξη έχει ${t} μαθητές. Τα <b>${a}/${b}</b> είναι κορίτσια. Πόσα κορίτσια υπάρχουν;`,
        (n,t,a,b,r) => `${n} έχει ${t} αυτοκόλλητα. Τα <b>${a}/${b}</b> είναι αστέρια. Πόσα αυτοκόλλητα είναι αστέρια;`,
        (n,t,a,b,r) => `Σε ένα ράφι υπάρχουν ${t} βιβλία. Τα <b>${a}/${b}</b> είναι παραμύθια. Πόσα βιβλία είναι παραμύθια;`,
        (n,t,a,b,r) => `${n} μάζεψε ${t} λουλούδια. Τα <b>${a}/${b}</b> είναι κόκκινα. Πόσα λουλούδια είναι κόκκινα;`,
        (n,t,a,b,r) => `Στο πάρκο υπάρχουν ${t} πουλιά. Τα <b>${a}/${b}</b> είναι τρυγόνια. Πόσα πουλιά είναι τρυγόνια;`,
        (n,t,a,b,r) => `${n} έχει ${t} χάντρες. Τα <b>${a}/${b}</b> είναι μπλε. Πόσες χάντρες είναι μπλε;`,
        (n,t,a,b,r) => `Σε ένα κουτί υπάρχουν ${t} μολύβια. Τα <b>${a}/${b}</b> είναι κόκκινα. Πόσα μολύβια είναι κόκκινα;`,
        (n,t,a,b,r) => `${n} έχει ${t} αυτοκινητάκια. Τα <b>${a}/${b}</b> είναι κόκκινα. Πόσα αυτοκινητάκια είναι κόκκινα;`,
        (n,t,a,b,r) => `Σε ένα αγρόκτημα υπάρχουν ${t} ζώα. Τα <b>${a}/${b}</b> είναι κοτόπουλα. Πόσα ζώα είναι κοτόπουλα;`,
        (n,t,a,b,r) => `${n} έχει ${t} χρώματα. Τα <b>${a}/${b}</b> είναι ζεστά χρώματα. Πόσα χρώματα είναι ζεστά;`,
        (n,t,a,b,r) => `Σε ένα μαγαζί υπάρχουν ${t} μπλουζάκια. Τα <b>${a}/${b}</b> είναι κίτρινα. Πόσα μπλουζάκια είναι κίτρινα;`,
        (n,t,a,b,r) => `${n} έχει ${t} φίλους. Τα <b>${a}/${b}</b> μένουν κοντά. Πόσοι φίλοι μένουν κοντά;`,
        (n,t,a,b,r) => `Σε ένα δέντρο υπάρχουν ${t} φρούτα. Τα <b>${a}/${b}</b> είναι ώριμα. Πόσα φρούτα είναι ώριμα;`,
        (n,t,a,b,r) => `${n} έχει ${t} αθλητικές κάρτες. Τα <b>${a}/${b}</b> είναι ποδοσφαιριστών. Πόσες κάρτες είναι ποδοσφαιριστών;`,
        (n,t,a,b,r) => `Σε μια βιβλιοθήκη υπάρχουν ${t} περιοδικά. Τα <b>${a}/${b}</b> είναι επιστημονικά. Πόσα περιοδικά είναι επιστημονικά;`,
        (n,t,a,b,r) => `${n} έχει ${t} ψάρια στο ενυδρείο. Τα <b>${a}/${b}</b> είναι πορτοκαλί. Πόσα ψάρια είναι πορτοκαλί;`,
        (n,t,a,b,r) => `Σε ένα σχολείο υπάρχουν ${t} τάξεις. Τα <b>${a}/${b}</b> έχουν διαδραστικό πίνακα. Πόσες τάξεις έχουν διαδραστικό πίνακα;`,
        (n,t,a,b,r) => `${n} έχει ${t} κυβάκια. Τα <b>${a}/${b}</b> είναι ξύλινα. Πόσα κυβάκια είναι ξύλινα;`,
        (n,t,a,b,r) => `Σε ένα πακέτο υπάρχουν ${t} μπισκότα. Τα <b>${a}/${b}</b> έχουν σοκολάτα. Πόσα μπισκότα έχουν σοκολάτα;`,
        (n,t,a,b,r) => `${n} μάζεψε ${t} κελύφη. Τα <b>${a}/${b}</b> είναι στρογγυλά. Πόσα κελύφη είναι στρογγυλά;`,
        (n,t,a,b,r) => `Σε ένα θέατρο χωράνε ${t} άτομα. Τα <b>${a}/${b}</b> είναι παιδιά. Πόσα άτομα είναι παιδιά;`,
        (n,t,a,b,r) => `${n} έχει ${t} τετράδια. Τα <b>${a}/${b}</b> έχουν τελειώσει. Πόσα τετράδια έχουν τελειώσει;`,
    ],

    // ── Stage 3 templates (find the whole) ──────────────────────────────────
    // Each is a function(name, result, num, den, total) → { text, question }
    templates3: [
        (n,r,a,b,t) => ({ text: `${n} είχε μερικά ευρώ. Ξόδεψε <b>${r} ευρώ</b> που ήταν τα <b>${a}/${b}</b> των χρημάτων του/της.`, question: 'Πόσα ευρώ είχε αρχικά;' }),
        (n,r,a,b,t) => ({ text: `Σε μια τάξη, <b>${r} μαθητές</b> που αποτελούν τα <b>${a}/${b}</b> της τάξης, είναι αγόρια.`, question: 'Πόσοι μαθητές υπάρχουν συνολικά;' }),
        (n,r,a,b,t) => ({ text: `${n} έτρεξε <b>${r} χιλιόμετρα</b> που ήταν τα <b>${a}/${b}</b> της συνολικής διαδρομής.`, question: 'Πόσα χιλιόμετρα είναι η συνολική διαδρομή;' }),
        (n,r,a,b,t) => ({ text: `${n} διάβασε <b>${r} σελίδες</b> που ήταν τα <b>${a}/${b}</b> του βιβλίου.`, question: 'Πόσες σελίδες έχει το βιβλίο;' }),
        (n,r,a,b,t) => ({ text: `Σε μια ορχήστρα, <b>${r} μουσικοί</b> παίζουν βιολί και αποτελούν τα <b>${a}/${b}</b> της ορχήστρας.`, question: 'Πόσοι μουσικοί έχει η ορχήστρα;' }),
        (n,r,a,b,t) => ({ text: `${n} έδωσε <b>${r} καραμέλες</b> που ήταν τα <b>${a}/${b}</b> των καραμελών του/της.`, question: 'Πόσες καραμέλες είχε αρχικά;' }),
        (n,r,a,b,t) => ({ text: `Σε ένα κλουβί, <b>${r} πουλιά</b> που είναι τα <b>${a}/${b}</b> του συνόλου, είναι παπαγάλοι.`, question: 'Πόσα πουλιά υπάρχουν συνολικά;' }),
        (n,r,a,b,t) => ({ text: `${n} έκανε ποδήλατο για <b>${r} λεπτά</b> που ήταν τα <b>${a}/${b}</b> του συνολικού χρόνου γυμναστικής.`, question: 'Πόση ώρα γυμνάστηκε συνολικά;' }),
        (n,r,a,b,t) => ({ text: `Σε ένα πάρτι, <b>${r} παιδιά</b> που αποτελούν τα <b>${a}/${b}</b> των καλεσμένων, χορεύουν.`, question: 'Πόσα παιδιά υπάρχουν στο πάρτι;' }),
        (n,r,a,b,t) => ({ text: `${n} αποταμίευσε <b>${r} ευρώ</b> που ήταν τα <b>${a}/${b}</b> των χαρτζιλικιών του/της.`, question: 'Πόσα χαρτζιλίκια πήρε συνολικά;' }),
        (n,r,a,b,t) => ({ text: `Σε ένα αγρόκτημα, <b>${r} ζώα</b> είναι πρόβατα και αποτελούν τα <b>${a}/${b}</b> όλων των ζώων.`, question: 'Πόσα ζώα υπάρχουν στο αγρόκτημα;' }),
        (n,r,a,b,t) => ({ text: `${n} έφτιαξε <b>${r} κουλουράκια</b> που ήταν τα <b>${a}/${b}</b> όλων των γλυκών.`, question: 'Πόσα γλυκά έφτιαξε συνολικά;' }),
        (n,r,a,b,t) => ({ text: `Σε ένα σχολείο, <b>${r} δάσκαλοι</b> διδάσκουν μαθηματικά και αποτελούν τα <b>${a}/${b}</b> όλων των δασκάλων.`, question: 'Πόσοι δάσκαλοι υπάρχουν στο σχολείο;' }),
        (n,r,a,b,t) => ({ text: `${n} έπλεξε <b>${r} σελίδες</b> του χαλιού που ήταν τα <b>${a}/${b}</b> του συνόλου.`, question: 'Πόσες σελίδες έχει το χαλί συνολικά;' }),
        (n,r,a,b,t) => ({ text: `Σε μια βιβλιοθήκη, <b>${r} βιβλία</b> είναι παραμύθια και αποτελούν τα <b>${a}/${b}</b> όλων των βιβλίων.`, question: 'Πόσα βιβλία υπάρχουν στη βιβλιοθήκη;' }),
        (n,r,a,b,t) => ({ text: `${n} συνέλεξε <b>${r} γραμματόσημα</b> που ήταν τα <b>${a}/${b}</b> της συλλογής του/της.`, question: 'Πόσα γραμματόσημα έχει η συλλογή;' }),
        (n,r,a,b,t) => ({ text: `Σε ένα τουρνουά, <b>${r} ομάδες</b> αποτελούν τα <b>${a}/${b}</b> όλων των συμμετεχόντων.`, question: 'Πόσες ομάδες συμμετέχουν συνολικά;' }),
        (n,r,a,b,t) => ({ text: `${n} ζωγράφισε <b>${r} εικόνες</b> που ήταν τα <b>${a}/${b}</b> όλων των έργων της έκθεσης.`, question: 'Πόσα έργα υπάρχουν στην έκθεση;' }),
        (n,r,a,b,t) => ({ text: `Σε ένα ενυδρείο, <b>${r} ψάρια</b> είναι τροπικά και αποτελούν τα <b>${a}/${b}</b> όλων των ψαριών.`, question: 'Πόσα ψάρια υπάρχουν στο ενυδρείο;' }),
        (n,r,a,b,t) => ({ text: `${n} μάζεψε <b>${r} κιλά</b> φρούτων που ήταν τα <b>${a}/${b}</b> της συνολικής σοδειάς.`, question: 'Πόσα κιλά φρούτων ήταν η συνολική σοδειά;' }),
        (n,r,a,b,t) => ({ text: `Σε ένα στάδιο, <b>${r} θεατές</b> που είναι τα <b>${a}/${b}</b> όλων, υποστηρίζουν την κόκκινη ομάδα.`, question: 'Πόσοι θεατές υπάρχουν συνολικά;' }),
        (n,r,a,b,t) => ({ text: `${n} περπάτησε <b>${r} βήματα</b> που ήταν τα <b>${a}/${b}</b> του στόχου.`, question: 'Πόσα βήματα ήταν ο στόχος;' }),
        (n,r,a,b,t) => ({ text: `Σε μια αγορά, <b>${r} πελάτες</b> αγόρασαν φρούτα και αποτελούν τα <b>${a}/${b}</b> όλων των πελατών.`, question: 'Πόσοι πελάτες υπήρχαν συνολικά;' }),
    ],

    // ── Question generators ──────────────────────────────────────────────────
    generateQuestion(stageNum, tmplIdx) {
        if (stageNum === 1) return Category5.genStage1(tmplIdx);
        if (stageNum === 2) return Category5.genStage2();
        return Category5.genStage3(tmplIdx);
    },

    genStage1(tmplIdx) {
        const names = ['Ο Γιάννης','Η Μαρία','Ο Νίκος','Η Ελένη','Ο Πέτρος','Η Σοφία','Ο Δημήτρης','Η Κατερίνα','Ο Λευτέρης','Η Χριστίνα'];
        const name = names[Utils.randomInt(0, names.length - 1)];
        let num = Utils.randomInt(1, 5);
        let den = Utils.randomInt(num + 1, num + 6);
        let mult = Utils.randomInt(2, 8);
        let total = den * mult;
        let answer = num * mult;
        let text = Category5.templates1[tmplIdx](name, total, num, den, answer);
        return { text, answers: [answer], labels: ['Απάντηση'] };
    },

    genStage2() {
        const names = ['Ο Μάριος','Η Αννα','Ο Αλέξης','Η Δήμητρα','Ο Κώστας','Η Ιωάννα','Ο Σταύρος','Η Ρένα','Ο Θάνος','Η Βικτώρια'];
        const name = names[Utils.randomInt(0, names.length - 1)];
        const colorSets = [
            ['κόκκινοι','μπλε','πράσινοι'],
            ['κίτρινοι','μαύροι','άσπροι'],
            ['πορτοκαλί','μωβ','ροζ'],
            ['κόκκινοι','κίτρινοι','μπλε'],
            ['γαλάζιοι','πράσινοι','πορτοκαλί'],
            ['καφέ','γκρι','κόκκινοι'],
            ['μωβ','κίτρινοι','άσπροι'],
        ];
        const colors = colorSets[Utils.randomInt(0, colorSets.length - 1)];
        const items = [
            { acc: 'βόλους', q: 'βόλους' },
            { acc: 'μαρκαδόρους', q: 'μαρκαδόρους' },
            { acc: 'κύβους', q: 'κύβους' },
            { acc: 'χάντρες', q: 'χάντρες' },
            { acc: 'μπαλόνια', q: 'μπαλόνια' },
            { acc: 'τουβλάκια', q: 'τουβλάκια' },
        ];
        const item = items[Utils.randomInt(0, items.length - 1)];

        let num1, den1, num2, den2, total, ans1, ans2, ans3;
        let attempts = 0;
        do {
            den1 = Utils.randomInt(2, 5);
            num1 = Utils.randomInt(1, den1 - 1);
            den2 = Utils.randomInt(2, 5);
            num2 = Utils.randomInt(1, den2 - 1);
            let g = Utils.gcd(den1, den2);
            let lcm = den1 * den2 / g;
            let mult = Utils.randomInt(3, 6);
            total = lcm * mult;
            ans1 = Math.round(num1 * total / den1);
            ans2 = Math.round(num2 * total / den2);
            ans3 = total - ans1 - ans2;
            attempts++;
        } while (ans3 <= 0 && attempts < 200);

        return {
            text: `${name} έχει ${total} ${item.acc}. Τα <b>${num1}/${den1}</b> είναι ${colors[0]}, τα <b>${num2}/${den2}</b> είναι ${colors[1]} και οι υπόλοιποι είναι ${colors[2]}.`,
            question: `Βρες πόσους ${item.q} έχει από κάθε χρώμα.`,
            answers: [ans1, ans2, ans3],
            labels: [colors[0], colors[1], colors[2]]
        };
    },

    genStage3(tmplIdx) {
        const names = ['Ο Γιάννης','Η Μαρία','Ο Νίκος','Η Ελένη','Ο Πέτρος','Η Σοφία','Ο Δημήτρης','Η Αθηνά','Ο Λευτέρης','Η Χριστίνα'];
        const name = names[Utils.randomInt(0, names.length - 1)];
        let num = Utils.randomInt(1, 4);
        let den = Utils.randomInt(num + 1, num + 5);
        let mult = Utils.randomInt(2, 8);
        let result = num * mult;
        let total = den * mult;
        let { text, question } = Category5.templates3[tmplIdx](name, result, num, den, total);
        return { text, question, answers: [total], labels: ['Απάντηση'] };
    },

    // ── Display ──────────────────────────────────────────────────────────────
    loadQuestion() {
        if (Category5.currentQ >= Category5.questions.length) {
            app.showCelebration();
            return;
        }
        let q = Category5.questions[Category5.currentQ];
        app.prepareGameArea(`Ερώτηση ${Category5.currentQ + 1} / ${Category5.questions.length}`, '');

        let area = document.getElementById('game-area');
        area.innerHTML = '';
        area.style.flexDirection = 'column';
        area.style.alignItems = 'stretch';
        area.style.gap = '16px';

        let card = document.createElement('div');
        card.className = 'problem-card';
        card.innerHTML = `<p class="problem-body">${q.text}</p>`;
        if (q.question) card.innerHTML += `<p class="problem-q">${q.question}</p>`;
        area.appendChild(card);

        let inputWrap = document.createElement('div');
        inputWrap.className = 'input-numpad-row';

        if (q.answers.length === 1) {
            inputWrap.innerHTML = `
                <div style="display:flex; align-items:center; gap:14px; justify-content:center; flex-wrap:wrap;">
                    <input type="text" id="ans-0" class="fraction-input" data-maxlen="3" readonly onclick="Utils.setActiveInput('ans-0')">
                </div>
                ${Utils.renderNumpad()}`;
        } else {
            let inputsHTML = q.labels.map((lbl, i) => `
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-family:var(--font-alt); font-size:1.1rem; color:var(--wood-dark); font-weight:bold; min-width:100px; text-align:right;">${lbl}:</span>
                    <input type="text" id="ans-${i}" class="fraction-input" data-maxlen="3" readonly onclick="Utils.setActiveInput('ans-${i}')">
                </div>`).join('');
            inputWrap.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start;">
                    ${inputsHTML}
                </div>
                ${Utils.renderNumpad()}`;
        }

        area.appendChild(inputWrap);
        setTimeout(() => Utils.setActiveInput('ans-0'), 50);
    },

    // ── Check ────────────────────────────────────────────────────────────────
    check() {
        let q = Category5.questions[Category5.currentQ];
        let allCorrect = true;
        let firstWrongId = null;

        q.answers.forEach((ans, i) => {
            let input = document.getElementById(`ans-${i}`);
            if (!input) return;
            let val = parseInt(input.value);
            if (val === ans) {
                input.style.borderColor = 'var(--grass-green)';
                input.style.backgroundColor = '#d4edda';
            } else {
                allCorrect = false;
                input.style.borderColor = '#EF476F';
                input.style.backgroundColor = '#f8d7da';
                input.classList.add('shake');
                if (!firstWrongId) firstWrongId = `ans-${i}`;
                setTimeout(() => {
                    input.classList.remove('shake');
                    input.value = '';
                    input.style.borderColor = '';
                    input.style.backgroundColor = '';
                }, 600);
            }
        });

        if (allCorrect) {
            Utils.playSound('correct');
            app.addScore(1);
            app.autoNext();
        } else {
            Utils.playSound('wrong');
            if (firstWrongId) setTimeout(() => Utils.setActiveInput(firstWrongId), 650);
        }
    },

    next() {
        Category5.currentQ++;
        Category5.loadQuestion();
    }
};
