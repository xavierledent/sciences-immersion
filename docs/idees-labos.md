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
premier, sf2, sf6, sf8 et c1 au deuxième (champ `labs` d'autoeval.json).

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

### 3. « The great melting race » — à construire

Chaleur et température par le modèle moléculaire : tasse brûlante ou seau
tiède, qui fait fondre le plus de glace ? Le gagnant dépend du tirage. Pari
à Predict sur les volumes et les températures ; blocs de glace,
thermomètres, eau fondue pesée ; loupe à particules (outil voisin du
microscope imaginaire de « Zoom in », voulu ainsi : les mêmes outils
servent d'un domaine à l'autre). Attendus s4 à s8, sf4, c1, s14.

Autres idées du même jour, au second plan : joint de dilatation d'un pont,
mélange d'eau chaude et d'eau froide, évaporation (test équitable),
ébullition en altitude (recoupe EXPLO 4), substances mystère par leur palier.
