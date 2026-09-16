// Regenerates the 12 chapter assessment.html pages from
// templates/assessment.{en,nl}.html + tools/chapters.json.
//
// Usage: node tools/generate-assessment.js [--check]

const { generatePage } = require('./lib/render');

function render(template, chapter, lang) {
  return template
    .replace(/\{\{TITLE_SUFFIX\}\}/g, chapter.titleSuffix)
    .replace(/\{\{SUBJECT_CLASS\}\}/g, chapter.subjectClass)
    .replace(/\{\{H1\}\}/g, chapter.h1[lang]);
}

generatePage('assessment', 'assessment.html', render);
