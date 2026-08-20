/* Δεδομένα: στάδια, επίπεδα, διαιρέτες */

/** Κουτάκι αντί για ? (size: '' | 'sm' | 'inline') */
function answerBox(count = 1, size = '') {
  const extra = size ? ` answer-slot--${size}` : '';
  return Array.from({ length: count }, () =>
    `<span class="answer-slot${extra}" role="presentation"></span>`
  ).join('');
}

function boxesRow(count) {
  return `<span class="boxes-row">${answerBox(count, 'sm')}</span>`;
}

/** Σύμβολο αγνώστου «?» (πιο ξεκάθαρο από κενό κουτί που μοιάζει με πεδίο). */
function qMark() {
  return `<span class="q-mark" aria-label="άγνωστος αριθμός">;</span>`;
}

function equationHtml(dividend, divisor, options = {}) {
  const { remainder = false, hideAnswer = true, quotient, rem } = options;
  if (!hideAnswer) {
    if (remainder) {
      return `${dividend} ÷ ${divisor} = ${quotient} <span class="eq-word">υπόλοιπο</span> ${rem}`;
    }
    return `${dividend} ÷ ${divisor} = ${quotient}`;
  }
  if (remainder) {
    return `${dividend} ÷ ${divisor} = ${answerBox()}`;
  }
  return `${dividend} ÷ ${divisor} = ${answerBox()}`;
}

const THEMES = {
  distribute: ['🐻', '🌸', '⭐', '🍎', '🎈', '🚗', '📚', '⚽', '🎨', '🔬', '🎮'],
  count: ['🐱', '🌻', '🦆', '⚽', '✏️', '🔢', '📖', '💡', '🧮', '📱'],
  relation: ['🍓', '🐰', '🍕', '🦋', '🌟', '🎯', '🚀', '⚡'],
  remainder: ['🍬', '🧸', '🎁', '🧩', '💎'],
};

const STAGE_DEFS = [
  { id: 1, title: 'Μοιράζω ίσα με εικόνες', desc: 'Σύρε τα αντικείμενα στις ομάδες', badge: 'Στάδιο 1', type: 'distribute', themeKey: 'distribute' },
  { id: 2, title: 'Μετράω σε κάθε ομάδα', desc: 'Πόσα έχει κάθε ομάδα;', badge: 'Στάδιο 2', type: 'count', themeKey: 'count' },
  { id: 3, title: 'Διαίρεση & Πολλαπλασιασμός', desc: 'Η σχέση μεταξύ τους', badge: 'Στάδιο 3', type: 'relation', themeKey: 'relation' },
  { id: 4, title: 'Εξασκούμαι στις διαιρέσεις', desc: 'Διάλεξε την απάντηση', badge: 'Στάδιο 4', type: 'quiz', themeKey: 'count' },
  { id: 5, title: 'Προβλήματα διαίρεσης', desc: 'Μοιράζουμε στην πράξη', badge: 'Στάδιο 5', type: 'story' },
  { id: 6, title: 'Ατελείς διαιρέσεις (υπόλοιπο)', desc: 'Μοιράζουμε — τι μένει;', badge: 'Στάδιο 6', type: 'remainder', themeKey: 'remainder' },
];

/* Πλήρη σετ επιπέδων ανά τάξη × στάδιο */
const LEVEL_POOLS = {
  distribute: {
    1: [
      { dividend: 4, divisor: 2 }, { dividend: 6, divisor: 2 }, { dividend: 6, divisor: 3 },
      { dividend: 8, divisor: 2 }, { dividend: 8, divisor: 4 }, { dividend: 9, divisor: 3 },
      { dividend: 10, divisor: 2 }, { dividend: 10, divisor: 5 },
    ],
    2: [
      { dividend: 6, divisor: 2 }, { dividend: 8, divisor: 2 }, { dividend: 9, divisor: 3 },
      { dividend: 12, divisor: 3 }, { dividend: 12, divisor: 4 }, { dividend: 14, divisor: 2 },
      { dividend: 15, divisor: 3 }, { dividend: 16, divisor: 4 }, { dividend: 18, divisor: 2 },
      { dividend: 20, divisor: 5 },
    ],
    3: [
      { dividend: 12, divisor: 3 }, { dividend: 15, divisor: 5 }, { dividend: 16, divisor: 4 },
      { dividend: 18, divisor: 3 }, { dividend: 20, divisor: 4 }, { dividend: 21, divisor: 3 },
      { dividend: 24, divisor: 4 }, { dividend: 24, divisor: 6 }, { dividend: 27, divisor: 3 },
      { dividend: 28, divisor: 4 }, { dividend: 30, divisor: 5 }, { dividend: 30, divisor: 6 },
    ],
    4: [
      { dividend: 16, divisor: 4 }, { dividend: 20, divisor: 5 }, { dividend: 24, divisor: 6 },
      { dividend: 28, divisor: 4 }, { dividend: 30, divisor: 5 }, { dividend: 32, divisor: 4 },
      { dividend: 35, divisor: 5 }, { dividend: 36, divisor: 6 }, { dividend: 40, divisor: 5 },
      { dividend: 42, divisor: 6 }, { dividend: 45, divisor: 5 }, { dividend: 48, divisor: 6 },
    ],
  },
  count: {
    1: [
      { dividend: 4, divisor: 2 }, { dividend: 6, divisor: 3 }, { dividend: 8, divisor: 2 },
      { dividend: 8, divisor: 4 }, { dividend: 9, divisor: 3 }, { dividend: 10, divisor: 2 },
      { dividend: 10, divisor: 5 }, { dividend: 6, divisor: 2 },
    ],
    2: [
      { dividend: 10, divisor: 2 }, { dividend: 12, divisor: 4 }, { dividend: 14, divisor: 2 },
      { dividend: 15, divisor: 3 }, { dividend: 16, divisor: 4 }, { dividend: 18, divisor: 2 },
      { dividend: 20, divisor: 5 }, { dividend: 12, divisor: 3 }, { dividend: 16, divisor: 2 },
      { dividend: 20, divisor: 4 },
    ],
    3: [
      { dividend: 18, divisor: 3 }, { dividend: 20, divisor: 4 }, { dividend: 21, divisor: 3 },
      { dividend: 24, divisor: 6 }, { dividend: 25, divisor: 5 }, { dividend: 27, divisor: 3 },
      { dividend: 28, divisor: 4 }, { dividend: 30, divisor: 5 }, { dividend: 24, divisor: 4 },
      { dividend: 30, divisor: 6 }, { dividend: 18, divisor: 2 }, { dividend: 28, divisor: 7 },
    ],
    4: [
      { dividend: 24, divisor: 6 }, { dividend: 28, divisor: 7 }, { dividend: 30, divisor: 5 },
      { dividend: 32, divisor: 8 }, { dividend: 35, divisor: 7 }, { dividend: 36, divisor: 6 },
      { dividend: 40, divisor: 8 }, { dividend: 42, divisor: 6 }, { dividend: 45, divisor: 9 },
      { dividend: 48, divisor: 8 }, { dividend: 33, divisor: 3 }, { dividend: 44, divisor: 4 },
    ],
  },
  quiz: {
    1: [
      { dividend: 4, divisor: 2 }, { dividend: 6, divisor: 2 }, { dividend: 6, divisor: 3 },
      { dividend: 8, divisor: 2 }, { dividend: 8, divisor: 4 }, { dividend: 9, divisor: 3 },
      { dividend: 10, divisor: 2 }, { dividend: 10, divisor: 5 },
    ],
    2: [
      { dividend: 10, divisor: 2 }, { dividend: 12, divisor: 4 }, { dividend: 14, divisor: 2 },
      { dividend: 15, divisor: 3 }, { dividend: 16, divisor: 4 }, { dividend: 18, divisor: 2 },
      { dividend: 20, divisor: 5 }, { dividend: 12, divisor: 3 }, { dividend: 16, divisor: 2 },
      { dividend: 20, divisor: 4 },
    ],
    3: [
      { dividend: 18, divisor: 3 }, { dividend: 20, divisor: 4 }, { dividend: 21, divisor: 3 },
      { dividend: 24, divisor: 6 }, { dividend: 25, divisor: 5 }, { dividend: 27, divisor: 3 },
      { dividend: 28, divisor: 4 }, { dividend: 30, divisor: 5 }, { dividend: 24, divisor: 4 },
      { dividend: 30, divisor: 6 }, { dividend: 18, divisor: 2 }, { dividend: 28, divisor: 7 },
    ],
    4: [
      { dividend: 24, divisor: 6 }, { dividend: 28, divisor: 7 }, { dividend: 30, divisor: 5 },
      { dividend: 32, divisor: 8 }, { dividend: 35, divisor: 7 }, { dividend: 36, divisor: 6 },
      { dividend: 40, divisor: 8 }, { dividend: 42, divisor: 6 }, { dividend: 45, divisor: 9 },
      { dividend: 48, divisor: 8 }, { dividend: 33, divisor: 3 }, { dividend: 44, divisor: 4 },
    ],
  },
  relation: {
    1: [
      { dividend: 4, divisor: 2 }, { dividend: 6, divisor: 2 }, { dividend: 6, divisor: 3 },
      { dividend: 8, divisor: 4 }, { dividend: 9, divisor: 3 }, { dividend: 10, divisor: 5 },
      { dividend: 8, divisor: 2 }, { dividend: 10, divisor: 2 },
    ],
    2: [
      { dividend: 8, divisor: 2 }, { dividend: 12, divisor: 3 }, { dividend: 15, divisor: 5 },
      { dividend: 16, divisor: 4 }, { dividend: 18, divisor: 2 }, { dividend: 20, divisor: 4 },
      { dividend: 14, divisor: 2 }, { dividend: 18, divisor: 3 }, { dividend: 20, divisor: 5 },
      { dividend: 16, divisor: 2 },
    ],
    3: [
      { dividend: 12, divisor: 3 }, { dividend: 18, divisor: 3 }, { dividend: 20, divisor: 4 },
      { dividend: 24, divisor: 4 }, { dividend: 24, divisor: 6 }, { dividend: 27, divisor: 3 },
      { dividend: 28, divisor: 4 }, { dividend: 30, divisor: 5 }, { dividend: 21, divisor: 3 },
      { dividend: 25, divisor: 5 }, { dividend: 30, divisor: 6 }, { dividend: 18, divisor: 2 },
    ],
    4: [
      { dividend: 24, divisor: 6 }, { dividend: 28, divisor: 4 }, { dividend: 30, divisor: 5 },
      { dividend: 32, divisor: 8 }, { dividend: 35, divisor: 5 }, { dividend: 36, divisor: 6 },
      { dividend: 40, divisor: 8 }, { dividend: 42, divisor: 7 }, { dividend: 45, divisor: 9 },
      { dividend: 48, divisor: 6 }, { dividend: 33, divisor: 3 }, { dividend: 44, divisor: 4 },
    ],
  },
  remainder: {
    3: [
      { dividend: 7, divisor: 2 }, { dividend: 8, divisor: 3 }, { dividend: 10, divisor: 3 },
      { dividend: 11, divisor: 3 }, { dividend: 13, divisor: 4 }, { dividend: 14, divisor: 3 },
      { dividend: 17, divisor: 5 }, { dividend: 19, divisor: 4 }, { dividend: 20, divisor: 6 },
      { dividend: 23, divisor: 4 },
    ],
    4: [
      { dividend: 7, divisor: 2 }, { dividend: 10, divisor: 3 }, { dividend: 11, divisor: 3 },
      { dividend: 13, divisor: 4 }, { dividend: 17, divisor: 5 }, { dividend: 19, divisor: 4 },
      { dividend: 22, divisor: 5 }, { dividend: 25, divisor: 4 }, { dividend: 26, divisor: 5 },
      { dividend: 29, divisor: 6 }, { dividend: 31, divisor: 5 }, { dividend: 35, divisor: 6 },
    ],
  },
};

/* Κάθε πρόβλημα έχει όνομα, ρήμα, αντικείμενο (ουδέτερο πληθ.) και δοχείο (ουδέτερο).
   Το κείμενο παράγεται από buildStoryText() ώστε να εναλλάσσονται:
   - μεριστική διαίρεση («Πόσα σε κάθε…;»)
   - μετρητική διαίρεση («Πόσα δοχεία χρειάστηκαν;») */
const STORY_POOLS = {
  1: [
    { dividend: 6, divisor: 2, emoji: '🍪', who: 'Ο Κώστας', verb: 'μοίρασε', obj: 'μπισκότα', containerSingular: 'πιάτο', containerPlural: 'πιάτα' },
    { dividend: 8, divisor: 2, emoji: '🌸', who: 'Η Μαρία', verb: 'τοποθέτησε', obj: 'λουλούδια', containerSingular: 'βάζο', containerPlural: 'βάζα' },
    { dividend: 9, divisor: 3, emoji: '🍎', who: 'Ο Νίκος', verb: 'έβαλε', obj: 'μήλα', containerSingular: 'καλάθι', containerPlural: 'καλάθια' },
    { dividend: 10, divisor: 5, emoji: '⭐', who: 'Η Ελένη', verb: 'μοίρασε', obj: 'αυτοκόλλητα', containerSingular: 'τετράδιο', containerPlural: 'τετράδια' },
    { dividend: 6, divisor: 3, emoji: '🐻', who: 'Ο Γιώργος', verb: 'έβαλε', obj: 'ζωάκια', containerSingular: 'κλουβί', containerPlural: 'κλουβιά' },
    { dividend: 4, divisor: 2, emoji: '🍎', who: 'Η Άννα', verb: 'μοίρασε', obj: 'μήλα', containerSingular: 'καλάθι', containerPlural: 'καλάθια' },
    { dividend: 8, divisor: 4, emoji: '📚', who: 'Ο Πέτρος', verb: 'τακτοποίησε', obj: 'βιβλία', containerSingular: 'ράφι', containerPlural: 'ράφια' },
    { dividend: 10, divisor: 2, emoji: '✏️', who: 'Η Σοφία', verb: 'έβαλε', obj: 'μολύβια', containerSingular: 'κουτί', containerPlural: 'κουτιά' },
  ],
  2: [
    { dividend: 12, divisor: 3, emoji: '🍪', who: 'Ο Δημήτρης', verb: 'μοίρασε', obj: 'μπισκότα', containerSingular: 'πιάτο', containerPlural: 'πιάτα' },
    { dividend: 15, divisor: 5, emoji: '✏️', who: 'Η Κατερίνα', verb: 'έβαλε', obj: 'μολύβια', containerSingular: 'κουτί', containerPlural: 'κουτιά' },
    { dividend: 14, divisor: 2, emoji: '🎈', who: 'Ο Αλέξης', verb: 'μοίρασε', obj: 'μπαλόνια', containerSingular: 'τραπέζι', containerPlural: 'τραπέζια' },
    { dividend: 16, divisor: 4, emoji: '🌸', who: 'Η Ζωή', verb: 'τοποθέτησε', obj: 'λουλούδια', containerSingular: 'βάζο', containerPlural: 'βάζα' },
    { dividend: 18, divisor: 2, emoji: '🥕', who: 'Ο Παύλος', verb: 'μάζεψε', obj: 'καρότα', containerSingular: 'σακουλάκι', containerPlural: 'σακουλάκια' },
    { dividend: 20, divisor: 4, emoji: '🖍️', who: 'Η Στέλλα', verb: 'μοίρασε', obj: 'χρώματα', containerSingular: 'κουτί', containerPlural: 'κουτιά' },
    { dividend: 12, divisor: 4, emoji: '🐟', who: 'Ο Θάνος', verb: 'έβαλε', obj: 'ψαράκια', containerSingular: 'ενυδρείο', containerPlural: 'ενυδρεία' },
    { dividend: 18, divisor: 3, emoji: '📚', who: 'Η Μαρία', verb: 'τακτοποίησε', obj: 'βιβλία', containerSingular: 'ράφι', containerPlural: 'ράφια' },
    { dividend: 20, divisor: 5, emoji: '⭐', who: 'Ο Νίκος', verb: 'μοίρασε', obj: 'αυτοκόλλητα', containerSingular: 'τετράδιο', containerPlural: 'τετράδια' },
    { dividend: 16, divisor: 2, emoji: '🍒', who: 'Η Ελένη', verb: 'έβαλε', obj: 'κεράσια', containerSingular: 'μπολ', containerPlural: 'μπολ' },
  ],
  3: [
    { dividend: 21, divisor: 3, emoji: '🍪', who: 'Ο Κώστας', verb: 'μοίρασε', obj: 'μπισκότα', containerSingular: 'πιάτο', containerPlural: 'πιάτα' },
    { dividend: 24, divisor: 4, emoji: '🎈', who: 'Η Άννα', verb: 'έβαλε', obj: 'μπαλόνια', containerSingular: 'τραπέζι', containerPlural: 'τραπέζια' },
    { dividend: 25, divisor: 5, emoji: '⭐', who: 'Ο Γιώργος', verb: 'μοίρασε', obj: 'αυτοκόλλητα', containerSingular: 'τετράδιο', containerPlural: 'τετράδια' },
    { dividend: 27, divisor: 3, emoji: '📚', who: 'Η Σοφία', verb: 'τακτοποίησε', obj: 'βιβλία', containerSingular: 'ράφι', containerPlural: 'ράφια' },
    { dividend: 28, divisor: 4, emoji: '✏️', who: 'Ο Πέτρος', verb: 'έβαλε', obj: 'μολύβια', containerSingular: 'κουτί', containerPlural: 'κουτιά' },
    { dividend: 30, divisor: 5, emoji: '🖍️', who: 'Η Κατερίνα', verb: 'μοίρασε', obj: 'χρώματα', containerSingular: 'κουτί', containerPlural: 'κουτιά' },
    { dividend: 24, divisor: 6, emoji: '🍒', who: 'Ο Δημήτρης', verb: 'έβαλε', obj: 'κεράσια', containerSingular: 'μπολ', containerPlural: 'μπολ' },
    { dividend: 18, divisor: 2, emoji: '🌸', who: 'Η Ζωή', verb: 'τοποθέτησε', obj: 'λουλούδια', containerSingular: 'βάζο', containerPlural: 'βάζα' },
    { dividend: 20, divisor: 4, emoji: '🍎', who: 'Ο Αλέξης', verb: 'μοίρασε', obj: 'μήλα', containerSingular: 'καλάθι', containerPlural: 'καλάθια' },
    { dividend: 30, divisor: 6, emoji: '🐟', who: 'Η Στέλλα', verb: 'έβαλε', obj: 'ψαράκια', containerSingular: 'ενυδρείο', containerPlural: 'ενυδρεία' },
    { dividend: 22, divisor: 2, emoji: '🥕', who: 'Ο Θάνος', verb: 'μάζεψε', obj: 'καρότα', containerSingular: 'σακουλάκι', containerPlural: 'σακουλάκια' },
    { dividend: 26, divisor: 2, emoji: '🍒', who: 'Η Ελένη', verb: 'μοίρασε', obj: 'κεράσια', containerSingular: 'μπολ', containerPlural: 'μπολ' },
  ],
  4: [
    { dividend: 32, divisor: 8, emoji: '🔘', who: 'Ο Νίκος', verb: 'μοίρασε', obj: 'κουμπιά', containerSingular: 'κουτί', containerPlural: 'κουτιά' },
    { dividend: 35, divisor: 5, emoji: '🖍️', who: 'Η Μαρία', verb: 'έβαλε', obj: 'χρώματα', containerSingular: 'κουτί', containerPlural: 'κουτιά' },
    { dividend: 36, divisor: 6, emoji: '📚', who: 'Ο Κώστας', verb: 'τακτοποίησε', obj: 'βιβλία', containerSingular: 'ράφι', containerPlural: 'ράφια' },
    { dividend: 40, divisor: 8, emoji: '⭐', who: 'Η Άννα', verb: 'μοίρασε', obj: 'αυτοκόλλητα', containerSingular: 'τετράδιο', containerPlural: 'τετράδια' },
    { dividend: 42, divisor: 7, emoji: '🍪', who: 'Ο Γιώργος', verb: 'μοίρασε', obj: 'μπισκότα', containerSingular: 'πιάτο', containerPlural: 'πιάτα' },
    { dividend: 45, divisor: 9, emoji: '✏️', who: 'Η Σοφία', verb: 'έβαλε', obj: 'μολύβια', containerSingular: 'κουτί', containerPlural: 'κουτιά' },
    { dividend: 48, divisor: 6, emoji: '🍎', who: 'Ο Πέτρος', verb: 'μοίρασε', obj: 'μήλα', containerSingular: 'καλάθι', containerPlural: 'καλάθια' },
    { dividend: 33, divisor: 3, emoji: '🌸', who: 'Η Κατερίνα', verb: 'τοποθέτησε', obj: 'λουλούδια', containerSingular: 'βάζο', containerPlural: 'βάζα' },
    { dividend: 44, divisor: 4, emoji: '🥕', who: 'Ο Δημήτρης', verb: 'μάζεψε', obj: 'καρότα', containerSingular: 'σακουλάκι', containerPlural: 'σακουλάκια' },
    { dividend: 28, divisor: 7, emoji: '🍒', who: 'Η Ζωή', verb: 'έβαλε', obj: 'κεράσια', containerSingular: 'μπολ', containerPlural: 'μπολ' },
    { dividend: 39, divisor: 3, emoji: '🎈', who: 'Ο Αλέξης', verb: 'μοίρασε', obj: 'μπαλόνια', containerSingular: 'τραπέζι', containerPlural: 'τραπέζια' },
    { dividend: 50, divisor: 5, emoji: '⭐', who: 'Η Στέλλα', verb: 'μοίρασε', obj: 'αυτοκόλλητα', containerSingular: 'τετράδιο', containerPlural: 'τετράδια' },
  ],
};

/** Παράγει ολοκληρωμένο πρόβλημα. Εναλλάσσει μεριστική/μετρητική διαίρεση ανά index.
 *  Και στους δύο τύπους η σωστή απάντηση είναι dividend ÷ divisor. */
function buildStoryText(item, index = 0) {
  const { who, verb, obj, containerSingular, containerPlural, dividend, divisor } = item;
  const partitive = index % 2 === 0;
  if (partitive) {
    return `${who} ${verb} ${dividend} ${obj} σε ${divisor} ${containerPlural}. Πόσα ${obj} έχει το κάθε ${containerSingular};`;
  }
  return `${who} έχει ${dividend} ${obj} και έβαλε από ${divisor} σε κάθε ${containerSingular}. Πόσα ${containerPlural} χρειάστηκαν;`;
}

function pickEmoji(themeKey, levelIndex) {
  const themes = THEMES[themeKey] || THEMES.count;
  return themes[levelIndex % themes.length];
}

function mergeLevelPool(type) {
  const byGrade = LEVEL_POOLS[type];
  if (!byGrade) return [];
  const seen = new Set();
  const merged = [];
  [1, 2, 3, 4].forEach(g => {
    (byGrade[g] || []).forEach(lv => {
      const key = `${lv.dividend}/${lv.divisor}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push({ ...lv });
      }
    });
  });
  return merged;
}

function mergeStoryPool() {
  const seen = new Set();
  const merged = [];
  [1, 2, 3, 4].forEach(g => {
    (STORY_POOLS[g] || []).forEach(story => {
      const key = `${story.dividend}/${story.divisor}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push({ ...story });
      }
    });
  });
  return merged;
}

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 4 επιλογές απάντησης για στάδιο quiz — πάντα περιλαμβάνει το σωστό πηλίκο */
function buildQuizOptions(dividend, divisor) {
  const correct = Math.floor(dividend / divisor);
  const options = new Set([correct]);

  const tryAdd = (value) => {
    if (Number.isInteger(value) && value >= 0 && value <= 99 && value !== correct) {
      options.add(value);
    }
  };

  [correct - 1, correct + 1, correct - 2, correct + 2, correct + 3, divisor, dividend, correct + divisor]
    .forEach(tryAdd);

  let guard = 0;
  while (options.size < 4 && guard < 40) {
    tryAdd(Math.floor(Math.random() * Math.max(correct + 4, 8)));
    guard++;
  }

  return shuffleArray([...options]).slice(0, 4);
}

function migrateCompletedStages(completedStages) {
  if (!completedStages || typeof completedStages !== 'object') return {};

  const firstVal = Object.values(completedStages)[0];
  if (firstVal && typeof firstVal === 'object' && !Array.isArray(firstVal)) {
    const merged = {};
    Object.values(completedStages).forEach(prog => {
      if (typeof prog !== 'object' || prog === null) return;
      Object.entries(prog).forEach(([stageId, value]) => {
        if (value) merged[stageId] = true;
      });
    });
    completedStages = merged;
  }

  const migrated = {};
  Object.entries(completedStages).forEach(([stageId, value]) => {
    if (!value) return;
    const id = parseInt(stageId, 10);
    if (id === 4) migrated[5] = true;
    else if (id === 5) migrated[6] = true;
    else migrated[id] = true;
  });
  return migrated;
}

const TIMES_TABLE_MAX = 11;

function normalizeTimesTables(tables) {
  if (!Array.isArray(tables)) return [];
  return [...new Set(
    tables.map(n => parseInt(n, 10)).filter(n => n >= 1 && n <= TIMES_TABLE_MAX)
  )].sort((a, b) => a - b);
}

function getDefaultTimesTables() {
  return [1, 2, 3, 4, 5];
}

function filterByTimesTables(items, selectedTables) {
  const set = new Set(normalizeTimesTables(selectedTables));
  if (set.size === 0) return [];
  return items.filter(item => set.has(item.divisor));
}

/** Βάρος ανά διαιρέτη: οι μεγαλύτεροι εμφανίζονται πιο συχνά. */
function pickWeightedDivisor(availableDivisors) {
  const divisors = normalizeTimesTables(availableDivisors);
  if (!divisors.length) return null;
  if (divisors.length === 1) return divisors[0];

  const totalWeight = divisors.reduce((sum, d) => sum + d, 0);
  let roll = Math.random() * totalWeight;
  for (const d of divisors) {
    roll -= d;
    if (roll <= 0) return d;
  }
  return divisors[divisors.length - 1];
}

/** Ίδιες ασκήσεις, αλλά πιο συχνά οι μεγαλύτεροι διαιρέτες. */
function orderByDivisorWeight(items, selectedTables) {
  const tables = normalizeTimesTables(selectedTables);
  const filtered = filterByTimesTables(items, tables);
  if (filtered.length <= 1 || tables.length <= 1) return shuffleArray(filtered);

  const byDivisor = new Map();
  filtered.forEach(item => {
    if (!byDivisor.has(item.divisor)) byDivisor.set(item.divisor, []);
    byDivisor.get(item.divisor).push(item);
  });
  byDivisor.forEach((list, divisor) => byDivisor.set(divisor, shuffleArray(list)));

  const result = [];
  while (result.length < filtered.length) {
    const available = tables.filter(d => byDivisor.get(d)?.length);
    if (!available.length) break;
    const divisor = pickWeightedDivisor(available);
    result.push(byDivisor.get(divisor).shift());
  }
  return result;
}

/** Προοδευτική σειρά: από εύκολα προς δύσκολα (μικρός διαιρέτης & μικρό σύνολο πρώτα). */
function orderByDifficulty(items, selectedTables) {
  const tables = normalizeTimesTables(selectedTables);
  const filtered = filterByTimesTables(items, tables);
  return [...filtered].sort((a, b) =>
    (a.divisor - b.divisor) ||
    (a.dividend - b.dividend) ||
    (Math.floor(a.dividend / a.divisor) - Math.floor(b.dividend / b.divisor))
  );
}

/** Επιλέγει σειρά ανάλογα με τη ρύθμιση δυσκολίας. */
function orderLevels(items, selectedTables, progressive = false) {
  return progressive
    ? orderByDifficulty(items, selectedTables)
    : orderByDivisorWeight(items, selectedTables);
}

/** Τυχαία επιλογή με προτίμηση στους μεγαλύτερους διαιρέτες. */
function pickWeightedItems(items, count, selectedTables) {
  const tables = normalizeTimesTables(selectedTables);
  const filtered = filterByTimesTables(items, tables);
  if (!filtered.length || count <= 0) return [];
  if (tables.length <= 1) return shuffleArray(filtered).slice(0, count);

  const result = [];
  for (let i = 0; i < count; i++) {
    const available = tables.filter(d => filtered.some(item => item.divisor === d));
    if (!available.length) break;
    const divisor = pickWeightedDivisor(available);
    const candidates = filtered.filter(item => item.divisor === divisor);
    result.push(candidates[Math.floor(Math.random() * candidates.length)]);
  }
  return result;
}

function formatTimesTablesSummary(tables) {
  const list = normalizeTimesTables(tables);
  if (!list.length) return 'Δεν έχει επιλεγεί διαιρέτης — τα στάδια δεν έχουν ασκήσεις.';
  if (list.length === TIMES_TABLE_MAX) {
    return 'Ενεργές όλες οι διαιρέσεις (÷1–÷11). Προτεραιότητα στους μεγαλύτερους.';
  }
  const base = `Ενεργές: ${list.map(n => `÷${n}`).join(', ')}`;
  return list.length > 1 ? `${base}. Περισσότερες ασκήσεις στους μεγαλύτερους.` : base;
}

function migrateSavedProgress(data) {
  let completedStages = data.completedStages || {};
  let timesTables = data.timesTables;

  const firstVal = Object.values(completedStages)[0];
  if (firstVal && typeof firstVal === 'object' && !Array.isArray(firstVal)) {
    const merged = {};
    Object.values(completedStages).forEach(prog => {
      if (typeof prog === 'object' && prog !== null) {
        Object.entries(prog).forEach(([id, val]) => {
          if (val) merged[id] = true;
        });
      }
    });
    completedStages = merged;
  }

  completedStages = migrateCompletedStages(completedStages);

  if (!timesTables?.length && data.timesTablesByGrade) {
    const union = new Set();
    Object.values(data.timesTablesByGrade).forEach(arr => {
      normalizeTimesTables(arr).forEach(n => union.add(n));
    });
    if (union.size) timesTables = [...union];
  }

  return {
    completedStages,
    timesTables: normalizeTimesTables(timesTables?.length ? timesTables : getDefaultTimesTables()),
  };
}

function buildStages(timesTables, progressive = false) {
  const tables = normalizeTimesTables(timesTables ?? getDefaultTimesTables());

  return STAGE_DEFS.map(def => {
    const stage = { ...def, badge: def.badge };

    if (def.type === 'story') {
      stage.stories = orderLevels(mergeStoryPool(), tables, progressive).map(s => ({ ...s }));
      return stage;
    }

    const pool = mergeLevelPool(def.type);
    stage.levels = orderLevels(pool, tables, progressive).map((lv, i) => ({
      ...lv,
      emoji: pickEmoji(def.themeKey || def.type, i),
    }));
    return stage;
  });
}

function getDuelQuestions(count = 10, timesTables, stageTypes) {
  const tables = normalizeTimesTables(timesTables ?? getDefaultTimesTables());
  const types = stageTypes?.length ? stageTypes : getDefaultDuelStageTypes();
  const typeSet = new Set(types);
  const stages = buildStages(tables);
  const questions = [];

  stages.forEach(stage => {
    if (!typeSet.has(stage.type) || stage.type === 'remainder') return;
    const items = stage.stories || stage.levels || [];
    items.forEach(item => {
      const isStory = stage.type === 'story';
      questions.push({
        type: isStory ? 'story' : (stage.type === 'quiz' ? 'quiz' : 'quick'),
        stageType: stage.type,
        stageTitle: stage.title,
        dividend: item.dividend,
        divisor: item.divisor,
        emoji: item.emoji || pickEmoji(stage.themeKey || 'count', questions.length),
        story: isStory ? { ...item } : null,
        hasRemainder: false,
      });
    });
  });

  if (typeSet.has('remainder')) {
    const remStage = stages.find(s => s.type === 'remainder');
    filterByTimesTables(mergeLevelPool('remainder'), tables).forEach((lv, i) => {
      questions.push({
        type: 'remainder',
        stageType: 'remainder',
        stageTitle: remStage?.title || 'Ατελείς διαιρέσεις',
        dividend: lv.dividend,
        divisor: lv.divisor,
        emoji: pickEmoji('remainder', i),
        hasRemainder: true,
      });
    });
  }

  return pickWeightedItems(questions, count, tables);
}

const DUEL_EXCLUDED_STAGE_TYPES = ['distribute'];

function getDuelCompatibleStages() {
  return STAGE_DEFS.filter(s => !DUEL_EXCLUDED_STAGE_TYPES.includes(s.type));
}

function getDefaultDuelStageTypes() {
  return getDuelCompatibleStages().map(s => s.type);
}

function formatDuelStagesSummary(stageTypes) {
  if (!stageTypes?.length) return 'Διάλεξε τουλάχιστον ένα στάδιο!';
  const names = getDuelCompatibleStages()
    .filter(s => stageTypes.includes(s.type))
    .map(s => s.title);
  return `Επιλεγμένα στάδια: ${names.join(' · ')}`;
}

function updateDuelStageSelection(container, selectedTypes) {
  if (!container) return;
  const set = new Set(selectedTypes);
  container.querySelectorAll('.grade-option').forEach(btn => {
    const on = set.has(btn.dataset.stageType);
    btn.classList.toggle('selected', on);
    btn.setAttribute('aria-pressed', String(on));
  });
}

function readDuelStageSelection(container) {
  if (!container) return [];
  return [...container.querySelectorAll('.grade-option.selected')].map(btn => btn.dataset.stageType);
}

function renderDuelStageButtons(container, selectedTypes, onChange) {
  if (!container) return getDefaultDuelStageTypes();

  const selected = selectedTypes?.length ? selectedTypes : getDefaultDuelStageTypes();
  const selectedSet = new Set(selected);

  container.innerHTML = getDuelCompatibleStages().map(stage => `
    <button type="button"
            class="grade-option ${selectedSet.has(stage.type) ? 'selected' : ''}"
            data-stage-type="${stage.type}"
            aria-pressed="${selectedSet.has(stage.type)}"
            title="${stage.desc}">
      <span class="grade-option-name">${stage.badge}</span>
      <span class="grade-option-desc">${stage.title}</span>
    </button>
  `).join('');

  container.querySelectorAll('.grade-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = new Set(readDuelStageSelection(container));
      const type = btn.dataset.stageType;
      if (current.has(type)) {
        if (current.size <= 1) return;
        current.delete(type);
      } else {
        current.add(type);
      }
      const next = [...current];
      updateDuelStageSelection(container, next);
      if (onChange) onChange(next);
    });
  });

  return selected;
}

function updateTimesTableSelection(container, selectedTables) {
  if (!container) return;
  const set = new Set(normalizeTimesTables(selectedTables));
  container.querySelectorAll('.times-table-option').forEach(btn => {
    const n = parseInt(btn.dataset.table, 10);
    const on = set.has(n);
    btn.classList.toggle('selected', on);
    btn.setAttribute('aria-pressed', String(on));
  });
}

function readTimesTableSelection(container) {
  if (!container) return [];
  return normalizeTimesTables(
    [...container.querySelectorAll('.times-table-option.selected')].map(btn => parseInt(btn.dataset.table, 10))
  );
}

function renderTimesTableButtons(container, selectedTables, onChange) {
  if (!container) return normalizeTimesTables(selectedTables);

  const selected = normalizeTimesTables(selectedTables);
  const selectedSet = new Set(selected);

  container.innerHTML = `
    <div class="times-table-grid" role="presentation">
      ${Array.from({ length: TIMES_TABLE_MAX }, (_, i) => i + 1).map(n => `
        <button type="button" class="times-table-option ${selectedSet.has(n) ? 'selected' : ''}"
                data-table="${n}" aria-pressed="${selectedSet.has(n)}"
                aria-label="Διαίρεση με ${n}"
                title="Διαίρεση με ${n}">
          ÷${n}
        </button>
      `).join('')}
    </div>
    <div class="times-table-actions">
      <button type="button" class="times-table-action" data-action="all">Όλες</button>
    </div>
  `;

  container.querySelectorAll('.times-table-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const n = parseInt(btn.dataset.table, 10);
      const current = new Set(readTimesTableSelection(container));
      if (current.has(n)) {
        if (current.size <= 1) return;
        current.delete(n);
      } else {
        current.add(n);
      }
      const next = normalizeTimesTables([...current]);
      updateTimesTableSelection(container, next);
      if (onChange) onChange(next);
    });
  });

  container.querySelector('[data-action="all"]')?.addEventListener('click', () => {
    const all = Array.from({ length: TIMES_TABLE_MAX }, (_, i) => i + 1);
    updateTimesTableSelection(container, all);
    if (onChange) onChange(all);
  });

  return selected;
}

window.orderByDivisorWeight = orderByDivisorWeight;
window.orderByDifficulty = orderByDifficulty;
window.orderLevels = orderLevels;
window.pickWeightedItems = pickWeightedItems;
window.pickWeightedDivisor = pickWeightedDivisor;
window.buildStages = buildStages;
window.buildStoryText = buildStoryText;
window.buildQuizOptions = buildQuizOptions;
window.migrateCompletedStages = migrateCompletedStages;
window.migrateSavedProgress = migrateSavedProgress;
window.getDuelQuestions = getDuelQuestions;
window.getDuelCompatibleStages = getDuelCompatibleStages;
window.getDefaultDuelStageTypes = getDefaultDuelStageTypes;
window.formatDuelStagesSummary = formatDuelStagesSummary;
window.renderDuelStageButtons = renderDuelStageButtons;
window.readDuelStageSelection = readDuelStageSelection;
window.updateDuelStageSelection = updateDuelStageSelection;
window.TIMES_TABLE_MAX = TIMES_TABLE_MAX;
window.normalizeTimesTables = normalizeTimesTables;
window.getDefaultTimesTables = getDefaultTimesTables;
window.filterByTimesTables = filterByTimesTables;
window.formatTimesTablesSummary = formatTimesTablesSummary;
window.renderTimesTableButtons = renderTimesTableButtons;
window.updateTimesTableSelection = updateTimesTableSelection;
window.readTimesTableSelection = readTimesTableSelection;
