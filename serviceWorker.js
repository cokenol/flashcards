const staticFlashCards = "flash-cards-v1"
const assets = [
  "/",
  "/index.html",
  "/style.css",
  "/scripts.js",
]

self.addEventListener("install", installEvent => {  
  console.log('reached install');
  installEvent.waitUntil(
    caches.open(staticFlashCards).then(cache => {
      cache.addAll(assets)
    })
  )
})


// self.addEventListener('activate', function (e) {
//   console.log(`Unregistering service worker`)
//   self.registration.unregister()
//       .then(function () {
//           return self.clients.matchAll();
//       })
//       .then(function (clients) {
//           clients.forEach(client => {
//               console.log(`Navigating ${client.url}`)
//               client.navigate(client.url)
//           })
//       });
// })

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
})
