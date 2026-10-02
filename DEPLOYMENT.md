# Deploying RetroVoice

Backend → **Cloud Run**, frontend → **Firebase Hosting**, transcripts → **Cloud Storage**, analysis → **Vertex AI (Gemini)**.

## 1. Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud`)
- [Firebase CLI](https://firebase.google.com/docs/cli) (`firebase`)
- Node.js 20+

## 2. Set deployment variables

```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"
export BUCKET_NAME="retrovoice-transcripts-${PROJECT_ID}"
export SERVICE_NAME="retrovoice-backend"
export SERVICE_ACCOUNT_NAME="retrovoice-backend"
export SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
export GEMINI_MODEL="gemini-3.8-flash"
export FRONTEND_SITE_ID=${PROJECT_ID}
```

## 3. Authenticate

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project "$PROJECT_ID"
firebase login
```

## 4. Enable APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  storage.googleapis.com \
  aiplatform.googleapis.com
```

## 5. Create the transcript bucket

```bash
gcloud storage buckets create "gs://${BUCKET_NAME}" \
  --location="$REGION" \
  --uniform-bucket-level-access
```

## 6. Service account and permissions

```bash
gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
  --display-name="RetroVoice Backend"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/logging.logWriter"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/aiplatform.user"

gcloud storage buckets add-iam-policy-binding "gs://${BUCKET_NAME}" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/storage.objectAdmin"
```

## 7. Verify the backend locally

```bash
cd backend
npm install
npm test
npm run build
```

## 8. Deploy the backend to Cloud Run

Keep `FRONTEND_ORIGIN` on localhost for the first deploy; update it in step 11.

```bash
cd backend

gcloud run deploy "$SERVICE_NAME" \
 --source . \
 --region "$REGION" \
 --platform managed \
 --allow-unauthenticated \
 --service-account "$SERVICE_ACCOUNT_EMAIL" \
 --set-env-vars="NODE_ENV=production,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GCP_REGION=$REGION,GCS_BUCKET_NAME=$BUCKET_NAME,GOOGLE_GENAI_LOCATION=global,GEMINI_MODEL=$GEMINI_MODEL,FRONTEND_ORIGIN=http//localhost:5173"
```

> Cloud Run injects `PORT`. If the Gemini model isn't available in `$REGION`, set `GOOGLE_GENAI_LOCATION=global`.

## 9. Smoke test

```bash
export BACKEND_URL="$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)')"

curl "$BACKEND_URL/api/health"    # {"status":"ok","service":"retrovoice-backend"}
curl "$BACKEND_URL/api/sprints"
```

## 10. Deploy the frontend

The Firebase project comes from `frontend/.firebaserc`. `VITE_API_BASE_URL` is baked in at build time.

```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=$BACKEND_URL" > .env.production
npm run deploy:hosting        # or: npm run hosting:preview
```

## 11. Point backend CORS at the hosted frontend

```bash
export FRONTEND_URL="https://${PROJECT_ID}.web.app"   # exact Hosting URL, no trailing slash

gcloud run services update "$SERVICE_NAME" \
  --region "$REGION" \
  --update-env-vars="FRONTEND_ORIGIN=$FRONTEND_URL"
```

## Troubleshooting

- **CORS errors** – `FRONTEND_ORIGIN` must exactly match the Hosting URL (no trailing slash).
- **Frontend hits the wrong backend** – rebuild and redeploy; `VITE_API_BASE_URL` is compiled in.
- **Analysis fails** – check Vertex AI is enabled, the service account has `roles/aiplatform.user`, and the model is available in `GOOGLE_GENAI_LOCATION`.

