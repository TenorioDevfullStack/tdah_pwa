// Firebase Messaging SW (compat)
// 1) Preencha as variáveis abaixo com suas credenciais Firebase.
// 2) Esse arquivo deve estar em /firebase-messaging-sw.js na raiz pública.

importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

// Preencha com suas variáveis (ou gere via build)
const firebaseConfig = {
  apiKey: "AIzaSyAA7_fpLgIKzeZv3H3E4RzpND2q8LsWZwI",
  authDomain: "tdah-pwa.firebaseapp.com",
  projectId: "tdah-pwa",
  storageBucket: "tdah-pwa.firebasestorage.app",
  messagingSenderId: "361437071193",
  appId: "1:361437071193:web:30168c0730f12689472e48",
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = payload?.notification?.title || "Notificação";
    const options = {
      body: payload?.notification?.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: payload?.data || {},
    };
    self.registration.showNotification(title, options);
  });
} catch (e) {
  // No-op
}

// Também reage a push genérico (fallback)
self.addEventListener("push", (event) => {
  try {
    const data = event.data?.json() || {};
    const title = data.title || "Notificação";
    const options = { body: data.body || "", icon: "/icons/icon-192.png" };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {}
});
