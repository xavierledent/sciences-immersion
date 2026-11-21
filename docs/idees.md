# Idées pour le site

Pistes discutées avec l'enseignant, pas encore construites (hors labos :
voir [idees-labos.md](idees-labos.md)).

## Page Resources : un exercice d'entraînement par fiche outil

Discuté le 2026-11-20. À concevoir avec l'enseignant avant de construire.

But : rendre la fiche outil active. Aujourd'hui, la page Resources propose
seulement le PDF de chaque fiche (FO1 à FO8, les mêmes dans les six
chapitres). À côté du PDF, un exercice pour appliquer la fiche.

Décisions de l'enseignant :
- **un exercice par fiche, avec exactement la même structure dans tous les
  chapitres**, mais un contenu adapté au thème du chapitre (écosystèmes,
  mélanges, énergie…). L'élève refait les mêmes gestes sur un autre sujet et
  voit que la méthode vaut partout ;
- **tout en français**, comme les fiches et le reste de la page Resources
  (pas de version EN / NL du texte de l'exercice).

Pistes (à valider) :
- un moteur commun (la structure de chaque fiche) et, par chapitre, un petit
  fichier de contenu (les données du thème). Nouveau format de JSON : à
  décrire dans docs/formats-donnees.md et à rendre modifiable dans un
  éditeur d'`Admin/` ;
- exemples de structure : FO2, trier faits / jugements / hypothèses ; FO4,
  choisir le bon graphique ; FO5a/b/c, tracer le graphique à partir d'un
  tableau (titre, axes, unités, échelle), corrigé point par point ; FO6,
  parcourir puis construire une petite clé ; FO7, grandeurs et unités ;
  FO8, lire une abaque ; FO1 et FO3, remettre les étapes dans l'ordre,
  trouver ce qui manque dans un rapport ;
- une part tirée au sort dans les données, pour pouvoir refaire l'exercice ;
- une fiche qui ne colle pas au thème d'un chapitre (FO6 en physique ?) :
  pas d'exercice plutôt qu'un exercice forcé ;
- suivi dans le tableau de bord (`id` stables dès le départ) ;
- volume : jusqu'à 10 fiches × 6 chapitres. Commencer par une fiche
  (FO5b proposée) dans les six chapitres pour vérifier que la même
  structure tient partout, puis étendre.

## Vocabulaire néerlandais : ajouter de / het

**Fait le 2026-11-21** : champ `withArticle` (le mot entier avec son
article, voir docs/formats-donnees.md), les 175 cartes NL complétées, mis en
ligne avant relecture. À faire relire par la collègue de néerlandais ;
points les moins sûrs : « de molecule » (usage belge ; « het molecuul » aux
Pays-Bas), « de stroompanne », « de recyclage », « het organische
materiaal », « de toestand van materie », et les cartes laissées sans
article (« - ») : adjectifs et verbes de phys2 (« Stromen », « Stijgen »…),
« Biologisch afbreekbaar ».

Relevé le 2026-11-21. Aucun mot des `vocabulary.json` de `nl/`
(175 mots dans les six chapitres) n'a son article (« Mengsel »,
« Oplossing », « Bodem »…). Pour un élève francophone, de / het est une vraie
difficulté du néerlandais, et les cartes sont le bon endroit pour l'apprendre.

Piste : écrire l'article dans le mot lui-même (« het mengsel », « de
oplossing ») ; rien à changer au moteur, la lecture à voix haute le dit
aussi. Pluriel ou nom composé (« Kolf / Fles ») : l'article de chaque mot.
Vérifier ensuite que les jeux et exercices qui reprennent ces mots restent
cohérents (memory, tri).

## Vidéos de la filière néerlandaise

Relevé le 2026-11-21, à chercher avec l'enseignant (`resources.json`) :
- bio2 NL : la seule vidéo est la vidéo anglaise de la filière EN ;
- chem2 NL : une vidéo contre deux en EN (manque l'équivalent de
  « Separation techniques ») ;
- phys2 NL : une vidéo contre deux en EN (manque l'équivalent de « Thermal
  expansion and contraction »).

## Le chapitre de cours sur le site, sans correctif

Discuté le 2026-11-20. Décision de l'enseignant (2026-11-21) : **ajouter le
chapitre de cours, sans son correctif.**

- Le chapitre seul (PDF dans `PDF/` du chapitre, comme les autres
  documents), dans chaque chapitre et dans les deux filières. Vérifier
  d'abord les droits des images (dépôt public), crédits Wikimedia dans
  credits.html.
- Pas de correctif en ligne : tout fichier du site est lisible par qui a le
  lien, même derrière l'écran d'accès, et les élèves auraient les réponses
  avant d'avoir cherché. Le correctif reste donné en classe. Si un jour il
  faut le mettre en ligne : seulement quand le chapitre est fini en classe,
  ou dans Firebase avec un accès ouvert par l'enseignant.
