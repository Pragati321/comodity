# Google Cloud Run Deployment Guide

This guide explains how to deploy your frontend and backend to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account**: Sign up at https://cloud.google.com
2. **gcloud CLI**: Install from https://cloud.google.com/sdk/docs/install
3. **Docker** (optional): Only needed for local testing

## File Structure

```
comodity/
├── backend/
│   ├── Dockerfile          # Backend container configuration
│   ├── .dockerignore       # Files to exclude from Docker build
│   └── ... (your backend code)
├── frontend/
│   ├── Dockerfile          # Frontend container configuration
│   ├── .dockerignore       # Files to exclude from Docker build
│   └── ... (your frontend code)
└── deploy_to_cloudrun.sh   # Automated deployment script
```

## Quick Start

### Option 1: Using the Deployment Script (Recommended)

```bash
# Set your GCP project ID
export GCP_PROJECT_ID="your-project-id"

# Run the deployment script
./deploy_to_cloudrun.sh
```

The script will:
* Deploy your backend service
* Deploy your frontend service
* Provide you with the URLs for both services

### Option 2: Manual Deployment

#### Deploy Backend

```bash
cd backend

gcloud run deploy commodity-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_api_key_here \
  --platform managed
```

#### Deploy Frontend

```bash
cd frontend

# Use the backend URL from the previous step
gcloud run deploy commodity-frontend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --build-arg NEXT_PUBLIC_API_URL=https://commodity-backend-xxx.run.app \
  --platform managed
```

## Post-Deployment Steps

### 1. Update CORS Settings

After deploying the frontend, update your backend `.env` file:

```env
ALLOWED_ORIGINS=https://commodity-frontend-xxx.run.app
```

Then redeploy the backend:

```bash
cd backend
gcloud run deploy commodity-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --update-env-vars ALLOWED_ORIGINS=https://commodity-frontend-xxx.run.app
```

### 2. Set Up Environment Variables in Cloud Console

For better security, manage environment variables in the Cloud Console:

1. Go to https://console.cloud.google.com/run
2. Click on your backend service
3. Click "Edit & Deploy New Revision"
4. Add environment variables under "Variables & Secrets"
5. Click "Deploy"

## Testing Locally Before Deployment

### Test Backend

```bash
cd backend
docker build -t commodity-backend .
docker run -p 8080:8080 -e GEMINI_API_KEY=your_key commodity-backend
```

Visit http://localhost:8080/docs

### Test Frontend

```bash
cd frontend
docker build -t commodity-frontend --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080 .
docker run -p 3000:8080 commodity-frontend
```

Visit http://localhost:3000

## Viewing Logs

```bash
# Backend logs
gcloud run logs read commodity-backend --region us-central1

# Frontend logs
gcloud run logs read commodity-frontend --region us-central1
```

## Cost Management

Cloud Run charges based on:
* **Requests**: Free tier includes 2 million requests/month
* **CPU time**: Charged per 100ms of CPU usage
* **Memory**: Charged per GB-second

To minimize costs:
* Set `--min-instances 0` (default) so services scale to zero when not in use
* Use `--memory 512Mi` for optimal cost/performance
* Monitor usage in Cloud Console

## Troubleshooting

### Build Fails

* Check Dockerfile syntax
* Verify all required files are present
* Review build logs: `gcloud builds list --limit=5`

### Service Won't Start

* Check logs: `gcloud run logs read <service-name> --region us-central1`
* Verify PORT environment variable is used correctly
* Ensure application listens on 0.0.0.0, not localhost

### CORS Errors

* Update ALLOWED_ORIGINS in backend environment variables
* Include both with and without trailing slash
* Redeploy backend after updating CORS settings

## Next Steps

* Set up custom domain: https://cloud.google.com/run/docs/mapping-custom-domains
* Configure CI/CD: https://cloud.google.com/run/docs/continuous-deployment
* Add authentication: https://cloud.google.com/run/docs/authenticating/overview
* Set up monitoring: https://cloud.google.com/run/docs/monitoring

## Support

* Cloud Run Documentation: https://cloud.google.com/run/docs
* Pricing Calculator: https://cloud.google.com/products/calculator
* Support: https://cloud.google.com/support
