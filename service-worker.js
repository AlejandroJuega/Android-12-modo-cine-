const CACHE_NAME = 'cineplus-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/styles/auth.css',
    '/styles/video-player.css',
    '/js/app.js',
    '/js/movie-api.js',
    '/js/auth.js',
    '/js/music-player.js',
    '/js/video-player.js',
    '/js/watch-progress.js',
    '/js/language-manager.js',
    '/js/app-detection.js',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});
