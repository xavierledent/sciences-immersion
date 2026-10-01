---
name: synchroniser-nl
description: Reporter dans la filière néerlandaise un contenu fait en anglais sur le site Sciences en immersion (exercices, jeux, vocabulaire, autoévaluation), ou remettre les deux filières en phase. À utiliser pour traduire un chapitre ou un jeu de EN vers NL, ou quand le validateur signale un écart EN/NL.
---

# Synchroniser le néerlandais avec l'anglais

L'anglais (`en/year1/<chapitre>/`) est la référence ; le néerlandais
(`nl/jaar1/<chapitre>/`) doit en être le miroir : mêmes exercices, mêmes jeux,
même ordre. Ne rien commiter sans demande de l'utilisateur.

## 1. Mesurer l'écart

Lancer `node tools/validate-content.js <chapitre>`. Les avertissements sur les
fichiers `nl/` listent ce qui diffère : exercices manquants, nombre de jeux,
de questions, de paires, images présentes d'un seul côté.

Un écart de structure peut être volontaire : en cas de doute, demander avant
de l'aligner.

## 2. Ce qui se traduit, ce qui ne bouge pas

Les noms de champs sont identiques dans les deux filières. Un fichier `nl/`
range son texte néerlandais dans les champs « anglais ».

| Champ | Dans le fichier `nl/` |
|---|---|
| `en`, `corr_en` (exercices) | néerlandais |
| `english`, `definitionEnglish` (vocabulaire) | néerlandais |
| `fr`, `corr_fr`, `french`, `definitionFrench` | **identique à l'anglais, mot pour mot** |
| `title`, `quizTitle`, `question`, `options`, `explanation`, `instructions`, `text`, `reservoirItems`, `acceptedText`, `categories`, `category`, `content` | néerlandais |
| `wordBank[].word` | néerlandais ; `translation` reste en français |
| `id`, `correctAnswer` numérique, `x_pourcent`, `y_pourcent`, `type`, `hideOnSuccess` | identiques |
| `autoeval.json`, `explorations.json` | en français dans les deux filières : copier tel quel |
| `resources.json` | en français et identique, **sauf le bloc `videos`** : chaque filière a ses propres vidéos, choisies par l'utilisateur. Ne pas inventer d'identifiant YouTube : demander la vidéo néerlandaise |

Détail des formats dans `docs/formats-donnees.md`.

## 3. Garder les jeux finissables

Plusieurs champs doivent rester identiques entre eux au caractère près, après
traduction :

- glisser-déposer : chaque `acceptedText` doit exister dans `reservoirItems` ;
- tri : chaque `category` d'un élément doit exister dans `categories` ;
- texte à trous : `correctAnswer` est le **texte** de la bonne option, à
  traduire de la même façon que dans `options` ; les `[blankN]` du texte
  gardent leur numéro ;
- QCM : `correctAnswer` est un **index**, il ne change pas tant que l'ordre
  des options est conservé.

## 4. Garder l'ordre et les identifiants

- Même ordre des exercices et des jeux qu'en anglais, mêmes `id`.
- Un `quizTitle` néerlandais déjà en ligne ne se renomme pas sans le signaler :
  les records des élèves y sont rattachés. Pour un jeu nouveau, le titre est
  libre.
- Pas de titre d'exercice qui donne la réponse.

## 5. Langue

- Néerlandais de Belgique, niveau 1re secondaire en immersion : phrases
  courtes, vocabulaire du cours.
- Reprendre les termes déjà utilisés dans le `vocabulary.json` néerlandais du
  chapitre, pour qu'un même concept porte partout le même mot.
- Tutoiement (`je`), comme le tutoiement des textes français.
- Seules les balises `<strong>`, `<em>`, `<u>` et `<br>` sont interprétées :
  conserver celles de l'anglais, n'en ajouter aucune autre.

## 6. Images

- Image sans texte : même fichier, copié dans `nl/jaar1/<chapitre>/assets/`.
- Image avec texte anglais : il faut une version néerlandaise, sous un autre
  nom. Suivre le skill `remplacer-image`. Lister ces images à l'utilisateur
  plutôt que de laisser un mot anglais dans une page néerlandaise.

## 7. Vérifier

- `node tools/check.js` : zéro erreur, et plus aucun avertissement de parité
  sur le chapitre, sauf écart voulu et expliqué.
- Signaler à l'utilisateur les traductions dont le terme scientifique est
  incertain, pour relecture : il enseigne la matière, pas moi.
