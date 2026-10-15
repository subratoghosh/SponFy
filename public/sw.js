const CACHE_NAME = "sponfy-static-v1";

const PRECACHE_ASSETS = [
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/logo.svg",
];

// Precache minimal static assets on install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Purge old caches and take immediate control
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignore non-GET requests
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Ignore cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Never intercept API routes, Next data routes, or requests with Authorization headers
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data") ||
    request.headers.has("Authorization")
  ) {
    return;
  }

  // Navigation requests: Network-first, fallback to /offline.html on network failure
  // Responses are NOT cached to prevent storing authenticated or dynamic pages
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const offlineResponse = await cache.match("/offline.html");
        return offlineResponse || Response.error();
      })
    );
    return;
  }

  // Static assets: Cache-first (/icons/, /_next/static/, and precached files)
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    PRECACHE_ASSETS.includes(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => Response.error());
      })
    );
    return;
  }

  // All other GET requests proceed to network untouched
});
