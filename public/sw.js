const CACHE_NAME = 'waristock-v2'
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/context/AppContext.jsx',
  '/src/components/Icons.jsx',
  '/src/components/BottomNav.jsx',
  '/src/components/SideNav.jsx',
  '/src/components/ProductCard.jsx',
  '/src/pages/Login.jsx',
  '/src/pages/Register.jsx',
  '/src/pages/Home.jsx',
  '/src/pages/Products.jsx',
  '/src/pages/ProductDetail.jsx',
  '/src/pages/Move.jsx',
  '/src/pages/Alerts.jsx',
  '/src/pages/Suppliers.jsx',
  '/src/pages/Inventory.jsx',
  '/src/pages/Reports.jsx',
  '/src/pages/Settings.jsx',
  '/src/pages/More.jsx',
  '/src/pages/Clients.jsx',
  '/icon-180.png',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.svg',
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght=12..96,400;12..96,600;12..96,700;12..96,800&display=swap'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return networkResponse
      }).catch(() => cached)
      return cached || fetchPromise
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  )
})
