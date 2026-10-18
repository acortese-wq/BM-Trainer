/* BM-Trainer – Kern: Hilfsfunktionen, Antwortprüfung, Speicherung */
(function (root) {
  'use strict';

  const BMP = root.BMP || (root.BMP = {});
  BMP.subjects = BMP.subjects || [];

  /* ---------- Zufall & Zahlen ---------- */
  const U = {
    rand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
    randNZ(a, b) { let n; do { n = U.rand(a, b); } while (n === 0); return n; },
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; },
    lcm(a, b) { return Math.abs(a * b) / U.gcd(a, b); },
    round(x, d = 2) { const f = 10 ** d; return Math.round((x + Number.EPSILON) * f) / f; },
    /* Zahl im Schweizer Format: 1'234.5, Minus als − */
    fmt(x, d = 2) {
      const r = U.round(x, d);
      const neg = r < 0;
      const [i, f] = Math.abs(r).toString().split('.');
      const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, '’');
      return (neg ? '−' : '') + int + (f ? '.' + f : '');
    },
    /* Zahl in Formeln: negative Zahlen in Klammern */
    par(x) { return x < 0 ? '(' + U.fmt(x) + ')' : U.fmt(x); },
    frac(n, d) {
      if (d < 0) { n = -n; d = -d; }
      const g = U.gcd(n, d);
      n /= g; d /= g;
      return d === 1 ? String(n) : n + '/' + d;
    },
    fracHtml(n, d) {
      if (d < 0) { n = -n; d = -d; }
      const g = U.gcd(n, d);
      n /= g; d /= g;
      if (d === 1) return U.fmt(n);
      return '<span class="frac"><span>' + (n < 0 ? '−' : '') + Math.abs(n) + '</span><span>' + d + '</span></span>';
    },
    /* Mehrfachauswahl aus richtiger Antwort + Distraktoren bauen */
    mc(correct, distractors, extra) {
      const opts = [correct];
      for (const d of distractors) {
        if (opts.length >= 4) break;
        if (!opts.includes(d)) opts.push(d);
      }
      const sh = U.shuffle(opts);
      return Object.assign({ type: 'mc', options: sh, answer: sh.indexOf(correct) }, extra || {});
    },
    esc(s) {
      return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
  };
  BMP.U = U;

  /* ---------- Antworten prüfen ---------- */
  function normText(s) {
    return String(s)
      .normalize('NFC')
      .toLowerCase()
      .replace(/[’‘´`]/g, "'")
      .replace(/ß/g, 'ss')
      .replace(/\s*'\s*/g, "'")
      .replace(/[.!?;:,]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseNumber(s) {
    let t = String(s).trim()
      .replace(/[−–]/g, '-')
      .replace(/['’\s]/g, '')
      .replace(',', '.');
    t = t.replace(/(cm|mm|km|m|kg|g|l|dl|ml|chf|fr|%|°|h|min|s)[²³23]?$/i, '');
    if (t === '' || !/^[-+]?(\d+\.?\d*|\.\d+)$/.test(t)) return NaN;
    return Number(t);
  }

  /* Bruch, ganze Zahl, gemischte Zahl («1 1/2») oder Dezimalzahl */
  function parseFraction(s) {
    const t = String(s).trim().replace(/[−–]/g, '-').replace(/\s*\/\s*/g, '/').replace(',', '.');
    let m = t.match(/^([-+]?\d+)\s+(\d+)\/(\d+)$/);
    if (m) {
      const w = Number(m[1]), n = Number(m[2]), d = Number(m[3]);
      if (!d) return null;
      const sign = w < 0 || m[1].startsWith('-') ? -1 : 1;
      return { n: sign * (Math.abs(w) * d + n), d };
    }
    m = t.match(/^([-+]?\d+)\/([-+]?\d+)$/);
    if (m) {
      const n = Number(m[1]), d = Number(m[2]);
      return d ? { n, d } : null;
    }
    const x = parseNumber(t);
    if (Number.isNaN(x)) return null;
    let d = 1;
    while (Math.abs(x * d - Math.round(x * d)) > 1e-9 && d < 1e6) d *= 10;
    return { n: Math.round(x * d), d };
  }

  /* ---------- Kurz- und Langformen bei Textantworten ----------
     Beispiel: «Er bringt das Paket.» → «Er brachte das Paket». Akzeptiert wird auch nur «brachte»
     (die geänderten Wörter). Bei Lücken (___) wird auch der ganze Satz akzeptiert. */
  const tokens = t => normText(t).split(' ').map(w => w.replace(/^[«»"„“(]+|[«»"„“),.!?;:]+$/g, '')).filter(Boolean);
  const NOT_ALONE = ['not', 'nicht', 'non', 'no'];
  function plainQ(item) { return String(item.q || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' '); }
  function sourceOf(item) {
    const q = plainQ(item);
    const quote = q.match(/«([^»]+)»/);
    if (quote) return quote[1];
    const paren = q.match(/___\s*\(([^)]+)\)/);
    return paren ? paren[1] : null;
  }
  // Wörter der Lösung, die im Ausgangstext nicht vorkommen (Reihenfolge der Lösung)
  function changedWords(answer, source) {
    const src = tokens(source);
    const pool = src.slice();
    const out = [];
    for (const w of tokens(answer)) {
      const k = pool.indexOf(w);
      if (k >= 0) pool.splice(k, 1); else out.push(w);
    }
    // zusammenhängender Bereich zwischen gleichem Anfang und gleichem Ende
    const a = tokens(answer);
    let i = 0; while (i < a.length && i < src.length && a[i] === src[i]) i++;
    let j = 0; while (j < a.length - i && j < src.length - i && a[a.length - 1 - j] === src[src.length - 1 - j]) j++;
    return [out.join(' '), a.slice(i, a.length - j).join(' ')];
  }
  function acceptedTexts(item) {
    const answers = Array.isArray(item.answer) ? item.answer.slice() : [item.answer];
    const extra = [];
    const src = sourceOf(item);
    if (src && tokens(src).length >= 2) { // nur bei Sätzen/Wortgruppen, nicht bei Einzelwörtern («big» → «bigger»)
      for (const a of answers) for (const f of changedWords(a, src)) {
        if (f && !NOT_ALONE.includes(f) && f.split(' ').length < tokens(a).length) extra.push(f);
      }
    }
    // Lücke: ganzer Satz mit eingesetzter Lösung
    const q = plainQ(item);
    if (q.includes('___')) {
      let sent = q.split(/→|:\s/).filter(x => x.includes('___')).pop() || '';
      sent = sent.replace(/\([^)]*\)/g, ' ').replace(/[«»"„“]/g, '').replace(/\s+/g, ' ').trim();
      if (sent.replace('___', '').trim().length > 0) for (const a of answers) extra.push(sent.replace('___', a));
    }
    return { answers, extra: [...new Set(extra.map(normText))].filter(e => e && !answers.some(a => normText(a) === e)) };
  }
  BMP.altForms = item => item.type === 'text' && !item.digits ? acceptedTexts(item).extra.filter(e => e.split(' ').length < 4) : [];

  /* Kleiner Formelrechner für Nebenrechnungen (ohne eval):
     + − · × * / : ÷, Klammern, ^ bzw. ², √, %, π; Dezimalkomma oder -punkt */
  function calc(expr) {
    const src = String(expr)
      .replace(/[\u2212\u2013]/g, '-').replace(/[×·*]/g, '*').replace(/[÷:]/g, '/')
      .replace(/²/g, '^2').replace(/³/g, '^3').replace(/π|pi/gi, 'p')
      .replace(/(\d)['\u2019](?=\d)/g, '$1').replace(/,/g, '.').replace(/\s+/g, '');
    let i = 0;
    const peek = () => src[i];
    const num = () => {
      const m = src.slice(i).match(/^(\d+\.?\d*|\.\d+)/);
      if (!m) throw new Error('Zahl erwartet');
      i += m[0].length;
      return Number(m[0]);
    };
    function primary() {
      const c = peek();
      if (c === '(') { i++; const v = expr0(); if (peek() !== ')') throw new Error(')'); i++; return v; }
      if (c === '√') { i++; return Math.sqrt(unary()); }
      if (c === 'p') { i++; return Math.PI; }
      return num();
    }
    function postfix() {
      let v = primary();
      while (peek() === '%') { i++; v /= 100; }
      // implizite Multiplikation: 2(3+1), 3π, 2√9
      while (peek() === '(' || peek() === 'p' || peek() === '√') v *= primary();
      return v;
    }
    function power() {
      const base = postfix();
      if (peek() === '^') { i++; return Math.pow(base, unary()); }
      return base;
    }
    function unary() {
      if (peek() === '-') { i++; return -unary(); }
      if (peek() === '+') { i++; return unary(); }
      return power();
    }
    function term() {
      let v = unary();
      while (peek() === '*' || peek() === '/') {
        const op = src[i++]; const r = unary();
        v = op === '*' ? v * r : v / r;
      }
      return v;
    }
    function expr0() {
      let v = term();
      while (peek() === '+' || peek() === '-') {
        const op = src[i++]; const r = term();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }
    try {
      if (!src) return NaN;
      const v = expr0();
      return i === src.length && Number.isFinite(v) ? v : NaN;
    } catch (e) { return NaN; }
  }
  BMP.calc = calc;

  /* Liefert { ok, note } – note ist ein optionaler Hinweis */
  function check(item, given) {
    switch (item.type) {
      case 'mc':
        return { ok: Number(given) === item.answer };
      case 'number': {
        let x = parseNumber(given);
        if (Number.isNaN(x)) { const f = parseFraction(given); if (f) x = f.n / f.d; } // auch «1/2» erlaubt
        if (Number.isNaN(x)) return { ok: false, note: 'Bitte eine Zahl eingeben.' };
        const tol = item.tol != null ? item.tol : 1e-6;
        const answers = Array.isArray(item.answer) ? item.answer : [item.answer];
        return { ok: answers.some(a => Math.abs(x - a) <= tol + 1e-9) };
      }
      case 'fraction': {
        const f = parseFraction(given);
        if (!f) return { ok: false, note: 'Bitte als Bruch eingeben, z. B. 3/4.' };
        const [an, ad] = item.answer;
        const ok = f.n * ad === an * f.d;
        let note;
        if (ok && U.gcd(f.n, f.d) !== 1 && String(given).includes('/')) note = 'Richtig – aber noch kürzen!';
        return { ok, note };
      }
      case 'text':
      default: {
        if (item.digits) {
          const d = String(given).replace(/\D/g, '');
          const answers = Array.isArray(item.answer) ? item.answer : [item.answer];
          return { ok: !!d && answers.some(a => String(a).replace(/\D/g, '') === d) };
        }
        const g = normText(given);
        if (!g) return { ok: false };
        const acc = acceptedTexts(item);
        return { ok: acc.answers.some(a => normText(a) === g) || acc.extra.includes(g) };
      }
    }
  }

  function answerText(item) {
    switch (item.type) {
      case 'mc': return item.options[item.answer];
      case 'fraction': return U.frac(item.answer[0], item.answer[1]);
      case 'number': return U.fmt(Array.isArray(item.answer) ? item.answer[0] : item.answer, 4) + (item.unit ? (item.unit === '°' ? '' : ' ') + item.unit : '');
      default: return Array.isArray(item.answer) ? item.answer[0] : item.answer;
    }
  }

  BMP.check = check;
  BMP.answerText = answerText;
  BMP._norm = { normText, parseNumber, parseFraction };

  /* ---------- Aufgaben ziehen ---------- */
  BMP.getSubject = id => BMP.subjects.find(s => s.id === id);

  /* Konkrete Aufgabe aus einem Thema erzeugen (statisch oder generiert) */
  BMP.itemsFor = function (subject, topicId) {
    return subject.items.filter(i => i.topic === topicId);
  };

  /* Themen, die an der Aufnahmeprüfung geprüft werden (ohne Zusatzthemen) */
  BMP.examTopics = s => s.topics.filter(t => !t.notTested).map(t => t.id);

  BMP.draw = function (subject, topicIds, count) {
    const pool = [];
    for (const t of topicIds) {
      const statics = BMP.itemsFor(subject, t).map(i => () => Object.assign({}, i));
      const gens = (subject.generators && subject.generators[t]) || [];
      const genFns = gens.map(g => () => Object.assign({ topic: t, generated: true }, g()));
      // Generatoren mehrfach gewichten, damit sie neben statischen Aufgaben vorkommen
      pool.push(...statics, ...genFns, ...genFns);
    }
    if (!pool.length) return [];
    const out = [];
    const usedStatic = new Set();
    let guard = 0;
    while (out.length < count && guard++ < count * 30) {
      const make = U.pick(pool);
      const it = make();
      if (!it.generated) {
        if (usedStatic.has(it.id)) continue;
        usedStatic.add(it.id);
      }
      // Gleiche Generator-Aufgabe nicht doppelt
      if (it.generated && out.some(o => o.q === it.q)) continue;
      it.subject = subject.id;
      out.push(it);
    }
    // Aufgaben mit gleichem Lesetext zusammenhalten
    return out;
  };

  /* ---------- Speicherung (localStorage) ---------- */
  const KEY = 'bm-trainer-v1';
  const blank = () => ({ topics: {}, exams: [], fehler: {}, days: [], drafts: {}, name: '', examDate: '',
    points: 0, daily: {}, badges: {}, dailyGoal: 20, originals: {}, onboarded: false, total: 0, totalCorrect: 0 });
  let state = blank();

  function load() {
    try {
      const raw = root.localStorage && root.localStorage.getItem(KEY);
      if (raw) state = Object.assign(blank(), JSON.parse(raw));
    } catch (e) { state = blank(); }
    return state;
  }
  function save() {
    try { root.localStorage && root.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* privat/voll */ }
  }

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function itemKey(item) {
    return item.generated ? 'g:' + item.subject + ':' + item.q : item.id;
  }

  BMP.store = {
    load, save,
    get state() { return state; },
    reset() { state = blank(); save(); },
    /* Sicherung: ganzer Stand als Text (JSON) */
    exportData() {
      return JSON.stringify({ app: 'bm-trainer', version: 1, exported: new Date().toISOString(), state });
    },
    importData(text) {
      let obj;
      try { obj = JSON.parse(String(text).trim()); } catch (e) {
        try { obj = JSON.parse(decodeURIComponent(escape(atob(String(text).trim())))); } catch (e2) { return { ok: false, msg: 'Das ist keine gültige Sicherung.' }; }
      }
      const data = obj && obj.app === 'bm-trainer' ? obj.state : obj;
      if (!data || typeof data !== 'object' || typeof data.topics !== 'object' || !Array.isArray(data.exams)) return { ok: false, msg: 'Die Sicherung ist unvollständig.' };
      state = Object.assign(blank(), data);
      save();
      return { ok: true };
    },
    /* Browser bitten, die Daten nicht automatisch zu löschen */
    persist() {
      try { if (root.navigator && navigator.storage && navigator.storage.persist) return navigator.storage.persist(); } catch (e) { /* egal */ }
      return Promise.resolve(false);
    },
    record(item, ok) {
      const k = item.subject + '/' + item.topic;
      const t = state.topics[k] || (state.topics[k] = { seen: 0, correct: 0, recent: [] });
      t.seen++; if (ok) t.correct++;
      t.recent.push(ok ? 1 : 0);
      if (t.recent.length > 20) t.recent.shift();

      const fk = itemKey(item);
      if (!ok) {
        const copy = Object.assign({}, item);
        state.fehler[fk] = { item: copy, streak: 0, added: Date.now() };
      } else if (state.fehler[fk]) {
        state.fehler[fk].streak++;
        if (state.fehler[fk].streak >= 2) { delete state.fehler[fk]; state.fehlerCleared = (state.fehlerCleared || 0) + 1; }
      }
      const d = today();
      if (!state.days.includes(d)) { state.days.push(d); if (state.days.length > 400) state.days.shift(); }
      const day = state.daily[d] || (state.daily[d] = { n: 0, c: 0, subjects: [] });
      day.n++; if (ok) day.c++;
      if (!day.subjects.includes(item.subject)) day.subjects.push(item.subject);
      state.total++; if (ok) state.totalCorrect++;
      save();
    },
    today,
    todayStats() { return state.daily[today()] || { n: 0, c: 0, subjects: [] }; },
    topicStats(subjectId, topicId) {
      return state.topics[subjectId + '/' + topicId] || { seen: 0, correct: 0, recent: [] };
    },
    /* Beherrschung 0..1: Trefferquote der letzten Antworten, gedämpft bei wenig Daten */
    mastery(subjectId, topicId) {
      const t = BMP.store.topicStats(subjectId, topicId);
      if (!t.recent.length) return 0;
      const rate = t.recent.reduce((a, b) => a + b, 0) / t.recent.length;
      return rate * Math.min(1, t.recent.length / 10);
    },
    fehlerList(subjectId) {
      return Object.values(state.fehler).filter(f => !subjectId || f.item.subject === subjectId);
    },
    addExam(e) { state.exams.push(e); if (state.exams.length > 100) state.exams.shift(); save(); },
    streak() {
      const set = new Set(state.days);
      let n = 0;
      const d = new Date();
      if (!set.has(today())) d.setDate(d.getDate() - 1);
      for (;;) {
        const s = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        if (!set.has(s)) break;
        n++; d.setDate(d.getDate() - 1);
      }
      return n;
    }
  };

  /* Schweizer Note 1–6 (linear), auf halbe Noten gerundet */
  BMP.grade = function (points, max) {
    if (!max) return 1;
    const raw = 1 + 5 * points / max;
    return Math.round(raw * 2) / 2;
  };
})(typeof window !== 'undefined' ? window : globalThis);
