🚀 SparkStack Deployment Guide
Next.js + Firebase Auth + Cloud Run + Firebase Hosting

This guide documents the exact, working deployment pipeline for SparkStack.
It covers:

Building Next.js with environment variables

Deploying to Cloud Run using Docker + Kaniko

Configuring Firebase Hosting to proxy to Cloud Run

Avoiding common pitfalls (.gcloudignore, .dockerignore, static hosting conflicts)

📦 1. Project Structure
Code
spark/
  app/
  lib/
  public/
  Dockerfile
  .gcloudignore
  .env.production
  package.json
  next.config.ts
  firebase.json
🔐 2. Environment Variables
Create a file:

Code
.env.production
Example:

Code
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
These values are baked into the Next.js build during Docker build.

🧹 3. .gcloudignore (critical)
Cloud Build ignores files by default, including .env.*, unless you override it.

Create:

Code
.gcloudignore
Contents:

Code
# Allow env files
!.env.production
!.env.local

# Ignore only what we truly don't want
node_modules
.next
.git
This ensures Cloud Build includes your env files.

🐳 4. Dockerfile (Next.js → Cloud Run)
Use the official Next.js standalone output:

dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
RUN npm run build

# Run stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080
CMD ["node", "server.js"]
🏗 5. Enable Kaniko (recommended)
Kaniko avoids Docker’s default ignore rules.

bash
gcloud config set builds/use_kaniko True
🚢 6. Build & Deploy to Cloud Run
From inside the spark/ directory:

bash
gcloud builds submit --tag gcr.io/<PROJECT_ID>/next-app
Then deploy:

bash
gcloud run deploy next-app \
  --image gcr.io/<PROJECT_ID>/next-app \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
Cloud Run URL will look like:

Code
https://next-app-<PROJECT_ID>.us-central1.run.app
This URL should show correct env vars at /debug.

🌐 7. Firebase Hosting → Cloud Run Proxy
To make spark-stack.web.app serve the Cloud Run app, use this firebase.json:

json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "run": {
          "serviceId": "next-app",
          "region": "us-central1"
        }
      }
    ]
  }
}
Important:  
Do not include "public": "." — it causes Firebase Hosting to serve static files instead of Cloud Run.

Deploy:

bash
firebase deploy --only hosting
Now:

Code
spark-stack.web.app → Cloud Run → correct env vars
🧪 8. Debugging
Visit:

Code
/debug
You should see:

json
{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}
If you see {}:

Firebase Hosting is serving static files (remove "public")

Cloud Build is ignoring env files (fix .gcloudignore)

Dockerfile is not copying the standalone output correctly

🎉 9. Summary
You now have a fully working deployment pipeline:

Next.js built with .env.production

Docker + Kaniko build on Cloud Build

Cloud Run serving the app

Firebase Hosting proxying to Cloud Run

Correct env vars everywhere

This setup is production‑grade, reproducible, and avoids all the common pitfalls.