# Sciences en immersion — guide de travail

Site éducatif statique et bilingue (filières anglaise et néerlandaise) pour les
sciences de 1ère secondaire. HTML, CSS et JavaScript vanilla, sans framework ni
compilation, hébergé sur GitHub Pages. Les élèves l'utilisent sur Chromebook
tactile.

## Carte du projet

```
index.html, credits.html, 404.html   pages écrites à la main
dashboard.html                       tableau de bord des enseignantes (Firestore)
sw.js                                service worker (reste à la racine : il ne
                                     couvre que son dossier et en dessous)
js/                                  scripts communs et moteurs (*-engine.js) ;
                                     practice-<jeu>.js : un jeu de la page Practice ;
                                     lab-<nom>.js : simulation d'un labo (deux filières)
css/                                 feuilles de style communes et des moteurs
                                     (practice-<jeu>.css : un jeu ; lab-<nom>.css : un labo)
dashboard/                           scripts et style du tableau de bord
firebase/                            config Firebase, import d'avant Firebase,
                                     règles Firestore (à copier dans la console)
en/year1/<chapitre>/                 filière anglaise
nl/jaar1/<chapitre>/                 filière néerlandaise
  *.html                             6 pages GÉNÉRÉES (ne pas éditer), dont laboratory.html
  lab-<nom>.<en|nl>.js               textes d'un labo dans la langue de la filière
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

Labos virtuels (en anglais et en néerlandais) : `chem1` « Metal detectives » et
« Under our feet » (composition du sol), `bio1` « The vanishing leaves » et
« Inside two ecosystems » (mission 1 de la sortie de terrain : facteurs
abiotiques, carré de comptage, histogramme FO5b), `phys1` « The energy test
bench » (dynamo à manivelle et deux lampes : mesures en units, diagramme de
flux d'énergie, bilan ; sans labo réel dans le cours). Chaque chapitre a sa page Lab
(`laboratory.html`, générée), accessible depuis la fenêtre de l'accueil et la
barre de navigation ; ses labos sont déclarés par langue dans
[tools/chapters.json](tools/chapters.json) (`labs`). Sans labo, la page et la
carte du chapitre à l'accueil disent « Lab is still in development ».
Le cadre commun ([lab-engine.js](js/lab-engine.js)) impose à tous les labos la
démarche en 4 étapes (Predict, Experiment, Conclude, Check) et le rapport
imprimable selon la fiche outil FO3. Un labo, sans JSON, c'est une simulation
commune aux deux filières (`js/lab-<nom>.js`, `css/lab-<nom>.css`) et ses
textes, un fichier par langue dans le dossier du chapitre
(`lab-<nom>.en.js`, `lab-<nom>.nl.js`, mêmes clés : vérifié par
`validate-content.js`). Une correction de la simulation vaut donc pour les
deux filières ; un texte se change dans les deux langues. Chaque labo tire au
sort une partie de son contenu pour pouvoir être refait.

`docs/todo/`, `docs/images-provenance.md` et
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
| Comportement des exercices, socle commun des jeux (libellés, chargement, liens `?game=`, chronomètre, confettis) | [practice-engine.js](js/practice-engine.js), [practice-engine.css](css/practice-engine.css) |
| Un jeu en particulier | `practice-<jeu>.{js,css}` dans `js/` et `css/` : `qcm`, `fitb` (texte à trous), `dnd` (glisser-déposer), `memory`, `sorting` (tri) |
| Cartes de vocabulaire | [vocabulary-engine.js](js/vocabulary-engine.js), `vocabulary.json` |
| Page Ressources, page Explorations | [resources-engine.js](js/resources-engine.js), [explorations-engine.js](js/explorations-engine.js) |
| Page d'autoévaluation | [autoeval-engine.js](js/autoeval-engine.js), [assessment.css](css/assessment.css), `autoeval.json` |
| Structure HTML d'une page de chapitre | `templates/<type>.{en,nl}.html`, puis régénérer |
| Titre ou couleur d'un chapitre | [tools/chapters.json](tools/chapters.json), puis régénérer (la liste de l'accueil en sort aussi) |
| Accueil, choix de la langue et de l'année | [index.html](index.html), [welcome-back.js](js/welcome-back.js) |
| Labos virtuels : modale, étapes, verrous, rapport | [lab-engine.js](js/lab-engine.js), [lab-engine.css](css/lab-engine.css) ; un labo : `lab-<nom>.{js,css}` dans `js/` et `css/` (simulation), `<chapitre>/lab-<nom>.<en\|nl>.js` (textes) |
| Créer un labo (démarche, conventions) | skill `creer-labo` |
| Ajouter un labo à un chapitre | sa ligne dans `labs.en` et `labs.nl` de [tools/chapters.json](tools/chapters.json) (même `id`), sa simulation `lab-<nom>.{js,css}` dans `js/` et `css/`, ses textes `lab-<nom>.<langue>.js` dans chaque filière, puis régénérer |
| Barre de navigation entre sections | [chapter-nav.js](js/chapter-nav.js) |
| Données enregistrées des élèves | [storage.js](js/storage.js), seul fichier qui touche à `localStorage` ; compteurs d'activité : `SiteStorage.activity` |
| Tableau de bord enseignant (classes, élèves, suivi) | [dashboard.js](dashboard/dashboard.js) (page, onglet Classes et élèves), [dashboard-class.js](dashboard/dashboard-class.js) (suivi), [dashboard-student.js](dashboard/dashboard-student.js) (fiche élève), [dashboard-activities.js](dashboard/dashboard-activities.js) (bilan des activités), [dashboard-data.js](dashboard/dashboard-data.js) (lecture et calculs), [dashboard-ui.js](dashboard/dashboard-ui.js) (couleurs, barres), [dashboard.css](dashboard/dashboard.css) ; accès : collection `teachers` et [firestore.rules](firebase/firestore.rules) |
| Écran d'accès, connexion Firebase | [access-control.js](js/access-control.js), [firebase-init.js](firebase/firebase-init.js) (config et version du SDK) |
| Mise en forme du texte, modales, contraste élevé, bandeau hors ligne | [rich-text.js](js/rich-text.js) |
| Mode hors ligne, cache | [sw.js](sw.js) |
| Styles communs, couleurs par matière | [style.css](css/style.css) |

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

Avant d'ouvrir [practice-engine.js](js/practice-engine.js) (2 500 lignes) ou sa
feuille de style (2 000 lignes), lancer `outline.js` avec un filtre, puis ne
lire que les lignes utiles.

Page Practice : le moteur et les fichiers `practice-<jeu>` sont des scripts
classiques qui partagent leurs déclarations (pas de module). Chaque jeu
n'utilise que le moteur, jamais un autre jeu ; un outil utile à plusieurs
jeux va dans la section « Jeux : outils communs » du moteur. Les templates
chargent le moteur puis les jeux dans l'ordre qcm, fitb, dnd, memory,
sorting (même ordre pour le CSS : une règle de jeu doit venir après celles
du moteur). `initPractice` part à `DOMContentLoaded`, une fois tous les
scripts chargés.

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
  (`fitToScreen` dans [lab-engine.js](js/lab-engine.js), zoom CSS) : tout
  grandit au lieu d'ajouter du vide. Rien à faire dans le labo, sinon ne pas
  s'y opposer. À l'étape Check, le labo passe le panneau de détail du
  critère à `lab.fillSpace(el)` après chaque changement de son contenu : le
  texte y grandit (×1,5 au plus) tant qu'il tient sans défiler.
- **Labos virtuels.** Créer un labo ou le remanier en profondeur : skill
  `creer-labo` (chapitre de cours, attendus d'autoeval.json et labos réels
  d'abord, puis proposition, fiche de conception validée, construction, deux
  langues, vérification). « Labo » au sens large : paillasse, sortie sur le
  terrain virtuelle, expérience sur un modèle…, la forme est libre tant que
  la démarche scientifique est respectée. Dans tous les cas :
  - un labo virtuel vient d'un labo fait en classe : demander la liste à
    l'enseignant, ne jamais en inventer un ; seule exception, un chapitre
    sans labo réel (confirmé par l'enseignant), où l'idée part du cours ;
  - Conclude répond aux questions de départ (posées à Predict avec
    l'hypothèse), et à elles seules ;
  - aucun texte dans la simulation : tout passe par les fichiers de langue
    (`LabEngine.textFor`), y compris l'ordre des mots, les articles, les
    listes et le séparateur décimal ;
  - tout ce qui n'est pas accessible passe par `lab.setLock` (cadenas et
    bulle qui explique), jamais `disabled` ni un blocage caché ; une étape
    s'ouvre quand les précédentes sont complètes (`stepComplete`) ;
  - après le Check, les étapes 1 à 3 sont figées par le moteur : rien ne
    change à l'affichage d'une étape, seulement sur un geste ; ce qui ne fait
    que montrer porte `data-lab-look` ; tester `lab.isFrozen()`, jamais
    `lab.state.checked` ; confirmations par `lab.confirm` ;
  - rapport FO3 : le corps garde les mots de l'élève, chaque erreur passe
    par `mark(html, note, { box })` à sa place, la note va dans
    « Correction » ;
  - reprise : `save()`, `load(data)` et `version`, à augmenter dès que la
    forme de `save()` change ; suivi : `summary()` (compté dans Firestore,
    voir `SiteStorage.activity` dans [storage.js](js/storage.js)) ;
  - mots soulignés `[mot]` / `[groupe|clé]` : pas les mots transparents avec
    le français, l'expression entière quand le mot à mot serait faux
    (`[the wax melts]` → « la cire fond ») ;
  - les enseignants (collection `teachers`) ont un bouton « Verrous » qui
    lève verrous, étapes bloquées et mode figé ; dès qu'il a servi, plus rien
    n'est envoyé au suivi jusqu'au rechargement.
- **Image venant de Wikimedia Commons** : ajouter sa ligne dans
  [credits.html](credits.html).
- **Git.** Le site est servi par GitHub Pages : traiter tout push sur `main`
  comme une mise en ligne pour les élèves.
