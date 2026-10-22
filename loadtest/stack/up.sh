#!/usr/bin/env bash
# Starts the stack under test on this machine, the way the README deploys it:
#   nginx (HTTPS :443, README server block)  →  next start (127.0.0.1:3000)  →  MongoDB
# plus an SMTP sink that receives the site's e-mails. Run from the repository root, as root (port 443),
# after `npm run build`. MongoDB must already be running at MONGODB_URI.
#
#   SERVER_CPUS=0,1 loadtest/stack/up.sh        # pin the server side to CPUs 0-1 (k6 gets the rest)
#   loadtest/stack/down.sh
#
# Settings (environment):
#   MONGODB_URI          default mongodb://127.0.0.1:27017/aaiw-loadtest
#   SERVER_CPUS          CPU list for nginx, Next.js and the SMTP sink (taskset), default: all
#   NGINX_WORKERS        nginx worker_processes, default: the number of SERVER_CPUS ("auto" on that box)
#   NGINX_CONNECTIONS    worker_connections, default 768 (Ubuntu's stock nginx.conf)
#   NGINX_PROFILE        readme (default): the README's server block in Ubuntu's stock nginx.conf;
#                        tuned: nginx.tuned.conf.template (build files from disk, more connections,
#                        a 2-second micro-cache; see that file)
#   SMTP_SINK_DELAY_MS   delay before the sink accepts each message, default 0
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RUN="${LOADTEST_RUN_DIR:-$ROOT/loadtest/.run}"
export MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/aaiw-loadtest}"
APP_PORT=3000
SMTP_PORT=2525
CPUS="${SERVER_CPUS:-}"
pin() { if [[ -n "$CPUS" ]]; then taskset -c "$CPUS" "$@"; else "$@"; fi; }
count_cpus() { local n=0 part; IFS=, read -ra parts <<<"$1"; for part in "${parts[@]}"; do if [[ $part == *-* ]]; then n=$((n + ${part#*-} - ${part%-*} + 1)); else n=$((n + 1)); fi; done; echo "$n"; }
WORKERS="${NGINX_WORKERS:-$([[ -n "$CPUS" ]] && count_cpus "$CPUS" || echo auto)}"

PROFILE="${NGINX_PROFILE:-readme}"
case "$PROFILE" in
  readme) TEMPLATE="$ROOT/loadtest/stack/nginx.conf.template" ;;
  tuned) TEMPLATE="$ROOT/loadtest/stack/nginx.tuned.conf.template" ;;
  *) echo "Unknown NGINX_PROFILE: $PROFILE" >&2; exit 2 ;;
esac

if [[ "$PROFILE" == tuned ]]; then
  # gzipped copies of the build files, which the tuned nginx serves as they are (gzip_static). In
  # production this is a deploy step after `npm run build`.
  find "$ROOT/.next/static" -type f \( -name '*.js' -o -name '*.css' \) -exec gzip -9 -k -f {} +
fi

rm -rf "$RUN/cache"
mkdir -p "$RUN"/{logs,tls,tmp,cache}
[[ -f .next/BUILD_ID ]] || { echo "No production build: run NEXT_PUBLIC_SITE_URL=https://localhost npm run build first." >&2; exit 1; }

# Self-signed certificate for localhost.
if [[ ! -f "$RUN/tls/cert.pem" ]]; then
  openssl req -x509 -newkey rsa:2048 -nodes -days 30 -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
    -keyout "$RUN/tls/key.pem" -out "$RUN/tls/cert.pem" 2>/dev/null
fi

# SMTP sink.
SMTP_SINK_PORT=$SMTP_PORT SMTP_SINK_STATS="$RUN/smtp-stats.json" pin node "$ROOT/loadtest/stack/smtp-sink.mjs" >"$RUN/logs/smtp-sink.log" 2>&1 &
echo $! >"$RUN/smtp-sink.pid"

# The site, as `npm start` runs it in production (Option B in the README).
(
  cd "$ROOT"
  export AUTH_SECRET="${AUTH_SECRET:-loadtest-secret-loadtest-secret-loadtest-0123456789}"
  export SMTP_HOST=127.0.0.1 SMTP_PORT=$SMTP_PORT SMTP_SECURE=false MAIL_FROM="Agentic AI Workshop 2026 <no-reply@example.com>"
  export NOTIFY_EMAIL=organisers@example.com NEXT_TELEMETRY_DISABLED=1
  pin npx next start -H 127.0.0.1 -p $APP_PORT >"$RUN/logs/next.log" 2>&1 &
  echo $! >"$RUN/next.pid"
)

# nginx with the README's server block (or the tuned one).
sed -e "s#@RUN@#$RUN#g" -e "s#@ROOT@#$ROOT#g" -e "s#@APP_PORT@#$APP_PORT#g" -e "s#@WORKERS@#$WORKERS#g" -e "s#@WORKER_CONNECTIONS@#${NGINX_CONNECTIONS:-768}#g" \
  "$TEMPLATE" >"$RUN/nginx.conf"
pin nginx -p "$RUN" -c "$RUN/nginx.conf"

for _ in $(seq 1 60); do
  if curl -skf https://localhost/api/health >/dev/null 2>&1; then
    echo "Stack is up: $(curl -sk https://localhost/api/health)  (nginx $PROFILE profile, workers: $WORKERS, CPUs: ${CPUS:-all})"
    exit 0
  fi
  sleep 1
done
echo "The site did not come up; see $RUN/logs/next.log" >&2
exit 1
