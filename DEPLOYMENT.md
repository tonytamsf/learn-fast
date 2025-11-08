# Cloud Run Deployment Guide for LearnFast

This guide walks you through deploying LearnFast to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account**
   - Sign up at https://cloud.google.com
   - New accounts get $300 free credit

2. **Install gcloud CLI**
   ```bash
   # macOS
   brew install google-cloud-sdk

   # Verify installation
   gcloud --version
   ```

3. **OpenAI API Key**
   - Get your API key from https://platform.openai.com/api-keys

## Step-by-Step Deployment

### 1. Setup Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create learnfast-app --name="LearnFast"

# Set the project
gcloud config set project learnfast-app

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 2. Configure OpenAI API Key as Secret

Store your OpenAI API key securely using Google Secret Manager:

```bash
# Create secret
echo -n "your_actual_openai_api_key" | gcloud secrets create OPENAI_API_KEY --data-file=-

# Grant Cloud Run access to the secret
gcloud secrets add-iam-policy-binding OPENAI_API_KEY \
  --member="serviceAccount:$(gcloud projects describe learnfast-app --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Build and Deploy to Cloud Run

From the project root directory:

```bash
# Build the container image using Cloud Build
gcloud builds submit --tag gcr.io/learnfast-app/learnfast

# Deploy to Cloud Run
gcloud run deploy learnfast \
  --image gcr.io/learnfast-app/learnfast \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-secrets OPENAI_API_KEY=OPENAI_API_KEY:latest
```

**Explanation of flags:**
- `--allow-unauthenticated`: Makes the app publicly accessible
- `--memory 512Mi`: Allocates 512MB RAM (sufficient for small apps)
- `--min-instances 0`: Scales to zero when unused (saves cost)
- `--max-instances 10`: Maximum concurrent containers
- `--timeout 300`: 5-minute timeout for OpenAI API calls
- `--set-secrets`: Mounts the secret as environment variable

### 4. Get Your Application URL

After deployment completes, you'll see:
```
Service [learnfast] revision [learnfast-00001-xxx] has been deployed and is serving 100 percent of traffic.
Service URL: https://learnfast-xxxxxxxxx-uc.a.run.app
```

Visit this URL to access your deployed application!

## Quick Deploy Script

For faster deployments after the initial setup, use this script:

```bash
#!/bin/bash
# deploy.sh - Quick deployment script

PROJECT_ID="learnfast-app"
SERVICE_NAME="learnfast"
REGION="us-central1"

echo "🚀 Building container..."
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${SERVICE_NAME} --project ${PROJECT_ID}

echo "📦 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${SERVICE_NAME} \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-secrets OPENAI_API_KEY=OPENAI_API_KEY:latest \
  --project ${PROJECT_ID}

echo "✅ Deployment complete!"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)' --project ${PROJECT_ID}
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Updating Your Application

After making code changes:

```bash
# Option 1: Use the deploy script
./deploy.sh

# Option 2: Manual deployment
gcloud builds submit --tag gcr.io/learnfast-app/learnfast
gcloud run deploy learnfast --image gcr.io/learnfast-app/learnfast --region us-central1
```

## Monitoring and Logs

### View Logs
```bash
# Real-time logs
gcloud run services logs tail learnfast --region us-central1

# Read recent logs
gcloud run services logs read learnfast --region us-central1 --limit 50
```

### View in Console
Visit: https://console.cloud.google.com/run

## Cost Estimates

**Cloud Run Pricing (as of 2024):**
- First 2 million requests/month: FREE
- First 360,000 GB-seconds of memory: FREE
- First 180,000 vCPU-seconds: FREE

**Expected costs for small scale:**
- 0-1000 users/month: $0-2/month
- 1000-5000 users/month: $2-10/month

**Note:** OpenAI API costs are separate and based on your usage.

## Troubleshooting

### Build Fails
```bash
# Check build logs
gcloud builds list --limit 5

# View specific build log
gcloud builds log BUILD_ID
```

### Deployment Fails
```bash
# Check service status
gcloud run services describe learnfast --region us-central1

# Check if secret is accessible
gcloud secrets versions access latest --secret OPENAI_API_KEY
```

### Application Errors
```bash
# Check real-time logs for errors
gcloud run services logs tail learnfast --region us-central1
```

### Cold Start Issues
If the app is slow on first load after inactivity:
- This is normal for min-instances=0
- Consider setting `--min-instances 1` (adds cost but eliminates cold starts)

## Custom Domain (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create --service learnfast --domain yourdomain.com --region us-central1

# Follow instructions to update DNS records
```

## Clean Up (If Testing)

To delete everything and avoid charges:

```bash
# Delete Cloud Run service
gcloud run services delete learnfast --region us-central1

# Delete container images
gcloud container images delete gcr.io/learnfast-app/learnfast

# Delete secrets
gcloud secrets delete OPENAI_API_KEY

# Delete project (if you want to start fresh)
gcloud projects delete learnfast-app
```

## Security Best Practices

1. ✅ **Never commit `.env` files** - Already in `.gitignore`
2. ✅ **Use Secret Manager** - API keys stored securely
3. ✅ **HTTPS enforced** - Automatic with Cloud Run
4. ✅ **CORS configured** - Already set in server code
5. ⚠️ **Consider rate limiting** - Add if you get high traffic

## Next Steps

- Set up continuous deployment from GitHub using Cloud Build triggers
- Configure custom domain
- Set up monitoring and alerting
- Implement caching for frequently requested topics
- Add analytics (Google Analytics, Plausible, etc.)

## Support

- Google Cloud Docs: https://cloud.google.com/run/docs
- OpenAI API Docs: https://platform.openai.com/docs
- LearnFast Issues: Create GitHub issue in your repository
