const CACHE = 'phidesk-v1';
const ASSETS = [
  '/phidesk-redesantana/',
  '/phidesk-redesantana/index.html',
  '/phidesk-redesantana/manifest.json'
];

// Instala e faz cache dos assets principais
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Estratégia: Network first, cache como fallback
self.addEventListener('fetch', function(e){
  // Não intercepta chamadas ao Apps Script (sempre online)
  if(e.request.url.includes('script.google.com')){
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(function(response){
        // Atualiza o cache com a versão mais recente
        var clone = response.clone();
        caches.open(CACHE).then(function(cache){
          cache.put(e.request, clone);
        });
        return response;
      })
      .catch(function(){
        // Se offline, serve do cache
        return caches.match(e.request);
      })
  );
});
