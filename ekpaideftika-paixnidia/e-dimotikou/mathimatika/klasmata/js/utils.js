const Utils = {
    // Basic random integer
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    // Array shuffle
    shuffle: (array) => {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    },

    // Greatest Common Divisor
    gcd: (a, b) => {
        return b === 0 ? a : Utils.gcd(b, a % b);
    },

    // Play simple sound with AudioContext
    audioCtx: null,
    playSound: (type) => {
        if (!Utils.audioCtx) {
            Utils.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = Utils.audioCtx.createOscillator();
        const gainNode = Utils.audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(Utils.audioCtx.destination);
        
        if (type === 'correct') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, Utils.audioCtx.currentTime); // C5
            oscillator.frequency.exponentialRampToValueAtTime(1046.50, Utils.audioCtx.currentTime + 0.1); // C6
            gainNode.gain.setValueAtTime(0.5, Utils.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, Utils.audioCtx.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(Utils.audioCtx.currentTime + 0.5);
        } else if (type === 'wrong') {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(300, Utils.audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, Utils.audioCtx.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.5, Utils.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, Utils.audioCtx.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(Utils.audioCtx.currentTime + 0.3);
        } else if (type === 'pop') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, Utils.audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, Utils.audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, Utils.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, Utils.audioCtx.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(Utils.audioCtx.currentTime + 0.1);
        }
    },

    // HTML for Fraction
    renderFraction: (num, den) => {
        return `<div class="fraction"><span class="fraction-top">${num}</span><span class="fraction-bottom">${den}</span></div>`;
    },

    // Emojis for objects
    objects: ['🍎', '⚽', '⭐', '🎈', '🚗', '🧸', '🐶', '💎', '🍕', '🍓', '🦋', '🐢'],
    getRandomObject: () => Utils.objects[Utils.randomInt(0, Utils.objects.length - 1)],

    // Numeric Keypad
    activeNumpadInput: null,

    setActiveInput: (id) => {
        if (Utils.activeNumpadInput) {
            let prev = document.getElementById(Utils.activeNumpadInput);
            if (prev) prev.classList.remove('input-active');
        }
        Utils.activeNumpadInput = id;
        let el = document.getElementById(id);
        if (el) el.classList.add('input-active');
    },

    numpadPress: (key) => {
        let input = document.getElementById(Utils.activeNumpadInput);
        if (!input) return;
        let maxLen = parseInt(input.dataset.maxlen) || 2;
        if (key === '⌫') {
            input.value = input.value.slice(0, -1);
        } else if (input.value.length < maxLen) {
            input.value += key;
        }
        Utils.playSound('pop');
    },

    renderNumpad: () => {
        const keys = ['1','2','3','4','5','6','7','8','9','⌫','0',''];
        const btns = keys.map(k => {
            if (k === '') return '<div></div>';
            const cls = k === '⌫' ? 'numpad-btn numpad-del' : 'numpad-btn';
            return `<button class="${cls}" onclick="Utils.numpadPress('${k}')">${k}</button>`;
        }).join('');
        return `<div class="numpad">${btns}</div>`;
    },

    // Generate Pie Chart background with visible slices using SVG for crisp lines
    createPieChart: (num, den) => {
        let lines = '';
        for(let i=0; i<den; i++) {
            let angle = (i * 360 / den - 90) * Math.PI / 180;
            let x2 = 50 + 52 * Math.cos(angle);
            let y2 = 50 + 52 * Math.sin(angle);
            lines += `<line x1="50" y1="50" x2="${x2}" y2="${y2}" stroke="#5C2A0A" stroke-width="2.5" />`;
        }
        
        let C = 157.079632679; // Circumference of circle with r=25
        let dash = (num / den) * C;
        
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" fill="#FFF9C4" />
            <circle cx="50" cy="50" r="25" fill="transparent" stroke="#FF5E7E" stroke-width="50" stroke-dasharray="${dash} ${C}" transform="rotate(-90 50 50)" />
            ${lines}
        </svg>`;
        
        // Encode SVG for CSS background
        let encodedSvg = encodeURIComponent(svg.replace(/\s+/g, ' '));
        return `background: url('data:image/svg+xml,${encodedSvg}') center center no-repeat; background-size: cover;`;
    }
};
