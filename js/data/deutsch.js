/* BM-Trainer – Deutsch (Schweizer Rechtschreibung: ss statt ß) */
(function (root) {
  'use strict';
  const BMP = root.BMP;

  const WA = ['Nomen', 'Verb', 'Adjektiv', 'Pronomen', 'Partikel'];
  const FALL = ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'];
  const ZEIT = ['Präsens', 'Präteritum', 'Perfekt', 'Plusquamperfekt', 'Futur I'];
  const SG = ['Subjekt', 'Prädikat', 'Akkusativobjekt', 'Dativobjekt', 'Adverbiale'];

  const wa = (id, q, ans, explain) => ({ id, topic: 'wortarten', type: 'mc', q: 'Welche Wortart ist das unterstrichene Wort?<br>' + q, options: WA, answer: WA.indexOf(ans), explain });
  const fall = (id, q, ans, explain) => ({ id, topic: 'faelle', type: 'mc', q: 'In welchem Fall steht der unterstrichene Teil?<br>' + q, options: FALL, answer: FALL.indexOf(ans), explain });
  const zeit = (id, q, ans, explain) => ({ id, topic: 'zeitformen', type: 'mc', q: 'Bestimme die Zeitform:<br>' + q, options: ZEIT, answer: ZEIT.indexOf(ans), explain });
  const sg = (id, q, ans, explain) => ({ id, topic: 'satzglieder', type: 'mc', q: 'Welches Satzglied ist unterstrichen?<br>' + q, options: SG, answer: SG.indexOf(ans), explain });

  const P_HANDY = {
    title: 'Das Handy im Klassenzimmer',
    text: `<p>An vielen Schweizer Schulen wird darüber diskutiert, ob Handys während des Unterrichts verboten werden sollen. Einige Schulen haben bereits strenge Regeln eingeführt: Die Geräte müssen am Morgen in einer Box abgegeben werden und bleiben dort bis Schulschluss.</p>
<p>Die Befürworterinnen und Befürworter eines Verbots argumentieren, dass sich die Jugendlichen ohne Handy besser konzentrieren können. Zudem würden sie in den Pausen wieder mehr miteinander reden, statt still auf einen Bildschirm zu starren. Auch Cybermobbing während der Schulzeit lasse sich so eindämmen.</p>
<p>Die Gegnerinnen und Gegner halten dagegen, dass das Handy ein wichtiges Arbeitsinstrument sei. Man könne damit Informationen recherchieren, Vokabeln üben oder Lernvideos anschauen. Wer den Umgang mit digitalen Medien lernen solle, brauche dafür auch Gelegenheiten im Unterricht. Ein Verbot sei deshalb keine Lösung, sondern verschiebe das Problem nur in die Freizeit.</p>
<p>Viele Fachleute schlagen einen Mittelweg vor: Das Handy bleibt grundsätzlich ausgeschaltet, darf aber gezielt eingesetzt werden, wenn die Lehrperson es erlaubt. Entscheidend sei, dass klare Regeln gemeinsam erarbeitet und von allen eingehalten werden.</p>`
  };

  const P_WOLF = {
    title: 'Die Rückkehr des Wolfes',
    text: `<p>Lange Zeit galt der Wolf in der Schweiz als ausgerottet. Seit den 1990er-Jahren wandern jedoch wieder einzelne Tiere aus Italien und Frankreich ein. Im Jahr 2012 bildete sich am Calanda bei Chur das erste Rudel der Schweiz. Seither ist die Zahl der Wölfe deutlich gestiegen, besonders in den Kantonen Graubünden und Wallis.</p>
<p>Für viele Naturschützerinnen und Naturschützer ist die Rückkehr des Wolfes ein Erfolg. Als Raubtier jagt er vor allem Hirsche, Rehe und Gämsen. Dadurch hilft er mit, dass die Wildbestände nicht zu gross werden und junge Bäume im Schutzwald weniger angefressen werden.</p>
<p>Ganz anders sieht es aus Sicht vieler Bauernfamilien aus. Wölfe reissen immer wieder Schafe und Ziegen, die im Sommer auf den Alpen weiden. Herdenschutzhunde, elektrische Zäune und Hirtinnen oder Hirten können das Risiko verringern, kosten aber viel Geld und Arbeit. Zudem lassen sich nicht alle Weiden gut schützen.</p>
<p>Die Politik sucht deshalb nach einem Kompromiss: Der Wolf bleibt eine geschützte Tierart, doch Rudel, die grosse Schäden anrichten, dürfen unter bestimmten Bedingungen reguliert werden. Ob dieser Weg das Zusammenleben von Mensch und Wolf dauerhaft verbessert, wird sich erst in einigen Jahren zeigen.</p>`
  };

  const P_LEHRE = {
    title: 'Ein Tag als Schnupperlernende',
    text: `<p>Nervös stand Elena um sieben Uhr vor dem Eingang der Schreinerei. Sie hatte sich lange überlegt, ob sie Schreinerin oder doch lieber Zeichnerin werden wollte. Nun durfte sie drei Tage schnuppern.</p>
<p>Der Lehrmeister, Herr Caduff, begrüsste sie mit einem festen Händedruck und zeigte ihr die Werkstatt. Überall roch es nach frischem Holz. «Bei uns gilt: Sicherheit zuerst», sagte er und reichte ihr eine Schutzbrille und Gehörschutz.</p>
<p>Am Vormittag durfte Elena zusammen mit Luca, einem Lernenden im zweiten Lehrjahr, ein kleines Gewürzregal bauen. Sie mass die Bretter aus, zeichnete die Schnittlinien an und schliff die Kanten. Dass sie dabei genau arbeiten musste, merkte sie schnell: Ein Millimeter zu viel, und die Teile passten nicht mehr zusammen.</p>
<p>Am Abend war sie müde, aber stolz. Zu Hause stellte sie das Regal in die Küche. «Und, weisst du jetzt, was du werden willst?», fragte ihre Mutter. Elena lächelte. «Noch nicht ganz. Aber ich weiss jetzt, dass ich gerne mit den Händen arbeite.»</p>`
  };

  const items = [
    /* Wortarten (5-Wortarten-Lehre: Nomen, Verb, Adjektiv, Pronomen, Partikel) */
    wa('d-wa1', 'Wir gehen <u>morgen</u> ins Kino.', 'Partikel', '«morgen» ist ein Adverb – in der 5-Wortarten-Lehre eine Partikel (unveränderlich).'),
    wa('d-wa2', 'Das <u>schnelle</u> Auto fährt vorbei.', 'Adjektiv', '«schnell» beschreibt das Auto näher und lässt sich steigern (schneller, am schnellsten).'),
    wa('d-wa3', 'Sie wartet <u>trotz</u> des Regens draussen.', 'Partikel', '«trotz» ist eine Präposition (Partikel). Sie verlangt den Genitiv.'),
    wa('d-wa4', 'Ich bleibe zu Hause, <u>weil</u> ich krank bin.', 'Partikel', '«weil» ist eine Konjunktion (Partikel) und leitet einen Nebensatz ein.'),
    wa('d-wa5', '<u>Ihr</u> habt den Bus verpasst.', 'Pronomen', '«ihr» ist ein Personalpronomen (2. Person Plural).'),
    wa('d-wa6', 'Das <u>Lesen</u> macht mir Spass.', 'Nomen', 'Das Verb «lesen» wird hier als Nomen gebraucht (nominalisiert) – erkennbar am Artikel «das». Darum auch gross geschrieben.'),
    wa('d-wa7', 'Der Hund <u>bellte</u> die ganze Nacht.', 'Verb', '«bellte» ist eine konjugierte Verbform (Präteritum von «bellen»).'),
    wa('d-wa8', '<u>Dieses</u> Buch gefällt mir.', 'Pronomen', '«dieses» ist ein Demonstrativpronomen (hinweisendes Fürwort), das hier das Nomen begleitet.'),
    wa('d-wa9', 'Am Abend wird es <u>kühler</u>.', 'Adjektiv', '«kühler» ist der Komparativ (1. Steigerungsstufe) des Adjektivs «kühl».'),
    wa('d-wa10', 'Er <u>hat</u> lange geschlafen.', 'Verb', '«hat» ist hier ein Hilfsverb und bildet zusammen mit «geschlafen» das Perfekt.'),
    wa('d-wa11', 'Wir wandern <u>durch</u> den Wald.', 'Partikel', '«durch» ist eine Präposition (Partikel) mit Akkusativ.'),
    wa('d-wa12', 'Die <u>Freundschaft</u> ist mir wichtig.', 'Nomen', 'Wörter auf -schaft, -heit, -keit, -ung, -nis sind Nomen.'),

    /* Fälle */
    fall('d-f1', 'Ich schenke <u>meiner Schwester</u> ein Buch.', 'Dativ', 'Frage: <i>Wem</i> schenke ich ein Buch? → meiner Schwester (Dativ).'),
    fall('d-f2', 'Ich schenke meiner Schwester <u>ein Buch</u>.', 'Akkusativ', 'Frage: <i>Wen oder was</i> schenke ich? → ein Buch (Akkusativ).'),
    fall('d-f3', '<u>Der neue Lehrer</u> kommt aus Chur.', 'Nominativ', 'Frage: <i>Wer</i> kommt aus Chur? → der neue Lehrer (Nominativ, Subjekt).'),
    fall('d-f4', 'Das ist das Velo <u>meines Bruders</u>.', 'Genitiv', 'Frage: <i>Wessen</i> Velo? → meines Bruders (Genitiv).'),
    fall('d-f5', 'Wir warten auf <u>den Zug</u>.', 'Akkusativ', '«warten auf» verlangt den Akkusativ: Auf <i>wen oder was</i> warten wir?'),
    fall('d-f6', 'Sie wohnt bei <u>ihrer Tante</u>.', 'Dativ', 'Die Präposition «bei» verlangt immer den Dativ.'),
    fall('d-f7', 'Wegen <u>des Gewitters</u> fiel das Spiel aus.', 'Genitiv', '«wegen» verlangt in der Standardsprache den Genitiv.'),
    fall('d-f8', 'Er hilft <u>dem alten Mann</u>.', 'Dativ', '«helfen» verlangt den Dativ: <i>Wem</i> hilft er?'),
    fall('d-f9', 'Mein Vater ist <u>ein guter Koch</u>.', 'Nominativ', 'Nach «sein», «werden», «bleiben» steht der Nominativ (Gleichsetzungsnominativ).'),
    fall('d-f10', 'Ich sehe <u>den Hund</u> im Garten.', 'Akkusativ', 'Frage: <i>Wen oder was</i> sehe ich? → den Hund.'),
    { id: 'd-f11', topic: 'faelle', type: 'text', q: 'Setze richtig ein: Ich fahre mit ___ (der Bus) zur Schule.', answer: ['dem Bus'],
      explain: '«mit» verlangt immer den Dativ: mit dem Bus.' },
    { id: 'd-f12', topic: 'faelle', type: 'text', q: 'Setze richtig ein: Trotz ___ (der Regen) gingen wir wandern.', answer: ['des Regens'],
      explain: '«trotz» verlangt in der Standardsprache den Genitiv: trotz des Regens.' },
    { id: 'd-f13', topic: 'faelle', type: 'text', q: 'Setze richtig ein: Sie legt das Buch auf ___ (der Tisch).', answer: ['den Tisch'],
      explain: 'Wechselpräposition «auf»: Richtung (<i>wohin?</i>) → Akkusativ: auf den Tisch.' },
    { id: 'd-f14', topic: 'faelle', type: 'text', q: 'Setze richtig ein: Das Buch liegt auf ___ (der Tisch).', answer: ['dem Tisch'],
      explain: 'Wechselpräposition «auf»: Ort (<i>wo?</i>) → Dativ: auf dem Tisch.' },
    { id: 'd-f15', topic: 'faelle', type: 'text', q: 'Setze richtig ein: Wir gratulieren ___ (unsere Lehrerin) zum Geburtstag.', answer: ['unserer Lehrerin'],
      explain: '«gratulieren» verlangt den Dativ: <i>Wem</i> gratulieren wir? → unserer Lehrerin.' },

    /* Zeitformen */
    zeit('d-z1', '<u>Wir hatten schon gegessen</u>, als er kam.', 'Plusquamperfekt', '«hatten … gegessen»: Hilfsverb im Präteritum + Partizip II = Plusquamperfekt (Vorvergangenheit).'),
    zeit('d-z2', 'Sie ist nach Italien gefahren.', 'Perfekt', '«ist … gefahren»: Hilfsverb im Präsens + Partizip II = Perfekt.'),
    zeit('d-z3', 'Er las das Buch in einem Tag.', 'Präteritum', '«las» ist die einfache Vergangenheitsform von «lesen».'),
    zeit('d-z4', 'Morgen werde ich früher aufstehen.', 'Futur I', '«werde … aufstehen»: werden + Infinitiv = Futur I.'),
    zeit('d-z5', 'Die Kinder spielen im Garten.', 'Präsens', '«spielen» steht in der Gegenwart.'),
    zeit('d-z6', 'Ich habe den Schlüssel verloren.', 'Perfekt', '«habe … verloren»: Hilfsverb im Präsens + Partizip II = Perfekt.'),
    zeit('d-z7', 'Als wir ankamen, war der Film bereits zu Ende gegangen.', 'Plusquamperfekt', 'Im Hauptsatz: «war … gegangen» – Hilfsverb im Präteritum + Partizip II = Plusquamperfekt.'),
    { id: 'd-z8', topic: 'zeitformen', type: 'text', q: 'Setze ins Präteritum: «Er bringt das Paket.»', answer: ['Er brachte das Paket'],
      explain: '«bringen» ist unregelmässig: bringen – brachte – gebracht.' },
    { id: 'd-z9', topic: 'zeitformen', type: 'text', q: 'Setze ins Präteritum: «Wir denken an dich.»', answer: ['Wir dachten an dich'],
      explain: '«denken» ist unregelmässig: denken – dachte – gedacht.' },
    { id: 'd-z10', topic: 'zeitformen', type: 'text', q: 'Setze ins Präteritum: «Sie läuft nach Hause.»', answer: ['Sie lief nach Hause'],
      explain: '«laufen» ist stark: laufen – lief – gelaufen.' },
    { id: 'd-z11', topic: 'zeitformen', type: 'text', q: 'Setze ins Perfekt: «Ich schwimme im See.»', answer: ['Ich bin im See geschwommen'],
      explain: '«schwimmen» bildet das Perfekt (in der Schweiz und in Süddeutschland) mit «sein»: ich bin geschwommen.' },
    { id: 'd-z12', topic: 'zeitformen', type: 'text', q: 'Setze ins Perfekt: «Er schreibt einen Brief.»', answer: ['Er hat einen Brief geschrieben'],
      explain: 'schreiben – schrieb – geschrieben; Perfekt mit «haben».' },
    { id: 'd-z13', topic: 'zeitformen', type: 'text', q: 'Indirekte Rede: Er sagt: «Ich bin müde.» → Er sagt, er ___ müde.', answer: ['sei'],
      explain: 'In der indirekten Rede steht der Konjunktiv I: er sei.' },
    { id: 'd-z14', topic: 'zeitformen', type: 'text', q: 'Indirekte Rede: Sie sagt: «Ich habe keine Zeit.» → Sie sagt, sie ___ keine Zeit.', answer: ['habe'],
      explain: 'Konjunktiv I von «haben» in der 3. Person: sie habe.' },

    /* Satzglieder */
    sg('d-s1', '<u>Am Montag</u> schreiben wir eine Prüfung.', 'Adverbiale', '<i>Wann</i> schreiben wir? → Adverbiale der Zeit (Umstandsbestimmung).'),
    sg('d-s2', 'Am Montag schreiben <u>wir</u> eine Prüfung.', 'Subjekt', '<i>Wer</i> schreibt? → wir (Subjekt, Nominativ).'),
    sg('d-s3', 'Am Montag schreiben wir <u>eine Prüfung</u>.', 'Akkusativobjekt', '<i>Wen oder was</i> schreiben wir? → eine Prüfung.'),
    sg('d-s4', 'Die Lehrerin gibt <u>den Schülern</u> die Noten.', 'Dativobjekt', '<i>Wem</i> gibt sie die Noten? → den Schülern.'),
    sg('d-s5', 'Der Hund <u>schläft</u> im Korb.', 'Prädikat', 'Das Prädikat ist das konjugierte Verb (Satzaussage).'),
    sg('d-s6', 'Wir fahren <u>mit dem Zug</u> nach Davos.', 'Adverbiale', '<i>Wie / womit</i> fahren wir? → Adverbiale der Art und Weise.'),
    sg('d-s7', '<u>Meine beste Freundin</u> wohnt in Landquart.', 'Subjekt', '<i>Wer</i> wohnt in Landquart? Das ganze Satzglied «meine beste Freundin» ist das Subjekt.'),
    sg('d-s8', '<u>Wegen der Kälte</u> blieben wir drinnen.', 'Adverbiale', '<i>Warum</i> blieben wir drinnen? → Adverbiale des Grundes.'),
    { id: 'd-s9', topic: 'satzglieder', type: 'number', q: 'Wie viele Satzglieder hat dieser Satz?<br>«Gestern hat meine Mutter im Garten einen Igel gesehen.»', answer: 5,
      explain: 'Umstellprobe: Gestern | hat … gesehen | meine Mutter | im Garten | einen Igel. Das zweiteilige Prädikat zählt als ein Satzglied → 5.' },
    { id: 'd-s10', topic: 'satzglieder', type: 'mc', q: 'Mit welcher Probe findet man heraus, welche Wörter zusammen ein Satzglied bilden?', options: ['Umstellprobe (Verschiebeprobe)', 'Weglassprobe', 'Ersatzprobe', 'Klangprobe'], answer: 0,
      explain: 'Was sich nur zusammen verschieben lässt, ist ein Satzglied. Das konjugierte Verb bleibt im Aussagesatz an zweiter Stelle.' },

    /* Rechtschreibung */
    { id: 'd-r1', topic: 'rechtschreibung', type: 'mc', q: 'Ich hoffe, ___ du morgen kommst.', options: ['das', 'dass'], answer: 1, explain: '«dass» ist eine Konjunktion. Ersatzprobe: Lässt sich «dieses/welches» einsetzen? Nein → dass.' },
    { id: 'd-r2', topic: 'rechtschreibung', type: 'mc', q: 'Das Buch, ___ auf dem Tisch liegt, gehört mir.', options: ['das', 'dass'], answer: 0, explain: 'Relativpronomen: «das Buch, welches auf dem Tisch liegt» → das.' },
    { id: 'd-r3', topic: 'rechtschreibung', type: 'mc', q: 'Er sagt, ___ es morgen regnen wird.', options: ['das', 'dass'], answer: 1, explain: '«welches» passt nicht → Konjunktion «dass».' },
    { id: 'd-r4', topic: 'rechtschreibung', type: 'mc', q: '___ ist eine gute Idee!', options: ['Das', 'Dass'], answer: 0, explain: '«Dieses ist eine gute Idee» – Demonstrativpronomen → Das.' },
    { id: 'd-r5', topic: 'rechtschreibung', type: 'mc', q: 'Wo ___ ihr gestern gewesen?', options: ['seid', 'seit'], answer: 0, explain: '«seid» ist eine Form des Verbs «sein» (ihr seid). «seit» bezeichnet einen Zeitpunkt.' },
    { id: 'd-r6', topic: 'rechtschreibung', type: 'mc', q: 'Ich warte ___ einer Stunde auf dich.', options: ['seid', 'seit'], answer: 1, explain: '«seit» ist eine Präposition der Zeit (seit wann?).' },
    { id: 'd-r7', topic: 'rechtschreibung', type: 'mc', q: 'Er hat schon ___ den Bus verpasst.', options: ['wieder', 'wider'], answer: 0, explain: '«wieder» = nochmals. «wider» = gegen (Widerspruch, widerlegen).' },
    { id: 'd-r8', topic: 'rechtschreibung', type: 'mc', q: 'Das ist ein klarer ___spruch.', options: ['Wieder', 'Wider'], answer: 1, explain: '«Widerspruch» kommt von «wider» = gegen.' },
    { id: 'd-r9', topic: 'rechtschreibung', type: 'mc', q: 'Welcher Satz ist richtig geschrieben?', options: ['Beim Schwimmen habe ich mich erkältet.', 'Beim schwimmen habe ich mich erkältet.', 'beim Schwimmen habe ich mich Erkältet.', 'Beim Schwimmen habe ich mich Erkältet.'], answer: 0,
      explain: '«beim» (= bei dem) macht «Schwimmen» zum Nomen → gross. «erkältet» ist ein Verb → klein.' },
    { id: 'd-r10', topic: 'rechtschreibung', type: 'mc', q: 'Welcher Satz ist richtig geschrieben?', options: ['Wir wünschen dir alles gute.', 'Wir wünschen dir alles Gute.', 'Wir wünschen dir Alles Gute.', 'Wir wünschen dir Alles gute.'], answer: 1,
      explain: 'Nach «alles, nichts, etwas, viel, wenig» werden Adjektive als Nomen gross geschrieben: alles Gute, etwas Neues.' },
    { id: 'd-r11', topic: 'rechtschreibung', type: 'mc', q: 'Welcher Satz ist richtig geschrieben?', options: ['Am Morgen gehe ich joggen, morgens trinke ich Tee.', 'Am morgen gehe ich joggen, morgens trinke ich Tee.', 'Am Morgen gehe ich joggen, Morgens trinke ich Tee.', 'Am morgen gehe ich joggen, Morgens trinke ich Tee.'], answer: 0,
      explain: '«am Morgen» → Nomen (gross). «morgens» (mit -s) ist ein Adverb → klein.' },
    { id: 'd-r12', topic: 'rechtschreibung', type: 'mc', q: 'Welches Wort ist richtig geschrieben?', options: ['Rytmus', 'Rhytmus', 'Rhythmus', 'Rythmus'], answer: 2, explain: 'Rhythmus – aus dem Griechischen, mit zwei h: Rh-y-th-mus.' },
    { id: 'd-r13', topic: 'rechtschreibung', type: 'mc', q: 'Welches Wort ist richtig geschrieben?', options: ['Standart', 'Standard', 'Stanndard', 'Standat'], answer: 1, explain: 'Standard – mit d am Schluss (Merkhilfe: Standards).' },
    { id: 'd-r14', topic: 'rechtschreibung', type: 'mc', q: 'Welches Wort ist richtig geschrieben?', options: ['Reperatur', 'Reparartur', 'Reparatur', 'Repparatur'], answer: 2, explain: 'Reparatur – kommt von «reparieren».' },
    { id: 'd-r15', topic: 'rechtschreibung', type: 'mc', q: 'Welches Wort ist richtig geschrieben?', options: ['Maschiene', 'Maschine', 'Masschine', 'Maschinne'], answer: 1, explain: 'Maschine – Fremdwort, ohne Dehnungs-e.' },
    { id: 'd-r16', topic: 'rechtschreibung', type: 'mc', q: 'Welches Wort ist richtig geschrieben?', options: ['Interresse', 'Intresse', 'Interese', 'Interesse'], answer: 3, explain: 'Interesse – ein r, zwei s.' },
    { id: 'd-r17', topic: 'rechtschreibung', type: 'mc', q: 'Welches Wort ist richtig geschrieben?', options: ['eigendlich', 'eigentlich', 'eigentlig', 'eigenlich'], answer: 1, explain: 'eigentlich – von «eigen» + t + lich.' },
    { id: 'd-r18', topic: 'rechtschreibung', type: 'mc', q: 'Welches Wort ist richtig geschrieben?', options: ['nähmlich', 'nemlich', 'nämlich', 'nähmlig'], answer: 2, explain: 'nämlich – ohne Dehnungs-h. Merksatz: «Wer nämlich mit h schreibt, ist dämlich.»' },
    { id: 'd-r19', topic: 'rechtschreibung', type: 'mc', q: 'Welche Schreibweise gilt in der Schweiz?', options: ['Straße', 'Strasse', 'Strase', 'Strahse'], answer: 1, explain: 'In der Schweiz wird kein ß verwendet, sondern immer ss.' },
    { id: 'd-r20', topic: 'rechtschreibung', type: 'mc', q: 'Welches Wort ist richtig geschrieben?', options: ['Ingeneur', 'Ingenieuer', 'Ingenieur', 'Inschenieur'], answer: 2, explain: 'Ingenieur – aus dem Französischen (ingénieur).' },

    /* Kommasetzung */
    { id: 'd-k1', topic: 'kommas', type: 'mc', q: 'In welchem Satz ist das Komma richtig gesetzt?', options: ['Ich glaube dass, er recht hat.', 'Ich glaube, dass er recht hat.', 'Ich glaube dass er recht hat.', 'Ich, glaube dass er recht hat.'], answer: 1,
      explain: 'Nebensätze werden durch Komma abgetrennt – das Komma steht vor der Konjunktion «dass».' },
    { id: 'd-k2', topic: 'kommas', type: 'mc', q: 'In welchem Satz sind die Kommas richtig gesetzt?', options: ['Der Film den wir gestern gesehen haben, war spannend.', 'Der Film, den wir gestern gesehen haben war spannend.', 'Der Film, den wir gestern gesehen haben, war spannend.', 'Der Film, den wir gestern, gesehen haben, war spannend.'], answer: 2,
      explain: 'Ein eingeschobener Relativsatz wird vorne <i>und</i> hinten mit Komma abgetrennt.' },
    { id: 'd-k3', topic: 'kommas', type: 'mc', q: 'In welchem Satz sind die Kommas richtig gesetzt?', options: ['Wir kaufen Brot, Käse, Äpfel, und Milch.', 'Wir kaufen Brot Käse, Äpfel und Milch.', 'Wir kaufen Brot, Käse Äpfel und Milch.', 'Wir kaufen Brot, Käse, Äpfel und Milch.'], answer: 3,
      explain: 'Aufzählungen werden mit Komma getrennt – aber nicht vor «und» bzw. «oder».' },
    { id: 'd-k4', topic: 'kommas', type: 'mc', q: 'In welchem Satz ist das Komma richtig gesetzt?', options: ['Sie ging in die Stadt, um ein Geschenk zu kaufen.', 'Sie ging, in die Stadt um ein Geschenk zu kaufen.', 'Sie ging in die Stadt um, ein Geschenk zu kaufen.', 'Sie ging in die Stadt um ein Geschenk, zu kaufen.'], answer: 0,
      explain: 'Infinitivgruppen mit «um … zu», «ohne … zu», «statt … zu» werden immer mit Komma abgetrennt.' },
    { id: 'd-k5', topic: 'kommas', type: 'mc', q: 'In welchem Satz ist das Komma richtig gesetzt?', options: ['Lena kannst du, mir helfen?', 'Lena, kannst du mir helfen?', 'Lena kannst, du mir helfen?', 'Lena kannst du mir, helfen?'], answer: 1,
      explain: 'Eine Anrede wird mit Komma abgetrennt.' },
    { id: 'd-k6', topic: 'kommas', type: 'mc', q: 'In welchem Satz ist das Komma richtig gesetzt?', options: ['Als es zu regnen, begann gingen wir nach Hause.', 'Als, es zu regnen begann gingen wir nach Hause.', 'Als es zu regnen begann, gingen wir nach Hause.', 'Als es zu regnen begann gingen, wir nach Hause.'], answer: 2,
      explain: 'Der Nebensatz endet mit dem konjugierten Verb «begann» – dort steht das Komma, vor dem Hauptsatz.' },
    { id: 'd-k7', topic: 'kommas', type: 'mc', q: 'In welchem Satz ist das Komma richtig gesetzt?', options: ['Ich wollte kommen aber, ich hatte keine Zeit.', 'Ich wollte, kommen aber ich hatte keine Zeit.', 'Ich wollte kommen aber ich hatte, keine Zeit.', 'Ich wollte kommen, aber ich hatte keine Zeit.'], answer: 3,
      explain: 'Vor entgegensetzenden Konjunktionen wie «aber», «sondern», «doch» steht ein Komma.' },
    { id: 'd-k8', topic: 'kommas', type: 'number', q: 'Wie viele Kommas fehlen in diesem Satz?<br>«Obwohl es kalt war gingen wir die wir eigentlich müde waren noch spazieren.»', answer: 3,
      explain: 'Obwohl es kalt war<b>,</b> gingen wir<b>,</b> die wir eigentlich müde waren<b>,</b> noch spazieren. → 3 Kommas.' },
    { id: 'd-k9', topic: 'kommas', type: 'mc', q: 'In welchem Satz sind die Kommas richtig gesetzt?', options: ['Herr Meier, unser Hauswart, repariert die Heizung.', 'Herr Meier unser Hauswart, repariert die Heizung.', 'Herr Meier, unser Hauswart repariert die Heizung.', 'Herr Meier unser, Hauswart repariert die Heizung.'], answer: 0,
      explain: 'Ein Beisatz (Apposition) wird vorne und hinten mit Komma abgetrennt.' },

    /* Wortschatz */
    { id: 'd-w1', topic: 'wortschatz', type: 'mc', q: 'Welches Wort bedeutet dasselbe wie «beginnen»?', options: ['beenden', 'anfangen', 'bemerken', 'behalten'], answer: 1, explain: 'Synonym (gleiche Bedeutung): beginnen = anfangen.' },
    { id: 'd-w2', topic: 'wortschatz', type: 'mc', q: 'Was ist das Gegenteil von «grosszügig»?', options: ['freundlich', 'ehrlich', 'geizig', 'mutig'], answer: 2, explain: 'Antonym (Gegenteil): grosszügig ↔ geizig.' },
    { id: 'd-w3', topic: 'wortschatz', type: 'mc', q: 'Was ist ein «Kompromiss»?', options: ['Ein Streit ohne Lösung', 'Eine Einigung, bei der beide Seiten nachgeben', 'Ein Versprechen', 'Ein grosses Lob'], answer: 1, explain: 'Bei einem Kompromiss kommen sich beide Seiten entgegen.' },
    { id: 'd-w4', topic: 'wortschatz', type: 'mc', q: 'Was bedeutet «ambivalent»?', options: ['zwiespältig', 'eindeutig', 'freundlich', 'aggressiv'], answer: 0, explain: 'Ambivalent = zwiespältig, man hat gemischte Gefühle (z. B. «Ich bin ambivalent: Ich freue mich und habe gleichzeitig Angst»).' },
    { id: 'd-w5', topic: 'wortschatz', type: 'mc', q: 'Was ist eine «Prognose»?', options: ['ein Rückblick', 'eine Vorhersage', 'eine Zusammenfassung', 'eine Entschuldigung'], answer: 1, explain: 'Prognose = Vorhersage (z. B. Wetterprognose).' },
    { id: 'd-w6', topic: 'wortschatz', type: 'mc', q: 'Was bedeutet «subjektiv»?', options: ['sachlich und neutral', 'wissenschaftlich bewiesen', 'von der persönlichen Sicht geprägt', 'unwichtig'], answer: 2, explain: 'Subjektiv = aus persönlicher Sicht. Gegenteil: objektiv = sachlich, neutral.' },
    { id: 'd-w7', topic: 'wortschatz', type: 'mc', q: 'Was bedeutet «jemandem auf den Wecker gehen»?', options: ['jemanden am Morgen wecken', 'jemanden nerven', 'pünktlich sein', 'jemanden besuchen'], answer: 1, explain: 'Redewendung: jemandem auf den Wecker (auf die Nerven) gehen = jemanden nerven.' },
    { id: 'd-w8', topic: 'wortschatz', type: 'mc', q: 'Was bedeutet «den Nagel auf den Kopf treffen»?', options: ['sich verletzen', 'handwerklich geschickt sein', 'genau das Richtige sagen', 'jemanden beleidigen'], answer: 2, explain: 'Wer den Nagel auf den Kopf trifft, erkennt oder sagt genau das Entscheidende.' },
    { id: 'd-w9', topic: 'wortschatz', type: 'mc', q: 'Was bedeutet «etwas auf die lange Bank schieben»?', options: ['etwas aufschieben', 'etwas verstecken', 'etwas teilen', 'etwas verkaufen'], answer: 0, explain: 'Etwas auf die lange Bank schieben = etwas immer wieder hinauszögern.' },
    { id: 'd-w10', topic: 'wortschatz', type: 'mc', q: 'Was ist das Gegenteil von «optimistisch»?', options: ['realistisch', 'pessimistisch', 'egoistisch', 'fantastisch'], answer: 1, explain: 'Optimistisch (zuversichtlich) ↔ pessimistisch (schwarzseherisch).' },
    { id: 'd-w11', topic: 'wortschatz', type: 'mc', q: 'Welches Wort passt nicht in die Reihe? laufen – rennen – sprinten – sitzen', options: ['laufen', 'rennen', 'sprinten', 'sitzen'], answer: 3, explain: 'Laufen, rennen und sprinten sind Fortbewegungen – sitzen nicht.' },
    { id: 'd-w12', topic: 'wortschatz', type: 'mc', q: 'Welches Wort ist ein Synonym für «Ursache»?', options: ['Folge', 'Wirkung', 'Grund', 'Ziel'], answer: 2, explain: 'Ursache = Grund. Folge und Wirkung sind das Gegenteil (was daraus entsteht).' },
    { id: 'd-w13', topic: 'wortschatz', type: 'mc', q: 'Was ist eine «Hypothese»?', options: ['eine bewiesene Tatsache', 'eine Annahme, die noch überprüft werden muss', 'eine Geschichte mit Moral', 'eine Gleichung'], answer: 1, explain: 'Eine Hypothese ist eine Vermutung, die man (z. B. mit einem Experiment) überprüft.' },
    { id: 'd-w14', topic: 'wortschatz', type: 'mc', q: 'Was bedeutet «kontrovers»?', options: ['umstritten', 'langweilig', 'kompliziert', 'einstimmig'], answer: 0, explain: 'Ein kontroverses Thema wird unterschiedlich beurteilt und heftig diskutiert.' },

    /* Textverständnis */
    { id: 'd-t1', topic: 'textverstaendnis', passage: P_HANDY, type: 'mc', q: 'Was ist das Hauptthema des Textes?', options: ['Wie man ein Handy repariert', 'Ob Handys im Unterricht verboten werden sollen', 'Wie viel Zeit Jugendliche am Handy verbringen', 'Welche Handymarken am beliebtesten sind'], answer: 1,
      explain: 'Der erste Abschnitt nennt das Thema: die Diskussion über ein Handyverbot im Unterricht.' },
    { id: 'd-t2', topic: 'textverstaendnis', passage: P_HANDY, type: 'mc', q: 'Welches Argument nennen die Befürworter eines Verbots <b>nicht</b>?', options: ['bessere Konzentration', 'mehr Gespräche in der Pause', 'weniger Cybermobbing', 'tiefere Kosten für die Schule'], answer: 3,
      explain: 'Im zweiten Abschnitt werden Konzentration, Gespräche und Cybermobbing genannt – Kosten nicht.' },
    { id: 'd-t3', topic: 'textverstaendnis', passage: P_HANDY, type: 'mc', q: 'Was meinen die Gegner mit «verschiebe das Problem nur in die Freizeit»?', options: ['Die Jugendlichen hätten dann weniger Freizeit.', 'Den richtigen Umgang mit dem Handy müsste man dann ausserhalb der Schule lernen.', 'In der Freizeit gebe es keine Probleme mit Handys.', 'Die Schule sollte länger dauern.'], answer: 1,
      explain: 'Wenn die Schule das Handy verbietet, lernt man den Umgang damit nicht im Unterricht – das Problem bleibt einfach ausserhalb der Schule bestehen.' },
    { id: 'd-t4', topic: 'textverstaendnis', passage: P_HANDY, type: 'mc', q: 'Welche Lösung schlagen viele Fachleute vor?', options: ['ein vollständiges Verbot', 'gar keine Regeln', 'Handy grundsätzlich aus, gezielter Einsatz mit Erlaubnis', 'nur noch Tablets statt Handys'], answer: 2,
      explain: 'Letzter Abschnitt: ein Mittelweg mit gemeinsam erarbeiteten Regeln.' },
    { id: 'd-t5', topic: 'textverstaendnis', passage: P_HANDY, type: 'mc', q: 'Um welche Textsorte handelt es sich am ehesten?', options: ['Märchen', 'Sachtext / Bericht über eine Debatte', 'Gedicht', 'Bedienungsanleitung'], answer: 1,
      explain: 'Der Text informiert sachlich über verschiedene Positionen (Pro und Contra).' },

    { id: 'd-t6', topic: 'textverstaendnis', passage: P_WOLF, type: 'mc', q: 'Wo bildete sich das erste Wolfsrudel der Schweiz?', options: ['im Wallis', 'am Calanda bei Chur', 'im Tessin', 'im Jura'], answer: 1, explain: 'Erster Abschnitt: «Im Jahr 2012 bildete sich am Calanda bei Chur das erste Rudel der Schweiz.»' },
    { id: 'd-t7', topic: 'textverstaendnis', passage: P_WOLF, type: 'mc', q: 'Warum ist der Wolf laut Text gut für den Schutzwald?', options: ['Er frisst Schädlinge an den Bäumen.', 'Er hält die Wildbestände klein, sodass junge Bäume weniger angefressen werden.', 'Er düngt den Boden.', 'Er vertreibt die Touristen.'], answer: 1,
      explain: 'Zweiter Abschnitt: weniger Wild → junge Bäume werden weniger angefressen.' },
    { id: 'd-t8', topic: 'textverstaendnis', passage: P_WOLF, type: 'mc', q: 'Welche Schutzmassnahme für Schafe wird im Text <b>nicht</b> genannt?', options: ['Herdenschutzhunde', 'elektrische Zäune', 'Hirtinnen und Hirten', 'Ställe mit Videoüberwachung'], answer: 3, explain: 'Dritter Abschnitt nennt Hunde, Zäune und Hirten.' },
    { id: 'd-t9', topic: 'textverstaendnis', passage: P_WOLF, type: 'mc', q: 'Welche Aussage entspricht dem Text?', options: ['Der Wolf ist in der Schweiz nicht mehr geschützt.', 'Alle Wölfe dürfen jederzeit gejagt werden.', 'Rudel mit grossen Schäden dürfen unter Bedingungen reguliert werden.', 'Die Politik hat das Problem endgültig gelöst.'], answer: 2,
      explain: 'Letzter Abschnitt: geschützt, aber Regulierung unter Bedingungen möglich – und ob das funktioniert, ist noch offen.' },
    { id: 'd-t10', topic: 'textverstaendnis', passage: P_WOLF, type: 'mc', q: 'Welche Haltung nimmt der Text ein?', options: ['Er ist klar gegen den Wolf.', 'Er ist klar für den Wolf.', 'Er stellt verschiedene Sichtweisen dar.', 'Er macht sich über die Bauern lustig.'], answer: 2,
      explain: 'Der Text stellt Naturschutz- und Bauernsicht nebeneinander und lässt die Zukunft offen.' },

    { id: 'd-t11', topic: 'textverstaendnis', passage: P_LEHRE, type: 'mc', q: 'Wie fühlt sich Elena am Morgen?', options: ['gelangweilt', 'nervös', 'wütend', 'traurig'], answer: 1, explain: 'Erster Satz: «Nervös stand Elena …»' },
    { id: 'd-t12', topic: 'textverstaendnis', passage: P_LEHRE, type: 'mc', q: 'Was lernt Elena beim Bau des Regals vor allem?', options: ['dass sie schnell arbeiten muss', 'dass sie genau arbeiten muss', 'dass Holz teuer ist', 'dass sie lieber Zeichnerin wird'], answer: 1, explain: '«Ein Millimeter zu viel, und die Teile passten nicht mehr zusammen.»' },
    { id: 'd-t13', topic: 'textverstaendnis', passage: P_LEHRE, type: 'mc', q: 'Wer ist Luca?', options: ['Elenas Bruder', 'der Lehrmeister', 'ein Lernender im 2. Lehrjahr', 'ein Kunde'], answer: 2, explain: 'Dritter Abschnitt: «Luca, einem Lernenden im zweiten Lehrjahr».' },
    { id: 'd-t14', topic: 'textverstaendnis', passage: P_LEHRE, type: 'mc', q: 'Welche Aussage passt zum Schluss der Geschichte?', options: ['Elena hat sich definitiv für die Schreinerlehre entschieden.', 'Elena will nie mehr schnuppern.', 'Elena hat etwas über sich selbst herausgefunden, ist aber noch unentschieden.', 'Elenas Mutter ist enttäuscht.'], answer: 2,
      explain: '«Noch nicht ganz. Aber ich weiss jetzt, dass ich gerne mit den Händen arbeite.»' },
    { id: 'd-t15', topic: 'textverstaendnis', passage: P_LEHRE, type: 'mc', q: 'In welcher Zeitform ist die Geschichte hauptsächlich erzählt?', options: ['Präsens', 'Präteritum', 'Perfekt', 'Futur I'], answer: 1, explain: 'stand, begrüsste, zeigte, durfte … – typisch für Erzählungen ist das Präteritum.' }
  ];

  const writing = [
    { title: 'Handyverbot an der Schule?', kind: 'Erörterung', task: 'Soll das Handy an der Schule ganz verboten werden? Nimm Stellung. Nenne mindestens zwei Argumente dafür und zwei dagegen und begründe am Schluss deine eigene Meinung.', minWords: 300, minutes: 60 },
    { title: 'Ein Erlebnis, das mich verändert hat', kind: 'Erlebniserzählung', task: 'Erzähle von einem Erlebnis, nach dem du etwas anders gesehen hast als vorher. Baue Spannung auf, verwende wörtliche Rede und beschreibe auch deine Gefühle.', minWords: 300, minutes: 60 },
    { title: 'Mein Wunschberuf', kind: 'Bericht / Begründung', task: 'Beschreibe deinen Wunschberuf. Was macht man in diesem Beruf? Welche Fähigkeiten braucht es? Warum passt er zu dir – und warum möchtest du die Berufsmaturität machen?', minWords: 250, minutes: 50 },
    { title: 'Ein Treffpunkt für Jugendliche', kind: 'Formeller Brief', task: 'Schreibe einen Brief an den Gemeinderat deiner Wohngemeinde. Begründe, warum die Jugendlichen einen eigenen Treffpunkt brauchen, und mache einen konkreten Vorschlag. Achte auf die Briefform (Absender, Empfänger, Ort/Datum, Betreff, Anrede, Grussformel).', minWords: 200, minutes: 45 },
    { title: 'Social Media – Fluch oder Segen?', kind: 'Erörterung', task: 'Diskutiere die Vor- und Nachteile von Social Media für Jugendliche. Belege deine Argumente mit Beispielen und komme zu einem begründeten Schluss.', minWords: 300, minutes: 60 },
    { title: 'Ein Ort, an dem ich mich wohlfühle', kind: 'Schilderung', task: 'Beschreibe einen Ort, an dem du dich wohlfühlst, so anschaulich, dass man ihn sich vorstellen kann. Sprich alle Sinne an: Was siehst, hörst, riechst und spürst du dort?', minWords: 250, minutes: 45 }
  ];

  const checklist = [
    'Einleitung, Hauptteil und Schluss sind klar erkennbar.',
    'Jeder neue Gedanke beginnt mit einem neuen Abschnitt.',
    'Ich habe das Thema genau beantwortet (nicht abgeschweift).',
    'Meine Argumente/Aussagen sind mit Beispielen begründet.',
    'Die Satzanfänge sind abwechslungsreich, keine Wortwiederholungen.',
    'Die Zeitform ist einheitlich (Erzählung meist im Präteritum).',
    'Rechtschreibung kontrolliert: das/dass, Gross-/Kleinschreibung, ss.',
    'Kommas kontrolliert: vor Nebensätzen, bei Aufzählungen, vor «aber».',
    'Der Titel passt zum Inhalt.'
  ];

  const merkblatt = `
<h3>Die 5 Wortarten</h3>
<ul><li><b>Verb</b> – konjugierbar (ich gehe, du gingst). Hilfsverben: sein, haben, werden.</li>
<li><b>Nomen</b> – mit Artikel, gross geschrieben (das Haus, das Lesen).</li>
<li><b>Adjektiv</b> – steigerbar (schön, schöner, am schönsten).</li>
<li><b>Pronomen</b> – Begleiter oder Stellvertreter des Nomens (ich, dieser, mein, welcher; auch Artikel).</li>
<li><b>Partikel</b> – unveränderlich: Adverbien (heute, dort), Präpositionen (mit, wegen), Konjunktionen (und, weil, dass).</li></ul>
<h3>Die 4 Fälle</h3>
<ul><li>Nominativ – <i>Wer oder was?</i> (der Hund)</li><li>Genitiv – <i>Wessen?</i> (des Hundes)</li>
<li>Dativ – <i>Wem?</i> (dem Hund)</li><li>Akkusativ – <i>Wen oder was?</i> (den Hund)</li>
<li>Immer Dativ: aus, bei, mit, nach, seit, von, zu &nbsp;|&nbsp; Immer Akkusativ: durch, für, gegen, ohne, um</li>
<li>Genitiv: wegen, trotz, während, statt &nbsp;|&nbsp; Wechselpräpositionen (in, an, auf, über, unter, vor, hinter, neben, zwischen): <i>Wo?</i> → Dativ, <i>Wohin?</i> → Akkusativ</li></ul>
<h3>Zeitformen (Beispiel: gehen)</h3>
<ul><li>Präsens: ich gehe &nbsp;|&nbsp; Präteritum: ich ging</li><li>Perfekt: ich bin gegangen &nbsp;|&nbsp; Plusquamperfekt: ich war gegangen</li>
<li>Futur I: ich werde gehen &nbsp;|&nbsp; Futur II: ich werde gegangen sein</li>
<li>Indirekte Rede: Konjunktiv I (er sei, sie habe, er komme)</li></ul>
<h3>Satzglieder</h3>
<ul><li>Umstellprobe: Was zusammen verschoben werden kann, ist ein Satzglied.</li>
<li>Subjekt (Wer?), Prädikat (Verb), Akkusativobjekt (Wen/Was?), Dativobjekt (Wem?), Adverbiale (Wann? Wo? Wie? Warum?).</li></ul>
<h3>das oder dass?</h3>
<ul><li>Kann man <i>dieses</i>, <i>jenes</i> oder <i>welches</i> einsetzen → <b>das</b>. Sonst → <b>dass</b> (Konjunktion).</li></ul>
<h3>Grossschreibung</h3>
<ul><li>Nomen und Nominalisierungen: das Lesen, beim Schwimmen, alles Gute, etwas Neues, am Morgen.</li>
<li>Höflichkeitsform: Sie, Ihnen, Ihr. Tageszeiten mit -s klein: morgens, abends.</li></ul>
<h3>Kommaregeln</h3>
<ul><li>Zwischen Hauptsatz und Nebensatz (weil, dass, als, obwohl, wenn, der/die/das …).</li>
<li>Eingeschobene Nebensätze und Beisätze: vorne und hinten.</li>
<li>Aufzählungen – aber nicht vor «und»/«oder».</li><li>Vor «aber», «sondern», «doch».</li>
<li>Bei «um … zu», «ohne … zu», «statt … zu». Anrede und Ausrufe abtrennen.</li></ul>
<h3>Aufsatz</h3>
<ul><li>5 Minuten planen: Stichworte sammeln, Reihenfolge festlegen.</li><li>Einleitung (Thema, Interesse wecken) – Hauptteil (Abschnitte, Argumente mit Beispielen) – Schluss (Fazit, eigene Meinung).</li>
<li>Erörterung: Pro und Contra, das stärkste Argument zuletzt.</li><li>Am Schluss 5–10 Minuten für die Korrektur reservieren.</li></ul>`;

  BMP.subjects.push({
    id: 'deutsch', name: 'Deutsch', icon: 'Aa', color: 'var(--c-deutsch)',
    intro: 'Grammatik, Rechtschreibung, Kommas, Wortschatz, Textverständnis und Aufsatz.',
    topics: [
      { id: 'wortarten', name: 'Wortarten', desc: 'Nomen, Verb, Adjektiv, Pronomen, Partikel' },
      { id: 'faelle', name: 'Fälle', desc: 'Nominativ, Akkusativ, Dativ, Genitiv' },
      { id: 'zeitformen', name: 'Zeitformen', desc: 'Präsens bis Futur, indirekte Rede' },
      { id: 'satzglieder', name: 'Satzglieder', desc: 'Subjekt, Prädikat, Objekte, Adverbiale' },
      { id: 'rechtschreibung', name: 'Rechtschreibung', desc: 'das/dass, Gross/Klein, Fremdwörter' },
      { id: 'kommas', name: 'Kommasetzung', desc: 'Nebensätze, Aufzählungen, Einschübe' },
      { id: 'wortschatz', name: 'Wortschatz', desc: 'Synonyme, Fremdwörter, Redewendungen' },
      { id: 'textverstaendnis', name: 'Textverständnis', desc: 'Texte lesen und verstehen' }
    ],
    items, merkblatt, writing, checklist,
    exam: { count: 25, minutes: 40 },
    examFull: { count: 40, minutes: 90, note: '90 min wie Einheitsprüfung GR – den Aufsatz übst du im Schreibtraining' }
  });
})(typeof window !== 'undefined' ? window : globalThis);
