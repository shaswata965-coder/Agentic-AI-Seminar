/*
 * End-of-run summary: the full metrics as summary.json (read by tools/report.mjs) and a short table of
 * what matters as summary.txt, also printed.
 */
import { IP_MODE, OUT_DIR } from "./config.js";

const ms = (v) => (v === undefined ? "-" : v >= 1000 ? `${(v / 1000).toFixed(2)} s` : `${Math.round(v)} ms`);
const n = (v) => (v === undefined ? "-" : String(Math.round(v)));

function trendRow(data, key, label) {
  const m = data.metrics[key];
  if (!m) return null;
  const v = m.values;
  return `  ${label.padEnd(28)} ${n(v.count).padStart(7)}  med ${ms(v.med).padStart(8)}  p95 ${ms(v["p(95)"]).padStart(8)}  p99 ${ms(v["p(99)"]).padStart(8)}  max ${ms(v.max).padStart(8)}`;
}

const count = (data, key) => data.metrics[key]?.values.count ?? 0;

export function summarise(scenario) {
  return (data) => {
    const failed = Object.entries(data.metrics)
      .filter(([, m]) => m.thresholds && Object.values(m.thresholds).some((t) => !t.ok))
      .map(([k, m]) => `${k} ${Object.entries(m.thresholds).filter(([, t]) => !t.ok).map(([t]) => t).join(", ")}`);
    const lines = [
      `${scenario} · IP mode: ${IP_MODE}`,
      `  peak users ${n(data.metrics.vus_max?.values.max)} · requests ${n(count(data, "http_reqs"))} (${(data.metrics.http_reqs?.values.rate ?? 0).toFixed(1)}/s) · failed ${((data.metrics.http_req_failed?.values.rate ?? 0) * 100).toFixed(2)}% · checks ${((data.metrics.checks?.values.rate ?? 0) * 100).toFixed(2)}%`,
      "",
      "  Response times                 count      median        p95        p99        max",
      trendRow(data, "http_req_duration{kind:document}", "pages (HTML)"),
      trendRow(data, "page_ready", "page ready (HTML + files)"),
      trendRow(data, "http_req_duration{kind:asset}", "files (JS, fonts, images)"),
      trendRow(data, "http_req_duration{kind:prefetch}", "router prefetches"),
      trendRow(data, "http_req_duration{kind:submit}", "form submissions"),
      trendRow(data, "http_req_duration{kind:download}", "PDF / calendar"),
      trendRow(data, "http_req_duration{kind:admin}", "admin panel API"),
      "",
      "  Submissions      saved  duplicate  rate-limited  error",
      `  answers        ${n(count(data, "submissions{outcome:ok}")).padStart(7)}  ${n(count(data, "submissions{outcome:duplicate}")).padStart(9)}  ${n(count(data, "submissions{outcome:rate_limited}")).padStart(12)}  ${n(count(data, "submissions{outcome:error}")).padStart(5)}`,
      "  People           registered  blocked",
      ...["workshop", "hackathon", "enquiry"].map((f) => `  ${f.padEnd(15)} ${n(count(data, `people_registered{form:${f}}`)).padStart(10)}  ${n(count(data, `people_blocked{form:${f}}`)).padStart(7)}`),
      "",
      failed.length ? `  FAILED thresholds:\n${failed.map((f) => `    ✗ ${f}`).join("\n")}` : "  All thresholds met.",
    ].filter((l) => l !== null);
    const text = `${lines.join("\n")}\n`;
    const out = { stdout: `\n${text}` };
    if (OUT_DIR) {
      out[`${OUT_DIR}/summary.json`] = JSON.stringify(data, null, 1);
      out[`${OUT_DIR}/summary.txt`] = text;
    }
    return out;
  };
}
