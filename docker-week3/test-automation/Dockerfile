# Test Automation Framework Dockerfile - Optimized
# Multi-stage build to reduce image size

# Stage 1: Dependencies
# Use slim image to install dependencies (smaller intermediate layer)
FROM node:20-slim AS dependencies

WORKDIR /deps

# Copy package file
COPY package.json ./

# Install dependencies only
# This stage won't be in final image, just used for building
RUN npm install --only=production

# Stage 2: Final image
# Base image with Playwright v1.40.0 on Ubuntu Focal
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory
WORKDIR /app

# Copy only the installed node_modules from dependencies stage
# This avoids npm install overhead in the final image
COPY --from=dependencies /deps/node_modules ./node_modules

# Copy package.json for reference
COPY package.json ./

# Copy test files and configuration
# Separated from dependencies to optimize layer caching
COPY tests/ ./tests/
COPY playwright.config.js ./

# Create directory for test results
RUN mkdir -p test-results

# Remove unnecessary files to reduce size
# Clean apt cache and temporary files
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    npm cache clean --force

# Set environment variable for Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Default command to run tests
# Can be overridden at runtime with docker run command
CMD ["npx", "playwright", "test"]

# Metadata labels for image documentation
LABEL maintainer="your-email@example.com"
LABEL description="Playwright test automation framework - Optimized"
LABEL version="1.0"
