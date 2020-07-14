const FILES_TO_CACHE = [
    '/', 
    '/index.html', 
    '/index.js', 
    '/styles.css', 
    '/offline.js', 
    '/manifest.webmanifest',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

self.addEventListener('install', event => {
    event.waitUntil(caches.open(PRECACHE).then(
        cacheData => cacheData.addAll(FILES_TO_CACHE)
    ).then(self.skipWaiting()));
});

self.addEventListener('activate', event => {
    const mainCachesNames = [PRECACHE, RUNTIME]

    event.waitUntil(caches.keys().then(cacheNames => {
        return cacheNames.filter(cachedName => !mainCachesNames.includes(cachedName));
    }).then(deleteCaches => {
        return Promise.all(deleteCaches.map(deleteThisCache => {
            return caches.delete(deleteThisCache);
        }));
    }).then(() => {
        return self.clients.claim();
    }));
});

self.addEventListener('fetch', data => {
    if (data.request.url.includes('/api/')) {
        data.respondWith(
            caches.open(RUNTIME).then(cache => {
                return fetch(data.request).then(response => {
                    if (response.status === 200) {
                        cache.put(data.request, response.clone())
                    }
                    return response;
                }).catch(err => {
                    return cache.match(data.request);
                })
            }).catch(err => {
                console.log(err);
            })
        )
    }
});