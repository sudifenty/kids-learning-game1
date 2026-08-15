/* ==========================================================================
   🌈 LET'S LEARN — service worker (offline-first)
   v22:
   - App shell: network-first, fall back to cache when offline.
   - Bundled teacher-voice clips + fonts: cache-first, precached on install.
   - Media files: cache-first after first play.
   - Neural TTS clips (/api/tts/cache/): cache-first so heard sentences stay offline.
   ========================================================================== */

const CACHE = 'lets-learn-v23';
const SHELL = [
  '/',
  'index.html',
  'manifest.webmanifest',
  'css/fonts.css',
  'css/style.css',
  'css/home.css',
  'css/activities.css',
  'css/responsive.css',
  'js/data.js',
  'js/validate.js',
  'js/voice-library.js',
  'js/audio.js',
  'js/narration.js',
  'js/rewards.js',
  'js/tracing.js',
  'js/coloring.js',
  'js/games.js',
  'js/lessons.js',
  'js/media.js',
  'js/puzzles.js',
  'js/pwa.js',
  'js/navigation.js',
  'js/app.js',
  'assets/fonts/fredoka-latin.woff2',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/audio/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'no-cache' }))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE && k.indexOf('ll-teacher-voice') === -1).map(k => caches.delete(k)));
    await self.clients.claim();
    try {
      const res = await fetch('assets/audio/manifest.json', { cache: 'no-cache' });
      if (!res.ok) return;
      const data = await res.json();
      const files = (data.files || []).slice(0, 800);
      const cache = await caches.open(CACHE);
      for (let i = 0; i < files.length; i += 20) {
        const chunk = files.slice(i, i + 20);
        await Promise.all(chunk.map(u => cache.add(new Request(u, { cache: 'reload' })).catch(() => {})));
      }
    } catch (err) { /* first launch without a voice pack is still fine */ }
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  /* bundled voice, fonts, icons, media — cache-first (offline after first load) */
  if (url.pathname.startsWith('/media/') || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/api/tts/cache/')) {
    if (req.headers.get('range')) return;
    e.respondWith(
      caches.match(req).then(hit => {
        if (hit) return hit;
        return fetch(req).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {});
          }
          return res;
        }).catch(() => hit || Response.error());
      })
    );
    return;
  }

  if (req.mode === 'navigate' || url.pathname === '/api/media' || url.pathname === '/api/health') {
    e.respondWith(
      fetch(req).then(res => {
        if (res && (res.status === 200 || (res.type === 'opaqueredirect' && url.pathname === '/api/media'))) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match(req).then(hit => hit || (url.pathname === '/api/media' ? new Response('[]', { headers: { 'Content-Type': 'application/json' } }) : caches.match('/'))))
    );
    return;
  }

  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.webmanifest') || url.pathname.endsWith('.woff2')) {
    e.respondWith(
      caches.match(req).then(hit => {
        const network = fetch(req).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {});
          }
          return res;
        }).catch(() => hit);
        return hit || network;
      })
    );
  }
});
