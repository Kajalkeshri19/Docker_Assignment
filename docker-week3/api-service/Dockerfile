# API Service Dockerfile
# Use Alpine-based Node.js for minimal image size
FROM node:18-alpine

# Install dumb-init to handle PID 1 properly and prevent zombie processes
# dumb-init ensures proper signal handling and process reaping
RUN apk add --no-cache dumb-init

# Create non-root user for security best practices
# Running as root inside container is a security risk
# UID 1001 matches assignment requirements
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files with correct ownership
# Doing this before copying source code optimizes layer caching
# If package.json doesn't change, this layer is reused
COPY --chown=nodejs:nodejs package*.json ./

# Install production dependencies only
# --omit=dev excludes devDependencies, reducing image size
# npm cache clean reduces final image size
RUN npm install --only=production --omit=dev && \
    npm cache clean --force

# Copy application source code with correct ownership
# This layer only rebuilds when source code changes
COPY --chown=nodejs:nodejs server.js ./

# Switch to non-root user
# All subsequent commands and container runtime use this user
USER nodejs

# Expose application port
# This is documentation - doesn't actually publish the port
EXPOSE 3000

# Health check to verify service is running
# Docker will mark container as unhealthy if this fails
# Uses Node.js http module to avoid installing curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to run the application
# This properly handles signals (SIGTERM, SIGINT) and reaps zombie processes
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]

# Metadata labels for image documentation
LABEL maintainer="your-email@example.com"
LABEL description="Node.js REST API service with Express"
LABEL version="1.0"
