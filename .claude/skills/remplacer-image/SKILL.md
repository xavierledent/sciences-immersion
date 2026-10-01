---
name: remplacer-image
description: Remplacer ou ajouter une image d'exercice, de jeu ou de page sur le site Sciences en immersion. À utiliser dès qu'une image de chapitre est remplacée, corrigée, recadrée, convertie ou ajoutée (image protégée, image défectueuse, image trop lourde, libellés à traduire).
---

# Remplacer une image

Une image se remplace toujours dans les deux filières et sous un nouveau nom.
Suivre les étapes dans l'ordre ; ne rien commiter sans demande de l'utilisateur.

## 1. Repérer où l'image est utilisée

Chercher le nom du fichier dans les JSON des deux filières (`en/year1/` et
`nl/jaar1/`), dans les templates et dans les moteurs à la racine. Noter :

- le fichier JSON et le champ qui la référencent ;
- si une copie existe dans le dossier `assets/` de l'autre filière ;
- si c'est le fond d'un glisser-déposer (`backgroundImage`), auquel cas les
  zones de dépôt dépendent de l'image.

Rappel de format : `practice.json` stocke le nom seul (`"N1-6b.jpg"`),
`interactive.json` le chemin (`"assets/QCM1.webp"`). Détail dans
`docs/formats-donnees.md`.

## 2. Choisir la source

- **Wikimedia Commons** pour un objet ou un lieu réel. Lire la licence sur la
  page du fichier (ou via l'API Commons) : CC0, CC BY ou CC BY-SA acceptées,
  jamais une licence ND. Noter auteur, licence, adresse de la page.
- **Gemini** pour une scène sur mesure ou quand Commons n'a rien de clair.
  C'est l'utilisateur qui génère l'image et la fournit ; lui proposer le texte
  de la demande à soumettre.

L'image doit rester conforme à l'énoncé et au corrigé de l'exercice : relire
les deux avant de valider le choix.

## 3. Nommer et préparer le fichier

- **Nouveau nom, toujours.** Le service worker sert les images depuis son
  cache : un fichier remplacé sous le même nom resterait l'ancien chez les
  élèves. Convention en place : suffixe `b` (`N1-6b.jpg`) ou `-2`
  (`clownfish-2.jpg`), puis `c` ou `-3` au remplacement suivant.
- Nom sans espace, en respectant exactement la casse dans le JSON : GitHub
  Pages distingue majuscules et minuscules.
- Format WebP de préférence, sinon JPEG qualité 85. Viser moins de 200 Ko.
- Vérifier qu'un outil de conversion est disponible avant de promettre une
  conversion ; s'il n'y en a pas, demander à l'utilisateur de fournir l'image
  au bon format.
- Retirer ou flouter tout logo, filigrane ou horodatage au recadrage.

## 4. Version néerlandaise

- Image **sans texte** : copier le même fichier dans `nl/jaar1/<chapitre>/assets/`.
- Image **avec texte** (étiquettes, légendes, titre, tableau) : faire une
  version néerlandaise sous un nom distinct, suffixe `-nl`. Remplacer seulement
  les textes, en gardant la même police, la même couleur et la même place.
  Aucun mot anglais ne doit rester dans une image de `nl/`.

## 5. Mettre à jour les références

- Modifier le champ dans le JSON anglais **et** dans le JSON néerlandais.
- Glisser-déposer : revérifier chaque `x_pourcent` / `y_pourcent` sur la
  nouvelle image, dans les deux langues. Des proportions différentes décalent
  toutes les zones.
- Ne pas toucher aux `id` ni aux `quizTitle` : les données des élèves y sont
  rattachées.

## 6. Crédits

Image Commons sous CC BY ou CC BY-SA : ajouter un `<li>` dans `credits.html`,
sur le modèle des entrées existantes (titre en français, chapitre, auteur,
lien vers la licence, mention de la modification éventuelle, lien « source »).
CC0 et images Gemini : pas de crédit.

Ne pas rendre plus visible le lien vers cette page sur l'accueil : il est
discret à la demande de l'utilisateur.

## 7. Supprimer l'ancienne image

Seulement après avoir vérifié qu'aucun JSON, template ou moteur ne la
référence plus, dans les deux filières.

## 8. Vérifier et noter

- Lancer `node tools/check.js` et rapporter le résultat. Il signale un fichier
  introuvable, une mauvaise casse et une image pas encore suivie par git.
- Si `docs/todo/03-images.md` existe, y cocher ou ajouter la ligne, avec la
  source, la licence et la date (fichier local, jamais commité).
- Dire à l'utilisateur ce qu'il doit regarder lui-même dans le navigateur :
  l'image dans son exercice, et les zones de dépôt s'il y en a.
