/*
 * Agentic AI Workshop: serves the site's cached files so pages open quickly.
 * Registered by components/loading/ServiceWorker.tsx; the home page's loading screen fills the same
 * cache (components/loading/cache-files.ts) and this worker adds to it as files are used.
 *   - Build files (/_next/static/, content-hashed) and uploads (/api/media/<id>) never change:
 *     from the cache when there, otherwise fetched and kept.
 *   - Other images (logos, icons): from the cache at once, refreshed in the background.
 *   - Everything else (pages, their data, the admin, the API) goes to the network as usual.
 */

const CACHE = "aaiw-assets-v1"; // ASSET_CACHE in components/loading/cache-files.ts
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, "");

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) if (name.startsWith("aaiw-") && name !== CACHE) await caches.delete(name);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(`${BASE}/`)) return;
  const path = url.pathname.slice(BASE.length);
  if (path.startsWith("/_next/static/") || /^\/api\/media\/[a-f0-9]{24}(\.[a-z0-9]{2,5})?$/i.test(path)) {
    event.respondWith(fromCache(req));
  } else if (req.destination === "image" && !path.startsWith("/api/") && !path.startsWith("/admin")) {
    event.respondWith(refreshing(event, req));
  }
});

async function fromCache(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req, { ignoreVary: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok && res.type === "basic") cache.put(req, res.clone()).catch(() => {});
  return res;
}

async function refreshing(event, req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req, { ignoreVary: true });
  const fresh = fetch(req)
    .then((res) => {
      if (res.ok && res.type === "basic") cache.put(req, res.clone()).catch(() => {});
      return res;
    })
    .catch((error) => {
      if (hit) return hit;
      throw error;
    });
  if (hit) {
    event.waitUntil(fresh);
    return hit;
  }
  return fresh;
}
