# Sciences en immersion — guide de travail

Site éducatif statique et bilingue (filières anglaise et néerlandaise) pour les
sciences de 1ère secondaire. HTML, CSS et JavaScript vanilla, sans framework ni
compilation, hébergé sur GitHub Pages. Les élèves l'utilisent sur Chromebook
tactile.

## Carte du projet

```
index.html, credits.html, 404.html   pages écrites à la main
dashboard.html, dashboard*.js / .css  tableau de bord des enseignantes (Firestore)
*-engine.js / *.css                  moteurs partagés par tous les chapitres
en/year1/<chapitre>/                 filière anglaise
nl/jaar1/<chapitre>/                 filière néerlandaise
  *.html                             6 pages GÉNÉRÉES (ne pas éditer), dont laboratory.html
  lab-<nom>.js / .css                un labo : contenu et simulation
  *.json                             contenu du chapitre
  assets/, PDF/                      images et documents du chapitre
assets/                              images et PDF communs (fiches outils, mascottes)
templates/                           source des pages de chapitre
tools/                               générateurs et outils (Node, sans dépendance)
Admin/                               éditeurs des JSON, utilisés par l'enseignant
docs/formats-donnees.md              format de chaque JSON
```

Chapitres : `bio1`, `chem1`, `phys1`, `chem2`, `phys2`, `bio2`. Tous ont leur
vocabulaire. Exercices et autoévaluation : `bio1`, `chem1`, `phys1`. Jeux :
`bio1`, `chem1`. Ailleurs, les tableaux sont vides (contenu pas encore rédigé).

Labos virtuels (en anglais pour l'instant) : `chem1` « Metal detectives » et
« Under our feet » (composition du sol), `bio1` « The vanishing leaves » et
« Inside two ecosystems » (mission 1 de la sortie de terrain : facteurs
abiotiques, carré de comptage, histogramme FO5b). Chaque chapitre a sa page Lab
(`laboratory.html`, générée), accessible depuis la fenêtre de l'accueil et la
barre de navigation ; ses labos sont déclarés par langue dans
[tools/chapters.json](tools/chapters.json) (`labs`). Sans labo, la page et la
carte du chapitre à l'accueil disent « Lab is still in development ».
Le cadre commun ([lab-engine.js](lab-engine.js)) impose à tous les labos la
démarche en 4 étapes (Predict, Experiment, Conclude, Check) et le rapport
imprimable selon la fiche outil FO3 ; chaque labo garde sa simulation dans ses
deux fichiers `lab-<nom>`, sans JSON. Chaque labo tire au sort une partie de
son contenu pour pouvoir être refait.

`apps-script/`, `docs/todo/`, `docs/audit-sciences-immersion.md` et
`Admin/Backup ind/` existent en local mais sont exclus du dépôt, qui est
public. Ne jamais les ajouter à un commit ni recopier leur contenu dans un
fichier suivi par git.

Les éditeurs d'`Admin/` (ouverts dans le navigateur de l'enseignant) lisent et
écrivent les JSON sur son disque, jamais sur le site. `content.html` gère
`practice`, `vocabulary`, `resources`, `explorations` et `autoeval.json` ;
`igames.html` gère `interactive.json`. **Tout changement de format d'un JSON
doit être reporté dans l'éditeur correspondant**, sinon l'enseignant
réécrirait l'ancien format à la sauvegarde suivante.

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
| Labos virtuels : modale, étapes, verrous, rapport | [lab-engine.js](lab-engine.js), [lab-engine.css](lab-engine.css) ; un labo : `<chapitre>/lab-<nom>.{js,css}` |
| Ajouter un labo à un chapitre | sa ligne dans `labs` de [tools/chapters.json](tools/chapters.json), ses fichiers `lab-<nom>.{js,css}`, puis régénérer |
| Barre de navigation entre sections | [chapter-nav.js](chapter-nav.js) |
| Données enregistrées des élèves | [storage.js](storage.js), seul fichier qui touche à `localStorage` ; compteurs d'activité : `SiteStorage.activity` |
| Tableau de bord enseignant (classes, élèves, suivi) | [dashboard.js](dashboard.js) (page, onglet Classes et élèves), [dashboard-class.js](dashboard-class.js) (suivi), [dashboard-data.js](dashboard-data.js) (lecture et calculs), [dashboard-ui.js](dashboard-ui.js) (couleurs, barres), [dashboard-history.js](dashboard-history.js) (import de l'historique du Google Sheet), [dashboard.css](dashboard.css) ; accès : collection `teachers` et [firestore.rules](firestore.rules) |
| Écran d'accès, connexion Firebase | [access-control.js](access-control.js), [firebase-init.js](firebase-init.js) (config et version du SDK) |
| Mise en forme du texte, modales, contraste élevé, bandeau hors ligne | [rich-text.js](rich-text.js) |
| Mode hors ligne, cache | [sw.js](sw.js) |
| Styles communs, couleurs par matière | [style.css](style.css) |

## Commandes

```
node tools/outline.js <fichier> [filtre]   sommaire d'un moteur, avec numéros de ligne
node tools/generate-all.js                 régénère les 72 pages de chapitre et la liste des chapitres de l'accueil
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
  `resources.html`, `explorations.html`, `laboratory.html` et `assessment.html` de chaque chapitre
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
  des exercices et à l'`id` des jeux (plus à leur titre). Ne pas les modifier sans le
  signaler (détail dans [docs/formats-donnees.md](docs/formats-donnees.md)).
- **Texte des JSON.** Seules les balises `<strong>`, `<em>`, `<u>` et `<br>`
  sont interprétées.
- **Chromebook tactile (100 %) ; un écran de bureau zoomé à 125 % en donne
  un aperçu proche.** Les calculs de place se font sur le Chromebook à 100 %
  (1366 × 768). Pas de défilement dans les modales, tactile au même niveau que
  la souris, tailles mesurées en JS plutôt que supposées.
- **Labos en plein écran : toute la place est utilisée.** Un labo se dessine
  pour le Chromebook à 100 % ; avec plus de place (plein écran sur un grand
  écran), le moteur agrandit d'un même facteur le corps et le pied du labo
  (`fitToScreen` dans [lab-engine.js](lab-engine.js), zoom CSS) : tout
  grandit au lieu d'ajouter du vide. Rien à faire dans le labo, sinon ne pas
  s'y opposer. À l'étape Check, le labo passe le panneau de détail du
  critère à `lab.fillSpace(el)` après chaque changement de son contenu : le
  texte y grandit (×1,5 au plus) tant qu'il tient sans défiler.
- **Labos virtuels.** Mots soulignés (`[mot]`, `[groupe de mots|clé]`) : ne
  pas souligner les mots transparents avec le français (*decomposition*,
  *bacteria*…) ; souligner l'expression entière quand la traduction mot à mot
  serait fausse (`[the wax melts]` → « la cire fond »). Tout ce qui n'est pas
  encore accessible passe par `lab.setLock` (cadenas + bulle qui explique),
  jamais un bouton `disabled` muet ; une étape ne s'ouvre que si les
  précédentes sont complètes (`stepComplete`). Après le Check, les étapes 1
  à 3 se revoient, figées par le moteur (seules restent actives les commandes
  marquées `data-lab-look`, qui ne font que montrer : onglet, vue rapprochée) :
  un labo ne doit rien modifier de son état en affichant une étape, seulement
  sur un geste ; confirmations par
  `lab.confirm`, jamais `window.confirm`. Rapport : le corps garde les mots de
  l'élève ; chaque erreur passe par `mark(html, note, { box })` (reçu par
  `report(mark)`), qui la souligne ou l'encadre à sa place avec un numéro ;
  la note du même numéro (pourquoi, bonne réponse) va dans « Correction ».
  Le moteur en tire deux onglets : « My report » (version propre, sans rouge
  ni Correction, ouverte d'abord) et « Corrected report » ; « Print »
  imprime l'onglet affiché. Reprise : chaque labo fournit `save()` (tirage
  et travail, en JSON pur), `load(data)` et `version`, à augmenter dès que la
  forme de `save()` change ; le moteur enregistre (`labProgress` dans
  [storage.js](storage.js)) et propose « Continue / Start again » à la
  réouverture. Suivi : `summary()` donne score, critères et détails de
  l'événement `lab_checked` ; le moteur garde le résultat à part
  (`labResult` : étape la plus loin, meilleur et dernier Check), que
  « Start again » n'efface pas. Les événements `lab_*` sont comptés dans
  Firestore (compteurs `stats`, voir `SiteStorage.activity` dans
  [storage.js](storage.js)), jamais envoyés à Apps Script.
- **Conclude répond aux questions de départ, et à elles seules.** Les
  questions du labo sont posées à l'étape Predict, avec l'hypothèse ;
  Conclude y répond d'après les résultats et juge l'hypothèse, sans poser
  de nouvelle question.
- **Nouveau labo : partir des labos du cours.** Chaque labo virtuel est la
  version d'un labo que les élèves font en vrai en classe. Avant de créer un
  labo pour un chapitre, demander à l'enseignant la liste des labos réels de
  ce chapitre (but, matériel, déroulement, ce que les élèves observent ou
  mesurent). Proposer ensuite pour chacun une adaptation virtuelle : ce que
  l'élève manipule, ce qui est tiré au sort, les erreurs relevées dans le
  rapport. L'enseignant choisit lesquels développer. Ne jamais inventer un
  labo qui n'est pas dans cette liste.
- **Image venant de Wikimedia Commons** : ajouter sa ligne dans
  [credits.html](credits.html).
- **Git.** Le site est servi par GitHub Pages : traiter tout push sur `main`
  comme une mise en ligne pour les élèves.
