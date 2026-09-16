// Regenerates the 12 chapter vocabulary.html pages from
// templates/vocabulary.{en,nl}.html + tools/chapters.json.
//
// Usage: node tools/generate-vocabulary.js [--check]

const { generatePage } = require('./lib/render');

function render(template, chapter, lang) {
  return template
    .replace(/\{\{TITLE_SUFFIX\}\}/g, chapter.titleSuffix)
    .replace(/\{\{SUBJECT_CLASS\}\}/g, chapter.subjectClass)
    .replace(/\{\{H1\}\}/g, chapter.h1[lang])
    .replace(/\{\{VOCAB_TOPIC\}\}/g, chapter.vocabTopic[lang]);
}

generatePage('vocabulary', 'vocabulary.html', render);
