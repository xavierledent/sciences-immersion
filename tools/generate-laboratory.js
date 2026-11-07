// Regenerates the 12 chapter laboratory.html pages from
// templates/laboratory.{en,nl}.html + tools/chapters.json.
//
// Each chapter lists its virtual labs per language in chapters.json
// ("labs": { "en": [ { id, file, title, question, text } ], "nl": [...] }).
// A lab's simulation is shared by both tracks: js/<file>.js + css/<file>.css;
// its texts live in the chapter folder, one file per language
// (<file>.<lang>.js), loaded between the engine and the simulation (see
// lab-engine.js). A chapter with no lab in a language still gets its page,
// showing that the lab is still in development; the home page says the same
// on the chapter's card.
//
// The page always shows three places, one per lab (three labs per chapter
// in the end): a place without a lab yet shows a dashed "still in
// development" tile. Each lab tile carries a four-step bar under a short
// "Your progress" label (filled cells = steps reached, from the student's
// saved progress, by js/lab-page.js); each cell names its step in a tooltip
// and is a button that opens the lab at that step (lab-engine.js, as far as
// the student may go: the locks still apply).
//
// Usage: node tools/generate-laboratory.js [--check]

const { generatePage } = require('./lib/render');

const SLOTS = 3;

const LABELS = {
  en: {
    enter: 'Enter the lab',
    notStarted: 'Not started yet',
    progress: 'Your progress',
    steps: ['Predict', 'Experiment', 'Conclude', 'Check'],
    soonTitle: 'Lab is still in development.',
    soonText: 'Come back soon: a new virtual lab is on its way.'
  },
  nl: {
    enter: 'Naar het labo',
    notStarted: 'Nog niet begonnen',
    progress: 'Jouw voortgang',
    steps: ['Voorspellen', 'Experimenteren', 'Besluiten', 'Controleren'],
    soonTitle: 'Labo is nog in ontwikkeling.',
    soonText: 'Kom snel terug: er is een nieuw virtueel labo onderweg.'
  }
};

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function labsOf(chapter, lang) {
  return (chapter.labs && chapter.labs[lang]) || [];
}

function labContent(labs, lang) {
  const L = LABELS[lang];
  const soon =
    `      <article class='lab-tile lab-tile-soon'>\n` +
    `        <h2 class='lab-tile-title'>${L.soonTitle}</h2>\n` +
    `        <p class='lab-tile-text'>${L.soonText}</p>\n` +
    `      </article>`;
  const tiles = labs.slice(0, SLOTS).map(lab =>
    `      <article class='lab-tile' data-lab-tile='${lab.id}'>\n` +
    `        <h2 class='lab-tile-title'>${escapeHtml(lab.title)}</h2>\n` +
    `        <p class='lab-tile-question'>${escapeHtml(lab.question)}</p>\n` +
    `        <p class='lab-tile-text'>${escapeHtml(lab.text)}</p>\n` +
    `        <div class='lab-tile-progress'>\n` +
    `          <span class='lab-tile-progress-label'>${L.progress}</span>\n` +
    `          <div class='lab-tile-steps' role='group' aria-label='${L.notStarted}'>${L.steps.map((name, i) => `<button type='button' class='lab-tile-step' data-lab-open='${lab.id}' data-lab-step='${i + 1}' data-tooltip='${i + 1}. ${name}' aria-label='${i + 1}. ${name}'></button>`).join('')}</div>\n` +
    `        </div>\n` +
    `        <button type='button' class='resource-button lab-tile-btn' data-lab-open='${lab.id}'>${L.enter}</button>\n` +
    `      </article>`);
  while (tiles.length < SLOTS) tiles.push(soon);
  return tiles.join('\n');
}

function render(template, chapter, lang) {
  const labs = labsOf(chapter, lang);
  const styles = labs.map(lab => `\n  <link rel='stylesheet' href='../../../css/${lab.file}.css'>`).join('');
  const scripts = labs.length
    ? `\n  <script src='../../../js/lab-engine.js'></script>` +
      labs.map(lab => `\n  <script src='${lab.file}.${lang}.js'></script>\n  <script src='../../../js/${lab.file}.js'></script>`).join('')
    : '';
  return template
    .replace(/\{\{TITLE_SUFFIX\}\}/g, chapter.titleSuffix)
    .replace(/\{\{SUBJECT_CLASS\}\}/g, chapter.subjectClass)
    .replace(/\{\{H1\}\}/g, chapter.h1[lang])
    .replace(/\{\{LAB_STYLES\}\}/g, styles)
    .replace(/\{\{LAB_CONTENT\}\}/g, labContent(labs, lang))
    .replace(/\{\{LAB_SCRIPTS\}\}/g, scripts);
}

generatePage('laboratory', 'laboratory.html', render);
