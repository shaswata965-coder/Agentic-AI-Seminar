#!/usr/bin/env bash
# Runs the load tests end to end, each on a fresh stack and an empty database:
#   prepare the database → start nginx, Next.js and the SMTP sink → "Refresh website" → k6 (and a real
#   browser at the busiest moment) → check the database and e-mails against what k6 saw → report.
#
#   loadtest/run.sh                                   # every scenario in every IP mode
#   loadtest/run.sh submission:distinct contest:shared
#   SCALE=0.05 PACE=0.2 loadtest/run.sh daily:distinct   # quick smoke run
#   NGINX_PROFILE=plain LABEL=plain loadtest/run.sh submission:distinct   # the README's earlier nginx (stack/up.sh)
#   ARRIVAL=600 LABEL=10min loadtest/run.sh submission:distinct          # the 2,000 arrive over 10 minutes
#   RATE_LIMIT_EXEMPT=127.20.0.1 LABEL=exempt loadtest/run.sh contest:shared   # the shared address exempt
#
# Scenarios: daily (100 users), submission (2,000), contest (300 → 400). IP modes:
#   distinct  every user has an address of their own (127.10.0.0/20)
#   shared    every user behind one address, like one campus or office NAT (127.20.0.1)
#   campus    one user in four behind one of 10 campus NAT addresses, the rest on their own
# Users get their addresses from k6 --local-ips; nginx sees them as the client address and passes it on
# in X-Forwarded-For, as in production. Linux routes all of 127.0.0.0/8 to the loopback interface, so
# no setup is needed.
#
# Needs: Linux, root (nginx on :443), nginx, k6, MongoDB running at MONGODB_URI, Node.js, and a
# production build (NEXT_PUBLIC_SITE_URL=https://localhost npm run build). Playwright with Chromium for
# the browser probe (PROBE=0 skips it). Results go to loadtest/results/<time>/<scenario>-<mode>/.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/aaiw-loadtest}"
RUN_DIR="${LOADTEST_RUN_DIR:-$ROOT/loadtest/.run}"
RESULTS="${RESULTS_DIR:-$ROOT/loadtest/results/$(date +%Y%m%d-%H%M%S)}"
SERVER_CPUS="${SERVER_CPUS:-}"   # e.g. 0,1: the stack gets these CPUs …
K6_CPUS="${K6_CPUS:-}"           # … and k6, the monitor and the browser get these
SCALE="${SCALE:-1}"
PACE="${PACE:-1}"
PROBE="${PROBE:-1}"
export SERVER_CPUS

RUNS=("$@")
[[ ${#RUNS[@]} -gt 0 ]] || RUNS=(daily:distinct daily:shared submission:distinct submission:shared submission:campus contest:distinct contest:shared)

# Prefix for commands on the load generator's CPUs. An array, not a function, so that `$!` of a command
# started in the background is the command itself (taskset execs it), and killing it stops it.
PIN=()
[[ -n "$K6_CPUS" ]] && PIN=(taskset -c "$K6_CPUS")
scaled() { node -e "console.log(Math.max(1, Math.round($1 * $PACE)))"; }
ulimit -n "$(ulimit -Hn)" 2>/dev/null || true

# The addresses k6 hands to its virtual users, in order (k6 wraps round if there are more users).
local_ips() {
  case "$1" in
    distinct) echo "127.10.0.0/20" ;;
    shared) echo "127.20.0.1" ;;
    campus) node -e '
      const out = [];
      for (let i = 0; i < 4000; i++) out.push(i % 4 === 3 ? `127.30.0.${1 + (((i - 3) / 4) % 10)}` : `127.11.${1 + Math.floor(i / 200)}.${1 + (i % 200)}`);
      console.log(out.join(","));' ;;
    *) echo "Unknown IP mode: $1" >&2; exit 2 ;;
  esac
}

# When the browser probe runs: the busiest part of each scenario (seconds after k6 starts, how long).
probe_window() {
  case "$1" in
    daily) echo "90 240" ;;
    submission) echo "40 120" ;;
    contest) echo "360 240" ;;
  esac
}

refresh_website() {
  local jar="$RUN_DIR/admin.cookies"
  curl -sk -c "$jar" -o /dev/null -X POST https://localhost/api/admin/auth/login -H 'content-type: application/json' -H 'origin: https://localhost' \
    -d '{"email":"loadtest-admin@example.com","password":"Load-test-organiser-2026"}'
  curl -sk -b "$jar" -o /dev/null -w "Refresh website: %{http_code}\n" -X POST https://localhost/api/admin/revalidate -H 'origin: https://localhost'
  rm -f "$jar"
  # Render each page once, as a site that has been up for a while has.
  for p in / /about /programme /speakers /register /hackathon /partners /venue /organisers /tutorials /api/programme/pdf; do
    curl -sk -o /dev/null "https://localhost$p"; curl -sk -o /dev/null "https://localhost$p"
  done
}

mkdir -p "$RESULTS"
echo "Results: $RESULTS"
for spec in "${RUNS[@]}"; do
  scenario="${spec%%:*}"
  mode="${spec#*:}"
  out="$RESULTS/$scenario-$mode${LABEL:+-$LABEL}"
  mkdir -p "$out"
  echo "=== $scenario · $mode ==="

  loadtest/stack/down.sh >/dev/null 2>&1 || true
  node loadtest/tools/prepare.mjs >"$out/prepare.log" 2>&1
  loadtest/stack/up.sh
  refresh_website
  : >"$RUN_DIR/logs/nginx-access.log"
  : >"$RUN_DIR/logs/nginx-error.log"
  nginx -p "$RUN_DIR" -c "$RUN_DIR/nginx.conf" -s reopen
  next_from=$(wc -l <"$RUN_DIR/logs/next.log")

  MONITOR_OUT="$out/monitor.jsonl" "${PIN[@]}" node loadtest/tools/monitor.mjs &
  monitor=$!
  probe=""
  if [[ "$PROBE" == 1 ]]; then
    read -r p_at p_len <<<"$(probe_window "$scenario")"
    (
      sleep "$(scaled "$p_at")"
      BASE_URL=https://localhost RUN_ID="probe$RANDOM" PROBE_SECONDS="$(scaled "$p_len")" PROBE_WORKERS=2 PROBE_OUT="$out/probe.jsonl" \
        "${PIN[@]}" node loadtest/tools/browser-probe.mjs >"$out/probe.log" 2>&1
    ) &
    probe=$!
  fi

  set +e
  "${PIN[@]}" k6 run --no-color --quiet \
    -e IP_MODE="$mode" -e RUN_ID="$(date +%s)" -e SCALE="$SCALE" -e PACE="$PACE" -e OUT_DIR="$out" \
    ${ARRIVAL:+-e ARRIVAL="$ARRIVAL"} ${USERS:+-e USERS="$USERS"} \
    --local-ips "$(local_ips "$mode")" \
    "loadtest/k6/$scenario.js" 2>&1 | tee "$out/k6.log" | grep -v '^\s*$' | grep -v 'level=warning' || true
  set -e

  [[ -n "$probe" ]] && wait "$probe" 2>/dev/null || true
  sleep 10 # e-mails are sent after each response
  kill -TERM "$monitor" 2>/dev/null; wait "$monitor" 2>/dev/null || true

  cp "$RUN_DIR/logs/nginx-access.log" "$RUN_DIR/logs/nginx-error.log" "$out/" 2>/dev/null || true
  tail -n +"$((next_from + 1))" "$RUN_DIR/logs/next.log" >"$out/next.log"
  cp "$RUN_DIR/smtp-stats.json" "$out/" 2>/dev/null || true
  loadtest/stack/down.sh >/dev/null 2>&1 || true
  cp "$RUN_DIR/smtp-stats.json" "$out/" 2>/dev/null || true
  node loadtest/tools/report.mjs "$out" >/dev/null || echo "  ✗ data checks failed: see $out/report.md"
  grep -E '^\| .*❌' "$out/report.md" || echo "  ✓ data checks passed"
done

cat "$RESULTS"/*/report.md >"$RESULTS/README.md"
echo "All reports: $RESULTS/README.md"
