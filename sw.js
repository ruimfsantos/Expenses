// Service Worker — permite instalação como PWA e funcionamento offline básico.
const CACHE_NAME = 'despesas-v1';
const URLS_TO_CACHE = [
    './Software-Register-Expenses_v6.html',
    './manifest.json'
];

// Instalação: guarda os ficheiros essenciais em cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
    );
    self.skipWaiting();
});

// Ativação: limpa caches antigas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

// Fetch: estratégia "network first, fallback to cache"
// — sempre que há rede, usa a versão mais recente;
// — sem rede, serve a versão em cache.
self.addEventListener('fetch', (event) => {
    // Ignorar pedidos que não sejam GET
    if (event.request.method !== 'GET') return;

    // Ignorar pedidos para CDNs externos (deixa o browser tratar)
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Guardar cópia atualizada em cache
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clone);
                });
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});