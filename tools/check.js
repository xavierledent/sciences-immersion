// The one command to run before committing: every check this repo has, in one
// go. Writes nothing.
//
// Usage: node tools/check.js
//
//   1. generate-all.js --check  generated pages still match templates/ and
//                               tools/chapters.json (no stray hand-edit)
//   2. validate-content.js      chapter JSON files are sound
//
// Exits non-zero if either step fails.

const { spawnSync } = require('child_process');
const path = require('path');

const STEPS = [
  { title: 'Pages générées', script: 'generate-all.js', args: ['--check'] },
  { title: 'Contenu des chapitres', script: 'validate-content.js', args: [] }
];

const results = STEPS.map(step => {
  console.log(`\n########## ${step.title} ##########`);
  const run = spawnSync(process.execPath, [path.join(__dirname, step.script), ...step.args], { stdio: 'inherit' });
  return { title: step.title, ok: run.status === 0 };
});

console.log('\n########## Bilan ##########');
results.forEach(result => console.log(`  ${result.ok ? 'OK    ' : 'ÉCHEC '} ${result.title}`));
process.exitCode = results.every(result => result.ok) ? 0 : 1;
