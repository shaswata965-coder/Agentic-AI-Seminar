/*
 * The caching itself, run by warm.worker.ts (or, where a worker can't start, by the page):
 *   pages  each main page's HTML, read for the files it uses (it is not kept: pages are always
 *          fetched fresh, as their content changes in the admin);
 *   files  those scripts, styles, fonts and images, saved in the ASSET_CACHE Cache Storage cache,
 *          which the service worker (public/sw.js) serves them from from then on.
 * It runs in a worker because Chrome acts on the `Link: rel=preload` headers of every page response,
 * even a fetch() from the page, and would fetch the fonts and logos again for nothing.
 */

/** The Cache Storage cache the files go into. public/sw.js uses the same name. */
export const ASSET_CACHE = "aaiw-assets-v1";

export type FilesProgress = { stage: "pages" | "files"; done: number; total: number };

export interface WarmRequest {
  /** The pages to read, with the base path. */
  routes: string[];
  /** The sub-path the site is served from, or "". */
  base: string;
  /** Files the page has loaded already, which pruning keeps. */
  keep: string[];
}

export async function cacheFiles({ routes, base, keep }: WarmRequest, report: (p: FilesProgress) => void) {
  // The files a page uses, as they appear in its HTML (including the data React reads to hydrate it).
  const esc = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `${esc}/(?:_next/static/[^"'\\s)\\\\]+?\\.(?:js|css|woff2?)|api/media/[a-f0-9]{24}(?:\\.[a-z0-9]{2,5})?|logos/[^"'\\s)\\\\]+?\\.(?:png|jpe?g|webp|svg))(?=["'\\s)\\\\])`,
    "gi",
  );

  const files = new Set<string>();
  let read = 0;
  report({ stage: "pages", done: 0, total: routes.length });
  await pool(routes, 4, async (route) => {
    try {
      const res = await fetch(route, { credentials: "same-origin", signal: timeout() });
      if (res.ok) for (const m of (await res.text()).matchAll(pattern)) files.add(m[0]);
    } catch {}
    report({ stage: "pages", done: (read += 1), total: routes.length });
  });

  const cache = await openCache();
  const list = [...files];
  let saved = 0;
  report({ stage: "files", done: 0, total: list.length });
  await pool(list, 6, async (url) => {
    try {
      if (!cache) {
        // No Cache Storage (an insecure origin): at least the browser's own cache keeps them.
        await (await fetch(url, { credentials: "same-origin", signal: timeout() })).arrayBuffer();
      } else if (!(await cache.match(url))) {
        const res = await fetch(url, { credentials: "same-origin", signal: timeout() });
        if (res.ok) await cache.put(url, res);
      }
    } catch {}
    report({ stage: "files", done: (saved += 1), total: list.length });
  });

  // Drop build files left over from earlier versions of the site; uploads and logos stay.
  if (cache) {
    const kept = new Set([...list, ...keep].map((f) => new URL(f, location.href).href));
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
