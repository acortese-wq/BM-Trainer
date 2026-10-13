/* BM-Trainer – Sprachausgabe für das Hörverständnis (Web Speech API) */
(function (root) {
  'use strict';
  const BMP = root.BMP;
  const synth = root.speechSynthesis;
  let voices = [];
  let runId = 0;

  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices().filter(v => /^en[-_]/i.test(v.lang) || v.lang === 'en');
  }
  if (synth) {
    loadVoices();
    if ('onvoiceschanged' in synth) synth.onvoiceschanged = loadVoices;
  }

  /* Stimmen wählen: britisch bevorzugt, pro Rolle nach Geschlecht (soweit am Namen erkennbar) */
  const FEMALE = /female|woman|samantha|serena|kate|karen|moira|tessa|fiona|zira|susan|hazel|libby|martha|sonia|amy|emma|victoria|allison|ava|joanna|salli|kimberly|catherine|stephanie/i;
  const MALE = /\bmale|daniel|arthur|oliver|george|alex\b|fred|tom\b|james|ryan|guy|rishi|aaron|brian|matthew|joey|justin|gordon|lee\b|thomas/i;
  function pickVoices(hints) {
    if (!voices.length) loadVoices();
    const score = v => (/en[-_]GB/i.test(v.lang) ? 4 : /en[-_](US|AU|IE|CA)/i.test(v.lang) ? 2 : 1) + (v.localService ? 1 : 0);
    const sorted = voices.slice().sort((a, b) => score(b) - score(a));
    const byGender = g => sorted.find(v => (g === 'f' ? FEMALE : MALE).test(v.name) && !(g === 'f' ? MALE : FEMALE).test(v.name));
    const pick = (role, avoid) => {
      const g = hints && hints[role];
      return (g && byGender(g)) || sorted.find(v => !avoid || v.name !== avoid.name) || sorted[0] || null;
    };
    const A = pick('A'), B = pick('B', A), N = (hints && hints.N && byGender(hints.N)) || A;
    return { A, B: B || A, N };
  }

  const S = {
    supported: !!(synth && root.SpeechSynthesisUtterance),
    get speaking() { return !!(synth && (synth.speaking || synth.pending)); },
    current: null,
    handlers: {},
    stop() {
      runId++;
      S.current = null;
      if (synth) synth.cancel();
    },
    /* Spielt alle Zeilen nacheinander ab. onLine(index), onEnd(completed) */
    play(audio, opts) {
      opts = opts || {};
      if (!S.supported) { if (opts.onEnd) opts.onEnd(false); return; }
      S.stop();
      const my = ++runId;
      S.current = audio.id;
      S.handlers = opts; // kann von einer neu gezeichneten Seite übernommen werden
      const v = pickVoices(audio.voices);
      const rate = opts.rate || 0.92;
      let i = 0;
      const next = () => {
        if (my !== runId) return;
        if (i >= audio.lines.length) { S.current = null; if (S.handlers.onEnd) S.handlers.onEnd(true); return; }
        const [who, text] = audio.lines[i];
        const u = new root.SpeechSynthesisUtterance(text);
        const voice = v[who] || v.A;
        if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-GB';
        u.rate = rate;
        // Gleiche Stimme für B? Dann wenigstens Tonhöhe ändern
        u.pitch = who === 'B' && v.B === v.A ? 1.35 : who === 'N' ? 0.95 : 1;
        if (S.handlers.onLine) S.handlers.onLine(i);
        const idx = i;
        u.onend = () => {
          if (my !== runId) return;
          i = idx + 1;
          const nextWho = audio.lines[i] && audio.lines[i][0];
          setTimeout(next, nextWho === who ? 300 : 600); // Sprecherwechsel: etwas längere Pause
        };
        u.onerror = () => { if (my !== runId) return; i = idx + 1; setTimeout(next, 100); };
        synth.speak(u);
      };
      // Chrome-Eigenheit: nach cancel() kurz warten
      setTimeout(next, 150);
    }
  };
  BMP.speech = S;
})(typeof window !== 'undefined' ? window : globalThis);
