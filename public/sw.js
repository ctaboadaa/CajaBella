// Service worker mínimo: solo existe para que el navegador permita "instalar" la app
// en la pantalla de inicio. A propósito NO cachea nada — esta app depende de datos
// siempre frescos (facturación, servicios), así que cachear respuestas viejas haría
// más daño que bien.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
