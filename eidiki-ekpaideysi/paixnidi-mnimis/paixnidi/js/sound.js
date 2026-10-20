/* ============================================================
   SOUND — ήπιοι ήχοι (μόνο θετικοί, ποτέ ήχος αποτυχίας)
   και προαιρετική ανάγνωση μηνυμάτων με τη φωνή του συστήματος
   ============================================================ */
(function (root) {
  "use strict";

  let ac = null;
  let enabled = true;

  function tone(freq, dur, delay, vol) {
    if (!enabled) return;
    try {
      ac = ac || new (root.AudioContext || root.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      const t = ac.currentTime + (delay || 0);
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.08, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ac.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* χωρίς ήχο */ }
  }

  const sounds = {
    flip() { tone(520, 0.08, 0, 0.03); },
    match() { tone(660, 0.14); tone(880, 0.2, 0.09); },
    finish() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, i * 0.12, 0.07)); }
  };

  const synth = root.speechSynthesis;
  function speak(text) {
    try {
      if (!synth || !text) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'el-GR';
      u.rate = 0.9;
      const v = synth.getVoices().find(v => /^el/i.test(v.lang));
      if (v) u.voice = v;
      synth.speak(u);
    } catch (e) { /* μη διαθέσιμο */ }
  }

  root.MG_SOUND = {
    play(name) { if (sounds[name]) sounds[name](); },
    setEnabled(v) { enabled = !!v; },
    speak,
    canSpeak: !!synth
  };
})(globalThis);
