#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$ROOT/.pids"
mkdir -p "$PID_DIR"

echo "Stopping Artefact Canvas…"
bash "$ROOT/stop.sh"

echo "Cleaning stale Vite/tsx processes…"
pkill -f "$ROOT/frontend/node_modules/.bin/vite" 2>/dev/null || true
pkill -f "$ROOT/backend/node_modules/.bin/tsx watch" 2>/dev/null || true
sleep 1

if [[ ! -f "$ROOT/.env" ]]; then
  cp "$ROOT/.env.example" "$ROOT/.env"
  echo "Created .env from .env.example"
fi

if ! docker compose -f "$ROOT/docker-compose.yml" ps postgres 2>/dev/null | grep -q "Up"; then
  echo "Starting PostgreSQL…"
  if docker ps -a --format '{{.Names}}' 2>/dev/null | grep -qx 'artefactcanvas-db'; then
    docker start artefactcanvas-db
  else
    docker compose -f "$ROOT/docker-compose.yml" up -d postgres
  fi
  sleep 2
fi

if [[ ! -d "$ROOT/backend/node_modules" ]]; then
  npm install --prefix "$ROOT/backend"
fi
if [[ ! -d "$ROOT/frontend/node_modules" ]]; then
  npm install --prefix "$ROOT/frontend"
fi

echo "Syncing database schema…"
npm run prisma:generate --prefix "$ROOT/backend"
npm run prisma:push --prefix "$ROOT/backend"
npm run seed --prefix "$ROOT/backend"

start_proc() {
  local name="$1"
  shift
  local log="$PID_DIR/$name.log"
  local pidfile="$PID_DIR/$name.pid"
  if [[ -f "$pidfile" ]] && kill -0 "$(cat "$pidfile")" 2>/dev/null; then
    echo "$name already running (pid $(cat "$pidfile"))"
    return
  fi
  nohup "$@" >"$log" 2>&1 &
  echo $! >"$pidfile"
  echo "Started $name (pid $(cat "$pidfile"), log $log)"
}

start_proc api npm run dev --prefix "$ROOT/backend"
start_proc frontend npm run dev --prefix "$ROOT/frontend"

sleep 2
API_PORT="$(grep -E '^API_PORT=' "$ROOT/.env" | cut -d= -f2 | tr -d '"' || echo 3089)"
if ! curl -sf "http://127.0.0.1:${API_PORT}/api/health" >/dev/null; then
  echo "WARN: API não responde em :${API_PORT} — veja $PID_DIR/api.log"
fi
if ! curl -sf "http://127.0.0.1:5175/" >/dev/null; then
  echo "WARN: Frontend não responde em :5175 — veja $PID_DIR/frontend.log"
fi

echo ""
echo "Artefact Canvas is up:"
echo "  App:  http://localhost:5175"
echo "  API:  http://localhost:${API_PORT}/api/health"
