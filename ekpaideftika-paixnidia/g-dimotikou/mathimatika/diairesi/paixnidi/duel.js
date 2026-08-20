/* Λειτουργία 2 παικτών — Μονομαχία */

const Duel = {
  roundsTotal: 10,
  currentRound: 0,
  currentPlayer: 0,
  scores: [0, 0],
  names: ['Παίκτης 1', 'Παίκτης 2'],
  questions: [],
  selectedStageTypes: [],

  els: {},

  init() {
    this.els = {
      screenSetup: document.getElementById('screen-duel-setup'),
      screenGame: document.getElementById('screen-duel'),
      name1: document.getElementById('duel-name-1'),
      name2: document.getElementById('duel-name-2'),
      stageOptions: document.getElementById('duel-stage-options'),
      stageSummary: document.getElementById('duel-stage-summary'),
      divisorsNote: document.getElementById('duel-divisors-note'),
      roundsSelect: document.getElementById('duel-rounds'),
      btnStart: document.getElementById('duel-start'),
      btnBackSetup: document.getElementById('duel-back-setup'),
      btnBackGame: document.getElementById('duel-back-game'),
      playerBadge: document.getElementById('duel-player-badge'),
      roundInfo: document.getElementById('duel-round-info'),
      score1: document.getElementById('duel-score-1'),
      score2: document.getElementById('duel-score-2'),
      label1: document.getElementById('duel-label-1'),
      label2: document.getElementById('duel-label-2'),
      area: document.getElementById('duel-area'),
      equation: document.getElementById('duel-equation'),
      answerRow: document.getElementById('duel-answer-row'),
      feedback: document.getElementById('duel-feedback'),
      btnCheck: document.getElementById('duel-check'),
      screenEnd: document.getElementById('screen-duel-end'),
      endTitle: document.getElementById('duel-end-title'),
      endMessage: document.getElementById('duel-end-message'),
      btnRematch: document.getElementById('duel-rematch'),
      btnHome: document.getElementById('duel-home'),
    };

    this.els.btnStart?.addEventListener('click', () => this.start());
    this.els.btnBackSetup?.addEventListener('click', () => showScreen('home'));
    this.els.btnBackGame?.addEventListener('click', () => {
      if (confirm('Θέλεις να βγεις από τη μονομαχία;')) showScreen('home');
    });
    this.els.btnCheck?.addEventListener('click', () => this.check());
    this.els.btnRematch?.addEventListener('click', () => this.start());
    this.els.btnHome?.addEventListener('click', () => showScreen('home'));

    document.getElementById('btn-duel')?.addEventListener('click', () => {
      Sound.init();
      this.openSetup();
    });
  },

  openSetup() {
    Sound.play('tap');
    if (this.els.name1) this.els.name1.value = 'Παίκτης 1';
    if (this.els.name2) this.els.name2.value = 'Παίκτης 2';
    this.updateDivisorsNote();
    this.initStagePicker();
    showScreen('duel-setup');
  },

  updateDivisorsNote() {
    if (!this.els.divisorsNote) return;
    const tables = window.getSelectedTimesTables?.() || getDefaultTimesTables();
    const list = normalizeTimesTables(tables);
    if (!list.length) {
      this.els.divisorsNote.textContent = 'Διαιρέτες: επίλεξε τουλάχιστον έναν στην αρχική οθόνη.';
      return;
    }
    const divisors = list.length === TIMES_TABLE_MAX
      ? '÷1–÷11'
      : list.map(n => `÷${n}`).join(', ');
    const extra = list.length > 1 ? ' — πιο συχνά οι μεγαλύτεροι' : '';
    this.els.divisorsNote.textContent = `Διαιρέτες από την αρχική: ${divisors}${extra}`;
  },

  initStagePicker() {
    if (!this.els.stageOptions) return;
    const initial = this.selectedStageTypes.length
      ? this.selectedStageTypes
      : getDefaultDuelStageTypes();
    this.selectedStageTypes = renderDuelStageButtons(this.els.stageOptions, initial, (types) => {
      this.selectedStageTypes = types;
      this.updateStageSummary();
      Sound.play('tap');
    });
    this.updateStageSummary();
  },

  updateStageSummary() {
    if (!this.els.stageSummary) return;
    const summary = formatDuelStagesSummary(this.selectedStageTypes);
    this.els.stageSummary.textContent = summary;
    this.els.stageSummary.classList.toggle('warning', this.selectedStageTypes.length === 0);
  },

  start() {
    Sound.init();
    Sound.play('tap');
    this.names = [
      this.els.name1?.value.trim() || 'Παίκτης 1',
      this.els.name2?.value.trim() || 'Παίκτης 2',
    ];
    this.roundsTotal = parseInt(this.els.roundsSelect?.value || '10', 10);
    this.selectedStageTypes = readDuelStageSelection(this.els.stageOptions);
    this.updateStageSummary();

    if (!this.selectedStageTypes.length) {
      alert('Διάλεξε τουλάχιστον ένα στάδιο για τη μονομαχία!');
      return;
    }

    this.currentRound = 0;
    this.currentPlayer = 0;
    this.scores = [0, 0];
    this.questions = getDuelQuestions(
      this.roundsTotal,
      window.getSelectedTimesTables?.() || getDefaultTimesTables(),
      this.selectedStageTypes
    );

    if (!this.questions.length) {
      alert('Δεν υπάρχουν ασκήσεις! Έλεγξε τα επιλεγμένα στάδια και τους διαιρέτες (÷2, ÷3…) στην αρχική οθόνη.');
      return;
    }

    this.els.label1.textContent = this.names[0];
    this.els.label2.textContent = this.names[1];
    this.updateScoreboard();
    showScreen('duel');
    this.loadRound();
  },

  updateScoreboard() {
    this.els.score1.textContent = this.scores[0];
    this.els.score2.textContent = this.scores[1];
    this.els.label1.textContent = this.names[0];
    this.els.label2.textContent = this.names[1];
    document.querySelectorAll('.duel-player-card').forEach((el, i) => {
      el.classList.toggle('active', i === this.currentPlayer);
    });
  },

  loadRound() {
    const q = this.questions[this.currentRound];
    if (!q) {
      this.endGame();
      return;
    }

    const pName = this.names[this.currentPlayer];
    const stageLabel = q.stageTitle || 'Άσκηση';
    this.els.playerBadge.textContent = `🎯 Σειρά: ${pName}`;
    this.els.roundInfo.textContent = `Γύρος ${this.currentRound + 1} / ${this.roundsTotal} · ${stageLabel}`;
    this.els.feedback.textContent = '';
    this.els.feedback.className = 'feedback';

    Sound.play('turn');

    const correctQ = Math.floor(q.dividend / q.divisor);
    const correctR = q.dividend % q.divisor;

    if (q.hasRemainder) {
      this.els.equation.innerHTML = equationHtml(q.dividend, q.divisor, { remainder: true, hideAnswer: true });
      this.els.answerRow.innerHTML = `
        <div class="answer-part"><label>Πηλίκο</label><input type="number" class="answer-slot-input" id="duel-q" min="0" max="99"></div>
        <div class="answer-part"><label>Υπόλ.</label><input type="number" class="answer-slot-input" id="duel-r" min="0" max="99"></div>
        <button class="btn-primary" id="duel-check">Απάντηση!</button>
      `;
      NumKeyboard.attachAll(this.els.answerRow);
      document.getElementById('duel-check').addEventListener('click', () => this.check());
      q._answer = { q: correctQ, r: correctR };
    } else {
      this.els.equation.innerHTML = equationHtml(q.dividend, q.divisor, { hideAnswer: true });
      this.els.answerRow.innerHTML = `
        <input type="number" class="answer-slot-input" id="duel-answer" min="0" max="99" autofocus>
        <button class="btn-primary" id="duel-check">Απάντηση!</button>
      `;
      NumKeyboard.attachAll(this.els.answerRow);
      document.getElementById('duel-check').addEventListener('click', () => this.check());
      document.getElementById('duel-answer')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') this.check();
      });
      q._answer = { q: correctQ, r: 0 };
    }

    const emoji = q.emoji || '⭐';
    if (q.type === 'story' && q.story) {
      const storyText = buildStoryText(q.story, this.currentRound);
      this.els.area.innerHTML = `
        <div class="story-scene duel-story">
          <div class="story-emoji">${emoji}</div>
          <p class="story-text">${storyText}</p>
          <div class="story-visual">${Array(Math.min(q.dividend, 24)).fill(emoji).join('')}${q.dividend > 24 ? '<span class="more-badge">+' + (q.dividend - 24) + '</span>' : ''}</div>
        </div>
      `;
    } else {
      const per = correctQ;
      this.els.area.innerHTML = `
        <div class="duel-visual count-visual">
          <p>Γρήγορη ερώτηση — ${q.divisor} ίσες ομάδες, σύνολο ${q.dividend}</p>
          <div class="big-groups">
            ${Array.from({ length: q.divisor }, (_, g) => `
              <div class="static-group">
                <div class="group-label">Ομάδα ${g + 1}</div>
                <div class="items">${boxesRow(Math.min(per, 8) || 1)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  },

  check() {
    const q = this.questions[this.currentRound];
    let ok = false;

    if (q.hasRemainder) {
      const uq = parseInt(document.getElementById('duel-q')?.value, 10);
      const ur = parseInt(document.getElementById('duel-r')?.value, 10);
      if (isNaN(uq) || isNaN(ur)) {
        this.els.feedback.textContent = 'Γράψε και τα δύο!';
        this.els.feedback.className = 'feedback error';
        Sound.play('error');
        return;
      }
      ok = uq === q._answer.q && ur === q._answer.r;
    } else {
      const ua = parseInt(document.getElementById('duel-answer')?.value, 10);
      if (isNaN(ua)) {
        this.els.feedback.textContent = 'Γράψε απάντηση!';
        this.els.feedback.className = 'feedback error';
        Sound.play('error');
        return;
      }
      ok = ua === q._answer.q;
    }

    if (ok) {
      this.scores[this.currentPlayer]++;
      this.els.feedback.textContent = `Σωστά, ${this.names[this.currentPlayer]}! +1 πόντος`;
      this.els.feedback.className = 'feedback success';
      Sound.play('duelHit');
    } else {
      this.els.feedback.textContent = 'Όχι αυτή τη φορά — η επόμενη σειρά σε άλλον!';
      this.els.feedback.className = 'feedback error';
      Sound.play('error');
    }

    this.updateScoreboard();

    setTimeout(() => {
      this.currentPlayer = (this.currentPlayer + 1) % 2;
      this.currentRound++;
      if (this.currentRound >= this.roundsTotal) {
        this.endGame();
      } else {
        this.loadRound();
      }
    }, 1400);
  },

  endGame() {
    const [s0, s1] = this.scores;
    let title, msg;
    if (s0 > s1) {
      title = `Νικητής: ${this.names[0]}! 🏆`;
      msg = `${s0} - ${s1} πόντοι. Μπράβο!`;
      Sound.play('fanfare');
    } else if (s1 > s0) {
      title = `Νικητής: ${this.names[1]}! 🏆`;
      msg = `${s1} - ${s0} πόντοι. Μπράβο!`;
      Sound.play('fanfare');
    } else {
      title = 'Ισοπαλία! 🤝';
      msg = `Και οι δύο έχετε ${s0} πόντοι. Παίξτε ξανά!`;
      Sound.play('win');
    }
    this.els.endTitle.textContent = title;
    this.els.endMessage.textContent = msg;
    showScreen('duel-end');
  },
};

Duel.init();
