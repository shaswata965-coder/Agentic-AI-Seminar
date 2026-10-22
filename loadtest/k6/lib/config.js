/*
 * Settings shared by the scenarios, from the environment (k6 run -e NAME=value, or run.sh):
 *   BASE_URL   the site, default https://localhost (nginx in front of `next start`, see stack/up.sh)
 *   IP_MODE    distinct | shared | campus: only a label here; the addresses come from k6 --local-ips
 *   RUN_ID     makes e-mail addresses and team names unique to the run
 *   SCALE      multiplies the number of users (0.05 for a quick smoke run)
 *   PACE       multiplies every think time and phase length (0.2 for a quick smoke run)
 *   OUT_DIR    where handleSummary writes summary.json and summary.txt
 */

export const BASE = (__ENV.BASE_URL || "https://localhost").replace(/\/+$/, "");
export const IP_MODE = __ENV.IP_MODE || "distinct";
export const RUN_ID = __ENV.RUN_ID || String(Date.now() % 1e8);
export const SCALE = Number(__ENV.SCALE || 1);
export const PACE = Number(__ENV.PACE || 1);
export const OUT_DIR = __ENV.OUT_DIR || "";

/** At least one user, however small SCALE is. */
export const users = (n) => Math.max(1, Math.round(n * SCALE));

/** A k6 duration string for `seconds`, scaled by PACE. */
export const dur = (seconds) => `${Math.max(1, Math.round(seconds * PACE))}s`;

export const ADMIN = {
  email: __ENV.LOADTEST_ADMIN_EMAIL || "loadtest-admin@example.com",
  password: __ENV.LOADTEST_ADMIN_PASSWORD || "Load-test-organiser-2026",
};

/**
 * Service levels every scenario is held to. A run fails if any is missed. Submissions are counted by
 * outcome: `ok` (saved), `duplicate` (the same person again, refused or answered as already
 * registered, as designed), `rate_limited` (HTTP 429) and `error` (anything else). A real person turned
 * away by a rate limit is a failure, whatever IP address they share.
 */
export const thresholds = {
  checks: ["rate>0.99"],
  http_req_failed: ["rate<0.01"],
  "http_req_duration{kind:document}": ["p(95)<1500", "p(99)<3000"],
  "http_req_duration{kind:asset}": ["p(95)<1000"],
  "http_req_duration{kind:prefetch}": ["p(95)<1000"],
  "http_req_duration{kind:submit}": ["p(95)<2000"],
  "http_req_duration{kind:download}": ["p(95)<1500"],
  "http_req_duration{kind:admin}": ["p(95)<3000"],
  page_ready: ["p(95)<3000"],
  "submissions{outcome:error}": ["count==0"],
  "submissions{outcome:rate_limited}": ["count==0"],
  // Listed so they appear in the summary.
  "submissions{outcome:ok}": ["count>=0"],
  "submissions{outcome:duplicate}": ["count>=0"],
  "people_registered{form:workshop}": ["count>=0"],
  "people_registered{form:hackathon}": ["count>=0"],
  "people_registered{form:enquiry}": ["count>=0"],
  "people_blocked{form:workshop}": ["count>=0"],
  "people_blocked{form:hackathon}": ["count>=0"],
  "people_blocked{form:enquiry}": ["count>=0"],
};

export const baseOptions = {
  insecureSkipTLSVerify: true, // the stack's certificate is self-signed
  discardResponseBodies: true, // bodies are kept only where a check reads them
  noVUConnectionReuse: true, // every iteration is a new visit: new connections, new TLS handshakes
  batch: 30,
  batchPerHost: 30, // HTTP/2: a browser asks for a page's files all at once
  summaryTrendStats: ["avg", "min", "med", "p(90)", "p(95)", "p(99)", "max", "count"],
  thresholds,
};

/** Uniform random number in [min, max). */
export const between = (min, max) => min + Math.random() * (max - min);

/** Pick from `{ value: weight }`. */
export function weighted(table) {
  const entries = Object.entries(table);
  let r = Math.random() * entries.reduce((sum, [, w]) => sum + w, 0);
  for (const [value, w] of entries) if ((r -= w) < 0) return value;
  return entries[entries.length - 1][0];
}

export const pick = (list) => list[Math.floor(Math.random() * list.length)];
