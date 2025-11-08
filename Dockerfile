# Multi-stage Dockerfile for LearnFast (React + Express + OpenAI)

# Stage 1: Build React frontend
FROM node:18-alpine AS client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci --only=production

# Copy client source code
COPY client/ ./

# Build React app
RUN npm run build

# Stage 2: Setup Express backend with built frontend
FROM node:18-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install server dependencies
RUN npm ci --only=production

# Copy server source code
COPY server/ ./

# Copy built React app from client-builder stage
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port (Cloud Run will set PORT env variable)
EXPOSE 8080

# Set environment variable for production
ENV NODE_ENV=production

# Start the server
CMD ["node", "index.js"]
