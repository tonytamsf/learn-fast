# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LearnFast is a full-stack learning resource generator that uses OpenAI's API to create personalized learning paths. The application consists of:
- **Client**: React + Vite frontend with dark/light theme support
- **Server**: Express.js backend that interfaces with OpenAI API

## Architecture

### Monorepo Structure
```
learn-fast/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx  # Main application component
│   │   ├── App.css  # Styling
│   │   └── main.jsx # Entry point
│   └── vite.config.js
└── server/          # Express backend
    └── index.js     # API server with OpenAI integration
```

### API Architecture

The server (server/index.js:1) provides two main endpoints:

1. **POST /api/auto** (server/index.js:35): Auto-generates 3-5 subtopics based on main topic, learning level, and depth
2. **POST /api/learn** (server/index.js:77): Generates learning resources (video links) for provided subtopics using web search

Both endpoints use OpenAI's responses API with specific models:
- `/api/auto` uses `gpt-5-mini`
- `/api/learn` uses `gpt-5` with web_search tool

### Frontend-Backend Communication

The client uses Vite's proxy configuration (client/vite.config.js:7-14) to forward `/api/*` requests to `http://localhost:3000` during development.

## Development Commands

### Client (React + Vite)
```bash
cd client
npm install          # Install dependencies
npm run dev          # Start dev server (default: http://localhost:5173)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Server (Express + OpenAI)
```bash
cd server
npm install          # Install dependencies
npm run dev          # Start server with nodemon (PORT 3000)
node index.js        # Start server without hot-reload
```

### Running the Full Application

You need to run both client and server concurrently:

**Terminal 1 (Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```

## Environment Setup

The server requires an OpenAI API key. Create a `.env` file in the `server/` directory:

```
OPENAI_API_KEY=your_api_key_here
```

The `.env` file is gitignored and must be created locally.

## Key Implementation Details

### Response Parsing
Both API endpoints handle OpenAI responses with fallback parsing (server/index.js:56-68, server/index.js:94-106):
- Attempts JSON.parse first
- Handles edge cases like quotes wrapping the response
- Returns empty array on parse failure to prevent crashes

### Client State Management
The App component (client/src/App.jsx:4) manages complex state including:
- `sub`: Array of learning subtopics (can be manually added or auto-generated)
- `ans`: Generated resource links returned from /api/learn
- `backSub`: Backup of subtopics to match with returned links
- Loading states for both auto-generation and learning path generation

### Theme Support
The application supports dark/light mode toggle (client/src/App.jsx:154-156) with state persisted in `isDarkMode`.

## Common Workflows

### Testing the Learning Path Generation
1. Start both server and client
2. Navigate to http://localhost:5173
3. Fill in "What do you want to learn?" (e.g., "React")
4. Select knowledge level (Beginner/Intermediate/Advanced)
5. Select depth level (Overview/Standard/Deep Dive)
6. Either manually add topics OR click "✨ Auto-Generate"
7. Click "Generate Learning Path"

### Adding New API Endpoints
1. Add route handler in `server/index.js`
2. Add corresponding fetch call in `client/src/App.jsx`
3. Update Vite proxy config if endpoint path changes from `/api/*`

## Dependencies

### Client
- React 19.1.1 (latest with new React Compiler support)
- Vite 7.1.7
- ESLint with React plugins

### Server
- Express 4.21.2
- OpenAI SDK 6.7.0
- cors for cross-origin requests
- dotenv for environment variables
- nodemon for development hot-reload

## Deployment

### Production Architecture

In production, the Express server serves both the API endpoints and the static React build:
- React app is built with `npm run build` (outputs to `client/dist/`)
- Express serves static files from `client/dist/` (server/index.js:14)
- All API routes are prefixed with `/api/*`
- A catch-all route serves `index.html` for React Router (server/index.js:132)

### Cloud Run Deployment (Recommended)

The application is containerized using Docker for deployment to Google Cloud Run.

**Quick Deploy:**
```bash
./deploy.sh
```

**Manual Deploy:**
```bash
# Build and submit to Cloud Build
gcloud builds submit --tag gcr.io/PROJECT_ID/learnfast

# Deploy to Cloud Run
gcloud run deploy learnfast \
  --image gcr.io/PROJECT_ID/learnfast \
  --region us-central1 \
  --set-secrets OPENAI_API_KEY=OPENAI_API_KEY:latest
```

**Important Files:**
- `Dockerfile` - Multi-stage build that builds React and runs Express
- `.dockerignore` - Excludes unnecessary files from Docker context
- `deploy.sh` - Automated deployment script
- `DEPLOYMENT.md` - Complete deployment guide with step-by-step instructions
- `server/.env.example` - Template for required environment variables

**Environment Variables Required:**
- `OPENAI_API_KEY` - Stored in Google Secret Manager for production
- `PORT` - Automatically set by Cloud Run (defaults to 8080)

**Deployment Characteristics:**
- Scales to zero when unused (cost-effective)
- Auto-HTTPS included
- 5-minute timeout for long-running OpenAI API calls
- 512Mi memory allocation
- Health check endpoint at `/api/health`

For complete deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
