/* ===== Tableau de bord : contenu des chapitres et travail des élèves =====

   Deux sources, croisées ici pour que les vues n'aient que des chiffres à
   afficher :
     - le CONTENU, lu dans les JSON du site (tools/chapters.json, puis
       practice.json, interactive.json, autoeval.json de chaque chapitre) :
       quels exercices, jeux, labos et attendus existent ;
     - le TRAVAIL, lu dans Firestore : users/{uid} (adresse) et
       users/{uid}/chapters/{chapitre}, en une requête de groupe.
   Formats du travail : voir storage.js (familles) et lab-engine.js
   (labResult). */

import * as fb from './firebase-init.js';
import { ACTIVITY_SECTIONS } from './dashboard-ui.js';

const TRACK_PATH = { en: 'en/year1', nl: 'nl/jaar1' };
const TRACK_PREFIX = { en: 'en_year1', nl: 'nl_jaar1' };
export const LEVELS = ['level1', 'level2', 'level3'];
const GAME_TYPES = {
  multipleChoice: 'QCM',
  fillBlanks: 'Texte à trous',
  dragAndDrop: 'Glisser-déposer',
  matchPairs: 'Memory',
  sorting: 'Tri'
};
// Famille de records de chaque type de jeu (storage.js).
const GAME_FAMILY = {
  multipleChoice: 'qcmBestScore',
  fillBlanks: 'fitbBest',
  dragAndDrop: 'dndBest',
  matchPairs: 'memoryBest',
  sorting: 'sortingBest'
};

async function fetchJson(url) {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    return res.ok ? await res.json() : null;
  } catch (e) { return null; }
}

/* ===== Contenu ===== */

const contentCache = {};

// Chapitres d'une filière qui ont quelque chose à suivre (vocabulaire,
// exercices, jeux ou labos), dans l'ordre de chapters.json.
export function loadContent(track) {
  if (!contentCache[track]) contentCache[track] = buildContent(track);
  return contentCache[track];
}

async function buildContent(track) {
  const config = await fetchJson('tools/chapters.json');
  if (!config) throw new Error('tools/chapters.json illisible');
  const chapters = await Promise.all(config.chapters.map(async ch => {
    const base = `${TRACK_PATH[track]}/${ch.folder}/`;
    const [practice, interactive, autoeval, vocabulary] = await Promise.all(
      ['practice.json', 'interactive.json', 'autoeval.json', 'vocabulary.json'].map(f => fetchJson(base + f)));

    const levels = {};
    LEVELS.forEach(level => {
      levels[level] = ((practice && practice[level]) || []).map(ex => ({
        id: ex.id,
        title: ex.title || '',
        subs: Array.isArray(ex.questions) ? ex.questions.length : 1,
        // Énoncés (langue d'immersion), un par sous-question.
        questions: Array.isArray(ex.questions) ? ex.questions.map(q => q.en || '') : [ex.en || '']
      }));
    });
    const games = [];
    Object.keys(GAME_TYPES).forEach(type => {
      ((interactive && interactive[type]) || []).forEach(g => {
        games.push({ id: g.id || g.quizTitle, type, typeLabel: GAME_TYPES[type], title: g.quizTitle || g.id });
      });
    });
    const labs = ((ch.labs && ch.labs[track]) || []).map(l => ({ id: l.id, title: l.title, file: l.file }));
    const autoevalItems = [];
    ((autoeval && autoeval.categories) || []).forEach(cat => {
      (cat.items || []).forEach(item => autoevalItems.push({ id: item.id, category: cat.id, categoryTitle: cat.title || cat.id, text: item.text }));
    });
    const exerciseCount = LEVELS.reduce((n, l) => n + levels[l].length, 0);
    return {
      id: `${TRACK_PREFIX[track]}_${ch.folder}`,
      folder: ch.folder,
      short: ch.titleSuffix,
      subjectClass: ch.subjectClass,
      base,
      title: (ch.h1 && ch.h1[track]) || ch.titleSuffix,
      levels, exerciseCount, games, labs, autoevalItems,
      vocabCount: Array.isArray(vocabulary) ? vocabulary.length : 0
    };
  }));
  return chapters.filter(c => c.vocabCount || c.exerciseCount || c.games.length || c.labs.length);
}

/* ===== Travail des élèves ===== */

/* { adresse: { uid, chapters, history, historyAt } }
     uid       : null si l'élève ne s'est jamais connecté depuis Firebase
     chapters  : { chapitreId: document Firestore du chapitre }
     history   : { chapitreId: état reconstitué depuis le Google Sheet }
                 (importé une fois le 19/10/2026 ; l'outil d'import a été retiré), ou {} */
export async function loadWork() {
  const [users, chapters, history] = await Promise.all([
    fb.getDocs(fb.collection(fb.db, 'users')),
    fb.getDocs(fb.collectionGroup(fb.db, 'chapters')),
    // Historique : facultatif (absent avant le premier import).
    fb.getDocs(fb.collection(fb.db, 'history')).catch(e => {
      console.warn('Historique du Sheet illisible', e);
      return null;
    })
  ]);
  const emailOf = {};
  const byEmail = {};
  const entry = email => byEmail[email] = byEmail[email] || { uid: null, chapters: {}, history: {}, historyAt: null };
  users.forEach(d => {
    const email = String(d.data().email || '').toLowerCase();
    if (!email) return;
    emailOf[d.id] = email;
    entry(email).uid = d.id;
  });
  chapters.forEach(d => {
    const uid = d.ref.parent.parent && d.ref.parent.parent.id;
    const email = emailOf[uid];
    if (email) byEmail[email].chapters[d.id] = d.data();
  });
  if (history) history.forEach(d => {
    const data = d.data();
    const e = entry(d.id);
    e.history = data.chapters || {};
    e.historyAt = toDate(data.importedAt);
  });
  return byEmail;
}

function parseJson(text) {
  try { return JSON.parse(text); } catch (e) { return null; }
}

function formatSeconds(s) {
  if (!Number.isFinite(s)) return '';
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`;
}

function toDate(value) {
  if (value instanceof Date) return value;
  return value && typeof value.toDate === 'function' ? value.toDate() : null;
}

const hasAny = obj => !!obj && typeof obj === 'object' && Object.keys(obj).length > 0;

function later(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  return a > b ? a : b;
}

// Compteurs : Firestore (depuis le 19/10) + historique (avant), additionnés.
function mergeStats(a, b) {
  const out = Object.assign({}, a || {});
  Object.keys(b || {}).forEach(k => { out[k] = (Number(out[k]) || 0) + (Number(b[k]) || 0); });
  return out;
}

// Dernière activité et compteurs d'un élève, tous chapitres confondus.
export function studentTotals(work) {
  if (!work) return { last: null, statsList: [] };
  const ids = new Set(Object.keys(work.chapters).concat(Object.keys(work.history || {})));
  let last = null;
  const statsList = [];
  ids.forEach(id => {
    const doc = work.chapters[id] || {};
    const hist = (work.history || {})[id] || {};
    last = later(last, later(toDate(doc.updatedAt), toDate(hist.lastActivity)));
    statsList.push(mergeStats(doc.stats, hist.stats));
  });
  return { last, statsList };
}

function gameDetail(type, records) {
  if (type === 'multipleChoice') {
    return records.total ? `meilleur score ${records.score}/${records.total}` : '';
  }
  const parts = [];
  if (records.mistakes !== undefined) parts.push(`${records.mistakes} erreur(s)`);
  if (records.moves !== undefined) parts.push(`${records.moves} coups`);
  if (records.time !== undefined) parts.push(formatSeconds(Number(records.time)));
  return parts.length ? 'record : ' + parts.join(', ') : '';
}

// Records d'un jeu dans le document Firestore : { score, total } (QCM) ou
// { mistakes, moves, time }.
function firestoreGameRecords(g, doc) {
  const family = doc[GAME_FAMILY[g.type]] || {};
  const out = {};
  Object.keys(family).forEach(key => {
    const [id, stat] = key.split('::');
    if (id !== g.id) return;
    if (g.type === 'multipleChoice') Object.assign(out, parseJson(family[key]) || {});
    else out[stat || 'mistakes'] = Number(family[key]);
  });
  return Object.keys(out).length ? out : null;
}

/* Résumé d'un élève pour un chapitre.
   Exercice : état = pire feu de ses sous-questions (1 rouge, 2 orange,
   3 vert), sinon 'answered' s'il a au moins une réponse, sinon null. Un feu
   Firestore ne vaut que s'il porte sur la réponse actuelle (même règle que
   practice-engine.js, readSelfAssess).
   Deux sources : le document Firestore `doc` et l'historique du Sheet
   `hist`. Pour les exercices, les jeux et l'autoévaluation, Firestore
   l'emporte dès qu'il a quelque chose pour la famille (l'élève s'est
   reconnecté : son vrai travail est arrivé) ; sinon l'historique. Les
   compteurs s'additionnent. `fromSheet` dit d'où viennent les exercices. */
export function summarizeChapter(chapter, doc, hist) {
  doc = doc || {};
  hist = hist || {};
  const answers = doc.practiceAnswer || {};
  const lights = doc.practiceSelfAssess || {};
  const fromSheet = !hasAny(answers) && hasAny(hist.answers);

  const levels = {};
  const counts = { 3: 0, 2: 0, 1: 0, answered: 0, none: 0 };
  LEVELS.forEach(level => {
    levels[level] = chapter.levels[level].map(ex => {
      let worst = null;
      let answered = false;
      // Une entrée par sous-question : { text, length, light } ; text = null
      // quand seule la longueur est connue (historique du Sheet).
      const subs = [];
      for (let i = 0; i < ex.subs; i++) {
        const key = `${level}::${ex.id}::${i}`;
        let light = null;
        let text = null;
        let length = 0;
        if (fromSheet) {
          length = Number(hist.answers[key]) || 0;
          if (length > 0) light = Number((hist.lights || {})[key]) || null;
        } else {
          const answer = answers[key];
          if (typeof answer === 'string' && answer.trim()) { text = answer; length = answer.trim().length; }
          const record = parseJson(lights[key]);
          if (record && typeof record.level === 'number' && record.answer === answer) light = record.level;
        }
        if (length > 0) answered = true;
        if (light && (worst === null || light < worst)) worst = light;
        subs.push({ text, length, light });
      }
      const state = worst || (answered ? 'answered' : null);
      counts[state || 'none']++;
      return { id: ex.id, title: ex.title, state, subs, questions: ex.questions };
    });
  });

  const gamesFromFirestore = Object.keys(GAME_FAMILY).some(t => hasAny(doc[GAME_FAMILY[t]]));
  const games = chapter.games.map(g => {
    const records = gamesFromFirestore ? firestoreGameRecords(g, doc) : ((hist.games || {})[g.id] || null);
    return Object.assign({ done: !!records, records, detail: records ? gameDetail(g.type, records) : '' }, g);
  });

  const labs = chapter.labs.map(l => {
    const r = parseJson((doc.labResult || {})[l.id]) || null;
    return Object.assign({ result: r }, l);
  });

  const ratingSource = hasAny(doc.autoevalRating) ? doc.autoevalRating : (hist.ratings || {});
  const ratings = { 1: 0, 2: 0, 3: 0 };
  const itemRatings = {};
  chapter.autoevalItems.forEach(item => {
    const v = parseInt(ratingSource[item.id], 10);
    if (ratings[v] !== undefined) { ratings[v]++; itemRatings[item.id] = v; }
  });

  return {
    levels,
    counts,
    fromSheet,
    answeredCount: chapter.exerciseCount - counts.none,
    games,
    gamesDone: games.filter(g => g.done).length,
    labs,
    labsChecked: labs.filter(l => l.result && l.result.checks > 0).length,
    ratings,
    ratedCount: ratings[1] + ratings[2] + ratings[3],
    itemRatings,
    stats: mergeStats(doc.stats, hist.stats),
    lastActivity: later(toDate(doc.updatedAt), toDate(hist.lastActivity))
  };
}

// Actions par section (répartition de l'activité), tous chapitres donnés.
export function activityBySection(statsList) {
  const out = {};
  Object.keys(ACTIVITY_SECTIONS).forEach(section => {
    out[section] = 0;
    ACTIVITY_SECTIONS[section].events.forEach(name => {
      statsList.forEach(stats => { out[section] += Number(stats[name]) || 0; });
    });
  });
  return out;
}
