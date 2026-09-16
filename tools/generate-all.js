// Runs every tools/generate-*.js script in one go.
//
// Usage: node tools/generate-all.js [--check]

const { execFileSync } = require('child_process');
const path = require('path');

const PAGE_TYPES = ['practice', 'vocabulary', 'resources', 'explorations', 'assessment'];
const checkOnly = process.argv.includes('--check');
let anyFailed = false;

PAGE_TYPES.forEach(type => {
  const script = path.join(__dirname, `generate-${type}.js`);
  console.log(`\n=== ${type} ===`);
  try {
    const args = checkOnly ? [script, '--check'] : [script];
    execFileSync(process.execPath, args, { stdio: 'inherit' });
  } catch (e) {
    anyFailed = true;
  }
});

if (checkOnly) {
  console.log(anyFailed ? '\nSome pages differ from their templates.' : '\nAll pages match their templates.');
}
process.exitCode = anyFailed ? 1 : 0;
