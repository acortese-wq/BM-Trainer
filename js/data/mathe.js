/* BM-Trainer – Mathematik
   Die meisten Aufgaben werden zufällig erzeugt (generators), dazu kommen feste Textaufgaben (items). */
(function (root) {
  'use strict';
  const BMP = root.BMP;
  const U = BMP.U;
  const { rand, randNZ, pick, fmt, par, gcd, lcm } = U;

  /* ---------- Formatierung von Termen ---------- */
  const M = '−'; // Minuszeichen
  // Koeffizient mit Variable: 1x → x, −1x → −x
  function mono(c, v, first) {
    if (c === 0) return '';
    const abs = Math.abs(c);
    const body = v ? (abs === 1 ? v : abs + v) : String(abs);
    if (first) return (c < 0 ? M : '') + body;
    return (c < 0 ? ' ' + M + ' ' : ' + ') + body;
  }
  // Polynom aus [[koeffizient, variable], ...]
  function poly(terms) {
    let s = '';
    for (const [c, v] of terms) {
      if (c === 0) continue;
      s += mono(c, v, s === '');
    }
    return s || '0';
  }
  const sq = v => v + '²';

  /* ---------- Generatoren ---------- */
  const G = {};

  G.grundop = [
    () => {
      const a = rand(2, 30), b = rand(2, 12), c = rand(2, 12), d = rand(1, 40);
      const ans = a + b * c - d;
      return { type: 'number', q: `Berechne: ${a} + ${b} · ${c} ${M} ${d}`, answer: ans,
        explain: `Punkt vor Strich: ${b} · ${c} = ${b * c}. Dann ${a} + ${b * c} ${M} ${d} = ${fmt(ans)}.` };
    },
    () => {
      const a = rand(1, 10), b = rand(5, 20), c = rand(2, 9), d = rand(1, 30);
      const ans = (a - b) * c + d;
      return { type: 'number', q: `Berechne: (${a} ${M} ${b}) · ${c} + ${d}`, answer: ans,
        explain: `Klammer zuerst: ${a} ${M} ${b} = ${fmt(a - b)}. Dann ${par(a - b)} · ${c} = ${fmt((a - b) * c)}, plus ${d} ergibt ${fmt(ans)}.` };
    },
    () => {
      const a = rand(-15, 15), b = rand(2, 20), c = rand(2, 9), d = rand(2, 9);
      const ans = a + b - c * d;
      return { type: 'number', q: `Berechne: ${par(a)} ${M} (${M}${b}) + ${c} · (${M}${d})`, answer: ans,
        explain: `Minus mal Minus gibt Plus: ${M} (${M}${b}) = + ${b}. Plus mal Minus gibt Minus: ${c} · (${M}${d}) = ${M}${c * d}. Also ${fmt(a)} + ${b} ${M} ${c * d} = ${fmt(ans)}.` };
    },
    () => {
      const b = rand(2, 12), k = rand(2, 15), c = rand(1, 20), e = rand(2, 6);
      const a = b * k;
      const ans = c + a / b * e;
      return { type: 'number', q: `Berechne: ${c} + ${a} : ${b} · ${e}`, answer: ans,
        explain: `Punktrechnungen von links nach rechts: ${a} : ${b} = ${k}, dann ${k} · ${e} = ${k * e}. Zum Schluss ${c} + ${k * e} = ${ans}.` };
    },
    () => {
      const xs = Array.from({ length: 5 }, () => rand(1, 30));
      const sum = xs.reduce((s, x) => s + x, 0);
      return { type: 'number', q: `Berechne den Mittelwert (Durchschnitt) von: ${xs.join(', ')}`, answer: sum / 5,
        explain: `Summe: ${xs.join(' + ')} = ${sum}. Geteilt durch die Anzahl 5: ${sum} : 5 = ${fmt(sum / 5)}.` };
    }
  ];

  G.zahlen = [
    () => {
      const g = rand(2, 12), a = g * rand(2, 9), b = g * rand(2, 9);
      const r = gcd(a, b);
      if (a === b) return G.zahlen[0]();
      return { type: 'number', q: `Bestimme den grössten gemeinsamen Teiler: ggT(${a}, ${b})`, answer: r,
        explain: `Die grösste Zahl, die sowohl ${a} als auch ${b} ohne Rest teilt, ist ${r} (${a} = ${r} · ${a / r}, ${b} = ${r} · ${b / r}).` };
    },
    () => {
      const a = rand(2, 15), b = rand(2, 15);
      if (a === b) return G.zahlen[1]();
      const r = lcm(a, b);
      return { type: 'number', q: `Bestimme das kleinste gemeinsame Vielfache: kgV(${a}, ${b})`, answer: r,
        explain: `Die kleinste Zahl, die sowohl durch ${a} als auch durch ${b} teilbar ist, ist ${r}.` };
    },
    () => {
      const primes = [2, 3, 5, 7];
      let n = 1; const f = [];
      const k = rand(3, 5);
      for (let i = 0; i < k; i++) { const p = pick(primes); n *= p; f.push(p); }
      f.sort((x, y) => x - y);
      const correct = f.join(' · ');
      const wrong1 = f.slice(0, -1).join(' · ') + ' · ' + (f[f.length - 1] + 2);
      const wrong2 = (f.length > 2 ? f.slice(1).join(' · ') : '1 · ' + f.join(' · '));
      const wrong3 = f.map(x => x === 2 ? 4 : x).join(' · ');
      return U.mc(correct, [wrong1, wrong2, wrong3, n + ' · 1'], { q: `Welches ist die Primfaktorzerlegung von ${n}?`,
        explain: `${n} = ${correct}. Prüfe, indem du das Produkt ausrechnest – und alle Faktoren müssen Primzahlen sein.` });
    }
  ];

  const DENS = [2, 3, 4, 5, 6, 8, 10, 12];
  // Zufälliger, bereits gekürzter Bruch n/d (damit Anzeige und Lösungsweg übereinstimmen)
  function rfrac(maxN) {
    const d = pick(DENS), n = rand(1, maxN || d - 1), g = gcd(n, d);
    return [n / g, d / g];
  }
  const kurz = (n, d) => n + '/' + d + (U.frac(n, d) !== n + '/' + d ? ' = ' + U.frac(n, d) : '');
  function addSub(op) {
    const [a, b] = rfrac(), [c, d] = rfrac();
    const L = lcm(b, d);
    const a2 = a * (L / b), c2 = c * (L / d);
    const n = op === '+' ? a2 + c2 : a2 - c2;
    return { type: 'fraction', q: `Berechne und kürze: ${U.fracHtml(a, b)} ${op === '+' ? '+' : M} ${U.fracHtml(c, d)}`,
      answer: [n, L], hint: 'Antwort als Bruch, z. B. 5/6',
      explain: `Hauptnenner ${L}: ${a}/${b} = ${a2}/${L} und ${c}/${d} = ${c2}/${L}. Also ${a2} ${op === '+' ? '+' : M} ${c2} = ${n} → ${kurz(n, L)}.` };
  }
  G.brueche = [
    () => addSub('+'),
    () => addSub('-'),
    () => {
      const [a, b] = rfrac(9), [c, d] = rfrac(9);
      return { type: 'fraction', q: `Berechne und kürze: ${U.fracHtml(a, b)} · ${U.fracHtml(c, d)}`, answer: [a * c, b * d], hint: 'Antwort als Bruch, z. B. 5/6',
        explain: `Zähler mal Zähler, Nenner mal Nenner: (${a} · ${c}) / (${b} · ${d}) = ${kurz(a * c, b * d)}.` };
    },
    () => {
      const [a, b] = rfrac(9), [c, d] = rfrac(9);
      return { type: 'fraction', q: `Berechne und kürze: ${U.fracHtml(a, b)} : ${U.fracHtml(c, d)}`, answer: [a * d, b * c], hint: 'Antwort als Bruch, z. B. 5/6',
        explain: `Durch einen Bruch teilen = mit dem Kehrwert multiplizieren: ${a}/${b} · ${d}/${c} = ${kurz(a * d, b * c)}.` };
    },
    () => {
      const d = pick([3, 4, 5, 6, 8, 10]), n = rand(1, d - 1), k = rand(3, 25), base = d * k;
      return { type: 'number', q: `Wie viel sind ${U.fracHtml(n, d)} von ${base}?`, answer: n * k,
        explain: `${base} : ${d} = ${k} (ein ${d}tel), mal ${n} = ${n * k}.` };
    },
    () => {
      const pairs = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 8], [3, 8], [5, 8], [7, 8], [1, 20], [3, 20], [7, 20], [1, 25], [6, 25], [3, 10], [7, 10], [9, 10]];
      const [n, d] = pick(pairs);
      const dec = n / d;
      return { type: 'fraction', q: `Schreibe als gekürzten Bruch: ${fmt(dec, 4)}`, answer: [n, d], hint: 'Antwort als Bruch, z. B. 3/4',
        explain: `${fmt(dec, 4)} = ${Math.round(dec * 1000)}/1000 = ${n}/${d} (gekürzt).` };
    }
  ];

  const PCT = [5, 10, 12, 15, 20, 25, 30, 40, 60, 75];
  G.prozent = [
    () => {
      const p = pick(PCT), G0 = 20 * rand(2, 40);
      const W = G0 * p / 100;
      return { type: 'number', unit: '', q: `Wie viel sind ${p} % von ${fmt(G0)}?`, answer: W,
        explain: `Prozentwert = Grundwert · Prozentsatz : 100 = ${fmt(G0)} · ${p} : 100 = ${fmt(W)}.` };
    },
    () => {
      const p = pick(PCT), G0 = 20 * rand(2, 40);
      const W = G0 * p / 100;
      return { type: 'number', unit: '%', q: `${fmt(W)} von ${fmt(G0)} sind wie viel Prozent?`, answer: p, hint: 'Antwort in %',
        explain: `Prozentsatz = Prozentwert : Grundwert · 100 = ${fmt(W)} : ${fmt(G0)} · 100 = ${p} %.` };
    },
    () => {
      const p = pick(PCT), G0 = 20 * rand(2, 40);
      const W = G0 * p / 100;
      return { type: 'number', q: `${p} % einer Zahl sind ${fmt(W)}. Wie heisst die Zahl (100 %)?`, answer: G0,
        explain: `1 % = ${fmt(W)} : ${p} = ${fmt(W / p)}. 100 % = ${fmt(W / p)} · 100 = ${fmt(G0)}.` };
    },
    () => {
      const P = 5 * rand(8, 80), p = pick([10, 15, 20, 25, 30, 40]);
      const neu = P * (100 - p) / 100;
      return { type: 'number', unit: 'CHF', tol: 0.01, q: `Ein Paar Schuhe kostet CHF ${fmt(P)}. Im Ausverkauf gibt es ${p} % Rabatt. Wie viel kosten die Schuhe jetzt (in CHF)?`, answer: neu,
        explain: `Neuer Preis = ${100 - p} % des alten Preises: ${fmt(P)} · ${fmt((100 - p) / 100)} = ${fmt(neu)} CHF.` };
    },
    () => {
      const P = 10 * rand(5, 60), p = pick([5, 10, 15, 20, 25]);
      const neu = P * (100 + p) / 100;
      return { type: 'number', unit: 'CHF', tol: 0.01, q: `Die Miete von CHF ${fmt(P)} wird um ${p} % erhöht. Wie hoch ist die neue Miete (in CHF)?`, answer: neu,
        explain: `Neue Miete = ${100 + p} % der alten: ${fmt(P)} · ${fmt((100 + p) / 100)} = ${fmt(neu)} CHF.` };
    },
    () => {
      const K = 500 * rand(2, 40), r = pick([0.5, 1, 1.25, 1.5, 2, 2.5, 3]);
      const z = K * r / 100;
      return { type: 'number', unit: 'CHF', tol: 0.01, q: `Auf einem Sparkonto liegen CHF ${fmt(K)}. Der Zinssatz beträgt ${fmt(r)} % pro Jahr. Wie viel Zins gibt es nach einem Jahr (in CHF)?`, answer: z,
        explain: `Zins = Kapital · Zinssatz : 100 = ${fmt(K)} · ${fmt(r)} : 100 = ${fmt(z)} CHF.` };
    }
  ];

  G.dreisatz = [
    () => {
      const u = rand(2, 15), n = rand(3, 9);
      let m = rand(2, 15); if (m === n) m++;
      const items = pick([['Hefte', 'kosten'], ['Kinotickets', 'kosten'], ['Pizzas', 'kosten'], ['Bücher', 'kosten']]);
      return { type: 'number', unit: 'CHF', q: `${n} ${items[0]} ${items[1]} zusammen CHF ${n * u}. Wie viel kosten ${m} ${items[0]} (in CHF)?`, answer: m * u,
        explain: `Proportional: 1 Stück kostet ${n * u} : ${n} = ${u} CHF. ${m} Stück kosten ${m} · ${u} = ${m * u} CHF.` };
    },
    () => {
      const a = rand(2, 8), t = rand(2, 12), total = a * t;
      const cands = [];
      for (let b = 2; b <= 16; b++) if (b !== a && total % b === 0) cands.push(b);
      if (!cands.length) return G.dreisatz[1]();
      const b = pick(cands);
      return { type: 'number', unit: 'Tage', q: `${a} Personen brauchen für eine Arbeit ${t} Tage. Wie viele Tage brauchen ${b} Personen (gleiches Arbeitstempo)?`, answer: total / b,
        explain: `Umgekehrt proportional: Mehr Personen → weniger Tage. 1 Person braucht ${a} · ${t} = ${total} Tage. ${b} Personen brauchen ${total} : ${b} = ${total / b} Tage.` };
    },
    () => {
      const v = pick([40, 50, 60, 80, 90, 100, 120]), t = pick([15, 20, 30, 45, 90, 150]);
      const s = v * t / 60;
      return { type: 'number', unit: 'km', q: `Ein Zug fährt mit ${v} km/h. Wie viele Kilometer legt er in ${t} Minuten zurück?`, answer: s,
        explain: `${t} min = ${fmt(t / 60)} h. Weg = Geschwindigkeit · Zeit = ${v} · ${fmt(t / 60)} = ${fmt(s)} km.` };
    },
    () => {
      const v = pick([12, 15, 18, 20, 24]), t = pick([20, 30, 40, 45, 50, 90]);
      const s = v * t / 60;
      if (!Number.isInteger(s * 10)) return G.dreisatz[3]();
      return { type: 'number', unit: 'km/h', q: `Mia fährt mit dem Velo ${fmt(s)} km in ${t} Minuten. Wie gross ist ihre Durchschnittsgeschwindigkeit in km/h?`, answer: v,
        explain: `${t} min = ${fmt(t / 60, 4)} h. Geschwindigkeit = Weg : Zeit = ${fmt(s)} : ${fmt(t / 60, 4)} = ${v} km/h. (Oder: In 60 min fährt sie ${fmt(s)} · 60 : ${t} = ${v} km.)` };
    },
    () => {
      const d = pick([10000, 25000, 50000]);
      const cm = rand(2, 12);
      const km = cm * d / 100000;
      return { type: 'number', unit: 'km', q: `Auf einer Karte im Massstab 1 : ${fmt(d)} sind zwei Orte ${cm} cm voneinander entfernt. Wie weit ist das in Wirklichkeit (in km)?`, answer: km,
        explain: `${cm} cm · ${fmt(d)} = ${fmt(cm * d)} cm = ${fmt(cm * d / 100)} m = ${fmt(km)} km.` };
    }
  ];

  G.gleichungen = [
    () => {
      const x = randNZ(-9, 9), a = randNZ(-9, 9), b = randNZ(-20, 20);
      const c = a * x + b;
      return { type: 'number', q: `Löse die Gleichung: ${poly([[a, 'x'], [b, '']])} = ${fmt(c)}`, answer: x, hint: 'x = ?',
        explain: `${b >= 0 ? M + ' ' + b : '+ ' + (-b)} auf beiden Seiten: ${mono(a, 'x', true)} = ${fmt(c - b)}. Durch ${par(a)} teilen: x = ${fmt(x)}.` };
    },
    () => {
      const x = randNZ(-8, 8);
      let a = randNZ(-9, 9), c = randNZ(-9, 9);
      if (a === c) c = a + 1 === 0 ? a + 2 : a + 1;
      const b = randNZ(-15, 15), d = (a - c) * x + b;
      return { type: 'number', q: `Löse die Gleichung: ${poly([[a, 'x'], [b, '']])} = ${poly([[c, 'x'], [d, '']])}`, answer: x, hint: 'x = ?',
        explain: `Alle x auf eine Seite, Zahlen auf die andere: ${mono(a, 'x', true)} ${c >= 0 ? M + ' ' + mono(c, 'x', true) : '+ ' + mono(-c, 'x', true)} = ${fmt(d)} ${b >= 0 ? M + ' ' + b : '+ ' + (-b)} → ${mono(a - c, 'x', true)} = ${fmt(d - b)} → x = ${fmt(x)}.` };
    },
    () => {
      const x = randNZ(-9, 9), a = rand(2, 7), b = randNZ(-9, 9);
      const c = a * (x + b);
      return { type: 'number', q: `Löse die Gleichung: ${a}(${poly([[1, 'x'], [b, '']])}) = ${fmt(c)}`, answer: x, hint: 'x = ?',
        explain: `Durch ${a} teilen: ${poly([[1, 'x'], [b, '']])} = ${fmt(c / a)}. Dann ${b >= 0 ? M + ' ' + b : '+ ' + (-b)}: x = ${fmt(x)}.` };
    },
    () => {
      const a = rand(2, 6), k = randNZ(-6, 8), x = a * k, b = randNZ(-10, 10);
      const c = k + b;
      return { type: 'number', q: `Löse die Gleichung: x : ${a} ${b >= 0 ? '+ ' + b : M + ' ' + (-b)} = ${fmt(c)}`, answer: x, hint: 'x = ?',
        explain: `${b >= 0 ? M + ' ' + b : '+ ' + (-b)}: x : ${a} = ${fmt(k)}. Mal ${a}: x = ${fmt(x)}.` };
    }
  ];

  G.terme = [
    () => {
      const a = randNZ(-6, 8), b = randNZ(-6, 8), c = randNZ(-6, 8), d = randNZ(-6, 8);
      if (a + c === 0 || b + d === 0) return G.terme[0]();
      const correct = poly([[a + c, 'x'], [b + d, 'y']]);
      return U.mc(correct, [
        poly([[a + c, 'x'], [b - d, 'y']]),
        poly([[a - c, 'x'], [b + d, 'y']]),
        poly([[a + b + c + d, 'xy']]),
        poly([[a + c, 'y'], [b + d, 'x']])
      ], { q: `Vereinfache: ${poly([[a, 'x'], [b, 'y'], [c, 'x'], [d, 'y']])}`,
        explain: `Nur gleichartige Glieder zusammenfassen: x-Glieder ${fmt(a)} + ${par(c)} = ${fmt(a + c)}, y-Glieder ${fmt(b)} + ${par(d)} = ${fmt(b + d)}. Ergebnis: ${correct}.` });
    },
    () => {
      const a = pick([-5, -4, -3, -2, 2, 3, 4, 5, 6]), b = randNZ(-5, 6), c = randNZ(-9, 9);
      const correct = poly([[a * b, 'x'], [a * c, '']]);
      return U.mc(correct, [
        poly([[a * b, 'x'], [c, '']]),
        poly([[a + b, 'x'], [a * c, '']]),
        poly([[a * b, 'x'], [-a * c, '']]),
        poly([[b, 'x'], [a * c, '']])
      ], { q: `Multipliziere aus: ${fmt(a)}(${poly([[b, 'x'], [c, '']])})`,
        explain: `Jedes Glied in der Klammer mit ${fmt(a)} multiplizieren: ${fmt(a)} · ${mono(b, 'x', true)} = ${mono(a * b, 'x', true)} und ${fmt(a)} · ${par(c)} = ${fmt(a * c)}.` });
    },
    () => {
      const a = randNZ(-7, 7), b = randNZ(-7, 7);
      const correct = poly([[1, sq('x')], [a + b, 'x'], [a * b, '']]);
      return U.mc(correct, [
        poly([[1, sq('x')], [a * b, '']]),
        poly([[1, sq('x')], [a * b, 'x'], [a + b, '']]),
        poly([[1, sq('x')], [a + b, 'x'], [a + b, '']]),
        poly([[1, sq('x')], [-(a + b), 'x'], [a * b, '']])
      ], { q: `Multipliziere aus: (${poly([[1, 'x'], [a, '']])})(${poly([[1, 'x'], [b, '']])})`,
        explain: `Jedes Glied mit jedem: x · x = x², x · ${par(b)} + ${par(a)} · x = ${mono(a + b, 'x', true) || '0'}, ${par(a)} · ${par(b)} = ${fmt(a * b)}. Ergebnis: ${correct}.` });
    },
    () => {
      const a = randNZ(-9, 9), s = a > 0 ? '+' : M;
      const correct = poly([[1, sq('x')], [2 * a, 'x'], [a * a, '']]);
      return U.mc(correct, [
        poly([[1, sq('x')], [a * a, '']]),
        poly([[1, sq('x')], [a, 'x'], [a * a, '']]),
        poly([[1, sq('x')], [2 * a, 'x'], [2 * Math.abs(a), '']]),
        poly([[1, sq('x')], [-2 * a, 'x'], [a * a, '']])
      ], { q: `Multipliziere aus: (x ${s} ${Math.abs(a)})²`,
        explain: `Binomische Formel: (a ${s} b)² = a² ${s} 2ab + b². Hier: x² ${s} 2 · ${Math.abs(a)} · x + ${Math.abs(a)}² = ${correct}.` });
    },
    () => {
      const f = rand(2, 9), b = rand(1, 7), c = randNZ(-9, 9);
      if (gcd(b, Math.abs(c)) !== 1) return G.terme[4]();
      const correct = `${f}(${poly([[b, 'x'], [c, '']])})`;
      return U.mc(correct, [
        `${f}(${poly([[b * f, 'x'], [c, '']])})`,
        `${f}(${poly([[b, 'x'], [c * f, '']])})`,
        `x(${poly([[f * b, ''], [f * c, 'x']])})`,
        `${f + 1}(${poly([[b, 'x'], [c, '']])})`
      ], { q: `Klammere den grössten gemeinsamen Faktor aus: ${poly([[f * b, 'x'], [f * c, '']])}`,
        explain: `ggT von ${f * b} und ${Math.abs(f * c)} ist ${f}. Also ${poly([[f * b, 'x'], [f * c, '']])} = ${correct}. Kontrolle: wieder ausmultiplizieren!` });
    },
    () => {
      const a = randNZ(-4, 5), b = randNZ(-6, 6), c = rand(-9, 9), x = randNZ(-4, 4);
      const v = a * x * x + b * x + c;
      return { type: 'number', q: `Berechne den Wert des Terms ${poly([[a, sq('x')], [b, 'x'], [c, '']])} für x = ${fmt(x)}.`, answer: v,
        explain: `Einsetzen: ${fmt(a)} · ${par(x)}² + ${fmt(b)} · ${par(x)} + ${par(c)} = ${fmt(a)} · ${x * x} ${b * x < 0 ? M : '+'} ${Math.abs(b * x)} ${c < 0 ? M : '+'} ${Math.abs(c)} = ${fmt(v)}. Achtung: ${par(x)}² ist immer positiv.` };
    }
  ];

  G.potenzen = [
    () => {
      const b = rand(2, 5), n = b === 2 ? rand(3, 8) : b === 3 ? rand(2, 5) : rand(2, 4);
      const v = b ** n;
      return { type: 'number', q: `Berechne: ${b}<sup>${n}</sup>`, answer: v,
        explain: `${b}<sup>${n}</sup> = ${Array(n).fill(b).join(' · ')} = ${fmt(v)}.` };
    },
    () => {
      const k = rand(2, 20);
      return { type: 'number', q: `Berechne: √${k * k}`, answer: k,
        explain: `${k} · ${k} = ${k * k}, also √${k * k} = ${k}.` };
    },
    () => {
      const a = rand(2, 9), b = rand(2, 9), kind = rand(0, 2);
      let q, correct, wrong, ex;
      if (kind === 0) { q = `x<sup>${a}</sup> · x<sup>${b}</sup>`; correct = a + b; wrong = [a * b, Math.abs(a - b)]; ex = 'Gleiche Basis multiplizieren: Exponenten addieren.'; }
      else if (kind === 1) { q = `(x<sup>${a}</sup>)<sup>${b}</sup>`; correct = a * b; wrong = [a + b, a ** 2]; ex = 'Potenz potenzieren: Exponenten multiplizieren.'; }
      else { const c = a + b; q = `x<sup>${c}</sup> : x<sup>${b}</sup>`; correct = a; wrong = [c + b, c * b]; ex = 'Gleiche Basis dividieren: Exponenten subtrahieren.'; }
      const o = n => `x<sup>${n}</sup>`;
      return U.mc(o(correct), [...wrong.map(o), o(correct + 1), o(correct - 1 || correct + 2)], { q: `Vereinfache: ${q}`, explain: `${ex} Ergebnis: ${o(correct)}.` });
    },
    () => {
      const m = rand(11, 99) / 10, e = pick([-4, -3, -2, 2, 3, 4, 5, 6]);
      const n = m * 10 ** e;
      const shown = e < 0 ? n.toFixed(-e + 1) : fmt(n, 0);
      return { type: 'number', q: `Schreibe in wissenschaftlicher Schreibweise: ${shown} = ${fmt(m, 1)} · 10<sup>?</sup>. Wie gross ist der Exponent?`, answer: e,
        explain: `Das Komma wird um ${Math.abs(e)} Stellen nach ${e > 0 ? 'links' : 'rechts'} verschoben, damit eine Zahl zwischen 1 und 10 entsteht. Darum ist der Exponent ${fmt(e)}.` };
    },
    () => {
      const b = rand(2, 5), n = rand(1, 3);
      return { type: 'fraction', q: `Berechne als Bruch: ${b}<sup>${M}${n}</sup>`, answer: [1, b ** n], hint: 'Antwort als Bruch, z. B. 1/8',
        explain: `Negativer Exponent = Kehrwert: ${b}<sup>${M}${n}</sup> = 1 / ${b}<sup>${n}</sup> = 1/${b ** n}.` };
    }
  ];

  const PI_HINT = 'Auf 1 Dezimale runden (π ≈ 3.14 ist auch ok).';
  G.geometrie = [
    () => {
      const a = rand(3, 25), b = rand(3, 25), area = rand(0, 1);
      return area
        ? { type: 'number', unit: 'cm²', q: `Ein Rechteck ist ${a} cm lang und ${b} cm breit. Berechne die Fläche in cm².`, answer: a * b, explain: `A = Länge · Breite = ${a} · ${b} = ${a * b} cm².` }
        : { type: 'number', unit: 'cm', q: `Ein Rechteck ist ${a} cm lang und ${b} cm breit. Berechne den Umfang in cm.`, answer: 2 * (a + b), explain: `U = 2 · (Länge + Breite) = 2 · (${a} + ${b}) = ${2 * (a + b)} cm.` };
    },
    () => {
      const g = 2 * rand(2, 12), h = rand(3, 15);
      return { type: 'number', unit: 'cm²', q: `Ein Dreieck hat die Grundseite g = ${g} cm und die Höhe h = ${h} cm. Berechne die Fläche in cm².`, answer: g * h / 2,
        explain: `A = g · h : 2 = ${g} · ${h} : 2 = ${g * h / 2} cm².` };
    },
    () => {
      const r = rand(2, 15), area = rand(0, 1);
      const exact = area ? Math.PI * r * r : 2 * Math.PI * r;
      const approx = area ? 3.14 * r * r : 2 * 3.14 * r;
      return { type: 'number', unit: area ? 'cm²' : 'cm', tol: 0.051, hint: PI_HINT,
        q: `Ein Kreis hat den Radius r = ${r} cm. Berechne ${area ? 'die Fläche in cm²' : 'den Umfang in cm'}.`,
        answer: [U.round(exact, 1), U.round(approx, 1), U.round(exact, 2), U.round(approx, 2)],
        explain: area ? `A = π · r² = π · ${r}² = π · ${r * r} ≈ ${fmt(exact, 1)} cm².` : `U = 2 · π · r = 2 · π · ${r} ≈ ${fmt(exact, 1)} cm.` };
    },
    () => {
      const [a0, b0, c0] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]);
      const k = a0 === 3 ? rand(1, 4) : 1;
      const a = a0 * k, b = b0 * k, c = c0 * k;
      return rand(0, 1)
        ? { type: 'number', unit: 'cm', q: `In einem rechtwinkligen Dreieck sind die Katheten a = ${a} cm und b = ${b} cm lang. Wie lang ist die Hypotenuse c?`, answer: c,
            explain: `Pythagoras: c² = a² + b² = ${a * a} + ${b * b} = ${c * c}. c = √${c * c} = ${c} cm.` }
        : { type: 'number', unit: 'cm', q: `In einem rechtwinkligen Dreieck ist die Hypotenuse c = ${c} cm und eine Kathete a = ${a} cm lang. Wie lang ist die andere Kathete b?`, answer: b,
            explain: `Pythagoras umgestellt: b² = c² ${M} a² = ${c * c} ${M} ${a * a} = ${b * b}. b = √${b * b} = ${b} cm.` };
    },
    () => {
      const al = rand(20, 100), be = rand(20, 150 - al);
      return { type: 'number', unit: '°', q: `In einem Dreieck ist α = ${al}° und β = ${be}°. Wie gross ist γ?`, answer: 180 - al - be,
        explain: `Winkelsumme im Dreieck = 180°. γ = 180° ${M} ${al}° ${M} ${be}° = ${180 - al - be}°.` };
    },
    () => {
      const a = rand(2, 12), b = rand(2, 12), c = rand(2, 12);
      return { type: 'number', unit: 'cm³', q: `Ein Quader ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Berechne das Volumen in cm³.`, answer: a * b * c,
        explain: `V = Länge · Breite · Höhe = ${a} · ${b} · ${c} = ${a * b * c} cm³.` };
    },
    () => {
      const r = rand(2, 10), h = rand(3, 20);
      const exact = Math.PI * r * r * h, approx = 3.14 * r * r * h;
      return { type: 'number', unit: 'cm³', tol: 0.051, hint: PI_HINT, q: `Ein Zylinder hat den Radius r = ${r} cm und die Höhe h = ${h} cm. Berechne das Volumen in cm³.`,
        answer: [U.round(exact, 1), U.round(approx, 1), U.round(exact, 2), U.round(approx, 2)],
        explain: `V = Grundfläche · Höhe = π · r² · h = π · ${r * r} · ${h} ≈ ${fmt(exact, 1)} cm³.` };
    },
    () => {
      const a = rand(6, 20), c = rand(2, a - 2), h = rand(2, 12);
      if ((a + c) * h % 2) return G.geometrie[7]();
      return { type: 'number', unit: 'cm²', q: `Ein Trapez hat die parallelen Seiten a = ${a} cm und c = ${c} cm sowie die Höhe h = ${h} cm. Berechne die Fläche in cm².`, answer: (a + c) * h / 2,
        explain: `A = (a + c) : 2 · h = (${a} + ${c}) : 2 · ${h} = ${(a + c) * h / 2} cm².` };
    }
  ];

  const LEN = { mm: 0.001, cm: 0.01, dm: 0.1, m: 1, km: 1000 };
  const AREA = { 'cm²': 0.0001, 'dm²': 0.01, 'm²': 1, a: 100, ha: 10000, 'km²': 1000000 };
  const VOL = { ml: 0.001, cl: 0.01, dl: 0.1, l: 1, 'cm³': 0.001, 'dm³': 1, 'm³': 1000 };
  const MASS = { g: 0.001, kg: 1, t: 1000 };
  function conv(table, pairs, values) {
    const [from, to] = pick(pairs);
    const v = pick(values);
    const res = v * table[from] / table[to];
    return { type: 'number', unit: to, q: `Rechne um: ${fmt(v, 6)} ${from} = ? ${to}`, answer: U.round(res, 9), tol: Math.abs(res) * 1e-9,
      explain: `1 ${from} = ${fmt(table[from] / table[to], 9)} ${to}. Also ${fmt(v, 6)} ${from} = ${fmt(res, 9)} ${to}.` };
  }
  G.einheiten = [
    () => conv(LEN, [['m', 'cm'], ['km', 'm'], ['cm', 'mm'], ['mm', 'cm'], ['cm', 'm'], ['m', 'km'], ['dm', 'cm'], ['km', 'cm']], [0.5, 1.2, 2.5, 3, 4.75, 12, 35, 250, 0.08, 7.4]),
    () => conv(AREA, [['m²', 'cm²'], ['cm²', 'm²'], ['ha', 'm²'], ['m²', 'a'], ['km²', 'ha'], ['a', 'm²'], ['dm²', 'cm²']], [0.5, 1.5, 2, 3.2, 12, 40, 250, 0.75]),
    () => conv(VOL, [['l', 'dl'], ['dl', 'l'], ['l', 'ml'], ['m³', 'l'], ['cm³', 'ml'], ['l', 'cm³'], ['dm³', 'l'], ['cl', 'dl']], [0.5, 1.5, 2, 3.5, 7.5, 12, 25, 250, 0.2]),
    () => conv(MASS, [['kg', 'g'], ['g', 'kg'], ['t', 'kg'], ['kg', 't']], [0.25, 0.8, 1.5, 3, 12.5, 250, 750, 1200]),
    () => {
      if (rand(0, 1)) {
        const h = rand(1, 4), m = rand(1, 59);
        return { type: 'number', unit: 'min', q: `Wie viele Minuten sind ${h} h ${m} min?`, answer: h * 60 + m, explain: `${h} · 60 + ${m} = ${h * 60 + m} min.` };
      }
      const m = pick([15, 30, 45, 75, 90, 105, 135, 150, 210]);
      return { type: 'number', unit: 'h', q: `Wie viele Stunden sind ${m} min (als Dezimalzahl)?`, answer: m / 60,
        explain: `${m} : 60 = ${fmt(m / 60)} h. Merke: 15 min = 0.25 h, 30 min = 0.5 h, 45 min = 0.75 h.` };
    }
  ];

  G.funktionen = [
    () => {
      const m = randNZ(-5, 5), q = rand(-10, 10), x = rand(-6, 6);
      return { type: 'number', q: `Gegeben ist die Funktion y = ${poly([[m, 'x'], [q, '']])}. Berechne y für x = ${fmt(x)}.`, answer: m * x + q,
        explain: `Einsetzen: y = ${fmt(m)} · ${par(x)} ${q < 0 ? M : '+'} ${Math.abs(q)} = ${fmt(m * x + q)}.` };
    },
    () => {
      const m = randNZ(-4, 4), q = rand(-8, 8), x1 = rand(-5, 2), x2 = x1 + rand(1, 5);
      const y1 = m * x1 + q, y2 = m * x2 + q;
      return { type: 'number', q: `Eine Gerade geht durch die Punkte P(${fmt(x1)} | ${fmt(y1)}) und Q(${fmt(x2)} | ${fmt(y2)}). Wie gross ist ihre Steigung m?`, answer: m,
        explain: `m = (y₂ ${M} y₁) : (x₂ ${M} x₁) = (${fmt(y2)} ${M} ${par(y1)}) : (${fmt(x2)} ${M} ${par(x1)}) = ${fmt(y2 - y1)} : ${x2 - x1} = ${fmt(m)}.` };
    },
    () => {
      const r = rand(-6, 6), m = randNZ(-4, 4), q = -m * r;
      return { type: 'number', q: `Bei welchem x schneidet die Gerade y = ${poly([[m, 'x'], [q, '']])} die x-Achse (Nullstelle)?`, answer: r, hint: 'x = ?',
        explain: `Nullstelle: y = 0 setzen. ${poly([[m, 'x'], [q, '']])} = 0 → ${mono(m, 'x', true)} = ${fmt(-q)} → x = ${fmt(r)}.` };
    },
    () => {
      const m = randNZ(-4, 4), q = rand(-9, 9);
      return U.mc(`m = ${fmt(m)}, q = ${fmt(q)}`, [`m = ${fmt(q)}, q = ${fmt(m)}`, `m = ${fmt(-m)}, q = ${fmt(q)}`, `m = ${fmt(m)}, q = ${fmt(-q)}`, `m = ${fmt(m + 1)}, q = ${fmt(q)}`],
        { q: `Bestimme Steigung m und y-Achsenabschnitt q der Geraden y = ${poly([[m, 'x'], [q, '']])}.`,
          explain: `In y = m · x + q ist m die Zahl vor dem x (Steigung) und q die Zahl allein (Schnittpunkt mit der y-Achse).` });
    }
  ];

  /* ---------- Feste Aufgaben ---------- */
  const items = [
    { id: 'm-z1', topic: 'zahlen', type: 'mc', q: 'Welche Zahl ist eine Primzahl?', options: ['51', '57', '59', '91'], answer: 2,
      explain: '51 = 3 · 17, 57 = 3 · 19, 91 = 7 · 13. Nur 59 hat keine Teiler ausser 1 und sich selbst.' },
    { id: 'm-z2', topic: 'zahlen', type: 'mc', q: 'Welche Zahl ist durch 9 teilbar?', options: ['4’518', '2’347', '5’612', '7’105'], answer: 0,
      explain: 'Eine Zahl ist durch 9 teilbar, wenn ihre Quersumme durch 9 teilbar ist: 4 + 5 + 1 + 8 = 18 ✓.' },
    { id: 'm-z3', topic: 'zahlen', type: 'mc', q: 'Welche Zahl ist durch 4 teilbar?', options: ['1’318', '2’574', '3’716', '5’102'], answer: 2,
      explain: 'Durch 4 teilbar, wenn die letzten zwei Ziffern durch 4 teilbar sind: 16 : 4 = 4 ✓ (18, 74, 02 nicht).' },
    { id: 'm-z4', topic: 'zahlen', type: 'mc', q: 'Zwei Busse fahren gleichzeitig ab. Bus A fährt alle 12 Minuten, Bus B alle 18 Minuten. Nach wie vielen Minuten fahren sie wieder gleichzeitig ab?', options: ['30', '36', '72', '216'], answer: 1,
      explain: 'Gesucht ist das kgV(12, 18) = 36.' },

    { id: 'm-t1', topic: 'textaufgaben', type: 'number', q: 'In einer Klasse mit 24 Lernenden kommen 3/8 mit dem Velo zur Schule. Wie viele Lernende kommen <b>nicht</b> mit dem Velo?', answer: 15,
      explain: '3/8 von 24 = 24 : 8 · 3 = 9 mit dem Velo. 24 − 9 = 15 nicht mit dem Velo.' },
    { id: 'm-t2', topic: 'textaufgaben', type: 'number', unit: 'CHF', q: 'Ein Velo kostet CHF 840. Im Ausverkauf gibt es 15 % Rabatt. Wie viel kostet das Velo jetzt (in CHF)?', answer: 714,
      explain: '100 % − 15 % = 85 %. 840 · 0.85 = 714 CHF.' },
    { id: 'm-t3', topic: 'textaufgaben', type: 'number', unit: 'Jahre', q: 'Lisa ist 4 Jahre älter als Tom. Zusammen sind sie 30 Jahre alt. Wie alt ist Tom?', answer: 13,
      explain: 'Tom = x, Lisa = x + 4. x + x + 4 = 30 → 2x = 26 → x = 13.' },
    { id: 'm-t4', topic: 'textaufgaben', type: 'number', unit: 'cm²', q: 'Ein Rechteck ist dreimal so lang wie breit. Sein Umfang beträgt 64 cm. Berechne die Fläche in cm².', answer: 192,
      explain: 'Breite b, Länge 3b. U = 2 · (3b + b) = 8b = 64 → b = 8 cm, Länge 24 cm. A = 8 · 24 = 192 cm².' },
    { id: 'm-t5', topic: 'textaufgaben', type: 'number', unit: 'km/h', q: 'Ein Zug fährt um 13:45 Uhr ab und kommt um 15:10 Uhr an. Die Strecke ist 102 km lang. Berechne die Durchschnittsgeschwindigkeit in km/h.', answer: 72,
      explain: 'Fahrzeit 1 h 25 min = 85 min = 85/60 h. v = 102 : (85/60) = 102 · 60 : 85 = 72 km/h.' },
    { id: 'm-t6', topic: 'textaufgaben', type: 'number', q: 'Die Summe von drei aufeinanderfolgenden natürlichen Zahlen ist 132. Wie heisst die kleinste dieser Zahlen?', answer: 43,
      explain: 'x + (x + 1) + (x + 2) = 132 → 3x + 3 = 132 → 3x = 129 → x = 43 (43 + 44 + 45 = 132).' },
    { id: 'm-t7', topic: 'textaufgaben', type: 'number', unit: 'l', q: 'Ein Schwimmbecken ist 25 m lang, 12 m breit und 1.8 m tief. Wie viele Liter Wasser fasst es, wenn es ganz gefüllt ist?', answer: 540000,
      explain: 'V = 25 · 12 · 1.8 = 540 m³. 1 m³ = 1000 l → 540’000 l.' },
    { id: 'm-t8', topic: 'textaufgaben', type: 'number', unit: 'CHF', q: 'Ein Handy kostet nach einer Preiserhöhung von 20 % CHF 360. Wie viel kostete es vorher (in CHF)?', answer: 300,
      explain: '360 CHF entsprechen 120 %. 1 % = 3 CHF, 100 % = 300 CHF. Achtung: Nicht 20 % von 360 abziehen!' },
    { id: 'm-t9', topic: 'textaufgaben', type: 'number', unit: 'm', q: 'Eine 5 m lange Leiter steht 1.4 m von einer Wand entfernt. Wie hoch reicht die Leiter an der Wand hinauf (in m)?', answer: 4.8, tol: 0.001,
      explain: 'Pythagoras: h² = 5² − 1.4² = 25 − 1.96 = 23.04. h = √23.04 = 4.8 m.' },
    { id: 'm-t10', topic: 'textaufgaben', type: 'number', unit: 'l', q: 'Ein Auto verbraucht 6.5 Liter Benzin auf 100 km. Wie viele Liter braucht es für 340 km?', answer: 22.1, tol: 0.001,
      explain: 'Pro km: 6.5 : 100 = 0.065 l. 340 · 0.065 = 22.1 l.' },
    { id: 'm-t11', topic: 'textaufgaben', type: 'number', q: 'In einem Kino sind 3/5 der Plätze besetzt. 84 Plätze sind noch frei. Wie viele Plätze hat das Kino insgesamt?', answer: 210,
      explain: 'Frei sind 2/5 der Plätze = 84. 1/5 = 42, 5/5 = 210.' },
    { id: 'm-t12', topic: 'textaufgaben', type: 'number', q: 'Ein Erwachsenenticket kostet CHF 12, ein Kinderticket CHF 7. Eine Gruppe von 15 Personen bezahlt zusammen CHF 140. Wie viele Kinder sind in der Gruppe?', answer: 8,
      explain: 'Kinder k, Erwachsene 15 − k. 12 · (15 − k) + 7k = 140 → 180 − 5k = 140 → k = 8.' },
    { id: 'm-t13', topic: 'textaufgaben', type: 'number', unit: 'h', q: 'Eine Malerin braucht für eine Wand 6 Stunden, ihr Kollege allein 3 Stunden. Wie viele Stunden brauchen sie zusammen?', answer: 2,
      explain: 'Pro Stunde schaffen sie 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2 der Wand. Für die ganze Wand brauchen sie 2 Stunden.' },
    { id: 'm-t14', topic: 'textaufgaben', type: 'number', q: 'Sara hat die Noten 4.5, 5, 3.5 und 5.5. Welche Note braucht sie in der 5. Prüfung, damit ihr Durchschnitt genau 4.8 beträgt?', answer: 5.5, tol: 0.001,
      explain: 'Für einen Schnitt von 4.8 bei 5 Noten braucht sie die Summe 5 · 4.8 = 24. Bisher: 4.5 + 5 + 3.5 + 5.5 = 18.5. Fehlt: 24 − 18.5 = 5.5.' },
    { id: 'm-t15', topic: 'textaufgaben', type: 'number', unit: 'CHF', q: '2 kg Äpfel kosten CHF 7.60. Wie viel kosten 5 kg (in CHF)?', answer: 19, tol: 0.001,
      explain: '1 kg = 7.60 : 2 = 3.80 CHF. 5 kg = 5 · 3.80 = 19 CHF.' },
    { id: 'm-t16', topic: 'textaufgaben', type: 'number', unit: 'min', q: 'Ein Wasserhahn füllt eine Badewanne in 12 Minuten, ein zweiter in 6 Minuten. Wie lange dauert es, wenn beide gleichzeitig laufen (in Minuten)?', answer: 4,
      explain: 'Pro Minute: 1/12 + 1/6 = 1/12 + 2/12 = 3/12 = 1/4 der Wanne. Also 4 Minuten.' },

    { id: 'm-g1', topic: 'geometrie', type: 'mc', q: 'Wie gross ist die Winkelsumme in einem Viereck?', options: ['180°', '270°', '360°', '540°'], answer: 2,
      explain: 'Ein Viereck lässt sich durch eine Diagonale in zwei Dreiecke teilen: 2 · 180° = 360°.' },
    { id: 'm-g2', topic: 'geometrie', type: 'mc', q: 'Ein Würfel hat die Kantenlänge 3 cm. Wie gross ist seine Oberfläche?', options: ['27 cm²', '36 cm²', '54 cm²', '81 cm²'], answer: 2,
      explain: '6 Quadrate à 3 · 3 = 9 cm²: 6 · 9 = 54 cm². (27 cm³ wäre das Volumen.)' },
    { id: 'm-g3', topic: 'geometrie', type: 'mc', q: 'Was passiert mit der Fläche eines Quadrats, wenn man die Seitenlänge verdoppelt?', options: ['Sie verdoppelt sich.', 'Sie verdreifacht sich.', 'Sie vervierfacht sich.', 'Sie bleibt gleich.'], answer: 2,
      explain: '(2a)² = 4a². Die Fläche wird viermal so gross.' },

    { id: 'm-f1', topic: 'funktionen', type: 'mc', q: 'Welche Aussage über die Gerade y = −2x + 3 stimmt?', options: ['Sie steigt und schneidet die y-Achse bei 3.', 'Sie fällt und schneidet die y-Achse bei 3.', 'Sie fällt und schneidet die y-Achse bei −2.', 'Sie steigt und schneidet die y-Achse bei −2.'], answer: 1,
      explain: 'Die Steigung m = −2 ist negativ → die Gerade fällt. Der y-Achsenabschnitt ist q = 3.' }
  ];

  const merkblatt = `
<h3>Rechenregeln</h3>
<ul><li>Klammern zuerst, dann Potenzen, dann Punkt (· :) vor Strich (+ −).</li>
<li>Gleichrangige Rechnungen von links nach rechts.</li>
<li>Vorzeichen: (+)·(+) = +, (−)·(−) = +, (+)·(−) = −.</li></ul>
<h3>Brüche</h3>
<ul><li>Addieren/Subtrahieren: gleichnamig machen (Hauptnenner), dann Zähler rechnen.</li>
<li>Multiplizieren: Zähler · Zähler, Nenner · Nenner.</li>
<li>Dividieren: mit dem Kehrwert multiplizieren.</li>
<li>Kürzen: Zähler und Nenner durch den ggT teilen.</li></ul>
<h3>Prozent</h3>
<ul><li>Prozentwert W = G · p / 100</li><li>Prozentsatz p = W / G · 100</li><li>Grundwert G = W / p · 100</li>
<li>Rabatt 20 % → neuer Preis = 80 % = · 0.8 &nbsp;|&nbsp; Erhöhung 20 % → · 1.2</li></ul>
<h3>Potenzen &amp; Wurzeln</h3>
<ul><li>a<sup>m</sup> · a<sup>n</sup> = a<sup>m+n</sup> &nbsp; a<sup>m</sup> : a<sup>n</sup> = a<sup>m−n</sup> &nbsp; (a<sup>m</sup>)<sup>n</sup> = a<sup>m·n</sup></li>
<li>a<sup>0</sup> = 1, a<sup>−n</sup> = 1 / a<sup>n</sup></li>
<li>Quadratzahlen bis 20² = 400 auswendig können!</li></ul>
<h3>Binomische Formeln</h3>
<ul><li>(a + b)² = a² + 2ab + b²</li><li>(a − b)² = a² − 2ab + b²</li><li>(a + b)(a − b) = a² − b²</li></ul>
<h3>Gleichungen</h3>
<ul><li>Auf beiden Seiten immer das Gleiche tun.</li><li>Klammern auflösen → x auf eine Seite, Zahlen auf die andere → durch die Zahl vor x teilen.</li>
<li>Probe: Lösung in die Gleichung einsetzen.</li></ul>
<h3>Lineare Funktion y = m·x + q</h3>
<ul><li>m = Steigung = (y₂ − y₁) / (x₂ − x₁); m &gt; 0 steigt, m &lt; 0 fällt.</li><li>q = Schnittpunkt mit der y-Achse.</li><li>Nullstelle: y = 0 setzen.</li></ul>
<h3>Proportionalität</h3>
<ul><li>Proportional: doppelt so viel → doppelt so teuer (Quotient konstant).</li>
<li>Umgekehrt proportional: doppelt so viele Personen → halb so lang (Produkt konstant).</li>
<li>Weg = Geschwindigkeit · Zeit (s = v · t)</li></ul>
<h3>Geometrie</h3>
<ul><li>Rechteck: A = a · b, U = 2(a + b) &nbsp;|&nbsp; Quadrat: A = a², U = 4a</li>
<li>Dreieck: A = g · h / 2, Winkelsumme 180°</li><li>Trapez: A = (a + c) / 2 · h &nbsp;|&nbsp; Parallelogramm: A = g · h</li>
<li>Kreis: U = 2πr = πd, A = πr²</li><li>Pythagoras (rechtwinklig): a² + b² = c² (c = Hypotenuse, gegenüber dem rechten Winkel)</li>
<li>Quader: V = a · b · c &nbsp;|&nbsp; Zylinder: V = πr² · h</li></ul>
<h3>Masseinheiten</h3>
<ul><li>Länge: 1 km = 1000 m, 1 m = 10 dm = 100 cm = 1000 mm (Faktor 10)</li>
<li>Fläche: 1 m² = 100 dm² = 10’000 cm², 1 a = 100 m², 1 ha = 100 a = 10’000 m², 1 km² = 100 ha (Faktor 100)</li>
<li>Volumen: 1 m³ = 1000 dm³ = 1000 l, 1 dm³ = 1 l, 1 cm³ = 1 ml (Faktor 1000); 1 l = 10 dl = 100 cl = 1000 ml</li>
<li>Zeit: 1 h = 60 min, 0.25 h = 15 min, 0.75 h = 45 min</li></ul>`;

  BMP.subjects.push({
    id: 'mathe', name: 'Mathematik', icon: '∑', color: 'var(--c-mathe)', badge: 'zählt doppelt',
    intro: 'Rechnen, Algebra, Geometrie und Textaufgaben. Die meisten Aufgaben werden zufällig neu erzeugt – du kannst also beliebig oft üben.',
    topics: [
      { id: 'grundop', name: 'Grundoperationen', desc: 'Rechenregeln, negative Zahlen, Mittelwert' },
      { id: 'zahlen', name: 'Teilbarkeit', desc: 'ggT, kgV, Primzahlen' },
      { id: 'brueche', name: 'Brüche', desc: 'Rechnen mit Brüchen, Dezimalbrüche' },
      { id: 'potenzen', name: 'Potenzen & Wurzeln', desc: 'Potenzgesetze, Zehnerpotenzen' },
      { id: 'terme', name: 'Terme', desc: 'Vereinfachen, ausmultiplizieren, ausklammern' },
      { id: 'gleichungen', name: 'Gleichungen', desc: 'Lineare Gleichungen lösen' },
      { id: 'funktionen', name: 'Lineare Funktionen', desc: 'Steigung, Achsenabschnitt, Nullstelle' },
      { id: 'prozent', name: 'Prozent & Zins', desc: 'Prozentwert, -satz, Grundwert, Rabatt' },
      { id: 'dreisatz', name: 'Proportionalität', desc: 'Dreisatz, Geschwindigkeit, Massstab' },
      { id: 'geometrie', name: 'Geometrie', desc: 'Flächen, Umfang, Volumen, Pythagoras' },
      { id: 'einheiten', name: 'Masseinheiten', desc: 'Länge, Fläche, Volumen, Masse, Zeit' },
      { id: 'textaufgaben', name: 'Textaufgaben', desc: 'Sachaufgaben aus dem Alltag' }
    ],
    items, generators: G, merkblatt,
    exam: { count: 20, minutes: 45 }
  });

  BMP._mathHelpers = { poly, mono };
})(typeof window !== 'undefined' ? window : globalThis);
