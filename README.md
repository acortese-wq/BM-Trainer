# BM-Trainer

Übungs-App für die **Aufnahmeprüfung an die Berufsmaturitätsschule (BM1, Kanton Graubünden)**.
Ausgerichtet auf die **BM1 Typ Wirtschaft am KV Chur**: Prüfungsfächer Deutsch, Englisch und
Mathematik (zählt doppelt). Italienisch ist als freiwilliges Zusatztraining enthalten.

Die App ist eine reine Web-App: kein Server, kein Login, kein Build-Schritt. Sie läuft im Browser
auf Handy, Tablet und PC und kann auf dem Handy wie eine App auf den Homebildschirm gelegt werden
(danach funktioniert sie auch offline). Der Lernfortschritt wird nur lokal im Browser gespeichert.

## Funktionen

- **Üben nach Themen** – mit sofortiger Rückmeldung und Lösungsweg zu jeder Aufgabe
- **Mathematik mit Zufallsaufgaben** – Brüche, Gleichungen, Prozent, Geometrie usw. werden immer neu erzeugt
- **Prüfungssimulation** – mit Timer, Aufgabenübersicht und Note (1–6)
- **Fehlerheft** – falsche Aufgaben kommen zurück, bis sie zweimal hintereinander richtig gelöst sind
- **Merkblätter** – die wichtigsten Regeln und Formeln pro Fach (druckbar)
- **Schreibtraining** – Aufsatzthemen mit Timer, Wortzähler, Checkliste und automatisch gespeichertem Entwurf
- **Fortschritt** – Beherrschung pro Thema, Prüfungsverlauf, Countdown bis zum Prüfungsdatum, Lerntage in Folge
- **Motivation** – Tagesziel mit Fortschrittsring und Wochenübersicht, Lernkonto mit «Lernfranken»,
  Karrierestufen (von der Schnupperlernenden bis zur Direktorin), 20 Abzeichen, Treuebonus für Lernserien
- **Tagestraining** – 10 Aufgaben aus den schwächsten Themen und dem Fehlerheft (Mathe doppelt gewichtet)
- **Prüfungs-Hochrechnung** – Gesamtnote aus den letzten Simulationen nach den Aufnahmeregeln
  (Schnitt ≥ 4.0, Mathe doppelt, höchstens eine Note unter 4)
- **Originalprüfungen** – Links zu den offiziellen alten Prüfungen und Erfassung der eigenen Resultate
  (die Prüfungen selbst sind urheberrechtlich geschützt und werden nicht kopiert)

## Starten

Lokal reicht ein einfacher Webserver im Projektordner:

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

`index.html` lässt sich auch direkt per Doppelklick öffnen (dann ohne Offline-Funktion).

### Online stellen (GitHub Pages)

Der Workflow `.github/workflows/pages.yml` testet die Inhalte und veröffentlicht die App bei jedem
Push auf `main`. Einmalig nötig: im Repository unter **Settings → Pages → Source** «GitHub Actions» wählen.
Danach ist die App unter **https://acortese-wq.github.io/BM-Trainer/** erreichbar.
Auf dem Handy die Adresse öffnen und «Zum Home-Bildschirm» wählen – dann startet sie wie eine App.

## Aufbau

```
index.html              Einstiegsseite
css/style.css           Gestaltung (hell/dunkel, für Handy optimiert)
js/core.js              Antwortprüfung, Zufall, Speicherung, Notenberechnung
js/app.js               Oberfläche und Navigation
js/motivation.js        Lernkonto, Stufen, Abzeichen, Tagestraining, Hochrechnung
js/data/originale.js    Links zu offiziellen alten Aufnahmeprüfungen
js/data/<fach>.js       Aufgaben, Generatoren, Merkblatt, Schreibthemen pro Fach
sw.js, manifest.webmanifest, icons/   Installierbare Offline-App
tests/content.test.js   Automatische Prüfung aller Aufgaben
```

## Aufgaben ergänzen

Neue Aufgaben werden in `js/data/<fach>.js` im Array `items` eingetragen, zum Beispiel:

```js
{ id: 'd-r21', topic: 'rechtschreibung', type: 'mc',
  q: 'Welches Wort ist richtig geschrieben?',
  options: ['Rhytmus', 'Rhythmus'], answer: 1,
  explain: 'Rhythmus – mit zwei h.' }
```

Mögliche Typen: `mc` (Auswahl, `answer` = Index), `number` (Zahl, optional `tol` und `unit`),
`fraction` (`answer: [zähler, nenner]`) und `text` (`answer` = Liste akzeptierter Antworten).
Danach die Tests laufen lassen:

```bash
node --test tests/content.test.js
```

Die Tests prüfen unter anderem, dass jede Musterlösung von der App als richtig erkannt wird,
dass alle Zufallsgeneratoren gültige Aufgaben liefern und dass kein «ß» vorkommt (Schweizer Rechtschreibung).

## Hinweis

Die genauen Prüfungsfächer, Prüfungsdauer, erlaubten Hilfsmittel und Anmeldefristen legt die
jeweilige Berufsmaturitätsschule bzw. das Amt für Berufsbildung Graubünden fest. Alte Prüfungen,
die von den Schulen oft veröffentlicht werden, sind die ideale Ergänzung zu dieser App.
