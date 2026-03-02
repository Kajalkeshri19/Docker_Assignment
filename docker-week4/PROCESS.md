# Process: build, run, inspect, test, and teardown

This document lists the exact commands used to build the full stack, run it, inspect logs and health, run tests, tear down, and how to build/run a single service image outside of Compose.

Prerequisites
- Docker Engine / Docker Desktop installed and running.
- From the project root: `/docker-week4`.
- Copy `.env.example` to `.env` and edit any values you need.

Full stack (Compose)

1. Build and start the entire stack (detached):

```powershell
docker compose up --build -d
```

2. Check service status and health:

```powershell
docker compose ps
```

3. Follow logs for all services or a single service:

```powershell
docker compose logs --tail=200
docker compose logs --tail=200 api
```

4. Inspect a container's health structure:

```powershell
docker inspect --format='{{json .State.Health}}' <container_name_or_id>
```

5. Run tests (Playwright) on demand:

```powershell
docker compose run --rm --entrypoint /bin/sh tests -c "npm test"
```

6. Stop and remove stack (preserve images/volumes):

```powershell
docker compose down
```

7. Stop and remove everything (images built by compose, volumes, network):

```powershell
docker compose down --rmi all -v --remove-orphans
```

Build / run a single service image

Option A — Use Compose to build or run a single service image

```powershell
# Build only the api image
docker compose build api

# Start only the api service (will still honour depends_on and network)
docker compose up -d api
```

Option B — Build the image directly with `docker build` and run it manually

```powershell
# Build the api image from the `api` folder
docker build -t week4-api ./api

# Create or reuse a network so the container can talk to other services
docker network create week4_app-network || true

# Run the container (use --env-file .env to pass env vars)
docker run --name week4_api_single --network week4_app-network --env-file .env -p 3000:3000 week4-api
```

Notes when running single image manually
- If you run Postgres/Redis via Compose, ensure the network name matches or connect via host IPs/ports.
- If running the API alone, point `PGHOST` and `REDIS_HOST` to reachable hosts (e.g., `host.docker.internal` on Docker Desktop or service container names on the same network).

Useful diagnostic commands

```powershell
docker ps -a
docker logs <container>
docker compose logs <service>
docker compose top
docker inspect <container>
```

Quick checklist for reproducible runs
- Ensure `.env` exists with `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and `API_PORT`.
- Rebuild images after changes with `docker compose build <service>` or `docker compose up --build`.
- Use `docker compose run --rm tests npm test` (or the entrypoint override shown above) to run tests against the running stack.
