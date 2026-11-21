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
