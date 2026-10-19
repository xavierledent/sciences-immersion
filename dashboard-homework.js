/* ===== Tableau de bord : onglet « Devoirs » =====

   Pour l'instant : essai de l'envoi de mails (dashboard-mail.js). La
   composition des devoirs, l'envoi aux élèves et le suivi viendront ici. */

import { esc } from './dashboard-ui.js';
import { authorize, sendMail, prepareMail } from './dashboard-mail.js';

export function renderHomeworkView(root, ctx) {
  prepareMail();
  root.innerHTML = `
    <section class="t-section">
      <h2>Essai de l'envoi de mails</h2>
      <p class="t-help">Les devoirs partiront de votre adresse, depuis cette page. Ce bouton vous envoie un mail
        d'essai à vous-même (${esc(ctx.me)}). La première fois, Google demande la permission d'envoyer des mails
        en votre nom et indique « Google n'a pas validé cette application » : cliquez sur
        <strong>Paramètres avancés</strong>, puis sur <strong>Accéder à…</strong>, et cochez la case de l'envoi de mails.</p>
      <p><button type="button" class="t-btn t-btn-primary" id="h-test">M'envoyer un mail d'essai</button></p>
      <p class="t-help" id="h-test-result" role="status"></p>
    </section>`;

  const result = root.querySelector('#h-test-result');
  root.querySelector('#h-test').addEventListener('click', async () => {
    result.classList.remove('is-error');
    result.textContent = 'Autorisation…';
    try {
      await authorize(ctx.me);
      result.textContent = 'Envoi…';
      const link = new URL('en/year1/bio1/practice.html?game=memory-2', location.href).href;
      await sendMail({
        to: ctx.me,
        toName: ctx.myName,
        subject: 'Essai — Sciences en immersion',
        text: `Bonjour,\n\nCe mail d'essai a été envoyé depuis le tableau de bord.\nLien de test : ${link}\n`,
        html: `<p>Bonjour,</p><p>Ce mail d'essai a été envoyé depuis le tableau de bord.</p>
               <p>Lien de test : <a href="${esc(link)}">un jeu de Biology 1</a></p>`
      });
      result.textContent = 'Mail envoyé : regardez votre boîte de réception (et vos Messages envoyés).';
    } catch (e) {
      console.error(e);
      result.classList.add('is-error');
      result.textContent = e.message || 'Envoi impossible.';
    }
  });
}
