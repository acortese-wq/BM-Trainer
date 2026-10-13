/* BM-Trainer – Beurteilung von Schreibaufgaben
   1) Automatische Textanalyse (offline, regelbasiert): Umfang, Aufbau, Satzbau, Wortschatz, typische Fehler
   2) Kriterienraster mit Note 1–6 (Punkte werden vorgeschlagen, Mensch entscheidet) */
(function (root) {
  'use strict';
  const BMP = root.BMP;

  const DE_FIX = { standart: 'Standard', reperatur: 'Reparatur', 'nähmlich': 'nämlich', eigendlich: 'eigentlich', maschiene: 'Maschine',
    rythmus: 'Rhythmus', rhytmus: 'Rhythmus', wiederspruch: 'Widerspruch', wiedersprechen: 'widersprechen', garnicht: 'gar nicht',
    vorallem: 'vor allem', bischen: 'bisschen', warscheinlich: 'wahrscheinlich', 'entgültig': 'endgültig', ingeneur: 'Ingenieur',
    interresse: 'Interesse', intresse: 'Interesse', ziehmlich: 'ziemlich', tollerant: 'tolerant', packet: 'Paket', seperat: 'separat',
    addresse: 'Adresse', gallerie: 'Galerie', sylvester: 'Silvester', villeicht: 'vielleicht', vieleicht: 'vielleicht', aufjedenfall: 'auf jeden Fall',
    standpunkt: null };
  delete DE_FIX.standpunkt;
  // Gross-/Kleinschreibung des Originals übernehmen (Satzanfang)
  const fixCase = (orig, fix) => /^[A-ZÄÖÜ]/.test(orig) ? fix[0].toUpperCase() + fix.slice(1) : fix;

  const LANG = {
    deutsch: {
      stop: 'der die das den dem des ein eine einen einem einer eines und oder aber ich du er sie es wir ihr man mich mir dich dir sich uns euch ist sind war waren bin bist hat haben hatte hatten wird werden wurde kann können muss müssen will wollen soll sollen nicht auch noch schon sehr nur mit von zu im in an auf aus bei für über unter vor nach als wie wenn weil dass so dann da hier mein meine dein deine sein seine ihr ihre unser unsere was wer wo diese dieser dieses diesem diesen jetzt immer mehr viel viele alle alles etwas',
      connectors: ['weil', 'denn', 'deshalb', 'deswegen', 'darum', 'trotzdem', 'obwohl', 'ausserdem', 'jedoch', 'allerdings', 'zuerst', 'danach', 'anschliessend', 'schliesslich', 'zum schluss', 'einerseits', 'andererseits', 'zum beispiel', 'beispielsweise', 'dass', 'damit', 'sodass', 'während', 'zudem', 'folglich', 'im gegensatz', 'meiner meinung nach', 'zusammenfassend', 'nämlich', 'als', 'nachdem', 'bevor'],
      checks: [
        { re: /ß/g, msg: 'In der Schweiz schreibt man «ss» statt «ß».' },
        { re: /([A-Za-zÄÖÜäöü]+)\s+(dass|weil|obwohl|damit|sodass|nachdem|bevor|ob)\b/g, msg: m => `Komma vor «${m[2]}»? Nebensätze werden mit Komma abgetrennt.`, ctx: true,
          filter: m => !['und', 'oder', 'aber', 'sondern', 'so', 'ohne', 'als', 'nur', 'auch', 'gerade', 'denn', 'bzw'].includes(m[1].toLowerCase()) },
        { re: /,\s*das\s+(ich|du|er|sie|es|wir|ihr|man|mein|dein|sein|unser|euer|der|die|das|jemand|niemand)\b/gi, msg: '«, das ich …» – hier ist meist «dass» gemeint (Ersatzprobe: «welches» passt nicht).', ctx: true },
        { re: /\b(finde|finden|glaube|glauben|denke|denken|hoffe|hoffen|weiss|wissen|sagt|sagen|meine|meinen|zeigt|merke|merkte|wusste|dachte|hoffte|sicher)\s*,?\s+das\s+(ich|du|er|sie|es|wir|ihr|man|der|die|mein|meine|dein|unser|jemand|niemand|alle|viele)\b/gi,
          msg: '«… das ich …» nach «finden, glauben, hoffen, sagen …» – hier gehört «dass» hin (mit Komma davor).', ctx: true },
        { re: new RegExp('\\b(' + Object.keys(DE_FIX).join('|') + ')\\b', 'gi'),
          msg: m => `Rechtschreibung: «${m[1]}» → «${fixCase(m[1], DE_FIX[m[1].toLowerCase()])}»` },
        { re: /\bseit\s+(ihr|du)\b/gi, msg: '«seit ihr» – meinst du «seid ihr» (Verb sein)?', ctx: true },
        { re: /\b(beim|zum|vom)\s+([a-zäöü][a-zäöü]+en)\b/g, msg: m => `Nominalisierung? «${m[1]} ${m[2]}» – Verben als Nomen werden gross geschrieben (z. B. «beim Lesen»).`, ctx: true, filter: m => !['eigenen', 'anderen', 'nächsten', 'letzten', 'ersten', 'ganzen', 'meisten', 'besten', 'neuen', 'kleinen', 'grossen', 'guten', 'beiden', 'wenigen', 'vielen', 'folgenden', 'gleichen', 'jungen', 'alten'].includes(m[2]) },
        { re: /(?:^|[.!?]\s+)([a-zäöü])/g, msg: 'Satzanfang klein geschrieben – Satzanfänge immer gross.', ctx: true }
      ],
      starterHint: 'Viele Sätze beginnen gleich. Variiere: «Danach», «Plötzlich», «Am Abend», «Trotzdem» …'
    },
    englisch: {
      stop: 'the a an and or but i you he she it we they me him her us them my your his its our their is are was were be been am have has had do does did will would can could should must not to of in on at for with from by as that this these those there here so very also too just then than when because if what who which',
      connectors: ['because', 'so', 'but', 'however', 'although', 'first', 'firstly', 'then', 'after that', 'finally', 'in my opinion', 'i think', 'for example', 'for instance', 'on the one hand', 'on the other hand', 'also', 'moreover', 'in addition', 'that is why', 'therefore', 'while', 'when', 'in conclusion', 'to sum up', 'unless', 'as well'],
      checks: [
        { re: /(^|[^A-Za-z'])i(?=[\s'’,.!?])/g, msg: '«I» (ich) schreibt man im Englischen immer gross.', ctx: true },
        { re: /(?:\b([A-Za-z']+)\s+)?\b(he|she|it)\s+(go|like|want|play|have|do|live|work|say|make|think|need)\b/gi,
          msg: m => `he/she/it + «-s»: «${m[2]} ${m[3] === 'have' ? 'has' : m[3] === 'do' ? 'does' : m[3] === 'go' ? 'goes' : m[3] + 's'}».`, ctx: true,
          filter: m => !m[1] || !['does', 'did', 'doesn\'t', 'didn\'t', 'can', 'can\'t', 'will', 'won\'t', 'would', 'should', 'could', 'must', 'may', 'might', 'let', 'make', 'to'].includes(m[1].toLowerCase()) },
        { re: /\b(more better|more easier|most best|peoples|informations|advices|homeworks|since (\d+|two|three|four|five) (years|months|weeks|days))\b/gi, msg: m => `Prüfen: «${m[1]}» – ${/^since/i.test(m[1]) ? 'bei einer Zeitdauer «for» (for two years), «since» nur bei einem Zeitpunkt.' : /more better|more easier|most best/i.test(m[1]) ? 'doppelte Steigerung (better, easier, best).' : 'dieses Nomen hat im Englischen keinen Plural (people, information, advice, homework).'}`, ctx: true },
        { re: /\b(alot|becaus|definately|recieve|untill|wich|thats|dont|cant|didnt|isnt|wont|im)\b/gi, msg: m => `Schreibweise: «${m[1]}» → «${({ alot: 'a lot', becaus: 'because', definately: 'definitely', recieve: 'receive', untill: 'until', wich: 'which', thats: "that's", dont: "don't", cant: "can't", didnt: "didn't", isnt: "isn't", wont: "won't", im: "I'm" })[m[1].toLowerCase()]}»` },
        { re: /\b(yesterday|last (week|year|month|summer|weekend)|ago)\b[^.!?]*\b(have|has) (been|gone|seen|done|made|had|visited|played)\b|\b(have|has) (been|gone|seen|done|made|had|visited|played)\b[^.!?]*\b(yesterday|last (week|year|month|summer|weekend)|ago)\b/gi, msg: 'Mit «yesterday / last … / ago» steht das Past simple, nicht das Present perfect.', ctx: true },
        { re: /(?:^|[.!?]\s+)([a-z])/g, msg: 'Satzanfang klein geschrieben – Satzanfänge immer gross.', ctx: true }
      ],
      starterHint: 'Many sentences start the same way. Try: «Then», «After that», «Luckily», «In the evening» …'
    },
    italienisch: {
      stop: 'il lo la i gli le un uno una e o ma io tu lui lei noi voi loro mi ti si ci vi è sono era erano ho hai ha abbiamo avete hanno di a da in con su per tra fra che non anche molto poi quando perché come più mio mia tuo tua suo sua questo questa quello quella',
      connectors: ['perché', 'poi', 'dopo', 'prima', 'quando', 'però', 'ma', 'anche', 'infatti', 'quindi', 'allora', 'invece', 'mentre', 'secondo me', 'per esempio', 'alla fine', 'inoltre', 'comunque', 'siccome', 'dunque'],
      checks: [
        { re: /\b(perche|piu|citta|puo|gia|cosi|lunedi|martedi|mercoledi|giovedi|venerdi|universita|perchè|benchè|poichè|affinchè)\b/gi, msg: m => `Accento: «${m[1]}» → «${({ perche: 'perché', piu: 'più', citta: 'città', puo: 'può', gia: 'già', cosi: 'così', lunedi: 'lunedì', martedi: 'martedì', mercoledi: 'mercoledì', giovedi: 'giovedì', venerdi: 'venerdì', universita: 'università', 'perchè': 'perché', 'benchè': 'benché', 'poichè': 'poiché', 'affinchè': 'affinché' })[m[1].toLowerCase()]}»` },
        { re: /\b(qual['’]è)/gi, msg: '«qual è» si scrive senza apostrofo.' },
        { re: /\bun['’](amico|albero|anno|orologio|uomo|esempio|ospedale|ufficio)\b/gi, msg: m => `«un ${m[1]}» – al maschile niente apostrofo.` },
        { re: /(^|\s)[eE]['’]\s/g, msg: '«e\'» → «è» (verbo essere con l\'accento).' },
        { re: /(?:^|[.!?]\s+)([a-zàèéìòù])/g, msg: 'Inizio frase con la minuscola – usa la maiuscola.', ctx: true }
      ],
      starterHint: 'Molte frasi iniziano allo stesso modo. Prova: «Poi», «Dopo», «Alla fine», «Purtroppo» …'
    }
  };

  const words = t => (t.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9’'-]+/g) || []);

  function analyze(text, subjectId, task) {
    const L = LANG[subjectId] || LANG.deutsch;
    const t = String(text || '');
    const ws = words(t);
    const nWords = ws.length;
    const paragraphs = t.split(/\n\s*\n|\n(?=\s*\S)/).map(p => p.trim()).filter(p => words(p).length >= 5);
    const sentences = t.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(x => words(x).length > 0);
    const sLens = sentences.map(x => words(x).length);
    const avg = sLens.length ? sLens.reduce((a, b) => a + b, 0) / sLens.length : 0;
    const longS = sentences.filter((x, k) => sLens[k] > 30);

    // Wortwiederholungen (Inhaltswörter)
    const stop = new Set(L.stop.split(' '));
    const freq = {};
    for (const w of ws) {
      const k = w.toLowerCase().replace(/['’]/g, '');
      if (k.length < 4 || stop.has(k) || /^\d+$/.test(k)) continue;
      freq[k] = (freq[k] || 0) + 1;
    }
    const repLimit = nWords > 250 ? 5 : 4;
    const repeats = Object.entries(freq).filter(([, n]) => n >= repLimit).sort((a, b) => b[1] - a[1]).slice(0, 6);

    // Satzanfänge
    const st = {};
    for (const s of sentences) { const f = (words(s)[0] || '').toLowerCase(); if (f) st[f] = (st[f] || 0) + 1; }
    const starters = Object.entries(st).filter(([, n]) => n >= 3 && n / Math.max(1, sentences.length) >= 0.25).sort((a, b) => b[1] - a[1]);

    // Verbindungswörter
    const lower = ' ' + t.toLowerCase().replace(/[^a-zà-öø-ÿ'’ ]+/g, ' ').replace(/\s+/g, ' ') + ' ';
    const conns = L.connectors.filter(c => lower.includes(' ' + c + ' '));

    // Typische Fehler
    const issues = [];
    for (const c of L.checks) {
      c.re.lastIndex = 0;
      let m, n = 0;
      while ((m = c.re.exec(t)) && n < 4) {
        if (m[0] === '') { c.re.lastIndex++; continue; }
        if (c.filter && !c.filter(m)) continue;
        n++;
        const from = Math.max(0, m.index - 25), to = Math.min(t.length, m.index + m[0].length + 25);
        issues.push({ msg: typeof c.msg === 'function' ? c.msg(m) : c.msg, ctx: c.ctx ? (from > 0 ? '…' : '') + t.slice(from, to).replace(/\s+/g, ' ').trim() + (to < t.length ? '…' : '') : '' });
      }
    }

    // Vorschläge fürs Raster (0–3)
    const ratio = task && task.minWords ? nWords / task.minWords : 1;
    const needPar = subjectId === 'deutsch' ? 3 : 2;
    const sug = {};
    sug.aufbau = nWords < 20 ? 0 : Math.min(3, (paragraphs.length >= needPar ? 2 : paragraphs.length >= 2 ? 1 : 0) + (conns.length >= 4 ? 1 : 0));
    sug.sprache = nWords < 20 ? 0 : Math.max(0, Math.min(3, 3 - (repeats.length >= 3 ? 1 : 0) - (starters.length ? 1 : 0) - (longS.length >= 2 || (avg && avg < 6) ? 1 : 0) + (conns.length >= 6 ? 1 : 0)));
    const errRate = nWords ? issues.length / nWords * 100 : 99;
    sug.richtigkeit = nWords < 20 ? 0 : errRate <= 0.8 ? 3 : errRate <= 2.5 ? 2 : errRate <= 4.5 ? 1 : 0; // Fehler pro 100 Wörter
    sug.form = ratio >= 0.95 ? 3 : ratio >= 0.8 ? 2 : ratio >= 0.5 ? 1 : 0;

    return { words: nWords, ratio, paragraphs: paragraphs.length, needPar, sentences: sentences.length, avg, longS, repeats, starters, conns, issues, sug, starterHint: L.starterHint };
  }

  /* Kriterienraster: Inhalt zählt doppelt */
  const RUBRIC = [
    { id: 'inhalt', name: 'Inhalt', weight: 2, auto: false, levels: ['Thema verfehlt / kaum Inhalt', 'Thema teilweise erfüllt, wenig Ideen', 'Thema erfüllt, gute Ideen mit Beispielen', 'Thema vollständig, überzeugende Ideen, Beispiele, eigene Meinung'] },
    { id: 'aufbau', name: 'Aufbau', weight: 1, auto: true, levels: ['kein erkennbarer Aufbau', 'Aufbau teilweise erkennbar', 'Einleitung, Hauptteil, Schluss; Absätze', 'klarer roter Faden, gute Übergänge'] },
    { id: 'sprache', name: 'Sprache & Ausdruck', weight: 1, auto: true, levels: ['sehr einfach, viele Wiederholungen', 'eher eintönig', 'abwechslungsreich, passende Wörter', 'treffend, vielfältiger Satzbau'] },
    { id: 'richtigkeit', name: 'Sprachrichtigkeit', weight: 1, auto: true, levels: ['sehr viele Fehler', 'viele Fehler', 'wenige Fehler', 'fast fehlerfrei'] },
    { id: 'form', name: 'Form & Umfang', weight: 1, auto: true, levels: ['viel zu kurz / Textsorte verfehlt', 'zu kurz oder Form mangelhaft', 'Umfang und Textsorte stimmen', 'Umfang, Textsorte und Form vorbildlich'] }
  ];
  const MAX = RUBRIC.reduce((a, r) => a + 3 * r.weight, 0);
  function grade(scores) {
    const pts = RUBRIC.reduce((a, r) => a + (Number(scores[r.id]) || 0) * r.weight, 0);
    return { pts, max: MAX, grade: BMP.grade(pts, MAX) };
  }

  BMP.writing = { analyze, RUBRIC, grade };
})(typeof window !== 'undefined' ? window : globalThis);
