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
        subs: Array.isArray(ex.questions) ? ex.questions.length : 1
      }));
    });
    const games = [];
    Object.keys(GAME_TYPES).forEach(type => {
      ((interactive && interactive[type]) || []).forEach(g => {
        games.push({ id: g.id || g.quizTitle, type, typeLabel: GAME_TYPES[type], title: g.quizTitle || g.id });
      });
    });
    const labs = ((ch.labs && ch.labs[track]) || []).map(l => ({ id: l.id, title: l.title }));
    const autoevalItems = [];
    ((autoeval && autoeval.categories) || []).forEach(cat => {
      (cat.items || []).forEach(item => autoevalItems.push({ id: item.id, category: cat.id, text: item.text }));
    });
    const exerciseCount = LEVELS.reduce((n, l) => n + levels[l].length, 0);
    return {
      id: `${TRACK_PREFIX[track]}_${ch.folder}`,
      folder: ch.folder,
      short: ch.titleSuffix,
      title: (ch.h1 && ch.h1[track]) || ch.titleSuffix,
      levels, exerciseCount, games, labs, autoevalItems,
      vocabCount: Array.isArray(vocabulary) ? vocabulary.length : 0
    };
  }));
  return chapters.filter(c => c.vocabCount || c.exerciseCount || c.games.length || c.labs.length);
}

/* ===== Travail des élèves ===== */

// { adresse: { uid, chapters: { chapitreId: données } } } pour tous les
// élèves qui se sont connectés au moins une fois.
export async function loadWork() {
  const [users, chapters] = await Promise.all([
    fb.getDocs(fb.collection(fb.db, 'users')),
    fb.getDocs(fb.collectionGroup(fb.db, 'chapters'))
  ]);
  const emailOf = {};
  const byEmail = {};
  users.forEach(d => {
    const email = String(d.data().email || '').toLowerCase();
    if (!email) return;
    emailOf[d.id] = email;
    byEmail[email] = { uid: d.id, chapters: {} };
  });
  chapters.forEach(d => {
    const uid = d.ref.parent.parent && d.ref.parent.parent.id;
    const email = emailOf[uid];
    if (email) byEmail[email].chapters[d.id] = d.data();
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
  return value && typeof value.toDate === 'function' ? value.toDate() : null;
}

/* Résumé d'un élève pour un chapitre.
   Exercice : état = pire feu valide de ses sous-questions (1 rouge, 2 orange,
   3 vert), sinon 'answered' s'il a au moins une réponse, sinon null. Un feu
   ne vaut que s'il porte sur la réponse actuelle (même règle que
   practice-engine.js, readSelfAssess). */
export function summarizeChapter(chapter, doc) {
  doc = doc || {};
  const answers = doc.practiceAnswer || {};
  const lights = doc.practiceSelfAssess || {};

  const levels = {};
  const counts = { 3: 0, 2: 0, 1: 0, answered: 0, none: 0 };
  LEVELS.forEach(level => {
    levels[level] = chapter.levels[level].map(ex => {
      let worst = null;
      let answered = false;
      for (let i = 0; i < ex.subs; i++) {
        const key = `${level}::${ex.id}::${i}`;
        const answer = answers[key];
        if (typeof answer === 'string' && answer.trim()) answered = true;
        const light = parseJson(lights[key]);
        if (light && typeof light.level === 'number' && light.answer === answer
            && (worst === null || light.level < worst)) worst = light.level;
      }
      const state = worst || (answered ? 'answered' : null);
      counts[state || 'none']++;
      return { id: ex.id, title: ex.title, state };
    });
  });

  const games = chapter.games.map(g => {
    const family = doc[GAME_FAMILY[g.type]] || {};
    const records = {};
    Object.keys(family).forEach(key => {
      const [id, stat] = key.split('::');
      if (id === g.id) records[stat || 'value'] = family[key];
    });
    const done = Object.keys(records).length > 0;
    let detail = '';
    if (g.type === 'multipleChoice' && records.value) {
      const r = parseJson(records.value);
      if (r && r.total) detail = `meilleur score ${r.score}/${r.total}`;
    } else if (records.value !== undefined) {
      detail = `record : ${records.value} erreur(s)`;
    } else if (done) {
      const parts = [];
      if (records.mistakes !== undefined) parts.push(`${records.mistakes} erreur(s)`);
      if (records.moves !== undefined) parts.push(`${records.moves} coups`);
      if (records.time !== undefined) parts.push(formatSeconds(Number(records.time)));
      detail = 'records : ' + parts.join(', ');
    }
    return Object.assign({ done, detail }, g);
  });

  const labs = chapter.labs.map(l => {
    const r = parseJson((doc.labResult || {})[l.id]) || null;
    return Object.assign({ result: r }, l);
  });

  const ratings = { 1: 0, 2: 0, 3: 0 };
  chapter.autoevalItems.forEach(item => {
    const v = parseInt((doc.autoevalRating || {})[item.id], 10);
    if (ratings[v] !== undefined) ratings[v]++;
  });

  const stats = doc.stats || {};
  return {
    levels,
    counts,
    answeredCount: chapter.exerciseCount - counts.none,
    games,
    gamesDone: games.filter(g => g.done).length,
    labs,
    labsChecked: labs.filter(l => l.result && l.result.checks > 0).length,
    ratings,
    ratedCount: ratings[1] + ratings[2] + ratings[3],
    stats,
    lastActivity: toDate(doc.updatedAt)
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
