/* BM-Trainer – Englisch */
(function (root) {
  'use strict';
  const BMP = root.BMP;
  const { pick } = BMP.U;

  /* Unregelmässige Verben: Infinitiv, Past simple, Past participle, Deutsch */
  const IRR = [
    ['be', 'was/were', 'been', 'sein'], ['begin', 'began', 'begun', 'beginnen'], ['bring', 'brought', 'brought', 'bringen'],
    ['buy', 'bought', 'bought', 'kaufen'], ['catch', 'caught', 'caught', 'fangen'], ['choose', 'chose', 'chosen', 'wählen'],
    ['come', 'came', 'come', 'kommen'], ['do', 'did', 'done', 'tun, machen'], ['drink', 'drank', 'drunk', 'trinken'],
    ['drive', 'drove', 'driven', 'fahren (Auto)'], ['eat', 'ate', 'eaten', 'essen'], ['fall', 'fell', 'fallen', 'fallen'],
    ['feel', 'felt', 'felt', 'fühlen'], ['find', 'found', 'found', 'finden'], ['fly', 'flew', 'flown', 'fliegen'],
    ['forget', 'forgot', 'forgotten', 'vergessen'], ['get', 'got', 'got', 'bekommen'], ['give', 'gave', 'given', 'geben'],
    ['go', 'went', 'gone', 'gehen'], ['know', 'knew', 'known', 'wissen, kennen'], ['leave', 'left', 'left', 'verlassen'],
    ['lose', 'lost', 'lost', 'verlieren'], ['make', 'made', 'made', 'machen'], ['meet', 'met', 'met', 'treffen'],
    ['pay', 'paid', 'paid', 'bezahlen'], ['read', 'read', 'read', 'lesen'], ['ride', 'rode', 'ridden', 'reiten, fahren (Velo)'],
    ['run', 'ran', 'run', 'rennen'], ['say', 'said', 'said', 'sagen'], ['see', 'saw', 'seen', 'sehen'],
    ['sell', 'sold', 'sold', 'verkaufen'], ['send', 'sent', 'sent', 'senden'], ['sing', 'sang', 'sung', 'singen'],
    ['sleep', 'slept', 'slept', 'schlafen'], ['speak', 'spoke', 'spoken', 'sprechen'], ['spend', 'spent', 'spent', 'ausgeben, verbringen'],
    ['swim', 'swam', 'swum', 'schwimmen'], ['take', 'took', 'taken', 'nehmen'], ['teach', 'taught', 'taught', 'unterrichten'],
    ['tell', 'told', 'told', 'erzählen'], ['think', 'thought', 'thought', 'denken'], ['throw', 'threw', 'thrown', 'werfen'],
    ['understand', 'understood', 'understood', 'verstehen'], ['wear', 'wore', 'worn', 'tragen (Kleider)'], ['win', 'won', 'won', 'gewinnen'],
    ['write', 'wrote', 'written', 'schreiben']
  ];

  const generators = {
    verbs: [
      () => {
        const [inf, past, pp, de] = pick(IRR);
        const askPast = Math.random() < 0.5;
        const ans = (askPast ? past : pp).split('/');
        if (!askPast && inf === 'get') ans.push('gotten');
        return { type: 'text', q: `Irregular verbs: Wie heisst das <b>${askPast ? 'Past simple' : 'Past participle'}</b> von «to ${inf}» (${de})?`, answer: ans.length > 1 ? [...ans, ans.join('/')] : ans,
          explain: `to ${inf} – ${past} – ${pp}` };
      },
      () => {
        const [inf, past, pp, de] = pick(IRR.filter(v => v[0] !== 'be'));
        const alt = inf === 'get' ? ['gotten', 'has gotten'] : [];
        return { type: 'text', q: `Present perfect – ergänze: «She has ___ .» (to ${inf})`, answer: [pp, 'has ' + pp, ...alt],
          explain: `Present perfect = has/have + past participle: she has ${pp} (to ${inf} – ${past} – ${pp}, ${de}).` };
      }
    ]
  };

  const mc = (id, topic, q, options, answer, explain) => ({ id, topic, type: 'mc', q, options, answer, explain });

  const P_IRL = {
    title: 'Mia’s three weeks in Ireland',
    text: `<p>Last summer, Mia, a 16-year-old girl from Chur, decided to spend three weeks in Galway, a city on the west coast of Ireland. She stayed with a host family, the O’Briens, who have two children and a very friendly dog called Murphy.</p>
<p>Every morning Mia took a bus to a language school in the city centre. Her class was small: there were only eight students from five different countries. At first, Mia was shy and didn’t like speaking in front of the others. But her teacher, Mr Byrne, often played games with the class, and after a few days she felt much more confident.</p>
<p>In the afternoons, the students went on trips. Mia’s favourite was a visit to the Cliffs of Moher, where the cliffs rise more than 200 metres above the Atlantic Ocean. “It was windy and it rained twice, but the view was amazing,” she says.</p>
<p>The hardest part was understanding the local accent. “People spoke so fast! But by the end I understood almost everything.” Now Mia wants to go back one day – maybe to work in Ireland after her apprenticeship.</p>`
  };

  const P_PLASTIC = {
    title: 'A town without plastic bags',
    text: `<p>Ten years ago, the small town of Greenford had a problem: plastic bags were everywhere – in the river, in the trees and in the park. A group of students at the local secondary school decided to do something about it.</p>
<p>First, they counted the bags they found during one weekend: more than 1,200! They presented the results to the town council and asked for a ban on plastic bags in all shops. The council was not convinced at first. Shop owners were worried that customers would be angry.</p>
<p>So the students had another idea. They collected old T-shirts and turned them into reusable bags, which they gave to shoppers for free. The project became so popular that local newspapers reported on it. One year later, the council finally agreed to the ban.</p>
<p>Today, Greenford is known as a clean town, and the students’ idea has been copied by several other communities. “We learned that young people can really change things,” says Priya, one of the students who started the project.</p>`
  };

  const items = [
    /* Tenses */
    mc('e-t1', 'tenses', 'Look! It ___ .', ['rains', 'is raining', 'rained', 'has rained'], 1, '«Look!» zeigt: Es passiert gerade jetzt → Present progressive (is raining).'),
    mc('e-t2', 'tenses', 'She ___ to school by bus every day.', ['is going', 'go', 'goes', 'went'], 2, '«every day» = Gewohnheit → Simple present. 3. Person Singular: -s (she goes).'),
    mc('e-t3', 'tenses', 'Yesterday we ___ a great film.', ['watched', 'have watched', 'watch', 'are watching'], 0, '«Yesterday» = abgeschlossene Zeit in der Vergangenheit → Past simple. Nie Present perfect mit yesterday, last week, ago …'),
    mc('e-t4', 'tenses', 'I ___ in Chur since 2015.', ['live', 'lived', 'am living', 'have lived'], 3, '«since» + Zeitpunkt: Es hat in der Vergangenheit begonnen und dauert noch an → Present perfect.'),
    mc('e-t5', 'tenses', 'When I came home, my brother ___ TV.', ['was watching', 'is watching', 'has watched', 'watches'], 0, 'Eine Handlung lief gerade (Hintergrund), als etwas anderes passierte → Past progressive.'),
    mc('e-t6', 'tenses', 'Have you ever ___ to London?', ['was', 'been', 'go', 'going'], 1, '«Have you ever been to …?» = Warst du schon einmal in …? (Present perfect mit «been»).'),
    mc('e-t7', 'tenses', 'I think it ___ rain tomorrow.', ['is', 'does', 'will', 'has'], 2, 'Vermutung über die Zukunft mit «I think» → will-future.'),
    mc('e-t8', 'tenses', 'Look at those dark clouds! It ___ rain.', ['is going to', 'rains', 'has rained', 'was'], 0, 'Man sieht schon jetzt ein Anzeichen → going to-future.'),
    mc('e-t9', 'tenses', 'She ___ her homework yet.', ['didn’t finish', 'doesn’t finish', 'hasn’t finished', 'isn’t finish'], 2, '«yet» (noch nicht) steht typischerweise mit dem Present perfect.'),
    mc('e-t10', 'tenses', 'Last summer we ___ to Italy.', ['went', 'have gone', 'go', 'goes'], 0, '«Last summer» → Past simple (go – went – gone).'),
    mc('e-t11', 'tenses', 'Water ___ at 100 degrees Celsius.', ['is boiling', 'boils', 'boiled', 'has boiled'], 1, 'Allgemeine Tatsachen → Simple present.'),
    mc('e-t12', 'tenses', 'We ___ our grandparents next Sunday. We have already planned it.', ['visit', 'are visiting', 'visited', 'have visited'], 1, 'Fest geplante Termine in der Zukunft → Present progressive (oder going to).'),

    /* Questions & negatives */
    mc('e-q1', 'questions', '___ you like pizza?', ['Do', 'Does', 'Are', 'Is'], 0, 'Fragen im Simple present mit «do» – bei he/she/it mit «does».'),
    mc('e-q2', 'questions', '___ she play tennis?', ['Do', 'Does', 'Is', 'Has'], 1, '3. Person Singular → «Does she play …?» (Verb ohne -s!).'),
    mc('e-q3', 'questions', 'He ___ like fish.', ['don’t', 'isn’t', 'doesn’t', 'not'], 2, 'Verneinung im Simple present, 3. Person: doesn’t + Grundform.'),
    mc('e-q4', 'questions', 'Where ___ you yesterday?', ['was', 'were', 'did', 'are'], 1, '«to be» im Past simple: I/he/she/it was, you/we/they were.'),
    mc('e-q5', 'questions', 'What time ___ the film start?', ['do', 'is', 'does', 'has'], 2, '«the film» = it → does.'),
    mc('e-q6', 'questions', 'You’re from Switzerland, ___?', ['don’t you', 'aren’t you', 'isn’t it', 'are you'], 1, 'Question tag: positiver Satz mit «are» → negatives Tag «aren’t you?»'),
    mc('e-q7', 'questions', 'Who ___ the window yesterday?', ['broke', 'did break', 'did broke', 'has broken'], 0, 'Fragt «who» nach dem Subjekt, braucht es kein «did»: Who broke the window?'),
    { id: 'e-q8', topic: 'questions', type: 'text', q: 'Verneine den Satz: «They went home.»', answer: ['They didn’t go home', 'They did not go home'],
      explain: 'Past simple verneint: didn’t + Grundform (go, nicht went).' },
    { id: 'e-q9', topic: 'questions', type: 'text', q: 'Stelle eine Frage: «She speaks Italian.» → ___ she speak Italian?', answer: ['Does'],
      explain: 'Does + Subjekt + Grundform.' },
    { id: 'e-q10', topic: 'questions', type: 'text', q: 'Verneine den Satz: «He can swim.»', answer: ['He can’t swim', 'He cannot swim', 'He can not swim'],
      explain: 'Modalverben (can, must, should …) werden direkt verneint: can’t / cannot.' },

    /* Comparison & adverbs */
    mc('e-c1', 'comparison', 'This book is ___ than the other one.', ['interestinger', 'more interesting', 'most interesting', 'more interestinger'], 1, 'Lange Adjektive (3+ Silben) steigert man mit more / most.'),
    mc('e-c2', 'comparison', 'Mount Everest is the ___ mountain in the world.', ['higher', 'most high', 'highest', 'more high'], 2, 'Superlativ kurzer Adjektive: the + -est.'),
    mc('e-c3', 'comparison', 'My bag is ___ than yours. (good)', ['gooder', 'better', 'best', 'more good'], 1, 'Unregelmässig: good – better – best.'),
    mc('e-c4', 'comparison', 'This is the ___ day of my life! (bad)', ['baddest', 'worse', 'worst', 'most bad'], 2, 'Unregelmässig: bad – worse – worst.'),
    mc('e-c5', 'comparison', 'She is as tall ___ her brother.', ['than', 'as', 'like', 'that'], 1, 'Gleichheit: as … as. Ungleichheit: -er than.'),
    mc('e-c6', 'comparison', 'He drives very ___ .', ['careful', 'carefuly', 'carefully', 'more careful'], 2, 'Wie fährt er? → Adverb: Adjektiv + -ly (careful → carefully).'),
    mc('e-c7', 'comparison', 'She speaks English very ___ .', ['good', 'well', 'nice', 'best'], 1, 'Das Adverb zu «good» ist «well».'),
    { id: 'e-c8', topic: 'comparison', type: 'text', q: 'Wie heisst der Komparativ von «big»?', answer: ['bigger'], explain: 'Kurzer Vokal + ein Konsonant → Konsonant verdoppeln: big – bigger – biggest.' },
    { id: 'e-c9', topic: 'comparison', type: 'text', q: 'Wie heisst der Superlativ von «happy»?', answer: ['happiest', 'the happiest'], explain: '-y nach Konsonant wird zu -i: happy – happier – happiest.' },
    { id: 'e-c10', topic: 'comparison', type: 'text', q: 'Wie heisst der Komparativ von «expensive»?', answer: ['more expensive'], explain: 'Lange Adjektive: more expensive – most expensive.' },

    /* If-clauses */
    mc('e-i1', 'ifclauses', 'If it rains tomorrow, we ___ at home.', ['would stay', 'will stay', 'stayed', 'staying'], 1, 'If-clause type 1 (reale Möglichkeit): If + present, will + Grundform.'),
    mc('e-i2', 'ifclauses', 'If I ___ a lot of money, I would travel around the world.', ['have', 'will have', 'had', 'would have'], 2, 'Type 2 (unwahrscheinlich/irreal): If + past simple, would + Grundform.'),
    mc('e-i3', 'ifclauses', 'I would help you if I ___ more time.', ['had', 'have', 'will have', 'would have'], 0, 'Type 2: Im if-Satz steht nie «would» → if I had.'),
    mc('e-i4', 'ifclauses', 'If she studies hard, she ___ the exam.', ['would pass', 'passed', 'will pass', 'passes'], 2, 'Type 1: If + present → will.'),
    mc('e-i5', 'ifclauses', 'If I were you, I ___ to the doctor.', ['will go', 'would go', 'go', 'went'], 1, '«If I were you» (Ratschlag) → Type 2 mit would.'),
    mc('e-i6', 'ifclauses', 'If we ___ the bus, we will be late.', ['miss', 'will miss', 'missed', 'would miss'], 0, 'Type 1: Im if-Satz steht das Simple present, nie «will».'),

    /* Prepositions */
    mc('e-p1', 'prepositions', 'I was born ___ 2010.', ['on', 'at', 'in', 'by'], 2, 'in + Jahr, Monat, Jahreszeit (in 2010, in May, in summer).'),
    mc('e-p2', 'prepositions', 'The meeting is ___ Monday.', ['on', 'in', 'at', 'to'], 0, 'on + Wochentag oder Datum (on Monday, on 3 May).'),
    mc('e-p3', 'prepositions', 'We have lunch ___ 12 o’clock.', ['in', 'on', 'at', 'for'], 2, 'at + Uhrzeit (at 12 o’clock, at night, at the weekend).'),
    mc('e-p4', 'prepositions', 'She is good ___ maths.', ['in', 'at', 'on', 'with'], 1, 'Feste Wendung: good at something.'),
    mc('e-p5', 'prepositions', 'I’m interested ___ music.', ['for', 'on', 'in', 'about'], 2, 'Feste Wendung: interested in something.'),
    mc('e-p6', 'prepositions', 'It depends ___ the weather.', ['of', 'on', 'from', 'at'], 1, 'Feste Wendung: depend on something (nicht «from»!).'),
    mc('e-p7', 'prepositions', 'He is afraid ___ spiders.', ['from', 'of', 'before', 'about'], 1, 'Feste Wendung: afraid of something.'),
    mc('e-p8', 'prepositions', 'We waited ___ the bus for 20 minutes.', ['on', 'to', 'for', 'at'], 2, 'Feste Wendung: wait for something/somebody.'),

    /* Vocabulary */
    mc('e-v1', 'vocabulary', 'What does «to borrow» mean?', ['sich etwas ausleihen', 'jemandem etwas leihen', 'kaufen', 'verkaufen'], 0, 'to borrow = sich (von jemandem) etwas ausleihen. to lend = jemandem etwas leihen.'),
    mc('e-v2', 'vocabulary', 'What does «actually» mean?', ['aktuell', 'eigentlich, tatsächlich', 'sofort', 'manchmal'], 1, 'False friend! actually = eigentlich/tatsächlich. «aktuell» heisst current.'),
    mc('e-v3', 'vocabulary', 'What does «eventually» mean?', ['eventuell', 'niemals', 'schliesslich, endlich', 'sofort'], 2, 'False friend! eventually = schliesslich. «eventuell» heisst possibly/perhaps.'),
    mc('e-v4', 'vocabulary', 'What does «to become» mean?', ['bekommen', 'werden', 'kommen', 'bemerken'], 1, 'False friend! to become = werden. «bekommen» heisst to get/receive.'),
    mc('e-v5', 'vocabulary', 'What does «sensible» mean?', ['sensibel', 'vernünftig', 'empfindlich', 'sinnlos'], 1, 'False friend! sensible = vernünftig. «sensibel» heisst sensitive.'),
    mc('e-v6', 'vocabulary', 'What is a «chef»?', ['ein Chef', 'ein Koch', 'ein Kellner', 'ein Lehrer'], 1, 'False friend! chef = Koch. «Chef» heisst boss.'),
    mc('e-v7', 'vocabulary', 'What is the opposite of «expensive»?', ['cheap', 'rich', 'poor', 'cheerful'], 0, 'expensive (teuer) ↔ cheap (billig).'),
    mc('e-v8', 'vocabulary', 'Which word does not belong? apple – banana – carrot – cherry', ['apple', 'banana', 'carrot', 'cherry'], 2, 'A carrot (Rüebli) is a vegetable, the others are fruit.'),
    mc('e-v9', 'vocabulary', 'What is a «Lehrstelle» in English?', ['an apprenticeship', 'a teacher', 'a lesson', 'a lecture'], 0, 'Lehre/Lehrstelle = apprenticeship, Lernende/r = apprentice.'),
    mc('e-v10', 'vocabulary', 'What does «to apply for a job» mean?', ['einen Job kündigen', 'sich um eine Stelle bewerben', 'eine Stelle anbieten', 'einen Job verlieren'], 1, 'to apply for = sich bewerben um. The application = die Bewerbung.'),
    { id: 'e-v11', topic: 'vocabulary', type: 'text', q: 'Übersetze ins Englische: zuverlässig', answer: ['reliable'], explain: 'reliable = zuverlässig (to rely on = sich verlassen auf).' },
    { id: 'e-v12', topic: 'vocabulary', type: 'text', q: 'Übersetze ins Englische: die Erfahrung', answer: ['experience', 'the experience', 'an experience'], explain: 'experience = Erfahrung (auch: Erlebnis).' },
    { id: 'e-v13', topic: 'vocabulary', type: 'text', q: 'Übersetze ins Englische: die Wohnung', answer: ['flat', 'apartment', 'the flat', 'the apartment', 'a flat', 'an apartment'], explain: 'flat (britisch) oder apartment (amerikanisch).' },
    { id: 'e-v14', topic: 'vocabulary', type: 'text', q: 'Übersetze ins Englische: das Geschenk', answer: ['present', 'gift', 'the present', 'the gift', 'a present', 'a gift'], explain: 'present oder gift. Achtung: «Gift» auf Deutsch heisst poison!' },

    /* Reading */
    mc('e-r1', 'reading', 'Where is Galway?', ['on the east coast of Ireland', 'on the west coast of Ireland', 'in the north of England', 'near Dublin'], 1, '«Galway, a city on the west coast of Ireland».'),
    mc('e-r2', 'reading', 'How many students were in Mia’s class?', ['five', 'eight', 'two', 'sixteen'], 1, '«there were only eight students from five different countries».'),
    mc('e-r3', 'reading', 'Why did Mia become more confident?', ['Her host family helped her.', 'Her teacher often played games with the class.', 'She took extra lessons.', 'She made friends with Murphy.'], 1, '«her teacher, Mr Byrne, often played games with the class, and after a few days she felt much more confident».'),
    mc('e-r4', 'reading', 'True or false? «Mia stayed in a hotel.»', ['true', 'false'], 1, 'She stayed with a host family, the O’Briens.'),
    mc('e-r5', 'reading', 'What was the most difficult thing for Mia?', ['the weather', 'the food', 'understanding the local accent', 'the long bus rides'], 2, '«The hardest part was understanding the local accent.»'),
    mc('e-r6', 'reading', 'What does «shy» mean?', ['müde', 'schüchtern', 'wütend', 'neugierig'], 1, 'shy = schüchtern. Mia didn’t like speaking in front of the others.'),
    mc('e-r7', 'reading', 'What are Mia’s plans for the future?', ['She never wants to travel again.', 'She wants to study in Galway next year.', 'She might work in Ireland after her apprenticeship.', 'She wants to become a teacher.'], 2, '«maybe to work in Ireland after her apprenticeship».'),

    mc('e-r8', 'reading', 'What was the problem in Greenford?', ['There were too many cars.', 'There were plastic bags everywhere.', 'The school was too small.', 'The river was dry.'], 1, '«plastic bags were everywhere – in the river, in the trees and in the park».'),
    mc('e-r9', 'reading', 'Why was the council not convinced at first?', ['It had no money.', 'Shop owners were worried about angry customers.', 'The students were too young.', 'There was no problem.'], 1, '«Shop owners were worried that customers would be angry.»'),
    mc('e-r10', 'reading', 'What did the students make from old T-shirts?', ['flags', 'reusable bags', 'posters', 'clothes for poor people'], 1, '«turned them into reusable bags, which they gave to shoppers for free».'),
    mc('e-r11', 'reading', 'True or false? «The ban was introduced immediately after the students’ presentation.»', ['true', 'false'], 1, 'False: only one year later, after the T-shirt bag project, did the council agree.'),
    mc('e-r12', 'reading', 'What is the main message of the text?', ['Plastic bags are cheap.', 'Young people can change things in their community.', 'Newspapers like stories about students.', 'T-shirts are better than bags.'], 1, 'Priya: «We learned that young people can really change things.»')
  ];

  // Lesetexte zuordnen
  items.forEach(i => { if (i.topic === 'reading') i.passage = Number(i.id.slice(3)) <= 7 ? P_IRL : P_PLASTIC; });

  const writing = [
    { title: 'Email to a friend', kind: 'Informal email', task: 'Write an email to an English-speaking friend. Tell him/her about your last holidays: Where did you go? What did you do? What was the best moment? Ask him/her two questions at the end.', minWords: 120, minutes: 30 },
    { title: 'My dream job', kind: 'Text', task: 'Describe your dream job. What does a person in this job do? Why would it be perfect for you? What do you have to do to get there?', minWords: 120, minutes: 30 },
    { title: 'Should school start later?', kind: 'Opinion text', task: 'Some people say that school should start at 9 o’clock instead of 7:30. What do you think? Give at least two reasons and an example.', minWords: 150, minutes: 35 },
    { title: 'A special day', kind: 'Story', task: 'Write a story that begins with: «When I opened the door, I couldn’t believe my eyes …» Use the past simple and past progressive.', minWords: 150, minutes: 35 }
  ];

  const checklist = [
    'I answered every part of the task.',
    'My text has a beginning, a main part and an ending.',
    'I used paragraphs.',
    'Simple present: he/she/it + -s (she plays).',
    'Past simple for finished actions (yesterday, last week, ago).',
    'Linking words: first, then, because, but, however, finally.',
    'Spelling and capital letters (I, Monday, English) checked.',
    'Email: greeting (Hi …,/Dear …,) and ending (Best wishes, …).'
  ];

  const merkblatt = `
<h3>Tenses</h3>
<ul><li><b>Simple present</b>: Gewohnheiten, Fakten – every day, always, usually. He/she/it + <b>-s</b>.</li>
<li><b>Present progressive</b>: gerade jetzt – now, at the moment, Look! (am/is/are + -ing)</li>
<li><b>Past simple</b>: abgeschlossen in der Vergangenheit – yesterday, last year, ago, in 2020.</li>
<li><b>Past progressive</b>: lief gerade, als … (was/were + -ing)</li>
<li><b>Present perfect</b>: Bezug zur Gegenwart – ever, never, already, yet, just, since, for (have/has + past participle)</li>
<li><b>Future</b>: will (Vermutung, spontan), going to (Plan, Anzeichen), present progressive (fester Termin)</li></ul>
<h3>Questions &amp; negatives</h3>
<ul><li>Do/Does + Grundform (Present), Did + Grundform (Past): Does she play? – She doesn’t play. Did you go? – I didn’t go.</li>
<li>Mit be/can/must keine Umschreibung: Are you …? – I can’t …</li>
<li>since + Zeitpunkt (since 2015), for + Zeitdauer (for 3 years)</li></ul>
<h3>Comparison</h3>
<ul><li>kurz: tall – taller – the tallest; big – bigger; happy – happier</li><li>lang: interesting – more interesting – the most interesting</li>
<li>unregelmässig: good – better – best; bad – worse – worst; much/many – more – most; little – less – least</li>
<li>Adverb: Adjektiv + -ly (quick → quickly), good → well</li></ul>
<h3>If-clauses</h3>
<ul><li>Type 1 (real): If + present, will + Verb – If it rains, we will stay home.</li>
<li>Type 2 (unreal): If + past, would + Verb – If I had time, I would help you.</li>
<li>Nie «will» oder «would» im if-Satz!</li></ul>
<h3>Prepositions of time</h3>
<ul><li>at + Uhrzeit (at 7 o’clock), on + Tag/Datum (on Monday), in + Monat/Jahr/Jahreszeit (in May, in 2025, in winter)</li></ul>
<h3>False friends</h3>
<ul><li>become = werden, actually = eigentlich, eventually = schliesslich, sensible = vernünftig, chef = Koch, gift = Geschenk, brave = mutig, handy ≠ Handy (mobile phone)</li></ul>`;

  BMP.subjects.push({
    id: 'englisch', name: 'Englisch', icon: 'En', color: 'var(--c-englisch)',
    intro: 'Tenses, irregular verbs, questions, comparison, if-clauses, prepositions, vocabulary and reading.',
    topics: [
      { id: 'tenses', name: 'Tenses', desc: 'Present, past, present perfect, future' },
      { id: 'verbs', name: 'Irregular verbs', desc: 'go – went – gone' },
      { id: 'questions', name: 'Questions & negatives', desc: 'do/does/did, question tags' },
      { id: 'comparison', name: 'Comparison & adverbs', desc: 'bigger, the most interesting, well' },
      { id: 'ifclauses', name: 'If-clauses', desc: 'Type 1 and type 2' },
      { id: 'prepositions', name: 'Prepositions', desc: 'in/on/at, good at, depend on' },
      { id: 'vocabulary', name: 'Vocabulary', desc: 'Words, false friends, translation' },
      { id: 'reading', name: 'Reading', desc: 'Reading comprehension' }
    ],
    items, generators, merkblatt, writing, checklist,
    exam: { count: 25, minutes: 40, listening: 1 },
    examFull: { count: 40, minutes: 75, listening: 3, note: '15 min Hörverständnis + 60 min schriftlich wie Einheitsprüfung GR' }
  });
})(typeof window !== 'undefined' ? window : globalThis);
