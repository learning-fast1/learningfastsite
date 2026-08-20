/* Ήχοι με Web Audio API — χωρίς εξωτερικά αρχεία */

const Sound = {
  enabled: true,
  ctx: null,

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) {
      this.enabled = false;
    }
  },

  resume() {
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  },

  setEnabled(on) {
    this.enabled = on;
    try {
      localStorage.setItem('diaireseis-sound', on ? '1' : '0');
    } catch (_) {}
  },

  loadPreference() {
    try {
      const v = localStorage.getItem('diaireseis-sound');
      if (v !== null) this.enabled = v === '1';
    } catch (_) {}
  },

  play(type) {
    if (!this.enabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    const presets = {
      tap:      { f: 520,  type: 'sine',     dur: 0.06, vol: 0.12, slide: 80 },
      drop:     { f: 380,  type: 'triangle', dur: 0.08, vol: 0.15, slide: -60 },
      success:  { f: 523,  type: 'sine',     dur: 0.12, vol: 0.2,  chord: [659, 784] },
      error:    { f: 200,  type: 'square',   dur: 0.15, vol: 0.08, slide: -40 },
      next:     { f: 440,  type: 'sine',     dur: 0.1,  vol: 0.14, slide: 100 },
      win:      { f: 587,  type: 'sine',     dur: 0.2,  vol: 0.22, melody: [587, 659, 784, 988] },
      fanfare:  { f: 523,  type: 'sine',     dur: 0.25, vol: 0.2,  melody: [523, 659, 784, 1047] },
      turn:     { f: 330,  type: 'triangle', dur: 0.1,  vol: 0.12, slide: 50 },
      duelHit:  { f: 880,  type: 'sine',     dur: 0.08, vol: 0.18 },
    };

    const p = presets[type] || presets.tap;

    if (p.melody) {
      p.melody.forEach((freq, i) => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = p.type;
        o.frequency.value = freq;
        o.connect(g);
        g.connect(this.ctx.destination);
        const start = t + i * 0.12;
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(p.vol, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, start + p.dur);
        o.start(start);
        o.stop(start + p.dur + 0.05);
      });
      return;
    }

    osc.type = p.type;
    osc.frequency.setValueAtTime(p.f, t);
    if (p.slide) osc.frequency.linearRampToValueAtTime(p.f + p.slide, t + p.dur);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(p.vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + p.dur);

    osc.start(t);
    osc.stop(t + p.dur + 0.05);

    if (p.chord) {
      p.chord.forEach((freq, i) => {
        const o2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        o2.type = 'sine';
        o2.frequency.value = freq;
        o2.connect(g2);
        g2.connect(this.ctx.destination);
        const st = t + 0.05 + i * 0.06;
        g2.gain.setValueAtTime(0, st);
        g2.gain.linearRampToValueAtTime(0.1, st + 0.02);
        g2.gain.exponentialRampToValueAtTime(0.001, st + 0.2);
        o2.start(st);
        o2.stop(st + 0.25);
      });
    }
  },
};

Sound.loadPreference();
