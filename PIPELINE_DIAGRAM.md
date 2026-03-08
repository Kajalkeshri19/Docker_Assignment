# CI/CD Pipeline Architecture Diagram

## Pipeline Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Events                               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │   Push to    │  │ Pull Request │  │ Manual Trigger     │    │
│  │ main/develop │  │ to main/dev  │  │ (workflow_dispatch)│    │
│  └──────────────┘  └──────────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │    Stage 1: Build & Test            │
        │  (Runs in parallel for 3 services) │
        └─────────────────────────────────────┘
                  ▲         ▲         ▲
                  │         │         │
         ┌────────┴──┐   ┌──┴──┐   ┌─┴────────┐
         │    API    │   │ WEB  │   │  TESTS   │
         └────────┬──┘   └──┬──┘   └─┬────────┘
                  │         │         │
                  ▼         ▼         ▼
           ┌─────────────────────────┐
           │  1. Docker Build        │
           │  2. Hadolint Linting    │
           │  3. Trivy Scan (images) │
           │  4. Save as artifact    │
           └────────┬────────────────┘
                    │
                    ▼
        ┌─────────────────────────────────────┐
        │   Stage 2: Run Tests                │
        │   (Needs build-and-test)            │
        └─────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
    ┌──────────┐          ┌──────────┐
    │ Load     │          │ Start    │
    │ Docker   │ ──────▶  │ Compose  │
    │ images   │          │ Stack    │
    └──────────┘          └──────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    ▼                    ▼
        ┌────────────────────┐  ┌─────────────────┐
        │ Wait for services  │  │ Run Playwright  │
        │ to be healthy      │  │ Test Suite      │
        └────────────────────┘  └─────────────────┘
                    │                    │
                    └────────┬───────────┘
                             │
                             ▼
        ┌─────────────────────────────────────┐
        │   Stage 3: Security & Quality       │
        │   (Parallel with tests)             │
        └─────────────────────────────────────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
         ▼          ▼          ▼
    ┌─────────┐ ┌──────────┐ ┌────────┐
    │ Trivy   │ │ Generate │ │ Upload │
    │ Full    │ │ SBOMs    │ │ Reports│
    │ Scan    │ │ (CycloneDX)
    └─────────┘ └──────────┘ └────────┘
         │          │          │
         └──────────┼──────────┘
                    │
                    ▼
        ┌─────────────────────────────────────┐
        │  Decision Point:                    │
        │  - Push to main? ──────────────┐   │
        │  - Manual deploy?              │   │
        │  - PR? (skip publish)          │   │
        └──────────────┬──────────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────────┐
        │   Stage 4: Publish to Registry      │
        │   (Only on main + manual trigger)   │
        └─────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       ┌──────┐    ┌──────┐    ┌──────┐
       │ API  │    │ WEB  │    │TESTS │
       └──┬───┘    └──┬───┘    └──┬───┘
          │           │           │
          ▼           ▼           ▼
   ┌────────────────────────────────────┐
   │ Docker Hub / Container Registry    │
   │ docker.io/username/service:tag     │
   └────────────────────────────────────┘
          │           │           │
          └───────────┼───────────┘
                      │
                      ▼
        ┌─────────────────────────────────────┐
        │   Stage 5: Notify Results           │
        │   Generate workflow summary         │
        └─────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
    ┌─────────────┐         ┌──────────────┐
    │✅ Success   │         │❌ Failure    │
    │Profile      │         │Profile       │
    └─────────────┘         └──────────────┘
```

## Job Dependency Graph

```
                    ┌─────────────────────┐
                    │ build-and-test      │
                    │ (Matrix: api,web,   │
                    │  tests)             │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
         ┌─────────────┐ ┌─────────────┐ ┌────────────┐
         │ run-tests   │ │security-    │ │            │
         │ (1-2 min)   │ │quality      │ │            │
         │             │ │(1-2 min)    │ │            │
         └──────┬──────┘ └──────┬──────┘ │            │
                │               │        │            │
                └───────┬───────┘        │            │
                        │               │            │
                        ▼               ▼            │
                    ┌────────────────────┐           │
                    │ publish            │──if main  │
                    │ (2-3 min)          │───────────┘
                    └────────┬───────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │ notify             │
                    │ (always)           │
                    └────────────────────┘

Parallel Execution Summary:
- build-and-test: ~3 min (3 services in parallel)
- run-tests & security-quality: ~2 min (parallel)
- publish (conditional): ~3 min
- notify: ~1 min
- TOTAL: ~7-9 minutes (under 10 min target)
```

## Pull Request Workflow

```
┌──────────────────────────┐
│ Create Pull Request      │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│          PR Check Workflow Triggered                │
└─────────────┬──────────────────────────────────────┘
              │
    ┌─────────┼─────────┬──────────┬──────────────┐
    │         │         │          │              │
    ▼         ▼         ▼          ▼              ▼
┌────────┐┌───────┐┌────────┐┌──────────┐┌────────────┐
│Lint &  ││Code   ││Hadolint││Security  ││Dependency  │
│Format  ││Quality││Linting ││Scanning  ││Analysis    │
└─┬──────┘└───┬───┘└────┬───┘└───┬──────┘└──────┬─────┘
  │           │         │        │              │
  └───────────┼─────────┼────────┼──────────────┘
              │         │        │
              ▼         ▼        ▼
          ┌──────────────────────────┐
          │ PR Summary Comment       │
          │ Pre-merge Checklist      │
          └──────────────┬───────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
        ┌──────────┐         ┌──────────┐
        │✅ Approved│        │❌ Request │
        │   Merge  │        │  Changes  │
        └──────────┘        └──────────┘
```

## Artifact Flow

```
┌────────────────────────────────────────┐
│        Build Artifacts                 │
├────────────────────────────────────────┤
│ ├── docker-images/                     │
│ │   ├── api-image.tar                  │
│ │   ├── web-image.tar                  │
│ │   └── tests-image.tar                │
│ ├── sbom-results/                      │
│ │   ├── sbom-api.json                  │
│ │   ├── sbom-web.json                  │
│ │   └── sbom-tests.json                │
│ ├── test-logs/                         │
│ │   └── test-logs.txt                  │
│ └── Trivy Reports (SARIF)              │
│     ├── trivy-api-results.sarif        │
│     ├── trivy-web-results.sarif        │
│     └── trivy-tests-results.sarif      │
└────────────────────────────────────────┘
            │
            ├─────────────────────┬──────────────────────┐
            │                     │                      │
            ▼                     ▼                      ▼
    ┌─────────────────┐   ┌─────────────────┐  ┌────────────────┐
    │ GitHub Security │   │ Artifact Store  │  │ Docker Hub     │
    │ Tab (SARIF)     │   │ (90 day retention)  │ Registry       │
    └─────────────────┘   └─────────────────┘  └────────────────┘
```

## Environment Lifecycle

```
      Development Branch
           │
           ├─────────────────────┐
           │                     │
           ▼                     ▼
    Staging (CI/CD)         Feature Branch
           │                     │
    (docker-compose.staging.yml) ▼
           │              PR Check Workflow
           │              (Hadolint, Trivy)
           ▼                     │
    Test Execution               │
    Database Seeding             │
    Service Validation           │
           │                     │
           └─────────────────────┘
                     │
                     ▼
              Approved & Merged
                     │
                     ▼
           Production (main branch)
                     │
                ┌────┴────┐
                │          │
                ▼          ▼
            Build      Security
            Images     Scan
                │          │
                └────┬────┘
                     │
                     ▼
            Docker Hub Publish
                     │
                     ▼
        Available for Deployment
```

## Security Scanning Pipeline

```
┌─────────────────────────────────────┐
│  Security & Quality Stage           │
└────────────┬────────────────────────┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
┌─────────────────────────────────────┐
│  Load Docker Images from Artifacts  │
└────────┬───────────────┬───────────┘
         │               │
         ▼               ▼
┌──────────────────┐ ┌──────────────────┐
│ Trivy Full Scan  │ │ Generate SBOMs   │
│ (JSON + Table)   │ │ (CycloneDX Fmt)  │
└────────┬─────────┘ └────────┬─────────┘
         │                    │
         └────────┬───────────┘
                  │
                  ▼
        ┌──────────────────────┐
        │ Upload to Artifacts  │
        │ - SARIF format       │
        │ - JSON format        │
        │ - Human readable     │
        └──────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────────────┐ ┌──────────────────┐
│ GitHub Security Tab  │ │ Artifact Storage │
│ Shows in PR Review   │ │ For Audit Trail  │
└──────────────────────┘ └──────────────────┘
```

## Deployment Decision Tree

```
                   Push Event
                      │
         ┌────────────┴────────────┐
         │                         │
    Is Push to main?           Is PR?
    ┌─────┴─────┐              │
    │           │              ▼
   YES         NO         ┌─────────────┐
    │           │         │Run PR Check │
    │           ▼         │Workflow     │
    │      Develop        └─────────────┘
    │      Branch         (No publish)
    │      Pipeline
    │         │
    ▼         ▼
┌────────────────────────────┐
│ Run all stages             │
│ (Build, Test, Security)    │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Check all passed?          │
└────┬───────────────────┬──┘
     │                   │
    YES                  NO
     │                   │
     ▼                   ▼
┌──────────────┐     ┌──────────────┐
│ Proceed to   │     │ Abort        │
│ Publish      │     │ Pipeline     │
│ Stage        │     │ Show Error   │
└──────┬───────┘     └──────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Push to Docker Hub           │
│ Tag: latest, branch-sha, ver │
└──────────────────────────────┘
```

## Metrics & Monitoring

```
┌──────────────────────────────────────┐
│     CI/CD Pipeline Metrics           │
├──────────────────────────────────────┤
│                                      │
│  Runtime Breakdown:                  │
│  ├─ Build & Test: 3 min (30%)       │
│  ├─ Run Tests: 2 min (20%)          │
│  ├─ Security & Quality: 2 min (20%) │
│  ├─ Publish: 2 min (20%)            │
│  └─ Notify: 1 min (10%)             │
│                                      │
│  Success Metrics:                    │
│  ├─ Build Success Rate: >95%         │
│  ├─ Test Pass Rate: 100%             │
│  ├─ Security Issues: 0 High/Critical │
│  ├─ Linting Issues: 0 Errors         │
│  └─ Publish Success: 100%            │
│                                      │
│  Resource Usage:                     │
│  ├─ Concurrent Jobs: 3              │
│  ├─ Avg Memory: 2GB per job         │
│  ├─ Artifacts: <500MB per run       │
│  └─ Cache Hit Rate: ~70%             │
│                                      │
└──────────────────────────────────────┘
```
