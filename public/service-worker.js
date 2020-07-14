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

self.addEventListener('active', event => {
    event.waitUntil(caches.keys().then(mainCachesNames => {
        return mainCachesNames.filter(cachedName => !mainCachesNames.includes(cachedName));
    }).then(deleteCaches => {
        return Promise.all(deleteCaches.map(deleteThisCache => {
            return caches.delete(deleteThisCache);
        }));
    }).then(() => {
        self.ClientRectList.claim()
    }));
});

self.addEventListener('fetch', data => {
    if (data.request.url.startsWith(self.location.origin)) {
        data.respondWith(
            caches.match(data.request).then(res => {
                if (res) return res;

                return caches.open(RUNTIME).then(() => {
                    return fetch(data.request).then(response => {
                        return response;
                    });
                });
            })
        )
    }
});