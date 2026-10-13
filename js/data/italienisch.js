/* BM-Trainer – Italienisch */
(function (root) {
  'use strict';
  const BMP = root.BMP;
  const { pick } = BMP.U;

  /* Akzentvarianten akzeptieren: è ↔ e', può ↔ puo' */
  const accents = s => {
    const out = [s];
    const alt = s.replace(/è/g, "e'").replace(/ò/g, "o'").replace(/à/g, "a'").replace(/ù/g, "u'").replace(/ì/g, "i'");
    if (alt !== s) out.push(alt);
    return out;
  };

  /* ---------- Artikel ---------- */
  const ART_DET = ['il', 'lo', 'la', "l'", 'i', 'gli', 'le'];
  const DET_NOUNS = [
    ['zaino', 'lo', 'Maschile davanti a <b>z</b> → lo.'], ['studente', 'lo', 'Maschile davanti a <b>s + consonante</b> → lo.'],
    ['amica', "l'", 'Davanti a <b>vocale</b> → l’.'], ['libri', 'i', 'Plurale di «il» → i.'],
    ['zii', 'gli', 'Plurale di «lo» → gli.'], ['psicologo', 'lo', 'Maschile davanti a <b>ps</b> → lo.'],
    ['case', 'le', 'Femminile plurale → le.'], ['amici', 'gli', 'Maschile plurale davanti a vocale → gli.'],
    ['giornale', 'il', 'Maschile davanti a consonante semplice → il.'], ['sport', 'lo', 'Maschile davanti a <b>s + consonante</b> → lo.'],
    ['ragazzo', 'il', 'Maschile davanti a consonante semplice → il.'], ['gnomo', 'lo', 'Maschile davanti a <b>gn</b> → lo.'],
    ['scuole', 'le', 'Femminile plurale → le.'], ['ospedale', "l'", 'Maschile davanti a vocale → l’.'],
    ['studenti', 'gli', 'Plurale di «lo» → gli.'], ['orologio', "l'", 'Davanti a vocale → l’.'],
    ['bicicletta', 'la', 'Femminile singolare davanti a consonante → la.'], ['albero', "l'", 'Davanti a vocale → l’.'],
    ['alberi', 'gli', 'Maschile plurale davanti a vocale → gli.'], ['treno', 'il', 'Maschile davanti a consonante semplice → il.'],
    ['treni', 'i', 'Plurale di «il» → i.'], ['stazione', 'la', 'Femminile singolare → la.'],
    ['specchio', 'lo', 'Maschile davanti a <b>s + consonante</b> → lo.'], ['uomini', 'gli', 'Plurale irregolare: l’uomo → gli uomini.'],
    ['estate', "l'", 'Femminile davanti a vocale → l’.'], ['zucchero', 'lo', 'Maschile davanti a <b>z</b> → lo.'],
    ['yogurt', 'lo', 'Maschile davanti a <b>y</b> → lo.'], ['città', 'la', 'Femminile; il plurale è invariabile: le città.']
  ];
  const ART_IND = ['un', 'uno', 'una', "un'"];
  const IND_NOUNS = [
    ['libro', 'un', 'Maschile davanti a consonante semplice → un.'], ['studente', 'uno', 'Maschile davanti a <b>s + consonante</b> → uno.'],
    ['amica', "un'", 'Femminile davanti a vocale → un’ (con apostrofo).'], ['amico', 'un', 'Maschile davanti a vocale → un (<b>senza</b> apostrofo!).'],
    ['zaino', 'uno', 'Maschile davanti a <b>z</b> → uno.'], ['casa', 'una', 'Femminile davanti a consonante → una.'],
    ['idea', "un'", 'Femminile davanti a vocale → un’.'], ['ora', "un'", 'Femminile davanti a vocale → un’.'],
    ['albero', 'un', 'Maschile davanti a vocale → un (senza apostrofo).'], ['psicologo', 'uno', 'Maschile davanti a <b>ps</b> → uno.'],
    ['scuola', 'una', 'Femminile → una.'], ['sport', 'uno', 'Maschile davanti a <b>s + consonante</b> → uno.'],
    ['orologio', 'un', 'Maschile davanti a vocale → un.'], ['estate', "un'", 'Femminile davanti a vocale → un’.']
  ];

  /* ---------- Presente ---------- */
  const PERS = ['io', 'tu', 'lui/lei', 'noi', 'voi', 'loro'];
  const PRES = {
    parlare: ['parlo', 'parli', 'parla', 'parliamo', 'parlate', 'parlano'],
    mangiare: ['mangio', 'mangi', 'mangia', 'mangiamo', 'mangiate', 'mangiano'],
    abitare: ['abito', 'abiti', 'abita', 'abitiamo', 'abitate', 'abitano'],
    cercare: ['cerco', 'cerchi', 'cerca', 'cerchiamo', 'cercate', 'cercano'],
    pagare: ['pago', 'paghi', 'paga', 'paghiamo', 'pagate', 'pagano'],
    prendere: ['prendo', 'prendi', 'prende', 'prendiamo', 'prendete', 'prendono'],
    leggere: ['leggo', 'leggi', 'legge', 'leggiamo', 'leggete', 'leggono'],
    dormire: ['dormo', 'dormi', 'dorme', 'dormiamo', 'dormite', 'dormono'],
    partire: ['parto', 'parti', 'parte', 'partiamo', 'partite', 'partono'],
    finire: ['finisco', 'finisci', 'finisce', 'finiamo', 'finite', 'finiscono'],
    capire: ['capisco', 'capisci', 'capisce', 'capiamo', 'capite', 'capiscono'],
    essere: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'],
    avere: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'],
    andare: ['vado', 'vai', 'va', 'andiamo', 'andate', 'vanno'],
    fare: ['faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno'],
    venire: ['vengo', 'vieni', 'viene', 'veniamo', 'venite', 'vengono'],
    volere: ['voglio', 'vuoi', 'vuole', 'vogliamo', 'volete', 'vogliono'],
    potere: ['posso', 'puoi', 'può', 'possiamo', 'potete', 'possono'],
    dovere: ['devo', 'devi', 'deve', 'dobbiamo', 'dovete', 'devono'],
    stare: ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno'],
    dire: ['dico', 'dici', 'dice', 'diciamo', 'dite', 'dicono'],
    uscire: ['esco', 'esci', 'esce', 'usciamo', 'uscite', 'escono'],
    bere: ['bevo', 'bevi', 'beve', 'beviamo', 'bevete', 'bevono']
  };
  const PRES_NOTE = {
    cercare: 'Verbi in -care: si aggiunge una <b>h</b> davanti a i (tu cerchi, noi cerchiamo).',
    pagare: 'Verbi in -gare: si aggiunge una <b>h</b> davanti a i (tu paghi, noi paghiamo).',
    finire: 'Verbo in -ire con <b>-isc-</b> (io finisco, ma noi finiamo, voi finite).',
    capire: 'Verbo in -ire con <b>-isc-</b> (io capisco, ma noi capiamo, voi capite).',
    mangiare: 'Verbi in -iare: una sola i (tu mangi, noi mangiamo).'
  };

  /* ---------- Passato prossimo ---------- */
  const AUX = { avere: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'], essere: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'] };
  const PP = [
    ['mangiare', 'avere', 'mangiato'], ['parlare', 'avere', 'parlato'], ['fare', 'avere', 'fatto'], ['vedere', 'avere', 'visto'],
    ['prendere', 'avere', 'preso'], ['leggere', 'avere', 'letto'], ['scrivere', 'avere', 'scritto'], ['dormire', 'avere', 'dormito'],
    ['finire', 'avere', 'finito'], ['aprire', 'avere', 'aperto'], ['dire', 'avere', 'detto'], ['mettere', 'avere', 'messo'],
    ['bere', 'avere', 'bevuto'], ['chiudere', 'avere', 'chiuso'], ['decidere', 'avere', 'deciso'], ['rispondere', 'avere', 'risposto'],
    ['andare', 'essere', 'andato'], ['venire', 'essere', 'venuto'], ['essere', 'essere', 'stato'], ['stare', 'essere', 'stato'],
    ['uscire', 'essere', 'uscito'], ['partire', 'essere', 'partito'], ['arrivare', 'essere', 'arrivato'], ['tornare', 'essere', 'tornato'],
    ['nascere', 'essere', 'nato'], ['rimanere', 'essere', 'rimasto']
  ];
  const SUBJ = [
    { s: 'io (Marco)', p: 0, g: 'm', pl: false }, { s: 'tu (Sara)', p: 1, g: 'f', pl: false },
    { s: 'Luca', p: 2, g: 'm', pl: false }, { s: 'Anna', p: 2, g: 'f', pl: false },
    { s: 'noi (io e Paolo)', p: 3, g: 'm', pl: true }, { s: 'voi (Giulia e Marta)', p: 4, g: 'f', pl: true },
    { s: 'i ragazzi', p: 5, g: 'm', pl: true }, { s: 'le amiche', p: 5, g: 'f', pl: true }
  ];
  const agree = (part, g, pl) => part.slice(0, -1) + (pl ? (g === 'f' ? 'e' : 'i') : (g === 'f' ? 'a' : 'o'));

  /* ---------- Preposizioni articolate ---------- */
  const PREP = {
    di: ['del', 'dello', 'della', "dell'", 'dei', 'degli', 'delle'],
    a: ['al', 'allo', 'alla', "all'", 'ai', 'agli', 'alle'],
    da: ['dal', 'dallo', 'dalla', "dall'", 'dai', 'dagli', 'dalle'],
    in: ['nel', 'nello', 'nella', "nell'", 'nei', 'negli', 'nelle'],
    su: ['sul', 'sullo', 'sulla', "sull'", 'sui', 'sugli', 'sulle']
  };

  const generators = {
    articoli: [
      () => {
        const [n, a, ex] = pick(DET_NOUNS);
        return { type: 'mc', q: `Articolo determinativo: ___ ${n}`, options: ART_DET, answer: ART_DET.indexOf(a), explain: `${a}${a.endsWith("'") ? '' : ' '}${n}. ${ex}` };
      },
      () => {
        const [n, a, ex] = pick(IND_NOUNS);
        return { type: 'mc', q: `Articolo indeterminativo: ___ ${n}`, options: ART_IND, answer: ART_IND.indexOf(a), explain: `${a}${a.endsWith("'") ? '' : ' '}${n}. ${ex}` };
      }
    ],
    presente: [
      () => {
        const v = pick(Object.keys(PRES)), p = Math.floor(Math.random() * 6);
        const form = PRES[v][p];
        const pron = PERS[p];
        const answers = [...accents(form)];
        pron.split('/').forEach(pr => accents(form).forEach(f => answers.push(pr + ' ' + f)));
        const tbl = PERS.map((x, i) => `${x} ${PRES[v][i]}`).join(', ');
        return { type: 'text', q: `Coniuga al presente: (${pron}) ___ <i>(${v})</i>`, answer: answers,
          explain: `${PRES_NOTE[v] ? PRES_NOTE[v] + '<br>' : ''}${v}: ${tbl}.` };
      }
    ],
    passato: [
      () => {
        const [v, aux, part] = pick(PP), sb = pick(SUBJ);
        const p = aux === 'essere' ? agree(part, sb.g, sb.pl) : part;
        const form = AUX[aux][sb.p] + ' ' + p;
        return { type: 'text', q: `Passato prossimo: ${sb.s} ___ <i>(${v})</i>.`, answer: accents(form),
          explain: aux === 'essere'
            ? `«${v}» forma il passato prossimo con <b>essere</b> – il participio si accorda con il soggetto: ${sb.s} ${form}.`
            : `«${v}» forma il passato prossimo con <b>avere</b> – il participio resta invariato: ${sb.s} ${form}. (participio: ${part})` };
      },
      () => {
        const [v, aux, part] = pick(PP);
        return { type: 'mc', q: `Con quale ausiliare si forma il passato prossimo di «${v}»?`, options: ['avere', 'essere'], answer: aux === 'avere' ? 0 : 1,
          explain: `${v} → ${aux} ${part}. Con <b>essere</b>: verbi di movimento/cambiamento di stato (andare, venire, partire, arrivare, nascere …) e essere/stare/rimanere.` };
      }
    ],
    preposizioni: [
      () => {
        const prep = pick(Object.keys(PREP));
        const [n, a, ex] = pick(DET_NOUNS);
        const idx = ART_DET.indexOf(a);
        const form = PREP[prep][idx];
        const full = form + (form.endsWith("'") ? '' : ' ') + n;
        return { type: 'text', q: `Preposizione articolata: <b>${prep}</b> + ___ ${n}`, answer: [form, full],
          explain: `${prep} + ${a} = ${form} → ${full}. (${ex})` };
      }
    ]
  };

  const mc = (id, topic, q, options, answer, explain) => ({ id, topic, type: 'mc', q, options, answer, explain });

  const P_LUCA = {
    title: 'Il primo giorno di apprendistato',
    text: `<p>Mi chiamo Luca e ho sedici anni. Lunedì scorso ho cominciato il mio apprendistato come impiegato di commercio in una banca a Coira. La sveglia è suonata alle sei, perché il mio treno da Thusis parte alle sei e quaranta.</p>
<p>Quando sono arrivato in ufficio, la mia formatrice, la signora Rossi, mi ha presentato ai colleghi. Tutti sono stati molto gentili con me. La mattina ho imparato a usare il programma per i clienti e ho risposto al telefono per la prima volta. Ero un po’ nervoso, ma è andato tutto bene.</p>
<p>A mezzogiorno ho mangiato con gli altri apprendisti in una pizzeria vicino alla stazione. Abbiamo parlato della scuola professionale e della maturità professionale, che voglio fare anch’io.</p>
<p>La sera ero stanco morto, ma contento. Ho telefonato alla nonna, che abita a Poschiavo, e le ho raccontato tutto.</p>`
  };

  const P_TICINO = {
    title: 'Un fine settimana in Ticino',
    text: `<p>Cara Giulia,</p>
<p>ti scrivo da Locarno! Sono qui con la mia famiglia per un lungo fine settimana. Venerdì siamo partiti da Coira in treno e abbiamo attraversato le Alpi. Il viaggio è durato circa tre ore, ma il paesaggio era bellissimo.</p>
<p>Sabato abbiamo fatto una gita in battello sul Lago Maggiore. Faceva caldo e c’era il sole. Mio fratello voleva fare il bagno, ma l’acqua era ancora troppo fredda. Il pomeriggio abbiamo mangiato un gelato in Piazza Grande.</p>
<p>Domani mattina vogliamo salire alla Madonna del Sasso, una chiesa sopra la città. Dicono che la vista sul lago è fantastica. Poi torniamo a casa, purtroppo!</p>
<p>E tu? Come stai? Scrivimi presto!</p>
<p>Un abbraccio,<br>Nina</p>`
  };

  const items = [
    /* Preposizioni nel contesto */
    mc('i-p1', 'preposizioni', 'Stasera vado ___ cinema.', ['al', 'nel', 'dal', 'in'], 0, 'andare <b>a</b> + il cinema → al cinema.'),
    mc('i-p2', 'preposizioni', 'Abito ___ Coira.', ['in', 'a', 'da', 'su'], 1, 'Con le città si usa <b>a</b>: abito a Coira, vado a Milano.'),
    mc('i-p3', 'preposizioni', 'L’anno prossimo vado ___ Italia.', ['a', 'nell’', 'in', 'da'], 2, 'Con i paesi (senza aggettivo) si usa <b>in</b>: in Italia, in Svizzera.'),
    mc('i-p4', 'preposizioni', 'Oggi pomeriggio vado ___ medico.', ['al', 'dal', 'nel', 'del'], 1, 'Andare da una persona → <b>da</b>: vado dal medico, dalla nonna.'),
    mc('i-p5', 'preposizioni', 'Il treno parte ___ otto.', ['alle', 'nelle', 'dalle', 'le'], 0, 'Con l’ora: a + le → <b>alle</b> otto (ma: all’una).'),
    mc('i-p6', 'preposizioni', 'Il libro ___ professore è sul tavolo.', ['dal', 'al', 'del', 'nel'], 2, 'Possesso → <b>di</b> + il = del.'),
    mc('i-p7', 'preposizioni', 'Dopo la scuola torno ___ casa.', ['in', 'a', 'alla', 'nella'], 1, 'Espressione fissa: tornare/andare <b>a casa</b> (senza articolo).'),
    mc('i-p8', 'preposizioni', 'Studio l’italiano ___ due anni.', ['per', 'da', 'fra', 'di'], 1, 'Azione che dura ancora → <b>da</b> + tempo (= seit).'),

    /* Aggettivi, plurale, possessivi */
    { id: 'i-a1', topic: 'aggettivi', type: 'text', q: 'Metti al plurale: la casa bella', answer: ['le case belle'], explain: 'Femminile -a → -e: le case belle.' },
    { id: 'i-a2', topic: 'aggettivi', type: 'text', q: 'Metti al plurale: il ragazzo simpatico', answer: ['i ragazzi simpatici'], explain: 'Maschile -o → -i. Attenzione: simpatico → simpatici (senza h).' },
    { id: 'i-a3', topic: 'aggettivi', type: 'text', q: 'Metti al plurale: l’amica francese', answer: ['le amiche francesi'], explain: '-ca → -che (amiche); aggettivi in -e → -i (francesi).' },
    { id: 'i-a4', topic: 'aggettivi', type: 'text', q: 'Metti al plurale: lo zaino grande', answer: ['gli zaini grandi'], explain: 'lo → gli; zaino → zaini; grande → grandi.' },
    { id: 'i-a5', topic: 'aggettivi', type: 'text', q: 'Metti al plurale: il problema difficile', answer: ['i problemi difficili'], explain: '«problema» è maschile (anche se finisce in -a): i problemi.' },
    { id: 'i-a6', topic: 'aggettivi', type: 'text', q: 'Metti al plurale: la città antica', answer: ['le città antiche'], explain: 'Le parole con l’accento finale non cambiano: le città. antica → antiche.' },
    { id: 'i-a7', topic: 'aggettivi', type: 'text', q: 'Metti al plurale: l’uomo alto', answer: ['gli uomini alti'], explain: 'Plurale irregolare: l’uomo → gli uomini.' },
    mc('i-a8', 'aggettivi', 'Questa è ___ madre.', ['la mia', 'mia', 'il mio', 'mio'], 1, 'Con i nomi di parentela al singolare <b>senza</b> articolo: mia madre, mio fratello.'),
    mc('i-a9', 'aggettivi', '___ amici sono molto simpatici.', ['Miei', 'Le mie', 'I miei', 'Il mio'], 2, 'Con i nomi normali (e al plurale) si usa l’articolo: i miei amici.'),
    mc('i-a10', 'aggettivi', 'Dov’è ___ zaino?', ['il tuo', 'lo tuo', 'tuo', 'la tua'], 0, 'Il possessivo si accorda con l’oggetto: (il) tuo zaino. Davanti al possessivo si usa sempre «il», non «lo».'),
    mc('i-a11', 'aggettivi', 'Sara è venuta con ___ fratello.', ['sua', 'suo', 'il suo', 'sue'], 1, '«suo/sua» si accorda con l’oggetto posseduto (fratello = maschile), non con la persona: suo fratello.'),
    mc('i-a12', 'aggettivi', 'Questo è un libro molto ___ .', ['interessanti', 'interessante', 'interessanta', 'interessanto'], 1, 'Aggettivi in -e: una forma per maschile e femminile singolare (interessante), plurale -i.'),

    /* Vocabolario */
    mc('i-v1', 'vocabolario', 'Che cosa significa «la stazione»?', ['die Station', 'der Bahnhof', 'die Haltestelle', 'der Stand'], 1, 'la stazione = der Bahnhof. La fermata = die Haltestelle.'),
    mc('i-v2', 'vocabolario', 'Che cosa significa «la camera»?', ['die Kamera', 'das Zimmer', 'die Kammer', 'der Kamerad'], 1, 'Falso amico! la camera = das Zimmer. die Kamera = la macchina fotografica.'),
    mc('i-v3', 'vocabolario', 'Che cosa significa «il negozio»?', ['die Verhandlung', 'das Geschäft / der Laden', 'die Nachricht', 'die Arbeit'], 1, 'il negozio = der Laden. (la trattativa = die Verhandlung)'),
    mc('i-v4', 'vocabolario', 'Che cosa significa «affittare»?', ['mieten / vermieten', 'kaufen', 'verkaufen', 'umziehen'], 0, 'affittare = mieten/vermieten. l’affitto = die Miete.'),
    mc('i-v5', 'vocabolario', 'Che cosa significa «stanco»?', ['stark', 'müde', 'krank', 'traurig'], 1, 'stanco = müde. forte = stark, malato = krank, triste = traurig.'),
    mc('i-v6', 'vocabolario', 'Che cosa significa «il conto»?', ['das Konto', 'die Rechnung', 'der Graf', 'die Zahl'], 1, 'Al ristorante: «Il conto, per favore!» = Die Rechnung, bitte! (das Bankkonto = il conto corrente)'),
    mc('i-v7', 'vocabolario', 'Che cosa significa «presto»?', ['schnell', 'früh / bald', 'spät', 'pünktlich'], 1, 'presto = früh/bald. veloce = schnell, tardi = spät.'),
    mc('i-v8', 'vocabolario', 'Che cosa significa «la ricetta»?', ['die Quittung', 'das Rezept', 'die Rechnung', 'die Rückkehr'], 1, 'la ricetta = das Rezept (in cucina e dal medico). La ricevuta = die Quittung.'),
    mc('i-v9', 'vocabolario', 'Qual è il contrario di «aperto»?', ['chiuso', 'pieno', 'vuoto', 'caro'], 0, 'aperto (offen) ↔ chiuso (geschlossen).'),
    mc('i-v10', 'vocabolario', 'Quale parola non c’entra? mela – pera – carota – banana', ['mela', 'pera', 'carota', 'banana'], 2, 'La carota è una verdura, le altre sono frutta.'),
    { id: 'i-v11', topic: 'vocabolario', type: 'text', q: 'Traduci in italiano: die Woche', answer: ['settimana', 'la settimana', 'una settimana'], explain: 'la settimana (i giorni della settimana: lunedì, martedì …).' },
    { id: 'i-v12', topic: 'vocabolario', type: 'text', q: 'Traduci in italiano: morgen', answer: ['domani'], explain: 'domani = morgen, oggi = heute, ieri = gestern.' },
    { id: 'i-v13', topic: 'vocabolario', type: 'text', q: 'Traduci in italiano: links', answer: ['sinistra', 'a sinistra'], explain: 'a sinistra = links, a destra = rechts, dritto = geradeaus.' },
    { id: 'i-v14', topic: 'vocabolario', type: 'text', q: 'Traduci in italiano: die Lehre (Berufslehre)', answer: ['apprendistato', "l'apprendistato", 'tirocinio', 'il tirocinio'], explain: 'l’apprendistato (in Ticino anche: il tirocinio). L’apprendista = der/die Lernende.' },
    { id: 'i-v15', topic: 'vocabolario', type: 'text', q: 'Traduci in italiano: der Bahnhof', answer: ['stazione', 'la stazione'], explain: 'la stazione.' },

    /* Lettura */
    mc('i-l1', 'lettura', 'Dove lavora Luca?', ['in una scuola a Thusis', 'in una banca a Coira', 'in una pizzeria', 'a Poschiavo'], 1, '«in una banca a Coira».'),
    mc('i-l2', 'lettura', 'A che ora parte il treno di Luca?', ['alle 6.00', 'alle 6.40', 'alle 7.00', 'alle 4.60'], 1, '«il mio treno da Thusis parte alle sei e quaranta».'),
    mc('i-l3', 'lettura', 'Chi è la signora Rossi?', ['la sua nonna', 'la sua formatrice', 'una cliente', 'un’apprendista'], 1, '«la mia formatrice, la signora Rossi».'),
    mc('i-l4', 'lettura', 'Che cosa ha fatto Luca per la prima volta?', ['ha preso il treno', 'ha risposto al telefono', 'ha mangiato una pizza', 'ha telefonato alla nonna'], 1, '«ho risposto al telefono per la prima volta».'),
    mc('i-l5', 'lettura', 'Che cosa significa «stanco morto»?', ['molto stanco', 'un po’ malato', 'triste', 'arrabbiato'], 0, '«stanco morto» è un’espressione che significa «stanchissimo».'),
    mc('i-l6', 'lettura', 'Vero o falso? «Luca vuole fare la maturità professionale.»', ['vero', 'falso'], 0, '«… della maturità professionale, che voglio fare anch’io».'),
    mc('i-l7', 'lettura', 'Quanto è durato il viaggio da Coira a Locarno?', ['un’ora', 'circa tre ore', 'un giorno', 'mezz’ora'], 1, '«Il viaggio è durato circa tre ore».'),
    mc('i-l8', 'lettura', 'Perché il fratello di Nina non ha fatto il bagno?', ['Pioveva.', 'L’acqua era troppo fredda.', 'Non sapeva nuotare.', 'Era stanco.'], 1, '«l’acqua era ancora troppo fredda».'),
    mc('i-l9', 'lettura', 'Che cosa vuole fare la famiglia domani mattina?', ['tornare subito a casa', 'fare una gita in battello', 'salire alla Madonna del Sasso', 'mangiare un gelato'], 2, '«Domani mattina vogliamo salire alla Madonna del Sasso».'),
    mc('i-l10', 'lettura', 'Che tipo di testo è?', ['un articolo di giornale', 'una lettera / e-mail personale', 'una ricetta', 'una poesia'], 1, 'Comincia con «Cara Giulia» e finisce con «Un abbraccio, Nina» → lettera personale.')
  ];
  items.forEach(i => { if (i.topic === 'lettura') i.passage = Number(i.id.slice(3)) <= 6 ? P_LUCA : P_TICINO; });

  const writing = [
    { title: 'Il mio fine settimana', kind: 'E-mail', task: 'Scrivi un’e-mail a un’amica/un amico di Lugano. Racconta che cosa hai fatto lo scorso fine settimana (passato prossimo!) e chiedi che cosa ha fatto lei/lui.', minWords: 80, minutes: 25 },
    { title: 'Mi presento', kind: 'Testo', task: 'Presentati: come ti chiami, quanti anni hai, dove abiti, com’è la tua famiglia, quali sono i tuoi hobby e che professione vuoi imparare.', minWords: 80, minutes: 25 },
    { title: 'La mia giornata', kind: 'Descrizione', task: 'Descrivi una tua giornata tipica, dalla mattina alla sera. Usa il presente e parole come: prima, poi, dopo, alle … , di solito, la sera.', minWords: 80, minutes: 25 }
  ];

  const checklist = [
    'Ho risposto a tutte le domande del compito.',
    'Saluto iniziale (Ciao …, / Cara …, Caro …,) e saluto finale (A presto, Un abbraccio).',
    'Articoli giusti (il/lo/la/l’, un/uno/una/un’).',
    'Accordo di nome e aggettivo (la casa bella, i ragazzi simpatici).',
    'Passato prossimo: essere o avere? Con essere il participio si accorda.',
    'Accenti: è (verbo), perché, città, più, può.',
    'Ho usato connettivi: e, ma, perché, poi, quando, però.'
  ];

  const merkblatt = `
<h3>Articoli</h3>
<ul><li><b>il</b> (pl. i): davanti a consonante – il libro, i libri</li>
<li><b>lo</b> (pl. gli): davanti a s + consonante, z, gn, ps, y – lo studente, lo zaino, gli studenti</li>
<li><b>l’</b> (pl. gli / le): davanti a vocale – l’amico → gli amici, l’amica → le amiche</li>
<li><b>la</b> (pl. le): femminile – la casa, le case</li>
<li>Indeterminativo: un libro, un amico (senza ’), uno studente, una casa, un’amica</li></ul>
<h3>Presente</h3>
<ul><li>-are: parl<b>o</b>, parl<b>i</b>, parl<b>a</b>, parl<b>iamo</b>, parl<b>ate</b>, parl<b>ano</b></li>
<li>-ere: prend<b>o</b>, prend<b>i</b>, prend<b>e</b>, prend<b>iamo</b>, prend<b>ete</b>, prend<b>ono</b></li>
<li>-ire: dorm<b>o</b>, dorm<b>i</b>, dorm<b>e</b>, dorm<b>iamo</b>, dorm<b>ite</b>, dorm<b>ono</b> (con -isc-: finisco, finisci, finisce, finiamo, finite, finiscono)</li>
<li>essere: sono, sei, è, siamo, siete, sono &nbsp;|&nbsp; avere: ho, hai, ha, abbiamo, avete, hanno</li>
<li>andare: vado, vai, va, andiamo, andate, vanno &nbsp;|&nbsp; fare: faccio, fai, fa, facciamo, fate, fanno</li></ul>
<h3>Passato prossimo</h3>
<ul><li>avere/essere (presente) + participio: ho mangiato, sono andato/a</li>
<li>Participio regolare: -are → -ato, -ere → -uto, -ire → -ito</li>
<li>Irregolari: fatto, detto, visto, preso, letto, scritto, messo, aperto, chiuso, stato, nato, rimasto</li>
<li>Con <b>essere</b> (movimento, cambiamento, essere/stare/rimanere) il participio si accorda: Anna è andata, i ragazzi sono partiti.</li></ul>
<h3>Preposizioni articolate</h3>
<table class="mini"><tr><th></th><th>il</th><th>lo</th><th>la</th><th>l’</th><th>i</th><th>gli</th><th>le</th></tr>
<tr><th>di</th><td>del</td><td>dello</td><td>della</td><td>dell’</td><td>dei</td><td>degli</td><td>delle</td></tr>
<tr><th>a</th><td>al</td><td>allo</td><td>alla</td><td>all’</td><td>ai</td><td>agli</td><td>alle</td></tr>
<tr><th>da</th><td>dal</td><td>dallo</td><td>dalla</td><td>dall’</td><td>dai</td><td>dagli</td><td>dalle</td></tr>
<tr><th>in</th><td>nel</td><td>nello</td><td>nella</td><td>nell’</td><td>nei</td><td>negli</td><td>nelle</td></tr>
<tr><th>su</th><td>sul</td><td>sullo</td><td>sulla</td><td>sull’</td><td>sui</td><td>sugli</td><td>sulle</td></tr></table>
<ul><li>a + città (a Coira), in + paese (in Italia), da + persona (dal medico), da + tempo (da due anni = seit)</li></ul>
<h3>Possessivi</h3>
<ul><li>il mio, la mia, i miei, le mie – il tuo, il suo, il nostro, il vostro, il loro</li>
<li>Parenti al singolare senza articolo: mia madre, suo fratello (ma: i miei genitori, il loro padre)</li></ul>
<h3>Falsi amici</h3>
<ul><li>la camera = Zimmer, il conto = Rechnung, la ricetta = Rezept, caldo = warm, burro = Butter, la fermata = Haltestelle</li></ul>`;

  BMP.subjects.push({
    id: 'italienisch', name: 'Italienisch', icon: 'It', color: 'var(--c-italienisch)',
    intro: 'Articoli, presente, passato prossimo, preposizioni, aggettivi, vocabolario e lettura.',
    topics: [
      { id: 'articoli', name: 'Articoli', desc: 'il, lo, la, l’ – un, uno, una, un’' },
      { id: 'presente', name: 'Presente', desc: 'Verbi regolari e irregolari' },
      { id: 'passato', name: 'Passato prossimo', desc: 'avere o essere, participi' },
      { id: 'preposizioni', name: 'Preposizioni', desc: 'del, al, nella – a, in, da' },
      { id: 'aggettivi', name: 'Aggettivi & possessivi', desc: 'Plurale, accordo, mio/tuo/suo' },
      { id: 'vocabolario', name: 'Vocabolario', desc: 'Parole, falsi amici, traduzione' },
      { id: 'lettura', name: 'Lettura', desc: 'Comprensione del testo' }
    ],
    items, generators, merkblatt, writing, checklist,
    exam: { count: 25, minutes: 40 }
  });
})(typeof window !== 'undefined' ? window : globalThis);
