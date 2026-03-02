# Service Architecture Diagram

This document describes the architecture of the multi-container application
created using Docker Compose.

The environment contains five services:

1. PostgreSQL Database
2. Redis Cache
3. Node.js API Backend
4. React / Nginx Frontend
5. Playwright Test Runner

```mermaid
flowchart LR
  subgraph network[app-network]
    db[(Postgres 5432)]
    redis[(Redis 6379)]
    api[API:3000]
    web[Web(Nginx):80 -> 8080]
    tests[Playwright Tests]
  end

  web -->|proxy /api-proxy| api
  api --> db
  api --> redis
  tests --> api
```

| Service | Image              | Ports | Volumes            | Depends On | Purpose                        |
| ------- | ------------------ |-------| ------------------ | ---------- | ------------------------------ |
| web     | nginx:alpine       | 80    | nginx.conf, static | api        | Reverse proxy & static files   |
| api     | Custom Node.js     | 3000  | ./api code         | db, redis  | Business logic & API endpoints |
| db      | postgres:16-alpine | 5432  | postgres_data      | -          | Relational database            |
| redis   | redis:7-alpine     | 6379  | redis_data         | -          | Cache & sessions               |
| tests   | Custom Playwright  | -     | ./tests code       | api, web   | E2E testing                    |


Architecture:
- All services join a single custom bridge network `app-network` for service name DNS.
- Named volumes persist Postgres and Redis data.
