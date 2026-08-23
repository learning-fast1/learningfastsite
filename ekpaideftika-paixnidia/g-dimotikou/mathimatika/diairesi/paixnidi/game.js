/* Μαθαίνω τη Διαίρεση — Κύρια λογική */

const STORAGE_KEY = 'diaireseis-progress';
const PROGRESS_VERSION = 3;

let STAGES = [];
let state = {
  stars: 0,
  completedStages: {},
  timesTables: [1, 2, 3, 4, 5],
  progressiveDifficulty: false,
  currentStage: null,
  currentLevel: 0,
  selectedItem: null,
};

let levelWrongCount = 0;

const screens = {
  home: document.getElementById('screen-home'),
  game: document.getElementById('screen-game'),
  complete: document.getElementById('screen-complete'),
  duelSetup: document.getElementById('screen-duel-setup'),
  duel: document.getElementById('screen-duel'),
  duelEnd: document.getElementById('screen-duel-end'),
};

const els = {
  homeGradeOptions: null,
  timesTableOptions: document.getElementById('times-table-options'),
  timesTableSummary: document.getElementById('times-table-summary'),
  btnSound: document.getElementById('btn-sound'),
  btnDifficulty: document.getElementById('btn-difficulty'),
  btnDuel: document.getElementById('btn-duel'),
  stagesMap: document.getElementById('stages-map'),
  totalStars: document.getElementById('total-stars'),
  progressText: document.getElementById('progress-text'),
  stageBadge: document.getElementById('stage-badge'),
  stageTitle: document.getElementById('stage-title'),
  levelCurrent: document.getElementById('level-current'),
  levelTotal: document.getElementById('level-total'),
  instruction: document.getElementById('instruction'),
  gameArea: document.getElementById('game-area'),
  equationDisplay: document.getElementById('equation-display'),
  answerRow: document.getElementById('answer-row'),
  btnNext: document.getElementById('btn-next'),
  btnBack: document.getElementById('btn-back'),
  feedback: document.getElementById('feedback'),
  hintZone: document.getElementById('hint-zone'),
  celebration: document.getElementById('celebration'),
  completeConfetti: document.getElementById('complete-confetti'),
  completeTitle: document.getElementById('complete-title'),
  completeMessage: document.getElementById('complete-message'),
  starsEarned: document.getElementById('stars-earned'),
  certificateName: document.getElementById('certificate-name'),
  btnContinue: document.getElementById('btn-continue'),
  btnPrint: document.getElementById('btn-print'),
};

function showScreen(name) {
  const map = {
    home: 'home',
    game: 'game',
    complete: 'complete',
    'duel-setup': 'duelSetup',
    duel: 'duel',
    'duel-end': 'duelEnd',
  };
  Object.values(screens).forEach(s => s?.classList.remove('active'));
  const key = map[name] || name;
  screens[key]?.classList.add('active');
}

function getQuotient(dividend, divisor) {
  return Math.floor(dividend / divisor);
}

function getRemainder(dividend, divisor) {
  return dividend % divisor;
}

function refreshStages() {
  STAGES = buildStages(getSelectedTimesTables(), state.progressiveDifficulty);
}

function getSelectedTimesTables() {
  return normalizeTimesTables(state.timesTables?.length ? state.timesTables : getDefaultTimesTables());
}

function setSelectedTimesTables(tables) {
  state.timesTables = normalizeTimesTables(tables);
  refreshStages();
  saveProgress();
}

function getProgress() {
  return state.completedStages;
}

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      state.stars = data.stars || 0;
      state.progressiveDifficulty = !!data.progressiveDifficulty;

      if ((data.progressVersion || 1) < PROGRESS_VERSION && typeof migrateSavedProgress === 'function') {
        const migrated = migrateSavedProgress(data);
        state.completedStages = migrated.completedStages;
        state.timesTables = migrated.timesTables;
        saveProgress();
      } else {
        state.completedStages = migrateCompletedStages(data.completedStages || {});
        state.timesTables = normalizeTimesTables(data.timesTables || getDefaultTimesTables());
      }
    }
  } catch (_) {}
  if (!state.timesTables?.length) {
    state.timesTables = getDefaultTimesTables();
  }
  refreshStages();
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    stars: state.stars,
    completedStages: state.completedStages,
    timesTables: state.timesTables,
    progressiveDifficulty: state.progressiveDifficulty,
    progressVersion: PROGRESS_VERSION,
  }));
}

function isStageCompleted(stageId) {
  return !!getProgress()[stageId];
}

function isStageUnlocked(stageId) {
  return !!STAGES.find(s => s.id === stageId);
}

function updateSoundButton() {
  if (!els.btnSound) return;
  els.btnSound.textContent = Sound.enabled ? '🔊' : '🔇';
  els.btnSound.classList.toggle('muted', !Sound.enabled);
}

function updateDifficultyButton() {
  if (!els.btnDifficulty) return;
  const on = state.progressiveDifficulty;
  els.btnDifficulty.textContent = on ? '📈 Εύκολο → Δύσκολο' : '🎲 Τυχαία σειρά';
  els.btnDifficulty.setAttribute('aria-pressed', String(on));
  els.btnDifficulty.classList.toggle('active', on);
}

function initTimesTablePicker() {
  const container = document.getElementById('times-table-options');
  if (!container) return;
  els.timesTableOptions = container;

  renderTimesTableButtons(container, getSelectedTimesTables(), (tables) => {
    setSelectedTimesTables(tables);
    updateTimesTableSummary();
    renderHome();
    Sound.play('tap');
  });
  updateTimesTableSummary();
}

function updateTimesTableSummary() {
  if (!els.timesTableSummary) return;
  const tables = getSelectedTimesTables();
  els.timesTableSummary.textContent = formatTimesTablesSummary(tables);
  els.timesTableSummary.classList.toggle('warning', tables.length === 0);
}

window.getDiaireseisState = () => state;
window.getSelectedTimesTables = getSelectedTimesTables;

function renderHome() {
  refreshStages();
  updateTimesTableSelection(els.timesTableOptions, getSelectedTimesTables());
  updateTimesTableSummary();
  const prog = getProgress();
  const completedCount = STAGES.filter(s => prog[s.id]).length;
  const totalPlayable = STAGES.length;

  els.totalStars.textContent = `⭐ ${state.stars}`;
  els.progressText.textContent = `${completedCount} / ${totalPlayable} στάδια`;

  els.stagesMap.innerHTML = STAGES.map(stage => {
    const done = prog[stage.id];
    const levelCount = stage.stories?.length || stage.levels?.length || 0;
    const playable = levelCount > 0;
    const needsTables = !playable;
    return `
      <div class="stage-card ${!playable ? 'locked' : ''} ${done ? 'completed' : ''} ${needsTables ? 'no-levels' : ''}"
           data-stage="${stage.id}" ${playable ? '' : 'aria-disabled="true"'}>
        <div class="info">
          <h3>${stage.title}</h3>
          <p>${stage.desc}${levelCount ? ` · ${levelCount} επίπεδα` : ' · διάλεξε διαιρέτη'}</p>
        </div>
        <span class="stars">${done ? '⭐⭐⭐' : (playable ? '▶' : '🔒')}</span>
      </div>
    `;
  }).join('');

  els.stagesMap.querySelectorAll('.stage-card:not(.locked)').forEach(card => {
    card.addEventListener('click', () => {
      Sound.init();
      Sound.play('tap');
      startStage(parseInt(card.dataset.stage, 10));
    });
  });
}

function getCurrentLevelData() {
  const stage = STAGES[state.currentStage - 1];
  if (stage.type === 'story') return stage.stories[state.currentLevel];
  return stage.levels[state.currentLevel];
}

function getLevelCount() {
  const stage = STAGES[state.currentStage - 1];
  return stage.type === 'story' ? stage.stories.length : stage.levels.length;
}

function startStage(stageId) {
  const stage = STAGES[stageId - 1];
  if (!stage) return;
  const levelCount = stage.stories?.length || stage.levels?.length || 0;
  if (levelCount === 0) return;

  const tables = getSelectedTimesTables();
  if (stage.type === 'story' && stage.stories?.length) {
    stage.stories = orderLevels(stage.stories, tables, state.progressiveDifficulty);
  } else if (stage.levels?.length) {
    stage.levels = orderLevels(stage.levels, tables, state.progressiveDifficulty);
  }

  state.currentStage = stageId;
  state.currentLevel = 0;
  showScreen('game');
  loadLevel();
}

function loadLevel() {
  const stage = STAGES[state.currentStage - 1];
  const level = getCurrentLevelData();
  const { dividend, divisor } = level;

  state.selectedItem = null;

  els.stageBadge.textContent = stage.badge;
  els.stageTitle.textContent = stage.title;
  els.levelCurrent.textContent = state.currentLevel + 1;
  els.levelTotal.textContent = getLevelCount();

  els.feedback.textContent = '';
  els.feedback.className = 'feedback';
  els.btnNext.classList.add('hidden');
  levelWrongCount = 0;
  resetHint();

  els.answerRow.classList.remove('remainder-mode', 'hidden', 'quiz-mode');
  els.equationDisplay.classList.remove('hidden');
  resetAnswerInputs();

  renderLevelContent(stage, level);

  if (stage.type === 'quiz') {
    els.equationDisplay.classList.add('hidden');
    setupQuizChoices(dividend, divisor);
  } else {
    updateEquation(stage, dividend, divisor);
  }
}

function resetAnswerInputs() {
  els.answerRow.innerHTML = `
    <label for="answer-input">Απάντηση:</label>
    <input type="number" class="answer-slot-input" id="answer-input" min="0" max="99" autocomplete="off">
    <button class="btn-primary" id="btn-check">Έλεγχος ✓</button>
  `;
  bindAnswerEvents();
}

function bindAnswerEvents() {
  NumKeyboard.attachAll(els.answerRow);
  document.getElementById('answer-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') checkAnswer();
  });
  document.getElementById('btn-check')?.addEventListener('click', checkAnswer);
}

function updateEquation(stage, dividend, divisor, hideAnswer = true) {
  const isRem = stage.type === 'remainder';
  els.equationDisplay.innerHTML = equationHtml(dividend, divisor, {
    remainder: isRem,
    hideAnswer,
    quotient: getQuotient(dividend, divisor),
    rem: getRemainder(dividend, divisor),
  });
}

function renderLevelContent(stage, level) {
  const { dividend, divisor } = level;
  const emoji = level.emoji || '⭐';

  switch (stage.type) {
    case 'distribute':
      els.instruction.textContent =
        `Μοίρασε τα ${dividend} σε ${divisor} ίσες ομάδες. Πάτα ένα αντικείμενο που έβαλες για να το πάρεις πίσω.`;
      renderDistribute(dividend, divisor, emoji);
      break;
    case 'count':
      els.instruction.textContent =
        `Βλέπεις ${divisor} ίσες ομάδες, σύνολο ${dividend}. Πόσα έχει ΚΑΘΕ ομάδα;`;
      renderCount(dividend, divisor, emoji);
      break;
    case 'relation':
      els.instruction.textContent = 'Μέτρα πόσα έχει η κάθε ομάδα και γράψ\' το!';
      renderRelation(dividend, divisor, emoji);
      break;
    case 'quiz':
      els.instruction.textContent = 'Διάλεξε το σωστό αποτέλεσμα:';
      renderQuiz(dividend, divisor);
      break;
    case 'story':
      els.instruction.textContent = 'Διάβασε προσεκτικά και βρες την απάντηση:';
      renderStory(level);
      break;
    case 'remainder':
      els.instruction.textContent =
        `Μοίρασε τα ${dividend} σε ${divisor} ομάδες. Τα υπόλοιπα στο κουτί «Υπόλοιπα»!`;
      renderRemainder(dividend, divisor, emoji);
      setupRemainderInputs();
      break;
  }
}

function renderDistribute(dividend, divisor, emoji) {
  els.gameArea.innerHTML = `
    <div class="objects-pool" id="objects-pool">
      ${Array.from({ length: dividend }, (_, i) =>
        `<div class="draggable-item" data-id="${i}" draggable="true">${emoji}</div>`
      ).join('')}
    </div>
    <div class="groups-container" id="groups-container">
      ${Array.from({ length: divisor }, (_, i) => `
        <div class="group-box" data-group="${i}">
          <div class="group-label">Ομάδα ${i + 1}</div>
          <div class="group-items"></div>
        </div>
      `).join('')}
    </div>
  `;
  setupDragAndDrop(dividend, divisor);
}

/** .items holds its emoji as one plain string (not separate elements),
 * so it wraps to a new row purely from the CSS `max-width` cutting off
 * normal text flow — there's no flex/grid item wrapping happening here
 * despite the stylesheet's `display:flex`. To keep every group's item
 * block within a roughly-square, bounded number of rows no matter the
 * quotient (up to 13 in this game's data), both the wrap width and the
 * emoji size are computed from a target column count, so the whole
 * .big-groups block fits without the parent needing to scroll to see
 * every group. */
/** Shared shrink factor: with more groups (up to 9 in this game's
 * data), the boxes wrap into several rows and push the block past the
 * visible height, on top of tall item blocks for a high quotient. Both
 * the box chrome and the item text scale down together from this one
 * factor as divisor grows, so more boxes share a row and the whole
 * thing stays within roughly the same number of box-rows regardless of
 * how many groups there are. */
function computeGroupScale(divisor) {
  return divisor <= 4 ? 1 : Math.max(0.5, 1 - (divisor - 4) * 0.11);
}

function groupItemsFitStyle(perGroup, divisor) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(perGroup)));
  const rows = Math.ceil(perGroup / cols);
  const scale = computeGroupScale(divisor);
  const fontSize = Math.max(1.1, (2.85 - (rows - 1) * 0.4) * scale);
  const maxWidthPx = Math.round(cols * fontSize * 16 * 1.25);
  return `display:block;font-size:${fontSize.toFixed(2)}rem;max-width:${maxWidthPx}px;`;
}

function groupBoxFitStyle(divisor) {
  const scale = computeGroupScale(divisor);
  return {
    box: `padding:${(0.85 * scale).toFixed(2)}rem ${(1 * scale).toFixed(2)}rem;min-width:${Math.round(110 * scale)}px;`,
    label: `font-size:${(1.15 * scale).toFixed(2)}rem;margin-bottom:${(0.45 * scale).toFixed(2)}rem;`,
    gap: `gap:${(0.6 * scale).toFixed(2)}rem;`,
  };
}

function renderCount(dividend, divisor, emoji) {
  const perGroup = getQuotient(dividend, divisor);
  const itemsStyle = groupItemsFitStyle(perGroup, divisor);
  const box = groupBoxFitStyle(divisor);
  els.gameArea.innerHTML = `
    <div class="count-visual">
      <p class="hint-text">Κοίτα τις ομάδες — είναι ίσες!</p>
      <div class="big-groups" style="${box.gap}">
        ${Array.from({ length: divisor }, (_, g) => `
          <div class="static-group" style="${box.box}">
            <div class="group-label" style="${box.label}">Ομάδα ${g + 1}</div>
            <div class="items" style="${itemsStyle}">${Array(perGroup).fill(emoji).join(' ')}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderRelation(dividend, divisor, emoji) {
  const perGroup = getQuotient(dividend, divisor);
  const itemsStyle = groupItemsFitStyle(perGroup, divisor);
  const box = groupBoxFitStyle(divisor);
  els.gameArea.innerHTML = `
    <div class="relation-simple">
      <div class="big-groups" style="${box.gap}">
        ${Array.from({ length: divisor }, (_, g) => `
          <div class="static-group" style="${box.box}">
            <div class="group-label" style="${box.label}">Ομάδα ${g + 1}</div>
            <div class="items" style="${itemsStyle}">${Array(perGroup).fill(emoji).join(' ')}</div>
          </div>
        `).join('')}
      </div>
      <div class="fact-family">
        <span class="fact-line">${divisor} × <span class="q-mark" id="rel-mult">;</span> = ${dividend} <span class="fact-arrow">⟹</span> ${dividend} ÷ ${divisor} = <span class="q-mark" id="rel-div">;</span></span>
      </div>
    </div>
  `;
}

function renderQuiz(dividend, divisor) {
  els.gameArea.innerHTML = `
    <div class="quiz-scene">
      <div class="quiz-equation">${dividend} ÷ ${divisor} = ${answerBox()}</div>
    </div>
  `;
}

function setupQuizChoices(dividend, divisor) {
  const options = buildQuizOptions(dividend, divisor);
  els.answerRow.classList.add('quiz-mode');
  els.answerRow.innerHTML = `
    <div class="quiz-choices" role="group" aria-label="Επιλογές απάντησης">
      ${options.map(value => `
        <button type="button" class="quiz-choice" data-value="${value}">${value}</button>
      `).join('')}
    </div>
  `;
  els.answerRow.querySelectorAll('.quiz-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      onQuizChoice(parseInt(btn.dataset.value, 10), btn);
    });
  });
}

function onQuizChoice(value, btn) {
  if (btn.disabled) return;
  const stage = STAGES[state.currentStage - 1];
  const level = getCurrentLevelData();
  const { dividend, divisor } = level;
  const correctQ = getQuotient(dividend, divisor);

  if (value === correctQ) {
    btn.classList.add('correct');
    els.answerRow.querySelectorAll('.quiz-choice').forEach(b => { b.disabled = true; });
    levelComplete(stage, dividend, divisor, correctQ);
    return;
  }

  btn.classList.add('wrong');
  btn.disabled = true;
  showFeedback('Όχι — δοκίμασε άλλη επιλογή!', false);
  registerWrong();
}

/** Like the Stage 2 groups, .story-visual's icons are one plain text
 * string, not separate elements — its `flex-wrap: wrap` never actually
 * does anything, wrapping is normal text flow. And because the
 * stylesheet sets overflow-y: auto here, the CSS overflow spec forces
 * overflow-x to compute as auto too, so if that natural text flow
 * doesn't wrap tightly enough the row silently grows a horizontal
 * scrollbar instead of just moving to a new line. Sizing the icons and
 * capping the width from the actual count fixes the wrap point, and
 * overflow-x is pinned to hidden so a horizontal scrollbar can never
 * appear even if this estimate runs a little wide. */
function storyVisualFitStyle(show) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(show)));
  const rows = Math.ceil(show / cols);
  const fontSize = Math.max(1.3, 2.75 - (rows - 1) * 0.35);
  const maxWidthPx = Math.round(cols * fontSize * 16 * 1.3);
  return `display:block;font-size:${fontSize.toFixed(2)}rem;max-width:${maxWidthPx}px;overflow-x:hidden;`;
}

function renderStory(level) {
  const show = Math.min(level.dividend, 18);
  const extra = level.dividend > 18 ? level.dividend - 18 : 0;
  const text = buildStoryText(level, state.currentLevel);
  const visualStyle = storyVisualFitStyle(show);
  els.gameArea.innerHTML = `
    <div class="story-scene">
      <div class="story-emoji">${level.emoji || '⭐'}</div>
      <p class="story-text">${text}</p>
      <div class="story-visual" style="${visualStyle}">
        ${Array(show).fill(level.emoji || '⭐').join(' ')}
        ${extra ? `<span class="more-badge">+${extra}</span>` : ''}
      </div>
    </div>
  `;
}

function renderRemainder(dividend, divisor, emoji) {
  els.gameArea.innerHTML = `
    <div class="remainder-area">
      <div class="objects-pool" id="objects-pool">
        ${Array.from({ length: dividend }, (_, i) =>
          `<div class="draggable-item" data-id="${i}" draggable="true">${emoji}</div>`
        ).join('')}
      </div>
      <div class="groups-container" id="groups-container">
        ${Array.from({ length: divisor }, (_, i) => `
          <div class="group-box" data-group="${i}">
            <div class="group-label">Ομάδα ${i + 1}</div>
            <div class="group-items"></div>
          </div>
        `).join('')}
      </div>
      <div class="leftover-box" id="leftover-box">
        <div class="label">Υπόλοιπα (δεν χωράνε ίσα)</div>
        <div class="leftover-items" id="leftover-items"></div>
      </div>
    </div>
  `;
  setupDragAndDrop(dividend, divisor, true);
}

function setupRemainderInputs() {
  els.answerRow.classList.add('remainder-mode');
  els.answerRow.innerHTML = `
    <div class="answer-part">
      <label for="answer-quotient">Πηλίκο:</label>
      <input type="number" class="answer-slot-input" id="answer-quotient" min="0" max="99">
    </div>
    <div class="answer-part">
      <label for="answer-remainder">Υπόλοιπο:</label>
      <input type="number" class="answer-slot-input" id="answer-remainder" min="0" max="99">
    </div>
    <button class="btn-primary" id="btn-check">Έλεγχος ✓</button>
  `;
  NumKeyboard.attachAll(els.answerRow);
  document.getElementById('btn-check').addEventListener('click', checkAnswer);
}

function setupDragAndDrop(dividend, divisor, allowRemainder = false) {
  const pool = document.getElementById('objects-pool');
  const groups = document.querySelectorAll('.group-box');
  const leftover = document.getElementById('leftover-items');
  let touchItem = null;

  // Στο στάδιο «μοιράζω» αφήνουμε το παιδί να κάνει και λάθος (ελεύθερη μοιρασιά).
  // Στο στάδιο «υπόλοιπο» κρατάμε όριο, ώστε τα έξτρα να πάνε στο κουτί υπολοίπων.
  const enforceCap = allowRemainder;

  function placeInGroup(itemEl, groupEl) {
    const groupItems = groupEl.querySelector('.group-items');
    const count = groupItems.children.length;
    const maxPerGroup = getQuotient(dividend, divisor);
    if (enforceCap && count >= maxPerGroup) {
      shake(groupEl);
      Sound.play('error');
      return false;
    }
    groupItems.appendChild(itemEl);
    itemEl.classList.add('placed');
    itemEl.draggable = false;
    updateGroupStates(dividend, divisor);
    Sound.play('drop');
    return true;
  }

  function returnToPool(itemEl) {
    if (!pool) return;
    pool.appendChild(itemEl);
    itemEl.classList.remove('placed');
    itemEl.draggable = true;
    itemEl.style.outline = '';
    updateGroupStates(dividend, divisor);
    Sound.play('tap');
  }

  function placeInLeftover(itemEl) {
    if (!leftover) return false;
    leftover.appendChild(itemEl);
    itemEl.classList.add('placed');
    itemEl.draggable = false;
    Sound.play('drop');
    return true;
  }

  function onTapPlace(target) {
    if (!touchItem) return;
    if (target.classList.contains('group-box') || target.closest('.group-box')) {
      const box = target.classList.contains('group-box') ? target : target.closest('.group-box');
      if (placeInGroup(touchItem, box)) {
        touchItem = null;
        highlightSelection(groups, touchItem);
      }
    } else if (leftover && (target.id === 'leftover-items' || target.closest('.leftover-box'))) {
      if (placeInLeftover(touchItem)) {
        touchItem = null;
        highlightSelection(groups, touchItem);
      }
    }
  }

  document.querySelectorAll('.draggable-item').forEach(item => {
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', item.dataset.id);
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => item.classList.remove('dragging'));
    item.addEventListener('click', (e) => {
      if (item.classList.contains('placed')) {
        e.stopPropagation();
        returnToPool(item);
        return;
      }
      touchItem = touchItem === item ? null : item;
      Sound.play('tap');
      highlightSelection(groups, touchItem);
    });
  });

  groups.forEach(group => {
    group.addEventListener('dragover', e => { e.preventDefault(); group.classList.add('highlight'); });
    group.addEventListener('dragleave', () => group.classList.remove('highlight'));
    group.addEventListener('drop', e => {
      e.preventDefault();
      group.classList.remove('highlight');
      const id = e.dataTransfer.getData('text/plain');
      const item = document.querySelector(`.draggable-item[data-id="${id}"]`);
      if (item && !item.classList.contains('placed')) placeInGroup(item, group);
    });
    group.addEventListener('click', () => onTapPlace(group));
  });

  if (leftover) leftover.parentElement.addEventListener('click', () => onTapPlace(leftover));
  pool?.addEventListener('click', e => {
    if (e.target.classList.contains('draggable-item')) onTapPlace(e.target);
  });
}

function highlightSelection(groups, touchItem) {
  document.querySelectorAll('.draggable-item').forEach(i => {
    i.style.outline = i === touchItem ? '3px solid var(--mint-dark)' : '';
  });
  groups.forEach(g => g.classList.toggle('highlight', !!touchItem));
}

function updateGroupStates(dividend, divisor) {
  const maxPerGroup = getQuotient(dividend, divisor);
  document.querySelectorAll('.group-box').forEach(box => {
    const count = box.querySelector('.group-items').children.length;
    box.classList.toggle('full', count === maxPerGroup);
  });
}

function shake(el) {
  el.classList.add('shake-anim');
  setTimeout(() => el.classList.remove('shake-anim'), 300);
}

function allItemsPlaced() {
  const pool = document.getElementById('objects-pool');
  if (!pool) return true;
  return pool.children.length === 0;
}

function distributionCorrect(dividend, divisor, allowRemainder) {
  const maxPerGroup = getQuotient(dividend, divisor);
  const groups = document.querySelectorAll('.group-box');
  if (!groups.length) return true;

  const counts = [...groups].map(g => g.querySelector('.group-items').children.length);
  const correctSize = counts.every(c => c === maxPerGroup);

  if (!allowRemainder) {
    return allItemsPlaced() && correctSize;
  }

  const leftover = document.getElementById('leftover-items');
  const leftoverCount = leftover ? leftover.children.length : 0;
  return allItemsPlaced() && correctSize && leftoverCount === getRemainder(dividend, divisor);
}

function checkAnswer() {
  const stage = STAGES[state.currentStage - 1];
  if (stage.type === 'quiz') return;

  const level = getCurrentLevelData();
  const { dividend, divisor } = level;
  const correctQ = getQuotient(dividend, divisor);
  const correctR = getRemainder(dividend, divisor);

  if (stage.type === 'distribute' || stage.type === 'remainder') {
    if (!allItemsPlaced()) {
      showFeedback('Μοίρασε πρώτα όλα τα αντικείμενα!', false);
      return;
    }
    if (!distributionCorrect(dividend, divisor, stage.type === 'remainder')) {
      showFeedback(stage.type === 'remainder'
        ? 'Κάθε ομάδα ίσα — τα υπόλοιπα στο κουτί!'
        : 'Κάθε ομάδα πρέπει να έχει τον ίδιο αριθμό!', false);
      registerWrong();
      return;
    }
  }

  if (stage.type === 'remainder') {
    const uq = parseInt(document.getElementById('answer-quotient')?.value, 10);
    const ur = parseInt(document.getElementById('answer-remainder')?.value, 10);
    if (isNaN(uq) || isNaN(ur)) {
      showFeedback('Γράψε πηλίκο και υπόλοιπο!', false);
      return;
    }
    if (uq === correctQ && ur === correctR) {
      levelComplete(stage, dividend, divisor, correctQ, correctR);
    } else {
      showFeedback('Δοκίμασε ξανά! Πηλίκο = πόσα σε κάθε ομάδα.', false);
      registerWrong();
    }
    return;
  }

  const input = document.getElementById('answer-input');
  if (!input?.value) {
    showFeedback('Γράψε την απάντησή σου!', false);
    return;
  }
  if (parseInt(input.value, 10) === correctQ) {
    levelComplete(stage, dividend, divisor, correctQ);
  } else {
    showFeedback('Όχι ακόμα — σκέψου πόσα έχει κάθε ομάδα!', false);
    registerWrong();
  }
}

function levelComplete(stage, dividend, divisor, quotient, remainder = 0) {
  const msg = remainder > 0
    ? `Σωστά! ${dividend} ÷ ${divisor} = ${quotient} υπόλοιπο ${remainder}`
    : `Σωστά! ${dividend} ÷ ${divisor} = ${quotient}`;
  showFeedback(msg, true);

  if (stage.type === 'quiz') {
    const eq = els.gameArea.querySelector('.quiz-equation');
    if (eq) eq.innerHTML = `${dividend} ÷ ${divisor} = ${quotient}`;
  } else {
    updateEquation(stage, dividend, divisor, false);
  }

  if (stage.type === 'relation') {
    ['rel-mult', 'rel-div'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = quotient; el.classList.add('q-filled'); }
    });
  }

  document.querySelectorAll('input').forEach(i => i.disabled = true);
  document.getElementById('btn-check')?.setAttribute('disabled', 'true');
  els.btnNext.classList.remove('hidden');
  resetHint();
  Sound.play('success');
}

function showFeedback(text, success) {
  els.feedback.textContent = text;
  els.feedback.className = 'feedback ' + (success ? 'success' : 'error');
  Sound.play(success ? 'success' : 'error');
}

function resetHint() {
  if (!els.hintZone) return;
  els.hintZone.innerHTML = '';
  els.hintZone.classList.add('hidden');
  delete els.hintZone.dataset.shown;
}

function getHintText(stage, dividend, divisor) {
  if (stage.type === 'remainder') {
    return `Μοίρασε τα ${dividend} ένα-ένα σε ${divisor} ίσες ομάδες, μέχρι να μην φτάνουν για άλλον γύρο. Μέτρα πόσα πήρε κάθε ομάδα (πηλίκο) και πόσα περίσσεψαν (υπόλοιπο).`;
  }
  return `Μοίρασε τα ${dividend} ένα-ένα σε ${divisor} ίσες ομάδες και μέτρα πόσα έχει κάθε ομάδα. Σκέψου: ποιος αριθμός × ${divisor} κάνει ${dividend};`;
}

function registerWrong() {
  levelWrongCount++;
  if (levelWrongCount >= 2) showHintButton();
}

function showHintButton() {
  if (!els.hintZone || els.hintZone.dataset.shown === '1') return;
  els.hintZone.dataset.shown = '1';
  els.hintZone.classList.remove('hidden');
    els.hintZone.innerHTML = `<button type="button" class="btn-hint" id="btn-hint">Θέλω βοήθεια</button>`;
  document.getElementById('btn-hint')?.addEventListener('click', () => {
    const stage = STAGES[state.currentStage - 1];
    const level = getCurrentLevelData();
    els.hintZone.innerHTML = `<p class="hint-message">${getHintText(stage, level.dividend, level.divisor)}</p>`;
    Sound.play('tap');
  });
}

function nextLevel() {
  Sound.play('next');
  state.currentLevel++;
  if (state.currentLevel >= getLevelCount()) completeStage();
  else loadLevel();
}

function completeStage() {
  const stageId = state.currentStage;
  const prog = getProgress();
  if (!prog[stageId]) {
    prog[stageId] = true;
    state.stars += 3;
    saveProgress();
  }
  const stage = STAGES[stageId - 1];
  const allDone = STAGES.length > 0 && STAGES.every(s => getProgress()[s.id]);

  els.celebration?.classList.toggle('certificate', allDone);
  els.btnPrint?.classList.toggle('hidden', !allDone);
  if (els.certificateName) {
    els.certificateName.classList.toggle('hidden', !allDone);
    els.certificateName.textContent = allDone ? 'Δίπλωμα Διαίρεσης' : '';
  }

  if (allDone) {
    if (els.completeConfetti) els.completeConfetti.textContent = '🏆';
    els.completeTitle.textContent = 'Συγχαρητήρια! Ολοκλήρωσες ΟΛΑ τα στάδια!';
    els.completeMessage.textContent = `Έμαθες τη διαίρεση από τον μοιρασμό μέχρι το υπόλοιπο. Σύνολο: ⭐ ${state.stars} αστέρια!`;
    els.starsEarned.textContent = '⭐⭐⭐⭐⭐';
    Sound.play('win');
  } else {
    if (els.completeConfetti) els.completeConfetti.textContent = '🎉';
    els.completeTitle.textContent = 'Μπράβο, μικρέ μαθητή! 🎉';
    els.completeMessage.textContent = `Ολοκλήρωσες «${stage.title}»!`;
    els.starsEarned.textContent = '⭐⭐⭐';
    Sound.play('fanfare');
  }
  showScreen('complete');
}

/* Events */
els.btnNext?.addEventListener('click', nextLevel);
els.btnBack?.addEventListener('click', () => {
  Sound.play('tap');
  showScreen('home');
  renderHome();
});
els.btnContinue?.addEventListener('click', () => {
  Sound.play('tap');
  showScreen('home');
  renderHome();
});

els.btnSound?.addEventListener('click', () => {
  Sound.setEnabled(!Sound.enabled);
  updateSoundButton();
  if (Sound.enabled) {
    Sound.init();
    Sound.play('tap');
  }
});

els.btnDifficulty?.addEventListener('click', () => {
  state.progressiveDifficulty = !state.progressiveDifficulty;
  saveProgress();
  refreshStages();
  updateDifficultyButton();
  renderHome();
  Sound.play('tap');
});

els.btnPrint?.addEventListener('click', () => window.print());

document.body.addEventListener('click', () => Sound.init(), { once: true });

loadProgress();
initTimesTablePicker();
updateSoundButton();
updateDifficultyButton();
renderHome();
