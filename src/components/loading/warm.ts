import { BASE_PATH, withBase } from "@/lib/paths";
import { cacheFiles, type FilesProgress, type WarmRequest } from "./cache-files";

/*
 * Caches the site's files behind the loading screen, so the rest of the visit is quick. First this
 * page itself (its fonts and the images it shows straight away, until it has loaded), then the main
 * pages and the files they use (cache-files.ts, in a worker). It runs once per page load. Progress is
 * a store for useSyncExternalStore; `ratio` never goes back.
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
const PAGE = 0.2;
const PAGES = 0.25;

const INITIAL: Warmup = { stage: "page", done: 0, total: 0, ratio: 0 };
let state = INITIAL;
const listeners = new Set<() => void>();
let running: Promise<void> | null = null;

let notifying = 0;

/** Record progress; subscribers hear about it at most every 120 ms (and at once when all is done). */
function update(next: Warmup) {
  state = { ...next, ratio: Math.max(state.ratio, Math.min(1, next.ratio)) };
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

/** Start caching (once per page load); resolves when every file has been fetched or has failed. */
export function warmAssets(routes: string[]) {
  running ??= run(routes);
  return running;
}

async function run(routes: string[]) {
  await pageLoaded();
  const request: WarmRequest = {
    routes: routes.map((r) => withBase(r)),
    base: BASE_PATH,
    keep: performance.getEntriesByType("resource").map((e) => e.name),
  };
  const report = ({ stage, done, total }: FilesProgress) => {
    const share = total ? done / total : 1;
    update({ stage, done, total, ratio: stage === "pages" ? PAGE + PAGES * share : PAGE + PAGES + (1 - PAGE - PAGES) * share });
  };
  if (!(await inWorker(request, report))) await cacheFiles(request, report);
  update({ stage: "done", done: state.done, total: state.total, ratio: 1 });
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
