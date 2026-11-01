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
(« The separation challenge »). Les idées ci-dessous n'ont pas de labo réel
en classe : ce seraient des expériences sur un modèle, parties du cours
(exception à confirmer par l'enseignant au moment de les construire).

Préférence de l'enseignant : **1, puis 3**.

### 1. « Zoom in » : le microscope des molécules — retenu (priorité)

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

### 3. La station d'épuration ou le centre de tri — retenu

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

Choix à faire : station d'épuration (colle mieux au chapitre : décantation,
filtration, eau et solutés) ou centre de tri (parle plus aux élèves, mais
surtout aimant, tamis, tri manuel).

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
