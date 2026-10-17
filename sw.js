/* BM-Trainer – Service Worker: App offline verfügbar machen */
const CACHE = 'bm-trainer-v14';
const FILES = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest',
  'js/core.js', 'js/app.js', 'js/data/mathe.js', 'js/data/deutsch.js', 'js/data/englisch.js', 'js/data/hoeren.js', 'js/data/reglement.js', 'js/data/sprueche.js', 'js/speech.js', 'js/writing.js', 'js/data/italienisch.js', 'js/data/originale.js', 'js/motivation.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Netz zuerst (damit Updates sofort ankommen), sonst Cache */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
