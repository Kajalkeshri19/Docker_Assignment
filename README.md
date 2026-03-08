# Week 4 — Docker Compose Multi-Container App with CI/CD Pipeline

A complete multi-container environment demonstrating modern CI/CD practices with GitHub Actions, automated security scanning, and comprehensive testing.

## Overview

This project includes:
- **PostgreSQL** database with initialized schema
- **Redis** cache layer
- **Node.js API** server
- **Nginx** web server (static frontend)
- **Playwright** end-to-end testing
- **GitHub Actions** CI/CD pipeline with Trivy & Hadolint

## Quick Start

### Prerequisites

- Docker & Docker Compose (v1.29+)
- Git
- Node.js 18+ (for local development)

### Development Setup

1. Copy `.env.example` to `.env` and adjust values.
2. Build and start: `docker-compose up --build -d`
3. Verify: `docker-compose ps` and `docker-compose logs -f`
4. Run tests: `docker-compose run --rm tests npm test`
5. Stop: `docker-compose down`

## Project Structure

```
week4/
├── .github/
│   └── workflows/
│       ├── ci-cd.yml              # Main CI/CD pipeline
│       └── pr-check.yml           # Pull request checks
├── api/                           # Node.js API service
├── web/                           # Nginx web server
├── tests/                         # Playwright tests
├── docker-compose.yml             # Production setup
├── docker-compose.staging.yml     # CI/CD staging
├── README.md                      # This file
├── GITHUB_ACTIONS_GUIDE.md        # CI/CD setup guide
├── PIPELINE_DIAGRAM.md            # Pipeline diagrams
└── METRICS.md                     # Performance data
```

## CI/CD Pipeline

### Features

- **5 Pipeline Stages:** Build, Test, Security, Publish, Notify
- **Automated Testing:** Playwright tests run in CI
- **Security Scanning:** Trivy vulnerability scanning + Hadolint linting
- **Multi-Registry:** Docker Hub publishing
- **Build Caching:** 70% cache hit rate
- **Duration:** < 10 minutes target (8 min average)

### Workflows

1. **ci-cd.yml** - Main pipeline (push, PR, manual trigger)
2. **pr-check.yml** - Pull request validation

See [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md) for setup instructions.

## Services

### API (Port 3000)
Node.js Express server with PostgreSQL & Redis integration

### Web (Port 8080)
Nginx static file server with API reverse proxy

### Database (Port 5432)
PostgreSQL 15 with auto-initialization via `init.sql`

### Redis (Port 6379)
Redis 7 cache layer (in-memory)

### Tests
Playwright end-to-end testing framework

## Security

-  Zero critical/high vulnerabilities
-  Alpine Linux base images
-  Health checks on all services
-  Network segmentation
-  Secrets management via environment variables
-  Docker image scanning (Trivy + SBOM)

## Performance

| Metric | Value |
|--------|-------|
| Build Time | 3 min |
| Test Time | 2 min |
| Pipeline Total | 8 min |
| Cache Hit Rate | 70% |
| Test Pass Rate | 100% |

See [METRICS.md](METRICS.md) for detailed analysis.

## Troubleshooting

```bash
# View logs
docker-compose logs -f <service>

# Rebuilt images
docker-compose down -v
docker-compose build --no-cache

# Check service health
docker-compose ps
docker-compose exec <service> curl http://localhost/health
```

## Documentation

- [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md) - Complete CI/CD setup
- [PIPELINE_DIAGRAM.md](PIPELINE_DIAGRAM.md) - Architecture diagrams
- [METRICS.md](METRICS.md) - Performance metrics
- [PROCESS.md](PROCESS.md) - Development process
- [SERVICE_DIAGRAM.md](SERVICE_DIAGRAM.md) - Service architecture

## Deployment

Images publish automatically to Docker Hub on `main` branch:

```bash
docker pull docker.io/<username>/api:latest
docker pull docker.io/<username>/web:latest
docker pull docker.io/<username>/tests:latest
```

## Contributing

1. Create feature branch
2. Push changes
3. GitHub Actions runs PR checks
4. After review, merge to main
5. Pipeline auto-publishes

---

**Version:** 1.0.0 | **Status:** Production Ready ✅ | **Last Updated:** March 7, 2024
