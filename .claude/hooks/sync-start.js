// SessionStart hook (startup|resume): le dépôt local est-il à jour avec GitHub ?
// Interroge origin (git fetch, court délai, sans demande d'identifiants), puis :
//   - à jour, ou commits locaux pas encore poussés : le dit ;
//   - en retard, sur main, sans modification locale : git pull --ff-only
//     (jamais de fusion ni de rebase) et dit ce qui est arrivé ;
//   - en retard avec des modifications locales, branches divergentes, autre
//     branche, hors ligne : ne touche à rien et le signale.
// Sortie : un message pour l'enseignant (systemMessage) et le même pour
// Claude (additionalContext). Ne bloque jamais la session.

const { execFileSync } = require('child_process');

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const env = Object.assign({}, process.env, { GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' });

function git(args, timeout) {
  return execFileSync('git', args, { cwd, env, timeout: timeout || 10000, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

// Rappels pour l'enseignant (docs/rappels.md, lignes « - … ») : ajoutés au
// message, et Claude les présente en début de session.
function reminders() {
  try {
    const text = require('fs').readFileSync(require('path').join(cwd, 'docs', 'rappels.md'), 'utf8');
    return text.split('\n').filter(l => /^- /.test(l));
  } catch (e) {
    return [];
  }
}

function done(text, warn) {
  const msg = `${warn ? '⚠ ' : ''}Dépôt : ${text}`;
  const notes = reminders();
  const shown = notes.length ? `${msg}\n\nRappels (docs/rappels.md) :\n${notes.join('\n')}` : msg;
  const forClaude = notes.length ? `${shown}\n\nPrésente ces rappels à l'enseignant au début de ta première réponse, avant tout le reste.` : msg;
  process.stdout.write(JSON.stringify({
    systemMessage: shown,
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: forClaude }
  }));
  process.exit(0);
}

const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;

try {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  try {
    git(['fetch', '--quiet', 'origin'], 15000);
  } catch (e) {
    done(`impossible de joindre GitHub (hors ligne ?) : l'état par rapport à GitHub n'est pas vérifié (branche ${branch}).`, true);
  }

  let upstream;
  try {
    upstream = git(['rev-parse', '--abbrev-ref', '@{u}']);
  } catch (e) {
    done(`la branche ${branch} ne suit aucune branche de GitHub : rien n'est comparé.`, true);
  }

  const [ahead, behind] = git(['rev-list', '--left-right', '--count', `HEAD...${upstream}`]).split(/\s+/).map(Number);
  const dirty = git(['status', '--porcelain', '--untracked-files=no']).split('\n').filter(Boolean).length;
  const local = dirty ? ` ${plural(dirty, 'fichier modifié', 'fichiers modifiés')} en local, pas encore commité${dirty > 1 ? 's' : ''}.` : '';
  const other = branch !== 'main' ? ` Attention : branche ${branch}, pas main.` : '';

  if (!behind && !ahead) done(`à jour avec GitHub (${branch}).${local}${other}`, !!other);
  if (!behind) done(`${plural(ahead, 'commit local pas encore poussé', 'commits locaux pas encore poussés')} sur GitHub (${branch}).${local}${other}`, true);
  if (ahead) done(`la branche ${branch} et GitHub ont divergé (${ahead} commit(s) ici, ${behind} sur GitHub). Rien n'a été touché : à régler avant de travailler.${local}`, true);
  if (branch !== 'main' || dirty) {
    done(`GitHub a ${plural(behind, 'commit', 'commits')} de plus (${branch}). Pas de mise à jour automatique :${dirty ? local : ''}${other || ''} À mettre à jour avant de travailler.`, true);
  }

  const before = git(['rev-parse', 'HEAD']);
  try {
    git(['pull', '--ff-only', '--quiet'], 30000);
  } catch (e) {
    done(`GitHub a ${plural(behind, 'commit', 'commits')} de plus, mais la mise à jour a échoué (${String(e.stderr || e.message).split('\n')[0].trim()}). Rien n'a été changé.`, true);
  }
  const subjects = git(['log', '--format=- %s', `${before}..HEAD`]).split('\n').slice(0, 5);
  const more = behind > 5 ? `\n- … et ${behind - 5} de plus` : '';
  done(`mis à jour depuis GitHub (${plural(behind, 'commit récupéré', 'commits récupérés')}) :\n${subjects.join('\n')}${more}`, false);
} catch (e) {
  done(`vérification impossible (${String(e.message).split('\n')[0]}).`, true);
}
