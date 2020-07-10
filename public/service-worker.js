const FILES_TO_CACHE = ['/', '/index.html', '/styles.css'];

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

self.addEventListener('install', event => {
    event.waitUntil(caches.open(PRECACHE).then(
        cacheData => cacheData.addAll(FILES_TO_CACHE)
    ).then(self.skipWaiting()));
});

self.addEventListener('active', event => {
    const mainCache = [PRECACHE, RUNTIME];

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

                return caches.open(RUNTIME).then(cache => {
                    return fetch(data.request).then(response => {
                        return cache.put(data.request, response.clone()).then(() => {
                            return response;
                        });
                    })
                });
            })
        )
    }
});