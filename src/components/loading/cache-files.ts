/*
 * Saves files in the ASSET_CACHE Cache Storage cache, which the service worker (public/sw.js) serves
 * them from from then on, and drops build files left over from earlier versions of the site. Run by
 * warm.worker.ts (or, where a worker can't start, by the page), so the page's main thread stays free.
 */

/** The Cache Storage cache the files go into. public/sw.js uses the same name. */
export const ASSET_CACHE = "aaiw-assets-v1";

export type FilesProgress = { stage: "files"; done: number; total: number };

export interface WarmRequest {
  /** Files to cache: the images the site's pages show, and the build files this page has loaded. */
  files: string[];
}

export async function cacheFiles({ files }: WarmRequest, report: (p: FilesProgress) => void) {
  const cache = await openCache();
  let saved = 0;
  report({ stage: "files", done: 0, total: files.length });
  await pool(files, 6, async (url) => {
    try {
      if (!cache) {
        // No Cache Storage (an insecure origin): at least the browser's own cache keeps them.
        await (await fetch(url, { credentials: "same-origin", signal: timeout() })).arrayBuffer();
      } else if (!(await cache.match(url))) {
        const res = await fetch(url, { credentials: "same-origin", signal: timeout() });
        if (res.ok) await cache.put(url, res);
      }
    } catch {}
    report({ stage: "files", done: (saved += 1), total: files.length });
  });

  // Drop build files from earlier versions of the site; uploads and logos stay.
  if (cache) {
    const kept = new Set(files.map((f) => new URL(f, location.href).href));
    try {
      for (const req of await cache.keys()) if (req.url.includes("/_next/static/") && !kept.has(req.url)) await cache.delete(req);
    } catch {}
  }
}

async function openCache() {
  try {
    return typeof caches === "undefined" ? null : await caches.open(ASSET_CACHE);
  } catch {
    return null;
  }
}

const timeout = () => (typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(15000) : undefined);

/** Run `work` over `items`, at most `size` at a time. */
async function pool<T>(items: T[], size: number, work: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) await work(items[next++]);
    }),
  );
}
