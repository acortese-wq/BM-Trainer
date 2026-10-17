/* Prüft Inhalte und Antwortlogik des BM-Trainers.  Ausführen: node --test tests/ */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { console, Math, Date, Number, String, Array, Object, JSON, Set };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['js/core.js', 'js/data/mathe.js', 'js/data/deutsch.js', 'js/data/englisch.js', 'js/data/hoeren.js', 'js/data/italienisch.js', 'js/data/reglement.js', 'js/data/sprueche.js', 'js/data/originale.js', 'js/motivation.js', 'js/speech.js', 'js/writing.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const BMP = ctx.BMP;
const RUNS = 300;

/* Eingabe, die eine Schülerin für die Musterlösung tippen würde */
function solutionInput(item) {
  switch (item.type) {
    case 'mc': return String(item.answer);
    case 'fraction': return item.answer[0] + '/' + item.answer[1];
    case 'number': return String(Array.isArray(item.answer) ? item.answer[0] : item.answer);
    default: return Array.isArray(item.answer) ? item.answer[0] : item.answer;
  }
}

function validate(item, where) {
  assert.ok(typeof item.q === 'string' && item.q.length > 3, `${where}: Frage fehlt`);
  assert.ok(!/undefined|NaN|\[object/.test(item.q), `${where}: kaputte Frage «${item.q}»`);
  if (item.explain) assert.ok(!/undefined|NaN|\[object/.test(item.explain), `${where}: kaputte Erklärung «${item.explain}»`);
  assert.ok(['mc', 'number', 'fraction', 'text'].includes(item.type), `${where}: unbekannter Typ ${item.type}`);
  if (item.type === 'mc') {
    assert.ok(item.options.length >= 2, `${where}: zu wenige Optionen`);
    assert.strictEqual(new Set(item.options).size, item.options.length, `${where}: doppelte Optionen ${JSON.stringify(item.options)}`);
    assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.options.length, `${where}: Lösungsindex ungültig`);
  }
  if (item.type === 'number') {
    const a = Array.isArray(item.answer) ? item.answer : [item.answer];
    a.forEach(x => assert.ok(Number.isFinite(x), `${where}: Lösung keine Zahl`));
  }
  if (item.type === 'fraction') assert.ok(item.answer[1] !== 0, `${where}: Nenner 0`);
  const res = BMP.check(item, solutionInput(item));
  assert.ok(res.ok, `${where}: Musterlösung wird nicht akzeptiert («${item.q}» → ${solutionInput(item)})`);
}

test('alle Fächer und Themen haben Aufgaben', () => {
  assert.strictEqual(BMP.subjects.map(s => s.id).join(','), 'mathe,deutsch,englisch,italienisch');
  for (const s of BMP.subjects) {
    for (const t of s.topics) {
      const n = s.items.filter(i => i.topic === t.id).length + ((s.generators && s.generators[t.id]) || []).length;
      assert.ok(n > 0, `${s.id}/${t.id} hat keine Aufgaben`);
    }
    assert.ok(s.merkblatt && s.merkblatt.length > 100, `${s.id}: Merkblatt fehlt`);
  }
});

test('feste Aufgaben sind gültig und eindeutig', () => {
  const ids = new Set();
  for (const s of BMP.subjects) {
    const topicIds = new Set(s.topics.map(t => t.id));
    for (const it of s.items) {
      assert.ok(it.id, `${s.id}: Aufgabe ohne id`);
      assert.ok(!ids.has(it.id), `doppelte id ${it.id}`);
      ids.add(it.id);
      assert.ok(topicIds.has(it.topic), `${it.id}: unbekanntes Thema ${it.topic}`);
      validate(it, it.id);
    }
  }
});

test('Generatoren liefern gültige, lösbare Aufgaben', () => {
  for (const s of BMP.subjects) {
    for (const [topic, gens] of Object.entries(s.generators || {})) {
      assert.ok(s.topics.some(t => t.id === topic), `${s.id}: Generator für unbekanntes Thema ${topic}`);
      gens.forEach((g, k) => {
        for (let r = 0; r < RUNS; r++) validate(g(), `${s.id}/${topic}#${k}`);
      });
    }
  }
});

test('Deutsch: Schweizer Rechtschreibung ohne ß', () => {
  for (const s of BMP.subjects) {
    // d-r19 fragt bewusst nach «Straße» vs. «Strasse»
    const text = JSON.stringify(s.items.filter(i => i.id !== 'd-r19')) + s.merkblatt + JSON.stringify(s.writing || []) + JSON.stringify(s.checklist || []);
    assert.ok(!text.includes('ß'), `${s.id} enthält ß`);
  }
});

test('Antwortprüfung: Zahlen, Brüche, Text', () => {
  const num = { type: 'number', answer: 1234.5 };
  for (const g of ['1234.5', '1234,5', "1'234.5", '1’234.5', ' 1234.50 ']) assert.ok(BMP.check(num, g).ok, g);
  assert.ok(!BMP.check(num, '1235').ok);
  assert.ok(BMP.check({ type: 'number', answer: -4 }, '−4').ok);
  assert.ok(BMP.check({ type: 'number', answer: 12, unit: 'cm' }, '12 cm').ok);
  assert.ok(BMP.check({ type: 'number', answer: 90 }, '90°').ok);

  const fr = { type: 'fraction', answer: [3, 4] };
  assert.ok(BMP.check(fr, '3/4').ok);
  assert.ok(BMP.check(fr, '0.75').ok);
  assert.ok(BMP.check(fr, ' 3 / 4 ').ok);
  const r = BMP.check(fr, '6/8');
  assert.ok(r.ok && /kürzen/.test(r.note));
  assert.ok(BMP.check({ type: 'fraction', answer: [3, 2] }, '1 1/2').ok);
  assert.ok(BMP.check({ type: 'fraction', answer: [-5, 6] }, '-5/6').ok);
  assert.ok(!BMP.check(fr, '4/3').ok);

  const tx = { type: 'text', answer: ["They didn't go home"] };
  assert.ok(BMP.check(tx, 'they didn’t go home.').ok);
  assert.ok(BMP.check({ type: 'text', answer: ["dell'"] }, 'dell’').ok);
  assert.ok(BMP.check({ type: 'text', answer: ['Strasse'] }, 'Straße').ok);
  assert.ok(!BMP.check(tx, '').ok);
});

test('Note 1–6 und Ziehen von Aufgaben', () => {
  assert.strictEqual(BMP.grade(0, 20), 1);
  assert.strictEqual(BMP.grade(20, 20), 6);
  assert.strictEqual(BMP.grade(12, 20), 4);
  assert.strictEqual(BMP.grade(15, 20), 5);
  for (const s of BMP.subjects) {
    const all = BMP.draw(s, s.topics.map(t => t.id), s.exam.count);
    assert.strictEqual(all.length, s.exam.count, `${s.id}: Prüfung hat ${all.length} statt ${s.exam.count} Aufgaben`);
    for (const t of s.topics) assert.ok(BMP.draw(s, [t.id], 10).length >= 1);
  }
});

test('Motivation: Stufen, Hochrechnung, Tagestraining', () => {
  const M = BMP.motiv, st = BMP.store.state;
  assert.strictEqual(M.level(0).name, 'Schnupperlernende');
  assert.strictEqual(M.level(300).index, 1);
  assert.ok(M.level(999999).next === undefined);
  // Hochrechnung: Mathe doppelt, max. eine Note unter 4
  st.exams = [{ subject: 'mathe', grade: 4.5 }, { subject: 'deutsch', grade: 3.5 }, { subject: 'englisch', grade: 4 }];
  let p = M.projection();
  assert.ok(p.complete && Math.abs(p.avg - 4.125) < 1e-9 && p.passed);
  st.exams.push({ subject: 'englisch', grade: 3.5 });
  p = M.projection();
  assert.ok(!p.passed, 'zwei Noten unter 4 → nicht bestanden');
  st.exams.push({ subject: 'italienisch', grade: 1 });
  assert.strictEqual(M.projection().avg, p.avg, 'Italienisch zählt nicht');
  // Tagestraining nur aus Prüfungsfächern
  const mix = M.dailyMix(10);
  assert.strictEqual(mix.length, 10);
  assert.ok(mix.every(i => ['mathe', 'deutsch', 'englisch'].includes(i.subject)));
  mix.forEach(i => validate(i, 'dailyMix'));
  assert.ok(M.BADGES.every(b => typeof b.test() === 'boolean'));
});

test('Countdown: Phasen und Tagesziel passen sich an', () => {
  const M = BMP.motiv, st = BMP.store.state;
  st.examDate = '';
  assert.strictEqual(M.examDate(), '2027-03-16');
  const names = [200, 100, 45, 20, 5, 0, -3].map(d => M.phase(d).id).join(',');
  assert.strictEqual(names, 'basis,aufbau,endspurt,countdown,final,heute,vorbei');
  assert.strictEqual(M.daysLeft(new Date('2027-03-15T22:00:00')), 1);
  assert.strictEqual(M.daysLeft(new Date('2027-03-16T09:00:00')), 0);
  st.dailyGoal = 20; st.autoGoal = true;
  assert.ok(M.goal() >= 20);
  st.autoGoal = false;
  assert.strictEqual(M.goal(), 20);
});

test('Hörverständnis: vollständige Hörtexte mit Fragen', () => {
  const en = BMP.getSubject('englisch');
  assert.ok(en.topics.some(t => t.id === 'listening'));
  assert.ok(BMP.audioSets.length >= 8, 'mindestens 8 Hörtexte');
  for (const id of BMP.audioSets) {
    const qs = en.items.filter(i => i.audio && i.audio.id === id);
    assert.ok(qs.length >= 4, `${id}: zu wenige Fragen`);
    const a = qs[0].audio;
    assert.ok(a.lines.length >= 3 && a.lines.every(([w, t]) => ['A', 'B', 'N'].includes(w) && t.length > 10), `${id}: Hörtext ungültig`);
  }
  assert.ok(BMP.check({ type: 'text', digits: true, answer: ['079433562'] }, '0794 33 562').ok);
  assert.ok(en.exam.listening >= 1 && en.examFull.listening >= 2);
  for (const s of BMP.subjects) assert.ok(s.examFull && s.examFull.count >= s.exam.count, `${s.id}: Vollprüfung fehlt`);
  assert.ok(BMP.reglement.sections.length >= 3);
  assert.strictEqual(BMP.speech.supported, false, 'in Node keine Sprachausgabe');
});

test('Aufnahmereglement KV Chur: Geometrie und Hören nicht geprüft', () => {
  const m = BMP.getSubject('mathe'), e = BMP.getSubject('englisch');
  assert.ok(!BMP.examTopics(m).includes('geometrie'), 'Geometrie darf nicht geprüft werden (Art. 10)');
  assert.ok(!BMP.examTopics(e).includes('listening'));
  assert.ok(BMP.examTopics(m).length === m.topics.length - 1);
  for (let k = 0; k < 20; k++) assert.ok(BMP.motiv.dailyMix(10).every(i => !(i.subject === 'mathe' && i.topic === 'geometrie') && i.topic !== 'listening'));
  // Art. 11: halbe Noten; Art. 12: Schnitt ≥ 4 und höchstens eine ungenügende Note
  assert.strictEqual(BMP.grade(37, 50), 4.5);
  assert.ok(BMP.getSubject('mathe').items.filter(i => i.id === 'm-t9')[0].topic === 'geometrie');
});

test('Nebenrechnung: Formelrechner und Minuszahlen', () => {
  const c = BMP.calc;
  assert.strictEqual(c('3+4*2'), 11);
  assert.strictEqual(c('(3+4)·2'), 14);
  assert.strictEqual(c('−5−(−8)'), 3);
  assert.strictEqual(c('84:6×5'), 70);
  assert.strictEqual(c('3²+4²'), 25);
  assert.strictEqual(c('√144'), 12);
  assert.strictEqual(c('20%·350'), 70);
  assert.strictEqual(c('1’250,5+0.5'), 1251);
  assert.ok(Number.isNaN(c('5+')) && Number.isNaN(c('(1+2')) && Number.isNaN(c('alert(1)')));
  assert.ok(BMP.check({ type: 'number', answer: -3 }, '-3').ok);
  assert.ok(BMP.check({ type: 'number', answer: 0.5 }, '1/2').ok);
});

test('Kurzantworten: nur die geänderten Wörter genügen', () => {
  const find = id => { for (const s of BMP.subjects) { const i = s.items.find(x => x.id === id); if (i) return Object.assign({ subject: s.id }, i); } };
  const ok = (id, g) => BMP.check(find(id), g).ok;
  // Satzumformungen: Kurzform oder ganzer Satz
  assert.ok(ok('d-z8', 'brachte') && ok('d-z8', 'Er brachte das Paket.'));
  assert.ok(!ok('d-z8', 'bringte'));
  assert.ok(ok('d-z11', 'bin geschwommen') && !ok('d-z11', 'geschwommen') && !ok('d-z11', 'habe geschwommen'));
  assert.ok(ok('d-z12', 'hat geschrieben'));
  assert.ok(ok('e-q8', 'didn’t go') && ok('e-q8', 'did not go') && !ok('e-q8', "didn't went"));
  assert.ok(ok('e-q10', "can't") && ok('e-q10', 'cannot') && !ok('e-q10', 'not'));
  // Lücken: Artikel allein, wenn das Nomen gleich bleibt; sonst beides
  assert.ok(ok('d-f11', 'dem') && ok('d-f11', 'Ich fahre mit dem Bus zur Schule.'));
  assert.ok(!ok('d-f12', 'des') && ok('d-f12', 'des Regens'));
  assert.ok(ok('d-z13', 'Er sagt, er sei müde.'));
  assert.ok(ok('e-q9', 'Does she speak Italian?'));
  // Einzelwörter: keine Teilantwort
  assert.ok(!ok('e-c10', 'more') && ok('e-c10', 'more expensive'));
  // Generatoren: ganzer Satz bei Lücken
  const en = BMP.getSubject('englisch');
  for (let k = 0; k < 50; k++) {
    const it = Object.assign({ subject: 'englisch' }, en.generators.verbs[1]());
    const pp = it.answer[0];
    assert.ok(BMP.check(it, 'She has ' + pp + '.').ok, it.q);
  }
  const it = BMP.getSubject('italienisch');
  for (let k = 0; k < 50; k++) {
    const x = it.generators.passato[0]();
    const subj = x.q.match(/: (.*) ___/)[1].replace(/\s*\(.*\)/, '');
    assert.ok(BMP.check(x, subj + ' ' + x.answer[0]).ok, x.q + ' → ' + subj + ' ' + x.answer[0]);
  }
});

test('Schreibtraining: Analyse und Note', () => {
  const W = BMP.writing;
  const bad = W.analyze('Ich finde das ich gut bin weil ich übe. Eigendlich mag ich die Straße. beim lesen lerne ich.', 'deutsch', { minWords: 100 });
  const msgs = bad.issues.map(i => i.msg).join(' | ');
  for (const k of ['dass', 'Komma vor «weil»', 'Eigentlich', 'ss', 'gross']) assert.ok(msgs.includes(k), 'fehlt: ' + k + ' in ' + msgs);
  const good = W.analyze('Das ist ein schöner Tag. Ich hoffe, dass du kommst. Beim Lesen lerne ich viel. Wir gingen nach Hause und weil es regnete, blieben wir drinnen.', 'deutsch', { minWords: 20 });
  assert.strictEqual(good.issues.length, 0, JSON.stringify(good.issues));
  const en = W.analyze('Yesterday i have visited London. Does she like it? My sister she like tea. It was alot of fun.', 'englisch', { minWords: 50 }).issues.map(i => i.msg).join(' | ');
  for (const k of ['«I»', 'Past simple', 'she likes', 'a lot']) assert.ok(en.includes(k), 'EN fehlt: ' + k);
  assert.ok(!en.includes('«she like»'));
  const it = W.analyze("E' stato bello perche ho visto un'amico. Qual'è il problema?", 'italienisch', { minWords: 20 }).issues.length;
  assert.ok(it >= 4);
  assert.strictEqual(W.grade({ inhalt: 3, aufbau: 3, sprache: 3, richtigkeit: 3, form: 3 }).grade, 6);
  assert.strictEqual(W.grade({ inhalt: 0, aufbau: 0, sprache: 0, richtigkeit: 0, form: 0 }).grade, 1);
  assert.strictEqual(W.grade({ inhalt: 2, aufbau: 2, sprache: 2, richtigkeit: 1, form: 1 }).grade, 4);
});

test('Spruch des Tages: bis zur Prüfung jeden Tag ein neuer', () => {
  const M = BMP.motiv, st = BMP.store.state;
  st.examDate = '2027-03-16';
  const list = BMP.SPRUECHE;
  assert.strictEqual(new Set(list).size, list.length, 'doppelte Sprüche');
  assert.ok(list.every(q => !q.includes('ß')), 'ß in Sprüchen');
  const seen = new Set();
  for (let d = new Date('2026-10-13T12:00:00'); d < new Date('2027-03-16T00:00:00'); d.setDate(d.getDate() + 1)) {
    const q = M.quoteOfDay(new Date(d));
    assert.ok(q && !seen.has(q), 'Wiederholung am ' + d.toDateString() + ': ' + q);
    seen.add(q);
  }
  assert.ok(M.quoteOfDay(new Date('2027-03-15T10:00:00')).startsWith('Morgen ist dein Tag'));
  assert.strictEqual(M.quoteOfDay(new Date('2027-03-16T07:00:00')), BMP.SPRUCH_PRUEFUNG);
  assert.ok(M.quoteOfDay(new Date('2027-04-01T10:00:00')));
});

test('Lernfranken pro Aufgabe sinken mit der Stufe (10 … 2)', () => {
  const M = BMP.motiv, st = BMP.store.state;
  const right = M.LEVELS.map(l => M.perRight(l.min));
  const tries = M.LEVELS.map(l => M.perTry(l.min));
  assert.strictEqual(right.join(','), '10,9,8,7,6,5,4,3,2');
  assert.strictEqual(tries.join(','), '2,2,2,1,1,1,1,1,0');
  st.dailyGoal = 100000; st.autoGoal = false;
  const item = { subject: 'mathe', topic: 'grundop', id: 'x', q: 'x', type: 'number', answer: 1 };
  st.points = 0;
  BMP.store.record(item, true); assert.strictEqual(M.onAnswer(item, true), 10);
  st.points = 12500;
  BMP.store.record(item, true); assert.strictEqual(M.onAnswer(item, true), 2);
  BMP.store.record(item, false); assert.strictEqual(M.onAnswer(item, false), 0);
});
