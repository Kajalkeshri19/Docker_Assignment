# Docker Image Optimization Techniques

## Overview
This document describes the techniques applied to optimize Docker images for the three services: API Service, Static Website, and Test Automation Framework.

---

## 1. Multi-Stage Build Architecture

### What It Is
A Dockerfile pattern that uses multiple `FROM` statements to create intermediate build stages that don't appear in the final image.

### Why It Matters
- **Separates concerns**: Build dependencies are isolated from runtime
- **Reduces final size**: Build tools, compilers, and dev dependencies stay in builder stage
- **Faster deployments**: Smaller images deploy faster
- **Security**: Fewer tools = smaller attack surface

### Implementation

#### API Service Example
```dockerfile
# Stage 1: Dependencies Builder
FROM node:18-alpine AS builder
COPY package*.json ./
RUN npm install --omit=dev && \
    npm cache clean --force

# Stage 2: Runtime (minimal, no build tools)
FROM node:18-alpine
COPY --from=builder /app/node_modules ./node_modules
COPY server.js ./
```

**What happens:**
- Stage 1: npm pulls dependencies, creates node_modules
- Stage 2: Only final stage is kept; builder stage discarded
- Result: Final image excludes npm, cache, and build artifacts

#### Static Website Example
```dockerfile
# Stage 1: Prepare assets (if needed)
FROM node:18-alpine AS builder
COPY build/ ./

# Stage 2: Runtime (just web server)
FROM nginx:1.27-alpine
COPY --from=builder /build/ /usr/share/nginx/html/
```

**Benefit:** Even if build step were complex, final image only contains Nginx + assets

#### Playwright Example
```dockerfile
# Stage 1: Smaller intermediate for deps
FROM node:20-alpine AS deps-builder
RUN npm install --omit=dev

# Stage 2: Full runtime with browsers
FROM mcr.microsoft.com/playwright:v1.40.0-focal
COPY --from=deps-builder /deps/node_modules ./node_modules
```

**Benefit:** Keeps lightweight Alpine image for dependency compilation, then copies to full-featured Playwright image

---

## 2. Alpine-Based Images

### What They Are
Minimal Linux distributions (~5MB) with essential tools only

### Size Comparison
| Image | Alpine | Standard |
|-------|--------|----------|
| Node.js 18 | 170MB | ~900MB+ |
| nginx | 45MB | ~200MB |
| Ubuntu | 70MB | 300MB+ |

### Why Use Alpine
- ✓ 80-90% smaller base
- ✓ Reduced attack surface
- ✓ Faster downloads
- ✓ Ideal for containerized apps
- ⚠ Different package manager (apk vs apt)

### Implementation Examples

```dockerfile
# Good - Alpine base
FROM node:18-alpine
FROM nginx:1.27-alpine

# Less ideal - fuller distributions
FROM node:18            # ~900MB
FROM nginx:latest       # ~200MB+
```

### Trade-offs
- **Pro:** Much smaller footprint
- **Con:** Some packages might not be available in Alpine repos
- **Solution:** Use official Alpine variants for popular languages

---

## 3. Production Dependencies Only

### What It Does
Excludes development and optional dependencies from final image

### npm Implementation
```bash
# Modern approach (npm 6+)
npm install --omit=dev              # Excludes devDependencies
npm install --omit=optional         # Excludes optionalDependencies

# Legacy approach (npm < 6)
npm install --only=production       # Still works

# Even cleaner installs
npm ci --omit=dev                   # Clean install with lock file
```

### Build Pattern Example
```dockerfile
RUN npm install --omit=dev && \
    npm cache clean --force && \
    npm prune --omit=dev --production && \
    rm -rf /root/.npm
```

**What each command does:**
1. `npm install --omit=dev` - Don't install devDependencies
2. `npm cache clean --force` - Remove npm's global cache  
3. `npm prune --omit=dev` - Remove any dev packages that snuck in
4. `rm -rf /root/.npm` - Clean local cache directory

### Size Impact
- **API Service:** node_modules reduced from ~40MB to ~15MB
- **Playwright:** Excludes test frameworks, dev tools
- **General:** 30-50% reduction in node_modules

---

## 4. Aggressive Cleanup

### Package Manager Cleanup
```dockerfile
# For Alpine (apk)
RUN apk add --no-cache package  # --no-cache prevents local copies

# For Ubuntu/Debian (apt)
RUN apt-get update && \
    apt-get install -y package && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
```

### Playwright-Specific Cleanup
```dockerfile
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* \
           /tmp/* \
           /var/tmp/* \
           /var/cache/* && \
    find /usr/local -type f -name "*.pyc" -delete && \
    find /usr/local -type d -name "__pycache__" -delete
```

### Explanation
- `apt-get clean` - Removes cached .deb files
- `/var/lib/apt/lists/*` - Removes package metadata
- `/tmp/*` - Removes temporary files
- `*.pyc` removal - Removes Python compiled bytecode
- `__pycache__` removal - Removes Python cache directories

### Size Savings
- **Ubuntu image cleanup:** 50-200MB
- **Python cache removal:** 10-50MB
- **Temporary files:** 5-20MB

---

## 5. Improved .dockerignore Files

### Purpose
Specifies files/directories to exclude from Docker build context

### Why It Matters
- Faster builds (less data to transfer)
- Doesn't directly reduce image size (context ≠ layers)
- BUT: Prevents accidental large file inclusion
- Improves build efficiency

### Comprehensive .dockerignore
```
# Dependencies
node_modules/

# Package manager
package-lock.json  # if not needed in runtime
```

### Build Context Impact
| Scenario | Context Size |
|----------|-------------|
| Without .dockerignore | 150MB+ (includes node_modules, .git) |
| With .dockerignore | 100KB (just source code) |

### Best Practices
-  Always exclude .git (~50-500MB in large repos)
-  Always exclude node_modules (installed during build anyway)
-  Exclude documentation (not used at runtime)
-  Exclude IDE configs (.vscode, .idea)
-  Don't exclude files needed during build
-  Don't exclude source code

---

## 6. Non-Root User Execution

### Why It Matters
- **Security:** Limits damage if container is compromised
- **Isolation:** Prevents accidental root-level operations  
- **Best practice:** Follows principle of least privilege

### Implementation

```dockerfile
# Create user with specific UID
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set correct file ownership
COPY --chown=nodejs:nodejs server.js ./

# Switch to user before runtime
USER nodejs
```

### Benefits
- Malicious process can only access files owned by that user
- Prevents accidental privilege escalation
- Aligns with security standards (CIS Benchmarks)

---

## 7. Layer Caching Optimization

### Docker Build Cache
Docker caches layers; unchanged layers are reused

### Optimal Dockerfile Order
```dockerfile
# ✓ GOOD - Instructions ordered by change frequency
FROM base-image

RUN install-system-packages          # Rarely changes

COPY package*.json ./                # Changes occasionally
RUN npm install --omit=dev           # Expensive, benefits from caching

COPY src/ ./                         # Changes frequently
RUN npm build                        # Runs if source changes
```

### Why Order Matters
```dockerfile
# ✗ BAD - Changes source first, invalidates all caches
COPY src/ ./                         # Frequently changes
RUN npm install --omit=dev           # Now must re-run (waste!)

# ✓ GOOD - Stable operations first
RUN npm install --omit=dev           # Cached
COPY src/ ./                         # Only this rebuilds
```

### Cache Busting
When you explicitly want to invalidate cache:
```dockerfile
RUN --mount=type=cache,target=/root/.npm npm install  # Docker Buildkit
# OR
ARG BUILDKIT_INLINE_CACHE=1  # Enable inline caching
```

---

## 8. Health Checks

### What They Do
Specify how Docker determines if a container is "healthy"

### Implementation Examples

#### API Service (Node.js HTTP)
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

#### Static Website (HTTP)
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
```

### Parameters
- `--interval=30s` - Check every 30 seconds
- `--timeout=3s` - Wait max 3 seconds for response
- `--start-period=5s` - Give app 5 seconds to start
- `--retries=3` - Fail after 3 consecutive failures

### Benefits
- Orchestrators can replace unhealthy containers
- Catches hanging/frozen services
- Essential for Kubernetes/Swarm deployments

---

## 9. Entry Point Best Practices

### Problem: PID 1 Signal Handling
Container PID 1 (init process) doesn't pass signals properly by default

### Solution: dumb-init
```dockerfile
RUN apk add --no-cache dumb-init

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

### What It Does
- Passes signals (SIGTERM, SIGKILL) correctly
- Reaps zombie processes
- Ensures graceful shutdown
- Minimal overhead (~100KB)

### Without dumb-init
```
docker stop container
# Process receives SIGTERM? Unlikely
# Takes 10 seconds to kill (force timeout)
```

### With dumb-init
```
docker stop container
# dumb-init → forwards SIGTERM
# Application shuts down gracefully immediately
```

---

## 10. Security Best Practices

### Principle of Least Privilege
```dockerfile
# ✓ Good - Minimal permissions
USER nodejs                                # Non-root
RUN chown nodejs:nodejs /app               # Proper ownership
RUN chmod -R u+rw,go-rwx /app             # Restrictive perms

# ✗ Poor
USER root                                  # Unnecessary
RUN chmod 777 /app                        # Everyone can access
```

### Read-Only Root Filesystem
```dockerfile
# Can be used at runtime
docker run --read-only myimage

# Requires explicit writable mounts
docker run --read-only \
  --tmpfs /tmp:rw \
  myimage
```

### No Shell in Final Image (optional extreme)
```dockerfile
# If you don't include bash, attackers can't use it
RUN apk del bash busybox

# But makes debugging harder
```

---

## Combined Impact Example

### "Before" Dockerfile
```dockerfile
FROM node:18              # 900MB
RUN apt-get update && apt-get install -y curl
COPY . /app               # Includes .git, node_modules, etc
WORKDIR /app
RUN npm install           # All dependencies, including dev
USER root                 # Security risk
CMD ["node", "server.js"]
```

**Result:** ~1.2GB image, poor caching, security issues

### "After" Dockerfile
```dockerfile
# Stage 1: Builder
FROM node:18-alpine AS builder
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force && npm prune --omit=dev

# Stage 2: Runtime
FROM node:18-alpine       # 170MB (80% smaller base)
RUN apk add --no-cache dumb-init
RUN adduser -S -u 1001 nodejs
COPY --from=builder /app/node_modules ./node_modules
COPY server.js ./
USER nodejs              # Security ✓
EXPOSE 3000
HEALTHCHECK --interval=30s CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode===200?0:1))"
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

**Result:** ~186MB image (-85%), better caching, more secure

---

## Summary Table

| Technique | Benefit | Effort | Impact |
|-----------|---------|--------|--------|
| Multi-stage builds | Remove build tools | Medium | 10-30% |
| Alpine images | Smaller base | Low | 30-80% |
| Production deps only | Less bloat | Low | 30-50% |
| Cleanup commands | Remove caches | Low | 5-20% |
| .dockerignore | Faster builds | Low | Indirect |
| Non-root user | Security | Low | Security ✓ |
| Health checks | Reliability | Low | Reliability ✓ |
| dumb-init | Signal handling | Low | Reliability ✓ |

---

## Recommended Reading

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Building Efficient Docker Images](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Build Documentation](https://docs.docker.com/build/building/multi-stage/)
- [Alpine Linux Advantages](https://alpinelinux.org/)
