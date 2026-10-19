/* ===== Firebase : initialisation unique pour tout le site =====

   Module ES, chargé à la demande par import() (access-control.js, puis
   storage.js à la phase 4) : un module n'est exécuté qu'une fois par page,
   quel que soit le nombre de scripts qui l'importent, donc Firebase n'est
   initialisé qu'une seule fois.

   SDK chargé depuis le CDN officiel, version fixée : le site n'a pas d'étape
   de compilation. Le service worker (sw.js) garde ces fichiers en cache pour
   que le site s'ouvre aussi sans réseau. Changer de version = changer
   FIREBASE_SDK ci-dessous ET dans les trois import, rien d'autre (sw.js met en
   cache n'importe quelle version de /firebasejs/).

   La configuration n'est pas un secret : elle identifie le projet, elle ne
   donne aucun droit. La protection vient des domaines autorisés
   (Authentication → Paramètres) et des règles Firestore. */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, getAdditionalUserInfo }
  from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, getDoc, setDoc, deleteField, serverTimestamp, increment }
  from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';

export const FIREBASE_SDK = '12.4.0';

const app = initializeApp({
  apiKey: 'AIzaSyDLzJzJyidqo-9uwi_lYZ7CmaKbUlPYbCo',
  authDomain: 'sciences-immersion-100b1.firebaseapp.com',
  projectId: 'sciences-immersion-100b1',
  storageBucket: 'sciences-immersion-100b1.firebasestorage.app',
  messagingSenderId: '176011164728',
  appId: '1:176011164728:web:d88f5e397c391392493acd'
});

// Session gardée dans IndexedDB (réglage par défaut de getAuth) : l'élève
// reste connecté d'une page à l'autre et d'une visite à l'autre, même hors
// ligne.
export const auth = getAuth(app);

// Firestore avec cache persistant sur l'appareil (IndexedDB) : les pages
// relisent le travail de l'élève même sans wifi, et les écritures faites hors
// ligne partent d'elles-mêmes au retour du réseau. Plusieurs onglets ouverts
// partagent le même cache (persistentMultipleTabManager).
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

export { GoogleAuthProvider, signInWithPopup, signOut, getAdditionalUserInfo };
export { doc, getDoc, setDoc, deleteField, serverTimestamp, increment };
