#!/usr/bin/env bash
set -euo pipefail

# Lightweight deploy helper for Cloud Run
# Usage:
#   export PROJECT_ID=your-gcp-project
#   export REGION=us-central1
#   export SERVICE_NAME=spark
#   export IMAGE_TAG=latest
#   export ENV_VARS="NEXT_PUBLIC_FIREBASE_API_KEY=...,DATABASE_URL=..."
#   export SECRETS="FIREBASE_ADMIN_PRIVATE_KEY=projects/PROJECT_ID/secrets/FIREBASE_ADMIN_PRIVATE_KEY:latest"
#   ./deploy.sh

PROJECT_ID=${PROJECT_ID:-}
REGION=${REGION:-us-central1}
SERVICE_NAME=${SERVICE_NAME:-spark}
IMAGE_TAG=${IMAGE_TAG:-latest}
ENV_VARS=${ENV_VARS:-}
SECRETS=${SECRETS:-}

if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID is required. Export PROJECT_ID or pass it in the environment."
  exit 2
fi

IMAGE=gcr.io/${PROJECT_ID}/${SERVICE_NAME}:${IMAGE_TAG}

echo "Building image ${IMAGE}..."

echo "Ensure gcloud is authenticated and Docker can push to gcr.io:"
echo "  gcloud auth login && gcloud auth configure-docker"

docker build -t "$IMAGE" .

echo "Pushing image..."
docker push "$IMAGE"

echo "Deploying to Cloud Run (${REGION})..."

DEPLOY_CMD=(gcloud run deploy "$SERVICE_NAME" --image "$IMAGE" --region "$REGION" --platform managed --allow-unauthenticated)

if [ -n "$ENV_VARS" ]; then
  DEPLOY_CMD+=(--set-env-vars "$ENV_VARS")
fi

if [ -n "$SECRETS" ]; then
  DEPLOY_CMD+=(--set-secrets "$SECRETS")
fi

# Run the deploy command
echo "Running: ${DEPLOY_CMD[*]}"
"${DEPLOY_CMD[@]}"

echo "Deployment complete. Use 'gcloud run services describe $SERVICE_NAME --region $REGION' to inspect."