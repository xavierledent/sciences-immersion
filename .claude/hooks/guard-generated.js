// PreToolUse hook (Edit|Write): refuses direct edits to the generated chapter
// pages and points to the template instead. These 60 files are rewritten by
// tools/generate-all.js, so a hand edit would be lost at the next generation.
// index.html is not covered: only a few marked lines of it are generated.
//
// Reads the hook payload on stdin; prints a "deny" decision or nothing.

const GENERATED = /(?:^|\/)(en\/year\d+|nl\/jaar\d+)\/[^/]+\/(vocabulary|practice|resources|explorations|assessment)\.html$/i;

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { raw += chunk; });
process.stdin.on('end', () => {
  let filePath = '';
  try {
    filePath = String((JSON.parse(raw).tool_input || {}).file_path || '');
  } catch (e) {
    return; // unreadable payload: never block on the hook's own failure
  }

  const match = filePath.replace(/\\/g, '/').match(GENERATED);
  if (!match) return;

  const pageType = match[2].toLowerCase();
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        `Page générée : ${pageType}.html ne se modifie pas à la main. ` +
        `Modifier templates/${pageType}.en.html et templates/${pageType}.nl.html ` +
        '(ou tools/chapters.json pour un titre), puis lancer node tools/generate-all.js ' +
        'et node tools/check.js.'
    }
  }));
});
