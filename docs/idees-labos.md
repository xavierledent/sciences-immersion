# Idées de labos virtuels

Pistes discutées avec l'enseignant, pas encore construites. Un labo se crée
avec le skill `creer-labo` (fiche de conception à valider d'abord).

## Pour tous les chapitres : relier les labos à l'autoévaluation

**Fait le 2026-11-01** (champ `labs`, voir docs/formats-donnees.md) pour
bio1, chem1 et phys1. Pour un nouveau labo ou une nouvelle autoévaluation :
cocher ses attendus de savoir-faire et de compétence dans l'éditeur.

Souhait de l'enseignant : les attendus de savoir-faire (S-F) et de
compétence sont le mieux travaillés dans les labos ; la page Assessment
(`autoeval.json`) devrait donc renvoyer vers eux, comme elle renvoie déjà
vers les exercices (`exercises`). Pistes (à concevoir) :
- un champ par attendu, par exemple `labs: ["separation"]`, qui affiche un
  lien vers le labo (le lien direct `laboratory.html?lab=<id>` existe déjà
  dans lab-engine.js) ;
- changement de format d'autoeval.json : à reporter dans l'éditeur
  `Admin/content.html` et dans docs/formats-donnees.md ;
- décision de l'enseignant : **ne pas montrer le résultat de l'élève** (ni
  score ni pastille de couleur), comme déjà pour les exercices. Sinon l'élève
  reste passif (« c'est vert, je connais ») ; l'autoévaluation se fait parfois
  un mois plus tard, il doit aller revoir ou refaire le labo, puis seulement
  s'attribuer ses ampoules. Le lien mène au labo, rien de plus.

## chem2 — Mixtures and pure substances

Labo réel du chapitre : la séparation de mélanges (Mission 7), déjà fait
(« The separation challenge »). Le champ est donc libre : les idées
ci-dessous sont des expériences sur un modèle, parties du cours.

Préférence de l'enseignant : **1, puis 3**.

### 1. « Zoom in » : le microscope des molécules — construit (2026-11-02)

Partie 2 (Missions 4 à 6, Exercices 4 et 5). Des échantillons inconnus (eau
pure, air, eau salée, eau + huile, eau gazeuse, eau sucrée…) : observation à
l'œil nu, puis microscope imaginaire. L'élève construit le modèle
moléculaire (code couleur de la Mission 5), classe corps pur / mélange,
homogène / hétérogène, compare au « vrai » zoom ; pour finir, ce qui n'est
pas vrai dans le modèle (couleur, taille, mouvement : Mission 6).

Attendus : S-F 17 (modèles moléculaires ; modéliser une solution), molécule,
corps pur et mélange au niveau moléculaire, définir un modèle scientifique,
compétence terminale (eau gazeuse : expliquer à Louis). La Partie 2 n'a
aucun labo et porte le plus d'attendus.

Avis de l'enseignant : « travailler les modèles moléculaires et le
microscopique, c'est super ».

Refait le 2026-11-02 après un premier essai en ligne : avec des bocaux
mystère, l'élève ne pouvait que deviner (corps pur ou mélange homogène :
rien de factuel), la question sur le modèle avait toujours la même réponse
et Conclude reprenait l'exercice du cours (expliquer à un camarade).
Version 2 : l'élève fait lui-même deux préparations (il sait ce qu'il
verse), d'autres molécules que le cours (sucre, hélium, sable), solvant et
soluté dans le carnet, une règle en Conclude. À garder : dessiner soi-même
les modèles moléculaires.

### 3. La station d'épuration ou le centre de tri — construit (2026-11-04) : « Down the drain »

Fiche validée le 2026-11-04 : jour d'orage avec déversoir, campagne auprès
des habitants, bassin d'évaporation (fausse bonne idée chiffrée), bassin à
bactéries nommé « pas une séparation », pas de gants, 4 choses par jour.
Ajouté en construisant : le budget de la ville est tiré au sort (150 000,
250 000 ou 300 000 € par an), sinon le filtre à sable gagnait presque
toujours.

Partie 3, vie courante (Exercice 7 b, French challenge). Expérience sur un
modèle : l'élève prend la place d'un travailleur d'une de ces installations
belges et règle l'ordre des postes (dégrillage, décantation, filtration… ;
ou aimant, tamis, tri manuel), puis voit l'effet sur l'eau rejetée ou les
déchets récupérés.

Attendu : citer des techniques de séparation en lien avec le quotidien et
les enjeux environnementaux. Attention : ne pas refaire le labo de
séparation (mêmes techniques) ; l'intérêt est le contexte réel et le métier.

Avis de l'enseignant : ici le labo apporte quelque chose, et se mettre dans
la peau d'un travailleur entre dans les visées transversales du programme
(« découvrir des métiers »).

Pistes pour qu'il ne soit pas une redite du labo de paillasse (à trancher à
la conception) :
- l'échelle et le flux continu : des tonnes d'eau ou de déchets qui
  arrivent, pas un pot ;
- les compromis du métier : coût, énergie, temps, qualité de ce qui sort ;
- l'enjeu environnemental : ce qui part dans la rivière, ce qui est
  recyclé, ce qui finit en décharge (attendu « enjeux environnementaux »,
  Exercice 7 b) ;
- une mission concrète du travailleur : « l'eau rejetée doit respecter la
  norme », « récupérer le maximum de métal » ; l'élève voit les
  conséquences de ses réglages.

Choix de l'enseignant (2026-11-04) : **la station d'épuration** (colle
mieux au chapitre : décantation, filtration, eau et solutés ; le centre de
tri recouperait « From the Earth and back » de chem1). Le labo est axé sur
deux attendus :
- citer des techniques de séparation en lien avec le quotidien et selon les
  enjeux environnementaux ;
- compétence terminale : utiliser des connaissances scientifiques pour
  justifier des choix en relation avec la séparation de constituants.

Le French challenge du cours a une fiche sur une vraie station d'épuration
belge : ne pas refaire cette activité. Sur le site, l'installation reste
anonyme (aucun nom d'entreprise réelle).

### 2. « Mystery beakers » : la clé dichotomique — écarté

Partie 1 (Exercice 3, Mission 2). Béchers sans étiquette, gestes
d'observation (regarder, agiter, laisser reposer, évaporer une goutte),
clé dichotomique. Avis de l'enseignant : en mode labo, cela n'apporte pas
grand-chose, cela se fait facilement de façon conceptuelle.

### 4. « Where is the salt? » avec une balance — non retenu

Mission 3 : peser eau, sel, solution (conservation de la masse), évaporer et
peser le sel récupéré. Redite de la question « Is it still in the water? »
du labo de séparation.

### 5. Les deux bouteilles de gaz — non retenu

Mission 1 : air et oxygène pur (pourcentage d'O₂, durée de combustion d'une
bougie). Attendu mineur (proportions, S-F 22), manipulation pauvre.

## phys2 — Energy, expansion and changes of state

Labos réels du chapitre : la fonte de la glace (Mission 8) et la glace de
mer ou sur terre (Mission 13, démonstration de l'enseignant). Trois labos
retenus le 2026-11-05 ; les attendus sf1, sf4, sf5 et c1 renvoient au
premier, sf4 et c1 au troisième, sf2, sf6, sf8 et c1 au deuxième (champ
`labs` d'autoeval.json). Sur la page Lab, le troisième vient en deuxième
place (le labo « citoyen » en dernier).

### 1. Palier et masse (Mission 8) — construit (2026-11-10) : « Watch it change »

Le changement d'état est tiré au sort (idée de l'enseignant) : glace qui
fond, eau qui gèle, eau qui bout, acide stéarique qui fond ou se solidifie ;
l'eau sort plus souvent. Predict : esquisser l'allure de la courbe, parier
sur la masse. L'élève choisit de fermer ou non le récipient (film étirable,
ballon sur le flacon) : décisif pour l'ébullition. Thermomètre numérique,
relevé chaque minute, graphique tracé à partir du tableau. La manipulation
se recommence une fois. Pas de condensation ni de sublimation : palier non
mesurable.

### 2. « Ostend 2100 » (Mission 13, élargie) — construit (2026-11-10)

Grande question en deux temps : pourquoi la mer monte, et ce que cela
change à Ostende d'ici 2100. Trois postes : les deux verres (glace
flottante, glace sur grille) ; l'eau de mer tiédie dans un flacon à tube
fin, pesé avant et après (dilatation, masse conservée) ; un modèle de la
côte (digue, ville, polders) avec un scénario mondial et la protection
suffisante tirés (d'où la hauteur du tronçon de digue) : forte tempête
aujourd'hui (l'eau reste sous le sommet), passage en 2100 (hausse lue sur
la mire du port, colonnes « d'où vient la hausse » : glace de mer 0, glace
terrestre, eau plus chaude), tempête en 2100 (la ville est inondée), puis
protections à essayer (sable, mur). Predict : placer quatre niveaux (dont
la tempête de 2100). Pourquoi la glace flotte (sf7) : expliqué à la
correction. Poste 3 simplifié le 2026-11-10 à la demande de l'enseignant
(trop chargé pour des 12-13 ans ; pari en cm jugé sans base) : plus de
frise de 25 ans en 25 ans, de graphique FO5c, de mire de la digue ni de
pari ; le scénario n'est dit qu'au Check.
Chiffres : médianes du GIEC arrondies (40 à 70 cm entre 2025 et 2100),
marée haute et tempête de 1953 d'après les relevés d'Ostende ; la part de
la glace terrestre et celle de la dilatation, la hauteur des vagues, le
gain du sable et du mur sont des valeurs du modèle, à revoir si une source
précise est retrouvée.

### 3. « The great melting race » — construit (2026-11-15)

Chaleur et température par le modèle moléculaire : une tasse d'eau très
chaude ou une cruche d'un litre plus tiède, qui fait fondre le plus de
glace ? Une paire tirée parmi cinq (masse fondue ≈ volume × température /
80, arrondie à 5 g) : la tasse gagne, la cruche gagne, ou égalité . Deux
blocs de 600 g (revu le 2026-11-15 après test : il doit rester de la glace
des deux côtés, sinon la course ne compare plus rien, mais une grande part
fond). Deux paris à Predict (le gagnant ; l'eau la plus chaude quand la
glace ne fond plus). Volumes et températures de départ donnés (déjà dans
le carnet), thermomètres déjà dans les eaux ; peser chaque bloc, le poser
dans une boîte isolante, verser ; la loupe à particules montre les deux
boîtes côte à côte (tout le contenu, un point = beaucoup de particules :
peu de rapides contre beaucoup de lentes, chocs contre la glace, glace qui
se détache en particules d'eau ; outil voisin du microscope imaginaire de
« Zoom in », voulu ainsi) ; une seule course de 40 minutes jusqu'à 0 °C
des deux côtés (voulu : même vitesse des particules à la fin) ; sortir et
repeser les blocs, soustraction. Ce qu'il faut faire est en couleur. Conclude : le gagnant et si c'était l'eau
la plus chaude ; température, énergie thermique, chaleur (la glace ne
« donne pas de froid »), fin de la fonte à la même température. Modèle
simplifié (boîtes parfaitement isolées, glace à 0 °C), dit au Check.
Attendus s4 à s8, sf4, c1, s14 (seuls sf4 et c1 se relient au labo).

Autres idées du même jour, au second plan : joint de dilatation d'un pont,
mélange d'eau chaude et d'eau froide, évaporation (test équitable),
ébullition en altitude (recoupe EXPLO 4), substances mystère par leur palier.

## bio2 — Human reproduction and prevention

Pas de labo réel dans ce chapitre (confirmé par l'enseignant le
2026-11-16) : tout est à concevoir. Attendus à viser en priorité : les
savoir-faire (sf1, sf2, sf3) et la compétence (c1) ; un labo qui ne les
touche pas reste possible s'il est cohérent et sympa. Limites : dessins
anatomiques oui ; activité « échange de liquides » oui.
**Aucun labo ne fait lire de longs documents** (voulu) : en immersion, il
faudrait soit les mettre en français (le labo n'est plus en anglais), soit
souligner presque tous les mots ; même effet. D'où le choix du C ci-dessous.

Trois labos retenus le 2026-11-16 : A, B, C (variante visuelle). Ordre sur
la page Lab : A, puis B (décidé le 2026-11-17). Avant la fiche du B et du C, et avant de coder le A :
demander le chapitre de cours (le dossier `PDF/` du site n'a que la carte
mentale et la fiche d'autoévaluation), pour reprendre ses mots (« sexual
intercourse » ou « sexual contact », « STI test » ou « screening »…) et ne
pas refaire une activité du cours (simulation de l'app Flo en Partie 4,
French challenge en Partie 6).

### A. « Invisible spread » : une IST invisible se propage — construit (2026-11-16)

Expérience sur un modèle : l'échange de liquides fait en classe (soude et
phénolphtaléine, ici sans nom). Attendus : sf3, c1, s10.

Première idée avec des verres écartée par l'enseignant : un verre évoque
« boire », l'élève retiendrait qu'une IST passe en partageant une boisson.
Donc **tubes à essai et pipette**, et une **légende du modèle** affichée du
début à la fin : 1 tube = 1 personne ; mélanger deux tubes = un contact
sexuel sans préservatif (« sexual contact without a condom ») ; rose après le test
= la personne a l'IST ; bouchon = préservatif ; étiquette bleue = vacciné
contre le HPV ; « In real life, an STI is not passed on by sharing a glass,
a tube or a towel. » Jamais « partager », « boire », « toucher ».

Préservatif et HPV : **option 1** retenue. Un seul des deux tubes bouchés
suffit à protéger l'échange (responsabilité partagée : le préservatif de
l'un protège les deux) ; pour le HPV, environ un échange protégé sur dix
passe quand même (contact peau à peau) ; le vaccin protège du HPV, rien
contre la chlamydia. Message de la brochure HPV du cours : les deux
ensemble.

Fiche de conception (version du 2026-11-16, après lecture du cours) :
- Page Mission : « Mission: follow an infection you cannot see » ; dans un
  groupe, une personne a une IST sans le savoir (souvent aucun signe) ;
  question générale « How does an STI spread in a group, and what can slow
  it down? » ; étapes : **Mix** les tubes tournée après tournée (pipette,
  carnet des échanges) ; **Test** et **count** (plaque à 12 creux,
  indicateur) ; **Replay** avec préservatifs puis vaccin, et **compare**
  (graphique). Rien du tirage (ni l'IST).
- Questions : 1) comment le nombre de personnes qui ont l'IST change-t-il,
  tournée après tournée ? 2) la moitié du groupe est protégée : qu'arrive-t-il
  à ceux qui ne le sont pas ? 3) le modèle ressemble-t-il à la vie réelle ?
  (sans hypothèse, réponse à Conclude).
- Predict (**pas de pari** : l'enseignant les juge sans base tangible) :
  en tête, la carte « Today's STI » tirée (HPV ou chlamydia), trois faits
  repris de la Mission 14 (chlamydia : bacterium ; passes during sexual
  intercourse, often no signs ; a condom protects, no vaccine. HPV : virus ;
  skin contact, often no signs ; vaccine exists, a condom reduces the risk
  but does not protect completely). Q1 : choisir un de trois petits
  histogrammes (tournées 1 à 3) : reste à peu près pareil / une personne de
  plus par tournée / peut doubler à chaque tournée (on peut raisonner :
  chaque personne qui a l'IST peut la passer à son partenaire). Q2 : deux
  phrases, « Half of the group uses condoms / has the HPV vaccine. Among
  the people without …, there will be [more / as many / fewer] infections
  than without any protection. » « Why do you think so? » facultatif. Figé
  dès le premier échange.
- Experiment, partie 1 : 12 tubes numérotés, tous clairs, un porteur caché ;
  3 tournées de 4 à 6 paires tirées ; l'élève touche une paire, la pipette
  mélange (animation), le carnet note l'échange (relevé du geste, pas une
  observation) ; tournée suivante verrouillée tant que la précédente n'est
  pas finie. **Test après chaque tournée** : une goutte de chaque tube dans
  une plaque à 12 creux, puis l'indicateur (Get tested regularly) ; l'élève
  touche les creux roses et écrit le nombre.
- Experiment, partie 2 : mêmes échanges rejoués (test équitable, visible
  dans le carnet), **deux scénarios** automatiques (« les deux ensemble »
  retiré le 2026-11-16 : redite des préservatifs pour la chlamydia ; pour
  le HPV, une phrase à la correction) : la moitié du groupe avec bouchon,
  puis la moitié vaccinée ; un test après chacun. L'élève compare les
  mêmes tubes non protégés entre partie 1 et partie 2. Histogramme FO5b
  tracé par l'élève. 5 tests en tout. Bouton du pied : Next: test the
  tubes → … → Next: replay with condoms → Next: replay with the vaccine →
  Next: conclude.
- Règles du modèle : un seul des deux tubes bouché suffit à protéger
  l'échange ; pour le HPV, environ un échange protégé sur dix passe quand
  même ; le vaccin protège du HPV, rien contre la chlamydia. Attendu en
  Q2 : préservatifs → moins d'infections chez les non protégés (les deux
  IST) ; vaccin → moins chez les non vaccinés pour le HPV, autant pour la
  chlamydia.
- Conclude : Q1 (la forme lue dans ses résultats) ; Q2 (les non protégés,
  avec SON IST) ; Q3 cocher les phrases vraies dans la vie réelle (dont une
  fausse : « If only one partner uses a condom, only that partner is
  protected ») ; jugement de l'hypothèse.
- Check (5) : Counts (5 tests), Graph (FO5b), Spread (Q1), Protection (Q2,
  selon l'IST tirée), Model and reality (Q3 + hypothèse).
- Rapport FO3 : tableau des tests, carnet des échanges et graphique ;
  erreurs marquées à leur place (creux oublié, colonne fausse, conclusion
  contraire aux résultats, phrase fausse cochée).
- Tirage : l'IST ; le porteur ; les paires (sans protection, 5 à 9
  infectés sur 12 après 3 tournées) ; les 6 protégés de chaque scénario ;
  les fuites du préservatif pour le HPV (au moins une si HPV).

Décisions tranchées le 2026-11-16 : **12 tubes** ; **pas** de recherche
du porteur de départ dans le labo ; personnes protégées **tirées au sort** ;
**numéros** sur les tubes.

Après lecture du chapitre de cours (2026-11-16) :
- légende : « mixing two tubes = **sexual contact without a condom** »
  (mots du cours ; pas de « body fluids » : le HPV passe par contact de la
  peau, Mission 14) ; « test » (Golden Rules : Get tested regularly) ;
- *partly* (Exercise 5b) : à reprendre là où le labo parle de la
  protection d'une personne (correction, Q3), Q2 portant sur le groupe ;
- Mission 14 et Exercises 5-6 traitent déjà la protection personne par
  personne : la question 2 porte sur **l'effet sur le groupe** (les non
  protégés le sont-ils un peu aussi ?), que le cours ne dit pas.

Predict validé le 2026-11-16 (voir la fiche ci-dessus) : trois
graphiques pour Q1, IST connue dès Predict, effet de groupe en Q2.

**Construit le 2026-11-16** (`js/lab-spread.js`, `css/lab-spread.css`,
`lab-spread.<en|nl>.js`, id `spread`). Choix faits à la construction, à
faire valider par l'enseignant au premier test :
- les 6 personnes protégées sont **les mêmes** dans les parties 2 et 3
  (bouchon, puis étiquette bleue), jamais la personne de départ : les
  mêmes colonnes rayées dans le carnet, la comparaison reste simple ;
- carnet : une ligne par test, l'élève coche les creux roses (12 cases),
  écrit le total, et pour « After round 3 », « With condoms » et « With
  the vaccine » le nombre de personnes non protégées qui ont l'IST
  (colonnes non rayées) ; le nombre de la tournée 3 se compte au début de
  la partie 2 (avant, on ne sait pas qui sera protégé) ;
- l'histogramme FO5b n'a que **les trois tournées sans protection** (il
  répond à Q1 et se compare aux trois petits graphiques de Predict) ;
  Q2 se lit dans la colonne « Without protection » ;
- Q2 en hypothèse : « Compared with no protection at all, how many people
  without a condom will have the STI? » [more / as many / fewer] ; en
  conclusion, une 3e phrase : « So, during sexual contact, a condom
  protects [only the person who uses it / both partners] » (c1) ;
- Q3 : quatre phrases juste / faux (contact sexuel et pas un verre ;
  toujours des signes ; un seul partenaire protégé ; seul un test le
  montre) ; les jugements : Q1 confirmé / rejeté, Q2 confirmé /
  partiellement / rejeté (deux prédictions) ;
- critères : Your notes, The graph, The spread (Q1 + jugement),
  Protection (Q2 + jugement), Real life (Q3) ;
- tirage recommencé jusqu'à : 2 personnes après la tournée 1, 3 ou 4 après
  la tournée 2, 6 à 9 après la tournée 3 (au moins 3 de plus) ; avec les
  préservatifs, moins de non protégés touchés ; avec le HPV, le vaccin
  aussi, et un seul contact protégé qui passe quand même ;
- dessins : tout en SVG (tubes, plaque, bouchons, étiquettes changent à
  l'écran) ; pas de planche Gemini prévue.

Les attendus sf3 et c1 renvoient au labo (champ `labs` d'autoeval.json,
EN et NL), à la demande de l'enseignant (2026-11-16).

Revu le 2026-11-16 après le premier essai de l'enseignant (version de
`save()` passée à 2 : un travail commencé avec la première version
recommence) :
- l'histogramme a **cinq colonnes** (les trois tournées, puis avec
  préservatifs et avec vaccin, aux couleurs des bouchons et des
  étiquettes, une accolade sous chaque groupe) : « c'est parlant, même si
  ça allonge » ;
- les cases rayées ne couvrent plus toute la colonne : seulement les
  lignes « With condoms » (dès la partie 2) et « With the vaccine » (dès
  la partie 3), puisque pendant les trois tournées personne n'est protégé ;
- la colonne « Without protection » se comprenait mal : remplacée par un
  encadré à côté du carnet, « People without protection » : leurs numéros
  de tubes (en partie 1 : on le saura en partie 2), « How many of them
  have the STI? », puis trois cases (après la tournée 3, avec
  préservatifs, avec vaccin) ; écrire dans une case entoure, dans la ligne
  correspondante du carnet, les tubes à compter ;
- partie 1 : plus de clic sur chaque paire ; un bouton « Mix round n »
  joue toute la tournée (la pipette mélange les paires une à une).

### B. « Cycle detectives » : des cycles, pas un seul cycle — construit (2026-11-17)

Fiche validée le 2026-11-17 (décisions de l'enseignant) : **3 femmes** × 4
mois (4 × 4 faisait trop de calculs) ; **rappel** du nombre de jours sous
chaque mois ; graphique en **barres groupées par femme** (l'exercice 8 du
niveau 3 fait déjà l'histogramme par classes) ; courbe de température
**donnée** ; profil « première année après les premières règles » possible
(il rassure) ; titre « Cycle detectives » ; **2e** sur la page Lab.

Construit le 2026-11-17 (`js/lab-cycles.js`, `css/lab-cycles.css`,
`lab-cycles.<en|nl>.js`, id `cycles`). Chapitre de cours relu ensuite le
même jour : libellés alignés sur PART 3 (« Day 1 of the cycle is the first
day of menstruation (the period) » ; Mission 7 : « Length of the cycle »,
« Day of ovulation », « Days between ovulation and the end » ; Summary :
« about 28 days on average, but it is different from one woman to
another », « about 14 days before the end of the cycle »). L'attendu sf1
renvoie au labo (champ `labs` d'autoeval.json, EN et NL), à la demande de
l'enseignant. Choix faits à la construction, à faire valider au premier
test :
- **la 4e affirmation est vraie** : « Ovulation comes about 14 days before
  the end of the cycle » (la fiche avait « If you know the first day of her
  period, you can say on which day she will ovulate next time », fausse) :
  avec quatre affirmations fausses, « tout est faux » se devinait, et la
  partie 3 (températures) ne répondait à aucune question de départ ; le
  mythe des jours sans risque (c1) passe par la correction (« There is no
  safe day », spermatozoïdes jusqu'à 5 jours) ;
- tirage : les mêmes quatre mois pour les trois (janvier-avril à
  septembre-décembre 2026) ; une femme par famille : a (vers 28, ou 27-30),
  b (irrégulière 24-36, écart ≥ 7 ; ou première année 30-45, écart ≥ 8,
  13 ans, « Her first period was last year »), c (vers 26, vers 31, ou
  34-37) ; règles de 4 à 6 jours ; exactement quatre premiers jours dans
  les quatre mois (aucune règle d'avant visible, pas de 5e) ; phase après
  l'ovulation 13 à 15 jours ; au moins une ovulation ailleurs qu'au jour 14 ;
- Predict : quatre cartes à poser dans « I think it is true / false » (prises
  en main ou glissées), « Why » facultatif ; figé au premier jour marqué ;
- partie 1 : onglets par femme ; toucher un jour le marque (4 au plus,
  retoucher l'enlève) ; un jour faux se pose quand même (relevé au Check) ;
  les longueurs se déverrouillent quand les 4 premiers jours de la femme sont
  marqués ; une longueur est juste si elle suit ses premiers jours **ou** le
  vrai calendrier (une erreur de jour ne compte pas deux fois) ;
- partie 2 : neuf barres, échelle 0-48 jours, repère pointillé « 28 days » ;
  glisser ou toucher, puis boutons −1 / +1 de la barre choisie (l'échelle
  est fine au doigt) ;
- partie 3 : la courbe du 3e cycle, un jour par colonne ; toucher un jour
  l'inscrit dans le carnet (« day 17 »), puis l'élève écrit les jours
  jusqu'à la fin (dernier jour écrit au bout de l'axe) ;
- Conclude : pour chaque affirmation, vrai / faux et une preuve dans une
  liste (« Lina: cycles of 28, 28 and 29 days », « Lina: ovulation on day
  15, then 14 days to the end ») ; réponse attendue lue dans les nombres
  notés par l'élève ; « about 14 » accepte 12 à 16 ; jugement : confirmée
  (4 accords), partiellement, rejetée (aucun) ;
- critères : First days, Cycle lengths, The graph, Ovulation, The claims ;
- dessins : tout en SVG ou HTML (calendrier, graphique, courbe) ; pas de
  planche Gemini prévue.

Idée de départ :

Enquête sur des données. Attendus : sf1, s5, c1 (mythe des « jours sans
risque »). Question : un cycle dure-t-il toujours 28 jours, l'ovulation
tombe-t-elle toujours au 14e jour ? Hypothèse : oui / non pour chaque
partie, pari sur la femme au cycle le plus long. L'élève lit le calendrier
des règles de 3 ou 4 jeunes femmes sur six mois, repère le premier jour des
règles, calcule chaque longueur de cycle, trace l'histogramme FO5b, lit une
courbe de température pour situer l'ovulation (comme l'exercice de Woman E).
Tirage : les profils (régulière, irrégulière, cycles longs, première année
après les premières règles). Check : longueurs, graphique, comparaison entre
femmes et chez une même femme, réponse au mythe du 14e jour. FO3, FO5b,
FO5c éventuellement.

### C. « Where does it act? » : les méthodes sur le trajet des cellules — retenu, fiche à faire

Variante visuelle de « The advice desk » (enquête dans des fiches par
méthode et par IST, grille à remplir), écartée par l'enseignant : trop de
lecture (voir plus haut). L'élève place des méthodes sur le schéma de
l'appareil reproducteur, puis lance le trajet des spermatozoïdes, de
l'ovocyte et des microbes d'une IST : où est-il arrêté ? Fécondation ou non,
IST transmise ou non ; relevé dans un tableau. Attendus : sf2 (s'informer
sur les moyens contraceptifs, ici par l'observation du modèle), c1 (double
protection, responsabilité partagée), s9, s10, et révision de s2, s4, s7.
Idées à garder de la version « desk » : une personne ou un couple tiré avec
ses besoins, conclure sur « ce qui répond aux besoins », jamais « la
meilleure méthode » (fait / jugement de valeur, FO2).

### Non retenus pour l'instant

- D. « The placenta filter » : sac à membrane (sang du fœtus) dans un
  bécher (sang de la mère) ; ce qui passe : oxygène, nutriments, déchets,
  alcool, pas les globules rouges, certains virus. Attendu s8, aucun S-F.
  Réserve si l'un des trois déçoit.
- E. « Under the microscope » : spermatozoïde et ovocyte au microscope
  virtuel, mesure à l'échelle, comparaison. s2, s4, s7, aucun S-F.
