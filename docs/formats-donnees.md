# Formats des fichiers de données

Chaque chapitre (`en/year1/<chapitre>/` et `nl/jaar1/<chapitre>/`) contient ses
propres fichiers JSON. Les moteurs à la racine les lisent avec un chemin
relatif (`./practice.json`), donc aucun chemin de chapitre n'est écrit dans le
code.

Trois règles valent pour tous les fichiers :

- **Texte mis en forme.** Tous les champs de texte passent par `richText()`
  ([rich-text.js](../rich-text.js)) : seules les balises `<strong>`, `<em>`,
  `<u>` et `<br>` sont interprétées, tout le reste est affiché tel quel.
- **Noms de champs identiques dans les deux filières.** Un chapitre
  néerlandais range son texte néerlandais dans les champs `en`, `corr_en`,
  `english`, `definitionEnglish`. Il n'existe aucun champ `nl`.
- **Casse des noms de fichiers.** GitHub Pages distingue majuscules et
  minuscules, Windows non : `Dnd2.webp` et `DnD2.webp` sont deux fichiers
  différents en ligne.

## practice.json — exercices classiques

Lu par [practice-engine.js](../practice-engine.js).

```json
{
  "level1": [
    {
      "id": 1,
      "title": "Individual - Definition",
      "image": null,
      "en": "Define, in your own words, what an \"individual\" is.",
      "fr": "Définis, avec tes propres mots, ce qu'est un \"individu\".",
      "corr_en": "An individual is a single, unique living organism.",
      "corr_fr": "Un individu est un seul être vivant, unique."
    }
  ],
  "level2": [],
  "level3": []
}
```

- Trois niveaux, `level1` à `level3`, de 20 exercices chacun dans les chapitres
  remplis. Un tableau vide est valide (chapitre pas encore rédigé).
- `image` : `null` ou un **nom de fichier seul** (`"frog-waterlily-2.webp"`).
  Le moteur ajoute lui-même `assets/` devant.
- Exercice à sous-questions : les champs `en`, `fr`, `corr_en`, `corr_fr` sont
  remplacés par un tableau `questions`, dont chaque élément porte ces quatre
  mêmes champs. `id`, `title` et `image` restent au niveau de l'exercice.

## interactive.json — jeux

Lu par [practice-engine.js](../practice-engine.js). Cinq clés, chacune un
tableau de jeux ; un tableau vide est valide (jeu pas encore rédigé). Ici, les
images sont des
**chemins complets** depuis le dossier du chapitre (`"assets/QCM1.webp"`),
contrairement à `practice.json`.

| Clé | Jeu | Préfixe des fonctions dans le moteur |
|---|---|---|
| `multipleChoice` | QCM | `qcm`, `QCM` |
| `fillBlanks` | Texte à trous | `fitb` |
| `dragAndDrop` | Glisser-déposer sur image | `dnd` |
| `matchPairs` | Memory | `memory` |
| `sorting` | Tri par catégories | `sorting` |

Tous les jeux ont un `quizTitle` et, en option, un champ `instructions`.

```json
{
  "multipleChoice": [{
    "quizTitle": "Ecosystem Basics",
    "image": "assets/QCM4.webp",
    "questions": [{
      "question": "What is the correct formula for an ecosystem?",
      "options": ["Biotope + Biocenosis", "Individual + Population"],
      "correctAnswer": 0,
      "explanation": "An ecosystem has two parts: …"
    }]
  }],
  "fillBlanks": [{
    "quizTitle": "Ecosystem equation",
    "text": "The non-living part is the [blank0], the living one the [blank1].",
    "blanks": [
      { "options": ["Biotope", "Biocenosis", "Species"], "correctAnswer": "Biotope" },
      { "options": ["Biotope", "Biocenosis"], "correctAnswer": "Biocenosis" }
    ],
    "wordBank": [{ "word": "disease", "translation": "maladie" }]
  }],
  "dragAndDrop": [{
    "quizTitle": "Ecological Interactions",
    "backgroundImage": "assets/DnD 2b.jpg",
    "hideOnSuccess": true,
    "reservoirItems": ["Predation", "Mutualism"],
    "dropZones": [{ "x_pourcent": 23.63, "y_pourcent": 25.14, "acceptedText": "Predation" }]
  }],
  "matchPairs": [{
    "quizTitle": "Levels of Organization",
    "pairs": [{
      "id": 1,
      "sideA": { "type": "image", "content": "assets/MTP ind.jpg" },
      "sideB": { "type": "text", "content": "Individual" }
    }]
  }],
  "sorting": [{
    "quizTitle": "Ecological Factors",
    "categories": ["Biotic factors", "Abiotic factors"],
    "items": [{ "id": 1, "category": "Biotic factors", "type": "text", "content": "Plants" }]
  }]
}
```

- QCM : `correctAnswer` est l'**index** de la bonne option (à partir de 0).
  `image` peut être posée sur le quiz entier ou sur une question. Pour une
  question, trois cas, qui correspondent aux trois réglages de l'éditeur
  `igames.html` :
  - champ **absent** : la question affiche l'image du quiz, s'il en a une ;
  - chemin d'image : la question affiche sa propre image ;
  - `"image": null` : **aucune image**, même si le quiz en a une.

  Pour une image commune à tout un quiz, il faut donc omettre le champ
  `image` des questions, et non le mettre à `null`.
- Texte à trous : `correctAnswer` est le **texte** de la bonne option.
  `[blankN]` dans `text` renvoie à `blanks[N]`. `wordBank` est optionnel.
- Glisser-déposer : `x_pourcent` et `y_pourcent` sont en pourcentage de
  l'image de fond. `acceptedText` doit être identique à une entrée de
  `reservoirItems`.
- Memory et tri : `type` vaut `"text"` ou `"image"` ; pour une image,
  `content` est le chemin.
- Tri : `category` doit être identique à une entrée de `categories`.

## vocabulary.json

Lu par [vocabulary-engine.js](../vocabulary-engine.js). Un tableau à la racine :

```json
[{
  "english": "Population",
  "french": "Une population",
  "definitionEnglish": "A group of individuals of the same species…",
  "definitionFrench": "Un groupe d'individus de la même espèce…"
}]
```

## resources.json

Lu par [resources-engine.js](../resources-engine.js). Quatre blocs, chacun avec
un `title` et un `basePath` auquel le moteur ajoute le nom de fichier :

| Bloc | Contenu | `basePath` |
|---|---|---|
| `videos` | `items[]` : `title`, `youtubeId`, `description` | `https://www.youtube.com/embed/` |
| `fichesOutils` | `description`, `items[]` : `label`, `file` | `../../../assets/Fiches outils` |
| `ficheAutoEvaluation` | `description`, `pdfFile` | `../../../assets` |
| `mindmap` | `items[]` : `title`, `file`, `description` | `../../../assets` |

Les fiches outils et les PDF d'autoévaluation sont donc partagés, dans
`assets/` à la racine, et non dans le dossier du chapitre.

## explorations.json

Lu par [explorations-engine.js](../explorations-engine.js).

- `documentation` : `title`, `basePath` (`"PDF"`, le dossier du chapitre),
  `items[]` : `title`, `description`, `file`.
- `liensUtiles` : `title`, `items[]` : `title`, `description`, `url`.

## autoeval.json

Lu par [autoeval-engine.js](../autoeval-engine.js) sur `assessment.html`. Le
fichier n'existe que pour les chapitres dont l'autoévaluation est rédigée
(`bio1`, `chem1` et `phys1` à ce jour).

```json
{
  "categories": [{
    "id": "savoirs",
    "title": "Savoirs",
    "items": [{
      "id": "s1",
      "isVocabulary": false,
      "text": "Décrire un écosystème comme un ensemble d'êtres vivants…",
      "locations": ["PART 1 : Définitions vidéo, synthèse textuelle"],
      "exercises": [{ "level": "level1", "id": 2 }]
    }]
  }]
}
```

- Trois catégories : `savoirs`, `savoirFaire`, `competence`.
- `exercises` pointe vers des exercices de `practice.json` par `level` et
  `id` : supprimer ou renuméroter un exercice casse ces liens.

## Ce qui sert de clé aux données des élèves

Les réponses et les scores des élèves sont enregistrés par
[storage.js](../storage.js) sous une clé construite à partir de l'adresse de
la page et d'un identifiant tiré du JSON. Modifier cet identifiant détache les
données déjà enregistrées :

| Donnée | Identifiant utilisé |
|---|---|
| Réponses et auto-évaluations des exercices | niveau, `id` de l'exercice, rang de la sous-question |
| Scores et reprise des QCM, records des jeux | `quizTitle` |
| Notes de l'autoévaluation par attendus | `id` de l'item |

Conséquence : renommer un `quizTitle`, changer l'`id` d'un exercice ou d'un
item d'autoévaluation, ou réordonner des sous-questions, fait perdre aux
élèves ce qu'ils avaient enregistré pour cet élément. Corriger le texte d'un
énoncé, d'une option ou d'une correction est sans effet sur les données.
