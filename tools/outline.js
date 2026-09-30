// Prints the table of contents of a JS or CSS source file: its "===== ... ====="
// section banners and, for JS, every function with its line number and length.
// Meant to find where something lives in the big engines (practice-engine.js is
// ~4,400 lines) without reading them top to bottom. Computed from the file on
// each run, so it can never go stale the way a hand-written map would.
//
// Usage: node tools/outline.js <file> [filter]
//   <file>    path from the repo root, e.g. practice-engine.js
//   [filter]  case-insensitive text; keeps only the matching entries. For CSS,
//             selectors are only listed when a filter is given — there are too
//             many otherwise.
//
// Examples:
//   node tools/outline.js practice-engine.js
//   node tools/outline.js practice-engine.js dnd
//   node tools/outline.js practice-engine.css overview

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const [file, filter] = process.argv.slice(2);

if (!file) {
  console.log('Usage: node tools/outline.js <file> [filter]');
  process.exit(1);
}

const filePath = path.resolve(ROOT, file);
const isCss = path.extname(filePath).toLowerCase() === '.css';
if (!fs.existsSync(filePath)) {
  console.log(`File not found: ${path.relative(ROOT, filePath)}`);
  process.exit(1);
}
const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

const BANNER = /^\s*\/\*\s*=+\s*(.+?)\s*=*\s*(\*\/)?\s*$/;
const FUNCTION = /^(\s*)(?:async\s+)?function\s+(\w+)\s*\(/;
const ARROW = /^(\s*)(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>/;
const SELECTOR = /^(\s*)([^@\s/*}][^{}]*?)\s*\{\s*$/;

const entries = [];
lines.forEach((text, i) => {
  const banner = text.match(BANNER);
  if (banner) {
    entries.push({ kind: 'section', line: i + 1, indent: 0, name: banner[1] });
    return;
  }
  const item = isCss ? text.match(SELECTOR) : (text.match(FUNCTION) || text.match(ARROW));
  if (item) entries.push({ kind: 'item', line: i + 1, indent: item[1].length, name: item[2] });
});

// An item runs until the next entry that is not nested inside it. Close enough
// to tell a 5-line helper from a 200-line renderer before opening it.
entries.forEach((entry, i) => {
  const next = entries.slice(i + 1).find(e => e.kind === 'section' || e.indent <= entry.indent);
  entry.length = (next ? next.line : lines.length + 1) - entry.line;
});

const needle = filter ? filter.toLowerCase() : null;
const baseIndent = Math.min(...entries.filter(e => e.kind === 'item').map(e => e.indent), Infinity);
let shown = 0;

console.log(`${path.relative(ROOT, filePath)} — ${lines.length} lines`);
entries.forEach(entry => {
  if (needle && !entry.name.toLowerCase().includes(needle)) return;
  if (entry.kind === 'section') {
    console.log(`\n${String(entry.line).padStart(5)}  ===== ${entry.name}`);
    shown++;
    return;
  }
  if (isCss && !needle) return;
  const nesting = '  '.repeat(Math.max(0, Math.round((entry.indent - baseIndent) / 2)));
  console.log(`${String(entry.line).padStart(5)}  ${nesting}${entry.name}  (${entry.length})`);
  shown++;
});

if (shown === 0) console.log(needle ? `\nNothing matches "${filter}".` : '\nNo section banner or function found.');
