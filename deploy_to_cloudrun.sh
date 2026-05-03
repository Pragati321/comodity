#!/bin/bash

# Deployment script for Google Cloud Run
# This script deploys both backend and frontend to Google Cloud Run

set -e  # Exit on error

echo "=================================================="
echo "Google Cloud Run Deployment Script"
echo "=================================================="
echo ""

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"your-project-id"}
REGION=${GCP_REGION:-"us-central1"}
BACKEND_SERVICE_NAME="commodity-backend"
FRONTEND_SERVICE_NAME="commodity-frontend"

echo "Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Backend Service: $BACKEND_SERVICE_NAME"
echo "  Frontend Service: $FRONTEND_SERVICE_NAME"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed. Please install it first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
echo "Setting GCP project..."
gcloud config set project $PROJECT_ID

echo ""
read -p "Deploy backend? (y/n): " deploy_backend

if [ "$deploy_backend" = "y" ]; then
    echo ""
    echo "=================================================="
    echo "Deploying Backend Service"
    echo "=================================================="
    
    # Prompt for environment variables
    read -p "Enter your GEMINI_API_KEY: " gemini_key
    
    cd backend
    gcloud run deploy $BACKEND_SERVICE_NAME \
        --source . \
        --region $REGION \
        --allow-unauthenticated \
        --set-env-vars GEMINI_API_KEY=$gemini_key \
        --platform managed \
        --memory 512Mi \
        --cpu 1 \
        --timeout 300
    
    # Get the backend URL
    BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE_NAME \
        --region $REGION \
        --format 'value(status.url)')
    
    echo ""
    echo "✓ Backend deployed successfully!"
    echo "  Backend URL: $BACKEND_URL"
    
    cd ..
fi

echo ""
read -p "Deploy frontend? (y/n): " deploy_frontend

if [ "$deploy_frontend" = "y" ]; then
    echo ""
    echo "=================================================="
    echo "Deploying Frontend Service"
    echo "=================================================="
    
    if [ -z "$BACKEND_URL" ]; then
        read -p "Enter your backend URL: " BACKEND_URL
    fi
    
    cd frontend
    gcloud run deploy $FRONTEND_SERVICE_NAME \
        --source . \
        --region $REGION \
        --allow-unauthenticated \
        --build-arg NEXT_PUBLIC_API_URL=$BACKEND_URL \
        --platform managed \
        --memory 512Mi \
        --cpu 1 \
        --timeout 60
    
    # Get the frontend URL
    FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME \
        --region $REGION \
        --format 'value(status.url)')
    
    echo ""
    echo "✓ Frontend deployed successfully!"
    echo "  Frontend URL: $FRONTEND_URL"
    
    cd ..
    
    echo ""
    echo "=================================================="
    echo "IMPORTANT: Update CORS Settings"
    echo "=================================================="
    echo "Don't forget to update your backend .env file with:"
    echo "  ALLOWED_ORIGINS=$FRONTEND_URL"
    echo ""
    echo "Then redeploy the backend to apply CORS changes."
fi

echo ""
echo "=================================================="
echo "Deployment Complete!"
echo "=================================================="
