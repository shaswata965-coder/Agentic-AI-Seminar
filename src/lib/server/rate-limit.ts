import "server-only";

/*
 * Small in-memory sliding-window limiter. Good enough for a single Node
 * process (the recommended deployment); put a shared store in front if you
 * run several instances.
 */
interface Bucket {
  hits: number[];
  windowMs: number;
}
const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();
// Enough for any real traffic; past it the oldest keys are dropped so a flood of new keys can't use up memory.
const MAX_KEYS = 50_000;

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  for (const [k, b] of buckets) if (!b.hits.length || now - b.hits[b.hits.length - 1] > b.windowMs) buckets.delete(k);
  lastSweep = now;
}

function recent(key: string, windowMs: number, now: number) {
  return (buckets.get(key)?.hits ?? []).filter((t) => now - t < windowMs);
}

/** Whether `key` has used up `limit` within the window, without counting this call. */
export function isLimited(key: string, limit: number, windowMs: number): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const hits = recent(key, windowMs, now);
  return hits.length >= limit ? { limited: true, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) } : { limited: false, retryAfter: 0 };
}

/** Count one event against `key` (e.g. a failed sign-in). */
export function hit(key: string, windowMs: number) {
  const now = Date.now();
  sweep(now);
  const hits = recent(key, windowMs, now);
  hits.push(now);
  buckets.delete(key); // re-inserted last, so the map stays ordered from least to most recently used
  buckets.set(key, { hits, windowMs });
  if (buckets.size > MAX_KEYS) for (const k of [...buckets.keys()].slice(0, buckets.size - MAX_KEYS)) buckets.delete(k);
}

/** Forget `key` (e.g. after a successful sign-in). */
export function clearHits(key: string) {
  buckets.delete(key);
}

/** Count this call against `key` unless the limit is reached. */
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const state = isLimited(key, limit, windowMs);
  if (state.limited) return { ok: false, retryAfter: state.retryAfter };
  hit(key, windowMs);
  return { ok: true, retryAfter: 0 };
}
