/* ===== Tableau de bord : envoi de mails par l'API Gmail =====

   Le mail part du compte de l'enseignante connectée, depuis son navigateur :
   pas de serveur (forfait Spark). Elle donne une fois la permission
   « envoyer des e-mails en votre nom » (fenêtre Google) ; le jeton obtenu
   vaut une heure et reste en mémoire seulement (jamais enregistré). Les
   mails envoyés apparaissent dans ses « Messages envoyés ».

   Client OAuth : celui du projet Firebase (Google Cloud, projet
   sciences-immersion-100b1, « Web client (auto created by Google
   Service) »). L'API Gmail y est activée. Le champ gmail.send n'est pas
   déclaré dans l'écran de consentement (il demanderait une vérification
   par Google) : Google affiche donc « application non validée » à la
   première autorisation — Paramètres avancés → Accéder à… */

const CLIENT_ID = '176011164728-7kehd887d7gtiklri3lnralof4f26t8c.apps.googleusercontent.com';
const SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const GSI_URL = 'https://accounts.google.com/gsi/client';
const SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

let gsiLoading = null;
let token = null; // { value, expires }

function loadGsi() {
  if (window.google && google.accounts && google.accounts.oauth2) return Promise.resolve();
  if (!gsiLoading) {
    gsiLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = GSI_URL;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { gsiLoading = null; reject(new MailError('gsi', 'Le service de connexion Google ne répond pas (connexion internet ?).')); };
      document.head.appendChild(s);
    });
  }
  return gsiLoading;
}

export class MailError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

// Chargé à l'ouverture de l'onglet : la fenêtre Google doit s'ouvrir
// directement sur le clic (sinon le navigateur la bloque).
export function prepareMail() {
  return loadGsi().catch(() => {});
}

export function hasToken() {
  return !!token && token.expires > Date.now() + 60000;
}

/* Jeton d'envoi. À appeler dans le geste de l'enseignante (clic) : ouvre la
   fenêtre Google si besoin. `hint` = son adresse, pour ne pas choisir de
   compte. */
export async function authorize(hint) {
  if (hasToken()) return token.value;
  await loadGsi();
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      hint,
      callback: resp => {
        if (resp.error) { reject(new MailError(resp.error, explain(resp.error))); return; }
        if (!google.accounts.oauth2.hasGrantedAllScopes(resp, SCOPE)) {
          reject(new MailError('scope', 'La permission d\'envoyer des mails n\'a pas été cochée dans la fenêtre Google.'));
          return;
        }
        token = { value: resp.access_token, expires: Date.now() + (Number(resp.expires_in) || 3600) * 1000 };
        resolve(token.value);
      },
      error_callback: err => reject(new MailError(err.type || 'popup', explain(err.type)))
    });
    client.requestAccessToken();
  });
}

function explain(code) {
  if (code === 'popup_failed_to_open') return 'La fenêtre Google a été bloquée par le navigateur : autorisez les fenêtres pop-up pour ce site.';
  if (code === 'popup_closed') return 'La fenêtre Google a été fermée avant la fin.';
  if (code === 'access_denied') return 'La permission a été refusée dans la fenêtre Google.';
  if (code === 'admin_policy_enforced') return 'L\'administrateur Google de l\'école bloque l\'envoi de mails par cette application.';
  return `Autorisation impossible (${code || 'erreur inconnue'}).`;
}

/* ===== Message (MIME, UTF-8) ===== */

function base64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

const header = text => /^[\x20-\x7e]*$/.test(text) ? text : `=?UTF-8?B?${base64Utf8(text)}?=`;
const wrap = b64 => b64.replace(/.{1,76}/g, '$&\r\n');

function mime({ to, toName, subject, text, html }) {
  const boundary = 'part_' + Math.random().toString(36).slice(2);
  return [
    `To: ${toName ? `${header(toName.replace(/["\\]/g, ''))} <${to}>` : to}`,
    `Subject: ${header(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap(base64Utf8(text)),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap(base64Utf8(html)),
    `--${boundary}--`,
    ''
  ].join('\r\n');
}

const base64Url = text => base64Utf8(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/* Envoie un mail. `authorize` doit avoir été appelé dans le clic. */
export async function sendMail(message) {
  if (!hasToken()) throw new MailError('token', 'Autorisation expirée : recliquez sur le bouton d\'envoi.');
  const resp = await fetch(SEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token.value}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: base64Url(mime(message)) })
  });
  if (resp.ok) return resp.json();
  let detail = '';
  try { detail = ((await resp.json()).error || {}).message || ''; } catch (e) { detail = ''; }
  if (resp.status === 401) token = null;
  if (resp.status === 403 && /has not been used|disabled/i.test(detail)) {
    throw new MailError('api', 'L\'API Gmail n\'est pas activée dans le projet Google Cloud.');
  }
  throw new MailError('send', `Gmail a refusé l'envoi (${resp.status}${detail ? ' : ' + detail : ''}).`);
}
