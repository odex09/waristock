const CACHE_NAME = 'waristock-shell-v3'
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-180.png',
  '/icon-192.png',
  '/icon-512.png',
]
const API_PATHS = ['/auth/v1/', '/rest/v1/', '/storage/v1/', '/functions/v1/']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        const response = await fetch('/vite-manifest.json')
        if (!response.ok) {
          throw new Error(`Impossible de lire le manifeste de production (${response.status}).`)
        }
        const manifest = await response.json()
        const buildAssets = Object.values(manifest).flatMap((entry) => [
          entry.file,
          ...(entry.css || []),
          ...(entry.assets || []),
        ])
        const uniqueAssets = [...new Set(buildAssets)]
          .filter(Boolean)
          .map((asset) => asset.startsWith('/') ? asset : `/${asset}`)
        await cache.addAll([...APP_SHELL, ...uniqueAssets])
      })
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('waristock-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (API_PATHS.some((path) => url.pathname.includes(path))) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const copy = response.clone()
            await caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy))
          }
          return response
        })
        .catch(async () => (
          await caches.match('/index.html') ||
          new Response('WariStock est indisponible hors ligne.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        ))
    )
    return
  }

  if (!/\.(?:js|css|svg|png|jpg|jpeg|webp|gif|woff2?|ttf|ico|json)$/i.test(url.pathname)) return
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok) {
        const copy = response.clone()
        return caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).then(() => response)
      }
      return response
    })
    .catch(() => null)
  event.waitUntil(refresh)
  event.respondWith(
    caches.match(request).then((cached) =>
      cached || refresh.then((response) => response || new Response('', { status: 504 }))
    )
  )
})
