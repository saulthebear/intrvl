# syntax=docker/dockerfile:1

# Multi-stage build for smaller production image
# Stage 1: Build stage (for npm ci and any build steps)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies for potential build steps)
RUN npm ci

# Copy application code
COPY . .

# Build Tailwind CSS (production optimized)
RUN npx tailwindcss -i ./public/src/input.css -o ./public/dist/output.css --minify

# Stage 2: Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy application code from builder
COPY --from=builder /app/config ./config
COPY --from=builder /app/controllers ./controllers
COPY --from=builder /app/helpers ./helpers
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/models ./models
COPY --from=builder /app/views ./views
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE 3333

# Set production environment
ENV NODE_ENV=production
ENV PORT=3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3333/ || exit 1

# Start the application
CMD ["node", "server.js"]
