#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[setup-db] Project root: $ROOT_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "[setup-db] Installing npm dependencies..."
  npm ci
else
  echo "[setup-db] node_modules exists — skipping npm install"
fi

# Ensure .env exists (do not overwrite existing .env)
if [ ! -f .env ]; then
  if [ -f .env.production ]; then
    echo "[setup-db] .env not found — copying .env.production to .env (edit as needed)."
    cp .env.production .env
    echo "[setup-db] Please review .env and set secure values (DATABASE_URL, keys)."
  else
    echo "[setup-db] ERROR: no .env or .env.production found. Create a .env with DATABASE_URL."
    exit 1
  fi
else
  echo "[setup-db] .env already exists"
fi

# Extract DATABASE_URL from .env
DATABASE_URL_LINE=$(grep -m1 '^DATABASE_URL=' .env || true)
if [ -z "$DATABASE_URL_LINE" ]; then
  echo "[setup-db] ERROR: DATABASE_URL not set in .env. Please set it and re-run."
  exit 1
fi

# Remove surrounding quotes if present
DATABASE_URL=$(echo "$DATABASE_URL_LINE" | sed -E 's/^DATABASE_URL=(.*)$/\1/' | sed -E 's/^"(.*)"$/\1/')
export DATABASE_URL

echo "[setup-db] Using DATABASE_URL (masked): ${DATABASE_URL:0:20}..."

echo "[setup-db] Applying committed migrations (prisma migrate deploy)"
npx prisma migrate deploy

echo "[setup-db] Generating Prisma client"
npx prisma generate

echo "[setup-db] Done. Start dev server with: npm run dev"
