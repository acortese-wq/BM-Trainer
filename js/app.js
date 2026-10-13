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
    const tops = BMP.examTopics(s);
    const vals = (tops.length ? tops : s.topics.map(t => t.id)).map(t => store.mastery(s.id, t));
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  function bar(value, color) {
    return `<div class="bar" role="progressbar" aria-valuenow="${pct(value)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct(value)}%;background:${color || 'var(--accent)'}"></span></div>`;
  }
  function header(title, back, color) {
    return `<div class="pagehead">${back ? `<a class="back" href="${back}" aria-label="Zurück">‹</a>` : ''}<h1 ${color ? `style="--sc:${color}"` : ''}>${title}</h1></div>`;
  }
  function groupPassages(items) {
    const order = [];
    for (const it of items) {
      const key = it.passage ? it.passage.title : it.audio ? 'audio:' + it.audio.id : '\u0000' + order.length;
      let g = order.find(o => o.key === key);
      if (!g) { g = { key, list: [] }; order.push(g); }
      g.list.push(it);
    }
    return order.flatMap(g => g.list);
  }
  function fmtGrade(g) { return g.toFixed(1); }

  /* ---------- Begrüssung (erster Start) ---------- */
  function welcome() {
    $app.innerHTML = `
      <section class="welcome">
        <div class="wl-icon">🎓</div>
        <h1>Willkommen beim BM-Trainer!</h1>
        <p>Hier trainierst du für die Aufnahmeprüfung an die Berufsmaturität – jeden Tag ein bisschen, mit Lernkonto, Abzeichen und Beförderungen.</p>
        <form class="panel settings" id="wf">
          <label>Wie heisst du? <input id="wn" type="text" maxlength="30" autocomplete="given-name" required></label>
          <label>Wann ist deine Aufnahmeprüfung? <input id="wd" type="date" value="${BMP.motiv.examDate()}"></label>
          <label>Dein Tagesziel
            <select id="wg"><option value="10">10 Aufgaben (ca. 7 min)</option><option value="20" selected>20 Aufgaben (ca. 15 min)</option><option value="30">30 Aufgaben (ca. 20 min)</option><option value="50">50 Aufgaben (ca. 35 min)</option></select>
          </label>
          <button class="btn" type="submit">Los geht’s →</button>
        </form>
        <p class="tip">Alles bleibt nur auf diesem Gerät gespeichert.</p>
      </section>`;
    $app.querySelector('#wf').addEventListener('submit', e => {
      e.preventDefault();
      const st = store.state;
      st.name = $app.querySelector('#wn').value.trim();
      st.examDate = $app.querySelector('#wd').value;
      st.dailyGoal = Number($app.querySelector('#wg').value);
      st.onboarded = true;
      store.save();
      BMP.motiv.addPoints(100, 'Startguthaben auf deinem Lernkonto 🎉');
      location.hash = '#/';
      home();
    });
  }

  /* ---------- Startseite ---------- */
  function ring(value, label, sub) {
    const r = 42, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, value));
    return `<svg class="ring" viewBox="0 0 100 100" role="img" aria-label="${label}">
      <circle cx="50" cy="50" r="${r}" class="ring-bg"/>
      <circle cx="50" cy="50" r="${r}" class="ring-fg" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v)}" transform="rotate(-90 50 50)"/>
      <text x="50" y="49" text-anchor="middle" class="ring-t">${label}</text>
      <text x="50" y="66" text-anchor="middle" class="ring-s">${sub}</text></svg>`;
  }
  function weekStrip() {
    const names = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const out = [];
    for (let k = 6; k >= 0; k--) {
      const d = new Date(); d.setDate(d.getDate() - k);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const day = store.state.daily[key];
      const cls = !day ? '' : day.goalDone ? 'full' : 'part';
      out.push(`<li class="${cls} ${k === 0 ? 'today' : ''}" title="${day ? day.n + ' Aufgaben' : 'nicht geübt'}"><span>${names[d.getDay()]}</span><i>${day ? (day.goalDone ? '✓' : day.n) : ''}</i></li>`);
    }
    return `<ul class="week">${out.join('')}</ul>`;
  }
  function home() {
    const st = store.state;
    if (!st.onboarded && !st.name) return welcome();
    const M = BMP.motiv;
    const streak = store.streak();
    const nFehler = store.fehlerList().length;
    const today = store.todayStats();
    const goal = M.goal();
    const ph = M.phase();
    const plan = M.plan();
    const lastMath = M.lastExamDays('mathe');
    const lv = M.level(st.points || 0);
    const pr = M.projection();
    const nBadges = Object.keys(st.badges).length;
    const hour = new Date().getHours();
    const hello = hour < 11 ? 'Guten Morgen' : hour < 17 ? 'Hallo' : 'Guten Abend';
    $app.innerHTML = `
      <section class="hero">
        <h1>${hello}${st.name ? ' ' + h(st.name) : ''}!</h1>
        <p class="quote">«${M.quoteOfDay()}»</p>
        <div class="chips">
          <span class="chip ${streak >= 3 ? 'hot' : ''}">🔥 ${streak} Tag${streak === 1 ? '' : 'e'} in Folge</span>
        </div>
      </section>

      <section class="countdown ph-${ph.id}" aria-live="off">
        <div class="cd-head"><span>${ph.icon} Phase: <b>${ph.name}</b></span><span>Prüfung ${new Date(M.examDate() + 'T00:00:00').toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
        ${ph.days > 0 ? `<div class="cd-clock" id="cdclock">${cdParts()}</div>` : `<div class="cd-big">${ph.icon}</div>`}
        <p class="cd-msg">${ph.msg}</p>
        <ul class="cd-facts">
          ${ph.days > 0 ? `<li>📆 noch ${ph.days >= 14 ? `<b>${Math.floor(ph.days / 7)}</b> Wochen · ` : ''}<b>${Math.max(0, ph.days - 1)}</b> Lerntag${ph.days - 1 === 1 ? '' : 'e'} bis zur Prüfung</li>` : ''}
          ${ph.goal ? `<li>🎯 Tagesziel in dieser Phase: <b>${goal}</b> Aufgaben</li>` : ''}
          ${plan && ph.goal ? `<li class="${plan.diff < 0 ? 'behind' : 'ahead'}">${plan.diff < 0 ? `⚠️ Rückstand: <b>${U.fmt(-plan.diff, 0)}</b> Aufgaben – hol heute auf!` : `✅ Vorsprung: <b>${U.fmt(plan.diff, 0)}</b> Aufgaben – stark!`}</li>` : ''}
          ${ph.days > 0 && ph.days <= 60 && (lastMath == null || lastMath > 7) ? `<li class="behind">📝 ${lastMath == null ? 'Noch keine Mathe-Simulation gemacht!' : `Letzte Mathe-Simulation vor ${lastMath} Tagen.`} <a href="#/pruefung/mathe">Jetzt simulieren</a></li>` : ''}
          <li id="streakwarn" class="behind" hidden></li>
        </ul>
      </section>

      <section class="today panel">
        ${ring(today.n / goal, today.n >= goal ? '✓' : today.n + '/' + goal, today.n >= goal ? 'geschafft!' : 'heute')}
        <div class="today-txt">
          <h2>${today.n >= goal ? 'Tagesziel erreicht – super!' : today.n ? `Noch ${goal - today.n} Aufgaben bis zum Tagesziel` : 'Bereit für dein Tagestraining?'}</h2>
          <p>${today.n >= goal ? 'Alles weitere ist Bonus für dein Lernkonto.' : `Mix aus deinen schwächsten Themen und dem Fehlerheft. Bonus bei Erreichen: <b>${50 + 10 * Math.min(streak + (today.n ? 0 : 1), 10)} Lernfranken</b>.`}</p>
          <a class="btn" href="#/ueben/tag/heute">▶︎ Tagestraining starten</a>
        </div>
      </section>
      ${weekStrip()}

      <section class="account panel">
        <div class="acc-head"><span>Dein Lernkonto</span><a href="#/abzeichen">🏅 ${nBadges} Abzeichen ›</a></div>
        <div class="balance">CHF ${U.fmt(st.points || 0, 0)}<small> Lernfranken</small></div>
        <div class="level"><span>${lv.icon} ${lv.name}</span>${lv.next ? `<span class="muted">nächste Stufe: ${lv.next.name}</span>` : ''}</div>
        ${bar(lv.progress)}
        ${lv.next ? `<p class="muted small">Noch ${U.fmt(lv.next.min - (st.points || 0), 0)} Lernfranken bis zur Beförderung.</p>` : '<p class="muted small">Höchste Stufe erreicht! 👑</p>'}
      </section>

      <section class="panel forecast">
        <h2>Prüfungs-Hochrechnung</h2>
        <p class="muted small">Aus deiner letzten Simulation pro Fach – Mathematik zählt doppelt. Bestanden mit Schnitt ≥ 4.0 und höchstens einer Note unter 4.</p>
        <div class="fc-grid">
          ${['mathe', 'deutsch', 'englisch'].map(id => {
            const g = pr.latest[id], s = BMP.getSubject(id);
            return `<a href="#/pruefung/${id}" class="fc ${g == null ? '' : g >= 4 ? 'good' : 'bad'}"><span>${s.name}${id === 'mathe' ? ' ×2' : ''}</span><b>${g == null ? '–' : fmtGrade(g)}</b></a>`;
          }).join('')}
          <div class="fc total ${pr.complete ? (pr.passed ? 'good' : 'bad') : ''}"><span>Schnitt</span><b>${pr.avg == null ? '–' : fmtGrade(pr.avg)}</b></div>
        </div>
        <p class="fc-msg">${!pr.complete ? '👉 Mach in Mathe, Deutsch und Englisch je eine Prüfungssimulation – dann siehst du hier deine Hochrechnung.'
          : pr.passed ? '🎓 Stand heute würdest du bestehen. Weiter so!' : '💪 Noch nicht ganz – übe gezielt die Fächer unter 4.'}</p>
      </section>

      <h2>Fächer</h2>
      <section class="grid">
        ${BMP.subjects.map(s => {
          const m = subjectMastery(s);
          return `<a class="card subject ${s.extra ? 'extra' : ''}" href="#/fach/${s.id}" style="--sc:${s.color}">
            <span class="icon">${s.icon}</span>
            <span class="title">${s.name}${s.badge ? ` <em class="pill">${s.badge}</em>` : ''}</span>
            <span class="meta">${s.topics.length} Themen · ${pct(m)} % beherrscht</span>
            ${bar(m, s.color)}
          </a>`;
        }).join('')}
      </section>
      <section class="actions">
        <a class="btn ${nFehler ? 'warn' : 'ghost'}" href="#/ueben/alle/fehler">📕 Fehlerheft${nFehler ? ` (${nFehler})` : ''}</a>
        <a class="btn ghost" href="#/original">📄 Originalprüfungen</a>
        <a class="btn ghost" href="#/reglement">📜 Reglement</a>
        <a class="btn ghost" href="#/abzeichen">🏅 Abzeichen</a>
        <a class="btn ghost" href="#/fortschritt">📈 Fortschritt</a>
      </section>
`;
    const tick = () => {
      const el = document.getElementById('cdclock');
      if (el) el.innerHTML = cdParts();
      document.title = ph.days > 0 ? `BM-Trainer · noch ${ph.days} Tage` : 'BM-Trainer';
      // Serie in Gefahr: abends noch nicht geübt
      const w = document.getElementById('streakwarn');
      if (w) {
        const now = new Date(), mid = new Date(now); mid.setHours(24, 0, 0, 0);
        const at = store.todayStats().n === 0 && now.getHours() >= 17 && ph.days > 0;
        w.hidden = !at;
        if (at) {
          const sec = Math.floor((mid - now) / 1000);
          w.innerHTML = `⏰ Heute noch nicht geübt! ${streak ? `Deine Serie von <b>${streak} Tag${streak === 1 ? '' : 'en'}</b> reisst` : 'Der Tag endet'} in <b>${Math.floor(sec / 3600)}:${String(Math.floor(sec % 3600 / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}</b>`;
        }
      }
    };
    tick();
    const iv = setInterval(tick, 1000);
    cleanup = () => { clearInterval(iv); document.title = 'BM-Trainer'; };
  }
  function cdParts() {
    const ms = Math.max(0, BMP.motiv.examTime() - Date.now());
    const d = Math.floor(ms / 86400000), hh = Math.floor(ms / 3600000) % 24, mm = Math.floor(ms / 60000) % 60, ss = Math.floor(ms / 1000) % 60;
    const box = (v, l) => `<div><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`;
    return box(d, d === 1 ? 'Tag' : 'Tage') + box(hh, 'Std') + box(mm, 'Min') + box(ss, 'Sek');
  }

  /* ---------- Abzeichen ---------- */
  function badgesPage() {
    const M = BMP.motiv, st = store.state;
    const lv = M.level(st.points || 0);
    $app.innerHTML = `${header('Abzeichen & Karriere', '#/')}
      <section class="panel">
        <h2 class="ph">Karrierestufen <small>CHF ${U.fmt(st.points || 0, 0)}</small></h2>
        <ol class="levels">${M.LEVELS.map((l, i) => `<li class="${i < lv.index ? 'done' : i === lv.index ? 'cur' : ''}"><span>${l.icon}</span> ${l.name} <small>ab ${U.fmt(l.min, 0)}</small></li>`).join('')}</ol>
        <p class="muted small">Lernfranken gibt es für jede Aufgabe (+10 richtig, +2 für den Versuch), fürs Tagesziel (mit Treuebonus für Serien), für perfekte Runden und für Prüfungssimulationen.</p>
      </section>
      <ul class="badges">${M.BADGES.map(b => {
        const t = st.badges[b.id];
        return `<li class="${t ? 'got' : ''}"><span class="bicon">${b.icon}</span><b>${b.name}</b><small>${b.desc}</small>${t ? `<em>${new Date(t).toLocaleDateString('de-CH')}</em>` : ''}</li>`;
      }).join('')}</ul>`;
  }

  /* ---------- Originalprüfungen ---------- */
  function originalsPage() {
    const st = store.state;
    const list = Object.entries(st.originals).sort((a, b) => b[1].date - a[1].date);
    $app.innerHTML = `${header('Originalprüfungen', '#/')}
      <p class="lead">Die echten Aufnahmeprüfungen der letzten Jahre sind das beste Training. Sie gehören den Schulen und sind deshalb nicht in die App kopiert – du findest sie über diese Links. Löse sie auf Papier mit Timer und trage dein Resultat hier ein.</p>
      <ul class="topics">${BMP.originals.sources.map(s => `
        <li><a href="${s.url}" target="_blank" rel="noopener" style="--sc:${s.main ? 'var(--accent)' : 'var(--muted)'}">
          <span class="t-name">${s.name}${s.main ? ' <em class="pill">deine Schule</em>' : ''} ↗</span><span class="t-desc">${s.text}</span></a></li>`).join('')}</ul>
      <h2>Resultat eintragen</h2>
      <form class="panel settings" id="of">
        <label>Prüfung <select id="os">${BMP.originals.sources.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select></label>
        <label>Fach <select id="ofa"><option value="mathe">Mathematik</option><option value="deutsch">Deutsch</option><option value="englisch">Englisch</option></select></label>
        <label>Jahrgang <input id="oy" type="text" inputmode="numeric" maxlength="9" placeholder="z. B. 2024" required></label>
        <div class="two"><label>Erreichte Punkte <input id="op" type="text" inputmode="decimal" required></label>
        <label>Maximale Punkte <input id="om" type="text" inputmode="decimal" required></label></div>
        <button class="btn" type="submit">Eintragen (+150 Lernfranken)</button>
        <span id="oerr" class="hint" aria-live="polite"></span>
      </form>
      ${list.length ? `<table class="hist"><tr><th>Prüfung</th><th>Fach</th><th>Punkte</th><th>Note</th><th></th></tr>
        ${list.map(([k, o]) => `<tr><td>${h(o.sourceName)} ${h(o.year)}</td><td>${(BMP.getSubject(o.subject) || {}).name || ''}</td><td>${U.fmt(o.points)}/${U.fmt(o.max)}</td><td class="${o.grade >= 4 ? 'good' : 'bad'}">${fmtGrade(o.grade)}</td><td><button class="linkbtn" data-del="${h(k)}" aria-label="Löschen">✕</button></td></tr>`).join('')}</table>` : ''}`;
    $app.querySelector('#of').addEventListener('submit', e => {
      e.preventDefault();
      const P = BMP._norm.parseNumber;
      const points = P($app.querySelector('#op').value), max = P($app.querySelector('#om').value);
      if (!(max > 0) || !(points >= 0) || points > max) { $app.querySelector('#oerr').textContent = 'Bitte gültige Punkte eingeben (erreicht ≤ maximal).'; return; }
      const src = BMP.originals.sources.find(s => s.id === $app.querySelector('#os').value);
      const key = Date.now().toString(36);
      st.originals[key] = { source: src.id, sourceName: src.name.split(' – ')[0], subject: $app.querySelector('#ofa').value,
        year: $app.querySelector('#oy').value.trim(), points, max, grade: BMP.grade(points, max), date: Date.now() };
      store.save();
      BMP.motiv.addPoints(150, 'Originalprüfung gelöst 📄');
      BMP.motiv.checkBadges();
      originalsPage();
    });
    $app.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
      if (confirm('Eintrag löschen?')) { delete st.originals[b.dataset.del]; store.save(); originalsPage(); }
    }));
  }

  /* ---------- Fachseite ---------- */
  function subjectPage(id) {
    const s = BMP.getSubject(id);
    if (!s) return notFound();
    const nF = store.fehlerList(s.id).length;
    $app.innerHTML = `
      ${header(s.name, '#/', s.color)}
      <p class="lead">${s.intro}</p>
      ${s.note ? `<p class="notebox">ℹ️ ${s.note}</p>` : ''}
      ${s.id === 'mathe' ? '<p class="notebox">⭐ Mathematik zählt an der Aufnahmeprüfung (KV Chur) <b>doppelt</b> – hier lohnt sich jede Minute! Geprüft wird <b>ohne Geometrie</b> (Art. 10).</p>' : ''}
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
            <span class="t-name">${t.name}${t.notTested ? ' <em class="pill muted-pill">nicht geprüft</em>' : ''}</span>
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
    if (subjectId === 'tag') {
      items = groupPassages(BMP.motiv.dailyMix(10));
      title = 'Tagestraining'; back = '#/'; color = 'var(--accent)';
    } else if (topicId === 'fehler') {
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
      const topics = topicId === 'mix' ? BMP.examTopics(s) : [topicId];
      const t = s.topics.find(x => x.id === topicId);
      if (topicId !== 'mix' && !t) return notFound();
      if (topicId === 'listening') {
        const sets = U.shuffle(BMP.audioSets).slice(0, 2);
        items = sets.flatMap(id => s.items.filter(it => it.audio && it.audio.id === id).map(it => Object.assign({ subject: s.id }, it)));
      } else items = groupPassages(BMP.draw(s, topics, 10));
      title = topicId === 'mix' ? s.name + ' – gemischt' : t.name;
      back = '#/fach/' + s.id;
      color = s.color;
    }
    const tInfo = BMP.getSubject(subjectId) && BMP.getSubject(subjectId).topics.find(x => x.id === topicId);
    runQuiz({ items, title, back, color, again: location.hash, note: tInfo && tInfo.notTested });
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

  function audioPanel(item, ctx) {
    const a = item.audio;
    if (!BMP.speech.supported) {
      return `<div class="audio"><div class="au-head">🎧 <b>${a.title}</b></div>
        <p class="hint">Dein Browser kann keine Texte vorlesen. Lies den Text stattdessen:</p>${transcript(a, true)}</div>`;
    }
    const left = ctx && ctx.exam ? 2 - (ctx.plays[a.id] || 0) : null;
    return `<div class="audio" data-aid="${a.id}">
      <div class="au-head">🎧 <b>${a.title}</b> <span class="muted small">${a.kind}</span></div>
      <div class="au-ctrl">
        <button class="btn au-play" type="button" ${left === 0 ? 'disabled' : ''}>▶︎ ${left === 0 ? 'Abgespielt' : 'Abspielen'}</button>
        ${ctx && ctx.exam ? `<span class="au-info">${left > 0 ? `noch <b>${left}×</b> abspielbar` : 'kein weiteres Abspielen möglich'}</span>`
          : `<label class="check small"><input type="checkbox" class="au-slow"> langsamer</label>`}
      </div>
      <div class="au-status muted small" aria-live="polite">${ctx && ctx.exam ? 'Wie an der Prüfung: Jeder Hörtext läuft höchstens zweimal. Lies zuerst die Frage!' : 'Tipp: Zuerst die Frage lesen, dann abspielen.'}</div>
    </div>`;
  }
  function transcript(a, open) {
    const who = { A: 'A', B: 'B', N: '' };
    return `<details class="passage transcript" ${open ? 'open' : ''}><summary>📄 Hörtext zum Nachlesen</summary>${a.lines.map(([w, t]) => `<p>${who[w] ? `<b>${who[w]}:</b> ` : ''}${t}</p>`).join('')}</details>`;
  }
  function bindAudio(item, ctx) {
    const box = $app.querySelector('.audio[data-aid]');
    if (!box) return;
    const btn = box.querySelector('.au-play'), status = box.querySelector('.au-status');
    const a = item.audio;
    let playing = false;
    const setIdle = () => {
      playing = false;
      const left = ctx && ctx.exam ? 2 - (ctx.plays[a.id] || 0) : null;
      btn.textContent = left === 0 ? '▶︎ Abgespielt' : '▶︎ Nochmals abspielen';
      btn.disabled = left === 0;
      const info = box.querySelector('.au-info');
      if (info) info.innerHTML = left > 0 ? `noch <b>${left}×</b> abspielbar` : 'kein weiteres Abspielen möglich';
    };
    const handlers = {
      onLine: k => { status.textContent = `🔊 Läuft … (${k + 1}/${a.lines.length})`; },
      onEnd: () => { status.textContent = '✓ Fertig abgespielt.'; setIdle(); }
    };
    // Läuft dieser Hörtext schon (z. B. nach Wechsel zur nächsten Frage)? Dann weiterlaufen lassen.
    if (BMP.speech.current === a.id) {
      playing = true;
      btn.textContent = '⏹ Stopp';
      BMP.speech.handlers = handlers;
    }
    btn.addEventListener('click', () => {
      if (playing) { BMP.speech.stop(); status.textContent = 'Gestoppt.'; setIdle(); return; }
      if (ctx && ctx.exam) {
        if ((ctx.plays[a.id] || 0) >= 2) return;
        ctx.plays[a.id] = (ctx.plays[a.id] || 0) + 1;
      }
      playing = true;
      btn.textContent = '⏹ Stopp';
      const slow = box.querySelector('.au-slow');
      BMP.speech.play(a, Object.assign({ rate: slow && slow.checked ? 0.72 : 0.92 }, handlers));
    });
  }

  function questionCard(item, n, total, ctx) {
    const s = BMP.getSubject(item.subject);
    const topic = s && s.topics.find(t => t.id === item.topic);
    return `
      <div class="qhead"><span>Aufgabe ${n} / ${total}</span><span class="tag" style="--sc:${s ? s.color : 'var(--accent)'}">${s ? s.name : ''}${topic ? ' · ' + topic.name : ''}</span></div>
      ${item.passage ? `<details class="passage" open><summary>📖 ${item.passage.title}</summary>${item.passage.text}</details>` : ''}
      ${item.audio ? audioPanel(item, ctx) : ''}
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
        ${cfg.note && i === 0 ? `<p class="notebox">ℹ️ ${cfg.note}</p>` : ''}
        ${bar(i / items.length, color)}
        <article class="qcard">
          ${questionCard(item, i + 1, items.length)}
          <div id="answer">${answerArea(item, i, false)}</div>
          <div id="feedback" aria-live="polite"></div>
        </article>`;
      bind(item);
    }

    function bind(item) {
      if (item.audio) bindAudio(item, null);
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
      const earned = BMP.motiv.onAnswer(item, res.ok);
      updateTop();
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
          <p class="verdict">${res.ok ? '✅ ' + U.pick(['Richtig!', 'Genau!', 'Super!', 'Stark!', 'Perfekt!']) : '❌ Leider falsch.'}${res.note ? ' ' + res.note : ''}<span class="coin">+${earned} CHF</span></p>
          ${!res.ok ? `<p>Richtige Antwort: <b>${BMP.answerText(item)}</b></p>` : ''}
          ${item.explain ? `<p class="explain">${item.explain}</p>` : ''}
          ${item.audio ? transcript(item.audio, false) : ''}
        </div>
        <button class="btn next" id="next">${last ? 'Auswertung' : 'Weiter →'}</button>`;
      const nb = $app.querySelector('#next');
      nb.focus({ preventScroll: true });
      nb.addEventListener('click', () => { if (BMP.speech.speaking && !(items[i + 1] && items[i + 1].audio && items[i + 1].audio === item.audio)) BMP.speech.stop(); i++; if (i < items.length) { show(); window.scrollTo(0, 0); } else summary(); });
    }

    function summary() {
      BMP.motiv.onRound(correct, items.length);
      updateTop();
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
        <p>Wähle deine Prüfung:</p>
        <div class="modes">
          <button class="mode" data-mode="short" style="--sc:${s.color}"><b>⚡ Kurztest</b><span>${s.exam.count} Aufgaben · ${s.exam.minutes} min</span></button>
          <button class="mode" data-mode="full" style="--sc:${s.color}"><b>🎓 Vollprüfung nach Reglement</b><span>${s.examFull.count} Aufgaben · ${s.examFull.minutes} min</span><small>${s.examFull.note}</small></button>
        </div>
        ${s.exam.listening ? `<label class="check"><input type="checkbox" id="withlisten"> 🎧 Mit Hörverständnis (+15 min) – im KV-Reglement nicht vorgesehen, aber gutes Zusatztraining</label>` : ''}
        <ul>
          <li>Du siehst erst am Schluss, was richtig war – wie in der echten Prüfung.</li>
          <li>Du kannst zwischen den Aufgaben hin und her springen.</li>
          <li>Am Ende bekommst du eine Note (1–6, Notenschnitt 4 = genügend).</li>
          ${id === 'mathe' ? '<li>Geprüft wird ohne Geometrie (Art. 10) – die Simulation auch.</li><li>Lege Papier und Bleistift bereit. Ob ein Taschenrechner erlaubt ist, steht im Aufgebot der Schule.</li>' : ''}
        </ul>
        <p class="tip">Aufbau, Dauer und Hilfsmittel der echten Prüfung legt deine Schule fest – siehe <a href="#/reglement">Reglement</a>.</p>
      </section>
      ${hist.length ? `<h2>Letzte Versuche</h2><table class="hist"><tr><th>Datum</th><th>Punkte</th><th>Note</th></tr>
        ${hist.map(e => `<tr><td>${new Date(e.date).toLocaleDateString('de-CH')}</td><td>${e.points}/${e.max}</td><td class="${e.grade >= 4 ? 'good' : 'bad'}">${fmtGrade(e.grade)}</td></tr>`).join('')}</table>` : ''}`;
    $app.querySelectorAll('.mode').forEach(b => b.addEventListener('click', () => {
      const lc = $app.querySelector('#withlisten');
      runExam(s, b.dataset.mode, !!(lc && lc.checked));
    }));
  }

  function runExam(s, mode, withListening) {
    let cfg = mode === 'full' ? s.examFull : s.exam;
    if (cfg.listening && withListening) cfg = Object.assign({}, cfg, { minutes: cfg.minutes + 15 });
    let listen = [];
    if (cfg.listening && withListening) {
      const sets = U.shuffle(BMP.audioSets).slice(0, cfg.listening);
      listen = sets.flatMap(id => s.items.filter(it => it.audio && it.audio.id === id).map(it => Object.assign({ subject: s.id }, it)));
    }
    const rest = BMP.draw(s, BMP.examTopics(s), Math.max(0, cfg.count - listen.length));
    const items = listen.concat(groupPassages(rest));
    const ctx = { exam: true, plays: {} };
    const answers = new Array(items.length).fill(null);
    let i = 0;
    s = Object.assign({}, s, { exam: cfg });
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
    cleanup = () => { clearInterval(timer); BMP.speech.stop(); };

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
      if (BMP.speech.current && !(item.audio && item.audio.id === BMP.speech.current)) BMP.speech.stop();
      $app.innerHTML = `
        <div class="examhead" style="--sc:${s.color}">
          <span>Prüfung ${s.name}</span>
          <span id="timer" class="timer">${clock(Math.max(0, remaining))}</span>
        </div>
        <nav class="qgrid" aria-label="Aufgabenübersicht">${items.map((_, k) =>
          `<button data-k="${k}" class="${k === i ? 'cur' : ''} ${answers[k] != null ? 'done' : ''}">${k + 1}</button>`).join('')}</nav>
        <article class="qcard">
          ${questionCard(item, i + 1, items.length, ctx)}
          <div id="answer">${answerArea(item, i, false, answers[i])}</div>
        </article>
        <div class="actions spread">
          <button class="btn ghost" id="prev" ${i === 0 ? 'disabled' : ''}>← Zurück</button>
          ${i < items.length - 1 ? '<button class="btn" id="fwd">Weiter →</button>' : ''}
          <button class="btn warn" id="end">Abgeben</button>
        </div>`;
      if (item.audio) bindAudio(item, ctx);
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
      BMP.speech.stop();
      store.addExam({ subject: s.id, date: Date.now(), points, max: items.length, grade, mode: mode || 'short' });
      setTimeout(() => { BMP.motiv.onExam(grade); updateTop(); }, 300);
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
        <label>Datum der Aufnahmeprüfung <input id="dt" type="date" value="${h(BMP.motiv.examDate())}"></label>
        <label>Tagesziel <select id="dg">${[10, 20, 30, 50].map(n => `<option value="${n}" ${(st.dailyGoal || 20) === n ? 'selected' : ''}>${n} Aufgaben pro Tag</option>`).join('')}</select></label>
        <label class="check"><input id="ag" type="checkbox" ${st.autoGoal === false ? '' : 'checked'}> Tagesziel automatisch steigern, je näher die Prüfung rückt</label>
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
      st.dailyGoal = Number($app.querySelector('#dg').value);
      st.autoGoal = $app.querySelector('#ag').checked;
      st.onboarded = true;
      store.save();
      $app.querySelector('#saved').textContent = 'Gespeichert ✓';
    });
    $app.querySelector('#reset').addEventListener('click', () => {
      if (confirm('Wirklich den ganzen Fortschritt (Statistik, Fehlerheft, Prüfungen, Entwürfe) löschen?')) { store.reset(); progress(); }
    });
  }

  function reglementPage() {
    const R = BMP.reglement;
    $app.innerHTML = `${header('Prüfungsreglement', '#/')}
      <p class="lead">Die wichtigsten Regeln zur Aufnahmeprüfung – und wie die App sie umsetzt. Stand: ${R.stand}. Massgebend ist immer das offizielle Reglement und das Aufgebot deiner Schule.</p>
      ${R.sections.map(sec => `<section class="panel regl ${sec.main ? 'main' : ''}">
        <h2>${sec.title}</h2>
        ${sec.sub ? `<p class="muted small">${sec.sub}</p>` : ''}
        <ul>${sec.facts.map(f => `<li>${f}</li>`).join('')}</ul>
        ${sec.app ? `<p class="notebox">📱 <b>In der App:</b> ${sec.app}</p>` : ''}
        ${sec.source ? `<p class="small"><a href="${sec.source}" target="_blank" rel="noopener">Offizielle Quelle ↗</a></p>` : ''}
      </section>`).join('')}`;
  }

  function notFound() {
    $app.innerHTML = `${header('Nicht gefunden', '#/')}<p>Diese Seite gibt es nicht. <a href="#/">Zur Startseite</a></p>`;
  }

  /* ---------- Router ---------- */
  function updateTop() {
    const el = document.getElementById('topcoins');
    if (el) el.textContent = 'CHF ' + U.fmt(store.state.points || 0, 0);
  }

  function route() {
    updateTop();
    if (BMP.speech) BMP.speech.stop();
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
      case 'abzeichen': return badgesPage();
      case 'original': return originalsPage();
      case 'reglement': return reglementPage();
      default: return notFound();
    }
  }
  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline-Funktion optional */ });
  }
})();
