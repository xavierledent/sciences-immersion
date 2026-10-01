# Sciences en immersion — guide de travail

Site éducatif statique et bilingue (filières anglaise et néerlandaise) pour les
sciences de 1ère secondaire. HTML, CSS et JavaScript vanilla, sans framework ni
compilation, hébergé sur GitHub Pages. Les élèves l'utilisent sur Chromebook
tactile.

## Carte du projet

```
index.html, credits.html, 404.html   pages écrites à la main
*-engine.js / *.css                  moteurs partagés par tous les chapitres
en/year1/<chapitre>/                 filière anglaise
nl/jaar1/<chapitre>/                 filière néerlandaise
  *.html                             5 pages GÉNÉRÉES (ne pas éditer)
  *.json                             contenu du chapitre
  assets/, PDF/                      images et documents du chapitre
assets/                              images et PDF communs (fiches outils, mascottes)
templates/                           source des pages de chapitre
tools/                               générateurs et outils (Node, sans dépendance)
docs/formats-donnees.md              format de chaque JSON
```

Chapitres : `bio1`, `chem1`, `phys1`, `chem2`, `phys2`, `bio2`. Tous ont leur
vocabulaire. Exercices et autoévaluation : `bio1`, `chem1`, `phys1`. Jeux :
`bio1`, `chem1`. Ailleurs, les tableaux sont vides (contenu pas encore rédigé).

`Admin/`, `apps-script/`, `docs/todo/` et `docs/audit-sciences-immersion.md`
existent en local mais sont exclus du dépôt, qui est public. Ne jamais les
ajouter à un commit ni recopier leur contenu dans un fichier suivi par git.

## Où regarder selon la tâche

| Tâche | Fichiers |
|---|---|
| Texte ou image d'un exercice, d'un jeu | `<chapitre>/practice.json`, `interactive.json` — format dans [docs/formats-donnees.md](docs/formats-donnees.md) |
| Comportement des exercices ou d'un jeu | [practice-engine.js](practice-engine.js), [practice-engine.css](practice-engine.css) |
| Cartes de vocabulaire | [vocabulary-engine.js](vocabulary-engine.js), `vocabulary.json` |
| Page Ressources, page Explorations | [resources-engine.js](resources-engine.js), [explorations-engine.js](explorations-engine.js) |
| Page d'autoévaluation | [autoeval-engine.js](autoeval-engine.js), [assessment.css](assessment.css), `autoeval.json` |
| Structure HTML d'une page de chapitre | `templates/<type>.{en,nl}.html`, puis régénérer |
| Titre ou couleur d'un chapitre | [tools/chapters.json](tools/chapters.json), puis régénérer (la liste de l'accueil en sort aussi) |
| Accueil, choix de la langue et de l'année | [index.html](index.html), [welcome-back.js](welcome-back.js) |
| Barre de navigation entre sections | [chapter-nav.js](chapter-nav.js) |
| Données enregistrées des élèves | [storage.js](storage.js), seul fichier qui touche à `localStorage` |
| Écran d'accès | [access-control.js](access-control.js) |
| Mise en forme du texte, modales, contraste élevé, bandeau hors ligne | [rich-text.js](rich-text.js) |
| Mode hors ligne, cache | [sw.js](sw.js) |
| Styles communs, couleurs par matière | [style.css](style.css) |

## Commandes

```
node tools/outline.js <fichier> [filtre]   sommaire d'un moteur, avec numéros de ligne
node tools/generate-all.js                 régénère les 60 pages de chapitre et la liste des chapitres de l'accueil
node tools/check.js                        TOUT vérifier avant un commit (les deux commandes ci-dessous)
node tools/generate-all.js --check         vérifie que tout correspond aux templates et à chapters.json
node tools/validate-content.js [chapitre]  vérifie les JSON : fichiers référencés, jeux finissables, parité EN/NL
```

Après toute modification d'un template, d'un JSON de chapitre ou de
`chapters.json`, lancer `node tools/check.js` et rapporter son résultat.

Avant d'ouvrir [practice-engine.js](practice-engine.js) (4 400 lignes) ou sa
feuille de style (4 100 lignes), lancer `outline.js` avec un filtre, puis ne
lire que les lignes utiles. Les fonctions d'un jeu partagent un préfixe : `qcm`,
`fitb` (texte à trous), `dnd`, `memory`, `sorting`.

## Règles

- **Pages générées.** Les fichiers `vocabulary.html`, `practice.html`,
  `resources.html`, `explorations.html` et `assessment.html` de chaque chapitre
  sortent de `templates/`. Modifier le template dans les deux langues, lancer
  `generate-all.js`, puis `--check`. Dans [index.html](index.html), seules les
  lignes entre les repères `// <chapters:…>` sont générées ; le reste s'édite
  à la main.
- **Deux filières.** Tout changement de contenu ou d'interface se fait en
  `en/` et en `nl/`. Les libellés d'interface sont dans l'objet `LABELS` en
  tête de chaque moteur.
- **Image remplacée = nouveau nom de fichier.** Le service worker sert les
  images depuis son cache sans repasser par le réseau.
- **Casse des noms de fichiers.** GitHub Pages distingue majuscules et
  minuscules ; un écart passe en local sous Windows et échoue en ligne.
- **Identifiants stables.** Les données des élèves sont rattachées à l'`id`
  des exercices et au `quizTitle` des jeux. Ne pas les modifier sans le
  signaler (détail dans [docs/formats-donnees.md](docs/formats-donnees.md)).
- **Texte des JSON.** Seules les balises `<strong>`, `<em>`, `<u>` et `<br>`
  sont interprétées.
- **Chromebook tactile à 125 %.** Pas de défilement dans les modales, tactile
  au même niveau que la souris, tailles mesurées en JS plutôt que supposées.
- **Image venant de Wikimedia Commons** : ajouter sa ligne dans
  [credits.html](credits.html).
- **Git.** Le site est servi par GitHub Pages : traiter tout push sur `main`
  comme une mise en ligne pour les élèves.
