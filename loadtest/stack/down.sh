#!/usr/bin/env bash
# Stops what up.sh started (MongoDB is left running).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RUN="${LOADTEST_RUN_DIR:-$ROOT/loadtest/.run}"

[[ -f "$RUN/nginx.pid" ]] && nginx -p "$RUN" -c "$RUN/nginx.conf" -s quit 2>/dev/null
for name in next smtp-sink; do
  if [[ -f "$RUN/$name.pid" ]]; then
    pid=$(cat "$RUN/$name.pid")
    pkill -TERM -P "$pid" 2>/dev/null
    kill -TERM "$pid" 2>/dev/null
    rm -f "$RUN/$name.pid"
  fi
done
# `next start` runs the server in a child process; make sure nothing is left on the port.
for _ in $(seq 1 20); do ss -ltn 'sport = :3000' | grep -q LISTEN || break; sleep 0.5; done
fuser -k 3000/tcp 2>/dev/null
sleep 1
echo "Stack stopped."
