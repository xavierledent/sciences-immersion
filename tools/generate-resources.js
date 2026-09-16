// Regenerates the 12 chapter resources.html pages from
// templates/resources.{en,nl}.html + tools/chapters.json.
//
// Usage: node tools/generate-resources.js [--check]

const { generatePage } = require('./lib/render');

function render(template, chapter, lang) {
  return template
    .replace(/\{\{TITLE_SUFFIX\}\}/g, chapter.titleSuffix)
    .replace(/\{\{SUBJECT_CLASS\}\}/g, chapter.subjectClass)
    .replace(/\{\{H1\}\}/g, chapter.h1[lang]);
}

generatePage('resources', 'resources.html', render);
