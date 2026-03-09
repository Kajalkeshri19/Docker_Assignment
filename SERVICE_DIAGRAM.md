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

Architecture:
- All services join a single custom bridge network `app-network` for service name DNS.
- Named volumes persist Postgres and Redis data.
