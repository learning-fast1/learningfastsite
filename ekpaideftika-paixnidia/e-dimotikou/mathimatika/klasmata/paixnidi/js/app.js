const app = {
    score: 0,
    currentCategory: 0,
    currentStage: 0,
    
    init: () => {
        // Any init logic
    },
    
    showScreen: (screenId) => {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        document.getElementById('celebration').classList.add('hidden');
    },
    
    goHome: () => {
        app.showScreen('screen-main-menu');
    },
    
    goBack: () => {
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer.classList.contains('hidden')) {
            // We are inside a game stage. Go back to stage selector.
            gameContainer.classList.add('hidden');
            document.getElementById('stage-selector').classList.remove('hidden');
            document.getElementById('category-title').innerText = app.getCategoryTitle(app.currentCategory);
        } else {
            // We are in the stage selector. Go back to main menu.
            app.goHome();
        }
    },
    
    getCategoryTitle: (catId) => {
        if (catId === 1) return 'Μέρος του Αριθμού';
        if (catId === 2) return 'Ισοδύναμα Κλάσματα';
        if (catId === 3) return 'Σύγκριση Κλασμάτων';
        if (catId === 4) return 'Σειροθέτηση Κλασμάτων';
        if (catId === 5) return 'Προβλήματα';
        return '';
    },
    
    showCategory: (catId) => {
        app.currentCategory = catId;
        app.showScreen('screen-category');
        
        let title = '';
        let stagesHTML = '';
        
        if (catId === 1) {
            title = 'Μέρος του Αριθμού';
            stagesHTML = `
                <button class="btn-stage" onclick="Category1.startStage(1)">Στάδιο 1: Εναδικά κλάσματα<span class="btn-stage-note">(παρονομαστής ίσος με αντικείμενα)</span></button>
                <button class="btn-stage" onclick="Category1.startStage(2)">Στάδιο 2: Κλάσματα<span class="btn-stage-note">(παρονομαστής ίσος με αντικείμενα)</span></button>
                <button class="btn-stage" onclick="Category1.startStage(3)">Στάδιο 3: Κλάσματα</button>
                <button class="btn-stage" onclick="Category1.startStage(4)">Στάδιο 4: Βρες το μέρος του αριθμού</button>
                <button class="btn-stage" onclick="Category1.startStage(5)">Στάδιο 5: Βρες τον κρυμμένο αριθμό</button>
            `;
        } else if (catId === 2) {
            title = 'Ισοδύναμα Κλάσματα';
            stagesHTML = `
                <button class="btn-stage" onclick="Category2.startStage(1)">Στάδιο 1: Με σχήματα</button>
                <button class="btn-stage" onclick="Category2.startStage(2)">Στάδιο 2: Χωρίς σχήματα</button>
                <button class="btn-stage" onclick="Category2.startStage(3)">Στάδιο 3: Γράψε εσύ!</button>
                <button class="btn-stage" onclick="Category2.startStage(4)">Στάδιο 4: Βρες τον όρο που λείπει</button>
            `;
        } else if (catId === 3) {
            title = 'Σύγκριση Κλασμάτων';
            stagesHTML = `
                <button class="btn-stage" onclick="Category3.startStage(1)">Στάδιο 1: Σύγκριση κλασμάτων με σχήματα</button>
                <button class="btn-stage" onclick="Category3.startStage(2)">Στάδιο 2: Σύγκριση ομώνυμων κλασμάτων</button>
                <button class="btn-stage" onclick="Category3.startStage(3)">Στάδιο 3: Σύγκριση κλασμάτων με όμοιο αριθμητή</button>
                <button class="btn-stage" onclick="Category3.startStage(4)">Στάδιο 4: Σύγκριση ετερώνυμων κλασμάτων</button>
            `;
        } else if (catId === 4) {
            title = 'Σειροθέτηση Κλασμάτων';
            stagesHTML = `
                <button class="btn-stage" onclick="Category4.startStage(1)">Στάδιο 1: Ομώνυμα κλάσματα</button>
                <button class="btn-stage" onclick="Category4.startStage(2)">Στάδιο 2: Σύγκριση με 1/2</button>
                <button class="btn-stage" onclick="Category4.startStage(3)">Στάδιο 3: Ετερώνυμα κλάσματα</button>
            `;
        } else if (catId === 5) {
            title = 'Προβλήματα';
            stagesHTML = `
                <button class="btn-stage" onclick="Category5.startStage(1)">Στάδιο 1: Μέρος του αριθμού (ένα κλάσμα)</button>
                <button class="btn-stage" onclick="Category5.startStage(2)">Στάδιο 2: Μέρος του αριθμού (δύο κλάσματα)</button>
                <button class="btn-stage" onclick="Category5.startStage(3)">Στάδιο 3: Μέρος του αριθμού (συνολικός αριθμός)</button>
            `;
        }
        
        document.getElementById('category-title').innerText = title;
        document.getElementById('stage-selector').innerHTML = stagesHTML;
        document.getElementById('stage-selector').classList.remove('hidden');
        document.getElementById('game-container').classList.add('hidden');
    },
    
    autoNext: (delay = 900) => {
        let btn = document.getElementById('btn-submit');
        if (btn) btn.disabled = true;
        setTimeout(() => app.nextQuestion(), delay);
    },

    addScore: (points = 1) => {
        app.score += points;
        document.getElementById('score-display').innerText = app.score;
    },
    
    showCelebration: () => {
        document.getElementById('celebration').classList.remove('hidden');
        Utils.playSound('correct');
    },
    
    closeCelebration: () => {
        document.getElementById('celebration').classList.add('hidden');
        app.showCategory(app.currentCategory);
    },
    
    checkAnswer: () => {
        if (app.currentCategory === 1) Category1.check();
        else if (app.currentCategory === 2) Category2.check();
        else if (app.currentCategory === 3) Category3.check();
        else if (app.currentCategory === 4) Category4.check();
        else if (app.currentCategory === 5) Category5.check();
    },

    prepareGameArea: (stageTitle, promptHtml) => {
        document.getElementById('stage-selector').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        document.getElementById('stage-title').innerText = stageTitle;
        document.getElementById('game-prompt').innerHTML = promptHtml;

        let area = document.getElementById('game-area');
        area.innerHTML = '';
        area.style.flexDirection = '';
        area.style.alignItems = '';
        area.style.gap = '';

        const controls = document.getElementById('game-controls');
        const btnSubmit = document.getElementById('btn-submit');
        const btnNext = document.getElementById('btn-next');

        controls.classList.remove('hidden');
        btnSubmit.classList.remove('hidden');
        btnNext.classList.add('hidden');
        btnSubmit.disabled = false;
    },

    nextQuestion: () => {
        if (app.currentCategory === 1) Category1.next();
        else if (app.currentCategory === 2) Category2.next();
        else if (app.currentCategory === 3) Category3.next();
        else if (app.currentCategory === 4) Category4.next();
        else if (app.currentCategory === 5) Category5.next();
    }
};

window.onload = app.init;
