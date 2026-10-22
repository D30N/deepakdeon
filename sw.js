const C = 'dd-cache-v3';
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== C; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  var isPage = e.request.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html') || u.pathname.endsWith('.json');
  if (isPage) {
    e.respondWith(fetch(e.request).then(function(r){
      var cc = r.clone(); caches.open(C).then(function(x){ x.put(e.request, cc); });
      return r;
    }).catch(function(){ return caches.match(e.request); }));
  } else {
    e.respondWith(caches.match(e.request).then(function(m){
      return m || fetch(e.request).then(function(r){
        var cc = r.clone(); caches.open(C).then(function(x){ x.put(e.request, cc); });
        return r;
      });
    }));
  }
});
