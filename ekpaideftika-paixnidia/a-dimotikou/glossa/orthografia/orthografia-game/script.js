const words = [
    // Ουσιαστικά σε -ι
    { article: 'το', stem: 'πουλ', option: 'ι', correct: 'ί', full: 'πουλί' },
    { article: 'το', stem: 'παιδ', option: 'ι', correct: 'ί', full: 'παιδί' },
    { article: 'το', stem: 'σκυλ', option: 'ι', correct: 'ί', full: 'σκυλί' },
    { article: 'το', stem: 'χέρ', option: 'ι', correct: 'ι', full: 'χέρι' },
    { article: 'το', stem: 'πόδ', option: 'ι', correct: 'ι', full: 'πόδι' },
    { article: 'το', stem: 'μαχαίρ', option: 'ι', correct: 'ι', full: 'μαχαίρι' },
    { article: 'το', stem: 'σπίτ', option: 'ι', correct: 'ι', full: 'σπίτι' },
    { article: 'το', stem: 'κουτ', option: 'ι', correct: 'ί', full: 'κουτί' },
    
    // Ουσιαστικά σε -η
    { article: 'η', stem: 'φων', option: 'η', correct: 'ή', full: 'φωνή' },
    { article: 'η', stem: 'βρύσ', option: 'η', correct: 'η', full: 'βρύση' },
    { article: 'η', stem: 'νίκ', option: 'η', correct: 'η', full: 'νίκη' },
    { article: 'η', stem: 'αγάπ', option: 'η', correct: 'η', full: 'αγάπη' },
    { article: 'η', stem: 'αυλ', option: 'η', correct: 'ή', full: 'αυλή' },
    { article: 'η', stem: 'βροχ', option: 'η', correct: 'ή', full: 'βροχή' },
    { article: 'η', stem: 'αράχν', option: 'η', correct: 'η', full: 'αράχνη' },

    // Ρήματα (-ει ή -ω)
    // Εδώ βάζουμε και ρήματα σε -ει και ρήματα σε -ω
    { article: 'αυτός', stem: 'τρέχ', option: 'ει', correct: 'ει', full: 'τρέχει' },
    { article: 'εγώ', stem: 'παίζ', option: 'ω', correct: 'ω', full: 'παίζω' },
    { article: 'αυτή', stem: 'γράφ', option: 'ει', correct: 'ει', full: 'γράφει' },
    { article: 'αυτός', stem: 'διαβάζ', option: 'ει', correct: 'ει', full: 'διαβάζει' },
    { article: 'εγώ', stem: 'βλέπ', option: 'ω', correct: 'ω', full: 'βλέπω' },
    { article: 'αυτό', stem: 'κλαί', option: 'ει', correct: 'ει', full: 'κλαίει' },
    { article: 'αυτή', stem: 'τραγουδά', option: 'ει', correct: 'ει', full: 'τραγουδάει' },
    { article: 'εγώ', stem: 'τρέχ', option: 'ω', correct: 'ω', full: 'τρέχω' },

    // Πληθυντικός Ουσιαστικών σε -οι
    { article: 'οι', stem: 'άνθρωπ', option: 'οι', correct: 'οι', full: 'άνθρωποι' },
    { article: 'οι', stem: 'δρόμ', option: 'οι', correct: 'οι', full: 'δρόμοι' },
    { article: 'οι', stem: 'φίλ', option: 'οι', correct: 'οι', full: 'φίλοι' },
    { article: 'οι', stem: 'λύκ', option: 'οι', correct: 'οι', full: 'λύκοι' },
    { article: 'οι', stem: 'κήπ', option: 'οι', correct: 'οι', full: 'κήποι' },
    { article: 'οι', stem: 'γιατρ', option: 'οι', correct: 'οί', full: 'γιατροί' },
    { article: 'οι', stem: 'δάσκαλ', option: 'οι', correct: 'οι', full: 'δάσκαλοι' },

    // Ουσιαστικά σε -ο
    { article: 'το', stem: 'βάζ', option: 'ο', correct: 'ο', full: 'βάζο' },
    { article: 'το', stem: 'μήλ', option: 'ο', correct: 'ο', full: 'μήλο' },
    { article: 'το', stem: 'βιβλί', option: 'ο', correct: 'ο', full: 'βιβλίο' },
    { article: 'το', stem: 'νερ', option: 'ο', correct: 'ό', full: 'νερό' },
    { article: 'το', stem: 'βουν', option: 'ο', correct: 'ό', full: 'βουνό' },
    { article: 'το', stem: 'δέντρ', option: 'ο', correct: 'ο', full: 'δέντρο' },
    { article: 'το', stem: 'φύλλ', option: 'ο', correct: 'ο', full: 'φύλλο' },
    { article: 'το', stem: 'χωρι', option: 'ο', correct: 'ό', full: 'χωριό' },

    // Νέα Ουσιαστικά σε -ι
    { article: 'το', stem: 'ψωμ', option: 'ι', correct: 'ί', full: 'ψωμί' },
    { article: 'το', stem: 'αλάτ', option: 'ι', correct: 'ι', full: 'αλάτι' },
    { article: 'το', stem: 'νησ', option: 'ι', correct: 'ί', full: 'νησί' },
    { article: 'το', stem: 'μολύβ', option: 'ι', correct: 'ι', full: 'μολύβι' },
    { article: 'το', stem: 'κλειδ', option: 'ι', correct: 'ί', full: 'κλειδί' },
    { article: 'το', stem: 'ταξίδ', option: 'ι', correct: 'ι', full: 'ταξίδι' },

    // Νέα Ουσιαστικά σε -η
    { article: 'η', stem: 'ζω', option: 'η', correct: 'ή', full: 'ζωή' },
    { article: 'η', stem: 'τιμ', option: 'η', correct: 'ή', full: 'τιμή' },
    { article: 'η', stem: 'γιορτ', option: 'η', correct: 'ή', full: 'γιορτή' },
    { article: 'η', stem: 'πόλ', option: 'η', correct: 'η', full: 'πόλη' },
    { article: 'η', stem: 'θέσ', option: 'η', correct: 'η', full: 'θέση' },

    // Νέα Ρήματα (-ει ή -ω)
    { article: 'εγώ', stem: 'πίν', option: 'ω', correct: 'ω', full: 'πίνω' },
    { article: 'αυτός', stem: 'τρώ', option: 'ει', correct: 'ει', full: 'τρώει' },
    { article: 'αυτή', stem: 'χορεύ', option: 'ει', correct: 'ει', full: 'χορεύει' },
    { article: 'αυτός', stem: 'φεύγ', option: 'ει', correct: 'ει', full: 'φεύγει' },
    { article: 'εγώ', stem: 'ανοίγ', option: 'ω', correct: 'ω', full: 'ανοίγω' },
    { article: 'εγώ', stem: 'κάν', option: 'ω', correct: 'ω', full: 'κάνω' },

    // Νέος Πληθυντικός σε -οι
    { article: 'οι', stem: 'σκύλ', option: 'οι', correct: 'οι', full: 'σκύλοι' },
    { article: 'οι', stem: 'αδελφ', option: 'οι', correct: 'οί', full: 'αδελφοί' },
    { article: 'οι', stem: 'νόμ', option: 'οι', correct: 'οι', full: 'νόμοι' },
    { article: 'οι', stem: 'ποταμ', option: 'οι', correct: 'οί', full: 'ποταμοί' },
    { article: 'οι', stem: 'ουραν', option: 'οι', correct: 'οί', full: 'ουρανοί' },

    // Νέα Ουσιαστικά σε -ο
    { article: 'το', stem: 'παράθυρ', option: 'ο', correct: 'ο', full: 'παράθυρο' },
    { article: 'το', stem: 'σχολεί', option: 'ο', correct: 'ο', full: 'σχολείο' },
    { article: 'το', stem: 'φαγητ', option: 'ο', correct: 'ό', full: 'φαγητό' },
    { article: 'το', stem: 'αυτοκίνητ', option: 'ο', correct: 'ο', full: 'αυτοκίνητο' },
    { article: 'το', stem: 'πάρκ', option: 'ο', correct: 'ο', full: 'πάρκο' },
    { article: 'το', stem: 'τηλέφων', option: 'ο', correct: 'ο', full: 'τηλέφωνο' },
    { article: 'το', stem: 'ποτ', option: 'ο', correct: 'ό', full: 'ποτό' },
    { article: 'το', stem: 'αεροπλάν', option: 'ο', correct: 'ο', full: 'αεροπλάνο' },
];

// DOM Elements for Mode Selection
const startScreenEl = document.getElementById('start-screen');
const levelScreenEl = document.getElementById('level-screen');
const timeScreenEl = document.getElementById('time-screen');
const gameContainerEl = document.getElementById('game-container');
const timerDisplayEl = document.getElementById('timer-display');
const templateEl = document.getElementById('player-board-template');
const endOverlayEl = document.getElementById('end-overlay');

// Global Instances
let playerBoards = [];
let selectedMode = null;
let selectedLevel = 1;
let gameTimer = null;
let gameDuration = 0;

// GA4 Event Tracking Helper
function trackEvent(eventName, params) {
    try {
        if (typeof gtag === 'function') {
            gtag('event', eventName, params || {});
        }
    } catch (e) {}
}

// Ήχοι (Προαιρετικό, αν θέλεις να προσθέσεις στο μέλλον)
const playCorrectSound = () => {
    try {
        const audio = new Audio('https://www.myinstants.com/media/sounds/correct-chime.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio error:', e));
    } catch (e) {}
};

const playWrongSound = () => {
    try {
        const audio = new Audio('https://www.myinstants.com/media/sounds/error-sound-effect.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio error:', e));
    } catch (e) {}
};

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Περνάει από ΟΛΕΣ τις κατηγορίες (καταλήξεις/άρθρα) με τη σειρά, μία λέξη από
// την καθεμία, και μετά ξαναρχίζει τον κύκλο — ώστε να μην επαναλαμβάνεται
// συνέχεια η ίδια κατηγορία πριν εμφανιστούν όλες οι υπόλοιπες.
function buildRoundRobinDeck(array, getType) {
    const groups = {};
    shuffleArray(array).forEach(item => {
        const type = getType(item);
        if (!groups[type]) groups[type] = [];
        groups[type].push(item);
    });

    const typeOrder = shuffleArray(Object.keys(groups));
    const deck = [];
    let remaining = array.length;

    while (remaining > 0) {
        for (const type of typeOrder) {
            const bucket = groups[type];
            if (bucket && bucket.length > 0) {
                deck.push(bucket.shift());
                remaining--;
            }
        }
    }

    return deck;
}

class PlayerBoard {
    constructor(containerElement, level) {
        this.level = level;
        // Clone the template
        this.boardEl = templateEl.content.cloneNode(true).querySelector('.player-board');
        containerElement.appendChild(this.boardEl);
        
        // Find specific elements within this board
        this.wordArticleEl = this.boardEl.querySelector('.word-article');
        this.wordStemEl = this.boardEl.querySelector('.word-stem');
        this.wordEndingEl = this.boardEl.querySelector('.word-ending');
        this.wordCardEl = this.boardEl.querySelector('.word-card');
        this.feedbackMessageEl = this.boardEl.querySelector('.feedback-message');
        this.optionBtns = this.boardEl.querySelectorAll('.option-btn');
        this.nextBtn = this.boardEl.querySelector('.next-btn');
        this.correctScoreEl = this.boardEl.querySelector('.correct-score');
        this.wrongScoreEl = this.boardEl.querySelector('.wrong-score');
        
        // Bind events
        this.optionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleOptionClick(e));
        });
        this.nextBtn.addEventListener('click', () => this.handleNextClick());
        
        // Initialize Game State
        this.initGame();
    }
    
    initGame() {
        if (this.level === 1) {
            const nounArticles = ['ο', 'η', 'το', 'οι'];
            this.playerWords = buildRoundRobinDeck(words.filter(w => nounArticles.includes(w.article)), w => w.article);
            const articleOptions = ['ο', 'η', 'το', 'οι'];
            this.optionBtns.forEach((btn, i) => {
                if (i < articleOptions.length) {
                    btn.setAttribute('data-ending', articleOptions[i]);
                    btn.textContent = articleOptions[i];
                    btn.style.display = '';
                } else {
                    btn.style.display = 'none';
                }
            });
        } else {
            this.playerWords = buildRoundRobinDeck(words, w => w.option);
            this.optionBtns.forEach(btn => btn.style.display = '');
        }
        this.currentWordIndex = 0;
        this.correctScore = 0;
        this.wrongScore = 0;
        this.wrongWords = [];
        this.updateScore();
        this.loadWord();
    }
    
    loadWord() {
        this.attemptsForWord = 0;
        const currentWord = this.playerWords[this.currentWordIndex];
        
        // Reset UI
        if (this.level === 1) {
            this.wordArticleEl.textContent = ' ';
            this.wordArticleEl.className = 'word-article missing';
            this.wordArticleEl.style.display = 'inline';
            this.wordStemEl.textContent = currentWord.full;
            this.wordEndingEl.style.display = 'none';
        } else {
            this.wordEndingEl.style.display = '';
            this.wordEndingEl.textContent = ' ';
            this.wordEndingEl.className = 'word-ending missing';
            this.wordStemEl.textContent = currentWord.stem;
            const isVerb = ['εγώ', 'εσύ', 'αυτός', 'αυτή', 'αυτό', 'εμείς', 'εσείς', 'αυτοί'].includes(currentWord.article);
            if (currentWord.article && (this.level === 2 || isVerb)) {
                this.wordArticleEl.textContent = currentWord.article + ' ';
                this.wordArticleEl.className = 'word-article';
                this.wordArticleEl.style.display = 'inline';
            } else {
                this.wordArticleEl.style.display = 'none';
                this.wordArticleEl.textContent = '';
            }
        }
        this.wordCardEl.className = 'word-card';
        this.feedbackMessageEl.textContent = '';
        this.feedbackMessageEl.className = 'feedback-message';
        this.nextBtn.classList.add('hidden');
        
        // Ενεργοποίηση κουμπιών με εφε
        this.optionBtns.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
        });
    }

    updateScore() {
        this.correctScoreEl.textContent = this.correctScore;
        this.wrongScoreEl.textContent = this.wrongScore;
    }

    handleOptionClick(event) {
        const selectedOption = event.target.getAttribute('data-ending');
        const currentWord = this.playerWords[this.currentWordIndex];

        const correctAnswer = this.level === 1 ? currentWord.article : currentWord.option;
        const attemptNumber = this.attemptsForWord + 1;
        trackEvent('answer_submitted', {
            word: currentWord.full,
            is_correct: selectedOption === correctAnswer,
            level: this.level,
            attempt_number: attemptNumber
        });

        if (selectedOption === correctAnswer) {
            // Correct Answer
            trackEvent('correct_answer', {
                word: currentWord.full,
                level: this.level,
                attempt_number: attemptNumber
            });
            playCorrectSound();
            if (this.level === 1) {
                this.wordArticleEl.textContent = currentWord.article + ' ';
                this.wordArticleEl.className = 'word-article missing filled-correct';
            } else {
                this.wordEndingEl.textContent = currentWord.correct;
                this.wordEndingEl.className = 'word-ending missing filled-correct';
            }
            this.wordCardEl.className = 'word-card correct-anim';
            
            this.feedbackMessageEl.textContent = 'Σωστό!';
            this.feedbackMessageEl.className = 'feedback-message success pop-in';
            
            if (this.attemptsForWord === 0) {
                this.correctScore++;
            } else {
                if (!this.wrongWords.includes(currentWord)) {
                    this.wrongWords.push(currentWord);
                }
            }
            this.updateScore();

            // Fire Confetti (μόνο σε 1 παίκτη)
            if (selectedMode === 'single') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { 
                        x: this.boardEl.getBoundingClientRect().left / window.innerWidth + (this.boardEl.getBoundingClientRect().width / 2) / window.innerWidth,
                        y: this.boardEl.getBoundingClientRect().top / window.innerHeight + (this.boardEl.getBoundingClientRect().height / 2) / window.innerHeight
                    },
                    colors: ['#FF4757', '#2ED573', '#FFA502', '#1E90FF', '#FF69B4']
                });
            }

            // Disable buttons
            this.optionBtns.forEach(btn => {
                btn.disabled = true;
                if (btn.getAttribute('data-ending') !== correctAnswer) {
                    btn.style.opacity = '0.4';
                    btn.style.transform = 'scale(0.95)';
                } else {
                    btn.classList.add('pulse-btn');
                }
            });
            
            // Tablet mode (απέναντι): αυτόματη μετάβαση στην επόμενη λέξη
            if (selectedMode === 'tablet') {
                this.nextBtn.classList.add('hidden');
                setTimeout(() => this.handleNextClick(), 1500);
            } else {
                // Κανονικό mode: δείξε το κουμπί "Επόμενη"
                if (this.currentWordIndex === this.playerWords.length - 1) {
                    this.nextBtn.textContent = 'Παίξε ξανά';
                } else {
                    this.nextBtn.textContent = 'Επόμενη Λέξη ➔';
                }
                this.nextBtn.classList.remove('hidden');
            }
            
        } else {
            // Wrong Answer
            trackEvent('wrong_answer', {
                word: currentWord.stem + selectedOption,
                correct_word: currentWord.full,
                level: this.level,
                attempt_number: attemptNumber
            });
            playWrongSound();
            this.attemptsForWord++;
            
            this.wordCardEl.classList.remove('shake');
            void this.wordCardEl.offsetWidth; // trigger reflow
            this.wordCardEl.classList.add('shake');
            
            this.feedbackMessageEl.textContent = 'Προσπάθησε πάλι.';
            this.feedbackMessageEl.className = 'feedback-message error';
            
            if (this.attemptsForWord === 1) {
                this.wrongScore++;
                this.updateScore();
                const strugglingType = this.level === 1 ? currentWord.article : currentWord.option;
                this.reinforceType(strugglingType);
            }

            // Disable the clicked wrong button
            event.target.disabled = true;
            event.target.style.opacity = '0.4';
            event.target.style.transform = 'scale(0.9)';
        }
    }

    // Όταν ένα παιδί δυσκολεύεται με μια κατάληξη/άρθρο, φέρνει πιο κοντά
    // (μέσα στις επόμενες λίγες λέξεις) μια ακόμα λέξη της ίδιας κατηγορίας
    // για επιπλέον εξάσκηση, χωρίς να αλλάζει το μέγεθος της τράπουλας.
    reinforceType(type) {
        for (let i = this.currentWordIndex + 1; i < this.playerWords.length; i++) {
            const candidateType = this.level === 1 ? this.playerWords[i].article : this.playerWords[i].option;
            if (candidateType === type) {
                const [word] = this.playerWords.splice(i, 1);
                const insertAt = Math.min(this.currentWordIndex + 2, this.playerWords.length);
                this.playerWords.splice(insertAt, 0, word);
                return;
            }
        }
    }

    disable() {
        this.optionBtns.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.4';
        });
        this.nextBtn.classList.add('hidden');
        this.feedbackMessageEl.textContent = `Τέλος! Σωστά: ${this.correctScore} | Λάθος: ${this.wrongScore}`;
        this.feedbackMessageEl.className = 'feedback-message success pop-in';
    }

    startReview() {
        if (this.wrongWords.length === 0) {
            this.feedbackMessageEl.textContent = 'Μπράβο! Δεν έκανες κανένα λάθος!';
            this.feedbackMessageEl.className = 'feedback-message success pop-in';
            setTimeout(() => goToStartScreen(), 2500);
            return;
        }
        this.isReviewMode = true;
        this.playerWords = buildRoundRobinDeck(this.wrongWords, w => this.level === 1 ? w.article : w.option);
        this.wrongWords = [];
        this.currentWordIndex = 0;
        this.correctScore = 0;
        this.wrongScore = 0;
        this.updateScore();
        this.loadWord();
        this.feedbackMessageEl.textContent = `Επαναλαμβάνουμε ${this.playerWords.length} λάθη!`;
        this.feedbackMessageEl.className = 'feedback-message error pop-in';
    }

    handleNextClick() {
        // Αφαίρεση pulse animation
        this.optionBtns.forEach(btn => btn.classList.remove('pulse-btn'));
        
        this.currentWordIndex++;
        if (this.currentWordIndex >= this.playerWords.length) {
            trackEvent('level_complete', {
                level: this.level,
                score: this.correctScore,
                mistakes: this.wrongScore
            });

            // Η τράπουλα τελείωσε — καμία λέξη δεν ξαναδείχνεται αυτόματα.
            // Η επανάληψη λαθών μένει διαθέσιμη μόνο μέσω του κουμπιού
            // "Επανάληψη Λαθών" στο τέλος του χρόνου.
            const message = this.isReviewMode
                ? 'Μπράβο! Τελείωσες την επανάληψη!'
                : 'Τέλειο! Τα βρήκες όλα σωστά!';
            this.feedbackMessageEl.textContent = message;
            this.feedbackMessageEl.className = 'feedback-message success pop-in';

            // Μεγάλο confetti γιορτής (μόνο σε 1 παίκτη)
            if (selectedMode === 'single') {
                confetti({
                    particleCount: 250,
                    spread: 120,
                    origin: { y: 0.5 },
                    colors: ['#FF4757', '#2ED573', '#FFA502', '#1E90FF', '#FF69B4', '#6C5CE7']
                });
            }

            // Disable κουμπιά κατά τη μετάβαση
            this.optionBtns.forEach(btn => { btn.disabled = true; });
            this.nextBtn.classList.add('hidden');

            // Αυτόματη επιστροφή στην αρχική μετά από 2.5 δευτ.
            setTimeout(() => goToStartScreen(), 2500);
        } else {
            this.loadWord();
        }
    }
}

window.selectMode = function(mode) {
    selectedMode = mode;
    startScreenEl.classList.add('hidden');
    levelScreenEl.classList.remove('hidden');
};

window.selectLevel = function(level) {
    selectedLevel = level;
    levelScreenEl.classList.add('hidden');
    timeScreenEl.classList.remove('hidden');
};

window.goBackToStart = function() {
    levelScreenEl.classList.add('hidden');
    startScreenEl.classList.remove('hidden');
};

window.goBackToLevel = function() {
    timeScreenEl.classList.add('hidden');
    levelScreenEl.classList.remove('hidden');
};

// Επιστροφή στην αρχική οθόνη μετά το τέλος γύρου/επανάληψης
function goToStartScreen() {
    // Σταμάτα τον timer αν τρέχει
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }

    // Καθάρισε τα boards
    const boards = gameContainerEl.querySelectorAll('.player-board');
    boards.forEach(b => b.remove());
    playerBoards = [];

    // Κρύψε παιχνίδι και overlay
    gameContainerEl.classList.add('hidden');
    endOverlayEl.classList.add('hidden');
    timerDisplayEl.textContent = '';
    timerDisplayEl.className = 'timer-display';

    // Εμφάνισε αρχική οθόνη
    startScreenEl.classList.remove('hidden');
}

// Start Game based on Mode and Time
window.startGame = function(seconds) {
    timeScreenEl.classList.add('hidden');
    gameContainerEl.classList.remove('hidden');

    // Clear any existing boards just in case (except the home button)
    const boards = gameContainerEl.querySelectorAll('.player-board');
    boards.forEach(b => b.remove());
    gameContainerEl.className = 'game-container'; // reset classes

    playerBoards = [];

    if (selectedMode === 'single') {
        gameContainerEl.classList.add('mode-single');
        playerBoards.push(new PlayerBoard(gameContainerEl, selectedLevel));
    } else if (selectedMode === 'tablet') {
        gameContainerEl.classList.add('mode-tablet');
        playerBoards.push(new PlayerBoard(gameContainerEl, selectedLevel));
        playerBoards.push(new PlayerBoard(gameContainerEl, selectedLevel));
        // Γύρνα τον πάνω πίνακα 180° για τον απέναντι παίκτη
        playerBoards[1].boardEl.classList.add('player-rotated');
    } else if (selectedMode === 'board') {
        gameContainerEl.classList.add('mode-board');
        playerBoards.push(new PlayerBoard(gameContainerEl, selectedLevel));
        playerBoards.push(new PlayerBoard(gameContainerEl, selectedLevel));
    }

    gameDuration = seconds;
    trackEvent('start_game', {
        mode: selectedMode,
        level: selectedLevel,
        duration_seconds: seconds
    });
    startTimer(seconds);
};

function startTimer(seconds) {
    if (gameTimer) clearInterval(gameTimer);
    let timeRemaining = seconds;

    function updateDisplay() {
        const mins = Math.floor(timeRemaining / 60);
        const secs = timeRemaining % 60;
        timerDisplayEl.textContent = mins > 0
            ? `${mins}:${secs.toString().padStart(2, '0')}`
            : `${secs}`;
        if (timeRemaining <= 10) {
            timerDisplayEl.classList.add('timer-urgent');
        } else {
            timerDisplayEl.classList.remove('timer-urgent');
        }
    }

    updateDisplay();
    gameTimer = setInterval(() => {
        timeRemaining--;
        updateDisplay();
        if (timeRemaining <= 0) {
            clearInterval(gameTimer);
            endGame();
        }
    }, 1000);
}

function endGame() {
    timerDisplayEl.textContent = 'Τέλος χρόνου!';
    timerDisplayEl.classList.remove('timer-urgent');
    timerDisplayEl.classList.add('timer-ended');
    playerBoards.forEach(board => board.disable());

    const totalCorrect = playerBoards.reduce((sum, b) => sum + b.correctScore, 0);
    const totalWrong = playerBoards.reduce((sum, b) => sum + b.wrongScore, 0);
    const total = totalCorrect + totalWrong;
    const score = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;
    trackEvent('finish_game', {
        score,
        total_correct: totalCorrect,
        total_wrong: totalWrong,
        duration_seconds: gameDuration,
        level_reached: selectedLevel
    });

    const hasWrongWords = playerBoards.some(b => b.wrongWords.length > 0);
    const endOverlay = document.getElementById('end-overlay');
    const endScores = document.getElementById('end-scores');
    const retryBtn = document.getElementById('retry-btn');

    endScores.innerHTML = playerBoards.map((b, i) => {
        const label = playerBoards.length > 1 ? `<span class="player-label">Παίκτης ${i + 1}</span>` : '';
        return `${label}<span class="end-correct">Σωστά: ${b.correctScore}</span><span class="end-wrong">Λάθος: ${b.wrongScore}</span>`;
    }).join('<hr class="score-divider">');

    if (hasWrongWords) {
        retryBtn.classList.remove('hidden');
        retryBtn.onclick = () => {
            endOverlay.classList.add('hidden');
            timerDisplayEl.textContent = 'Επανάληψη λαθών!';
            timerDisplayEl.classList.remove('timer-ended');
            timerDisplayEl.classList.add('timer-review');
            playerBoards.forEach(board => board.startReview());
        };
    } else {
        retryBtn.classList.add('hidden');
    }

    setTimeout(() => endOverlay.classList.remove('hidden'), 800);
}


