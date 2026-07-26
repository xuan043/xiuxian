/* 修仙修行台 —— Service Worker（支持离线/添加到桌面） */
const CACHE = 'xiuxian-v1';
const ASSETS = [
  '.', 'index.html', 'manifest.webmanifest',
  'css/style.css',
  'js/engine.js', 'js/english-data.js', 'js/english-engine.js',
  'js/python-data.js', 'js/python-engine.js', 'js/app.js',
  'assets/icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  // 仅处理同源 GET
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return resp;
    }).catch(() => cached))
  );
});
