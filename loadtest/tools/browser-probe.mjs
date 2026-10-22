#!/usr/bin/env node
/*
 * Real people in a real browser while k6 applies the load: headless Chromium (Playwright) opens the
 * registration page with nothing cached, fills in the three steps of the form and sends it, again and
 * again. Each attempt is a line in PROBE_OUT: how long the page took (time to first byte, DOM ready,
 * load, largest contentful paint) and how long the registration took to confirm.
 *
 *   BASE_URL=https://localhost PROBE_SECONDS=120 PROBE_WORKERS=2 PROBE_OUT=probe.jsonl node browser-probe.mjs
 *
 * Needs Playwright with Chromium (PLAYWRIGHT_MODULE names its entry file if it isn't installed here).
 */
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import path from "node:path";

const BASE = (process.env.BASE_URL ?? "https://localhost").replace(/\/+$/, "");
const SECONDS = Number(process.env.PROBE_SECONDS ?? 120);
const WORKERS = Number(process.env.PROBE_WORKERS ?? 2);
const OUT = process.env.PROBE_OUT ?? "probe.jsonl";
const RUN = process.env.RUN_ID ?? String(Date.now() % 1e8);

async function loadPlaywright() {
  if (process.env.PLAYWRIGHT_MODULE) return import(process.env.PLAYWRIGHT_MODULE);
  try {
    return await import("playwright");
  } catch {
    const root = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
    return import(path.join(root, "playwright", "index.mjs"));
  }
}

async function attempt(browser, n) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1366, height: 800 } });
  const page = await context.newPage();
  const row = { at: new Date().toISOString(), ok: false };
  try {
    await page.goto(`${BASE}/register`, { waitUntil: "load", timeout: 60_000 });
    Object.assign(
      row,
      await page.evaluate(
        () =>
          new Promise((resolve) => {
            const nav = performance.getEntriesByType("navigation")[0];
            let lcp = 0;
            new PerformanceObserver((list) => (lcp = list.getEntries().at(-1)?.startTime ?? lcp)).observe({ type: "largest-contentful-paint", buffered: true });
            setTimeout(() => resolve({ ttfb: Math.round(nav.responseStart), domReady: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), lcp: Math.round(lcp) }), 100);
          }),
      ),
    );
    await page.getByLabel("Full name").fill("Probe Person");
    await page.getByLabel("E-mail").fill(`aaiw-${RUN}-probe-${process.pid}-${n}@example.com`);
    await page.getByLabel("I am a…").selectOption("student");
    await page.getByLabel("Institution / organisation").fill("IIT Delhi");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("I agree to be contacted about this workshop").check();
    const sent = Date.now();
    await page.getByRole("button", { name: "Complete registration" }).click();
    // Either the confirmation, or a refusal or error in a toast (both sit in status regions).
    const outcome = await page
      .waitForFunction(
        () => {
          if ([...document.querySelectorAll("h2")].some((h) => h.textContent?.includes("registered!"))) return "registered";
          const toast = [...document.querySelectorAll('[role="status"]')].map((e) => e.textContent?.trim()).find(Boolean);
          return toast ? `refused: ${toast.slice(0, 120)}` : null;
        },
        null,
        { timeout: 60_000 },
      )
      .then((handle) => handle.jsonValue());
    row.submit = Date.now() - sent;
    row.outcome = outcome;
    row.ok = outcome === "registered";
  } catch (err) {
    row.error = String(err.message ?? err).split("\n")[0];
  } finally {
    await context.close();
  }
  appendFileSync(OUT, `${JSON.stringify(row)}\n`);
  return row;
}

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const until = Date.now() + SECONDS * 1000;
let n = 0;
await Promise.all(
  Array.from({ length: WORKERS }, async () => {
    while (Date.now() < until) {
      const row = await attempt(browser, n++);
      console.log(`[probe] ${row.ok ? "ok" : "FAILED"} load ${row.load ?? "-"} ms, lcp ${row.lcp ?? "-"} ms, submit ${row.submit ?? "-"} ms ${row.outcome ?? row.error ?? ""}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }),
);
await browser.close();
