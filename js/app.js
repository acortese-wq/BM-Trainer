/* BM-Trainer – Oberfläche */
(function () {
  'use strict';
  const BMP = window.BMP;
  const U = BMP.U;
  const store = BMP.store;
  const $app = document.getElementById('app');
  let cleanup = null; // z. B. Timer beim Seitenwechsel stoppen

  store.load();

  /* ---------- Hilfen ---------- */
  const h = U.esc;
  const pct = x => Math.round(x * 100);
  function subjectMastery(s) {
    const vals = s.topics.map(t => store.mastery(s.id, t.id));
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  function bar(value, color) {
    return `<div class="bar" role="progressbar" aria-valuenow="${pct(value)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct(value)}%;background:${color || 'var(--accent)'}"></span></div>`;
  }
  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr + 'T00:00:00');
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((d - t) / 86400000);
  }
  function header(title, back, color) {
    return `<div class="pagehead">${back ? `<a class="back" href="${back}" aria-label="Zurück">‹</a>` : ''}<h1 ${color ? `style="--sc:${color}"` : ''}>${title}</h1></div>`;
  }
  function groupPassages(items) {
    const order = [];
    for (const it of items) {
      const key = it.passage ? it.passage.title : '\u0000' + order.length;
      let g = order.find(o => o.key === key);
      if (!g) { g = { key, list: [] }; order.push(g); }
      g.list.push(it);
    }
    return order.flatMap(g => g.list);
  }
  function fmtGrade(g) { return g.toFixed(1); }

  /* ---------- Startseite ---------- */
  function home() {
    const st = store.state;
    const streak = store.streak();
    const left = daysUntil(st.examDate);
    const nFehler = store.fehlerList().length;
    $app.innerHTML = `
      <section class="hero">
        <h1>Hallo${st.name ? ' ' + h(st.name) : ''}!</h1>
        <p>Dein Training für die Aufnahmeprüfung an die Berufsmaturitätsschule (BM1).</p>
        <div class="chips">
          ${left != null && left >= 0 ? `<span class="chip">📅 ${left === 0 ? 'Heute ist Prüfung – viel Erfolg!' : `Noch <b>${left}</b> Tag${left === 1 ? '' : 'e'} bis zur Prüfung`}</span>` : ''}
          <span class="chip">🔥 ${streak} Tag${streak === 1 ? '' : 'e'} in Folge geübt</span>
        </div>
      </section>
      <section class="grid">
        ${BMP.subjects.map(s => {
          const m = subjectMastery(s);
          return `<a class="card subject" href="#/fach/${s.id}" style="--sc:${s.color}">
            <span class="icon">${s.icon}</span>
            <span class="title">${s.name}</span>
            <span class="meta">${s.topics.length} Themen · ${pct(m)} % beherrscht</span>
            ${bar(m, s.color)}
          </a>`;
        }).join('')}
      </section>
      <section class="actions">
        <a class="btn ${nFehler ? 'warn' : 'ghost'}" href="#/ueben/alle/fehler">📕 Fehlerheft${nFehler ? ` (${nFehler})` : ''}</a>
        <a class="btn ghost" href="#/fortschritt">📈 Fortschritt &amp; Einstellungen</a>
      </section>
      ${!st.examDate ? `<p class="tip">Tipp: Trage unter <a href="#/fortschritt">Einstellungen</a> dein Prüfungsdatum ein – dann siehst du hier einen Countdown.</p>` : ''}
      <p class="tip">Die offiziellen Prüfungsfächer, Daten und Anmeldefristen findest du bei deiner Berufsmaturitätsschule bzw. beim Amt für Berufsbildung Graubünden. Frage dort auch nach alten Prüfungen – sie sind das beste Training!</p>`;
  }

  /* ---------- Fachseite ---------- */
  function subjectPage(id) {
    const s = BMP.getSubject(id);
    if (!s) return notFound();
    const nF = store.fehlerList(s.id).length;
    $app.innerHTML = `
      ${header(s.name, '#/', s.color)}
      <p class="lead">${s.intro}</p>
      <div class="actions">
        <a class="btn" style="--sc:${s.color}" href="#/ueben/${s.id}/mix">🎲 Alles gemischt üben</a>
        <a class="btn" style="--sc:${s.color}" href="#/pruefung/${s.id}">⏱️ Prüfung simulieren</a>
      </div>
      <div class="actions">
        <a class="btn ghost" href="#/merkblatt/${s.id}">📄 Merkblatt</a>
        ${s.writing ? `<a class="btn ghost" href="#/schreiben/${s.id}">✍️ Schreibtraining</a>` : ''}
        ${nF ? `<a class="btn warn" href="#/ueben/${s.id}/fehler">📕 Fehlerheft (${nF})</a>` : ''}
      </div>
      <h2>Themen</h2>
      <ul class="topics">
        ${s.topics.map(t => {
          const st = store.topicStats(s.id, t.id);
          const m = store.mastery(s.id, t.id);
          return `<li><a href="#/ueben/${s.id}/${t.id}" style="--sc:${s.color}">
            <span class="t-name">${t.name}</span>
            <span class="t-desc">${t.desc}</span>
            ${bar(m, s.color)}
            <span class="t-stat">${st.seen ? `${st.correct}/${st.seen} richtig` : 'noch nicht geübt'}</span>
          </a></li>`;
        }).join('')}
      </ul>`;
  }

  /* ---------- Üben ---------- */
  function practice(subjectId, topicId) {
    let items, title, back, color;
    if (topicId === 'fehler') {
      const list = store.fehlerList(subjectId === 'alle' ? null : subjectId);
      items = U.shuffle(list.map(f => Object.assign({}, f.item))).slice(0, 15);
      title = 'Fehlerheft';
      back = subjectId === 'alle' ? '#/' : '#/fach/' + subjectId;
      color = 'var(--warn)';
      if (!items.length) {
        $app.innerHTML = `${header(title, back)}<div class="empty"><p>🎉 Dein Fehlerheft ist leer!</p><p>Falsch beantwortete Aufgaben landen hier. Wenn du eine Aufgabe zweimal hintereinander richtig löst, verschwindet sie wieder.</p></div>`;
        return;
      }
    } else {
      const s = BMP.getSubject(subjectId);
      if (!s) return notFound();
      const topics = topicId === 'mix' ? s.topics.map(t => t.id) : [topicId];
      const t = s.topics.find(x => x.id === topicId);
      if (topicId !== 'mix' && !t) return notFound();
      items = groupPassages(BMP.draw(s, topics, 10));
      title = topicId === 'mix' ? s.name + ' – gemischt' : t.name;
      back = '#/fach/' + s.id;
      color = s.color;
    }
    runQuiz({ items, title, back, color, again: location.hash });
  }

  function answerArea(item, idx, disabled, prev) {
    if (item.type === 'mc') {
      return `<div class="options">${item.options.map((o, i) =>
        `<button class="opt${prev != null && Number(prev) === i ? ' sel' : ''}" data-i="${i}" ${disabled ? 'disabled' : ''}>${o}</button>`).join('')}</div>`;
    }
    const mode = item.type === 'text' ? 'text' : 'decimal';
    const ph = item.hint || (item.type === 'number' ? 'Zahl eingeben' : item.type === 'fraction' ? 'z. B. 3/4' : 'Antwort eingeben');
    return `<form class="inputrow" autocomplete="off">
      <input id="ans" type="text" inputmode="${item.type === 'fraction' ? 'text' : mode}" autocapitalize="off" autocorrect="off" spellcheck="false"
        placeholder="${h(ph)}" value="${prev != null ? h(prev) : ''}" ${disabled ? 'disabled' : ''} aria-label="Antwort">
      ${item.unit ? `<span class="unit">${item.unit}</span>` : ''}
      <button class="btn" type="submit" ${disabled ? 'disabled' : ''}>Prüfen</button>
    </form>`;
  }

  function questionCard(item, n, total) {
    const s = BMP.getSubject(item.subject);
    const topic = s && s.topics.find(t => t.id === item.topic);
    return `
      <div class="qhead"><span>Aufgabe ${n} / ${total}</span><span class="tag" style="--sc:${s ? s.color : 'var(--accent)'}">${s ? s.name : ''}${topic ? ' · ' + topic.name : ''}</span></div>
      ${item.passage ? `<details class="passage" open><summary>📖 ${item.passage.title}</summary>${item.passage.text}</details>` : ''}
      <div class="question">${item.q}</div>
      ${item.hint && item.type === 'number' ? `<p class="hint">${item.hint}</p>` : ''}`;
  }

  function runQuiz(cfg) {
    const { items, title, back, color } = cfg;
    let i = 0, correct = 0;
    const wrong = [];

    function show() {
      const item = items[i];
      $app.innerHTML = `
        ${header(title, back, color)}
        ${bar(i / items.length, color)}
        <article class="qcard">
          ${questionCard(item, i + 1, items.length)}
          <div id="answer">${answerArea(item, i, false)}</div>
          <div id="feedback" aria-live="polite"></div>
        </article>`;
      bind(item);
    }

    function bind(item) {
      if (item.type === 'mc') {
        $app.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => submit(item, b.dataset.i)));
      } else {
        const form = $app.querySelector('form');
        const input = $app.querySelector('#ans');
        input.focus({ preventScroll: true });
        form.addEventListener('submit', e => {
          e.preventDefault();
          if (!input.value.trim()) { input.focus(); return; }
          submit(item, input.value);
        });
      }
    }

    function submit(item, given) {
      const res = BMP.check(item, given);
      if (!res.ok && res.note && item.type !== 'mc' && item.type !== 'text' && /Bitte/.test(res.note)) {
        $app.querySelector('#feedback').innerHTML = `<p class="hint">${res.note}</p>`;
        return;
      }
      store.record(item, res.ok);
      if (res.ok) correct++; else wrong.push({ item, given });
      // Antwortbereich sperren und markieren
      if (item.type === 'mc') {
        $app.querySelectorAll('.opt').forEach(b => {
          b.disabled = true;
          const k = Number(b.dataset.i);
          if (k === item.answer) b.classList.add('right');
          else if (k === Number(given)) b.classList.add('wrong');
        });
      } else {
        $app.querySelectorAll('#answer input, #answer button').forEach(el => { el.disabled = true; });
        $app.querySelector('#ans').classList.add(res.ok ? 'right' : 'wrong');
      }
      const last = i === items.length - 1;
      $app.querySelector('#feedback').innerHTML = `
        <div class="fb ${res.ok ? 'ok' : 'no'}">
          <p class="verdict">${res.ok ? '✅ Richtig!' : '❌ Leider falsch.'}${res.note ? ' ' + res.note : ''}</p>
          ${!res.ok ? `<p>Richtige Antwort: <b>${BMP.answerText(item)}</b></p>` : ''}
          ${item.explain ? `<p class="explain">${item.explain}</p>` : ''}
        </div>
        <button class="btn next" id="next">${last ? 'Auswertung' : 'Weiter →'}</button>`;
      const nb = $app.querySelector('#next');
      nb.focus({ preventScroll: true });
      nb.addEventListener('click', () => { i++; if (i < items.length) { show(); window.scrollTo(0, 0); } else summary(); });
    }

    function summary() {
      const ratio = correct / items.length;
      const msg = ratio === 1 ? 'Perfekt! 🌟' : ratio >= 0.8 ? 'Sehr gut! 💪' : ratio >= 0.6 ? 'Gut gemacht – weiter so!' : 'Dranbleiben – Übung macht den Meister!';
      $app.innerHTML = `
        ${header(title, back, color)}
        <section class="result">
          <div class="score" style="--sc:${color}"><b>${correct}</b> / ${items.length}</div>
          <p class="big">${msg}</p>
          ${wrong.length ? `<p>Diese Aufgaben kommen ins Fehlerheft – dort kannst du sie wiederholen.</p>` : ''}
        </section>
        ${wrong.length ? `<h2>Nochmals anschauen</h2><ol class="review">${wrong.map(w => `
          <li><div class="question">${w.item.q}</div>
            <p>Deine Antwort: <span class="bad">${w.item.type === 'mc' ? w.item.options[w.given] : h(w.given)}</span></p>
            <p>Richtig: <b>${BMP.answerText(w.item)}</b></p>
            ${w.item.explain ? `<p class="explain">${w.item.explain}</p>` : ''}</li>`).join('')}</ol>` : ''}
        <div class="actions">
          <a class="btn" href="${cfg.again}" id="again">🔁 Nochmals</a>
          <a class="btn ghost" href="${back}">Zurück</a>
        </div>`;
      $app.querySelector('#again').addEventListener('click', e => { e.preventDefault(); route(); });
    }

    show();
  }

  /* ---------- Prüfungssimulation ---------- */
  function examIntro(id) {
    const s = BMP.getSubject(id);
    if (!s) return notFound();
    const hist = store.state.exams.filter(e => e.subject === id).slice(-5).reverse();
    $app.innerHTML = `
      ${header('Prüfung ' + s.name, '#/fach/' + id, s.color)}
      <section class="panel">
        <p><b>${s.exam.count} Aufgaben</b> aus allen Themen · <b>${s.exam.minutes} Minuten</b></p>
        <ul>
          <li>Du siehst erst am Schluss, was richtig war – wie in der echten Prüfung.</li>
          <li>Du kannst zwischen den Aufgaben hin und her springen.</li>
          <li>Am Ende bekommst du eine Note (1–6, Notenschnitt 4 = genügend).</li>
          ${id === 'mathe' ? '<li>Lege Papier, Bleistift und – falls an deiner Prüfung erlaubt – den Taschenrechner bereit.</li>' : ''}
        </ul>
        <p class="tip">Hinweis: Aufbau, Dauer und erlaubte Hilfsmittel der echten Prüfung legt deine Schule fest. Diese Simulation dient dem Training.</p>
        <button class="btn" style="--sc:${s.color}" id="start">Prüfung starten</button>
      </section>
      ${hist.length ? `<h2>Letzte Versuche</h2><table class="hist"><tr><th>Datum</th><th>Punkte</th><th>Note</th></tr>
        ${hist.map(e => `<tr><td>${new Date(e.date).toLocaleDateString('de-CH')}</td><td>${e.points}/${e.max}</td><td class="${e.grade >= 4 ? 'good' : 'bad'}">${fmtGrade(e.grade)}</td></tr>`).join('')}</table>` : ''}`;
    $app.querySelector('#start').addEventListener('click', () => runExam(s));
  }

  function runExam(s) {
    const items = groupPassages(BMP.draw(s, s.topics.map(t => t.id), s.exam.count));
    const answers = new Array(items.length).fill(null);
    let i = 0;
    let remaining = s.exam.minutes * 60;
    const t0 = Date.now();
    let done = false;

    const timer = setInterval(() => {
      remaining = s.exam.minutes * 60 - Math.floor((Date.now() - t0) / 1000);
      const el = document.getElementById('timer');
      if (el) {
        el.textContent = clock(Math.max(0, remaining));
        el.classList.toggle('low', remaining <= 300);
      }
      if (remaining <= 0) finish(true);
    }, 1000);
    cleanup = () => clearInterval(timer);

    function clock(sec) { return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }

    function saveCurrent() {
      const item = items[i];
      if (item.type !== 'mc') {
        const inp = $app.querySelector('#ans');
        if (inp) answers[i] = inp.value.trim() ? inp.value : null;
      }
    }

    function show() {
      const item = items[i];
      $app.innerHTML = `
        <div class="examhead" style="--sc:${s.color}">
          <span>Prüfung ${s.name}</span>
          <span id="timer" class="timer">${clock(Math.max(0, remaining))}</span>
        </div>
        <nav class="qgrid" aria-label="Aufgabenübersicht">${items.map((_, k) =>
          `<button data-k="${k}" class="${k === i ? 'cur' : ''} ${answers[k] != null ? 'done' : ''}">${k + 1}</button>`).join('')}</nav>
        <article class="qcard">
          ${questionCard(item, i + 1, items.length)}
          <div id="answer">${answerArea(item, i, false, answers[i])}</div>
        </article>
        <div class="actions spread">
          <button class="btn ghost" id="prev" ${i === 0 ? 'disabled' : ''}>← Zurück</button>
          ${i < items.length - 1 ? '<button class="btn" id="fwd">Weiter →</button>' : ''}
          <button class="btn warn" id="end">Abgeben</button>
        </div>`;
      if (item.type === 'mc') {
        $app.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
          answers[i] = b.dataset.i;
          $app.querySelectorAll('.opt').forEach(x => x.classList.toggle('sel', x === b));
          $app.querySelector(`.qgrid [data-k="${i}"]`).classList.add('done');
        }));
      } else {
        const btn = $app.querySelector('#answer button');
        btn.textContent = 'Speichern';
        $app.querySelector('form').addEventListener('submit', e => {
          e.preventDefault(); saveCurrent();
          $app.querySelector(`.qgrid [data-k="${i}"]`).classList.toggle('done', answers[i] != null);
          if (i < items.length - 1) { i++; show(); }
        });
      }
      $app.querySelectorAll('.qgrid button').forEach(b => b.addEventListener('click', () => { saveCurrent(); i = Number(b.dataset.k); show(); }));
      $app.querySelector('#prev').addEventListener('click', () => { saveCurrent(); i--; show(); });
      const fwd = $app.querySelector('#fwd');
      if (fwd) fwd.addEventListener('click', () => { saveCurrent(); i++; show(); window.scrollTo(0, 0); });
      $app.querySelector('#end').addEventListener('click', () => {
        saveCurrent();
        const open = answers.filter(a => a == null).length;
        if (confirm(open ? `Noch ${open} Aufgabe(n) unbeantwortet. Trotzdem abgeben?` : 'Prüfung jetzt abgeben?')) finish(false);
      });
    }

    function finish(timeUp) {
      if (done) return;
      done = true;
      clearInterval(timer); cleanup = null;
      if (!timeUp) saveCurrent(); else { try { saveCurrent(); } catch (e) { /* Seite evtl. schon gewechselt */ } }
      let points = 0;
      const results = items.map((item, k) => {
        const given = answers[k];
        const ok = given != null && BMP.check(item, given).ok;
        if (ok) points++;
        store.record(item, ok);
        return { item, given, ok };
      });
      const grade = BMP.grade(points, items.length);
      store.addExam({ subject: s.id, date: Date.now(), points, max: items.length, grade });
      const used = Math.min(s.exam.minutes * 60, Math.floor((Date.now() - t0) / 1000));
      $app.innerHTML = `
        ${header('Auswertung ' + s.name, '#/fach/' + s.id, s.color)}
        <section class="result">
          ${timeUp ? '<p class="hint">⏰ Die Zeit ist abgelaufen.</p>' : ''}
          <div class="score" style="--sc:${s.color}"><b>${fmtGrade(grade)}</b><small>Note</small></div>
          <p class="big">${points} von ${items.length} Punkten · Zeit: ${Math.floor(used / 60)} min ${used % 60} s</p>
          <p>${grade >= 5 ? 'Ausgezeichnet – du bist gut vorbereitet! 🌟' : grade >= 4 ? 'Genügend – mit etwas Übung wird es noch besser! 💪' : 'Noch nicht genügend. Schau dir die Fehler an und übe die schwachen Themen gezielt.'}</p>
        </section>
        <h2>Alle Aufgaben</h2>
        <ol class="review">${results.map(r => `
          <li class="${r.ok ? 'r-ok' : 'r-no'}"><div class="question">${r.item.q}</div>
            <p>Deine Antwort: ${r.given == null ? '<i>keine</i>' : `<span class="${r.ok ? 'good' : 'bad'}">${r.item.type === 'mc' ? r.item.options[r.given] : h(r.given)}</span>`} ${r.ok ? '✅' : '❌'}</p>
            ${!r.ok ? `<p>Richtig: <b>${BMP.answerText(r.item)}</b></p>${r.item.explain ? `<p class="explain">${r.item.explain}</p>` : ''}` : ''}</li>`).join('')}</ol>
        <div class="actions"><a class="btn" href="#/fach/${s.id}">Zurück zu ${s.name}</a></div>`;
      window.scrollTo(0, 0);
    }

    show();
  }

  /* ---------- Merkblatt ---------- */
  function merkblatt(id) {
    const s = BMP.getSubject(id);
    if (!s) return notFound();
    $app.innerHTML = `${header('Merkblatt ' + s.name, '#/fach/' + id, s.color)}
      <article class="sheet" style="--sc:${s.color}">${s.merkblatt}</article>
      <div class="actions"><button class="btn ghost" onclick="window.print()">🖨️ Drucken</button></div>`;
  }

  /* ---------- Schreibtraining ---------- */
  function writingList(id) {
    const s = BMP.getSubject(id);
    if (!s || !s.writing) return notFound();
    $app.innerHTML = `${header('Schreibtraining ' + s.name, '#/fach/' + id, s.color)}
      <p class="lead">Wähle ein Thema, stelle den Timer und schreibe wie an der Prüfung. Dein Text wird automatisch auf diesem Gerät gespeichert. Am Schluss kontrollierst du ihn mit der Checkliste – oder zeigst ihn einer Lehrperson.</p>
      <ul class="topics">${s.writing.map((w, k) => {
        const draft = store.state.drafts[id + '/' + k];
        const words = draft ? countWords(draft) : 0;
        return `<li><a href="#/schreiben/${id}/${k}" style="--sc:${s.color}">
          <span class="t-name">${w.title}</span><span class="t-desc">${w.kind} · ca. ${w.minWords} Wörter · ${w.minutes} min</span>
          ${words ? `<span class="t-stat">Entwurf: ${words} Wörter</span>` : ''}</a></li>`;
      }).join('')}</ul>`;
  }
  function countWords(t) { return (t.trim().match(/\S+/g) || []).length; }

  function writingTask(id, k) {
    const s = BMP.getSubject(id);
    const w = s && s.writing && s.writing[k];
    if (!w) return notFound();
    const key = id + '/' + k;
    let running = false, left = w.minutes * 60, tick = null;
    $app.innerHTML = `${header(w.title, '#/schreiben/' + id, s.color)}
      <section class="panel"><p class="tag" style="--sc:${s.color}">${w.kind}</p><p>${w.task}</p>
        <p class="hint">Ziel: ca. ${w.minWords} Wörter in ${w.minutes} Minuten.</p></section>
      <div class="writebar"><button class="btn ghost" id="tbtn">▶︎ Timer starten</button><span id="tclock" class="timer">${w.minutes}:00</span><span id="wc" class="wc"></span></div>
      <textarea id="txt" rows="16" placeholder="Hier schreiben …" spellcheck="false">${h(store.state.drafts[key] || '')}</textarea>
      <h2>Checkliste</h2>
      <ul class="checklist">${(s.checklist || []).map((c, n) => `<li><label><input type="checkbox" id="c${n}"> ${c}</label></li>`).join('')}</ul>
      <div class="actions"><button class="btn ghost" id="clear">Text löschen</button></div>`;
    const txt = $app.querySelector('#txt'), wc = $app.querySelector('#wc'), tclock = $app.querySelector('#tclock'), tbtn = $app.querySelector('#tbtn');
    const upd = () => {
      const n = countWords(txt.value);
      wc.textContent = n + ' / ' + w.minWords + ' Wörter';
      wc.classList.toggle('good', n >= w.minWords);
    };
    upd();
    let saveT = null;
    txt.addEventListener('input', () => {
      upd();
      clearTimeout(saveT);
      saveT = setTimeout(() => { store.state.drafts[key] = txt.value; store.save(); }, 400);
    });
    tbtn.addEventListener('click', () => {
      running = !running;
      tbtn.textContent = running ? '⏸ Pause' : '▶︎ Weiter';
      if (running) {
        tick = setInterval(() => {
          left--;
          tclock.textContent = Math.floor(Math.max(0, left) / 60) + ':' + String(Math.max(0, left) % 60).padStart(2, '0');
          tclock.classList.toggle('low', left <= 300);
          if (left <= 0) { clearInterval(tick); running = false; tbtn.textContent = '⏰ Zeit um'; tbtn.disabled = true; }
        }, 1000);
      } else clearInterval(tick);
    });
    $app.querySelector('#clear').addEventListener('click', () => {
      if (confirm('Text wirklich löschen?')) { txt.value = ''; delete store.state.drafts[key]; store.save(); upd(); }
    });
    cleanup = () => { clearInterval(tick); clearTimeout(saveT); store.state.drafts[key] = txt.value; store.save(); };
  }

  /* ---------- Fortschritt & Einstellungen ---------- */
  function progress() {
    const st = store.state;
    const exams = st.exams.slice(-10).reverse();
    $app.innerHTML = `${header('Fortschritt', '#/')}
      ${BMP.subjects.map(s => `
        <section class="panel" style="--sc:${s.color}">
          <h2 class="ph">${s.name} <small>${pct(subjectMastery(s))} %</small></h2>
          <ul class="mini-bars">${s.topics.map(t => {
            const ts = store.topicStats(s.id, t.id), m = store.mastery(s.id, t.id);
            return `<li><a href="#/ueben/${s.id}/${t.id}">${t.name}</a>${bar(m, s.color)}<span>${ts.seen ? Math.round(ts.correct / ts.seen * 100) + ' %' : '–'}</span></li>`;
          }).join('')}</ul>
        </section>`).join('')}
      ${exams.length ? `<h2>Prüfungssimulationen</h2><table class="hist"><tr><th>Datum</th><th>Fach</th><th>Punkte</th><th>Note</th></tr>
        ${exams.map(e => `<tr><td>${new Date(e.date).toLocaleDateString('de-CH')}</td><td>${(BMP.getSubject(e.subject) || {}).name || ''}</td><td>${e.points}/${e.max}</td><td class="${e.grade >= 4 ? 'good' : 'bad'}">${fmtGrade(e.grade)}</td></tr>`).join('')}</table>` : ''}
      <h2>Einstellungen</h2>
      <form class="panel settings" id="set">
        <label>Dein Vorname <input id="nm" type="text" maxlength="30" value="${h(st.name || '')}"></label>
        <label>Datum der Aufnahmeprüfung <input id="dt" type="date" value="${h(st.examDate || '')}"></label>
        <button class="btn" type="submit">Speichern</button>
        <span id="saved" class="hint" aria-live="polite"></span>
      </form>
      <section class="panel">
        <p>Dein Fortschritt wird nur auf diesem Gerät im Browser gespeichert.</p>
        <button class="btn warn" id="reset">Fortschritt zurücksetzen</button>
      </section>`;
    $app.querySelector('#set').addEventListener('submit', e => {
      e.preventDefault();
      st.name = $app.querySelector('#nm').value.trim();
      st.examDate = $app.querySelector('#dt').value;
      store.save();
      $app.querySelector('#saved').textContent = 'Gespeichert ✓';
    });
    $app.querySelector('#reset').addEventListener('click', () => {
      if (confirm('Wirklich den ganzen Fortschritt (Statistik, Fehlerheft, Prüfungen, Entwürfe) löschen?')) { store.reset(); progress(); }
    });
  }

  function notFound() {
    $app.innerHTML = `${header('Nicht gefunden', '#/')}<p>Diese Seite gibt es nicht. <a href="#/">Zur Startseite</a></p>`;
  }

  /* ---------- Router ---------- */
  function route() {
    if (cleanup) { try { cleanup(); } catch (e) { /* ignorieren */ } cleanup = null; }
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean).map(decodeURIComponent);
    window.scrollTo(0, 0);
    switch (parts[0]) {
      case undefined: return home();
      case 'fach': return subjectPage(parts[1]);
      case 'ueben': return practice(parts[1], parts[2] || 'mix');
      case 'pruefung': return examIntro(parts[1]);
      case 'merkblatt': return merkblatt(parts[1]);
      case 'schreiben': return parts[2] != null ? writingTask(parts[1], Number(parts[2])) : writingList(parts[1]);
      case 'fortschritt': return progress();
      default: return notFound();
    }
  }
  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline-Funktion optional */ });
  }
})();
