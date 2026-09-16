// Regenerates the 12 chapter explorations.html pages from
// templates/explorations.{en,nl}.html + tools/chapters.json.
//
// Usage: node tools/generate-explorations.js [--check]

const { generatePage } = require('./lib/render');

function render(template, chapter, lang) {
  return template
    .replace(/\{\{TITLE_SUFFIX\}\}/g, chapter.titleSuffix)
    .replace(/\{\{SUBJECT_CLASS\}\}/g, chapter.subjectClass)
    .replace(/\{\{H1\}\}/g, chapter.h1[lang]);
}

generatePage('explorations', 'explorations.html', render);
