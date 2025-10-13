"use client";

let loadingPromise = null;

async function loadFirebaseCompat() {
  if (typeof window === "undefined") return null;
  if (window.firebase && window.firebase.messaging) return window.firebase;
  if (!loadingPromise) {
    loadingPromise = new Promise((resolve, reject) => {
      const app = document.createElement("script");
      app.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
      app.onload = () => {
        const msg = document.createElement("script");
        msg.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js";
        msg.onload = () => resolve(window.firebase);
        msg.onerror = reject;
        document.head.appendChild(msg);
      };
      app.onerror = reject;
      document.head.appendChild(app);
    });
  }
  return loadingPromise;
}

export async function initMessaging() {
  const firebase = await loadFirebaseCompat();
  if (!firebase) return null;
  const cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
  if (!cfg.apiKey) return null;
  if (!firebase.apps?.length) firebase.initializeApp(cfg);
  const messaging = firebase.messaging();
  // Usa o Service Worker já existente do PWA (unificado)
  let swReg = null;
  try {
    // Em desenvolvimento, next-pwa pode estar desabilitado; 'ready' pode nunca resolver.
    // Por isso, aguardamos com timeout curto e fazemos fallback sem SW.
    const ready = new Promise((res) => {
      if (navigator.serviceWorker?.ready) {
        navigator.serviceWorker.ready.then(res).catch(() => res(null));
      } else {
        res(null);
      }
    });
    swReg = await Promise.race([
      ready,
      new Promise((r) => setTimeout(() => r(null), 800)),
    ]);
  } catch {}
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  const opts = { vapidKey };
  if (swReg) opts.serviceWorkerRegistration = swReg;
  const token = await messaging.getToken(opts).catch(() => null);

  // Foreground messages → show a toast
  messaging.onMessage((payload) => {
    const title = payload?.notification?.title || "Aviso";
    const body = payload?.notification?.body || "";
    window.dispatchEvent(new CustomEvent("toast", { detail: { text: `${title}: ${body}` } }));
  });
  return token;
}
