/* ===== Tableau de bord : briques d'affichage communes =====
   Couleurs, barres, dates, bulle d'aide. Les vues (dashboard-*.js) ne
   construisent leurs graphiques qu'avec ces fonctions, pour que tout le
   tableau de bord se lise de la même façon. */

export function esc(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ===== Couleurs =====
   Feux des exercices : les teintes que l'élève voit sur la page d'exercices
   (practice-engine.js, SELF_ASSESS_COLORS), pour lire la même chose des
   deux côtés. Ampoules de l'autoévaluation : une seule teinte (ardoise du
   site), du clair (1 ampoule) au foncé (3). Sections de l'activité : palette
   catégorielle à 7 teintes, ordre fixe vérifié (daltonisme, contraste) avec
   le validateur du skill dataviz. */
export const LIGHT = {
  3: { color: '#0ca37f', label: 'Vert : compris' },
  2: { color: '#d99a2b', label: 'Orange : presque' },
  1: { color: '#d4527a', label: 'Rouge : à revoir' },
  answered: { color: '#b3bfcc', label: 'Répondu, sans feu' },
  none: { color: '#e9eef4', label: 'Pas fait' }
};

export const BULBS = {
  3: { color: '#4a6483', label: '3 ampoules' },
  2: { color: '#8597ad', label: '2 ampoules' },
  1: { color: '#c9d3df', label: '1 ampoule' }
};

export const TRACK = '#e9eef4';

// Libellés et teintes des sections ; la liste des événements de chaque
// section vient de storage.js (SiteStorage.activity.sections), seule source.
const SECTION_LOOK = {
  exercises: { label: 'Exercices', color: '#2a78d6' },
  games: { label: 'Jeux', color: '#eb6834' },
  autoeval: { label: 'Autoévaluation', color: '#1baf7a' },
  vocabulary: { label: 'Vocabulaire', color: '#eda100' },
  resources: { label: 'Ressources', color: '#e87ba4' },
  explorations: { label: 'Explorations', color: '#008300' },
  labs: { label: 'Labos', color: '#6250d6' }
};
const SOURCE_SECTIONS = (window.SiteStorage && SiteStorage.activity && SiteStorage.activity.sections) || {};
export const ACTIVITY_SECTIONS = {};
Object.keys(SECTION_LOOK).forEach(key => {
  ACTIVITY_SECTIONS[key] = Object.assign({ events: SOURCE_SECTIONS[key] || [] }, SECTION_LOOK[key]);
});

/* ===== Barres =====
   Barre empilée : segments séparés par un espace de 2 px (couleur du fond),
   le reste jusqu'au total en gris clair. `tip` : contenu HTML (déjà
   échappé) de la bulle d'aide. */
export function stackBar(parts, total, tip, label) {
  const sum = parts.reduce((n, p) => n + p.value, 0);
  const rest = Math.max(0, (total || sum) - sum);
  const spans = parts.filter(p => p.value > 0)
    .map(p => `<span style="flex-grow:${p.value};background:${p.color}"></span>`);
  if (rest > 0) spans.push(`<span style="flex-grow:${rest};background:${TRACK}"></span>`);
  if (!spans.length) spans.push(`<span style="flex-grow:1;background:${TRACK}"></span>`);
  return `<div class="d-bar" role="img" aria-label="${esc(label || '')}" tabindex="0"
    data-tip="${esc(tip || '')}">${spans.join('')}</div>`;
}

// Une case par élément (exercice, jeu), dans l'ordre : on voit lequel.
export function cellsBar(cells, label) {
  return `<div class="d-cells" role="img" aria-label="${esc(label || '')}">${cells.map(c =>
    `<span style="background:${c.color}" data-tip="${esc(c.tip)}"></span>`).join('')}</div>`;
}

export function legend(items) {
  return `<ul class="d-legend">${items.map(i =>
    `<li><span class="d-swatch" style="background:${i.color}"></span>${esc(i.label)}</li>`).join('')}</ul>`;
}

/* ===== Dates ===== */

const DAY = 86400000;

function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }

export function daysSince(date) {
  return date ? Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY) : Infinity;
}

export function relativeDay(date) {
  if (!date) return 'jamais';
  const d = daysSince(date);
  if (d <= 0) return 'aujourd’hui';
  if (d === 1) return 'hier';
  if (d < 60) return `il y a ${d} j`;
  return date.toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' });
}

export function fullDate(date) {
  return date ? date.toLocaleString('fr-BE', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  }) : 'Aucune activité enregistrée';
}

export const WARN_ICON = '<svg class="d-warn-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
  '<path d="M8 1.5 15 14H1z" fill="currentColor"/><path d="M8 6v4" stroke="#fff" stroke-width="1.6" ' +
  'stroke-linecap="round"/><circle cx="8" cy="12" r=".9" fill="#fff"/></svg>';

export function percent(part, total) {
  return total ? Math.round(100 * part / total) : 0;
}

/* ===== Bulle d'aide =====
   Une seule bulle pour toute la page : tout élément portant data-tip
   l'affiche au survol et au focus clavier. */
export function initTooltip() {
  if (document.getElementById('d-tip')) return;
  const tip = document.createElement('div');
  tip.id = 'd-tip';
  tip.className = 'd-tip';
  tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);
  let current = null;

  function show(el) {
    const html = el.dataset.tip;
    if (!html) return;
    current = el;
    tip.innerHTML = html;
    tip.classList.add('is-visible');
    const r = el.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    let left = r.left + r.width / 2 - t.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - t.width - 8));
    let top = r.top - t.height - 8;
    if (top < 8) top = r.bottom + 8;
    tip.style.left = `${left + window.scrollX}px`;
    tip.style.top = `${top + window.scrollY}px`;
  }
  function hide() {
    current = null;
    tip.classList.remove('is-visible');
  }
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-tip]');
    if (el && el !== current) show(el);
    else if (!el && current) hide();
  });
  document.addEventListener('focusin', e => {
    const el = e.target.closest('[data-tip]');
    if (el) show(el); else hide();
  });
  document.addEventListener('scroll', hide, true);
}
