// Service worker for A2 Transport and Logistics PWA
// Provides offline caching for core assets and faster repeat visits.

const CACHE_NAME = 'a2logistics-cache-v1.1';
const OFFLINE_PAGE = '/404.html';

// Core assets to pre-cache on install
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/network.html',
  '/contact.html',
  '/404.html',
  '/styles.css',
  '/script.js',
  '/favicon.ico',
  '/A2logo.png',
  '/site.webmanifest'
];

// Install event: pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use addAll but catch individual failures
      return Promise.allSettled(
        CORE_ASSETS.map(url => 
          cache.add(url).catch(err => {
            console.warn(`Failed to cache ${url}:`, err);
            return null;
          })
        )
      );
    })
  );

  // Activate this service worker immediately after installation
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  // Ensure the service worker takes control of all clients immediately
  self.clients.claim();
});

// Fetch event: cache-first strategy with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch from network and cache a copy
      return fetch(request)
        .then((networkResponse) => {
          // Only cache successful, basic (same-origin) responses
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== 'basic'
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If navigation request fails, fall back to cached homepage or offline page
          if (request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match(OFFLINE_PAGE);
          }
          // For other requests, return undefined to let browser handle it
          return undefined;
        });
    })
  );
});


