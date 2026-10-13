/* BM-Trainer – Prüfungsreglement (Zusammenfassung aus öffentlich zugänglichen Angaben, Stand Oktober 2026).
   Massgebend ist immer das offizielle Reglement der Schule. */
(function (root) {
  'use strict';
  root.BMP.reglement = {
    stand: 'Oktober 2026',
    sections: [
      {
        title: 'Deine Prüfung: KV Chur – BM1 Typ Wirtschaft',
        main: true,
        facts: [
          'Schriftliche Aufnahmeprüfung in <b>Deutsch</b>, <b>Englisch</b> und <b>Mathematik</b>.',
          '<b>Mathematik zählt doppelt.</b>',
          'Bestanden, wenn der <b>Notendurchschnitt mindestens 4.0</b> beträgt und <b>höchstens eine Note unter 4.0</b> liegt.',
          'Voraussetzung ist ein Lehrvertrag.',
          'Die Prüfungen der Vorjahre findest du auf der Website des KV Chur unter «Aufnahmeprüfung».'
        ],
        app: 'Die Prüfungs-Hochrechnung auf der Startseite rechnet genau nach dieser Regel: (2 × Mathe + Deutsch + Englisch) : 4.',
        source: 'https://www.kvchur.ch/2-uncategorised/44-m-profil'
      },
      {
        title: 'Zum Vergleich: Einheitsprüfung Kanton Graubünden (Mittelschulen)',
        facts: [
          'Gilt für Gymnasium, HMS, IMS und FMS – nicht für die BM, aber gleiche Fächer und ähnliches Niveau.',
          'Erstsprache (Deutsch): 90 Minuten schriftlich.',
          'Englisch: <b>15 Minuten Hörverständnis</b> und 60 Minuten schriftlich.',
          'Mathematik: Arithmetik &amp; Algebra 60 Minuten, Geometrie 60 Minuten.',
          'Bestanden mit Prüfungsdurchschnitt 4.00; die Abweichungen der Fachnoten unter 4 dürfen zusammen höchstens 0.75 Notenpunkte betragen.'
        ],
        app: 'Die «Vollprüfung» in der App orientiert sich an diesen Zeiten (Englisch mit Hörverständnis, Mathe 2 × 60 min, Deutsch 90 min).',
        source: 'https://www.gr.ch/DE/institutionen/verwaltung/ekud/ahb/mittelschulen/dienstleistungen/aufnahmepruefungen/einheitspruefung/Seiten/info.aspx'
      },
      {
        title: 'Hörverständnis – so läuft es meistens ab',
        facts: [
          'Vor dem Hören hast du kurz Zeit, die Fragen zu lesen. Nutze sie und unterstreiche Schlüsselwörter!',
          'Jeder Hörtext wird in der Regel <b>zweimal</b> abgespielt.',
          'Beim ersten Hören: Fragen grob beantworten. Beim zweiten Hören: kontrollieren und Lücken füllen.',
          'Zahlen, Uhrzeiten, Preise und Namen sofort notieren – sie werden oft gefragt.',
          'Nichts leer lassen: Bei Multiple Choice lieber raten.'
        ],
        app: 'In der Prüfungssimulation kann jeder Hörtext genau zweimal abgespielt werden, ohne Text zum Mitlesen – wie an der echten Prüfung. Beim Üben darfst du beliebig oft hören und den Text danach anzeigen.'
      },
      {
        title: 'Allgemeine Tipps für den Prüfungstag',
        facts: [
          'Ausweis, Aufgebot, Schreibzeug (mehrere Stifte), Geodreieck und – falls erlaubt – Taschenrechner mitnehmen. Was erlaubt ist, steht im Aufgebot der Schule.',
          'Früh genug anreisen. Handy aus.',
          'Zuerst alle Aufgaben überfliegen, dann mit den einfachen beginnen.',
          'Am Schluss 5–10 Minuten zum Kontrollieren reservieren.'
        ]
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
