const cacheName = 'manyCache';
const assetsToCache = [
  './',
  './index.html',
  './css/styles.css',
  './js/estimados.js',
  './js/movimientos.js',
  './js/opciones.js',
  './js/script.js',
  './js/tarjetas.js',
  './images/icon-192x192.png',
  './images/icon-512x512.png'
];

self.addEventListener("install", (event) => {
  console.log("Service Worker : Installed!")

  event.waitUntil(
      
      (async() => {
          try {
              cache_obj = await caches.open(cache)
              cache_obj.addAll(caching_files)
          }
          catch{
              console.log("error occured while caching...")
          }
      })()
  )
} )

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
