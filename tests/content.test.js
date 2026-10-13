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
for (const f of ['js/core.js', 'js/data/mathe.js', 'js/data/deutsch.js', 'js/data/englisch.js', 'js/data/hoeren.js', 'js/data/italienisch.js', 'js/data/reglement.js', 'js/data/originale.js', 'js/motivation.js', 'js/speech.js']) {
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
