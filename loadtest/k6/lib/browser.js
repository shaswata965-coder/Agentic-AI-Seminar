/*
 * What a visitor's browser asks the server for, modelled on a recorded Chromium visit (README.md, "How a
 * visit is modelled"):
 *   - the page's HTML;
 *   - on a first visit, the files it uses (scripts, fonts, images, the service worker and manifest);
 *   - the Next.js router's prefetches of the pages it links to, two requests each (the route tree and
 *     the page segment). The home page's loading screen prefetches all nine main pages; other pages
 *     prefetch the links in the navigation bar.
 * Later page views in a visit are full page loads with the files already cached. A browser really does a
 * client-side navigation from data it has prefetched, which costs the server less, so results err on
 * the safe side.
 */
import { check } from "k6";
import crypto from "k6/crypto";
import encoding from "k6/encoding";
import http from "k6/http";
import { Trend } from "k6/metrics";
import { BASE } from "./config.js";

/** Time from asking for a page to having its HTML and, on a first visit, every file it needs. */
export const pageReady = new Trend("page_ready", true);

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 aaiw-loadtest";
const COMMON = { "User-Agent": UA, "Accept-Language": "en-IN,en;q=0.9", "Accept-Encoding": "gzip, deflate, br" };

/** The pages the home page's loading screen prefetches (warm.ts), and those in the navigation bar. */
export const MAIN_ROUTES = ["/about", "/programme", "/speakers", "/register", "/hackathon", "/partners", "/venue", "/organisers", "/tutorials"];
const NAV_ROUTES = ["/", "/about", "/programme", "/speakers", "/register"];
/** Pages a scenario may open; setup() reads each one's files. */
export const PAGES = ["/", ...MAIN_ROUTES];

// The (site) route group, as Next.js names it in segment prefetches.
const GROUP = "!KHNpdGUp";
const segmentOf = (route) => (route === "/" ? `/${GROUP}/__PAGE__` : `/${GROUP}${route}/__PAGE__`);

/**
 * The `_rsc` value Next.js expects for a prefetch (it answers any other with a redirect): the first 12
 * bytes of SHA-256 over the prefetch headers, base64url.
 */
function rscParam(segment, from) {
  const digest = crypto.sha256(`1,${segment},0,${from}`, "binary");
  return encoding.b64encode(digest.slice(0, 12), "rawurl");
}

/**
 * Read each page once and list the files a browser would load for it. Run in setup(); the result is
 * handed to every virtual user.
 */
export function readManifest(pages = PAGES) {
  const manifest = {};
  const always = ["/sw.js", "/manifest.webmanifest", "/icon.svg"];
  for (const path of pages) {
    const res = http.get(`${BASE}${path}`, { headers: COMMON, responseType: "text", tags: { kind: "setup" } });
    if (res.status !== 200) throw new Error(`setup: ${path} answered ${res.status}`);
    const files = new Set(always);
    // Files appear in tags, inline CSS and the inline router payload (where quotes are escaped).
    for (const m of res.body.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) files.add(m[0]);
    for (const m of res.body.matchAll(/["(](\/(?:logos|themes|api\/media)\/[^"'\s)?#\\]+)/g)) files.add(m[1]);
    manifest[path] = [...files];
  }
  return manifest;
}

const docParams = (path, from) => ({
  headers: {
    ...COMMON,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": from ? "same-origin" : "none",
    "Upgrade-Insecure-Requests": "1",
    ...(from ? { Referer: `${BASE}${from}` } : {}),
  },
  responseType: "text",
  tags: { kind: "document", name: `page ${path.split("#")[0]}` },
});

function assetRequest(url) {
  const type = url.endsWith(".js") ? "script" : url.endsWith(".woff2") ? "font" : "file";
  return {
    method: "GET",
    url: `${BASE}${url}`,
    params: { headers: { ...COMMON, Accept: "*/*", "Sec-Fetch-Site": "same-origin" }, responseType: "none", tags: { kind: "asset", name: `asset ${type}` } },
  };
}

function prefetchRequests(routes, from) {
  const reqs = [];
  for (const route of routes) {
    for (const segment of ["/_tree", segmentOf(route)]) {
      reqs.push({
        method: "GET",
        url: `${BASE}${route}?_rsc=${rscParam(segment, from)}`,
        params: {
          headers: { ...COMMON, Accept: "*/*", RSC: "1", "Next-Router-Prefetch": "1", "Next-Router-Segment-Prefetch": segment, "Next-Url": from, "Sec-Fetch-Site": "same-origin", "Sec-Fetch-Mode": "cors", "Sec-Fetch-Dest": "empty" },
          responseType: "none",
          redirects: 0, // a redirect would mean the _rsc value is wrong: count it as a failure
          tags: { kind: "prefetch", name: "prefetch" },
        },
      });
    }
  }
  return reqs;
}

/**
 * Open a page. `cold`: the browser has nothing cached (a first visit). `from`: the page the visitor
 * came from, if any. Returns whether everything loaded.
 */
export function openPage(manifest, path, { cold = false, from = null } = {}) {
  const route = path.split("#")[0];
  const started = Date.now();
  const res = http.get(`${BASE}${path}`, docParams(path, from));
  const okDoc = check(res, {
    "page: status 200": (r) => r.status === 200,
    "page: complete HTML": (r) => typeof r.body === "string" && r.body.includes("</html>"),
  });
  let okFiles = true;
  if (okDoc && cold) {
    const files = http.batch((manifest[route] ?? []).map(assetRequest));
    okFiles = check(files, { "files: all 200": (rs) => rs.every((r) => r.status === 200) });
  }
  if (okDoc && okFiles) pageReady.add(Date.now() - started, { cold: String(cold) });

  if (!okDoc) return false;
  // The router's prefetches happen after the page is shown; they don't count towards page_ready.
  const routes = (route === "/" && cold ? MAIN_ROUTES : NAV_ROUTES).filter((r) => r !== route);
  const prefetches = http.batch(prefetchRequests(routes, route));
  check(prefetches, { "prefetch: all 200": (rs) => rs.every((r) => r.status === 200) });
  return okFiles;
}

/** A file download from a page: the programme PDF or a calendar entry. */
export function download(path, name) {
  const res = http.get(`${BASE}${path}`, { headers: { ...COMMON, Accept: "*/*", "Sec-Fetch-Site": "same-origin" }, responseType: "none", tags: { kind: "download", name } });
  return check(res, { [`${name}: status 200`]: (r) => r.status === 200 });
}
