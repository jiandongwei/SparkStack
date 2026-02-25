import React from 'react';

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 prose prose-zinc dark:prose-invert">
      <h1>🚀 SparkStack Deployment Guide</h1>
      <p>Next.js + Firebase Auth + Cloud Run + Firebase Hosting</p>

      <p>
        This guide documents the exact, working deployment pipeline for SparkStack.
        It covers building Next.js with environment variables, deploying to Cloud Run
        using Docker + Kaniko, configuring Firebase Hosting to proxy to Cloud Run,
        and avoiding common pitfalls (.gcloudignore, .dockerignore, static hosting conflicts).
      </p>

      <h2>📦 1. Project Structure</h2>
      <pre><code>{`spark/
  app/
  lib/
  public/
  Dockerfile
  .gcloudignore
  .env.production
  package.json
  next.config.ts
  firebase.json`}</code></pre>

      <h2>🔐 2. Environment Variables</h2>
      <p>Create a file:</p>
      <pre><code>{`.env.production`}</code></pre>
      <p>Example:</p>
      <pre><code>{`NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...`}</code></pre>
      <p>These values are baked into the Next.js build during Docker build.</p>

      <h2>🧹 3. .gcloudignore (critical)</h2>
      <p>Cloud Build ignores files by default, including <code>.env.*</code>, unless you override it.</p>
      <p>Create:</p>
      <pre><code>{`.gcloudignore`}</code></pre>
      <p>Contents:</p>
      <pre><code>{`# Allow env files
!.env.production
!.env.local

# Ignore only what we truly don't want
node_modules
.next
.git`}</code></pre>

      <h2>🐳 4. Dockerfile (Next.js → Cloud Run)</h2>
      <p>Use the official Next.js standalone output:</p>
      <pre><code>{`# Build stage
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
CMD ["node", "server.js"]`}</code></pre>

      <h2>🏗 5. Enable Kaniko (recommended)</h2>
      <pre><code>{`gcloud config set builds/use_kaniko True`}</code></pre>

      <h2>🚢 6. Build & Deploy to Cloud Run</h2>
      <p>From inside the <code>spark/</code> directory:</p>
      <pre><code>{`gcloud builds submit --tag gcr.io/<PROJECT_ID>/next-app`}</code></pre>
      <p>Then deploy:</p>
      <pre><code>{`gcloud run deploy next-app \
  --image gcr.io/<PROJECT_ID>/next-app \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated`}</code></pre>
      <p>Cloud Run URL will look like:</p>
      <pre><code>{`https://next-app-<PROJECT_ID>.us-central1.run.app`}</code></pre>
      <p>This URL should show correct env vars at <code>/debug</code>.</p>

      <h2>🌐 7. Firebase Hosting → Cloud Run Proxy</h2>
      <p>To make spark-stack.web.app serve the Cloud Run app, use this <code>firebase.json</code>:</p>
      <pre><code>{`{
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
}`}</code></pre>
      <p><strong>Important:</strong> Do not include <code>"public": "."</code> — it causes Firebase Hosting to serve static files instead of Cloud Run.</p>
      <p>Deploy:</p>
      <pre><code>{`firebase deploy --only hosting`}</code></pre>

      <h2>🧪 8. Debugging</h2>
      <p>Visit:</p>
      <pre><code>{`/debug`}</code></pre>
      <p>You should see:</p>
      <pre><code>{`{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}`}</code></pre>
      <p>If you see <code>{`{}`}</code>:</p>
      <ul>
        <li>Firebase Hosting is serving static files (remove <code>"public"</code>)</li>
        <li>Cloud Build is ignoring env files (fix <code>.gcloudignore</code>)</li>
        <li>Dockerfile is not copying the standalone output correctly</li>
      </ul>

      <h2>🎉 9. Summary</h2>
      <p>
        You now have a fully working deployment pipeline: Next.js built with <code>.env.production</code>,
        Docker + Kaniko build on Cloud Build, Cloud Run serving the app, Firebase Hosting proxying to Cloud Run,
        and correct env vars everywhere.
      </p>
    </main>
  );
}

