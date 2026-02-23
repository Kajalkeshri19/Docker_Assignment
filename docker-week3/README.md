# Docker Image Optimization Guide - Week 3 Assignment

## Overview
This directory contains optimized Docker images for three services: API Service, Static Website, and Test Automation Framework. All images have been optimized using industry best practices for reduced size and improved efficiency.

## 📊 Quick Results

| Service | Original | Optimized | Status |
|---------|----------|-----------|--------|
| API Service | 187MB | 107MB (api-service:pkg) | ✓ Under 150MB target |
| Static Website | 73.7MB | 6.83MB (static-website:aggressive) | ✓ Under 25MB target |
| Playwright Tests | 2.78GB | 605MB (playwright:chromium-optimized) | ✓ Under 900MB target (Chromium-only) |

## 🚀 Quick Start

### Building the Images

```bash
# API Service (pkg native binary - smallest)
cd api-service
docker build -f Dockerfile.optimized -t api-service:optimized .

# Static Website (aggressive busybox runtime)
cd static-website
docker build -f Dockerfile.optimized -t static-website:optimized .

# Test Automation Framework (Chromium-only Playwright)
cd test-automation
docker build -f Dockerfile.optimized -t playwright:optimized .
```

### Running the Containers

```bash
# API Service (runs on port 3000)
docker run --rm -p 3000:3000 api-service:optimized

# Static Website (runs on port 80)
docker run --rm -p 8080:80 static-website:optimized

# Test Automation Framework
docker run --rm playwright:optimized
```

### Testing Health

```bash
# API Service health check
curl http://localhost:3000/health

# Static Website availability
curl http://localhost:8080/

# Test Framework test run
docker run --rm playwright:latest npx playwright test --headed
```

---

##  Directory Structure

```
docker-week3/week2/
├── API Service/
│   ├── Dockerfile (original)
│   ├── Dockerfile.optimized (✓ optimized)
│   ├── .dockerignore (✓ enhanced)
│   ├── package.json
│   └── server.js
│
├── static-website/
│   ├── Dockerfile (original)
│   ├── Dockerfile.optimized (✓ optimized)
│   ├── .dockerignore (✓ enhanced)
│   ├── nginx.conf
│   └── build/
│       ├── index.html
│       ├── styles.css
│       └── app.js
│
├── Test Automation Framework/
│   ├── Dockerfile (original)
│   ├── Dockerfile.optimized (✓ optimized)
│   ├── .dockerignore (✓ enhanced)
│   ├── package.json
│   ├── playwright.config.js
│   └── tests/
│       └── example.spec.js
│
├── BUILD_COMPARISON.md (✓ size analysis)
├── OPTIMIZATION_TECHNIQUES.md (✓ detailed guide)
├── README.md (✓ this file)
└── dive-analysis/ 
```

---

##  Optimization Summary

### Key Techniques Applied

#### 1. Multi-Stage Builds
- **Separates build and runtime stages**
- Eliminates build tools from final image
- Example: Builder stage uses Alpine + npm, runtime stage is lean

```dockerfile
# Stage 1: Builder
FROM node:18-alpine AS builder
RUN npm install --omit=dev

# Stage 2: Runtime
FROM node:18-alpine
COPY --from=builder /app/node_modules ./node_modules
```

#### 2. Alpine-Based Images
- node:18-alpine (170MB vs ~900MB)
- nginx:1.27-alpine (45MB vs ~200MB)
- Reduces base image size by 80%+

#### 3. Production Dependencies Only
- `npm install --omit=dev` - excludes devDependencies
- `npm prune --omit=dev` - removes unnecessary packages
- Reduces node_modules by 30-50%

#### 4. Layer Caching Optimization
- Order commands by change frequency
- Dependencies install before source code
- Maximizes cache reuse during iteration

#### 5. Improved .dockerignore Files
- Excludes .git, node_modules, docs
- Reduces build context
- Faster builds

#### 6. Security Best Practices
- Non-root user execution
- Health checks configured
- Proper signal handling (dumb-init)

#### 7. Cleanup Operations
- Remove npm cache: `npm cache clean --force`
- Remove apt caches: `apt-get clean && rm -rf /var/lib/apt/lists/*`
- Remove temporary files: `rm -rf /tmp/* /var/tmp/*`

---

##  API Service Optimization Details

### Original vs Optimized
- **Original:** Uses node:18-alpine (already optimal starting point)
- **Optimized:** Implements multi-stage build for cleaner separation
- **Size:** 187MB → 186MB (minimal difference due to starting optimization)

### Layers (Optimized)
```
BASE: node:18-alpine         170MB    (runtime required)
dumb-init                    100KB    (signal handling)
User + groups                5KB      (security)
node_modules                 15MB     (production deps only)
server.js                    50KB     (application code)
────────────────────────────────────
TOTAL                        186MB
```

### Build Process
1. **Stage 1 (Builder):**
   - Install dependencies with npm
   - Clean npm cache
   - Prune unnecessary packages
   - (This stage is discarded in final image)

2. **Stage 2 (Runtime):**
   - Copy only node_modules from builder
   - Add dumb-init for signal handling
   - Create non-root user
   - Configure health check
   - Copy application code

### Testing
```bash
# Verify image works
docker run --rm api-service:optimized npm --version

# Start service with health check
docker run --rm -p 3000:3000 api-service:optimized

# In another terminal:
curl http://localhost:3000/           # Test root endpoint
curl http://localhost:3000/health     # Test health check
curl http://localhost:3000/api/users  # Test API endpoint
```

---

##  Static Website Optimization Details

### Original vs Optimized
- **Original:** 73.7MB
- **Optimized:** 73.8MB (multi-stage for clarity)
- **Note:** Limited room for optimization with Alpine Nginx

### Multi-Stage Design
- **Stage 1:** Prepares build assets (if needed in future)
- **Stage 2:** Runtime with minimal clean Nginx install

### Why Size Didn't Significantly Reduce
1. nginx:1.27-alpine base is already minimal (45MB)
2. HTML/CSS/JS assets add ~29MB
3. To reach <25MB would require:
   - Using lightweight HTTP server (less feature-rich)
   - Minimizing assets aggressively  
   - Trading production-readiness for size

### Production-Ready Features
- ✓ Gzip compression configured
- ✓ Security headers enabled
- ✓ SPA routing configuration
- ✓ Health check endpoint
- ✓ Non-root user execution
- ✓ Optimized caching headers

### Testing
```bash
# Build and run
docker run --rm -p 80:80 static-website:optimized

# Test in another terminal:
curl http://localhost/                  # Homepage
curl http://localhost/health            # Health check
curl -I http://localhost/styles.css     # Check compression headers
```

---

##  Test Automation Framework Optimization Details

### The Playwright Challenge
- **Microsoft base image includes:** Chromium, Firefox, WebKit browsers
- **Base size:** ~2.7GB (inherent due to browser engines)
- **Assignment target:** <900MB (unrealistic with full browser suite)

### What We Optimized
1. **Dependency Building:** Uses Alpine Node (smaller intermediate)
2. **Package Cleanup:** Aggressively removes apt caches
3. **File Removal:** Deletes Python bytecode, temporary files
4. **npm Pruning:** Removes unnecessary npm packages

### Optimization Applied
```dockerfile
# Aggressive cleanup stage
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /var/cache/* && \
    find /usr/local -type f -name "*.pyc" -delete && \
    find /usr/local -type d -name "__pycache__" -delete
```

### Size Breakdown (2.78GB)
- Ubuntu Focal OS + libraries: ~1.2GB
- Chromium browser: ~800MB
- Firefox browser: ~400MB
- WebKit browser: ~400MB
- Playwright & Node: ~100-200MB

### Realistic Alternatives
If size is critical:
```bash
# Option 1: Use Puppeteer for Chromium only
npm install puppeteer  # Much smaller

# Option 2: Custom minimal setup
# Build custom Docker image with specific browsers only

# Option 3: Use cloud-based browser testing
# BrowserStack, SauceLabs, etc.
```

### Testing
```bash
# Run tests
docker run --rm playwright:optimized npx playwright test

# Run with headed browser (debug mode)
docker run --rm playwright:optimized npx playwright test --headed

# Run specific test file
docker run --rm playwright:optimized npx playwright test example.spec.js

# Watch mode
docker run --rm playwright:optimized npx playwright test --watch
```

---

##  Analyzing Images with Dive

### Install Dive
```bash
# Linux 
wget https://github.com/wagoodman/dive/releases/download/v0.13.1/dive_0.13.1_linux_amd64.deb
sudo apt install ./dive_0.13.1_linux_amd64.deb

dive --version  # Verify installation
```

### Analyzing Image Layers
```bash
# Analyze API Service
dive api-service:optimized

# Analyze Static Website
dive static-website:optimized

# Analyze Playwright
dive playwright:optimized
```

### What to Look For in Dive
1. **Layer Size:** Identify largest layers
2. **Wasted Space:** Show files that appear in multiple layers
3. **Efficiency:** Indicates unnecessary files
4. **Section Analysis:** 
   - Green = removed content
   - Red = added content
   - White = unchanged content

### Key Metrics
- **Image Size:** Total final size
- **Efficiency:** Percentage of image that's actually used
- **Unused:** Wasted space in layers that get overwritten

---

##  Best Practices Summary

### Do's 
-  Use Alpine base images for 80%+ size reduction
-  Implement multi-stage builds
-  Install production dependencies only
-  Order Dockerfile commands by change frequency
-  Always use non-root user
-  Include health checks
-  Use .dockerignore properly
-  Implement graceful shutdown (dumb-init)
-  Clean package manager caches
-  Minimize final image layer

### Don'ts 
-  Don't use latest without version pins
-  Don't run as root
-  Don't include test files in production image
-  Don't commit build artifacts to final layer
-  Don't include .git directory (50-500MB)
-  Don't skip health checks
-  Don't install unnecessary tools
-  Don't ignore signals in PID 1 process

---

##  Documentation Files

### BUILD_COMPARISON.md
Detailed before/after analysis including:
- Image size comparisons
- Layer-by-layer breakdown
- Build efficiency metrics
- Size target achievement analysis

### OPTIMIZATION_TECHNIQUES.md
In-depth guide to each technique:
- Multi-stage builds (with examples)
- Alpine Linux benefits
- Production deps management
- Cleanup strategies
- Security practices
- Health checks
- And more...

### dive-analysis/ 
Screenshots from `dive` tool showing:
- Layer composition
- Wasted space analysis
- File contribution per layer
- Efficiency percentages

---

##  Iteration Workflow

When developing Docker images:

1. **Start Simple**
   ```bash
   FROM node:18-alpine  # Start with Alpine
   COPY . /app
   RUN npm install
   CMD ["node", "server.js"]
   ```

2. **Add Multi-Stage**
   ```dockerfile
   FROM node:18-alpine AS builder
   FROM node:18-alpine
   COPY --from=builder /app/node_modules ./node_modules
   ```

3. **Optimize Dependencies**
   ```bash
   npm install --omit=dev
   npm cache clean --force
   npm prune --omit=dev
   ```

4. **Add Security**
   ```dockerfile
   RUN adduser -S nodejs
   USER nodejs
   ```

5. **Add Health Checks**
   ```dockerfile
   HEALTHCHECK --interval=30s CMD ...
   ```

6. **Analyze with Dive**
   ```bash
   dive image:tag
   ```

7. **Repeat Until Target**

---

##  Troubleshooting

### Image Build Fails
```bash
# See full build output
docker build -f Dockerfile.optimized --progress=plain -t image:tag .

# Keep build container for inspection
docker build --keep-state -f Dockerfile.optimized .
```

### Image Runs Slowly
- Check health check interval (might be too frequent)
- Check CPU/memory limits
- Profile with `docker stats`

### Health Check Failing
```bash
# Debug health check
docker run --rm image:tag [health check command]

# Run container and test manually
docker run --rm -it image:tag bash
```

### Size Reduction Plateaued
- Analyze with `dive image:tag`
- Look for large files in layers
- Consider alternative base images

---

##  Checklist for Production Deployment

- [ ] Image builds successfully
- [ ] All services tested and working
- [ ] .dockerignore optimized
- [ ] Multi-stage builds implemented
- [ ] Health checks configured
- [ ] Non-root user set
- [ ] Logs output to stdout/stderr
- [ ] ENV variables configurable at runtime
- [ ] Image scanned for vulnerabilities
- [ ] Image size documented
- [ ] Performance tested
- [ ] Graceful shutdown verified

---

##  Contributing

When making improvements:
1. Test locally: `docker build -f Dockerfile.optimized .`
2. Verify functionality still works
3. Document changes made
4. Compare size and efficiency before/after
5. Update BUILD_COMPARISON.md if applicable

---

##  Support

For detailed optimization techniques, see:
- `OPTIMIZATION_TECHNIQUES.md` - Comprehensive guide
- `BUILD_COMPARISON.md` - Size and efficiency analysis
- Docker Official Documentation: https://docs.docker.com

---

##  Summary

These optimized Docker images demonstrate:
-  Multi-stage build architecture
-  Alpine base image usage
-  Production dependency management
-  Security best practices
-  Health check configuration
-  Optimized .dockerignore
-  Signal handling (PID 1)
-  Size reduction techniques

**Result:** Smaller, faster, more secure, production-ready Docker images.

---

