/* ===== Tableau de bord enseignant (dashboard.html) =====

   Réservé aux comptes de la liste des enseignants (Firestore,
   teachers/{adresse}) ; les règles Firestore le garantissent, cette page ne
   fait qu'afficher un message clair aux autres.

   Données lues :
     teachers/{adresse}  { nom }                    liste gérée dans la console
     classes/{id}        { teacher, track }         gérées ici (onglet Classes et élèves)
     students/{adresse}  { prenom, nom, classe }    gérés ici (import collé)
   Les écritures portent updatedAt / updatedBy. Le travail des élèves
   (users/…) n'est jamais modifié ici. */

import * as fb from './firebase-init.js';

const SCHOOL_EMAIL = /^[a-z0-9._-]+@cnddinant\.be$/;
const CLASS_ID = /^[0-9A-Za-z-]{1,12}$/;
const TRACKS = { en: 'Anglais (EN)', nl: 'Néerlandais (NL)' };
const BATCH_MAX = 450; // limite Firestore : 500 opérations par lot

const state = {
  me: '',          // adresse de l'enseignante connectée
  teachers: {},    // adresse → { nom }
  classes: {},     // id → { teacher, track }
  students: {},    // adresse → { prenom, nom, classe }
  importPreview: null
};

const $ = (sel, root = document) => root.querySelector(sel);

function esc(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function setStatus(text, isError) {
  const el = $('#t-status');
  el.textContent = text || '';
  el.classList.toggle('is-error', !!isError);
}

// Champ `nom` de teachers/{adresse} ; tolère une autre casse ou « name »
// (champ créé à la main dans la console).
function teacherName(email) {
  const t = state.teachers[email] || {};
  const key = Object.keys(t).find(k => ['nom', 'name'].includes(k.trim().toLowerCase()));
  return (key && String(t[key]).trim()) || email;
}

function stamp(data) {
  return Object.assign({}, data, { updatedAt: fb.serverTimestamp(), updatedBy: state.me });
}

// Boîte de confirmation de la page (jamais window.confirm).
function confirmBox(text, okLabel) {
  const dialog = $('#t-dialog');
  $('#t-dialog-text').textContent = text;
  $('#t-dialog-ok').textContent = okLabel || 'Confirmer';
  dialog.returnValue = '';
  dialog.showModal();
  return new Promise(resolve => {
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'ok'), { once: true });
  });
}

const byName = (a, b) =>
  (a.nom || '').localeCompare(b.nom || '', 'fr') || (a.prenom || '').localeCompare(b.prenom || '', 'fr');

// Les classes de l'enseignante connectée d'abord, puis les autres.
function sortedClassIds() {
  return Object.keys(state.classes).sort((a, b) => {
    const mineA = state.classes[a].teacher === state.me ? 0 : 1;
    const mineB = state.classes[b].teacher === state.me ? 0 : 1;
    return mineA - mineB || a.localeCompare(b, 'fr', { numeric: true });
  });
}

/* ===== Chargement ===== */

async function loadCollection(name) {
  const snap = await fb.getDocs(fb.collection(fb.db, name));
  const out = {};
  snap.forEach(d => { out[d.id] = d.data(); });
  return out;
}

async function loadAll() {
  const [teachers, classes, students] = await Promise.all(
    ['teachers', 'classes', 'students'].map(loadCollection));
  Object.assign(state, { teachers, classes, students });
}

async function start() {
  await fb.auth.authStateReady();
  const user = fb.auth.currentUser;
  if (!user) {
    setStatus('Connectez-vous d\'abord sur le site avec votre compte de l\'école.', true);
    return;
  }
  state.me = (user.email || '').toLowerCase();
  let isTeacher = false;
  try {
    isTeacher = SCHOOL_EMAIL.test(state.me)
      && (await fb.getDoc(fb.doc(fb.db, 'teachers', state.me))).exists();
  } catch (e) { isTeacher = false; }
  if (!isTeacher) {
    setStatus('Page réservée aux enseignants.', true);
    return;
  }
  try {
    await loadAll();
  } catch (e) {
    console.error(e);
    setStatus('Impossible de charger les données (connexion internet ?). Rechargez la page.', true);
    return;
  }
  $('#t-who').textContent = teacherName(state.me);
  $('#t-tabs').hidden = false;
  setStatus('');
  renderManage();
}

// Après une écriture : on relit tout, l'écran montre ce que Firestore a vraiment.
async function saveThenReload(work, doneText) {
  setStatus('Enregistrement…');
  try {
    await work();
    await loadAll();
    setStatus(doneText || 'Enregistré.');
  } catch (e) {
    console.error(e);
    setStatus('L\'enregistrement a échoué : ' + (e.code || e.message), true);
    try { await loadAll(); } catch (e2) { /* on garde l'affichage */ }
  }
  renderManage();
}

async function commitInBatches(ops) {
  for (let i = 0; i < ops.length; i += BATCH_MAX) {
    const batch = fb.writeBatch(fb.db);
    ops.slice(i, i + BATCH_MAX).forEach(op => op(batch));
    await batch.commit();
  }
}

/* ===== Onglet « Classes et élèves » ===== */

function renderManage() {
  $('#t-view').innerHTML =
    '<section class="t-section" id="t-classes"></section>' +
    '<section class="t-section" id="t-import"></section>' +
    '<section class="t-section" id="t-students"></section>';
  renderClasses();
  renderImport();
  renderStudents();
}

function teacherOptions(selected) {
  return Object.keys(state.teachers).sort().map(email =>
    `<option value="${esc(email)}"${email === selected ? ' selected' : ''}>${esc(teacherName(email))}</option>`
  ).join('');
}

function trackOptions(selected) {
  return Object.keys(TRACKS).map(t =>
    `<option value="${t}"${t === selected ? ' selected' : ''}>${TRACKS[t]}</option>`).join('');
}

function studentsIn(classId) {
  return Object.keys(state.students).filter(e => state.students[e].classe === classId);
}

function renderClasses() {
  const box = $('#t-classes');
  const rows = sortedClassIds().map(id => {
    const c = state.classes[id];
    return `<tr class="${c.teacher === state.me ? 'is-mine' : ''}" data-class="${esc(id)}">
      <td>${esc(id)}</td>
      <td><select data-field="teacher">${teacherOptions(c.teacher)}</select></td>
      <td><select data-field="track">${trackOptions(c.track)}</select></td>
      <td><span class="t-count">${studentsIn(id).length}</span></td>
      <td><button type="button" class="t-btn t-btn-danger" data-action="delete-class">Supprimer</button></td>
    </tr>`;
  }).join('');
  box.innerHTML = `
    <h2>Classes</h2>
    <p class="t-help">Les classes changent chaque année : ajoutez les nouvelles, supprimez les anciennes.
      Supprimer une classe retire aussi ses élèves de la liste ; leur travail n'est jamais effacé.</p>
    <div class="t-scroll"><table class="t-table">
      <thead><tr><th>Classe</th><th>Enseignante</th><th>Filière</th><th>Élèves</th><th></th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5" class="t-muted">Aucune classe.</td></tr>'}</tbody>
    </table></div>
    <div class="t-form-row">
      <input type="text" id="t-new-class" placeholder="Nom (ex. 1C)" maxlength="12" size="10" />
      <select id="t-new-teacher">${teacherOptions(state.me)}</select>
      <select id="t-new-track">${trackOptions('en')}</select>
      <button type="button" class="t-btn t-btn-primary" id="t-add-class">Ajouter la classe</button>
    </div>`;

  box.querySelectorAll('tr[data-class] select').forEach(sel => {
    sel.addEventListener('change', () => {
      const id = sel.closest('tr').dataset.class;
      const c = Object.assign({}, state.classes[id], { [sel.dataset.field]: sel.value });
      saveThenReload(() => fb.setDoc(fb.doc(fb.db, 'classes', id),
        stamp({ teacher: c.teacher, track: c.track })), `Classe ${id} modifiée.`);
    });
  });

  box.querySelectorAll('[data-action="delete-class"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.closest('tr').dataset.class;
      const members = studentsIn(id);
      const text = members.length
        ? `Supprimer la classe ${id} et retirer ses ${members.length} élève(s) de la liste ? Leur travail reste enregistré.`
        : `Supprimer la classe ${id} ?`;
      if (!(await confirmBox(text, 'Supprimer'))) return;
      saveThenReload(() => commitInBatches(
        members.map(email => b => b.delete(fb.doc(fb.db, 'students', email)))
          .concat([b => b.delete(fb.doc(fb.db, 'classes', id))])
      ), `Classe ${id} supprimée.`);
    });
  });

  $('#t-add-class').addEventListener('click', () => {
    const id = $('#t-new-class').value.trim().toUpperCase();
    if (!CLASS_ID.test(id)) { setStatus('Nom de classe : lettres, chiffres ou tiret, 12 caractères au plus.', true); return; }
    if (state.classes[id]) { setStatus(`La classe ${id} existe déjà.`, true); return; }
    saveThenReload(() => fb.setDoc(fb.doc(fb.db, 'classes', id),
      stamp({ teacher: $('#t-new-teacher').value, track: $('#t-new-track').value })), `Classe ${id} ajoutée.`);
  });
}

function renderStudents() {
  const box = $('#t-students');
  const classIds = sortedClassIds();
  const classOptions = selected => classIds.map(id =>
    `<option value="${esc(id)}"${id === selected ? ' selected' : ''}>${esc(id)}</option>`).join('');
  const groups = classIds.map(id => {
    const list = studentsIn(id).map(email => Object.assign({ email }, state.students[email])).sort(byName);
    if (!list.length) return '';
    const rows = list.map(s => `<tr data-email="${esc(s.email)}">
      <td>${esc(s.nom)}</td><td>${esc(s.prenom)}</td><td class="t-muted">${esc(s.email)}</td>
      <td><select data-field="classe">${classOptions(s.classe)}</select></td>
      <td><button type="button" class="t-btn t-btn-danger" data-action="remove-student">Retirer</button></td>
    </tr>`).join('');
    const c = state.classes[id];
    return `<h3>${esc(id)} <span class="t-muted">— ${esc(teacherName(c.teacher))}, ${TRACKS[c.track] || ''}</span></h3>
      <div class="t-scroll"><table class="t-table">
        <thead><tr><th>Nom</th><th>Prénom</th><th>Adresse</th><th>Classe</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>`;
  }).join('');
  box.innerHTML = `
    <h2>Élèves <span class="t-count">${Object.keys(state.students).length}</span></h2>
    <p class="t-help">Changer la classe d'un élève ou le retirer de la liste ne touche pas à son travail.</p>
    ${groups || '<p class="t-muted">Aucun élève : utilisez l\'import ci-dessus.</p>'}`;

  box.querySelectorAll('tr[data-email] select').forEach(sel => {
    sel.addEventListener('change', () => {
      const email = sel.closest('tr').dataset.email;
      const s = state.students[email];
      saveThenReload(() => fb.setDoc(fb.doc(fb.db, 'students', email),
        stamp({ prenom: s.prenom, nom: s.nom, classe: sel.value })), `${s.prenom} ${s.nom} : classe ${sel.value}.`);
    });
  });

  box.querySelectorAll('[data-action="remove-student"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const email = btn.closest('tr').dataset.email;
      const s = state.students[email];
      if (!(await confirmBox(`Retirer ${s.prenom} ${s.nom} de la liste ? Son travail reste enregistré.`, 'Retirer'))) return;
      saveThenReload(() => commitInBatches([b => b.delete(fb.doc(fb.db, 'students', email))]),
        `${s.prenom} ${s.nom} retiré(e) de la liste.`);
    });
  });
}

/* ===== Import collé depuis le tableur =====
   Lignes copiées dans Google Sheets (colonnes séparées par des tabulations),
   ou CSV avec ; ou , . Colonnes attendues : adresse, prénom, nom, classe —
   dans cet ordre, ou dans n'importe quel ordre si la ligne d'en-tête est
   collée aussi (Email, Prenom, Nom, Classe). */

const HEADER_ALIASES = {
  email: ['email', 'e-mail', 'mail', 'adresse'],
  prenom: ['prenom', 'prénom', 'first name', 'firstname'],
  nom: ['nom', 'last name', 'lastname', 'name'],
  classe: ['classe', 'class']
};

function splitLine(line) {
  const sep = line.includes('\t') ? '\t' : (line.includes(';') ? ';' : ',');
  return line.split(sep).map(cell => cell.trim().replace(/^"(.*)"$/, '$1').trim());
}

function parsePaste(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  let columns = { email: 0, prenom: 1, nom: 2, classe: 3 };
  if (lines.length && !lines[0].includes('@')) {
    const header = splitLine(lines.shift()).map(h => h.toLowerCase());
    const found = {};
    Object.keys(HEADER_ALIASES).forEach(key => {
      const i = header.findIndex(h => HEADER_ALIASES[key].includes(h));
      if (i >= 0) found[key] = i;
    });
    if (Object.keys(found).length === 4) columns = found;
  }
  const classIdFor = raw => Object.keys(state.classes).find(id => id.toLowerCase() === raw.toLowerCase());
  const seen = new Set();
  const rows = [];
  const errors = [];
  lines.forEach((line, i) => {
    const cells = splitLine(line);
    const email = (cells[columns.email] || '').toLowerCase();
    const prenom = cells[columns.prenom] || '';
    const nom = cells[columns.nom] || '';
    const rawClass = cells[columns.classe] || '';
    const label = `Ligne ${i + 1} (${email || 'sans adresse'})`;
    if (!SCHOOL_EMAIL.test(email)) { errors.push(`${label} : adresse absente ou pas en @cnddinant.be`); return; }
    if (seen.has(email)) { errors.push(`${label} : adresse en double dans le collage`); return; }
    if (!prenom || !nom) { errors.push(`${label} : prénom ou nom manquant`); return; }
    if (prenom.length > 60 || nom.length > 60) { errors.push(`${label} : prénom ou nom trop long`); return; }
    const classe = classIdFor(rawClass);
    if (!classe) { errors.push(`${label} : classe « ${rawClass} » inconnue (ajoutez-la d'abord)`); return; }
    seen.add(email);
    rows.push({ email, prenom, nom, classe });
  });

  const added = [];
  const changed = [];
  let unchanged = 0;
  rows.forEach(r => {
    const old = state.students[r.email];
    if (!old) added.push(r);
    else if (old.classe !== r.classe || old.prenom !== r.prenom || old.nom !== r.nom) changed.push(Object.assign({ old }, r));
    else unchanged++;
  });
  const absent = Object.keys(state.students).filter(e => !seen.has(e))
    .map(email => Object.assign({ email }, state.students[email])).sort(byName);
  return { added, changed, unchanged, errors, absent };
}

function renderImport() {
  const box = $('#t-import');
  box.innerHTML = `
    <h2>Importer des élèves</h2>
    <p class="t-help">Dans le tableur, sélectionnez les lignes (avec ou sans la ligne d'en-tête) :
      adresse, prénom, nom, classe. Copiez (Ctrl+C), collez ici (Ctrl+V), puis « Analyser ».
      Rien n'est enregistré avant la confirmation.</p>
    <textarea id="t-paste" spellcheck="false" placeholder="prenom.nom@cnddinant.be&#9;Prénom&#9;Nom&#9;1C"></textarea>
    <div class="t-form-row">
      <button type="button" class="t-btn t-btn-primary" id="t-analyse">Analyser</button>
    </div>
    <div id="t-preview"></div>`;
  $('#t-analyse').addEventListener('click', () => {
    state.importPreview = parsePaste($('#t-paste').value);
    renderPreview();
  });
}

function renderPreview() {
  const p = state.importPreview;
  const box = $('#t-preview');
  const person = s => `${esc(s.prenom)} ${esc(s.nom)} <span class="t-muted">${esc(s.email)}</span>`;
  const group = (title, count, body, cls) => `<div class="t-preview-group ${cls || ''}">
    <h3>${title} <span class="t-count">${count}</span></h3>${body}</div>`;
  const list = items => items.length ? `<ul>${items.join('')}</ul>` : '';

  let html = '';
  html += group('Nouveaux', p.added.length, list(p.added.map(s => `<li>${person(s)} → ${esc(s.classe)}</li>`)));
  html += group('Modifiés', p.changed.length, list(p.changed.map(s => {
    const what = s.old.classe !== s.classe ? `classe ${esc(s.old.classe)} → ${esc(s.classe)}` : 'nom ou prénom corrigé';
    return `<li>${person(s)} : ${what}</li>`;
  })));
  html += group('Inchangés', p.unchanged, '');
  if (p.errors.length) {
    html += group('Lignes ignorées', p.errors.length, list(p.errors.map(e => `<li>${esc(e)}</li>`)), 'is-error');
  }
  if (p.absent.length) {
    html += group('Dans la liste mais absents du collage', p.absent.length,
      `<p class="t-help">Gardés par défaut (vous avez peut-être collé une seule classe).
        Cochez ceux à retirer de la liste ; leur travail reste enregistré.</p>
       <label><input type="checkbox" id="t-absent-all" /> Tout cocher</label>
       <ul>${p.absent.map(s => `<li><label><input type="checkbox" data-absent="${esc(s.email)}" />
         ${person(s)} (${esc(s.classe)})</label></li>`).join('')}</ul>`);
  }
  const total = p.added.length + p.changed.length;
  html += `<div class="t-form-row">
    <button type="button" class="t-btn t-btn-primary" id="t-commit">Enregistrer</button>
    <span class="t-muted" id="t-commit-summary"></span></div>`;
  box.innerHTML = html;

  const summary = () => {
    const removed = box.querySelectorAll('[data-absent]:checked').length;
    $('#t-commit-summary').textContent =
      `${total} ajout(s) ou modification(s)` + (removed ? `, ${removed} retrait(s)` : '');
    $('#t-commit').disabled = !(total || removed);
  };
  const all = $('#t-absent-all');
  if (all) all.addEventListener('change', () => {
    box.querySelectorAll('[data-absent]').forEach(c => { c.checked = all.checked; });
    summary();
  });
  box.querySelectorAll('[data-absent]').forEach(c => c.addEventListener('change', summary));
  summary();

  $('#t-commit').addEventListener('click', () => {
    const removed = Array.from(box.querySelectorAll('[data-absent]:checked')).map(c => c.dataset.absent);
    const ops = p.added.concat(p.changed).map(s => b => b.set(fb.doc(fb.db, 'students', s.email),
      stamp({ prenom: s.prenom, nom: s.nom, classe: s.classe })))
      .concat(removed.map(email => b => b.delete(fb.doc(fb.db, 'students', email))));
    state.importPreview = null;
    saveThenReload(() => commitInBatches(ops),
      `Import enregistré : ${total} ajout(s) ou modification(s), ${removed.length} retrait(s).`);
  });
}

start().catch(e => {
  console.error(e);
  setStatus('Le tableau de bord n\'a pas pu démarrer (connexion internet ?).', true);
});
