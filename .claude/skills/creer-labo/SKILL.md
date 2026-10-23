---
name: creer-labo
description: Créer un nouveau labo virtuel sur le site Sciences en immersion, ou en remanier un en profondeur (nouvelle étape, nouveaux critères, nouvelle manipulation). À utiliser dès que l'enseignant parle d'un nouveau labo, de proposer des labos pour un chapitre, ou de refaire une partie importante d'un labo existant. Couvre le recueil (chapitre de cours, attendus, labos réels), la proposition, la fiche de conception, la construction, les deux langues et la vérification.
---

# Créer un labo virtuel

« Labo » est à prendre au sens large : toute investigation qui suit la
démarche scientifique (question de départ, hypothèse, expérience ou
observation, conclusion qui répond à la question, vérification). Une
manipulation à la paillasse, une sortie sur le terrain virtuelle (Inside two
ecosystems), une expérience sur un modèle (une centrale, un réseau
électrique)… : la forme est libre, la démarche ne l'est pas. Le plus souvent,
c'est la version à l'écran d'un labo que les élèves font en vrai en classe.
Tous les labos partagent un cadre (lab-engine.js) et une même manière de
faire : ce skill la garde d'un labo à l'autre. Les règles courtes
sont dans CLAUDE.md (section Règles, « Labos virtuels ») ; le détail est ici.

Ne rien commiter sans demande de l'enseignant. Il ne lit pas le néerlandais :
ne jamais lui faire choisir un mot NL.

Modèles à relire avant d'écrire du code, du plus simple au plus riche :

| Labo | Fichiers | À y prendre |
|---|---|---|
| Metal detectives (chem1) | `js/lab-metals.js`, `en/year1/chem1/lab-metals.en.js` | le plus court : paillasse, outils, carnet, tableau, scènes animées |
| Under our feet (chem1) | `js/lab-soil.js` | gants qui verrouillent, tri par glisser, éléments avec articles (items.a / the) |
| The vanishing leaves (bio1) | `js/lab-decomposition.js` | l'élève conçoit l'expérience (bocaux, facteurs), test équitable, graphique FO5c, nombres (num) |
| Inside two ecosystems (bio1) | `js/lab-zones.js` | mesures sur le terrain, identification, histogramme FO5b, phrases assemblées par la langue |

## 1. Recueillir, avant toute proposition

Demander à l'enseignant, et attendre ses réponses :

1. **Le chapitre de cours** : le document lui-même (fichier, PDF, lien),
   demandé à chaque fois, dans sa version du moment : il n'a pas
   d'emplacement fixe et l'enseignant le fait évoluer. Ne pas reprendre une
   version vue dans une autre conversation. Le lire en entier : notions,
   vocabulaire, expériences décrites, fiches outils utilisées. C'est lui qui
   dit ce que les élèves savent déjà au moment du labo et avec quels mots.
   S'il ne colle plus aux attendus d'autoeval.json (notion ajoutée ou
   retirée), le signaler.
2. **Le tableau des attendus.** Il est déjà sur le site :
   `en/year1/<chapitre>/autoeval.json` (le même en NL), `categories[].items[]`
   avec `id`, `text` (l'attendu) et `locations` (où il est travaillé dans le
   cours). Le lire, et le montrer à l'enseignant sous forme de liste numérotée
   par catégorie. Si le fichier est vide ou absent, lui demander le tableau.
3. **Les labos réels du chapitre** : pour chacun, le but, le matériel, le
   déroulement, ce que les élèves observent ou mesurent, ce qu'ils rendent
   (rapport, fiche, graphique). Un labo réel apparaît dans le chapitre de
   cours : si le chapitre n'en a pas et que l'enseignant le confirme, la
   proposition part du cours lui-même (voir 2).

Regarder aussi, sans demander : le `vocabulary.json` du chapitre (EN et NL),
les fiches outils (`assets/Fiches outils/`, FO1 à FO8 : démarche, hypothèse,
rapport FO3, graphiques FO4-FO5c, classement, grandeurs, abaques) et les labos
déjà présents dans `tools/chapters.json`, pour ne pas refaire le même.

## 2. Proposer

Pour chaque labo réel, une adaptation virtuelle courte. Sans labo réel
(chapitre qui n'en prévoit pas, confirmé par l'enseignant) : plusieurs idées
de labo, chacune ancrée dans une mission ou une notion du cours, de formes
variées (paillasse, terrain, modèle, enquête…) tant qu'elle suit la démarche
scientifique, présentées de la même façon :

- **Attendus visés** : les `id` de autoeval.json qu'il fait travailler
  (« s2, sf3 »), et pourquoi en une phrase. Un labo qui n'en sert aucun se
  signale comme tel.
- **La question de départ** et la forme de l'hypothèse. Leur structure naît
  du labo, jamais d'un modèle : une seule question, une grande question à
  laquelle répondent des sous-questions, plusieurs petites questions, une
  par facteur tiré au sort… Ne pas reprendre d'office la forme d'un labo
  précédent (deux questions numérotées, deux hypothèses à trous) : varier
  d'un labo à l'autre et le dire dans la proposition.
- **Ce que l'élève manipule** à l'écran (outils, gestes) et ce qu'il note
  lui-même (le labo n'écrit jamais l'observation à sa place).
- **Ce qui est tiré au sort**, pour que le labo puisse être refait.
- **Les 4 ou 5 critères du Check** et les erreurs relevées dans le rapport.
- **La fiche outil** mobilisée (FO3 toujours ; FO5b, FO5c… si graphique).
- **Ce qui ne passe pas à l'écran** (odeur, danger, durée) et comment c'est
  rendu (description, temps accéléré), ou pourquoi on y renonce.

Terminer par un bilan : les attendus couverts par l'ensemble des propositions,
et ceux qu'aucun labo ne touche. L'enseignant choisit. Quand le chapitre a
des labos réels, ne jamais inventer un labo qui n'est pas dans sa liste ; une
variante ou un regroupement se propose comme tel.

## 3. Fiche de conception (à valider avant le code)

Pour le labo choisi, une fiche d'une page, dans la conversation (ou un
document si l'enseignant veut la faire relire) :

1. Titre, question(s), attendus visés.
2. **Predict** : l'hypothèse, sans texte libre obligatoire, sous une forme
   choisie pour ce labo : phrase à compléter, mais aussi classer, placer sur
   un dessin, esquisser l'allure d'une courbe, parier sur un ordre ou un
   résultat chiffré… + « Why do you think so? » facultatif. L'étape Predict
   a la même liberté que l'expérience.
3. **Experiment** : le déroulé geste par geste, ce qui verrouille quoi
   (« les outils restent verrouillés tant que… »), ce que l'élève note et où.
4. **Conclude** : les questions, qui répondent aux questions de départ et à
   elles seules, puis le jugement de l'hypothèse.
5. **Check** : les critères (nom court + sous-titre), ce que montre le
   détail de chacun.
6. **Rapport FO3** : le contenu des 7 sections et les erreurs marquées.
7. Le tirage au sort, et ce qui en dépend.

Les décisions que l'enseignant n'a pas tranchées sont listées à la fin de la
fiche, avec une recommandation pour chacune.

## 4. Construire

### Fichiers

| Fichier | Contenu |
|---|---|
| `js/lab-<nom>.js` | la simulation, commune aux deux filières |
| `css/lab-<nom>.css` | son style ; classes préfixées par deux lettres propres au labo (`so-`, `dc-`, `zn-`) |
| `en/year1/<chapitre>/lab-<nom>.en.js` | les textes anglais |
| `nl/jaar1/<chapitre>/lab-<nom>.nl.js` | les textes néerlandais, mêmes clés |
| `tools/chapters.json` | une ligne dans `labs.en` et dans `labs.nl`, même `id` : `{ id, file, title, question, text }` |
| `<chapitre>/assets/` | images éventuelles, dans les deux filières (une image avec du texte : version NL sous un autre nom) |

Puis `node tools/generate-all.js` : la page Lab charge le moteur, les textes,
puis la simulation.

### La simulation

Structure commune (voir les en-têtes de `js/lab-engine.js` et des labos) :

- Commentaire d'en-tête en français : le labo réel dont il vient, ce qui est
  tiré au sort, le déroulé des 4 étapes.
- `const { labels: LABELS, glossary: GLOSSARY, ... } = LabEngine.textFor('<id>')` :
  la seule source de texte. Aucune phrase, aucun mot visible dans la
  simulation, pas même un `aria-label`, un texte dessiné dans un SVG, une
  unité qui se traduit ou un « and ».
- `LabEngine.create(def)` en fin de fichier, avec `id`, `title`, `glossary`,
  `reset`, `stepComplete(n)`, `lockReason(n)`, `isStarted`,
  `render: { 1, 2, 3, 4 }`, `report(mark)`, `version`, `save`, `load`,
  `summary`.
- Outils du cadre (`lab.*`) : `gloss`, `setLock`, `makeDraggable`,
  `setFooter`, `footerInfo`, `goToStep`, `finish`, `openSheet`, `confirm`,
  `fillSpace`, `checkFooter`, `newScene` / `tween` / `wait` (animations
  interrompues au changement de scène), `isFrozen`, `save`.

Règles qui font l'harmonie du site :

- **Verrous** : tout ce qui n'est pas encore accessible passe par
  `lab.setLock(el, raison, { missing, key })`, jamais `disabled`, jamais un
  blocage caché dans la simulation (le bouton « Verrous » des enseignants ne
  lève que ceux-là). Raison en texte simple, sans mot souligné. Le bouton
  suivant reste actif ; touché trop tôt, il dit ce qui manque.
- **Étapes** : `stepComplete(n)` dit si l'étape est complète ; une étape ne
  s'ouvre que si les précédentes le sont. L'hypothèse se fige dès que
  l'expérience commence (verrou qui explique pourquoi, comme dans les quatre
  labos).
- **Après le Check** : rien ne change à l'affichage d'une étape, seulement sur
  un geste ; les commandes qui ne font que montrer portent `data-lab-look` ;
  un test « corrigé » s'écrit `lab.isFrozen()`, jamais `lab.state.checked`.
- **Objet en main** : un objet à poser sur une cible parmi plusieurs
  (instrument, étiquette, forme d'énergie) passe par
  `lab.makeDraggable(el, { hold: true, onHold, targets, onDrop, ghost })` :
  un clic ou un toucher le prend en main (à la souris, il suit le curseur),
  un clic sur une cible le pose, le glisser reste possible. Le labo appelle
  `lab.release()` avant de redessiner l'objet. Un geste difficile à la
  souris (tourner une manivelle) se fait seul sur un clic, et garde le
  geste au doigt.
- **Observations** : décrites, jamais interprétées (la légende dit ce qu'on
  voit, l'élève nomme la propriété).
- **Tirage** : dans `reset()`, avec `pick`, `shuffle`, `mulberry32(seedFrom(...))`
  pour qu'un même dessin reste identique d'un affichage à l'autre.
- **Reprise** : `save()` rend le tirage et le travail en JSON pur ; `load(data)`
  les remet et lève une erreur si data ne convient pas ; `version` augmente
  dès que la forme de `save()` change.
- **Suivi** : `summary()` donne `score`, `total`, `criteria` (clé → bool),
  `labels` (`LABELS.criteria`, pour le tableau de bord) et `details`.
- **Check** : à gauche le score et la liste des critères, à droite le détail
  du critère choisi, passé à `lab.fillSpace(el)` après chaque changement.
- **Rapport** : `report(mark)` rend `{ title, sections: [7 × html],
  correction }` ; le corps garde les mots de l'élève, chaque erreur passe par
  `mark(html, note, { box })` à sa place ; la note dit pourquoi et donne la
  bonne réponse.
- **Chromebook** : tout tient dans le corps du labo (1204 × 594 à 100 %), sans
  défilement ; le moteur agrandit sur grand écran, ne pas s'y opposer. Tactile
  et souris au même niveau ; tailles mesurées en JS. Design sobre : pas
  d'emoji ni d'icône décorative, couleurs du site (`--color-current` pour un
  choix sélectionné, `--color-rose` pour une erreur).
- **Listes déroulantes** : tout `<select>` porte la classe `lab-select` (en
  plus de la sienne) : lab-engine.css habille la liste ouverte aux couleurs
  du site ; la classe du labo ne règle que la case fermée. Première option
  `<option value="" disabled selected>` pour « — choose — » (cachée dans la
  liste ouverte). Une liste au milieu d'une phrase est plus haute que la
  ligne : interligne d'au moins 2,6 et `vertical-align: middle`, sinon deux
  listes de lignes voisines se chevauchent.

### Les textes

Un fichier par langue : `LabEngine.addText('<id>', { labels, glossary, ... })`,
en-tête en français. Mêmes clés dans les deux langues (vérifié), sauf le
lexique (`glossary`), propre à chaque langue.

- **Mots soulignés** : chaque mot du lexique (`glossary`, clé en
  minuscules) est souligné d'office partout où il apparaît, dessins SVG
  compris, sauf dans les boutons, onglets et zones à toucher (on ne teste
  pas la mémoire de l'élève, et toucher le mot déclencherait l'action).
  `[mot]` ou `[groupe|clé]` pour une forme dont la clé diffère. Pas les mots
  transparents avec le français ; l'expression entière quand le mot à mot
  serait faux. Un mot du lexique qui a aussi un sens courant (« bij ») va
  dans `MARKED_ONLY` (lab-engine.js) : souligné seulement entre crochets.
  Une clé du lexique commun qui ne convient pas au labo se redéfinit dans
  son `glossary` (« bench » : banc d'essai, pas paillasse).
- **Écrire pour deux langues dès le départ** :
  - une phrase faite de morceaux s'assemble dans le fichier de texte (une
    fonction qui reçoit les morceaux) : chaque langue a son ordre des mots ;
    en NL, une subordonnée (« dat… ») renvoie le verbe à la fin ;
  - un nom repris dans une phrase a ses formes écrites (`a`, `the` en EN ;
    `een`, `de`/`het` en NL), jamais un article calculé ;
  - listes : `labels.list(noms)` (« a, b and c » / « a, b en c ») ;
  - nombres décimaux : `labels.num(v)` (point en EN, virgule en NL) ; la
    saisie accepte les deux ;
  - pluriels : dans une fonction de texte (`n === 1 ? … : …`).
- Texte anglais court, niveau 1re secondaire en immersion, tutoiement.

### Le néerlandais

Suivre le skill `synchroniser-nl` pour la langue : termes déjà employés dans
le chapitre NL (vocabulary.json, practice.json, interactive.json) d'abord,
puis l'usage scolaire flamand ; néerlandais de Belgique. Vérifier la place des
mots plus longs (boutons, en-têtes de tableau, textes dessinés dans les SVG).

## 5. Vérifier

- `node --check` sur les trois fichiers JS.
- `node tools/check.js` : zéro erreur. Il contrôle les fichiers du labo, les
  mêmes clés en EN et NL, chaque texte lu par la simulation (un manquant est
  une erreur) et les mots soulignés sans traduction.
- Pas de test en navigateur par défaut (l'enseignant teste lui-même) : relire
  plutôt les chemins délicats (Check sans réponse, reprise après
  rechargement, labo corrigé).
- Donner à l'enseignant une liste de tests, labo par labo et langue par
  langue : déroulé complet, verrous, reprise, rapport et impression, place
  sur Chromebook, tableau de bord (rapport d'un élève). Rappeler le bouton
  « Verrous » (enseignants) pour aller vite, et « Restart » pour revenir à
  l'état d'un élève.
- Mettre à jour la liste des labos dans CLAUDE.md (section Carte du projet).
