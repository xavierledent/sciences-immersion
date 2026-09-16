// Regenerates the 12 chapter practice.html pages from templates/practice.{en,nl}.html
// + tools/chapters.json, instead of hand-editing 12 near-identical files.
//
// Usage: node tools/generate-practice.js [--check]
//   (no flag)  writes the 12 files
//   --check    writes nothing; exits non-zero if any generated file would
//              differ from what's on disk (for a pre-commit sanity check)

const { generatePage } = require('./lib/render');

function render(template, chapter, lang) {
  return template
    .replace(/\{\{TITLE_SUFFIX\}\}/g, chapter.titleSuffix)
    .replace(/\{\{SUBJECT_CLASS\}\}/g, chapter.subjectClass)
    .replace(/\{\{H1\}\}/g, chapter.h1[lang]);
}

generatePage('practice', 'practice.html', render);
