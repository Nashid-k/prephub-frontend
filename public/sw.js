const CACHE_NAME = 'prephub-v1';
const STATIC_CACHE = 'prephub-static-v1';
const DYNAMIC_CACHE = 'prephub-dynamic-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

// API routes to cache for offline access
const CACHEABLE_API_ROUTES = [
    '/api/curriculum/topics',
    '/api/progress/all'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Precaching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests
    if (!url.origin.includes(self.location.origin) && !url.pathname.startsWith('/api')) {
        return;
    }

    // Handle API requests
    if (url.pathname.startsWith('/api')) {
        event.respondWith(handleAPIRequest(request));
        return;
    }

    // Handle static assets with cache-first strategy
    event.respondWith(handleStaticRequest(request));
});

// Cache-first strategy for static assets
async function handleStaticRequest(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        // Return cached version, but update cache in background
        fetchAndCache(request, STATIC_CACHE);
        return cachedResponse;
    }

    // Not in cache, fetch from network
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Return offline page if available
        return caches.match('/offline.html');
    }
}

// Network-first strategy for API requests
async function handleAPIRequest(request) {
    const url = new URL(request.url);
    const isCacheable = CACHEABLE_API_ROUTES.some(route => url.pathname.includes(route));

    try {
        const networkResponse = await fetch(request);

        // Cache successful GET requests for specific routes
        if (networkResponse.ok && isCacheable) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Offline - try to return cached data
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            // Clone the response and add offline indicator
            const headers = new Headers(cachedResponse.headers);
            headers.set('X-Served-From', 'cache');

            return new Response(cachedResponse.body, {
                status: cachedResponse.status,
                statusText: cachedResponse.statusText,
                headers
            });
        }

        // Return error response for offline
        return new Response(JSON.stringify({
            error: 'offline',
            message: 'You appear to be offline. Please check your connection.'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Background fetch and cache update
async function fetchAndCache(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse);
        }
    } catch (error) {
        // Silently fail - we already have cached version
    }
}

// Handle messages from the app
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
        });
    }
});
