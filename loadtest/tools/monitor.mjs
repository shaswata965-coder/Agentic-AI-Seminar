#!/usr/bin/env node
/*
 * Samples the stack every 2 seconds while a test runs (Linux /proc): CPU and memory of Next.js, MongoDB,
 * nginx, the SMTP sink and k6, and the open TCP connections to nginx (:443), Next.js (:3000) and MongoDB
 * (:27017). One JSON line per sample in MONITOR_OUT; stops on SIGTERM.
 */
import { appendFileSync, readdirSync, readFileSync } from "node:fs";

const OUT = process.env.MONITOR_OUT ?? "monitor.jsonl";
const EVERY = 2000;
const TICK = 100; // USER_HZ
const PAGE = 4096;
const GROUPS = {
  next: (comm) => comm.startsWith("next-server"),
  mongod: (comm) => comm === "mongod",
  nginx: (comm) => comm === "nginx",
  smtp: (comm, args) => comm === "node" && args.includes("smtp-sink"),
  k6: (comm) => comm === "k6",
};
const PORTS = { nginx: 443, next: 3000, mongod: 27017 };

function processes() {
  const out = [];
  for (const pid of readdirSync("/proc")) {
    if (!/^\d+$/.test(pid)) continue;
    try {
      const stat = readFileSync(`/proc/${pid}/stat`, "utf8");
      const comm = stat.slice(stat.indexOf("(") + 1, stat.lastIndexOf(")"));
      const f = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
      const args = readFileSync(`/proc/${pid}/cmdline`, "utf8").replace(/\0/g, " ");
      const group = Object.keys(GROUPS).find((g) => GROUPS[g](comm, args));
      if (group) out.push({ pid, group, ticks: Number(f[11]) + Number(f[12]), rss: Number(f[21]) * PAGE });
    } catch {}
  }
  return out;
}

function connections() {
  const counts = Object.fromEntries(Object.keys(PORTS).map((k) => [k, 0]));
  for (const file of ["/proc/net/tcp", "/proc/net/tcp6"]) {
    let lines = [];
    try {
      lines = readFileSync(file, "utf8").trim().split("\n").slice(1);
    } catch {}
    for (const line of lines) {
      const [, local, , state] = line.trim().split(/\s+/);
      if (state !== "01") continue; // ESTABLISHED
      const port = parseInt(local.split(":")[1], 16);
      for (const [k, p] of Object.entries(PORTS)) if (port === p) counts[k] += 1;
    }
  }
  return counts;
}

let last = new Map();
let lastAt = Date.now();
function sample() {
  const now = Date.now();
  const procs = processes();
  const cpu = {};
  const rss = {};
  for (const p of procs) {
    const before = last.get(p.pid);
    const used = before === undefined ? 0 : ((p.ticks - before) / TICK / ((now - lastAt) / 1000)) * 100;
    cpu[p.group] = Math.round(((cpu[p.group] ?? 0) + used) * 10) / 10;
    rss[p.group] = (rss[p.group] ?? 0) + p.rss;
  }
  last = new Map(procs.map((p) => [p.pid, p.ticks]));
  lastAt = now;
  const load = Number(readFileSync("/proc/loadavg", "utf8").split(" ")[0]);
  for (const k of Object.keys(rss)) rss[k] = Math.round(rss[k] / 1048576);
  appendFileSync(OUT, `${JSON.stringify({ t: now, cpu, rssMb: rss, conns: connections(), load })}\n`);
}

sample();
const timer = setInterval(sample, EVERY);
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => (clearInterval(timer), sample(), process.exit(0)));
