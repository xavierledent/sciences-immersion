// Regenerates the 12 chapter assessment.html pages from
// templates/assessment.{en,nl}.html + tools/chapters.json.
//
// {{LAB_TITLES}}: the chapter's labs in this language ({ id: title }, JSON),
// read by autoeval-engine.js to title the lab links of an attendu
// (autoeval.json, "labs").
//
// Usage: node tools/generate-assessment.js [--check]

const { generatePage } = require('./lib/render');

function labTitles(chapter, lang) {
  const labs = (chapter.labs && chapter.labs[lang]) || [];
  const titles = Object.fromEntries(labs.map(lab => [lab.id, lab.title]));
  // Safe inside <script>: no "</script>" can end it early.
  return JSON.stringify(titles).replace(/</g, '\\u003c');
}

function render(template, chapter, lang) {
  return template
    .replace(/\{\{TITLE_SUFFIX\}\}/g, chapter.titleSuffix)
    .replace(/\{\{SUBJECT_CLASS\}\}/g, chapter.subjectClass)
    .replace(/\{\{H1\}\}/g, chapter.h1[lang])
    .replace(/\{\{LAB_TITLES\}\}/g, labTitles(chapter, lang));
}

generatePage('assessment', 'assessment.html', render);
