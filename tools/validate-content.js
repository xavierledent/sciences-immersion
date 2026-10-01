// Checks every chapter's JSON content for mistakes that would otherwise only
// show up in the browser: unreadable JSON, missing images or PDFs (including a
// wrong letter case, which works on Windows and 404s on GitHub Pages), games
// that cannot be completed, EN/NL tracks that drifted apart, and self-assessment
// links to exercises that do not exist. Reads only — never fixes anything.
//
// Usage: node tools/validate-content.js [chapter ...]
//   (no argument)  checks every chapter of tools/chapters.json
//   chem1 bio1     checks only these chapter folders
//
// ERREUR lines make the script exit non-zero; AVERTISSEMENT lines do not.
// Field formats are documented in docs/formats-donnees.md.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadChapters, ROOT, YEAR_FOLDER } = require('./lib/render');

const LANGS = Object.keys(YEAR_FOLDER);
const LEVELS = ['level1', 'level2', 'level3'];
const REQUIRED_FILES = ['practice.json', 'interactive.json', 'vocabulary.json', 'resources.json', 'explorations.json'];
const GAMES = {
  multipleChoice: { label: 'QCM', parts: 'questions', unit: 'questions' },
  fillBlanks: { label: 'Texte à trous', parts: 'blanks', unit: 'trous' },
  dragAndDrop: { label: 'Glisser-déposer', parts: 'dropZones', unit: 'zones' },
  matchPairs: { label: 'Memory', parts: 'pairs', unit: 'paires' },
  sorting: { label: 'Tri', parts: 'items', unit: 'éléments' }
};
// Must stay in sync with ALLOWED_TAGS in rich-text.js.
const ALLOWED_TAG = /^<\/?(strong|em|u|br)\s*\/?>$/i;

const issues = [];
function report(severity, file, message) {
  issues.push({ severity, file, message });
}
const error = (file, message) => report('ERREUR', file, message);
const warn = (file, message) => report('AVERTISSEMENT', file, message);

/* ---------- Files on disk and in git ---------- */

const dirCache = new Map();
function listDir(dir) {
  if (!dirCache.has(dir)) {
    let names = null;
    try { names = new Set(fs.readdirSync(dir)); } catch (e) { /* not a directory */ }
    dirCache.set(dir, names);
  }
  return dirCache.get(dir);
}

// Windows answers "yes" to existsSync whatever the letter case; GitHub Pages
// does not. So each path segment is compared against the real directory
// listing instead.
function existsExactCase(relPath) {
  let dir = ROOT;
  for (const segment of relPath.split('/')) {
    const names = listDir(dir);
    if (!names || !names.has(segment)) return false;
    dir = path.join(dir, segment);
  }
  return true;
}

// What is online is what git tracks, not what sits in the folder. null when
// git is unavailable, in which case that check is simply skipped.
function loadTrackedFiles() {
  try {
    const out = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return new Set(out.split('\0').filter(Boolean));
  } catch (e) {
    return null;
  }
}
const trackedFiles = loadTrackedFiles();

// ref is written the way the engines resolve it: relative to the chapter folder.
function checkFileRef(file, chapterDir, ref, what) {
  if (typeof ref !== 'string' || !ref.trim()) return;
  if (/^https?:\/\//i.test(ref)) return;
  const relPath = path.posix.normalize(chapterDir + '/' + ref);
  if (!existsExactCase(relPath)) {
    const wrongCaseOnly = fs.existsSync(path.join(ROOT, relPath));
    error(file, `${what} : fichier introuvable « ${ref} »` + (wrongCaseOnly ? ' (il existe avec une autre casse : fonctionne sur ce PC, pas en ligne)' : ''));
  } else if (trackedFiles && !trackedFiles.has(relPath)) {
    warn(file, `${what} : « ${ref} » existe mais n'est pas encore suivi par git (absent en ligne tant qu'il n'est pas commité)`);
  }
}

/* ---------- Generic helpers ---------- */

function readJson(file) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8').replace(/^﻿/, ''));
  } catch (e) {
    error(file, `JSON illisible : ${e.message}`);
    return null;
  }
}

function isBlank(value) {
  return typeof value !== 'string' || !value.trim();
}

function duplicates(values) {
  const seen = new Set();
  const twice = new Set();
  values.forEach(v => (seen.has(v) ? twice.add(v) : seen.add(v)));
  return [...twice];
}

function named(game, index, quiz) {
  return `${GAMES[game].label} n°${index + 1}${quiz && quiz.quizTitle ? ` « ${quiz.quizTitle} »` : ''}`;
}

// Any tag other than the four rich-text.js re-enables is shown to the student
// as raw text ("<sub>2</sub>"), which is almost never what was intended.
function checkTags(file, node, where) {
  if (typeof node === 'string') {
    const unknown = (node.match(/<\/?[a-zA-Z][^<>]*>/g) || []).filter(tag => !ALLOWED_TAG.test(tag));
    if (unknown.length) warn(file, `${where} : balise non prise en charge, affichée telle quelle : ${[...new Set(unknown)].join(' ')}`);
  } else if (Array.isArray(node)) {
    node.forEach((child, i) => checkTags(file, child, `${where}[${i + 1}]`));
  } else if (node && typeof node === 'object') {
    Object.entries(node).forEach(([key, child]) => checkTags(file, child, where ? `${where}.${key}` : key));
  }
}

/* ---------- One check per file type ---------- */

function checkPractice(file, chapterDir, data) {
  LEVELS.forEach(level => {
    const list = data[level];
    if (!Array.isArray(list)) { error(file, `${level} : tableau manquant`); return; }

    duplicates(list.map(ex => ex.id)).forEach(id =>
      error(file, `${level} : l'id ${id} est utilisé par plusieurs exercices (leurs réponses d'élèves se mélangent)`));

    list.forEach((ex, i) => {
      const where = `${level} exercice ${ex.id !== undefined ? ex.id : `n°${i + 1}`}`;
      if (typeof ex.id !== 'number') error(file, `${where} : id manquant ou non numérique`);
      if (isBlank(ex.title)) warn(file, `${where} : titre vide`);
      if (ex.image) checkFileRef(file, chapterDir, 'assets/' + ex.image, `${where}, image`);

      const hasSubQuestions = Array.isArray(ex.questions) && ex.questions.length > 0;
      const parts = hasSubQuestions ? ex.questions : [ex];
      parts.forEach((part, p) => {
        const label = hasSubQuestions ? `${where}, sous-question ${String.fromCharCode(97 + p)}` : where;
        ['en', 'fr', 'corr_en', 'corr_fr'].forEach(field => {
          if (isBlank(part[field])) warn(file, `${label} : champ « ${field} » vide`);
        });
      });
    });
  });
}

function checkInteractive(file, chapterDir, data) {
  Object.keys(GAMES).forEach(game => {
    const list = data[game];
    if (!Array.isArray(list)) { error(file, `${GAMES[game].label} : tableau « ${game} » manquant`); return; }

    // Best scores and resume points are stored under the quizTitle.
    duplicates(list.map(quiz => quiz.quizTitle)).forEach(title =>
      error(file, `${GAMES[game].label} : le titre « ${title} » est utilisé par plusieurs jeux (leurs scores se mélangent)`));
    list.forEach((quiz, i) => {
      if (isBlank(quiz.quizTitle)) error(file, `${named(game, i)} : quizTitle manquant`);
    });
  });

  (data.multipleChoice || []).forEach((quiz, i) => {
    const name = named('multipleChoice', i, quiz);
    checkFileRef(file, chapterDir, quiz.image, `${name}, image`);
    if (!Array.isArray(quiz.questions) || !quiz.questions.length) { error(file, `${name} : aucune question`); return; }
    // A question's "image": null means "no image, even if the quiz has one"
    // (the editor's "none" mode); only a missing field inherits the quiz image.
    // A shared image hidden on every single question is almost surely a slip.
    if (quiz.image && quiz.questions.every(q => 'image' in q && !q.image)) {
      warn(file, `${name} : l'image du QCM n'apparaît sur aucune question (toutes ont "image": null ; retirer ce champ pour hériter de l'image du QCM)`);
    }
    quiz.questions.forEach((q, n) => {
      const where = `${name}, question ${n + 1}`;
      checkFileRef(file, chapterDir, q.image, `${where}, image`);
      if (isBlank(q.question)) warn(file, `${where} : énoncé vide`);
      if (!Array.isArray(q.options) || q.options.length < 2) { error(file, `${where} : moins de deux options`); return; }
      if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        error(file, `${where} : correctAnswer (${JSON.stringify(q.correctAnswer)}) ne désigne aucune des ${q.options.length} options`);
      }
      if (q.options.some(isBlank)) warn(file, `${where} : option vide`);
      if (duplicates(q.options).length) warn(file, `${where} : option en double « ${duplicates(q.options).join(' », « ')} »`);
      if (isBlank(q.explanation)) warn(file, `${where} : explication vide`);
    });
  });

  (data.fillBlanks || []).forEach((ex, i) => {
    const name = named('fillBlanks', i, ex);
    checkFileRef(file, chapterDir, ex.image, `${name}, image`);
    const blanks = Array.isArray(ex.blanks) ? ex.blanks : [];
    const used = new Set([...String(ex.text || '').matchAll(/\[blank(\d+)\]/g)].map(m => Number(m[1])));
    if (!blanks.length) error(file, `${name} : aucun trou défini`);
    blanks.forEach((blank, n) => {
      const where = `${name}, trou ${n}`;
      if (!used.has(n)) error(file, `${where} : [blank${n}] n'apparaît pas dans le texte`);
      const options = Array.isArray(blank.options) ? blank.options : [];
      const expected = String(blank.correctAnswer == null ? '' : blank.correctAnswer).trim().toLowerCase();
      if (!options.some(opt => String(opt).trim().toLowerCase() === expected)) {
        error(file, `${where} : la bonne réponse « ${blank.correctAnswer} » ne figure pas parmi les options`);
      }
    });
    [...used].filter(n => n >= blanks.length).forEach(n =>
      error(file, `${name} : le texte contient [blank${n}] mais aucun trou ${n} n'est défini`));
  });

  (data.dragAndDrop || []).forEach((ex, i) => {
    const name = named('dragAndDrop', i, ex);
    if (isBlank(ex.backgroundImage)) error(file, `${name} : image de fond manquante`);
    checkFileRef(file, chapterDir, ex.backgroundImage, `${name}, image de fond`);
    const labels = Array.isArray(ex.reservoirItems) ? ex.reservoirItems : [];
    const zones = Array.isArray(ex.dropZones) ? ex.dropZones : [];
    if (!zones.length) error(file, `${name} : aucune zone de dépôt`);
    zones.forEach((zone, n) => {
      const where = `${name}, zone ${n + 1}`;
      if (!labels.includes(zone.acceptedText)) {
        error(file, `${where} : attend « ${zone.acceptedText} », qui n'est pas dans les étiquettes (jeu impossible à finir)`);
      }
      ['x_pourcent', 'y_pourcent'].forEach(axis => {
        if (typeof zone[axis] !== 'number' || zone[axis] < 0 || zone[axis] > 100) {
          error(file, `${where} : ${axis} (${JSON.stringify(zone[axis])}) hors de l'image`);
        }
      });
    });
    // With hideOnSuccess a label disappears once placed, so a label expected by
    // two zones has to be present twice.
    if (ex.hideOnSuccess) {
      const count = list => list.reduce((acc, text) => acc.set(text, (acc.get(text) || 0) + 1), new Map());
      const available = count(labels);
      count(zones.map(z => z.acceptedText)).forEach((needed, text) => {
        const have = available.get(text) || 0;
        if (have && have < needed) error(file, `${name} : « ${text} » est attendu par ${needed} zones mais n'existe qu'en ${have} exemplaire(s)`);
      });
    }
  });

  (data.matchPairs || []).forEach((ex, i) => {
    const name = named('matchPairs', i, ex);
    const pairs = Array.isArray(ex.pairs) ? ex.pairs : [];
    if (pairs.length < 2) error(file, `${name} : moins de deux paires`);
    duplicates(pairs.map(p => p.id)).forEach(id => error(file, `${name} : l'id de paire ${id} est utilisé deux fois`));
    pairs.forEach((pair, n) => {
      ['sideA', 'sideB'].forEach(sideKey => {
        const side = pair[sideKey];
        const where = `${name}, paire ${n + 1}, ${sideKey}`;
        if (!side || isBlank(side.content)) { error(file, `${where} : contenu manquant`); return; }
        if (side.type !== 'text' && side.type !== 'image') error(file, `${where} : type « ${side.type} » inconnu (text ou image)`);
        if (side.type === 'image') checkFileRef(file, chapterDir, side.content, where);
      });
    });
  });

  (data.sorting || []).forEach((ex, i) => {
    const name = named('sorting', i, ex);
    const categories = Array.isArray(ex.categories) ? ex.categories : [];
    const items = Array.isArray(ex.items) ? ex.items : [];
    if (categories.length < 2) error(file, `${name} : moins de deux catégories`);
    if (!items.length) error(file, `${name} : aucun élément à trier`);
    duplicates(items.map(item => item.id)).forEach(id => error(file, `${name} : l'id d'élément ${id} est utilisé deux fois`));
    items.forEach((item, n) => {
      const where = `${name}, élément ${n + 1}`;
      if (!categories.includes(item.category)) {
        error(file, `${where} : catégorie « ${item.category} » non déclarée (jeu impossible à finir)`);
      }
      if (isBlank(item.content)) error(file, `${where} : contenu manquant`);
      if (item.type !== 'text' && item.type !== 'image') error(file, `${where} : type « ${item.type} » inconnu (text ou image)`);
      if (item.type === 'image') checkFileRef(file, chapterDir, item.content, where);
    });
    categories.filter(cat => !items.some(item => item.category === cat)).forEach(cat =>
      warn(file, `${name} : la catégorie « ${cat} » ne reçoit aucun élément`));
  });
}

function checkVocabulary(file, data) {
  if (!Array.isArray(data)) { error(file, 'la racine doit être un tableau'); return; }
  data.forEach((card, i) => {
    ['english', 'french', 'definitionEnglish', 'definitionFrench'].forEach(field => {
      if (isBlank(card[field])) warn(file, `carte n°${i + 1}${card.english ? ` « ${card.english} »` : ''} : champ « ${field} » vide`);
    });
  });
  duplicates(data.map(card => card.english)).forEach(word => warn(file, `le mot « ${word} » apparaît deux fois`));
}

function checkResources(file, chapterDir, data) {
  const fiches = data.fichesOutils || {};
  (fiches.items || []).forEach(item => checkFileRef(file, chapterDir, `${fiches.basePath || ''}/${item.file}`, `fiche outil « ${item.label} »`));

  const autoEval = data.ficheAutoEvaluation || {};
  if (autoEval.pdfFile) checkFileRef(file, chapterDir, `${autoEval.basePath || ''}/${autoEval.pdfFile}`, "fiche d'autoévaluation");

  const mindmap = data.mindmap || {};
  const mindmapBase = mindmap.basePath || autoEval.basePath || '';
  (mindmap.items || []).forEach(item => checkFileRef(file, chapterDir, `${mindmapBase}/${item.file}`, `mindmap « ${item.title} »`));

  ((data.videos || {}).items || []).forEach(video => {
    if (isBlank(video.youtubeId) && isBlank(video.embedUrl)) error(file, `vidéo « ${video.title} » : youtubeId manquant`);
  });
}

function checkExplorations(file, chapterDir, data) {
  const documentation = data.documentation || {};
  (documentation.items || []).forEach(item =>
    checkFileRef(file, chapterDir, `${documentation.basePath || ''}/${item.file}`, `document « ${item.title} »`));
  ((data.liensUtiles || {}).items || []).forEach(item => {
    if (!/^https?:\/\//i.test(item.url || '')) error(file, `lien « ${item.title} » : adresse absente ou invalide`);
  });
}

function checkAutoeval(file, data, practice) {
  const items = (data.categories || []).flatMap(category => category.items || []);
  // Ratings are stored under the item id.
  duplicates(items.map(item => item.id)).forEach(id =>
    error(file, `l'id d'attendu « ${id} » est utilisé deux fois (les notes des élèves se mélangent)`));
  items.forEach(item => {
    if (isBlank(item.text)) warn(file, `attendu « ${item.id} » : texte vide`);
    (item.exercises || []).forEach(link => {
      const level = practice && practice[link.level];
      if (!Array.isArray(level) || !level.some(ex => ex.id === link.id)) {
        error(file, `attendu « ${item.id} » : renvoie vers ${link.level} exercice ${link.id}, qui n'existe pas dans practice.json`);
      }
    });
  });
}

/* ---------- EN / NL parity ---------- */

// Reported on the nl file, as warnings: the two tracks are meant to mirror each
// other, but a difference can be deliberate.
function compareTracks(chapter, content) {
  const file = name => `nl/${YEAR_FOLDER.nl}/${chapter}/${name}`;
  const { en, nl } = content;

  if (en.practice && nl.practice) {
    LEVELS.forEach(level => {
      const byId = list => new Map((Array.isArray(list) ? list : []).map(ex => [ex.id, ex]));
      const a = byId(en.practice[level]);
      const b = byId(nl.practice[level]);
      const onlyEn = [...a.keys()].filter(id => !b.has(id));
      const onlyNl = [...b.keys()].filter(id => !a.has(id));
      if (onlyEn.length) warn(file('practice.json'), `${level} : exercice(s) ${onlyEn.join(', ')} présent(s) en EN, absent(s) en NL`);
      if (onlyNl.length) warn(file('practice.json'), `${level} : exercice(s) ${onlyNl.join(', ')} présent(s) en NL, absent(s) en EN`);
      a.forEach((exEn, id) => {
        const exNl = b.get(id);
        if (!exNl) return;
        const subCount = ex => (Array.isArray(ex.questions) ? ex.questions.length : 0);
        if (subCount(exEn) !== subCount(exNl)) {
          warn(file('practice.json'), `${level} exercice ${id} : ${subCount(exEn)} sous-question(s) en EN, ${subCount(exNl)} en NL`);
        }
        if (!!exEn.image !== !!exNl.image) {
          warn(file('practice.json'), `${level} exercice ${id} : image ${exEn.image ? 'présente en EN, absente en NL' : 'présente en NL, absente en EN'}`);
        }
      });
    });
  }

  if (en.interactive && nl.interactive) {
    Object.entries(GAMES).forEach(([game, { label, parts, unit }]) => {
      const a = Array.isArray(en.interactive[game]) ? en.interactive[game] : [];
      const b = Array.isArray(nl.interactive[game]) ? nl.interactive[game] : [];
      if (a.length !== b.length) {
        warn(file('interactive.json'), `${label} : ${a.length} jeu(x) en EN, ${b.length} en NL`);
        return;
      }
      a.forEach((quiz, i) => {
        const size = q => (Array.isArray(q[parts]) ? q[parts].length : 0);
        if (size(quiz) !== size(b[i])) {
          warn(file('interactive.json'), `${named(game, i, b[i])} : ${size(quiz)} ${unit} en EN, ${size(b[i])} en NL`);
        }
      });
    });
  }

  if (Array.isArray(en.vocabulary) && Array.isArray(nl.vocabulary) && en.vocabulary.length !== nl.vocabulary.length) {
    warn(file('vocabulary.json'), `${en.vocabulary.length} cartes en EN, ${nl.vocabulary.length} en NL`);
  }

  if (!!en.autoeval !== !!nl.autoeval) {
    warn(file('autoeval.json'), `fichier présent en ${en.autoeval ? 'EN' : 'NL'} seulement`);
  } else if (en.autoeval && nl.autoeval) {
    const links = data => new Map((data.categories || []).flatMap(c => c.items || [])
      .map(item => [item.id, (item.exercises || []).map(l => `${l.level}:${l.id}`).sort().join(' ')]));
    const a = links(en.autoeval);
    const b = links(nl.autoeval);
    const onlyOne = [...a.keys()].filter(id => !b.has(id)).concat([...b.keys()].filter(id => !a.has(id)));
    if (onlyOne.length) warn(file('autoeval.json'), `attendu(s) présent(s) dans une seule filière : ${onlyOne.join(', ')}`);
    a.forEach((value, id) => {
      if (b.has(id) && b.get(id) !== value) warn(file('autoeval.json'), `attendu « ${id} » : exercices liés différents en EN et en NL`);
    });
  }
}

/* ---------- Run ---------- */

const wanted = process.argv.slice(2);
const allFolders = loadChapters().map(chapter => chapter.folder);
const unknown = wanted.filter(name => !allFolders.includes(name));
if (unknown.length) {
  console.log(`Chapitre inconnu : ${unknown.join(', ')}. Chapitres disponibles : ${allFolders.join(', ')}.`);
  process.exit(1);
}
const folders = wanted.length ? wanted : allFolders;
let filesRead = 0;

folders.forEach(chapter => {
  const content = {};
  LANGS.forEach(lang => {
    const chapterDir = `${lang}/${YEAR_FOLDER[lang]}/${chapter}`;
    const loaded = {};
    REQUIRED_FILES.concat('autoeval.json').forEach(name => {
      const file = `${chapterDir}/${name}`;
      const data = readJson(file);
      if (data === undefined) {
        if (name !== 'autoeval.json') error(file, 'fichier manquant');
        return;
      }
      filesRead++;
      if (data === null) return;
      loaded[name.replace('.json', '')] = data;
      checkTags(file, data, '');
    });

    if (loaded.practice) checkPractice(`${chapterDir}/practice.json`, chapterDir, loaded.practice);
    if (loaded.interactive) checkInteractive(`${chapterDir}/interactive.json`, chapterDir, loaded.interactive);
    if (loaded.vocabulary) checkVocabulary(`${chapterDir}/vocabulary.json`, loaded.vocabulary);
    if (loaded.resources) checkResources(`${chapterDir}/resources.json`, chapterDir, loaded.resources);
    if (loaded.explorations) checkExplorations(`${chapterDir}/explorations.json`, chapterDir, loaded.explorations);
    if (loaded.autoeval) checkAutoeval(`${chapterDir}/autoeval.json`, loaded.autoeval, loaded.practice);
    content[lang] = loaded;
  });
  compareTracks(chapter, content);
});

const byFile = new Map();
issues.forEach(issue => {
  if (!byFile.has(issue.file)) byFile.set(issue.file, []);
  byFile.get(issue.file).push(issue);
});
byFile.forEach((list, file) => {
  console.log(`\n${file}`);
  list.forEach(issue => console.log(`  ${issue.severity.padEnd(13)}  ${issue.message}`));
});

const errorCount = issues.filter(issue => issue.severity === 'ERREUR').length;
const warningCount = issues.length - errorCount;
console.log(`\n${filesRead} fichiers lus : ${errorCount} erreur(s), ${warningCount} avertissement(s).`);
process.exitCode = errorCount ? 1 : 0;
