#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$ROOT/.pids"

stop_one() {
  local name="$1"
  local pidfile="$PID_DIR/$name.pid"
  if [[ ! -f "$pidfile" ]]; then
    echo "$name: not running"
    return
  fi
  local pid
  pid="$(cat "$pidfile")"
  if kill -0 "$pid" 2>/dev/null; then
    pkill -P "$pid" 2>/dev/null || true
    kill "$pid" 2>/dev/null || true
    sleep 0.5
    pkill -9 -P "$pid" 2>/dev/null || true
    kill -9 "$pid" 2>/dev/null || true
    echo "Stopped $name (pid $pid)"
  else
    echo "$name: stale pid $pid"
  fi
  rm -f "$pidfile"
}

mkdir -p "$PID_DIR"
for svc in frontend api; do
  stop_one "$svc"
done

pkill -f "$ROOT/frontend/node_modules/.bin/vite" 2>/dev/null || true
pkill -f "$ROOT/backend/node_modules/.bin/tsx watch" 2>/dev/null || true

echo "All Artefact Canvas processes stopped."
