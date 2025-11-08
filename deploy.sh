#!/bin/bash
# Quick deployment script for LearnFast to Google Cloud Run

# Configuration - UPDATE THESE VALUES
PROJECT_ID="learnfast-app"
SERVICE_NAME="learnfast"
REGION="us-central1"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment to Google Cloud Run...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${YELLOW}⚠️  gcloud CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to gcloud. Running 'gcloud auth login'...${NC}"
    gcloud auth login
fi

# Set project
echo -e "${BLUE}📋 Setting project to ${PROJECT_ID}...${NC}"
gcloud config set project ${PROJECT_ID}

# Build container
echo -e "${BLUE}🏗️  Building container image...${NC}"
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${SERVICE_NAME} --project ${PROJECT_ID}

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}❌ Build failed. Check the logs above.${NC}"
    exit 1
fi

# Deploy to Cloud Run
echo -e "${BLUE}📦 Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${SERVICE_NAME} \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-secrets OPENAI_API_KEY=OPENAI_API_KEY:latest \
  --project ${PROJECT_ID}

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}❌ Deployment failed. Check the logs above.${NC}"
    exit 1
fi

# Get service URL
echo -e "${GREEN}✅ Deployment complete!${NC}"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)' --project ${PROJECT_ID})
echo -e "${GREEN}🌐 Your app is live at: ${SERVICE_URL}${NC}"

# Show logs command
echo -e "${BLUE}💡 View logs with: gcloud run services logs tail ${SERVICE_NAME} --region ${REGION}${NC}"
