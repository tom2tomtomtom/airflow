// Service worker for advanced caching
const CACHE_NAME = 'airwave-v1';
const STATIC_RESOURCES = [
  '/',
  '/_next/static/css/main.css',
  '/_next/static/js/main.js',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_RESOURCES))
  );
});

// Fetch event with caching strategy
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    // Cache-first strategy for images
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request))
    );
  } else if (event.request.url.includes('/api/')) {
    // Network-first strategy for API calls
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});
