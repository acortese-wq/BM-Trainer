/* BM-Trainer – Prüfungsreglement (Zusammenfassung aus öffentlich zugänglichen Angaben, Stand Oktober 2026).
   Massgebend ist immer das offizielle Reglement der Schule. */
(function (root) {
  'use strict';
  root.BMP.reglement = {
    stand: 'Oktober 2026',
    sections: [
      {
        title: 'Deine Prüfung: Aufnahmereglement KV Chur – BM1 Typ Wirtschaft',
        sub: 'Erlassen vom Schulrat am 19. Mai 2015, gültig ab Schuljahr 2015/2016',
        main: true,
        facts: [
          '<b>Art. 3 Zulassung:</b> Gültiger Lehrvertrag als Kauffrau/Kaufmann EFZ (oder Detailhandelsfachfrau/-mann EFZ) und bestandene Aufnahmeprüfung.',
          '<b>Art. 8 Zeitpunkt:</b> Die Prüfung findet in der Regel vor Mitte April statt; das Datum wird mindestens sechs Monate vorher publiziert. <b>Wer unentschuldigt fehlt, hat nicht bestanden.</b>',
          '<b>Art. 9 Prüfungsstoff:</b> Lehrstoff der <b>dritten Sekundarklasse</b>.',
          '<b>Art. 10 Form und Inhalt:</b> Schriftliche Prüfung in <b>Deutsch, Englisch und Mathematik (ohne Geometrie)</b>.',
          '<b>Art. 10 Abs. 2:</b> Die Erstsprachprüfung kann auf Wunsch auf <b>Italienisch oder Romanisch</b> statt Deutsch abgelegt werden – das muss bei der Prüfungsanmeldung angegeben werden.',
          '<b>Art. 11 Noten:</b> Bewertet mit ganzen oder halben Noten; 4 bis 6 genügend. Gewichtung: Deutsch einfach, Englisch einfach, <b>Mathematik doppelt</b>.',
          '<b>Art. 12 Bestehen:</b> Durchschnitt aller Noten <b>mindestens 4.0</b> und <b>höchstens eine Note ungenügend</b>. Über Grenzfälle entscheidet die Schulleitung.',
          '<b>Art. 13 Unredlichkeit:</b> Wer unerlaubte Hilfe nutzt, kann ausgeschlossen werden – die Prüfung gilt dann als nicht bestanden.',
          '<b>Art. 14 Bekanntgabe:</b> Das Resultat kommt spätestens <b>drei Wochen</b> nach der Prüfung schriftlich.',
          '<b>Art. 15 Gültigkeit:</b> Eine bestandene Prüfung gilt für den laufenden Lehrgang und die zwei folgenden Kalenderjahre.',
          '<b>Art. 16 Rechtsmittel:</b> Beschwerde innert 10 Tagen schriftlich an das Erziehungs-, Kultur- und Umweltschutzdepartement GR.',
          '<b>Nicht im Reglement geregelt:</b> Prüfungsdauer, erlaubte Hilfsmittel (Taschenrechner) und ein Hörverständnis. Diese Angaben stehen im Aufgebot bzw. in der Ausschreibung der Schule (Art. 7).'
        ],
        app: 'Die Hochrechnung rechnet nach Art. 11/12: (2 × Mathe + Deutsch + Englisch) : 4, mit Noten auf halbe Noten gerundet, höchstens eine Note unter 4. Geometrie ist als «nicht geprüft» markiert und kommt weder im Tagestraining noch in der Prüfungssimulation vor.',
        source: 'https://www.kvchur.ch/images/Bildungsangebot/M-Profil/Downloads/Aufnahme/Aufnahmereglement/Aufnahmereglement_19.05_15.pdf'
      },
      {
        title: 'Prüfungsfreie Aufnahme (Art. 4 Aufnahmereglement KV Chur)',
        facts: [
          'Wer bereits eine Aufnahmeprüfung an eine Berufsmaturitätsschule bestanden hat – auch in einem anderen Kanton.',
          'Wer die Übertrittsbedingungen in die vierte Klasse eines Gymnasiums erfüllt.',
          'Wer nach der zweiten Sekundarklasse die Aufnahmeprüfung an die Fach-, Handels-/Wirtschafts- oder Informatikmittelschule bestanden hat.',
          'In Ausnahmefällen entscheidet die Schulleitung.'
        ],
        app: 'Trifft einer dieser Punkte auf dich zu? Dann frag beim KV Chur nach – vielleicht brauchst du gar keine Prüfung. Weiter üben lohnt sich trotzdem für den BM-Unterricht.'
      },
      {
        title: 'Kantonale Berufsmaturitätsverordnung Graubünden (kBMV, BR 430.400)',
        facts: [
          '<b>Art. 4:</b> Für die lehrbegleitende BM ist grundsätzlich eine schriftliche Aufnahmeprüfung nötig; Ausnahmen regelt die Verordnung bzw. das Reglement der Schule.',
          'Die Einzelheiten der Prüfung (Fächer, Gewichtung, Bestehen) legt die Schule in ihrem Aufnahmereglement fest – siehe oben.'
        ],
        source: 'https://www.gr-lex.gr.ch/app/de/texts_of_law/430.400'
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
        app: 'Weil das KV-Reglement keine Dauer nennt, nimmt die «Vollprüfung» in der App diese Zeiten als Richtwert: Deutsch 90 min, Englisch 60 min, Mathe 60 min (nur Arithmetik & Algebra – Geometrie wird am KV Chur nicht geprüft).',
        source: 'https://www.gr.ch/DE/institutionen/verwaltung/ekud/ahb/mittelschulen/dienstleistungen/aufnahmepruefungen/einheitspruefung/Seiten/info.aspx'
      },
      {
        title: 'Hörverständnis – Zusatztraining',
        facts: [
          'Das Aufnahmereglement KV Chur erwähnt <b>kein Hörverständnis</b> (Art. 10: schriftliche Prüfung). Hören trainiert aber Wortschatz und Verstehen – und im BM-Unterricht kommt es vor.',
          'Vor dem Hören hast du kurz Zeit, die Fragen zu lesen. Nutze sie und unterstreiche Schlüsselwörter!',
          'Jeder Hörtext wird in der Regel <b>zweimal</b> abgespielt.',
          'Beim ersten Hören: Fragen grob beantworten. Beim zweiten Hören: kontrollieren und Lücken füllen.',
          'Zahlen, Uhrzeiten, Preise und Namen sofort notieren – sie werden oft gefragt.',
          'Nichts leer lassen: Bei Multiple Choice lieber raten.'
        ],
        app: 'In der Prüfungssimulation Englisch kannst du das Hörverständnis freiwillig dazuschalten (+15 min). Jeder Hörtext kann dann genau zweimal abgespielt werden, ohne Text zum Mitlesen – wie an der echten Prüfung. Beim Üben darfst du beliebig oft hören und den Text danach anzeigen.'
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
