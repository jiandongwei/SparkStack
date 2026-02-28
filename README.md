# Spark (Next.js) — Cloud Run + Google Authentication

This repository contains a Next.js application configured to run on Google Cloud Run and use Firebase/Google Authentication for user sign-in.

**Highlights**
- Next.js frontend (App Router)
- Firebase client for Google sign-in
- `firebase-admin` on the server for token verification and admin actions
- Deployable via Docker to Google Cloud Run

## Quick start (local)

1. Install deps and run dev server:

```bash
npm install
npm run dev
```

2. Open http://localhost:3000

The app uses the Firebase web SDK in the browser, so ensure client-side Firebase env vars (see below) are available when running locally.

## Environment variables

Required (client-side, prefixed with `NEXT_PUBLIC_` and used by the browser):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Required (server-side):

- `FIREBASE_ADMIN_PROJECT_ID` — service account `project_id` or leave blank if using default credentials
- `FIREBASE_ADMIN_CLIENT_EMAIL` — service account `client_email`
- `FIREBASE_ADMIN_PRIVATE_KEY` — service account `private_key` (replace newlines with `\\n` when storing in env)
- Alternatively set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON file path (Cloud Run / local fallback)
- `DATABASE_URL` or `DATABASE_URL_POOL` — Prisma/Postgres database connection string

Optional:

- `PORT` — port for the container (Dockerfile uses `8080` for Cloud Run)
- `NODE_ENV` — `production` or `development`

Secrets: for Cloud Run prefer using Secret Manager and mounting or wiring secrets via `--set-secrets` or the Cloud Console.

## Firebase setup (high-level)

1. Create a Firebase project in the Firebase Console.
2. In *Project settings → Your apps*, register a Web app and copy the Firebase config values into your `NEXT_PUBLIC_...` env vars.
3. In *Project settings → Service accounts*, create a new service account key (JSON). Use the `client_email`, `project_id` and `private_key` fields to populate the server env vars above, or set `GOOGLE_APPLICATION_CREDENTIALS` to the JSON file on your runtime.

Notes:
- `lib/firebaseClient.ts` expects the `NEXT_PUBLIC_FIREBASE_*` client vars.
- `lib/firebaseAdmin.ts` will initialize `firebase-admin` using `FIREBASE_ADMIN_*` env vars or fall back to default credentials (e.g., `GOOGLE_APPLICATION_CREDENTIALS`).

## Database / Prisma

- The project uses Prisma. Provide `DATABASE_URL` (for migrations) or `DATABASE_URL_POOL` (pooled runtime URL for Neon). See `lib/prisma.ts`.
- To run migrations locally (if applicable):

```bash
npx prisma migrate deploy
```

Or to push the schema for development:

```bash
npx prisma db push
```

## Build & run with Docker (Cloud Run friendly)

The included `Dockerfile` builds a production Next.js standalone image and exposes port `8080`.

Build locally:

```bash
# from repo/spark
docker build -t gcr.io/PROJECT_ID/spark:latest .
```

Run locally:

```bash
docker run -p 8080:8080 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=... \
  -e FIREBASE_ADMIN_PROJECT_ID=... \
  -e FIREBASE_ADMIN_CLIENT_EMAIL=... \
  -e FIREBASE_ADMIN_PRIVATE_KEY=... \
  -e DATABASE_URL=... \
  gcr.io/PROJECT_ID/spark:latest
```

## Deploy to Google Cloud Run

1. Build and push the image (replace `PROJECT_ID` and `REGION`):

```bash
# build and push
docker build -t gcr.io/PROJECT_ID/spark:latest .
docker push gcr.io/PROJECT_ID/spark:latest
```

2. Deploy to Cloud Run:

```bash
gcloud run deploy spark \
  --image gcr.io/PROJECT_ID/spark:latest \
  --region REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_FIREBASE_API_KEY=...,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...,DATABASE_URL=...
```

For production, wire secrets via Secret Manager and configure `--set-secrets` or set environment variables in the Cloud Run service settings.

## Deploy script (deploy.sh)

A convenience script `deploy.sh` is included at the repo root of `spark/`. It will build, push and deploy the container to Cloud Run using environment variables.

Example usage:

```bash
# make executable once
chmod +x deploy.sh

# configure values
export PROJECT_ID=your-gcp-project
export REGION=us-central1
export SERVICE_NAME=spark
export IMAGE_TAG=latest

# environment variables to pass to the service (comma-separated)
export ENV_VARS="NEXT_PUBLIC_FIREBASE_API_KEY=...,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...,DATABASE_URL=..."

# optional: secrets in Cloud Run Secret Manager format (comma-separated)
export SECRETS="FIREBASE_ADMIN_PRIVATE_KEY=projects/PROJECT_ID/secrets/FIREBASE_ADMIN_PRIVATE_KEY:latest"

# build, push and deploy
./deploy.sh
```

Notes:
- Run `gcloud auth login` and `gcloud auth configure-docker` before pushing images.
- For production, prefer using Secret Manager and the `SECRETS` env to map secrets into Cloud Run.

## Local debugging tips

- Use `npm run dev` for hot reload while developing.
- If using Firebase Emulator Suite locally, set client and server env vars accordingly and enable emulator endpoints in your local code (not committed to production).

## Useful files

- `Dockerfile` — production container for Cloud Run
- `deploy.sh` — build/push/deploy helper script
- `lib/firebaseClient.ts` — browser Firebase initialization
- `lib/firebaseAdmin.ts` — server Firebase admin initialization
- `lib/prisma.ts` — Prisma client and Neon/pooled DB handling
- `app/` — Next.js App Router pages and components

## Next steps / recommendations

- Configure a Google Cloud Secret for the Firebase service account and `DATABASE_URL`.
- Lock down Cloud Run service access if you do not want public unauthenticated access.
- Add CI that builds and deploys the image to Cloud Run on merges to your production branch.

If you want, I can also:
- add CI or a `gcloud`-based `deploy.sh` variant that uses Cloud Build,
- add Secret Manager wiring examples for Cloud Run, or
- run a quick lint/spell-check of this README.
