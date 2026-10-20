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
// Usage: node tools/generate-laboratory.js [--check]

const { generatePage } = require('./lib/render');

const LABELS = {
  en: {
    enter: 'Enter the lab',
    soonTitle: 'Lab is still in development.',
    soonText: 'Come back soon: a virtual lab for this chapter is on its way. In the meantime, the other sections of the chapter are waiting for you.'
  },
  nl: {
    enter: 'Naar het labo',
    soonTitle: 'Labo is nog in ontwikkeling.',
    soonText: 'Kom snel terug: er komt een virtueel labo voor dit hoofdstuk. Ondertussen wachten de andere onderdelen van het hoofdstuk op je.'
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
  if (!labs.length) {
    return `      <article class='lab-tile lab-tile-soon'>\n` +
      `        <h2 class='lab-tile-title'>${L.soonTitle}</h2>\n` +
      `        <p class='lab-tile-text'>${L.soonText}</p>\n` +
      `      </article>`;
  }
  return labs.map(lab =>
    `      <article class='lab-tile'>\n` +
    `        <h2 class='lab-tile-title'>${escapeHtml(lab.title)}</h2>\n` +
    `        <p class='lab-tile-question'>${escapeHtml(lab.question)}</p>\n` +
    `        <p class='lab-tile-text'>${escapeHtml(lab.text)}</p>\n` +
    `        <button type='button' class='resource-button lab-tile-btn' data-lab-open='${lab.id}'>${L.enter}</button>\n` +
    `      </article>`).join('\n');
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
