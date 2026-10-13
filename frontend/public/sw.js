// Service worker: tarayıcının "uygulamayı yükle" özelliği için gerekli.
// Bilerek hiçbir şeyi önbelleğe almıyoruz; her istek normal şekilde sunucuya gider.
// (Önbellek eklersek, siteyi güncellediğimizde kullanıcılar eski sürümü görebilir.)

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
