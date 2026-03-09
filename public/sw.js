// public/sw.js
// Minimal service worker for PWA installability (Phase 1).
// Full offline caching with @serwist/next is deferred to Phase 5.
const CACHE_NAME = 'budgetpulse-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached ?? fetch(event.request)
    })
  )
})
