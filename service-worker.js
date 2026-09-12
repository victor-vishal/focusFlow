const CACHE_NAME = 'focusflow-v4';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/quotes.js',
    './js/settings.js',
    './js/sounds.js',
    './js/tasks.js',
    './js/theme.js',
    './js/timer.js',
    './js/tracker.js',
    './assets/favicon.svg'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Network-first strategy: always try network, fall back to cache for offline
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then(response => {
                // Clone and cache the fresh response
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(e.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Network failed, serve from cache (offline mode)
                return caches.match(e.request);
            })
    );
});
