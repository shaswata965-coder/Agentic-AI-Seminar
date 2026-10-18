import { BASE_PATH, withBase } from "@/lib/paths";
import { cacheFiles, type FilesProgress, type WarmRequest } from "./cache-files";
import { PAGE_SHARE, PROGRESS_TARGETS } from "./flag";

/*
 * Loads and caches the site behind the loading screen, so the rest of the visit is quick:
 *   page   this page itself: its fonts and the images it shows straight away, until it has loaded;
 *   pages  the main pages, prefetched through the router (their data and scripts), each counted once
 *          its data has arrived;
 *   files  the images the pages show (from the content) and the build files loaded so far, saved for
 *          the service worker (cache-files.ts, in a worker).
 * It runs once per page load. Progress is a store for useSyncExternalStore; `ratio` never goes back.
 */

export interface Warmup {
  stage: "page" | "pages" | "files" | "done";
  /** Steps done and to do in this stage. */
  done: number;
  total: number;
  /** Overall progress, 0 to 1. */
  ratio: number;
}

/* Each stage's share of the ring. */
const PAGE = PAGE_SHARE;
const PAGES = 0.4;
/** Give up waiting for the pages' data after this long (the prefetches carry on). */
const PAGES_WAIT = 8000;

const INITIAL: Warmup = { stage: "page", done: 0, total: 0, ratio: 0 };
let state = INITIAL;
const listeners = new Set<() => void>();
let running: Promise<void> | null = null;

let notifying = 0;

/** Draw progress on the ring and the percentage (--lx-p, see loading.css). */
export function showProgress(ratio: number) {
  document.querySelectorAll<HTMLElement>(PROGRESS_TARGETS).forEach((el) => el.style.setProperty("--lx-p", String(ratio)));
}

/**
 * Record progress and draw it at once; subscribers (the status line) hear about it at most every
 * 120 ms, and at once when all is done.
 */
function update(next: Warmup) {
  const before = state.ratio;
  state = { ...next, ratio: Math.max(state.ratio, Math.min(1, next.ratio)) };
  if (state.ratio !== before) showProgress(state.ratio);
  if (next.stage === "done") {
    window.clearTimeout(notifying);
    notifying = 0;
    listeners.forEach((fn) => fn());
  } else if (!notifying) {
    notifying = window.setTimeout(() => {
      notifying = 0;
      listeners.forEach((fn) => fn());
    }, 120);
  }
}

export const warmup = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => void listeners.delete(fn);
  },
  get: () => state,
  initial: () => INITIAL,
};

/**
 * Start loading (once per page load); resolves when every page and file is in or has failed.
 * `routes` are the main pages, `files` the images they show, `prefetch` the router's prefetch.
 */
export function warmAssets(routes: string[], files: string[], prefetch: (route: string) => void) {
  if (!running) {
    // Carry on from where the head script (flag.ts) got the ring while the page was loading.
    const boot = window as typeof window & { __lxP?: number; __lxWarm?: boolean };
    boot.__lxWarm = true;
    state = { ...state, ratio: boot.__lxP ?? 0 };
    running = run(routes, files, prefetch);
  }
  return running;
}

async function run(routes: string[], files: string[], prefetch: (route: string) => void) {
  await pageLoaded();
  await prefetchPages(routes, prefetch);
  // Plus what this page has loaded itself: build files, logos and uploads.
  const own = `${location.origin}${BASE_PATH}`;
  const loaded = performance
    .getEntriesByType("resource")
    .map((e) => e.name)
    .filter((url) => [`${own}/_next/static/`, `${own}/logos/`, `${own}/api/media/`].some((prefix) => url.startsWith(prefix)));
  const request: WarmRequest = { files: [...new Set([...files.map((f) => withBase(f)), ...loaded])] };
  const report = ({ done, total }: FilesProgress) =>
    update({ stage: "files", done, total, ratio: PAGE + PAGES + (1 - PAGE - PAGES) * (total ? done / total : 1) });
  if (!(await inWorker(request, report))) await cacheFiles(request, report);
  update({ stage: "done", done: state.done, total: state.total, ratio: 1 });
}

/** This page: until it has loaded, progress follows its fonts and the images it shows straight away. */
function pageLoaded() {
  return new Promise<void>((resolve) => {
    let fonts = false;
    document.fonts?.ready.then(() => (fonts = true));
    const tick = () => {
      const images = [...document.images].filter((img) => img.loading !== "lazy");
      const shown = images.length ? images.filter((img) => img.complete).length / images.length : 1;
      if (document.readyState === "complete" && fonts) {
        update({ stage: "page", done: 0, total: 0, ratio: PAGE });
        resolve();
      } else {
        update({ stage: "page", done: 0, total: 0, ratio: PAGE * 0.9 * (0.25 * Number(fonts) + 0.75 * shown) });
        window.setTimeout(tick, 150);
      }
    };
    tick();
  });
}

/** Prefetch each page through the router; a page counts once its data has arrived (seen in the resource timings). */
function prefetchPages(routes: string[], prefetch: (route: string) => void) {
  return new Promise<void>((resolve) => {
    const pending = new Set(routes);
    const total = routes.length;
    let observer: PerformanceObserver | null = null;
    let timer = 0;
    const finish = () => {
      observer?.disconnect();
      window.clearTimeout(timer);
      resolve();
    };
    const seen = (entries: PerformanceEntryList) => {
      for (const entry of entries) {
        const url = new URL(entry.name);
        if (url.origin !== location.origin || !url.searchParams.has("_rsc")) continue;
        const route = url.pathname.slice(BASE_PATH.length) || "/";
        if (!pending.delete(route)) continue;
        update({ stage: "pages", done: total - pending.size, total, ratio: PAGE + (PAGES * (total - pending.size)) / total });
        if (!pending.size) finish();
      }
    };
    update({ stage: "pages", done: 0, total, ratio: PAGE });
    if (!total) return finish();
    timer = window.setTimeout(finish, PAGES_WAIT);
    try {
      observer = new PerformanceObserver((list) => seen(list.getEntries()));
      observer.observe({ type: "resource", buffered: true });
    } catch {}
    for (const route of routes) prefetch(route);
  });
}

/** Run cache-files.ts in a worker; false if one can't be started (the page then does it itself). */
function inWorker(request: WarmRequest, report: (p: FilesProgress) => void) {
  return new Promise<boolean>((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("./warm.worker.ts", import.meta.url), { type: "module" });
    } catch {
      return resolve(false);
    }
    let heard = false;
    worker.onmessage = (event: MessageEvent<FilesProgress | { stage: "done" }>) => {
      heard = true;
      if (event.data.stage === "done") {
        worker.terminate();
        resolve(true);
      } else report(event.data);
    };
    worker.onerror = () => {
      worker.terminate();
      resolve(heard);
    };
    worker.postMessage(request);
  });
}
