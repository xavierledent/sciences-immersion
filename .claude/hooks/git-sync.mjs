// Hook Claude Code : garder un dossier synchronisé avec GitHub, d'un PC à l'autre.
//
//   node git-sync.mjs start [--no-pull]                 hook SessionStart (startup|resume)
//   node git-sync.mjs end   [--no-push] [--pas-sur-main] hook SessionEnd
//
// Début de session : git fetch, puis
//   - en retard sur GitHub, sans modification ni commit local : git pull --ff-only
//     (jamais de fusion ni de rebase ; désactivé par --no-pull) ;
//   - sinon, signale ce qui cloche : retard, avance, divergence, fichiers non commités,
//     branches claude/* laissées par des sessions cloud, échec de la sauvegarde de fin
//     de la session précédente sur ce PC.
//   Ajoute les rappels de docs/rappels.md (lignes « - … ») s'il y en a.
//   Le message va à l'utilisateur (systemMessage) et à Claude (additionalContext).
//
// Fin de session : Claude Code laisse très peu de temps aux hooks SessionEnd, donc le
// script se relance en arrière-plan (mode interne « end-bg ») et rend la main aussitôt.
// En arrière-plan : git add -A (le .gitignore est respecté), commit « Sauvegarde auto fin
// de session (machine, date) », puis push vers la branche suivie (jamais de force : si
// GitHub a avancé, le push est refusé et c'est signalé). Le résultat est noté dans
// .git/claude-sync.json et annoncé au début de la session suivante sur ce PC.
//   --no-push      : commit seulement ;
//   --pas-sur-main : rien n'est commité sur main ou master (dépôt partagé).
//
// Ne bloque jamais la session : toute erreur est signalée, jamais levée.
// Même fichier dans Math, Formation et Site sciences (.claude/hooks/git-sync.mjs) et
// dans ~/.claude/hooks/git-sync.mjs (utilisé par Kitschool) : modifier partout.

import { execFileSync, spawn } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { hostname } from 'node:os';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [mode = 'start', ...flags] = process.argv.slice(2);
const opt = f => flags.includes(f);
const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const env = { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' };
const machine = process.env.CLAUDE_CODE_REMOTE === 'true' ? 'session cloud' : hostname();

function git(args, timeout = 10000) {
  return execFileSync('git', args, {
    cwd, env, timeout, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}
// Renvoie null au lieu de lever une erreur (y compris code de sortie non nul).
function essai(args, timeout) {
  try { return git(args, timeout); } catch { return null; }
}
// Première ligne utile d'une erreur git (sans les « hint: »).
function erreur(e) {
  const txt = String((e && (e.stderr || e.message)) || e);
  return txt.split('\n').map(s => s.trim()).find(s => s && !s.startsWith('hint:')) || 'erreur inconnue';
}
const plural = (n, un, plusieurs) => `${n} ${n > 1 ? plusieurs : un}`;
const dateFr = () => new Date().toLocaleString('fr-BE', { dateStyle: 'short', timeStyle: 'short' });
const lignesDe = s => (s || '').split('\n').filter(Boolean);
const journal = () => join(git(['rev-parse', '--absolute-git-dir']), 'claude-sync.json');

// ---------------------------------------------------------------- début de session
function demarrer() {
  const lignes = [];
  let alerte = false;
  const info = t => lignes.push(t);
  const warn = t => { lignes.push('⚠ ' + t); alerte = true; };

  // Sauvegarde de fin de la session précédente sur ce PC.
  try {
    const f = journal();
    if (existsSync(f)) {
      const j = JSON.parse(readFileSync(f, 'utf8'));
      (j.ok ? info : warn)(`fin de la session précédente (${j.quand}) : ${j.texte}`);
      unlinkSync(f);
    }
  } catch { /* journal illisible : on l'ignore */ }

  const branche = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const modifs = lignesDe(git(['status', '--porcelain'])).length;

  if (!lignesDe(essai(['remote'])).includes('origin')) {
    warn('ce dossier n\'est relié à aucun dépôt GitHub (pas de remote « origin »).');
  } else {
    let enLigne = true;
    try { git(['fetch', '--quiet', '--prune', 'origin'], 20000); } catch {
      enLigne = false;
      warn(`GitHub injoignable (hors ligne ?) : l'état par rapport à GitHub n'est pas vérifié (${branche}).`);
    }
    if (enLigne) {
      const amont = essai(['rev-parse', '--abbrev-ref', '@{u}']);
      if (!amont) {
        warn(`la branche ${branche} ne suit aucune branche de GitHub : rien n'est comparé.`);
      } else {
        const [avance, retard] = git(['rev-list', '--left-right', '--count', `HEAD...${amont}`]).split(/\s+/).map(Number);
        if (!avance && !retard) {
          info(`à jour avec GitHub (${branche}).`);
        } else if (avance && retard) {
          warn(`${branche} et GitHub ont divergé (${avance} commit(s) ici, ${retard} sur GitHub). Rien n'a été touché : à régler avant de travailler.`);
        } else if (avance) {
          warn(`${plural(avance, 'commit local pas encore poussé', 'commits locaux pas encore poussés')} sur GitHub (${branche}).`);
        } else if (modifs || opt('--no-pull')) {
          warn(`GitHub a ${plural(retard, 'commit', 'commits')} de plus que ce dossier (${branche}). Pas de mise à jour automatique (${modifs ? 'des fichiers sont modifiés ici' : 'désactivée pour ce projet'}) : à mettre à jour avant de travailler.`);
        } else {
          const avant = git(['rev-parse', 'HEAD']);
          try {
            git(['pull', '--ff-only', '--quiet'], 60000);
            const sujets = lignesDe(git(['log', '--format=  - %s', `${avant}..HEAD`])).slice(0, 5);
            const plus = retard > 5 ? `\n  - … et ${retard - 5} de plus` : '';
            info(`mis à jour depuis GitHub (${plural(retard, 'commit récupéré', 'commits récupérés')}, ${branche}) :\n${sujets.join('\n')}${plus}`);
          } catch (e) {
            warn(`GitHub a ${plural(retard, 'commit', 'commits')} de plus, mais la mise à jour a échoué (${erreur(e)}). Rien n'a été changé.`);
          }
        }
      }

      // Branche principale de GitHub, quand on travaille sur une autre branche.
      const principale = essai(['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']);
      if (principale && principale !== amont) {
        const n = Number(essai(['rev-list', '--count', `HEAD..${principale}`]) || 0);
        if (n) info(`${principale} a ${plural(n, 'commit', 'commits')} que ${branche} n'a pas encore.`);
      }

      // Branches laissées par des sessions cloud (claude/…) et pas encore fusionnées ici.
      const cloud = [];
      for (const ref of lignesDe(essai(['for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin/claude/']))) {
        if (ref === amont) continue;
        // Déjà dans ce dossier ou déjà dans la branche suivie sur GitHub : rien à signaler.
        const n = Number(essai(['rev-list', '--count', ref, '--not', 'HEAD', ...(amont ? [amont] : [])]) || 0);
        if (n) cloud.push(`${ref.replace(/^origin\//, '')} (${plural(n, 'commit', 'commits')}, ${essai(['log', '-1', '--format=%cd', '--date=format:%d/%m', ref])})`);
      }
      if (cloud.length) {
        warn(`travail de session(s) cloud pas encore fusionné dans ${branche} : ${cloud.join(' ; ')}. À fusionner, ou à supprimer sur GitHub si c'est déjà fait.`);
      }
    }
  }

  if (modifs) {
    warn(`${plural(modifs, 'fichier modifié ou nouveau', 'fichiers modifiés ou nouveaux')} pas encore commité${modifs > 1 ? 's' : ''} (reste d'une session précédente ?).`);
  }

  const nom = basename(cwd);
  let msg = lignes.length === 1 ? `Dépôt ${nom} : ${lignes[0]}` : `Dépôt ${nom} :\n${lignes.map(l => '• ' + l).join('\n')}`;

  // Rappels pour l'utilisateur, s'il y en a (docs/rappels.md, lignes « - … », lu après le pull).
  let rappels = [];
  try { rappels = readFileSync(join(cwd, 'docs', 'rappels.md'), 'utf8').split('\n').filter(l => /^- /.test(l)); } catch { /* pas de rappels */ }
  if (rappels.length) msg += `\n\nRappels (docs/rappels.md) :\n${rappels.join('\n')}`;

  const consignes = [];
  if (alerte) consignes.push('signale les points marqués ⚠ à l\'utilisateur au début de ta première réponse');
  if (rappels.length) consignes.push('présente-lui les rappels au début de ta première réponse, avant tout le reste');
  const pourClaude = consignes.length ? `${msg}\n\n(Hook git-sync : ${consignes.join(' ; ')}.)` : msg;
  process.stdout.write(JSON.stringify({
    systemMessage: msg,
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: pourClaude }
  }));
}

// ---------------------------------------------------------------- fin de session
function lancerSauvegarde() {
  const enfant = spawn(process.execPath, [fileURLToPath(import.meta.url), 'end-bg', ...flags], {
    cwd, env, detached: true, stdio: 'ignore', windowsHide: true
  });
  enfant.unref();
}

function sauvegarder() {
  const res = { quand: `${machine}, ${dateFr()}`, ok: true, texte: '' };
  const fin = () => { try { writeFileSync(journal(), JSON.stringify(res)); } catch { /* rien */ } };
  try {
    const gitDir = git(['rev-parse', '--absolute-git-dir']);
    const branche = git(['rev-parse', '--abbrev-ref', 'HEAD']);
    const modifs = lignesDe(git(['status', '--porcelain'])).length;

    if (['MERGE_HEAD', 'rebase-merge', 'rebase-apply', 'CHERRY_PICK_HEAD'].some(f => existsSync(join(gitDir, f)))) {
      if (!modifs) return;
      res.ok = false; res.texte = 'fusion ou rebase en cours : rien n\'a été commité.'; return fin();
    }
    if (branche === 'HEAD') {
      if (!modifs) return;
      res.ok = false; res.texte = 'aucune branche active (HEAD détachée) : rien n\'a été commité.'; return fin();
    }
    if (opt('--pas-sur-main') && /^(main|master)$/.test(branche)) {
      if (!modifs) return;
      res.ok = false;
      res.texte = `sur ${branche} : pas de sauvegarde automatique dans ce projet partagé, ${plural(modifs, 'fichier', 'fichiers')} non commité${modifs > 1 ? 's' : ''}.`;
      return fin();
    }

    const fait = [];
    if (modifs) {
      git(['add', '-A'], 60000);
      const n = lignesDe(git(['diff', '--cached', '--name-only'])).length;
      if (n) {
        git(['commit', '--quiet', '-m', `Sauvegarde auto fin de session (${machine}, ${dateFr()})`], 60000);
        fait.push(plural(n, 'fichier commité', 'fichiers commités'));
      }
    }

    if (opt('--no-push')) {
      if (fait.length) fait.push('pas de push automatique pour ce projet');
    } else if (lignesDe(essai(['remote'])).includes('origin')) {
      const amont = essai(['rev-parse', '--abbrev-ref', '@{u}']);
      const avance = amont ? Number(essai(['rev-list', '--count', `${amont}..HEAD`]) || 0) : 1;
      if (avance) {
        const [distant, ...reste] = (amont || '').split('/');
        const args = amont ? ['push', '--quiet', distant, `HEAD:${reste.join('/')}`] : ['push', '--quiet', '-u', 'origin', 'HEAD'];
        try {
          git(args, 120000);
          fait.push(`${plural(avance, 'commit poussé', 'commits poussés')} sur GitHub`);
        } catch (e) {
          res.ok = false;
          fait.push(`push refusé par GitHub (${erreur(e)}) : les commits sont restés sur ce PC`);
        }
      }
    }
    if (!fait.length) return;
    res.texte = fait.join(', ') + '.';
  } catch (e) {
    res.ok = false;
    res.texte = `sauvegarde impossible (${erreur(e)}).`;
  }
  fin();
}

// ---------------------------------------------------------------- aiguillage
try {
  if (essai(['rev-parse', '--is-inside-work-tree']) === 'true') {
    if (mode === 'start') demarrer();
    else if (mode === 'end') lancerSauvegarde();
    else if (mode === 'end-bg') sauvegarder();
  }
} catch (e) {
  if (mode === 'start') {
    const msg = `⚠ Dépôt ${basename(cwd)} : vérification impossible (${erreur(e)}).`;
    process.stdout.write(JSON.stringify({ systemMessage: msg, hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: msg } }));
  }
}
process.exitCode = 0;
