// Service Worker — AnimeKu PWA
const CACHE = 'animeku-v1';
const ASSETS = [
  './home.html',
  './style.css',
  './script.js',
  './login.html',
  './manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Hanya cache GET requests ke aset lokal
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('api.jikan.moe')) return; // Jangan cache API

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
