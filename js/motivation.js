/* BM-Trainer – Motivation: Lernkonto, Karrierestufen, Abzeichen, Tagesziel, Effekte */
(function (root) {
  'use strict';
  const BMP = root.BMP;
  const store = BMP.store;

  /* Lernfranken pro Aufgabe sinken mit der Karrierestufe:
     richtig 10 (Schnupperlernende) … 2 (Direktorin); Versuch im Verhältnis 5 : 1 (2 … 0) */
  const perRight = points => Math.max(2, 10 - level(points || 0).index);
  const perTry = points => Math.round(perRight(points) / 5);

  /* ---------- Karrierestufen (Lernfranken) ---------- */
  const LEVELS = [
    { min: 0, name: 'Schnupperlernende', icon: '🌱' },
    { min: 300, name: 'Lernende 1. Lehrjahr', icon: '📘' },
    { min: 900, name: 'Lernende 2. Lehrjahr', icon: '📗' },
    { min: 1800, name: 'Lernende 3. Lehrjahr', icon: '📙' },
    { min: 3000, name: 'BM-Kandidatin', icon: '🎯' },
    { min: 4500, name: 'Kundenberaterin', icon: '💼' },
    { min: 6500, name: 'Teamleiterin', icon: '⭐' },
    { min: 9000, name: 'Geschäftsstellenleiterin', icon: '🏦' },
    { min: 12500, name: 'Direktorin', icon: '👑' }
  ];
  function level(points) {
    let i = 0;
    while (i + 1 < LEVELS.length && points >= LEVELS[i + 1].min) i++;
    const cur = LEVELS[i], next = LEVELS[i + 1];
    return { index: i, ...cur, next, progress: next ? (points - cur.min) / (next.min - cur.min) : 1 };
  }

  /* ---------- Abzeichen ---------- */
  const st = () => store.state;
  const daysCount = () => Object.keys(st().daily).length;
  const examsBy = (subj, min) => st().exams.some(e => (!subj || e.subject === subj) && e.grade >= min);
  const BADGES = [
    { id: 'start', icon: '🚀', name: 'Los geht’s', desc: 'Die erste Aufgabe gelöst', test: () => st().total >= 1 },
    { id: 'goal1', icon: '🎯', name: 'Tagesziel', desc: 'Zum ersten Mal das Tagesziel erreicht', test: () => Object.values(st().daily).some(d => d.goalDone) },
    { id: 'streak3', icon: '🔥', name: 'Dranbleiberin', desc: '3 Tage in Folge geübt', test: () => store.streak() >= 3 },
    { id: 'streak7', icon: '🔥', name: 'Wochenserie', desc: '7 Tage in Folge geübt', test: () => store.streak() >= 7 },
    { id: 'streak30', icon: '🏆', name: 'Monatsserie', desc: '30 Tage in Folge geübt', test: () => store.streak() >= 30 },
    { id: 'n100', icon: '💯', name: '100 Aufgaben', desc: '100 Aufgaben bearbeitet', test: () => st().total >= 100 },
    { id: 'n500', icon: '📚', name: '500 Aufgaben', desc: '500 Aufgaben bearbeitet', test: () => st().total >= 500 },
    { id: 'n1000', icon: '🧠', name: '1000 Aufgaben', desc: '1000 Aufgaben bearbeitet', test: () => st().total >= 1000 },
    { id: 'perfect', icon: '🌟', name: 'Perfekte Runde', desc: 'Eine Übungsrunde ohne Fehler', test: () => !!st().perfectRounds },
    { id: 'perfect5', icon: '✨', name: 'Fehlerlos ×5', desc: '5 perfekte Übungsrunden', test: () => (st().perfectRounds || 0) >= 5 },
    { id: 'fehler10', icon: '📕', name: 'Aus Fehlern gelernt', desc: '10 Aufgaben aus dem Fehlerheft gemeistert', test: () => (st().fehlerCleared || 0) >= 10 },
    { id: 'allsubj', icon: '🎨', name: 'Allrounderin', desc: 'Mathe, Deutsch und Englisch am selben Tag geübt', test: () => Object.values(st().daily).some(d => ['mathe', 'deutsch', 'englisch'].every(s => d.subjects.includes(s))) },
    { id: 'exam1', icon: '📝', name: 'Prüfungsluft', desc: 'Die erste Prüfungssimulation abgeschlossen', test: () => st().exams.length >= 1 },
    { id: 'exam4', icon: '✅', name: 'Genügend', desc: 'Eine Prüfungssimulation mit Note 4 oder besser', test: () => examsBy(null, 4) },
    { id: 'exam5', icon: '🥇', name: 'Sehr gut', desc: 'Eine Prüfungssimulation mit Note 5 oder besser', test: () => examsBy(null, 5) },
    { id: 'math5', icon: '∑', name: 'Mathe-Profi', desc: 'Mathe-Simulation mit Note 5 oder besser (zählt doppelt!)', test: () => examsBy('mathe', 5) },
    { id: 'pass', icon: '🎓', name: 'Bereit für die BM', desc: 'Hochrechnung aus Mathe, Deutsch und Englisch: bestanden', test: () => { const p = projection(); return p.complete && p.passed; } },
    { id: 'early', icon: '🌅', name: 'Frühaufsteherin', desc: 'Vor 7 Uhr morgens geübt', test: () => !!st().earlyBird },
    { id: 'original', icon: '📄', name: 'Originalprüfung', desc: 'Eine echte alte Aufnahmeprüfung gelöst und eingetragen', test: () => Object.values(st().originals).some(o => o.grade) },
    { id: 'days20', icon: '📅', name: '20 Lerntage', desc: 'An 20 verschiedenen Tagen geübt', test: () => daysCount() >= 20 }
  ];

  /* ---------- Prüfungs-Hochrechnung (KV Chur, BM1 Typ Wirtschaft) ---------- */
  const WEIGHTS = { mathe: 2, deutsch: 1, englisch: 1 };
  function projection() {
    const latest = {};
    for (const e of st().exams) if (WEIGHTS[e.subject]) latest[e.subject] = e.grade;
    const subjects = Object.keys(WEIGHTS);
    const complete = subjects.every(s => latest[s] != null);
    let sum = 0, w = 0;
    for (const s of subjects) if (latest[s] != null) { sum += latest[s] * WEIGHTS[s]; w += WEIGHTS[s]; }
    const avg = w ? sum / w : null;
    const below = subjects.filter(s => latest[s] != null && latest[s] < 4).length;
    return { latest, complete, avg, below, passed: complete && avg >= 4 && below <= 1 };
  }

  /* ---------- Toasts & Konfetti ---------- */
  let toastBox = null;
  function toast(html, kind) {
    if (!root.document) return;
    if (!toastBox) {
      toastBox = document.createElement('div');
      toastBox.className = 'toasts';
      toastBox.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastBox);
    }
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.innerHTML = html;
    toastBox.appendChild(t);
    // höchstens 3 Meldungen gleichzeitig
    while (toastBox.children.length > 3) toastBox.firstChild.remove();
    setTimeout(() => t.classList.add('out'), 3800);
    setTimeout(() => t.remove(), 4400);
  }

  function confetti() {
    if (!root.document || (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    const c = document.createElement('canvas');
    c.className = 'confetti';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const W = c.width = innerWidth, H = c.height = innerHeight;
    const cols = ['#e30613', '#1f1f1f', '#ffffff', '#f4b400', '#00677f'];
    const ps = Array.from({ length: 140 }, () => ({
      x: W / 2 + (Math.random() - .5) * W * .3, y: H * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4,
      s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[Math.floor(Math.random() * cols.length)]
    }));
    let f = 0;
    (function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= .99;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.strokeStyle = 'rgba(0,0,0,.15)';
        ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .66); ctx.strokeRect(-p.s / 2, -p.s / 3, p.s, p.s * .66);
        ctx.restore();
      }
      if (++f < 150) requestAnimationFrame(draw); else c.remove();
    })();
  }

  /* ---------- Punkte vergeben ---------- */
  function addPoints(n, reason) {
    const before = level(st().points || 0);
    st().points = (st().points || 0) + n;
    const after = level(st().points);
    store.save();
    if (reason) toast(`<b>+${n} Lernfranken</b> · ${reason}`, 'coin');
    if (after.index > before.index) {
      toast(`${after.icon} <b>Beförderung!</b><br>Du bist jetzt <b>${after.name}</b>.`, 'big');
      confetti();
    }
  }

  function checkBadges() {
    const got = st().badges;
    for (const b of BADGES) {
      if (!got[b.id] && b.test()) {
        got[b.id] = Date.now();
        store.save();
        toast(`<span class="ticon">${b.icon}</span> <b>Neues Abzeichen:</b> ${b.name}<br><small>${b.desc}</small>`, 'big');
      }
    }
  }

  const M = {
    LEVELS, BADGES, level, projection, toast, confetti, perRight, perTry,
    onAnswer(item, ok) {
      // Punkte ohne Toast (sonst zu viel Rummel) – sichtbar im Feedback
      const earned = ok ? perRight(st().points) : perTry(st().points);
      st().points = (st().points || 0) + earned;
      const lvBefore = level(st().points - earned);
      if (new Date().getHours() < 7) st().earlyBird = true;
      const day = store.todayStats();
      const goal = M.goal();
      if (goal && !day.goalDone && day.n >= goal) {
        day.goalDone = true;
        const streak = store.streak();
        const bonus = 50 + 10 * Math.min(streak, 10);
        store.save();
        addPoints(bonus, `Tagesziel erreicht${streak > 1 ? ` – Treuebonus für ${streak} Tage in Folge` : ''} 🎯`);
        confetti();
      } else {
        store.save();
        const lv = level(st().points);
        if (lv.index > lvBefore.index) { toast(`${lv.icon} <b>Beförderung!</b><br>Du bist jetzt <b>${lv.name}</b>.`, 'big'); confetti(); }
      }
      checkBadges();
      return earned;
    },
    onRound(correct, total) {
      if (total >= 5 && correct === total) {
        st().perfectRounds = (st().perfectRounds || 0) + 1;
        store.save();
        addPoints(50, 'Perfekte Runde 🌟');
        confetti();
      }
      checkBadges();
    },
    onExam(grade) {
      addPoints(Math.round(grade * 20), `Prüfungssimulation (Note ${grade.toFixed(1)})`);
      if (grade >= 5) confetti();
      checkBadges();
    },
    checkBadges,
    addPoints
  };

  /* ---------- Sprüche ---------- */
  M.QUOTES = [
    'Jeden Tag ein bisschen – das summiert sich wie Zinseszins.',
    'Fehler sind keine Niederlagen, sondern Lernchancen. Darum gibt es das Fehlerheft!',
    'Mathe zählt doppelt – jede Mathe-Aufgabe ist eine gute Investition.',
    'Du musst nicht perfekt sein. Eine 4 im Schnitt reicht für die Aufnahme.',
    'Kleine Schritte, grosse Wirkung: 20 Aufgaben am Tag sind in 15 Minuten gemacht.',
    'Wer übt, wird ruhiger an der Prüfung. Simuliere sie ruhig mehrmals!',
    'Lies die Aufgabe zweimal – viele Fehler passieren beim Lesen, nicht beim Rechnen.',
    'Pausen gehören zum Lernen. Nach 25 Minuten kurz aufstehen und Wasser trinken.',
    'Die BM öffnet dir die Tür zur Fachhochschule. Es lohnt sich!',
    'Heute schon geübt? Dein Lernkonto freut sich über jede Einzahlung.',
    'Vergleiche dich mit dir von gestern – nicht mit anderen.',
    'Unsicher bei einem Thema? Merkblatt lesen, dann 10 Aufgaben üben.'
  ];
  // Spruch des Tages: rückwärts vom Prüfungstag aus gezählt – so kommt bis zur Prüfung jeden Tag ein neuer,
  // die Endspurt-Sprüche am Schluss und «Morgen ist dein Tag» am Vortag.
  M.quoteOfDay = (date) => {
    const list = BMP.SPRUECHE || M.QUOTES;
    const d = M.daysLeft(date);
    if (d === 0 && BMP.SPRUCH_PRUEFUNG) return BMP.SPRUCH_PRUEFUNG;
    if (d > 0) return list[((list.length - d) % list.length + list.length) % list.length];
    return list[(-d) % list.length];
  };

  /* ---------- Tagestraining: schwache Themen bevorzugen ---------- */
  M.dailyMix = function (count) {
    const out = [];
    const fehler = BMP.U.shuffle(store.fehlerList().filter(f => WEIGHTS[f.item.subject]));
    const nF = Math.min(fehler.length, Math.floor(count * 0.3));
    for (let i = 0; i < nF; i++) out.push(Object.assign({}, fehler[i].item));
    const subjects = BMP.subjects.filter(s => WEIGHTS[s.id]);
    let guard = 0;
    while (out.length < count && guard++ < count * 20) {
      // Fach nach Gewicht (Mathe doppelt), Thema nach Schwäche
      const bag = subjects.flatMap(s => Array(WEIGHTS[s.id]).fill(s));
      const s = BMP.U.pick(bag);
      const tops = BMP.examTopics(s);
      const ws = tops.map(t => 1.2 - store.mastery(s.id, t));
      let r = Math.random() * ws.reduce((a, b) => a + b, 0), k = 0;
      while (k < ws.length - 1 && r > ws[k]) { r -= ws[k]; k++; }
      const [it] = BMP.draw(s, [tops[k]], 1);
      if (it && !out.some(o => o.q === it.q)) out.push(it);
    }
    return BMP.U.shuffle(out);
  };

  /* ---------- Prüfungs-Countdown mit Phasen ---------- */
  const EXAM_DEFAULT = '2027-03-16';
  const dayStart = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  M.examDate = () => st().examDate || EXAM_DEFAULT;
  M.examTime = () => new Date(M.examDate() + 'T08:00:00');
  M.daysLeft = (from) => Math.round((dayStart(M.examDate() + 'T00:00:00') - dayStart(from || new Date())) / 86400000);

  const PHASES = [
    { min: 121, id: 'basis', name: 'Grundlagen', icon: '🌱', goal: 15,
      msgs: ['Jetzt legst du das Fundament. Wer früh startet, hat am Schluss keinen Stress.',
        'Noch ist Zeit – aber nur, wenn du sie jetzt nutzt.', 'Jede Aufgabe heute ist eine weniger, die dir im März Bauchweh macht.'] },
    { min: 61, id: 'aufbau', name: 'Aufbau', icon: '🧱', goal: 20,
      msgs: ['Weniger als vier Monate. Jetzt zählt Regelmässigkeit – jeden Tag!', 'Schwache Themen jetzt angehen, nicht erst im Februar.',
        'Mathe zählt doppelt. Hast du heute schon Mathe gemacht?'] },
    { min: 31, id: 'endspurt', name: 'Endspurt', icon: '🏃‍♀️', goal: 30,
      msgs: ['Endspurt! Weniger als zwei Monate – jetzt wird es ernst.', 'Mach jede Woche mindestens eine Prüfungssimulation pro Fach.',
        'Kein Tag ohne Training. Die Konkurrenz übt auch.'] },
    { min: 15, id: 'countdown', name: 'Countdown', icon: '⏳', goal: 40,
      msgs: ['Nur noch wenige Wochen. Jeder Tag zählt jetzt doppelt!', 'Originalprüfungen lösen – unter echten Bedingungen, mit Timer.',
        'Jetzt nicht nachlassen. Das Fehlerheft muss leer werden!'] },
    { min: 1, id: 'final', name: 'Finale', icon: '🔥', goal: 50,
      msgs: ['Die Prüfung steht vor der Tür. Gib jetzt alles!', 'Letzte Lücken schliessen – Fehlerheft und Merkblätter!',
        'Du hast so viel geübt. Jetzt noch die letzten Meter!'] },
    { min: 0, id: 'heute', name: 'Prüfungstag', icon: '🍀', goal: 0,
      msgs: ['Heute ist der Tag! Ruhig atmen, Aufgaben genau lesen, du schaffst das. Viel Glück!'] },
    { min: -Infinity, id: 'vorbei', name: 'Geschafft', icon: '🎓', goal: 0,
      msgs: ['Die Prüfung ist vorbei – du hast alles gegeben! Das KV Chur teilt dir das Resultat spätestens drei Wochen nach der Prüfung schriftlich mit (Art. 14).'] }
  ];
  M.phase = (days) => {
    const d = days == null ? M.daysLeft() : days;
    const p = PHASES.find(x => d >= x.min);
    const dayNo = Math.floor(Date.now() / 86400000);
    return Object.assign({ days: d, msg: p.msgs[dayNo % p.msgs.length] }, p);
  };
  // Tagesziel passt sich der Phase an (nie tiefer als das selbst gewählte Ziel)
  M.goal = () => {
    const own = st().dailyGoal || 20;
    return st().autoGoal === false ? own : Math.max(own, M.phase().goal);
  };
  // Soll/Ist seit Trainingsbeginn
  M.plan = () => {
    const keys = Object.keys(st().daily).sort();
    if (!keys.length) return null;
    const start = new Date(keys[0] + 'T00:00:00'), today = dayStart(new Date());
    let expected = 0;
    for (let d = new Date(start); d < today; d.setDate(d.getDate() + 1)) {
      expected += Math.max(st().autoGoal === false ? 0 : M.phase(M.daysLeft(d)).goal, st().dailyGoal || 20);
    }
    const done = keys.filter(k => k < store.today()).reduce((a, k) => a + st().daily[k].n, 0);
    return { expected, done, diff: done - expected };
  };
  M.lastExamDays = (subject) => {
    const e = st().exams.filter(x => !subject || x.subject === subject).pop();
    return e ? Math.floor((Date.now() - e.date) / 86400000) : null;
  };

  M.WEIGHTS = WEIGHTS;
  BMP.motiv = M;
})(typeof window !== 'undefined' ? window : globalThis);
