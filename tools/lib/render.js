// Shared machinery for every tools/generate-*.js script: load the chapter
// manifest, render a template for each (language, chapter) pair, write (or
// --check) the 12 output files. Each generate-*.js only supplies the page
// type, the output filename, and its own placeholder substitutions.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const YEAR_FOLDER = { en: 'year1', nl: 'jaar1' };

function loadChapters() {
  const raw = fs.readFileSync(path.join(ROOT, 'tools', 'chapters.json'), 'utf8');
  return JSON.parse(raw).chapters;
}

// CRLF + exactly one trailing newline, matching the rest of this repo's HTML
// files — regardless of what the template itself has on disk (templates are
// authored as plain LF files; only the generated output needs to match).
function normalizeLineEndings(text) {
  return text.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n').replace(/(\r\n)*$/, '\r\n');
}

// pageType: template file prefix, e.g. 'practice' -> templates/practice.en.html
// outputFileName: e.g. 'practice.html'
// renderFn(template, chapter, lang) -> rendered HTML string (before line-ending normalization)
function generatePage(pageType, outputFileName, renderFn) {
  const checkOnly = process.argv.includes('--check');
  const chapters = loadChapters();
  let mismatches = 0;
  let written = 0;

  ['en', 'nl'].forEach(lang => {
    const templatePath = path.join(ROOT, 'templates', `${pageType}.${lang}.html`);
    const template = fs.readFileSync(templatePath, 'utf8');

    chapters.forEach(chapter => {
      const output = normalizeLineEndings(renderFn(template, chapter, lang));
      const outPath = path.join(ROOT, lang, YEAR_FOLDER[lang], chapter.folder, outputFileName);

      if (checkOnly) {
        const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : null;
        if (current !== output) {
          mismatches++;
          console.log('DIFFERS:', path.relative(ROOT, outPath));
        }
      } else {
        fs.writeFileSync(outPath, output, 'utf8');
        written++;
        console.log('Wrote', path.relative(ROOT, outPath));
      }
    });
  });

  if (checkOnly) {
    const total = Object.keys(YEAR_FOLDER).length * chapters.length;
    console.log(mismatches === 0 ? `All ${total} files match the templates.` : `${mismatches} file(s) differ from the templates.`);
    process.exitCode = mismatches === 0 ? 0 : 1;
  } else {
    console.log(`${written} file(s) written.`);
  }
}

module.exports = { generatePage, loadChapters, ROOT, YEAR_FOLDER };
