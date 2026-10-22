#!/usr/bin/env node
/*
 * After a run: checks what was stored against what k6 was told, and gathers the run's numbers.
 *
 *   node loadtest/tools/report.mjs <run-dir>
 *
 * Reads, from <run-dir>: summary.json (k6), smtp-stats.json, monitor.jsonl, probe.jsonl, nginx-access.log,
 * nginx-error.log and next.log. Checks in MongoDB (MONGODB_URI) that:
 *   - every person k6 saw registered is stored exactly once (workshop: one per e-mail address;
 *     hackathon: one per team, and nobody in two teams) and every saved enquiry is stored;
 *   - the confirmation e-mails and organiser notices reached the SMTP sink, and no visitor address got
 *     more than the site's limit of 3 a day.
 * Writes report.json and report.md to <run-dir> and exits non-zero if a check fails.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

const dir = process.argv[2];
if (!dir) throw new Error("Usage: node report.mjs <run-dir>");
const file = (name) => path.join(dir, name);
const lines = (name) => (existsSync(file(name)) ? readFileSync(file(name), "utf8").split("\n").filter(Boolean) : []);
const json = (name) => (existsSync(file(name)) ? JSON.parse(readFileSync(file(name), "utf8")) : null);

const pct = (sorted, p) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] : 0);
const sortNum = (xs) => xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);

/* ---- k6 ---------------------------------------------------------------------------------------- */
const summary = json("summary.json");
const metric = (key) => summary?.metrics[key]?.values ?? {};
const k6count = (key) => metric(key).count ?? 0;
const expected = {
  workshop: k6count("people_registered{form:workshop}"),
  hackathon: k6count("people_registered{form:hackathon}"),
  enquiries: k6count("submissions{form:enquiry,outcome:ok}"),
};
const failedThresholds = summary
  ? Object.entries(summary.metrics).flatMap(([k, m]) => Object.entries(m.thresholds ?? {}).filter(([, t]) => !t.ok).map(([t]) => `${k}: ${t}`))
  : ["no k6 summary"];

/* ---- MongoDB ----------------------------------------------------------------------------------- */
// The next run empties the database, so `--reuse-db` takes these from the run's earlier report.json.
async function readDb() {
  await mongoose.connect(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/aaiw-loadtest", { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;
  const duplicates = async (collection, field) => (await db.collection(collection).aggregate([{ $group: { _id: field, n: { $sum: 1 } } }, { $match: { n: { $gt: 1 } } }]).toArray()).length;
  const out = {
    stored: {
      workshop: await db.collection("registrations").countDocuments(),
      hackathon: await db.collection("hackathonregistrations").countDocuments(),
      enquiries: await db.collection("enquiries").countDocuments(),
    },
    dupEmails: await duplicates("registrations", "$email"),
    dupTeams: await duplicates("hackathonregistrations", "$teamKey"),
    inTwoTeams: (
      await db
        .collection("hackathonregistrations")
        .aggregate([{ $unwind: "$members" }, { $group: { _id: "$members.email", teams: { $addToSet: "$_id" } } }, { $match: { "teams.1": { $exists: true } } }])
        .toArray()
    ).length,
    emailSentFlags: {
      workshop: await db.collection("registrations").countDocuments({ emailSent: true }),
      hackathon: await db.collection("hackathonregistrations").countDocuments({ emailSent: true }),
    },
  };
  await mongoose.disconnect();
  return out;
}
const dbState = process.argv.includes("--reuse-db") ? json("report.json").db : await readDb();
const { stored, dupEmails, dupTeams, inTwoTeams, emailSentFlags } = dbState;

/* ---- E-mail -------------------------------------------------------------------------------------- */
const smtp = json("smtp-stats.json") ?? { byKind: {}, perRecipient: {} };
const kind = (k) => smtp.byKind?.[k] ?? 0;
const visitorMax = Math.max(0, ...Object.entries(smtp.perRecipient ?? {}).filter(([a]) => a !== "organisers@example.com").map(([, n]) => n));

/* ---- nginx --------------------------------------------------------------------------------------- */
const access = lines("nginx-access.log").map((l) => {
  const [ip, status, method, uri, rt, urt, , cache] = l.split(" ");
  return { ip, status: Number(status), method, uri: uri.replace(/"/g, ""), rt: Number(rt) * 1000, urt: Number(urt) * 1000, cache };
});
// With the tuned nginx profile: how requests were answered (HIT from the micro-cache, MISS from Next.js,
// "-" from disk or not cacheable).
const cacheStatus = {};
for (const r of access) if (r.cache !== undefined) cacheStatus[r.cache] = (cacheStatus[r.cache] ?? 0) + 1;
const statuses = {};
for (const r of access) statuses[r.status] = (statuses[r.status] ?? 0) + 1;
const perIp = {};
for (const r of access) perIp[r.ip] = (perIp[r.ip] ?? 0) + 1;
const classify = (r) =>
  r.method === "POST" && r.uri.startsWith("/api/admin") ? "admin" : r.method === "POST" ? "submit" : r.uri.startsWith("/_next/") || /\.(js|css|woff2|png|svg|webp|webmanifest)$/.test(r.uri) ? "static" : r.uri.startsWith("/api/admin") ? "admin" : r.uri.startsWith("/api/") ? "api" : "page";
const upstream = {};
for (const r of access) (upstream[classify(r)] ??= []).push(r.urt);
const upstreamStats = Object.fromEntries(Object.entries(upstream).map(([k, xs]) => {
  const s = sortNum(xs);
  return [k, { count: xs.length, p50: Math.round(pct(s, 50)), p95: Math.round(pct(s, 95)), p99: Math.round(pct(s, 99)), max: Math.round(s.at(-1) ?? 0) }];
}));
// Time from nginx receiving a request to sending its last byte: what the server side took, including
// waiting on Next.js, but not the load generator's own delays (which grow when its CPUs are saturated).
const atNginx = {};
for (const r of access) (atNginx[classify(r)] ??= []).push(r.rt);
const nginxStats = Object.fromEntries(Object.entries(atNginx).map(([k, xs]) => {
  const s = sortNum(xs);
  return [k, { count: xs.length, p50: Math.round(pct(s, 50)), p95: Math.round(pct(s, 95)), p99: Math.round(pct(s, 99)), max: Math.round(s.at(-1) ?? 0) }];
}));
const errorLog = lines("nginx-error.log");
const nginxErrors = {
  workerConnections: errorLog.filter((l) => l.includes("worker_connections are not enough")).length,
  upstreamTimeout: errorLog.filter((l) => l.includes("upstream timed out")).length,
  upstreamRefused: errorLog.filter((l) => l.includes("connect() failed")).length,
  other: errorLog.filter((l) => /\[(error|crit|alert|emerg)\]/.test(l) && !/worker_connections|upstream timed out|connect\(\) failed/.test(l)).length,
};

/* ---- Next.js log --------------------------------------------------------------------------------- */
const nextLog = lines("next.log");
const nextErrors = {
  serverErrors: nextLog.filter((l) => /^\s*(⨯|Error|\[register\]|\[hackathon\/register\]|\[enquiries\])/.test(l)).length,
  mailFailures: nextLog.filter((l) => l.includes("[mail] failed")).length,
  mailLimited: nextLog.filter((l) => l.includes("[mail] daily limit")).length,
  fallbackContent: nextLog.filter((l) => l.includes("using fallback content")).length,
};

/* ---- Resources ----------------------------------------------------------------------------------- */
// Only the run itself (plus the 10 s run.sh waits for e-mails after it).
const allSamples = lines("monitor.jsonl").map((l) => JSON.parse(l));
const runEnds = (allSamples[0]?.t ?? 0) + (summary?.state?.testRunDurationMs ?? Infinity) + 15_000;
const samples = allSamples.filter((s) => s.t <= runEnds);
const resources = {};
for (const g of ["next", "mongod", "nginx", "smtp", "k6"]) {
  const cpu = samples.map((s) => s.cpu[g] ?? 0);
  const rss = samples.map((s) => s.rssMb[g] ?? 0);
  resources[g] = { cpuAvg: Math.round(cpu.reduce((a, b) => a + b, 0) / (cpu.length || 1)), cpuPeak: Math.round(Math.max(0, ...cpu)), rssPeakMb: Math.max(0, ...rss) };
}
const conns = Object.fromEntries(["nginx", "next", "mongod"].map((k) => [k, Math.max(0, ...samples.map((s) => s.conns[k] ?? 0))]));

/* ---- Browser probe ------------------------------------------------------------------------------- */
const probe = lines("probe.jsonl").map((l) => JSON.parse(l));
const probeStat = (k) => {
  const s = sortNum(probe.map((p) => p[k]));
  return { p50: Math.round(pct(s, 50)), p95: Math.round(pct(s, 95)), max: Math.round(s.at(-1) ?? 0) };
};
const browser = probe.length
  ? {
      attempts: probe.length,
      registered: probe.filter((p) => p.outcome === "registered").length,
      filledIn: probe.filter((p) => p.ok).length,
      failures: probe.filter((p) => !p.ok).map((p) => p.outcome ?? p.error).slice(0, 5),
      ttfb: probeStat("ttfb"),
      load: probeStat("load"),
      lcp: probeStat("lcp"),
      submit: probeStat("submit"),
    }
  : null;

/* ---- Checks -------------------------------------------------------------------------------------- */
const checks = [
  // The browser probe registers for the workshop too.
  ["every registered person is stored once (workshop)", stored.workshop === expected.workshop + (browser?.registered ?? 0), `${stored.workshop} stored, ${expected.workshop} expected from k6 + ${browser?.registered ?? 0} from the browser probe`],
  ["every registered team is stored once (hackathon)", stored.hackathon === expected.hackathon, `${stored.hackathon} stored, ${expected.hackathon} expected`],
  ["every saved enquiry is stored", stored.enquiries === expected.enquiries, `${stored.enquiries} stored, ${expected.enquiries} expected`],
  ["no e-mail address registered twice", dupEmails === 0, `${dupEmails} duplicates`],
  ["no team name registered twice", dupTeams === 0, `${dupTeams} duplicates`],
  ["nobody in two teams", inTwoTeams === 0, `${inTwoTeams} people`],
  ["a confirmation e-mail for every workshop registration", kind("workshop-confirmation") >= stored.workshop && emailSentFlags.workshop === stored.workshop, `${kind("workshop-confirmation")} sent, ${emailSentFlags.workshop}/${stored.workshop} marked sent`],
  ["a confirmation e-mail for every team", kind("team-confirmation") === stored.hackathon && emailSentFlags.hackathon === stored.hackathon, `${kind("team-confirmation")} sent, ${emailSentFlags.hackathon}/${stored.hackathon} marked sent`],
  ["organisers told of every team", kind("organiser-team-notice") === stored.hackathon, `${kind("organiser-team-notice")} notices`],
  ["an acknowledgement and an organiser notice for every enquiry", kind("enquiry-ack") === stored.enquiries && kind("organiser-enquiry-notice") === stored.enquiries, `${kind("enquiry-ack")} acks, ${kind("organiser-enquiry-notice")} notices`],
  ["no visitor address got more than 3 e-mails", visitorMax <= 3, `max ${visitorMax}`],
  ["no server errors (5xx) at nginx", !Object.keys(statuses).some((s) => s >= 500), Object.entries(statuses).filter(([s]) => s >= 500).map(([s, n]) => `${s}×${n}`).join(", ") || "none"],
  ["nginx had enough connections", nginxErrors.workerConnections === 0, `${nginxErrors.workerConnections} "worker_connections are not enough"`],
  ["no errors logged by the site", nextErrors.serverErrors === 0 && nextErrors.mailFailures === 0, `${nextErrors.serverErrors} errors, ${nextErrors.mailFailures} mail failures`],
];
const integrityOk = checks.every(([, ok]) => ok);

const report = {
  run: path.basename(dir),
  k6: { thresholdsMet: failedThresholds.length === 0, failedThresholds },
  expected,
  stored,
  emails: { ...smtp.byKind, total: smtp.messages ?? 0, peakSmtpConnections: smtp.peakOpen ?? 0, smtpConnections: smtp.connections ?? 0, visitorMax },
  nginx: { requests: access.length, distinctClientIps: Object.keys(perIp).length, maxRequestsFromOneIp: Math.max(0, ...Object.values(perIp)), statuses, requestMs: nginxStats, upstreamMs: upstreamStats, errors: nginxErrors, cacheStatus },
  next: nextErrors,
  resources,
  peakConnections: conns,
  browser,
  db: dbState,
  checks: checks.map(([name, ok, detail]) => ({ name, ok, detail })),
  integrityOk,
};
writeFileSync(file("report.json"), JSON.stringify(report, null, 1));

const md = [
  `### ${report.run}`,
  "",
  "```",
  existsSync(file("summary.txt")) ? readFileSync(file("summary.txt"), "utf8").trimEnd() : "(no k6 summary)",
  "```",
  "",
  `nginx: ${access.length} requests from ${report.nginx.distinctClientIps} client IPs (max ${report.nginx.maxRequestsFromOneIp} from one); statuses ${Object.entries(statuses).map(([s, n]) => `${s}×${n}`).join(", ")}.`,
  Object.keys(cacheStatus).length ? `nginx micro-cache: ${Object.entries(cacheStatus).map(([k, n]) => `${k === "-" ? "not cached (disk, API)" : k}×${n}`).join(", ")}.` : "",
  `Time at nginx, request to last byte (ms): ${Object.entries(nginxStats).map(([k, v]) => `${k} p50 ${v.p50} / p95 ${v.p95} / p99 ${v.p99}`).join("; ")}.`,
  `Time in Next.js (nginx upstream, ms): ${Object.entries(upstreamStats).map(([k, v]) => `${k} p50 ${v.p50} / p95 ${v.p95} / p99 ${v.p99} / max ${v.max}`).join("; ")}.`,
  `CPU % (avg / peak, 100 = one core): ${Object.entries(resources).map(([k, v]) => `${k} ${v.cpuAvg}/${v.cpuPeak}`).join(", ")}. Peak memory MB: ${Object.entries(resources).map(([k, v]) => `${k} ${v.rssPeakMb}`).join(", ")}.`,
  `Peak connections: nginx ${conns.nginx}, Next.js ${conns.next}, MongoDB ${conns.mongod}. SMTP: ${report.emails.total} e-mails over ${report.emails.smtpConnections} connections (peak ${report.emails.peakSmtpConnections} open at once).`,
  browser ? `Real browser (Chromium): ${browser.filledIn}/${browser.attempts} attempts loaded and filled in the form, ${browser.registered} registered; page load p50 ${browser.load.p50} ms / p95 ${browser.load.p95} ms; LCP p50 ${browser.lcp.p50} ms / p95 ${browser.lcp.p95} ms; submit to confirmation p50 ${browser.submit.p50} ms / p95 ${browser.submit.p95} ms.${browser.failures.length ? ` Failures: ${browser.failures.join("; ")}` : ""}` : "",
  "",
  "| Data check | | |",
  "| --- | --- | --- |",
  ...checks.map(([name, ok, detail]) => `| ${name} | ${ok ? "✅" : "❌"} | ${detail} |`),
  "",
].join("\n");
writeFileSync(file("report.md"), md);
console.log(md);
process.exitCode = integrityOk ? 0 : 1;
