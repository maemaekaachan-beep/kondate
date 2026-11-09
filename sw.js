// ネットがつながるときは最新を取り、圏外のスーパーでも開けるようにキャッシュへ退避する
const CACHE = 'kondate-v1';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './manifest.json'])).catch(() => {}));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const cp = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
