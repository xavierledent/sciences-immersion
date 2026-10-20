/* ===== Labo virtuel « The energy test bench » (phys1) : textes en néerlandais =====

   Simulation commune aux deux filières : js/lab-energy.js, chargée après ce
   fichier. Mêmes clés que l'anglais (en/year1/phys1/lab-energy.en.js).

   [mot] ou [mot|clé] : mot du lexique, souligné, traduction française au
   survol ou au toucher (clé dans glossary, en minuscules).

   Termes repris du chapitre NL (vocabulary, practice, interactive) : ledlamp,
   gloeilamp, slinger (« zaklamp met slinger »), nuttige / verloren energie,
   energiestroomdiagram, eerlijke test ; « lichtenergie » comme le cours
   (pas « EMG-energie »). Phrases d'hypothèse et de conclusion : une
   subordonnée (« Ik denk dat … ») renvoie le verbe à la fin ; la deuxième
   hypothèse passe par une principale (« Ik denk: op het einde is er … »). */

LabEngine.addText('energy', {
  labels: {
    title: 'De energietestbank',

    // « a, b en c »
    list: names => names.length > 1 ? names.slice(0, -1).join(', ') + ' en ' + names[names.length - 1] : names[0] || '',

    lamps: {
      led: { name: 'Ledlamp', the: 'de ledlamp', a: 'een ledlamp' },
      halogen: { name: 'Halogeenlamp', the: 'de halogeenlamp', a: 'een halogeenlamp' },
      traditional: { name: 'Gloeilamp', the: 'de gloeilamp', a: 'een gloeilamp' }
    },
    forms: {
      chemical: 'chemische energie', mechanical: 'mechanische energie', thermal: 'thermische energie',
      electrical: 'elektrische energie', light: 'lichtenergie', nuclear: 'kernenergie'
    },
    amounts: { more: 'meer energie dan', same: 'evenveel energie als', less: 'minder energie dan' },
    fates: { air: 'gaat verloren in de lucht', destroyed: 'wordt vernietigd', stored: 'wordt opgeslagen in de lamp' },
    tools: { meter: 'Energiemeter', lightmeter: 'Lichtmeter', camera: 'Warmtecamera' },

    questions: {
      light: 'Beide lampen krijgen evenveel energie. Welke lamp geeft meer licht?',
      waste: 'Beide lampen krijgen evenveel energie. Welke lamp [verliest] er meer van?',
      end: 'Is er op het einde evenveel energie als bij het begin?'
    },
    yourQuestions: 'Jouw onderzoeksvragen',
    lampsLine: (a, b) => `Je twee lampen: ${a} en ${b}. Een dynamo met een [slinger] laat ze branden.`,
    hypothesisTitle: 'Jouw hypotheses',
    hyp1: {
      light: b => `Ik denk dat ${b} meer licht zal geven.`,
      waste: b => `Ik denk dat ${b} meer energie zal [verliezen].`
    },
    hyp2: b => `Ik denk: op het einde is er ${b} bij het begin.`,
    because: 'Waarom denk je dat? (niet verplicht)',
    becausePlaceholder: 'Omdat…',
    hypothesisReady: 'Je hypotheses zijn klaar.',
    hypothesisPending: 'Tik op de woorden die je twee hypotheses aanvullen.',
    toBench: 'Verder: de testbank',

    tabs: { bench: 'De testbank', diagram: 'Het energiestroomdiagram' },
    lampsTitle: 'Lampen',
    toolsTitle: 'Meettoestellen',
    formsTitle: 'Energievormen',
    lampState: { socket: 'in de fitting', tested: 'getest' },
    scene: {
      label: 'Testbank: een dynamo met een slinger, draden en een lamp',
      given: 'GEGEVEN ENERGIE',
      units: 'eenheden',
      dynamo: 'DYNAMO',
      socket: 'fitting',
      over: 'TEST AFGELOPEN',
      knob: 'Slinger van de dynamo: draai eraan (pijltjestoetsen)',
      spot: row => `${row}: hier meten`
    },
    tableTitle: 'Jouw metingen',
    tableUnit: 'energie (eenheden)',
    tableWhere: 'Meetpunt',
    rows: { crank: 'As van de slinger', dynamo: 'Dynamo', wires: 'Draden', light: 'Voor de lamp', lamp: 'Lamp' },
    cellLabel: (row, lamp) => `${row}, ${lamp}, in eenheden`,

    captionStart: 'Sleep een lamp naar de [fitting], of tik erop.',
    captionReady: 'Draai met je vinger aan de [slinger]: maak cirkels rond de [as]. De testbank stopt bij 100 eenheden.',
    captionTurning: 'Blijf aan de [slinger] draaien tot de testbank 100 eenheden gekregen heeft.',
    captionTestDone: 'Test afgelopen: de testbank kreeg 100 eenheden. Meet nu: sleep een meettoestel naar een punt van de testbank, of tik op een meettoestel en dan op een punt.',
    captionMeasure: 'Meet: sleep een meettoestel naar een punt van de testbank, of tik op een meettoestel en dan op een punt.',
    captionToolPicked: tool => `${tool}: tik nu op een punt van de testbank.`,
    captionPickTool: 'Kies eerst een meettoestel: sleep het naar dit punt, of tik erop en dan op het punt.',
    captionRead: 'Lees de waarde af en noteer ze in de tabel.',
    captionNextLamp: 'Alle waarden van deze lamp staan in de tabel. Test nu de andere lamp!',
    captionAllDone: 'Beide lampen zijn getest en je tabel is volledig. Verder: het [energiestroomdiagram].',
    captionAlready: 'Deze lamp is al getest: haar waarden staan nog op de testbank.',
    captionBadValue: 'Noteer het getal dat het meettoestel toont: een geheel getal, bijvoorbeeld 37.',
    captionNoLamp: 'Draai eerst een lamp in de [fitting].',
    wrongTool: {
      meter: 'De [energiemeter] meet de energie die door een draaiende [as] of door [draden] gaat. Probeer een ander punt.',
      lightmeter: 'De [lichtmeter] meet het licht dat de lamp geeft: houd hem voor de lamp.',
      camera: 'De warmtecamera meet de warmte die een voorwerp aan de lucht geeft als het [warm wordt].'
    },
    captionDiagram: 'Sleep elke energievorm naar zijn vak, of tik op een energievorm en dan op een vak. De pijlen zijn even breed als de waarden in je tabel.',
    captionFormPicked: form => `${form}: tik nu op een vak.`,
    captionPickForm: 'Kies eerst een energievorm en tik dan op een vak.',
    captionDiagramDone: 'Alle vakken zijn ingevuld. Verder: besluiten!',
    valuesOf: 'Waarden van:',
    diagram: {
      label: 'Energiestroomdiagram',
      hand: 'Je hand', dynamo: 'Dynamo', lamp: 'Lamp', room: 'Kamer', air: 'Lucht',
      useful: 'nuttige energie', wasted: 'verloren energie, naar de lucht',
      emptyBox: 'leeg vak'
    },
    arrows: { crank: 'Hand → dynamo', dynamo: 'Dynamo → lucht', wires: 'Dynamo → lamp', light: 'Lamp → kamer', lamp: 'Lamp → lucht' },

    lockHypothesis: 'Vul eerst je twee hypotheses aan.',
    lockHypothesisFixed: 'Je hypotheses liggen vast: het experiment is begonnen. Een wetenschapper verandert de hypothese niet na het zien van de resultaten!',
    lockNoLamp: 'Draai eerst een lamp in de fitting.',
    lockTurnFirst: 'Draai eerst aan de slinger: de testbank meet de energie tijdens de test.',
    lockCrankDone: 'Test afgelopen: de testbank stopte bij 100 eenheden. Beide lampen krijgen precies evenveel energie.',
    lockCell: (row, lamp) => `Meet dit punt eerst met het juiste meettoestel, met ${lamp} in de fitting.`,
    lockValues: n => `Noteer eerst al je metingen in de tabel: nog ${n === 1 ? '1 waarde' : n + ' waarden'}.`,
    lockForms: n => `Vul het energiestroomdiagram aan: nog ${n === 1 ? '1 leeg vak' : n + ' lege vakken'}.`,
    toDiagram: 'Verder: het energiestroomdiagram',
    toConclude: 'Verder: besluiten',
    runInfo: (v, vt, f, ft) => `Tabel: ${v} / ${vt} waarden · Diagram: ${f} / ${ft} vakken`,

    concl1: {
      light: b => `Mijn resultaten tonen dat ${b} meer licht geeft.`,
      waste: b => `Mijn resultaten tonen dat ${b} meer energie [verliest].`
    },
    concl2: b => `Op het einde is er ${b} bij het begin.`,
    concl3: (form, fate) => `De energie die geen licht wordt, wordt ${form}. Ze ${fate}.`,
    startLabel: 'Energie bij het begin:',
    endLabel: 'Energie op het einde:',
    unitsWord: 'eenheden',
    tickHint: 'Vink ✓ in de tabel de energie aan die er op het einde is, en [tel ze op] voor elke lamp.',
    tickHead: 'Op het einde?',
    tickRow: row => `${row}: is deze energie er op het einde?`,
    startAria: 'Energie bij het begin, in eenheden',
    totalAria: lamp => `Energie op het einde met ${lamp}, in eenheden`,
    qVerdict: n => `Dus mijn hypothese ${n} is`,
    confirmed: 'bevestigd',
    rejected: 'verworpen',
    checkConclusions: 'Mijn besluiten controleren',
    backToLab: 'Terug naar het labo',

    scoreLabel: 'controles geslaagd',
    markCorrect: 'juist',
    markIncorrect: 'fout',
    criteria: { measures: 'Metingen', forms: 'Energievormen', balance: 'Energiebalans', answers: 'Besluiten', verdicts: 'Hypotheses' },
    criteriaSub: { measures: 'Jouw tabel', forms: 'Jouw diagram', balance: 'Jouw berekening', answers: 'Jouw antwoorden', verdicts: 'Jouw oordeel' },

    report: {
      title: 'Laboratoriumverslag — De energietestbank',
      because: 'Omdat',
      materials: lamps => `Een dynamo met een slinger op een testbank, ${lamps}, een energiemeter, een lichtmeter en een warmtecamera.`,
      procedure: (a, b) => [
        `Draai ${a} in de fitting.`,
        'Draai aan de slinger tot de testbank 100 eenheden energie gekregen heeft: dan stopt de testbank.',
        'Meet de energie op vijf punten: de energiemeter op de as van de slinger en op de draden, de lichtmeter voor de lamp, de warmtecamera op de dynamo en op de lamp. Noteer de waarden in de tabel.',
        `Doe hetzelfde met ${b}: die krijgt evenveel energie (eerlijke test).`,
        'Teken het energiestroomdiagram.'
      ],
      tableCaption: 'Energie (eenheden)',
      diagramCaption: 'Energiestroomdiagram',
      arrowHead: 'Pijl',
      formHead: 'Energievorm',
      light: (a, la, b, lb) => `Gegeven licht: ${la} eenheden met ${a}, ${lb} eenheden met ${b}.`,
      start: v => `Energie bij het begin: ${v} eenheden.`,
      endRows: list => `Op het einde telde ik: ${list}.`,
      end: (lamp, expr, total) => `Energie op het einde met ${lamp}: ${expr} = ${total} eenheden.`,
      verdict: (n, word) => `Mijn hypothese ${n} is ${word}.`,
      score: n => `Score: ${n} / 5 controles geslaagd.`
    }
  },

  glossary: {
    slinger: 'manivelle', as: 'axe', fitting: 'douille', draden: 'fils électriques',
    energiemeter: 'compteur d’énergie', lichtmeter: 'luxmètre (il mesure la lumière)',
    'warm wordt': 'chauffe', 'wordt warm': 'chauffe',
    verliest: 'perd', verliezen: 'perdre', verloren: 'perdue',
    'tel ze op': 'additionne-les', energiestroomdiagram: 'diagramme de flux d’énergie',
    gloeilamp: 'ampoule classique (à incandescence)', gloeidraad: 'filament', witheet: 'chauffé à blanc',
    'verspreidt zich': 'se répand', 'behoud van energie': 'conservation de l’énergie'
  },

  // Étape Check : pourquoi, lampe par lampe, puis le bilan.
  explanations: {
    led: 'Een ledlamp geeft licht zonder heel warm te worden: ongeveer een derde van haar energie wordt lichtenergie.',
    halogen: 'Een halogeenlamp is een gloeilamp met een hetere gloeidraad, in een klein glazen buisje met een speciaal gas. Ze geeft iets meer licht dan een gloeilamp, maar veel minder dan een ledlamp.',
    traditional: 'Een [gloeilamp] geeft licht omdat haar dunne draadje, de [gloeidraad], [witheet] is (ongeveer 2 500 °C). Het grootste deel van haar energie wordt thermische energie: maar ongeveer 5 % wordt lichtenergie.',
    europe: 'Daarom worden gloeilampen in Europa niet meer verkocht: een ledlamp geeft hetzelfde licht met veel minder energie.',
    conservation: 'Energie wordt nooit gemaakt en nooit vernietigd: ze wordt alleen omgezet. Dat is het [behoud van energie]. Je hand geeft 100 eenheden bij het begin; op het einde zijn de lichtenergie en de thermische energie van de dynamo en van de lamp samen weer 100 eenheden.',
    dissipation: 'De thermische energie van de dynamo en van de lamp [verspreidt zich] in de lucht: we kunnen ze niet meer gebruiken. Het is [verloren] energie. Ze is niet vernietigd: de lucht is gewoon een beetje warmer.',
    camera: 'In een echt labo toont een warmtecamera temperaturen, geen energie. Hier geeft de testbank de thermische energie in eenheden, zodat je ze kunt vergelijken met de andere energievormen.'
  },

  // v, said : wat de leerling noteerde (nothing als er niets staat) ; expr :
  // « 19 + 38 + 43 », de waarden van de aangevinkte rijen.
  check: {
    nothing: 'niets',
    measuresScore: (good, total) => `${good} / ${total} waarden juist genoteerd (hetzelfde als de meettoestellen).`,
    measuresAllGood: 'Al je waarden komen overeen met de meettoestellen. Goed afgelezen!',
    measuresLegend: 'Foute waarden: wat jij noteerde → wat het meettoestel toonde.',
    measureMiss: (row, lamp, v, r) => `${row}, ${lamp}: jij noteerde ${v}, het meettoestel toonde ${r}.`,
    formsAllGood: 'Alle energievormen staan in het juiste vak. Goed gedaan!',
    formsSummary: 'De dynamo zet mechanische energie om in elektrische energie. De lamp zet elektrische energie om in lichtenergie. Allebei geven ze ook thermische energie aan de lucht: de rode pijlen.',
    formWrong: (arrow, said) => `${arrow}: jij schreef “${said}”.`,
    formEmpty: arrow => `${arrow}: leeg vak.`,
    formWhy: {
      crank: 'Je hand draait aan de [slinger]: de energie die in de dynamo gaat, is de energie van beweging, mechanische energie.',
      dynamo: 'De dynamo [wordt warm]: hij geeft thermische energie aan de lucht.',
      wires: 'De [draden] voeren elektrische energie van de dynamo naar de lamp.',
      light: 'De lamp geeft licht aan de kamer: lichtenergie.',
      lamp: 'De lamp wordt warm: ze geeft thermische energie aan de lucht.'
    },
    startOk: 'Energie bij het begin: 100 eenheden, de energie die je hand gaf. Juist.',
    startWrong: v => `Energie bij het begin: jij schreef ${v}. De testbank krijgt altijd 100 eenheden van je hand: dat is de energie bij het begin.`,
    endNames: { dynamo: 'de thermische energie van de dynamo', light: 'de lichtenergie', lamp: 'de thermische energie van de lamp' },
    ticksOk: list => `Op het einde bestaat de energie uit ${list}. Juist.`,
    ticksWires: 'De elektrische energie is er op het einde niet meer: ze is alleen onderweg van de dynamo naar de lamp, en de lamp zet ze om in lichtenergie en thermische energie. Als je ze ook meetelt, tel je dezelfde energie twee keer.',
    ticksCrank: 'De energie die je hand aan de [as] van de slinger geeft, is de energie bij het begin, niet op het einde.',
    ticksMissing: list => `Je vergat ${list}. Die energie is er op het einde ook, ook al kunnen we ze niet gebruiken.`,
    totalOk: (lamp, expr, sum) => `${lamp}: ${expr} = ${sum} eenheden. Juist berekend.`,
    totalWrong: (lamp, said, expr, sum) => `${lamp}: jij schreef ${said}, maar ${expr} = ${sum} eenheden.`,
    rightBalanceTitle: 'De juiste balans, met de waarden van de meettoestellen:',
    rightBalance: (lamp, expr) => `${lamp}: ${expr} = 100 eenheden.`,
    answerOk: 'Juist!',
    answerWrong: 'Niet helemaal. Het juiste antwoord:',
    verdictOk: v => `Je hypothese en je besluit ${v === 'confirmed' ? 'zeggen hetzelfde' : 'zeggen niet hetzelfde'}: je hypothese is dus inderdaad ${v === 'confirmed' ? 'bevestigd' : 'verworpen'}. Goed geoordeeld!`,
    verdictWrong: should => `Vergelijk je hypothese met je besluit: ze ${should === 'confirmed' ? 'zeggen hetzelfde, dus je hypothese is bevestigd' : 'zeggen niet hetzelfde, dus je hypothese is verworpen'}.`,
    rejectedNote: 'Een verworpen hypothese is geen fout: zo gaat de wetenschap vooruit.',
    yourHyp: n => `Jouw hypothese ${n}:`,
    yourConcl: n => `Jouw besluit ${n}:`
  }
});
