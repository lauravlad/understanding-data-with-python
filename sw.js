/* Offline support. The Python runtime and libraries are cached the first time they are fetched
   and then always served from the cache; the app's own small files are fetched fresh when online
   and fall back to the cached copy when offline. */
const CACHE = 'understanding-data-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if(e.request.method !== 'GET' || u.origin !== location.origin) return;
  const runtime = u.pathname.includes('/pyodide/');
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(e.request, {ignoreSearch: true});
    const net = () => fetch(e.request).then(r => { if(r.ok) cache.put(e.request, r.clone()); return r; });
    if(runtime) return hit || net();
    try{ return await net(); }catch(err){ if(hit) return hit; throw err; }
  }));
});
