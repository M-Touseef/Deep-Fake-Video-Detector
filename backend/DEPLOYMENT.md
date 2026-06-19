# Backend Production Deployment

The backend needs one runtime process:

1. API web process: `npm start`

It also needs MongoDB and the deployed ML service URL.

## Required Environment Variables

Use `backend/.env.production.example` as the template.

Required secrets:

- `MONGODB_URI`
- `ML_SERVICE_URL`
- `JWT_SECRET`
- `ADMIN_PASSWORD`

`ML_SERVICE_URL` must point to the prediction endpoint, for example:

```env
ML_SERVICE_URL=https://deepfake-ml-api.eastus.azurecontainerapps.io/predict
```

## Free Host Setup

Deploy `backend` as a normal Node web service with:

```bash
npm ci
npm start
```

Set these secrets in the host dashboard:

- `MONGODB_URI`
- `ML_SERVICE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

After deployment, set the frontend environment variable to:

```env
VITE_API_BASE_URL=https://<backend-api-domain>/api
```

Then rebuild/redeploy the frontend.

## Storage Note

Uploaded videos and generated heatmaps are stored on local disk through `UPLOAD_DIR` and `HEATMAP_DIR`. On most cloud hosts, local disk is ephemeral. The current cleanup job removes old files, which is acceptable for short-lived analysis, but long-term storage should use S3, Azure Blob Storage, or another object store.
