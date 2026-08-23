# Sciences en immersion

Plateforme pédagogique bilingue (anglais / néerlandais) pour les cours de
sciences en immersion linguistique, 1ère secondaire, en Wallonie (Belgique) —
biologie, chimie et physique.

## Structure du projet

```
en/year1/{bio1,bio2,chem1,chem2,phys1,phys2}/   filière anglaise
nl/jaar1/{bio1,bio2,chem1,chem2,phys1,phys2}/   filière néerlandaise
```

Chaque dossier de chapitre contient quatre pages — `vocabulary.html`,
`practice.html`, `resources.html`, `explorations.html` — avec leur fichier de
données JSON associé (`vocabulary.json`, `practice.json`, `interactive.json`,
`resources.json`, `explorations.json`), ses propres images (`assets/`) et ses
fiches PDF (`PDF/`).

Les moteurs partagés vivent à la racine et sont chargés par l'ensemble des
pages, quelle que soit la filière ou le chapitre :

- **`practice-engine.js` / `.css`** — exercices classiques différenciés et
  jeux interactifs.
- **`vocabulary-engine.js` / `.css`** — cartes de vocabulaire avec écoute
  audio.
- **`resources-engine.js`** — fiches outils, mind maps, vidéos.
- **`explorations-engine.js`** — lectures et liens pour aller plus loin.
- **`rich-text.js`, `chapter-nav.js`, `style.css`, `sw.js`** — mise en forme
  du texte, navigation entre sections, styles communs, fonctionnement hors
  ligne.

## Stack technique

HTML / CSS / JavaScript vanilla, sans framework ni étape de compilation. Le
contenu de chaque chapitre est entièrement piloté par des fichiers JSON,
séparés du code qui les affiche. Le site est hébergé sur GitHub Pages.

## Types d'exercices

**Exercices classiques** — trois niveaux de difficulté invisibles pour
l'élève, avec réponse écrite et correction bilingue.

**Jeux interactifs** — questionnaire à choix multiples, glisser-déposer,
texte à trous, memory, tri par catégories. Les jeux sont indépendants des
niveaux : ce ne sont pas des exercices « de niveau X », ils s'adressent à
tous les élèves du chapitre.

## Usage

Projet développé et maintenu par un seul auteur. Accès restreint aux élèves
et enseignants du Collège Notre-Dame de Dinant.

## Licence

Ce projet est protégé — voir le fichier [LICENSE](LICENSE) pour les
conditions d'usage.
