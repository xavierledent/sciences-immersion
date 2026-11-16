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
la page Lab à décider. Avant la fiche du B et du C, et avant de coder le A :
demander le chapitre de cours (le dossier `PDF/` du site n'a que la carte
mentale et la fiche d'autoévaluation), pour reprendre ses mots (« sexual
intercourse » ou « sexual contact », « STI test » ou « screening »…) et ne
pas refaire une activité du cours (simulation de l'app Flo en Partie 4,
French challenge en Partie 6).

### A. « Invisible spread » : une IST invisible se propage — validé (fiche ci-dessous)

Expérience sur un modèle : l'échange de liquides fait en classe (soude et
phénolphtaléine, ici sans nom). Attendus : sf3, c1, s10.

Première idée avec des verres écartée par l'enseignant : un verre évoque
« boire », l'élève retiendrait qu'une IST passe en partageant une boisson.
Donc **tubes à essai et pipette**, et une **légende du modèle** affichée du
début à la fin : 1 tube = 1 personne ; mélanger deux tubes = un rapport
sexuel sans protection (échange de liquides du corps) ; rose après le test
= la personne a l'IST ; bouchon = préservatif ; étiquette bleue = vacciné
contre le HPV ; « In real life, an STI is not passed on by sharing a glass,
a tube or a towel. » Jamais « partager », « boire », « toucher ».

Préservatif et HPV : **option 1** retenue. Un seul des deux tubes bouchés
suffit à protéger l'échange (responsabilité partagée : le préservatif de
l'un protège les deux) ; pour le HPV, environ un échange protégé sur dix
passe quand même (contact peau à peau) ; le vaccin protège du HPV, rien
contre la chlamydia. Message de la brochure HPV du cours : les deux
ensemble.

Fiche de conception :
- Page Mission : « Mission: follow an infection you cannot see » ; dans un
  groupe, une personne a une IST sans le savoir (souvent aucun signe) ;
  question générale « How does an STI spread in a group, and what can slow
  it down? » ; étapes : **Mix** les tubes tournée après tournée (pipette,
  carnet des échanges) ; **Test** chaque tube et **count** (indicateur,
  cocher les roses) ; **Replay** avec préservatifs et vaccin, puis
  **compare** (graphique).
- Questions : 1) combien de personnes ont l'IST après 3 tournées ?
  2) que changent préservatif et vaccin ? 3) le modèle ressemble-t-il à la
  vie réelle ? (sans hypothèse, réponse à Conclude).
- Predict : réglette 1 à 12 pour Q1 ; pour préservatif, vaccin, les deux :
  *fewer infections / the same / it depends on the STI* (l'IST n'est pas
  encore connue : pour le vaccin, la bonne réponse dépend du tirage) ;
  « Why do you think so? » facultatif. Figé dès le premier échange.
- Experiment, partie 1 : 12 tubes numérotés, tous clairs, un porteur caché ;
  3 tournées de 4 à 6 paires tirées ; l'élève touche une paire, la pipette
  mélange (animation), le carnet note l'échange (relevé du geste, pas une
  observation) ; tournée suivante verrouillée tant que la précédente n'est
  pas finie. Test : une goutte d'indicateur par tube, les infectés
  rosissent ; l'élève coche lui-même et écrit le nombre. Puis une carte du
  labo d'analyse dit l'IST (HPV ou chlamydia).
- Experiment, partie 2 : mêmes échanges rejoués (test équitable, visible
  dans le carnet), trois scénarios automatiques : la moitié du groupe avec
  bouchon, la moitié vaccinée, la moitié avec les deux ; test et comptage
  après chacun. Histogramme FO5b tracé par l'élève (4 colonnes). Bouton du
  pied : Next: test the tubes → Next: replay with condoms → … → Next:
  conclude.
- Conclude : Q1 (nombre lu dans ses résultats + phrase sur la propagation) ;
  Q2 (chaque protection, avec SON IST) ; Q3 cocher les phrases vraies dans
  la vie réelle (dont une fausse : « If only one partner uses a condom,
  only that partner is protected ») ; jugement de l'hypothèse.
- Check (5) : Counts (4 tests), Graph (FO5b), Spread (Q1), Protection (Q2,
  selon l'IST tirée), Model and reality (Q3 + hypothèse).
- Rapport FO3 : tableau des tests et graphique ; erreurs marquées à leur
  place (tube oublié, colonne fausse, conclusion contraire aux résultats,
  phrase fausse cochée).
- Tirage : le porteur ; les paires (sans protection, 5 à 9 infectés sur
  12) ; l'IST ; les 6 protégés de chaque scénario ; les fuites du
  préservatif pour le HPV (au moins une si HPV).

Décisions tranchées le 2026-11-16 : **12 tubes** ; **pas** de recherche
du porteur de départ dans le labo ; personnes protégées **tirées au sort** ;
**numéros** sur les tubes.

Après lecture du chapitre de cours (2026-11-16) :
- légende : « mixing two tubes = **sexual contact without a condom** »
  (mots du cours ; pas de « body fluids » : le HPV passe par contact de la
  peau, Mission 14) ; « test » (Golden Rules : Get tested regularly) ;
- choix *yes / no / partly* repris de l'Exercise 5b ;
- Mission 14 et Exercises 5-6 traitent déjà la protection personne par
  personne : la question 2 porte sur **l'effet sur le groupe** (les non
  protégés le sont-ils un peu aussi ?), que le cours ne dit pas.

Predict en cours de reprise : l'enseignant n'aime pas les paris (« ça ne
repose sur rien de tangible ») ; il veut que l'IST soit connue dès Predict
(hypothèse plus éclairée).

### B. « Cycle detectives » : des cycles, pas un seul cycle — retenu, fiche à faire

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
