// Regenerates the two chapter lists of index.html (one per language) from
// tools/chapters.json, so a chapter title lives in one place only. Unlike the
// chapter pages, index.html stays hand-written: only the lines between the
// "// <chapters:en>" ... "// </chapters:en>" markers (and their nl twins) are
// replaced, everything else is left untouched.
//
// Usage: node tools/generate-index.js [--check]
//   (no flag)  rewrites the marked blocks of index.html
//   --check    writes nothing; exits non-zero if index.html would change

const fs = require('fs');
const path = require('path');
const { loadChapters, ROOT } = require('./lib/render');

const INDEX_PATH = path.join(ROOT, 'index.html');
const checkOnly = process.argv.includes('--check');

function jsString(text) {
  return "'" + text.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function renderBlock(html, chapters, lang) {
  const block = new RegExp(`^([ \\t]*)(// <chapters:${lang}>[^\\r\\n]*)(\\r?\\n)[\\s\\S]*?^[ \\t]*// </chapters:${lang}>`, 'm');
  if (!block.test(html)) throw new Error(`Markers "// <chapters:${lang}>" not found in index.html`);

  return html.replace(block, (match, indent, openMarker, eol) => {
    const entries = chapters.map(chapter =>
      `${indent}{ folder: ${jsString(chapter.folder)}, title: ${jsString(chapter.h1[lang])}, hasAssessment: ${chapter.hasAssessment !== false} }`
    );
    return [indent + openMarker, entries.join(',' + eol), `${indent}// </chapters:${lang}>`].join(eol);
  });
}

const current = fs.readFileSync(INDEX_PATH, 'utf8');
const chapters = loadChapters();
const output = ['en', 'nl'].reduce((html, lang) => renderBlock(html, chapters, lang), current);

if (checkOnly) {
  const matches = output === current;
  console.log(matches ? 'index.html matches tools/chapters.json.' : 'DIFFERS: index.html');
  process.exitCode = matches ? 0 : 1;
} else if (output === current) {
  console.log('index.html already up to date.');
} else {
  fs.writeFileSync(INDEX_PATH, output, 'utf8');
  console.log('Wrote index.html');
}
